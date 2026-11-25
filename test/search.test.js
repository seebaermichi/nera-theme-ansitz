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
    { file: 'search.html', lang: 'en', index: 'search-index.json', twin: '/de/suche.html', title: 'Search', label: 'Search' },
    { file: path.join('de', 'suche.html'), lang: 'de', index: 'search-index.de.json', twin: '/search.html', title: 'Suche', label: 'Suche' },
]

describe('The fixture\'s search page', () => {
    for (const { file, lang, index: indexFile, twin, title, label } of LANGS) {
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

        it(`${lang}: has an index of its own language only, with the posts in it`, () => {
            const entries = index(builds.default, indexFile)
            expect(entries.length).toBeGreaterThan(10)
            for (const entry of entries) {
                expect(entry.lang, entry.href).toBe(lang)
                expect(entry.href.startsWith('/de/'), entry.href).toBe(lang === 'de')
            }
            expect(entries.filter((entry) => /\/posts\//.test(entry.href)).length).toBeGreaterThanOrEqual(6)
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
