/**
 * Cookie consent (Google Consent Mode v2). Choice lives in localStorage so the
 * boot script can restore it before any Google tag (AdSense / GA) reads it.
 */
export const CONSENT_KEY = "ajs_cookie_consent";
export const CONSENT_OPEN_EVENT = "ajs:open-cookie-settings";
export const CONSENT_SAVED_EVENT = "ajs:cookie-consent-saved";

export type ConsentChoice = { analytics: boolean; marketing: boolean; at: string };

/** Inline <head> script: default everything non-essential to denied, then restore a saved choice. */
export const consentBootScript = `(function(){try{
window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments);};
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
var c=JSON.parse(localStorage.getItem('${CONSENT_KEY}')||'null');
if(c){var a=c.analytics?'granted':'denied',m=c.marketing?'granted':'denied';
gtag('consent','update',{analytics_storage:a,ad_storage:m,ad_user_data:m,ad_personalization:m});}
}catch(e){}})();`;

export function readConsent(): ConsentChoice | null {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing: boolean) {
  const choice: ConsentChoice = { analytics, marketing, at: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(choice)); } catch { /* storage blocked */ }
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  const m = marketing ? "granted" : "denied";
  gtag?.("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: m,
    ad_user_data: m,
    ad_personalization: m,
  });
  window.dispatchEvent(new Event(CONSENT_SAVED_EVENT));
}
