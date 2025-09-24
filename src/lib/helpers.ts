import type { AstroGlobal } from 'astro';

/**
 * Checks if the current page is the home page
 * @param pageContext - The Astro global context
 * @returns boolean indicating if current page is home
 */
export function checkIsHome(pageContext: AstroGlobal): boolean {
	const path = pageContext.url.pathname;
	const currentLang = pageContext.currentLocale;

	return (
		path === '/' || path === `/${currentLang}` || path === `/${currentLang}/`
	);
}

/**
 * Determines if the current request is in preview mode
 * Preview mode is only available on the server and when the path includes /preview/
 * @returns boolean indicating if preview mode is active
 */
export function isPreviewMode(): boolean {
	const isServer = typeof window === 'undefined';
	const astroPath = process.env.ASTRO_PATH;
	return (
		isServer &&
		!!astroPath &&
		(astroPath.includes('/preview/') || astroPath === '/preview')
	);
}

/**
 * Converts a pixel value to rem units
 * @param value - The pixel value to convert
 * @returns string with rem unit
 */
export function toRem(value: number): string {
	return `${value / 16}rem`;
}

/**
 * Generates a human-readable alt text from an image name
 * @param name - The image name to convert
 * @returns Formatted alt text string
 */
export function getAltFallback(name?: string): string {
	return name
		? name
				.replace(/[-_]/g, ' ')
				.replace(/[^\w\s]/g, '')
				.replace(/\b\w/g, (char) => char.toUpperCase())
		: 'Image';
}

/**
 * Ensures a URL has a trailing slash for internal page links
 * External URLs, anchor links, and file links are returned unchanged
 * @param url - The URL to process
 * @param isInternalPage - Whether this is an internal page link (defaults to true)
 * @returns URL with trailing slash if it's an internal page link
 */
export function ensureTrailingSlash(
	url: string,
	isInternalPage: boolean = true
): string {
	// Don't modify external URLs, anchor links, or special URLs
	if (
		!isInternalPage ||
		url.startsWith('http') ||
		url.startsWith('//') ||
		url.includes('#') ||
		url.startsWith('mailto:') ||
		url.startsWith('tel:') ||
		url === '/' ||
		url === ''
	) {
		return url;
	}

	// Ensure trailing slash for internal page links
	return url.endsWith('/') ? url : `${url}/`;
}
