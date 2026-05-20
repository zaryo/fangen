const STORAGE_KEY = "theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

function systemPreferredTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
}

function resolvedTheme() {
  return localStorage.getItem(STORAGE_KEY) ?? systemPreferredTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const nextTheme = resolvedTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  localStorage.setItem(STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
}

export default function initializeTheme() {
  applyTheme(resolvedTheme());

  document
    .querySelector(".page__navbar_theme_toggle")
    .addEventListener("click", toggleTheme);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(systemPreferredTheme());
      }
    });
}
