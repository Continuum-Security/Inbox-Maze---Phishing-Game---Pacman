#!/bin/bash

# Cybersecurity Game - Edge Function Deployment Script
# This script deploys the server Edge Function to Supabase

echo "🚀 Deploying Cybersecurity Game Backend..."
echo ""

PROJECT_REF="ixluuxqgfwbrqpgogvex"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or use the Supabase Dashboard method (see DEPLOYMENT_GUIDE.md)"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Running: supabase login"
    supabase login
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project if not already linked
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF

echo ""
echo "📦 Deploying Edge Function 'server'..."
supabase functions deploy server --project-ref $PROJECT_REF

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing the deployment..."
HEALTH_URL="https://$PROJECT_REF.supabase.co/functions/v1/make-server-ca4695ac/health"
echo "Testing: $HEALTH_URL"
echo ""

RESPONSE=$(curl -s $HEALTH_URL)
if [[ $RESPONSE == *"ok"* ]]; then
    echo "✅ Server is running!"
    echo "Response: $RESPONSE"
    echo ""
    echo "🎮 Your Cybersecurity Game is now fully deployed and ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Go to your application"
    echo "2. Click 'Sign Up'"
    echo "3. Create an account and start playing!"
else
    echo "⚠️  Server might not be responding correctly"
    echo "Response: $RESPONSE"
    echo ""
    echo "Check the Edge Function logs in Supabase Dashboard:"
    echo "https://supabase.com/dashboard/project/$PROJECT_REF/functions/server"
fi

echo ""
