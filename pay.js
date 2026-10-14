/* ==========================================================================
   pay.js  -  payment page the guest opens from the link YOU send after
   confirming availability. Card/bank/USSD through Paystack, or manual transfer.
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE, G = window.GSP;
  var invalid = document.getElementById("pay-invalid");
  var main = document.getElementById("pay-main");
  if (!S || !G || !main || !invalid) return;

  var p = new URLSearchParams(location.search);
  var ref = (p.get("ref") || "").trim();
  var amount = Number(p.get("amount"));
  var name = (p.get("name") || "").trim();
  var email = (p.get("email") || "").trim();
  var room = (p.get("room") || "").trim();
  var checkin = p.get("in") || "";
  var checkout = p.get("out") || "";
  var guests = p.get("guests") || "";

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- Incomplete or broken link ---------- */
  if (!ref || !(amount > 0) || amount > 100000000) {
    var help = document.getElementById("pay-invalid-wa");
    if (help) help.setAttribute("href", G.waLink(S.whatsapp, "Hello " + S.shortName + ", my payment link isn't working. Booking ref: " + (ref || "(not shown)")));
    invalid.hidden = false;
    return;
  }

  /* ---------- Summary ---------- */
  var nights = checkin && checkout ? G.nightsBetween(checkin, checkout) : 0;
  setText("pay-ref", ref);
  setText("pay-name", name || "Guest");
  setText("pay-room", room || "Your room");
  setText("pay-dates", checkin && checkout ? G.fmtDate(checkin) + " \u2192 " + G.fmtDate(checkout) + (nights > 0 ? " (" + G.plural(nights, "night") + ")" : "") : "As confirmed with the hotel");
  setText("pay-guests", guests || "As confirmed");
  setText("pay-amount", G.money(amount));
  setText("pay-amount-btn", G.money(amount));
  setText("pay-hold", S.holdHours + " hours");
  main.hidden = false;

  var emailInput = document.getElementById("pay-email");
  if (emailInput && email) emailInput.value = email;

  /* ---------- Tabs ---------- */
  var tabs = G.$all('[role="tab"]');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });
  selectTab(tabs[0]);

  /* ---------- Paystack (card, bank, USSD, bank transfer) ---------- */
  var key = S.paystackPublicKey || "";
  var paystackReady = /^pk_(test|live)_/.test(key) && key.indexOf("REPLACE") === -1;
  var payBtn = document.getElementById("btn-paystack");
  var note = document.getElementById("paystack-note");
  var emailErr = document.getElementById("pay-email-error");

  if (!paystackReady) {
    payBtn.disabled = true;
    note.textContent = "Online card payment isn't switched on yet. Please use the Bank transfer tab.";
    note.hidden = false;
    var tt = document.getElementById("tab-transfer");
    if (tt) selectTab(tt);
  }

  function onPaid(reference) {
    setText("success-ref", ref);
    setText("success-paystack-ref", reference || "");
    var receipt = [
      "Hello " + S.shortName + ", I have just paid for my booking.",
      "",
      "Booking ref: " + ref,
      "Amount: " + G.money(amount),
      "Payment reference: " + (reference || "(see my receipt)"),
      "Name: " + (name || "")
    ].join("\n");
    document.getElementById("btn-wa-receipt").setAttribute("href", G.waLink(S.whatsapp, receipt));
    main.hidden = true;
    var done = document.getElementById("pay-success");
    done.hidden = false;
    done.scrollIntoView({ block: "start" });
    var h = document.getElementById("pay-success-title");
    if (h) h.focus({ preventScroll: true });
  }

  payBtn.addEventListener("click", function () {
    if (!paystackReady) return;
    var mail = emailInput.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(mail)) {
      emailErr.textContent = "Enter your email so Paystack can send your receipt.";
      emailInput.setAttribute("aria-invalid", "true");
      emailInput.focus();
      return;
    }
    emailErr.textContent = "";
    emailInput.removeAttribute("aria-invalid");

    if (typeof window.PaystackPop === "undefined") {
      note.textContent = "We couldn't load the secure payment window. Check your connection, or use the Bank transfer tab.";
      note.hidden = false;
      return;
    }

    payBtn.classList.add("is-loading");
    var handler = window.PaystackPop.setup({
      key: key,
      email: mail,
      amount: Math.round(amount * 100),
      currency: "NGN",
      ref: ref + "-" + Date.now().toString(36).toUpperCase(),
      channels: ["card", "bank", "bank_transfer", "ussd"],
      metadata: {
        booking_ref: ref,
        custom_fields: [
          { display_name: "Booking ref", variable_name: "booking_ref", value: ref },
          { display_name: "Guest", variable_name: "guest", value: name || "" },
          { display_name: "Room", variable_name: "room", value: room || "" }
        ]
      },
      callback: function (response) {
        payBtn.classList.remove("is-loading");
        onPaid(response && response.reference);
      },
      onClose: function () {
        payBtn.classList.remove("is-loading");
      }
    });
    handler.openIframe();
  });

  /* ---------- Manual bank transfer ---------- */
  var bank = S.bank || {};
  setText("bank-name", bank.bankName || "");
  setText("bank-account-name", bank.accountName || "");
  setText("bank-account-number", bank.accountNumber || "");
  setText("transfer-amount", G.money(amount));
  setText("transfer-amount-2", G.money(amount));
  setText("transfer-narration", ref);

  var copyAcct = document.getElementById("copy-account");
  if (copyAcct) copyAcct.setAttribute("data-copy", bank.accountNumber || "");
  var copyRef = document.getElementById("copy-narration");
  if (copyRef) copyRef.setAttribute("data-copy", ref);
  var copyAmt = document.getElementById("copy-amount");
  if (copyAmt) copyAmt.setAttribute("data-copy", String(Math.round(amount)));

  var proof = [
    "Hello " + S.shortName + ", I have sent a bank transfer for my booking.",
    "",
    "Booking ref: " + ref,
    "Amount: " + G.money(amount),
    "Name: " + (name || ""),
    "",
    "I'm attaching my proof of payment."
  ].join("\n");
  var proofBtn = document.getElementById("btn-wa-proof");
  if (proofBtn) proofBtn.setAttribute("href", G.waLink(S.whatsapp, proof));

  var helpLink = document.getElementById("pay-help-wa");
  if (helpLink) helpLink.setAttribute("href", G.waLink(S.whatsapp, "Hello " + S.shortName + ", I need help with my payment. Booking ref: " + ref));
})();
