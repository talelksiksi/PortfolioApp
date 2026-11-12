# CICTNA RDC

Everything for the company website, logo, email and outreach in one place.

## Folders

**website**
The files that go online at cictnardc.net. They are published automatically: the Cloudflare Worker `cictnardc` is connected to the GitHub repo talelksiksi/PortfolioApp and rebuilds on every push to `main`, together with the portfolio at cictnardc.net/portfolio/. No manual uploads any more (a manual upload would remove the portfolio).
- index.html: the website
- talel.jpg: your photo in the About section
- og-image.png: the preview card shown when the link is shared on LinkedIn, WhatsApp or email
- email-logo.png: the logo the email signature loads from cictnardc.net
- favicon.svg and favicon.png: the browser tab and phone home-screen icon

Settings inside index.html:
- ACCESS_KEY: the Web3Forms contact form key (already set)
- BOOKING_URL = "": your Cal.com link for the booking button (setup guide, Part 7)

**logo**
- cictna-logo-mark.png: the round mark, 1024 px, transparent
- cictna-logo-mark.svg: the vector original, sharp at any size
- cictna-logo-full.png: mark with name and tagline, for light backgrounds
- cictna-logo-full-white.png: same with white text, for dark backgrounds

**email-signature**
- email-signature.html: open in a browser, copy, paste into Zoho Mail under Settings, Signatures
- email-signature-preview.png: what it looks like

**SETUP_GUIDE_DOMAIN_SITE_EMAIL.md**
Step by step: domain at Cloudflare, website on Cloudflare Pages, Zoho Mail with talel@ and contact@, anti-spam records, testing, and the sending warm-up.

## Online

- New drafts arrive every weekday at 7:48 Tunis time, now including Gulf prospects.
- LinkedIn: https://www.linkedin.com/in/ksiksi
- WhatsApp: +33 6 51 28 75 00

## Addresses

- talel@cictnardc.net: main mailbox, used for outreach
- contact@cictnardc.net: alias shown on the website, lands in talel@
