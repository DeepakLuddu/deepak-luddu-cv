# Deploy Guide: Vercel CLI

This walks you from "files on disk" to "live website" in about 10 minutes. No GitHub required.

---

## Step 1: Install Node.js (one-time, ~3 min)

Vercel's CLI is a Node.js tool, so you need Node installed.

1. Go to https://nodejs.org
2. Download the **LTS** version for Windows.
3. Run the installer with default options.
4. Open **Command Prompt** (or PowerShell or Windows Terminal) and verify:
   ```
   node --version
   npm --version
   ```
   Both should print version numbers. If they do, you're good.

---

## Step 2: Install the Vercel CLI (~30 sec)

In the same terminal:
```
npm install -g vercel
```

When it finishes, verify:
```
vercel --version
```

---

## Step 3: Log in to Vercel (~1 min)

Still in the terminal:
```
vercel login
```

It'll ask how you want to log in. Pick **Continue with Email**, type your email, and a magic-link will land in your inbox. Click it to confirm. Back in the terminal, you'll see `Success!`.

If you don't have a Vercel account yet, this same flow creates one for you, so there's nothing extra to sign up for.

---

## Step 4: Personalise the contact form & LinkedIn (2 min)

Before deploying, do the two edits described in **README.md**:
- Replace `YOUR_FORM_ID` in `index.html` with your Formspree form ID.
- Replace the placeholder `#` LinkedIn URL with your real LinkedIn link.

(You can deploy without these changes too, just remember to come back and redeploy once you've updated them.)

---

## Step 5: Deploy! (~1 min)

In the terminal, navigate into the website folder:
```
cd "D:\Deepak CV Claude\cv-website"
```

Then run:
```
vercel
```

It will ask a series of questions. Here are the answers:

| Prompt | Answer |
| --- | --- |
| Set up and deploy? | **Y** |
| Which scope? | Pick your personal account |
| Link to existing project? | **N** |
| Project name? | `deepak-luddu` (or anything you like, since this becomes part of the URL) |
| In which directory is your code located? | Press Enter (use current `./`) |
| Want to modify settings? | **N** |

Vercel will upload the files and deploy. After ~30 seconds, you'll see:
```
✅  Production: https://deepak-luddu.vercel.app
```

Open that URL. Your CV is live.

---

## Step 6: Promote to a permanent URL

The first deploy is technically a *preview*. To make it the official production URL:
```
vercel --prod
```
Done. Anyone you give the URL to will see your CV.

---

## Updating the site later

Whenever you change something in the folder:
```
cd "D:\Deepak CV Claude\cv-website"
vercel --prod
```
Re-deploys in seconds.

---

## (Optional) Use a custom domain

1. Buy a domain from a registrar such as Namecheap, Porkbun, or Cloudflare. All are good, at roughly $10 to $15 a year.
2. In your Vercel dashboard (https://vercel.com/dashboard), open the project.
3. Go to **Settings → Domains → Add Domain**.
4. Enter your domain (e.g. `deepakluddu.com`) and follow the DNS instructions Vercel shows.
5. Wait for DNS to propagate (usually <1 hour). Done.

---

## Troubleshooting

- **`vercel: command not found`**: Node/npm install didn't add things to PATH. Close and reopen your terminal, or restart your computer.
- **`EACCES`-style errors on `npm install -g`**: On Windows this rarely happens. If it does, run the terminal as Administrator.
- **The contact form doesn't send anything**: Make sure you replaced `YOUR_FORM_ID` and that the Formspree form is "active" in their dashboard. The first submission to a new form requires you to confirm via an email Formspree sends you.
- **The site looks wrong / no styles**: Make sure `styles.css` and `script.js` are in the same folder as `index.html` when you ran `vercel`.

---

That's it. If you hit anything weird in any of the steps, paste the error back to me and I'll diagnose it.
