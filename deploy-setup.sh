#!/bin/bash

# Deployment Setup Script for Free Platforms

echo "🚀 NASA Weather App - Free Deployment Setup"
echo "============================================="

# Function to switch to full dependencies
setup_full_deps() {
    echo "📦 Switching to full dependencies..."
    cp requirements-full.txt requirements.txt
    echo "✅ Full dependencies activated (pandas, numpy, scipy, etc.)"
}

# Function to switch to minimal dependencies  
setup_minimal_deps() {
    echo "📦 Switching to minimal dependencies..."
    cp requirements-minimal.txt requirements.txt
    echo "✅ Minimal dependencies activated (Vercel compatible)"
}

# Function to setup for Render
setup_render() {
    setup_full_deps
    echo "🎯 Setting up for Render deployment..."
    echo "1. Go to https://render.com"
    echo "2. Connect GitHub repository: sujithputta02/NSAC-2025bluesoft"
    echo "3. Create Web Service with Docker"
    echo "4. Add environment variables from FREE_DEPLOYMENT_GUIDE.md"
    echo "5. Deploy!"
}

# Function to setup for Railway
setup_railway() {
    setup_full_deps
    echo "🚂 Setting up for Railway deployment..."
    echo "1. Go to https://railway.app"
    echo "2. Connect GitHub repository"
    echo "3. Railway will auto-detect railway.json"
    echo "4. Add environment variables"
    echo "5. Deploy!"
}

# Function to setup for Fly.io
setup_fly() {
    setup_full_deps
    echo "🪰 Setting up for Fly.io deployment..."
    echo "1. Install Fly CLI: curl -L https://fly.io/install.sh | sh"
    echo "2. Run: fly auth login"
    echo "3. Run: fly launch --dockerfile"
    echo "4. Run: fly deploy"
}

# Function to setup for Vercel (minimal)
setup_vercel() {
    setup_minimal_deps
    echo "▲ Setting up for Vercel deployment..."
    echo "1. Go to https://vercel.com"
    echo "2. Connect GitHub repository"
    echo "3. Add environment variables"
    echo "4. Deploy (limited functionality due to 250MB limit)"
}

# Main menu
echo ""
echo "Choose your deployment platform:"
echo "1) Render (Free, Recommended)"
echo "2) Railway (Free trial)"
echo "3) Fly.io (Free tier)"
echo "4) Vercel (Free, limited functionality)"
echo "5) Just switch to full dependencies"
echo "6) Just switch to minimal dependencies"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        setup_render
        ;;
    2)
        setup_railway
        ;;
    3)
        setup_fly
        ;;
    4)
        setup_vercel
        ;;
    5)
        setup_full_deps
        ;;
    6)
        setup_minimal_deps
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📋 Next steps:"
echo "1. Review the changes: git diff"
echo "2. Commit changes: git add . && git commit -m 'Setup for deployment'"
echo "3. Push to GitHub: git push origin main"
echo "4. Follow the platform-specific instructions above"
echo ""
echo "🎉 Your NASA Weather App is ready for deployment!"