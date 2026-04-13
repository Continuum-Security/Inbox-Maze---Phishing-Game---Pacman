# Supabase Edge Function Deployment Guide

## Quick Deployment Steps

### Prerequisites
- Supabase account with access to project: `ixluuxqgfwbrqpgogvex`
- Supabase CLI installed (or use the Dashboard method below)

---

## Method 1: Deploy via Supabase CLI (Recommended)

### Step 1: Install Supabase CLI

**On macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**On Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Using npm (all platforms):**
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser window. Login with your Supabase credentials.

### Step 3: Link Your Project
```bash
supabase link --project-ref ixluuxqgfwbrqpgogvex
```
You'll be prompted to enter your database password.

### Step 4: Deploy the Edge Function
```bash
supabase functions deploy server
```

### Step 5: Verify Deployment
Test the health endpoint:
```bash
curl https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac/health
```
Expected response: `{"status":"ok"}`

---

## Method 2: Deploy via Supabase Dashboard (Easier for First-Timers)

### Step 1: Access Your Supabase Project
Go to: https://supabase.com/dashboard/project/ixluuxqgfwbrqpgogvex

### Step 2: Navigate to Edge Functions
- Click on **"Edge Functions"** in the left sidebar
- Click the **"Create a new function"** or **"Deploy new function"** button

### Step 3: Create the Function
- **Function name:** `server`
- **Copy and paste** the contents of `/supabase/functions/server/index.tsx` into the editor

### Step 4: Add the kv_store module
You'll need to create a helper file. In the function editor:
- Create a new file called `kv_store.tsx`
- Copy the contents from `/supabase/functions/server/kv_store.tsx`

### Step 5: Deploy
- Click **"Deploy function"** button
- Wait for deployment to complete (usually 30-60 seconds)

### Step 6: Verify
- Go to the function's detail page
- Find the function URL
- Test it by visiting: `https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac/health`

---

## Method 3: Manual File Upload

If using the Supabase CLI, you can deploy by navigating to your project directory:

```bash
# Navigate to your project
cd /path/to/your/project

# Deploy the function
supabase functions deploy server --project-ref ixluuxqgfwbrqpgogvex
```

---

## Troubleshooting

### Error: "Function not found"
- Ensure you're deploying to the correct project
- Check that the function name is exactly `server` (lowercase)

### Error: "Missing environment variables"
The function needs these environment variables (automatically available in Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

These are automatically injected by Supabase, so you don't need to set them manually.

### Error: "Module not found"
- Make sure both `index.tsx` and `kv_store.tsx` are in the same directory
- Check that the `deno.json` file is present

### Testing After Deployment

Once deployed, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac/health
   ```

2. **Test Signup (from the web app):**
   - Go to your application
   - Click "Sign Up"
   - Fill in the form
   - You should now be able to create an account!

---

## Files Being Deployed

The following files will be deployed:
- `/supabase/functions/server/index.tsx` - Main server code
- `/supabase/functions/server/kv_store.tsx` - Key-value store utilities
- `/supabase/functions/server/deno.json` - Deno configuration

---

## After Successful Deployment

Your cybersecurity game will be fully functional with:
✅ User signup and login
✅ Score tracking
✅ Company teams
✅ Leaderboards
✅ Game progress saving
✅ Dashboard analytics

---

## Need Help?

If you encounter issues:
1. Check the Supabase Edge Function logs in the dashboard
2. Verify the function URL is correct
3. Ensure your Supabase project is active
4. Check that the KV store table exists in your database

The KV store table should be automatically available - it's a built-in feature that the `kv_store.tsx` module uses.
