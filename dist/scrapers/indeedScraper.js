import { BaseScraper } from './baseScraper.js';
import * as cheerio from 'cheerio';
export class IndeedScraper extends BaseScraper {
    constructor() {
        super('https://www.indeed.com');
    }
    async search(filter) {
        const jobs = [];
        try {
            // Build search URL for Indeed
            const searchTerms = this.buildSearchTerms(filter);
            const location = filter.location === 'Remote' ? '' : filter.location;
            const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchTerms)}&l=${encodeURIComponent(location)}&fromage=1&sort=date`;
            const html = await this.fetchPage(searchUrl);
            const $ = cheerio.load(html);
            // Indeed job listings are in .jobsearch-SerpJobCard
            const jobElements = $('.jobsearch-SerpJobCard');
            jobElements.each((index, element) => {
                if (index >= filter.maxResults)
                    return false;
                const job = this.parseJobPosting($(element), $, 'Indeed');
                if (job) {
                    jobs.push(job);
                }
            });
        }
        catch (error) {
            console.error('Indeed scraping error:', error);
        }
        return jobs;
    }
    buildSearchTerms(filter) {
        const baseTerms = ['machine learning engineer', 'artificial intelligence', 'data scientist', 'AI engineer', 'ML engineer'];
        const allTerms = [...baseTerms, ...filter.keywords];
        return allTerms.join(' ');
    }
    getTitleSelector() {
        return '.jobTitle a, .jobTitle span';
    }
    getCompanySelector() {
        return '.companyName a, .companyName span';
    }
    getLocationSelector() {
        return '.companyLocation';
    }
    getDescriptionSelector() {
        return '.job-snippet';
    }
    getUrlSelector() {
        return '.jobTitle a';
    }
    extractPostedDate(element, $) {
        const dateElement = element.find('.date');
        if (dateElement.length > 0) {
            const dateText = dateElement.text().trim();
            // Parse relative dates like "2 days ago", "1 week ago"
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
//# sourceMappingURL=indeedScraper.js.map