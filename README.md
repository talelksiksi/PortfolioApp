# cictnardc.net: website, portfolio and live demos

| Address | What | Source |
| --- | --- | --- |
| `/` | Company website, in English, French and Arabic | `website/` |
| `/portfolio/` | Portfolio: the apps as simple cards, in three languages | `portfolio/` |
| `/portfolio/<app>/` | Each live demo app | `apps/<app>/`, refreshed by `scripts/sync-apps.sh` |
| `/portfolio/desktop/` | The retro desktop below ("CICTNA OS"), linked from the portfolio as the playful version | repo root |

The demo apps used to run on Vercel. They are now served from cictnardc.net.
Each app keeps its own repo as the source; `scripts/sync-apps.sh` copies the
ready-to-serve files into `apps/` (building the two React apps for their
sub-path). Then commit and push. Cloudflare only copies files, it never builds.

| App | Repo | Address |
| --- | --- | --- |
| Plant Spare Parts Store | this repo, `apps/spare-parts-store` | /portfolio/spare-parts-store/ |
| Dental Clinic Manager | dental-clinic-demo | /portfolio/dental-clinic/ |
| Mon Cabinet | gp-doctor-office | /portfolio/gp-office/ |
| Warehouse Control Room | warehouse-dashboard | /portfolio/warehouse-dashboard/ |
| Plant Data Logger | plant-data-logger-demo | /portfolio/plant-data-logger/ |
| Integration Toolkit | integration-toolkit | /portfolio/integration-toolkit/ |
| Batch Dosing Gateway | this repo, `apps/batch-dosing-gateway` | /portfolio/batch-dosing-gateway/ |
| Sheet to Database | this repo, `apps/sheet-to-database` | /portfolio/sheet-to-database/ |
| OPC UA Explorer | opcua-explorer (its `src/OpcUaExplorer/wwwroot` folder; the page runs on a simulated plant when served without its service) | /portfolio/opcua-explorer/ |

OPC UA Explorer is synced from the page folder of its own repo, so its listing
screenshots are kept here instead, in `assets/previews/opcua-explorer/`.

Unlisted, online for direct links only (not on the portfolio page or the
desktop, and sent with `X-Robots-Tag: noindex`):

| App | Repo | Address |
| --- | --- | --- |
| Warehouse Management Portal | warehouse-portal-demo | /portfolio/warehouse-portal/ |
| Tray Store Controller | tray-store-controller | /portfolio/tray-store-controller/ |

The spare parts store, the dosing gateway and Sheet to Database have no build
step and live directly in `apps/`. They share `css/kit.css` and `js/kit.js`
(languages, tables, dialogs, small charts); keep the copies the same.

Old links keep working: `/portfolio/#project/<id>` scrolls to that app's card,
`/portfolio/#about`, `#terminal` and the other desktop links open the retro
desktop, `/portfolio/#contact` goes to the website's contact form, and
`/portfolio/quick.html` goes to the new portfolio page.

The website, portfolio page, retro desktop and Integration Toolkit share the
`lang` setting in the browser, so a language picked on one carries over.

# CICTNA OS (retro desktop)

The portfolio and landing page for Talel Ksiksi / CICTNA RDC, built as a retro
desktop. Visitors boot the machine, open project folders, read the bio in
Notepad, poke the Command Prompt, browse the Recycle Bin of failed experiments
and send an enquiry from the mail client.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

```bash
python3 -m http.server 4173   # or: npx serve .
```

Open http://localhost:4173 for the retro desktop on its own. Add `?noboot` to skip the boot sequence.
To see the whole site as it goes live, run `scripts/build-cloudflare.sh` and serve `dist/` instead.

## Deep links

Every window has a shareable URL, handy for proposals and outreach emails:

| Link | Opens |
| --- | --- |
| `/#projects` | Projects folder |
| `/#project/<id>` | One project (`integration-toolkit`, `batch-dosing-gateway`, `opcua-explorer`, `plant-data-logger`, `warehouse-dashboard`, `spare-parts-store`, `gp-office`, `dental-clinic`) |
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
files and the contact settings. Only projects with a public `live` demo are
shown; add one to `PROJECTS` with its `live` URL and `shot` screenshot and it
appears in the apps showcase, the desktop and the deep links. Text that changes with the language is written
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
- **Analytics**: on cictnardc.net, turn on Cloudflare Web Analytics for the
  `cictnardc` Worker (no code needed). The vercel.app copy loads Vercel Web
  Analytics.
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

The website and the portfolio share the `lang` setting in localStorage, so a
language picked on one carries over to the other.

### Vercel (old copies)

The repo is also connected to Vercel (`portfolioapp-pearl-theta.vercel.app`),
and each demo app still has its old vercel.app address. Nothing links to them
any more. Keep them until every platform profile, gig and proposal points at
cictnardc.net (the gig images under `/portfolio/warehouse-portal/previews/` are
now served from cictnardc.net too), then delete the Vercel projects.

## Layout

```
index.html               shell: boot screen, desktop, apps showcase, taskbar, start menu
quick.html               one-page quick view
css/style.css            the whole look
js/i18n.js               language state and interface strings (EN/FR)
js/data.js               content: projects, track record, Recycle Bin, services, settings
js/icons.js              pixel icons (inline SVG)
js/wallpaper.js          animated pixel-art wallpaper (the cictnardc.net hero scene)
js/wm.js                 window manager: focus, drag, resize, minimise, taskbar
js/apps.js               the programs
js/extras.js             sound, Track Record, Book a Call, TraySweeper
js/main.js               boot, desktop icons, apps showcase, start menu, deep links
assets/                  logo, link preview, CVs, project screenshots
website/                 the cictnardc.net company website (served at /)
portfolio/               the portfolio page (served at /portfolio/)
apps/                    the demo apps, as served (refresh with scripts/sync-apps.sh)
scripts/                 sync the apps, build and deploy cictnardc.net
wrangler.jsonc           the cictnardc Cloudflare Worker
```
