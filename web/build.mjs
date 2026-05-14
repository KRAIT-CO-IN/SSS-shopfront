import * as esbuild from "esbuild";
import { mkdir, readdir, readFile, writeFile, copyFile, cp, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "dist");

async function clean() {
  if (existsSync(OUT)) {
    await cp(OUT, OUT + ".bak", { recursive: true }).catch(() => {});
  }
  await mkdir(OUT, { recursive: true });
}

async function buildJsx() {
  await mkdir(path.join(OUT, "js"), { recursive: true });
  const files = (await readdir(path.join(SRC, "js"))).filter((f) => f.endsWith(".jsx"));
  for (const f of files) {
    const code = await readFile(path.join(SRC, "js", f), "utf8");
    const result = await esbuild.transform(code, {
      loader: "jsx",
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      target: "es2020",
      minify: true,
      sourcemap: false,
    });
    const outName = f.replace(/\.jsx$/, ".js");
    await writeFile(path.join(OUT, "js", outName), result.code);
  }
  console.log(`[build] compiled ${files.length} jsx files`);
}

async function copyStaticDir(src, dest) {
  await cp(src, dest, { recursive: true });
}

async function buildHtml() {
  const v = Date.now().toString(36);
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>SSS Food World — Authentic, Handcrafted, Delivered Fresh</title>
  <meta name="description" content="Handcrafted spice powders, pickles & artisanal Indian preserves." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/styles.css?v=${v}" />
  <link rel="stylesheet" href="/styles/pages.css?v=${v}" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23C4121F'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Georgia,serif' font-weight='700' font-size='17' fill='white'%3ES%3C/text%3E%3C/svg%3E" />
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body>
  <a class="sr-only" href="#main">Skip to content</a>
  <div id="root"></div>
  <script src="/js/api.js?v=${v}"></script>
  <script src="/js/data.js?v=${v}"></script>
  <script src="/js/chrome.js?v=${v}"></script>
  <script src="/js/pages.js?v=${v}"></script>
  <script src="/js/checkout.js?v=${v}"></script>
  <script src="/js/app.js?v=${v}"></script>
</body>
</html>`;

  const adminHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>SSS Food World — Admin Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles/styles.css?v=${v}" />
  <link rel="stylesheet" href="/styles/admin.css?v=${v}" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23C4121F'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Georgia,serif' font-weight='700' font-size='17' fill='white'%3ES%3C/text%3E%3C/svg%3E" />
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
</head>
<body class="admin-body">
  <div id="root"></div>
  <script src="/js/api.js?v=${v}"></script>
  <script src="/js/data.js?v=${v}"></script>
  <script src="/js/admin-data.js?v=${v}"></script>
  <script src="/js/admin-chrome.js?v=${v}"></script>
  <script src="/js/admin-pages.js?v=${v}"></script>
  <script src="/js/admin-app.js?v=${v}"></script>
</body>
</html>`;

  await writeFile(path.join(OUT, "index.html"), indexHtml);
  await writeFile(path.join(OUT, "admin.html"), adminHtml);
  console.log("[build] wrote index.html + admin.html");
}

async function buildStatic() {
  await copyStaticDir(path.join(SRC, "styles"), path.join(OUT, "styles"));
  await copyStaticDir(path.join(SRC, "assets"), path.join(OUT, "assets"));
  console.log("[build] copied styles + assets");
}

async function run() {
  console.log("[build] start");
  await clean();
  await buildJsx();
  await buildStatic();
  await buildHtml();
  console.log("[build] done → " + OUT);
}

const watch = process.argv.includes("--watch");
if (watch) {
  await run();
  const { watch: fsWatch } = await import("node:fs");
  let timer;
  fsWatch(SRC, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(run, 200);
  });
  console.log("[build] watching src/");
} else {
  await run();
}
