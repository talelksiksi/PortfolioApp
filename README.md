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

## Deploy

Static site: import the repo in Vercel with framework preset "Other", no build
command, output directory `.`.

## Layout

```
index.html        shell: boot screen, desktop, taskbar, start menu
css/style.css     the whole look
js/i18n.js        language state and interface strings (EN/FR)
js/data.js        content
js/icons.js       pixel icons (inline SVG)
js/wallpaper.js   animated pixel-art sunset wallpaper
js/wm.js          window manager: focus, drag, resize, minimise, taskbar
js/apps.js        the programs
js/main.js        boot, desktop icons, start menu, deep links
assets/logo.svg   CICTNA mark
```
