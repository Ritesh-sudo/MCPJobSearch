import { BaseScraper } from './baseScraper.js';
import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';

export class LinkedInScraper extends BaseScraper {
  constructor() {
    super('https://www.linkedin.com');
  }

  async search(filter: JobFilter): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];
    
    try {
      // Build search URL for LinkedIn Jobs
      const searchTerms = this.buildSearchTerms(filter);
      const location = filter.location === 'Remote' ? '' : filter.location;
      
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchTerms)}&location=${encodeURIComponent(location)}&f_TPR=r86400&f_JT=I&f_JT=F&start=0`;
      
      const html = await this.fetchPage(searchUrl);
      const $ = cheerio.load(html);
      
      // LinkedIn job listings are in .jobs-search__results-list li
      const jobElements = $('.jobs-search__results-list li');
      
      jobElements.each((index, element) => {
        if (index >= filter.maxResults) return false;
        
        const job = this.parseJobPosting($(element), $, 'LinkedIn');
        if (job) {
          jobs.push(job);
        }
      });
      
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
    }
    
    return jobs;
  }

  private buildSearchTerms(filter: JobFilter): string {
    const baseTerms = ['machine learning', 'artificial intelligence', 'data science', 'AI', 'ML'];
    const allTerms = [...baseTerms, ...filter.keywords];
    return allTerms.join(' OR ');
  }

  protected getTitleSelector(): string {
    return '.job-search-card__title a, .base-search-card__title a';
  }

  protected getCompanySelector(): string {
    return '.job-search-card__subtitle a, .base-search-card__subtitle a';
  }

  protected getLocationSelector(): string {
    return '.job-search-card__location, .base-search-card__metadata .job-search-card__location';
  }

  protected getDescriptionSelector(): string {
    return '.job-search-card__snippet, .base-search-card__snippet';
  }

  protected getUrlSelector(): string {
    return '.job-search-card__title a, .base-search-card__title a';
  }

  protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    const timeElement = element.find('time');
    if (timeElement.length > 0) {
      const datetime = timeElement.attr('datetime');
      if (datetime) {
        return new Date(datetime).toISOString();
      }
    }
    return new Date().toISOString();
  }
}
