/* ==========================================================================
   staff.js  -  payment-link maker for hotel staff (staff.html)
   After you confirm a room is free, fill this in, copy the link, send it.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE, G = window.GSP;
  var form = document.getElementById("staff-form");
  if (!S || !G || !form) return;

  var f = form.elements;
  var out = document.getElementById("staff-output");
  var today = G.todayISO();

  f.room.innerHTML = '<option value="">Select room</option>' + S.rooms.map(function (r) {
    return '<option value="' + G.esc(r.id) + '">' + G.esc(r.name) + " \u2014 " + G.money(r.price) + "</option>";
  }).join("");
  f.checkin.min = today;

  function guessAmount() {
    var r = S.rooms.filter(function (x) { return x.id === f.room.value; })[0];
    var n = G.nightsBetween(f.checkin.value, f.checkout.value);
    if (r && n > 0) {
      var sub = r.price * n;
      var total = sub + Math.round(sub * (S.serviceChargePercent || 0) / 100);
      f.amount.value = total;
    }
  }
  ["room", "checkin", "checkout"].forEach(function (n) { f[n].addEventListener("change", guessAmount); });

  document.getElementById("make-ref").addEventListener("click", function () {
    var chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    var r = "";
    for (var i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    var d = new Date();
    f.ref.value = "GSP-" + String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "-" + r;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("staff-error");
    err.textContent = "";

    var ref = f.ref.value.trim();
    var amount = Number(f.amount.value);
    if (!ref) { err.textContent = "Add the booking reference the guest was given (or tap Generate)."; return; }
    if (!(amount > 0)) { err.textContent = "Enter the amount in Naira."; return; }

    var roomObj = S.rooms.filter(function (x) { return x.id === f.room.value; })[0];
    var url = new URL("pay.html", location.href);
    url.search = "";
    url.searchParams.set("ref", ref);
    url.searchParams.set("amount", String(Math.round(amount)));
    if (f.name.value.trim()) url.searchParams.set("name", f.name.value.trim());
    if (f.email.value.trim()) url.searchParams.set("email", f.email.value.trim());
    if (roomObj) url.searchParams.set("room", roomObj.name);
    if (f.checkin.value) url.searchParams.set("in", f.checkin.value);
    if (f.checkout.value) url.searchParams.set("out", f.checkout.value);
    if (f.guests.value) url.searchParams.set("guests", f.guests.value);

    var link = url.toString();
    document.getElementById("staff-link").value = link;
    document.getElementById("staff-copy").setAttribute("data-copy", link);

    var lines = [
      "Hello " + (f.name.value.trim() || "there") + ", good news! Your room at " + S.name + " is available.",
      "",
      "Booking ref: " + ref
    ];
    if (roomObj) lines.push("Room: " + roomObj.name);
    if (f.checkin.value && f.checkout.value) {
      lines.push("Stay: " + G.fmtDate(f.checkin.value) + " to " + G.fmtDate(f.checkout.value));
    }
    lines.push(
      "Amount: " + G.money(amount),
      "",
      "Please complete your payment here (card, bank or transfer):",
      link,
      "",
      "We'll hold your room for " + S.holdHours + " hours. Thank you for choosing " + S.shortName + "!"
    );
    var msg = lines.join("\n");

    document.getElementById("staff-message").value = msg;
    document.getElementById("staff-message-copy").setAttribute("data-copy", msg);

    var phone = G.normalizePhone(f.phone.value);
    var wa = document.getElementById("staff-wa");
    if (phone) {
      wa.setAttribute("href", G.waLink(phone, msg));
      wa.hidden = false;
    } else {
      wa.hidden = true;
    }
    out.hidden = false;
    out.scrollIntoView({ block: "nearest" });
  });
})();
