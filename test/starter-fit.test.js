// §S15 "Starter fit", with the page contents of §S11.7 (Ansitz): the home
// shows the newest post with a picture as the hero and the next
// `blog.home_posts` posts as cards, the first as post-card--featured; the
// archive groups by year with a count; a tag page has one <h1>; a post shows
// its tags, its series with the current part marked, its facts and the
// prev/next of plugin-page-pagination; a post without a picture renders no
// empty media element.
import fs from 'fs'
import path from 'path'
import { describe, expect, inject, it } from 'vitest'
import { ROOT } from './helpers/site.js'
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

describe('Starter fit: post', () => {
    const html = page(pub, 'posts/bear-blizzard.html')

    it('shows the author line with published and updated, the title, and location and image_note on the right', () => {
        const header = elementByClass(html, 'header', 'post__header')
        expect(header).toMatch(/<span class="post-author__mark" aria-hidden="true">IO<\/span><span class="post__author post-author__name">Ines Okafor<\/span>/)
        expect(header).toMatch(/Published <time class="post__date" datetime="2026-11-14">November 14, 2026<\/time>/)
        expect(header).toMatch(/Updated <time class="post__updated" datetime="2026-11-16">November 16, 2026<\/time>/)
        expect(header).toMatch(/<h1 class="post__title">The bear who slept through the blizzard<\/h1>/)
        expect(header).toMatch(/<p class="post__location">Kuhmo, Finland<\/p>\s*<p class="post__image-note">600 mm, f\/4, 1\/1000 s, ISO 800<\/p>/)
        expect(header).not.toContain('post__series')
    })

    it('renders the picture through post-media, eagerly, right after the header', () => {
        expect(html).toMatch(/<\/header>\s*<div class="post__media">\s*<picture>[\s\S]*?<img class="post__image" [^>]*alt="A brown bear lying in the snow[^"]*"[^>]*loading="eager"/)
    })

    it('renders no media element for a post without a picture', () => {
        const plain = page(pub, 'posts/winter-hide-checklist.html')
        expect(plain).not.toContain('post__media')
        expect(plain).not.toMatch(/<picture|<img/)
        for (const { file, html: built } of pages(pub).filter(({ file }) => /posts\//.test(file) && !/winter-hide-checklist/.test(file))) {
            expect(built, file).toContain('<div class="post__media">')
        }
    })

    it('shows its facts as a row of figures after the text', () => {
        const facts = elementByClass(html, 'dl', 'post-facts')
        expect(tags(facts, 'dt').length).toBe(4)
        expect(stripTags(facts)).toBe('Time in the hide 61 h Coldest hour −19 °C Frames taken 2,300 Frames kept 4')
        expect(html.indexOf('class="post-facts"')).toBeGreaterThan(html.indexOf('class="post__body"'))
    })

    it('lays out the body figure and the paired pictures of plugin-images', () => {
        const body = elementByClass(html, 'div', 'post__body')
        expect(body).toMatch(/<figure class="nera-image">[\s\S]*<figcaption class="nera-image__caption">The view on the second morning\./)
        expect(body).toMatch(/<p>\s*<picture>[\s\S]*?<\/picture>\s*<picture>[\s\S]*?<\/picture>\s*<\/p>/)
        expect(body).toMatch(/<blockquote>\s*<p>He put his head on his paws/)
    })

    it('shows its tags through the post-tags seam', () => {
        const postTags = elementByClass(html, 'div', 'post__tags')
        expect(postTags).toMatch(/<section class="tag-links">/)
        expect(tags(postTags, 'a').map((a) => attr(a, 'href'))).toEqual(['/tags/bears.html', '/tags/finland.html', '/tags/winter.html', '/tags/hides.html'])
    })

    it('shows the series line and lists the parts of its series, the current one marked', () => {
        const part = page(pub, 'posts/lake-without-wind.html')
        expect(elementByClass(part, 'header', 'post__header')).toContain('<p class="post__series">Series: North, without colour · Part 2</p>')
        const series = elementByClass(part, 'nav', 'post-series')
        expect(part).toMatch(/<nav class="post-series" aria-label="Series">/)
        expect(series).toContain('<h2 class="post-series__title">North, without colour</h2>')
        const items = series.split('<li ').slice(1)
        expect(items.length).toBe(4)
        expect(items[0]).toMatch(/^class="post-series__item"><span>01<\/span><a href="\/posts\/kirkjufell-rain\.html">/)
        expect(items[1]).toMatch(/^class="post-series__item post-series__item--current"><span>02<\/span><a href="\/posts\/lake-without-wind\.html" aria-current="page">/)
        expect(page(pub, 'de/posts/lake-without-wind.html')).toContain('<p class="post__series">Serie: North, without colour · Teil 2</p>')
    })

    it('renders no series block or line and no facts for a post without them', () => {
        const plain = page(pub, 'posts/owl-waited-longer.html')
        expect(plain).not.toContain('post__series')
        expect(plain).not.toContain('post-series')
        expect(plain).not.toContain('post-facts')
    })

    it('shows previous / next from plugin-page-pagination, with the older post first', () => {
        const pagination = elementByClass(page(pub, 'posts/owl-waited-longer.html'), 'div', 'post__pagination')
        expect(pagination).toMatch(/<nav class="page-pagination" aria-label="Pagination">/)
        expect(pagination).toMatch(/page-pagination__link--previous" href="\/posts\/small-birds-bad-light\.html">Small birds, bad light</)
        expect(pagination).toMatch(/page-pagination__link--next" href="\/posts\/bear-blizzard\.html">The bear who slept through the blizzard</)
    })

    it('links the feed through the feed-link seam', () => {
        expect(html).toMatch(/<link rel="alternate" type="application\/atom\+xml" href="\/feed\.xml"/)
        expect(page(pub, 'de/index.html')).toMatch(/<link rel="alternate" type="application\/atom\+xml" href="\/de\/feed\.xml"/)
    })
})

describe('Starter fit: archive, tag page, default page', () => {
    for (const [lang, archive, counts, word] of [['en', 'archive.html', [7, 11, 1], 'posts'], ['de', 'de/archiv.html', [7, 11, 1], 'Geschichten']]) {
        it(`${lang}: the archive groups the posts by year, newest first, with <n> ${word}`, () => {
            const html = page(pub, archive)
            const years = sections(html, 'post-archive__year')
            expect(years.map((s) => Number(/<h2>(\d{4})/.exec(s)[1]))).toEqual([2026, 2025, 2024])
            years.forEach((section, i) => {
                const dates = datetimes(section)
                expect(dates.length).toBe(counts[i])
                for (const date of dates) expect(date.startsWith(String([2026, 2025, 2024][i]))).toBe(true)
                expect(section).toMatch(new RegExp(`<span class="post-archive__count">${counts[i]} ${word}</span>`))
            })
            expect(isDescending(datetimes(html))).toBe(true)
            expect(html).toMatch(/<section class="tag-cloud">/)
        })
    }

    it('shows each archive row with its picture, title, location and day and month', () => {
        const [year] = sections(page(pub, 'archive.html'), 'post-archive__year')
        const row = year.split('<li class="post-archive__item">')[2]
        expect(row).toMatch(/^\s*<div>\s*<picture>[\s\S]*alt="A Ural owl on a mossy stump/)
        expect(row).toMatch(/<p><a href="\/posts\/owl-waited-longer\.html">The owl that waited longer than I did<\/a><span>Bavarian Forest, Germany<\/span><\/p>/)
        expect(row).toMatch(/<time datetime="2026-10-09">Oct 9<\/time>/)
        // a post without a picture gets no empty media element
        const plain = page(pub, 'archive.html').split('<li class="post-archive__item">').find((item) => item.includes('winter-hide-checklist'))
        expect(plain).toMatch(/^\s*<p><a href/)
    })

    it('renders every generated tag page with exactly one <h1>, through pages/tag.pug', () => {
        const tagPages = pages(pub).filter(({ file }) => /^(de\/)?tags\//.test(file))
        expect(tagPages.length).toBeGreaterThanOrEqual(30)
        for (const { file, html } of tagPages) {
            expect(countTags(html, 'h1'), file).toBe(1)
            expect(html, file).toMatch(/<section class="tag-page">\s*<section class="tag-overview">/)
        }
        const birds = page(pub, 'tags/birds.html')
        expect(birds).toMatch(/<h1 class="tag-overview__title">Birds<\/h1>/)
        expect(countTags(birds, 'article')).toBe(7)
        expect(birds).toMatch(/<time class="tag-overview__item-date" datetime="2026-10-09">October 9, 2026<\/time>/)
        expect(page(pub, 'de/tags/frames.html')).toMatch(/<html lang="de">/)
    })

    it('renders a default page as header and body, nothing beside them', () => {
        const html = page(pub, 'about.html')
        const main = /<main[^>]*>([\s\S]*)<\/main>/.exec(html)[1]
        expect(main).toMatch(/^\s*<header class="page__header">\s*<h1 class="page__title">About<\/h1>\s*<p class="page__lead">Who is behind the camera/)
        expect(main.replace(/<header class="page__header">[\s\S]*?<\/header>/, '')).toMatch(/^\s*<div class="page__body">[\s\S]*<\/div>\s*$/)
        expect(main).toMatch(/<figure class="nera-image">/)
        expect(main).not.toMatch(/<aside/)
    })
})

describe('Starter fit: the phone hero (§S13, addendum of 2026-11-23)', () => {
    const css = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'theme.css'), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '')
    const phone = css.slice(css.indexOf('@media (max-width: 900px)'))
    const rule = (text, selector) => [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter(([, prelude]) => prelude.split(',').map((x) => x.trim()).includes(selector))
        .map(([, , body]) => body).join('\n')

    it('below 900px: the home hero is 740px, the post hero 700px high', () => {
        expect(rule(phone, '.home-hero')).toMatch(/min-height: 740px/)
        expect(rule(phone, '.post__media')).toMatch(/min-height: 700px/)
    })

    it('the picture fills the top 58 % at 74% 50% and fades to the background at 58 %', () => {
        expect(rule(phone, '.home-hero__image')).toMatch(/height: 58%/)
        expect(rule(phone, '.post__media > picture')).toMatch(/height: 58%/)
        expect(rule(phone, '.post__media > img')).toMatch(/height: 58%/)
        // not on the img inside the picture as well: that would be 58 % of 58 %
        expect(rule(phone, '.post__media img')).not.toMatch(/height/)
        expect(rule(phone, '.post__media picture')).not.toMatch(/height/)
        expect(rule(phone, '.home-hero__image img')).toMatch(/object-position: 74% 50%/)
        expect(rule(phone, '.post__media img')).toMatch(/object-position: 74% 50%/)
        expect(rule(phone, '.home-hero::after')).toMatch(/rgb\(var\(--shade\)\) 58%/)
        expect(rule(phone, '.post__media::after')).toMatch(/rgb\(var\(--shade\)\) 58%/)
    })
})
