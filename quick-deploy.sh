#!/bin/bash

# Quick Railway Deployment Script for AI Lead Finder

echo "🚀 AI Lead Finder - Quick Railway Deployment"
echo "============================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please wait for Xcode command line tools to finish installing."
    echo "   Then restart your terminal and run this script again."
    exit 1
fi

echo "✅ Git is available!"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project files found!"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - AI Lead Finder"
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already exists!"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 📝 Create GitHub Repository:"
echo "   - Go to https://github.com/new"
echo "   - Name it 'ai-lead-finder'"
echo "   - Don't initialize with README"
echo "   - Copy the repository URL"
echo ""
echo "2. 🔗 Connect to GitHub:"
echo "   Run these commands (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/ai-lead-finder.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. 🗄️  Set up MongoDB Atlas:"
echo "   - Go to https://www.mongodb.com/atlas"
echo "   - Create free account"
echo "   - Create M0 Sandbox cluster"
echo "   - Create database user"
echo "   - Allow access from anywhere (0.0.0.0/0)"
echo "   - Get connection string"
echo ""
echo "4. 🤖 Get OpenAI API Key:"
echo "   - Go to https://platform.openai.com/api-keys"
echo "   - Create new secret key"
echo "   - Copy the key (starts with sk-)"
echo ""
echo "5. 🚂 Deploy to Railway:"
echo "   - Go to https://railway.app"
echo "   - Login with GitHub"
echo "   - New Project → Deploy from GitHub"
echo "   - Select your repository"
echo "   - Add environment variables (see DEPLOYMENT_CHECKLIST.md)"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo "   - RAILWAY_DEPLOYMENT.md"
echo ""
echo "🎉 Your AI Lead Finder will be live at:"
echo "   https://your-app-name.railway.app"
echo "   https://your-app-name.railway.app/beta"
echo ""
echo "💡 Need help? Check the troubleshooting section in the guides above."

