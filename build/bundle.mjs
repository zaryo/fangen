import * as esbuild from "esbuild";
import { mkdir, rm } from "node:fs/promises";

const outputDirectory = "dist";

export default async function bundleProject() {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  await esbuild.build({
    bundle: true,
    entryPoints: ["src/background.ts", "src/main.ts"],
    format: "esm",
    outdir: outputDirectory,
    sourcemap: true,
    target: "es2024",
    tsconfig: "tsconfig.json",
  });
}
