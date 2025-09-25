import { BaseScraper } from './baseScraper.js';
import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';
export declare class IndeedScraper extends BaseScraper {
    constructor();
    search(filter: JobFilter): Promise<JobPosting[]>;
    private buildSearchTerms;
    protected getTitleSelector(): string;
    protected getCompanySelector(): string;
    protected getLocationSelector(): string;
    protected getDescriptionSelector(): string;
    protected getUrlSelector(): string;
    protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string;
}
//# sourceMappingURL=indeedScraper.d.ts.map