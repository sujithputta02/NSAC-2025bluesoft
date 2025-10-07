#!/usr/bin/env python3
"""
Environment Variables Verification Script for Vercel Deployment
Run this after deployment to verify all required variables are set
"""

import os
import sys

def check_env_vars():
    """Check if all required environment variables are set"""
    
    # Required variables
    required_vars = {
        'NASA_EARTHDATA_USERNAME': 'NASA Earthdata login username',
        'NASA_EARTHDATA_PASSWORD': 'NASA Earthdata login password',
        'METEOMATICS_USERNAME': 'Meteomatics API username',
        'METEOMATICS_PASSWORD': 'Meteomatics API password',
        'METEOMATICS_CUTOFF': 'Meteomatics API access cutoff date',
    }
    
    # Recommended variables
    recommended_vars = {
        'NASA_POWER_START': 'NASA POWER data start date',
        'NASA_POWER_END': 'NASA POWER data end date',
        'METEOMATICS_START': 'Meteomatics data start date',
        'METEOMATICS_END': 'Meteomatics data end date',
        'METEOMATICS_DUST_PARAM': 'Dust parameter configuration',
        'METEOMATICS_TEMP_PARAM': 'Temperature parameter configuration',
        'METEOMATICS_PRECIP_PARAM': 'Precipitation parameter configuration',
        'METEOMATICS_WIND_PARAM': 'Wind speed parameter configuration',
    }
    
    # Optional variables
    optional_vars = {
        'MAPBOX_TOKEN': 'Mapbox geocoding token',
        'OPENDAP_URL': 'OPeNDAP server URL',
        'OPENDAP_VAR_CLOUD': 'Cloud cover variable name',
        'OPENDAP_VAR_AOD': 'Aerosol optical depth variable name',
        'OPENDAP_VAR_SNOW': 'Snow depth variable name',
        'OPENMETEO_API_KEY': 'Open-Meteo API key',
    }
    
    print("🔍 Environment Variables Verification")
    print("=" * 50)
    
    # Check required variables
    print("\n✅ Required Variables:")
    missing_required = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: {'*' * min(len(value), 8)} ({description})")
        else:
            print(f"  ❌ {var}: MISSING ({description})")
            missing_required.append(var)
    
    # Check recommended variables
    print("\n⚠️  Recommended Variables:")
    missing_recommended = []
    for var, description in recommended_vars.items():
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: {value} ({description})")
        else:
            print(f"  ⚠️  {var}: NOT SET ({description})")
            missing_recommended.append(var)
    
    # Check optional variables
    print("\n🔧 Optional Variables:")
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value and value != "optional":
            print(f"  ✅ {var}: {'*' * min(len(value), 8)} ({description})")
        else:
            print(f"  ➖ {var}: NOT SET ({description})")
    
    # Check Vercel-specific variables
    print("\n🚀 Vercel Environment:")
    vercel_vars = ['VERCEL', 'VERCEL_ENV', 'VERCEL_URL']
    for var in vercel_vars:
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: {value}")
        else:
            print(f"  ➖ {var}: NOT SET (normal for local development)")
    
    # Summary
    print("\n" + "=" * 50)
    if missing_required:
        print(f"❌ DEPLOYMENT WILL FAIL: {len(missing_required)} required variables missing")
        print("   Missing required variables:", ", ".join(missing_required))
        return False
    elif missing_recommended:
        print(f"⚠️  DEPLOYMENT MAY HAVE LIMITED FUNCTIONALITY: {len(missing_recommended)} recommended variables missing")
        print("   Missing recommended variables:", ", ".join(missing_recommended))
        return True
    else:
        print("✅ ALL VARIABLES CONFIGURED CORRECTLY!")
        return True

if __name__ == "__main__":
    success = check_env_vars()
    sys.exit(0 if success else 1)