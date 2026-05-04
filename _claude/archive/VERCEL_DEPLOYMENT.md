# Vercel Deployment Guide - Colormxr Studio AI

## 🚀 Pre-Deployment Checklist

Before deploying to Vercel, make sure you have:

✅ **Run Database Migration**
- Execute `db/migrations/create-ai-tutor-tables.sql` in Supabase SQL Editor

✅ **Get API Key Ready**
- Anthropic API Key (from https://console.anthropic.com/)

✅ **Install Dependencies**
```bash
npm install @anthropic-ai/sdk
```

**Security Note:** We use the user's authenticated session for database operations, so you don't need the dangerous Supabase Service Role key!

---

## 📦 Step 1: Prepare for Deployment

### Install Dependencies

```bash
npm install
```

### Test Locally First

```bash
# Add your API keys to .env.local
npm run dev
```

Navigate to: http://localhost:3000/tutor-test

Test the tutor UI to ensure everything works before deploying.

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

Follow the prompts to link to your Vercel project.

### Option B: Via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

---

## 🔐 Step 3: Add Environment Variables in Vercel

After deployment, add these environment variables in the Vercel Dashboard:

### Navigate to Environment Variables

1. Go to your project in Vercel Dashboard
2. Click: **Settings** > **Environment Variables**

### Add These Variables

**Required for Existing Features:**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Required for AI Tutor:**

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Important Notes

- Apply to: **Production**, **Preview**, and **Development**
- ⚠️ **Never commit these keys to Git**
- ⚠️ Anthropic API key should NEVER be exposed to the client (it's only used server-side)

---

## 🧪 Step 4: Test the Deployment

Once deployed, test your app:

1. **Visit your deployment URL**
   - Vercel will provide a URL like: `https://your-app.vercel.app`

2. **Test the AI Tutor**
   - Navigate to: `https://your-app.vercel.app/tutor-test`
   - Try sending a message in the chat
   - Verify lesson slides load correctly

3. **Check for Errors**
   - Open browser DevTools Console (F12)
   - Check for any error messages
   - Verify API calls are working

---

## 🐛 Troubleshooting

### Build Errors

**"Module not found: @anthropic-ai/sdk"**
- Run `npm install` locally
- Push updated `package.json` and `package-lock.json` to Git
- Redeploy

**TypeScript Errors**
- Check that all `.ts` files compile locally
- Run `npm run build` to test build process

### Runtime Errors

**"AI service not configured"**
- Verify `ANTHROPIC_API_KEY` is set in Vercel Environment Variables
- Redeploy after adding the key

**"Failed to load lesson"**
- Check that `_text_content/` directory is included in deployment
- Verify the API route `/api/lessons/[filename]/route.js` deployed correctly

**Chat messages not saving**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase logs for RLS policy errors
- Ensure database migration was run

---

## 📊 Monitoring Costs

### View Token Usage

In your Supabase SQL Editor:

```sql
-- Total costs by lesson
SELECT
  lesson_id,
  COUNT(*) as conversations,
  SUM(total_cost_usd) as total_cost
FROM ai_token_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY lesson_id;

-- Daily costs
SELECT
  DATE(created_at) as date,
  COUNT(*) as messages,
  SUM(total_cost_usd) as daily_cost
FROM ai_token_usage
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### Set Budget Alerts

Consider implementing:
- Daily spending cap per user
- Monthly budget alerts
- Rate limiting adjustments based on usage

---

## 🔄 Redeployment

After making changes:

```bash
# Push to Git (if using Git integration)
git add .
git commit -m "Your changes"
git push

# Or redeploy via CLI
vercel --prod
```

Vercel will automatically redeploy when you push to your main branch.

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database migration completed
- [ ] Test page works (`/tutor-test`)
- [ ] Chat functionality working
- [ ] Lesson content loading correctly
- [ ] No console errors in production
- [ ] Cost monitoring set up
- [ ] Rate limits configured appropriately
- [ ] Remove test button from home page (optional)

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Anthropic Console**: https://console.anthropic.com/
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 🆘 Need Help?

- Check Vercel Deployment logs in Dashboard
- Review server logs in Vercel Functions tab
- Check Supabase logs for database errors
- See `AI_TUTOR_SETUP.md` for detailed configuration

---

## 📝 Notes

- First deployment may take 2-3 minutes
- Subsequent deployments are faster (1-2 minutes)
- Vercel automatically handles SSL certificates
- Preview deployments are created for each Git branch
