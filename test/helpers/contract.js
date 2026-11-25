// The theme's contract as ROADMAP-themes.md states it (§S2, §S4, §S10–§S13), in one place for the tests.

export const VIEWS = [
    'layouts/layout.pug',
    'partials/head.pug',
    'partials/tokens.pug',
    'partials/helpers.pug',
    'partials/header.pug',
    'partials/lang-switch.pug',
    'partials/footer.pug',
    'partials/scripts.pug',
    // extra partials, contract too (README): as theme-blog, plus the home
    // blocks of §S11.5 and Ansitz's highlight strip
    'partials/page-header.pug',
    'partials/post-card.pug',
    'partials/home-highlight.pug',
    'partials/home-series.pug',
    'partials/home-about.pug',
]

// §S2.4, §S4.2 and §S11.5: Ansitz adds the `hero-media` seam.
export const SEAMS = [
    'partials/head-extra.pug',
    'partials/nav-main.pug',
    'partials/footer-extra.pug',
    'partials/scripts-extra.pug',
    'partials/post-media.pug',
    'partials/card-media.pug',
    'partials/post-tags.pug',
    'partials/post-pagination.pug',
    'partials/tag-overview.pug',
    'partials/tag-cloud.pug',
    'partials/feed-link.pug',
    'partials/hero-media.pug',
]

export const WITHDRAWN_SEAMS = ['partials/thumb-media.pug']

export const PAGE_TYPES = ['default', 'home', 'post', 'archive', 'tag']

export const BLOCKS = ['head', 'header', 'main', 'footer', 'scripts']

export const HELPERS = ['pageLang', 'sameLang', 'homeHref', 'formatDate', 'isoDate', 'hrefFor']

export const TOKENS = {
    color: ['bg', 'surface', 'text', 'muted', 'accent', 'accent_text', 'border', 'focus'],
    font: ['body', 'heading', 'mono'],
    size: ['base', 'measure', 'width', 'radius', 'space'],
}

// §S13 defaults for Ansitz (no added colour token).
export const TOKEN_DEFAULTS = {
    color: {
        bg: '#0f0f0e',
        surface: '#191917',
        text: '#efede6',
        muted: '#a8a59b',
        accent: '#e8b04a',
        accent_text: '#0f0f0e',
        border: '#2e2d29',
        focus: '#e8b04a',
    },
    size: { base: '1.0625rem', measure: '40rem', width: '78rem', radius: '0', space: '1.5rem' },
}

export const THEME_KEYS = ['label', 'tokens', 'extra_css', 'footer_links', 'blog', 'author']

export const T_KEYS = [
    // shared (§S2.6)
    'Skip to content',
    'Main navigation',
    'Language',
    'Legal',
    // theme-blog (§S4.3)
    'Recent posts',
    'All posts',
    'Published',
    'Updated',
    // §S11.6 (Ansitz renders no `Latest post`: its newest post is the hero)
    'Series',
    'Part',
    'About the author',
    'Read more',
    'posts',
]

export const SHELL_CLASSES = [
    'skip-link',
    'site-header',
    'site-header__inner',
    'site-header__brand',
    'site-header__nav',
    'lang-switch',
    'lang-switch__list',
    'lang-switch__item',
    'lang-switch__link',
    'site-main',
    'page__header',
    'page__title',
    'page__lead',
    'page__body',
    'site-footer',
    'site-footer__inner',
    'site-footer__legal',
    'site-footer__copy',
]

// §S4.6, as theme-blog.
export const BLOG_CLASSES = [
    'post',
    'post__header',
    'post__title',
    'post__meta',
    'post__date',
    'post__updated',
    'post__author',
    'post__lead',
    'post__media',
    'post__image',
    'post__body',
    'post__footer',
    'post__tags',
    'post__pagination',
    'post-list',
    'post-list__title',
    'post-list__items',
    'post-list__item',
    'post-list__more',
    'post-card',
    'post-card__media',
    'post-card__image',
    'post-card__title',
    'post-card__link',
    'post-card__date',
    'post-card__excerpt',
    'post-archive__year',
    'post-archive__list',
    'post-archive__item',
    'tag-page',
]

// §S12: the classes new in all three themes, and Ansitz's own.
export const ANSITZ_CLASSES = [
    'home-hero',
    'home-hero__inner',
    'home-hero__title',
    'home-hero__lead',
    'home-hero__actions',
    'home-hero__aside',
    'button',
    'button--primary',
    'post-card--featured',
    'post-card__body',
    'post-card__meta',
    'post__series',
    'post-author',
    'post-author__mark',
    'post-author__name',
    'post-facts',
    'post-facts__item',
    'post-facts__label',
    'post-facts__value',
    'post-series',
    'post-series__title',
    'post-series__list',
    'post-series__item',
    'post-series__item--current',
    'home-series',
    'home-about',
    'home-about__mark',
    'home-about__links',
    'post-archive__count',
    // Ansitz (§S12 "Per theme")
    'post-card__location',
    'post__location',
    'post__image-note',
    'home-hero__image',
    'home-statement',
    'home-highlight',
]

// Withdrawn by the revision of 2026-11-23 (§S12): must not appear in views/
// or theme.css. Stack's covers are Stack's alone.
export const WITHDRAWN_CLASSES = ['callout', 'duo', 'bw', 'post-nav', 'post-card__reading-time', 'post__reading-time', 'post-thumb__image', 'post-facts__note', 'post-route', 'post-card__cover']

export const PUBLIC_CLASSES = [...SHELL_CLASSES, ...BLOG_CLASSES, ...ANSITZ_CLASSES]

// The plugins Ansitz styles, with the peer floors (§S11.1).
export const PLUGIN_CLASSES = {
    '@nera-static/plugin-tags': {
        range: '^3.4.1',
        classes: [
            'tag-cloud',
            'tag-cloud__item',
            'tag-links',
            'tag-links__item',
            'tag-overview',
            'tag-overview__header',
            'tag-overview__title',
            'tag-overview__image',
            'tag-overview__content',
            'tag-overview__item',
            'tag-overview__item-title',
            'tag-overview__item-date',
            'tag-overview__item-description',
            'tag-overview__item-link',
        ],
    },
    '@nera-static/plugin-page-pagination': {
        range: '^2.4.0',
        classes: [
            'page-pagination',
            'page-pagination__link',
            'page-pagination__link--previous',
            'page-pagination__link--next',
        ],
    },
    '@nera-static/plugin-images': {
        range: '^1.0.3',
        classes: ['nera-image', 'nera-image__caption'],
    },
    '@nera-static/plugin-navigation': {
        range: '^3.1.0',
        classes: ['nav', 'nav--list', 'nav__item', 'nav__link', 'nav__link--active', 'nav__link--active-path'],
    },
    // search.pug renders the input and the list, search.js the result items
    '@nera-static/plugin-search': {
        range: '^2.3.1',
        classes: [
            'search',
            'search__input',
            'search__results',
            'search__item',
            'search__link',
            'search__description',
            'search__highlight',
        ],
    },
    '@nera-static/plugin-social-media-links': {
        range: '^2.3.0',
        classes: [
            'social-media-links',
            'social-media-links__list',
            'social-media-links__item',
            'social-media-links__link',
            'social-media-links__icon',
            'social-media-links__label',
        ],
    },
}

// The other themes' heading fonts, for "Distinct" (§S15).
export const OTHER_HEADING_FONTS = {
    blog: 'system-ui, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif',
    stack: 'Bricolage Grotesque',
    umwege: 'Fraunces',
}
