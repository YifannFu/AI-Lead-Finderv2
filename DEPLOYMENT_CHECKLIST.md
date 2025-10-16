# 🚀 Railway Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Install Prerequisites
- [ ] **Xcode Command Line Tools** (installing now...)
- [ ] **Node.js** (if not installed: https://nodejs.org)
- [ ] **Git** (comes with Xcode tools)

### 2. Create Accounts (Free)
- [ ] **GitHub Account**: https://github.com/signup
- [ ] **Railway Account**: https://railway.app (sign up with GitHub)
- [ ] **MongoDB Atlas**: https://www.mongodb.com/atlas (free tier)
- [ ] **OpenAI Account**: https://openai.com (add payment method)

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Code
```bash
# After Xcode tools finish installing, run:
git init
git add .
git commit -m "Initial commit - AI Lead Finder"
```

### Step 2: Push to GitHub
1. Go to https://github.com/new
2. Create repository named `ai-lead-finder`
3. Don't initialize with README
4. Copy the repository URL
5. Run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-lead-finder.git
git branch -M main
git push -u origin main
```

### Step 3: Set Up MongoDB Atlas
1. Go to https://www.mongodb.com/atlas
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string

### Step 4: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-`)

### Step 5: Deploy to Railway
1. Go to https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
   CLIENT_URL=https://your-app-name.railway.app
   ```

## 🎯 Your App URLs
- **Main App**: `https://your-app-name.railway.app`
- **Beta Landing**: `https://your-app-name.railway.app/beta`
- **Health Check**: `https://your-app-name.railway.app/api/health`

## 💰 Estimated Costs
- **Railway**: $0 (free tier)
- **MongoDB**: $0 (free tier)
- **OpenAI**: ~$10-20/month
- **Domain**: ~$10-15/year (optional)

## 🚨 Common Issues & Solutions

### "Command not found: git"
- Wait for Xcode tools to finish installing
- Restart terminal after installation

### "MongoDB connection failed"
- Check connection string format
- Ensure network access allows all IPs
- Verify username/password

### "OpenAI API error"
- Check API key is correct
- Ensure payment method is added
- Verify you have credits

### "App won't start"
- Check Railway logs
- Verify all environment variables are set
- Ensure package.json is correct

## 📞 Need Help?
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Check Railway dashboard logs

---

**⏱️ Total Time: ~30 minutes**
**🎉 Result: Your AI Lead Finder live on the internet!**

