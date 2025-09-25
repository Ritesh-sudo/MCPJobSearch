export interface JobPosting {
    id: string;
    title: string;
    company: string;
    location: string;
    type: 'internship' | 'full-time' | 'contract' | 'part-time';
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
    description: string;
    requirements: string[];
    skills: string[];
    salary?: {
        min?: number;
        max?: number;
        currency: string;
    };
    postedDate: string;
    applicationUrl: string;
    source: string;
    isRemote: boolean;
    hasPythonRequirement: boolean;
    isAIMLRelated: boolean;
}
export interface JobFilter {
    location: string;
    maxResults: number;
    includeInternships: boolean;
    includeFullTime: boolean;
    keywords: string[];
    experienceLevel: 'entry' | 'mid' | 'senior' | 'all';
    requiredSkills: string[];
    jobTypes: string[];
}
export interface JobSearchResult {
    site: string;
    jobs: JobPosting[];
    totalFound: number;
    searchTime: number;
    error?: string;
}
export interface JobSearchResponse {
    results: JobSearchResult[];
    totalJobs: number;
    searchTimestamp: string;
    filters: JobFilter;
}
//# sourceMappingURL=jobTypes.d.ts.map