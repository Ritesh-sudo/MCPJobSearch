import { useEffect, useMemo, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { JobCard } from './components/JobCard'
import { SearchForm } from './components/SearchForm'
import { JobPosting, JobSearchResponse } from './types/types'
import { fetchJobs } from './utils/api'

export default function App() {
  const [location, setLocation] = useState<string>('Remote')
  const [includeInternships, setIncludeInternships] = useState<boolean>(true)
  const [includeFullTime, setIncludeFullTime] = useState<boolean>(true)
  const [keywords, setKeywords] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [data, setData] = useState<JobSearchResponse | null>(null)

  const parsedKeywords = useMemo(
    () => keywords.split(',').map(k => k.trim()).filter(Boolean),
    [keywords]
  )

  const onSearch = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchJobs({
        location,
        includeInternships,
        includeFullTime,
        keywords: parsedKeywords
      })
      setData(result)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    onSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const jobs: JobPosting[] = useMemo(() => {
    if (!data) return []
    return data.results.flatMap(r => r.jobs)
  }, [data])

  return (
    <div className="min-h-screen bg-secondary-50 text-secondary-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-secondary-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">AI/ML Job Search</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <SearchForm
          location={location}
          setLocation={setLocation}
          includeInternships={includeInternships}
          setIncludeInternships={setIncludeInternships}
          includeFullTime={includeFullTime}
          setIncludeFullTime={setIncludeFullTime}
          keywords={keywords}
          setKeywords={setKeywords}
          onSearch={onSearch}
          loading={loading}
        />

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Results</h2>
            {loading && (
              <div className="flex items-center gap-2 text-secondary-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching latest postings…</span>
              </div>
            )}
          </div>

          {jobs.length === 0 && !loading ? (
            <div className="rounded-md border border-secondary-200 bg-white p-6 text-secondary-600">
              No jobs found. Try changing filters or keywords.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <JobCard key={`${job.id}-${job.source}`} job={job} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}


