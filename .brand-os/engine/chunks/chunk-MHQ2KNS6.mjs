import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);

// packages/brand-core/src/font-roles.ts
var FONT_ALIAS_ROLES = ["display", "body", "mono"];
var FONT_ROLE_SYNONYMS = {
  display: ["display", "heading", "headline", "title"],
  body: ["body", "text", "sans"],
  mono: ["mono", "code", "monospace"]
};
var FONT_FAMILY_PREFIX = "type.fontFamily.";
var LOCALE_SUFFIX = /^([A-Za-z][A-Za-z0-9]*?)[-_]([a-z]{2,3})$/;
function splitFontRole(role) {
  const match = LOCALE_SUFFIX.exec(role);
  if (match && match[1] && match[2]) return { base: match[1].toLowerCase(), locale: match[2] };
  return { base: role.toLowerCase(), locale: null };
}
function aliasOf(base) {
  for (const alias of FONT_ALIAS_ROLES) if (FONT_ROLE_SYNONYMS[alias].includes(base)) return alias;
  return null;
}
function primaryLocale(locale) {
  if (typeof locale !== "string" || !locale) return null;
  return locale.split(/[-_]/)[0].toLowerCase();
}
function fontAliasSources(roles, defaultLocale) {
  const lower = roles.map((role) => role.toLowerCase());
  const locale = primaryLocale(defaultLocale);
  const out = [];
  for (const alias of FONT_ALIAS_ROLES) {
    if (lower.includes(alias)) continue;
    const candidates = roles.map((role, index) => ({ role, index, ...splitFontRole(role) })).filter((item) => aliasOf(item.base) === alias);
    if (candidates.length === 0) continue;
    const rank = (base) => FONT_ROLE_SYNONYMS[alias].indexOf(base);
    const plain = candidates.filter((item) => item.locale === null).sort((a, b) => rank(a.base) - rank(b.base) || a.index - b.index)[0];
    if (plain) {
      out.push({ alias, role: plain.role, reason: "synonym" });
      continue;
    }
    const local = locale ? candidates.filter((item) => item.locale === locale).sort((a, b) => rank(a.base) - rank(b.base) || a.index - b.index)[0] : void 0;
    if (local) {
      out.push({ alias, role: local.role, reason: "default_locale" });
      continue;
    }
    out.push({ alias, role: candidates[0].role, reason: "first_listed" });
  }
  return out;
}
function localizedFontRef(ref, lang, exists) {
  const locale = primaryLocale(lang);
  if (!locale || !ref.startsWith(FONT_FAMILY_PREFIX)) return ref;
  const role = ref.slice(FONT_FAMILY_PREFIX.length);
  const { base, locale: own } = splitFontRole(role);
  if (own !== null) return ref;
  const alias = aliasOf(base);
  const bases = alias ? [base, ...FONT_ROLE_SYNONYMS[alias].filter((item) => item !== base)] : [base];
  for (const candidate of bases) {
    for (const sep of ["-", "_"]) {
      const id = `${FONT_FAMILY_PREFIX}${candidate}${sep}${locale}`;
      if (exists(id)) return id;
    }
  }
  return ref;
}

export {
  fontAliasSources,
  localizedFontRef
};
