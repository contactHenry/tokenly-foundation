import { useSyncExternalStore } from "react";

const STORAGE = "tokenly-theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** True while dark mode is on. Stays in sync with every toggle (header button, search menu). */
export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE, dark ? "dark" : "light");
  } catch {
    /* the theme still applies for this visit */
  }
}
