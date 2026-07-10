import bundleProject from "./bundle.mjs";

let buildTimer = null;

export default function rebuild() {
  if (buildTimer) clearTimeout(buildTimer);
  buildTimer = setTimeout(async () => {
    console.log("[watch] File change detected, rebuilding...");
    await bundleProject();
    console.log("[watch] Build complete.");
  }, 200);
}
