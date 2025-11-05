# 🔧 Fix: Can't Sign Out / Stuck Signed In

## 🚨 **Problem:**
You're stuck in a signed-in state and can't sign out. The sign-out button doesn't work and you don't see the "LOG IN" option.

---

## ✅ **Quick Fix - Clear Browser Cookies:**

### **Method 1: Clear Cookies in Browser (RECOMMENDED)**

#### **Chrome/Edge:**
1. Press `F12` to open DevTools
2. Click the **"Application"** tab
3. In the left sidebar, expand **"Cookies"**
4. Click on `http://localhost:3000`
5. **Right-click** → **"Clear"** or select all and delete
6. **Refresh the page** (`F5` or `Cmd/Ctrl + R`)

#### **Firefox:**
1. Press `F12` to open DevTools
2. Click the **"Storage"** tab
3. Expand **"Cookies"**
4. Click on `http://localhost:3000`
5. **Right-click** → **"Delete All"**
6. **Refresh the page**

#### **Safari:**
1. Open **Safari** → **Preferences** → **Privacy**
2. Click **"Manage Website Data"**
3. Search for `localhost`
4. Click **"Remove"**
5. **Refresh the page**

---

### **Method 2: Use Incognito/Private Mode**

1. **Open Incognito/Private Window:**
   - Chrome/Edge: `Cmd/Ctrl + Shift + N`
   - Firefox: `Cmd/Ctrl + Shift + P`
   - Safari: `Cmd + Shift + N`

2. **Go to:** http://localhost:3000

3. **You should now see "LOG IN" button** (fresh session)

---

### **Method 3: Clear All Site Data**

#### **In Chrome/Edge:**
1. Go to: `chrome://settings/siteData`
2. Search: `localhost:3000`
3. Click the **trash icon** to delete
4. Refresh your page

---

### **Method 4: Hard Reset (Nuclear Option)**

If nothing else works:

1. **Close your browser completely**
2. **Run this command:**
   ```bash
   rm -rf .next
   npm run dev
   ```
3. **Open browser in Incognito mode**
4. **Go to:** http://localhost:3000

---

## 🎯 **After Clearing Cookies:**

You should see:
- ✅ "LOG IN" button in the header
- ✅ No user name displayed
- ✅ Can click "LOG IN" to go to signin page
- ✅ Can sign in successfully
- ✅ Sign out now works properly

---

## 🔍 **Why This Happened:**

The NextAuth session cookie (`next-auth.session-token`) got stuck. The API signout was working (you can see `POST /api/auth/signout 200` in terminal), but the browser was holding onto the cookie.

---

## 📝 **Test After Fix:**

1. ✅ Clear cookies using Method 1
2. ✅ Refresh the page
3. ✅ You should see "LOG IN" button
4. ✅ Click "LOG IN"
5. ✅ Sign in with: `demo@mystyledwardrobe.com` / `demo123`
6. ✅ You should see "Demo User SIGN OUT"
7. ✅ Click "SIGN OUT"
8. ✅ You should be redirected and see "LOG IN" again

---

## 🆘 **Still Stuck?**

Try this complete reset:

```bash
# 1. Stop the server (Ctrl+C if running)

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart server
npm run dev

# 4. Open browser in Incognito mode
# 5. Go to http://localhost:3000
```

This gives you a completely fresh start!

---

## ✨ **Prevention:**

To avoid this in the future:
- Use **Incognito/Private mode** for testing sign in/out
- Clear cookies between tests
- Hard refresh (`Cmd/Ctrl + Shift + R`) after signing out

---

## 🎊 **Summary:**

**The simplest fix:** 
1. Open DevTools (`F12`)
2. Go to Application → Cookies → localhost:3000
3. Delete all cookies
4. Refresh page
5. You'll see "LOG IN" button!





