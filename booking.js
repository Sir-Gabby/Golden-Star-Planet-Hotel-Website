/* ==========================================================================
   booking.js  -  booking request page (payment comes AFTER confirmation)
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE, G = window.GSP;
  var form = document.getElementById("booking-form");
  if (!S || !G || !form) return;

  var f = form.elements;
  var params = new URLSearchParams(location.search);
  var today = G.todayISO();
  var submitted = false;

  document.body.classList.add("has-mobile-total");

  /* ---------- Fill the room list ---------- */
  f.room.innerHTML = S.rooms.map(function (r) {
    return '<option value="' + G.esc(r.id) + '">' + G.esc(r.name) + " \u2014 " + G.money(r.price) + " / night</option>";
  }).join("");

  var wantedRoom = params.get("room");
  if (wantedRoom && S.rooms.some(function (r) { return r.id === wantedRoom; })) f.room.value = wantedRoom;

  /* ---------- Dates and guests from the home page bar ---------- */
  f.checkin.min = today;
  f.checkout.min = G.addDays(today, 1);

  var qIn = params.get("checkin"), qOut = params.get("checkout"), qGuests = parseInt(params.get("guests"), 10);
  if (qIn && qIn >= today) {
    f.checkin.value = qIn;
    f.checkout.min = G.addDays(qIn, 1);
    if (qOut && qOut > qIn) f.checkout.value = qOut;
  }
  if (qGuests > 0) f.guests.value = qGuests;

  /* ---------- Calculations ---------- */
  function currentRoom() {
    return S.rooms.filter(function (r) { return r.id === f.room.value; })[0];
  }

  function calc() {
    var room = currentRoom();
    var nights = G.nightsBetween(f.checkin.value, f.checkout.value);
    var guests = parseInt(f.guests.value, 10) || 0;
    var subtotal = nights > 0 ? room.price * nights : 0;
    var service = Math.round(subtotal * (S.serviceChargePercent || 0) / 100);
    return { room: room, nights: nights, guests: guests, rate: room.price, subtotal: subtotal, service: service, total: subtotal + service };
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderSummary() {
    var c = calc();
    f.guests.max = c.room.capacity;
    setText("sum-room", c.room.name);
    setText("sum-beds", "Sleeps up to " + c.room.capacity + " \u00B7 " + c.room.beds);
    setText("sum-rate", G.money(c.rate) + " per night");
    var hasDates = c.nights > 0;
    setText("sum-dates", hasDates ? G.fmtDate(f.checkin.value) + " \u2192 " + G.fmtDate(f.checkout.value) : "Choose your dates");
    setText("sum-nights", hasDates ? G.plural(c.nights, "night") : "\u2014");
    setText("sum-subtotal", hasDates ? G.money(c.subtotal) : "\u2014");
    var svcRow = document.getElementById("sum-service-row");
    if (svcRow) svcRow.hidden = !(S.serviceChargePercent > 0);
    setText("sum-service-label", "Service charge (" + (S.serviceChargePercent || 0) + "%)");
    setText("sum-service", hasDates ? G.money(c.service) : "\u2014");
    setText("sum-total", hasDates ? G.money(c.total) : "\u2014");
    setText("mobile-total-amount", hasDates ? G.money(c.total) : "Pick dates");
    setText("mobile-total-note", hasDates ? G.plural(c.nights, "night") + " \u00B7 pay after confirmation" : "Total shows here");
  }

  /* ---------- Date behaviour ---------- */
  f.checkin.addEventListener("change", function () {
    if (!f.checkin.value) return;
    f.checkout.min = G.addDays(f.checkin.value, 1);
    if (!f.checkout.value || f.checkout.value <= f.checkin.value) f.checkout.value = G.addDays(f.checkin.value, 1);
    renderSummary();
  });
  ["room", "checkout", "guests"].forEach(function (n) {
    f[n].addEventListener("input", renderSummary);
    f[n].addEventListener("change", renderSummary);
  });

  /* ---------- Errors ---------- */
  function errEl(name) { return form.querySelector('[data-error="' + name + '"]'); }

  function showError(name, msg) {
    var el = errEl(name);
    if (el) el.textContent = msg;
    if (f[name]) f[name].setAttribute("aria-invalid", "true");
  }

  function clearErrors() {
    G.$all("[data-error]", form).forEach(function (el) { el.textContent = ""; });
    G.$all("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); });
  }

  form.addEventListener("input", function (e) {
    var name = e.target && e.target.name;
    if (!name) return;
    var el = errEl(name);
    if (el) el.textContent = "";
    e.target.removeAttribute("aria-invalid");
  });

  function validate() {
    var errors = [];
    var c = calc();
    if (!f.checkin.value) errors.push(["checkin", "Choose a check-in date."]);
    else if (f.checkin.value < today) errors.push(["checkin", "Check-in can't be in the past."]);
    if (!f.checkout.value) errors.push(["checkout", "Choose a check-out date."]);
    else if (f.checkin.value && c.nights < 1) errors.push(["checkout", "Check-out must be after check-in."]);
    if (c.guests < 1) errors.push(["guests", "Enter the number of guests."]);
    else if (c.guests > c.room.capacity) errors.push(["guests", c.room.name + " sleeps up to " + c.room.capacity + ". Choose a larger room or reduce guests."]);
    if (f.name.value.trim().length < 2) errors.push(["name", "Please enter your full name."]);
    if (G.digits(f.phone.value).length < 10) errors.push(["phone", "Enter a phone number we can reach (at least 10 digits)."]);
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) errors.push(["email", "Enter a valid email address."]);
    return errors;
  }

  /* ---------- Reference and message ---------- */
  function makeRef() {
    var d = new Date();
    var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    var r = "";
    for (var i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return "GSP-" + String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "-" + r;
  }

  function buildMessage(q) {
    var lines = [
      "Hello " + S.shortName + ", I'd like to request a booking.",
      "",
      "Booking ref: " + q.ref,
      "Room: " + q.roomName + " (" + G.money(q.rate) + " per night)",
      "Check-in: " + G.fmtDate(q.checkin),
      "Check-out: " + G.fmtDate(q.checkout),
      "Nights: " + q.nights,
      "Guests: " + q.guests,
      "Estimated total: " + G.money(q.total),
      "",
      "Name: " + q.name,
      "Phone: " + q.phone,
      "Email: " + q.email
    ];
    if (q.notes) lines.push("Notes: " + q.notes);
    lines.push("", "Please confirm availability and send me the payment link. Thank you.");
    return lines.join("\n");
  }

  function postOptional(q) {
    if (!S.formEndpoint) return;
    try {
      fetch(S.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(q)
      }).catch(function () {});
    } catch (e) { /* ignore: WhatsApp is the main route */ }
  }

  /* ---------- Success panel ---------- */
  function showSuccess(q, text) {
    var wa = G.waLink(S.whatsapp, text);
    var mail = "mailto:" + S.email + "?subject=" + encodeURIComponent("Booking request " + q.ref) + "&body=" + encodeURIComponent(text);
    var panel = document.getElementById("booking-success");
    panel.innerHTML =
      '<p class="eyebrow">Almost done</p>' +
      '<h2 tabindex="-1" id="success-title">Send your request to us</h2>' +
      '<p class="lead-dark">Your request is <strong>not sent until you press Send in WhatsApp</strong>. Tap the button below if WhatsApp didn\'t open by itself.</p>' +
      '<div class="ref-box"><div><small>Booking reference</small><strong class="num">' + G.esc(q.ref) + '</strong></div>' +
      '<button type="button" class="btn btn-ghost btn-sm swap" data-copy="' + G.esc(q.ref) + '">Copy</button></div>' +
      '<div class="actions-row">' +
        '<a class="btn btn-wa btn-lg" href="' + G.esc(wa) + '" target="_blank" rel="noopener">Send on WhatsApp</a>' +
        '<a class="btn btn-ghost btn-lg" href="' + G.esc(mail) + '">Send by email instead</a>' +
      "</div>" +
      '<h3 class="mt">What happens next</h3>' +
      '<ol class="steps-list">' +
        "<li><strong>We check availability</strong> and reply " + G.esc(S.replyTime) + ".</li>" +
        "<li><strong>We send you a secure payment link</strong> for " + G.money(q.total) + ". You pay by card, bank or transfer.</li>" +
        "<li><strong>You get your confirmation.</strong> We hold your room for " + G.esc(S.holdHours) + " hours while you pay.</li>" +
      "</ol>" +
      '<dl class="recap">' +
        "<div><dt>Room</dt><dd>" + G.esc(q.roomName) + "</dd></div>" +
        "<div><dt>Stay</dt><dd>" + G.esc(G.fmtDate(q.checkin)) + " \u2192 " + G.esc(G.fmtDate(q.checkout)) + " (" + G.plural(q.nights, "night") + ")</dd></div>" +
        "<div><dt>Guests</dt><dd>" + G.esc(q.guests) + "</dd></div>" +
        "<div><dt>Estimated total</dt><dd class=\"num\">" + G.money(q.total) + "</dd></div>" +
      "</dl>" +
      '<p class="fine">No payment has been taken. If you made a mistake, just tell us on WhatsApp and quote your reference.</p>';

    document.getElementById("booking-layout").hidden = true;
    var bar = document.getElementById("mobile-total");
    if (bar) bar.hidden = true;
    document.body.classList.remove("has-mobile-total");
    panel.hidden = false;
    var title = document.getElementById("success-title");
    panel.scrollIntoView({ block: "start" });
    if (title) title.focus({ preventScroll: true });
  }

  /* ---------- Submit ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitted) return;
    clearErrors();
    var errors = validate();
    if (errors.length) {
      errors.forEach(function (er) { showError(er[0], er[1]); });
      var first = f[errors[0][0]];
      if (first) first.focus();
      return;
    }
    var c = calc();
    var q = {
      ref: makeRef(),
      roomId: c.room.id,
      roomName: c.room.name,
      rate: c.rate,
      checkin: f.checkin.value,
      checkout: f.checkout.value,
      nights: c.nights,
      guests: c.guests,
      total: c.total,
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      email: f.email.value.trim(),
      notes: f.notes.value.trim()
    };
    var text = buildMessage(q);
    submitted = true;
    try { localStorage.setItem("gsp_last_request", JSON.stringify(q)); } catch (err) { /* storage may be blocked */ }
    postOptional(q);
    showSuccess(q, text);
    window.open(G.waLink(S.whatsapp, text), "_blank", "noopener");
  });

  renderSummary();
})();
