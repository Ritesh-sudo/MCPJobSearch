import { LinkedInScraper } from '../scrapers/linkedinScraper.js';
import { IndeedScraper } from '../scrapers/indeedScraper.js';
import { GlassdoorScraper } from '../scrapers/glassdoorScraper.js';
import { ZipRecruiterScraper } from '../scrapers/ziprecruiterScraper.js';
import { MonsterScraper } from '../scrapers/monsterScraper.js';
export class JobSearchService {
    scrapers = new Map();
    constructor() {
        this.scrapers.set('linkedin', new LinkedInScraper());
        this.scrapers.set('indeed', new IndeedScraper());
        this.scrapers.set('glassdoor', new GlassdoorScraper());
        this.scrapers.set('ziprecruiter', new ZipRecruiterScraper());
        this.scrapers.set('monster', new MonsterScraper());
    }
    async searchAllSites(filter) {
        const startTime = Date.now();
        const results = [];
        // Search all sites in parallel
        const searchPromises = Array.from(this.scrapers.keys()).map(async (site) => {
            try {
                const result = await this.searchSite(site, filter);
                return result;
            }
            catch (error) {
                return {
                    site,
                    jobs: [],
                    totalFound: 0,
                    searchTime: 0,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });
        const searchResults = await Promise.all(searchPromises);
        results.push(...searchResults);
        const totalJobs = results.reduce((sum, result) => sum + result.jobs.length, 0);
        return {
            results,
            totalJobs,
            searchTimestamp: new Date().toISOString(),
            filters: filter
        };
    }
    async searchSite(site, filter) {
        const startTime = Date.now();
        const scraper = this.scrapers.get(site.toLowerCase());
        if (!scraper) {
            throw new Error(`Unsupported job site: ${site}`);
        }
        try {
            const jobs = await scraper.search(filter);
            const filteredJobs = this.filterJobs(jobs, filter);
            return {
                site,
                jobs: filteredJobs,
                totalFound: filteredJobs.length,
                searchTime: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                site,
                jobs: [],
                totalFound: 0,
                searchTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    filterJobs(jobs, filter) {
        return jobs.filter(job => {
            // Filter by job type (internship vs full-time)
            if (!filter.includeInternships && job.type === 'internship')
                return false;
            if (!filter.includeFullTime && job.type === 'full-time')
                return false;
            // Filter by experience level
            if (filter.experienceLevel !== 'all' && job.experienceLevel !== filter.experienceLevel) {
                return false;
            }
            // Filter by required skills (Python requirement)
            if (filter.requiredSkills.length > 0) {
                const hasRequiredSkills = filter.requiredSkills.every(skill => job.skills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase())) || job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase())));
                if (!hasRequiredSkills)
                    return false;
            }
            // Filter by AI/ML relevance
            const isAIMLJob = job.isAIMLRelated ||
                job.title.toLowerCase().includes('ai') ||
                job.title.toLowerCase().includes('ml') ||
                job.title.toLowerCase().includes('machine learning') ||
                job.title.toLowerCase().includes('artificial intelligence') ||
                job.title.toLowerCase().includes('data science') ||
                job.title.toLowerCase().includes('deep learning') ||
                job.title.toLowerCase().includes('nlp') ||
                job.title.toLowerCase().includes('computer vision');
            if (!isAIMLJob)
                return false;
            // Filter by location
            if (filter.location.toLowerCase() !== 'remote' && filter.location.toLowerCase() !== 'any') {
                const jobLocation = job.location.toLowerCase();
                const filterLocation = filter.location.toLowerCase();
                if (!jobLocation.includes(filterLocation) && !job.isRemote) {
                    return false;
                }
            }
            // Filter by additional keywords
            if (filter.keywords.length > 0) {
                const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase();
                const hasKeywords = filter.keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
                if (!hasKeywords)
                    return false;
            }
            return true;
        }).slice(0, filter.maxResults);
    }
}
//# sourceMappingURL=jobSearchService.js.map