import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);

// packages/design-tokens/src/compile.ts
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
var GENERATED_TOKEN_DIR = path.join("brand", "tokens", "generated");
function tokenBaseDir() {
  const assets = process.env.BRAND_OS_ENGINE_ASSETS;
  return assets ? path.join(assets, "tokens") : path.resolve(import.meta.dirname, "..", "base");
}
function tokenBaseFile(repoRoot, file) {
  const own = path.join(repoRoot, "brand", "tokens", file);
  return fs.existsSync(own) ? own : path.join(tokenBaseDir(), file);
}
var TOKEN_FILES = [
  "color.tokens.json",
  "typography.tokens.json",
  "space.tokens.json",
  "radius.tokens.json",
  "motion.tokens.json",
  "elevation.tokens.json"
];
function compileTokens(repoRoot) {
  const errors = [];
  const flat = {};
  for (const file of TOKEN_FILES) {
    const full = tokenBaseFile(repoRoot, file);
    if (!fs.existsSync(full)) {
      errors.push(`Missing token file ${file}`);
      continue;
    }
    const doc = JSON.parse(fs.readFileSync(full, "utf8"));
    walk(doc, [], void 0, flat, errors, file, "base");
  }
  const generatedDir = path.join(repoRoot, GENERATED_TOKEN_DIR);
  if (fs.existsSync(generatedDir)) {
    for (const file of fs.readdirSync(generatedDir).filter((name) => name.endsWith(".tokens.json")).sort()) {
      const doc = JSON.parse(fs.readFileSync(path.join(generatedDir, file), "utf8"));
      walk(doc, [], void 0, flat, errors, `generated/${file}`, "generated");
    }
  }
  resolveAliases(flat, errors);
  const contrast = loadContrast(repoRoot, flat, errors);
  return {
    css: renderCss(flat),
    typescript: renderTs(flat),
    flat,
    contrast,
    errors
  };
}
function walk(node, prefix, inheritedType, flat, errors, file, source) {
  const type = node.$type ?? inheritedType;
  if (node.$value !== void 0) {
    if (!type) errors.push(`${file}: ${prefix.join(".")} has $value without $type`);
    const id = prefix.join(".");
    const hex = type === "color" ? colorHex(node.$value, id, errors) : void 0;
    const ext = node.$extensions?.["brand.os"];
    flat[id] = {
      type: type ?? "unknown",
      value: node.$value,
      hex,
      description: node.$description,
      theme: ext?.theme,
      source,
      file,
      ...ext?.source_fact ? { sourceFact: ext.source_fact } : {},
      ...typeof ext?.source_version === "number" ? { sourceVersion: ext.source_version } : {}
    };
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object") walk(value, [...prefix, key], type, flat, errors, file, source);
  }
}
function colorHex(value, id, errors) {
  if (typeof value === "string" && value.startsWith("{")) return void 0;
  if (!value || typeof value !== "object") {
    errors.push(`${id}: color $value must be an sRGB object with hex`);
    return void 0;
  }
  const color = value;
  if (color.colorSpace !== "srgb" || typeof color.hex !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(color.hex)) {
    errors.push(`${id}: expected colorSpace srgb and a 6-digit hex`);
    return void 0;
  }
  if (color.components) {
    const [r, g, b] = hexToRgb(color.hex);
    const expected = [r / 255, g / 255, b / 255];
    const ok = color.components.length >= 3 && color.components.every((component, index) => Math.abs(component - (expected[index] ?? 0)) <= 1 / 255 + 1e-4);
    if (!ok) errors.push(`${id}: components do not match ${color.hex}`);
  }
  return color.hex.toUpperCase();
}
function resolveAliases(flat, errors) {
  const resolving = /* @__PURE__ */ new Set();
  const resolveOne = (id) => {
    const token = flat[id];
    if (!token || typeof token.value !== "string") return;
    const match = token.value.match(/^\{(.+)\}$/);
    if (!match) return;
    const targetId = match[1] ?? "";
    if (resolving.has(id)) {
      errors.push(`${id}: alias cycle`);
      return;
    }
    const target = flat[targetId];
    if (!target) {
      errors.push(`${id}: unresolved alias ${token.value}`);
      return;
    }
    resolving.add(id);
    resolveOne(targetId);
    resolving.delete(id);
    token.hex = target.hex;
    token.value = target.value;
    token.type = target.type;
  };
  for (const id of Object.keys(flat)) resolveOne(id);
}
function loadContrast(repoRoot, flat, errors) {
  const file = tokenBaseFile(repoRoot, "contrast-pairs.json");
  if (!fs.existsSync(file)) return [];
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  return doc.pairs.map((pair) => {
    const fg = flat[pair.fg]?.hex;
    const bg = flat[pair.bg]?.hex;
    if (!fg || !bg) {
      errors.push(`Contrast pair ${pair.id} is missing a color`);
      return { ...pair, ratio: 0, pass: false, fgHex: fg ?? "", bgHex: bg ?? "" };
    }
    const ratio = contrastRatio(fg, bg);
    if (ratio < pair.min) errors.push(`Contrast pair ${pair.id} is ${ratio.toFixed(2)} and minimum is ${pair.min}`);
    return { ...pair, ratio, pass: ratio >= pair.min, fgHex: fg, bgHex: bg };
  });
}
function tokenDigestBasis(token) {
  return String(token.hex ?? JSON.stringify(token.value));
}
function tokenDigest(token) {
  return crypto.createHash("sha256").update(tokenDigestBasis(token)).digest("hex");
}
function contrastRatio(foreground, background) {
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}
function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const parsed = Number.parseInt(value, 16);
  return [parsed >> 16 & 255, parsed >> 8 & 255, parsed & 255];
}
function cssName(id) {
  return `--${id.replace(/\./g, "-")}`;
}
function renderCssValue(token) {
  if (token.hex) return token.hex;
  const value = token.value;
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (token.type === "fontFamily") return value.map((family) => family.includes(" ") ? `"${family}"` : family).join(", ");
    if (token.type === "cubicBezier") return `cubic-bezier(${value.join(", ")})`;
  }
  if (value && typeof value === "object") {
    const record = value;
    if (token.type === "dimension" || token.type === "duration") return `${record.value}${record.unit}`;
    if (token.type === "shadow") {
      const color = String(record.color);
      const offsetX = record.offsetX;
      const offsetY = record.offsetY;
      const blur = record.blur;
      const spread = record.spread;
      return `${offsetX.value}${offsetX.unit} ${offsetY.value}${offsetY.unit} ${blur.value}${blur.unit} ${spread.value}${spread.unit} ${color}`;
    }
  }
  return String(value);
}
function renderCss(flat) {
  const root = [];
  const dark = [];
  const reduced = [];
  for (const [id, token] of Object.entries(flat)) {
    const line = `  ${cssName(id)}: ${renderCssValue(token)};`;
    if (id.startsWith("color.dark.") || token.theme === "dark") dark.push(line);
    else root.push(line);
    if (token.type === "duration") reduced.push(`  ${cssName(id)}: 0ms;`);
  }
  return [
    "/* Generated from DTCG sources. EXAMPLE / DRAFT. Do not edit by hand. */",
    ":root {",
    ...root,
    "}",
    "",
    "[data-theme='dark'] {",
    ...dark,
    "}",
    "",
    "@media (prefers-reduced-motion: reduce) {",
    "  :root {",
    ...reduced,
    "  }",
    "}",
    ""
  ].join("\n");
}
function renderTs(flat) {
  const entries = Object.entries(flat).map(([id, token]) => `  ${JSON.stringify(id)}: ${JSON.stringify({ type: token.type, css: cssName(id), value: token.hex ?? token.value })}`);
  return [
    "/** Generated from DTCG sources. EXAMPLE / DRAFT. Do not edit by hand. */",
    'export const tokenStatus = "draft" as const;',
    "export const tokens = {",
    entries.join(",\n"),
    "} as const;",
    ""
  ].join("\n");
}
function tokenExplorerData(compiled) {
  const colors = Object.entries(compiled.flat).filter(([, token]) => token.type === "color" && token.hex).map(([id, token]) => ({ id, hex: token.hex, description: token.description ?? "", theme: id.startsWith("color.dark.") ? "dark" : id.startsWith("color.light.") ? "light" : "both" }));
  return {
    status: "draft",
    label: "EXAMPLE \u2014 not an approved brand palette",
    colors,
    contrast: compiled.contrast.map((pair) => ({
      id: pair.id,
      ratio: Number(pair.ratio.toFixed(2)),
      min: pair.min,
      pass: pair.pass,
      fg: pair.fgHex,
      bg: pair.bgHex
    }))
  };
}

export {
  GENERATED_TOKEN_DIR,
  tokenBaseDir,
  TOKEN_FILES,
  compileTokens,
  tokenDigest,
  contrastRatio,
  tokenExplorerData
};
