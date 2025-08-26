import fs from "fs/promises";
import path from "path";

const read = (p) => fs.readFile(p, "utf8");

await fs.mkdir("dist", { recursive: true });

const bundle = "dist/bundle.js";
const [html, css] = await Promise.all([
  read("index.html"),
  read("styles.css").catch(() => "")
]);

let js;
try {
  js = await read(bundle);
} catch {
  console.error(`Missing ${bundle}. Did you run 'npm run build'?`);
  process.exit(1);
}

let single = html;

// Inline CSS at the marker; if marker missing, replace the <link> line.
if (single.includes("PACK:INLINE_CSS")) {
  single = single.replace("<!-- PACK:INLINE_CSS -->", `<style>${css}</style>`);
} else {
  single = single.replace(
    /<link[^>]+styles\.css[^>]*>/,
    `<style>${css}</style>`
  );
}

// Inline JS at the marker; also remove the module tag that loads src/main.js
single = single
  .replace(/<script[^>]+type="module"[^>]*src="\.\/src\/main\.js"[^>]*><\/script>/, "")
  .replace("<!-- PACK:INLINE_JS -->", `<script>${js}</script>`);

const out = path.join("dist", "app.single.html");
await fs.writeFile(out, single, "utf8");
console.log("✅ Wrote", out);
