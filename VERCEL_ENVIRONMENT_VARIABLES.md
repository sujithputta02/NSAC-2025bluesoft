# Complete Vercel Environment Variables Configuration

## 🔧 Required Environment Variables for Vercel Dashboard

Copy and paste these **exact** environment variables into your Vercel project settings:

### 🚀 Core NASA & Weather API Credentials

```
NASA_EARTHDATA_USERNAME=sujithputta
NASA_EARTHDATA_PASSWORD=Nasa@12345t$
METEOMATICS_USERNAME=kakarla_vikas
METEOMATICS_PASSWORD=mW07QKj9y7ApKf23Ep43
METEOMATICS_CUTOFF=2025-10-12T23:59:59Z
```

### 📅 NASA POWER API Configuration

```
NASA_POWER_START=19900101
NASA_POWER_END=20241231
```

### 🌦️ Meteomatics Extended Configuration

```
METEOMATICS_START=1990-01-01T00:00:00Z
METEOMATICS_END=2024-12-31T00:00:00Z
METEOMATICS_DUST_PARAM=aod550nm:1
METEOMATICS_TEMP_PARAM=t_2m:C
METEOMATICS_PRECIP_PARAM=precip_24h:mm
METEOMATICS_WIND_PARAM=wind_speed_10m:ms
```

### 🛰️ OPeNDAP Configuration (Optional)

```
OPENDAP_VAR_CLOUD=CLDTOT
OPENDAP_VAR_AOD=TOTEXTTAU
OPENDAP_VAR_SNOW=SNOWDP
```

### 🔗 Backend Configuration

```
VITE_BACKEND_URL=/api
```

### 🗺️ Optional API Keys

```
OPENMETEO_API_KEY=optional
```

**Note**: Only add `MAPBOX_TOKEN` if you have a Mapbox account:
```
MAPBOX_TOKEN=your_mapbox_token_here
```

**Note**: Only add `OPENDAP_URL` if you have access to an OPeNDAP server:
```
OPENDAP_URL=https://your-opendap-server.com/dataset
```

## 📋 How to Add These in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable above:
   - **Name**: Copy the variable name (e.g., `NASA_EARTHDATA_USERNAME`)
   - **Value**: Copy the corresponding value (e.g., `sujithputta`)
   - **Environment**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

## ⚡ Quick Copy-Paste Format for Vercel

Here's the format ready for Vercel's bulk import (if available):

```
NASA_EARTHDATA_USERNAME=sujithputta
NASA_EARTHDATA_PASSWORD=Nasa@12345t$
METEOMATICS_USERNAME=kakarla_vikas
METEOMATICS_PASSWORD=mW07QKj9y7ApKf23Ep43
METEOMATICS_CUTOFF=2025-10-12T23:59:59Z
VITE_BACKEND_URL=/api
NASA_POWER_START=19900101
NASA_POWER_END=20241231
METEOMATICS_START=1990-01-01T00:00:00Z
METEOMATICS_END=2024-12-31T00:00:00Z
METEOMATICS_DUST_PARAM=aod550nm:1
METEOMATICS_TEMP_PARAM=t_2m:C
METEOMATICS_PRECIP_PARAM=precip_24h:mm
METEOMATICS_WIND_PARAM=wind_speed_10m:ms
OPENDAP_VAR_CLOUD=CLDTOT
OPENDAP_VAR_AOD=TOTEXTTAU
OPENDAP_VAR_SNOW=SNOWDP
OPENMETEO_API_KEY=optional
```

## 🔍 Variable Explanations

| Variable | Purpose | Required |
|----------|---------|----------|
| `NASA_EARTHDATA_USERNAME` | NASA Earthdata login | ✅ Yes |
| `NASA_EARTHDATA_PASSWORD` | NASA Earthdata password | ✅ Yes |
| `METEOMATICS_USERNAME` | Weather API access | ✅ Yes |
| `METEOMATICS_PASSWORD` | Weather API password | ✅ Yes |
| `METEOMATICS_CUTOFF` | API access expiry | ✅ Yes |
| `NASA_POWER_START` | Historical data start date | ✅ Yes |
| `NASA_POWER_END` | Historical data end date | ✅ Yes |
| `METEOMATICS_*_PARAM` | Weather parameter configs | ⚠️ Recommended |
| `OPENDAP_VAR_*` | Satellite data variables | 🔧 Optional |
| `MAPBOX_TOKEN` | Map geocoding (if needed) | 🔧 Optional |
| `OPENDAP_URL` | Satellite data server | 🔧 Optional |

## ✅ Verification

After adding these variables, your app will have access to:
- ✅ NASA Earth observation data
- ✅ Meteomatics weather forecasts
- ✅ Historical climate data
- ✅ Geocoding services
- ✅ All backend functionality

## 🚨 Important Notes

1. **Never commit these to Git** - they're already in your `.env` files which should be in `.gitignore`
2. **Case sensitive** - Copy exactly as shown
3. **No quotes needed** - Vercel handles the values directly
4. **Apply to all environments** - Set for Production, Preview, and Development

Your Vercel deployment will work smoothly with these environment variables! 🎉