# AI Tutor Test Mode

## 🎯 Quick Start

The app is now in **test mode** with the AI Tutor UI ready to test!

### Access the Test Page

1. **Start the dev server:**
   ```bash
   npm install  # Install the Anthropic SDK
   npm run dev
   ```

2. **Navigate to the test page:**
   - Home page: Look for the purple "🧪 Test AI Tutor" button in bottom-right
   - Or go directly to: http://localhost:3000/tutor-test

---

## 🧪 What You'll See

The test page displays:
- **Left Sidebar**: AI Tutor with lesson content and chat
- **Main Area**: Test instructions and status
- **Lesson**: "Colormixing 101" loaded from markdown

---

## 📝 Before Testing Chat

To test the AI chat functionality, you need to add your Anthropic API key to `.env.local`:

```bash
# In .env.local, add this line:

ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Where to Get the Key:

**Anthropic API Key:**
1. Sign up at: https://console.anthropic.com/
2. Create an API key
3. Copy the key (starts with `sk-ant-api03-`)

**Security Note:** We no longer need the dangerous Supabase Service Role key! The API now uses your authenticated session, which is much safer and respects all security policies.

### Run the Database Migration:

Execute this in Supabase SQL Editor:
```
db/migrations/create-ai-tutor-tables.sql
```

---

## ✅ Testing Checklist

### UI Tests (No API Keys Needed)

- [ ] Sidebar displays on the left
- [ ] Lesson content shows in slides
- [ ] "Next" button navigates slides
- [ ] Arrow keys navigate slides
- [ ] Slide counter shows current/total
- [ ] Chat input is visible at bottom
- [ ] Can type in chat input
- [ ] UI is responsive

### Chat Tests (Requires API Keys)

- [ ] Send a message: "What is the Black slider?"
- [ ] AI responds in David's voice
- [ ] Ask: "How do I mix Yellow?"
- [ ] AI gives brief, action-oriented response
- [ ] Ask: "Is my color choice correct?"
- [ ] AI avoids judging, focuses on observation
- [ ] Messages display correctly
- [ ] Loading indicator shows while waiting
- [ ] Error handling works if keys are missing

### Test Scenarios

**Scenario 1: Basic Question**
```
User: "What are primary colors?"
Expected: Brief explanation + direction to try in Colormixer
```

**Scenario 2: Exercise Guidance**
```
User: "How do I mix cyan?"
Expected: Step-by-step instructions + encouragement to try
```

**Scenario 3: Philosophy Test**
```
User: "Did I pick the right color?"
Expected: No judgment, guides observation instead
```

---

## 🎨 UI Features to Test

### Lesson Navigation

- Click "Next" button → should advance to next slide
- Press Right Arrow → should advance to next slide
- Press Left Arrow → should go to previous slide
- Last slide → Next button should loop to first slide

### Chat Interface

- Type in input field
- Press Enter → should send message
- Send button → should send message
- Long messages → should show full text
- User messages → blue, right-aligned
- AI messages → dark gray, left-aligned with "CG" avatar

### Responsive Behavior

- Resize window → sidebar should stay fixed
- Small screens → sidebar should take full width
- Close button → should hide sidebar
- Reopen button → should show sidebar again

---

## 🚫 Known Limitations (Expected)

Without API keys configured:
- ⚠️ Chat will show error: "AI service not configured"
- ✅ This is expected! UI still works for testing layout

With API keys but no database migration:
- ⚠️ Chat works but conversations don't save
- ⚠️ Token usage not tracked

---

## 🚀 Ready for Vercel?

Once you've tested locally and everything works:

1. **Add API keys to Vercel**
   - See `VERCEL_DEPLOYMENT.md` for detailed steps

2. **Deploy**
   ```bash
   vercel
   ```

3. **Test on production**
   - Visit: `https://your-app.vercel.app/tutor-test`
   - Verify everything works in production

---

## 🔧 Troubleshooting

### Chat shows "AI service not configured"
- **Cause**: Missing `ANTHROPIC_API_KEY` in `.env.local`
- **Fix**: Add the key and restart dev server (`npm run dev`)

### Lesson slides don't load
- **Cause**: Markdown file not found or API route issue
- **Fix**: Check that `_text_content/colormixing_101.md` exists
- Check browser console for errors

### Messages send but don't save
- **Cause**: Database migration not run or user not authenticated
- **Fix**:
  1. Run `db/migrations/create-ai-tutor-tables.sql` in Supabase
  2. Make sure you're logged in to the app

### npm install fails
- **Cause**: npm cache permission issues
- **Fix**: Run `sudo chown -R $(whoami) ~/.npm` (requires password)
- Or clear cache: `npm cache clean --force`

---

## 📚 Related Documentation

- `AI_TUTOR_SETUP.md` - Complete setup guide
- `VERCEL_DEPLOYMENT.md` - Deployment instructions
- `INTEGRATION_EXAMPLE.md` - How to integrate into exercises
- `Colormxr_AI_context.md` - AI behavior and philosophy

---

## 🎉 What's Next?

After testing:

1. **Integrate into exercise pages**
   - Add TutorSidebar to actual exercises
   - See `INTEGRATION_EXAMPLE.md`

2. **Create more lessons**
   - Add markdown files to `_text_content/`
   - Use `---` to separate slides

3. **Deploy to production**
   - Follow `VERCEL_DEPLOYMENT.md`
   - Test on live URL

4. **Monitor usage**
   - Track token costs in Supabase
   - Adjust rate limits as needed

---

## 💡 Test Tips

- **Test without API keys first** to verify UI works
- **Add keys incrementally** to isolate issues
- **Check browser console** (F12) for errors
- **Check server logs** in terminal for API errors
- **Use small messages** for testing (under 50 chars)
- **Test error cases** (long messages, rate limits)

---

Enjoy testing! 🎨✨
