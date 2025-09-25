import { BaseScraper } from './baseScraper.js';
import { JobFilter, JobPosting } from '../types/jobTypes.js';
import axios from 'axios';

type GreenhouseJob = {
  id: number
  absolute_url: string
  title: string
  updated_at?: string
  metadata?: any[]
  location?: { name?: string }
  departments?: { name: string }[]
}

export class GreenhouseScraper extends BaseScraper {
  private companies: string[]

  constructor(companies?: string[]) {
    super('https://boards-api.greenhouse.io');
    // A small default set; we can expand this list later or make it configurable
    this.companies = companies ?? [
      'openai', 'anthropic', 'scaleai', 'nvidia', 'stripe', 'databricks',
      'doordash', 'airbnb', 'snap', 'affirm', 'notion', 'asana'
    ];
  }

  async search(filter: JobFilter): Promise<JobPosting[]> {
    const results: JobPosting[] = [];
    const maxPerCompany = Math.max(5, Math.floor(filter.maxResults / Math.max(1, this.companies.length)));

    for (const company of this.companies) {
      try {
        const url = `${this.baseUrl}/v1/boards/${company}/jobs?content=true`;
        const resp = await axios.get(url, { timeout: 20000 });
        const jobs: GreenhouseJob[] = resp.data?.jobs ?? [];

        for (const j of jobs) {
          if (results.length >= filter.maxResults) break;

          const title = j.title || '';
          const description = '';
          const location = j.location?.name || 'Not specified';

          const posting: JobPosting = {
            id: String(j.id),
            title,
            company: company,
            location,
            type: title.toLowerCase().includes('intern') ? 'internship' : 'full-time',
            experienceLevel: this.determineExperienceLevel(title, description),
            description,
            requirements: [],
            skills: this.extractSkills(description + ' ' + title),
            postedDate: j.updated_at ? new Date(j.updated_at).toISOString() : new Date().toISOString(),
            applicationUrl: j.absolute_url,
            source: 'Greenhouse',
            isRemote: this.isRemoteJob(location, description),
            hasPythonRequirement: this.hasPythonRequirement(description + ' ' + title, []),
            isAIMLRelated: this.isAIMLRelated(title, description)
          };

          results.push(posting);
          if (results.filter(r => r.company === company).length >= maxPerCompany) break;
        }
      } catch {
        // ignore individual company failures
      }
      if (results.length >= filter.maxResults) break;
    }

    return results;
  }

  protected getTitleSelector(): string { return ''; }
  protected getCompanySelector(): string { return ''; }
  protected getLocationSelector(): string { return ''; }
  protected getDescriptionSelector(): string { return ''; }
  protected getUrlSelector(): string { return ''; }
}


