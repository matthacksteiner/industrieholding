import type {
	PageData,
	GlobalData,
	SectionItem,
	ContentBlock,
} from './api.types';
import type {
	LinkArray,
	ImageArray,
	SvgArray,
	ButtonSettings,
	ButtonColors,
	MetadataProps,
} from './blocks.types';

// Common Component Props
export interface BaseComponentProps {
	class?: string;
	id?: string;
}

// Layout Components
export interface LayoutProps extends BaseComponentProps {
	title?: string;
	description?: string;
	lang?: string;
}

// Navigation Components
export interface NavigationProps extends BaseComponentProps {
	items: Array<{
		label: string;
		href: string;
		active?: boolean;
		children?: Array<{
			label: string;
			href: string;
		}>;
	}>;
}

// SEO Components
export interface SeoProps {
	title?: string;
	description?: string;
	image?: string;
	canonicalURL?: string;
	type?: string;
	lang?: string;
}

// Media Components
export interface ImageProps extends BaseComponentProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	loading?: 'lazy' | 'eager';
	decoding?: 'async' | 'sync' | 'auto';
	class?: string;
}

// Interactive Components
export interface ButtonProps extends BaseComponentProps {
	variant?: 'primary' | 'secondary' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	onClick?: () => void;
}

// Page Components
export interface PageRendererProps {
	slug: string;
	lang?: string;
	data?: PageData;
	global?: GlobalData;
	page?: any;
}

// Section Components
export interface SectionImageProps extends BaseComponentProps {
	item: SectionItem;
	global: any;
	ratioMobile: string;
	ratioDesktop: string;
	span?: number;
	spanDesktop?: number;
	titleLevel?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	fontTitleToggle?: boolean;
	fontTextToggle?: boolean;
	captionAlign?: string;
	captionControls?: string[];
	captionOverlayRange?: number;
	captionColor?: string;
	titleClass?: string;
	textClass?: string;
	textContentClass?: string;
	lang?: string;
	backgroundContainer?: string;
}

// ========================================
// BLOCK COMPONENT PROPS
// ========================================

// Text Block Component
export interface BlockTextComponentProps {
	text: string;
	font?: string;
	size?: string;
	align?: string;
	color?: string;
	headlines?: any;
	metadata?: MetadataProps;
}

// Title Block Component
export interface BlockTitleComponentProps {
	title: string;
	Level?: string;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	metadata?: MetadataProps;
}

// Button Block Component
export interface BlockButtonComponentProps {
	link: LinkArray;
	global: any;
	align?: string;
	className?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	metadata?: MetadataProps;
}

// Contact Form Block Component
export interface BlockContactFormComponentProps {
	formName?: string;
	emailSubject?: string;
	successPage?: LinkArray;
	spamProtection?: 'captcha' | 'honeypot' | 'none';
	fields?: {
		firstname?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		lastname?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		email?: {
			label?: string;
			placeholder?: string;
			help?: string;
		};
		message?: {
			label?: string;
			placeholder?: string;
			rows?: number;
			help?: string;
		};
		submitButton?: {
			placeholder?: string;
		};
		successMessage?: {
			text?: string;
		};
		errorMessage?: {
			text?: string;
		};
	};
	fieldSpacing?: 'small' | 'medium' | 'large';
	formWidth?: 'full' | 'large' | 'medium' | 'small';
	formAlign?: 'left' | 'center' | 'right';
	formBorderRadius?: number;
	textGroup?: {
		textfont?: string;
		textcolor?: string;
		textsize?: string;
	};
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings | null;
	buttonColors?: ButtonColors | null;
	buttonAlign?: 'start' | 'center' | 'end';
	global: any;
	metadata?: MetadataProps;
}

