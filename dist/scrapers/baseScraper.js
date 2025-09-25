import axios from 'axios';
import puppeteerExtra from 'puppeteer-extra';
// @ts-ignore types may not be present for the plugin
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
export class BaseScraper {
    baseUrl;
    headers;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        };
    }
    async fetchPage(url) {
        try {
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 30000,
                maxRedirects: 5
            });
            return response.data;
        }
        catch (error) {
            // If blocked (e.g., 403), try stealth browser fallback
            const status = error?.response?.status;
            if (status === 403 || status === 429) {
                return await this.fetchPageWithStealthBrowser(url);
            }
            throw new Error(`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fetchPageWithStealthBrowser(url) {
        try {
            // Install plugin once per process
            // Note: calling use() repeatedly is a no-op for the same plugin
            // but we guard it implicitly here.
            // @ts-ignore
            puppeteerExtra.use(StealthPlugin());
            const browser = await puppeteerExtra.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-zygote',
                    '--single-process'
                ]
            });
            const page = await browser.newPage();
            const ua = new UserAgent();
            await page.setUserAgent(ua.toString());
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9'
            });
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            // Some sites lazy-render; give a short settle time
            await new Promise(res => setTimeout(res, 1500));
            const content = await page.content();
            await page.close();
            await browser.close();
            return content;
        }
        catch (browserError) {
            throw new Error(`Stealth fetch failed: ${browserError instanceof Error ? browserError.message : 'Unknown error'}`);
        }
    }
    parseJobPosting(element, $, source) {
        try {
            const title = this.extractText(element, $, this.getTitleSelector());
            const company = this.extractText(element, $, this.getCompanySelector());
            const location = this.extractText(element, $, this.getLocationSelector());
            const description = this.extractText(element, $, this.getDescriptionSelector());
            const applicationUrl = this.extractUrl(element, $, this.getUrlSelector());
            if (!title || !company || !applicationUrl) {
                return null;
            }
            const jobType = this.determineJobType(title, description);
            const experienceLevel = this.determineExperienceLevel(title, description);
            const skills = this.extractSkills(description);
            const requirements = this.extractRequirements(description);
            const isRemote = this.isRemoteJob(location, description);
            const hasPythonRequirement = this.hasPythonRequirement(description, requirements);
            const isAIMLRelated = this.isAIMLRelated(title, description);
            return {
                id: this.generateJobId(title, company, source),
                title: title.trim(),
                company: company.trim(),
                location: location?.trim() || 'Not specified',
                type: jobType,
                experienceLevel,
                description: description?.trim() || '',
                requirements,
                skills,
                postedDate: this.extractPostedDate(element, $),
                applicationUrl: this.normalizeUrl(applicationUrl),
                source,
                isRemote,
                hasPythonRequirement,
                isAIMLRelated
            };
        }
        catch (error) {
            console.error('Error parsing job posting:', error);
            return null;
        }
    }
    extractText(element, $, selector) {
        const textElement = element.find(selector);
        return textElement.length > 0 ? textElement.text().trim() : '';
    }
    extractUrl(element, $, selector) {
        const linkElement = element.find(selector);
        if (linkElement.length > 0) {
            const href = linkElement.attr('href');
            return href ? this.normalizeUrl(href) : '';
        }
        return '';
    }
    normalizeUrl(url) {
        if (url.startsWith('http')) {
            return url;
        }
        if (url.startsWith('/')) {
            return `${this.baseUrl}${url}`;
        }
        return `${this.baseUrl}/${url}`;
    }
    generateJobId(title, company, source) {
        const combined = `${title}-${company}-${source}`;
        return Buffer.from(combined).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    }
    determineJobType(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        if (text.includes('intern') || text.includes('internship')) {
            return 'internship';
        }
        if (text.includes('contract') || text.includes('contractor')) {
            return 'contract';
        }
        if (text.includes('part-time') || text.includes('part time')) {
            return 'part-time';
        }
        return 'full-time';
    }
    determineExperienceLevel(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        if (text.includes('senior') || text.includes('sr.') || text.includes('lead') || text.includes('principal')) {
            return 'senior';
        }
        if (text.includes('mid') || text.includes('intermediate') || text.includes('2-3 years') || text.includes('3-5 years')) {
            return 'mid';
        }
        if (text.includes('entry') || text.includes('junior') || text.includes('0-1 years') || text.includes('1 year') || text.includes('recent graduate')) {
            return 'entry';
        }
        return 'entry'; // Default to entry level for AI/ML roles
    }
    extractSkills(description) {
        const commonSkills = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'r', 'sql',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'linux',
            'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science',
            'statistics', 'linear algebra', 'calculus', 'algorithms', 'data structures'
        ];
        const foundSkills = [];
        const lowerDesc = description.toLowerCase();
        commonSkills.forEach(skill => {
            if (lowerDesc.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });
        return foundSkills;
    }
    extractRequirements(description) {
        // Simple extraction of requirements - in a real implementation, you'd use more sophisticated parsing
        const lines = description.split('\n');
        const requirements = [];
        let inRequirementsSection = false;
        for (const line of lines) {
            const lowerLine = line.toLowerCase().trim();
            if (lowerLine.includes('requirements') || lowerLine.includes('qualifications') || lowerLine.includes('must have')) {
                inRequirementsSection = true;
                continue;
            }
            if (inRequirementsSection && (lowerLine.startsWith('-') || lowerLine.startsWith('•') || lowerLine.startsWith('*'))) {
                requirements.push(line.trim());
            }
            if (inRequirementsSection && lowerLine.includes('preferred') || lowerLine.includes('nice to have')) {
                break;
            }
        }
        return requirements;
    }
    isRemoteJob(location, description) {
        const text = `${location} ${description}`.toLowerCase();
        return text.includes('remote') || text.includes('work from home') || text.includes('wfh');
    }
    hasPythonRequirement(description, requirements) {
        const text = `${description} ${requirements.join(' ')}`.toLowerCase();
        return text.includes('python') || text.includes('py');
    }
    isAIMLRelated(title, description) {
        const text = `${title} ${description}`.toLowerCase();
        const aiMlKeywords = [
            'artificial intelligence', 'machine learning', 'deep learning', 'ai', 'ml',
            'data science', 'data scientist', 'ml engineer', 'ai engineer', 'nlp',
            'natural language processing', 'computer vision', 'neural network',
            'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
        ];
        return aiMlKeywords.some(keyword => text.includes(keyword));
    }
    extractPostedDate(element, $) {
        // This would be implemented per scraper as date formats vary
        return new Date().toISOString();
    }
}
//# sourceMappingURL=baseScraper.js.map