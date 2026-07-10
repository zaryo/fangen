import { match } from "ts-pattern";

const STORAGE_KEY_NAME = "theme";
const DARK_THEME_NAME = "dark";
const LIGHT_THEME_NAME = "light";

function systemPreferredTheme(): string {
  return match(window.matchMedia("(prefers-color-scheme: dark)").matches)
    .with(true, () => DARK_THEME_NAME)
    .with(false, () => LIGHT_THEME_NAME)
    .exhaustive();
}

function getResolvedTheme(): string {
  return localStorage.getItem(STORAGE_KEY_NAME) ?? systemPreferredTheme();
}

function applyTheme(theme: string): void {
  document.documentElement.dataset["theme"] = theme;
}

function toggleTheme(): void {
  const nextTheme = match(getResolvedTheme() === DARK_THEME_NAME)
    .with(true, () => LIGHT_THEME_NAME)
    .with(false, () => DARK_THEME_NAME)
    .exhaustive();
  localStorage.setItem(STORAGE_KEY_NAME, nextTheme);
  applyTheme(nextTheme);
}

export default function initializeTheme(): void {
  applyTheme(getResolvedTheme());

  document
    .querySelector(".page__navbar_theme_toggle")
    ?.addEventListener("click", toggleTheme);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!localStorage.getItem(STORAGE_KEY_NAME)) {
        applyTheme(systemPreferredTheme());
      }
    });
}
