// The fixture's search page (plugin-search, ROADMAP-themes §S14 item 3): the
// site wires the plugin in through a page type of its own and the
// scripts-extra.pug seam, the theme adds no seam, key or script. en searches
// search-index.json, de search-index.de.json (group_by_lang); base_path
// reaches the script, the index URL and the result links; without the plugin
// there is no search page at all.
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { createRequire } from 'module'
import { describe, expect, inject, it } from 'vitest'
import { ROOT, SEARCH_PAGES } from './helpers/site.js'
import { attr, countTags, page, pages, tags } from './helpers/html.js'

const builds = inject('builds')
const require = createRequire(path.join(ROOT, 'package.json'))
const pluginDir = path.dirname(require.resolve('@nera-static/plugin-search'))
const index = (build, file) => JSON.parse(fs.readFileSync(path.join(build.public, file), 'utf-8'))

const LANGS = [
    { file: 'search.html', href: '/search.html', other: 'about.html', lang: 'en', index: 'search-index.json', twin: '/de/suche.html', title: 'Search', label: 'Search' },
    { file: path.join('de', 'suche.html'), href: '/de/suche.html', other: path.join('de', 'ueber-mich.html'), lang: 'de', index: 'search-index.de.json', twin: '/search.html', title: 'Suche', label: 'Suche' },
]

// theme.css without comments, split into its rules: [selector list, body,
// inside the 900px breakpoint]
const css = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'theme.css'), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
const breakpoint = css.indexOf('@media (max-width: 900px)')
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].trim().split(',').map((s) => s.trim()),
    body: m[2],
    phone: m.index > breakpoint,
}))
const rule = (selector, phone = false) => rules.find((r) => r.phone === phone && r.selectors.includes(selector))?.body || ''
const navLinks = (html, href) => tags(html, 'a').filter((a) => /nav__link/.test(a) && attr(a, 'href') === href)

