# IIT (BHU) Varanasi — Varsity Athletics Website

A responsive athletics-team website built as a static HTML/CSS/JavaScript project. It is ready to upload to a GitHub repository and deploy with GitHub Pages.

## Quick start

1. Create a new GitHub repository.
2. Upload **all files in this folder** (especially `index.html` and `.github/workflows/deploy.yml`).
3. Open **Settings → Pages** and select **GitHub Actions** as the build/deployment source.
4. Push to the `main` branch. The workflow publishes the site automatically.
5. Open the URL shown under **Settings → Pages**.

You can also preview it locally by opening `index.html` in a modern browser. For the best testing experience, use a local server (for example, VS Code's Live Server).

## Features included

- Responsive home page and navigation
- Athlete profiles and personal-best records
- Medal/achievement listings
- Events and meet information
- Training schedule and performance toolkit
- Gallery, coaches/leaders and alumni sections
- Tryout/registration interface
- Admin-style editing interface for site content
- Browser-side saving and JSON export/import tools
- Theme-aware styling and mobile navigation

## Important: data and admin security

This is a **static-site version**. Content edits are stored in the current browser's `localStorage`; they are not shared with other visitors, and can be lost if browser storage is cleared. JSON export/import can be used to move the demo data between browsers.

The current HTML contains a **demo-only PIN login** and sample data. A PIN embedded in a public HTML file is not secure authentication: anyone can inspect the source and bypass it. Do not use this admin login for private information or as production security. GitHub Pages cannot run a private server or protect database credentials.

Before using the admin dashboard for real team operations, connect a backend such as Supabase:
- Use Supabase Auth for admin sign-in (no hard-coded PINs).
- Store athletes, results, events, announcements and gallery metadata in database tables.
- Store uploaded photos in Supabase Storage.
- Enable Row Level Security (RLS) and allow write operations only to authenticated admin users.
- Keep service-role keys on a server only; never place them in browser JavaScript.
- Configure contact/tryout submissions to write to a protected backend or a form service; a static HTML form alone cannot securely deliver submissions.

## Before publishing publicly

The site includes illustrative/demo athlete names, performance results, coach contact details and competition information. Verify, replace or remove all sample data before publishing. Confirm you have permission to publish athlete details and photos.

## Project structure

```text
iit-bhu-athletics/
├── index.html
├── .nojekyll
├── .gitignore
├── README.md
├── google-apps-script/
│   └── Code.gs
└── .github/
    └── workflows/
        └── deploy.yml
```

## Deployment workflow

The included GitHub Actions workflow publishes the repository root to GitHub Pages whenever changes are pushed to `main`. If your default branch is named differently, update the workflow trigger accordingly.


## Google Sheets sync (optional)

The `google-apps-script/Code.gs` file provides a Google Apps Script bridge. The website can load the latest JSON database from a Google Sheet, and authenticated admin edits can publish the full database back to the Sheet.

### One-time setup

1. Create a Google Sheet for the athletics website.
2. In the sheet, open **Extensions → Apps Script** and replace the editor contents with `google-apps-script/Code.gs`.
3. In Apps Script, open **Project Settings → Script Properties** and add `ADMIN_SYNC_KEY` with a long, unique secret. Do not share this key publicly.
4. Select `setupSheet` in the function dropdown and run it once; approve the requested Google permissions. It creates the `WebsiteData` tab.
5. Deploy → **New deployment** → **Web app**. Choose **Execute as: Me** and the access setting permitted by your account/policy that allows website visitors to read the public site data. Deploy and copy the `/exec` URL.
6. On the website, open **Admin → Google Sheets sync**, paste the web-app URL, click **Save connection**, click **Set admin sync key**, and enter the same key.
7. If the Sheet is empty, first click **Publish current website data to Sheet**. If the Sheet already contains site data, click **Load from Google Sheet** instead.

### How data flows

- Website admin edits save in the browser and queue a write to the connected Sheet when the admin key is configured.
- The public website loads the Sheet data on page load when a connection URL has been configured in that browser. For all visitors to automatically load shared data, paste the deployed URL into `PUBLIC_SHEETS_WEB_APP_URL` near the Google Sheets sync code in `index.html` before publishing. If left blank, the URL must be configured separately in each browser through the Admin panel.
- The Sheet stores the full website database as JSON in `WebsiteData!B2` (last-updated timestamp in `A2`). This is a straightforward bridge for syncing the existing site's data model, but editing the JSON cell manually is not friendly for non-technical users. Use the website admin to edit individual records, or ask for a tab-per-data-type importer if you want normal spreadsheet columns (one athlete per row, one medal per row, etc.).
- Google Apps Script web apps can be restricted by Google Workspace policy. If public web-app access is not allowed, use an approved backend such as Supabase.

### Security and reliability notes

This is a practical starter integration, not a production multi-user database. A static website cannot keep a client-side key secret from someone who can inspect browser storage/source. The Apps Script validates the key for writes, but do not treat the website as secure storage for confidential data. Public read access is intentional so the site can display roster/results. Avoid storing private student information. The website sends writes with a no-CORS request, so the browser cannot read the response body; use **Load from Google Sheet** after publishing to verify the latest data. For production use, a backend with real user authentication, audit logging and structured tables is preferable.
