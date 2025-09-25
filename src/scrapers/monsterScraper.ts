import { BaseScraper } from './baseScraper.js';
import { JobPosting, JobFilter } from '../types/jobTypes.js';
import * as cheerio from 'cheerio';

export class MonsterScraper extends BaseScraper {
  constructor() {
    super('https://www.monster.com');
  }

  async search(filter: JobFilter): Promise<JobPosting[]> {
    const jobs: JobPosting[] = [];
    
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
        if (index >= filter.maxResults) return false;
        
        const job = this.parseJobPosting($(element), $, 'Monster');
        if (job) {
          jobs.push(job);
        }
      });
      
    } catch (error) {
      console.error('Monster scraping error:', error);
    }
    
    return jobs;
  }

  private buildSearchTerms(filter: JobFilter): string {
    const baseTerms = ['machine learning', 'artificial intelligence', 'data science', 'AI engineer', 'ML engineer'];
    const allTerms = [...baseTerms, ...filter.keywords];
    return allTerms.join(' ');
  }

  protected getTitleSelector(): string {
    return '.card-content .title a, .card-content .title';
  }

  protected getCompanySelector(): string {
    return '.card-content .company a, .card-content .company';
  }

  protected getLocationSelector(): string {
    return '.card-content .location';
  }

  protected getDescriptionSelector(): string {
    return '.card-content .summary';
  }

  protected getUrlSelector(): string {
    return '.card-content .title a';
  }

  protected extractPostedDate(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    const dateElement = element.find('.meta .date');
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
