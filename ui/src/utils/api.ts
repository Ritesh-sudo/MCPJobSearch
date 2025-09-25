import axios from 'axios'
import { JobSearchResponse } from '../types/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

type Params = {
  location: string
  includeInternships: boolean
  includeFullTime: boolean
  keywords: string[]
  maxResults?: number
}

export async function fetchJobs(params: Params): Promise<JobSearchResponse> {
  const { location, includeInternships, includeFullTime, keywords, maxResults = 50 } = params
  const resp = await axios.get(`${API_URL}/search`, {
    params: {
      location,
      includeInternships,
      includeFullTime,
      keywords: keywords.join(','),
      maxResults
    }
  })
  return resp.data
}


