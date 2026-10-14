/* ==========================================================================
   script.js  -  shared code used on every page
   (header, footer, mobile menu, scroll reveal, room cards, helpers)
   ========================================================================== */
(function () {
  "use strict";

  var S = window.SITE;
  if (!S) {
    console.error("config.js did not load. Check that it is in the same folder as the page.");
    return;
  }

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(n) {
    return "\u20A6" + Math.round(Number(n) || 0).toLocaleString("en-NG");
  }

  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : (many || one + "s"));
  }

  function pad(n) { return ("0" + n).slice(-2); }
  function toISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return toISO(new Date()); }

  function parseISO(s) {
    var p = String(s || "").split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  function addDays(iso, n) {
    var d = parseISO(iso);
    if (!d) return "";
    d.setDate(d.getDate() + n);
    return toISO(d);
  }

  function nightsBetween(a, b) {
    var d1 = parseISO(a), d2 = parseISO(b);
    if (!d1 || !d2) return 0;
    var u1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    var u2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((u2 - u1) / 86400000);
  }

  function fmtDate(iso) {
    var d = parseISO(iso);
    return d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  }

  function digits(s) { return String(s || "").replace(/\D/g, ""); }

  /* 0803... -> 234803...   +234 0803... -> 234803... */
  function normalizePhone(p) {
    var d = digits(p);
    if (!d) return "";
    if (d.indexOf("2340") === 0 && d.length === 14) d = "234" + d.slice(4);
    if (d.indexOf("234") === 0) return d;
    if (d.charAt(0) === "0") return "234" + d.slice(1);
    return d;
  }

  function waLink(number, text) {
    return "https://wa.me/" + digits(number) + "?text=" + encodeURIComponent(text || "");
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) { reject(e); }
    });
  }

  /* Short blurred cross-fade when a button label changes ("Copy" -> "Copied") */
  function swapLabel(btn, text) {
    btn.classList.add("is-swapping");
    setTimeout(function () {
      btn.textContent = text;
      btn.classList.remove("is-swapping");
    }, 120);
  }

  function copyWithFeedback(btn, text) {
    var original = btn.getAttribute("data-label");
    if (!original) {
      original = btn.textContent;
      btn.setAttribute("data-label", original);
    }
    copyText(text).then(function () {
      swapLabel(btn, "Copied \u2713");
      setTimeout(function () { swapLabel(btn, original); }, 1600);
    }, function () {
      swapLabel(btn, "Select and copy");
      setTimeout(function () { swapLabel(btn, original); }, 2200);
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-copy]") : null;
    if (btn) copyWithFeedback(btn, btn.getAttribute("data-copy"));
  });

  /* ---------- Expose helpers to the other scripts ---------- */
  window.GSP = {
    $: $, $all: $all, esc: esc, money: money, plural: plural,
    todayISO: todayISO, addDays: addDays, nightsBetween: nightsBetween,
    fmtDate: fmtDate, normalizePhone: normalizePhone, digits: digits,
    waLink: waLink, copyText: copyText, copyWithFeedback: copyWithFeedback,
    observeReveals: observeReveals
  };

  /* ---------- Header ---------- */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var NAV = [
    ["index.html", "Home"],
    ["rooms.html", "Rooms & Suites"],
    ["about.html", "About"],
    ["contact.html", "Contact"]
  ];

  function navLinks() {
    return NAV.map(function (n) {
      var current = n[0] === page || (page === "" && n[0] === "index.html");
      return '<a href="' + n[0] + '"' + (current ? ' aria-current="page"' : "") + ">" + esc(n[1]) + "</a>";
    }).join("");
  }

  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    host.outerHTML =
      '<header class="site-header" id="siteHeader">' +
        '<div class="container header-inner">' +
          '<a class="brand" href="index.html" aria-label="' + esc(S.name) + ' home">' +
            '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 64 64" width="22" height="22"><path fill="currentColor" d="M32 8l7.2 15.6 17 2-12.6 11.5 3.5 16.9L32 45.2 17 54l3.5-16.9L7.9 25.6l17-2z"/></svg></span>' +
            '<span class="brand-text">' + esc(S.shortName) + "<small>Hotel &amp; Suite</small></span>" +
          "</a>" +
          '<nav class="nav-desktop" aria-label="Main">' + navLinks() + "</nav>" +
          '<div class="header-cta">' +
            '<a class="btn btn-gold btn-sm" href="booking.html">Book now</a>' +
            '<button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navDrawer">' +
              '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<div class="scrim" id="navScrim" data-open="false"></div>' +
      '<aside class="drawer" id="navDrawer" data-open="false" aria-hidden="true" aria-label="Menu">' +
        '<div class="drawer-head"><strong>' + esc(S.shortName) + '</strong><button class="menu-btn" id="menuClose" type="button" aria-label="Close menu">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button></div>' +
        '<nav class="drawer-nav" aria-label="Mobile">' + navLinks() +
          '<a href="policies.html">Policies</a></nav>' +
        '<a class="btn btn-gold btn-block" href="booking.html">Request a booking</a>' +
        '<p class="drawer-contact"><a href="tel:' + esc(S.phone.replace(/\s+/g, "")) + '">' + esc(S.phone) + "</a></p>" +
      "</aside>";

    var header = document.getElementById("siteHeader");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var btn = document.getElementById("menuBtn");
    var closeBtn = document.getElementById("menuClose");
    var drawer = document.getElementById("navDrawer");
    var scrim = document.getElementById("navScrim");

    function setDrawer(open) {
      drawer.setAttribute("data-open", open ? "true" : "false");
      scrim.setAttribute("data-open", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("no-scroll", open);
      if (open) {
        var first = drawer.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      } else if (drawer.contains(document.activeElement)) {
        btn.focus({ preventScroll: true });
      }
    }

    btn.addEventListener("click", function () { setDrawer(true); });
    closeBtn.addEventListener("click", function () { setDrawer(false); });
    scrim.addEventListener("click", function () { setDrawer(false); });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") setDrawer(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900 && drawer.getAttribute("data-open") === "true") setDrawer(false);
    });
  }

  /* ---------- Footer ---------- */
  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var social = "";
    if (S.social && S.social.instagram) social += '<a href="' + esc(S.social.instagram) + '" rel="noopener" target="_blank">Instagram</a>';
    if (S.social && S.social.facebook) social += '<a href="' + esc(S.social.facebook) + '" rel="noopener" target="_blank">Facebook</a>';

    host.outerHTML =
      '<footer class="site-footer">' +
        '<div class="container footer-grid">' +
          '<div class="footer-brand">' +
            '<p class="footer-name">' + esc(S.name) + "</p>" +
            "<p>" + esc(S.tagline) + "</p>" +
          "</div>" +
          "<div><h3>Explore</h3><ul>" +
            '<li><a href="rooms.html">Rooms &amp; Suites</a></li>' +
            '<li><a href="booking.html">Request a booking</a></li>' +
            '<li><a href="about.html">About us</a></li>' +
            '<li><a href="policies.html">Policies</a></li>' +
          "</ul></div>" +
          "<div><h3>Contact</h3><ul>" +
            '<li><a href="tel:' + esc(S.phone.replace(/\s+/g, "")) + '">' + esc(S.phone) + "</a></li>" +
            '<li><a href="' + esc(waLink(S.whatsapp, "Hello " + S.shortName + ", I have a question.")) + '" target="_blank" rel="noopener">WhatsApp us</a></li>' +
            '<li><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></li>" +
            "<li>" + esc(S.address) + "</li>" +
          "</ul></div>" +
          "<div><h3>Stay times</h3><ul>" +
            "<li>Check-in: " + esc(S.checkIn) + "</li>" +
            "<li>Check-out: " + esc(S.checkOut) + "</li>" +
            (social ? '<li class="footer-social">' + social + "</li>" : "") +
          "</ul></div>" +
        "</div>" +
        '<div class="container footer-bottom"><p>&copy; ' + new Date().getFullYear() + " " + esc(S.name) + ". All rights reserved.</p></div>" +
      "</footer>";
  }

  /* ---------- Search-engine data (only once real details are filled in) ---------- */
  function addStructuredData() {
    if (S.whatsapp === "2348000000000" || /Street address/.test(S.address)) return;
    var data = {
      "@context": "https://schema.org",
      "@type": "Hotel",
      "name": S.name,
      "telephone": S.phone,
      "email": S.email,
      "address": S.address,
      "url": location.origin + location.pathname.replace(/[^/]*$/, ""),
      "checkinTime": S.checkIn,
      "checkoutTime": S.checkOut
    };
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  /* ---------- Scroll reveal (runs once per element) ---------- */
  var observer = null;

  function reveal(el) {
    el.classList.add("is-visible");
    var finish = function (e) {
      if (e && e.propertyName && e.propertyName !== "opacity") return;
      el.classList.add("reveal-done");
      el.removeEventListener("transitionend", finish);
    };
    el.addEventListener("transitionend", finish);
    /* safety net in case the transition never fires (e.g. reduced motion) */
    setTimeout(finish, 1200);
  }

  function observeReveals(root) {
    var els = $all(".reveal:not(.is-visible)", root || document);
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(reveal);
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -60px 0px", threshold: 0.05 });
    }
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Room cards ---------- */
  function roomCard(r, i) {
    var media = r.image
      ? '<img src="' + esc(r.image) + '" alt="' + esc(r.name) + '" loading="lazy" width="800" height="500">'
      : '<div class="media-placeholder" role="img" aria-label="Photo of ' + esc(r.name) + ' coming soon"><svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true"><path fill="currentColor" d="M32 8l7.2 15.6 17 2-12.6 11.5 3.5 16.9L32 45.2 17 54l3.5-16.9L7.9 25.6l17-2z"/></svg></div>';
    var chips = (r.features || []).map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("");
    return (
      '<article class="card room reveal" style="--i:' + (i % 4) + '">' +
        '<div class="room-media">' + media + "</div>" +
        '<div class="room-body">' +
          "<h3>" + esc(r.name) + "</h3>" +
          '<p class="room-meta">Sleeps up to ' + esc(r.capacity) + " &middot; " + esc(r.beds) + "</p>" +
          "<p>" + esc(r.description) + "</p>" +
          '<ul class="chips">' + chips + "</ul>" +
          '<div class="room-foot">' +
            '<div class="price"><span class="num">' + money(r.price) + "</span><small>per night</small></div>" +
            '<a class="btn btn-gold" href="booking.html?room=' + encodeURIComponent(r.id) + '">Request this room</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderRooms() {
    var featured = document.getElementById("featured-rooms");
    if (featured) featured.innerHTML = S.rooms.slice(0, 3).map(roomCard).join("");
    var all = document.getElementById("rooms-list");
    if (all) all.innerHTML = S.rooms.map(roomCard).join("");
  }

  function renderFacilities() {
    var host = document.getElementById("facilities");
    if (!host) return;
    host.innerHTML = S.facilities.map(function (f, i) {
      return '<li class="facility reveal" style="--i:' + (i % 3) + '"><span class="facility-icon" aria-hidden="true"></span><div><h3>' + esc(f.title) + "</h3><p>" + esc(f.text) + "</p></div></li>";
    }).join("");
  }

  function renderGallery() {
    var wrap = document.getElementById("gallery-section");
    var host = document.getElementById("gallery");
    if (!host) return;
    if (!S.gallery || !S.gallery.length) {
      if (wrap) wrap.hidden = true;
      return;
    }
    host.innerHTML = S.gallery.map(function (g) {
      return '<figure class="gallery-item"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || "Hotel photo") + '" loading="lazy" width="800" height="560"></figure>';
    }).join("");
  }

  function applyHero() {
    var bg = document.querySelector("[data-hero-bg]");
    if (bg && S.heroImage) {
      bg.style.setProperty("--hero-img", 'url("' + S.heroImage.replace(/"/g, "") + '")');
      bg.classList.add("has-image");
    }
  }

  /* ---------- Date pickers on the home availability bar ---------- */
  function setupAvailability() {
    var form = document.getElementById("avail-form");
    if (!form) return;
    var ci = form.elements.checkin, co = form.elements.checkout;
    var today = todayISO();
    ci.min = today;
    co.min = addDays(today, 1);
    ci.addEventListener("change", function () {
      if (!ci.value) return;
      co.min = addDays(ci.value, 1);
      if (!co.value || co.value <= ci.value) co.value = addDays(ci.value, 1);
    });
  }

  /* ---------- Contact form -> WhatsApp ---------- */
  function setupContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var message = form.elements.message.value.trim();
      var err = form.querySelector('[data-error="message"]');
      if (!name || !message) {
        if (err) err.textContent = "Please add your name and a message.";
        return;
      }
      if (err) err.textContent = "";
      var text = "Hello " + S.shortName + ",\n\n" + message + "\n\nFrom: " + name;
      window.open(waLink(S.whatsapp, text), "_blank", "noopener");
    });
  }

  /* ---------- Contact page details ---------- */
  function fillContactDetails() {
    $all("[data-site]").forEach(function (el) {
      var key = el.getAttribute("data-site");
      if (key === "phone-link") { el.setAttribute("href", "tel:" + S.phone.replace(/\s+/g, "")); el.textContent = S.phone; }
      else if (key === "email-link") { el.setAttribute("href", "mailto:" + S.email); el.textContent = S.email; }
      else if (key === "wa-link") { el.setAttribute("href", waLink(S.whatsapp, "Hello " + S.shortName + ", I have a question.")); }
      else if (S[key] != null) { el.textContent = S[key]; }
    });
    var map = document.getElementById("map-embed");
    if (map) {
      if (S.mapEmbedUrl) {
        map.innerHTML = '<iframe src="' + esc(S.mapEmbedUrl) + '" title="Map to ' + esc(S.name) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
      } else {
        map.hidden = true;
      }
    }
  }

  /* ---------- Go ---------- */
  buildHeader();
  buildFooter();
  addStructuredData();
  applyHero();
  renderRooms();
  renderFacilities();
  renderGallery();
  setupAvailability();
  setupContactForm();
  fillContactDetails();
  observeReveals();
})();
