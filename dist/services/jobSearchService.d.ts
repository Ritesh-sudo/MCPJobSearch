import { JobFilter, JobSearchResult, JobSearchResponse } from '../types/jobTypes.js';
export declare class JobSearchService {
    private scrapers;
    constructor();
    searchAllSites(filter: JobFilter): Promise<JobSearchResponse>;
    searchSite(site: string, filter: JobFilter): Promise<JobSearchResult>;
    private filterJobs;
}
//# sourceMappingURL=jobSearchService.d.ts.map