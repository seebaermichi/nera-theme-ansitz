# Changelog

All notable changes to `@nera-static/theme-ansitz` are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and the theme follows [semantic versioning](https://semver.org/) over its contract (see the README).

## [1.0.0] - 2026-11-24

### Added

-   The "Ansitz" blog theme for photographers, a dark gallery where the pictures lead: `views/`, `assets/css/theme.css`, `config/theme.yaml` and self-hosted webfonts, presentation only — no JavaScript, no third-party request.
-   Page types `pages/home.pug` (the newest post with a picture as the hero, the page body as the statement, the next posts as a wall of cards in alternating formats, the highlight strip as a contact sheet, the featured series, the about block), `pages/post.pug` (header on the post's picture with location and exposure data, author line, facts as a row of figures after the text, tags, series list, prev/next), `pages/archive.pug` (posts by year with a count, rows with picture, title and location), `pages/tag.pug` and `pages/default.pug` — the same page types as `@nera-static/theme-stack` and `@nera-static/theme-blog`.
-   The shell `layouts/layout.pug` with the blocks `head`, `header`, `main`, `footer` and `scripts`, and the partials `head.pug`, `tokens.pug`, `helpers.pug`, `header.pug`, `lang-switch.pug`, `footer.pug`, `scripts.pug`, `page-header.pug`, `post-card.pug`, `home-highlight.pug`, `home-series.pug` and `home-about.pug`.
-   The seams `head-extra.pug`, `feed-link.pug`, `nav-main.pug`, `footer-extra.pug`, `scripts-extra.pug`, `hero-media.pug`, `post-media.pug`, `card-media.pug`, `post-tags.pug`, `post-pagination.pug`, `tag-overview.pug` and `tag-cloud.pug`.
-   Tokens: the sixteen of the Nera themes. Keys `blog.home_posts`, `blog.featured_series`, `blog.highlight_tag`, `author.name`, `author.bio`, `author.href`. Frontmatter `image`, `image_alt`, `location`, `image_note`, `tags`, `series`, `series_part`, `facts`.
-   `t()` keys: `Skip to content`, `Main navigation`, `Language`, `Legal`, `Recent posts`, `All posts`, `Published`, `Updated`, `Series`, `Part`, `About the author`, `Read more`, `posts`.
-   Fonts: Instrument Serif (upright and italic), Instrument Sans (variable) and JetBrains Mono (variable), Latin and Latin Extended, from the `@fontsource` and `@fontsource-variable` packages 5.3.0, under the SIL Open Font License 1.1, in `assets/fonts/ansitz/` with their licence texts.
-   Links that open a new tab are marked with an arrow (`↗`, in CSS on `a[target="_blank"]`), so the change of context is visible (WCAG 3.2.5). The theme sets no `target` itself: a site opens external links in a new tab with `@nera-static/plugin-link-attributes` (links in page content) and `open_in_new_tab: true` in plugin-social-media-links (footer). Such a site turns off `nera check`'s opt-in rule `a11y-target-blank`, which reports every `target="_blank"`; the README shows the setup.
-   Optional peers, styled when present: `@nera-static/plugin-images` `^1.0.3`, `plugin-navigation` `^3.1.0`, `plugin-page-pagination` `^2.4.0`, `plugin-social-media-links` `^2.3.0`, `plugin-tags` `^3.4.1`.
