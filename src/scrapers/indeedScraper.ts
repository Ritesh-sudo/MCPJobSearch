import { BaseScraper } from './baseScraper.js';
import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';

export class IndeedScraper extends BaseScraper {
  constructor() {
    super('https://www.indeed.com');
  }

  async search(filter: JobFilter): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];
    
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
        if (index >= filter.maxResults) return false;
        
        const job = this.parseJobPosting($(element), $, 'Indeed');
        if (job) {
          jobs.push(job);
        }
      });
      
    } catch (error) {
      console.error('Indeed scraping error:', error);
    }
    
    return jobs;
  }

  private buildSearchTerms(filter: JobFilter): string {
    const baseTerms = ['machine learning engineer', 'artificial intelligence', 'data scientist', 'AI engineer', 'ML engineer'];
    const allTerms = [...baseTerms, ...filter.keywords];
    return allTerms.join(' ');
  }

  protected getTitleSelector(): string {
    return '.jobTitle a, .jobTitle span';
  }

  protected getCompanySelector(): string {
    return '.companyName a, .companyName span';
  }

  protected getLocationSelector(): string {
    return '.companyLocation';
  }

  protected getDescriptionSelector(): string {
    return '.job-snippet';
  }

  protected getUrlSelector(): string {
    return '.jobTitle a';
  }

  protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    const dateElement = element.find('.date');
    if (dateElement.length > 0) {
      const dateText = dateElement.text().trim();
      // Parse relative dates like "2 days ago", "1 week ago"
      const now = new Date();
      if (dateText.includes('day')) {
        const days = parseInt(dateText.match(/\d+/)?.[0] || '0');
        now.setDate(now.getDate() - days);
        return now.toISOString();
      } else if (dateText.includes('week')) {
        const weeks = parseInt(dateText.match(/\d+/)?.[0] || '0');
        now.setDate(now.getDate() - (weeks * 7));
        return now.toISOString();
      }
    }
    return new Date().toISOString();
  }
}
