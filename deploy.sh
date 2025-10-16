#!/bin/bash

# AI Lead Finder Deployment Script

echo "🚀 AI Lead Finder Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "📦 Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    echo "🔐 Logging into Railway..."
    railway login
    
    # Initialize Railway project
    echo "🏗️  Initializing Railway project..."
    railway init
    
    # Set environment variables
    echo "⚙️  Setting environment variables..."
    read -p "Enter your OpenAI API key: " OPENAI_KEY
    read -p "Enter your JWT secret: " JWT_SECRET
    read -p "Enter your MongoDB URI: " MONGODB_URI
    
    railway variables set OPENAI_API_KEY="$OPENAI_KEY"
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set MONGODB_URI="$MONGODB_URI"
    railway variables set NODE_ENV="production"
    
    # Deploy
    echo "🚀 Deploying to Railway..."
    railway up
    
    echo "✅ Deployment complete! Your app should be live shortly."
    echo "🌐 Check your Railway dashboard for the URL."
}

# Function to deploy to Render
deploy_render() {
    echo "🎨 Deploying to Render..."
    echo ""
    echo "📋 Manual steps for Render deployment:"
    echo "1. Go to https://render.com"
    echo "2. Sign up/Login with GitHub"
    echo "3. Click 'New +' → 'Web Service'"
    echo "4. Connect your GitHub repository"
    echo "5. Configure:"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Environment: Node"
    echo "6. Add environment variables:"
    echo "   - OPENAI_API_KEY"
    echo "   - JWT_SECRET"
    echo "   - MONGODB_URI"
    echo "   - NODE_ENV=production"
    echo "7. Deploy!"
    echo ""
    echo "💡 Render will automatically deploy on every git push to main branch."
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "🟣 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "📦 Please install Heroku CLI first:"
        echo "   https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Login to Heroku
    echo "🔐 Logging into Heroku..."
    heroku login
    
    # Create Heroku app
    read -p "Enter your Heroku app name: " APP_NAME
    heroku create $APP_NAME
    
    # Add MongoDB addon
    echo "🗄️  Adding MongoDB addon..."
    heroku addons:create mongolab:sandbox
    
    # Set environment variables
    echo "⚙️  Setting environment variables..."
    read -p "Enter your OpenAI API key: " OPENAI_KEY
    read -p "Enter your JWT secret: " JWT_SECRET
    
    heroku config:set OPENAI_API_KEY="$OPENAI_KEY"
    heroku config:set JWT_SECRET="$JWT_SECRET"
    heroku config:set NODE_ENV="production"
    
    # Deploy
    echo "🚀 Deploying to Heroku..."
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    
    echo "✅ Deployment complete!"
    echo "🌐 Your app is live at: https://$APP_NAME.herokuapp.com"
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    
    # Build Docker image
    echo "🏗️  Building Docker image..."
    docker build -t ai-lead-finder .
    
    # Run Docker container
    echo "🚀 Starting Docker container..."
    docker run -d -p 3000:3000 \
        -e OPENAI_API_KEY="$OPENAI_API_KEY" \
        -e JWT_SECRET="$JWT_SECRET" \
        -e MONGODB_URI="$MONGODB_URI" \
        -e NODE_ENV="production" \
        --name ai-lead-finder \
        ai-lead-finder
    
    echo "✅ Docker deployment complete!"
    echo "🌐 Your app is running at: http://localhost:3000"
}

# Function to setup MongoDB Atlas
setup_mongodb() {
    echo "🗄️  Setting up MongoDB Atlas..."
    echo ""
    echo "📋 Steps to set up MongoDB Atlas:"
    echo "1. Go to https://www.mongodb.com/atlas"
    echo "2. Sign up for a free account"
    echo "3. Create a new cluster (free tier)"
    echo "4. Create a database user"
    echo "5. Whitelist all IPs (0.0.0.0/0) for beta testing"
    echo "6. Get your connection string"
    echo "7. Use the connection string as MONGODB_URI"
    echo ""
    echo "💡 Example connection string:"
    echo "mongodb+srv://username:password@cluster.mongodb.net/ai-lead-finder"
}

# Main menu
echo "Choose your deployment option:"
echo "1) Railway (Recommended - Easiest)"
echo "2) Render (Free tier with auto-deploy)"
echo "3) Heroku (Classic platform)"
echo "4) Docker (Local/self-hosted)"
echo "5) Setup MongoDB Atlas"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_render
        ;;
    3)
        deploy_heroku
        ;;
    4)
        deploy_docker
        ;;
    5)
        setup_mongodb
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📚 For more details, see DEPLOYMENT.md"
echo "🐛 Need help? Check the troubleshooting section in the README"

