import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import "./chunk-LPHAXDOY.mjs";
import "./chunk-3RZ74H24.mjs";
import "./chunk-F3UDVADT.mjs";
import "./chunk-4QCLP6RD.mjs";
import "./chunk-3UUYBU2Z.mjs";
import "./chunk-6K2U6D7O.mjs";
import "./chunk-Z4VEC43P.mjs";
import {
  CompetitiveError,
  CreativeError,
  asLang,
  buildCompetitiveMemo,
  loadProject,
  readProject,
  selectAdapter,
  sourceStatus
} from "./chunk-ZYAYDNGS.mjs";
import {
  ResearchError
} from "./chunk-5OMKZSIF.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-AQ6QTRSP.mjs";
import "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  KnowledgeError,
  canonicalJson,
  captureNote,
  dirUsable,
  findNote,
  knowledgeRef,
  openWorkspace,
  readFacts,
  readYaml,
  safeRead,
  sha256Hex,
  withLock,
  writeVaultFile
} from "./chunk-HOCT4QOE.mjs";
import "./chunk-QXBDJJNV.mjs";
import "./chunk-NUYFBVWM.mjs";
import "./chunk-QDMMEM6P.mjs";

// scripts/identity.ts
import { parseArgs } from "node:util";

// packages/brand-core/src/identity/model.ts
var UNKNOWN = "unknown";
var IDENTITY_PATHS = ["create", "retain", "evolve", "rebrand", "undecided"];
var EQUITY_COMPONENTS = ["name", "logo_symbol", "logo_wordmark", "colors", "typography", "mascot", "tone", "tagline", "imagery", "other"];
var EQUITY_CHOICES = ["preserve", "refine", "replace", "evaluate", "unknown"];
var EQUITY_EVIDENCE = ["measured_study", "owner_reported", "unknown"];
var CHANGE_PATHS = ["evolve", "rebrand", "undecided"];
var EXISTING_PATHS = ["retain", "evolve", "rebrand", "undecided"];
var ALL_PATHS = IDENTITY_PATHS;
var APPLICATIONS = ["app_icon", "favicon", "website_header", "social_avatar", "print", "packaging", "signage", "motion", "merchandise", "email"];
var DIAGNOSIS_QUESTIONS = [
  {
    id: "identity.path",
    stage: "path",
    prompt: {
      en: "What do you want to do with the brand identity: create a first one, keep the current one, evolve it, rebrand, or not decided yet?",
      fa: "\u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u062F \u0628\u0627 \u0647\u0648\u06CC\u062A \u0628\u0631\u0646\u062F \u0686\u0647 \u06A9\u0646\u06CC\u062F: \u0627\u0648\u0644\u06CC\u0646 \u0647\u0648\u06CC\u062A \u0631\u0627 \u0628\u0633\u0627\u0632\u06CC\u062F\u060C \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u0631\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u060C \u0622\u0646 \u0631\u0627 \u062A\u06A9\u0627\u0645\u0644 \u062F\u0647\u06CC\u062F\u060C \u0628\u0631\u0646\u062F \u0631\u0627 \u0627\u0632 \u0646\u0648 \u0628\u0633\u0627\u0632\u06CC\u062F\u060C \u06CC\u0627 \u0647\u0646\u0648\u0632 \u062A\u0635\u0645\u06CC\u0645 \u0646\u06AF\u0631\u0641\u062A\u0647\u200C\u0627\u06CC\u062F\u061F",
      tr: "Marka kimli\u011Fiyle ne yapmak istiyorsunuz: ilk kimli\u011Fi olu\u015Fturmak, mevcut olan\u0131 korumak, geli\u015Ftirmek, yeniden markala\u015Fmak m\u0131, yoksa hen\xFCz karar vermediniz mi?"
    },
    why_it_matters: "The wizard hint is only a starting point. The brief follows the path you confirm here.",
    choices: IDENTITY_PATHS,
    multi: false,
    applies_to: ALL_PATHS,
    priority: 0
  },
  {
    id: "identity.change.reasons",
    stage: "diagnosis",
    prompt: {
      en: "Why is a change being considered? Choose all that apply: new market, repositioning, the identity is not working, merger, readability, legal issue, looks outdated, personal dissatisfaction, other.",
      fa: "\u0686\u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u0637\u0631\u062D \u0634\u062F\u0647 \u0627\u0633\u062A\u061F \u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u062F\u0631\u0633\u062A \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F: \u0628\u0627\u0632\u0627\u0631 \u062C\u062F\u06CC\u062F\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u062F\u0648\u0628\u0627\u0631\u0647\u060C \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u06A9\u0627\u0631 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u062F\u063A\u0627\u0645\u060C \u062E\u0648\u0627\u0646\u0627\u06CC\u06CC\u060C \u0645\u0633\u0626\u0644\u0647\u0654 \u062D\u0642\u0648\u0642\u06CC\u060C \u0642\u062F\u06CC\u0645\u06CC \u0628\u0647 \u0646\u0638\u0631 \u0645\u06CC\u200C\u0631\u0633\u062F\u060C \u0646\u0627\u0631\u0636\u0627\u06CC\u062A\u06CC \u0634\u062E\u0635\u06CC\u060C \u062F\u06CC\u06AF\u0631.",
      tr: "De\u011Fi\u015Fiklik neden d\xFC\u015F\xFCn\xFCl\xFCyor? Uyanlar\u0131n hepsini se\xE7in: yeni pazar, yeniden konumland\u0131rma, kimlik i\u015Fe yaram\u0131yor, birle\u015Fme, okunabilirlik, hukuki sorun, eski g\xF6r\xFCn\xFCyor, ki\u015Fisel memnuniyetsizlik, di\u011Fer."
    },
    why_it_matters: "The reason decides how much has to change. A readability problem rarely needs a new name.",
    choices: ["new_market", "repositioning", "identity_not_working", "merger", "readability", "legal_issue", "outdated", "personal_dissatisfaction", "other"],
    multi: true,
    applies_to: CHANGE_PATHS,
    priority: 10
  },
  {
    id: "identity.change.observed",
    stage: "diagnosis",
    prompt: {
      en: "Is the problem something you have observed (complaints, confusion, unreadable at small sizes), a personal preference, or both?",
      fa: "\u0622\u06CC\u0627 \u0645\u0634\u06A9\u0644 \u0686\u06CC\u0632\u06CC \u0627\u0633\u062A \u06A9\u0647 \u062F\u06CC\u062F\u0647\u200C\u0627\u06CC\u062F (\u0634\u06A9\u0627\u06CC\u062A\u060C \u0633\u0631\u062F\u0631\u06AF\u0645\u06CC\u060C \u0646\u0627\u062E\u0648\u0627\u0646\u0627 \u062F\u0631 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u06A9\u0648\u0686\u06A9)\u060C \u06CC\u06A9 \u0633\u0644\u06CC\u0642\u0647\u0654 \u0634\u062E\u0635\u06CC\u060C \u06CC\u0627 \u0647\u0631 \u062F\u0648\u061F",
      tr: "Sorun g\xF6zlemledi\u011Finiz bir \u015Fey mi (\u015Fik\xE2yet, kar\u0131\u015F\u0131kl\u0131k, k\xFC\xE7\xFCk boyutta okunmama), ki\u015Fisel bir tercih mi, yoksa ikisi birden mi?"
    },
    why_it_matters: "An observed failure can justify change; a preference alone often points to better usage rules instead.",
    choices: ["observed_problem", "personal_preference", "both"],
    multi: false,
    applies_to: CHANGE_PATHS,
    priority: 20
  },
  {
    id: "identity.success",
    stage: "diagnosis",
    prompt: {
      en: "What would success look like? Choose all that apply: recognizable at small sizes, consistent across channels, fits the new positioning, easier to produce, works in every script we use, customer feedback improves, the owner is satisfied.",
      fa: "\u0645\u0648\u0641\u0642\u06CC\u062A \u0686\u0647 \u0634\u06A9\u0644\u06CC \u062F\u0627\u0631\u062F\u061F \u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u062F\u0631\u0633\u062A \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F: \u062F\u0631 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u06A9\u0648\u0686\u06A9 \u0642\u0627\u0628\u0644 \u062A\u0634\u062E\u06CC\u0635\u060C \u06CC\u06A9\u062F\u0633\u062A \u062F\u0631 \u0647\u0645\u0647\u0654 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u060C \u0633\u0627\u0632\u06AF\u0627\u0631 \u0628\u0627 \u062C\u0627\u06CC\u06AF\u0627\u0647 \u062C\u062F\u06CC\u062F\u060C \u062A\u0648\u0644\u06CC\u062F \u0622\u0633\u0627\u0646\u200C\u062A\u0631\u060C \u06A9\u0627\u0631\u06A9\u0631\u062F \u062F\u0631 \u0647\u0645\u0647\u0654 \u062E\u0637\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u0645\u060C \u0628\u0647\u062A\u0631\u0634\u062F\u0646 \u0628\u0627\u0632\u062E\u0648\u0631\u062F \u0645\u0634\u062A\u0631\u06CC\u060C \u0631\u0636\u0627\u06CC\u062A \u0645\u0627\u0644\u06A9.",
      tr: "Ba\u015Far\u0131 neye benzerdi? Uyanlar\u0131n hepsini se\xE7in: k\xFC\xE7\xFCk boyutta tan\u0131n\u0131r, t\xFCm kanallarda tutarl\u0131, yeni konumland\u0131rmaya uygun, \xFCretimi daha kolay, kulland\u0131\u011F\u0131m\u0131z t\xFCm yaz\u0131 sistemlerinde \xE7al\u0131\u015F\u0131r, m\xFC\u015Fteri geri bildirimi iyile\u015Fir, sahibi memnun."
    },
    why_it_matters: "Success signals become the evaluation rubric. None of them is measured by this brief.",
    choices: ["small_size_recognition", "channel_consistency", "fits_positioning", "easier_production", "all_scripts", "customer_feedback", "owner_satisfaction"],
    multi: true,
    applies_to: ALL_PATHS,
    priority: 30
  },
  {
    id: "identity.must_not_change",
    stage: "diagnosis",
    prompt: {
      en: "What must not change? Choose all that apply (name, symbol, wordmark, colors, typography, mascot, tone, tagline, imagery), or none.",
      fa: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0646\u0628\u0627\u06CC\u062F \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0646\u062F\u061F \u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u062F\u0631\u0633\u062A \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F (\u0646\u0627\u0645\u060C \u0646\u0645\u0627\u062F\u060C \u0646\u0648\u0634\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648\u060C \u0631\u0646\u06AF\u200C\u0647\u0627\u060C \u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC\u060C \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631\u060C \u0644\u062D\u0646\u060C \u0634\u0639\u0627\u0631\u060C \u062A\u0635\u0648\u06CC\u0631\u0633\u0627\u0632\u06CC) \u06CC\u0627 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645.",
      tr: "Ne de\u011Fi\u015Fmemeli? Uyanlar\u0131n hepsini se\xE7in (ad, sembol, yaz\u0131 logosu, renkler, tipografi, maskot, ton, slogan, g\xF6rsel dil) ya da hi\xE7biri."
    },
    why_it_matters: "These become preserve rows in the equity matrix and red lines for every route.",
    choices: ["name", "logo_symbol", "logo_wordmark", "colors", "typography", "mascot", "tone", "tagline", "imagery", "none"],
    multi: true,
    applies_to: EXISTING_PATHS,
    priority: 40
  },
  {
    id: "identity.recognition",
    stage: "diagnosis",
    prompt: {
      en: "Do you have a recognition study or survey of the current identity, or is recognition your own impression?",
      fa: "\u0622\u06CC\u0627 \u0645\u0637\u0627\u0644\u0639\u0647 \u06CC\u0627 \u0646\u0638\u0631\u0633\u0646\u062C\u06CC\u200C\u0627\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u062F\u0627\u0631\u06CC\u062F\u060C \u06CC\u0627 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0628\u0631\u062F\u0627\u0634\u062A \u062E\u0648\u062F \u0634\u0645\u0627\u0633\u062A\u061F",
      tr: "Mevcut kimli\u011Fin tan\u0131n\u0131rl\u0131\u011F\u0131na dair bir \xE7al\u0131\u015Fma veya anketiniz var m\u0131, yoksa tan\u0131n\u0131rl\u0131k sizin kendi izleniminiz mi?"
    },
    why_it_matters: "Without a study, recognition stays owner-reported. No recognition figure is ever invented.",
    choices: ["measured_study", "owner_impression", "none"],
    multi: false,
    applies_to: EXISTING_PATHS,
    priority: 50
  },
  {
    id: "identity.applications",
    stage: "rollout",
    prompt: {
      en: "Where will the logo actually be used? Choose all that apply: app icon, favicon, website header, social avatar, print, packaging, signage, motion, merchandise, email.",
      fa: "\u0644\u0648\u06AF\u0648 \u0648\u0627\u0642\u0639\u0627\u064B \u06A9\u062C\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u061F \u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u062F\u0631\u0633\u062A \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F: \u0622\u06CC\u06A9\u0648\u0646 \u0627\u067E\u060C \u0641\u0627\u0648\u0622\u06CC\u06A9\u0648\u0646\u060C \u0633\u0631\u0628\u0631\u06AF \u0648\u0628\u200C\u0633\u0627\u06CC\u062A\u060C \u062A\u0635\u0648\u06CC\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC\u060C \u0686\u0627\u067E\u060C \u0628\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u060C \u062A\u0627\u0628\u0644\u0648\u060C \u0645\u0648\u0634\u0646\u060C \u06A9\u0627\u0644\u0627\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u06CC\u060C \u0627\u06CC\u0645\u06CC\u0644.",
      tr: "Logo ger\xE7ekte nerede kullan\u0131lacak? Uyanlar\u0131n hepsini se\xE7in: uygulama simgesi, favicon, web sitesi ba\u015Fl\u0131\u011F\u0131, sosyal medya profil g\xF6rseli, bask\u0131, ambalaj, tabela, hareketli g\xF6rsel, promosyon \xFCr\xFCn\xFC, e-posta."
    },
    why_it_matters: "Only real uses get application checks. An app-first brand needs a square icon long before signage.",
    choices: APPLICATIONS,
    multi: true,
    applies_to: ALL_PATHS,
    priority: 60
  },
  {
    id: "identity.scripts",
    stage: "rollout",
    prompt: {
      en: "Which writing systems must the wordmark or name work in? Latin, Persian/Arabic, other.",
      fa: "\u0646\u0648\u0634\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648 \u06CC\u0627 \u0646\u0627\u0645 \u0628\u0627\u06CC\u062F \u062F\u0631 \u06A9\u062F\u0627\u0645 \u062E\u0637\u200C\u0647\u0627 \u06A9\u0627\u0631 \u06A9\u0646\u062F\u061F \u0644\u0627\u062A\u06CC\u0646\u060C \u0641\u0627\u0631\u0633\u06CC/\u0639\u0631\u0628\u06CC\u060C \u062F\u06CC\u06AF\u0631.",
      tr: "Yaz\u0131 logosu veya ad hangi yaz\u0131 sistemlerinde \xE7al\u0131\u015Fmal\u0131? Latin, Fars\xE7a/Arap\xE7a, di\u011Fer."
    },
    why_it_matters: "A right-to-left script changes wordmark, lockup and spacing decisions from the start.",
    choices: ["latin", "perso_arabic", "other"],
    multi: true,
    applies_to: ALL_PATHS,
    priority: 70
  },
  {
    id: "identity.rollout.constraints",
    stage: "rollout",
    prompt: {
      en: "What would make a change hard to roll out? Choose all that apply: printed stock, app store listing, signage, packaging, partner materials, none.",
      fa: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0627\u062C\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0631\u0627 \u0633\u062E\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F \u0647\u0645\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u062F\u0631\u0633\u062A \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F: \u0645\u0648\u062C\u0648\u062F\u06CC \u0686\u0627\u067E\u06CC\u060C \u0635\u0641\u062D\u0647\u0654 \u0627\u067E \u062F\u0631 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u060C \u062A\u0627\u0628\u0644\u0648\u060C \u0628\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u060C \u0645\u0648\u0627\u062F \u0647\u0645\u06A9\u0627\u0631\u0627\u0646\u060C \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645.",
      tr: "Bir de\u011Fi\u015Fikli\u011Fi uygulamay\u0131 ne zorla\u015Ft\u0131r\u0131r? Uyanlar\u0131n hepsini se\xE7in: bas\u0131l\u0131 stok, uygulama ma\u011Fazas\u0131 sayfas\u0131, tabela, ambalaj, i\u015F orta\u011F\u0131 materyalleri, hi\xE7biri."
    },
    why_it_matters: "Migration cost and risk belong in the route trade-offs, not in a surprise after approval.",
    choices: ["printed_stock", "app_store_listing", "signage", "packaging", "partner_materials", "none"],
    multi: true,
    applies_to: EXISTING_PATHS,
    priority: 80
  }
];
var IdentityError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "IdentityError";
  }
  code;
};
function questionById(id) {
  return DIAGNOSIS_QUESTIONS.find((q) => q.id === id);
}
function oneOf(value, allowed, field) {
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw new IdentityError("invalid_input", `${field} must be one of ${allowed.join(", ")}.`);
}
function validateAnswer(id, value) {
  const question = questionById(id);
  if (!question) throw new IdentityError("not_found", `No identity question ${String(id).slice(0, 80)}.`);
  if (value === UNKNOWN || Array.isArray(value) && value.length === 1 && value[0] === UNKNOWN) return UNKNOWN;
  if (question.multi) {
    const items = (Array.isArray(value) ? value : String(value ?? "").split(",")).map((item) => String(item).trim()).filter(Boolean);
    if (!items.length) throw new IdentityError("invalid_input", `${id} needs at least one choice: ${[...question.choices, UNKNOWN].join(", ")}.`);
    for (const item of items) if (!question.choices.includes(item)) throw new IdentityError("invalid_input", `${id}: "${item.slice(0, 40)}" is not one of ${[...question.choices, UNKNOWN].join(", ")}.`);
    const unique = [...new Set(items)];
    if (unique.includes("none") && unique.length > 1) throw new IdentityError("invalid_input", `${id}: "none" cannot be combined with other choices.`);
    return unique;
  }
  if (typeof value !== "string" || !question.choices.includes(value)) throw new IdentityError("invalid_input", `${id} must be one of ${[...question.choices, UNKNOWN].join(", ")}.`);
  return value;
}
function single(value) {
  return Array.isArray(value) ? value[0] : value;
}
function list(value) {
  if (value === void 0 || value === UNKNOWN) return [];
  return (Array.isArray(value) ? value : [value]).filter((item) => item !== UNKNOWN && item !== "none");
}
function diagnosisState(answers) {
  const raw = single(answers["identity.path"]);
  const path3 = raw && raw !== UNKNOWN ? raw : null;
  const answered = [];
  const unknown = [];
  const pending = [];
  const skipped = [];
  for (const q of [...DIAGNOSIS_QUESTIONS].sort((a, b) => a.priority - b.priority)) {
    if (q.id !== "identity.path" && !path3) {
      skipped.push({ id: q.id, reason: "Waiting for identity.path." });
      continue;
    }
    if (path3 && !q.applies_to.includes(path3)) {
      skipped.push({ id: q.id, reason: `Not asked for the ${path3} path.` });
      continue;
    }
    const value = answers[q.id];
    if (value === void 0) pending.push(q);
    else if (value === UNKNOWN) unknown.push(q.id);
    else answered.push(q.id);
  }
  const first = pending[0];
  return {
    path: path3,
    next: first ? { id: first.id, stage: first.stage, prompt: first.prompt, why_asked: first.why_it_matters, choices: first.choices, multi: first.multi } : null,
    answered,
    unknown,
    pending: pending.map((q) => q.id),
    skipped,
    complete: pending.length === 0 && path3 !== null
  };
}

