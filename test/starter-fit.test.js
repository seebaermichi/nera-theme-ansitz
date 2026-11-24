// §S15 "Starter fit", with the page contents of §S11.7 (Ansitz): the home
// shows the newest post with a picture as the hero and the next
// `blog.home_posts` posts as cards, the first as post-card--featured; the
// archive groups by year with a count; a tag page has one <h1>; a post shows
// its tags, its series with the current part marked, its facts and the
// prev/next of plugin-page-pagination; a post without a picture renders no
// empty media element.
import { describe, expect, inject, it } from 'vitest'
import { attr, countTags, elementByClass, page, pages, stripTags, tags } from './helpers/html.js'

const builds = inject('builds')
const pub = builds.default.public
const datetimes = (html) => tags(html, 'time').map((a) => attr(a, 'datetime'))
const isDescending = (list) => list.every((value, i) => i === 0 || list[i - 1] >= value)
const sections = (html, className) => html.split(`<section class="${className}">`).slice(1).map((s) => s.split('</section>')[0])

describe('Starter fit: home', () => {
    it('shows the newest post with a picture as the hero: its title as the one <h1>, description, Read more, place and exposure', () => {
        const html = page(pub, 'index.html')
        const hero = elementByClass(html, 'section', 'home-hero')
        expect(hero).toMatch(/^\s*<div class="home-hero__image">\s*<picture>[\s\S]*alt="A brown bear lying in the snow[^"]*"[^>]*loading="eager"/)
        expect(hero).toMatch(/<h1 class="home-hero__title"><a href="\/posts\/bear-blizzard\.html">The bear who slept through the blizzard<\/a><\/h1>/)
        expect(hero).toMatch(/<p class="home-hero__lead">Sixty-one hours in a plywood hide/)
        expect(hero).toMatch(/<a class="button button--primary" href="\/posts\/bear-blizzard\.html">Read more<\/a>/)
        expect(hero).toMatch(/<div class="home-hero__aside"><b>Kuhmo, Finland<\/b><span>600 mm, f\/4, 1\/1000 s, ISO 800<\/span><\/div>/)
        expect(countTags(html, 'h1')).toBe(1)
    })

    it('shows the page body as the statement', () => {
        const statement = elementByClass(page(pub, 'index.html'), 'div', 'home-statement')
        expect(statement).toMatch(/^\s*<p><em>Ansitz<\/em> is the German word for a hunter's hide\./)
        expect(countTags(statement, 'p')).toBe(2)
    })

    for (const [lang, home, dates] of [
        ['en', 'index.html', ['2026-10-09', '2026-09-12', '2026-08-21', '2026-06-03', '2026-04-17', '2026-02-06', '2025-11-20']],
        ['de', 'de/index.html', ['2026-10-09', '2026-09-12', '2026-08-21', '2026-06-03', '2026-04-17', '2026-02-06', '2025-11-20']],
    ]) {
        it(`${lang}: lists the next seven posts after the hero's, newest first, the first as post-card--featured`, () => {
            const [wall] = sections(page(pub, home), 'post-list')
            expect(datetimes(wall)).toEqual(dates)
            expect(isDescending(dates)).toBe(true)
            expect(countTags(wall, 'article')).toBe(7)
            expect(wall.match(/post-card--featured/g)).toEqual(['post-card--featured'])
            expect(wall).toMatch(/^\s*<h2 class="post-list__title">[^<]+<\/h2>[\s\S]*?<li class="post-list__item">\s*<article class="post-card post-card--featured">/)
            const hrefs = tags(wall, 'a').filter((a) => /post-card__link/.test(a)).map((a) => attr(a, 'href'))
            expect(hrefs.every((href) => href.startsWith(lang === 'de' ? '/de/posts/' : '/posts/'))).toBe(true)
            expect(hrefs.some((href) => href.endsWith('/bear-blizzard.html'))).toBe(false)
        })
    }

    it('gives each card its picture, title, location and date', () => {
        const [wall] = sections(page(pub, 'index.html'), 'post-list')
        const first = wall.split('<li class="post-list__item">')[1]
        expect(first).toMatch(/<div class="post-card__media">\s*<picture>[\s\S]*<img class="post-card__image"[^>]*alt="A Ural owl on a mossy stump/)
        expect(first).toMatch(/<h3 class="post-card__title"><a class="post-card__link" href="\/posts\/owl-waited-longer\.html">The owl that waited longer than I did<\/a><\/h3>/)
        expect(first).toMatch(/<p class="post-card__meta"><span class="post-card__location">Bavarian Forest, Germany<\/span><time class="post-card__date" datetime="2026-10-09">October 9, 2026<\/time><\/p>/)
        expect(first).not.toContain('post-card__excerpt')
    })

    it('shows a card without a picture with its description and no media element', () => {
        const [wall] = sections(page(builds.allposts.public, 'index.html'), 'post-list')
        const card = wall.split('<li class="post-list__item">').find((item) => item.includes('winter-hide-checklist'))
        expect(card).not.toContain('post-card__media')
        expect(card).toMatch(/<p class="post-card__excerpt">No pictures this time/)
    })

    it('headings are t() keys: Recent posts; the more link is All posts', () => {
        const [wall] = sections(page(pub, 'index.html'), 'post-list')
        expect(wall).toContain('<h2 class="post-list__title">Recent posts</h2>')
        expect(wall).toMatch(/<a class="post-list__more" href="\/archive\.html">All posts<\/a>/)
        expect(page(pub, 'index.html')).not.toContain('Latest post')
    })

    it('shows the highlight strip: the tag as heading, six frames of the newest posts with it', () => {
        const strip = elementByClass(page(pub, 'index.html'), 'section', 'home-highlight')
        expect(strip).toMatch(/^\s*<h2>Frames<\/h2>/)
        expect(tags(strip, 'a').map((a) => attr(a, 'href'))).toEqual([
            '/posts/frame-parakeet.html',
            '/posts/frame-warbler.html',
            '/posts/frame-ladybird-leaf.html',
            '/posts/frame-bee-thistle.html',
            '/posts/horses-do-swim.html',
            '/posts/frame-ladybird-stem.html',
        ])
        expect(countTags(strip, 'picture')).toBe(6)
        expect(strip).toContain('<span>Horses do swim</span>')
        expect(strip).not.toMatch(/\/tags\//)
    })

    it('shows the featured series: label, name, Read more to part one, the first four parts as pictures', () => {
        const series = elementByClass(page(pub, 'index.html'), 'section', 'home-series')
        expect(series).toMatch(/<p>Series<\/p>\s*<h2>North, without colour<\/h2>\s*<a class="button" href="\/posts\/kirkjufell-rain\.html">Read more<\/a>/)
        expect(tags(series, 'a').slice(1).map((a) => attr(a, 'href'))).toEqual([
            '/posts/kirkjufell-rain.html',
            '/posts/lake-without-wind.html',
            '/posts/water-falling.html',
            '/posts/mountain-in-cloud.html',
        ])
        expect(countTags(series, 'picture')).toBe(4)
    })

    it('shows the about block: initials, label, name, bio, Read more to author.href', () => {
        const about = elementByClass(page(pub, 'index.html'), 'section', 'home-about')
        expect(about).toMatch(/<span class="home-about__mark" aria-hidden="true">IO<\/span>/)
        expect(about).toMatch(/<p>About the author<\/p>\s*<h2>Ines Okafor<\/h2>\s*<p>I photograph animals/)
        expect(about).toMatch(/<a class="button" href="\/about\.html">Read more<\/a>/)
        expect(elementByClass(page(pub, 'de/index.html'), 'section', 'home-about')).toMatch(/href="\/de\/ueber-mich\.html">Weiterlesen</)
    })

    it('renders no tag cloud on the home (§S11.7: Ansitz has none there)', () => {
        expect(page(pub, 'index.html')).not.toContain('tag-cloud')
    })

    it('leaves out the strip, series and about blocks without their keys, and honours home_posts', () => {
        const html = page(builds.overrides.public, 'index.html')
        expect(html).not.toContain('home-highlight')
        expect(html).not.toContain('home-series')
        expect(html).not.toContain('home-about')
        expect(datetimes(html)).toEqual(['2026-10-09', '2026-09-12'])
    })

    it('without plugins keeps the hero and the strip readable: the frames still carry their titles', () => {
        const html = page(builds.noplugins.public, 'index.html')
        expect(elementByClass(html, 'div', 'home-hero__image').trim()).toBe('')
        expect(stripTags(elementByClass(html, 'section', 'home-highlight'))).toContain('Horses do swim')
    })
})
