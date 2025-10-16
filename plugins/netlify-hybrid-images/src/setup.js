import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { cyan } from 'kleur/colors';
import {
	createPluginLogger,
	getKirbyUrl,
	ensureDirectoryExists,
	getProjectRoot,
	handleNetlifyError,
} from '../../baukasten-utils/index.js';

const projectRoot = getProjectRoot(import.meta.url);
const { readFile, writeFile } = fs.promises;

/**
 * Recursively collect JSON files within a directory.
 * @param {string} directory
 * @returns {string[]}
 */
function collectJsonFiles(directory) {
	if (!fs.existsSync(directory)) {
		return [];
	}

	const entries = fs.readdirSync(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...collectJsonFiles(entryPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.json')) {
			files.push(entryPath);
		}
	}

	return files;
}

/**
 * Normalize a Kirby media URL into file system and public paths.
 * @param {string} url
 * @param {Object} context
 * @param {string} context.mediaPrefix
 * @param {string} context.mediaDir
 * @param {string} context.mediaOutputDir
 * @returns {null | {
 *   cacheKey: string;
 *   remoteUrl: string;
 *   downloadUrl: string;
 *   filePath: string;
 *   localPath: string;
 *   localPathWithQuery: string;
 * }}
 */
function resolveMediaPath(url, { mediaPrefix, mediaDir, mediaOutputDir }) {
	if (typeof url !== 'string' || !url.startsWith(mediaPrefix)) {
		return null;
	}

	const remainder = url.slice(mediaPrefix.length);
	const [rawPath, query = ''] = remainder.split('?');

	if (!rawPath) {
		return null;
	}

	// Decode and normalise the Kirby media path
	const decodedPath = decodeURIComponent(rawPath);
	const posixPath = path.posix.normalize(decodedPath);

	// Prevent directory traversal outside the media directory
	if (
		posixPath.startsWith('../') ||
		posixPath.includes('..\\') ||
		posixPath === '..'
	) {
		return null;
	}

	const segments = posixPath.split('/').filter(Boolean);
	if (!segments.length) {
		return null;
	}

	const filePath = path.join(mediaOutputDir, ...segments);
	const localPath = `/${[mediaDir, ...segments].join('/')}`;
	const localPathWithQuery = query ? `${localPath}?${query}` : localPath;

	return {
		cacheKey: `${mediaDir}/${segments.join('/')}`,
		remoteUrl: url,
		downloadUrl: `${mediaPrefix}${rawPath}`,
		filePath,
		localPath,
		localPathWithQuery,
	};
}

/**
 * Traverse a data structure, rewriting Kirby media URLs and collecting assets.
 * @param {unknown} value
 * @param {Object} options
 * @param {Function} transformer
 * @returns {{ value: unknown, modified: boolean }}
 */
function transformContent(value, transformer) {
	let modified = false;

	const visit = (node) => {
		if (Array.isArray(node)) {
			for (let index = 0; index < node.length; index++) {
				const result = visit(node[index]);
				if (result.modified) {
					node[index] = result.value;
					modified = true;
				}
			}
			return { value: node, modified };
		}

		if (node && typeof node === 'object') {
			for (const [key, originalValue] of Object.entries(node)) {
				const result = visit(originalValue);
				if (result.modified) {
					node[key] = result.value;
					modified = true;
				}
			}
			return { value: node, modified };
		}

		if (typeof node === 'string') {
			const transformed = transformer(node);
			if (transformed !== node) {
				modified = true;
				return { value: transformed, modified: true };
			}
		}

		return { value: node, modified: false };
	};

	visit(value);
	return { value, modified };
}

/**
 * Download a Kirby media asset to the local filesystem.
 * @param {Object} asset
 * @param {string} asset.downloadUrl
 * @param {string} asset.filePath
 * @param {ReturnType<typeof createPluginLogger>} logger
 * @returns {Promise<void>}
 */
async function downloadAsset(asset, logger) {
	try {
		ensureDirectoryExists(path.dirname(asset.filePath));
		const response = await fetch(asset.downloadUrl);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		await writeFile(asset.filePath, Buffer.from(arrayBuffer));

		logger.success(`Cached ${asset.localPath}`);
		return true;
	} catch (error) {
		logger.error(`Failed to cache ${asset.downloadUrl}`, error);
		return false;
	}
}

/**
 * Run downloads with bounded concurrency.
 * @param {Array<Object>} assets
 * @param {number} concurrency
 * @param {ReturnType<typeof createPluginLogger>} logger
 */
