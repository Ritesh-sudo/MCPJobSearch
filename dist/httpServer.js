import express from 'express';
import cors from 'cors';
import { JobSearchService } from './services/jobSearchService.js';
const app = express();
app.use(cors());
app.use(express.json());
const jobSearchService = new JobSearchService();
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.get('/search', async (req, res) => {
    try {
        const { location = 'Remote', maxResults = '50', includeInternships = 'true', includeFullTime = 'true', keywords = '' } = req.query;
        const filter = {
            location,
            maxResults: parseInt(maxResults, 10) || 50,
            includeInternships: includeInternships === 'true',
            includeFullTime: includeFullTime === 'true',
            keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
            experienceLevel: 'entry',
            requiredSkills: ['python'],
            jobTypes: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'data science']
        };
        const results = await jobSearchService.searchAllSites(filter);
        res.json(results);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal error' });
    }
});
app.get('/search/:site', async (req, res) => {
    try {
        const { site } = req.params;
        const { location = 'Remote', maxResults = '25' } = req.query;
        const filter = {
            location,
            maxResults: parseInt(maxResults, 10) || 25,
            includeInternships: true,
            includeFullTime: true,
            keywords: [],
            experienceLevel: 'entry',
            requiredSkills: ['python'],
            jobTypes: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'data science']
        };
        const result = await jobSearchService.searchSite(site, filter);
        res.json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Internal error' });
    }
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`HTTP Job Search API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=httpServer.js.map