// packages/brand-core/src/identity/store.ts
import path from "node:path";
var IDENTITY_DIR = "brand/.private/identity";
var AUDIT_FILE = `${IDENTITY_DIR}/audit.json`;
function assertOwnerProcess() {
  if (process.env[AGENT_TOKEN_ENV]) throw new IdentityError("refused", `The identity audit and logo brief are the owner's local drafts. Refusing while ${AGENT_TOKEN_ENV} is set.`);
}
function file(ws) {
  return path.join(ws.root, ...AUDIT_FILE.split("/"));
}
function empty(ws) {
  return { schema_version: 1, kind: "identity_audit", brand_slug: ws.brandSlug, answers: {}, equity: {}, creative_project_id: null, reviews: [], updated_at: ws.now().toISOString() };
}
function readAudit(ws) {
  assertOwnerProcess();
  const target = file(ws);
  if (!dirUsable(ws, path.dirname(target))) return empty(ws);
  let raw;
  try {
    raw = safeRead(target, 1024 * 1024);
  } catch (error) {
    if (error instanceof KnowledgeError) throw new IdentityError("refused", error.message);
    throw error;
  }
  if (!raw) return empty(ws);
  let doc;
  try {
    doc = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new IdentityError("invalid_record", "audit.json is not valid JSON.");
  }
  if (doc?.kind !== "identity_audit" || doc.schema_version !== 1 || typeof doc.answers !== "object" || typeof doc.equity !== "object") throw new IdentityError("invalid_record", "audit.json is not an identity audit record.");
  if (doc.brand_slug !== ws.brandSlug) throw new IdentityError("wrong_brand", "audit.json belongs to another brand. It is not read.");
  return { ...doc, creative_project_id: doc.creative_project_id ?? null, reviews: Array.isArray(doc.reviews) ? doc.reviews : [] };
}
function answersOf(record) {
  const out = {};
  for (const [id, entry] of Object.entries(record.answers)) {
    try {
      out[id] = validateAnswer(id, entry.value);
    } catch {
    }
  }
  return out;
}
function write(ws, record) {
  record.updated_at = ws.now().toISOString();
  writeVaultFile(ws, file(ws), `${JSON.stringify(record, null, 2)}
`, true);
}
function ownerWords(ws, words, title, ref2, language) {
  if (words === void 0 || !words.trim()) return null;
  try {
    const captured = captureNote(ws, { title, body: words, kind: "meeting", language: language ?? null, tags: ["identity-audit"], source: { kind: "owner_note", ref: ref2 } });
    return { id: captured.id, revision: captured.revision };
  } catch (error) {
    if (error instanceof KnowledgeError) throw new IdentityError(error.code === "refused" ? "refused" : "invalid_input", error.message);
    throw error;
  }
}
function recordAnswer(ws, input) {
  assertOwnerProcess();
  const value = validateAnswer(input.question_id, input.value);
  const note = ownerWords(ws, input.words, `Identity audit: ${input.question_id}`, `identity-audit:${input.question_id}`, input.language);
  return withLock(ws, "identity-audit", () => {
    const record = readAudit(ws);
    const previous = record.answers[input.question_id];
    const entry = {
      value,
      note,
      answered_at: ws.now().toISOString(),
      history: previous ? [...previous.history, { value: previous.value, note: previous.note, answered_at: previous.answered_at }].slice(-20) : []
    };
    record.answers[input.question_id] = entry;
    write(ws, record);
    return { entry, changed_from: previous ? previous.value : null };
  });
}
function setEquity(ws, input) {
  assertOwnerProcess();
  const component = oneOf(input.component, EQUITY_COMPONENTS, "Component");
  const choice = oneOf(input.choice, EQUITY_CHOICES, "Choice");
  const evidence = oneOf(input.evidence ?? "unknown", EQUITY_EVIDENCE, "Evidence");
  let study = null;
  if (input.study_note) {
    try {
      const loaded = findNote(ws, input.study_note.replace(/^knowledge:/, "").split("@")[0]);
      if (loaded.note.meta.status === "archived") throw new IdentityError("refused", `Note ${loaded.id} is archived. Cite a current study.`);
      study = { id: loaded.id, revision: loaded.revision };
    } catch (error) {
      if (error instanceof KnowledgeError) throw new IdentityError("not_found", error.message);
      throw error;
    }
  }
  if (evidence === "measured_study" && !study) throw new IdentityError("refused", "measured_study needs --study-note <kn_\u2026>: the study or its summary in the Knowledge Inbox. Otherwise use owner_reported.");
  if (evidence !== "measured_study" && study) throw new IdentityError("invalid_input", "A study note is only cited with --evidence measured_study.");
  const note = ownerWords(ws, input.words, `Identity audit: ${component}`, `identity-audit:equity/${component}`, input.language);
  return withLock(ws, "identity-audit", () => {
    const record = readAudit(ws);
    const previous = record.equity[component];
    const entry = {
      choice,
      evidence,
      note,
      study,
      recorded_at: ws.now().toISOString(),
      history: previous ? [...previous.history, { choice: previous.choice, evidence: previous.evidence, note: previous.note, study: previous.study, recorded_at: previous.recorded_at }].slice(-20) : []
    };
    record.equity[component] = entry;
    write(ws, record);
    return entry;
  });
}
function linkCreativeProject(ws, projectId) {
  assertOwnerProcess();
  let surface;
  try {
    surface = readProject(ws, projectId).surface;
  } catch (error) {
    if (error instanceof CreativeError) throw new IdentityError(error.code === "not_found" ? "not_found" : "invalid_input", error.message);
    throw error;
  }
  if (surface !== "logo") throw new IdentityError("invalid_input", `Project ${projectId} uses the ${surface} surface. Create logo concept rounds with brand:creative project --surface logo.`);
  return withLock(ws, "identity-audit", () => {
    const record = readAudit(ws);
    record.creative_project_id = projectId;
    write(ws, record);
    return record;
  });
}
function markReviewed(ws, input) {
  assertOwnerProcess();
  if (!/^[0-9a-f]{64}$/.test(input.brief_digest) || !/^[0-9a-f]{64}$/.test(input.sources_digest)) throw new IdentityError("invalid_input", "Digests are sha256 hex.");
  return withLock(ws, "identity-audit", () => {
    const record = readAudit(ws);
    const mark = { reviewed_at: ws.now().toISOString(), brief_digest: input.brief_digest, sources_digest: input.sources_digest };
    record.reviews = [...record.reviews, mark].slice(-50);
    write(ws, record);
    return mark;
  });
}

