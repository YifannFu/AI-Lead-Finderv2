#!/bin/bash

# AI Lead Finder Setup Script

echo "🚀 Setting up AI Lead Finder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    echo "   Or use a package manager like Homebrew:"
    echo "   brew install node"
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB:"
    echo "   Visit: https://www.mongodb.com/try/download/community"
    echo "   Or use Homebrew:"
    echo "   brew tap mongodb/brew"
    echo "   brew install mongodb-community"
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
fi

# Create temp directory
mkdir -p temp

# Create logs directory
mkdir -p logs

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start MongoDB: mongod"
echo "3. Run the application: npm run dev"
echo ""
echo "📚 For more information, see README.md"
