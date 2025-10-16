const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const aiService = require('./aiService');

class LeadDiscoveryService {
  constructor() {
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (compatible; AI-Lead-Finder/1.0)';
    this.scrapingDelay = parseInt(process.env.SCRAPING_DELAY) || 1000;
  }

  /**
   * Discover leads from LinkedIn (requires API access)
   */
  async discoverFromLinkedIn(searchParams) {
    try {
      const { industry, location, companySize, keywords } = searchParams;
      
      // This would use LinkedIn Sales Navigator API
      // For demo purposes, we'll simulate the response
      const mockLeads = [
        {
          name: 'John Smith',
          company: 'TechCorp Inc',
          jobTitle: 'VP of Engineering',
          industry: industry,
          location: location,
          source: 'LinkedIn',
          sourceUrl: 'https://linkedin.com/in/johnsmith'
        }
      ];

      return mockLeads;
    } catch (error) {
      console.error('Error discovering leads from LinkedIn:', error);
      return [];
    }
  }

  /**
   * Discover leads from company websites
   */
  async discoverFromCompanyWebsites(companies) {
    const leads = [];
    
    for (const company of companies) {
      try {
        const companyLeads = await this.scrapeCompanyWebsite(company);
        leads.push(...companyLeads);
        
        // Add delay to be respectful
        await this.delay(this.scrapingDelay);
      } catch (error) {
        console.error(`Error scraping ${company}:`, error);
      }
    }
    
    return leads;
  }

  /**
   * Scrape individual company website for contact information
   */
  async scrapeCompanyWebsite(companyName) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      await page.setUserAgent(this.userAgent);
      
