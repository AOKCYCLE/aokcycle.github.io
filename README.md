# Ahmed Osama — Personal Website

Personal brand and consulting website for **Ahmed Osama Abdelatty**, Commercial Director in AI compute and data-centre infrastructure, based in Dubai.

Built as a fast static site (plain HTML/CSS/JS), hosted free on **GitHub Pages**.

Cinematic black-and-ivory design with Art-Deco line art.

What powers it:
- **WebGL stage** (`js/scene.js`): an endless grid floor, a turning monolith tower and a sunburst, all drawn in a shader. Scrolling flies the camera.
- **GSAP + ScrollTrigger + SplitText:** loader, entry screen, blur-in titles, scroll chapters, masked heading reveals, count-up numbers
- **Lenis:** smooth scrolling, synced to GSAP's ticker
- **Web Audio** (`js/sound.js`): an optional ambient soundtrack generated live (no audio files), only after the visitor chooses "Enter with sound"

Everything respects `prefers-reduced-motion`.

---

## Quick edits

| What | Where |
|---|---|
| YouTube / TikTok / Instagram / X / Facebook links | `js/config.js`: paste each link between the quotes |
| Your photo | Save it as `assets/ahmed.jpg` (portrait, about 1000×1250 px). It replaces the gold "AO" automatically |
| Your CV | Replace `assets/Ahmed-Osama-CV.pdf` (keep the same file name) |
| Text, services, jobs | `index.html` |
| Colours & fonts | Top of `css/style.css` (`:root` section) |

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
