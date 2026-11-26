import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  contrastRatio
} from "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  approvalProofMatches,
  approvalSeal,
  approvalSecretPath,
  canonicalJson,
  newApprovalEventId,
  safeRead,
  safetyBlocksSharing,
  safetyReport,
  sha256Hex,
  withLock,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// packages/brand-core/src/social-kit/model.ts
var SOCIAL_KIT_SCHEMA = "brand-os/social-style-kit/v1";
var SOCIAL_KIT_TOOL = "social_style_kit";
var SOCIAL_KIT_FILE = "brand/social/style-kit.yaml";
var SOCIAL_APPROVALS_FILE = "brand/.private/social/approvals.json";
var SOCIAL_APPROVAL_DOMAIN = "brand-os/social-style-approval/v1";
var SOCIAL_KIT_VERSION = 1;
var SOCIAL_LANGS = ["en", "fa", "tr"];
var SURFACES = ["post", "carousel", "story", "reel", "reel_cover", "thumbnail", "linkedin_post", "linkedin_document"];
var DEFAULT_STYLES_PER_SURFACE = 4;
var MAX_STYLES_PER_SURFACE = 12;
var SocialKitError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "SocialKitError";
  }
  code;
};
var SURFACE_SPECS = {
  post: {
    surface: "post",
    canvases: [
      { id: "4x5", width: 1080, height: 1350 },
      { id: "1x1", width: 1080, height: 1080 }
    ],
    safe_zones: [
      { id: "margin", kind: "margin", x: 64, y: 64, w: 952, h: 1222 },
      { id: "grid_crop_1x1", kind: "crop", x: 0, y: 135, w: 1080, h: 1080 }
    ],
    caption_style: false
  },
  carousel: {
    surface: "carousel",
    canvases: [{ id: "4x5", width: 1080, height: 1350 }],
    safe_zones: [
      { id: "margin", kind: "margin", x: 64, y: 64, w: 952, h: 1222 },
      { id: "dots_overlap", kind: "ui_overlap", x: 0, y: 1290, w: 1080, h: 60 }
    ],
    caption_style: false
  },
  story: {
    surface: "story",
    canvases: [{ id: "9x16", width: 1080, height: 1920 }],
    safe_zones: [
      { id: "top_ui", kind: "ui_overlap", x: 0, y: 0, w: 1080, h: 250 },
      { id: "bottom_ui", kind: "ui_overlap", x: 0, y: 1580, w: 1080, h: 340 },
      { id: "margin", kind: "margin", x: 64, y: 250, w: 952, h: 1330 }
    ],
    caption_style: false
  },
  reel: {
    surface: "reel",
    canvases: [{ id: "9x16", width: 1080, height: 1920 }],
    safe_zones: [
      { id: "top_ui", kind: "ui_overlap", x: 0, y: 0, w: 1080, h: 250 },
      { id: "bottom_ui", kind: "ui_overlap", x: 0, y: 1580, w: 1080, h: 340 },
      { id: "right_actions", kind: "ui_overlap", x: 940, y: 900, w: 140, h: 680 },
      { id: "margin", kind: "margin", x: 64, y: 250, w: 876, h: 1330 }
    ],
    caption_style: true
  },
  reel_cover: {
    surface: "reel_cover",
    canvases: [{ id: "9x16", width: 1080, height: 1920 }],
    safe_zones: [
      { id: "grid_crop_4x5", kind: "crop", x: 0, y: 285, w: 1080, h: 1350 },
      { id: "grid_crop_1x1", kind: "crop", x: 0, y: 420, w: 1080, h: 1080 },
      { id: "top_ui", kind: "ui_overlap", x: 0, y: 0, w: 1080, h: 250 },
      { id: "bottom_ui", kind: "ui_overlap", x: 0, y: 1580, w: 1080, h: 340 }
    ],
    caption_style: false
  },
  thumbnail: {
    surface: "thumbnail",
    canvases: [{ id: "16x9", width: 1280, height: 720 }],
    safe_zones: [
      { id: "margin", kind: "margin", x: 48, y: 40, w: 1184, h: 640 },
      { id: "timestamp", kind: "ui_overlap", x: 1080, y: 630, w: 200, h: 90 }
    ],
    caption_style: false
  },
  linkedin_post: {
    surface: "linkedin_post",
    canvases: [
      { id: "4x5", width: 1200, height: 1500 },
      { id: "link_1.91x1", width: 1200, height: 627 }
    ],
    safe_zones: [{ id: "margin", kind: "margin", x: 72, y: 72, w: 1056, h: 1356 }],
    caption_style: false
  },
  linkedin_document: {
    surface: "linkedin_document",
    canvases: [{ id: "4x5", width: 1080, height: 1350 }],
    safe_zones: [
      { id: "margin", kind: "margin", x: 72, y: 72, w: 936, h: 1206 },
      { id: "page_controls", kind: "ui_overlap", x: 0, y: 1270, w: 1080, h: 80 }
    ],
    caption_style: false
  }
};
var LAYER_ROLES = ["background", "media", "overlay", "shape", "headline", "subhead", "body", "data", "quote", "mascot", "brand_mark", "cta", "caption_bar", "progress", "handle"];
var TEXT_ROLES = ["headline", "subhead", "body", "data", "quote", "cta", "caption_bar", "handle"];
var NAMED_ZONES = {
  full: { x: 0, y: 0, w: 100, h: 100 },
  safe: { x: 6, y: 6, w: 88, h: 88 },
  top_band: { x: 0, y: 0, w: 100, h: 18 },
  bottom_band: { x: 0, y: 82, w: 100, h: 18 },
  upper_half: { x: 0, y: 0, w: 100, h: 50 },
  lower_half: { x: 0, y: 50, w: 100, h: 50 },
  left_half: { x: 0, y: 0, w: 50, h: 100 },
  right_half: { x: 50, y: 0, w: 50, h: 100 },
  center: { x: 15, y: 30, w: 70, h: 40 }
};
var CONTENT_TYPES = ["educate", "inspire", "entertain", "promote", "proof", "community", "announce", "behind_the_scenes", "personal"];
var STYLE_STATUSES = ["draft", "approved", "rejected"];
var RULE_CODES = [
  "one_message",
  "high_contrast",
  "keep_in_safe_zone",
  "logo_once",
  "brand_mark_small",
  "no_stock_cliche",
  "real_people_only_with_rights",
  "cite_data_source",
  "approved_numbers_only",
  "quote_verbatim_with_permission",
  "one_cta",
  "no_text_over_face",
  "readable_at_thumb_size",
  "max_two_type_sizes",
  "consistent_slide_numbering",
  "hook_on_first_slide",
  "cta_on_last_slide",
  "captions_always_on",
  "no_dense_paragraphs",
  "left_align_ltr_right_align_rtl",
  "mascot_approved_pose_only",
  "no_fake_ui",
  "no_clickbait",
  "face_left_text_right",
  "no_more_than_three_colors",
  "progress_visible",
  "link_sticker_space",
  "before_after_same_framing",
  "question_open_ended"
];
var STYLE_ID = /^(post|carousel|story|reel|reel_cover|thumbnail|linkedin_post|linkedin_document)\.[a-z0-9][a-z0-9-]{1,39}$/;
var ARCHETYPE_ID = /^[a-z0-9][a-z0-9-]{1,39}$/;
var ASSET_ID = /^[a-z0-9][a-z0-9._-]{0,119}$/;
var TOKEN_REF = /^(color|type|radius|space)\.[A-Za-z0-9-]+(\.[A-Za-z0-9-]+){0,4}$/;
var FACT_REF = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+){1,4}$/;
var RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
var SAFE_TEXT_MAX = 280;
function fail(path2, message) {
  throw new SocialKitError("invalid_kit", `${path2}: ${message}`);
}
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function text(value, path2, max = SAFE_TEXT_MAX) {
  if (typeof value !== "string" || value.trim() === "") fail(path2, "must be a non-empty text.");
  if (value.length > max) fail(path2, `is longer than ${max} characters.`);
  if (RAW_COLOR.test(value)) fail(path2, "holds a raw colour value. Use a colour token id (color.\u2026).");
  return value;
}
function tokenRef(value, path2, prefix) {
  if (typeof value !== "string" || !TOKEN_REF.test(value)) fail(path2, "must be a design-token id such as color.brand.primary or type.fontFamily.display, never a raw value.");
  if (prefix !== "any" && !value.startsWith(`${prefix}.`)) fail(path2, `must be a ${prefix}.\u2026 token id.`);
  return value;
}
function optionalToken(value, path2, prefix) {
  if (value === void 0) return void 0;
  if (value === null) return null;
  return tokenRef(value, path2, prefix);
}
function localized(value, path2) {
  if (typeof value === "string") return { en: text(value, path2) };
  if (!isObject(value)) fail(path2, "must be a text or {en, fa, tr}.");
  for (const key of Object.keys(value)) if (!SOCIAL_LANGS.includes(key)) fail(`${path2}.${key}`, "is not en, fa or tr.");
  const out = { en: text(value.en, `${path2}.en`) };
  for (const lang of ["fa", "tr"]) if (value[lang] !== void 0) out[lang] = text(value[lang], `${path2}.${lang}`);
  return out;
}
function percent(value, path2) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) fail(path2, "must be a number from 0 to 100 (% of the canvas).");
  return Math.round(value * 100) / 100;
}
function zone(value, path2) {
  if (typeof value === "string") {
    if (!Object.prototype.hasOwnProperty.call(NAMED_ZONES, value)) fail(path2, `must be one of ${Object.keys(NAMED_ZONES).join(", ")} or {x, y, w, h} in %.`);
    return value;
  }
  if (!isObject(value)) fail(path2, "must be a named zone or {x, y, w, h} in %.");
  const rect = { x: percent(value.x, `${path2}.x`), y: percent(value.y, `${path2}.y`), w: percent(value.w, `${path2}.w`), h: percent(value.h, `${path2}.h`) };
  if (rect.w === 0 || rect.h === 0) fail(path2, "has no area.");
  if (rect.x + rect.w > 100.001 || rect.y + rect.h > 100.001) fail(path2, "goes past the canvas edge.");
  return rect;
}
function zoneRect(value) {
  return typeof value === "string" ? { ...NAMED_ZONES[value] } : value;
}
function count(value, path2, max) {
  if (value === void 0) return void 0;
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max) fail(path2, `must be a whole number from 1 to ${max}.`);
  return value;
}
function rules(value, path2) {
  if (value === void 0 || value === null) return [];
  if (!Array.isArray(value) || value.length > 12) fail(path2, "must be a list of at most 12 rule codes or short texts.");
  return value.map((item, index) => text(item, `${path2}[${index}]`, 160));
}
function layer(value, path2) {
  if (!isObject(value)) fail(path2, "must be a layer object.");
  const allowed = ["role", "zone", "color", "font", "max_words", "max_lines", "rules", "optional"];
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${path2}.${key}`, "is not a layer field.");
  if (typeof value.role !== "string" || !LAYER_ROLES.includes(value.role)) fail(`${path2}.role`, `must be one of ${LAYER_ROLES.join(", ")}.`);
  const role = value.role;
  const out = { role, zone: zone(value.zone, `${path2}.zone`) };
  const color = optionalToken(value.color, `${path2}.color`, "color");
  if (color !== void 0) out.color = color;
  const font = optionalToken(value.font, `${path2}.font`, "type");
  if (font !== void 0) {
    if (font !== null && !TEXT_ROLES.includes(role)) fail(`${path2}.font`, `a ${role} layer carries no text.`);
    out.font = font;
  }
  const words = count(value.max_words, `${path2}.max_words`, 200);
  if (words !== void 0) out.max_words = words;
  const lines = count(value.max_lines, `${path2}.max_lines`, 30);
  if (lines !== void 0) out.max_lines = lines;
  const list = rules(value.rules, `${path2}.rules`);
  if (list.length) out.rules = list;
  if (value.optional !== void 0) {
    if (typeof value.optional !== "boolean") fail(`${path2}.optional`, "must be true or false.");
    if (value.optional) out.optional = true;
  }
  return out;
}
function captionStyle(value, path2) {
  if (value === void 0 || value === null) return value === null ? null : void 0;
  if (!isObject(value)) fail(path2, "must be an object.");
  const position = value.position;
  if (position !== "lower_third" && position !== "center" && position !== "upper_third") fail(`${path2}.position`, "must be lower_third, center or upper_third.");
  const perLine = count(value.max_words_per_line, `${path2}.max_words_per_line`, 12);
  if (!perLine) fail(`${path2}.max_words_per_line`, "is required.");
  return {
    font: tokenRef(value.font, `${path2}.font`, "type"),
    color: tokenRef(value.color, `${path2}.color`, "color"),
    background: value.background === null || value.background === void 0 ? null : tokenRef(value.background, `${path2}.background`, "color"),
    max_words_per_line: perLine,
    position
  };
}
function approvalRef(value, path2) {
  if (value === void 0 || value === null) return null;
  if (!isObject(value)) fail(path2, "must be an object written by kit approve.");
  if (typeof value.event_id !== "string" || !/^apv_[0-9a-f-]{36}$/.test(value.event_id)) fail(`${path2}.event_id`, "is not an approval event id.");
  if (typeof value.approved_at !== "string" || Number.isNaN(Date.parse(value.approved_at))) fail(`${path2}.approved_at`, "is not a date.");
  if (typeof value.digest !== "string" || !/^[0-9a-f]{64}$/.test(value.digest)) fail(`${path2}.digest`, "is not a sha256 digest.");
  return { event_id: value.event_id, approved_at: value.approved_at, digest: value.digest };
}
function parseStyle(value, path2) {
  if (!isObject(value)) fail(path2, "must be a style object.");
  const allowed = ["id", "surface", "archetype", "name", "intent", "layers", "variation", "do", "dont", "reference_assets", "caption_style", "status", "approval"];
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${path2}.${key}`, "is not a style field.");
  if (typeof value.id !== "string" || !STYLE_ID.test(value.id)) fail(`${path2}.id`, "must be <surface>.<slug>, for example post.bold-statement.");
  if (typeof value.surface !== "string" || !SURFACES.includes(value.surface)) fail(`${path2}.surface`, `must be one of ${SURFACES.join(", ")}.`);
  const surface = value.surface;
  if (!value.id.startsWith(`${surface}.`)) fail(`${path2}.id`, `must start with ${surface}.`);
  if (typeof value.archetype !== "string" || !ARCHETYPE_ID.test(value.archetype)) fail(`${path2}.archetype`, "must be a short slug.");
  if (!isObject(value.intent)) fail(`${path2}.intent`, "must be {use_when, content_types}.");
  const types = value.intent.content_types;
  if (!Array.isArray(types) || types.length === 0 || types.some((item) => !CONTENT_TYPES.includes(item))) fail(`${path2}.intent.content_types`, `must list one or more of ${CONTENT_TYPES.join(", ")}.`);
  const pillar = value.intent.pillar;
  if (pillar !== void 0 && pillar !== null && (typeof pillar !== "string" || !/^[a-z0-9][a-z0-9_-]{0,39}$/.test(pillar))) fail(`${path2}.intent.pillar`, "must be a short slug or null.");
  if (!Array.isArray(value.layers) || value.layers.length < 2 || value.layers.length > 16) fail(`${path2}.layers`, "must list 2 to 16 layers in z-order (first is the back).");
  const layers = value.layers.map((item, index) => layer(item, `${path2}.layers[${index}]`));
  if (layers[0]?.role !== "background" && layers[0]?.role !== "media") fail(`${path2}.layers[0]`, "the back layer must be a background or media layer.");
  if (!["draft", "approved", "rejected"].includes(value.status)) fail(`${path2}.status`, "must be draft, approved or rejected.");
  let reference;
  if (value.reference_assets === "missing" || value.reference_assets === void 0) reference = "missing";
  else if (Array.isArray(value.reference_assets) && value.reference_assets.length > 0 && value.reference_assets.length <= 12 && value.reference_assets.every((id) => typeof id === "string" && ASSET_ID.test(id))) reference = [...value.reference_assets];
  else fail(`${path2}.reference_assets`, "must be asset-manifest ids or the word missing (never a path or URL).");
  const style = {
    id: value.id,
    surface,
    archetype: value.archetype,
    name: localized(value.name, `${path2}.name`),
    intent: { use_when: localized(value.intent.use_when, `${path2}.intent.use_when`), content_types: [...types], pillar: pillar ?? null },
    layers,
    variation: localized(value.variation, `${path2}.variation`),
    do: rules(value.do, `${path2}.do`),
    dont: rules(value.dont, `${path2}.dont`),
    reference_assets: reference,
    status: value.status
  };
  const caption = captionStyle(value.caption_style, `${path2}.caption_style`);
  if (caption !== void 0) style.caption_style = caption;
  const approval = approvalRef(value.approval, `${path2}.approval`);
  if (approval) style.approval = approval;
  if (style.status === "approved" && !approval) fail(`${path2}.approval`, "an approved style needs the approval written by kit approve.");
  return style;
}
function parseFamily(value) {
  const path2 = "family";
  if (!isObject(value)) fail(path2, "must be an object.");
  if (!isObject(value.type)) fail(`${path2}.type`, "must be {headline, body}.");
  if (!isObject(value.palette) || Object.keys(value.palette).length === 0 || Object.keys(value.palette).length > 16) fail(`${path2}.palette`, "must map 1 to 16 palette roles to colour token ids.");
  const palette = {};
  for (const [role, ref] of Object.entries(value.palette)) {
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(role)) fail(`${path2}.palette.${role}`, "a palette role is a short snake_case name.");
    palette[role] = tokenRef(ref, `${path2}.palette.${role}`, "color");
  }
  if (!isObject(value.logo)) fail(`${path2}.logo`, "must be {placement, size_pct, asset, rule_refs}.");
  const placements = ["top_left", "top_right", "bottom_left", "bottom_right", "top_center", "bottom_center", "none"];
  if (!placements.includes(value.logo.placement)) fail(`${path2}.logo.placement`, `must be one of ${placements.join(", ")}.`);
  const size = value.logo.size_pct;
  if (typeof size !== "number" || size < 0 || size > 40) fail(`${path2}.logo.size_pct`, "must be 0 to 40 (% of the canvas width).");
  const asset = value.logo.asset;
  if (typeof asset !== "string" || asset !== "missing" && !ASSET_ID.test(asset)) fail(`${path2}.logo.asset`, "must be an asset-manifest id or the word missing.");
  const factRefs = (list, at) => {
    if (list === void 0 || list === null) return [];
    if (!Array.isArray(list) || list.length > 12 || list.some((item) => typeof item !== "string" || !FACT_REF.test(item))) fail(at, "must list question ids of approved facts, for example brand.photo.direction.");
    return [...list];
  };
  if (!isObject(value.photo_direction)) fail(`${path2}.photo_direction`, "must be {fact_refs}.");
  if (!isObject(value.grid)) fail(`${path2}.grid`, "must be {margin_pct, columns, gutter_pct}.");
  const columns = value.grid.columns;
  if (typeof columns !== "number" || !Number.isInteger(columns) || columns < 1 || columns > 24) fail(`${path2}.grid.columns`, "must be 1 to 24.");
  const marginPct = value.grid.margin_pct;
  const gutterPct = value.grid.gutter_pct;
  if (typeof marginPct !== "number" || marginPct < 0 || marginPct > 25) fail(`${path2}.grid.margin_pct`, "must be 0 to 25.");
  if (typeof gutterPct !== "number" || gutterPct < 0 || gutterPct > 10) fail(`${path2}.grid.gutter_pct`, "must be 0 to 10.");
  const family = {
    type: {
      headline: tokenRef(value.type.headline, `${path2}.type.headline`, "type"),
      body: tokenRef(value.type.body, `${path2}.type.body`, "type"),
      accent: value.type.accent === void 0 || value.type.accent === null ? null : tokenRef(value.type.accent, `${path2}.type.accent`, "type")
    },
    palette,
    logo: { placement: value.logo.placement, size_pct: size, asset, rule_refs: factRefs(value.logo.rule_refs, `${path2}.logo.rule_refs`) },
    photo_direction: { fact_refs: factRefs(value.photo_direction.fact_refs, `${path2}.photo_direction.fact_refs`) },
    corner_radius: tokenRef(value.corner_radius, `${path2}.corner_radius`, "radius"),
    grid: { margin_pct: marginPct, columns, gutter_pct: gutterPct }
  };
  const notes = rules(value.notes, `${path2}.notes`);
  if (notes.length) family.notes = notes;
  return family;
}
function parseKit(doc, brandSlug) {
  if (!isObject(doc)) fail("kit", "must be a YAML mapping.");
  for (const key of Object.keys(doc)) if (!["schema_version", "kind", "brand_slug", "family", "styles"].includes(key)) fail(key, "is not a kit field.");
  if (doc.schema_version !== SOCIAL_KIT_VERSION) fail("schema_version", `must be ${SOCIAL_KIT_VERSION}.`);
  if (doc.kind !== "social_style_kit") fail("kind", "must be social_style_kit.");
  if (typeof doc.brand_slug !== "string" || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(doc.brand_slug)) fail("brand_slug", "must be the brand slug.");
  if (brandSlug !== void 0 && doc.brand_slug !== brandSlug) fail("brand_slug", `belongs to ${doc.brand_slug}, not ${brandSlug}.`);
  if (!Array.isArray(doc.styles) || doc.styles.length > SURFACES.length * MAX_STYLES_PER_SURFACE) fail("styles", "must be a list.");
  const styles = doc.styles.map((item, index) => parseStyle(item, `styles[${index}]`));
  const seen = /* @__PURE__ */ new Set();
  for (const style of styles) {
    if (seen.has(style.id)) fail(`styles.${style.id}`, "is listed twice.");
    seen.add(style.id);
  }
  for (const surface of SURFACES) {
    if (styles.filter((style) => style.surface === surface).length > MAX_STYLES_PER_SURFACE) fail(`styles.${surface}`, `has more than ${MAX_STYLES_PER_SURFACE} styles.`);
  }
  return { schema_version: 1, kind: "social_style_kit", brand_slug: doc.brand_slug, family: parseFamily(doc.family), styles };
}
function styleContent(style) {
  const { status: _status, approval: _approval, ...content } = style;
  return content;
}
function styleDigest(brandSlug, family, style) {
  return sha256Hex(canonicalJson({ domain: SOCIAL_APPROVAL_DOMAIN, brand_slug: brandSlug, family, style: styleContent(style) }));
}
function batchDigest(items) {
  return sha256Hex(canonicalJson([...items].sort((a, b) => a.id < b.id ? -1 : 1).map((item) => [item.id, item.digest])));
}
function approvalEventDigest(input) {
  return sha256Hex(canonicalJson(input));
}
function localize(value, lang) {
  return value[lang] ?? value.en;
}

