# Job Search MCP Server

An MCP (Model Context Protocol) server that searches across multiple job sites for AI/ML internships and full-time roles with specific filtering criteria.

## Features

- **Multi-site Job Search**: Searches LinkedIn, Indeed, Glassdoor, ZipRecruiter, and Monster
- **AI/ML Focus**: Specifically targets artificial intelligence and machine learning positions
- **Smart Filtering**: 
  - Filters for entry-level positions (less than 1 year experience)
  - Requires Python proficiency
  - Supports both internships and full-time roles
- **Real-time Results**: Gets the latest job postings from all sites
- **Structured Data**: Returns well-formatted job information with all relevant details

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

```bash
npm start
```

Or for development:
```bash
npm run dev
```

### Available Tools

#### 1. `search_ai_ml_jobs`
Search for AI/ML jobs across all supported job sites.

**Parameters:**
- `location` (string, optional): Job location (default: "Remote")
- `maxResults` (number, optional): Maximum results to return (default: 50)
- `includeInternships` (boolean, optional): Include internships (default: true)
- `includeFullTime` (boolean, optional): Include full-time roles (default: true)
- `keywords` (array, optional): Additional search keywords

**Example:**
```json
{
  "location": "San Francisco, CA",
  "maxResults": 25,
  "includeInternships": true,
  "includeFullTime": true,
  "keywords": ["deep learning", "NLP", "computer vision"]
}
```

#### 2. `search_specific_job_site`
Search for jobs on a specific job site.

**Parameters:**
- `site` (string, required): Job site ("linkedin", "indeed", "glassdoor", "ziprecruiter", "monster")
- `location` (string, optional): Job location (default: "Remote")
- `maxResults` (number, optional): Maximum results to return (default: 25)

**Example:**
```json
{
  "site": "linkedin",
  "location": "Remote",
  "maxResults": 20
}
```

## Job Filtering Criteria

The server automatically applies the following filters:

### For Full-time Roles:
- **Experience Level**: Entry-level (less than 1 year experience)
- **Required Skills**: Must include Python proficiency
- **Job Type**: AI/ML related positions only

### For Internships:
- **Job Type**: AI/ML related positions only
- **Skills**: Python proficiency preferred

### AI/ML Keywords Detected:
- Machine Learning
- Artificial Intelligence
- Data Science
- Deep Learning
- NLP (Natural Language Processing)
- Computer Vision
- Neural Networks
- TensorFlow, PyTorch, Scikit-learn

## Response Format

The server returns structured job data including:

```json
{
  "results": [
    {
      "site": "LinkedIn",
      "jobs": [
        {
          "id": "unique_job_id",
          "title": "Machine Learning Engineer",
          "company": "Tech Company",
          "location": "San Francisco, CA",
          "type": "full-time",
          "experienceLevel": "entry",
          "description": "Job description...",
          "requirements": ["Python", "Machine Learning"],
          "skills": ["python", "tensorflow", "pytorch"],
          "postedDate": "2024-01-15T10:30:00Z",
          "applicationUrl": "https://...",
          "source": "LinkedIn",
          "isRemote": false,
          "hasPythonRequirement": true,
          "isAIMLRelated": true
        }
      ],
      "totalFound": 1,
      "searchTime": 1500
    }
  ],
  "totalJobs": 1,
  "searchTimestamp": "2024-01-15T10:30:00Z",
  "filters": {
    "location": "San Francisco, CA",
    "maxResults": 50,
    "includeInternships": true,
    "includeFullTime": true,
    "keywords": [],
    "experienceLevel": "entry",
    "requiredSkills": ["python"],
    "jobTypes": ["ai", "ml", "machine learning", "artificial intelligence", "data science"]
  }
}
```

## Configuration

Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

Available configuration options:
- `RATE_LIMIT_PER_MINUTE`: Rate limiting for requests (default: 30)
- `REQUEST_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `USER_AGENT`: User agent string for web scraping

## Supported Job Sites

1. **LinkedIn** - Professional networking and job board
2. **Indeed** - General job search engine
3. **Glassdoor** - Job search with company reviews
4. **ZipRecruiter** - Job matching platform
5. **Monster** - Traditional job board

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js
- **Web Scraping**: Cheerio for HTML parsing, Axios for HTTP requests
- **Architecture**: Modular scraper system with base class and site-specific implementations

## Error Handling

The server includes comprehensive error handling:
- Network timeouts and connection errors
- HTML parsing errors
- Rate limiting protection
- Graceful degradation when individual sites fail

## Legal and Ethical Considerations

This tool is for educational and personal use. Please respect:
- Website terms of service
- Rate limiting to avoid overloading servers
- Robots.txt files and scraping policies
- Consider using official APIs when available

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request
