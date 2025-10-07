@echo off
echo 🚀 NASA Weather App - Free Deployment Setup
echo =============================================

:menu
echo.
echo Choose your deployment platform:
echo 1) Render (Free, Recommended)
echo 2) Railway (Free trial)
echo 3) Fly.io (Free tier)
echo 4) Vercel (Free, limited functionality)
echo 5) Just switch to full dependencies
echo 6) Just switch to minimal dependencies
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto render
if "%choice%"=="2" goto railway
if "%choice%"=="3" goto fly
if "%choice%"=="4" goto vercel
if "%choice%"=="5" goto full_deps
if "%choice%"=="6" goto minimal_deps
goto invalid

:render
call :setup_full_deps
echo 🎯 Setting up for Render deployment...
echo 1. Go to https://render.com
echo 2. Connect GitHub repository: sujithputta02/NSAC-2025bluesoft
echo 3. Create Web Service with Docker
echo 4. Add environment variables from FREE_DEPLOYMENT_GUIDE.md
echo 5. Deploy!
goto end

:railway
call :setup_full_deps
echo 🚂 Setting up for Railway deployment...
echo 1. Go to https://railway.app
echo 2. Connect GitHub repository
echo 3. Railway will auto-detect railway.json
echo 4. Add environment variables
echo 5. Deploy!
goto end

:fly
call :setup_full_deps
echo 🪰 Setting up for Fly.io deployment...
echo 1. Install Fly CLI from https://fly.io/docs/hands-on/install-flyctl/
echo 2. Run: fly auth login
echo 3. Run: fly launch --dockerfile
echo 4. Run: fly deploy
goto end

:vercel
call :setup_minimal_deps
echo ▲ Setting up for Vercel deployment...
echo 1. Go to https://vercel.com
echo 2. Connect GitHub repository
echo 3. Add environment variables
echo 4. Deploy (limited functionality due to 250MB limit)
goto end

:full_deps
call :setup_full_deps
goto end

:minimal_deps
call :setup_minimal_deps
goto end

:setup_full_deps
echo 📦 Switching to full dependencies...
copy requirements-full.txt requirements.txt >nul
echo ✅ Full dependencies activated (pandas, numpy, scipy, etc.)
exit /b

:setup_minimal_deps
echo 📦 Switching to minimal dependencies...
copy requirements-minimal.txt requirements.txt >nul
echo ✅ Minimal dependencies activated (Vercel compatible)
exit /b

:invalid
echo ❌ Invalid choice. Please run the script again.
pause
exit /b

:end
echo.
echo 📋 Next steps:
echo 1. Review the changes: git diff
echo 2. Commit changes: git add . ^&^& git commit -m "Setup for deployment"
echo 3. Push to GitHub: git push origin main
echo 4. Follow the platform-specific instructions above
echo.
echo 🎉 Your NASA Weather App is ready for deployment!
pause