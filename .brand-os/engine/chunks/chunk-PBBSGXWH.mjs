import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  canonicalJson,
  sha256Hex
} from "./chunk-HOCT4QOE.mjs";

// packages/brand-core/src/assurance/i18n.ts
var ASSURANCE_LANGS = ["en", "fa", "tr"];
function assuranceLang(value, fallback = "en") {
  return typeof value === "string" && ASSURANCE_LANGS.includes(value) ? value : fallback;
}
function fill(text, vars = {}) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] === void 0 ? `{${key}}` : String(vars[key]));
}
var STATUS_TEXT = {
  applicable_complete: { en: "Complete", fa: "\u06A9\u0627\u0645\u0644", tr: "Tamam" },
  applicable_partial: { en: "Partly recorded", fa: "\u0628\u062E\u0634\u06CC \u062B\u0628\u062A \u0634\u062F\u0647", tr: "K\u0131smen kay\u0131tl\u0131" },
  applicable_missing: { en: "Missing", fa: "\u062B\u0628\u062A \u0646\u0634\u062F\u0647", tr: "Eksik" },
  not_applicable: { en: "Does not apply", fa: "\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F", tr: "Ge\xE7erli de\u011Fil" },
  applicability_unknown: { en: "Unclear whether it applies", fa: "\u0645\u0639\u0644\u0648\u0645 \u0646\u06CC\u0633\u062A \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u062F\u0627\u0631\u062F \u06CC\u0627 \u0646\u0647", tr: "Ge\xE7erli olup olmad\u0131\u011F\u0131 belirsiz" },
  evidence_insufficient: { en: "Evidence not enough", fa: "\u0634\u0648\u0627\u0647\u062F \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A", tr: "Kan\u0131t yeterli de\u011Fil" },
  conflicted: { en: "Sources disagree", fa: "\u0645\u0646\u0627\u0628\u0639 \u0628\u0627 \u0647\u0645 \u0646\u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u0646\u062F", tr: "Kaynaklar \xE7eli\u015Fiyor" },
  needs_review: { en: "Needs review", fa: "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC", tr: "G\xF6zden ge\xE7irilmeli" },
  blocked_by_license: { en: "Blocked: no right to assess", fa: "\u0645\u0633\u062F\u0648\u062F: \u0627\u062C\u0627\u0632\u0647\u0654 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0646\u062F\u0627\u0631\u06CC\u0645", tr: "Engelli: de\u011Ferlendirme hakk\u0131 yok" },
  not_assessed: { en: "Not assessed", fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0646\u0634\u062F\u0647", tr: "De\u011Ferlendirilmedi" }
};
var REASON_TEXT = {
  license_blocked: {
    en: "We hold no right to assess against this method, so it is neither passed nor failed.",
    fa: "\u0627\u062C\u0627\u0632\u0647\u0654 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0628\u0631 \u0627\u0633\u0627\u0633 \u0627\u06CC\u0646 \u0645\u062A\u062F \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u0645\u061B \u067E\u0633 \u0646\u0647 \u0642\u0628\u0648\u0644 \u0627\u0633\u062A \u0648 \u0646\u0647 \u0631\u062F.",
    tr: "Bu y\xF6nteme g\xF6re de\u011Ferlendirme hakk\u0131m\u0131z yok; bu nedenle ne ge\xE7ti ne kald\u0131."
  },
  not_applicable_by_rule: {
    en: "The method\u2019s applicability rule rules this control out for this brand.",
    fa: "\u0642\u0627\u0639\u062F\u0647\u0654 \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0627\u06CC\u0646 \u0645\u062A\u062F\u060C \u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u0631\u0627 \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u06A9\u0646\u0627\u0631 \u0645\u06CC\u200C\u06AF\u0630\u0627\u0631\u062F.",
    tr: "Y\xF6ntemin ge\xE7erlilik kural\u0131 bu kontrol\xFC bu marka i\xE7in kapsam d\u0131\u015F\u0131 b\u0131rak\u0131yor."
  },
  applicability_unknown: {
    en: "Whether it applies depends on something nobody has answered yet.",
    fa: "\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u062F\u0627\u0634\u062A\u0646\u0634 \u0628\u0647 \u0686\u06CC\u0632\u06CC \u0628\u0633\u062A\u06AF\u06CC \u062F\u0627\u0631\u062F \u06A9\u0647 \u0647\u0646\u0648\u0632 \u06A9\u0633\u06CC \u067E\u0627\u0633\u062E\u0634 \u0646\u062F\u0627\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Ge\xE7erli olup olmad\u0131\u011F\u0131 hen\xFCz yan\u0131tlanmam\u0131\u015F bir \u015Feye ba\u011Fl\u0131."
  },
  no_input: {
    en: "Nothing was resolved for this control. Not assessed is not the same as failed.",
    fa: "\u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u0686\u06CC\u0632\u06CC \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F. \xAB\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC\u200C\u0646\u0634\u062F\u0647\xBB \u0628\u0627 \xAB\u0631\u062F\xBB \u06CC\u06A9\u06CC \u0646\u06CC\u0633\u062A.",
    tr: "Bu kontrol i\xE7in hi\xE7bir \u015Fey \xE7\xF6z\xFCmlenmedi. De\u011Ferlendirilmemi\u015F, ba\u015Far\u0131s\u0131z demek de\u011Fildir."
  },
  source_changed: {
    en: "A cited source changed after it was pinned, so the earlier verdict no longer stands.",
    fa: "\u0645\u0646\u0628\u0639\u06CC \u06A9\u0647 \u0627\u0631\u062C\u0627\u0639 \u062F\u0627\u062F\u0647 \u0634\u062F\u0647 \u0628\u0639\u062F \u0627\u0632 \u067E\u06CC\u0646\u200C\u0634\u062F\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A\u061B \u067E\u0633 \u062D\u06A9\u0645 \u0642\u0628\u0644\u06CC \u062F\u06CC\u06AF\u0631 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A.",
    tr: "At\u0131f yap\u0131lan bir kaynak sabitlendikten sonra de\u011Fi\u015Fti; bu nedenle \xF6nceki sonu\xE7 ge\xE7erli de\u011Fil."
  },
  source_missing: {
    en: "A required source is not there at all.",
    fa: "\u0645\u0646\u0628\u0639\u06CC \u06A9\u0647 \u0644\u0627\u0632\u0645 \u0628\u0648\u062F \u0627\u0635\u0644\u0627\u064B \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F.",
    tr: "Gerekli bir kaynak hi\xE7 yok."
  },
  fact_not_approved: {
    en: "The answer exists as a draft. A draft is not an approved fact.",
    fa: "\u067E\u0627\u0633\u062E \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0647\u0633\u062A. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u06CC\u0633\u062A.",
    tr: "Yan\u0131t taslak olarak var. Taslak, onayl\u0131 bir bilgi de\u011Fildir."
  },
  owner_said_unknown: {
    en: "The owner answered \u201Cunknown\u201D. That is an answer, and nothing was invented in its place.",
    fa: "\u0645\u0627\u0644\u06A9 \u067E\u0627\u0633\u062E \u062F\u0627\u062F\u0647 \xAB\u0646\u0645\u06CC\u200C\u062F\u0627\u0646\u0645\xBB. \u0627\u06CC\u0646 \u062E\u0648\u062F\u0634 \u06CC\u06A9 \u067E\u0627\u0633\u062E \u0627\u0633\u062A \u0648 \u0686\u06CC\u0632\u06CC \u0628\u0647 \u062C\u0627\u06CC\u0634 \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F.",
    tr: "Sahip \u201Cbilmiyorum\u201D dedi. Bu bir yan\u0131tt\u0131r ve yerine hi\xE7bir \u015Fey uydurulmad\u0131."
  },
  owner_said_not_applicable: {
    en: "The owner marked this not applicable.",
    fa: "\u0645\u0627\u0644\u06A9 \u0627\u06CC\u0646 \u0645\u0648\u0631\u062F \u0631\u0627 \u0628\u06CC\u200C\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0639\u0644\u0627\u0645\u062A \u0632\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Sahip bunu ge\xE7erli de\u011Fil olarak i\u015Faretledi."
  },
  withheld_for_audience: {
    en: "The inputs are restricted. The result is withheld from this audience and no value was read.",
    fa: "\u0648\u0631\u0648\u062F\u06CC\u200C\u0647\u0627 \u0645\u062D\u0631\u0645\u0627\u0646\u0647\u200C\u0627\u0646\u062F. \u0646\u062A\u06CC\u062C\u0647 \u0627\u0632 \u0627\u06CC\u0646 \u0645\u062E\u0627\u0637\u0628 \u062F\u0631\u06CC\u063A \u0634\u062F\u0647 \u0648 \u0647\u06CC\u0686 \u0645\u0642\u062F\u0627\u0631\u06CC \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F.",
    tr: "Girdiler k\u0131s\u0131tl\u0131. Sonu\xE7 bu kitleden sakland\u0131 ve hi\xE7bir de\u011Fer okunmad\u0131."
  },
  conflict_recorded: {
    en: "A recorded contradiction touches this control. Both sides are kept; nothing is averaged.",
    fa: "\u06CC\u06A9 \u062A\u0646\u0627\u0642\u0636 \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u0628\u0647 \u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u0645\u0631\u0628\u0648\u0637 \u0627\u0633\u062A. \u0647\u0631 \u062F\u0648 \u0637\u0631\u0641 \u0646\u06AF\u0647 \u062F\u0627\u0634\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F \u0648 \u0686\u06CC\u0632\u06CC \u0645\u06CC\u0627\u0646\u06AF\u06CC\u0646 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Kay\u0131tl\u0131 bir \xE7eli\u015Fki bu kontrolle ilgili. Her iki taraf da korunur; ortalama al\u0131nmaz."
  },
  reviewer_required: {
    en: "This control is a judgment. A person has to make it; the engine will not.",
    fa: "\u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u06CC\u06A9 \u062F\u0627\u0648\u0631\u06CC \u0627\u0633\u062A. \u06CC\u06A9 \u0627\u0646\u0633\u0627\u0646 \u0628\u0627\u06CC\u062F \u0622\u0646 \u0631\u0627 \u0627\u0646\u062C\u0627\u0645 \u062F\u0647\u062F\u061B \u0645\u0648\u062A\u0648\u0631 \u0627\u06CC\u0646 \u06A9\u0627\u0631 \u0631\u0627 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
    tr: "Bu kontrol bir yarg\u0131d\u0131r. Bunu bir insan yapmal\u0131; motor yapmaz."
  },
  reviewer_rationale_missing: {
    en: "A judgment without a written reason is not accepted.",
    fa: "\u062F\u0627\u0648\u0631\u06CC \u0628\u062F\u0648\u0646 \u062F\u0644\u06CC\u0644 \u0646\u0648\u0634\u062A\u0647\u200C\u0634\u062F\u0647 \u067E\u0630\u06CC\u0631\u0641\u062A\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    tr: "Yaz\u0131l\u0131 gerek\xE7esi olmayan bir yarg\u0131 kabul edilmez."
  },
  reviewer_role_invalid: {
    en: "The reviewer\u2019s role is not one that may judge a control.",
    fa: "\u0646\u0642\u0634 \u0628\u0627\u0632\u0628\u06CC\u0646 \u0627\u0632 \u0646\u0642\u0634\u200C\u0647\u0627\u06CC\u06CC \u0646\u06CC\u0633\u062A \u06A9\u0647 \u0627\u062C\u0627\u0632\u0647\u0654 \u062F\u0627\u0648\u0631\u06CC \u06CC\u06A9 \u06A9\u0646\u062A\u0631\u0644 \u0631\u0627 \u062F\u0627\u0631\u0646\u062F.",
    tr: "\u0130nceleyenin rol\xFC, bir kontrol\xFC yarg\u0131layabilecek roller aras\u0131nda de\u011Fil."
  },
  reviewer_status_invalid: {
    en: "A reviewer may not set this status; it belongs to the engine.",
    fa: "\u0628\u0627\u0632\u0628\u06CC\u0646 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u06CC\u0646 \u0648\u0636\u0639\u06CC\u062A \u0631\u0627 \u062A\u0639\u06CC\u06CC\u0646 \u06A9\u0646\u062F\u061B \u0627\u06CC\u0646 \u0648\u0636\u0639\u06CC\u062A \u0627\u0632 \u0622\u0646\u0650 \u0645\u0648\u062A\u0648\u0631 \u0627\u0633\u062A.",
    tr: "Bir inceleyen bu durumu atayamaz; bu durum motora aittir."
  },
  evidence_below_minimum: {
    en: "Fewer current research notes than the control needs.",
    fa: "\u062A\u0639\u062F\u0627\u062F \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u0645\u0639\u062A\u0628\u0631 \u06A9\u0645\u062A\u0631 \u0627\u0632 \u0686\u06CC\u0632\u06CC \u0627\u0633\u062A \u06A9\u0647 \u06A9\u0646\u062A\u0631\u0644 \u0644\u0627\u0632\u0645 \u062F\u0627\u0631\u062F.",
    tr: "Kontrol\xFCn ihtiya\xE7 duydu\u011Fundan daha az g\xFCncel ara\u015Ft\u0131rma notu var."
  },
  evidence_not_independent: {
    en: "The notes that exist are the owner\u2019s own statement, not independent evidence.",
    fa: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u0645\u0648\u062C\u0648\u062F \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9\u200C\u0627\u0646\u062F\u060C \u0646\u0647 \u0634\u0648\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644.",
    tr: "Mevcut notlar sahibin kendi beyan\u0131, ba\u011F\u0131ms\u0131z kan\u0131t de\u011Fil."
  },
  all_inputs_present: {
    en: "Every input this control asks for is present and current.",
    fa: "\u0647\u0645\u0647\u0654 \u0648\u0631\u0648\u062F\u06CC\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u06A9\u0646\u062A\u0631\u0644 \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F \u0645\u0648\u062C\u0648\u062F \u0648 \u0628\u0647\u200C\u0631\u0648\u0632 \u0627\u0633\u062A.",
    tr: "Bu kontrol\xFCn istedi\u011Fi t\xFCm girdiler mevcut ve g\xFCncel."
  }
};
var DOMAIN_TEXT = {
  audience: { en: "Audience", fa: "\u0645\u062E\u0627\u0637\u0628", tr: "Hedef kitle" },
  offer: { en: "Offer", fa: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F", tr: "Teklif" },
  proof: { en: "Proof and claims", fa: "\u0627\u062B\u0628\u0627\u062A \u0648 \u0627\u062F\u0639\u0627\u0647\u0627", tr: "Kan\u0131t ve iddialar" },
  governance: { en: "Decisions", fa: "\u062A\u0635\u0645\u06CC\u0645\u200C\u0647\u0627", tr: "Kararlar" },
  measurement: { en: "Measurement", fa: "\u0633\u0646\u062C\u0634", tr: "\xD6l\xE7\xFCm" }
};
var CRITICALITY_TEXT = {
  critical: { en: "Critical", fa: "\u0628\u062D\u0631\u0627\u0646\u06CC", tr: "Kritik" },
  important: { en: "Important", fa: "\u0645\u0647\u0645", tr: "\xD6nemli" },
  supporting: { en: "Supporting", fa: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646", tr: "Destekleyici" }
};
var MATURITY_TEXT = {
  "0": { en: "0 Unobserved \u2014 no process evidence (not proof of absence)", fa: "\u06F0 \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0646\u0634\u062F\u0647 \u2014 \u0634\u0648\u0627\u0647\u062F\u06CC \u0627\u0632 \u0641\u0631\u0627\u06CC\u0646\u062F \u0646\u06CC\u0633\u062A (\u062F\u0644\u06CC\u0644 \u0646\u0628\u0648\u062F\u0646\u0634 \u0647\u0645 \u0646\u06CC\u0633\u062A)", tr: "0 G\xF6zlenmedi \u2014 s\xFCre\xE7 kan\u0131t\u0131 yok (yoklu\u011Fun kan\u0131t\u0131 da de\u011Fil)" },
  "1": { en: "1 Defined \u2014 an approved policy or written approach exists", fa: "\u06F1 \u062A\u0639\u0631\u06CC\u0641\u200C\u0634\u062F\u0647 \u2014 \u0633\u06CC\u0627\u0633\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u06CC\u0627 \u0631\u0648\u06CC\u06A9\u0631\u062F \u0645\u06A9\u062A\u0648\u0628 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F", tr: "1 Tan\u0131ml\u0131 \u2014 onayl\u0131 bir politika veya yaz\u0131l\u0131 yakla\u015F\u0131m var" },
  "2": { en: "2 Executed \u2014 credible evidence of one real instance", fa: "\u06F2 \u0627\u062C\u0631\u0627\u0634\u062F\u0647 \u2014 \u0634\u0648\u0627\u0647\u062F \u0642\u0627\u0628\u0644\u200C\u0627\u062A\u06A9\u0627 \u0627\u0632 \u06CC\u06A9 \u0646\u0645\u0648\u0646\u0647\u0654 \u0648\u0627\u0642\u0639\u06CC", tr: "2 Uyguland\u0131 \u2014 ger\xE7ek bir \xF6rne\u011Fe dair g\xFCvenilir kan\u0131t" },
  "3": { en: "3 Measured \u2014 repeatable records with an owner and a definition", fa: "\u06F3 \u0633\u0646\u062C\u06CC\u062F\u0647 \u2014 \u0633\u0648\u0627\u0628\u0642 \u062A\u06A9\u0631\u0627\u0631\u067E\u0630\u06CC\u0631 \u0628\u0627 \u0645\u0627\u0644\u06A9 \u0648 \u062A\u0639\u0631\u06CC\u0641 \u0645\u0634\u062E\u0635", tr: "3 \xD6l\xE7\xFCld\xFC \u2014 sahibi ve tan\u0131m\u0131 olan tekrarlanabilir kay\u0131tlar" },
  "4": { en: "4 Improved \u2014 a decision changed practice, with evidence after the change", fa: "\u06F4 \u0628\u0647\u0628\u0648\u062F\u06CC\u0627\u0641\u062A\u0647 \u2014 \u062A\u0635\u0645\u06CC\u0645\u06CC \u0631\u0648\u06CC\u0647 \u0631\u0627 \u0639\u0648\u0636 \u06A9\u0631\u062F\u0647 \u0648 \u0634\u0648\u0627\u0647\u062F \u0628\u0639\u062F \u0627\u0632 \u062A\u063A\u06CC\u06CC\u0631 \u0647\u0633\u062A", tr: "4 \u0130yile\u015Ftirildi \u2014 bir karar uygulamay\u0131 de\u011Fi\u015Ftirdi, de\u011Fi\u015Fim sonras\u0131 kan\u0131t var" },
  unknown: { en: "Unknown", fa: "\u0646\u0627\u0645\u0634\u062E\u0635", tr: "Bilinmiyor" },
  not_applicable: { en: "Does not apply", fa: "\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F", tr: "Ge\xE7erli de\u011Fil" },
  insufficient_evidence: { en: "Not enough evidence (not zero)", fa: "\u0634\u0648\u0627\u0647\u062F \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A (\u0635\u0641\u0631 \u0646\u06CC\u0633\u062A)", tr: "Yeterli kan\u0131t yok (s\u0131f\u0131r de\u011Fil)" }
};
var EVIDENCE_QUALITY_TEXT = {
  independently_verified: { en: "Independently evidenced", fa: "\u062F\u0627\u0631\u0627\u06CC \u0634\u0648\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644", tr: "Ba\u011F\u0131ms\u0131z kan\u0131tl\u0131" },
  mixed: { en: "Mixed: some independent, some owner-stated", fa: "\u062A\u0631\u06A9\u06CC\u0628\u06CC: \u0628\u062E\u0634\u06CC \u0645\u0633\u062A\u0642\u0644\u060C \u0628\u062E\u0634\u06CC \u06AF\u0641\u062A\u0647\u0654 \u0645\u0627\u0644\u06A9", tr: "Kar\u0131\u015F\u0131k: bir k\u0131sm\u0131 ba\u011F\u0131ms\u0131z, bir k\u0131sm\u0131 sahip beyan\u0131" },
  owner_stated: { en: "Owner-stated only, not independently checked", fa: "\u0641\u0642\u0637 \u06AF\u0641\u062A\u0647\u0654 \u0645\u0627\u0644\u06A9\u060C \u0628\u062F\u0648\u0646 \u0628\u0631\u0631\u0633\u06CC \u0645\u0633\u062A\u0642\u0644", tr: "Yaln\u0131zca sahip beyan\u0131, ba\u011F\u0131ms\u0131z do\u011Frulanmad\u0131" },
  insufficient_evidence: { en: "Not enough evidence to say", fa: "\u0634\u0648\u0627\u0647\u062F \u0628\u0631\u0627\u06CC \u0627\u0638\u0647\u0627\u0631\u0646\u0638\u0631 \u06A9\u0627\u0641\u06CC \u0646\u06CC\u0633\u062A", tr: "S\xF6ylemek i\xE7in yeterli kan\u0131t yok" },
  not_assessed: { en: "Not assessed", fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0646\u0634\u062F\u0647", tr: "De\u011Ferlendirilmedi" }
};
var CLAIM_TEXT = {
  reference_only: { en: "Referenced only", fa: "\u0641\u0642\u0637 \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647", tr: "Yaln\u0131zca at\u0131f" },
  informed_by: { en: "Informed by", fa: "\u0627\u0644\u0647\u0627\u0645\u200C\u06AF\u0631\u0641\u062A\u0647 \u0627\u0632", tr: "Esinlenilen" },
  mapped_to: { en: "Mapped to selected requirements", fa: "\u0646\u06AF\u0627\u0634\u062A\u0647 \u0628\u0647 \u0627\u0644\u0632\u0627\u0645\u0627\u062A \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647", tr: "Se\xE7ili gerekliliklere e\u015Flenmi\u015F" },
  internally_assessed: { en: "Internally assessed", fa: "\u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC", tr: "\u0130\xE7 de\u011Ferlendirme" },
  externally_reviewed: { en: "Externally reviewed", fa: "\u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0634\u062F\u0647\u0654 \u0645\u0633\u062A\u0642\u0644", tr: "D\u0131\u015Far\u0131dan incelenmi\u015F" },
  certified: { en: "Certified", fa: "\u06AF\u0648\u0627\u0647\u06CC\u200C\u0634\u062F\u0647", tr: "Belgelendirilmi\u015F" }
};
var CLAIM_CAP_TEXT = {
  rules_access: {
    en: "We do not hold the rights to assess against this method, so it may only be cited.",
    fa: "\u062D\u0642 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u0628\u0631 \u0627\u0633\u0627\u0633 \u0627\u06CC\u0646 \u0645\u062A\u062F \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u0645\u061B \u067E\u0633 \u0641\u0642\u0637 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0628\u0647 \u0622\u0646 \u0627\u0631\u062C\u0627\u0639 \u062F\u0627\u062F.",
    tr: "Bu y\xF6nteme g\xF6re de\u011Ferlendirme hakk\u0131m\u0131z yok; bu nedenle yaln\u0131zca at\u0131f yap\u0131labilir."
  },
  edition_unverified: {
    en: "Nobody recorded which edition was checked, so the edition cannot be cited as fact.",
    fa: "\u06A9\u0633\u06CC \u062B\u0628\u062A \u0646\u06A9\u0631\u062F\u0647 \u06A9\u062F\u0627\u0645 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0628\u0631\u0631\u0633\u06CC \u0634\u062F\u0647\u061B \u067E\u0633 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0631\u0627 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0642\u0639\u06CC\u062A \u0630\u06A9\u0631 \u06A9\u0631\u062F.",
    tr: "Hangi s\xFCr\xFCm\xFCn kontrol edildi\u011Fi kay\u0131tl\u0131 de\u011Fil; bu y\xFCzden s\xFCr\xFCm bir olgu olarak an\u0131lamaz."
  },
  source_unverified: {
    en: "Nobody has opened the official source and confirmed its terms.",
    fa: "\u06A9\u0633\u06CC \u0645\u0646\u0628\u0639 \u0631\u0633\u0645\u06CC \u0631\u0627 \u0628\u0627\u0632 \u0646\u06A9\u0631\u062F\u0647 \u0648 \u0634\u0631\u0627\u06CC\u0637\u0634 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Resm\xEE kayna\u011F\u0131 a\xE7\u0131p ko\u015Fullar\u0131n\u0131 do\u011Frulayan olmad\u0131."
  },
  no_attestation: {
    en: "No named third party has attested this scope at the declared level (a review is not a certificate), so that level may not be claimed.",
    fa: "\u0647\u06CC\u0686 \u0634\u062E\u0635 \u062B\u0627\u0644\u062B \u0646\u0627\u0645\u200C\u0628\u0631\u062F\u0647\u200C\u0627\u06CC \u0627\u06CC\u0646 \u062F\u0627\u0645\u0646\u0647 \u0631\u0627 \u062F\u0631 \u0633\u0637\u062D \u0627\u0639\u0644\u0627\u0645\u200C\u0634\u062F\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A (\u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u060C \u06AF\u0648\u0627\u0647\u06CC\u0646\u0627\u0645\u0647 \u0646\u06CC\u0633\u062A)\u061B \u067E\u0633 \u0622\u0646 \u0633\u0637\u062D \u0631\u0627 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0627\u062F\u0639\u0627 \u06A9\u0631\u062F.",
    tr: "Ad\u0131 belirtilmi\u015F hi\xE7bir \xFC\xE7\xFCnc\xFC taraf bu kapsam\u0131 beyan edilen d\xFCzeyde do\u011Frulamad\u0131 (inceleme, belge de\u011Fildir); bu d\xFCzey iddia edilemez."
  }
};
var LIMITATION_TEXT = {
  internal_assessment_only: {
    en: "This is an internal assessment against a named method. It is not a certification, a compliance statement or an independent audit.",
    fa: "\u0627\u06CC\u0646 \u06CC\u06A9 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC \u062F\u0627\u062E\u0644\u06CC \u0628\u0631 \u0627\u0633\u0627\u0633 \u06CC\u06A9 \u0645\u062A\u062F \u0646\u0627\u0645\u200C\u0628\u0631\u062F\u0647 \u0627\u0633\u062A. \u06AF\u0648\u0627\u0647\u06CC\u0646\u0627\u0645\u0647\u060C \u0627\u0639\u0644\u0627\u0645 \u0627\u0646\u0637\u0628\u0627\u0642 \u06CC\u0627 \u0645\u0645\u06CC\u0632\u06CC \u0645\u0633\u062A\u0642\u0644 \u0646\u06CC\u0633\u062A.",
    tr: "Bu, ad\u0131 belirtilmi\u015F bir y\xF6nteme g\xF6re yap\u0131lan bir i\xE7 de\u011Ferlendirmedir. Belgelendirme, uygunluk beyan\u0131 veya ba\u011F\u0131ms\u0131z denetim de\u011Fildir."
  },
  owner_stated_evidence: {
    en: "Some evidence is the owner\u2019s own statement. Approved is not the same as independently verified.",
    fa: "\u0628\u062E\u0634\u06CC \u0627\u0632 \u0634\u0648\u0627\u0647\u062F \u06AF\u0641\u062A\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9 \u0627\u0633\u062A. \xAB\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\xBB \u0628\u0627 \xAB\u0631\u0627\u0633\u062A\u06CC\u200C\u0622\u0632\u0645\u0627\u06CC\u06CC \u0645\u0633\u062A\u0642\u0644\xBB \u06CC\u06A9\u06CC \u0646\u06CC\u0633\u062A.",
    tr: "Baz\u0131 kan\u0131tlar sahibin kendi beyan\u0131d\u0131r. Onayl\u0131 olmak, ba\u011F\u0131ms\u0131z do\u011Frulanm\u0131\u015F olmakla ayn\u0131 \u015Fey de\u011Fildir."
  },
  no_maturity_aggregate: {
    en: "Maturity is reported per domain. There is no single maturity number, because no aggregation rule has been published.",
    fa: "\u0628\u0644\u0648\u063A \u0628\u0631\u0627\u06CC \u0647\u0631 \u062D\u0648\u0632\u0647 \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u06AF\u0632\u0627\u0631\u0634 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0639\u062F\u062F \u0648\u0627\u062D\u062F \u0628\u0644\u0648\u063A \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F\u060C \u0686\u0648\u0646 \u0642\u0627\u0639\u062F\u0647\u0654 \u062A\u062C\u0645\u06CC\u0639\u06CC \u0645\u0646\u062A\u0634\u0631 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "Olgunluk alan baz\u0131nda raporlan\u0131r. Tek bir olgunluk say\u0131s\u0131 yoktur, \xE7\xFCnk\xFC yay\u0131mlanm\u0131\u015F bir toplama kural\u0131 yok."
  },
  completeness_blocked: {
    en: "No completeness ratio is shown: at least one control is unassessed, licence-blocked, of unclear applicability, or waiting on a changed source.",
    fa: "\u0646\u0633\u0628\u062A \u06A9\u0627\u0645\u0644\u200C\u0628\u0648\u062F\u0646 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u062F\u0633\u062A\u200C\u06A9\u0645 \u06CC\u06A9 \u06A9\u0646\u062A\u0631\u0644 \u0627\u0631\u0632\u06CC\u0627\u0628\u06CC\u200C\u0646\u0634\u062F\u0647\u060C \u0627\u0632 \u0646\u0638\u0631 \u0645\u062C\u0648\u0632 \u0645\u0633\u062F\u0648\u062F\u060C \u0646\u0627\u0645\u0634\u062E\u0635 \u0627\u0632 \u0646\u0638\u0631 \u0645\u0648\u0636\u0648\u0639\u06CC\u062A\u060C \u06CC\u0627 \u0645\u0646\u062A\u0638\u0631 \u0645\u0646\u0628\u0639\u06CC \u0627\u0633\u062A \u06A9\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F\u0647.",
    tr: "Tamamlanma oran\u0131 g\xF6sterilmiyor: en az bir kontrol de\u011Ferlendirilmemi\u015F, lisansla engellenmi\u015F, ge\xE7erlili\u011Fi belirsiz veya de\u011Fi\u015Fmi\u015F bir kayna\u011F\u0131 bekliyor."
  },
  restricted_inputs_withheld: {
    en: "At least one control reads restricted inputs and is withheld from this audience.",
    fa: "\u062F\u0633\u062A\u200C\u06A9\u0645 \u06CC\u06A9 \u06A9\u0646\u062A\u0631\u0644 \u0648\u0631\u0648\u062F\u06CC \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F \u0648 \u0627\u0632 \u0627\u06CC\u0646 \u0645\u062E\u0627\u0637\u0628 \u062F\u0631\u06CC\u063A \u0634\u062F\u0647 \u0627\u0633\u062A.",
    tr: "En az bir kontrol k\u0131s\u0131tl\u0131 girdileri okuyor ve bu kitleden saklan\u0131yor."
  },
  demo_data: {
    en: "SYNTHETIC DEMO \u2014 NOT A REAL BRAND. Every id below is invented for illustration.",
    fa: "\u0646\u0645\u0648\u0646\u0647\u0654 \u0633\u0627\u062E\u062A\u06AF\u06CC \u2014 \u06CC\u06A9 \u0628\u0631\u0646\u062F \u0648\u0627\u0642\u0639\u06CC \u0646\u06CC\u0633\u062A. \u0647\u0645\u0647\u0654 \u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627\u06CC \u0632\u06CC\u0631 \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    tr: "SENTET\u0130K DEMO \u2014 GER\xC7EK B\u0130R MARKA DE\u011E\u0130L. A\u015Fa\u011F\u0131daki her kimlik g\xF6sterim i\xE7in uydurulmu\u015Ftur."
  }
};
var METHOD_TEXT = {
  "brand-os.positioning-readiness": {
    en: "Brand OS Positioning Readiness rubric \u2014 an original Brand OS method. Not ISO, not a certification.",
    fa: "\u0631\u0648\u0628\u0631\u06CC\u06A9 \u0622\u0645\u0627\u062F\u06AF\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC Brand OS \u2014 \u0645\u062A\u062F\u06CC \u0627\u0635\u06CC\u0644 \u0627\u0632 Brand OS. \u0646\u0647 ISO \u0627\u0633\u062A \u0648 \u0646\u0647 \u06AF\u0648\u0627\u0647\u06CC\u0646\u0627\u0645\u0647.",
    tr: "Brand OS Konumland\u0131rma Haz\u0131rl\u0131\u011F\u0131 rubri\u011Fi \u2014 \xF6zg\xFCn bir Brand OS y\xF6ntemi. ISO de\u011Fildir, belgelendirme de\u011Fildir."
  }
};
var CONTROL_TEXT = {
  "PRR-01": {
    label: { en: "Primary segment named", fa: "\u0628\u062E\u0634 \u0627\u0635\u0644\u06CC \u0645\u062E\u0627\u0637\u0628 \u0646\u0627\u0645\u200C\u0628\u0631\u062F\u0647 \u0634\u062F\u0647", tr: "Birincil segment adland\u0131r\u0131lm\u0131\u015F" },
    intent: {
      en: "Who the brand is for is an approved fact, not an assumption in someone\u2019s head.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0646\u062F \u0628\u0631\u0627\u06CC \u0686\u0647 \u06A9\u0633\u06CC \u0627\u0633\u062A \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0627\u0634\u062F\u060C \u0646\u0647 \u0641\u0631\u0636\u06CC \u062F\u0631 \u0630\u0647\u0646 \u06A9\u0633\u06CC.",
      tr: "Markan\u0131n kime hitap etti\u011Fi onayl\u0131 bir bilgi olmal\u0131, birinin kafas\u0131ndaki varsay\u0131m de\u011Fil."
    },
    remediation: {
      en: "Answer the primary segment question, review it and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0628\u062E\u0634 \u0627\u0635\u0644\u06CC \u0645\u062E\u0627\u0637\u0628 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F\u060C \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0648 \u0633\u067E\u0633 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Birincil segment sorusunu yan\u0131tlay\u0131n, g\xF6zden ge\xE7irin ve onaylay\u0131n."
    }
  },
  "PRR-02": {
    label: { en: "Market scope named", fa: "\u062F\u0627\u0645\u0646\u0647\u0654 \u0628\u0627\u0632\u0627\u0631 \u0646\u0627\u0645\u200C\u0628\u0631\u062F\u0647 \u0634\u062F\u0647", tr: "Pazar kapsam\u0131 adland\u0131r\u0131lm\u0131\u015F" },
    intent: {
      en: "Where the brand operates bounds every later claim about competitors and demand.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0646\u062F \u06A9\u062C\u0627 \u0641\u0639\u0627\u0644 \u0627\u0633\u062A\u060C \u062D\u062F \u0648 \u0645\u0631\u0632 \u0647\u0631 \u0627\u062F\u0639\u0627\u06CC \u0628\u0639\u062F\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0631\u0642\u0628\u0627 \u0648 \u062A\u0642\u0627\u0636\u0627 \u0631\u0627 \u062A\u0639\u06CC\u06CC\u0646 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
      tr: "Markan\u0131n nerede faaliyet g\xF6sterdi\u011Fi, rakipler ve talep hakk\u0131ndaki sonraki her iddian\u0131n s\u0131n\u0131r\u0131n\u0131 \xE7izer."
    },
    remediation: {
      en: "Answer the market geography question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u062C\u063A\u0631\u0627\u0641\u06CC\u0627\u06CC \u0628\u0627\u0632\u0627\u0631 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Pazar co\u011Frafyas\u0131 sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-03": {
    label: { en: "Audience evidence exists", fa: "\u0634\u0648\u0627\u0647\u062F\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0645\u062E\u0627\u0637\u0628 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F", tr: "Hedef kitle kan\u0131t\u0131 var" },
    intent: {
      en: "At least one independent research note supports the audience choice; the owner\u2019s belief is not evidence.",
      fa: "\u062F\u0633\u062A\u200C\u06A9\u0645 \u06CC\u06A9 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u0645\u0633\u062A\u0642\u0644 \u0627\u0632 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u062E\u0627\u0637\u0628 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u06A9\u0646\u062F\u061B \u0628\u0627\u0648\u0631 \u0645\u0627\u0644\u06A9 \u0634\u0627\u0647\u062F \u0646\u06CC\u0633\u062A.",
      tr: "Hedef kitle se\xE7imini en az bir ba\u011F\u0131ms\u0131z ara\u015Ft\u0131rma notu desteklemeli; sahibin inanc\u0131 kan\u0131t de\u011Fildir."
    },
    remediation: {
      en: "Capture an independent source as a research note in the Knowledge Inbox and cite it.",
      fa: "\u06CC\u06A9 \u0645\u0646\u0628\u0639 \u0645\u0633\u062A\u0642\u0644 \u0631\u0627 \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u062F\u0631 Knowledge Inbox \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F \u0648 \u0628\u0647 \u0622\u0646 \u0627\u0631\u062C\u0627\u0639 \u062F\u0647\u06CC\u062F.",
      tr: "Ba\u011F\u0131ms\u0131z bir kayna\u011F\u0131 Knowledge Inbox\u2019ta ara\u015Ft\u0131rma notu olarak kaydedin ve at\u0131f yap\u0131n."
    }
  },
  "PRR-04": {
    label: { en: "Value proposition stated", fa: "\u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u0628\u06CC\u0627\u0646 \u0634\u062F\u0647", tr: "De\u011Fer \xF6nerisi belirtilmi\u015F" },
    intent: {
      en: "What the brand offers, in the owner\u2019s approved words.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0646\u062F \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0627\u0631\u0627\u0626\u0647 \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0628\u0627 \u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062E\u0648\u062F \u0645\u0627\u0644\u06A9.",
      tr: "Markan\u0131n ne sundu\u011Fu, sahibin onayl\u0131 kendi s\xF6zleriyle."
    },
    remediation: {
      en: "Answer the value proposition question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "De\u011Fer \xF6nerisi sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-05": {
    label: { en: "Differentiation stated", fa: "\u062A\u0645\u0627\u06CC\u0632 \u0628\u06CC\u0627\u0646 \u0634\u062F\u0647", tr: "Farkl\u0131la\u015Fma belirtilmi\u015F" },
    intent: {
      en: "What makes this brand a different choice, written down rather than implied.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0631\u0627 \u06AF\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0645\u062A\u0641\u0627\u0648\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F \u0646\u0647 \u0627\u0644\u0642\u0627 \u0634\u062F\u0647.",
      tr: "Bu markay\u0131 farkl\u0131 bir se\xE7enek yapan \u015Feyin ima edilmesi de\u011Fil, yaz\u0131l\u0131 olmas\u0131."
    },
    remediation: {
      en: "Answer the differentiation question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u062A\u0645\u0627\u06CC\u0632 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Farkl\u0131la\u015Fma sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-06": {
    label: { en: "Promise stated", fa: "\u0648\u0639\u062F\u0647\u0654 \u0628\u0631\u0646\u062F \u0628\u06CC\u0627\u0646 \u0634\u062F\u0647", tr: "Vaat belirtilmi\u015F" },
    intent: {
      en: "What a customer may expect every time, as an approved fact.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0645\u0634\u062A\u0631\u06CC \u0647\u0631 \u0628\u0627\u0631 \u0686\u0647 \u0627\u0646\u062A\u0638\u0627\u0631\u06CC \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F\u060C \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.",
      tr: "M\xFC\u015Fterinin her seferinde ne bekleyebilece\u011Fi, onayl\u0131 bir bilgi olarak."
    },
    remediation: {
      en: "Answer the brand promise question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0648\u0639\u062F\u0647\u0654 \u0628\u0631\u0646\u062F \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Marka vaadi sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-07": {
    label: { en: "Pricing position recorded", fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647 \u0642\u06CC\u0645\u062A\u06CC \u062B\u0628\u062A \u0634\u062F\u0647", tr: "Fiyat konumu kay\u0131tl\u0131" },
    intent: {
      en: "For a brand that sells: the pricing stance is a decision on record, not a number in a spreadsheet.",
      fa: "\u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F\u06CC \u06A9\u0647 \u0645\u06CC\u200C\u0641\u0631\u0648\u0634\u062F: \u0645\u0648\u0636\u0639 \u0642\u06CC\u0645\u062A\u06CC \u062A\u0635\u0645\u06CC\u0645\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u0628\u0627\u0634\u062F\u060C \u0646\u0647 \u0639\u062F\u062F\u06CC \u062F\u0631 \u06CC\u06A9 \u0635\u0641\u062D\u0647\u0654 \u06AF\u0633\u062A\u0631\u062F\u0647.",
      tr: "Sat\u0131\u015F yapan bir marka i\xE7in: fiyat duru\u015Fu bir tabloda say\u0131 de\u011Fil, kay\u0131tl\u0131 bir karar olmal\u0131."
    },
    remediation: {
      en: "Answer the pricing question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Fiyatland\u0131rma sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-08": {
    label: { en: "Differentiation evidence reviewed", fa: "\u0634\u0648\u0627\u0647\u062F \u062A\u0645\u0627\u06CC\u0632 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0634\u062F\u0647", tr: "Farkl\u0131la\u015Fma kan\u0131t\u0131 incelenmi\u015F" },
    intent: {
      en: "A person judged whether the cited evidence actually supports the differentiation claim. The engine will not judge this.",
      fa: "\u06CC\u06A9 \u0627\u0646\u0633\u0627\u0646 \u062F\u0627\u0648\u0631\u06CC \u06A9\u0646\u062F \u06A9\u0647 \u0634\u0648\u0627\u0647\u062F \u0627\u0631\u062C\u0627\u0639\u200C\u0634\u062F\u0647 \u0648\u0627\u0642\u0639\u0627\u064B \u0627\u062F\u0639\u0627\u06CC \u062A\u0645\u0627\u06CC\u0632 \u0631\u0627 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F \u06CC\u0627 \u0646\u0647. \u0645\u0648\u062A\u0648\u0631 \u0627\u06CC\u0646 \u062F\u0627\u0648\u0631\u06CC \u0631\u0627 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
      tr: "At\u0131f yap\u0131lan kan\u0131t\u0131n farkl\u0131la\u015Fma iddias\u0131n\u0131 ger\xE7ekten destekleyip desteklemedi\u011Fine bir insan karar vermeli. Motor bunu yarg\u0131lamaz."
    },
    remediation: {
      en: "Cite independent evidence, then record a reviewer\u2019s judgment with a written reason.",
      fa: "\u0628\u0647 \u0634\u0648\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u0627\u0631\u062C\u0627\u0639 \u062F\u0647\u06CC\u062F \u0648 \u0633\u067E\u0633 \u062F\u0627\u0648\u0631\u06CC \u06CC\u06A9 \u0628\u0627\u0632\u0628\u06CC\u0646 \u0631\u0627 \u0628\u0627 \u062F\u0644\u06CC\u0644 \u0646\u0648\u0634\u062A\u0647\u200C\u0634\u062F\u0647 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F.",
      tr: "Ba\u011F\u0131ms\u0131z kan\u0131ta at\u0131f yap\u0131n, ard\u0131ndan bir inceleyenin yarg\u0131s\u0131n\u0131 yaz\u0131l\u0131 gerek\xE7eyle kaydedin."
    }
  },
  "PRR-09": {
    label: { en: "Claim guardrails recorded", fa: "\u062D\u062F\u0648\u062F \u0627\u062F\u0639\u0627\u0647\u0627 \u062B\u0628\u062A \u0634\u062F\u0647", tr: "\u0130ddia s\u0131n\u0131rlar\u0131 kay\u0131tl\u0131" },
    intent: {
      en: "The words and claims this brand will never use are approved, so content tools can refuse them.",
      fa: "\u0648\u0627\u0698\u0647\u200C\u0647\u0627 \u0648 \u0627\u062F\u0639\u0627\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0647\u0631\u06AF\u0632 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F \u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0628\u0627\u0634\u0646\u062F \u062A\u0627 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u06CC \u0645\u062D\u062A\u0648\u0627 \u0628\u062A\u0648\u0627\u0646\u0646\u062F \u0631\u062F\u0634\u0627\u0646 \u06A9\u0646\u0646\u062F.",
      tr: "Bu markan\u0131n asla kullanmayaca\u011F\u0131 s\xF6zler ve iddialar onayl\u0131 olmal\u0131 ki i\xE7erik ara\xE7lar\u0131 onlar\u0131 reddedebilsin."
    },
    remediation: {
      en: "Answer the forbidden-language question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0632\u0628\u0627\u0646 \u0645\u0645\u0646\u0648\u0639 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Yasak dil sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-10": {
    label: { en: "Availability claim gate set", fa: "\u062F\u0631\u0648\u0627\u0632\u0647\u0654 \u0627\u062F\u0639\u0627\u06CC \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0628\u0648\u062F\u0646 \u062A\u0639\u06CC\u06CC\u0646 \u0634\u062F\u0647", tr: "Bulunurluk iddias\u0131 s\u0131n\u0131r\u0131 belirlenmi\u015F" },
    intent: {
      en: "What may be said about availability is decided, so nothing ships claiming a product that is not ready.",
      fa: "\u062A\u0639\u06CC\u06CC\u0646 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0628\u0648\u062F\u0646 \u0686\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u06AF\u0641\u062A\u060C \u062A\u0627 \u0686\u06CC\u0632\u06CC \u0628\u0627 \u0627\u062F\u0639\u0627\u06CC \u0645\u062D\u0635\u0648\u0644\u06CC \u06A9\u0647 \u0622\u0645\u0627\u062F\u0647 \u0646\u06CC\u0633\u062A \u0645\u0646\u062A\u0634\u0631 \u0646\u0634\u0648\u062F.",
      tr: "Bulunurluk hakk\u0131nda ne s\xF6ylenebilece\u011Fi kararla\u015Ft\u0131r\u0131lmal\u0131 ki haz\u0131r olmayan bir \xFCr\xFCn iddias\u0131yla hi\xE7bir \u015Fey yay\u0131mlanmas\u0131n."
    },
    remediation: {
      en: "Answer the availability claim question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0627\u062F\u0639\u0627\u06CC \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0628\u0648\u062F\u0646 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Bulunurluk iddias\u0131 sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-11": {
    label: { en: "Decision rule recorded", fa: "\u0642\u0627\u0639\u062F\u0647\u0654 \u062A\u0635\u0645\u06CC\u0645 \u062B\u0628\u062A \u0634\u062F\u0647", tr: "Karar kural\u0131 kay\u0131tl\u0131" },
    intent: {
      en: "How the brand decides when two good options conflict, written down before it is needed.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0646\u062F \u0648\u0642\u062A\u06CC \u062F\u0648 \u06AF\u0632\u06CC\u0646\u0647\u0654 \u062E\u0648\u0628 \u0628\u0627 \u0647\u0645 \u062F\u0631 \u062A\u0639\u0627\u0631\u0636\u200C\u0627\u0646\u062F \u0686\u06AF\u0648\u0646\u0647 \u062A\u0635\u0645\u06CC\u0645 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F\u060C \u067E\u06CC\u0634 \u0627\u0632 \u0646\u06CC\u0627\u0632 \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647 \u0628\u0627\u0634\u062F.",
      tr: "Marka iki iyi se\xE7enek \xE7at\u0131\u015Ft\u0131\u011F\u0131nda nas\u0131l karar verir \u2014 ihtiya\xE7 duyulmadan \xF6nce yaz\u0131lm\u0131\u015F olmal\u0131."
    },
    remediation: {
      en: "Answer the decision rule question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0642\u0627\u0639\u062F\u0647\u0654 \u062A\u0635\u0645\u06CC\u0645 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Karar kural\u0131 sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-12": {
    label: { en: "Purpose recorded", fa: "\u0647\u062F\u0641 \u062B\u0628\u062A \u0634\u062F\u0647", tr: "Ama\xE7 kay\u0131tl\u0131" },
    intent: {
      en: "Why the brand exists, in the owner\u2019s approved words.",
      fa: "\u0627\u06CC\u0646\u06A9\u0647 \u0628\u0631\u0646\u062F \u0686\u0631\u0627 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F\u060C \u0628\u0627 \u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0645\u0627\u0644\u06A9.",
      tr: "Markan\u0131n neden var oldu\u011Fu, sahibin onayl\u0131 s\xF6zleriyle."
    },
    remediation: {
      en: "Answer the purpose question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \u0647\u062F\u0641 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "Ama\xE7 sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-13": {
    label: { en: "Objective and attribution defined", fa: "\u0647\u062F\u0641 \u0648 \u0645\u062F\u0644 \u0627\u0646\u062A\u0633\u0627\u0628 \u062A\u0639\u0631\u06CC\u0641 \u0634\u062F\u0647", tr: "Hedef ve at\u0131f tan\u0131ml\u0131" },
    intent: {
      en: "For a brand running paid media: the objective and the attribution definition exist, so results can be compared at all.",
      fa: "\u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F\u06CC \u06A9\u0647 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC \u0627\u062C\u0631\u0627 \u0645\u06CC\u200C\u06A9\u0646\u062F: \u0647\u062F\u0641 \u0648 \u062A\u0639\u0631\u06CC\u0641 \u0627\u0646\u062A\u0633\u0627\u0628 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0634\u062F \u062A\u0627 \u0627\u0635\u0644\u0627\u064B \u0628\u062A\u0648\u0627\u0646 \u0646\u062A\u0627\u06CC\u062C \u0631\u0627 \u0645\u0642\u0627\u06CC\u0633\u0647 \u06A9\u0631\u062F.",
      tr: "\xDCcretli medya y\xFCr\xFCten bir marka i\xE7in: hedef ve at\u0131f tan\u0131m\u0131 olmal\u0131 ki sonu\xE7lar kar\u015F\u0131la\u015Ft\u0131r\u0131labilsin."
    },
    remediation: {
      en: "Answer the marketing objective and attribution questions and approve them.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u0647\u062F\u0641 \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC \u0648 \u0627\u0646\u062A\u0633\u0627\u0628 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634\u0627\u0646 \u06A9\u0646\u06CC\u062F.",
      tr: "Pazarlama hedefi ve at\u0131f sorular\u0131n\u0131 yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  },
  "PRR-14": {
    label: { en: "Budget envelope recorded", fa: "\u0633\u0642\u0641 \u0628\u0648\u062F\u062C\u0647 \u062B\u0628\u062A \u0634\u062F\u0647", tr: "B\xFCt\xE7e zarf\u0131 kay\u0131tl\u0131" },
    intent: {
      en: "For a brand running paid media: a budget envelope exists. The figure is restricted and is never read by this engine or shown in a report.",
      fa: "\u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F\u06CC \u06A9\u0647 \u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC \u0627\u062C\u0631\u0627 \u0645\u06CC\u200C\u06A9\u0646\u062F: \u0633\u0642\u0641 \u0628\u0648\u062F\u062C\u0647\u200C\u0627\u06CC \u0648\u062C\u0648\u062F \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F. \u062E\u0648\u062F \u0631\u0642\u0645 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0627\u0633\u062A \u0648 \u0646\u0647 \u0627\u06CC\u0646 \u0645\u0648\u062A\u0648\u0631 \u0622\u0646 \u0631\u0627 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F \u0648 \u0646\u0647 \u062F\u0631 \u06AF\u0632\u0627\u0631\u0634\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
      tr: "\xDCcretli medya y\xFCr\xFCten bir marka i\xE7in: bir b\xFCt\xE7e zarf\u0131 olmal\u0131. Rakam k\u0131s\u0131tl\u0131d\u0131r; bu motor onu okumaz ve bir raporda g\xF6sterilmez."
    },
    remediation: {
      en: "The owner answers the budget question in the interactive interview. No agent can.",
      fa: "\u0645\u0627\u0644\u06A9 \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u062A\u0639\u0627\u0645\u0644\u06CC \u0628\u0647 \u067E\u0631\u0633\u0634 \u0628\u0648\u062F\u062C\u0647 \u067E\u0627\u0633\u062E \u0645\u06CC\u200C\u062F\u0647\u062F. \u0647\u06CC\u0686 \u0639\u0627\u0645\u0644\u06CC \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F.",
      tr: "B\xFCt\xE7e sorusunu etkile\u015Fimli g\xF6r\xFC\u015Fmede sahip yan\u0131tlar. Hi\xE7bir ajan yan\u0131tlayamaz."
    }
  },
  "PRR-15": {
    label: { en: "Personal positioning recorded", fa: "\u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u0634\u062E\u0635\u06CC \u062B\u0628\u062A \u0634\u062F\u0647", tr: "Ki\u015Fisel konumland\u0131rma kay\u0131tl\u0131" },
    intent: {
      en: "For a person-centred brand: what this person is known for is an approved fact.",
      fa: "\u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F \u0634\u062E\u0635\u200C\u0645\u062D\u0648\u0631: \u0627\u06CC\u0646\u06A9\u0647 \u0627\u06CC\u0646 \u0634\u062E\u0635 \u0628\u0631\u0627\u06CC \u0686\u0647 \u0634\u0646\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0627\u0634\u062F.",
      tr: "Ki\u015Fi merkezli bir marka i\xE7in: bu ki\u015Finin neyle tan\u0131nd\u0131\u011F\u0131 onayl\u0131 bir bilgi olmal\u0131."
    },
    remediation: {
      en: "Answer the \u201Cknown for\u201D question and approve it.",
      fa: "\u0628\u0647 \u067E\u0631\u0633\u0634 \xAB\u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0686\u0647\xBB \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F\u0634 \u06A9\u0646\u06CC\u062F.",
      tr: "\u201CNeyle tan\u0131n\u0131yor\u201D sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n."
    }
  }
};
var REPORT_TEXT = {
  title: { en: "Positioning readiness \u2014 gap report", fa: "\u0622\u0645\u0627\u062F\u06AF\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u2014 \u06AF\u0632\u0627\u0631\u0634 \u06A9\u0645\u0628\u0648\u062F\u0647\u0627", tr: "Konumland\u0131rma haz\u0131rl\u0131\u011F\u0131 \u2014 eksik raporu" },
  method: { en: "Method", fa: "\u0645\u062A\u062F", tr: "Y\xF6ntem" },
  claim: { en: "What this may be called", fa: "\u0627\u06CC\u0646 \u0631\u0627 \u0686\u0647 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646 \u0646\u0627\u0645\u06CC\u062F", tr: "Buna ne denebilir" },
  as_of: { en: "As of", fa: "\u062A\u0627 \u062A\u0627\u0631\u06CC\u062E", tr: "Tarih itibar\u0131yla" },
  audience: { en: "Audience", fa: "\u0645\u062E\u0627\u0637\u0628", tr: "Kitle" },
  rule_version: { en: "Rule version", fa: "\u0646\u0633\u062E\u0647\u0654 \u0642\u0627\u0639\u062F\u0647", tr: "Kural s\xFCr\xFCm\xFC" },
  rule_digest: { en: "Rule digest", fa: "\u0686\u06A9\u06CC\u062F\u0647\u0654 \u0642\u0627\u0639\u062F\u0647", tr: "Kural \xF6zeti" },
  source_digest: { en: "Source snapshot digest", fa: "\u0686\u06A9\u06CC\u062F\u0647\u0654 \u062A\u0635\u0648\u06CC\u0631 \u0645\u0646\u0627\u0628\u0639", tr: "Kaynak anl\u0131k g\xF6r\xFCnt\xFC \xF6zeti" },
  completeness: { en: "Completeness", fa: "\u06A9\u0627\u0645\u0644\u200C\u0628\u0648\u062F\u0646", tr: "Tamamlanma" },
  completeness_value: { en: "{n} of {d} applicable controls complete, {x} excluded as not applicable", fa: "{n} \u0627\u0632 {d} \u06A9\u0646\u062A\u0631\u0644 \u062F\u0627\u0631\u0627\u06CC \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u06A9\u0627\u0645\u0644 \u0627\u0633\u062A\u060C {x} \u0645\u0648\u0631\u062F \u0628\u0647\u200C\u062F\u0644\u06CC\u0644 \u0628\u06CC\u200C\u0645\u0648\u0636\u0648\u0639\u06CC\u062A\u06CC \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F", tr: "{d} ge\xE7erli kontrolden {n} tanesi tamam, {x} tanesi ge\xE7erli olmad\u0131\u011F\u0131 i\xE7in hari\xE7" },
  not_scoreable: { en: "No ratio is shown. Reasons:", fa: "\u0647\u06CC\u0686 \u0646\u0633\u0628\u062A\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u062F\u0644\u0627\u06CC\u0644:", tr: "Hi\xE7bir oran g\xF6sterilmiyor. Nedenler:" },
  evidence: { en: "Evidence", fa: "\u0634\u0648\u0627\u0647\u062F", tr: "Kan\u0131t" },
  coverage: { en: "{n} of {d} applicable controls have independent evidence", fa: "{n} \u0627\u0632 {d} \u06A9\u0646\u062A\u0631\u0644 \u062F\u0627\u0631\u0627\u06CC \u0645\u0648\u0636\u0648\u0639\u06CC\u062A\u060C \u0634\u0648\u0627\u0647\u062F \u0645\u0633\u062A\u0642\u0644 \u062F\u0627\u0631\u062F", tr: "{d} ge\xE7erli kontrolden {n} tanesinin ba\u011F\u0131ms\u0131z kan\u0131t\u0131 var" },
  maturity: { en: "Observed maturity by domain", fa: "\u0628\u0644\u0648\u063A \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647 \u0628\u0647 \u062A\u0641\u06A9\u06CC\u06A9 \u062D\u0648\u0632\u0647", tr: "Alana g\xF6re g\xF6zlenen olgunluk" },
  no_maturity_signal: { en: "This method observes no maturity signal in this domain", fa: "\u0627\u06CC\u0646 \u0645\u062A\u062F \u062F\u0631 \u0627\u06CC\u0646 \u062D\u0648\u0632\u0647 \u0646\u0634\u0627\u0646\u0647\u200C\u0627\u06CC \u0627\u0632 \u0628\u0644\u0648\u063A \u0646\u0645\u06CC\u200C\u0633\u0646\u062C\u062F", tr: "Bu y\xF6ntem bu alanda olgunluk sinyali g\xF6zlemlemiyor" },
  controls: { en: "Controls", fa: "\u06A9\u0646\u062A\u0631\u0644\u200C\u0647\u0627", tr: "Kontroller" },
  next: { en: "Next", fa: "\u06AF\u0627\u0645 \u0628\u0639\u062F", tr: "Sonraki" },
  next_questions: { en: "Questions that would move this forward", fa: "\u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u0631\u0627 \u062C\u0644\u0648 \u0645\u06CC\u200C\u0628\u0631\u0646\u062F", tr: "Bunu ilerletecek sorular" },
  sources: { en: "Sources consulted (ids and revisions only)", fa: "\u0645\u0646\u0627\u0628\u0639 \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647 (\u0641\u0642\u0637 \u0634\u0646\u0627\u0633\u0647 \u0648 \u0646\u0633\u062E\u0647)", tr: "Ba\u015Fvurulan kaynaklar (yaln\u0131zca kimlik ve s\xFCr\xFCm)" },
  limits: { en: "Limits of this report", fa: "\u0645\u062D\u062F\u0648\u062F\u06CC\u062A\u200C\u0647\u0627\u06CC \u0627\u06CC\u0646 \u06AF\u0632\u0627\u0631\u0634", tr: "Bu raporun s\u0131n\u0131rlar\u0131" },
  authorizes: {
    en: "This report authorizes nothing: no approval, no publication, no spend, no price change.",
    fa: "\u0627\u06CC\u0646 \u06AF\u0632\u0627\u0631\u0634 \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0631\u0627 \u0645\u062C\u0627\u0632 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F: \u0646\u0647 \u062A\u0623\u06CC\u06CC\u062F\u06CC\u060C \u0646\u0647 \u0627\u0646\u062A\u0634\u0627\u0631\u06CC\u060C \u0646\u0647 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC\u060C \u0646\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u0642\u06CC\u0645\u062A\u06CC.",
    tr: "Bu rapor hi\xE7bir \u015Feye izin vermez: onay yok, yay\u0131n yok, harcama yok, fiyat de\u011Fi\u015Fikli\u011Fi yok."
  },
  none: { en: "none", fa: "\u0647\u06CC\u0686", tr: "yok" }
};

// packages/brand-core/src/assurance/claims.ts
var RANK = {
  reference_only: 0,
  informed_by: 1,
  mapped_to: 2,
  internally_assessed: 3,
  externally_reviewed: 4,
  certified: 5
};
var RULES_ACCESS_CAP = {
  authored: "internally_assessed",
  licensed: "internally_assessed",
  reference_only: "informed_by",
  unlicensed: "reference_only"
};
var ATTESTATION_CAP = { review: "externally_reviewed", certificate: "certified" };
function effectiveClaim(subject) {
  const capped = [];
  let level = subject.declared_claim_level;
  const lower = (cap, reason) => {
    if (RANK[level] > RANK[cap]) {
      level = cap;
      capped.push(reason);
    }
  };
  if (subject.attestation === null) lower("internally_assessed", "no_attestation");
  else lower(ATTESTATION_CAP[subject.attestation.kind], "no_attestation");
  if (subject.edition === null) lower("informed_by", "edition_unverified");
  if (subject.checked_at === null) lower("informed_by", "source_unverified");
  if (RANK[level] <= RANK.internally_assessed) lower(RULES_ACCESS_CAP[subject.rules_access], "rules_access");
  return { level, capped_by: capped };
}
function assessable(subject) {
  return (subject.rules_access === "authored" || subject.rules_access === "licensed") && subject.checked_at !== null && subject.edition !== null;
}

// packages/brand-core/src/assurance/registry.ts
var POSITIONING_READINESS = {
  method_id: "brand-os.positioning-readiness",
  title: "Brand OS Positioning Readiness rubric",
  kind: "original_method",
  issuer: "Brand OS (brand-os-template)",
  edition: "1",
  official_source_url: "https://github.com/omidlog/brand-os-template",
  license_status: "original_brand_os",
  rules_access: "authored",
  declared_claim_level: "internally_assessed",
  scope: "Whether one brand has recorded, evidenced and claim-bounded positioning decisions. Not brand value, not market performance, not compliance.",
  checked_at: "2026-11-23",
  checked_by: "owner",
  blocked_uses: ["certification", "compliance_claim", "brand_valuation", "benchmark_comparison"],
  evaluation_rule_version: "1",
  attestation: null
};
var REFERENCED_METHODS = [
  {
    method_id: "w3c.prov-o",
    title: "PROV-O: The PROV Ontology",
    kind: "web_standard",
    issuer: "W3C",
    edition: null,
    official_source_url: "https://www.w3.org/TR/prov-o/",
    license_status: "open_permitted",
    rules_access: "reference_only",
    declared_claim_level: "informed_by",
    scope: "Vocabulary for describing provenance: entities, activities, agents and derivation.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim"],
    evaluation_rule_version: null,
    attestation: null
  },
  {
    method_id: "w3c.wcag-2.2",
    title: "Web Content Accessibility Guidelines 2.2",
    kind: "web_standard",
    issuer: "W3C",
    edition: null,
    official_source_url: "https://www.w3.org/TR/wcag22/",
    license_status: "open_permitted",
    rules_access: "reference_only",
    declared_claim_level: "informed_by",
    scope: "Accessibility requirements for web content. Used here as a design and test target.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim", "conformance_statement_without_testing"],
    evaluation_rule_version: null,
    attestation: null
  },
  {
    method_id: "owasp.asvs",
    title: "OWASP Application Security Verification Standard",
    kind: "professional_framework",
    issuer: "OWASP Foundation",
    edition: null,
    official_source_url: "https://asvs.owasp.org/",
    license_status: "open_permitted",
    rules_access: "reference_only",
    declared_claim_level: "informed_by",
    scope: "Application security verification requirements.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim"],
    evaluation_rule_version: null,
    attestation: null
  },
  {
    method_id: "iso.20671",
    title: "ISO 20671 (brand evaluation)",
    kind: "formal_standard",
    issuer: "ISO",
    edition: null,
    official_source_url: "https://www.iso.org/search.html?q=ISO%2020671",
    license_status: "reference_only",
    rules_access: "unlicensed",
    declared_claim_level: "reference_only",
    scope: "Brand evaluation principles and reporting. Requirements are copyrighted and are not reproduced or assessed here.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim", "clause_reproduction", "rule_database", "llm_training"],
    evaluation_rule_version: null,
    attestation: null
  },
  {
    method_id: "iso.iec.25010",
    title: "ISO/IEC 25010 (software product quality model)",
    kind: "formal_standard",
    issuer: "ISO/IEC",
    edition: null,
    official_source_url: "https://www.iso.org/search.html?q=ISO%2FIEC%2025010",
    license_status: "reference_only",
    rules_access: "unlicensed",
    declared_claim_level: "reference_only",
    scope: "Software product quality characteristics. Named only; no clause is reproduced or assessed.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim", "clause_reproduction", "rule_database", "llm_training"],
    evaluation_rule_version: null,
    attestation: null
  },
  {
    method_id: "strategyzer.bmc",
    title: "Business Model Canvas",
    kind: "professional_framework",
    issuer: "Alexander Osterwalder / Strategyzer",
    edition: null,
    official_source_url: "https://www.strategyzer.com/library/the-business-model-canvas",
    license_status: "blocked_pending_review",
    rules_access: "reference_only",
    declared_claim_level: "informed_by",
    scope: "Nine-component description of a business model. Commercial embedding terms are under review.",
    checked_at: null,
    checked_by: null,
    blocked_uses: ["certification", "compliance_claim", "artwork_reproduction"],
    evaluation_rule_version: null,
    attestation: null
  }
];
var METHOD_REGISTRY = [POSITIONING_READINESS, ...REFERENCED_METHODS];
function methodById(methodId, registry = METHOD_REGISTRY) {
  return registry.find((entry) => entry.method_id === methodId) ?? null;
}
function methodClaim(entry) {
  return effectiveClaim({
    declared_claim_level: entry.declared_claim_level,
    rules_access: entry.rules_access,
    checked_at: entry.checked_at,
    edition: entry.edition,
    attestation: entry.attestation
  });
}
function methodDigest(entry) {
  return sha256Hex(canonicalJson(entry));
}

// packages/brand-core/src/assurance/controls.ts
var REVIEWABLE_STATUSES = ["applicable_complete", "applicable_partial", "applicable_missing", "evidence_insufficient", "not_applicable"];
var CONTROL_DOMAINS = ["audience", "offer", "proof", "governance", "measurement"];
var MATURITY_LEVELS = ["0", "1", "2", "3", "4"];
var MATURITY_STATES = [...MATURITY_LEVELS, "unknown", "not_applicable", "insufficient_evidence"];
function applicabilityOf(rule, subject) {
  let unknown = false;
  for (const condition of rule.conditions) {
    const value = subject[condition.field];
    if (value === "unknown") {
      unknown = true;
      continue;
    }
    if (!condition.one_of.includes(value)) return "not_applicable";
  }
  return unknown ? "unknown" : "applicable";
}
var ALWAYS = { rule_id: "always", conditions: [] };
var SELLS = { rule_id: "sells_something", conditions: [{ field: "sells", one_of: ["yes"] }] };
var PAID_MEDIA = { rule_id: "runs_paid_media", conditions: [{ field: "runs_paid_media", one_of: ["yes"] }] };
var PERSON = { rule_id: "person_brand", conditions: [{ field: "entity_kind", one_of: ["person"] }] };
var M = POSITIONING_READINESS.method_id;
var V = "1";
function control(partial) {
  return {
    method_id: M,
    evaluation_rule_version: V,
    related_question_ids: [],
    required_evidence: null,
    maturity_signal: false,
    evaluation_mode: "deterministic",
    ...partial
  };
}
var POSITIONING_READINESS_CONTROLS = [
  control({
    control_id: "PRR-01",
    domain: "audience",
    applicability: ALWAYS,
    required_question_ids: ["business.customer.primary_segment"],
    decision_criticality: "critical",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-02",
    domain: "audience",
    applicability: ALWAYS,
    required_question_ids: ["business.market.geography"],
    decision_criticality: "important",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-03",
    domain: "audience",
    applicability: ALWAYS,
    required_question_ids: [],
    related_question_ids: ["business.customer.primary_segment"],
    required_evidence: { min: 1, independence: "independent" },
    decision_criticality: "critical",
    owner_role: "marketing",
    privacy_classification: "internal",
    maturity_signal: true,
    visualization: "evidence_stack"
  }),
  control({
    control_id: "PRR-04",
    domain: "offer",
    applicability: ALWAYS,
    required_question_ids: ["business.offer.value_proposition"],
    decision_criticality: "critical",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-05",
    domain: "offer",
    applicability: ALWAYS,
    required_question_ids: ["brand.strategy.differentiation"],
    decision_criticality: "critical",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-06",
    domain: "offer",
    applicability: ALWAYS,
    required_question_ids: ["brand.strategy.promise"],
    decision_criticality: "important",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-07",
    domain: "offer",
    applicability: SELLS,
    required_question_ids: ["business.sales.pricing"],
    decision_criticality: "important",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "gap_matrix"
  }),
  control({
    control_id: "PRR-08",
    domain: "proof",
    applicability: ALWAYS,
    required_question_ids: [],
    related_question_ids: ["brand.strategy.differentiation"],
    required_evidence: { min: 1, independence: "independent" },
    evaluation_mode: "reviewer_judgment",
    decision_criticality: "critical",
    owner_role: "owner",
    privacy_classification: "internal",
    maturity_signal: true,
    visualization: "evidence_stack"
  }),
  control({
    control_id: "PRR-09",
    domain: "proof",
    applicability: ALWAYS,
    required_question_ids: ["brand.verbal.forbidden"],
    decision_criticality: "important",
    owner_role: "editor",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-10",
    domain: "proof",
    applicability: ALWAYS,
    required_question_ids: ["business.marketing.availability_claim"],
    decision_criticality: "critical",
    owner_role: "marketing",
    privacy_classification: "internal",
    visualization: "gap_matrix"
  }),
  control({
    control_id: "PRR-11",
    domain: "governance",
    applicability: ALWAYS,
    required_question_ids: ["brand.strategy.decision_rule"],
    decision_criticality: "important",
    owner_role: "owner",
    privacy_classification: "internal",
    maturity_signal: true,
    visualization: "maturity_stair"
  }),
  control({
    control_id: "PRR-12",
    domain: "governance",
    applicability: ALWAYS,
    required_question_ids: ["brand.strategy.purpose"],
    decision_criticality: "supporting",
    owner_role: "owner",
    privacy_classification: "internal",
    visualization: "readiness_bar"
  }),
  control({
    control_id: "PRR-13",
    domain: "measurement",
    applicability: PAID_MEDIA,
    required_question_ids: ["business.marketing.objective", "business.marketing.attribution"],
    decision_criticality: "important",
    owner_role: "marketing",
    privacy_classification: "internal",
    maturity_signal: true,
    visualization: "maturity_stair"
  }),
  control({
    control_id: "PRR-14",
    domain: "measurement",
    applicability: PAID_MEDIA,
    required_question_ids: ["business.marketing.budget"],
    decision_criticality: "supporting",
    owner_role: "finance",
    // The budget is a restricted fact. The control exists so its absence is visible; its result is
    // withheld from every audience below `restricted`, and its value is never read.
    privacy_classification: "restricted",
    visualization: "gap_matrix"
  }),
  control({
    control_id: "PRR-15",
    domain: "audience",
    applicability: PERSON,
    required_question_ids: ["personal.positioning.known_for"],
    decision_criticality: "critical",
    owner_role: "owner",
    privacy_classification: "public",
    visualization: "readiness_bar"
  })
];
var DEFAULT_CATALOG = { controls: POSITIONING_READINESS_CONTROLS };
function controlsForMethod(methodId, catalog = DEFAULT_CATALOG) {
  return catalog.controls.filter((entry) => entry.method_id === methodId);
}
function controlsDigest(controls) {
  return sha256Hex(canonicalJson([...controls].sort((a, b) => a.control_id < b.control_id ? -1 : 1)));
}

// packages/brand-core/src/assurance/fixtures.ts
var SYNTHETIC_DEMO_BRAND = "synthetic-demo";
var SYNTHETIC_DEMO_BANNER = "SYNTHETIC DEMO \u2014 NOT A REAL BRAND";
var SYNTHETIC_DEMO_AS_OF = /* @__PURE__ */ new Date("2026-11-23T00:00:00.000Z");
function demoRevision(seed) {
  return sha256Hex(`${SYNTHETIC_DEMO_BANNER}:${seed}`);
}
function fact(id, options = {}) {
  return {
    ref: { id, revision: demoRevision(id) },
    state: "current",
    presence: "approved",
    classification: "internal",
    ...options
  };
}
function note(seed, independence) {
  const noteId = `kn_demo_${seed}`;
  const revision = demoRevision(noteId);
  return { ref: { ref: `knowledge:${noteId}@${revision}`, note_id: noteId, revision }, state: "current", independence };
}
function input(controlId, options = {}) {
  return { control_id: controlId, facts: [], evidence: [], conflicts: [], review: null, maturity: null, ...options };
}
function questionsOf(controlId) {
  return POSITIONING_READINESS_CONTROLS.find((control2) => control2.control_id === controlId)?.required_question_ids ?? [];
}
function allApproved(controlId, maturity = null) {
  return input(controlId, { facts: questionsOf(controlId).map((id) => fact(id)), maturity });
}
var COMPANY = { entity_kind: "company", sells: "yes", stage: "established", runs_paid_media: "no" };
function demoControls() {
  return [
    allApproved("PRR-01"),
    allApproved("PRR-02"),
    // No research note at all: missing data, not weak data.
    input("PRR-03"),
    allApproved("PRR-04"),
    allApproved("PRR-05"),
    allApproved("PRR-06"),
    // The pricing question was never answered.
    input("PRR-07", { facts: [fact("business.sales.pricing", { state: "missing", presence: "absent" })] }),
    // A judgment control whose sources disagree. The conflict is reported, never averaged away.
    input("PRR-08", { evidence: [note("differentiation", "owner_stated")], conflicts: ["contradiction:demo-differentiation"] }),
    allApproved("PRR-09"),
    input("PRR-10", { facts: [fact("business.marketing.availability_claim")], conflicts: ["contradiction:demo-availability"] }),
    allApproved("PRR-11", "2"),
    allApproved("PRR-12"),
    allApproved("PRR-13"),
    input("PRR-14", { facts: [fact("business.marketing.budget", { classification: "restricted" })] }),
    allApproved("PRR-15")
  ];
}
function demoInput(subject, audience, controls) {
  return {
    brand_id: SYNTHETIC_DEMO_BRAND,
    method_id: POSITIONING_READINESS.method_id,
    subject,
    audience,
    as_of: SYNTHETIC_DEMO_AS_OF,
    controls,
    demo: true
  };
}
var SYNTHETIC_DEMO = demoInput(COMPANY, "internal", demoControls());
var SYNTHETIC_DEMO_UNKNOWN_SCOPE = demoInput({ ...COMPANY, runs_paid_media: "unknown" }, "internal", demoControls());
var SYNTHETIC_DEMO_CHANGED_SOURCE = demoInput(
  COMPANY,
  "internal",
  demoControls().map((control2) => control2.control_id === "PRR-04" ? input("PRR-04", { facts: [fact("business.offer.value_proposition", { state: "changed" })] }) : control2)
);
var SYNTHETIC_DEMO_RESTRICTED = demoInput({ ...COMPANY, runs_paid_media: "yes" }, "internal", demoControls());

// packages/brand-core/src/assurance/report.ts
var GAP_REPORT_RENDERER = "brand-os.gap-report-md/1";
var STATUS_GLYPH = {
  applicable_complete: "\u25CF",
  applicable_partial: "\u25D0",
  applicable_missing: "\u25CB",
  not_applicable: "\u2013",
  applicability_unknown: "?",
  evidence_insufficient: "\u25CC",
  conflicted: "\u26A0",
  needs_review: "\u21BB",
  blocked_by_license: "\u2298",
  not_assessed: "\xB7"
};
function t(catalog, key, lang) {
  const entry = catalog[key];
  return entry ? entry[lang] : key;
}
function renderGapReport(assessment, lang) {
  const lines = [];
  if (assessment.demo) lines.push(`> **${SYNTHETIC_DEMO_BANNER}**`, "");
  lines.push(`# ${REPORT_TEXT.title[lang]}`, "");
  lines.push(`- ${REPORT_TEXT.method[lang]}: ${t(METHOD_TEXT, assessment.method_id, lang)} (\`${assessment.method_id}\`, edition ${assessment.method_edition ?? "\u2014"})`);
  lines.push(`- ${REPORT_TEXT.claim[lang]}: ${t(CLAIM_TEXT, assessment.claim_level, lang)}`);
  for (const cap of assessment.claim_capped_by) lines.push(`  - ${t(CLAIM_CAP_TEXT, cap, lang)}`);
  lines.push(`- ${REPORT_TEXT.as_of[lang]}: ${assessment.as_of}`);
  lines.push(`- ${REPORT_TEXT.audience[lang]}: \`${assessment.audience}\``);
  lines.push(`- ${REPORT_TEXT.rule_version[lang]}: \`${assessment.evaluation_rule_version ?? "\u2014"}\` \xB7 ${GAP_REPORT_RENDERER}`);
  lines.push(`- ${REPORT_TEXT.rule_digest[lang]}: \`${assessment.method_rule_sha256}\``);
  lines.push(`- ${REPORT_TEXT.source_digest[lang]}: \`${assessment.source_snapshot_digest}\``, "");
  lines.push(`## ${REPORT_TEXT.completeness[lang]}`, "");
  const c = assessment.completeness;
  if (c.state === "scoreable" && c.numerator !== null && c.denominator !== null) {
    lines.push(fill(REPORT_TEXT.completeness_value[lang], { n: c.numerator, d: c.denominator, x: c.excluded }));
  } else {
    lines.push(REPORT_TEXT.not_scoreable[lang]);
    for (const code of c.blocked_by) lines.push(`- ${t(REASON_TEXT, code, lang)}`);
  }
  lines.push("");
  lines.push(`## ${REPORT_TEXT.evidence[lang]}`, "");
  lines.push(t(EVIDENCE_QUALITY_TEXT, assessment.evidence_quality, lang));
  const cov = assessment.evidence_coverage;
  lines.push(fill(REPORT_TEXT.coverage[lang], { n: cov.controls_with_independent_evidence, d: cov.applicable_controls }), "");
  lines.push(`## ${REPORT_TEXT.maturity[lang]}`, "");
  for (const domain of assessment.maturity_by_domain) {
    const state = domain.signal_controls === 0 ? REPORT_TEXT.no_maturity_signal[lang] : t(MATURITY_TEXT, domain.state, lang);
    lines.push(`- ${t(DOMAIN_TEXT, domain.domain, lang)}: ${state}`);
  }
  lines.push("");
  lines.push(`## ${REPORT_TEXT.controls[lang]}`, "");
  for (const result of assessment.control_results) {
    const text = CONTROL_TEXT[result.control_id];
    const label = text ? text.label[lang] : result.control_id;
    lines.push(`### ${STATUS_GLYPH[result.status] ?? ""} ${result.control_id} \u2014 ${label}`);
    lines.push(`${t(STATUS_TEXT, result.status, lang)} \xB7 ${t(DOMAIN_TEXT, result.domain, lang)} \xB7 ${t(CRITICALITY_TEXT, result.criticality, lang)}`, "");
    for (const code of result.reason_codes) lines.push(`- ${t(REASON_TEXT, code, lang)}`);
    if (result.status !== "applicable_complete" && result.status !== "not_applicable" && text) {
      lines.push(`- ${REPORT_TEXT.next[lang]}: ${text.remediation[lang]}`);
    }
    if (result.next_questions.length > 0) lines.push(`- ${REPORT_TEXT.next_questions[lang]}: ${result.next_questions.map((id) => `\`${id}\``).join(", ")}`);
    if (result.source_refs.length > 0) {
      lines.push(`- ${REPORT_TEXT.sources[lang]}: ${result.source_refs.map((ref) => `\`${ref.kind}:${ref.id}@${ref.revision.slice(0, 12)}\` (${ref.state})`).join(", ")}`);
    }
    lines.push("");
  }
  lines.push(`## ${REPORT_TEXT.limits[lang]}`, "");
  for (const code of assessment.limitations) lines.push(`- ${t(LIMITATION_TEXT, code, lang)}`);
  lines.push(`- ${REPORT_TEXT.authorizes[lang]}`, "");
  return lines.join("\n");
}

// packages/brand-core/src/assurance/assess.ts
var ASSESSMENT_SCHEMA = "brand-os.audit-assessment/1";
var REVIEWER_ROLES = ["owner", "editor", "marketing", "finance", "design", "external"];
var AUDIENCE_RANK = { public: 0, internal: 1, restricted: 2 };
function byKey(key) {
  return (a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0;
}
function refsOf(input2) {
  if (!input2) return [];
  return [
    ...input2.facts.map((fact2) => ({ kind: "fact", id: fact2.ref.id, revision: fact2.ref.revision, state: fact2.state })),
    ...input2.evidence.map((item) => ({ kind: "research_note", id: item.ref.note_id, revision: item.ref.revision, state: item.state }))
  ].sort(byKey((ref) => `${ref.kind}\0${ref.id}\0${ref.revision}`));
}
function subjectOf(subject) {
  return { entity_kind: subject.entity_kind, sells: subject.sells, stage: subject.stage, runs_paid_media: subject.runs_paid_media };
}
function unmet(control2, input2) {
  const satisfied = new Set(input2.facts.filter((fact2) => fact2.presence === "approved" && fact2.state === "current").map((fact2) => fact2.ref.id));
  return control2.required_question_ids.filter((id) => !satisfied.has(id));
}
function sorted(values) {
  return [...new Set(values)].sort();
}
function evaluateControl(control2, input2, subject, audience, methodAssessable) {
  const base = {
    control_id: control2.control_id,
    domain: control2.domain,
    criticality: control2.decision_criticality,
    source_refs: refsOf(input2),
    reviewer_id: input2?.review?.reviewer_id ?? null
  };
  const result = (status, reasons2, nextQuestions = []) => ({
    ...base,
    status,
    reason_codes: sorted(reasons2),
    next_questions: sorted(nextQuestions)
  });
  if (!methodAssessable) return result("blocked_by_license", ["license_blocked"]);
  const applicability = applicabilityOf(control2.applicability, subject);
  if (applicability === "not_applicable") return result("not_applicable", ["not_applicable_by_rule"]);
  if (applicability === "unknown") return result("applicability_unknown", ["applicability_unknown"]);
  if (!input2) return result("not_assessed", ["no_input"], control2.required_question_ids);
  const restrictedInput = control2.privacy_classification === "restricted" || input2.facts.some((fact2) => fact2.classification === "restricted");
  if (restrictedInput && AUDIENCE_RANK[audience] < AUDIENCE_RANK.restricted) {
    return { ...base, source_refs: [], status: "evidence_insufficient", reason_codes: ["withheld_for_audience"], next_questions: [] };
  }
  const changed = [...input2.facts.map((fact2) => fact2.state), ...input2.evidence.map((item) => item.state)].includes("changed");
  if (changed) return result("needs_review", ["source_changed"], unmet(control2, input2));
  if (input2.conflicts.length > 0) return result("conflicted", ["conflict_recorded"], unmet(control2, input2));
  if (control2.evaluation_mode === "reviewer_judgment") {
    const review = input2.review;
    if (!review) return result("needs_review", ["reviewer_required"], unmet(control2, input2));
    if (!review.rationale.trim()) return result("needs_review", ["reviewer_rationale_missing"], unmet(control2, input2));
    if (!REVIEWER_ROLES.includes(review.reviewer_role)) return result("needs_review", ["reviewer_role_invalid"], unmet(control2, input2));
    if (!REVIEWABLE_STATUSES.includes(review.status)) return result("needs_review", ["reviewer_status_invalid"], unmet(control2, input2));
    return result(review.status, ["all_inputs_present"]);
  }
  const reasons = [];
  const missing = unmet(control2, input2);
  for (const id of missing) {
    const fact2 = input2.facts.find((entry) => entry.ref.id === id);
    if (!fact2) reasons.push("source_missing");
    else if (fact2.state === "missing") reasons.push("source_missing");
    else if (fact2.presence === "unknown") reasons.push("owner_said_unknown");
    else if (fact2.presence === "not_applicable") reasons.push("owner_said_not_applicable");
    else reasons.push("fact_not_approved");
  }
  const usable = input2.evidence.filter((item) => item.state === "current");
  const need = control2.required_evidence;
  let evidence = "met";
  if (need) {
    const counted = need.independence === "independent" ? usable.filter((item) => item.independence === "independent") : usable;
    if (usable.length === 0) {
      evidence = "none";
      reasons.push("source_missing");
    } else if (counted.length < need.min) {
      evidence = "insufficient";
      reasons.push(counted.length < usable.length ? "evidence_not_independent" : "evidence_below_minimum");
    }
  }
  const required = control2.required_question_ids.length;
  if (missing.length === 0 && evidence === "met") return result("applicable_complete", ["all_inputs_present"]);
  if (missing.length === 0 && evidence === "insufficient") return result("evidence_insufficient", reasons, control2.related_question_ids);
  if (required > 0 && missing.length < required) return result("applicable_partial", reasons, missing);
  return result("applicable_missing", reasons, missing.length > 0 ? missing : control2.related_question_ids);
}
var BLOCKING = ["applicability_unknown", "not_assessed", "blocked_by_license", "needs_review"];
function completenessOf(results) {
  const excluded = results.filter((entry) => entry.status === "not_applicable").length;
  const blockers = results.filter((entry) => BLOCKING.includes(entry.status));
  if (blockers.length > 0) {
    const codes = sorted(
      blockers.flatMap(
        (entry) => entry.status === "applicability_unknown" ? ["applicability_unknown"] : entry.status === "not_assessed" ? ["no_input"] : entry.status === "blocked_by_license" ? ["license_blocked"] : entry.reason_codes
      )
    );
    return { state: "not_scoreable", numerator: null, denominator: null, excluded, blocked_by: codes };
  }
  const applicable = results.filter((entry) => entry.status !== "not_applicable");
  const complete = applicable.filter((entry) => entry.status === "applicable_complete").length;
  return { state: "scoreable", numerator: complete, denominator: applicable.length, excluded, blocked_by: [] };
}
function evidenceQualityOf(inputs, results) {
  const applicable = results.filter((entry) => entry.status !== "not_applicable" && entry.status !== "blocked_by_license");
  const byId = new Map(inputs.map((input2) => [input2.control_id, input2]));
  const usable = applicable.flatMap((entry) => (byId.get(entry.control_id)?.evidence ?? []).filter((item) => item.state === "current"));
  const withIndependent = applicable.filter((entry) => (byId.get(entry.control_id)?.evidence ?? []).some((item) => item.state === "current" && item.independence === "independent")).length;
  const coverage = { controls_with_independent_evidence: withIndependent, applicable_controls: applicable.length };
  if (applicable.length === 0) return { quality: "not_assessed", coverage };
  if (usable.length === 0) return { quality: "insufficient_evidence", coverage };
  const independent = usable.filter((item) => item.independence === "independent").length;
  if (independent === usable.length) return { quality: "independently_verified", coverage };
  if (independent === 0) return { quality: "owner_stated", coverage };
  return { quality: "mixed", coverage };
}
function maturityOf(controls, inputs, results) {
  const byId = new Map(inputs.map((input2) => [input2.control_id, input2]));
  const status = new Map(results.map((entry) => [entry.control_id, entry.status]));
  return CONTROL_DOMAINS.map((domain) => {
    const signalControls = controls.filter((control2) => control2.domain === domain && control2.maturity_signal);
    if (signalControls.length === 0) return { domain, state: "not_applicable", signals: 0, signal_controls: 0 };
    if (signalControls.every((control2) => status.get(control2.control_id) === "not_applicable")) {
      return { domain, state: "not_applicable", signals: 0, signal_controls: signalControls.length };
    }
    if (signalControls.some((control2) => status.get(control2.control_id) === "applicability_unknown")) {
      return { domain, state: "unknown", signals: 0, signal_controls: signalControls.length };
    }
    const levels = signalControls.filter((control2) => status.get(control2.control_id) === "applicable_complete").map((control2) => byId.get(control2.control_id)?.maturity ?? null).filter((level) => level !== null);
    if (levels.length === 0) return { domain, state: "insufficient_evidence", signals: 0, signal_controls: signalControls.length };
    const weakest = levels.reduce((low, level) => Number(level) < Number(low) ? level : low, levels[0]);
    return { domain, state: weakest, signals: levels.length, signal_controls: signalControls.length };
  });
}
function sourceSnapshotDigest(input2) {
  return sha256Hex(
    canonicalJson({
      brand_id: input2.brand_id,
      method_id: input2.method_id,
      subject: subjectOf(input2.subject),
      audience: input2.audience,
      as_of: input2.as_of.toISOString(),
      controls: [...input2.controls].sort((a, b) => a.control_id < b.control_id ? -1 : 1).map((control2) => ({
        control_id: control2.control_id,
        facts: control2.facts.map((fact2) => ({ id: fact2.ref.id, revision: fact2.ref.revision, state: fact2.state, presence: fact2.presence, classification: fact2.classification })).sort(byKey((fact2) => `${fact2.id}\0${fact2.revision}`)),
        evidence: control2.evidence.map((item) => ({ note_id: item.ref.note_id, revision: item.ref.revision, state: item.state, independence: item.independence })).sort(byKey((item) => `${item.note_id}\0${item.revision}`)),
        conflicts: [...control2.conflicts].sort(),
        review: control2.review ? { reviewer_id: control2.review.reviewer_id, status: control2.review.status, reviewed_at: control2.review.reviewed_at } : null,
        maturity: control2.maturity
      }))
    })
  );
}
function methodRuleDigest(method, controls) {
  return sha256Hex(canonicalJson({ method: methodDigest(method), controls: controlsDigest(controls) }));
}
var AssuranceError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AssuranceError";
  }
  code;
};
function assess(input2, catalog = DEFAULT_CATALOG, registry = METHOD_REGISTRY) {
  const method = methodById(input2.method_id, registry);
  if (!method) throw new AssuranceError("unknown_method", `No method ${input2.method_id} in the registry.`);
  const controls = controlsForMethod(method.method_id, catalog);
  if (controls.length === 0) throw new AssuranceError("no_controls", `Method ${method.method_id} has no controls, so there is nothing to assess.`);
  const claim = methodClaim(method);
  const methodAssessable = assessable(method);
  const byId = new Map(input2.controls.map((control2) => [control2.control_id, control2]));
  const results = [...controls].sort((a, b) => a.control_id < b.control_id ? -1 : 1).map((control2) => evaluateControl(control2, byId.get(control2.control_id) ?? null, input2.subject, input2.audience, methodAssessable));
  const completeness = completenessOf(results);
  const { quality, coverage } = evidenceQualityOf(input2.controls, results);
  const limitations = ["internal_assessment_only", "no_maturity_aggregate"];
  if (completeness.state === "not_scoreable") limitations.push("completeness_blocked");
  if (quality === "owner_stated" || quality === "mixed") limitations.push("owner_stated_evidence");
  if (results.some((entry) => entry.reason_codes.includes("withheld_for_audience"))) limitations.push("restricted_inputs_withheld");
  if (input2.demo) limitations.push("demo_data");
  const snapshot = sourceSnapshotDigest(input2);
  const asOf = input2.as_of.toISOString();
  return {
    schema: ASSESSMENT_SCHEMA,
    schema_version: 1,
    id: `asm_${sha256Hex(canonicalJson({ brand_id: input2.brand_id, method_id: method.method_id, as_of: asOf, snapshot })).slice(0, 32)}`,
    brand_id: input2.brand_id,
    demo: input2.demo === true,
    method_id: method.method_id,
    method_edition: method.edition,
    method_rule_sha256: methodRuleDigest(method, controls),
    evaluation_rule_version: method.evaluation_rule_version,
    claim_level: claim.level,
    claim_capped_by: claim.capped_by,
    as_of: asOf,
    audience: input2.audience,
    subject: subjectOf(input2.subject),
    source_snapshot_digest: snapshot,
    control_results: results,
    completeness,
    evidence_quality: quality,
    evidence_coverage: coverage,
    maturity_by_domain: maturityOf(controls, input2.controls, results),
    maturity_aggregate: null,
    limitations: sorted(limitations)
  };
}

export {
  POSITIONING_READINESS,
  methodById,
  applicabilityOf,
  POSITIONING_READINESS_CONTROLS,
  DEFAULT_CATALOG,
  controlsForMethod,
  sourceSnapshotDigest,
  assess,
  assuranceLang,
  fill,
  CONTROL_TEXT,
  SYNTHETIC_DEMO_BANNER,
  renderGapReport
};
