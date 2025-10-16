const OpenAI = require('openai');
const axios = require('axios');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Analyze lead data and extract insights
   */
  async analyzeLead(leadData) {
    try {
      const prompt = `
        Analyze the following lead information and provide insights:
        
        Name: ${leadData.name}
        Company: ${leadData.company}
        Job Title: ${leadData.jobTitle}
        Industry: ${leadData.industry}
        Company Size: ${leadData.companySize}
        Website: ${leadData.companyWebsite}
        Description: ${leadData.description || 'No description available'}
        
        Please provide:
        1. Intent level (High/Medium/Low/Unknown) - likelihood to purchase
        2. Pain points they might have
        3. Budget level (High/Medium/Low/Unknown)
        4. Timeline (Immediate/1-3 months/3-6 months/6+ months/Unknown)
        5. Whether they are likely a decision maker (true/false)
        6. Overall sentiment (Positive/Neutral/Negative)
        
        Respond in JSON format only.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
    } catch (error) {
      console.error('Error analyzing lead:', error);
      return {
        intent: 'Unknown',
        painPoints: [],
        budget: 'Unknown',
        timeline: 'Unknown',
        decisionMaker: false,
        sentiment: 'Neutral'
      };
    }
  }

  /**
   * Classify industry based on company description
   */
  async classifyIndustry(companyName, description) {
    try {
      const prompt = `
        Classify the following company into one of these industries:
        Technology, Healthcare, Finance, Education, Manufacturing, Retail, 
        Real Estate, Consulting, Marketing, Legal, Construction, Transportation, 
        Energy, Media, Government, Non-Profit, Agriculture, Hospitality, Sports, Entertainment
        
        Company: ${companyName}
        Description: ${description || 'No description available'}
        
        Respond with only the industry name.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 50
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error classifying industry:', error);
      return 'Technology'; // Default fallback
    }
  }

  /**
   * Generate personalized outreach messages
   */
  async generateOutreachMessage(leadData, userData, messageType = 'email') {
    try {
      const prompt = `
        Generate a personalized ${messageType} message for the following lead:
        
        Lead Information:
        - Name: ${leadData.name}
        - Company: ${leadData.company}
        - Job Title: ${leadData.jobTitle}
        - Industry: ${leadData.industry}
        - Pain Points: ${leadData.aiAnalysis?.painPoints?.join(', ') || 'Unknown'}
        
        Your Information:
        - Name: ${userData.fullName}
        - Company: ${userData.company}
        - Industry: ${userData.industry}
        
        Message Type: ${messageType}
        Tone: Professional but friendly
        Length: 150-200 words
        
        Include:
        1. Personal greeting
        2. Brief introduction
        3. Value proposition relevant to their industry
        4. Clear call-to-action
        5. Professional closing
        
        Make it personalized and avoid generic templates.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating outreach message:', error);
      return 'Unable to generate personalized message at this time.';
    }
  }

  /**
   * Extract contact information from text
   */
  async extractContactInfo(text) {
    try {
      const prompt = `
        Extract contact information from the following text:
        
        ${text}
        
        Please extract and return in JSON format:
        {
          "emails": ["email1@example.com", "email2@example.com"],
          "phones": ["+1234567890", "123-456-7890"],
          "names": ["John Doe", "Jane Smith"],
          "companies": ["Company A", "Company B"],
          "jobTitles": ["CEO", "Marketing Manager"]
        }
        
        If no information is found for a field, return an empty array.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error extracting contact info:', error);
      return {
        emails: [],
        phones: [],
        names: [],
        companies: [],
        jobTitles: []
      };
    }
  }

  /**
   * Generate lead scoring factors
   */
  async generateScoringFactors(leadData) {
    try {
      const prompt = `
        Analyze this lead and provide scoring factors:
        
        Company: ${leadData.company}
        Industry: ${leadData.industry}
        Job Title: ${leadData.jobTitle}
        Company Size: ${leadData.companySize}
        Website: ${leadData.companyWebsite}
        
        Provide scoring factors in JSON format:
        {
          "factors": [
            {
              "factor": "Job Title Relevance",
              "weight": 0.3,
              "value": "High",
              "reason": "Explanation"
            }
          ]
        }
        
        Consider factors like:
        - Job title relevance to decision making
        - Company size and growth potential
        - Industry alignment
        - Contact information completeness
        - Website quality indicators
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 600
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating scoring factors:', error);
      return { factors: [] };
    }
  }

  /**
   * Analyze company website for insights
   */
  async analyzeWebsite(websiteUrl) {
    try {
      // This would typically involve web scraping
      // For now, we'll use a simplified approach
      const prompt = `
        Analyze the company website: ${websiteUrl}
        
        Based on the URL and any available information, provide insights about:
        1. Company maturity (Startup/Growing/Established/Enterprise)
        2. Technology stack indicators
        3. Growth indicators
        4. Industry positioning
        
        Respond in JSON format:
        {
          "maturity": "Startup|Growing|Established|Enterprise",
          "techStack": ["technology1", "technology2"],
          "growthIndicators": ["indicator1", "indicator2"],
          "positioning": "description"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing website:', error);
      return {
        maturity: 'Unknown',
        techStack: [],
        growthIndicators: [],
        positioning: 'Unable to analyze'
      };
    }
  }
}

module.exports = new AIService();
