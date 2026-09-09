(() => {
  'use strict';
  if (!['ndai.pro', 'www.ndai.pro'].includes(location.hostname)) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
  const redact = (event) => {
    if (event.url) { const url = new URL(event.url, location.origin); url.search = ''; url.hash = ''; event.url = url.href; }
    return event;
  };
  window.va('beforeSend', redact);
  window.si('beforeSend', redact);
  window.ndaiTrack = (name, data = {}) => window.va('event', { name, data });
  for (const path of ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js']) {
    const script = document.createElement('script'); script.src = path; script.defer = true;
    document.head.append(script);
  }
})();
