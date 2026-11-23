# Ahmed Osama — Personal Website

Sales website for **Ahmed Osama**, a Dubai-based consultant and dealmaker: AI data centres and GPU compute, e-commerce and websites that sell, gaming PCs and esports, business and financial strategy, brand expansion and enterprise deals.

Built as a fast static site (plain HTML/CSS/JS), hosted free on **GitHub Pages**.

Cinematic black-and-ivory design with Art-Deco line art.

What powers it:
- **WebGL stage** (`js/scene.js`): an endless grid floor, a turning monolith tower and a sunburst, all drawn in a shader. Scrolling flies the camera.
- **GSAP + ScrollTrigger + SplitText:** loader, entry screen, blur-in titles, scroll chapters, masked heading reveals, count-up numbers
- **Lenis:** smooth scrolling, synced to GSAP's ticker
- **React Bits ideas rebuilt in plain JS** (`js/effects.js`): Rotating Text, Circular Text, Flowing Menu, Magic Bento, Pixel Transition, Image Trail, Click Spark, Scramble Text, Scroll Velocity
- **Web Audio** (`js/sound.js`): an optional ambient soundtrack generated live (no audio files), only after the visitor chooses "Enter with sound"
- **Contact form → email** via [FormSubmit](https://formsubmit.co) (no server needed)

Everything respects `prefers-reduced-motion`.

---

## Quick edits

| What | Where |
|---|---|
| Social links | `js/config.js`: paste each link between the quotes |
| Your photos | Replace the files in `assets/me/` (keep the same names), graded and cropped for the site |
| Featured YouTube video | In `index.html`, search for `rE_Zyc-e_kE` and replace it with the new video ID (thumbnail + player update together) |
| Form delivery email | `formEndpoint` in `js/config.js` |
| Text, services, projects | `index.html` |
| Colours & fonts | Top of `css/style.css` (`:root` section) |

After editing `js/config.js`, bump the `?v=` number on it in `index.html` so visitors get the update straight away.

### Activating the contact form
The first time someone sends the form, FormSubmit emails **ahmedosamakarmallah7@gmail.com** an "Activate Form" link. Click it once; every request after that arrives in that inbox. (If you later move to your own domain, FormSubmit may ask you to activate once more.)

---

## Publish on GitHub Pages

1. Create a **public** repository on GitHub (for example `ahmed-osama-website`).
2. Upload **everything in this folder** (`index.html`, `css/`, `js/`, `assets/`, `.nojekyll`, `404.html`, `robots.txt`) to the root of the repository.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **Source: Deploy from a branch**, **Branch: `main`**, folder **`/ (root)`**, then **Save**.
5. Wait 1–2 minutes. The site will be live at `https://YOUR-USERNAME.github.io/ahmed-osama-website/`.

---

## Connect your own domain (the last step)

You need a domain from any registrar (GoDaddy, Namecheap, Cloudflare, Google/Squarespace Domains…). Example used below: `ahmedosama.com`.

### Step 0: Update the site's own links (one command)
Open `site.config.json`, set `"siteUrl"` to your new address (for example `"https://ahmedosama.com"`), then run from this folder:

```
python tools/apply_site_config.py
```

It updates the canonical link, social preview tags, structured data, `sitemap.xml`, `robots.txt` and `legal.html`, and writes the `CNAME` file. Commit and push, then continue with Step 1.

### Step 1: Tell GitHub your domain
Repository **Settings → Pages → Custom domain**, type `ahmedosama.com`, then **Save**.
GitHub adds a `CNAME` file to the repository automatically.

### Step 2: Add DNS records at your registrar
In your registrar's **DNS settings**, delete any existing `A` / `AAAA` records for `@`, then add:

| Type | Host / Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `YOUR-USERNAME.github.io` |

(Replace `YOUR-USERNAME` with your GitHub username. If you use Cloudflare, set these records to **DNS only**, the grey cloud, until HTTPS is working.)

### Step 3: Turn on HTTPS
DNS changes can take from 10 minutes up to 24 hours. When **Settings → Pages** shows *"DNS check successful"*, tick **Enforce HTTPS**.

### Step 4 (recommended): Verify the domain
GitHub **profile picture → Settings → Pages → Add a domain**. Add the TXT record GitHub shows you at your registrar. This stops anyone else from using your domain on GitHub.

### Check it
- `https://ahmedosama.com` opens the site with a padlock
- `https://www.ahmedosama.com` redirects to it

---

## Search engines & analytics

All three settings live in `site.config.json`. After changing any of them, run `python tools/apply_site_config.py`, commit and push.

### Google Search Console (needs your Google account)
1. Go to https://search.google.com/search-console and add a **URL prefix** property for the site address.
2. Choose **HTML tag**. Copy only the `content="..."` value into `"googleSiteVerification"`.
3. Run the tool, push, wait for GitHub Pages to publish, then press **Verify** in Search Console.
4. In Search Console open **Sitemaps** and submit `sitemap.xml`.

### Google Analytics 4 (needs your Google account)
Create a GA4 property and web data stream, copy the Measurement ID (`G-XXXXXXXXXX`) into `"ga4MeasurementId"` and run the tool. Advertising features stay off. A successful enquiry is recorded as the `generate_lead` event.

### Case studies
Each case card in `index.html` carries its full story inside `<div class="case__detail" hidden>`. Search engines read it there and the side panel opens it. Edit the text in place.
