# CICTNA RDC: domain, website and email setup

Follow top to bottom. About 1 to 1.5 hours in total, most of it waiting for DNS.
Total cost: the domain only, about 11 to 12 USD per year.

---

## Before you start

- [ ] A payment card that works for international online payments (the same one you used for Google Workspace or Squarespace). Cloudflare needs it for the domain.
- [ ] The website file `index.html`, saved in a folder on your computer. Name the folder `cictnardc-site`.
- [ ] Decide the domain. This guide uses **cictnardc.net**. If you pick something else, replace it everywhere below AND in `index.html` (it appears twice near the bottom: in `mailto:contact@cictnardc.net` and in the line showing the address).

---

## Part 1: Register the domain at Cloudflare (15 min)

1. [ ] Go to **dash.cloudflare.com** and create a free account. Confirm the email they send you.
2. [ ] In the left menu, open **Domain Registration**, then **Register Domains**.
3. [ ] Search `cictnardc.net`. If it is available, click **Purchase**.
4. [ ] Choose **1 year**. Turn **Auto renew ON** so it never lapses again.
5. [ ] Fill in the registrant contact details (company name CICTNA RDC, your address and phone). Cloudflare hides them from public WHOIS automatically.
6. [ ] Pay. The domain appears in your account within a few minutes, already using Cloudflare DNS. Nothing else to configure for the domain itself.

Check: in the left menu, **Websites** (or **Account Home**) now lists `cictnardc.net` as **Active**.

---

## Part 2: Put the website online with Cloudflare Pages (15 min, free)

1. [ ] Left menu: **Workers & Pages**, then **Create**.
2. [ ] Choose the **Pages** tab. (If you only see Workers options, look for a link saying "Looking to deploy Pages? Get started".)
3. [ ] Choose **Upload assets** (also called Direct Upload).
4. [ ] Project name: `cictnardc`. Click **Create project**.
5. [ ] Drag in the **folder** `cictnardc-site` that contains `index.html`. Click **Deploy site**.
6. [ ] You get a test address like `cictnardc.pages.dev`. Open it and check the page loads. Try the EN / FR switch.

Connect your domain:

7. [ ] In the project, open **Custom domains**, then **Set up a custom domain**.
8. [ ] Enter `cictnardc.net`, continue, and **Activate domain**. Cloudflare adds the DNS record itself.
9. [ ] Repeat for `www.cictnardc.net`.
10. [ ] Wait 5 to 30 minutes, then open `https://cictnardc.net`. The padlock (HTTPS) is automatic.

To update the site later: open the project, **Create new deployment**, upload the folder again.

---

## Part 3: Email with Zoho Mail, free plan (30 to 45 min)

### 3a. Sign up

1. [ ] Go to **zoho.eu/mail** (the European data centre, closer to your clients and their GDPR expectations).
2. [ ] Open **Pricing**. Scroll to the bottom and find the **Forever Free** plan, then **Sign up now**.
   - If Forever Free is not offered to you, take **Mail Lite** (about 1 USD per user per month). Everything below is the same.
3. [ ] Choose **Sign up with a domain I already own** and enter `cictnardc.net`.
4. [ ] Create your admin account. Use `talel` as the username so your main mailbox is **talel@cictnardc.net**. This is the one you send outreach from.

### 3b. Prove you own the domain

5. [ ] Zoho shows a **TXT** record to verify the domain, something like `zoho-verification=zb12345678.zmverify.zoho.eu`.
6. [ ] In another tab: Cloudflare, click your domain, then **DNS**, then **Records**, then **Add record**.
   - Type: `TXT`
   - Name: `@`
   - Content: paste exactly what Zoho gave you
   - Save
7. [ ] Back in Zoho, click **Verify**. If it fails, wait 5 minutes and try again.

### 3c. Mail delivery records (MX)

Zoho shows three MX records. **Copy the values Zoho shows you.** For the EU data centre they are normally:

| Type | Name | Mail server | Priority |
|---|---|---|---|
| MX | @ | mx.zoho.eu | 10 |
| MX | @ | mx2.zoho.eu | 20 |
| MX | @ | mx3.zoho.eu | 50 |

8. [ ] Add all three in Cloudflare DNS (Add record, type MX, one at a time).
9. [ ] In Zoho, click **Verify MX**.

### 3d. Anti-spam records (do not skip, this decides whether your outreach lands in inboxes)

**SPF**, says Zoho is allowed to send for your domain:

10. [ ] Cloudflare, Add record:
    - Type: `TXT`
    - Name: `@`
    - Content: `v=spf1 include:zohomail.eu ~all`
    - (Use exactly what Zoho shows if it differs.)

**DKIM**, signs every email you send:

11. [ ] In Zoho admin console: **Domains**, click your domain, **Email Configuration**, **DKIM**, **Add**.
12. [ ] Selector name: `zmail`. Generate the key.
13. [ ] Zoho shows a TXT record name (like `zmail._domainkey`) and a long value starting with `v=DKIM1; k=rsa; p=...`
14. [ ] Cloudflare, Add record:
    - Type: `TXT`
    - Name: `zmail._domainkey`
    - Content: paste the whole long value
15. [ ] Back in Zoho, click **Verify** next to DKIM and make sure it is **enabled**.

