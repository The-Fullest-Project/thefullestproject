# The Fullest Project - Site Guide

This guide explains everything you need to know to manage thefullestproject.org. It's written for beginners — no coding experience needed for most tasks.

---

## How the Site Works (Big Picture)

The Fullest Project website is a **static site** — that means it's a collection of HTML files that get served to visitors. Here's how the pieces fit together:

```
You write content (blog posts, resources)
    |
The site gets "built" (turned into web pages)
    |
The built files get uploaded to GoDaddy
    |
Visitors see the live site at thefullestproject.org
```

**The good news:** Most of this happens automatically. You just write content and it shows up.

---

## Section 1: Writing Blog Posts

This is the thing you'll do most often. We use a visual editor called **Decap CMS** that lets you write blog posts without touching any code.

### How to Write a New Blog Post

1. **Go to the admin page**
   - Open your browser and go to: `https://thefullestproject.org/admin/`
   - Log in with your GitHub account (see "Setting Up GitHub" below if you don't have one yet)

2. **Click "Blog Posts"** in the left sidebar

3. **Click "New Blog Posts"** button at the top

4. **Fill in the fields:**
   - **Title** — The headline of your post
   - **Date** — When you want it published (defaults to today)
   - **Author** — Your name
   - **Category** — Pick the best fit: Story, Guide, News, Resources, Advocacy, Parenting, Therapy, or Education
   - **Excerpt** — A 1-2 sentence summary that appears on the blog listing page
   - **Featured Image** — Optional photo for the post (click "Choose an image" to upload)
   - **Body** — Your actual post content. Use the toolbar to add headings, bold, links, images, etc.

5. **Save your work**
   - Click **"Save"** to save a draft (not published yet)
   - When you're ready to publish, change the status from "Draft" to "Ready" and click **"Publish"**

6. **Your post will appear on the site** within a few minutes after the site rebuilds automatically

### Tips for Writing Posts
- Use **headings** (H2, H3) to break up long posts — this helps readers scan
- Add **images** to make posts more engaging
- Keep the **excerpt** short and compelling — it's what people see before they click
- The **Body** field supports rich text: bold, italic, links, lists, images, and more

---

## Section 2: Managing Resources

### How Resource Data Is Organized

Resources are stored in JSON files (a structured text format), organized by state:

```
src/_data/resources/
  national.json          <- Resources available nationwide
  states/
    AL.json              <- Alabama resources
    AK.json              <- Alaska resources
    ...
    VA.json              <- Virginia resources (includes NoVA)
    ...
    WY.json              <- Wyoming resources
```

Each resource looks like this:

```json
{
  "name": "Organization Name",
  "category": ["therapy"],
  "location": "Virginia",
  "area": "Northern Virginia",
  "description": "What this organization does...",
  "phone": "555-555-5555",
  "website": "https://example.org",
  "address": "123 Main St, Fairfax, VA",
  "tags": ["therapy", "OT"],
  "source": "https://where-we-found-it.com",
  "lastScraped": "2026-03-06"
}
```

### When Someone Submits a Resource

When a visitor submits a resource through the website form:

1. You'll get an email notification from **Formspree** (check the inbox for hello@thefullestproject.org)
2. Review the submission to make sure it's legitimate
3. If it's good, you can add it to the appropriate state JSON file (or ask your developer to add it)

### How the Auto-Scraper Works

Every week (Sunday at midnight), an automated process:
1. Runs scraper scripts that check known resource websites
2. Updates the JSON data files with any new or changed information
3. Rebuilds and redeploys the site automatically

**You don't need to do anything** — this happens on its own via GitHub Actions.

---

## Section 3: Setting Up GitHub (Step by Step)

GitHub is where the site's code and content lives. You need a free GitHub account to:
- Log into the blog editor at `/admin/`
- Make changes to the site
- Trigger automatic deploys

### Step 1: Create a GitHub Account

1. Open your browser and go to **https://github.com**
2. Click the **"Sign up"** button in the top-right corner
3. Enter your **email address** and click Continue
4. Create a **password** (at least 15 characters, or 8 characters with a number and lowercase letter)
5. Choose a **username** — this is your public name on GitHub. Suggestions:
   - `erin-fullest-project`
   - `nicole-fullest-project`
   - Or anything you like — it's just a display name
6. GitHub will ask "Would you like to receive product updates?" — type `n` for no (or `y` if you want)
7. Complete the **verification puzzle** (usually picking images or solving a simple puzzle)
8. Click **"Create account"**
9. Check your email for a **verification code** from GitHub. Enter it on the screen.
10. GitHub may ask you some questions about how you plan to use it — you can click **"Skip this step"** at the bottom

**Done!** Save your username and password somewhere safe.

### Step 2: Get Added to the Project

After creating your account, you need to be added as a **collaborator** on the project repository. Here's how:

1. Send your GitHub username to whoever manages the repo (Patrick)
2. They will add you at: `https://github.com/PMBerrigan/thefullestproject/settings/access`
3. You'll receive an **email invitation** from GitHub — click **"Accept invitation"**
4. You now have access to the project!

### Step 3: Log Into the Blog Editor

1. Go to **https://thefullestproject.org/admin/**
2. Click **"Login with GitHub"**
3. GitHub will ask if you want to authorize the CMS app — click **"Authorize"**
4. You're in! You should see the Decap CMS dashboard with "Blog Posts" and "Podcast Episodes" in the sidebar

**Note:** You only need to authorize once. After that, going to `/admin/` will log you in automatically.

---

## Section 4: Using GitHub (For Making Changes)

This section explains how to use GitHub if you ever need to make changes beyond blog posts — like editing resource data, updating page text, or fixing something.

### Option A: Edit Files Directly on GitHub (Easiest)

You can edit any file right in your web browser without installing anything:

1. Go to **https://github.com/PMBerrigan/thefullestproject**
2. Navigate to the file you want to edit by clicking through folders
   - For example, to edit Virginia resources: click `src` > `_data` > `resources` > `states` > `VA.json`
3. Click the **pencil icon** (top-right of the file content) to edit
4. Make your changes in the editor
5. Scroll down to **"Commit changes"**
6. In the "Commit message" box, type a short description of what you changed (e.g., "Added new therapy resource to Virginia")
7. Make sure **"Commit directly to the main branch"** is selected
8. Click the green **"Commit changes"** button

**That's it!** Your change is saved. If GitHub Actions auto-deploy is set up, the live site will update within a few minutes.

### Option B: Edit Files on Your Computer (More Advanced)

If you prefer to work on your own computer, follow these steps. You only need to do the "First Time Setup" once.

#### First Time Setup

**Install these three programs** (just like installing any app — download and run the installer):

**1. Node.js** — Go to [https://nodejs.org](https://nodejs.org)
   - Click the big green **"LTS"** button (LTS means "Long Term Support" — it's the stable version)
   - **Windows:** Run the downloaded `.msi` file and click Next/Install through the installer. Leave all defaults.
   - **Mac:** Run the downloaded `.pkg` file. It will walk you through the install. Leave all defaults.

**2. Git**
   - **Windows:** Go to [https://git-scm.com](https://git-scm.com). Click **"Download for Windows"**. Run the installer and click Next through everything — **all the defaults are fine**. This also installs "Git Bash" which you'll use to run commands.
   - **Mac:** Open **Terminal** (press `Cmd+Space`, type "Terminal", press Enter). Type `git --version` and press Enter. If Git isn't installed, macOS will prompt you to install it — click **"Install"** and follow the prompts. That's it!

**3. Python** (only needed for running scrapers — skip this if you don't plan to run scrapers)
   - Go to [https://python.org/downloads](https://python.org/downloads)
   - Click the big **"Download Python"** button
   - **Windows:** Run the installer. **IMPORTANT:** At the very first screen, check the box that says **"Add Python to PATH"** before clicking Install.
   - **Mac:** Run the downloaded `.pkg` file and follow the prompts. Python will be added to your system automatically.

#### Download the Project to Your Computer

**How to open a terminal:**
- **Mac (Nicole):** Press `Cmd+Space` to open Spotlight, type **Terminal**, press Enter. A window with a command line will appear.
- **Windows (Erin):** Open the Start menu, search for **Git Bash**, and click it. (Git Bash was installed with Git in step 2 above.)

Type (or copy-paste) these commands one at a time, pressing Enter after each:

```
git clone https://github.com/PMBerrigan/thefullestproject.git
```

What this does: Downloads a complete copy of the project to your computer. A new folder called `thefullestproject` will appear.

```
cd thefullestproject
```

What this does: Moves you into the project folder.

```
npm install
```

What this does: Downloads all the tools the project needs to run. This may take a minute or two. You only need to do this once (or after updates).

#### Preview the Site on Your Computer

Every time you want to see the site locally:

```
npm run dev
```

What this does: Starts a local preview of the site on your computer.

Then open your browser and go to: **http://localhost:8081**

You'll see the full site running on your computer. Any changes you make to files will automatically show up in the browser.

**To stop the preview:** Press `Ctrl+C` in the terminal window (hold Ctrl, then press C). This is the same on both Mac and Windows.

#### Save and Upload Your Changes

After you've made changes on your computer, you need to send them to GitHub. Run these commands one at a time:

**Step 1: See what you changed**
```
git status
```
What this does: Shows a list of files you've modified. Changed files show up in red.

**Step 2: Add your changes**
```
git add .
```
What this does: Tells Git "I want to save all of these changes." The dot (.) means "everything."

**Step 3: Save with a description**
```
git commit -m "Describe what you changed here"
```
What this does: Saves a snapshot of your changes with a description. Put your description between the quotes.

Examples of good descriptions:
- `"Added 5 new resources to California"`
- `"Fixed typo on about page"`
- `"Updated phone number for Arc of Virginia"`

**Step 4: Send to GitHub**
```
git push
```
What this does: Uploads your saved changes to GitHub. If auto-deploy is set up, the live site will update within a few minutes.

#### Get the Latest Changes (Before You Start Working)

If someone else made changes (or changes were made through the blog editor), get them first:

```
git pull
```

What this does: Downloads the latest version from GitHub to your computer. **Always do this before making changes** to avoid conflicts.

---

## Section 5: Deploying to the Live Site

### Option A: Automatic (Recommended)

If GitHub Actions auto-deploy is set up, the site automatically rebuilds and deploys to GoDaddy whenever:
- You publish a blog post through the `/admin/` editor
- Someone pushes changes to GitHub
- The weekly scraper runs

**You don't need to do anything extra.**

### Option B: Manual Deploy (From Your Computer)

If you need to push changes to the live site right now:

```
npm run deploy
```

What this does: Builds the site (creates all the web pages and CSS) and uploads everything to GoDaddy via FTP. This takes about 1-2 minutes.

---

## Section 6: Common Tasks Cheat Sheet

| I want to... | Do this |
|---|---|
| Write a blog post | Go to `thefullestproject.org/admin/` and click "New Blog Posts" |
| Edit a blog post | Go to `thefullestproject.org/admin/`, click "Blog Posts", click the post |
| Check resource submissions | Check your Formspree email notifications |
| Add a resource on GitHub | Go to the state file on GitHub, click the pencil icon, add the resource |
| Update the live site | It happens automatically! Or run `npm run deploy` from your computer |
| Preview the site locally | Run `npm run dev` and open `http://localhost:8081` |
| Get fresh resource data | Run `python scrapers/run_all.py` |
| See if something is broken | Run `npm run build` and check for error messages |
| Get latest changes | Run `git pull` in the project folder |

---

## Section 7: Troubleshooting

### "I can't log into /admin/"
- Make sure you have a GitHub account (see Section 3)
- Make sure your GitHub username has been added as a collaborator (ask Patrick)
- Try clearing your browser cache: press `Ctrl+Shift+Delete`, select "Cached images and files", and click Clear
- Try using a private/incognito window (Ctrl+Shift+N in Chrome)

### "My blog post isn't showing up"
- It can take 2-5 minutes for the site to rebuild after publishing
- Make sure you changed the status from "Draft" to "Ready" before publishing
- Check that the date on the post isn't set in the future
- Try doing a hard refresh on the page: press `Ctrl+Shift+R`

### "The site looks broken / unstyled"
- If the site looks like plain text with no colors or formatting, the CSS didn't build
- Run `npm run build` on your computer and look for error messages
- If you see red text, that's the error — screenshot it and share with your developer

### "git push says 'rejected' or 'failed'"
- This usually means someone else made changes you don't have yet
- Run `git pull` first, then try `git push` again
- If you see a message about "merge conflicts," ask your developer for help

### "npm run dev isn't working"
- Make sure you're in the project folder (you should see files like `package.json` when you run `ls`)
- Try running `npm install` first to make sure all tools are up to date
- Make sure Node.js is installed: run `node --version` — you should see a number like `v20.x.x`

### "I accidentally changed something and want to undo it"
- If you haven't committed yet: `git checkout .` (this undoes all uncommitted changes)
- If you already pushed and the site is broken, contact your developer
- Don't panic — Git keeps a history of every change, so nothing is ever truly lost

### "I need help"
- Contact your developer (Patrick)
- File an issue on GitHub: go to https://github.com/PMBerrigan/thefullestproject/issues and click "New Issue"

---

## Important Links

- **Live site:** https://thefullestproject.org
- **Blog editor:** https://thefullestproject.org/admin/
- **GitHub repository:** https://github.com/PMBerrigan/thefullestproject
- **Resource submissions:** Check Formspree dashboard
- **Report a problem:** https://github.com/PMBerrigan/thefullestproject/issues