// Image Block Component
export interface BlockImageComponentProps {
	global: any;
	image: ImageArray | null;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Vector Block Component
export interface BlockVectorComponentProps {
	image: SvgArray | null;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
	metadata?: MetadataProps;
}

// Video Block Component
export interface BlockVideoComponentProps {
	source?: string;
	url?: string;
	file?: {
		url: string;
		alt: string;
		identifier: string;
		classes: string;
	} | null;
	options?: any;
	ratioMobile?: string;
	ratioDesktop?: string;
	width?: string;
	height?: string;
	thumbnail?: {
		url: string;
		alt: string;
	} | null;
	toggle?: boolean;
	Level?: string;
	text?: string;
	font?: string;
	textcolor?: string;
	size?: string;
	align?: string;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Gallery Block Component
export interface BlockGalleryComponentProps {
	images: ImageArray[];
	layoutType?: string;
	lightbox?: boolean;
	viewMobile?: string;
	viewDesktop?: string;
	viewPaddingMobile?: string;
	viewPaddingDesktop?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	span?: number;
	global: any;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Slider Block Component
export interface BlockSliderComponentProps {
	images: (ImageArray & { toggle?: boolean })[];
	toggle?: boolean;
	Level?: string;
	text?: string;
	font?: string;
	textcolor?: string;
	size?: string;
	align?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	controls?: string;
	color?: string;
	time?: string;
	effect?: string;
	direction?: string;
	viewMobile?: string;
	viewDesktop?: string;
	viewPaddingMobile?: string;
	viewPaddingDesktop?: string;
	span?: number;
	global: any;
	backgroundContainer?: boolean;
	aboveFold?: boolean;
	metadata?: MetadataProps;
}

// Card Block Component
export interface BlockCardComponentProps {
	title?: string;
	text?: string;
	image?: SvgArray | null;
	hovertoggle?: boolean;
	hovertext?: string;
	linkToggle?: boolean;
	link?: LinkArray;
	aspectRatio?: string;
	justify?: string;
	level?: string;
	titleFont?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textSize?: string;
	textAlign?: string;
	widthMobile?: string;
	widthDesktop?: string;
	widthAlign?: string;
	cardBackgroundColor?: string;
	cardBackgroundColorActive?: string;
	cardTextColor?: string;
	cardTextColorActive?: string;
	cardBorderColor?: string;
	cardBorderColorActive?: string;
	cardBorderWidth?: string;
	cardBorderRadius?: string;
	cardBorderPaddingDesktop?: string;
	cardBorderPaddingMobile?: string;
	metadata?: MetadataProps;
}

// Code Block Component
export interface BlockCodeComponentProps {
	code: string;
	metadata?: MetadataProps;
}

// Line Block Component
export interface BlockLineComponentProps {
	borderStyle?: string;
	borderWidth?: string;
	borderColor?: string;
	metadata?: MetadataProps;
}

// Divider Block Component
export interface BlockDividerComponentProps {
	global: any;
	spacingMobileTop?: string;
	spacingMobileBottom?: string;
	spacingDesktopTop?: string;
	spacingDesktopBottom?: string;
	metadata?: MetadataProps;
}

// Menu Block Component
export interface BlockMenuComponentProps {
	items: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	gap?: string;
	global: any;
	metadata?: MetadataProps;
}

// Icon List Block Component
export interface BlockIconListComponentProps {
	items: Array<{
		icon?: {
			url: string;
			alt: string;
			source: string;
		} | null;
		linkObject: LinkArray;
		[key: string]: any;
	}>;
	font?: string;
	color?: string;
	size?: string;
	align?: string;
	iconSize?: string;
	iconGap?: string;
	iconListGap?: string;
	iconDirection?: string;
	metadata?: MetadataProps;
}

// Button Bar Block Component
export interface BlockButtonBarComponentProps {
	buttons: Array<{
		linkobject: LinkArray;
		[key: string]: any;
	}>;
	global: any;
	adjust?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	metadata?: MetadataProps;
}

// Navigation Block Component
export interface BlockNavigationComponentProps {
	previousToggle?: boolean;
	nextToggle?: boolean;
	previousLabel?: string;
	nextLabel?: string;
	navigationAlign?: string;
	buttonLocal?: boolean;
	buttonSettings?: ButtonSettings;
	buttonColors?: ButtonColors;
	global: any;
	data?: any;
	metadata?: MetadataProps;
}

// Accordion Block Component
export interface BlockAccordionComponentProps {
	items: Array<{
		[key: string]: any;
	}>;
	Level?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	headlines?: any;
	borderWidth?: string;
	borderColor?: string;
	metadata?: MetadataProps;
}

// Quote Slider Block Component
export interface BlockQuoteSliderComponentProps {
	items: Array<{
		[key: string]: any;
	}>;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	titleAlign?: string;
	controls?: string;
	color?: string;
	time?: string;
	metadata?: MetadataProps;
}

// Featured Block Component
export interface BlockFeaturedComponentProps {
	items: Array<{
		id: string;
		title: string;
		description: string;
		uri: string;
		url: string;
		status: string;
		position: number;
		thumbnail: ImageArray | null;
		coverOnly: boolean;
	}>;
	titleLevel?: string;
	titleFont?: string;
	titleColor?: string;
	titleSize?: string;
	titleAlign?: string;
	textFont?: string;
	textColor?: string;
	textSize?: string;
	textAlign?: string;
	spanMobile?: string;
	spanDesktop?: string;
	gapMobile?: string;
	gapDesktop?: string;
	gapHorizontalMobile?: string;
	gapHorizontalDesktop?: string;
	ratioMobile?: string;
	ratioDesktop?: string;
	fontTitleToggle?: boolean;
	fontTextToggle?: boolean;
	captionAlign?: string;
	captionControls?: string[];
	captionOverlayRange?: number;
	captionColor?: string;
	global: any;
	span?: number;
	metadata?: MetadataProps;
}

// Columns Block Component
export interface BlockColumnsComponentProps {
	columns: Array<{
		id: string;
		width: number;
		span: number;
		nested: boolean;
		blocks: ContentBlock[];
	}>;
	global: any;
	span?: number;
	metadata?: MetadataProps;
}

// Grid Block Component
export interface BlockGridComponentProps {
	grid: {
		content: {
			title?: string;
			grid: Array<{
				id: string;
				columns: Array<{
					id: string;
					width: number;
					span: number;
					nested: boolean;
					blocks: ContentBlock[];
				}>;
			}>;
		};
	};
	global: any;
	span?: number;
	metadata?: MetadataProps;
}
