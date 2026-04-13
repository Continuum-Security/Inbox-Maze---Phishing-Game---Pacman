@echo off
REM Cybersecurity Game - Edge Function Deployment Script (Windows)
REM This script deploys the server Edge Function to Supabase

echo.
echo 🚀 Deploying Cybersecurity Game Backend...
echo.

set PROJECT_REF=ixluuxqgfwbrqpgogvex

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found!
    echo.
    echo Please install it first:
    echo   npm install -g supabase
    echo.
    echo Or use the Supabase Dashboard method (see DEPLOYMENT_GUIDE.md)
    pause
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

echo 📝 Logging in to Supabase...
supabase login

echo.
echo 🔗 Linking to project: %PROJECT_REF%
supabase link --project-ref %PROJECT_REF%

echo.
echo 📦 Deploying Edge Function 'server'...
supabase functions deploy server --project-ref %PROJECT_REF%

echo.
echo ✅ Deployment complete!
echo.
echo 🧪 Testing the deployment...
set HEALTH_URL=https://%PROJECT_REF%.supabase.co/functions/v1/make-server-ca4695ac/health
echo Testing: %HEALTH_URL%
echo.

curl -s %HEALTH_URL%

echo.
echo.
echo 🎮 If you see {"status":"ok"}, your server is running!
echo.
echo Next steps:
echo 1. Go to your application
echo 2. Click 'Sign Up'
echo 3. Create an account and start playing!
echo.

pause
