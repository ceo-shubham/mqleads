/**
 * MQLeads tracking snippet.
 *
 * Usage:
 *   <script defer src="https://YOUR-APP/mqleads.js" data-site-id="YOUR_SITE_ID"></script>
 *
 * What it captures:
 *   - Page views (URL, title, referrer, UTM params, locale, timezone, screen)
 *   - Time on site (flushed on visibilitychange / pagehide via sendBeacon)
 *   - Outbound link clicks to other sites (social platforms, partners, ...)
 *   - Optional identity via window.MQLeads.identify({ name, email, handle, via })
 *
 * The referrer is parsed server-side to attribute each visit to a social
 * platform (LinkedIn / Instagram / X / Facebook / Reddit / YouTube / Google)
 * and, when possible, the profile handle in the referrer URL.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var siteId = script.getAttribute("data-site-id");
  if (!siteId) return;
  var src = script.src || "";
  var endpoint = src.replace(/mqleads\.js.*$/, "api/track");
  if (endpoint === src) return; // script was not loaded from the MQLeads domain

  var storageKey = "mqleads_vid_" + siteId;
  var visitorId = null;
  try {
    visitorId = localStorage.getItem(storageKey) || null;
  } catch (e) { /* storage disabled */ }
  if (!visitorId) {
    visitorId =
      (window.crypto && crypto.randomUUID ? crypto.randomUUID() : "v-" + Date.now().toString(36) + Math.random().toString(36).slice(2));
    try { localStorage.setItem(storageKey, visitorId); } catch (e) { /* ignore */ }
  }

  function base() {
    var params = new URLSearchParams(location.search);
    return {
      siteId: siteId,
      visitorId: visitorId,
      referrer: document.referrer || "",
      url: location.href,
      page: location.pathname + location.search,
      title: document.title,
      utm: {
        source: params.get("utm_source"),
        medium: params.get("utm_medium"),
        campaign: params.get("utm_campaign"),
        content: params.get("utm_content"),
        term: params.get("utm_term"),
      },
      locale: navigator.language || "",
      tz: (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || "",
      screen: screen.width + "x" + screen.height,
      ua: navigator.userAgent,
      ts: Date.now()
    };
  }

  function send(payload) {
    try {
      var data = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([data], { type: "application/json" }));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
      }
    } catch (e) { /* never break the host site */ }
  }

  send(Object.assign({ type: "pageview" }, base()));

  var start = Date.now();
  var flushed = false;
  function flushSession() {
    if (flushed) return;
    var d = Math.round((Date.now() - start) / 1000);
    if (d >= 2) {
      flushed = true;
      send(Object.assign({ type: "session", duration: d }, base()));
    }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flushSession();
  });
  window.addEventListener("pagehide", flushSession);

  document.addEventListener(
    "click",
    function (e) {
      var el = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!el) return;
      var href = el.href;
      if (!href) return;
      try {
        var u = new URL(href);
        if (u.hostname === location.hostname) return;
        send(Object.assign({ type: "outbound" }, base(), { url: href }));
      } catch (err) { /* invalid href */ }
    },
    true
  );

  window.MQLeads = {
    identify: function (info) {
      send(Object.assign({ type: "identify", identity: info }, base()));
    },
    track: function (eventName, props) {
      send(Object.assign({ type: eventName, props: props || {} }, base()));
    }
  };

  try {
    window.dispatchEvent(new Event("mqleads:ready"));
  } catch (e) { /* ignore */ }
})();
