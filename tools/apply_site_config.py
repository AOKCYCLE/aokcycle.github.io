"""Apply site.config.json to the website in one step.

Use it when you:
  * move to a custom domain   -> change "siteUrl", e.g. "https://www.example.com"
  * verify Google Search Console with the HTML-tag method -> paste the token into "googleSiteVerification"
  * switch on Google Analytics 4 -> paste the ID (G-XXXXXXX) into "ga4MeasurementId"

Then run, from the website folder:
    python tools/apply_site_config.py

It updates the canonical URL, Open Graph and X/Twitter tags, structured data,
sitemap.xml, robots.txt and legal.html, adds the Search Console tag and the GA4 ID,
and writes the CNAME file GitHub Pages needs for a custom domain.
Nothing is sent anywhere; it only edits files in this folder.
"""
import io, json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def path(*p):
    return os.path.join(ROOT, *p)


def read(p):
    return io.open(path(p), encoding='utf-8').read()


def write(p, s):
    io.open(path(p), 'w', encoding='utf-8', newline='\n').write(s)


cfg = json.load(io.open(path('site.config.json'), encoding='utf-8'))
new = cfg['siteUrl'].rstrip('/')
if not re.match(r'^https://[a-z0-9.-]+$', new):
    sys.exit('siteUrl must look like https://example.com (https, no path)')

index = read('index.html')
old = re.search(r'<link rel="canonical" href="(https://[^"/]+)/?"', index).group(1)
changed = []

# 1) base URL everywhere it appears
for f in ['index.html', 'legal.html', 'sitemap.xml', 'robots.txt']:
    s = read(f)
    s2 = s.replace(old + '/', new + '/').replace(old + '"', new + '"')
    if f == 'sitemap.xml':
        s2 = re.sub(r'<lastmod>[^<]*</lastmod>', '<lastmod>%s</lastmod>' % datetime.date.today().isoformat(), s2)
    if s2 != s:
        write(f, s2); changed.append(f)

# 2) Google Search Console verification tag
index = read('index.html')
index = re.sub(r'\n  <meta name="google-site-verification" content="[^"]*">', '', index)
token = cfg.get('googleSiteVerification', '').strip()
if token:
    if not re.match(r'^[A-Za-z0-9_-]+$', token):
        sys.exit('googleSiteVerification should be only the content="..." value Google gives you')
    index = index.replace('<!-- Google Search Console:', '<meta name="google-site-verification" content="%s">\n  <!-- Google Search Console:' % token, 1)
write('index.html', index)

# 3) Google Analytics 4
ga = cfg.get('ga4MeasurementId', '').strip()
if ga and not re.match(r'^G-[A-Z0-9]+$', ga):
    sys.exit('ga4MeasurementId should look like G-XXXXXXXXXX')
conf = read('js/config.js')
conf2 = re.sub(r'ga4: "[^"]*"', 'ga4: "%s"' % ga, conf)
if conf2 != conf:
    write('js/config.js', conf2); changed.append('js/config.js')

# 4) custom domain file for GitHub Pages
host = new.split('://', 1)[1]
if not host.endswith('.github.io'):
    write('CNAME', host + '\n'); changed.append('CNAME')
    print('CNAME written for %s. Point your DNS to GitHub Pages, then tick "Enforce HTTPS" in the repo settings.' % host)
elif os.path.exists(path('CNAME')):
    print('Note: a CNAME file exists but siteUrl is a github.io address. Delete CNAME if you no longer use the custom domain.')

print('Site URL: %s -> %s' % (old, new))
print('Search Console tag: %s' % ('set' if token else 'not set'))
print('GA4: %s' % (ga or 'not set'))
print('Updated: %s' % (', '.join(sorted(set(changed))) or 'nothing else'))
print('Remember to bump the ?v= numbers in index.html if you also changed CSS or JS, then commit and push.')
