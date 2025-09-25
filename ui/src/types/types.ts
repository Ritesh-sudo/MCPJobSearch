export type JobPosting = {
  id: string
  title: string
  company: string
  location: string
  type: 'internship' | 'full-time' | 'contract' | 'part-time'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead'
  description: string
  requirements: string[]
  skills: string[]
  postedDate: string
  applicationUrl: string
  source: string
  isRemote: boolean
  hasPythonRequirement: boolean
  isAIMLRelated: boolean
}

export type JobSearchResult = {
  site: string
  jobs: JobPosting[]
  totalFound: number
  searchTime: number
  error?: string
}

export type JobSearchResponse = {
  results: JobSearchResult[]
  totalJobs: number
  searchTimestamp: string
  // filters omitted for brevity
}


