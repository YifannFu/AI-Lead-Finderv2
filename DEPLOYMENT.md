# Deployment Guide - AI Lead Finder

This guide covers multiple deployment options for making your AI Lead Finder available on the internet for open beta testing.

## 🚀 Quick Deployment Options

### 1. Railway (Recommended for Beginners)
**Easiest option with automatic deployments**

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Add environment variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-lead-finder
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your_secure_secret
   NODE_ENV=production
   ```
4. **Deploy!** Railway automatically builds and deploys

**Cost:** Free tier available, then ~$5/month

### 2. Render (Great for Full-Stack Apps)
**Free tier with automatic SSL**

1. **Sign up at [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repo**
4. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
5. **Add environment variables**
6. **Deploy!**

**Cost:** Free tier available, then ~$7/month

### 3. Heroku (Classic Choice)
**Well-established platform**

1. **Install Heroku CLI**
2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```
3. **Add MongoDB addon:**
   ```bash
   heroku addons:create mongolab:sandbox
   ```
4. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set JWT_SECRET=your_secret
   ```
5. **Deploy:**
   ```bash
   git push heroku main
   ```

**Cost:** No free tier anymore, starts at ~$7/month

## 🐳 Docker Deployment (Advanced)

### Using Docker Compose
```bash
# Clone your repo on a VPS
git clone your-repo-url
cd ai-lead-finder

# Edit docker-compose.yml with your environment variables
# Then deploy
docker-compose up -d
```

### VPS Options:
- **DigitalOcean Droplet** ($5/month)
- **Linode** ($5/month)
- **AWS EC2** (pay-as-you-go)
- **Google Cloud Platform**

## ☁️ Cloud Platform Deployment

### AWS (Most Scalable)
1. **Use AWS Elastic Beanstalk**
2. **Set up RDS for MongoDB**
3. **Configure environment variables**
4. **Deploy via CLI or console**

### Google Cloud Platform
1. **Use Cloud Run** (serverless)
2. **Set up Cloud SQL or MongoDB Atlas**
3. **Deploy with Cloud Build**

### Microsoft Azure
1. **Use App Service**
2. **Set up Cosmos DB or MongoDB Atlas**
3. **Deploy via Azure CLI**

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.production` file:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-lead-finder
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_very_secure_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Database Setup
**Option A: MongoDB Atlas (Recommended)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Whitelist all IPs (0.0.0.0/0) for beta

**Option B: Railway/Render MongoDB addons**

### 3. Security Updates
```javascript
// Add to src/index.js
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
}
```

## 📱 Beta Testing Setup

### 1. Create Beta Landing Page
```html
<!-- Add to public/index.html -->
<div id="beta-banner" class="alert alert-info">
  <h4>🚀 Open Beta Testing</h4>
  <p>Welcome to AI Lead Finder Beta! Help us improve by reporting bugs and providing feedback.</p>
  <a href="mailto:feedback@yourdomain.com" class="btn btn-outline-primary">Send Feedback</a>
</div>
```

### 2. Add User Feedback System
```javascript
// Add to public/js/app.js
function showFeedbackModal() {
  // Create feedback form modal
  const modal = `
    <div class="modal fade" id="feedbackModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Beta Feedback</h5>
          </div>
          <div class="modal-body">
            <form id="feedback-form">
              <div class="mb-3">
                <label>What's working well?</label>
                <textarea class="form-control" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label>What needs improvement?</label>
                <textarea class="form-control" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label>Bug reports</label>
                <textarea class="form-control" rows="3"></textarea>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modal);
}
```

### 3. Add Analytics
```html
<!-- Add to public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🌐 Domain and SSL Setup

### 1. Custom Domain
1. **Buy domain** (Namecheap, GoDaddy, etc.)
2. **Point DNS** to your deployment platform
3. **Configure SSL** (most platforms do this automatically)

### 2. Free SSL Options
- **Let's Encrypt** (free SSL certificates)
- **Cloudflare** (free SSL + CDN)
- **Platform SSL** (Railway, Render provide free SSL)

## 📊 Monitoring and Analytics

### 1. Application Monitoring
```javascript
// Add to src/index.js
const morgan = require('morgan');
app.use(morgan('combined'));

// Error tracking
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Send to monitoring service
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Send to monitoring service
});
```

### 2. Performance Monitoring
- **New Relic** (free tier)
- **DataDog** (free tier)
- **Sentry** (error tracking)

## 🚀 Quick Start Commands

### For Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### For Render:
```bash
# Connect GitHub repo in Render dashboard
# Set environment variables
# Deploy automatically on git push
```

### For Heroku:
```bash
heroku create your-app-name
heroku addons:create mongolab:sandbox
heroku config:set OPENAI_API_KEY=your_key
git push heroku main
```

## 💰 Cost Breakdown

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Railway | ✅ | $5/month | Beginners |
| Render | ✅ | $7/month | Full-stack |
| Heroku | ❌ | $7/month | Established |
| DigitalOcean | ❌ | $5/month | Control |
| AWS | ❌ | Pay-per-use | Scale |

## 🔒 Security Considerations

1. **Environment Variables**: Never commit API keys
2. **Rate Limiting**: Already implemented
3. **CORS**: Configure for your domain
4. **Input Validation**: Sanitize all inputs
5. **HTTPS**: Always use SSL in production

## 📈 Scaling for Beta

1. **Start Small**: Use free tiers initially
2. **Monitor Usage**: Track API calls and database usage
3. **Scale Gradually**: Upgrade as needed
4. **Cache Responses**: Implement Redis for caching
5. **CDN**: Use Cloudflare for static assets

## 🎯 Beta Launch Checklist

- [ ] Deploy to chosen platform
- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Set up monitoring
- [ ] Create beta landing page
- [ ] Add feedback system
- [ ] Set up analytics
- [ ] Test all features
- [ ] Create user documentation
- [ ] Announce beta launch

## 📞 Support and Maintenance

1. **Monitor Logs**: Check application logs regularly
2. **Update Dependencies**: Keep packages updated
3. **Backup Database**: Regular backups
4. **User Support**: Set up support channels
5. **Bug Tracking**: Use GitHub Issues or Jira

---

**Recommended for Open Beta: Railway or Render** - Both offer free tiers, automatic deployments, and are beginner-friendly!

