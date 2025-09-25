import { BaseScraper } from './baseScraper.js';
import * as cheerio from 'cheerio';
export class MonsterScraper extends BaseScraper {
    constructor() {
        super('https://www.monster.com');
    }
    async search(filter) {
        const jobs = [];
        try {
            // Build search URL for Monster
            const searchTerms = this.buildSearchTerms(filter);
            const location = filter.location === 'Remote' ? '' : filter.location;
            const searchUrl = `https://www.monster.com/jobs/search/?q=${encodeURIComponent(searchTerms)}&where=${encodeURIComponent(location)}&tm=1`;
            const html = await this.fetchPage(searchUrl);
            const $ = cheerio.load(html);
            // Monster job listings are in .card-content
            const jobElements = $('.card-content');
            jobElements.each((index, element) => {
                if (index >= filter.maxResults)
                    return false;
                const job = this.parseJobPosting($(element), $, 'Monster');
                if (job) {
                    jobs.push(job);
                }
            });
        }
        catch (error) {
            console.error('Monster scraping error:', error);
        }
        return jobs;
    }
    buildSearchTerms(filter) {
        const baseTerms = ['machine learning', 'artificial intelligence', 'data science', 'AI engineer', 'ML engineer'];
        const allTerms = [...baseTerms, ...filter.keywords];
        return allTerms.join(' ');
    }
    getTitleSelector() {
        return '.card-content .title a, .card-content .title';
    }
    getCompanySelector() {
        return '.card-content .company a, .card-content .company';
    }
    getLocationSelector() {
        return '.card-content .location';
    }
    getDescriptionSelector() {
        return '.card-content .summary';
    }
    getUrlSelector() {
        return '.card-content .title a';
    }
    extractPostedDate(element, $) {
        const dateElement = element.find('.meta .date');
        if (dateElement.length > 0) {
            const dateText = dateElement.text().trim();
            // Parse relative dates
            const now = new Date();
            if (dateText.includes('day')) {
                const days = parseInt(dateText.match(/\d+/)?.[0] || '0');
                now.setDate(now.getDate() - days);
                return now.toISOString();
            }
            else if (dateText.includes('week')) {
                const weeks = parseInt(dateText.match(/\d+/)?.[0] || '0');
                now.setDate(now.getDate() - (weeks * 7));
                return now.toISOString();
            }
        }
        return new Date().toISOString();
    }
}
//# sourceMappingURL=monsterScraper.js.map