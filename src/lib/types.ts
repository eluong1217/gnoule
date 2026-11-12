export type EducationEntry = {
	school: string;
	degree: string;
	dates: string;
	logo: string;
	bullets?: string[];
};

export type ExperienceEntry = {
	title: string;
	location: string;
	company: string;
	dates: string;
	logo: string;
	bullets?: string[];
};

/** One row in an Education/Experience accordion list. */
export type AccordionItem = {
	logo: string;
	logoAlt: string;
	heading: string;
	subheading?: string;
	/** Plain tagline; ignored when both `company` and `location` are set. */
	tagline?: string;
	company?: string;
	location?: string;
	dates: string;
	bullets?: string[];
};

export type ShowcaseLinkType = 'demo' | 'github' | 'article';

/** A project or research card. */
export type ShowcaseItem = {
	id: string;
	title: string;
	summary: string;
	tags: string[];
	description?: string;
	media?: { type: 'image' | 'video'; src: string; alt?: string };
	links?: { type: ShowcaseLinkType; url: string }[];
};
