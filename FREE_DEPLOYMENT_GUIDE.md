# Free Backend Deployment Guide

## 🆓 **Best Free Options for Your NASA Weather App**

### **1. Render (Recommended - 100% Free)**

#### Why Render?
- ✅ **Completely free** web services
- ✅ **No size limits** - all your dependencies work
- ✅ **Auto-deploy** from GitHub
- ✅ **Docker support** 
- ✅ **Always HTTPS**
- ⚠️ **Cold starts** after 15min inactivity (normal for free tiers)

#### Deploy to Render:
1. **Go to [render.com](https://render.com)**
2. **Sign up** with GitHub
3. **New → Web Service**
4. **Connect repository**: `sujithputta02/NSAC-2025bluesoft`
5. **Configuration**:
   - **Name**: `nsac-weather-app`
   - **Environment**: `Docker`
   - **Plan**: `Free`
   - **Dockerfile Path**: `./Dockerfile`
6. **Add Environment Variables** (see below)
7. **Create Web Service**

#### Environment Variables for Render:
```
NASA_EARTHDATA_USERNAME = sujithputta
NASA_EARTHDATA_PASSWORD = Nasa@12345t$
METEOMATICS_USERNAME = kakarla_vikas
METEOMATICS_PASSWORD = mW07QKj9y7ApKf23Ep43
METEOMATICS_CUTOFF = 2025-10-12T23:59:59Z
NASA_POWER_START = 19900101
NASA_POWER_END = 20241231
METEOMATICS_START = 1990-01-01T00:00:00Z
METEOMATICS_END = 2024-12-31T00:00:00Z
```

### **2. Fly.io (Free Tier)**

#### Deploy to Fly.io:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch --dockerfile
fly deploy
```

### **3. Koyeb (Free Tier)**

#### Deploy to Koyeb:
1. Go to [koyeb.com](https://koyeb.com)
2. Connect GitHub repository
3. Select Docker deployment
4. Use free tier (1 service)

### **4. Cyclic (Free Tier)**

#### Deploy to Cyclic:
1. Go to [cyclic.sh](https://cyclic.sh)
2. Connect GitHub
3. Auto-deploy FastAPI app

## 🔄 **Switch to Full Dependencies**

Before deploying to any free platform, switch to full dependencies:

```bash
# Use full requirements with all dependencies
cp requirements-full.txt requirements.txt
git add requirements.txt
git commit -m "Switch to full dependencies for free deployment"
git push origin main
```

## 📊 **Platform Comparison**

| Platform | Free Tier | Size Limit | Cold Starts | Setup Difficulty |
|----------|-----------|------------|-------------|------------------|
| **Render** | ✅ Yes | ❌ None | ⚠️ 15min | 🟢 Easy |
| **Fly.io** | ✅ Yes | ❌ None | ⚠️ Variable | 🟡 Medium |
| **Koyeb** | ✅ Yes | ❌ None | ✅ None | 🟢 Easy |
| **Cyclic** | ✅ Yes | ⚠️ Some | ⚠️ Yes | 🟢 Easy |
| **Railway** | ⚠️ Trial | ❌ None | ✅ None | 🟢 Easy |
| **Vercel** | ✅ Yes | ❌ 250MB | ✅ None | 🟢 Easy |

## 🎯 **Recommended Deployment Flow**

### **Step 1: Prepare Full Dependencies**
```bash
cp requirements-full.txt requirements.txt
```

### **Step 2: Deploy to Render (Easiest)**
1. Go to render.com
2. Connect GitHub repo
3. Use Docker deployment
4. Add environment variables
5. Deploy!

### **Step 3: Update Frontend**
Update your frontend to point to the new backend URL:
```bash
# In .env or .env.production
VITE_BACKEND_URL=https://your-app-name.onrender.com
```

## 🔧 **Files Ready for Deployment**

- ✅ `Dockerfile` - Works with all platforms
- ✅ `render.yaml` - Render configuration
- ✅ `railway.json` - Railway configuration  
- ✅ `requirements-full.txt` - All dependencies
- ✅ Environment variables documented

## 🚀 **Next Steps**

1. **Choose platform** (Render recommended)
2. **Switch to full dependencies**
3. **Deploy backend**
4. **Update frontend URL**
5. **Test full functionality**

Your NASA weather app will have all features working with pandas, numpy, scipy, and all NASA data integration!