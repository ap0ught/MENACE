(function () {
  if (!("serviceWorker" in navigator)) return;
  var secure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!secure) return;

  window.addEventListener("load", function () {
    var manifestLink = document.querySelector('link[rel="manifest"]');
    var scope = (manifestLink && manifestLink.getAttribute("href")) || "manifest.webmanifest";
    var manifestUrl = new URL(scope, window.location.href);
    var scopeUrl = new URL(".", manifestUrl).href;
    var swUrl = new URL("sw.js", manifestUrl).href;
    navigator.serviceWorker.register(swUrl, { scope: scopeUrl }).catch(function () {
      /* registration optional; ignore */
    });
  });
})();