// packages/brand-core/src/identity/i18n.ts
var IDENTITY_LANGS = ["en", "fa", "tr"];
function fillText(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
var COMPONENT_LABELS = {
  name: { en: "name", fa: "\u0646\u0627\u0645", tr: "ad" },
  logo_symbol: { en: "logo symbol", fa: "\u0646\u0645\u0627\u062F \u0644\u0648\u06AF\u0648", tr: "logo sembol\xFC" },
  logo_wordmark: { en: "wordmark", fa: "\u0646\u0648\u0634\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648", tr: "yaz\u0131 logosu" },
  colors: { en: "colors", fa: "\u0631\u0646\u06AF\u200C\u0647\u0627", tr: "renkler" },
  typography: { en: "typography", fa: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC", tr: "tipografi" },
  mascot: { en: "mascot", fa: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631", tr: "maskot" },
  tone: { en: "tone", fa: "\u0644\u062D\u0646", tr: "ton" },
  tagline: { en: "tagline", fa: "\u0634\u0639\u0627\u0631", tr: "slogan" },
  imagery: { en: "imagery", fa: "\u062A\u0635\u0648\u06CC\u0631\u0633\u0627\u0632\u06CC", tr: "g\xF6rsel dil" },
  other: { en: "other", fa: "\u062F\u06CC\u06AF\u0631", tr: "di\u011Fer" }
};
var CONCLUSIONS = {
  create_first_identity: {
    en: "There is no current logo to preserve: this brief prepares a first identity. No master exists yet and none is implied.",
    fa: "\u0644\u0648\u06AF\u0648\u06CC \u0641\u0639\u0644\u06CC\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u062D\u0641\u0638 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F: \u0627\u06CC\u0646 \u0628\u0631\u06CC\u0641 \u0628\u0631\u0627\u06CC \u0633\u0627\u062E\u062A\u0646 \u0627\u0648\u0644\u06CC\u0646 \u0647\u0648\u06CC\u062A \u0627\u0633\u062A. \u0647\u0646\u0648\u0632 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC\u200C\u0627\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F \u0648 \u0686\u06CC\u0632\u06CC \u0641\u0631\u0636 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Korunacak mevcut bir logo yok: bu brief ilk kimli\u011Fi haz\u0131rlar. Hen\xFCz ana dosya yok ve varm\u0131\u015F gibi davran\u0131lmaz."
  },
  retain_improve_usage: {
    en: "Keeping the current identity and improving its usage rules is a valid conclusion here: nothing in the audit justifies a costly change.",
    fa: "\u0646\u06AF\u0647\u200C\u062F\u0627\u0634\u062A\u0646 \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u0648 \u0628\u0647\u062A\u0631\u06A9\u0631\u062F\u0646 \u0642\u0648\u0627\u0639\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0622\u0646 \u062F\u0631 \u0627\u06CC\u0646\u062C\u0627 \u0646\u062A\u06CC\u062C\u0647\u200C\u0627\u06CC \u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A: \u0686\u06CC\u0632\u06CC \u062F\u0631 \u0627\u06CC\u0646 \u0628\u0631\u0631\u0633\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u067E\u0631\u0647\u0632\u06CC\u0646\u0647 \u0631\u0627 \u062A\u0648\u062C\u06CC\u0647 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "Mevcut kimli\u011Fi koruyup kullan\u0131m kurallar\u0131n\u0131 iyile\u015Ftirmek burada ge\xE7erli bir sonu\xE7tur: denetimde maliyetli bir de\u011Fi\u015Fikli\u011Fi hakl\u0131 k\u0131lan bir \u015Fey yok."
  },
  change_requested: {
    en: "The owner marked elements for change. The routes below compare how much to change; the current identity stays canonical until a new one is approved.",
    fa: "\u0645\u0627\u0644\u06A9 \u0628\u062E\u0634\u200C\u0647\u0627\u06CC\u06CC \u0631\u0627 \u0628\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0639\u0644\u0627\u0645\u062A \u0632\u062F\u0647 \u0627\u0633\u062A. \u0645\u0633\u06CC\u0631\u0647\u0627\u06CC \u0632\u06CC\u0631 \u0645\u06CC\u0632\u0627\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u0631\u0627 \u0645\u0642\u0627\u06CC\u0633\u0647 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061B \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u062A\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0647\u0648\u06CC\u062A \u062C\u062F\u06CC\u062F \u0645\u0639\u062A\u0628\u0631 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
    tr: "Sahip baz\u0131 \xF6\u011Feleri de\u011Fi\u015Fiklik i\xE7in i\u015Faretledi. A\u015Fa\u011F\u0131daki yollar ne kadar de\u011Fi\u015Fece\u011Fini kar\u015F\u0131la\u015Ft\u0131r\u0131r; yenisi onaylanana kadar mevcut kimlik ge\xE7erli kal\u0131r."
  },
  owner_decision_required: {
    en: "The identity path is not decided. Confirm it first (brand:identity answer --question identity.path); the routes below are for comparison only.",
    fa: "\u0645\u0633\u06CC\u0631 \u0647\u0648\u06CC\u062A \u0647\u0646\u0648\u0632 \u0631\u0648\u0634\u0646 \u0646\u06CC\u0633\u062A. \u0627\u0628\u062A\u062F\u0627 \u0622\u0646 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F (brand:identity answer --question identity.path)\u061B \u0645\u0633\u06CC\u0631\u0647\u0627\u06CC \u0632\u06CC\u0631 \u0641\u0642\u0637 \u0628\u0631\u0627\u06CC \u0645\u0642\u0627\u06CC\u0633\u0647\u200C\u0627\u0646\u062F.",
    tr: "Kimlik yolu belirlenmedi. \xD6nce onu onaylay\u0131n (brand:identity answer --question identity.path); a\u015Fa\u011F\u0131daki yollar yaln\u0131zca kar\u015F\u0131la\u015Ft\u0131rma i\xE7indir."
  }
};
var PATH_SOURCE = {
  owner_confirmed: { en: "confirmed by the owner in the identity audit", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062A\u0648\u0633\u0637 \u0645\u0627\u0644\u06A9 \u062F\u0631 \u0628\u0631\u0631\u0633\u06CC \u0647\u0648\u06CC\u062A", tr: "sahip taraf\u0131ndan kimlik denetiminde onayland\u0131" },
  intake_hint_unconfirmed: { en: "from the onboarding hint, not yet confirmed", fa: "\u0627\u0632 \u0627\u0634\u0627\u0631\u0647\u0654 \u0648\u0631\u0648\u062F \u0627\u0648\u0644\u06CC\u0647\u060C \u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647", tr: "ilk kurulum ipucundan, hen\xFCz onaylanmad\u0131" },
  none: { en: "not recorded", fa: "\u062B\u0628\u062A \u0646\u0634\u062F\u0647", tr: "kaydedilmedi" }
};
var ROUTES = {
  wordmark_led: {
    title: { en: "Wordmark-led identity", fa: "\u0647\u0648\u06CC\u062A \u0645\u0628\u062A\u0646\u06CC \u0628\u0631 \u0646\u0648\u0634\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648", tr: "Yaz\u0131 logosu odakl\u0131 kimlik" },
    why: { en: "Builds recognition of the name itself; works well when the name is short and must be remembered.", fa: "\u062E\u0648\u062F \u0646\u0627\u0645 \u0631\u0627 \u0628\u0647 \u062E\u0627\u0637\u0631 \u0633\u067E\u0631\u062F\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0648\u0642\u062A\u06CC \u0646\u0627\u0645 \u06A9\u0648\u062A\u0627\u0647 \u0627\u0633\u062A \u0648 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0630\u0647\u0646 \u0628\u0645\u0627\u0646\u062F \u062E\u0648\u0628 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Ad\u0131n kendisini tan\u0131t\u0131r; ad k\u0131sa ve ak\u0131lda kalmas\u0131 gerekti\u011Finde iyi \xE7al\u0131\u015F\u0131r." },
    why_not: { en: "Weak at icon sizes (app icon, favicon, avatar) unless a reduced mark is added; hard when the name must work in several scripts.", fa: "\u062F\u0631 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u0622\u06CC\u06A9\u0648\u0646 (\u0622\u06CC\u06A9\u0648\u0646 \u0627\u067E\u060C \u0641\u0627\u0648\u0622\u06CC\u06A9\u0648\u0646\u060C \u0622\u0648\u0627\u062A\u0627\u0631) \u0636\u0639\u06CC\u0641 \u0627\u0633\u062A \u0645\u06AF\u0631 \u0646\u0634\u0627\u0646\u0647\u0654 \u06A9\u0648\u0686\u06A9\u200C\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0636\u0627\u0641\u0647 \u0634\u0648\u062F\u061B \u0648\u0642\u062A\u06CC \u0646\u0627\u0645 \u0628\u0627\u06CC\u062F \u062F\u0631 \u0686\u0646\u062F \u062E\u0637 \u06A9\u0627\u0631 \u06A9\u0646\u062F \u062F\u0634\u0648\u0627\u0631 \u0627\u0633\u062A.", tr: "K\xFC\xE7\xFClt\xFClm\xFC\u015F bir i\u015Faret eklenmedik\xE7e simge boyutlar\u0131nda (uygulama simgesi, favicon, avatar) zay\u0131ft\u0131r; ad birka\xE7 yaz\u0131 sisteminde \xE7al\u0131\u015Fmal\u0131ysa zordur." }
  },
  symbol_and_wordmark: {
    title: { en: "Symbol plus wordmark", fa: "\u0646\u0645\u0627\u062F \u0628\u0647\u200C\u0647\u0645\u0631\u0627\u0647 \u0646\u0648\u0634\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648", tr: "Sembol art\u0131 yaz\u0131 logosu" },
    why: { en: "A symbol carries small sizes and the wordmark carries the name; the most flexible system across uses.", fa: "\u0646\u0645\u0627\u062F \u062F\u0631 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u0647\u0627\u06CC \u06A9\u0648\u0686\u06A9 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0646\u0648\u0634\u062A\u0627\u0631\u060C \u0646\u0627\u0645 \u0631\u0627 \u0645\u0646\u062A\u0642\u0644 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0627\u0646\u0639\u0637\u0627\u0641\u200C\u067E\u0630\u06CC\u0631\u062A\u0631\u06CC\u0646 \u0633\u06CC\u0633\u062A\u0645 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627\u06CC \u0645\u062E\u062A\u0644\u0641.", tr: "Sembol k\xFC\xE7\xFCk boyutlar\u0131, yaz\u0131 logosu ad\u0131 ta\u015F\u0131r; kullan\u0131m alanlar\u0131 aras\u0131nda en esnek sistemdir." },
    why_not: { en: "A new symbol needs time and exposure before it means anything; more parts to govern.", fa: "\u0646\u0645\u0627\u062F \u062C\u062F\u06CC\u062F \u067E\u06CC\u0634 \u0627\u0632 \u0645\u0639\u0646\u0627 \u067E\u06CC\u062F\u0627 \u06A9\u0631\u062F\u0646 \u0628\u0647 \u0632\u0645\u0627\u0646 \u0648 \u062F\u06CC\u062F\u0647\u200C\u0634\u062F\u0646 \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F\u061B \u0627\u062C\u0632\u0627\u06CC \u0628\u06CC\u0634\u062A\u0631\u06CC \u0628\u0631\u0627\u06CC \u0645\u062F\u06CC\u0631\u06CC\u062A.", tr: "Yeni bir sembol\xFCn anlam kazanmas\u0131 i\xE7in zaman ve g\xF6r\xFCn\xFCrl\xFCk gerekir; y\xF6netilecek daha \xE7ok par\xE7a vard\u0131r." }
  },
  character_mark: {
    title: { en: "Character-led mark (mascot module is enabled)", fa: "\u0646\u0634\u0627\u0646 \u0645\u0628\u062A\u0646\u06CC \u0628\u0631 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 (\u0645\u0627\u0698\u0648\u0644 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A)", tr: "Karakter odakl\u0131 i\u015Faret (maskot mod\xFCl\xFC a\xE7\u0131k)" },
    why: { en: "Uses the brand character for warmth and memorability, especially in apps and social.", fa: "\u0627\u0632 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0631\u0646\u062F \u0628\u0631\u0627\u06CC \u06AF\u0631\u0645\u0627 \u0648 \u0628\u0647\u200C\u06CC\u0627\u062F\u0645\u0627\u0646\u062F\u0646\u06CC\u200C\u0628\u0648\u062F\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0628\u0647\u200C\u0648\u06CC\u0698\u0647 \u062F\u0631 \u0627\u067E \u0648 \u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC.", tr: "S\u0131cakl\u0131k ve ak\u0131lda kal\u0131c\u0131l\u0131k i\xE7in marka karakterini kullan\u0131r; \xF6zellikle uygulamalarda ve sosyal medyada." },
    why_not: { en: "Detail breaks at small sizes; ties the identity to one character. Optional: the brand does not need a mascot.", fa: "\u062C\u0632\u0626\u06CC\u0627\u062A \u062F\u0631 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u06A9\u0648\u0686\u06A9 \u0627\u0632 \u0628\u06CC\u0646 \u0645\u06CC\u200C\u0631\u0648\u062F\u061B \u0647\u0648\u06CC\u062A \u0631\u0627 \u0628\u0647 \u06CC\u06A9 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u06AF\u0631\u0647 \u0645\u06CC\u200C\u0632\u0646\u062F. \u0627\u062E\u062A\u06CC\u0627\u0631\u06CC \u0627\u0633\u062A: \u0628\u0631\u0646\u062F \u0628\u0647 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0646\u06CC\u0627\u0632 \u0646\u062F\u0627\u0631\u062F.", tr: "Ayr\u0131nt\u0131lar k\xFC\xE7\xFCk boyutta kaybolur; kimli\u011Fi tek bir karaktere ba\u011Flar. \u0130ste\u011Fe ba\u011Fl\u0131d\u0131r: markan\u0131n maskota ihtiyac\u0131 yoktur." }
  },
  monogram_icon: {
    title: { en: "Monogram or compact icon with a wordmark", fa: "\u0645\u0648\u0646\u0648\u06AF\u0631\u0627\u0645 \u06CC\u0627 \u0622\u06CC\u06A9\u0648\u0646 \u0641\u0634\u0631\u062F\u0647 \u0628\u0647\u200C\u0647\u0645\u0631\u0627\u0647 \u0646\u0648\u0634\u062A\u0627\u0631", tr: "Monogram veya kompakt simge art\u0131 yaz\u0131 logosu" },
    why: { en: "Prioritizes a square, compact mark for app icon, favicon and avatar uses.", fa: "\u0646\u0634\u0627\u0646\u0647\u0654 \u0645\u0631\u0628\u0639\u06CC \u0648 \u0641\u0634\u0631\u062F\u0647 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0622\u06CC\u06A9\u0648\u0646 \u0627\u067E\u060C \u0641\u0627\u0648\u0622\u06CC\u06A9\u0648\u0646 \u0648 \u0622\u0648\u0627\u062A\u0627\u0631 \u062F\u0631 \u0627\u0648\u0644\u0648\u06CC\u062A \u0642\u0631\u0627\u0631 \u0645\u06CC\u200C\u062F\u0647\u062F.", tr: "Uygulama simgesi, favicon ve avatar i\xE7in kare, kompakt bir i\u015Farete \xF6ncelik verir." },
    why_not: { en: "Letter monograms are common and easily confused; distinctiveness must be checked against the landscape.", fa: "\u0645\u0648\u0646\u0648\u06AF\u0631\u0627\u0645\u200C\u0647\u0627\u06CC \u062D\u0631\u0641\u06CC \u0631\u0627\u06CC\u062C\u200C\u0627\u0646\u062F \u0648 \u0628\u0647\u200C\u0631\u0627\u062D\u062A\u06CC \u0628\u0627 \u0647\u0645 \u0627\u0634\u062A\u0628\u0627\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0645\u062A\u0645\u0627\u06CC\u0632\u0628\u0648\u062F\u0646 \u0628\u0627\u06CC\u062F \u0628\u0627 \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0631\u0642\u0628\u0627 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0634\u0648\u062F.", tr: "Harf monogramlar\u0131 yayg\u0131nd\u0131r ve kolayca kar\u0131\u015Ft\u0131r\u0131l\u0131r; ay\u0131rt edicilik rakip g\xF6r\xFCn\xFCm\xFCne kar\u015F\u0131 kontrol edilmelidir." }
  },
  retain_improve_usage: {
    title: { en: "Retain the identity, improve usage rules", fa: "\u0647\u0648\u06CC\u062A \u0631\u0627 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u060C \u0642\u0648\u0627\u0639\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0631\u0627 \u0628\u0647\u062A\u0631 \u06A9\u0646\u06CC\u062F", tr: "Kimli\u011Fi koruyun, kullan\u0131m kurallar\u0131n\u0131 iyile\u015Ftirin" },
    why: { en: "Keeps whatever recognition exists at the lowest cost; fixes inconsistency with clear space, minimum size, color and misuse rules.", fa: "\u0647\u0631 \u0645\u06CC\u0632\u0627\u0646 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646\u06CC \u0631\u0627 \u06A9\u0647 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F \u0628\u0627 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0647\u0632\u06CC\u0646\u0647 \u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061B \u0646\u0627\u0647\u0645\u0627\u0647\u0646\u06AF\u06CC \u0631\u0627 \u0628\u0627 \u0642\u0648\u0627\u0639\u062F \u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC\u060C \u062D\u062F\u0627\u0642\u0644 \u0627\u0646\u062F\u0627\u0632\u0647\u060C \u0631\u0646\u06AF \u0648 \u0645\u0648\u0627\u0631\u062F \u0645\u0645\u0646\u0648\u0639 \u0631\u0641\u0639 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Var olan tan\u0131n\u0131rl\u0131\u011F\u0131 en d\xFC\u015F\xFCk maliyetle korur; tutars\u0131zl\u0131\u011F\u0131 bo\u015Fluk, en k\xFC\xE7\xFCk boyut, renk ve yanl\u0131\u015F kullan\u0131m kurallar\u0131yla giderir." },
    why_not: { en: "Does not solve a real structural problem (unreadable mark, legal issue, wrong positioning).", fa: "\u0645\u0634\u06A9\u0644 \u0633\u0627\u062E\u062A\u0627\u0631\u06CC \u0648\u0627\u0642\u0639\u06CC (\u0646\u0634\u0627\u0646 \u0646\u0627\u062E\u0648\u0627\u0646\u0627\u060C \u0645\u0633\u0626\u0644\u0647\u0654 \u062D\u0642\u0648\u0642\u06CC\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647 \u0646\u0627\u062F\u0631\u0633\u062A) \u0631\u0627 \u062D\u0644 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Ger\xE7ek bir yap\u0131sal sorunu (okunmayan i\u015Faret, hukuki sorun, yanl\u0131\u015F konumland\u0131rma) \xE7\xF6zmez." }
  },
  evolve_preserve_equity: {
    title: { en: "Evolve while preserving recognizable cues", fa: "\u062A\u06A9\u0627\u0645\u0644 \u0628\u0627 \u062D\u0641\u0638 \u0646\u0634\u0627\u0646\u0647\u200C\u0647\u0627\u06CC \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647", tr: "Tan\u0131n\u0131r ipu\xE7lar\u0131n\u0131 koruyarak geli\u015Ftirme" },
    why: { en: "Refines what the owner marked for change and keeps what is marked preserve, so continuity is visible.", fa: "\u0622\u0646\u0686\u0647 \u0645\u0627\u0644\u06A9 \u0628\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0639\u0644\u0627\u0645\u062A \u0632\u062F\u0647 \u0631\u0627 \u0628\u0647\u0628\u0648\u062F \u0645\u06CC\u200C\u062F\u0647\u062F \u0648 \u0622\u0646\u0686\u0647 \u0628\u0631\u0627\u06CC \u062D\u0641\u0638 \u0639\u0644\u0627\u0645\u062A \u062E\u0648\u0631\u062F\u0647 \u0631\u0627 \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F \u062A\u0627 \u067E\u06CC\u0648\u0633\u062A\u06AF\u06CC \u062F\u06CC\u062F\u0647 \u0634\u0648\u062F.", tr: "Sahibin de\u011Fi\u015Fiklik i\xE7in i\u015Faretledi\u011Fini iyile\u015Ftirir, korunacak olan\u0131 tutar; b\xF6ylece s\xFCreklilik g\xF6r\xFCn\xFCr kal\u0131r." },
    why_not: { en: "May be too subtle to signal a real change; still has migration cost for every asset.", fa: "\u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0628\u0631\u0627\u06CC \u0646\u0634\u0627\u0646\u200C\u062F\u0627\u062F\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u0648\u0627\u0642\u0639\u06CC \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u062C\u0632\u0626\u06CC \u0628\u0627\u0634\u062F\u061B \u0647\u0645\u0686\u0646\u0627\u0646 \u0628\u0631\u0627\u06CC \u0647\u0631 \u062F\u0627\u0631\u0627\u06CC\u06CC \u0647\u0632\u06CC\u0646\u0647\u0654 \u062C\u0627\u0628\u0647\u200C\u062C\u0627\u06CC\u06CC \u062F\u0627\u0631\u062F.", tr: "Ger\xE7ek bir de\u011Fi\u015Fikli\u011Fi g\xF6stermek i\xE7in fazla ince kalabilir; her varl\u0131k i\xE7in yine ge\xE7i\u015F maliyeti vard\u0131r." }
  },
  full_rebrand: {
    title: { en: "Full rebrand", fa: "\u0628\u0627\u0632\u0633\u0627\u0632\u06CC \u06A9\u0627\u0645\u0644 \u0628\u0631\u0646\u062F", tr: "Tam yeniden markala\u015Fma" },
    why: { en: "Clean break for a new market, repositioning, merger or legal issue.", fa: "\u06AF\u0633\u0633\u062A\u06CC \u0631\u0648\u0634\u0646 \u0628\u0631\u0627\u06CC \u0628\u0627\u0632\u0627\u0631 \u062C\u062F\u06CC\u062F\u060C \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u062F\u0648\u0628\u0627\u0631\u0647\u060C \u0627\u062F\u063A\u0627\u0645 \u06CC\u0627 \u0645\u0633\u0626\u0644\u0647\u0654 \u062D\u0642\u0648\u0642\u06CC.", tr: "Yeni pazar, yeniden konumland\u0131rma, birle\u015Fme veya hukuki sorun i\xE7in temiz bir kopu\u015F." },
    why_not: { en: "Resets any recognition the current identity has; the highest migration cost and risk.", fa: "\u0647\u0631 \u0645\u06CC\u0632\u0627\u0646 \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u0631\u0627 \u0627\u0632 \u0628\u06CC\u0646 \u0645\u06CC\u200C\u0628\u0631\u062F\u061B \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u0647\u0632\u06CC\u0646\u0647 \u0648 \u0631\u06CC\u0633\u06A9 \u062C\u0627\u0628\u0647\u200C\u062C\u0627\u06CC\u06CC.", tr: "Mevcut kimli\u011Fin tan\u0131n\u0131rl\u0131\u011F\u0131n\u0131 s\u0131f\u0131rlar; en y\xFCksek ge\xE7i\u015F maliyeti ve riski." }
  }
};
var RISKS = {
  possible_recognition_loss: { en: "Changing {component} may lose recognition the owner believes it has (not measured unless a study is cited).", fa: "\u062A\u063A\u06CC\u06CC\u0631 {component} \u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646\u06CC \u0631\u0627 \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0628\u0647 \u0622\u0646 \u0628\u0627\u0648\u0631 \u062F\u0627\u0631\u062F \u0627\u0632 \u0628\u06CC\u0646 \u0628\u0628\u0631\u062F (\u0633\u0646\u062C\u06CC\u062F\u0647 \u0646\u0634\u062F\u0647 \u0645\u06AF\u0631 \u0645\u0637\u0627\u0644\u0639\u0647\u200C\u0627\u06CC \u0645\u0633\u062A\u0646\u062F \u0634\u0648\u062F).", tr: "{component} de\u011Fi\u015Firse sahibin var oldu\u011Funa inand\u0131\u011F\u0131 tan\u0131n\u0131rl\u0131k kaybolabilir (bir \xE7al\u0131\u015Fma g\xF6sterilmedik\xE7e \xF6l\xE7\xFClmemi\u015Ftir)." },
  name_change_legal_and_migration: { en: "A name change needs a legal search and touches domains, stores, accounts and every document.", fa: "\u062A\u063A\u06CC\u06CC\u0631 \u0646\u0627\u0645 \u0628\u0647 \u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u062D\u0642\u0648\u0642\u06CC \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F \u0648 \u062F\u0627\u0645\u0646\u0647\u200C\u0647\u0627\u060C \u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u200C\u0647\u0627\u060C \u062D\u0633\u0627\u0628\u200C\u0647\u0627 \u0648 \u0647\u0645\u0647\u0654 \u0627\u0633\u0646\u0627\u062F \u0631\u0627 \u062F\u0631\u06AF\u06CC\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Ad de\u011Fi\u015Fikli\u011Fi hukuki ara\u015Ft\u0131rma gerektirir; alan adlar\u0131n\u0131, ma\u011Fazalar\u0131, hesaplar\u0131 ve her belgeyi etkiler." },
  needs_research: { en: "The value of {component} is not known yet; decide after evidence or owner review.", fa: "\u0627\u0631\u0632\u0634 {component} \u0647\u0646\u0648\u0632 \u0645\u0639\u0644\u0648\u0645 \u0646\u06CC\u0633\u062A\u061B \u067E\u0633 \u0627\u0632 \u0634\u0648\u0627\u0647\u062F \u06CC\u0627 \u0628\u0631\u0631\u0633\u06CC \u0645\u0627\u0644\u06A9 \u062A\u0635\u0645\u06CC\u0645 \u0628\u06AF\u06CC\u0631\u06CC\u062F.", tr: "{component} \xF6\u011Fesinin de\u011Feri hen\xFCz bilinmiyor; kan\u0131t veya sahip incelemesinden sonra karar verin." },
  preserve_conflict: { en: "{component} is listed as must-not-change but marked {choice}. Resolve this before any concept work.", fa: "{component} \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \xAB\u0646\u0628\u0627\u06CC\u062F \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0646\u062F\xBB \u0627\u0633\u062A \u0627\u0645\u0627 {choice} \u0639\u0644\u0627\u0645\u062A \u062E\u0648\u0631\u062F\u0647. \u067E\u06CC\u0634 \u0627\u0632 \u0647\u0631 \u06A9\u0627\u0631 \u0637\u0631\u0627\u062D\u06CC \u0627\u06CC\u0646 \u0631\u0627 \u0631\u0648\u0634\u0646 \u06A9\u0646\u06CC\u062F.", tr: "{component} de\u011Fi\u015Fmemeli listesinde ama {choice} olarak i\u015Faretli. Tasar\u0131m \xE7al\u0131\u015Fmas\u0131ndan \xF6nce bunu \xE7\xF6z\xFCn." },
  approved_assets_canonical: { en: "Approved assets stay canonical until a new master is approved and the references are updated.", fa: "\u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062A\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062C\u062F\u06CC\u062F \u0648 \u0628\u0647\u200C\u0631\u0648\u0632\u0634\u062F\u0646 \u0627\u0631\u062C\u0627\u0639\u200C\u0647\u0627 \u0645\u0639\u062A\u0628\u0631 \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F.", tr: "Onayl\u0131 varl\u0131klar yeni ana dosya onaylan\u0131p referanslar g\xFCncellenene kadar ge\xE7erli kal\u0131r." },
  rollout_printed_stock: { en: "Printed stock must be used up or replaced.", fa: "\u0645\u0648\u062C\u0648\u062F\u06CC \u0686\u0627\u067E\u06CC \u0628\u0627\u06CC\u062F \u0645\u0635\u0631\u0641 \u06CC\u0627 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0634\u0648\u062F.", tr: "Bas\u0131l\u0131 stok t\xFCketilmeli veya de\u011Fi\u015Ftirilmeli." },
  rollout_app_store_listing: { en: "App store icon and screenshots change together; plan a release.", fa: "\u0622\u06CC\u06A9\u0648\u0646 \u0648 \u062A\u0635\u0627\u0648\u06CC\u0631 \u0635\u0641\u062D\u0647\u0654 \u0627\u067E \u062F\u0631 \u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0628\u0627 \u0647\u0645 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061B \u0628\u0631\u0627\u06CC \u0627\u0646\u062A\u0634\u0627\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u06A9\u0646\u06CC\u062F.", tr: "Uygulama ma\u011Fazas\u0131 simgesi ve ekran g\xF6r\xFCnt\xFCleri birlikte de\u011Fi\u015Fir; bir s\xFCr\xFCm planlay\u0131n." },
  rollout_signage: { en: "Signage changes are slow and costly.", fa: "\u062A\u063A\u06CC\u06CC\u0631 \u062A\u0627\u0628\u0644\u0648\u0647\u0627 \u06A9\u0646\u062F \u0648 \u067E\u0631\u0647\u0632\u06CC\u0646\u0647 \u0627\u0633\u062A.", tr: "Tabela de\u011Fi\u015Fiklikleri yava\u015F ve maliyetlidir." },
  rollout_packaging: { en: "Packaging needs new production files and stock transition.", fa: "\u0628\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0647 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u062A\u0648\u0644\u06CC\u062F \u062C\u062F\u06CC\u062F \u0648 \u06AF\u0630\u0627\u0631 \u0645\u0648\u062C\u0648\u062F\u06CC \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.", tr: "Ambalaj yeni \xFCretim dosyalar\u0131 ve stok ge\xE7i\u015Fi gerektirir." },
  rollout_partner_materials: { en: "Partners hold copies of the current logo; they need the new files and a date.", fa: "\u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC\u06CC \u0627\u0632 \u0644\u0648\u06AF\u0648\u06CC \u0641\u0639\u0644\u06CC \u062F\u0627\u0631\u0646\u062F\u061B \u0628\u0647 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u062C\u062F\u06CC\u062F \u0648 \u06CC\u06A9 \u062A\u0627\u0631\u06CC\u062E \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u0646\u062F.", tr: "\u0130\u015F ortaklar\u0131nda mevcut logonun kopyalar\u0131 var; yeni dosyalara ve bir tarihe ihtiya\xE7lar\u0131 olacak." },
  recognition_reset: { en: "Recognition starts again from zero.", fa: "\u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u0632 \u0635\u0641\u0631 \u0634\u0631\u0648\u0639 \u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "Tan\u0131n\u0131rl\u0131k s\u0131f\u0131rdan ba\u015Flar." },
  conflicts_with_preserve: { en: "Conflicts with elements marked preserve: {list}.", fa: "\u0628\u0627 \u0628\u062E\u0634\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0631\u0627\u06CC \u062D\u0641\u0638 \u0639\u0644\u0627\u0645\u062A \u062E\u0648\u0631\u062F\u0647\u200C\u0627\u0646\u062F \u062F\u0631 \u062A\u0636\u0627\u062F \u0627\u0633\u062A: {list}.", tr: "Korunacak olarak i\u015Faretlenen \xF6\u011Felerle \xE7eli\u015Fir: {list}." },
  too_subtle: { en: "The change may not be noticed.", fa: "\u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u062A\u063A\u06CC\u06CC\u0631 \u062F\u06CC\u062F\u0647 \u0646\u0634\u0648\u062F.", tr: "De\u011Fi\u015Fiklik fark edilmeyebilir." },
  problem_persists: { en: "The observed problem would remain.", fa: "\u0645\u0634\u06A9\u0644 \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647 \u0628\u0627\u0642\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.", tr: "G\xF6zlemlenen sorun kal\u0131r." },
  small_size_detail: { en: "Detail must survive the smallest real use.", fa: "\u062C\u0632\u0626\u06CC\u0627\u062A \u0628\u0627\u06CC\u062F \u062F\u0631 \u06A9\u0648\u0686\u06A9\u200C\u062A\u0631\u06CC\u0646 \u06A9\u0627\u0631\u0628\u0631\u062F \u0648\u0627\u0642\u0639\u06CC \u0628\u0627\u0642\u06CC \u0628\u0645\u0627\u0646\u062F.", tr: "Ayr\u0131nt\u0131lar en k\xFC\xE7\xFCk ger\xE7ek kullan\u0131mda da korunmal\u0131." },
  similarity_unchecked: { en: "Similarity to other marks is not assessed here; it needs a visual check and a legal search.", fa: "\u0634\u0628\u0627\u0647\u062A \u0628\u0647 \u0646\u0634\u0627\u0646\u200C\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u0627\u06CC\u0646\u062C\u0627 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0628\u0647 \u0628\u0631\u0631\u0633\u06CC \u0628\u0635\u0631\u06CC \u0648 \u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u062D\u0642\u0648\u0642\u06CC \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F.", tr: "Di\u011Fer i\u015Faretlere benzerlik burada de\u011Ferlendirilmez; g\xF6rsel kontrol ve hukuki ara\u015Ft\u0131rma gerekir." }
};
var RED_LINES = {
  no_tracing: { en: "No tracing, copying or close imitation of another company\u2019s logo, including competitors in the landscape.", fa: "\u0647\u06CC\u0686 \u0631\u062F\u06AF\u06CC\u0631\u06CC\u060C \u06A9\u067E\u06CC \u06CC\u0627 \u062A\u0642\u0644\u06CC\u062F \u0646\u0632\u062F\u06CC\u06A9 \u0627\u0632 \u0644\u0648\u06AF\u0648\u06CC \u0634\u0631\u06A9\u062A \u062F\u06CC\u06AF\u0631\u060C \u0627\u0632 \u062C\u0645\u0644\u0647 \u0631\u0642\u0628\u0627\u06CC \u0645\u0648\u062C\u0648\u062F \u062F\u0631 \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632.", tr: "Rakipler dahil ba\u015Fka bir \u015Firketin logosunun kopyalanmas\u0131, \xFCzerinden \xE7izilmesi veya yak\u0131n taklidi yok." },
  inspiration_rights: { en: "Inspiration is reference only; use it only when its rights are own or licensed, and never reproduce it.", fa: "\u0627\u0644\u0647\u0627\u0645 \u0641\u0642\u0637 \u0645\u0631\u062C\u0639 \u0627\u0633\u062A\u061B \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u062D\u0642 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u062E\u0648\u062F \u06CC\u0627 \u062F\u0627\u0631\u0627\u06CC \u0645\u062C\u0648\u0632 \u0627\u0633\u062A \u0627\u0632 \u0622\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F \u0648 \u0647\u0631\u06AF\u0632 \u0622\u0646 \u0631\u0627 \u0628\u0627\u0632\u062A\u0648\u0644\u06CC\u062F \u0646\u06A9\u0646\u06CC\u062F.", tr: "\u0130lham yaln\u0131zca referanst\u0131r; haklar\u0131 size ait veya lisansl\u0131ysa kullan\u0131n ve asla yeniden \xFCretmeyin." },
  no_fake_files: { en: "No placeholder or generated file is presented as the brand\u2019s logo; the EXAMPLE assets are not a mark.", fa: "\u0647\u06CC\u0686 \u0641\u0627\u06CC\u0644 \u0646\u0645\u0648\u0646\u0647 \u06CC\u0627 \u062A\u0648\u0644\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0644\u0648\u06AF\u0648\u06CC \u0628\u0631\u0646\u062F \u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC EXAMPLE \u0646\u0634\u0627\u0646 \u0628\u0631\u0646\u062F \u0646\u06CC\u0633\u062A\u0646\u062F.", tr: "Hi\xE7bir yer tutucu veya \xFCretilmi\u015F dosya markan\u0131n logosu olarak sunulmaz; EXAMPLE varl\u0131klar bir i\u015Faret de\u011Fildir." },
  no_trademark_claim: { en: "No claim of uniqueness, registration or legal clearance without qualified review.", fa: "\u0628\u062F\u0648\u0646 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0627\u0631\u0634\u0646\u0627\u0633 \u0648\u0627\u062C\u062F \u0634\u0631\u0627\u06CC\u0637\u060C \u0647\u06CC\u0686 \u0627\u062F\u0639\u0627\u06CC\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u06CC\u06A9\u062A\u0627\u06CC\u06CC\u060C \u062B\u0628\u062A \u06CC\u0627 \u0645\u062C\u0648\u0632 \u062D\u0642\u0648\u0642\u06CC \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "Yetkin bir inceleme olmadan benzersizlik, tescil veya hukuki uygunluk iddias\u0131 yok." },
  keep_preserved: { en: "Do not change elements marked preserve: {list}.", fa: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC\u06CC \u0631\u0627 \u06A9\u0647 \u0628\u0631\u0627\u06CC \u062D\u0641\u0638 \u0639\u0644\u0627\u0645\u062A \u062E\u0648\u0631\u062F\u0647\u200C\u0627\u0646\u062F \u062A\u063A\u06CC\u06CC\u0631 \u0646\u062F\u0647\u06CC\u062F: {list}.", tr: "Korunacak olarak i\u015Faretlenen \xF6\u011Feleri de\u011Fi\u015Ftirmeyin: {list}." }
};
var RUBRIC = {
  strategic_fit: { en: "Strategic fit: does it express the approved differentiation and personality?", fa: "\u062A\u0646\u0627\u0633\u0628 \u0631\u0627\u0647\u0628\u0631\u062F\u06CC: \u0622\u06CC\u0627 \u062A\u0645\u0627\u06CC\u0632 \u0648 \u0634\u062E\u0635\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0631\u0627 \u0628\u06CC\u0627\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F", tr: "Stratejik uyum: onayl\u0131 farkl\u0131la\u015Fmay\u0131 ve ki\u015Fili\u011Fi ifade ediyor mu?" },
  distinctiveness: { en: "Distinctiveness: is it clearly different from the cited landscape?", fa: "\u0645\u062A\u0645\u0627\u06CC\u0632\u0628\u0648\u062F\u0646: \u0622\u06CC\u0627 \u0628\u0647\u200C\u0631\u0648\u0634\u0646\u06CC \u0628\u0627 \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0645\u0633\u062A\u0646\u062F \u0645\u062A\u0641\u0627\u0648\u062A \u0627\u0633\u062A\u061F", tr: "Ay\u0131rt edicilik: kaynakl\u0131 rakip g\xF6r\xFCn\xFCm\xFCnden a\xE7\u0131k\xE7a farkl\u0131 m\u0131?" },
  legibility: { en: "Legibility: readable at the smallest real use and in every required script?", fa: "\u062E\u0648\u0627\u0646\u0627\u06CC\u06CC: \u062F\u0631 \u06A9\u0648\u0686\u06A9\u200C\u062A\u0631\u06CC\u0646 \u06A9\u0627\u0631\u0628\u0631\u062F \u0648\u0627\u0642\u0639\u06CC \u0648 \u062F\u0631 \u0647\u0645\u0647\u0654 \u062E\u0637\u200C\u0647\u0627\u06CC \u0644\u0627\u0632\u0645 \u062E\u0648\u0627\u0646\u0627\u0633\u062A\u061F", tr: "Okunabilirlik: en k\xFC\xE7\xFCk ger\xE7ek kullan\u0131mda ve gereken t\xFCm yaz\u0131 sistemlerinde okunuyor mu?" },
  versatility: { en: "Versatility: works in one color, reversed and on every listed use?", fa: "\u0627\u0646\u0639\u0637\u0627\u0641\u200C\u067E\u0630\u06CC\u0631\u06CC: \u062F\u0631 \u06CC\u06A9 \u0631\u0646\u06AF\u060C \u0645\u0639\u06A9\u0648\u0633 \u0648 \u062F\u0631 \u0647\u0645\u0647\u0654 \u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627\u06CC \u0641\u0647\u0631\u0633\u062A\u200C\u0634\u062F\u0647 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F", tr: "\xC7ok y\xF6nl\xFCl\xFCk: tek renkte, ters renkte ve listelenen her kullan\u0131mda \xE7al\u0131\u015F\u0131yor mu?" },
  meaningfulness: { en: "Meaningfulness: can the owner explain why it fits the brand?", fa: "\u0645\u0639\u0646\u0627\u062F\u0627\u0631\u06CC: \u0622\u06CC\u0627 \u0645\u0627\u0644\u06A9 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u062A\u0648\u0636\u06CC\u062D \u062F\u0647\u062F \u0686\u0631\u0627 \u0628\u0627 \u0628\u0631\u0646\u062F \u0633\u0627\u0632\u06AF\u0627\u0631 \u0627\u0633\u062A\u061F", tr: "Anlaml\u0131l\u0131k: sahip, markaya neden uydu\u011Funu a\xE7\u0131klayabiliyor mu?" },
  longevity: { en: "Longevity: does it avoid short-lived trends?", fa: "\u0645\u0627\u0646\u062F\u06AF\u0627\u0631\u06CC: \u0622\u06CC\u0627 \u0627\u0632 \u0645\u062F\u0647\u0627\u06CC \u0632\u0648\u062F\u06AF\u0630\u0631 \u062F\u0648\u0631\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F", tr: "Kal\u0131c\u0131l\u0131k: k\u0131sa \xF6m\xFCrl\xFC trendlerden ka\xE7\u0131n\u0131yor mu?" },
  feasibility: { en: "Feasibility: can it be produced and governed with the team and budget the owner has?", fa: "\u0627\u0645\u06A9\u0627\u0646\u200C\u067E\u0630\u06CC\u0631\u06CC: \u0628\u0627 \u062A\u06CC\u0645 \u0648 \u0645\u0646\u0627\u0628\u0639\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u062F\u0627\u0631\u062F \u0642\u0627\u0628\u0644 \u062A\u0648\u0644\u06CC\u062F \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0633\u062A\u061F", tr: "Uygulanabilirlik: sahibin ekibi ve kaynaklar\u0131yla \xFCretilip y\xF6netilebilir mi?" },
  legal_risk_review: { en: "Legal-risk review: has a qualified person checked name and mark similarity? (Not done by this brief.)", fa: "\u0628\u0631\u0631\u0633\u06CC \u0631\u06CC\u0633\u06A9 \u062D\u0642\u0648\u0642\u06CC: \u0622\u06CC\u0627 \u0641\u0631\u062F\u06CC \u0648\u0627\u062C\u062F \u0634\u0631\u0627\u06CC\u0637 \u0634\u0628\u0627\u0647\u062A \u0646\u0627\u0645 \u0648 \u0646\u0634\u0627\u0646 \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A\u061F (\u0627\u06CC\u0646 \u0628\u0631\u06CC\u0641 \u0627\u0646\u062C\u0627\u0645 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.)", tr: "Hukuki risk incelemesi: yetkin biri ad ve i\u015Faret benzerli\u011Fini kontrol etti mi? (Bu brief yapmaz.)" }
};
var APPLICATION_CHECKS = {
  square_crop: { en: "{use}: works in a square crop without the wordmark.", fa: "{use}: \u062F\u0631 \u0628\u0631\u0634 \u0645\u0631\u0628\u0639\u06CC \u0648 \u0628\u062F\u0648\u0646 \u0646\u0648\u0634\u062A\u0627\u0631 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "{use}: yaz\u0131 logosu olmadan kare k\u0131rpmada \xE7al\u0131\u015F\u0131r." },
  circle_crop: { en: "{use}: works inside a circle crop.", fa: "{use}: \u062F\u0631\u0648\u0646 \u0628\u0631\u0634 \u062F\u0627\u06CC\u0631\u0647\u200C\u0627\u06CC \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "{use}: daire k\u0131rpma i\xE7inde \xE7al\u0131\u015F\u0131r." },
  smallest_size: { en: "{use}: test at the smallest size the platform shows; record the measured minimum only after a master exists.", fa: "{use}: \u062F\u0631 \u06A9\u0648\u0686\u06A9\u200C\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u0627\u06CC \u06A9\u0647 \u067E\u0644\u062A\u0641\u0631\u0645 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F \u0622\u0632\u0645\u0627\u06CC\u0634 \u06A9\u0646\u06CC\u062F\u061B \u062D\u062F\u0627\u0642\u0644 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0631\u0627 \u0641\u0642\u0637 \u067E\u0633 \u0627\u0632 \u0648\u062C\u0648\u062F \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F.", tr: "{use}: platformun g\xF6sterdi\u011Fi en k\xFC\xE7\xFCk boyutta test edin; \xF6l\xE7\xFClen en k\xFC\xE7\xFCk boyutu yaln\u0131zca ana dosya olduktan sonra kaydedin." },
  horizontal_lockup: { en: "{use}: a horizontal lockup that fits a header height.", fa: "{use}: \u062A\u0631\u06A9\u06CC\u0628 \u0627\u0641\u0642\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u0631\u062A\u0641\u0627\u0639 \u0633\u0631\u0628\u0631\u06AF \u062C\u0627 \u0634\u0648\u062F.", tr: "{use}: ba\u015Fl\u0131k y\xFCksekli\u011Fine s\u0131\u011Fan yatay bir yerle\u015Fim." },
  dark_light: { en: "{use}: check on light and dark backgrounds, including dark mode.", fa: "{use}: \u0631\u0648\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646 \u0648 \u062A\u06CC\u0631\u0647\u060C \u0627\u0632 \u062C\u0645\u0644\u0647 \u062D\u0627\u0644\u062A \u062A\u06CC\u0631\u0647\u060C \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.", tr: "{use}: a\xE7\u0131k ve koyu arka planlarda, karanl\u0131k mod dahil, kontrol edin." },
  one_color: { en: "{use}: one-color and reversed versions.", fa: "{use}: \u0646\u0633\u062E\u0647\u0654 \u062A\u06A9\u200C\u0631\u0646\u06AF \u0648 \u0645\u0639\u06A9\u0648\u0633.", tr: "{use}: tek renk ve ters renk s\xFCr\xFCmleri." },
  print_color: { en: "{use}: check spot/CMYK conversion and the substrate before production.", fa: "{use}: \u067E\u06CC\u0634 \u0627\u0632 \u062A\u0648\u0644\u06CC\u062F\u060C \u062A\u0628\u062F\u06CC\u0644 \u0631\u0646\u06AF \u0627\u0633\u067E\u0627\u062A/CMYK \u0648 \u062C\u0646\u0633 \u0633\u0637\u062D \u0686\u0627\u067E \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F.", tr: "{use}: \xFCretimden \xF6nce spot/CMYK d\xF6n\xFC\u015F\xFCm\xFCn\xFC ve bask\u0131 y\xFCzeyini kontrol edin." },
  distance: { en: "{use}: legibility at viewing distance.", fa: "{use}: \u062E\u0648\u0627\u0646\u0627\u06CC\u06CC \u0627\u0632 \u0641\u0627\u0635\u0644\u0647\u0654 \u062F\u06CC\u062F.", tr: "{use}: izleme mesafesinden okunabilirlik." },
  motion_states: { en: "{use}: start and end frames, and a reduced-motion version.", fa: "{use}: \u0641\u0631\u06CC\u0645 \u0622\u063A\u0627\u0632 \u0648 \u067E\u0627\u06CC\u0627\u0646\u060C \u0648 \u0646\u0633\u062E\u0647\u0654 \u06A9\u0627\u0647\u0634 \u062D\u0631\u06A9\u062A.", tr: "{use}: ba\u015Flang\u0131\xE7 ve biti\u015F kareleri ile azalt\u0131lm\u0131\u015F hareket s\xFCr\xFCm\xFC." },
  simplified: { en: "{use}: a simplified version for embroidery or small objects.", fa: "{use}: \u0646\u0633\u062E\u0647\u0654 \u0633\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u06AF\u0644\u062F\u0648\u0632\u06CC \u06CC\u0627 \u0627\u0634\u06CC\u0627\u06CC \u06A9\u0648\u0686\u06A9.", tr: "{use}: nak\u0131\u015F veya k\xFC\xE7\xFCk nesneler i\xE7in sadele\u015Ftirilmi\u015F s\xFCr\xFCm." },
  raster_fallback: { en: "{use}: a raster fallback that survives email clients and dark mode.", fa: "{use}: \u0646\u0633\u062E\u0647\u0654 \u0631\u0633\u062A\u0631\u06CC \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u06A9\u0647 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0647\u0627\u06CC \u0627\u06CC\u0645\u06CC\u0644 \u0648 \u062D\u0627\u0644\u062A \u062A\u06CC\u0631\u0647 \u0633\u0627\u0644\u0645 \u0628\u0645\u0627\u0646\u062F.", tr: "{use}: e-posta istemcilerinde ve karanl\u0131k modda bozulmayan bir raster yedek." },
  rtl_lockup: { en: "Persian/Arabic: a right-to-left lockup and spacing that do not mirror the symbol by accident.", fa: "\u0641\u0627\u0631\u0633\u06CC/\u0639\u0631\u0628\u06CC: \u062A\u0631\u06A9\u06CC\u0628 \u0648 \u0641\u0627\u0635\u0644\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC \u0631\u0627\u0633\u062A\u200C\u0628\u0647\u200C\u0686\u067E \u06A9\u0647 \u0646\u0645\u0627\u062F \u0631\u0627 \u0646\u0627\u062E\u0648\u0627\u0633\u062A\u0647 \u0642\u0631\u06CC\u0646\u0647 \u0646\u06A9\u0646\u062F.", tr: "Fars\xE7a/Arap\xE7a: sembol\xFC yanl\u0131\u015Fl\u0131kla aynalamayan sa\u011Fdan sola yerle\u015Fim ve bo\u015Fluklar." },
  contrast: { en: "Contrast against every background the mark is placed on.", fa: "\u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u062F\u0631 \u0628\u0631\u0627\u0628\u0631 \u0647\u0631 \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u200C\u0627\u06CC \u06A9\u0647 \u0646\u0634\u0627\u0646 \u0631\u0648\u06CC \u0622\u0646 \u0642\u0631\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.", tr: "\u0130\u015Faretin yerle\u015Ftirildi\u011Fi her arka planla kontrast." },
  formats: { en: "Masters as safe SVG plus exports, registered in brand/assets/asset-manifest.yaml with license and checksum.", fa: "\u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0627\u0635\u0644\u06CC \u0628\u0647\u200C\u0635\u0648\u0631\u062A SVG \u0627\u0645\u0646 \u0628\u0647\u200C\u0647\u0645\u0631\u0627\u0647 \u062E\u0631\u0648\u062C\u06CC\u200C\u0647\u0627\u060C \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u062F\u0631 brand/assets/asset-manifest.yaml \u0628\u0627 \u0645\u062C\u0648\u0632 \u0648 checksum.", tr: "Ana dosyalar g\xFCvenli SVG ve d\u0131\u015Fa aktar\u0131mlar olarak, lisans ve checksum ile brand/assets/asset-manifest.yaml dosyas\u0131na kay\u0131tl\u0131." }
};
var USE_LABELS = {
  app_icon: { en: "App icon", fa: "\u0622\u06CC\u06A9\u0648\u0646 \u0627\u067E", tr: "Uygulama simgesi" },
  favicon: { en: "Favicon", fa: "\u0641\u0627\u0648\u0622\u06CC\u06A9\u0648\u0646", tr: "Favicon" },
  website_header: { en: "Website header", fa: "\u0633\u0631\u0628\u0631\u06AF \u0648\u0628\u200C\u0633\u0627\u06CC\u062A", tr: "Web sitesi ba\u015Fl\u0131\u011F\u0131" },
  social_avatar: { en: "Social avatar", fa: "\u062A\u0635\u0648\u06CC\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644 \u0627\u062C\u062A\u0645\u0627\u0639\u06CC", tr: "Sosyal medya profil g\xF6rseli" },
  print: { en: "Print", fa: "\u0686\u0627\u067E", tr: "Bask\u0131" },
  packaging: { en: "Packaging", fa: "\u0628\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC", tr: "Ambalaj" },
  signage: { en: "Signage", fa: "\u062A\u0627\u0628\u0644\u0648", tr: "Tabela" },
  motion: { en: "Motion", fa: "\u0645\u0648\u0634\u0646", tr: "Hareketli g\xF6rsel" },
  merchandise: { en: "Merchandise", fa: "\u06A9\u0627\u0644\u0627\u06CC \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u06CC", tr: "Promosyon \xFCr\xFCn\xFC" },
  email: { en: "Email", fa: "\u0627\u06CC\u0645\u06CC\u0644", tr: "E-posta" }
};
var MISSING = {
  path_unconfirmed: { en: "The identity path is not confirmed by the owner.", fa: "\u0645\u0633\u06CC\u0631 \u0647\u0648\u06CC\u062A \u062A\u0648\u0633\u0637 \u0645\u0627\u0644\u06A9 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.", tr: "Kimlik yolu sahip taraf\u0131ndan onaylanmad\u0131." },
  diagnosis_pending: { en: "Diagnosis questions still open: {list}.", fa: "\u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u0628\u0631\u0631\u0633\u06CC \u0647\u0646\u0648\u0632 \u0628\u0627\u0632 \u0627\u0633\u062A: {list}.", tr: "H\xE2l\xE2 a\xE7\u0131k tan\u0131 sorular\u0131: {list}." },
  fact_missing: { en: "{field} is not approved yet; the brief does not fill it in.", fa: "{field} \u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A\u061B \u0628\u0631\u06CC\u0641 \u0622\u0646 \u0631\u0627 \u067E\u0631 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "{field} hen\xFCz onaylanmad\u0131; brief onu doldurmaz." },
  no_master: { en: "No approved logo master exists. Nothing in this brief is a logo file.", fa: "\u0647\u06CC\u0686 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0644\u0648\u06AF\u0648 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u062F\u0631 \u0627\u06CC\u0646 \u0628\u0631\u06CC\u0641 \u0641\u0627\u06CC\u0644 \u0644\u0648\u06AF\u0648 \u0646\u06CC\u0633\u062A.", tr: "Onayl\u0131 bir logo ana dosyas\u0131 yok. Bu brief\u2019teki hi\xE7bir \u015Fey logo dosyas\u0131 de\u011Fildir." },
  visual_unavailable: { en: "No current, cited visual observation: visual comparison is unavailable (a research gap, not a finding).", fa: "\u0647\u06CC\u0686 \u0645\u0634\u0627\u0647\u062F\u0647\u0654 \u0628\u0635\u0631\u06CC \u0641\u0639\u0644\u06CC \u0648 \u0645\u0633\u062A\u0646\u062F\u06CC \u0646\u06CC\u0633\u062A: \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0628\u0635\u0631\u06CC \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A (\u0634\u06A9\u0627\u0641 \u067E\u0698\u0648\u0647\u0634\u06CC\u060C \u0646\u0647 \u06CC\u0627\u0641\u062A\u0647).", tr: "G\xFCncel, kaynakl\u0131 g\xF6rsel g\xF6zlem yok: g\xF6rsel kar\u015F\u0131la\u015Ft\u0131rma yap\u0131lam\u0131yor (bir ara\u015Ft\u0131rma bo\u015Flu\u011Fu, bulgu de\u011Fil)." },
  no_creative_project: { en: "No Creative Learning project is linked for concept rounds (brand:creative project --surface logo, then brand:identity link-creative).", fa: "\u0647\u06CC\u0686 \u067E\u0631\u0648\u0698\u0647\u0654 \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u062E\u0644\u0627\u0642 \u0628\u0631\u0627\u06CC \u062F\u0648\u0631\u0647\u0627\u06CC \u0637\u0631\u0627\u062D\u06CC \u067E\u06CC\u0648\u0646\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A (brand:creative project --surface logo\u060C \u0633\u067E\u0633 brand:identity link-creative).", tr: "Konsept turlar\u0131 i\xE7in ba\u011Fl\u0131 bir Yarat\u0131c\u0131 \xD6\u011Frenme projesi yok (brand:creative project --surface logo, ard\u0131ndan brand:identity link-creative)." },
  legal_review: { en: "Name and mark legal search: required, not performed.", fa: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u062D\u0642\u0648\u0642\u06CC \u0646\u0627\u0645 \u0648 \u0646\u0634\u0627\u0646: \u0644\u0627\u0632\u0645 \u0627\u0633\u062A\u060C \u0627\u0646\u062C\u0627\u0645 \u0646\u0634\u062F\u0647.", tr: "Ad ve i\u015Faret i\xE7in hukuki ara\u015Ft\u0131rma: gerekli, yap\u0131lmad\u0131." },
  equity_unknown: { en: "Equity is unknown for: {list}. No recognition figure is assumed.", fa: "\u0627\u0631\u0632\u0634 \u0628\u0631\u0646\u062F \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0645\u0648\u0627\u0631\u062F \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0627\u0633\u062A: {list}. \u0647\u06CC\u0686 \u0631\u0642\u0645\u06CC \u0628\u0631\u0627\u06CC \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0646 \u0641\u0631\u0636 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "\u015Eu \xF6\u011Feler i\xE7in marka de\u011Feri bilinmiyor: {list}. Hi\xE7bir tan\u0131n\u0131rl\u0131k rakam\u0131 varsay\u0131lmaz." }
};
var HANDOFF = {
  select: { en: "Run concept rounds in Creative Learning (brand:creative feedback/select). Selecting a concept is not approving a mark.", fa: "\u062F\u0648\u0631\u0647\u0627\u06CC \u0637\u0631\u0627\u062D\u06CC \u0631\u0627 \u062F\u0631 \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u062E\u0644\u0627\u0642 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F (brand:creative feedback/select). \u0627\u0646\u062A\u062E\u0627\u0628 \u06CC\u06A9 \u0637\u0631\u062D \u0628\u0647 \u0645\u0639\u0646\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u0627\u0646 \u0646\u06CC\u0633\u062A.", tr: "Konsept turlar\u0131n\u0131 Yarat\u0131c\u0131 \xD6\u011Frenme\u2019de y\xFCr\xFCt\xFCn (brand:creative feedback/select). Bir konsepti se\xE7mek i\u015Fareti onaylamak de\u011Fildir." },
  register: { en: "Register the real artwork in brand/assets/asset-manifest.yaml with license, rights and checksum, and run npm run validate.", fa: "\u0627\u062B\u0631 \u0648\u0627\u0642\u0639\u06CC \u0631\u0627 \u0628\u0627 \u0645\u062C\u0648\u0632\u060C \u062D\u0642\u0648\u0642 \u0648 checksum \u062F\u0631 brand/assets/asset-manifest.yaml \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F \u0648 npm run validate \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F.", tr: "Ger\xE7ek \xE7izimi lisans, haklar ve checksum ile brand/assets/asset-manifest.yaml dosyas\u0131na kaydedin ve npm run validate \xE7al\u0131\u015Ft\u0131r\u0131n." },
  approve: { en: "Change brand.logo.* (and any name, color or type decision) only through brand:propose or brand:knowledge propose, then brand:review and brand:approve.", fa: "brand.logo.* (\u0648 \u0647\u0631 \u062A\u0635\u0645\u06CC\u0645 \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0646\u0627\u0645\u060C \u0631\u0646\u06AF \u06CC\u0627 \u062D\u0631\u0648\u0641) \u0631\u0627 \u0641\u0642\u0637 \u0627\u0632 \u0631\u0627\u0647 brand:propose \u06CC\u0627 brand:knowledge propose \u0648 \u0633\u067E\u0633 brand:review \u0648 brand:approve \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0647\u06CC\u062F.", tr: "brand.logo.* (ve ad, renk veya yaz\u0131 kararlar\u0131n\u0131) yaln\u0131zca brand:propose veya brand:knowledge propose, ard\u0131ndan brand:review ve brand:approve ile de\u011Fi\u015Ftirin." },
  specify: { en: "The logo-designer skill then specifies lockups, clear space and minimum sizes from the approved master.", fa: "\u0633\u067E\u0633 \u0645\u0647\u0627\u0631\u062A logo-designer \u062A\u0631\u06A9\u06CC\u0628\u200C\u0647\u0627\u060C \u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC \u0648 \u062D\u062F\u0627\u0642\u0644 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u0647\u0627 \u0631\u0627 \u0627\u0632 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0645\u0634\u062E\u0635 \u0645\u06CC\u200C\u06A9\u0646\u062F.", tr: "Ard\u0131ndan logo-designer becerisi onayl\u0131 ana dosyadan yerle\u015Fimleri, bo\u015Flu\u011Fu ve en k\xFC\xE7\xFCk boyutlar\u0131 belirler." },
  legal: { en: "A qualified person runs the trademark search before launch.", fa: "\u067E\u06CC\u0634 \u0627\u0632 \u0639\u0631\u0636\u0647\u060C \u0641\u0631\u062F\u06CC \u0648\u0627\u062C\u062F \u0634\u0631\u0627\u06CC\u0637 \u062C\u0633\u062A\u200C\u0648\u062C\u0648\u06CC \u0639\u0644\u0627\u0645\u062A \u062A\u062C\u0627\u0631\u06CC \u0631\u0627 \u0627\u0646\u062C\u0627\u0645 \u0645\u06CC\u200C\u062F\u0647\u062F.", tr: "Lansmandan \xF6nce yetkin biri marka ara\u015Ft\u0131rmas\u0131n\u0131 yapar." },
  canonical: { en: "Until then the current identity and its approved assets remain canonical.", fa: "\u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0647\u0648\u06CC\u062A \u0641\u0639\u0644\u06CC \u0648 \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0622\u0646 \u0645\u0639\u062A\u0628\u0631 \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F.", tr: "O zamana kadar mevcut kimlik ve onayl\u0131 varl\u0131klar\u0131 ge\xE7erli kal\u0131r." }
};
var NEXT_STEP = {
  confirm_path: { en: "Confirm the identity path.", fa: "\u0645\u0633\u06CC\u0631 \u0647\u0648\u06CC\u062A \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.", tr: "Kimlik yolunu onaylay\u0131n." },
  answer_diagnosis: { en: "Answer the next diagnosis question: {field}.", fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0628\u0639\u062F\u06CC \u0628\u0631\u0631\u0633\u06CC \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F: {field}.", tr: "Sonraki tan\u0131 sorusunu yan\u0131tlay\u0131n: {field}." },
  record_visuals: { en: "Record cited visual sources for the competitors (brand:seo research, then brand:competitive link --dimension visual_language).", fa: "\u0645\u0646\u0627\u0628\u0639 \u0628\u0635\u0631\u06CC \u0645\u0633\u062A\u0646\u062F \u0631\u0642\u0628\u0627 \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F (brand:seo research\u060C \u0633\u067E\u0633 brand:competitive link --dimension visual_language).", tr: "Rakipler i\xE7in kaynakl\u0131 g\xF6rsel kaynaklar\u0131 kaydedin (brand:seo research, ard\u0131ndan brand:competitive link --dimension visual_language)." },
  concept_round: { en: "Run a concept round for the preferred route and record owner feedback.", fa: "\u0628\u0631\u0627\u06CC \u0645\u0633\u06CC\u0631 \u062A\u0631\u062C\u06CC\u062D\u06CC \u06CC\u06A9 \u062F\u0648\u0631 \u0637\u0631\u0627\u062D\u06CC \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F \u0648 \u0628\u0627\u0632\u062E\u0648\u0631\u062F \u0645\u0627\u0644\u06A9 \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F.", tr: "Tercih edilen yol i\xE7in bir konsept turu yap\u0131n ve sahibin geri bildirimini kaydedin." },
  approve_artwork: { en: "Register and approve the selected real artwork through the existing asset and approval flow.", fa: "\u0627\u062B\u0631 \u0648\u0627\u0642\u0639\u06CC \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u0631\u0627 \u0627\u0632 \u0645\u0633\u06CC\u0631 \u0645\u0648\u062C\u0648\u062F \u062F\u0627\u0631\u0627\u06CC\u06CC \u0648 \u062A\u0623\u06CC\u06CC\u062F \u062B\u0628\u062A \u0648 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.", tr: "Se\xE7ilen ger\xE7ek \xE7izimi mevcut varl\u0131k ve onay ak\u0131\u015F\u0131yla kaydedin ve onaylay\u0131n." }
};
var BRIEF_HEADINGS = {
  title: { en: "Logo and identity brief (draft)", fa: "\u0628\u0631\u06CC\u0641 \u0644\u0648\u06AF\u0648 \u0648 \u0647\u0648\u06CC\u062A (\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633)", tr: "Logo ve kimlik brief\u2019i (taslak)" },
  preamble: { en: "Draft for the owner. It approves nothing, changes no brand fact, logo or asset, and authorizes nothing (authorizes: []).", fa: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0628\u0631\u0627\u06CC \u0645\u0627\u0644\u06A9. \u0686\u06CC\u0632\u06CC \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A \u0628\u0631\u0646\u062F\u060C \u0644\u0648\u06AF\u0648 \u06CC\u0627 \u062F\u0627\u0631\u0627\u06CC\u06CC \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F \u0648 \u0645\u062C\u0648\u0632 \u0647\u06CC\u0686 \u06A9\u0627\u0631\u06CC \u0646\u06CC\u0633\u062A (authorizes: []).", tr: "Sahibi i\xE7in taslak. Hi\xE7bir \u015Feyi onaylamaz, hi\xE7bir marka bilgisini, logoyu veya varl\u0131\u011F\u0131 de\u011Fi\u015Ftirmez ve hi\xE7bir \u015Feye yetki vermez (authorizes: [])." },
  status: { en: "Status", fa: "\u0648\u0636\u0639\u06CC\u062A", tr: "Durum" },
  path: { en: "Identity path", fa: "\u0645\u0633\u06CC\u0631 \u0647\u0648\u06CC\u062A", tr: "Kimlik yolu" },
  conclusion: { en: "Audit conclusion", fa: "\u0646\u062A\u06CC\u062C\u0647\u0654 \u0628\u0631\u0631\u0633\u06CC", tr: "Denetim sonucu" },
  problem: { en: "Problem definition and desired outcome", fa: "\u062A\u0639\u0631\u06CC\u0641 \u0645\u0633\u0626\u0644\u0647 \u0648 \u0646\u062A\u06CC\u062C\u0647\u0654 \u0645\u0637\u0644\u0648\u0628", tr: "Sorun tan\u0131m\u0131 ve istenen sonu\xE7" },
  canonical: { en: "Audience, geography, personality, differentiation (approved facts, by id)", fa: "\u0645\u062E\u0627\u0637\u0628\u060C \u062C\u063A\u0631\u0627\u0641\u06CC\u0627\u060C \u0634\u062E\u0635\u06CC\u062A\u060C \u062A\u0645\u0627\u06CC\u0632 (\u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0628\u0627 \u0634\u0646\u0627\u0633\u0647)", tr: "Hedef kitle, co\u011Frafya, ki\u015Filik, farkl\u0131la\u015Fma (onayl\u0131 bilgiler, kimlikle)" },
  assets: { en: "Existing assets", fa: "\u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u06CC \u0645\u0648\u062C\u0648\u062F", tr: "Mevcut varl\u0131klar" },
  equity: { en: "Equity preservation matrix", fa: "\u062C\u062F\u0648\u0644 \u062D\u0641\u0638 \u0627\u0631\u0632\u0634 \u0628\u0631\u0646\u062F", tr: "Marka de\u011Feri koruma tablosu" },
  migration: { en: "Migration risks", fa: "\u0631\u06CC\u0633\u06A9\u200C\u0647\u0627\u06CC \u062C\u0627\u0628\u0647\u200C\u062C\u0627\u06CC\u06CC", tr: "Ge\xE7i\u015F riskleri" },
  landscape: { en: "Competitor visual landscape (identity projection only)", fa: "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0628\u0635\u0631\u06CC \u0631\u0642\u0628\u0627 (\u0641\u0642\u0637 \u0628\u0631\u0634 \u0647\u0648\u06CC\u062A)", tr: "Rakip g\xF6rsel g\xF6r\xFCn\xFCm\xFC (yaln\u0131zca kimlik projeksiyonu)" },
  routes: { en: "Conceptual routes", fa: "\u0645\u0633\u06CC\u0631\u0647\u0627\u06CC \u0645\u0641\u0647\u0648\u0645\u06CC", tr: "Kavramsal yollar" },
  applications: { en: "Uses and application checks", fa: "\u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627 \u0648 \u0628\u0631\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC \u0627\u062C\u0631\u0627", tr: "Kullan\u0131mlar ve uygulama kontrolleri" },
  production: { en: "Accessibility, small-size, one-color and production checks", fa: "\u0628\u0631\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC \u062F\u0633\u062A\u0631\u0633\u200C\u067E\u0630\u06CC\u0631\u06CC\u060C \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u06A9\u0648\u0686\u06A9\u060C \u062A\u06A9\u200C\u0631\u0646\u06AF \u0648 \u062A\u0648\u0644\u06CC\u062F", tr: "Eri\u015Filebilirlik, k\xFC\xE7\xFCk boyut, tek renk ve \xFCretim kontrolleri" },
  red_lines: { en: "Inspiration rights and red lines", fa: "\u062D\u0642\u0648\u0642 \u0627\u0644\u0647\u0627\u0645 \u0648 \u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632", tr: "\u0130lham haklar\u0131 ve k\u0131rm\u0131z\u0131 \xE7izgiler" },
  rubric: { en: "Evaluation rubric (unweighted unless the owner chooses weights)", fa: "\u0645\u0639\u06CC\u0627\u0631 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC (\u0628\u062F\u0648\u0646 \u0648\u0632\u0646\u060C \u0645\u06AF\u0631 \u0645\u0627\u0644\u06A9 \u0648\u0632\u0646 \u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646\u062F)", tr: "De\u011Ferlendirme \xF6l\xE7\xFCtleri (sahip a\u011F\u0131rl\u0131k se\xE7medik\xE7e a\u011F\u0131rl\u0131ks\u0131z)" },
  iteration: { en: "Concept rounds (Creative Learning)", fa: "\u062F\u0648\u0631\u0647\u0627\u06CC \u0637\u0631\u0627\u062D\u06CC (\u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC \u062E\u0644\u0627\u0642)", tr: "Konsept turlar\u0131 (Yarat\u0131c\u0131 \xD6\u011Frenme)" },
  decision: { en: "Decision record", fa: "\u0633\u0627\u0628\u0642\u0647\u0654 \u062A\u0635\u0645\u06CC\u0645", tr: "Karar kayd\u0131" },
  handoff: { en: "Approval handoff", fa: "\u0645\u0633\u06CC\u0631 \u062A\u0623\u06CC\u06CC\u062F", tr: "Onay devri" },
  missing: { en: "Missing and unknown", fa: "\u0645\u0648\u0627\u0631\u062F \u0646\u0627\u0645\u0648\u062C\u0648\u062F \u0648 \u0646\u0627\u0645\u0639\u0644\u0648\u0645", tr: "Eksik ve bilinmeyen" },
  not_known: { en: "Not known (never inferred here)", fa: "\u0646\u0627\u0645\u0639\u0644\u0648\u0645 (\u0627\u06CC\u0646\u062C\u0627 \u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F)", tr: "Bilinmiyor (burada asla \xE7\u0131kar\u0131lmaz)" },
  never: { en: "Never inferred", fa: "\u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0646\u0628\u0627\u0637 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F", tr: "Asla \xE7\u0131kar\u0131lmaz" },
  why: { en: "why", fa: "\u0686\u0631\u0627", tr: "neden" },
  why_not: { en: "why not", fa: "\u0686\u0631\u0627 \u0646\u0647", tr: "neden olmas\u0131n" },
  risks: { en: "risks", fa: "\u0631\u06CC\u0633\u06A9\u200C\u0647\u0627", tr: "riskler" },
  preserves: { en: "preserves", fa: "\u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F", tr: "korur" },
  changes: { en: "may change", fa: "\u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0647\u062F", tr: "de\u011Fi\u015Ftirebilir" },
  attributes: { en: "brand attributes (approved facts)", fa: "\u0648\u06CC\u0698\u06AF\u06CC\u200C\u0647\u0627\u06CC \u0628\u0631\u0646\u062F (\u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647)", tr: "marka \xF6zellikleri (onayl\u0131 bilgiler)" },
  approved: { en: "approved", fa: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", tr: "onayl\u0131" },
  missing_fact: { en: "not approved yet", fa: "\u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647", tr: "hen\xFCz onaylanmad\u0131" },
  min_size_unset: { en: "Minimum size: not set until a master exists and is measured.", fa: "\u062D\u062F\u0627\u0642\u0644 \u0627\u0646\u062F\u0627\u0632\u0647: \u062A\u0627 \u0648\u062C\u0648\u062F \u0648 \u0633\u0646\u062C\u0634 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.", tr: "En k\xFC\xE7\xFCk boyut: ana dosya olup \xF6l\xE7\xFClene kadar belirlenmez." },
  min_size_fact: { en: "Minimum size: see approved fact {field}.", fa: "\u062D\u062F\u0627\u0642\u0644 \u0627\u0646\u062F\u0627\u0632\u0647: \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 {field} \u0631\u0627 \u0628\u0628\u06CC\u0646\u06CC\u062F.", tr: "En k\xFC\xE7\xFCk boyut: onayl\u0131 bilgi {field}." },
  to_confirm: { en: "Uses not answered yet; confirm which apply:", fa: "\u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627 \u0647\u0646\u0648\u0632 \u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0647 \u0646\u0634\u062F\u0647\u200C\u0627\u0646\u062F\u061B \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F \u06A9\u062F\u0627\u0645\u200C\u0647\u0627 \u0635\u062F\u0642 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F:", tr: "Kullan\u0131mlar hen\xFCz yan\u0131tlanmad\u0131; hangilerinin ge\xE7erli oldu\u011Funu onaylay\u0131n:" },
  selection: { en: "Selected for this project (not an approved mark): {field}", fa: "\u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u067E\u0631\u0648\u0698\u0647 (\u0646\u0634\u0627\u0646 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A): {field}", tr: "Bu proje i\xE7in se\xE7ildi (onayl\u0131 i\u015Faret de\u011Fil): {field}" },
  review_state: { en: "Owner review: {field}", fa: "\u0628\u0631\u0631\u0633\u06CC \u0645\u0627\u0644\u06A9: {field}", tr: "Sahip incelemesi: {field}" },
  reviewer: { en: "Reviewer fact", fa: "\u0648\u0627\u0642\u0639\u06CC\u062A \u0628\u0627\u0632\u0628\u06CC\u0646", tr: "\u0130nceleyen bilgisi" },
  open_concerns: { en: "Open concerns", fa: "\u0646\u06AF\u0631\u0627\u0646\u06CC\u200C\u0647\u0627\u06CC \u0628\u0627\u0632", tr: "A\xE7\u0131k konular" },
  next_revision: { en: "Next revision", fa: "\u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0628\u0639\u062F\u06CC", tr: "Sonraki revizyon" },
  sources: { en: "Source revisions", fa: "\u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u0645\u0646\u0627\u0628\u0639", tr: "Kaynak s\xFCr\xFCmleri" }
};

// packages/brand-core/src/identity/brief.ts
import fs from "node:fs";
import path2 from "node:path";
var BRIEF_SCHEMA = "brand-os.identity-brief/1";
var BRIEF_FACTS = {
  problem: ["brand.strategy.purpose", "brand.strategy.promise", "brand.strategy.differentiation"],
  canonical: ["business.customer.primary_segment", "business.market.geography", "brand.personality.traits", "brand.strategy.differentiation", "brand.strategy.values"],
  assets: ["brand.logo.masters", "brand.logo.variants", "brand.logo.min_size", "brand.logo.clear_space", "brand.color.roles", "brand.type.intent", "brand.verbal.tagline", "brand.verbal.voice", "brand.mascot.enabled"],
  attributes: ["brand.strategy.differentiation", "brand.personality.traits", "brand.strategy.values"]
};
var COMPONENT_FACT = {
  logo_symbol: "brand.logo.masters",
  logo_wordmark: "brand.logo.variants",
  colors: "brand.color.roles",
  typography: "brand.type.intent",
  mascot: "brand.mascot.enabled",
  tone: "brand.verbal.voice",
  tagline: "brand.verbal.tagline"
};
var USE_CHECKS = {
  app_icon: ["square_crop", "smallest_size", "dark_light"],
  favicon: ["smallest_size", "one_color"],
  website_header: ["horizontal_lockup", "dark_light"],
  social_avatar: ["circle_crop", "smallest_size"],
  print: ["one_color", "print_color"],
  packaging: ["print_color", "one_color"],
  signage: ["distance", "one_color"],
  motion: ["motion_states"],
  merchandise: ["simplified", "one_color"],
  email: ["raster_fallback", "dark_light"]
};
var SIGNAL_CRITERIA = {
  small_size_recognition: ["legibility", "distinctiveness"],
  channel_consistency: ["versatility"],
  fits_positioning: ["strategic_fit", "meaningfulness"],
  easier_production: ["feasibility", "versatility"],
  all_scripts: ["legibility"],
  customer_feedback: ["strategic_fit"],
  owner_satisfaction: ["meaningfulness"]
};
function cite(facts, ids) {
  return ids.map((id) => {
    const fact = facts[id];
    const approved = Boolean(fact && fact.status === "approved" && fact.revision_hash);
    return { fact_id: id, state: approved ? "approved" : "missing", revision: approved ? fact.revision_hash : null };
  });
}
function ref(note) {
  return note ? knowledgeRef(note.id, note.revision) : null;
}
function mascotEnabled(ws) {
  try {
    const file2 = path2.join(ws.root, "brand", "brand.config.yaml");
    const config = fs.existsSync(file2) ? readYaml(file2) : null;
    return config?.modules?.mascot?.enabled === true;
  } catch {
    return false;
  }
}
function logoManifest(ws) {
  try {
    const file2 = path2.join(ws.root, "brand", "assets", "asset-manifest.yaml");
    if (!fs.existsSync(file2)) return [];
    const doc = readYaml(file2);
    return (doc.assets ?? []).filter((a) => Array.isArray(a.tags) && a.tags.includes("logo") && typeof a.id === "string").map((a) => ({
      id: a.id,
      status: typeof a.status === "string" ? a.status : "unknown",
      example: Array.isArray(a.tags) && a.tags.includes("example") || /example/i.test(String(a.id)) || /EXAMPLE/.test(String(a.license ?? ""))
    }));
  } catch {
    return [];
  }
}
function resolvePath(answers, memo) {
  const owner = single(answers["identity.path"]);
  if (owner && owner !== "unknown" && owner !== "undecided") return { value: owner, source: "owner_confirmed", intake: memo.intake };
  if (owner === "undecided") return { value: "undecided", source: "owner_confirmed", intake: memo.intake };
  const hint = memo.intake.choice.identity_intent;
  if (memo.intake.state === "recorded" && hint !== "undecided") return { value: hint, source: "intake_hint_unconfirmed", intake: memo.intake };
  return { value: null, source: "none", intake: memo.intake };
}
function buildIdentityBrief(ws, opts) {
  assertOwnerProcess();
  const memo = buildCompetitiveMemo(ws, "identity", opts);
  if (memo.kind !== "visual_landscape_assessment") throw new Error("identity projection expected");
  const lang2 = memo.lang;
  const t = (catalog, code, vars = {}) => fillText(catalog[code][lang2], vars);
  const label = (c) => COMPONENT_LABELS[c][lang2];
  const audit = readAudit(ws);
  const answers = answersOf(audit);
  const state = diagnosisState(answers);
  const facts = readFacts(ws.root, "approved", ws.brandSlug);
  const pathInfo = resolvePath(answers, memo);
  const effective = pathInfo.value;
  const mascot = mascotEnabled(ws);
  const assetFacts = cite(facts, BRIEF_FACTS.assets);
  const approvedMaster = assetFacts.find((f) => f.fact_id === "brand.logo.masters").state === "approved";
  const logoHint = memo.intake.choice.logo_presence === "present";
  const creating = effective === "create" || !approvedMaster && !logoHint && effective !== "retain" && effective !== "evolve" && effective !== "rebrand";
  const mustNot = list(answers["identity.must_not_change"]);
  const rows = [];
  if (!creating) {
    for (const component of EQUITY_COMPONENTS) {
      const entry = audit.equity[component];
      if (!entry && component === "mascot" && !mascot) continue;
      if (!entry && component === "other") continue;
      const preserveAnswer = mustNot.includes(component);
      const choice = entry ? entry.choice : preserveAnswer ? "preserve" : "unknown";
      const evidence = entry ? entry.evidence : preserveAnswer ? "owner_reported" : "unknown";
      const backing = COMPONENT_FACT[component];
      rows.push({
        component,
        label: label(component),
        choice,
        source: entry ? "equity_record" : preserveAnswer ? "must_not_change_answer" : "not_recorded",
        evidence,
        evidence_level: evidence === "measured_study" && entry?.study ? "measured" : evidence === "owner_reported" ? "owner_reported_preference" : "unknown",
        owner_reason: ref(entry?.note ?? null),
        study: ref(entry?.study ?? null),
        backing_fact: backing ? cite(facts, [backing])[0] : null,
        conflict: preserveAnswer && (choice === "refine" || choice === "replace")
      });
    }
  }
  const preserved = rows.filter((r) => r.choice === "preserve").map((r) => r.component);
  const changing = rows.filter((r) => r.choice === "refine" || r.choice === "replace").map((r) => r.component);
  const unknownRows = rows.filter((r) => r.choice === "unknown" || r.choice === "evaluate" || r.evidence === "unknown").map((r) => r.component);
  const listText = (items) => items.map(label).join(", ");
  const reasons = list(answers["identity.change.reasons"]);
  const observed = single(answers["identity.change.observed"]);
  const observedValue = observed && observed !== "unknown" ? observed : null;
  const success = list(answers["identity.success"]);
  let conclusion;
  if (creating) conclusion = "create_first_identity";
  else if (effective === null || effective === "undecided") conclusion = "owner_decision_required";
  else if (effective === "retain") conclusion = "retain_improve_usage";
  else if (!changing.length && observedValue !== "observed_problem" && observedValue !== "both") conclusion = "retain_improve_usage";
  else conclusion = "change_requested";
  const rollout = list(answers["identity.rollout.constraints"]);
  const migration = [];
  if (!creating) migration.push({ code: "approved_assets_canonical", text: t(RISKS, "approved_assets_canonical") });
  for (const item of rollout) if (RISKS[`rollout_${item}`]) migration.push({ code: `rollout_${item}`, text: t(RISKS, `rollout_${item}`) });
  for (const component of changing) {
    const row = rows.find((r) => r.component === component);
    if (row.evidence_level !== "measured") migration.push({ code: "possible_recognition_loss", text: t(RISKS, "possible_recognition_loss", { component: label(component) }) });
  }
  if (changing.includes("name")) migration.push({ code: "name_change_legal_and_migration", text: t(RISKS, "name_change_legal_and_migration") });
  for (const row of rows.filter((r) => r.conflict)) migration.push({ code: "preserve_conflict", text: t(RISKS, "preserve_conflict", { component: row.label, choice: row.choice }) });
  const attributes = cite(facts, BRIEF_FACTS.attributes);
  const visualIds = memo.observations.filter((o) => o.dimension === "visual_language").map((o) => o.observation_id);
  const baseForbidden = ["no_tracing", "no_fake_files", "no_trademark_claim"].map((code) => ({ code, text: t(RED_LINES, code) }));
  const withPreserved = (forbidden) => preserved.length ? [...forbidden, { code: "keep_preserved", text: t(RED_LINES, "keep_preserved", { list: listText(preserved) }) }] : forbidden;
  const allCriteria = Object.keys(RUBRIC);
  const route = (id, risks, extra = {}) => ({
    id,
    title: ROUTES[id].title[lang2],
    why: ROUTES[id].why[lang2],
    why_not: ROUTES[id].why_not[lang2],
    risks: risks.map((code) => ({ code, text: t(RISKS, code, extra.riskVars?.[code] ?? {}) })),
    preserves: extra.preserves ?? [],
    may_change: extra.may_change ?? [],
    attributes,
    forbidden: extra.forbidden ?? baseForbidden,
    rubric: allCriteria,
    status: "hypothesis",
    cites: visualIds
  });
  const routes = [];
  if (creating) {
    routes.push(route("wordmark_led", ["similarity_unchecked"]));
    routes.push(route("symbol_and_wordmark", ["small_size_detail", "similarity_unchecked"]));
    routes.push(mascot ? route("character_mark", ["small_size_detail", "similarity_unchecked"]) : route("monogram_icon", ["similarity_unchecked"]));
  } else {
    const all = rows.map((r) => r.component);
    const rolloutRisks = rollout.filter((item) => RISKS[`rollout_${item}`]).map((item) => `rollout_${item}`);
    const retainRisks = observedValue === "observed_problem" || observedValue === "both" ? ["problem_persists"] : [];
    const evolveRisks = ["too_subtle", ...rolloutRisks];
    const rebrandRisks = ["recognition_reset", ...rolloutRisks, ...preserved.length ? ["conflicts_with_preserve"] : [], ...preserved.includes("name") ? [] : ["name_change_legal_and_migration"], "similarity_unchecked"];
    const retain = route("retain_improve_usage", retainRisks, { preserves: all, may_change: [], forbidden: withPreserved(baseForbidden) });
    const evolve = route("evolve_preserve_equity", evolveRisks, { preserves: preserved, may_change: changing.length ? changing : all.filter((c) => !preserved.includes(c)), forbidden: withPreserved(baseForbidden) });
    const rebrand = route("full_rebrand", rebrandRisks, { preserves: [], may_change: all, riskVars: { conflicts_with_preserve: { list: listText(preserved) } } });
    if (effective === "rebrand") routes.push(rebrand, evolve, retain);
    else if (effective === "evolve") routes.push(evolve, retain, rebrand);
    else routes.push(retain, evolve, rebrand);
  }
  const usesAnswer = answers["identity.applications"];
  const answeredUses = usesAnswer !== void 0 && usesAnswer !== "unknown";
  const uses = answeredUses ? list(usesAnswer) : [...APPLICATIONS];
  const applications = uses.map((use) => ({
    use,
    label: USE_LABELS[use][lang2],
    checks: USE_CHECKS[use].map((code) => ({ code, text: t(APPLICATION_CHECKS, code, { use: USE_LABELS[use][lang2] }) }))
  }));
  const scripts = list(answers["identity.scripts"]);
  const minSize = assetFacts.find((f) => f.fact_id === "brand.logo.min_size");
  const production = [
    { code: "contrast", text: t(APPLICATION_CHECKS, "contrast") },
    { code: "one_color", text: t(APPLICATION_CHECKS, "one_color", { use: COMPONENT_LABELS.logo_symbol[lang2] }) },
    ...scripts.includes("perso_arabic") ? [{ code: "rtl_lockup", text: t(APPLICATION_CHECKS, "rtl_lockup") }] : [],
    minSize.state === "approved" && approvedMaster ? { code: "min_size_fact", text: fillText(BRIEF_HEADINGS.min_size_fact[lang2], { field: minSize.fact_id }) } : { code: "min_size_unset", text: BRIEF_HEADINGS.min_size_unset[lang2] },
    { code: "formats", text: t(APPLICATION_CHECKS, "formats") }
  ];
  let iteration = { state: "not_linked", project_id: null, variants: [], selection: null };
  if (audit.creative_project_id) {
    try {
      const project = loadProject(ws, audit.creative_project_id);
      iteration = {
        state: "linked",
        project_id: project.project_id,
        variants: project.variants.map((v) => ({
          variant_id: v.variant_id,
          status: v.status,
          describe: v.describe,
          asset: v.asset.state,
          reasons: project.feedback.filter((f) => f.variant_id === v.variant_id).map((f) => ({ verdict: f.verdict, keep: f.keep, avoid: f.avoid, provenance: knowledgeRef(f.note.id, f.note.revision), source_state: sourceStatus(ws, f.note).state }))
        })),
        selection: project.selection ? { variant_id: project.selection.variant_id, meaning: "owner_selected_for_this_project", approved_mark: false } : null
      };
    } catch (error) {
      if (!(error instanceof CreativeError)) throw error;
      iteration = { state: "missing", project_id: audit.creative_project_id, variants: [], selection: null };
    }
  }
  const missing = [];
  if (pathInfo.source !== "owner_confirmed") missing.push({ code: "path_unconfirmed", text: t(MISSING, "path_unconfirmed") });
  if (state.pending.length) missing.push({ code: "diagnosis_pending", text: t(MISSING, "diagnosis_pending", { list: state.pending.join(", ") }) });
  const citedFacts = /* @__PURE__ */ new Map();
  for (const f of [...cite(facts, BRIEF_FACTS.problem), ...cite(facts, BRIEF_FACTS.canonical), ...assetFacts]) citedFacts.set(f.fact_id, f);
  for (const f of citedFacts.values()) if (f.state === "missing") missing.push({ code: "fact_missing", text: t(MISSING, "fact_missing", { field: f.fact_id }) });
  if (!approvedMaster) missing.push({ code: "no_master", text: t(MISSING, "no_master") });
  if (memo.visual_comparison === "unavailable") missing.push({ code: "visual_unavailable", text: t(MISSING, "visual_unavailable") });
  if (iteration.state !== "linked") missing.push({ code: "no_creative_project", text: t(MISSING, "no_creative_project") });
  missing.push({ code: "legal_review", text: t(MISSING, "legal_review") });
  if (unknownRows.length) missing.push({ code: "equity_unknown", text: t(MISSING, "equity_unknown", { list: listText(unknownRows) }) });
  let next;
  if (pathInfo.source !== "owner_confirmed") next = t(NEXT_STEP, "confirm_path");
  else if (state.next) next = t(NEXT_STEP, "answer_diagnosis", { field: state.next.id });
  else if (memo.visual_comparison === "unavailable") next = t(NEXT_STEP, "record_visuals");
  else if (!iteration.selection) next = t(NEXT_STEP, "concept_round");
  else next = t(NEXT_STEP, "approve_artwork");
  const sourceRevisions = [
    ...[...citedFacts.values()].filter((f) => f.revision).map((f) => `fact:${f.fact_id}@${f.revision}`),
    ...Object.values(audit.answers).flatMap((a) => a.note ? [knowledgeRef(a.note.id, a.note.revision)] : []),
    ...Object.values(audit.equity).flatMap((e) => [e?.note, e?.study].flatMap((n) => n ? [knowledgeRef(n.id, n.revision)] : [])),
    ...memo.source_refs,
    ...iteration.variants.flatMap((v) => v.reasons.map((r) => r.provenance))
  ];
  const source_revisions = [...new Set(sourceRevisions)].sort();
  const sources_digest = sha256Hex(canonicalJson({ source_revisions, audit_answers: answers, equity: rows.map((r) => [r.component, r.choice, r.evidence]), landscape: memo.context.source_digest, creative: iteration }));
  const openConcerns = [
    ...rows.filter((r) => r.conflict).map((r) => ({ code: "preserve_conflict", text: t(RISKS, "preserve_conflict", { component: r.label, choice: r.choice }) })),
    ...unknownRows.map((c) => ({ code: "needs_research", text: t(RISKS, "needs_research", { component: label(c) }) }))
  ];
  const brief2 = {
    schema: BRIEF_SCHEMA,
    kind: "identity_brief",
    status: "draft",
    brand_slug: ws.brandSlug,
    lang: lang2,
    generated_at: memo.generated_at,
    path: pathInfo,
    conclusion: { code: conclusion, text: t(CONCLUSIONS, conclusion) },
    diagnosis: {
      complete: state.complete,
      answered: state.answered,
      unknown: state.unknown,
      pending: state.pending,
      next: state.next?.id ?? null,
      answers: Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, { value, owner_words: ref(audit.answers[id]?.note ?? null) }]))
    },
    problem: { reasons, observed: observedValue, success, facts: cite(facts, BRIEF_FACTS.problem) },
    canonical: cite(facts, BRIEF_FACTS.canonical),
    assets: { approved_master: approvedMaster, logo_present_hint: logoHint, facts: assetFacts, manifest: logoManifest(ws) },
    equity: { applicable: !creating, rows },
    migration_risks: migration,
    landscape: {
      projection: "identity",
      context_state: memo.context.state,
      source_digest: memo.context.source_digest,
      visual_comparison: memo.visual_comparison,
      similarity: "not_assessed",
      competitors: [.../* @__PURE__ */ new Set([...memo.observations.map((o) => o.competitor_name), ...memo.unresolved.map((u) => u.competitor_name)])].sort(),
      observations: memo.observations.filter((o) => o.dimension === "visual_language").map((o) => ({ competitor: o.competitor_name, label: o.label, ref: o.ref, cell: o.cell })),
      unresolved: memo.unresolved.filter((u) => u.dimension === "visual_language").map((u) => ({ competitor: u.competitor_name, ref: u.ref, ref_state: u.ref_state })),
      warnings: memo.warnings.map((w) => ({ code: w.code, text: w.text })),
      gaps: memo.gaps.filter((g) => g.dimension === "visual_language" || g.dimension === null).map((g) => g.text)
    },
    routes,
    applications: { answered: answeredUses, uses: applications, scripts },
    production,
    red_lines: ["no_tracing", "inspiration_rights", "no_fake_files", "no_trademark_claim"].map((code) => ({ code, text: t(RED_LINES, code) })).concat(preserved.length ? [{ code: "keep_preserved", text: t(RED_LINES, "keep_preserved", { list: listText(preserved) }) }] : []),
    rubric: {
      criteria: allCriteria.map((id) => ({ id, text: t(RUBRIC, id), emphasized_by: success.filter((s) => SIGNAL_CRITERIA[s]?.includes(id)) })),
      weights: null
    },
    iteration,
    decision: {
      reviewer: "owner",
      selected_concept: iteration.selection ? `${iteration.project_id}/${iteration.selection.variant_id}` : null,
      open_concerns: openConcerns,
      next_revision: next,
      last_review: null,
      source_revisions
    },
    handoff: ["select", "register", "approve", "specify", "legal", "canonical"].map((code) => ({ code, text: t(HANDOFF, code) })),
    missing,
    not_known: memo.not_known,
    prohibited_inferences: memo.prohibited_inferences,
    sources_digest,
    brief_digest: "",
    authorizes: []
  };
  brief2.brief_digest = briefDigest(brief2);
  const last = audit.reviews.at(-1);
  if (last) brief2.decision.last_review = { reviewed_at: last.reviewed_at, changed_since: last.sources_digest !== sources_digest || last.brief_digest !== brief2.brief_digest };
  return brief2;
}
function briefDigest(brief2) {
  const { generated_at: _g, brief_digest: _b, decision, ...rest2 } = brief2;
  const { last_review: _l, ...decisionRest } = decision;
  return sha256Hex(canonicalJson({ ...rest2, decision: decisionRest }));
}

// packages/brand-core/src/identity/render.ts
function renderBrief(brief2) {
  const lang2 = brief2.lang;
  const h = (key, vars = {}) => BRIEF_HEADINGS[key][lang2].replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  const fact = (f) => `\`${f.fact_id}\`: ${f.state === "approved" ? `${h("approved")} @${f.revision.slice(0, 12)}` : h("missing_fact")}`;
  const lines = [`# ${h("title")} \u2014 ${brief2.brand_slug}`, "", `> ${h("preamble")}`, ""];
  lines.push(`- ${h("status")}: \`${brief2.status}\` \xB7 ${brief2.schema} \xB7 ${brief2.generated_at}`);
  lines.push(`- ${h("path")}: \`${brief2.path.value ?? "unknown"}\` (${PATH_SOURCE[brief2.path.source][lang2]}); intake: logo \`${brief2.path.intake.choice.logo_presence}\`, intent \`${brief2.path.intake.choice.identity_intent}\``);
  lines.push(`- ${h("review_state", { field: brief2.decision.last_review ? `${brief2.decision.last_review.reviewed_at}${brief2.decision.last_review.changed_since ? " (changed since)" : ""}` : "\u2014" })}`);
  lines.push(`- brief_digest \`${brief2.brief_digest.slice(0, 12)}\` \xB7 sources_digest \`${brief2.sources_digest.slice(0, 12)}\` \xB7 authorizes: []`, "");
  lines.push(`## ${h("conclusion")}`, "", brief2.conclusion.text, "");
  lines.push(`## ${h("problem")}`, "");
  lines.push(`- identity.change.reasons: ${brief2.problem.reasons.join(", ") || "\u2014"}`);
  lines.push(`- identity.change.observed: ${brief2.problem.observed ?? "\u2014"}`);
  lines.push(`- identity.success: ${brief2.problem.success.join(", ") || "\u2014"}`);
  for (const f of brief2.problem.facts) lines.push(`- ${fact(f)}`);
  lines.push("");
  lines.push(`## ${h("canonical")}`, "", ...brief2.canonical.map((f) => `- ${fact(f)}`), "");
  lines.push(`## ${h("assets")}`, "");
  for (const f of brief2.assets.facts) lines.push(`- ${fact(f)}`);
  for (const a of brief2.assets.manifest) lines.push(`- manifest \`${a.id}\`: ${a.status}${a.example ? " (EXAMPLE, not a mark)" : ""}`);
  lines.push("");
  lines.push(`## ${h("equity")}`, "");
  if (!brief2.equity.applicable) lines.push("\u2014", "");
  else {
    lines.push("| element | choice | evidence | source | owner reason | study |", "| --- | --- | --- | --- | --- | --- |");
    for (const r of brief2.equity.rows) lines.push(`| ${r.label} | ${r.choice}${r.conflict ? " \u26A0" : ""} | ${r.evidence_level} | ${r.source} | ${r.owner_reason ?? "\u2014"} | ${r.study ?? "\u2014"} |`);
    lines.push("");
  }
  if (brief2.migration_risks.length) lines.push(`## ${h("migration")}`, "", ...brief2.migration_risks.map((r) => `- ${r.text}`), "");
  lines.push(`## ${h("landscape")}`, "", `- context: \`${brief2.landscape.context_state}\` \xB7 visual comparison: \`${brief2.landscape.visual_comparison}\` \xB7 similarity: \`${brief2.landscape.similarity}\` \xB7 digest \`${brief2.landscape.source_digest.slice(0, 12)}\``);
  for (const o of brief2.landscape.observations) lines.push(`- ${o.competitor}: ${o.label} \u2014 ${o.cell} ${o.ref}`);
  for (const u of brief2.landscape.unresolved) lines.push(`- ${u.competitor}: ${u.ref_state} ${u.ref}`);
  for (const w of brief2.landscape.warnings) lines.push(`- ! ${w.text}`);
  for (const g of brief2.landscape.gaps) lines.push(`- ${g}`);
  lines.push("");
  lines.push(`## ${h("routes")}`, "");
  for (const r of brief2.routes) {
    lines.push(`### [${r.id}] ${r.title}`, "", `- ${h("why")}: ${r.why}`, `- ${h("why_not")}: ${r.why_not}`);
    if (r.risks.length) lines.push(`- ${h("risks")}:`, ...r.risks.map((x) => `  - ${x.text}`));
    if (r.preserves.length) lines.push(`- ${h("preserves")}: ${r.preserves.join(", ")}`);
    if (r.may_change.length) lines.push(`- ${h("changes")}: ${r.may_change.join(", ")}`);
    lines.push(`- ${h("attributes")}: ${r.attributes.map((f) => `${f.fact_id} (${f.state})`).join(", ")}`);
    lines.push(`- ${h("red_lines")}:`, ...r.forbidden.map((x) => `  - ${x.text}`), `- rubric: ${r.rubric.join(", ")}`, "");
  }
  lines.push(`## ${h("applications")}`, "");
  if (!brief2.applications.answered) lines.push(h("to_confirm"));
  for (const u of brief2.applications.uses) lines.push(`- **${u.label}**`, ...u.checks.map((c) => `  - ${c.text}`));
  lines.push("");
  lines.push(`## ${h("production")}`, "", ...brief2.production.map((p) => `- ${p.text}`), "");
  lines.push(`## ${h("red_lines")}`, "", ...brief2.red_lines.map((r) => `- ${r.text}`), "");
  lines.push(`## ${h("rubric")}`, "", ...brief2.rubric.criteria.map((c) => `- ${c.text}${c.emphasized_by.length ? ` (${c.emphasized_by.join(", ")})` : ""}`), "");
  lines.push(`## ${h("iteration")}`, "");
  if (brief2.iteration.state !== "linked") lines.push(`- ${brief2.iteration.state}${brief2.iteration.project_id ? ` (${brief2.iteration.project_id})` : ""}`);
  for (const v of brief2.iteration.variants) {
    lines.push(`- ${v.variant_id}: ${v.status}${v.describe ? ` \u2014 ${v.describe}` : ""} (asset ${v.asset})`);
    for (const r of v.reasons) lines.push(`  - ${r.verdict}${r.keep.length ? ` keep ${r.keep.join("/")}` : ""}${r.avoid.length ? ` avoid ${r.avoid.join("/")}` : ""} ${r.provenance} (${r.source_state})`);
  }
  if (brief2.iteration.selection) lines.push(`- ${h("selection", { field: `${brief2.iteration.project_id}/${brief2.iteration.selection.variant_id}` })}`);
  lines.push("");
  lines.push(`## ${h("decision")}`, "", `- reviewer: ${brief2.decision.reviewer}`, `- selected: ${brief2.decision.selected_concept ?? "\u2014"}`);
  if (brief2.decision.open_concerns.length) lines.push(`- ${h("open_concerns")}:`, ...brief2.decision.open_concerns.map((c) => `  - ${c.text}`));
  lines.push(`- ${h("next_revision")}: ${brief2.decision.next_revision}`, `- ${h("sources")}:`, ...brief2.decision.source_revisions.map((s) => `  - ${s}`), "");
  lines.push(`## ${h("handoff")}`, "", ...brief2.handoff.map((x, i) => `${i + 1}. ${x.text}`), "");
  lines.push(`## ${h("missing")}`, "", ...brief2.missing.map((m) => `- ${m.text}`), "");
  lines.push(`## ${h("not_known")}`, "", ...brief2.not_known.map((n) => `- ${n.text}`), "");
  lines.push(`## ${h("never")}`, "", ...brief2.prohibited_inferences.map((p) => `- ${p.text}`), "");
  return lines.join("\n");
}

// scripts/identity.ts
var HELP = `brand:identity <command> [options]

  next [--lang en|fa|tr]                       the next diagnosis question for the confirmed path
  answer --question <id> --value <choice[,choice]|unknown> [--words "<your words>"] [--lang \u2026]
                                               record one answer; words become a local Knowledge note
  equity --component <name|logo_symbol|logo_wordmark|colors|typography|mascot|tone|tagline|imagery|other>
         --choice preserve|refine|replace|evaluate|unknown [--evidence measured_study|owner_reported|unknown]
         [--study-note kn_\u2026] [--words "<why>"]
                                               one row of the equity preservation matrix; measured_study
                                               needs a cited study note
  link-creative --project <id>                 the Creative Learning project (surface logo) for concept rounds
  brief [--lang en|fa|tr] [--market TR]        print the draft brief (Markdown; JSON with --json); writes nothing
  reviewed [--lang \u2026] [--market \u2026]             record that you read the current brief (approves nothing)

The brief authorizes nothing (authorizes: []). Logo, name, color or type changes still go through
brand:propose or brand:knowledge propose, then brand:review and brand:approve; real artwork through
brand/assets/asset-manifest.yaml. Add --json for machine-readable output. Refused while ${AGENT_TOKEN_ENV} is set.`;
var [command, ...rest] = process.argv.slice(2);
var OPTIONS = {
  json: { type: "boolean", default: false },
  lang: { type: "string" },
  market: { type: "string" },
  question: { type: "string" },
  value: { type: "string" },
  words: { type: "string" },
  component: { type: "string" },
  choice: { type: "string" },
  evidence: { type: "string" },
  "study-note": { type: "string" },
  project: { type: "string" }
};
function usage(message) {
  console.error(`${message}

${HELP}`);
  process.exit(2);
}
function need(values2, key) {
  const value = values2[key];
  if (typeof value !== "string" || !value) usage(`--${key} is required.`);
  return value;
}
function print(values2, data, text) {
  console.log(values2.json ? JSON.stringify(data, null, 2) : text());
}
function lang(values2) {
  return IDENTITY_LANGS.includes(values2.lang ?? "") ? values2.lang : "en";
}
function brief(ws, values2) {
  return buildIdentityBrief(ws, { capability: selectAdapter({}).capability(ws.now()), lang: asLang(values2.lang), market: values2.market ?? null });
}
function run(ws, values2) {
  switch (command) {
    case "next": {
      const state = diagnosisState(answersOf(readAudit(ws)));
      const l = lang(values2);
      print(
        values2,
        { ok: true, state },
        () => state.next ? [`${state.next.id} (${state.next.stage})`, state.next.prompt[l], `  ${state.next.why_asked}`, `  choices: ${[...state.next.choices, UNKNOWN].join(", ")}${state.next.multi ? " (several, comma-separated)" : ""}`].join("\n") : state.complete ? `The diagnosis is complete for the ${state.path} path. Print the brief with: brand:identity brief` : "Confirm the identity path first: brand:identity answer --question identity.path --value \u2026"
      );
      return;
    }
    case "answer": {
      const out = recordAnswer(ws, { question_id: need(values2, "question"), value: need(values2, "value"), words: values2.words, language: values2.lang ?? null });
      print(values2, { ok: true, ...out }, () => `Recorded ${need(values2, "question")} = ${[out.entry.value].flat().join(", ")}${out.changed_from !== null ? ` (was ${[out.changed_from].flat().join(", ")})` : ""}${out.entry.note ? `; your words: knowledge:${out.entry.note.id}@${out.entry.note.revision}` : ""}. This is a draft answer, not a brand fact.`);
      return;
    }
    case "equity": {
      const entry = setEquity(ws, { component: need(values2, "component"), choice: need(values2, "choice"), evidence: values2.evidence, study_note: values2["study-note"], words: values2.words, language: values2.lang ?? null });
      print(values2, { ok: true, entry }, () => `${need(values2, "component")}: ${entry.choice} (evidence ${entry.evidence}${entry.study ? `, study knowledge:${entry.study.id}@${entry.study.revision}` : ""}). Nothing about the current identity changed.`);
      return;
    }
    case "link-creative": {
      const record = linkCreativeProject(ws, need(values2, "project"));
      print(values2, { ok: true, creative_project_id: record.creative_project_id }, () => `Linked Creative Learning project ${record.creative_project_id}. Concept feedback stays there; selection is not an approved mark.`);
      return;
    }
    case "brief": {
      const out = brief(ws, values2);
      print(values2, { ok: true, brief: out }, () => renderBrief(out));
      return;
    }
    case "reviewed": {
      const out = brief(ws, values2);
      const mark = markReviewed(ws, { brief_digest: out.brief_digest, sources_digest: out.sources_digest });
      print(values2, { ok: true, mark }, () => `Recorded that you read brief ${mark.brief_digest.slice(0, 12)} at ${mark.reviewed_at}. This approves nothing.`);
      return;
    }
    default:
      usage(command ? `Unknown command ${command}.` : "No command given.");
  }
}
if (!command || command === "help" || command === "--help") {
  console.log(HELP);
  process.exit(command ? 0 : 2);
}
var values;
try {
  values = parseArgs({ args: rest, options: OPTIONS, allowPositionals: false, strict: true }).values;
} catch (error) {
  usage(error.message);
}
try {
  run(openWorkspace(process.cwd()), values);
} catch (error) {
  if (error instanceof IdentityError || error instanceof KnowledgeError || error instanceof CompetitiveError || error instanceof CreativeError || error instanceof ResearchError) {
    if (values.json) console.log(JSON.stringify({ ok: false, error: { code: error.code, message: error.message } }, null, 2));
    else console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  console.error(`Unexpected error (${error?.name ?? "Error"}). Nothing about the brand was changed.`);
  process.exit(1);
}
