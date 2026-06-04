const STORAGE_KEY_NAME = "theme";
const DARK_THEME_NAME = "dark";
const LIGHT_THEME_NAME = "light";

function systemPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME_NAME
    : LIGHT_THEME_NAME;
}

function getResolvedTheme() {
  return localStorage.getItem(STORAGE_KEY_NAME) ?? systemPreferredTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const nextTheme =
    getResolvedTheme() === DARK_THEME_NAME ? LIGHT_THEME_NAME : DARK_THEME_NAME;
  localStorage.setItem(STORAGE_KEY_NAME, nextTheme);
  applyTheme(nextTheme);
}

export default function initializeTheme() {
  applyTheme(getResolvedTheme());

  document
    .querySelector(".page__navbar_theme_toggle")
    .addEventListener("click", toggleTheme);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!localStorage.getItem(STORAGE_KEY_NAME)) {
        applyTheme(systemPreferredTheme());
      }
    });
}
