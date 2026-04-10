# 🚀 Deployment Guide - Chopra Footwear Industries

Your project is ready to deploy! Follow these steps to go live.

---

## **STEP 1: Deploy Backend to Render.com** (5-10 minutes)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub (easier!)
- Authorize access to your repositories

### 2. Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Select your `chopra-footwear` repository
3. **Configure:**
   - **Name:** `chopra-footwear-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server` (IMPORTANT!)
   - **Plan:** Free
4. Click **"Create Web Service"**
5. Wait for deployment (5-10 minutes)
6. ✅ Once deployed, you'll get a URL like: `https://chopra-footwear-api.onrender.com`

### 3. Set Environment Variables in Render
- Go to the service dashboard
- Click **"Environment"**
- Add these variables:
  ```
  JWT_SECRET = your-random-secret-key (can be anything)
  CLIENT_URL = https://your-frontend-url.vercel.app (add later)
  NODE_ENV = production
  ```

---

## **STEP 2: Deploy Frontend to Vercel** (5 minutes)

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Authorize GitHub access

### 2. Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Select your `chopra-footwear` repository
3. **Configure:**
   - **Framework:** Select `Vite`
   - **Root Directory:** `client` (IMPORTANT!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://chopra-footwear-api.onrender.com` (from Step 1)
5. Click **"Deploy"**
6. ✅ Your site is live! You'll get a URL like: `https://chopra-footwear.vercel.app`

### 3. Connect Frontend to Backend
- Go back to Render dashboard
- Update `CLIENT_URL` to your Vercel URL
- Restart the service

---

## **STEP 3: Verify Everything Works**

### Test Backend
Visit: `https://chopra-footwear-api.onrender.com/api/health`
You should see: `{"status":"ok","message":"Chopra Footwear Industries API is running"}`

### Test Frontend
Visit: `https://chopra-footwear.vercel.app`
Your store should be live! Try:
- ✅ Browse products
- ✅ Add to cart
- ✅ Login/Register
- ✅ Checkout

---

## **IMPORTANT NOTES**

⚠️ **Free Tier Limitations:**
- Render: Service may sleep after 15 minutes of inactivity (takes ~30s to wake up)
- Vercel: Fully free, no limits

💡 **To Avoid Sleeping:**
- Upgrade Render to paid plan (~$7/month)
- OR: Set up a "keep-alive" service

📝 **SSL Certificate:**
- Both Vercel & Render provide free HTTPS ✅

---

## **TROUBLESHOOTING**

### Products not loading?
- Check that `VITE_API_URL` in Vercel matches your Render backend URL
- Test backend health check URL

### Login works but cart empty?
- Clear browser cookies and reload
- Check browser console for CORS errors

### Uploads not showing?
- Images store locally, won't persist on free tier
- Upgrade to paid or use cloud storage (AWS S3)

---

## **Next Steps (Optional Upgrades)**

- [ ] Set up custom domain (both support custom domains)
- [ ] Upgrade Render to prevent free tier sleep
- [ ] Add email verification (configure SMTP)
- [ ] Set up CI/CD for automatic deployments

Your project is now ready to deploy! 🎉
