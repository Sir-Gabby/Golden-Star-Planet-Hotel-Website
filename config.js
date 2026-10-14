/* ==========================================================================
   config.js  -  THE ONE FILE YOU EDIT FOR HOTEL DETAILS
   Everything marked REPLACE or SAMPLE is a placeholder. Change it before
   you publish. Keep the quotes and commas exactly as they are. */

window.SITE = {
  /* ---------- Identity ---------- */
  name: "Golden Star Planet Hotel and Suite",
  shortName: "Golden Star Planet",
  tagline: "Comfort, class and care at every stay.",

  /* ---------- Contact (REPLACE) ---------- */
  phone: "+234 800 000 0000",
  /* WhatsApp number: international format, digits only, no + or spaces.
     Nigerian example: 2348012345678 */
  whatsapp: "2348000000000",
  email: "reservations@example.com",
  address: "Street address, City, State, Nigeria",
  /* Google Maps: open your hotel on Google Maps > Share > Embed a map,
     copy ONLY the address inside src="..." and paste it here. */
  mapEmbedUrl: "",
  social: {
    instagram: "",   /* e.g. "https://instagram.com/yourhotel" */
    facebook: ""     /* e.g. "https://facebook.com/yourhotel" */
  },

  /* ---------- Stay times and promises (REPLACE) ---------- */
  checkIn: "2:00 PM",
  checkOut: "12:00 noon",
  replyTime: "within 1 hour (8am to 10pm daily)",
  holdHours: 6,      /* hours you hold a room after confirming, while the guest pays */

  /* ---------- Money ---------- */
  currency: "NGN",
  serviceChargePercent: 0,   /* set to e.g. 5 to add a 5% service charge to totals */

  /* ---------- Payments (REPLACE) ----------
     Paystack: Dashboard > Settings > API Keys. Use the PUBLIC key only
     (starts with pk_test_ or pk_live_). Never put the secret key (sk_...)
     in this file. */
  paystackPublicKey: "pk_test_REPLACE_ME",
  bank: {
    bankName: "Your Bank Name",
    accountName: "Golden Star Planet Hotel and Suite",
    accountNumber: "0000000000"
  },

  /* ---------- Optional extras ---------- */
  /* Formspree (or similar) URL. If filled in, each booking request is also
     emailed to you in the background. Leave "" to use WhatsApp only. */
  formEndpoint: "",
  /* Photos: put files inside the images folder, then point to them like
     "images/hero.jpg". Leave "" to show a clean placeholder instead. */
  heroImage: "",
  gallery: [
    /* { src: "images/lobby.jpg", alt: "Hotel lobby" }, */
  ],

  /* ---------- Rooms (SAMPLE: replace names, prices and details) ----------
     id        short code, lowercase, no spaces (used in links)
     price     per night in Naira, numbers only
     capacity  maximum guests for that room
     image     "" for placeholder, or "images/room-standard.jpg"            */
  rooms: [
    {
      id: "standard",
      name: "Standard Room",
      price: 35000,
      capacity: 2,
      beds: "1 queen bed",
      description: "A calm, comfortable room for solo travellers and couples, with everything you need for a good night's rest.",
      features: ["Air conditioning", "Wi-Fi", "Smart TV", "Private bathroom"],
      image: ""
    },
    {
      id: "deluxe",
      name: "Deluxe Room",
      price: 50000,
      capacity: 2,
      beds: "1 king bed",
      description: "More space and a more refined finish, ideal for a longer stay or a special weekend.",
      features: ["Air conditioning", "Wi-Fi", "Smart TV", "Work desk", "Mini fridge"],
      image: ""
    },
    {
      id: "executive",
      name: "Executive Suite",
      price: 85000,
      capacity: 3,
      beds: "1 king bed + sofa bed",
      description: "A separate living area and a larger bedroom, made for business guests and small families.",
      features: ["Separate living area", "Air conditioning", "Wi-Fi", "Smart TV", "Work desk"],
      image: ""
    },
    {
      id: "presidential",
      name: "Presidential Suite",
      price: 150000,
      capacity: 4,
      beds: "1 king bed + 2 single beds",
      description: "Our most spacious suite, with generous living space and the highest level of comfort and privacy.",
      features: ["Spacious living room", "Air conditioning", "Wi-Fi", "Smart TV", "Dining area"],
      image: ""
    }
  ],

  /* ---------- Facilities (SAMPLE: delete anything that is not true) ---------- */
  facilities: [
    { title: "Free Wi-Fi", text: "Stay connected throughout the hotel." },
    { title: "Air conditioning", text: "Cool, comfortable rooms and suites." },
    { title: "Secure parking", text: "Safe space for your vehicle." },
    { title: "Front desk support", text: "Friendly help whenever you need it." },
    { title: "Power backup", text: "Dependable electricity during your stay." },
    { title: "Clean, fresh linen", text: "Rooms prepared with care for every guest." }
  ]
};
