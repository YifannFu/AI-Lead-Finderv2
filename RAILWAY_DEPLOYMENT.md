# Railway Deployment Guide - Step by Step

## 🚂 Deploy AI Lead Finder to Railway

Railway is the easiest platform to deploy your AI Lead Finder. Here's exactly what you need to do:

## Prerequisites

1. **GitHub Account** (free)
2. **Railway Account** (free)
3. **OpenAI API Key** (get from openai.com)
4. **MongoDB Atlas Account** (free)

## Step 1: Prepare Your Code

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - AI Lead Finder"
```

### 1.2 Push to GitHub
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it `ai-lead-finder` (or whatever you prefer)
3. Don't initialize with README (since you already have files)
4. Copy the repository URL
5. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-lead-finder.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up MongoDB Atlas (Free Database)

### 2.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free
3. Create a new project called "AI Lead Finder"

### 2.2 Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Choose a cloud provider (AWS recommended)
4. Choose a region close to you
5. Name your cluster (e.g., "ai-lead-finder-cluster")
6. Click "Create Cluster"

### 2.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Under "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

### 2.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 2.5 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `ai-lead-finder`

**Example connection string:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/ai-lead-finder?retryWrites=true&w=majority
```

## Step 3: Get OpenAI API Key

### 3.1 Create OpenAI Account
1. Go to [OpenAI.com](https://openai.com)
2. Sign up for an account
3. Add a payment method (required for API access)

### 3.2 Get API Key
1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "AI Lead Finder"
4. Copy the key (starts with `sk-`)

## Step 4: Deploy to Railway

### 4.1 Sign Up for Railway
1. Go to [Railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### 4.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `ai-lead-finder` repository
4. Click "Deploy Now"

### 4.3 Configure Environment Variables
1. Click on your deployed project
2. Go to the "Variables" tab
3. Add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/ai-lead-finder?retryWrites=true&w=majority
OPENAI_API_KEY=sk-your-openai-key-here
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters-long
ENCRYPTION_KEY=your-encryption-key-here
CLIENT_URL=https://your-app-name.railway.app
```

**Important:** Replace the placeholder values with your actual values!

### 4.4 Deploy
1. Railway will automatically detect your Node.js app
2. It will run `npm install` and `npm start`
3. Wait for deployment to complete (2-3 minutes)
4. Click on the generated URL to access your app

## Step 5: Test Your Deployment

### 5.1 Check Health
Visit: `https://your-app-name.railway.app/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 5.2 Access Your App
- **Main App:** `https://your-app-name.railway.app`
- **Beta Landing Page:** `https://your-app-name.railway.app/beta`

### 5.3 Test Registration
1. Go to your app URL
2. Click "Sign up"
3. Create a test account
4. Try discovering some leads

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Buy a Domain
- Use Namecheap, GoDaddy, or any domain registrar
- Popular options: `.com`, `.app`, `.ai`

### 6.2 Configure DNS
1. In Railway, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Railway will provide DNS records to add to your domain registrar

### 6.3 SSL Certificate
Railway automatically provides free SSL certificates for custom domains!

## Troubleshooting

### Common Issues:

**1. App won't start**
- Check environment variables are set correctly
- Check Railway logs for errors
- Ensure MongoDB connection string is correct

**2. Database connection failed**
- Verify MongoDB Atlas cluster is running
- Check network access allows all IPs (0.0.0.0/0)
- Verify username/password in connection string

**3. OpenAI API errors**
- Check API key is correct
- Ensure you have credits in your OpenAI account
- Verify API key has proper permissions

**4. CORS errors**
- Update CLIENT_URL environment variable
- Check if you're accessing the correct URL

### Getting Help:
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check Railway logs in the dashboard

## Cost Breakdown

**Railway Free Tier:**
- 500 hours of usage per month
- $5 credit included
- Perfect for beta testing

**Estimated Monthly Costs:**
- Railway: $0 (free tier)
- MongoDB Atlas: $0 (free tier)
- OpenAI API: ~$10-20 (depending on usage)
- Domain: ~$10-15/year (optional)

**Total: ~$10-20/month for beta**

## Next Steps After Deployment

1. **Test all features** thoroughly
2. **Set up monitoring** (Railway provides basic monitoring)
3. **Create user documentation**
4. **Announce your beta** on social media
5. **Collect user feedback**
6. **Iterate and improve**

## Pro Tips

1. **Use Railway's built-in metrics** to monitor performance
2. **Set up alerts** for downtime
3. **Use Railway's preview deployments** for testing
4. **Keep your GitHub repo updated** for automatic deployments
5. **Monitor your OpenAI usage** to control costs

---

**Your AI Lead Finder will be live at:** `https://your-app-name.railway.app`

**Beta landing page:** `https://your-app-name.railway.app/beta`

🎉 **Congratulations! Your AI Lead Finder is now live on the internet!**