      // Search for company website
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(companyName + ' official website')}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Extract first result URL
      const firstResult = await page.$eval('h3', el => el.closest('a')?.href);
      
      if (!firstResult) {
        await browser.close();
        return [];
      }
      
      // Visit company website
      await page.goto(firstResult, { waitUntil: 'networkidle2' });
      
      // Extract contact information
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const leads = [];
      
      // Look for team/about pages
      const teamLinks = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().toLowerCase();
        if (href && (text.includes('team') || text.includes('about') || text.includes('leadership'))) {
          teamLinks.push(href);
        }
      });
      
      // Scrape team pages
      for (const link of teamLinks.slice(0, 3)) { // Limit to first 3 team pages
        try {
          const fullUrl = link.startsWith('http') ? link : new URL(link, firstResult).href;
          await page.goto(fullUrl, { waitUntil: 'networkidle2' });
          
          const teamContent = await page.content();
          const teamLeads = this.extractLeadsFromPage(teamContent, companyName);
          leads.push(...teamLeads);
          
          await this.delay(this.scrapingDelay);
        } catch (error) {
          console.error(`Error scraping team page ${link}:`, error);
        }
      }
      
      await browser.close();
      return leads;
    } catch (error) {
      console.error(`Error scraping company website for ${companyName}:`, error);
      return [];
    }
  }

  /**
   * Extract leads from page content
   */
  extractLeadsFromPage(content, companyName) {
    const $ = cheerio.load(content);
    const leads = [];
    
    // Look for name and title patterns
    $('h1, h2, h3, h4, .name, .title, .person').each((i, el) => {
      const text = $(el).text().trim();
      const parent = $(el).parent();
      
      // Extract email from parent or nearby elements
      const emailMatch = parent.html().match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const email = emailMatch ? emailMatch[1] : null;
      
      // Extract phone from parent or nearby elements
      const phoneMatch = parent.html().match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
      const phone = phoneMatch ? phoneMatch[1] : null;
      
      // Try to extract name and title from text
      const nameTitleMatch = text.match(/^([^,]+),\s*(.+)$/);
      if (nameTitleMatch) {
        const name = nameTitleMatch[1].trim();
        const title = nameTitleMatch[2].trim();
        
        if (name && title && (email || phone)) {
          leads.push({
            name,
            jobTitle: title,
            company: companyName,
            email,
            phone,
            source: 'Company Website',
            sourceUrl: window.location?.href || ''
          });
        }
      }
    });
    
    return leads;
  }

  /**
   * Discover leads from industry databases
   */
  async discoverFromIndustryDatabases(industry, location) {
    try {
      // This would integrate with various industry-specific databases
      // For demo purposes, we'll return mock data
      const mockLeads = [
        {
          name: 'Sarah Johnson',
          company: 'HealthTech Solutions',
          jobTitle: 'CTO',
          industry: industry,
          location: location,
          source: 'Industry Database',
          sourceUrl: 'https://industry-db.com/healthtech'
        }
      ];

      return mockLeads;
    } catch (error) {
      console.error('Error discovering leads from industry databases:', error);
      return [];
    }
  }

  /**
   * Discover leads from social media
   */
  async discoverFromSocialMedia(industry, keywords) {
    try {
      // This would use social media APIs (Twitter, Facebook, etc.)
      // For demo purposes, we'll return mock data
      const mockLeads = [
        {
          name: 'Mike Chen',
          company: 'FinTech Innovations',
          jobTitle: 'Head of Product',
          industry: industry,
          source: 'Social Media',
          sourceUrl: 'https://twitter.com/mikechen'
        }
      ];

      return mockLeads;
    } catch (error) {
      console.error('Error discovering leads from social media:', error);
      return [];
    }
  }

  /**
   * Discover leads from news and press releases
   */
  async discoverFromNews(industry, keywords) {
    try {
      const newsApiKey = process.env.NEWS_API_KEY;
      if (!newsApiKey) {
        console.log('News API key not configured');
        return [];
      }

      const query = `${industry} ${keywords.join(' ')}`;
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          apiKey: newsApiKey,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 50
        }
      });

      const leads = [];
      
      for (const article of response.data.articles) {
        // Extract company and contact information from article content
        const extractedInfo = await aiService.extractContactInfo(article.content);
        
        if (extractedInfo.names.length > 0 && extractedInfo.companies.length > 0) {
          for (let i = 0; i < Math.min(extractedInfo.names.length, extractedInfo.companies.length); i++) {
            leads.push({
              name: extractedInfo.names[i],
              company: extractedInfo.companies[i],
              jobTitle: extractedInfo.jobTitles[i] || 'Unknown',
              industry: industry,
              source: 'News',
              sourceUrl: article.url,
              description: article.description
            });
          }
        }
      }

      return leads;
    } catch (error) {
      console.error('Error discovering leads from news:', error);
      return [];
    }
  }

  /**
   * Use Apollo API for lead discovery
   */
  async discoverFromApollo(searchParams) {
    try {
      const apolloApiKey = process.env.APOLLO_API_KEY;
      if (!apolloApiKey) {
        console.log('Apollo API key not configured');
        return [];
      }

      const { industry, location, companySize, keywords } = searchParams;
      
      const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
        q_organization_domains: keywords.join(' '),
        organization_locations: [location],
        organization_num_employees_ranges: [companySize],
        person_titles: ['CEO', 'CTO', 'VP', 'Director', 'Manager'],
        page: 1,
        per_page: 25
      }, {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': apolloApiKey
        }
      });

      const leads = response.data.people.map(person => ({
        name: `${person.first_name} ${person.last_name}`,
        email: person.email,
        phone: person.phone_numbers?.[0]?.sanitized_number,
        company: person.organization?.name,
        jobTitle: person.title,
        industry: industry,
        companySize: person.organization?.estimated_num_employees,
        companyWebsite: person.organization?.website_url,
        source: 'Apollo',
        sourceUrl: person.linkedin_url
      }));

      return leads;
    } catch (error) {
      console.error('Error discovering leads from Apollo:', error);
      return [];
    }
  }

  /**
   * Main lead discovery method that orchestrates all sources
   */
  async discoverLeads(searchParams, userId) {
    const { industry, location, companySize, keywords, sources } = searchParams;
    const allLeads = [];

    try {
      // Discover from different sources based on user preferences
      if (sources.includes('linkedin')) {
        const linkedinLeads = await this.discoverFromLinkedIn(searchParams);
        allLeads.push(...linkedinLeads);
      }

      if (sources.includes('apollo')) {
        const apolloLeads = await this.discoverFromApollo(searchParams);
        allLeads.push(...apolloLeads);
      }

      if (sources.includes('websites')) {
        // Get company list from other sources or user input
        const companies = allLeads.map(lead => lead.company).filter(Boolean);
        const websiteLeads = await this.discoverFromCompanyWebsites(companies);
        allLeads.push(...websiteLeads);
      }

      if (sources.includes('news')) {
        const newsLeads = await this.discoverFromNews(industry, keywords);
        allLeads.push(...newsLeads);
      }

      if (sources.includes('social')) {
        const socialLeads = await this.discoverFromSocialMedia(industry, keywords);
        allLeads.push(...socialLeads);
      }

      if (sources.includes('databases')) {
        const dbLeads = await this.discoverFromIndustryDatabases(industry, location);
        allLeads.push(...dbLeads);
      }

      // Remove duplicates based on email
      const uniqueLeads = this.removeDuplicates(allLeads);

      // Enhance leads with AI analysis
      const enhancedLeads = await this.enhanceLeadsWithAI(uniqueLeads);

      return enhancedLeads;
    } catch (error) {
      console.error('Error in lead discovery:', error);
      throw error;
    }
  }

  /**
   * Remove duplicate leads
   */
  removeDuplicates(leads) {
    const seen = new Set();
    return leads.filter(lead => {
      const key = lead.email || `${lead.name}-${lead.company}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Enhance leads with AI analysis
   */
  async enhanceLeadsWithAI(leads) {
    const enhancedLeads = [];
    
    for (const lead of leads) {
      try {
        // Analyze lead with AI
        const aiAnalysis = await aiService.analyzeLead(lead);
        
        // Generate scoring factors
        const scoringFactors = await aiService.generateScoringFactors(lead);
        
        // Enhance lead with AI insights
        const enhancedLead = {
          ...lead,
          aiAnalysis,
          scoreFactors: scoringFactors.factors,
          discoveredAt: new Date()
        };
        
        enhancedLeads.push(enhancedLead);
        
        // Add delay to respect API limits
        await this.delay(500);
      } catch (error) {
        console.error(`Error enhancing lead ${lead.name}:`, error);
        // Add lead without AI enhancement
        enhancedLeads.push({
          ...lead,
          aiAnalysis: {
            intent: 'Unknown',
            painPoints: [],
            budget: 'Unknown',
            timeline: 'Unknown',
            decisionMaker: false,
            sentiment: 'Neutral'
          },
          scoreFactors: [],
          discoveredAt: new Date()
        });
      }
    }
    
    return enhancedLeads;
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new LeadDiscoveryService();
