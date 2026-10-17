/** iPhone / iOS home-screen install helpers. */

const DISMISS_KEY = "farkle-install-dismissed";

export function isStandaloneDisplay(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOther = !/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//.test(ua);
  return iOS && webkit && notOther;
}

export function shouldShowInstallHint(): boolean {
  if (isStandaloneDisplay()) return false;
  if (!isIosSafari()) return false;
  try {
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return false;
  } catch {
    /* private mode */
  }
  return true;
}

export function dismissInstallHint(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
}
