/**
 * Netlify Hybrid Images Plugin
 *
 * Fetch Kirby media assets at build time and make them available
 * from the local /public directory so Netlify's on-demand image CDN
 * can process and cache responsive variants at the edge.
 */

import { createPluginConfig } from '../baukasten-utils/index.js';
import { cyan } from 'kleur/colors';
import netlifyHybridImagesSetup from './src/setup.js';

const defaultOptions = {
	// Enable or disable the plugin
	enabled: true,
	// Relative path (from project root) where static assets are published
	publicDir: 'public',
	// Folder inside publicDir where Kirby media will be stored
	mediaDir: 'media',
	// Maximum number of concurrent download operations
	concurrency: 4,
	// Whether to rewrite Kirby media URLs inside cached JSON content
	rewriteContent: true,
};

export default createPluginConfig({
	name: 'netlify-hybrid-images',
	emoji: '🖼️',
	color: cyan,
	defaultOptions,
	hooks: {
		'astro:build:start': netlifyHybridImagesSetup,
	},
});

