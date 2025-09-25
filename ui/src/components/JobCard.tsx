import { Briefcase, Building2, MapPin, CalendarDays, ExternalLink, Code } from 'lucide-react'
import { JobPosting } from '../types/types'

export function JobCard({ job }: { job: JobPosting }) {
  return (
    <article className="bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-secondary-900 leading-snug">
            {job.title}
          </h3>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-secondary-600">
            <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.company}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
            <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.type}</span>
          </div>
        </div>

        <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700">
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>

      <div className="mt-3 text-sm text-secondary-700 line-clamp-3">
        {job.description}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {job.skills.slice(0, 6).map(skill => (
          <span key={skill} className="text-xs rounded-full border border-secondary-200 bg-secondary-50 px-2 py-1 text-secondary-700">
            {skill}
          </span>
        ))}
        {job.hasPythonRequirement && (
          <span className="inline-flex items-center gap-1 text-xs rounded-full border border-green-200 bg-green-50 px-2 py-1 text-green-700">
            <Code className="h-3.5 w-3.5" /> Python
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-secondary-500">
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {new Date(job.postedDate).toLocaleDateString()}</span>
        <span className="uppercase tracking-wide">{job.source}</span>
      </div>
    </article>
  )
}


