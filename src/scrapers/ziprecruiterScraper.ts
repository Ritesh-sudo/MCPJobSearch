import { BaseScraper } from './baseScraper.js';
import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';

export class ZipRecruiterScraper extends BaseScraper {
  constructor() {
    super('https://www.ziprecruiter.com');
  }

  async search(filter: JobFilter): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];
    
    try {
      // Build search URL for ZipRecruiter
      const searchTerms = this.buildSearchTerms(filter);
      const location = filter.location === 'Remote' ? '' : filter.location;
      
      const searchUrl = `https://www.ziprecruiter.com/jobs-search?search=${encodeURIComponent(searchTerms)}&location=${encodeURIComponent(location)}&days=1`;
      
      const html = await this.fetchPage(searchUrl);
      const $ = cheerio.load(html);
      
      // ZipRecruiter job listings are in .job_content
      const jobElements = $('.job_content');
      
      jobElements.each((index, element) => {
        if (index >= filter.maxResults) return false;
        
        const job = this.parseJobPosting($(element), $, 'ZipRecruiter');
        if (job) {
          jobs.push(job);
        }
      });
      
    } catch (error) {
      console.error('ZipRecruiter scraping error:', error);
    }
    
    return jobs;
  }

  private buildSearchTerms(filter: JobFilter): string {
    const baseTerms = ['machine learning engineer', 'artificial intelligence engineer', 'data scientist', 'AI engineer', 'ML engineer'];
    const allTerms = [...baseTerms, ...filter.keywords];
    return allTerms.join(' ');
  }

  protected getTitleSelector(): string {
    return '.job_link .job_title';
  }

  protected getCompanySelector(): string {
    return '.job_link .company_name';
  }

  protected getLocationSelector(): string {
    return '.job_link .location';
  }

  protected getDescriptionSelector(): string {
    return '.job_snippet';
  }

  protected getUrlSelector(): string {
    return '.job_link';
  }

  protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    const dateElement = element.find('.job_age');
    if (dateElement.length > 0) {
      const dateText = dateElement.text().trim();
      // Parse relative dates
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
