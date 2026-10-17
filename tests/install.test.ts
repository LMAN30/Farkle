/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dismissInstallHint,
  isIosSafari,
  isStandaloneDisplay,
  shouldShowInstallHint,
} from "../src/install";

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("install helpers", () => {
  it("detects standalone display mode", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: true, media: "(display-mode: standalone)" }),
    );
    expect(isStandaloneDisplay()).toBe(true);
  });

  it("detects iOS Safari from the user agent", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    Object.defineProperty(window.navigator, "platform", {
      configurable: true,
      value: "iPhone",
    });
    expect(isIosSafari()).toBe(true);
  });

  it("shows the install hint only for iOS Safari outside standalone", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({ matches: false, media: "(display-mode: standalone)" }),
    );
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    Object.defineProperty(window.navigator, "platform", {
      configurable: true,
      value: "iPhone",
    });
    Object.defineProperty(window.navigator, "standalone", {
      configurable: true,
      value: false,
    });
    expect(shouldShowInstallHint()).toBe(true);
    dismissInstallHint();
    expect(shouldShowInstallHint()).toBe(false);
  });
});
