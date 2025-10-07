# Vercel Deployment Guide

This guide will help you deploy your full-stack NASA weather analysis application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your API keys and credentials

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Vite project

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

#### Required Variables:
```
NASA_EARTHDATA_USERNAME=your_nasa_username
NASA_EARTHDATA_PASSWORD=your_nasa_password
METEOMATICS_USERNAME=kakarla_vikas
METEOMATICS_PASSWORD=mW07QKj9y7ApKf23Ep43
METEOMATICS_CUTOFF=2025-10-12T23:59:59Z
```

#### Optional Variables:
```
OPENMETEO_API_KEY=optional
MAPBOX_TOKEN=your_mapbox_token_if_needed
OPENDAP_URL=your_opendap_url_if_needed
NASA_POWER_START=19900101
NASA_POWER_END=20241231
```

### 3. Deploy

1. Click "Deploy" in Vercel
2. Vercel will:
   - Install Node.js dependencies
   - Install Python dependencies
   - Build your React frontend
   - Set up your FastAPI backend as serverless functions

### 4. Verify Deployment

After deployment:

1. **Frontend**: Your React app will be available at `https://your-project.vercel.app`
2. **Backend API**: Available at `https://your-project.vercel.app/api/*`
3. **Specific endpoints**:
   - Weather analysis: `https://your-project.vercel.app/analyze`
   - Geocoding proxy: `https://your-project.vercel.app/proxy/geocode`

## Project Structure for Vercel

```
your-project/
├── api/                    # Vercel serverless functions
│   └── index.py           # FastAPI entry point
├── backend/               # Your FastAPI application
│   ├── main.py           # Main FastAPI app
│   ├── nasa_integration.py
│   └── requirements.txt
├── src/                   # React frontend
├── dist/                  # Built frontend (auto-generated)
├── package.json          # Node.js dependencies
├── requirements.txt      # Python dependencies (root level)
├── vercel.json          # Vercel configuration
└── .env.production      # Production environment template
```

## How It Works

1. **Frontend**: Vite builds your React app to the `dist/` folder
2. **Backend**: FastAPI runs as Vercel serverless functions via `api/index.py`
3. **Routing**: 
   - `/` → React app
   - `/api/*` → FastAPI backend
   - `/analyze` → Weather analysis endpoint
   - `/proxy/*` → Geocoding proxy endpoints

## Environment Configuration

The frontend automatically detects the environment:
- **Development**: Uses `VITE_BACKEND_URL` from `.env`
- **Production**: Uses relative URLs (same domain)

## Troubleshooting

### Common Issues:

1. **Python Dependencies**: Make sure `requirements.txt` is in the root directory
2. **Import Errors**: The `api/index.py` file handles Python path configuration
3. **CORS Issues**: FastAPI is configured to allow requests from Vercel domains
4. **Environment Variables**: Double-check all required variables are set in Vercel dashboard

### Debugging:

1. Check Vercel function logs in the dashboard
2. Test API endpoints directly: `https://your-project.vercel.app/analyze`
3. Verify environment variables are properly set

## Performance Notes

- **Cold Starts**: First request to API may be slower (serverless function startup)
- **Caching**: Vercel automatically caches static assets
- **Scaling**: Serverless functions auto-scale based on demand

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

- **Analytics**: Available in Vercel dashboard
- **Logs**: Function logs available in real-time
- **Performance**: Built-in performance monitoring

Your application will be live at `https://your-project-name.vercel.app`!