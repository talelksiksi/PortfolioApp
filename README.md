# CICTNA OS — portfolio

The portfolio and landing page for Talel Ksiksi / CICTNA RDC, built as a retro
desktop. Visitors boot the machine, open project folders, read the bio in
Notepad, poke the Command Prompt, browse the Recycle Bin of failed experiments
and send an enquiry from the mail client.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

```bash
python3 -m http.server 4173   # or: npx serve .
```

Open http://localhost:4173. Add `?noboot` to skip the boot sequence.

## Deep links

Every window has a shareable URL, handy for proposals and outreach emails:

| Link | Opens |
| --- | --- |
| `/#projects` | Projects folder |
| `/#project/<id>` | One project (`integration-toolkit`, `tray-store-controller`, `opcua-connector`, `warehouse-dashboard`, `warehouse-portal`, `dental-clinic`) |
| `/#about` | About_Me.txt |
| `/#services` | Hire_Us.hlp |
| `/#contact` | Contact form |
| `/#terminal` | Command Prompt |
| `/#trash` | Recycle Bin |
| `/#cv/en`, `/#cv/fr` | The CV in English or French |
| `/#track` | Track record |
| `/#book` | Book a call |
| `/#game` | TraySweeper |
| `/quick.html` | One-page quick view (add `?lang=fr` for French) |
| `/#fr`, `/#en` | Switch the whole desktop to French or English |

## Editing content

All copy lives in `js/data.js`: projects, Recycle Bin entries, services, the CV
files and the contact settings. Text that changes with the language is written
as `{ en: "...", fr: "..." }`. Interface strings (menus, buttons, dialogs, the
boot and welcome screens) are in `js/i18n.js`; the bio text is `ABOUT` in
`js/apps.js`.

The site starts in French for visitors whose browser is set to French and in
English otherwise. The language icon on the desktop, the EN/FR button in the
taskbar and the `lang` terminal command all switch it, and open windows reopen
in place in the new language.

## Contact form

The form posts to Web3Forms, which emails `contact@cictnardc.net`. The access
key is `SITE.web3formsKey` in `js/data.js`; get one at https://web3forms.com by
entering that address. The key is public by design (it can only send to our
inbox). With no key, or if sending fails, visitors are offered their own mail
app instead.

## Extras

- **Book a call** sends the chosen day, time window, time zone and call type
  through the same Web3Forms key as the contact form. Swap it for a Calendly or
  Cal.com link later if you prefer self-service booking.
- **Sound**: start-up chime and game sounds are synthesised with Web Audio (no
  files). The speaker in the taskbar mutes them; the choice is remembered.
- **Analytics**: on cictnardc.net, turn on Cloudflare Web Analytics for the Pages
  project (no code needed). The vercel.app copy loads Vercel Web Analytics.
- **Use my mail app** opens a chooser: the device's mail program (mailto), Gmail
  or Outlook.com in the browser with the message pre-filled, or copy the address.
  A mailto link alone does nothing on computers without a mail program set up.
- **Link previews**: `assets/og.png` (1200x630), referenced as
  `https://cictnardc.net/portfolio/assets/og.png`.
- **Project screenshots** live in `assets/shots/`; set `shot` on a project in
  `js/data.js` to show one.

## Deploy

### cictnardc.net (main home)

cictnardc.net and www.cictnardc.net are served by the Cloudflare Worker
`cictnardc` (static assets only, configured in `wrangler.jsonc`). The company
website lives in `website/`; `scripts/build-cloudflare.sh` assembles `dist/`
with the website at `/` and this portfolio at `/portfolio/`.

Deploys run through Cloudflare Workers Builds, connected to this repo:

- Build command: `bash scripts/build-cloudflare.sh`
- Deploy command: `npx wrangler deploy`
- Every push to the production branch goes live.

From a computer with a Cloudflare token (Workers Scripts: Edit) you can also run
`scripts/deploy-cloudflare.sh [upload|live|rollback]`. Rollback is also in the
dashboard: Workers & Pages, cictnardc, Deployments.

The website's "Try the work, live" section (`#portfolio`) shows
`website/portfolio-desktop.jpg` and `website/portfolio-phone.jpg` and links each
project card to `/portfolio/#project/<id>`. Retake those two screenshots when the
portfolio's look changes.

The website and the portfolio share the `lang` setting in localStorage, so a
language picked on one carries over to the other.

### Vercel (backup copy)

The repo is also connected to Vercel (`portfolioapp-pearl-theta.vercel.app`),
which redeploys on every push. `.vercelignore` keeps the website and scripts
out of it.

## Layout

```
index.html        shell: boot screen, desktop, taskbar, start menu
css/style.css     the whole look
js/i18n.js        language state and interface strings (EN/FR)
js/data.js        content
js/icons.js       pixel icons (inline SVG)
js/wallpaper.js   animated pixel-art sunset wallpaper
js/extras.js      sound, Track Record, Book a Call, TraySweeper
quick.html        one-page quick view
js/wm.js          window manager: focus, drag, resize, minimise, taskbar
js/apps.js        the programs
js/main.js        boot, desktop icons, start menu, deep links
assets/logo.svg   CICTNA mark
```
