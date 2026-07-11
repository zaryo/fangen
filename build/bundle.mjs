import * as esbuild from "esbuild";
import htmlMinifierPlugin from "esbuild-plugin-html-minifier-terser";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export default async function bundleProject() {
  await Promise.all([
    esbuild.build({
      absWorkingDir: projectRoot,
      bundle: true,
      entryPoints: ["src/background.ts", "src/main.ts", "templates/index.html"],
      entryNames: "[name]",
      format: "esm",
      loader: {".html": "copy"},
      minify: true,
      outdir: "dist",
      plugins: [htmlMinifierPlugin()],
      target: "es2024",
      treeShaking: true,
      tsconfig: "tsconfig.json",
    }),
    esbuild.build({
      absWorkingDir: projectRoot,
      bundle: true,
      entryPoints: ["resources/css/index.css"],
      entryNames: "[dir]/[name]",
      outbase: projectRoot,
      assetNames: "[dir]/[name]",
      loader: {
        ".png": "file",
        ".svg": "file",
      },
      minify: true,
      outdir: "dist",
      target: "es2024",
    }),
    esbuild.build({
      absWorkingDir: projectRoot,
      entryPoints: [
        "resources/media/icon_32.png",
        "resources/media/icon_64.png",
      ],
      entryNames: "[dir]/[name]",
      outbase: projectRoot,
      loader: {".png": "copy"},
      outdir: "dist",
    }),
  ]);
}
