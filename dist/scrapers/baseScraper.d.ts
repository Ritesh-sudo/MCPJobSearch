import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';
export declare abstract class BaseScraper {
    protected baseUrl: string;
    protected headers: Record<string, string>;
    constructor(baseUrl: string);
    abstract search(filter: JobFilter): Promise<JobPosting[]>;
    protected fetchPage(url: string): Promise<string>;
    protected fetchPageWithStealthBrowser(url: string): Promise<string>;
    protected parseJobPosting(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI, source: string): JobPosting | null;
    protected extractText(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI, selector: string): string;
    protected extractUrl(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI, selector: string): string;
    protected normalizeUrl(url: string): string;
    protected generateJobId(title: string, company: string, source: string): string;
    protected determineJobType(title: string, description: string): 'internship' | 'full-time' | 'contract' | 'part-time';
    protected determineExperienceLevel(title: string, description: string): 'entry' | 'mid' | 'senior' | 'lead';
    protected extractSkills(description: string): string[];
    protected extractRequirements(description: string): string[];
    protected isRemoteJob(location: string, description: string): boolean;
    protected hasPythonRequirement(description: string, requirements: string[]): boolean;
    protected isAIMLRelated(title: string, description: string): boolean;
    protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string;
    protected abstract getTitleSelector(): string;
    protected abstract getCompanySelector(): string;
    protected abstract getLocationSelector(): string;
    protected abstract getDescriptionSelector(): string;
    protected abstract getUrlSelector(): string;
}
//# sourceMappingURL=baseScraper.d.ts.map