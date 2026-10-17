# czahner.com

Personal site for Chad Zahner: home, résumé, and lab.

```
index.html          Home
resume/index.html   Résumé (the "Save as PDF" button prints a clean copy)
lab/index.html      Projects
assets/style.css    Shared styles (light and dark mode)
assets/favicon.svg  Tab icon
404.html            Not-found page
CNAME               Tells GitHub Pages to serve this repo at czahner.com
```

## Put it online with GitHub Pages (free)

1. On GitHub (account: SpacemanchadZ), create a new **public** repository named `czahner.com`.
2. Click **Add file → Upload files**, drag in everything from this folder (keep the `assets`, `resume`, and `lab` folders), and click **Commit changes**.
3. Open the repo's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, pick **main** and **/ (root)**, and save.
4. In the same page, the **Custom domain** box should already show `czahner.com` (from the CNAME file). If not, type it and save.

## Point the domain at GitHub

At the company where you bought czahner.com, open its **DNS settings**, delete any default "parking" records, and add:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | spacemanchadz.github.io |

DNS changes can take from a few minutes to a few hours. Once GitHub shows the domain as verified, check **Enforce HTTPS** in Settings → Pages. That's the free SSL certificate. There's no need to buy one.

## Updating the site

Edit a file on GitHub (pencil icon) and commit. The live site updates in about a minute.