**DMARC**, tells Gmail and Outlook what to do with mail that fails the checks:

16. [ ] Cloudflare, Add record:
    - Type: `TXT`
    - Name: `_dmarc`
    - Content: `v=DMARC1; p=none; rua=mailto:contact@cictnardc.net`

### 3e. Add contact@ as an alias (the address shown on the website)

17. [ ] Zoho admin console: **Users**, click **talel**, find **Mail aliases** (or **Email alias**), **Add**, type `contact`, save.
    - Mail sent to contact@cictnardc.net now lands in the talel@ inbox. One inbox to check.
    - If the free plan does not allow aliases: create a second user `contact` instead (the free plan allows five), then in that user's settings set up forwarding to talel@cictnardc.net.

### 3f. Finish

18. [ ] Install the **Zoho Mail** app on your phone and log in as talel@cictnardc.net.
19. [ ] On your phone, set Zoho Mail as the **default mail app** if it lets you. The outreach tracker will open drafts in your default mail app.
20. [ ] Set a signature (Settings, Signatures):

```
Talel Ksiksi
CICTNA RDC
PostgreSQL, industrial connectors, WMS and ERP integration
cictnardc.net
```

(Leave your name out of the signature for now if you prefer, and sign with first name only.)

---

## Part 4: Test everything (10 min)

1. [ ] Send an email from your personal Gmail to `contact@cictnardc.net`, and another to `talel@cictnardc.net`. Both should arrive in the same Zoho inbox.
2. [ ] Reply from Zoho (as talel@) back to Gmail.
3. [ ] In Gmail, open that reply, click the three dots, **Show original**. You want to see:
   - SPF: **PASS**
   - DKIM: **PASS**
   - DMARC: **PASS**
4. [ ] Optional but worth it: go to **mail-tester.com**, send an email to the address it shows you, and check the score. Aim for 9/10 or better.
5. [ ] Open `https://cictnardc.net` on your phone, click **Email us**, and check it opens a new mail to the right address.

If SPF or DKIM shows FAIL, the usual cause is a typo or a missing character in the pasted value. Check the record in Cloudflare DNS against what Zoho shows, character by character.

---

## Part 5: The first two weeks of sending

A brand new address that suddenly sends lots of cold email gets flagged as spam. Build up slowly:

| Week | Cold emails per day |
|---|---|
| 1 | 3 to 4 |
| 2 | 6 to 8 |
| 3 onwards | up to 10 to 15 |

- [ ] Send a few normal emails in the first days too (to friends, to yourself, replies), so the mailbox has real two-way traffic.
- [ ] Every cold email gets one personal line about the company you are writing to. No mass identical sends.

---

## Quick reference: all DNS records in Cloudflare when done

| Type | Name | Content | Priority |
|---|---|---|---|
| CNAME | @ | (added automatically by Pages) | |
| CNAME | www | (added automatically by Pages) | |
| TXT | @ | zoho-verification=... (from Zoho) | |
| MX | @ | mx.zoho.eu | 10 |
| MX | @ | mx2.zoho.eu | 20 |
| MX | @ | mx3.zoho.eu | 50 |
| TXT | @ | v=spf1 include:zohomail.eu ~all | |
| TXT | zmail._domainkey | v=DKIM1; k=rsa; p=... (from Zoho) | |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:contact@cictnardc.net | |

## Addresses when done

| Address | What it is | Used for |
|---|---|---|
| talel@cictnardc.net | Main mailbox | Outreach, replies, clients |
| contact@cictnardc.net | Alias, lands in talel@ | Shown on the website |

---

## Part 6: Connect the website's contact form (5 min, free)

The form on the site sends visitors' messages straight to your inbox through Web3Forms (free up to 250 messages a month). Do this once your Zoho mailbox works.

1. [ ] Go to **web3forms.com** and click **Create your Access Key**.
2. [ ] Enter **contact@cictnardc.net**. No account needed. The key arrives in your Zoho inbox a minute later. It looks like `a1b2c3d4-e5f6-...`.
3. [ ] Open `website/index.html` in Notepad. Press Ctrl+F and search for `PASTE-YOUR-WEB3FORMS-KEY-HERE`.
4. [ ] Replace that text with your key, keeping the quotes around it. Save.
5. [ ] Upload the **website** folder again to Cloudflare Pages (your project, Create new deployment).
6. [ ] Test it: open cictnardc.net, scroll to the bottom, send yourself a message. It should arrive in Zoho within a minute, and replying to it answers the visitor directly.

Until the key is in, the form shows a polite note asking visitors to email contact@cictnardc.net instead, so nothing breaks in the meantime.

---

## Part 7: Optional, a "Book a 30-minute call" button (10 min, free)

1. [ ] Sign up at **cal.com** with talel@cictnardc.net. Set your time zone to Africa/Tunis (UTC+1) and your available hours.
2. [ ] Create an event type of 30 minutes, for example "Intro call". Copy its link, which looks like `https://cal.com/yourname/30min`.
3. [ ] Open `website/index.html` in Notepad, Ctrl+F for `BOOKING_URL = ""`, and paste the link between the quotes.
4. [ ] Save and upload the **website** folder again. A "Book a 30-minute call" button appears next to WhatsApp in the contact section.

Until then the button stays hidden.
