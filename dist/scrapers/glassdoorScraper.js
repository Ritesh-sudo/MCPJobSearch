import { BaseScraper } from './baseScraper.js';
import * as cheerio from 'cheerio';
export class GlassdoorScraper extends BaseScraper {
    constructor() {
        super('https://www.glassdoor.com');
    }
    async search(filter) {
        const jobs = [];
        try {
            // Build search URL for Glassdoor
            const searchTerms = this.buildSearchTerms(filter);
            const location = filter.location === 'Remote' ? '' : filter.location;
            const searchUrl = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchTerms)}&locT=C&locId=${encodeURIComponent(location)}&fromAge=1`;
            const html = await this.fetchPage(searchUrl);
            const $ = cheerio.load(html);
            // Glassdoor job listings are in .react-job-listing
            const jobElements = $('.react-job-listing');
            jobElements.each((index, element) => {
                if (index >= filter.maxResults)
                    return false;
                const job = this.parseJobPosting($(element), $, 'Glassdoor');
                if (job) {
                    jobs.push(job);
                }
            });
        }
        catch (error) {
            console.error('Glassdoor scraping error:', error);
        }
        return jobs;
    }
    buildSearchTerms(filter) {
        const baseTerms = ['machine learning', 'artificial intelligence', 'data science', 'AI engineer', 'ML engineer'];
        const allTerms = [...baseTerms, ...filter.keywords];
        return allTerms.join(' ');
    }
    getTitleSelector() {
        return '.jobTitle a, .jobTitle span';
    }
    getCompanySelector() {
        return '.employerName a, .employerName span';
    }
    getLocationSelector() {
        return '.location';
    }
    getDescriptionSelector() {
        return '.jobDescriptionContent';
    }
    getUrlSelector() {
        return '.jobTitle a';
    }
    extractPostedDate(element, $) {
        const dateElement = element.find('.job-age');
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
//# sourceMappingURL=glassdoorScraper.js.map