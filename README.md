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

## Editing content

All copy lives in `js/data.js`: projects, Recycle Bin entries, services and the
contact settings. The bio text is `ABOUT` in `js/apps.js`.

## Contact form

The form posts to FormSubmit (`SITE.contactEndpoint` in `js/data.js`), which
forwards to `contact@cictnardc.net`. The first submission sends a one-time
activation email to that inbox; click the link in it and later messages arrive
normally. If the endpoint fails, the visitor is offered their own mail app.
Set `contactEndpoint` to `""` to always use the mail app.

## Deploy

Static site: import the repo in Vercel with framework preset "Other", no build
command, output directory `.`.

## Layout

```
index.html        shell: boot screen, desktop, taskbar, start menu
css/style.css     the whole look
js/data.js        content
js/icons.js       pixel icons (inline SVG)
js/wm.js          window manager: focus, drag, resize, minimise, taskbar
js/apps.js        the programs
js/main.js        boot, desktop icons, start menu, deep links
assets/logo.svg   CICTNA mark
```
