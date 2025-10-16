# AI Lead Finder

An intelligent lead generation application that leverages various AI technologies to discover and analyze high-quality leads across different industries.

## Features

### 🤖 AI-Powered Lead Discovery
- **Multi-Source Discovery**: LinkedIn, Apollo, company websites, news, and social media
- **Industry Classification**: Automatic categorization using AI
- **Lead Scoring**: Intelligent scoring based on multiple factors
- **Contact Information Extraction**: Automated extraction from various sources

### 📊 Advanced Analytics
- **Performance Dashboard**: Real-time metrics and KPIs
- **Conversion Funnel**: Track leads through the sales pipeline
- **Industry Analysis**: Performance breakdown by industry
- **Source Performance**: Track effectiveness of different lead sources

### 🎯 Smart Lead Management
- **AI Analysis**: Intent detection, pain point identification, budget assessment
- **Personalized Outreach**: AI-generated personalized messages
- **Lead Scoring**: Automatic scoring based on multiple criteria
- **Status Tracking**: Complete lead lifecycle management

### 📈 Export & Integration
- **Multiple Export Formats**: CSV, JSON exports
- **CRM Integration**: Ready for integration with popular CRMs
- **API Access**: RESTful API for custom integrations
- **Real-time Updates**: WebSocket support for live updates

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **OpenAI GPT-4** for AI analysis
- **Puppeteer** for web scraping
- **Socket.io** for real-time updates
- **JWT** for authentication

### Frontend
- **HTML5/CSS3** with Bootstrap 5
- **Vanilla JavaScript** (ES6+)
- **Chart.js** for data visualization
- **Responsive Design** for all devices

### AI Services
- **OpenAI GPT-4**: Lead analysis and content generation
- **Custom AI Models**: Industry classification and scoring
- **Natural Language Processing**: Text analysis and extraction

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-lead-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-lead-finder
   
   # AI Services
   OPENAI_API_KEY=your_openai_api_key_here
   
   # External APIs (Optional)
   LINKEDIN_API_KEY=your_linkedin_api_key
   APOLLO_API_KEY=your_apollo_api_key
   HUNTER_API_KEY=your_hunter_api_key
   
   # Security
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Usage

### Getting Started

1. **Create an Account**
   - Register with your company information
   - Select your industry and preferences

2. **Configure Lead Discovery**
   - Set target industries and company sizes
   - Choose data sources (LinkedIn, Apollo, etc.)
   - Define keywords and search criteria

3. **Discover Leads**
   - Use the discovery interface to find new leads
   - AI will automatically analyze and score leads
   - Review and manage discovered leads

4. **Analyze and Engage**
   - Use AI analysis to understand lead intent
   - Generate personalized outreach messages
   - Track lead progression through your pipeline

### API Usage

The application provides a RESTful API for programmatic access:

```javascript
// Discover leads
POST /api/leads/discover
{
  "industry": "Technology",
  "location": "San Francisco, CA",
  "companySize": "51-200",
  "keywords": ["SaaS", "AI", "cloud"],
  "sources": ["linkedin", "apollo", "websites"]
}

// Get leads with filtering
GET /api/leads?industry=Technology&status=New&page=1&limit=20

// Analyze a lead
POST /api/leads/:id/analyze

// Export leads
GET /api/export/leads/csv?industry=Technology
```

## Configuration

### AI Services

#### OpenAI Configuration
```env
OPENAI_API_KEY=your_api_key_here
```

#### External APIs (Optional)
```env
# LinkedIn Sales Navigator API
LINKEDIN_API_KEY=your_linkedin_api_key

# Apollo.io API
APOLLO_API_KEY=your_apollo_api_key

# Hunter.io for email verification
HUNTER_API_KEY=your_hunter_api_key

# News API for lead discovery
NEWS_API_KEY=your_news_api_key
```

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/ai-lead-finder
```

### Security Configuration
```env
JWT_SECRET=your_secure_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## Lead Discovery Sources

### 1. LinkedIn
- Sales Navigator API integration
- Company and contact information
- Job titles and industry data

### 2. Apollo.io
- Comprehensive contact database
- Company information and metrics
- Email and phone verification

### 3. Company Websites
- Automated web scraping
- Team page analysis
- Contact information extraction

### 4. News & Press Releases
- Industry news monitoring
- Company announcements
- Executive mentions

### 5. Social Media
- Twitter and Facebook APIs
- Industry discussions
- Professional networks

## AI Analysis Features

### Lead Scoring
- **Intent Analysis**: Purchase likelihood assessment
- **Budget Evaluation**: Budget level estimation
- **Timeline Assessment**: Decision timeline prediction
- **Decision Maker Identification**: Authority level detection

### Content Generation
- **Personalized Outreach**: Custom email and message generation
- **Industry-Specific Messaging**: Tailored communication
- **Pain Point Analysis**: Problem identification
- **Value Proposition**: Customized value statements

## Analytics & Reporting

### Dashboard Metrics
- Total leads discovered
- Qualification rates
- Source performance
- Industry distribution
- Conversion funnel

### Export Options
- CSV export with custom fields
- JSON export for API integration
- Analytics reports
- Performance summaries

## Security & Privacy

### Data Protection
- Encrypted data storage
- Secure API endpoints
- JWT authentication
- Rate limiting

### Privacy Compliance
- GDPR compliant data handling
- User consent management
- Data retention policies
- Secure data deletion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Upcoming Features
- [ ] Advanced CRM integrations
- [ ] Machine learning model improvements
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting and quotas
- [ ] Advanced lead enrichment
- [ ] Automated follow-up sequences

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added advanced analytics
- **v1.2.0**: Enhanced AI analysis
- **v2.0.0**: Multi-source integration

---

Built with ❤️ using AI and modern web technologies.
