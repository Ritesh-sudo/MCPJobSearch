type Props = {
  location: string
  setLocation: (v: string) => void
  includeInternships: boolean
  setIncludeInternships: (v: boolean) => void
  includeFullTime: boolean
  setIncludeFullTime: (v: boolean) => void
  keywords: string
  setKeywords: (v: string) => void
  onSearch: () => void
  loading: boolean
}

export function SearchForm(props: Props) {
  const {
    location, setLocation,
    includeInternships, setIncludeInternships,
    includeFullTime, setIncludeFullTime,
    keywords, setKeywords,
    onSearch, loading
  } = props

  return (
    <section className="bg-white border border-secondary-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-secondary-600">Location</label>
          <input
            className="mt-1 w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="Remote or City, State"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-secondary-600">Keywords (comma separated)</label>
          <input
            className="mt-1 w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            placeholder="deep learning, nlp"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeInternships} onChange={e => setIncludeInternships(e.target.checked)} />
            Internships
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeFullTime} onChange={e => setIncludeFullTime(e.target.checked)} />
            Full-time
          </label>
        </div>

        <div className="flex items-end">
          <button
            onClick={onSearch}
            disabled={loading}
            className="w-full md:w-auto rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>
    </section>
  )
}