async function downloadWithConcurrency(assets, concurrency, logger) {
	if (!assets.length) {
		return { success: 0, failed: 0 };
	}

	const boundedConcurrency = Math.max(1, concurrency);
	let index = 0;
	let success = 0;
	let failed = 0;

	const workers = Array.from({ length: Math.min(boundedConcurrency, assets.length) }, () =>
		(async () => {
			while (index < assets.length) {
				const currentIndex = index++;
				const asset = assets[currentIndex];
				if (!asset) {
					break;
				}
				const result = await downloadAsset(asset, logger);
				if (result) {
					success++;
				} else {
					failed++;
				}
			}
		})()
	);

	await Promise.all(workers);
	return { success, failed };
}

export default async function netlifyHybridImagesSetup({
	logger: astroLogger,
	options,
}) {
	const logger = createPluginLogger({
		name: 'Hybrid Images',
		emoji: '🖼️',
		color: cyan,
		astroLogger,
	});

	if (!options.enabled) {
		logger.info('Plugin disabled via configuration');
		return;
	}

	try {
		const kirbyUrl = getKirbyUrl();

		if (!kirbyUrl) {
			logger.warn('KIRBY_URL is not defined. Skipping hybrid image caching.');
			return;
		}

		const mediaPrefix = `${kirbyUrl}/media/`;
		const publicDir = path.resolve(projectRoot, options.publicDir);
		const contentDir = path.join(publicDir, 'content');
		const mediaOutputDir = path.join(publicDir, options.mediaDir);

		ensureDirectoryExists(mediaOutputDir);

		if (!fs.existsSync(contentDir)) {
			logger.warn(
				`Content directory not found at ${contentDir}. Nothing to process.`
			);
			return;
		}

		const jsonFiles = collectJsonFiles(contentDir);

		if (!jsonFiles.length) {
			logger.warn('No Kirby JSON cache files found. Skipping hybrid image caching.');
			return;
		}

		logger.info(
			`Scanning ${jsonFiles.length} JSON file${jsonFiles.length === 1 ? '' : 's'} for Kirby media references`
		);

		const assetMap = new Map();
		const fileEntries = [];

		for (const filePath of jsonFiles) {
			try {
				const rawContent = await readFile(filePath, 'utf8');
				const data = JSON.parse(rawContent);

				transformContent(data, (value) => {
					const match = resolveMediaPath(value, {
						mediaPrefix,
						mediaDir: options.mediaDir,
						mediaOutputDir,
					});

					if (!match) {
						return value;
					}

					if (!assetMap.has(match.cacheKey)) {
						assetMap.set(match.cacheKey, match);
					}

					return value;
				});

				fileEntries.push({ filePath, data });
			} catch (error) {
				logger.warn(`Skipping unreadable JSON file: ${filePath}`);
			}
		}

		if (!assetMap.size) {
			logger.warn('No Kirby media URLs detected in content. Skipping downloads.');
			return;
		}

		logger.info(
			`Preparing to cache ${assetMap.size} media asset${assetMap.size === 1 ? '' : 's'} locally`
		);

		const downloadResult = await downloadWithConcurrency(
			Array.from(assetMap.values()),
			options.concurrency,
			logger
		);

		if (downloadResult.success > 0) {
			logger.info(
				`Cached ${downloadResult.success} media asset${
					downloadResult.success === 1 ? '' : 's'
				} to /${options.mediaDir}`
			);
		}

		if (downloadResult.failed > 0) {
			logger.warn(
				`Skipped URL rewriting because ${downloadResult.failed} asset${
					downloadResult.failed === 1 ? '' : 's'
				} failed to cache`
			);
			return;
		}

		if (options.rewriteContent) {
			let rewrittenFiles = 0;
			for (const entry of fileEntries) {
				const { data, filePath } = entry;
				const { modified } = transformContent(data, (value) => {
					const match = resolveMediaPath(value, {
						mediaPrefix,
						mediaDir: options.mediaDir,
						mediaOutputDir,
					});

					if (!match) {
						return value;
					}

					return match.localPathWithQuery;
				});

				if (modified) {
					await writeFile(
						filePath,
						`${JSON.stringify(data, null, 2)}\n`,
						'utf8'
					);
					rewrittenFiles++;
				}
			}

			logger.success(
				`Rewrote media URLs in ${rewrittenFiles} JSON file${rewrittenFiles === 1 ? '' : 's'}`
			);
		}

		logger.success('Hybrid image caching completed');
	} catch (error) {
		const shouldContinue = handleNetlifyError(logger, error, false);
		if (!shouldContinue) {
			throw error;
		}
	}
}
