#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JobSearchService } from './services/jobSearchService.js';
import { JobFilter } from './types/jobTypes.js';

class JobSearchMCPServer {
  private server: Server;
  private jobSearchService: JobSearchService;

  constructor() {
    this.server = new Server(
      {
        name: 'job-search-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.jobSearchService = new JobSearchService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_ai_ml_jobs',
            description: 'Search for AI/ML internships and full-time roles across multiple job sites',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Job location (e.g., "Remote", "San Francisco, CA", "New York, NY")',
                  default: 'Remote'
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 50
                },
                includeInternships: {
                  type: 'boolean',
                  description: 'Include internship positions',
                  default: true
                },
                includeFullTime: {
                  type: 'boolean',
                  description: 'Include full-time positions',
                  default: true
                },
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Additional keywords to search for (e.g., ["machine learning", "deep learning", "NLP"])',
                  default: []
                }
              },
              required: []
            }
          },
          {
            name: 'search_specific_job_site',
            description: 'Search for jobs on a specific job site',
            inputSchema: {
              type: 'object',
              properties: {
                site: {
                  type: 'string',
                  enum: ['linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'monster'],
                  description: 'Job site to search'
                },
                location: {
                  type: 'string',
                  description: 'Job location',
                  default: 'Remote'
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of results to return',
                  default: 25
                }
              },
              required: ['site']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_ai_ml_jobs':
            return await this.searchAIMLJobs(args);
          case 'search_specific_job_site':
            return await this.searchSpecificJobSite(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async searchAIMLJobs(args: any) {
    const {
      location = 'Remote',
      maxResults = 50,
      includeInternships = true,
      includeFullTime = true,
      keywords = []
    } = args;

    const filter: JobFilter = {
      location,
      maxResults,
      includeInternships,
      includeFullTime,
      keywords,
      experienceLevel: 'entry', // Less than 1 year
      requiredSkills: ['python'],
      jobTypes: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'data science']
    };

    const results = await this.jobSearchService.searchAllSites(filter);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  private async searchSpecificJobSite(args: any) {
    const { site, location = 'Remote', maxResults = 25 } = args;

    const filter: JobFilter = {
      location,
      maxResults,
      includeInternships: true,
      includeFullTime: true,
      keywords: [],
      experienceLevel: 'entry',
      requiredSkills: ['python'],
      jobTypes: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'data science']
    };

    const results = await this.jobSearchService.searchSite(site, filter);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Job Search MCP Server running on stdio');
  }
}

const server = new JobSearchMCPServer();
server.run().catch(console.error);
