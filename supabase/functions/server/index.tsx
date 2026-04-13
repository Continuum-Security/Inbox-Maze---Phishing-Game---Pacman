import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ca4695ac/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint - creates new user with company info
app.post("/make-server-ca4695ac/signup", async (c) => {
  try {
    const { email, password, name, company } = await c.req.json();

    if (!email || !password || !name || !company) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, company },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log(`Authorization error during signup: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile
    const userId = authData.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      company,
      createdAt: new Date().toISOString(),
      totalScore: 0,
      gamesPlayed: 0
    });

    // Add user to company
    const companyKey = `company:${company.toLowerCase().replace(/\s+/g, '-')}`;
    const existingCompany = await kv.get(companyKey);
    
    if (existingCompany) {
      existingCompany.members.push(userId);
      existingCompany.totalScore = (existingCompany.totalScore || 0);
      await kv.set(companyKey, existingCompany);
    } else {
      await kv.set(companyKey, {
        name: company,
        members: [userId],
        totalScore: 0,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      userId,
      message: "Account created successfully" 
    });
  } catch (error) {
    console.log(`Error during signup: ${error}`);
    return c.json({ error: error.message }, 500);
  }
});

// Submit score endpoint
app.post("/make-server-ca4695ac/submit-score", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      console.log(`Authorization error while submitting score: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { gameType, score, timeTaken } = await c.req.json();

    if (!gameType || score === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const userId = user.id;
    const scoreKey = `score:${userId}:${Date.now()}`;
    
    // Save individual score
    await kv.set(scoreKey, {
      userId,
      gameType,
      score,
      timeTaken,
      timestamp: new Date().toISOString()
    });

    // Update user profile
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.totalScore = (userProfile.totalScore || 0) + score;
      userProfile.gamesPlayed = (userProfile.gamesPlayed || 0) + 1;
      userProfile.lastPlayed = new Date().toISOString();
      await kv.set(`user:${userId}`, userProfile);

      // Update company score
      const companyKey = `company:${userProfile.company.toLowerCase().replace(/\s+/g, '-')}`;
      const companyData = await kv.get(companyKey);
      if (companyData) {
        companyData.totalScore = (companyData.totalScore || 0) + score;
        await kv.set(companyKey, companyData);
      }
    }

    return c.json({ success: true, totalScore: userProfile.totalScore });
  } catch (error) {
    console.log(`Error submitting score: ${error}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get user profile
app.get("/make-server-ca4695ac/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      console.log(`Authorization error while fetching profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    
    if (!userProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(userProfile);
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get leaderboard
app.get("/make-server-ca4695ac/leaderboard", async (c) => {
  try {
    // Get all companies
    const companies = await kv.getByPrefix('company:');
    
    // Sort by total score
    const sortedCompanies = companies
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .map((company, index) => ({
        rank: index + 1,
        name: company.name,
        totalScore: company.totalScore || 0,
        memberCount: company.members?.length || 0,
        avgScore: company.members?.length 
          ? Math.round((company.totalScore || 0) / company.members.length) 
          : 0
      }));

    return c.json(sortedCompanies);
  } catch (error) {
    console.log(`Error fetching leaderboard: ${error}`);
    return c.json({ error: error.message }, 500);
  }
});

// Get company details
app.get("/make-server-ca4695ac/company/:companyName", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      console.log(`Authorization error while fetching company details: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const companyName = c.req.param('companyName');
    const companyKey = `company:${companyName.toLowerCase().replace(/\s+/g, '-')}`;
    const companyData = await kv.get(companyKey);

    if (!companyData) {
      return c.json({ error: 'Company not found' }, 404);
    }

    // Get all member profiles
    const memberProfiles = await Promise.all(
      companyData.members.map(async (memberId: string) => {
        const profile = await kv.get(`user:${memberId}`);
        return profile;
      })
    );

    const validMembers = memberProfiles.filter(Boolean);

    return c.json({
      name: companyData.name,
      totalScore: companyData.totalScore || 0,
      memberCount: validMembers.length,
      avgScore: validMembers.length 
        ? Math.round((companyData.totalScore || 0) / validMembers.length) 
        : 0,
      members: validMembers.map((member: any) => ({
        name: member.name,
        email: member.email,
        totalScore: member.totalScore || 0,
        gamesPlayed: member.gamesPlayed || 0
      })).sort((a: any, b: any) => b.totalScore - a.totalScore)
    });
  } catch (error) {
    console.log(`Error fetching company details: ${error}`);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