describe('The fixture\'s search page', () => {
    for (const { file, href, other, lang, index: indexFile, twin, title, label } of LANGS) {
        it(`${lang}: renders the page header as its one <h1>, then the search input and an empty results list`, () => {
            const html = page(builds.default.public, file)
            expect(countTags(html, 'h1')).toBe(1)
            expect(html).toContain(`<h1 class="page__title">${title}</h1>`)
            const inputs = tags(html, 'input').filter((a) => /search__input/.test(a))
            expect(inputs.length).toBe(1)
            expect(attr(inputs[0], 'type')).toBe('search')
            expect(attr(inputs[0], 'aria-label')).toBe(label)
            expect(attr(inputs[0], 'data-search-index')).toBe(`/${indexFile}`)
            expect(attr(inputs[0], 'data-results')).toBe('[data-search__results]')
            expect(inputs[0]).toMatch(/\sdata-search-input(\s|$)/)
            expect(html).toMatch(/<ul class="search__results" data-search__results><\/ul>/)
            // the vendor template's own heading and wrapper are not used
            expect(html).not.toContain('search__title')
        })

        it(`${lang}: loads /js/search.js once, at the end of <body>`, () => {
            const html = page(builds.default.public, file)
            const scripts = tags(html, 'script')
            expect(scripts.length).toBe(1)
            expect(attr(scripts[0], 'src')).toBe('/js/search.js')
            expect(html).toMatch(/<script src="\/js\/search\.js"><\/script>\s*<\/body>/)
        })

        it(`${lang}: links its slug twin in the language switch`, () => {
            const links = tags(page(builds.default.public, file), 'a').filter((a) => /lang-switch__link/.test(a))
            expect(links.map((a) => attr(a, 'href'))).toEqual([twin])
        })

        it(`${lang}: the menu links the search page on every page, active on the search page itself`, () => {
            const own = navLinks(page(builds.default.public, file), href)
            expect(own.length).toBe(1)
            expect(attr(own[0], 'class')).toBe('nav__link nav__link--active')
            const elsewhere = navLinks(page(builds.default.public, other), href)
            expect(elsewhere.length).toBe(1)
            expect(attr(elsewhere[0], 'class')).toBe('nav__link')
        })

        it(`${lang}: has an index of its own language only, with the posts in it`, () => {
            const entries = index(builds.default, indexFile)
            expect(entries.length).toBeGreaterThan(10)
            for (const entry of entries) {
                expect(entry.lang, entry.href).toBe(lang)
                expect(entry.href.startsWith('/de/'), entry.href).toBe(lang === 'de')
            }
            expect(entries.filter((entry) => /\/posts\//.test(entry.href)).length).toBeGreaterThanOrEqual(6)
        })

        it(`${lang}: has every tag page of its language in the index (plugin-search runs last)`, () => {
            const hrefs = index(builds.default, indexFile).map((entry) => entry.href)
            const dir = lang === 'en' ? 'tags' : path.join('de', 'tags')
            const tagPages = fs.readdirSync(path.join(builds.default.public, dir)).filter((file) => file.endsWith('.html'))
            expect(tagPages.length).toBeGreaterThan(5)
            for (const file of tagPages) expect(hrefs, file).toContain(`/${dir.split(path.sep).join('/')}/${file}`)
        })
    }

    it('puts no <script> on any other page', () => {
        for (const { file, html } of pages(builds.default.public)) {
            if (!SEARCH_PAGES.includes(file)) expect(countTags(html, 'script'), file).toBe(0)
        }
    })

    it('ships plugin-search\'s search.js unchanged, and the build copies it to /js/', () => {
        const shipped = fs.readFileSync(path.join(pluginDir, 'views', 'search.js'), 'utf-8')
        expect(fs.readFileSync(path.join(ROOT, 'test', 'site', 'theme', 'assets', 'js', 'search.js'), 'utf-8')).toBe(shipped)
        expect(fs.readFileSync(path.join(builds.default.public, 'js', 'search.js'), 'utf-8')).toBe(shipped)
    })

    it('keeps the generated indexes out of git', () => {
        for (const file of ['search-index.json', 'search-index.de.json']) {
            const target = path.join('test', 'site', 'theme', 'assets', file)
            expect(execFileSync('git', ['check-ignore', target], { cwd: ROOT, encoding: 'utf-8' }).trim()).toBe(target)
        }
    })

    it('sub: prefixes the script, the index URL and every result link with /sub', () => {
        for (const { file, index: indexFile } of LANGS) {
            const html = page(builds.sub.public, file)
            expect(attr(tags(html, 'script')[0], 'src')).toBe('/sub/js/search.js')
            const input = tags(html, 'input').find((a) => /search__input/.test(a))
            expect(attr(input, 'data-search-index')).toBe(`/sub/${indexFile}`)
            for (const entry of index(builds.sub, indexFile)) expect(entry.href).toMatch(/^\/sub\//)
        }
    })

    it('noplugins: has no search page, no index and no search.js', () => {
        const pub = builds.noplugins.public
        for (const file of [...SEARCH_PAGES, 'search-index.json', 'search-index.de.json', path.join('js', 'search.js')]) {
            expect(fs.existsSync(path.join(pub, file)), file).toBe(false)
        }
    })
})

describe('theme.css styles plugin-search', () => {
    it('scopes every rule for the plugin\'s classes under .search', () => {
        const selectors = rules.flatMap((r) => r.selectors).filter((s) => /\.search(?![\w-])|\.search__/.test(s))
        expect(selectors.length).toBeGreaterThan(10)
        for (const selector of selectors) expect(selector).toMatch(/^(\.site-main > \.search|\.search \.search__[\w-]+)/)
    })

    it('styles each of the plugin\'s classes', () => {
        for (const name of ['search__input', 'search__results', 'search__item', 'search__link', 'search__description', 'search__highlight']) {
            expect(rule(`.search .${name}`), name).not.toBe('')
        }
        expect(rule('.site-main > .search')).toMatch(/width: min\(var\(--width\), 100% - 2 \* var\(--gutter\)\)/)
    })

    it('collapses an empty results list: no space, no border', () => {
        expect(rule('.search .search__results:empty')).toMatch(/display: none/)
        expect(rule('.search .search__results')).not.toMatch(/border/)
    })

    it('draws the input in token colours with a visible focus', () => {
        const input = rule('.search .search__input')
        expect(input).toMatch(/background: var\(--surface\)/)
        expect(input).toMatch(/color: var\(--text\)/)
        expect(input).toMatch(/border-bottom: 1px solid var\(--muted\)/)
        expect(input).not.toMatch(/outline/)
        expect(rule('.search .search__input:focus')).toMatch(/border-bottom-color: var\(--accent\)/)
        // the outline is the global :focus-visible one, only moved closer
        expect(rule(':focus-visible')).toMatch(/outline: 3px solid var\(--focus\)/)
        expect(rule('.search .search__input:focus-visible')).not.toMatch(/outline:/)
    })

    it('sets the description in muted and the highlight in accent (contrast pairs of §S13)', () => {
        expect(rule('.search .search__description')).toMatch(/color: var\(--muted\)/)
        expect(rule('.search .search__highlight')).toMatch(/color: var\(--accent\)/)
    })

    it('shrinks the input and the result titles below 900px', () => {
        expect(rule('.search .search__input', true)).toMatch(/font-size: 19px/)
        expect(rule('.search .search__link', true)).toMatch(/font-size: 24px/)
    })
})