// packages/brand-core/src/token-semantic.ts
var SEMANTIC_MAP_QUESTION = "brand.color.semantic_map";
var SEMANTIC_COLOR_SLOTS = {
  primary: "color.brand.primary",
  onPrimary: "color.brand.onPrimary",
  secondary: "color.brand.secondary",
  onSecondary: "color.brand.onSecondary",
  accent: "color.brand.accent",
  canvas: "color.light.canvas",
  text: "color.light.text",
  muted: "color.light.muted",
  link: "color.light.link",
  "dark-canvas": "color.dark.canvas",
  "dark-text": "color.dark.text",
  "dark-muted": "color.dark.muted",
  "dark-link": "color.dark.link",
  success: "color.semantic.success",
  onSuccess: "color.semantic.onSuccess",
  warning: "color.semantic.warning",
  danger: "color.semantic.danger",
  onDanger: "color.semantic.onDanger",
  info: "color.semantic.info"
};
var SEMANTIC_SLOTS = Object.keys(SEMANTIC_COLOR_SLOTS);
var BRAND_ROLE_PREFIX = "color.brand-role.";
function brandRoleTokenId(role) {
  return `${BRAND_ROLE_PREFIX}${role.toLowerCase()}`;
}
function norm(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
var SLOT_LOOKUP = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const slot of SEMANTIC_SLOTS) {
    const id = SEMANTIC_COLOR_SLOTS[slot];
    for (const key of [slot, id, id.replace(/^color\./, "")]) map.set(norm(key), slot);
  }
  for (const slot of ["canvas", "text", "muted", "link"]) map.set(norm(`light-${slot}`), slot);
  return map;
})();
function semanticSlotOf(key) {
  return SLOT_LOOKUP.get(norm(key)) ?? null;
}
var SEMANTIC_MAP_FORMAT = "slot = role, separated by ; or new lines. Slots: " + SEMANTIC_SLOTS.join(", ") + ". A role is a name from brand.color.roles; none keeps the template example.";
function parseSemanticMap(value, roles) {
  const byRole = new Map(roles.map((color) => [color.role.toLowerCase(), color]));
  const out = { assignments: [], unmapped: [], problems: [] };
  const seen = /* @__PURE__ */ new Set();
  const entries = value.split(/[;\n,،؛]+/).map((part) => part.trim()).filter(Boolean);
  if (entries.length === 0) out.problems.push("The answer has no entries.");
  for (const entry of entries) {
    const match = entry.match(/^(.+?)\s*(?:->|→|=|:)\s*(.+)$/);
    if (!match) {
      out.problems.push(`\u201C${entry}\u201D is not \u201Cslot = role\u201D.`);
      continue;
    }
    const slot = semanticSlotOf(match[1] ?? "");
    const roleName = (match[2] ?? "").trim().replace(/^["'“”]+|["'“”]+$/g, "");
    if (!slot) {
      out.problems.push(`\u201C${(match[1] ?? "").trim()}\u201D is not a template slot. Slots: ${SEMANTIC_SLOTS.join(", ")}.`);
      continue;
    }
    if (seen.has(slot)) {
      out.problems.push(`${slot} is mapped twice. Only the first entry is used.`);
      continue;
    }
    seen.add(slot);
    if (/^(none|unmapped|template|-)$/i.test(roleName)) {
      out.unmapped.push(slot);
      continue;
    }
    const role = byRole.get(roleName.toLowerCase());
    if (!role) {
      out.problems.push(`${slot}: \u201C${roleName}\u201D is not an approved role in brand.color.roles.`);
      continue;
    }
    out.assignments.push({ slot, token_id: SEMANTIC_COLOR_SLOTS[slot], role: role.role, hex: role.hex });
  }
  return out;
}
function rgb(hex) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}
function luminance(hex) {
  const [r2, g, b] = rgb(hex).map((s) => s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4);
  return 0.2126 * (r2 ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}
function chroma(hex) {
  const channels = rgb(hex);
  return Math.max(...channels) - Math.min(...channels);
}
var SAME_NAME_ALIASES = { danger: ["error"], warning: ["warn"], canvas: ["background", "bg"], text: ["foreground", "fg"] };
function suggestSemanticMap(roles, skip = /* @__PURE__ */ new Set()) {
  const out = [];
  const taken = new Set(skip);
  const add = (slot, color, basis, reason) => {
    if (!color || taken.has(slot)) return;
    taken.add(slot);
    out.push({ slot, token_id: SEMANTIC_COLOR_SLOTS[slot], role: color.role, hex: color.hex, basis, reason });
  };
  const named = (color) => norm(color.role);
  for (const slot of SEMANTIC_SLOTS) {
    const names = [norm(slot), ...(SAME_NAME_ALIASES[slot] ?? []).map(norm)];
    add(slot, roles.find((color) => names.includes(named(color))), "same_name", `The role is named ${slot}.`);
  }
  const pick = (pattern, score) => roles.filter((color) => pattern.test(color.role.toLowerCase())).sort((a, b) => score(b) - score(a) || a.role.localeCompare(b.role))[0];
  const hexOf = (slot) => out.find((item) => item.slot === slot)?.hex;
  add("canvas", pick(/(^|[-_])(bg|background|canvas|surface|paper|base)/, (color) => luminance(color.hex)), "name_and_luminance", "Lightest role named as a background or surface.");
  const canvas = hexOf("canvas");
  const onCanvas = (color) => canvas ? contrastRatio(color.hex, canvas) : 1 - luminance(color.hex);
  add("text", pick(/(text|ink|title|heading|foreground|copy)/, onCanvas), "name_and_luminance", "Role named as text, with the highest contrast on the canvas.");
  add("muted", pick(/(muted|subtitle|subtle|caption|meta)/, onCanvas), "name_and_luminance", "Role named as secondary text, with the highest contrast on the canvas.");
  add("dark-canvas", pick(/(dark|black|night)/, (color) => -luminance(color.hex)), "name_and_luminance", "Darkest role named dark.");
  const darkCanvas = hexOf("dark-canvas");
  if (darkCanvas) {
    const light = roles.filter((color) => chroma(color.hex) < 0.12 && luminance(color.hex) > 0.6).sort((a, b) => contrastRatio(b.hex, darkCanvas) - contrastRatio(a.hex, darkCanvas) || a.role.localeCompare(b.role))[0];
    add("dark-text", light, "highest_contrast", "Light neutral with the highest contrast on the dark canvas.");
  }
  const vivid = roles.filter((color) => chroma(color.hex) >= 0.25 && !out.some((item) => item.role === color.role));
  const brandSlots = ["primary", "secondary", "accent"].filter((slot) => !taken.has(slot));
  brandSlots.forEach((slot, index) => add(slot, vivid[index], "listed_order", `Vivid role number ${index + 1} in the order you listed them.`));
  for (const [on, base] of [["onPrimary", "primary"], ["onSecondary", "secondary"]]) {
    const baseHex = hexOf(base);
    if (!baseHex) continue;
    const best = roles.filter((color) => chroma(color.hex) < 0.12).sort((a, b) => contrastRatio(b.hex, baseHex) - contrastRatio(a.hex, baseHex) || a.role.localeCompare(b.role))[0];
    if (best) add(on, best, "highest_contrast", `Neutral role with the highest contrast on ${base} (${contrastRatio(best.hex, baseHex).toFixed(2)}:1).`);
  }
  return SEMANTIC_SLOTS.flatMap((slot) => out.filter((item) => item.slot === slot));
}
function semanticAnswerText(items) {
  return items.map((item) => `${item.slot} = ${item.role}`).join("; ");
}

// packages/brand-core/src/social-kit/starter.ts
var STARTER_PALETTE = {
  background: SEMANTIC_COLOR_SLOTS.canvas,
  text: SEMANTIC_COLOR_SLOTS.text,
  muted: SEMANTIC_COLOR_SLOTS.muted,
  primary: SEMANTIC_COLOR_SLOTS.primary,
  on_primary: SEMANTIC_COLOR_SLOTS.onPrimary,
  secondary: SEMANTIC_COLOR_SLOTS.secondary,
  on_secondary: SEMANTIC_COLOR_SLOTS.onSecondary,
  accent: SEMANTIC_COLOR_SLOTS.accent,
  dark_canvas: SEMANTIC_COLOR_SLOTS["dark-canvas"],
  dark_text: SEMANTIC_COLOR_SLOTS["dark-text"]
};
var P = STARTER_PALETTE;
var DISPLAY = "type.fontFamily.display";
var BODY = "type.fontFamily.body";
var INK = { canvas: P.text, primary: P.on_primary, secondary: P.on_secondary, dark: P.dark_text };
function r(x, y, w, h) {
  return { x, y, w, h };
}
function L(role, zone2, ground, opts = {}) {
  const textual = ["headline", "subhead", "body", "data", "quote", "cta", "caption_bar", "handle"].includes(role);
  const layer2 = { role, zone: zone2 };
  if (opts.color) layer2.color = opts.color;
  else if (role === "background") layer2.color = ground === "canvas" ? P.background : ground === "primary" ? P.primary : ground === "secondary" ? P.secondary : P.dark_canvas;
  else if (role === "overlay") layer2.color = P.dark_canvas;
  else if (role === "shape" || role === "progress") layer2.color = P.accent;
  else if (textual) layer2.color = INK[ground];
  if (textual) layer2.font = opts.font ?? (["headline", "data", "quote"].includes(role) ? DISPLAY : BODY);
  if (opts.words) layer2.max_words = opts.words;
  if (opts.lines) layer2.max_lines = opts.lines;
  if (opts.rules?.length) layer2.rules = [...opts.rules];
  if (opts.optional) layer2.optional = true;
  return layer2;
}
var t = (en, fa, tr) => ({ en, fa, tr });
var STARTER_ARCHETYPES = {
  post: [
    {
      slug: "bold-statement",
      types: ["inspire", "educate"],
      name: t("Bold statement", "\u062C\u0645\u0644\u0647\u0654 \u067E\u0631\u0631\u0646\u06AF", "G\xFC\xE7l\xFC c\xFCmle"),
      use: t("One strong opinion or takeaway, no photo needed.", "\u06CC\u06A9 \u062F\u06CC\u062F\u06AF\u0627\u0647 \u06CC\u0627 \u0646\u06A9\u062A\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC \u0648 \u0645\u062D\u06A9\u0645\u060C \u0628\u062F\u0648\u0646 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0639\u06A9\u0633.", "Tek bir g\xFC\xE7l\xFC g\xF6r\xFC\u015F ya da \xE7\u0131kar\u0131m; foto\u011Fraf gerekmez."),
      variation: t("Type-led: a full-bleed brand colour and one large headline.", "\u0645\u062A\u0646\u200C\u0645\u062D\u0648\u0631: \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u062A\u0645\u0627\u0645\u200C\u0631\u0646\u06AF\u0650 \u0628\u0631\u0646\u062F \u0648 \u06CC\u06A9 \u062A\u06CC\u062A\u0631 \u0628\u0632\u0631\u06AF.", "Yaz\u0131 odakl\u0131: tam kaplayan marka rengi ve tek b\xFCy\xFCk ba\u015Fl\u0131k."),
      layers: [
        L("background", "full", "primary"),
        L("shape", r(6, 14, 12, 1.2), "primary"),
        L("headline", r(6, 20, 88, 46), "primary", { words: 10, lines: 4, rules: ["one_message"] }),
        L("subhead", r(6, 70, 70, 10), "primary", { words: 14, lines: 2 }),
        L("handle", r(6, 90, 50, 4), "primary", { words: 4, lines: 1 }),
        L("brand_mark", r(76, 88, 18, 6), "primary", { rules: ["brand_mark_small"] })
      ],
      do: ["one_message", "high_contrast", "readable_at_thumb_size"],
      dont: ["no_dense_paragraphs", "no_more_than_three_colors"]
    },
    {
      slug: "photo-headline",
      types: ["behind_the_scenes", "promote", "community"],
      name: t("Photo + headline", "\u0639\u06A9\u0633 \u0628\u0627 \u062A\u06CC\u062A\u0631", "Foto\u011Fraf + ba\u015Fl\u0131k"),
      use: t("A real moment or product shot that needs one line of context.", "\u06CC\u06A9 \u0644\u062D\u0638\u0647\u0654 \u0648\u0627\u0642\u0639\u06CC \u06CC\u0627 \u0639\u06A9\u0633 \u0645\u062D\u0635\u0648\u0644 \u06A9\u0647 \u0641\u0642\u0637 \u06CC\u06A9 \u062E\u0637 \u062A\u0648\u0636\u06CC\u062D \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F.", "Tek sat\u0131rl\u0131k ba\u011Flam isteyen ger\xE7ek bir an ya da \xFCr\xFCn foto\u011Fraf\u0131."),
      variation: t("Image-led: full-bleed photo, a darkened lower half carries the text.", "\u062A\u0635\u0648\u06CC\u0631\u0645\u062D\u0648\u0631: \u0639\u06A9\u0633 \u062A\u0645\u0627\u0645\u200C\u0635\u0641\u062D\u0647 \u0648 \u0645\u062A\u0646 \u0631\u0648\u06CC \u0646\u06CC\u0645\u0647\u0654 \u067E\u0627\u06CC\u06CC\u0646\u06CC\u0650 \u062A\u06CC\u0631\u0647\u200C\u0634\u062F\u0647.", "G\xF6rsel odakl\u0131: tam kaplayan foto\u011Fraf, metin koyula\u015Ft\u0131r\u0131lm\u0131\u015F alt yar\u0131da."),
      layers: [
        L("media", "full", "dark", { rules: ["real_people_only_with_rights"] }),
        L("overlay", r(0, 45, 100, 55), "dark"),
        L("headline", r(6, 62, 88, 20), "dark", { words: 8, lines: 2 }),
        L("body", r(6, 83, 70, 7), "dark", { words: 16, lines: 2 }),
        L("brand_mark", r(80, 5, 14, 5), "dark")
      ],
      do: ["real_people_only_with_rights", "keep_in_safe_zone"],
      dont: ["no_stock_cliche", "no_text_over_face"]
    },
    {
      slug: "insight-data",
      types: ["educate", "proof"],
      name: t("Insight / data card", "\u06A9\u0627\u0631\u062A \u062F\u0627\u062F\u0647 \u0648 \u0628\u06CC\u0646\u0634", "\u0130\xE7g\xF6r\xFC / veri kart\u0131"),
      use: t("One approved number or finding with its source.", "\u06CC\u06A9 \u0639\u062F\u062F \u06CC\u0627 \u06CC\u0627\u0641\u062A\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0645\u0646\u0628\u0639\u0634.", "Kayna\u011F\u0131yla birlikte onayl\u0131 tek bir say\u0131 ya da bulgu."),
      variation: t("Number-led: a large figure on a light canvas, source line below.", "\u0639\u062F\u062F\u0645\u062D\u0648\u0631: \u06CC\u06A9 \u0639\u062F\u062F \u0628\u0632\u0631\u06AF \u0631\u0648\u06CC \u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646 \u0648 \u062E\u0637 \u0645\u0646\u0628\u0639 \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "Say\u0131 odakl\u0131: a\xE7\u0131k zeminde b\xFCy\xFCk bir rakam, alt\u0131nda kaynak sat\u0131r\u0131."),
      layers: [
        L("background", "full", "canvas"),
        L("data", r(6, 16, 60, 28), "canvas", { color: P.primary, words: 3, lines: 1, rules: ["approved_numbers_only"] }),
        L("shape", r(6, 46, 88, 0.6), "canvas"),
        L("subhead", r(6, 49, 80, 10), "canvas", { words: 12, lines: 2 }),
        L("body", r(6, 61, 80, 18), "canvas", { words: 30, lines: 4 }),
        L("body", r(6, 81, 60, 4), "canvas", { color: P.muted, words: 12, lines: 1, rules: ["cite_data_source"] }),
        L("brand_mark", r(6, 89, 16, 5), "canvas")
      ],
      do: ["approved_numbers_only", "cite_data_source"],
      dont: ["no_clickbait", "no_fake_ui"]
    },
    {
      slug: "quote-testimonial",
      types: ["proof", "community"],
      name: t("Quote / testimonial", "\u0646\u0642\u0644\u200C\u0642\u0648\u0644 \u0648 \u0631\u0636\u0627\u06CC\u062A \u0645\u0634\u062A\u0631\u06CC", "Al\u0131nt\u0131 / referans"),
      use: t("A customer\u2019s or the founder\u2019s exact words, with permission.", "\u0639\u06CC\u0646\u0650 \u062C\u0645\u0644\u0647\u0654 \u0645\u0634\u062A\u0631\u06CC \u06CC\u0627 \u0628\u0646\u06CC\u0627\u0646\u200C\u06AF\u0630\u0627\u0631\u060C \u0628\u0627 \u0627\u062C\u0627\u0632\u0647\u0654 \u062E\u0648\u062F\u0634.", "Bir m\xFC\u015Fterinin ya da kurucunun izinli, birebir s\xF6zleri."),
      variation: t("Quote-led: a large quote mark, words on the secondary colour, small portrait.", "\u0646\u0642\u0644\u200C\u0642\u0648\u0644\u200C\u0645\u062D\u0648\u0631: \u0639\u0644\u0627\u0645\u062A \u0646\u0642\u0644\u200C\u0642\u0648\u0644 \u0628\u0632\u0631\u06AF\u060C \u0645\u062A\u0646 \u0631\u0648\u06CC \u0631\u0646\u06AF \u062F\u0648\u0645 \u0628\u0631\u0646\u062F \u0648 \u062A\u0635\u0648\u06CC\u0631 \u06A9\u0648\u0686\u06A9 \u06AF\u0648\u06CC\u0646\u062F\u0647.", "Al\u0131nt\u0131 odakl\u0131: b\xFCy\xFCk t\u0131rnak i\u015Fareti, ikincil renk \xFCzerinde s\xF6zler, k\xFC\xE7\xFCk portre."),
      layers: [
        L("background", "full", "secondary"),
        L("shape", r(6, 10, 16, 12), "secondary"),
        L("quote", r(10, 24, 80, 40), "secondary", { words: 30, lines: 6, rules: ["quote_verbatim_with_permission"] }),
        L("media", r(10, 70, 14, 11), "secondary", { optional: true, rules: ["real_people_only_with_rights"] }),
        L("subhead", r(28, 72, 60, 8), "secondary", { words: 8, lines: 2 }),
        L("brand_mark", r(76, 88, 18, 6), "secondary")
      ],
      do: ["quote_verbatim_with_permission", "real_people_only_with_rights"],
      dont: ["no_dense_paragraphs"]
    }
  ],
  carousel: [
    {
      slug: "step-by-step",
      types: ["educate"],
      name: t("Step by step", "\u06AF\u0627\u0645\u200C\u0628\u0647\u200C\u06AF\u0627\u0645", "Ad\u0131m ad\u0131m"),
      use: t("Teach a process in numbered steps, one per slide.", "\u0622\u0645\u0648\u0632\u0634 \u06CC\u06A9 \u0641\u0631\u0627\u06CC\u0646\u062F \u062F\u0631 \u0686\u0646\u062F \u06AF\u0627\u0645 \u0634\u0645\u0627\u0631\u0647\u200C\u062F\u0627\u0631\u061B \u0647\u0631 \u0627\u0633\u0644\u0627\u06CC\u062F \u06CC\u06A9 \u06AF\u0627\u0645.", "Bir s\xFCreci numaral\u0131 ad\u0131mlarla \xF6\u011Fretin; her slaytta bir ad\u0131m."),
      variation: t("A big step number in the top corner, a progress bar on top, light canvas.", "\u0634\u0645\u0627\u0631\u0647\u0654 \u06AF\u0627\u0645 \u0628\u0632\u0631\u06AF \u062F\u0631 \u06AF\u0648\u0634\u0647\u0654 \u0628\u0627\u0644\u0627\u060C \u0646\u0648\u0627\u0631 \u067E\u06CC\u0634\u0631\u0641\u062A \u062F\u0631 \u0628\u0627\u0644\u0627 \u0648 \u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646.", "\xDCst k\xF6\u015Fede b\xFCy\xFCk ad\u0131m numaras\u0131, \xFCstte ilerleme \xE7ubu\u011Fu, a\xE7\u0131k zemin."),
      layers: [
        L("background", "full", "canvas"),
        L("progress", r(6, 4, 88, 1.5), "canvas", { rules: ["progress_visible"] }),
        L("data", r(6, 10, 24, 18), "canvas", { color: P.primary, words: 1, lines: 1 }),
        L("headline", r(6, 32, 88, 20), "canvas", { words: 9, lines: 3 }),
        L("body", r(6, 55, 88, 28), "canvas", { words: 35, lines: 5 }),
        L("handle", r(6, 90, 50, 4), "canvas", { words: 4, lines: 1 })
      ],
      do: ["hook_on_first_slide", "consistent_slide_numbering", "cta_on_last_slide"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "myth-vs-fact",
      types: ["educate", "proof"],
      name: t("Myth vs fact", "\u0628\u0627\u0648\u0631 \u063A\u0644\u0637 \u062F\u0631 \u0628\u0631\u0627\u0628\u0631 \u0648\u0627\u0642\u0639\u06CC\u062A", "Efsane ve ger\xE7ek"),
      use: t("Correct a common misconception in your field.", "\u0627\u0635\u0644\u0627\u062D \u06CC\u06A9 \u0628\u0627\u0648\u0631 \u063A\u0644\u0637\u0650 \u0631\u0627\u06CC\u062C \u062F\u0631 \u062D\u0648\u0632\u0647\u0654 \u06A9\u0627\u0631\u06CC\u200C\u062A\u0627\u0646.", "Alan\u0131n\u0131zdaki yayg\u0131n bir yanl\u0131\u015F inanc\u0131 d\xFCzeltin."),
      variation: t("Split panels: the myth on the top panel, the fact on the brand colour below.", "\u062F\u0648 \u067E\u0646\u0644: \u0628\u0627\u0648\u0631 \u063A\u0644\u0637 \u062F\u0631 \u067E\u0646\u0644 \u0628\u0627\u0644\u0627 \u0648 \u0648\u0627\u0642\u0639\u06CC\u062A \u0631\u0648\u06CC \u0631\u0646\u06AF \u0628\u0631\u0646\u062F \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "\u0130ki panel: \xFCstte efsane, altta marka renginde ger\xE7ek."),
      layers: [
        L("background", "full", "canvas"),
        L("shape", r(0, 0, 100, 48), "canvas", { color: P.secondary }),
        L("headline", r(6, 12, 88, 28), "secondary", { words: 12, lines: 3 }),
        L("shape", r(0, 52, 100, 48), "canvas", { color: P.primary }),
        L("subhead", r(6, 60, 88, 26), "primary", { words: 20, lines: 4, rules: ["approved_numbers_only"] }),
        L("brand_mark", r(80, 91, 14, 4), "primary")
      ],
      do: ["one_message", "approved_numbers_only"],
      dont: ["no_clickbait"]
    },
    {
      slug: "story-arc",
      types: ["behind_the_scenes", "personal", "proof"],
      name: t("Story arc", "\u0631\u0648\u0627\u06CC\u062A \u062F\u0627\u0633\u062A\u0627\u0646\u06CC", "Hik\xE2ye ak\u0131\u015F\u0131"),
      use: t("A short before\u2013during\u2013after story told in photos.", "\u06CC\u06A9 \u062F\u0627\u0633\u062A\u0627\u0646 \u06A9\u0648\u062A\u0627\u0647 \u0627\u0632 \u0642\u0628\u0644\u060C \u062D\u06CC\u0646 \u0648 \u0628\u0639\u062F\u060C \u0628\u0627 \u0639\u06A9\u0633.", "Foto\u011Fraflarla anlat\u0131lan k\u0131sa bir \xF6nce\u2013s\u0131ras\u0131nda\u2013sonra hik\xE2yesi."),
      variation: t("Photo-led slides with a low caption band and a thin progress line.", "\u0627\u0633\u0644\u0627\u06CC\u062F\u0647\u0627\u06CC \u0639\u06A9\u0633\u200C\u0645\u062D\u0648\u0631 \u0628\u0627 \u0646\u0648\u0627\u0631 \u0645\u062A\u0646 \u067E\u0627\u06CC\u06CC\u0646 \u0648 \u062E\u0637 \u067E\u06CC\u0634\u0631\u0641\u062A \u0628\u0627\u0631\u06CC\u06A9.", "Al\xE7ak bir altyaz\u0131 band\u0131 ve ince ilerleme \xE7izgisiyle foto\u011Fraf odakl\u0131 slaytlar."),
      layers: [
        L("media", "full", "dark", { rules: ["real_people_only_with_rights"] }),
        L("overlay", r(0, 70, 100, 30), "dark"),
        L("handle", r(6, 5, 50, 4), "dark", { words: 4, lines: 1 }),
        L("body", r(6, 74, 88, 16), "dark", { words: 25, lines: 3 }),
        L("progress", r(6, 94, 88, 1), "dark")
      ],
      do: ["hook_on_first_slide", "real_people_only_with_rights"],
      dont: ["no_stock_cliche", "no_text_over_face"]
    },
    {
      slug: "checklist",
      types: ["educate", "community"],
      name: t("Checklist", "\u0686\u06A9\u200C\u0644\u06CC\u0633\u062A", "Kontrol listesi"),
      use: t("A save-worthy list the audience can tick off.", "\u0641\u0647\u0631\u0633\u062A\u06CC \u0627\u0631\u0632\u0634\u0650 \u0630\u062E\u06CC\u0631\u0647\u200C\u06A9\u0631\u062F\u0646 \u06A9\u0647 \u0645\u062E\u0627\u0637\u0628 \u0628\u062A\u0648\u0627\u0646\u062F \u062A\u06CC\u06A9 \u0628\u0632\u0646\u062F.", "Kitlenin kaydedip i\u015Faretleyebilece\u011Fi bir liste."),
      variation: t("Brand-colour slides, a checkbox column beside short items, a CTA at the end.", "\u0627\u0633\u0644\u0627\u06CC\u062F\u0647\u0627\u06CC \u0631\u0646\u06AF \u0628\u0631\u0646\u062F\u060C \u0633\u062A\u0648\u0646 \u062A\u06CC\u06A9 \u06A9\u0646\u0627\u0631 \u0645\u0648\u0627\u0631\u062F \u06A9\u0648\u062A\u0627\u0647 \u0648 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645 \u062F\u0631 \u067E\u0627\u06CC\u0627\u0646.", "Marka renginde slaytlar, k\u0131sa maddelerin yan\u0131nda onay kutusu s\xFCtunu, sonda CTA."),
      layers: [
        L("background", "full", "primary"),
        L("headline", r(6, 8, 88, 14), "primary", { words: 8, lines: 2 }),
        L("shape", r(6, 26, 8, 60), "primary"),
        L("body", r(18, 26, 76, 60), "primary", { words: 40, lines: 6 }),
        L("cta", r(6, 89, 50, 6), "primary", { words: 5, lines: 1, rules: ["one_cta"] })
      ],
      do: ["cta_on_last_slide", "one_cta"],
      dont: ["no_dense_paragraphs"]
    }
  ],
  story: [
    {
      slug: "question-poll",
      types: ["community"],
      name: t("Question / poll", "\u0633\u0624\u0627\u0644 \u0648 \u0646\u0638\u0631\u0633\u0646\u062C\u06CC", "Soru / anket"),
      use: t("Ask the audience something and leave room for the poll sticker.", "\u0627\u0632 \u0645\u062E\u0627\u0637\u0628 \u0686\u06CC\u0632\u06CC \u0628\u067E\u0631\u0633\u06CC\u062F \u0648 \u0628\u0631\u0627\u06CC \u0627\u0633\u062A\u06CC\u06A9\u0631 \u0646\u0638\u0631\u0633\u0646\u062C\u06CC \u062C\u0627 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.", "Kitleye bir \u015Fey sorun ve anket \xE7\u0131kartmas\u0131na yer b\u0131rak\u0131n."),
      variation: t("The question on top, an empty sticker zone in the middle, secondary colour.", "\u0633\u0624\u0627\u0644 \u062F\u0631 \u0628\u0627\u0644\u0627\u060C \u062C\u0627\u06CC \u062E\u0627\u0644\u06CC \u0627\u0633\u062A\u06CC\u06A9\u0631 \u062F\u0631 \u0648\u0633\u0637\u060C \u0631\u0646\u06AF \u062F\u0648\u0645 \u0628\u0631\u0646\u062F.", "\xDCstte soru, ortada bo\u015F \xE7\u0131kartma alan\u0131, ikincil renk."),
      layers: [
        L("background", "full", "secondary"),
        L("headline", r(8, 18, 84, 20), "secondary", { words: 12, lines: 3, rules: ["question_open_ended"] }),
        L("shape", r(12, 44, 76, 18), "secondary", { color: P.background, rules: ["link_sticker_space"] }),
        L("body", r(8, 66, 84, 8), "secondary", { words: 14, lines: 2 }),
        L("handle", r(8, 76, 50, 3), "secondary", { words: 4, lines: 1 })
      ],
      do: ["question_open_ended", "keep_in_safe_zone"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "behind-the-scenes",
      types: ["behind_the_scenes", "personal"],
      name: t("Behind the scenes", "\u067E\u0634\u062A \u0635\u062D\u0646\u0647", "Kamera arkas\u0131"),
      use: t("A casual, real moment from work, lightly branded.", "\u06CC\u06A9 \u0644\u062D\u0638\u0647\u0654 \u0648\u0627\u0642\u0639\u06CC \u0648 \u062E\u0648\u062F\u0645\u0627\u0646\u06CC \u0627\u0632 \u06A9\u0627\u0631\u060C \u0628\u0627 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0646\u0634\u0627\u0646\u0647\u0654 \u0628\u0631\u0646\u062F.", "\u0130\u015Ften samimi, ger\xE7ek bir an; hafif markal\u0131."),
      variation: t("Full-bleed photo or video, one short line in a top band.", "\u0639\u06A9\u0633 \u06CC\u0627 \u0648\u06CC\u062F\u06CC\u0648\u06CC \u062A\u0645\u0627\u0645\u200C\u0635\u0641\u062D\u0647 \u0648 \u06CC\u06A9 \u062C\u0645\u0644\u0647\u0654 \u06A9\u0648\u062A\u0627\u0647 \u062F\u0631 \u0646\u0648\u0627\u0631 \u0628\u0627\u0644\u0627.", "Tam ekran foto\u011Fraf ya da video, \xFCst bantta tek k\u0131sa sat\u0131r."),
      layers: [
        L("media", "full", "dark", { rules: ["real_people_only_with_rights"] }),
        L("overlay", r(0, 13, 100, 14), "dark"),
        L("subhead", r(6, 15, 88, 9), "dark", { words: 8, lines: 2 }),
        L("brand_mark", r(6, 76, 14, 4), "dark", { rules: ["brand_mark_small"] })
      ],
      do: ["keep_in_safe_zone", "brand_mark_small"],
      dont: ["no_stock_cliche"]
    },
    {
      slug: "quick-tip",
      types: ["educate"],
      name: t("Quick tip", "\u0646\u06A9\u062A\u0647\u0654 \u0633\u0631\u06CC\u0639", "H\u0131zl\u0131 ipucu"),
      use: t("One practical tip people can use today.", "\u06CC\u06A9 \u0646\u06A9\u062A\u0647\u0654 \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u06A9\u0647 \u0647\u0645\u06CC\u0646 \u0627\u0645\u0631\u0648\u0632 \u0628\u0634\u0648\u062F \u0628\u0647 \u06A9\u0627\u0631 \u0628\u0631\u062F.", "Bug\xFCn uygulanabilecek tek bir pratik ipucu."),
      variation: t("Light canvas, a tip number, headline and short body; room for the mascot when the brand has one.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646\u060C \u0634\u0645\u0627\u0631\u0647\u0654 \u0646\u06A9\u062A\u0647\u060C \u062A\u06CC\u062A\u0631 \u0648 \u0645\u062A\u0646 \u06A9\u0648\u062A\u0627\u0647\u061B \u0627\u06AF\u0631 \u0628\u0631\u0646\u062F \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u062F\u0627\u0631\u062F\u060C \u0628\u0627 \u062C\u0627 \u0628\u0631\u0627\u06CC \u0622\u0646.", "A\xE7\u0131k zemin, ipucu numaras\u0131, ba\u015Fl\u0131k ve k\u0131sa metin; markan\u0131n maskotu varsa onun i\xE7in yer."),
      layers: [
        L("background", "full", "canvas"),
        L("data", r(8, 16, 30, 10), "canvas", { color: P.primary, words: 2, lines: 1 }),
        L("headline", r(8, 28, 84, 18), "canvas", { words: 9, lines: 3 }),
        L("body", r(8, 48, 84, 16), "canvas", { words: 25, lines: 4 }),
        L("mascot", r(60, 64, 32, 14), "canvas", { optional: true, rules: ["mascot_approved_pose_only"] }),
        L("brand_mark", r(8, 76, 14, 4), "canvas")
      ],
      do: ["one_message", "mascot_approved_pose_only"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "link-cta",
      types: ["promote", "announce"],
      name: t("Link / call to action", "\u0644\u06CC\u0646\u06A9 \u0648 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645", "Ba\u011Flant\u0131 / harekete ge\xE7irici"),
      use: t("Send people to one approved link.", "\u0641\u0631\u0633\u062A\u0627\u062F\u0646 \u0645\u062E\u0627\u0637\u0628 \u0628\u0647 \u06CC\u06A9 \u0644\u06CC\u0646\u06A9\u0650 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.", "Kitleyi onayl\u0131 tek bir ba\u011Flant\u0131ya y\xF6nlendirin."),
      variation: t("Brand colour, a preview image on top, space for the link sticker below the headline.", "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F\u060C \u062A\u0635\u0648\u06CC\u0631 \u067E\u06CC\u0634\u200C\u0646\u0645\u0627\u06CC\u0634 \u062F\u0631 \u0628\u0627\u0644\u0627 \u0648 \u062C\u0627\u06CC \u0627\u0633\u062A\u06CC\u06A9\u0631 \u0644\u06CC\u0646\u06A9 \u0632\u06CC\u0631 \u062A\u06CC\u062A\u0631.", "Marka rengi, \xFCstte \xF6nizleme g\xF6rseli, ba\u015Fl\u0131\u011F\u0131n alt\u0131nda ba\u011Flant\u0131 \xE7\u0131kartmas\u0131 i\xE7in yer."),
      layers: [
        L("background", "full", "primary"),
        L("media", r(10, 16, 80, 34), "primary", { optional: true }),
        L("headline", r(8, 52, 84, 12), "primary", { words: 8, lines: 2 }),
        L("cta", r(20, 66, 60, 8), "primary", { words: 4, lines: 1, rules: ["one_cta", "link_sticker_space"] }),
        L("handle", r(8, 77, 50, 3), "primary", { words: 4, lines: 1 })
      ],
      do: ["one_cta", "link_sticker_space"],
      dont: ["no_clickbait"]
    }
  ],
  reel: [
    {
      slug: "talking-head-captions",
      types: ["educate", "personal", "inspire"],
      name: t("Talking head + captions", "\u0635\u062D\u0628\u062A \u0631\u0648 \u0628\u0647 \u062F\u0648\u0631\u0628\u06CC\u0646 \u0628\u0627 \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633", "Konu\u015Fan ki\u015Fi + altyaz\u0131"),
      use: t("You speak to camera; captions carry the message with the sound off.", "\u0631\u0648 \u0628\u0647 \u062F\u0648\u0631\u0628\u06CC\u0646 \u0635\u062D\u0628\u062A \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F \u0648 \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645 \u0631\u0627 \u062D\u062A\u06CC \u0628\u06CC\u200C\u0635\u062F\u0627 \u0645\u06CC\u200C\u0631\u0633\u0627\u0646\u062F.", "Kameraya konu\u015Fursunuz; altyaz\u0131 mesaj\u0131 ses kapal\u0131yken de ta\u015F\u0131r."),
      variation: t("Face full frame, a hook line on top for two seconds, captions in the lower third.", "\u0686\u0647\u0631\u0647 \u062F\u0631 \u06A9\u0644 \u06A9\u0627\u062F\u0631\u060C \u062C\u0645\u0644\u0647\u0654 \u0642\u0644\u0627\u0628 \u062F\u0631 \u0628\u0627\u0644\u0627 \u0628\u0631\u0627\u06CC \u062F\u0648 \u062B\u0627\u0646\u06CC\u0647\u060C \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u062F\u0631 \u06CC\u06A9\u200C\u0633\u0648\u0645 \u067E\u0627\u06CC\u06CC\u0646.", "Y\xFCz tam kadraj, ilk iki saniye \xFCstte kanca c\xFCmlesi, alt \xFC\xE7te birde altyaz\u0131."),
      layers: [
        L("media", "full", "dark", { rules: ["real_people_only_with_rights"] }),
        L("headline", r(6, 15, 80, 10), "dark", { words: 7, lines: 2 }),
        L("caption_bar", r(6, 62, 80, 12), "dark", { words: 6, lines: 2, rules: ["captions_always_on"] }),
        L("brand_mark", r(6, 76, 12, 3), "dark", { rules: ["brand_mark_small"] })
      ],
      do: ["captions_always_on", "keep_in_safe_zone"],
      dont: ["no_text_over_face"]
    },
    {
      slug: "broll-voiceover",
      types: ["behind_the_scenes", "promote"],
      name: t("B-roll + voiceover", "\u062A\u0635\u0627\u0648\u06CC\u0631 \u0645\u06A9\u0645\u0644 \u0628\u0627 \u0635\u062F\u0627\u06CC \u0631\u0648\u06CC \u062A\u0635\u0648\u06CC\u0631", "B-roll + d\u0131\u015F ses"),
      use: t("Show the work or product while a voice explains.", "\u0646\u0645\u0627\u06CC\u0634 \u06A9\u0627\u0631 \u06CC\u0627 \u0645\u062D\u0635\u0648\u0644 \u062F\u0631 \u062D\u0627\u0644\u06CC \u06A9\u0647 \u0635\u062F\u0627\u06CC\u06CC \u062A\u0648\u0636\u06CC\u062D \u0645\u06CC\u200C\u062F\u0647\u062F.", "Bir ses anlat\u0131rken i\u015Fi ya da \xFCr\xFCn\xFC g\xF6sterin."),
      variation: t("Footage full frame, a mid-screen band with the key line, small captions.", "\u0641\u06CC\u0644\u0645 \u062F\u0631 \u06A9\u0644 \u06A9\u0627\u062F\u0631\u060C \u0646\u0648\u0627\u0631\u06CC \u062F\u0631 \u0645\u06CC\u0627\u0646\u0647\u0654 \u0635\u0641\u062D\u0647 \u0628\u0627 \u062C\u0645\u0644\u0647\u0654 \u0627\u0635\u0644\u06CC \u0648 \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633 \u06A9\u0648\u0686\u06A9.", "Tam kadraj g\xF6r\xFCnt\xFC, ortada ana c\xFCmleyi ta\u015F\u0131yan bir bant, k\xFC\xE7\xFCk altyaz\u0131."),
      layers: [
        L("media", "full", "dark"),
        L("overlay", r(0, 40, 100, 20), "dark"),
        L("headline", r(6, 42, 80, 16), "dark", { words: 8, lines: 2 }),
        L("caption_bar", r(6, 70, 80, 8), "dark", { words: 6, lines: 2, rules: ["captions_always_on"] })
      ],
      do: ["captions_always_on", "one_message"],
      dont: ["no_stock_cliche"]
    },
    {
      slug: "list-on-screen",
      types: ["educate"],
      name: t("List on screen", "\u0641\u0647\u0631\u0633\u062A \u0631\u0648\u06CC \u0635\u0641\u062D\u0647", "Ekranda liste"),
      use: t("Numbered points that appear one by one.", "\u0646\u06A9\u062A\u0647\u200C\u0647\u0627\u06CC \u0634\u0645\u0627\u0631\u0647\u200C\u062F\u0627\u0631 \u06A9\u0647 \u06CC\u06A9\u06CC\u200C\u06CC\u06A9\u06CC \u0638\u0627\u0647\u0631 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.", "Tek tek beliren numaral\u0131 maddeler."),
      variation: t("Dark canvas, a counter on top, the list builds in the middle, a progress line.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u062A\u06CC\u0631\u0647\u060C \u0634\u0645\u0627\u0631\u0646\u062F\u0647 \u062F\u0631 \u0628\u0627\u0644\u0627\u060C \u0641\u0647\u0631\u0633\u062A\u06CC \u06A9\u0647 \u062F\u0631 \u0648\u0633\u0637 \u06A9\u0627\u0645\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u062E\u0637 \u067E\u06CC\u0634\u0631\u0641\u062A.", "Koyu zemin, \xFCstte saya\xE7, ortada b\xFCy\xFCyen liste, ilerleme \xE7izgisi."),
      layers: [
        L("background", "full", "dark"),
        L("data", r(6, 14, 20, 8), "dark", { color: P.accent, words: 1, lines: 1 }),
        L("headline", r(6, 24, 80, 14), "dark", { words: 8, lines: 2 }),
        L("body", r(6, 40, 80, 32), "dark", { words: 30, lines: 5 }),
        L("progress", r(6, 78, 80, 1), "dark", { rules: ["progress_visible"] })
      ],
      do: ["progress_visible", "keep_in_safe_zone"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "before-after",
      types: ["proof", "educate"],
      name: t("Before / after", "\u0642\u0628\u0644 \u0648 \u0628\u0639\u062F", "\xD6nce / sonra"),
      use: t("Show a change with the same framing twice.", "\u0646\u0634\u0627\u0646\u200C\u062F\u0627\u062F\u0646 \u06CC\u06A9 \u062A\u063A\u06CC\u06CC\u0631 \u0628\u0627 \u062F\u0648 \u06A9\u0627\u062F\u0631\u0650 \u06CC\u06A9\u0633\u0627\u0646.", "Bir de\u011Fi\u015Fimi ayn\u0131 kadrajla iki kez g\xF6sterin."),
      variation: t("The screen split top and bottom with labels, one caption line.", "\u0635\u0641\u062D\u0647\u0654 \u062F\u0648\u0628\u062E\u0634\u06CC \u0628\u0627\u0644\u0627 \u0648 \u067E\u0627\u06CC\u06CC\u0646 \u0628\u0627 \u0628\u0631\u0686\u0633\u0628 \u0648 \u06CC\u06A9 \u062E\u0637 \u0632\u06CC\u0631\u0646\u0648\u06CC\u0633.", "Etiketli \xFCst ve alt b\xF6l\xFCnm\xFC\u015F ekran, tek altyaz\u0131 sat\u0131r\u0131."),
      layers: [
        L("media", r(0, 0, 100, 50), "dark", { rules: ["before_after_same_framing"] }),
        L("media", r(0, 50, 100, 50), "dark"),
        L("shape", r(0, 49.5, 100, 1), "dark"),
        L("subhead", r(6, 15, 40, 5), "dark", { words: 2, lines: 1 }),
        L("subhead", r(6, 53, 40, 5), "dark", { words: 2, lines: 1 }),
        L("caption_bar", r(6, 72, 80, 7), "dark", { words: 6, lines: 2, rules: ["captions_always_on"] })
      ],
      do: ["before_after_same_framing", "approved_numbers_only"],
      dont: ["no_clickbait", "no_fake_ui"]
    }
  ],
  reel_cover: [
    {
      slug: "big-title",
      types: ["educate", "inspire"],
      name: t("Big title", "\u062A\u06CC\u062A\u0631 \u062F\u0631\u0634\u062A", "B\xFCy\xFCk ba\u015Fl\u0131k"),
      use: t("A clean cover that reads in the profile grid.", "\u06A9\u0627\u0648\u0631\u06CC \u0633\u0627\u062F\u0647 \u06A9\u0647 \u062F\u0631 \u0634\u0628\u06A9\u0647\u0654 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u062E\u0648\u0627\u0646\u0627 \u0628\u0645\u0627\u0646\u062F.", "Profil \u0131zgaras\u0131nda okunan sade bir kapak."),
      variation: t("Brand colour, up to five words inside the 1:1 crop.", "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F \u0648 \u062D\u062F\u0627\u06A9\u062B\u0631 \u067E\u0646\u062C \u06A9\u0644\u0645\u0647 \u062F\u0627\u062E\u0644 \u0628\u0631\u0634 \u06F1:\u06F1.", "Marka rengi, 1:1 k\u0131rpman\u0131n i\xE7inde en fazla be\u015F kelime."),
      layers: [
        L("background", "full", "primary"),
        L("headline", r(8, 30, 84, 30), "primary", { words: 5, lines: 3, rules: ["readable_at_thumb_size"] }),
        L("shape", r(8, 62, 20, 1), "primary"),
        L("brand_mark", r(8, 68, 14, 4), "primary")
      ],
      do: ["readable_at_thumb_size", "keep_in_safe_zone"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "face-title",
      types: ["personal", "educate"],
      name: t("Face + title", "\u0686\u0647\u0631\u0647 \u0628\u0627 \u062A\u06CC\u062A\u0631", "Y\xFCz + ba\u015Fl\u0131k"),
      use: t("Covers for talking-head reels.", "\u06A9\u0627\u0648\u0631 \u0631\u06CC\u0644\u0632\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u062F\u0631 \u0622\u0646 \u0631\u0648 \u0628\u0647 \u062F\u0648\u0631\u0628\u06CC\u0646 \u0635\u062D\u0628\u062A \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F.", "Kameraya konu\u015Fulan reels videolar\u0131 i\xE7in kapak."),
      variation: t("A frame from the video, the title on a darkened band inside the crop.", "\u0641\u0631\u06CC\u0645\u06CC \u0627\u0632 \u062E\u0648\u062F \u0648\u06CC\u062F\u06CC\u0648 \u0648 \u062A\u06CC\u062A\u0631 \u0631\u0648\u06CC \u0646\u0648\u0627\u0631\u06CC \u062A\u06CC\u0631\u0647 \u062F\u0627\u062E\u0644 \u0628\u0631\u0634.", "Videodan bir kare, k\u0131rpman\u0131n i\xE7inde koyula\u015Ft\u0131r\u0131lm\u0131\u015F bantta ba\u015Fl\u0131k."),
      layers: [
        L("media", "full", "dark", { rules: ["real_people_only_with_rights"] }),
        L("overlay", r(0, 50, 100, 28), "dark"),
        L("headline", r(8, 54, 84, 20), "dark", { words: 5, lines: 2 })
      ],
      do: ["readable_at_thumb_size", "real_people_only_with_rights"],
      dont: ["no_text_over_face"]
    },
    {
      slug: "series-number",
      types: ["educate", "community"],
      name: t("Series number", "\u0634\u0645\u0627\u0631\u0647\u0654 \u0642\u0633\u0645\u062A", "Seri numaras\u0131"),
      use: t("Recurring series whose episodes should line up in the grid.", "\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627\u06CC \u062A\u06A9\u0631\u0627\u0631\u0634\u0648\u0646\u062F\u0647 \u06A9\u0647 \u0642\u0633\u0645\u062A\u200C\u0647\u0627\u06CC\u0634\u0627\u0646 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0634\u0628\u06A9\u0647 \u06A9\u0646\u0627\u0631 \u0647\u0645 \u0628\u0646\u0634\u06CC\u0646\u0646\u062F.", "B\xF6l\xFCmleri \u0131zgarada s\u0131ralanmas\u0131 gereken d\xFCzenli seriler."),
      variation: t("Light canvas, a large episode number, the series name and the title.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646\u060C \u0634\u0645\u0627\u0631\u0647\u0654 \u0642\u0633\u0645\u062A \u0628\u0632\u0631\u06AF\u060C \u0646\u0627\u0645 \u0645\u062C\u0645\u0648\u0639\u0647 \u0648 \u062A\u06CC\u062A\u0631.", "A\xE7\u0131k zemin, b\xFCy\xFCk b\xF6l\xFCm numaras\u0131, seri ad\u0131 ve ba\u015Fl\u0131k."),
      layers: [
        L("background", "full", "canvas"),
        L("data", r(8, 25, 40, 22), "canvas", { color: P.primary, words: 1, lines: 1 }),
        L("subhead", r(8, 48, 84, 6), "canvas", { color: P.muted, words: 4, lines: 1 }),
        L("headline", r(8, 56, 84, 16), "canvas", { words: 6, lines: 2 })
      ],
      do: ["consistent_slide_numbering", "readable_at_thumb_size"],
      dont: ["no_more_than_three_colors"]
    },
    {
      slug: "mascot-hook",
      types: ["entertain", "educate"],
      name: t("Mascot hook", "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0631\u0646\u062F \u0648 \u0642\u0644\u0627\u0628", "Maskot kancas\u0131"),
      use: t("Covers where an approved mascot pose fits the topic.", "\u06A9\u0627\u0648\u0631\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u06CC\u06A9 \u0698\u0633\u062A\u0650 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627 \u0645\u0648\u0636\u0648\u0639 \u062C\u0648\u0631 \u0627\u0633\u062A.", "Onayl\u0131 bir maskot pozunun konuya uydu\u011Fu kapaklar."),
      variation: t("Secondary colour, the mascot on one side, the title on the other.", "\u0631\u0646\u06AF \u062F\u0648\u0645 \u0628\u0631\u0646\u062F\u060C \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u062F\u0631 \u06CC\u06A9 \u0633\u0648 \u0648 \u062A\u06CC\u062A\u0631 \u062F\u0631 \u0633\u0648\u06CC \u062F\u06CC\u06AF\u0631.", "\u0130kincil renk, bir yanda maskot, di\u011Fer yanda ba\u015Fl\u0131k."),
      layers: [
        L("background", "full", "secondary"),
        L("mascot", r(45, 28, 47, 44), "secondary", { rules: ["mascot_approved_pose_only"] }),
        L("headline", r(8, 30, 40, 36), "secondary", { words: 5, lines: 4 }),
        L("brand_mark", r(8, 70, 14, 4), "secondary")
      ],
      do: ["mascot_approved_pose_only", "readable_at_thumb_size"],
      dont: ["no_more_than_three_colors"]
    },
    {
      slug: "question",
      types: ["educate", "community"],
      name: t("Question cover", "\u06A9\u0627\u0648\u0631 \u0633\u0624\u0627\u0644\u06CC", "Soru kapa\u011F\u0131"),
      use: t("Reels that answer one question the audience asks.", "\u0631\u06CC\u0644\u0632\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0647 \u06CC\u06A9 \u0633\u0624\u0627\u0644\u0650 \u0645\u062E\u0627\u0637\u0628 \u062C\u0648\u0627\u0628 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F.", "Kitlenin sordu\u011Fu tek bir soruyu yan\u0131tlayan reels."),
      variation: t("Dark canvas, the question as the headline and a short answer teaser.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u062A\u06CC\u0631\u0647\u060C \u062E\u0648\u062F\u0650 \u0633\u0624\u0627\u0644 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u062A\u06CC\u062A\u0631 \u0648 \u06CC\u06A9 \u0627\u0634\u0627\u0631\u0647\u0654 \u06A9\u0648\u062A\u0627\u0647 \u0628\u0647 \u062C\u0648\u0627\u0628.", "Koyu zemin, ba\u015Fl\u0131k olarak soru ve k\u0131sa bir cevap ipucu."),
      layers: [
        L("background", "full", "dark"),
        L("headline", r(8, 30, 84, 28), "dark", { words: 8, lines: 3 }),
        L("subhead", r(8, 60, 84, 8), "dark", { color: P.primary, words: 5, lines: 1 }),
        L("brand_mark", r(8, 72, 14, 4), "dark")
      ],
      do: ["one_message", "readable_at_thumb_size"],
      dont: ["no_more_than_three_colors"]
    }
  ],
  thumbnail: [
    {
      slug: "face-text",
      types: ["personal", "educate"],
      name: t("Face + text", "\u0686\u0647\u0631\u0647 \u0648 \u0645\u062A\u0646", "Y\xFCz + metin"),
      use: t("Videos led by a person.", "\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u062D\u0648\u0631\u0634\u0627\u0646 \u06CC\u06A9 \u0622\u062F\u0645 \u0627\u0633\u062A.", "Bir ki\u015Finin \xF6ne \xE7\u0131kt\u0131\u011F\u0131 videolar."),
      variation: t("Brand colour, the face on one half, up to four words on the other.", "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F\u060C \u0686\u0647\u0631\u0647 \u062F\u0631 \u06CC\u06A9 \u0646\u06CC\u0645\u0647 \u0648 \u062D\u062F\u0627\u06A9\u062B\u0631 \u0686\u0647\u0627\u0631 \u06A9\u0644\u0645\u0647 \u062F\u0631 \u0646\u06CC\u0645\u0647\u0654 \u062F\u06CC\u06AF\u0631.", "Marka rengi, bir yar\u0131da y\xFCz, di\u011Fer yar\u0131da en fazla d\xF6rt kelime."),
      layers: [
        L("background", "full", "primary"),
        L("media", r(45, 0, 55, 100), "primary", { rules: ["real_people_only_with_rights"] }),
        L("headline", r(5, 15, 42, 55), "primary", { words: 4, lines: 3, rules: ["readable_at_thumb_size"] }),
        L("shape", r(5, 74, 20, 3), "primary")
      ],
      do: ["face_left_text_right", "readable_at_thumb_size"],
      dont: ["no_clickbait"]
    },
    {
      slug: "big-number",
      types: ["educate", "proof"],
      name: t("Big number", "\u0639\u062F\u062F \u0628\u0632\u0631\u06AF", "B\xFCy\xFCk say\u0131"),
      use: t("Videos built around one approved figure or a count.", "\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u062D\u0648\u0644 \u06CC\u06A9 \u0639\u062F\u062F \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u06CC\u0627 \u06CC\u06A9 \u0634\u0645\u0627\u0631\u0634 \u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.", "Onayl\u0131 tek bir rakam ya da say\u0131m etraf\u0131nda kurulan videolar."),
      variation: t("Light canvas, a huge number on one side, a short line beside it.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646\u060C \u0639\u062F\u062F\u06CC \u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF \u062F\u0631 \u06CC\u06A9 \u0633\u0648 \u0648 \u062C\u0645\u0644\u0647\u200C\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u06A9\u0646\u0627\u0631\u0634.", "A\xE7\u0131k zemin, bir yanda \xE7ok b\xFCy\xFCk bir say\u0131, yan\u0131nda k\u0131sa sat\u0131r."),
      layers: [
        L("background", "full", "canvas"),
        L("data", r(5, 12, 45, 60), "canvas", { color: P.primary, words: 1, lines: 1, rules: ["approved_numbers_only"] }),
        L("subhead", r(52, 30, 42, 30), "canvas", { words: 5, lines: 3 }),
        L("brand_mark", r(5, 80, 12, 10), "canvas")
      ],
      do: ["approved_numbers_only", "readable_at_thumb_size"],
      dont: ["no_clickbait"]
    },
    {
      slug: "split-compare",
      types: ["educate", "proof"],
      name: t("Split compare", "\u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u062F\u0648\u062A\u0627\u06CC\u06CC", "\u0130kili kar\u015F\u0131la\u015Ft\u0131rma"),
      use: t("Comparisons, versus and before/after videos.", "\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u0645\u0642\u0627\u06CC\u0633\u0647\u060C \u0627\u06CC\u0646 \u06CC\u0627 \u0622\u0646\u060C \u0648 \u0642\u0628\u0644 \u0648 \u0628\u0639\u062F.", "Kar\u015F\u0131la\u015Ft\u0131rma, k\u0131yas ve \xF6nce/sonra videolar\u0131."),
      variation: t("Two images side by side, a divider, a title band at the bottom.", "\u062F\u0648 \u062A\u0635\u0648\u06CC\u0631 \u06A9\u0646\u0627\u0631 \u0647\u0645\u060C \u06CC\u06A9 \u062E\u0637 \u062C\u062F\u0627\u06A9\u0646\u0646\u062F\u0647 \u0648 \u0646\u0648\u0627\u0631 \u062A\u06CC\u062A\u0631 \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "Yan yana iki g\xF6rsel, bir ay\u0131r\u0131c\u0131, altta ba\u015Fl\u0131k band\u0131."),
      layers: [
        L("media", r(0, 0, 50, 100), "dark"),
        L("media", r(50, 0, 50, 100), "dark"),
        L("shape", r(49, 0, 2, 100), "dark"),
        L("headline", r(20, 70, 60, 22), "dark", { words: 4, lines: 1 })
      ],
      do: ["before_after_same_framing", "readable_at_thumb_size"],
      dont: ["no_fake_ui"]
    },
    {
      slug: "object-closeup",
      types: ["promote", "behind_the_scenes"],
      name: t("Object close-up", "\u0646\u0645\u0627\u06CC \u0646\u0632\u062F\u06CC\u06A9 \u0627\u0632 \u0634\u06CC\u0621", "Nesne yak\u0131n \xE7ekim"),
      use: t("Product, tool or process videos without a face.", "\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u0645\u062D\u0635\u0648\u0644\u060C \u0627\u0628\u0632\u0627\u0631 \u06CC\u0627 \u0641\u0631\u0627\u06CC\u0646\u062F \u0628\u062F\u0648\u0646 \u0686\u0647\u0631\u0647.", "Y\xFCz olmadan \xFCr\xFCn, ara\xE7 ya da s\xFCre\xE7 videolar\u0131."),
      variation: t("A full-bleed close-up; a dark overlay on one side holds the title.", "\u0646\u0645\u0627\u06CC \u0646\u0632\u062F\u06CC\u06A9\u0650 \u062A\u0645\u0627\u0645\u200C\u0635\u0641\u062D\u0647 \u0648 \u067E\u0648\u0634\u0634 \u062A\u06CC\u0631\u0647 \u062F\u0631 \u06CC\u06A9 \u0633\u0648 \u06A9\u0647 \u062A\u06CC\u062A\u0631 \u0631\u0627 \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F.", "Tam kaplayan yak\u0131n \xE7ekim; bir yandaki koyu katman ba\u015Fl\u0131\u011F\u0131 ta\u015F\u0131r."),
      layers: [
        L("media", "full", "dark"),
        L("overlay", r(0, 0, 55, 100), "dark"),
        L("headline", r(5, 20, 45, 45), "dark", { words: 4, lines: 3 }),
        L("brand_mark", r(5, 78, 12, 12), "dark")
      ],
      do: ["readable_at_thumb_size", "high_contrast"],
      dont: ["no_stock_cliche"]
    }
  ],
  linkedin_post: [
    {
      slug: "insight-card",
      types: ["educate", "inspire"],
      name: t("Insight card", "\u06A9\u0627\u0631\u062A \u0628\u06CC\u0646\u0634", "\u0130\xE7g\xF6r\xFC kart\u0131"),
      use: t("A professional lesson or point of view in a few lines.", "\u06CC\u06A9 \u062F\u0631\u0633 \u06CC\u0627 \u062F\u06CC\u062F\u06AF\u0627\u0647 \u062D\u0631\u0641\u0647\u200C\u0627\u06CC \u062F\u0631 \u0686\u0646\u062F \u062E\u0637.", "Birka\xE7 sat\u0131rda profesyonel bir ders ya da bak\u0131\u015F a\xE7\u0131s\u0131."),
      variation: t("Light canvas, a vertical rule, headline and body, a name line at the bottom.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646\u060C \u062E\u0637 \u0639\u0645\u0648\u062F\u06CC\u060C \u062A\u06CC\u062A\u0631 \u0648 \u0645\u062A\u0646 \u0648 \u062E\u0637 \u0646\u0627\u0645 \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "A\xE7\u0131k zemin, dikey \xE7izgi, ba\u015Fl\u0131k ve metin, altta isim sat\u0131r\u0131."),
      layers: [
        L("background", "full", "canvas"),
        L("shape", r(3, 12, 1, 64), "canvas"),
        L("headline", r(7, 12, 86, 30), "canvas", { words: 14, lines: 4 }),
        L("body", r(7, 46, 86, 30), "canvas", { words: 45, lines: 6 }),
        L("handle", r(7, 84, 60, 6), "canvas", { words: 8, lines: 2 }),
        L("brand_mark", r(80, 86, 13, 5), "canvas")
      ],
      do: ["one_message", "left_align_ltr_right_align_rtl"],
      dont: ["no_clickbait"]
    },
    {
      slug: "framework-diagram",
      types: ["educate"],
      name: t("Framework diagram", "\u0646\u0645\u0648\u062F\u0627\u0631 \u0686\u0627\u0631\u0686\u0648\u0628", "\xC7er\xE7eve diyagram\u0131"),
      use: t("Explain a model, matrix or process visually.", "\u062A\u0648\u0636\u06CC\u062D \u06CC\u06A9 \u0645\u062F\u0644\u060C \u0645\u0627\u062A\u0631\u06CC\u0633 \u06CC\u0627 \u0641\u0631\u0627\u06CC\u0646\u062F \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u062A\u0635\u0648\u06CC\u0631\u06CC.", "Bir modeli, matrisi ya da s\xFCreci g\xF6rsel olarak anlat\u0131n."),
      variation: t("A short title, a large diagram area, labels below.", "\u062A\u06CC\u062A\u0631 \u06A9\u0648\u062A\u0627\u0647\u060C \u0641\u0636\u0627\u06CC \u0628\u0632\u0631\u06AF \u0628\u0631\u0627\u06CC \u0646\u0645\u0648\u062F\u0627\u0631 \u0648 \u0628\u0631\u0686\u0633\u0628\u200C\u0647\u0627 \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "K\u0131sa ba\u015Fl\u0131k, geni\u015F diyagram alan\u0131, altta etiketler."),
      layers: [
        L("background", "full", "canvas"),
        L("headline", r(7, 6, 86, 12), "canvas", { words: 8, lines: 2 }),
        L("shape", r(7, 22, 86, 56), "canvas", { color: P.muted }),
        L("body", r(7, 80, 86, 8), "canvas", { words: 16, lines: 2 }),
        L("brand_mark", r(80, 91, 13, 5), "canvas")
      ],
      do: ["max_two_type_sizes", "no_more_than_three_colors"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "portrait-quote",
      types: ["personal", "proof"],
      name: t("Portrait + quote", "\u067E\u0631\u062A\u0631\u0647 \u0648 \u0646\u0642\u0644\u200C\u0642\u0648\u0644", "Portre + al\u0131nt\u0131"),
      use: t("A person\u2019s own words, with an approved portrait.", "\u062C\u0645\u0644\u0647\u0654 \u062E\u0648\u062F\u0650 \u06CC\u06A9 \u0646\u0641\u0631\u060C \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u067E\u0631\u062A\u0631\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.", "Onayl\u0131 bir portreyle, ki\u015Finin kendi s\xF6zleri."),
      variation: t("Brand colour, a small portrait on top, a large quote, the name below.", "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F\u060C \u067E\u0631\u062A\u0631\u0647\u0654 \u06A9\u0648\u0686\u06A9 \u062F\u0631 \u0628\u0627\u0644\u0627\u060C \u0646\u0642\u0644\u200C\u0642\u0648\u0644 \u0628\u0632\u0631\u06AF \u0648 \u0646\u0627\u0645 \u062F\u0631 \u067E\u0627\u06CC\u06CC\u0646.", "Marka rengi, \xFCstte k\xFC\xE7\xFCk portre, b\xFCy\xFCk al\u0131nt\u0131, altta isim."),
      layers: [
        L("background", "full", "primary"),
        L("media", r(7, 8, 30, 30), "primary", { rules: ["real_people_only_with_rights"] }),
        L("quote", r(7, 42, 86, 36), "primary", { words: 35, lines: 6, rules: ["quote_verbatim_with_permission"] }),
        L("subhead", r(7, 82, 60, 6), "primary", { words: 8, lines: 2 })
      ],
      do: ["quote_verbatim_with_permission", "real_people_only_with_rights"],
      dont: ["no_text_over_face"]
    },
    {
      slug: "announcement",
      types: ["announce", "promote"],
      name: t("Announcement", "\u0627\u0637\u0644\u0627\u0639\u06CC\u0647", "Duyuru"),
      use: t("News: an approved launch, event, hire or milestone.", "\u062E\u0628\u0631: \u06CC\u06A9 \u0639\u0631\u0636\u0647\u060C \u0631\u0648\u06CC\u062F\u0627\u062F\u060C \u062C\u0630\u0628 \u0646\u06CC\u0631\u0648 \u06CC\u0627 \u062F\u0633\u062A\u0627\u0648\u0631\u062F\u0650 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.", "Haber: onayl\u0131 bir lansman, etkinlik, i\u015Fe al\u0131m ya da kilometre ta\u015F\u0131."),
      variation: t("Secondary colour, a date label, a big headline, an optional image, one CTA.", "\u0631\u0646\u06AF \u062F\u0648\u0645 \u0628\u0631\u0646\u062F\u060C \u0628\u0631\u0686\u0633\u0628 \u062A\u0627\u0631\u06CC\u062E\u060C \u062A\u06CC\u062A\u0631 \u0628\u0632\u0631\u06AF\u060C \u062A\u0635\u0648\u06CC\u0631 \u0627\u062E\u062A\u06CC\u0627\u0631\u06CC \u0648 \u06CC\u06A9 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645.", "\u0130kincil renk, tarih etiketi, b\xFCy\xFCk ba\u015Fl\u0131k, iste\u011Fe ba\u011Fl\u0131 g\xF6rsel, tek CTA."),
      layers: [
        L("background", "full", "secondary"),
        L("data", r(7, 10, 50, 8), "secondary", { color: P.accent, words: 4, lines: 1 }),
        L("headline", r(7, 22, 86, 34), "secondary", { words: 12, lines: 4 }),
        L("media", r(7, 60, 86, 24), "secondary", { optional: true }),
        L("cta", r(7, 88, 40, 6), "secondary", { words: 4, lines: 1, rules: ["one_cta"] })
      ],
      do: ["one_cta", "one_message"],
      dont: ["no_clickbait"]
    }
  ],
  linkedin_document: [
    {
      slug: "cover-chapter",
      types: ["educate", "announce"],
      name: t("Cover / chapter", "\u062C\u0644\u062F \u0648 \u0641\u0635\u0644", "Kapak / b\xF6l\xFCm"),
      use: t("The first slide and the chapter breaks of a document.", "\u0627\u0633\u0644\u0627\u06CC\u062F \u0627\u0648\u0644 \u0648 \u062C\u062F\u0627\u06A9\u0646\u0646\u062F\u0647\u0654 \u0641\u0635\u0644\u200C\u0647\u0627\u06CC \u06CC\u06A9 \u0633\u0646\u062F.", "Bir belgenin ilk slayt\u0131 ve b\xF6l\xFCm aralar\u0131."),
      variation: t("Brand colour, a large title in the middle, a subtitle and the name.", "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F\u060C \u0639\u0646\u0648\u0627\u0646 \u0628\u0632\u0631\u06AF \u062F\u0631 \u0645\u06CC\u0627\u0646\u0647\u060C \u0632\u06CC\u0631\u0639\u0646\u0648\u0627\u0646 \u0648 \u0646\u0627\u0645.", "Marka rengi, ortada b\xFCy\xFCk ba\u015Fl\u0131k, alt ba\u015Fl\u0131k ve isim."),
      layers: [
        L("background", "full", "primary"),
        L("headline", r(7, 30, 86, 30), "primary", { words: 10, lines: 3 }),
        L("subhead", r(7, 62, 70, 8), "primary", { words: 12, lines: 2 }),
        L("handle", r(7, 86, 60, 5), "primary", { words: 6, lines: 1 })
      ],
      do: ["hook_on_first_slide", "one_message"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "one-idea-per-slide",
      types: ["educate"],
      name: t("One idea per slide", "\u0647\u0631 \u0627\u0633\u0644\u0627\u06CC\u062F \u06CC\u06A9 \u0627\u06CC\u062F\u0647", "Her slaytta bir fikir"),
      use: t("The body of an explainer document.", "\u0628\u062F\u0646\u0647\u0654 \u0627\u0635\u0644\u06CC \u06CC\u06A9 \u0633\u0646\u062F \u0622\u0645\u0648\u0632\u0634\u06CC.", "A\xE7\u0131klay\u0131c\u0131 bir belgenin g\xF6vdesi."),
      variation: t("Light canvas, a slide number, headline, short body, a progress line.", "\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646\u060C \u0634\u0645\u0627\u0631\u0647\u0654 \u0627\u0633\u0644\u0627\u06CC\u062F\u060C \u062A\u06CC\u062A\u0631\u060C \u0645\u062A\u0646 \u06A9\u0648\u062A\u0627\u0647 \u0648 \u062E\u0637 \u067E\u06CC\u0634\u0631\u0641\u062A.", "A\xE7\u0131k zemin, slayt numaras\u0131, ba\u015Fl\u0131k, k\u0131sa metin, ilerleme \xE7izgisi."),
      layers: [
        L("background", "full", "canvas"),
        L("data", r(7, 6, 12, 5), "canvas", { color: P.muted, words: 1, lines: 1 }),
        L("headline", r(7, 16, 86, 22), "canvas", { words: 10, lines: 3 }),
        L("body", r(7, 42, 86, 36), "canvas", { words: 45, lines: 6 }),
        L("progress", r(7, 90, 86, 1), "canvas", { rules: ["progress_visible"] })
      ],
      do: ["consistent_slide_numbering", "one_message"],
      dont: ["no_dense_paragraphs"]
    },
    {
      slug: "chart-slide",
      types: ["proof", "educate"],
      name: t("Chart slide", "\u0627\u0633\u0644\u0627\u06CC\u062F \u0646\u0645\u0648\u062F\u0627\u0631", "Grafik slayt\u0131"),
      use: t("Approved data shown as a chart, with the source.", "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0647 \u0634\u06A9\u0644 \u0646\u0645\u0648\u062F\u0627\u0631\u060C \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0645\u0646\u0628\u0639.", "Kayna\u011F\u0131yla birlikte grafik olarak g\xF6sterilen onayl\u0131 veriler."),
      variation: t("A short title, a large chart area, a source line.", "\u062A\u06CC\u062A\u0631 \u06A9\u0648\u062A\u0627\u0647\u060C \u0641\u0636\u0627\u06CC \u0628\u0632\u0631\u06AF \u0646\u0645\u0648\u062F\u0627\u0631 \u0648 \u062E\u0637 \u0645\u0646\u0628\u0639.", "K\u0131sa ba\u015Fl\u0131k, geni\u015F grafik alan\u0131, kaynak sat\u0131r\u0131."),
      layers: [
        L("background", "full", "canvas"),
        L("headline", r(7, 6, 86, 12), "canvas", { words: 9, lines: 2 }),
        L("data", r(7, 22, 86, 52), "canvas", { color: P.primary, rules: ["approved_numbers_only"] }),
        L("body", r(7, 78, 86, 6), "canvas", { color: P.muted, words: 14, lines: 1, rules: ["cite_data_source"] }),
        L("brand_mark", r(80, 90, 13, 5), "canvas")
      ],
      do: ["approved_numbers_only", "cite_data_source"],
      dont: ["no_fake_ui"]
    },
    {
      slug: "summary-cta",
      types: ["educate", "promote"],
      name: t("Summary + CTA", "\u062C\u0645\u0639\u200C\u0628\u0646\u062F\u06CC \u0648 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645", "\xD6zet + CTA"),
      use: t("The last slide: key points and one next step.", "\u0627\u0633\u0644\u0627\u06CC\u062F \u0622\u062E\u0631: \u0646\u06A9\u062A\u0647\u200C\u0647\u0627\u06CC \u0627\u0635\u0644\u06CC \u0648 \u06CC\u06A9 \u0642\u062F\u0645 \u0628\u0639\u062F\u06CC.", "Son slayt: ana noktalar ve tek bir sonraki ad\u0131m."),
      variation: t("Secondary colour, a short checklist, one CTA, a name line.", "\u0631\u0646\u06AF \u062F\u0648\u0645 \u0628\u0631\u0646\u062F\u060C \u0686\u06A9\u200C\u0644\u06CC\u0633\u062A \u06A9\u0648\u062A\u0627\u0647\u060C \u06CC\u06A9 \u062F\u0639\u0648\u062A \u0628\u0647 \u0627\u0642\u062F\u0627\u0645 \u0648 \u062E\u0637 \u0646\u0627\u0645.", "\u0130kincil renk, k\u0131sa kontrol listesi, tek CTA, isim sat\u0131r\u0131."),
      layers: [
        L("background", "full", "secondary"),
        L("headline", r(7, 12, 86, 16), "secondary", { words: 8, lines: 2 }),
        L("body", r(7, 32, 86, 36), "secondary", { words: 35, lines: 5 }),
        L("cta", r(7, 74, 60, 8), "secondary", { words: 6, lines: 1, rules: ["one_cta"] }),
        L("handle", r(7, 88, 60, 5), "secondary", { words: 6, lines: 1 })
      ],
      do: ["cta_on_last_slide", "one_cta"],
      dont: ["no_dense_paragraphs"]
    }
  ]
};
function eligible(archetypes, mascot) {
  if (mascot) return [...archetypes];
  return archetypes.filter((archetype) => !archetype.layers.some((layer2) => layer2.role === "mascot" && !layer2.optional)).map((archetype) => ({
    ...archetype,
    layers: archetype.layers.filter((layer2) => layer2.role !== "mascot"),
    do: archetype.do.filter((rule) => rule !== "mascot_approved_pose_only"),
    dont: archetype.dont.filter((rule) => rule !== "mascot_approved_pose_only")
  }));
}
function starterFamily(personal = false) {
  return {
    type: { headline: DISPLAY, body: BODY, accent: null },
    palette: { ...STARTER_PALETTE },
    logo: { placement: "bottom_right", size_pct: 12, asset: "missing", rule_refs: ["brand.logo.clear_space", "brand.logo.min_size", "brand.logo.misuse"] },
    photo_direction: { fact_refs: ["brand.photo.direction", "brand.photo.lighting", "brand.photo.grade", ...personal ? ["personal.media.photo_guidelines"] : []] },
    corner_radius: "radius.lg",
    grid: { margin_pct: 6, columns: 6, gutter_pct: 2 }
  };
}
function starterStyle(surface, archetype) {
  const style = {
    id: `${surface}.${archetype.slug}`,
    surface,
    archetype: archetype.slug,
    name: { ...archetype.name },
    intent: { use_when: { ...archetype.use }, content_types: [...archetype.types], pillar: null },
    layers: archetype.layers.map((layer2) => structuredClone(layer2)),
    variation: { ...archetype.variation },
    do: [...archetype.do],
    dont: [...archetype.dont],
    reference_assets: "missing",
    status: "draft"
  };
  if (SURFACE_SPECS[surface].caption_style) {
    style.caption_style = { font: BODY, color: P.dark_text, background: P.dark_canvas, max_words_per_line: 5, position: "lower_third" };
  }
  return style;
}
function buildStarterKit(options) {
  const per = options.stylesPerSurface ?? DEFAULT_STYLES_PER_SURFACE;
  const surfaces = options.surfaces ?? SURFACES;
  return {
    schema_version: 1,
    kind: "social_style_kit",
    brand_slug: options.brandSlug,
    family: starterFamily(options.personal === true),
    styles: SURFACES.filter((surface) => surfaces.includes(surface)).flatMap((surface) => eligible(STARTER_ARCHETYPES[surface], options.mascot !== false).slice(0, per).map((archetype) => starterStyle(surface, archetype)))
  };
}

// packages/brand-core/src/social-kit/store.ts
var import_yaml = __toESM(require_dist(), 1);
import fs from "node:fs";
import path from "node:path";
var MAX_KIT_BYTES = 2 * 1024 * 1024;
function kitFile(root) {
  return path.join(root, ...SOCIAL_KIT_FILE.split("/"));
}
function approvalsFile(root) {
  return path.join(root, ...SOCIAL_APPROVALS_FILE.split("/"));
}
function assertOwnerProcess() {
  if (process.env[AGENT_TOKEN_ENV]) throw new SocialKitError("refused", `The social style kit is written and approved by the owner. Refusing while ${AGENT_TOKEN_ENV} is set. Nothing was changed.`);
}
function readText(file) {
  const raw = safeRead(file, MAX_KIT_BYTES);
  return raw ? raw.toString("utf8") : null;
}
function readKit(root, brandSlug) {
  let text2;
  try {
    text2 = readText(kitFile(root));
  } catch {
    return { state: "invalid", error: `${SOCIAL_KIT_FILE} is not a regular file (symlinks are not followed).` };
  }
  if (text2 === null) return { state: "missing" };
  let doc;
  try {
    doc = import_yaml.default.parse(text2);
  } catch (error) {
    return { state: "invalid", error: `${SOCIAL_KIT_FILE} is not valid YAML: ${error.message.split("\n")[0]}` };
  }
  try {
    return { state: "ok", kit: parseKit(doc, brandSlug) };
  } catch (error) {
    if (error instanceof SocialKitError) return { state: "invalid", error: `${SOCIAL_KIT_FILE} ${error.message}` };
    throw error;
  }
}
function kitSafetyProblems(kit) {
  const texts = [...kit.family.notes ?? []];
  for (const style of kit.styles) {
    texts.push(...Object.values(style.name), ...Object.values(style.intent.use_when), ...Object.values(style.variation), ...style.do, ...style.dont);
    for (const layer2 of style.layers) texts.push(...layer2.rules ?? []);
  }
  const problems = /* @__PURE__ */ new Set();
  for (const item of texts) for (const finding of safetyBlocksSharing(safetyReport(item))) problems.add(finding);
  return [...problems];
}
function readSecret(root) {
  const file = approvalSecretPath(root);
  try {
    if (!fs.lstatSync(file).isFile()) return null;
    return fs.readFileSync(file, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function readApprovals(root, brandSlug) {
  const empty = { schema_version: 1, kind: "social_style_approvals", brand_slug: brandSlug, approvals: {} };
  let text2;
  try {
    text2 = readText(approvalsFile(root));
  } catch {
    return empty;
  }
  if (text2 === null) return empty;
  try {
    const doc = JSON.parse(text2);
    if (doc?.kind !== "social_style_approvals" || doc.brand_slug !== brandSlug || typeof doc.approvals !== "object" || doc.approvals === null) return empty;
    return doc;
  } catch {
    return empty;
  }
}
function sealFor(secret, brandSlug, styleId, record) {
  return approvalSeal(secret, approvalEventDigest({ brand_slug: brandSlug, style_id: styleId, digest: record.digest, event_id: record.event_id, approved_at: record.approved_at }), SOCIAL_APPROVAL_DOMAIN);
}
function evaluateKit(root, kit) {
  const approvals = readApprovals(root, kit.brand_slug).approvals;
  const secret = readSecret(root);
  return kit.styles.map((style) => {
    const digest = styleDigest(kit.brand_slug, kit.family, style);
    if (style.status !== "approved") return { style, status: style.status, digest, invalid_reason: null };
    const approval = style.approval;
    if (!approval || approval.digest !== digest) return { style, status: "invalid_approval", digest, invalid_reason: "edited_after_approval" };
    const record = Object.prototype.hasOwnProperty.call(approvals, style.id) ? approvals[style.id] : void 0;
    if (!record || !secret) return { style, status: "invalid_approval", digest, invalid_reason: "no_seal" };
    const matches = record.digest === digest && record.event_id === approval.event_id && record.approved_at === approval.approved_at && record.seal === sealFor(secret, kit.brand_slug, style.id, record);
    return matches ? { style, status: "approved", digest, invalid_reason: null } : { style, status: "invalid_approval", digest, invalid_reason: "seal_mismatch" };
  });
}
function loadKitOrThrow(ws) {
  const read = readKit(ws.root, ws.brandSlug);
  if (read.state === "missing") throw new SocialKitError("not_found", `${SOCIAL_KIT_FILE} does not exist. Start one with npm run brand:social -- kit init.`);
  if (read.state === "invalid") throw new SocialKitError("invalid_kit", read.error);
  return read.kit;
}
var HEADER = [
  "# Social style kit (docs-internal/SOCIAL_STYLE_KIT.md). Design guidance, committed: never put a restricted value here.",
  "# Colours and fonts are design-token ids, zones are % of the canvas, layers are listed back to front.",
  "# Agents read only approved styles. Approve with npm run brand:social -- kit review / kit approve (owner proof).",
  "# Editing an approved style or the family makes the approval invalid until the owner approves again."
].join("\n");
function writeKitYaml(ws, text2) {
  writeVaultFile(ws, kitFile(ws.root), text2, false);
}
function initKit(ws, input) {
  assertOwnerProcess();
  const per = input.styles ?? 4;
  if (!Number.isInteger(per) || per < 1 || per > 4) throw new SocialKitError("invalid_input", "--styles is 1 to 4 (the engine has four starter archetypes per surface).");
  const surfaces = input.surfaces ?? SURFACES;
  return withLock(ws, "social-kit", () => {
    const starter = buildStarterKit({ brandSlug: ws.brandSlug, surfaces, stylesPerSurface: per, personal: input.personal, mascot: input.mascot });
    const existing = readKit(ws.root, ws.brandSlug);
    if (existing.state !== "missing" && !input.force) throw new SocialKitError("exists", `${SOCIAL_KIT_FILE} already exists. Nothing was changed. Use --force to replace draft styles; approved and rejected styles are always kept.`);
    if (existing.state === "invalid") throw new SocialKitError("invalid_kit", `${existing.error} Fix or remove the file first; --force never rewrites a kit it cannot read, so no approved style is lost.`);
    let kit = starter;
    const kept = [];
    let familyKept = false;
    if (existing.state === "ok") {
      const keep = existing.kit.styles.filter((style) => style.status !== "draft" || !surfaces.includes(style.surface));
      kept.push(...keep.map((style) => style.id));
      const keptIds = new Set(kept);
      familyKept = existing.kit.styles.some((style) => style.status === "approved");
      const fresh = starter.styles.filter((style) => !keptIds.has(style.id));
      const styles = SURFACES.flatMap((surface) => [...keep.filter((style) => style.surface === surface), ...fresh.filter((style) => style.surface === surface)].slice(0, MAX_STYLES_PER_SURFACE));
      kit = { ...starter, family: familyKept ? existing.kit.family : starter.family, styles };
    }
    writeKitYaml(ws, `${HEADER}
${import_yaml.default.stringify(kit, { lineWidth: 0 })}`);
    return { path: SOCIAL_KIT_FILE, written: kit.styles.filter((style) => !kept.includes(style.id)).map((style) => style.id), kept, family_kept: familyKept };
  });
}
function selectStates(states, target) {
  if (target.style_id && target.surface) throw new SocialKitError("invalid_input", "Give --style or --surface, not both.");
  if (target.style_id) {
    const found = states.filter((state) => state.style.id === target.style_id);
    if (found.length === 0) throw new SocialKitError("not_found", `No style ${target.style_id} in ${SOCIAL_KIT_FILE}.`);
    return found;
  }
  if (target.surface) {
    if (!SURFACES.includes(target.surface)) throw new SocialKitError("invalid_input", `--surface is one of ${SURFACES.join(", ")}.`);
    return states.filter((state) => state.style.surface === target.surface);
  }
  throw new SocialKitError("invalid_input", "Give --style <id> or --surface <surface>.");
}
var approvableStatus = (status) => status === "draft" || status === "invalid_approval";
function reviewOf(kit, states, target) {
  const selected = selectStates(states, target);
  const approvable = selected.filter((state) => approvableStatus(state.status));
  const expect = approvable.length === 0 ? null : target.style_id ? approvable[0].digest : batchDigest(approvable.map((state) => ({ id: state.style.id, digest: state.digest })));
  const flag = target.style_id ? `--style ${target.style_id}` : `--surface ${target.surface}`;
  return {
    target: { style_id: target.style_id ?? null, surface: target.surface ?? null },
    items: selected.map((state) => ({ style_id: state.style.id, surface: state.style.surface, status: state.status, digest: state.digest, invalid_reason: state.invalid_reason })),
    expect_sha: expect,
    approvable: approvable.map((state) => state.style.id),
    safety_problems: kitSafetyProblems(kit),
    approve_with: expect ? `npm run brand:social -- kit approve ${flag} --expect-sha ${expect}` : null
  };
}
function reviewKit(ws, target) {
  const kit = loadKitOrThrow(ws);
  return reviewOf(kit, evaluateKit(ws.root, kit), target);
}
function setStatuses(ws, updates) {
  const text2 = readText(kitFile(ws.root));
  if (text2 === null) throw new SocialKitError("not_found", `${SOCIAL_KIT_FILE} disappeared. Nothing was changed.`);
  const doc = (0, import_yaml.parseDocument)(text2);
  const styles = doc.get("styles");
  const items = styles?.items ?? [];
  items.forEach((node, index) => {
    const id = node.get("id");
    const update = typeof id === "string" ? updates.get(id) : void 0;
    if (!update) return;
    doc.setIn(["styles", index, "status"], update.status);
    if (update.approval) doc.setIn(["styles", index, "approval"], doc.createNode(update.approval));
    else if (doc.hasIn(["styles", index, "approval"])) doc.deleteIn(["styles", index, "approval"]);
  });
  writeKitYaml(ws, doc.toString({ lineWidth: 0 }));
}
function writeApprovals(ws, doc) {
  writeVaultFile(ws, approvalsFile(ws.root), `${JSON.stringify(doc, null, 2)}
`, true);
}
function approveKit(ws, input) {
  assertOwnerProcess();
  if (!input.expected_sha256 || !/^[0-9a-f]{64}$/.test(input.expected_sha256)) throw new SocialKitError("invalid_input", "--expect-sha is required: the digest kit review printed.");
  if (!approvalProofMatches(ws.root, input.proof)) throw new SocialKitError("proof", "Approval refused: missing or wrong owner approval proof. Nothing was changed.");
  const secret = readSecret(ws.root);
  if (!secret) throw new SocialKitError("proof", "The approval secret is unreadable. Nothing was changed.");
  return withLock(ws, "social-kit", () => {
    const kit = loadKitOrThrow(ws);
    const review = reviewOf(kit, evaluateKit(ws.root, kit), { style_id: input.style_id, surface: input.surface });
    if (review.safety_problems.length) throw new SocialKitError("unsafe", `The kit holds text that looks like ${review.safety_problems.join(", ")}. It is committed design guidance: remove it first. Nothing was approved.`);
    if (!review.expect_sha) throw new SocialKitError("refused", "Nothing to approve here: every selected style is already approved or rejected.");
    if (review.expect_sha !== input.expected_sha256) throw new SocialKitError("stale", `The selection now hashes to ${review.expect_sha}, not the ${input.expected_sha256} you reviewed. Review it again. Nothing was approved.`);
    const approvals = readApprovals(ws.root, ws.brandSlug);
    const now = ws.now().toISOString();
    const updates = /* @__PURE__ */ new Map();
    const approved = [];
    for (const item of review.items) {
      if (!review.approvable.includes(item.style_id)) continue;
      const event = { event_id: newApprovalEventId(), approved_at: now, digest: item.digest };
      approvals.approvals[item.style_id] = { ...event, seal: sealFor(secret, ws.brandSlug, item.style_id, event), actor: "owner" };
      updates.set(item.style_id, { status: "approved", approval: event });
      approved.push({ style_id: item.style_id, ...event });
    }
    writeApprovals(ws, approvals);
    setStatuses(ws, updates);
    return { approved, skipped: review.items.filter((item) => !review.approvable.includes(item.style_id)).map((item) => ({ style_id: item.style_id, status: item.status })) };
  });
}
function rejectKit(ws, input) {
  assertOwnerProcess();
  return withLock(ws, "social-kit", () => {
    const kit = loadKitOrThrow(ws);
    const selected = selectStates(evaluateKit(ws.root, kit), input).filter((state) => state.status !== "rejected");
    if (selected.length === 0) throw new SocialKitError("refused", "Nothing to reject here.");
    const approvals = readApprovals(ws.root, ws.brandSlug);
    let changed = false;
    for (const state of selected) {
      if (Object.prototype.hasOwnProperty.call(approvals.approvals, state.style.id)) {
        delete approvals.approvals[state.style.id];
        changed = true;
      }
    }
    if (changed) writeApprovals(ws, approvals);
    setStatuses(ws, new Map(selected.map((state) => [state.style.id, { status: "rejected", approval: null }])));
    return { rejected: selected.map((state) => state.style.id) };
  });
}

export {
  SOCIAL_KIT_SCHEMA,
  SOCIAL_KIT_TOOL,
  SOCIAL_KIT_FILE,
  SOCIAL_APPROVALS_FILE,
  SOCIAL_APPROVAL_DOMAIN,
  SOCIAL_KIT_VERSION,
  SOCIAL_LANGS,
  SURFACES,
  DEFAULT_STYLES_PER_SURFACE,
  MAX_STYLES_PER_SURFACE,
  SocialKitError,
  SURFACE_SPECS,
  LAYER_ROLES,
  TEXT_ROLES,
  NAMED_ZONES,
  CONTENT_TYPES,
  STYLE_STATUSES,
  RULE_CODES,
  STYLE_ID,
  ARCHETYPE_ID,
  ASSET_ID,
  TOKEN_REF,
  zoneRect,
  parseStyle,
  parseFamily,
  parseKit,
  styleContent,
  styleDigest,
  batchDigest,
  approvalEventDigest,
  localize,
  SEMANTIC_MAP_QUESTION,
  SEMANTIC_COLOR_SLOTS,
  SEMANTIC_SLOTS,
  BRAND_ROLE_PREFIX,
  brandRoleTokenId,
  semanticSlotOf,
  SEMANTIC_MAP_FORMAT,
  parseSemanticMap,
  suggestSemanticMap,
  semanticAnswerText,
  STARTER_PALETTE,
  STARTER_ARCHETYPES,
  starterFamily,
  starterStyle,
  buildStarterKit,
  kitFile,
  approvalsFile,
  assertOwnerProcess,
  readKit,
  kitSafetyProblems,
  readApprovals,
  sealFor,
  evaluateKit,
  initKit,
  reviewKit,
  approveKit,
  rejectKit
};
