# Render Deployment Guide - NASA Weather API

## 🚀 **Deploy Your Full-Stack App to Render (100% Free)**

Render is perfect for your NASA weather analysis app because:
- ✅ **Completely free** for web services
- ✅ **No size limits** - all your pandas/numpy/scipy dependencies work
- ✅ **Docker support** - uses your optimized Dockerfile
- ✅ **Auto-deploy** from GitHub
- ✅ **Custom domains** and HTTPS included

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**
Your repo is already configured with:
- ✅ `Dockerfile` - Optimized for Render
- ✅ `render.yaml` - Complete configuration
- ✅ `requirements.txt` - Full dependencies restored
- ✅ All environment variables pre-configured

### **Step 2: Deploy to Render**

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect Repository**: 
   - Select `sujithputta02/NSAC-2025bluesoft`
   - Branch: `main`
5. **Configure Service**:
   - **Name**: `nsac-weather-api`
   - **Environment**: `Docker`
   - **Plan**: `Free`
   - **Region**: `Oregon` (or closest to you)

### **Step 3: Environment Variables (Auto-configured)**
Render will automatically use the `render.yaml` file, but you can also set manually:

```
NASA_EARTHDATA_USERNAME = sujithputta
NASA_EARTHDATA_PASSWORD = Nasa@12345t$
METEOMATICS_USERNAME = kakarla_vikas
METEOMATICS_PASSWORD = mW07QKj9y7ApKf23Ep43
METEOMATICS_CUTOFF = 2025-10-12T23:59:59Z
NASA_POWER_START = 19900101
NASA_POWER_END = 20241231
```

### **Step 4: Deploy**
1. **Click "Create Web Service"**
2. **Wait for build** (5-10 minutes first time)
3. **Your API will be live** at `https://nsac-weather-api.onrender.com`

## 🔍 **Verify Deployment**

After deployment, test these endpoints:

### **Health Check**
```
GET https://your-app.onrender.com/
```
Should return: `{"message": "Will It Rain On My Parade? - NASA Backend API", "status": "running"}`

### **Weather Analysis**
```
POST https://your-app.onrender.com/analyze
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "event_date": "2025-07-04",
  "thresholds": {
    "hot_temp": 32.0,
    "cold_temp": 0.0,
    "precipitation": 5.0,
    "wind_speed": 15.0
  }
}
```

### **Geocoding Proxy**
```
GET https://your-app.onrender.com/proxy/geocode?name=New York
```

## 🎯 **Frontend Integration**

Update your frontend to use the Render backend:

### **Option 1: Environment Variable**
Set in your frontend deployment:
```
VITE_BACKEND_URL=https://your-app.onrender.com
```

### **Option 2: Deploy Frontend to Vercel**
1. Keep frontend on Vercel (fast CDN)
2. Backend on Render (no size limits)
3. Update CORS in backend to allow Vercel domain

## 📊 **What You Get with Render Free Tier**

- ✅ **750 hours/month** (always-on if you have traffic)
- ✅ **512 MB RAM** (sufficient for your app)
- ✅ **Unlimited bandwidth**
- ✅ **Custom domains** with SSL
- ✅ **Auto-deploy** from GitHub
- ✅ **Build logs** and monitoring
- ⚠️ **Spins down after 15 min** of inactivity (cold starts ~30 seconds)

## 🔧 **Optimization Tips**

### **Keep Service Warm** (Optional)
Use a service like UptimeRobot to ping your API every 14 minutes:
```
https://your-app.onrender.com/
```

### **Monitor Performance**
Render provides built-in metrics:
- Response times
- Memory usage
- Error rates
- Request volume

## 🚨 **Troubleshooting**

### **Build Fails**
- Check build logs in Render dashboard
- Verify Dockerfile syntax
- Ensure all dependencies are in requirements.txt

### **App Won't Start**
- Check if PORT environment variable is used correctly
- Verify uvicorn command in Dockerfile
- Check application logs

### **Environment Variables**
- Verify all required variables are set
- Check for typos in variable names
- Ensure sensitive values are properly escaped

## 🎉 **Success!**

Your NASA weather analysis API will be live with:
- ✅ Full pandas/numpy/scipy functionality
- ✅ NASA Earth observation data integration
- ✅ Meteomatics weather API
- ✅ All geocoding and proxy endpoints
- ✅ Complete weather risk analysis
- ✅ Historical climate data processing

**Your app URL**: `https://nsac-weather-api.onrender.com`

## 🔄 **Auto-Deployment**

Every time you push to GitHub `main` branch:
1. Render automatically detects changes
2. Rebuilds Docker container
3. Deploys new version
4. Zero-downtime deployment

Perfect for continuous development! 🚀