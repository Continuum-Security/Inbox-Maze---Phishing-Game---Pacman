# 🚀 Quick Start - Deploy in 5 Minutes

## The Fastest Way to Get Your Game Running

### Option A: One-Command Deploy (If you have npm)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Run the deployment script:**
   
   **Mac/Linux:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   
   **Windows:**
   ```cmd
   deploy.bat
   ```

3. **Done!** Test your app at the provided URL

---

### Option B: Manual Deploy (5 steps)

1. **Install CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login:**
   ```bash
   supabase login
   ```

3. **Link project:**
   ```bash
   supabase link --project-ref ixluuxqgfwbrqpgogvex
   ```

4. **Deploy:**
   ```bash
   supabase functions deploy server
   ```

5. **Test:**
   Visit: https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac/health

---

### Option C: No CLI? Use the Dashboard (Browser Only)

1. Go to: https://supabase.com/dashboard/project/ixluuxqgfwbrqpgogvex/functions

2. Click **"Create a new function"**

3. Name it: `server`

4. Open `/supabase/functions/server/index.tsx` from this project

5. Copy ALL the code and paste it into the Supabase editor

6. Click **"Deploy"**

7. **Important:** You'll also need to add `kv_store.tsx` as a separate file in the function

---

## After Deployment

✅ Go to your application URL
✅ Click "Sign Up"  
✅ Create a test account (e.g., test@example.com)
✅ Start playing the cybersecurity games!

---

## Quick Test

After deploying, test if it works:

```bash
curl https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac/health
```

**Expected response:** `{"status":"ok"}`

If you see this, your backend is ready! 🎉

---

## Still Having Issues?

1. Check `/DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. View Edge Function logs in Supabase Dashboard
3. Verify both `index.tsx` and `kv_store.tsx` are deployed together

---

## Project Info

- **Project ID:** ixluuxqgfwbrqpgogvex
- **Function Name:** server
- **Base URL:** https://ixluuxqgfwbrqpgogvex.supabase.co/functions/v1/make-server-ca4695ac

---

**That's it! You're ready to run your 5-day cybersecurity competition! 🎮🔒**
