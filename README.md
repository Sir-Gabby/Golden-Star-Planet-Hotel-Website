# Golden Star Planet Hotel and Suite: website

A fast, static website (no server, no database) with visible prices, a booking request flow, and card or bank-transfer payment **after** the hotel confirms availability.

## What is in this folder

| File | What it does |
| --- | --- |
| `config.js` | **The one file you edit**: hotel details, rooms, prices, bank details, Paystack key |
| `index.html` | Home page: hero, date bar, how booking works, featured rooms, facilities |
| `rooms.html` | All rooms and suites with prices |
| `booking.html` + `booking.js` | Booking request form with live total; opens WhatsApp with the request filled in |
| `pay.html` + `pay.js` | Payment page the guest opens from the link you send (card, bank, USSD via Paystack, or manual transfer) |
| `staff.html` + `staff.js` | Staff tool that makes the payment link and the message to send the guest (not linked on the site) |
| `about.html`, `contact.html`, `policies.html`, `404.html` | Supporting pages |
| `script.js` | Shared code: header, footer, mobile menu, room cards, helpers |
| `style.css` | All the styling |
| `favicon.svg` | Browser tab icon |

## 1. Preview on your computer

1. Open the folder in VS Code.
2. Install the **Live Server** extension, right-click `index.html`, choose **Open with Live Server**.
3. Always preview through Live Server (not by double-clicking the file) so everything loads properly.

## 2. Fill in `config.js` (do this first)

Everything marked `REPLACE` or `SAMPLE` is a placeholder:

- `phone`, `whatsapp` (digits only, e.g. `2348012345678`), `email`, `address`
- `checkIn`, `checkOut`, `replyTime`, `holdHours`
- `rooms`: names, **prices**, capacity, bed type, descriptions, features (these 4 rooms and prices are samples)
- `facilities`: delete anything that is not true for your hotel
- `bank`: your real bank name, account name and account number
- `paystackPublicKey`: see section 4
- Optional: `mapEmbedUrl`, `social`, `formEndpoint`

Also read and edit the text in `about.html` (our story) and `policies.html` (cancellation, ID rules). The wording there is sample text.

## 3. Add photos

1. Create a folder called `images` next to `index.html`.
2. Add photos (JPG or WebP, ideally under 300 KB each; resize big phone photos first).
3. In `config.js` set `heroImage: "images/hero.jpg"`, each room's `image: "images/room-deluxe.jpg"`, and add gallery photos to `gallery`.

Until you add photos, the site shows clean placeholders.

## 4. Switch on card payments (Paystack)

1. Create a Paystack account (paystack.com) and open **Settings > API Keys & Webhooks**.
2. Copy the **Test Public Key** (starts with `pk_test_`) into `paystackPublicKey` in `config.js`.
3. Test a payment end to end using Paystack's test cards (listed in Paystack's docs).
4. When your business is verified, replace it with the **Live Public Key** (`pk_live_`).
5. **Never** put the secret key (`sk_...`) anywhere in this site.

If the key is still a placeholder, the pay page automatically disables card payment and points guests to bank transfer.

Note: the site uses Paystack's inline script (`https://js.paystack.co/v1/inline.js`). If the payment window ever stops opening, check Paystack's current documentation for the latest inline script.

## 5. How a booking works day to day

**Guest**
1. Picks a room and dates, sees the total, sends the request (WhatsApp opens with the details filled in).

**You (staff)**
2. Reply, and check your room calendar for availability.
3. If the room is free, open `staff.html` (bookmark it), enter the booking reference, room, dates and guest details, and press **Make payment link**.
4. Send the generated message to the guest on WhatsApp.

**Guest**
5. Opens the link, pays by card/bank/USSD or by transfer, and (for transfer) sends proof on WhatsApp.

**You**
6. **Check the money arrived and matches the amount** in your Paystack dashboard or bank app, then confirm the booking to the guest.

## 6. Publish with GitHub Pages (free)

1. Create a GitHub repository (for example `golden-star-planet-hotel`) and upload every file in this folder to the main branch.
2. In the repository go to **Settings > Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute your site is live at the address GitHub shows.
4. Custom domain: buy a domain, then add it under **Settings > Pages > Custom domain**, and add the DNS records GitHub lists. HTTPS is automatic.

## 7. Before you go live: test checklist

- [ ] All contact details, prices and bank details are real
- [ ] A test booking request opens WhatsApp with the right details
- [ ] A test payment link (from `staff.html`) opens the pay page with the right amount
- [ ] A Paystack **test** payment completes, and you see it in the dashboard
- [ ] Bank transfer details and the Copy buttons work
- [ ] The site looks right on a real phone, not only on your computer
- [ ] About and Policies pages say what is true for your hotel

## 8. Honest limitations (and how to upgrade later)

- **No automatic availability check.** Staff confirm by hand. Keep a simple calendar of booked dates. (Later: embed a read-only Google Calendar, or add a small backend.)
- **The amount in a payment link can be edited by a guest.** That is why step 6 above matters: always compare the amount received with the booking before confirming. The "payment successful" screen on the site is a courtesy, not proof of payment.
- **No automatic payment verification.** (Later: add a small serverless function that receives Paystack's webhook and marks bookings paid.)
- **Booking requests travel by WhatsApp.** Set `formEndpoint` (for example a Formspree form) to also get each request by email as a backup.
- `staff.html` has no password. It contains no secrets, but anyone who finds it could make a payment link. A guest-made link does not move money to anyone else, it only shows a payment page, so verifying received amounts keeps you safe.
- On GitHub Pages, `404.html` loads its styles by relative path, so on deeply nested wrong URLs it may look unstyled.
