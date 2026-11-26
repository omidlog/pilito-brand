import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  coachBeforeApproval,
  coachNoteText
} from "./chunk-UFA2RPL2.mjs";
import {
  buildStudioCreative
} from "./chunk-LPHAXDOY.mjs";
import {
  SHARED_CRITERIA,
  SHARED_LANDSCAPE_SCHEMA,
  readSharedLandscape
} from "./chunk-3RZ74H24.mjs";
import {
  BMC_ZONES,
  BMC_ZONE_IDS,
  BRAND_BOOK,
  BUSINESS_PLAN,
  DATA_STATES,
  IDENTITY_QUESTIONS,
  JOURNEY_EMOTIONS,
  LOGO_ICON_TAGS,
  MASCOT_CATEGORIES,
  SOSTAC_STAGES,
  TOWS_TYPES,
  VISUAL_SCHEMA,
  buildBusinessModelCanvas,
  buildDashboard,
  buildNamedDocument,
  buildStudioKnowledge,
  buildVisualIdentity,
  canvasApplies,
  canvasDocument,
  emptyStatusSummary,
  entryFromItem,
  frameworkEntry,
  frameworkRef,
  identityDocument,
  imageSize,
  isExampleAsset,
  logoChapterStatus,
  zoneState
} from "./chunk-4QCLP6RD.mjs";
import "./chunk-3UUYBU2Z.mjs";
import "./chunk-6K2U6D7O.mjs";
import {
  buildStudioCalendar,
  buildStudioStrategy
} from "./chunk-BDOF2PHO.mjs";
import {
  PERSONAL_DOCUMENT_KINDS,
  itemFor
} from "./chunk-Z4VEC43P.mjs";
import "./chunk-ZYAYDNGS.mjs";
import {
  DEFAULT_STALENESS_DAYS
} from "./chunk-5OMKZSIF.mjs";
import {
  buildStudioSocialKit
} from "./chunk-C5LB7EY5.mjs";
import "./chunk-3KXXRRZE.mjs";
import "./chunk-MHQ2KNS6.mjs";
import "./chunk-6WOO6B6T.mjs";
import "./chunk-AQ6QTRSP.mjs";
import {
  compileTokens,
  contrastRatio,
  tokenDigest
} from "./chunk-HHMADR62.mjs";
import {
  AGENT_TOKEN_ENV,
  InterviewEngine,
  brandApplicability,
  entityOptionLabel,
  entitySpec,
  latestAnswers,
  moduleEnabled,
  parseStructured,
  readEvidence,
  readFacts,
  readMascotStages,
  readMascotStates,
  readPublicationPolicy,
  readTemplateRecord,
  rightsBlocker,
  sourceRefKind
} from "./chunk-HOCT4QOE.mjs";
import {
  inspectAssetForPublication
} from "./chunk-QXBDJJNV.mjs";
import {
  require_dist
} from "./chunk-NUYFBVWM.mjs";
import {
  __toESM
} from "./chunk-QDMMEM6P.mjs";

// scripts/export-visual.ts
import { execFileSync, spawnSync } from "node:child_process";
import fs2 from "node:fs";
import path2 from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

// packages/brand-core/src/visual/i18n-entities.ts
var ENTITY_TEXT = {
  en: {
    emptyTitle: {
      key_activities: "No key activities listed yet",
      key_resources: "No key resources listed yet",
      customer_segments: "No customer segments listed yet",
      cost_structure: "No cost items listed yet"
    },
    emptyBody: "Each item is added in the interview. Nothing is filled in from other answers.",
    itemCount: "{count} items",
    moreItems: "+{count} more, listed under sources",
    legacy: "Earlier free text, kept as written",
    legacyHint: "Not yet a list of items. A conversion is proposed for the owner to review.",
    linksTitle: "Links between zones",
    linksLead: "Links the owner recorded on list items: which activities serve which segments, which resources they use, what drives each cost. Offers, channels and revenue streams are still single answers, so they are never linked.",
    linksNoneNoItems: "No list items are recorded yet, so no links are drawn. Links come only from items the owner records.",
    linksNoneProse: "Segments, offers, channels and revenue streams are single prose answers here, so no link between them is drawn.",
    linksEmpty: "The recorded items have no links yet.",
    linkTo: "Linked to",
    linkHidden: "an item not shown in this edition",
    linksColFrom: "From",
    linksColTo: "To",
    linksColState: "State",
    linkResolved: "Shown",
    linkUnresolved: "Not shown in this edition",
    editHint: "Items are added, edited, reordered and removed in the brand repository through the interview; changes to an approved list need approval."
  },
  fa: {
    emptyTitle: {
      key_activities: "\u0647\u0646\u0648\u0632 \u0641\u0639\u0627\u0644\u06CC\u062A \u06A9\u0644\u06CC\u062F\u06CC\u200C\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A",
      key_resources: "\u0647\u0646\u0648\u0632 \u0645\u0646\u0628\u0639 \u06A9\u0644\u06CC\u062F\u06CC\u200C\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A",
      customer_segments: "\u0647\u0646\u0648\u0632 \u0628\u062E\u0634 \u0645\u0634\u062A\u0631\u06CC\u200C\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A",
      cost_structure: "\u0647\u0646\u0648\u0632 \u0642\u0644\u0645 \u0647\u0632\u06CC\u0646\u0647\u200C\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A"
    },
    emptyBody: "\u0647\u0631 \u0645\u0648\u0631\u062F \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647 \u0627\u0641\u0632\u0648\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0627\u0632 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u067E\u0631 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    itemCount: "{count} \u0645\u0648\u0631\u062F",
    moreItems: "+{count} \u0645\u0648\u0631\u062F \u062F\u06CC\u06AF\u0631\u060C \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u0645\u0646\u0627\u0628\u0639",
    legacy: "\u0645\u062A\u0646 \u0622\u0632\u0627\u062F \u067E\u06CC\u0634\u06CC\u0646\u060C \u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647",
    legacyHint: "\u0647\u0646\u0648\u0632 \u0641\u0647\u0631\u0633\u062A\u06CC \u0627\u0632 \u0645\u0648\u0627\u0631\u062F \u0646\u06CC\u0633\u062A. \u062A\u0628\u062F\u06CC\u0644 \u0622\u0646 \u0628\u0631\u0627\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0645\u0627\u0644\u06A9 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F.",
    linksTitle: "\u067E\u06CC\u0648\u0646\u062F \u0645\u06CC\u0627\u0646 \u0628\u062E\u0634\u200C\u0647\u0627",
    linksLead: "\u067E\u06CC\u0648\u0646\u062F\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0631\u0648\u06CC \u0645\u0648\u0627\u0631\u062F \u0641\u0647\u0631\u0633\u062A \u062B\u0628\u062A \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A: \u06A9\u062F\u0627\u0645 \u0641\u0639\u0627\u0644\u06CC\u062A \u0628\u0647 \u06A9\u062F\u0627\u0645 \u0628\u062E\u0634 \u0645\u0634\u062A\u0631\u06CC \u062E\u062F\u0645\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u0632 \u06A9\u062F\u0627\u0645 \u0645\u0646\u0627\u0628\u0639 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0647\u0631 \u0647\u0632\u06CC\u0646\u0647 \u0627\u0632 \u06A9\u062C\u0627 \u0645\u06CC\u200C\u0622\u06CC\u062F. \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0647\u0627\u060C \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0648 \u062C\u0631\u06CC\u0627\u0646\u200C\u0647\u0627\u06CC \u062F\u0631\u0622\u0645\u062F \u0647\u0646\u0648\u0632 \u06CC\u06A9 \u067E\u0627\u0633\u062E \u0645\u062A\u0646\u06CC\u200C\u0627\u0646\u062F \u0648 \u067E\u06CC\u0648\u0646\u062F \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    linksNoneNoItems: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0645\u0648\u0631\u062F\u06CC \u062F\u0631 \u0641\u0647\u0631\u0633\u062A\u200C\u0647\u0627 \u062B\u0628\u062A \u0646\u0634\u062F\u0647\u060C \u067E\u0633 \u0647\u06CC\u0686 \u067E\u06CC\u0648\u0646\u062F\u06CC \u0631\u0633\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u067E\u06CC\u0648\u0646\u062F\u0647\u0627 \u0641\u0642\u0637 \u0627\u0632 \u0645\u0648\u0627\u0631\u062F\u06CC \u0645\u06CC\u200C\u0622\u06CC\u0646\u062F \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u062B\u0628\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    linksNoneProse: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC\u060C \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0647\u0627\u060C \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0648 \u062C\u0631\u06CC\u0627\u0646\u200C\u0647\u0627\u06CC \u062F\u0631\u0622\u0645\u062F \u0627\u06CC\u0646\u062C\u0627 \u0647\u0631 \u06A9\u062F\u0627\u0645 \u06CC\u06A9 \u067E\u0627\u0633\u062E \u0645\u062A\u0646\u06CC\u200C\u0627\u0646\u062F\u061B \u0628\u0646\u0627\u0628\u0631\u0627\u06CC\u0646 \u0647\u06CC\u0686 \u067E\u06CC\u0648\u0646\u062F\u06CC \u0645\u06CC\u0627\u0646\u0634\u0627\u0646 \u0631\u0633\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    linksEmpty: "\u0645\u0648\u0627\u0631\u062F \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u0647\u0646\u0648\u0632 \u067E\u06CC\u0648\u0646\u062F\u06CC \u0646\u062F\u0627\u0631\u0646\u062F.",
    linkTo: "\u067E\u06CC\u0648\u0646\u062F \u0628\u0647",
    linkHidden: "\u0645\u0648\u0631\u062F\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    linksColFrom: "\u0627\u0632",
    linksColTo: "\u0628\u0647",
    linksColState: "\u0648\u0636\u0639\u06CC\u062A",
    linkResolved: "\u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0634\u062F\u0647",
    linkUnresolved: "\u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    editHint: "\u0645\u0648\u0627\u0631\u062F \u062F\u0631 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F \u0648 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0645\u0635\u0627\u062D\u0628\u0647 \u0627\u0641\u0632\u0648\u062F\u0647\u060C \u0648\u06CC\u0631\u0627\u06CC\u0634\u060C \u062C\u0627\u0628\u0647\u200C\u062C\u0627 \u0648 \u062D\u0630\u0641 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06CC\u0627\u0632 \u062F\u0627\u0631\u062F."
  },
  tr: {
    emptyTitle: {
      key_activities: "Hen\xFCz anahtar faaliyet listelenmedi",
      key_resources: "Hen\xFCz anahtar kaynak listelenmedi",
      customer_segments: "Hen\xFCz m\xFC\u015Fteri segmenti listelenmedi",
      cost_structure: "Hen\xFCz maliyet kalemi listelenmedi"
    },
    emptyBody: "Her \xF6\u011Fe g\xF6r\xFC\u015Fmede eklenir. Di\u011Fer yan\u0131tlardan hi\xE7bir \u015Fey doldurulmaz.",
    itemCount: "{count} \xF6\u011Fe",
    moreItems: "+{count} \xF6\u011Fe daha, kaynaklarda listelenmi\u015Ftir",
    legacy: "\xD6nceki serbest metin, yaz\u0131ld\u0131\u011F\u0131 gibi",
    legacyHint: "Hen\xFCz bir \xF6\u011Fe listesi de\u011Fil. Sahibin incelemesi i\xE7in bir d\xF6n\xFC\u015Ft\xFCrme \xF6nerilir.",
    linksTitle: "Alanlar aras\u0131 ba\u011Flant\u0131lar",
    linksLead: "Sahibin liste \xF6\u011Felerine kaydetti\u011Fi ba\u011Flant\u0131lar: hangi faaliyet hangi segmente hizmet ediyor, hangi kaynaklar\u0131 kullan\u0131yor, her maliyeti ne belirliyor. Teklifler, kanallar ve gelir ak\u0131\u015Flar\u0131 h\xE2l\xE2 tek yan\u0131tt\u0131r; bu y\xFCzden ba\u011Flanmaz.",
    linksNoneNoItems: "Hen\xFCz liste \xF6\u011Fesi kaydedilmedi, bu y\xFCzden ba\u011Flant\u0131 \xE7izilmez. Ba\u011Flant\u0131lar yaln\u0131zca sahibin kaydetti\u011Fi \xF6\u011Felerden gelir.",
    linksNoneProse: "Segmentler, teklifler, kanallar ve gelir ak\u0131\u015Flar\u0131 burada tek metin yan\u0131tlar\u0131d\u0131r; bu y\xFCzden aralar\u0131nda ba\u011Flant\u0131 \xE7izilmez.",
    linksEmpty: "Kaydedilen \xF6\u011Felerin hen\xFCz ba\u011Flant\u0131s\u0131 yok.",
    linkTo: "Ba\u011Flant\u0131",
    linkHidden: "bu s\xFCr\xFCmde g\xF6sterilmeyen bir \xF6\u011Fe",
    linksColFrom: "Kaynak",
    linksColTo: "Hedef",
    linksColState: "Durum",
    linkResolved: "G\xF6steriliyor",
    linkUnresolved: "Bu s\xFCr\xFCmde g\xF6sterilmiyor",
    editHint: "\xD6\u011Feler marka deposunda g\xF6r\xFC\u015Fme \xFCzerinden eklenir, d\xFCzenlenir, s\u0131ralan\u0131r ve kald\u0131r\u0131l\u0131r; onayl\u0131 bir listedeki de\u011Fi\u015Fiklik onay gerektirir."
  }
};

// packages/brand-core/src/visual/i18n-identity.ts
var en = {
  chapterKicker: "Brand Book \xB7 Chapter",
  chapterTitle: "Visual identity",
  chapterLead: "Colour, type and the logo, drawn only from approved facts and the approved master file. Where nothing is approved yet, the page says what it is waiting for.",
  familyLabel: "Family",
  sourcesIntro: "Every plate in this chapter, the fact or asset it is drawn from, its state and its approved version.",
  scaleLabel: "Size",
  mockMark: "MOCK MARK",
  openChapter: "Visual identity chapter",
  openChapterHint: "Colour palette, typography specimen and logo construction, drawn from approved facts only.",
  backToChapter: "Back to the chapter",
  printTitle: "Print view",
  runningHead: "Brand Book \xB7 Visual identity",
  contents: "In this chapter",
  colorTitle: "Colour palette",
  colorLead: "Each colour is a role. Roles survive a change of hue; the hex is the approved value today.",
  rolesTitle: "Colour roles",
  combinationsTitle: "Combinations",
  combinationsLead: "Text and background pairs the roles declare by name (onPrimary on primary), with the measured ratio.",
  combinationsNone: "No role is named as text on another (for example onPrimary on primary), so no combination is declared. The grid below measures every pair.",
  contrastTitle: "Measured contrast",
  contrastLead: "Computed from the approved hex values with the WCAG 2 contrast-ratio formula. A ratio measures two colours; it is not an accessibility audit of any product.",
  gridTitle: "Contrast grid",
  gridHint: "Text colour in the row, background in the column. Ratios rounded down.",
  gridOmitted: "More than {count} colours: the grid is left out so it stays legible. The declared combinations are still measured.",
  gridCorner: "Text \u2193 \xB7 Background \u2192",
  ratio: "{ratio}:1",
  normalText: "Normal text 4.5:1",
  largeText: "Large text 3:1",
  enhanced: "Enhanced 7:1",
  passes: "Meets",
  fails: "Below",
  textOn: "{fg} on {bg}",
  sample: "Sample text",
  typeTitle: "Typography",
  typeLead: "Type roles with their family, fallback and size, set in each language the brand supports.",
  fallbackLabel: "Fallback",
  sizeLabel: "{size} px",
  lineHeightLabel: "line height {value}",
  sizeUnset: "Size not set",
  fontNote: "Set by family name. If the face is not installed on this device the browser uses the fallback, and Persian lines use Vazirmatn where the face has no Arabic-script glyphs. Studio loads no font files from the brand.",
  scriptName: { en: "English", fa: "Persian", tr: "Turkish" },
  specimenLine: { en: "The quick brown fox jumps over the lazy dog 0123456789", fa: "\u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC\u060C \u062E\u0637\u06CC \u067E\u06CC\u0648\u0633\u062A\u0647 \u0648 \u062E\u0648\u0634\u200C\u0622\u0647\u0646\u06AF \u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9", tr: "Pijamal\u0131 hasta ya\u011F\u0131z \u015Fof\xF6re \xE7abucak g\xFCvendi 0123456789" },
  logoTitle: "Logo construction",
  logoLead: "Clear space and minimum size, drawn around the approved master file.",
  clearSpace: "Clear space",
  minSize: "Minimum size on screen",
  minPrint: "Minimum size in print",
  clearSpaceX: "{value} \xD7 mark height",
  clearSpacePx: "{value} px at minimum size",
  notSet: "Not set",
  masterFile: "Master file",
  drawnAtMin: "At the approved minimum size, actual pixels",
  constructionNote: "Clear space is measured from the edge of the mark on every side; the minimum size is measured along the mark height.",
  constructionUnknownSize: "The master file does not state its proportions, so the drawing uses a square frame. Values are exact; the frame is not.",
  awaitingKicker: "Awaiting approved asset",
  awaitingColorTitle: "The palette is waiting for approved colour roles",
  awaitingColorBody: "Swatches, combinations and measured contrast are drawn as soon as the colour roles are approved. Nothing here is drawn from a draft.",
  awaitingTypeTitle: "The specimen is waiting for approved type roles",
  awaitingTypeBody: "Each role is set in English, Persian and Turkish once the type roles are approved. Nothing here is set from a draft.",
  awaitingLogoTitle: "Logo construction is waiting",
  awaitingLogoBody: "Clear space and minimum size are drawn only around an approved master file, with an approved size rule. No logo is drawn or implied until then.",
  awaitingSpec: "The size and clear-space rule is not approved yet.",
  awaitingMaster: {
    missing: "No approved master file is registered.",
    example_only: "Only template example placeholders are in the asset manifest. They are never used as a logo.",
    not_previewable: "An approved master is registered but its file could not be safely read.",
    ambiguous: "Several approved logo files are registered and none is named as the master, so none is drawn. Nothing is guessed."
  },
  masterBadge: { draft_tag: "Tagged draft", internal_only: "Internal \xB7 not published" },
  stepMasterAmbiguous: "Two or more approved logo files and none is named as master: tag one master (or tag a light/dark pair on-light and on-dark), or name its asset id in the approved \u201CMaster location\u201D answer (brand.logo.masters).",
  stepMasterNotPreviewable: "Run npm run brand:assets -- check in the brand repository, fix or re-export the file it reports (normalize <id> when it is fixable), then approve the new file.",
  masterCandidates: "Approved logo files: {ids}",
  systemTitle: "Logo system",
  systemLead: "The master with its versions for light and dark backgrounds and the icon, each drawn from its own approved file.",
  plateOnLight: "On a light background",
  plateOnDark: "On a dark background",
  iconTitle: "Icon",
  iconFavicon: "Favicon",
  iconAvatar: "Avatar",
  variantMissing: { on_light: "No approved file for light backgrounds is identified. Tag it on-light.", on_dark: "No approved file for dark backgrounds is identified. Tag it on-dark.", icon: "No approved icon is identified. Tag it icon (or name it in brand.logo.masters when there are several)." },
  roleByFileName: "Placed by its file name; tag the file on-light or on-dark in the asset manifest to confirm.",
  awaitingDraft: "A draft exists and is waiting for review.",
  awaitingWithheld: "The value is restricted and withheld here.",
  awaitingStepsTitle: "To complete this page",
  stepApprove: "Answer and approve \u201C{label}\u201D.",
  stepMaster: "Register the master in the asset manifest with the tag logo, a licence and a checksum, and approve it; name it in brand.logo.masters (or tag it master) if there is more than one logo.",
  ready: "Drawn from approved data",
  waiting: "Waiting",
  pageColor: "Colour",
  pageType: "Type",
  pageLogo: "Logo",
  pageSources: "Sources",
  plate: "Plate {n}"
};
var fa = {
  chapterKicker: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F \xB7 \u0641\u0635\u0644",
  chapterTitle: "\u0647\u0648\u06CC\u062A \u0628\u0635\u0631\u06CC",
  chapterLead: "\u0631\u0646\u06AF\u060C \u062D\u0631\u0648\u0641 \u0648 \u0644\u0648\u06AF\u0648\u060C \u0641\u0642\u0637 \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647. \u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0647\u0646\u0648\u0632 \u0686\u06CC\u0632\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647\u060C \u0635\u0641\u062D\u0647 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F \u0645\u0646\u062A\u0638\u0631 \u0686\u06CC\u0633\u062A.",
  familyLabel: "\u062E\u0627\u0646\u0648\u0627\u062F\u0647",
  sourcesIntro: "\u0647\u0631 \u0635\u0641\u062D\u0647\u0654 \u0627\u06CC\u0646 \u0641\u0635\u0644\u060C \u0648\u0627\u0642\u0639\u06CC\u062A \u06CC\u0627 \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0627\u06CC \u06A9\u0647 \u0627\u0632 \u0622\u0646 \u0631\u0633\u0645 \u0634\u062F\u0647\u060C \u0648\u0636\u0639\u06CC\u062A \u0648 \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0622\u0646.",
  scaleLabel: "\u0627\u0646\u062F\u0627\u0632\u0647",
  mockMark: "\u0646\u0634\u0627\u0646\u0647\u0654 \u0633\u0627\u062E\u062A\u06AF\u06CC",
  openChapter: "\u0641\u0635\u0644 \u0647\u0648\u06CC\u062A \u0628\u0635\u0631\u06CC",
  openChapterHint: "\u067E\u0627\u0644\u062A \u0631\u0646\u06AF\u060C \u0646\u0645\u0648\u0646\u0647\u0654 \u062D\u0631\u0648\u0641 \u0648 \u0633\u0627\u062E\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648\u060C \u0641\u0642\u0637 \u0627\u0632 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.",
  backToChapter: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0641\u0635\u0644",
  printTitle: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E",
  runningHead: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F \xB7 \u0647\u0648\u06CC\u062A \u0628\u0635\u0631\u06CC",
  contents: "\u062F\u0631 \u0627\u06CC\u0646 \u0641\u0635\u0644",
  colorTitle: "\u067E\u0627\u0644\u062A \u0631\u0646\u06AF",
  colorLead: "\u0647\u0631 \u0631\u0646\u06AF \u06CC\u06A9 \u0646\u0642\u0634 \u0627\u0633\u062A. \u0646\u0642\u0634 \u0628\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u0641\u0627\u0645 \u0628\u0627\u0642\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F\u061B \u06A9\u062F hex \u0645\u0642\u062F\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0627\u0645\u0631\u0648\u0632 \u0627\u0633\u062A.",
  rolesTitle: "\u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u0631\u0646\u06AF",
  combinationsTitle: "\u062A\u0631\u06A9\u06CC\u0628\u200C\u0647\u0627",
  combinationsLead: "\u062C\u0641\u062A\u200C\u0647\u0627\u06CC \u0645\u062A\u0646 \u0648 \u0632\u0645\u06CC\u0646\u0647 \u06A9\u0647 \u0646\u0627\u0645 \u0646\u0642\u0634\u200C\u0647\u0627 \u0627\u0639\u0644\u0627\u0645 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F (onPrimary \u0631\u0648\u06CC primary)\u060C \u0628\u0627 \u0646\u0633\u0628\u062A \u0633\u0646\u062C\u06CC\u062F\u0647.",
  combinationsNone: "\u0647\u06CC\u0686 \u0646\u0642\u0634\u06CC \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0645\u062A\u0646 \u0631\u0648\u06CC \u0646\u0642\u0634 \u062F\u06CC\u06AF\u0631 \u0646\u0627\u0645\u200C\u06AF\u0630\u0627\u0631\u06CC \u0646\u0634\u062F\u0647 (\u0645\u062B\u0644\u0627\u064B onPrimary \u0631\u0648\u06CC primary)\u060C \u067E\u0633 \u062A\u0631\u06A9\u06CC\u0628\u06CC \u0627\u0639\u0644\u0627\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u062C\u062F\u0648\u0644 \u0632\u06CC\u0631 \u0647\u0645\u0647\u0654 \u062C\u0641\u062A\u200C\u0647\u0627 \u0631\u0627 \u0645\u06CC\u200C\u0633\u0646\u062C\u062F.",
  contrastTitle: "\u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u0633\u0646\u062C\u06CC\u062F\u0647",
  contrastLead: "\u0628\u0627 \u0641\u0631\u0645\u0648\u0644 \u0646\u0633\u0628\u062A \u06A9\u0646\u062A\u0631\u0627\u0633\u062A WCAG 2 \u0627\u0632 \u06A9\u062F\u0647\u0627\u06CC hex \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0645\u062D\u0627\u0633\u0628\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0646\u0633\u0628\u062A\u060C \u062F\u0648 \u0631\u0646\u06AF \u0631\u0627 \u0645\u06CC\u200C\u0633\u0646\u062C\u062F\u061B \u0645\u0645\u06CC\u0632\u06CC \u062F\u0633\u062A\u0631\u0633\u200C\u067E\u0630\u06CC\u0631\u06CC \u0647\u06CC\u0686 \u0645\u062D\u0635\u0648\u0644\u06CC \u0646\u06CC\u0633\u062A.",
  gridTitle: "\u062C\u062F\u0648\u0644 \u06A9\u0646\u062A\u0631\u0627\u0633\u062A",
  gridHint: "\u0631\u0646\u06AF \u0645\u062A\u0646 \u062F\u0631 \u0631\u062F\u06CC\u0641\u060C \u0632\u0645\u06CC\u0646\u0647 \u062F\u0631 \u0633\u062A\u0648\u0646. \u0646\u0633\u0628\u062A\u200C\u0647\u0627 \u0631\u0648 \u0628\u0647 \u067E\u0627\u06CC\u06CC\u0646 \u06AF\u0631\u062F \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
  gridOmitted: "\u0628\u06CC\u0634 \u0627\u0632 {count} \u0631\u0646\u06AF: \u062C\u062F\u0648\u0644 \u0628\u0631\u0627\u06CC \u062E\u0648\u0627\u0646\u0627\u06CC\u06CC \u062D\u0630\u0641 \u0634\u062F\u0647 \u0627\u0633\u062A. \u062A\u0631\u06A9\u06CC\u0628\u200C\u0647\u0627\u06CC \u0627\u0639\u0644\u0627\u0645\u200C\u0634\u062F\u0647 \u0647\u0645\u0686\u0646\u0627\u0646 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
  gridCorner: "\u0645\u062A\u0646 \u2193 \xB7 \u0632\u0645\u06CC\u0646\u0647 \u2190",
  ratio: "{ratio}:1",
  normalText: "\u0645\u062A\u0646 \u0639\u0627\u062F\u06CC 4.5:1",
  largeText: "\u0645\u062A\u0646 \u062F\u0631\u0634\u062A 3:1",
  enhanced: "\u0633\u0637\u062D \u0628\u0627\u0644\u0627\u062A\u0631 7:1",
  passes: "\u0628\u0631\u0622\u0648\u0631\u062F\u0647",
  fails: "\u06A9\u0645\u062A\u0631",
  textOn: "{fg} \u0631\u0648\u06CC {bg}",
  sample: "\u0645\u062A\u0646 \u0646\u0645\u0648\u0646\u0647",
  typeTitle: "\u062D\u0631\u0648\u0641\u200C\u0646\u06AF\u0627\u0631\u06CC",
  typeLead: "\u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u062D\u0631\u0648\u0641 \u0628\u0627 \u062E\u0627\u0646\u0648\u0627\u062F\u0647\u060C \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0648 \u0627\u0646\u062F\u0627\u0632\u0647\u060C \u062F\u0631 \u0647\u0631 \u0632\u0628\u0627\u0646\u06CC \u06A9\u0647 \u0628\u0631\u0646\u062F \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u062F.",
  fallbackLabel: "\u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646",
  sizeLabel: "{size} px",
  lineHeightLabel: "\u0627\u0631\u062A\u0641\u0627\u0639 \u062E\u0637 {value}",
  sizeUnset: "\u0627\u0646\u062F\u0627\u0632\u0647 \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647",
  fontNote: "\u0628\u0627 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u06AF\u0631 \u0642\u0644\u0645 \u0631\u0648\u06CC \u0627\u06CC\u0646 \u062F\u0633\u062A\u06AF\u0627\u0647 \u0646\u0635\u0628 \u0646\u0628\u0627\u0634\u062F\u060C \u0645\u0631\u0648\u0631\u06AF\u0631 \u0627\u0632 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0633\u0637\u0631\u0647\u0627\u06CC \u0641\u0627\u0631\u0633\u06CC\u060C \u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0642\u0644\u0645 \u0646\u0648\u06CC\u0633\u0647\u200C\u0647\u0627\u06CC \u0639\u0631\u0628\u06CC\u200C\u062E\u0637 \u0646\u062F\u0627\u0631\u062F\u060C \u0628\u0627 \u0648\u0632\u06CC\u0631\u0645\u062A\u0646 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. Studio \u0647\u06CC\u0686 \u0641\u0627\u06CC\u0644 \u0642\u0644\u0645\u06CC \u0627\u0632 \u0628\u0631\u0646\u062F \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F.",
  scriptName: { en: "\u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC", fa: "\u0641\u0627\u0631\u0633\u06CC", tr: "\u062A\u0631\u06A9\u06CC" },
  specimenLine: en.specimenLine,
  logoTitle: "\u0633\u0627\u062E\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648",
  logoLead: "\u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC \u0648 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647\u060C \u067E\u06CC\u0631\u0627\u0645\u0648\u0646 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.",
  clearSpace: "\u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC",
  minSize: "\u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647 \u0631\u0648\u06CC \u0635\u0641\u062D\u0647",
  minPrint: "\u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647 \u062F\u0631 \u0686\u0627\u067E",
  clearSpaceX: "{value} \xD7 \u0627\u0631\u062A\u0641\u0627\u0639 \u0646\u0634\u0627\u0646\u0647",
  clearSpacePx: "{value} px \u062F\u0631 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647",
  notSet: "\u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647",
  masterFile: "\u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC",
  drawnAtMin: "\u062F\u0631 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u067E\u06CC\u06A9\u0633\u0644 \u0648\u0627\u0642\u0639\u06CC",
  constructionNote: "\u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC \u0627\u0632 \u0644\u0628\u0647\u0654 \u0646\u0634\u0627\u0646\u0647 \u062F\u0631 \u0647\u0631 \u0686\u0647\u0627\u0631 \u0633\u0648 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647 \u062F\u0631 \u0627\u0645\u062A\u062F\u0627\u062F \u0627\u0631\u062A\u0641\u0627\u0639 \u0646\u0634\u0627\u0646\u0647 \u0633\u0646\u062C\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
  constructionUnknownSize: "\u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0646\u0627\u0633\u0628 \u062E\u0648\u062F \u0631\u0627 \u0627\u0639\u0644\u0627\u0645 \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u067E\u0633 \u0646\u0642\u0634\u0647 \u0627\u0632 \u0642\u0627\u0628 \u0645\u0631\u0628\u0639\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F. \u0645\u0642\u0627\u062F\u06CC\u0631 \u062F\u0642\u06CC\u0642\u200C\u0627\u0646\u062F\u061B \u0642\u0627\u0628 \u0646\u0647.",
  awaitingKicker: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u062F\u0627\u0631\u0627\u06CC\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  awaitingColorTitle: "\u067E\u0627\u0644\u062A \u0645\u0646\u062A\u0638\u0631 \u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u0631\u0646\u06AF \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0627\u0633\u062A",
  awaitingColorBody: "\u0646\u0645\u0648\u0646\u0647\u200C\u0631\u0646\u06AF\u200C\u0647\u0627\u060C \u062A\u0631\u06A9\u06CC\u0628\u200C\u0647\u0627 \u0648 \u06A9\u0646\u062A\u0631\u0627\u0633\u062A \u0633\u0646\u062C\u06CC\u062F\u0647 \u0628\u0647\u200C\u0645\u062D\u0636 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u0631\u0646\u06AF \u0631\u0633\u0645 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0627\u06CC\u0646\u062C\u0627 \u0627\u0632 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0631\u0633\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  awaitingTypeTitle: "\u0646\u0645\u0648\u0646\u0647\u0654 \u062D\u0631\u0648\u0641 \u0645\u0646\u062A\u0638\u0631 \u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u062D\u0631\u0648\u0641 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0627\u0633\u062A",
  awaitingTypeBody: "\u067E\u0633 \u0627\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u062D\u0631\u0648\u0641\u060C \u0647\u0631 \u0646\u0642\u0634 \u0628\u0647 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC\u060C \u0641\u0627\u0631\u0633\u06CC \u0648 \u062A\u0631\u06A9\u06CC \u0686\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0627\u06CC\u0646\u062C\u0627 \u0627\u0632 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0686\u06CC\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  awaitingLogoTitle: "\u0633\u0627\u062E\u062A\u0627\u0631 \u0644\u0648\u06AF\u0648 \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0633\u062A",
  awaitingLogoBody: "\u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC \u0648 \u06A9\u0645\u062A\u0631\u06CC\u0646 \u0627\u0646\u062F\u0627\u0632\u0647 \u0641\u0642\u0637 \u067E\u06CC\u0631\u0627\u0645\u0648\u0646 \u06CC\u06A9 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0628\u0627 \u0642\u0627\u0639\u062F\u0647\u0654 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0631\u0633\u0645 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u0647\u06CC\u0686 \u0644\u0648\u06AF\u0648\u06CC\u06CC \u0631\u0633\u0645 \u06CC\u0627 \u0627\u0644\u0642\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  awaitingSpec: "\u0642\u0627\u0639\u062F\u0647\u0654 \u0627\u0646\u062F\u0627\u0632\u0647 \u0648 \u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC \u0647\u0646\u0648\u0632 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
  awaitingMaster: {
    missing: "\u0647\u06CC\u0686 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    example_only: "\u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627 \u0641\u0642\u0637 \u0646\u0645\u0648\u0646\u0647\u200C\u0647\u0627\u06CC \u062C\u0627\u06CC\u200C\u0646\u06AF\u0647\u062F\u0627\u0631 \u0642\u0627\u0644\u0628 \u0647\u0633\u062A. \u0627\u06CC\u0646\u200C\u0647\u0627 \u0647\u0631\u06AF\u0632 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0644\u0648\u06AF\u0648 \u0628\u0647 \u06A9\u0627\u0631 \u0646\u0645\u06CC\u200C\u0631\u0648\u0646\u062F.",
    not_previewable: "\u06CC\u06A9 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062B\u0628\u062A \u0634\u062F\u0647\u060C \u0627\u0645\u0627 \u0641\u0627\u06CC\u0644 \u0622\u0646 \u0628\u0647\u200C\u0637\u0648\u0631 \u0627\u0645\u0646 \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F.",
    ambiguous: "\u0686\u0646\u062F \u0641\u0627\u06CC\u0644 \u0644\u0648\u06AF\u0648\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062B\u0628\u062A \u0634\u062F\u0647 \u0648 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u0628\u0647\u200C\u0639\u0646\u0648\u0627\u0646 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u0646\u0627\u0645 \u0628\u0631\u062F\u0647 \u0646\u0634\u062F\u0647\u060C \u067E\u0633 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u0631\u0633\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u062D\u062F\u0633 \u0632\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F."
  },
  masterBadge: { draft_tag: "\u0628\u0631\u0686\u0633\u0628 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633", internal_only: "\u062F\u0627\u062E\u0644\u06CC \xB7 \u0645\u0646\u062A\u0634\u0631\u0646\u0634\u062F\u0647" },
  stepMasterAmbiguous: "\u062F\u0648 \u06CC\u0627 \u0686\u0646\u062F \u0641\u0627\u06CC\u0644 \u0644\u0648\u06AF\u0648\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0647\u0633\u062A \u0648 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u0646\u0627\u0645 \u0628\u0631\u062F\u0647 \u0646\u0634\u062F\u0647: \u0628\u0647 \u06CC\u06A9\u06CC \u0628\u0631\u0686\u0633\u0628 master \u0628\u0632\u0646\u06CC\u062F (\u06CC\u0627 \u0628\u0647 \u062C\u0641\u062A \u0631\u0648\u0634\u0646/\u062A\u06CC\u0631\u0647 \u0628\u0631\u0686\u0633\u0628\u200C\u0647\u0627\u06CC on-light \u0648 on-dark)\u060C \u06CC\u0627 \u0634\u0646\u0627\u0633\u0647\u0654 \u062F\u0627\u0631\u0627\u06CC\u06CC \u0622\u0646 \u0631\u0627 \u062F\u0631 \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \xAB\u0645\u062D\u0644 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC\xBB (brand.logo.masters) \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F.",
  stepMasterNotPreviewable: "\u062F\u0631 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F npm run brand:assets -- check \u0631\u0627 \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F\u060C \u0641\u0627\u06CC\u0644\u06CC \u0631\u0627 \u06A9\u0647 \u06AF\u0632\u0627\u0631\u0634 \u0645\u06CC\u200C\u062F\u0647\u062F \u0627\u0635\u0644\u0627\u062D \u06CC\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u062E\u0631\u0648\u062C\u06CC \u0628\u06AF\u06CC\u0631\u06CC\u062F (\u0627\u06AF\u0631 \u0642\u0627\u0628\u0644 \u0627\u0635\u0644\u0627\u062D \u0627\u0633\u062A \u0628\u0627 normalize <id>)\u060C \u0633\u067E\u0633 \u0641\u0627\u06CC\u0644 \u062A\u0627\u0632\u0647 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
  masterCandidates: "\u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0644\u0648\u06AF\u0648\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647: {ids}",
  systemTitle: "\u0646\u0638\u0627\u0645 \u0644\u0648\u06AF\u0648",
  systemLead: "\u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u0622\u0646 \u0628\u0631\u0627\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646 \u0648 \u062A\u06CC\u0631\u0647 \u0648 \u0622\u06CC\u06A9\u0648\u0646\u060C \u0647\u0631 \u06A9\u062F\u0627\u0645 \u0627\u0632 \u0641\u0627\u06CC\u0644 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062E\u0648\u062F\u0634.",
  plateOnLight: "\u0631\u0648\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646",
  plateOnDark: "\u0631\u0648\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u062A\u06CC\u0631\u0647",
  iconTitle: "\u0622\u06CC\u06A9\u0648\u0646",
  iconFavicon: "\u0641\u0627\u0648\u0622\u06CC\u06A9\u0648\u0646",
  iconAvatar: "\u0622\u0648\u0627\u062A\u0627\u0631",
  variantMissing: { on_light: "\u0641\u0627\u06CC\u0644 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u0631\u0648\u0634\u0646 \u0645\u0634\u062E\u0635 \u0646\u06CC\u0633\u062A. \u0628\u0647 \u0622\u0646 \u0628\u0631\u0686\u0633\u0628 on-light \u0628\u0632\u0646\u06CC\u062F.", on_dark: "\u0641\u0627\u06CC\u0644 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647\u0654 \u062A\u06CC\u0631\u0647 \u0645\u0634\u062E\u0635 \u0646\u06CC\u0633\u062A. \u0628\u0647 \u0622\u0646 \u0628\u0631\u0686\u0633\u0628 on-dark \u0628\u0632\u0646\u06CC\u062F.", icon: "\u0622\u06CC\u06A9\u0648\u0646 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0645\u0634\u062E\u0635 \u0646\u06CC\u0633\u062A. \u0628\u0647 \u0622\u0646 \u0628\u0631\u0686\u0633\u0628 icon \u0628\u0632\u0646\u06CC\u062F (\u06CC\u0627 \u0627\u06AF\u0631 \u0686\u0646\u062F \u062A\u0627 \u0647\u0633\u062A\u060C \u062F\u0631 brand.logo.masters \u0646\u0627\u0645\u0634 \u0631\u0627 \u0628\u06CC\u0627\u0648\u0631\u06CC\u062F)." },
  roleByFileName: "\u0627\u0632 \u0631\u0648\u06CC \u0646\u0627\u0645 \u0641\u0627\u06CC\u0644 \u062C\u0627\u06CC\u200C\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F\u0647\u061B \u0628\u0631\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u060C \u062F\u0631 \u0645\u0627\u0646\u06CC\u0641\u0633\u062A \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627 \u0628\u0647 \u0641\u0627\u06CC\u0644 \u0628\u0631\u0686\u0633\u0628 on-light \u06CC\u0627 on-dark \u0628\u0632\u0646\u06CC\u062F.",
  awaitingDraft: "\u06CC\u06A9 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0647\u0633\u062A \u0648 \u0645\u0646\u062A\u0638\u0631 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0627\u0633\u062A.",
  awaitingWithheld: "\u0627\u06CC\u0646 \u0645\u0642\u062F\u0627\u0631 \u0645\u062D\u062F\u0648\u062F \u0627\u0633\u062A \u0648 \u0627\u06CC\u0646\u062C\u0627 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  awaitingStepsTitle: "\u0628\u0631\u0627\u06CC \u06A9\u0627\u0645\u0644\u200C\u0634\u062F\u0646 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647",
  stepApprove: "\xAB{label}\xBB \u0631\u0627 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
  stepMaster: "\u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u0631\u0627 \u0628\u0627 \u0628\u0631\u0686\u0633\u0628 logo\u060C \u0645\u062C\u0648\u0632 \u0648 checksum \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627 \u062B\u0628\u062A \u0648 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F\u061B \u0627\u06AF\u0631 \u0628\u06CC\u0634 \u0627\u0632 \u06CC\u06A9 \u0644\u0648\u06AF\u0648 \u0647\u0633\u062A\u060C \u0622\u0646 \u0631\u0627 \u062F\u0631 brand.logo.masters \u0646\u0627\u0645 \u0628\u0628\u0631\u06CC\u062F (\u06CC\u0627 \u0628\u0631\u0686\u0633\u0628 master \u0628\u0632\u0646\u06CC\u062F).",
  ready: "\u0631\u0633\u0645\u200C\u0634\u062F\u0647 \u0627\u0632 \u062F\u0627\u062F\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  waiting: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631",
  pageColor: "\u0631\u0646\u06AF",
  pageType: "\u062D\u0631\u0648\u0641",
  pageLogo: "\u0644\u0648\u06AF\u0648",
  pageSources: "\u0645\u0646\u0627\u0628\u0639",
  plate: "\u0635\u0641\u062D\u0647\u0654 {n}"
};
var tr = {
  chapterKicker: "Marka Kitab\u0131 \xB7 B\xF6l\xFCm",
  chapterTitle: "G\xF6rsel kimlik",
  chapterLead: "Renk, yaz\u0131 ve logo; yaln\u0131zca onayl\u0131 bilgilerden ve onayl\u0131 ana dosyadan \xE7izilir. Hen\xFCz onayl\u0131 bir \u015Fey yoksa sayfa neyi bekledi\u011Fini s\xF6yler.",
  familyLabel: "Aile",
  sourcesIntro: "Bu b\xF6l\xFCmdeki her levha, \xE7izildi\u011Fi bilgi veya varl\u0131k, durumu ve onayl\u0131 s\xFCr\xFCm\xFC.",
  scaleLabel: "Boyut",
  mockMark: "SAHTE \u0130\u015EARET",
  openChapter: "G\xF6rsel kimlik b\xF6l\xFCm\xFC",
  openChapterHint: "Renk paleti, yaz\u0131 \xF6rne\u011Fi ve logo yap\u0131s\u0131; yaln\u0131zca onayl\u0131 bilgilerden.",
  backToChapter: "B\xF6l\xFCme d\xF6n",
  printTitle: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC",
  runningHead: "Marka Kitab\u0131 \xB7 G\xF6rsel kimlik",
  contents: "Bu b\xF6l\xFCmde",
  colorTitle: "Renk paleti",
  colorLead: "Her renk bir rold\xFCr. Roller ton de\u011Fi\u015Fse de kal\u0131r; hex bug\xFCnk\xFC onayl\u0131 de\u011Ferdir.",
  rolesTitle: "Renk rolleri",
  combinationsTitle: "Kombinasyonlar",
  combinationsLead: "Rollerin ad\u0131yla bildirdi\u011Fi metin ve zemin \xE7iftleri (primary \xFCzerinde onPrimary), \xF6l\xE7\xFClen oranla.",
  combinationsNone: "Hi\xE7bir rol ba\u015Fka bir rol\xFCn \xFCzerindeki metin olarak adland\u0131r\u0131lmam\u0131\u015F (\xF6r. primary \xFCzerinde onPrimary), bu y\xFCzden kombinasyon bildirilmedi. A\u015Fa\u011F\u0131daki tablo her \xE7ifti \xF6l\xE7er.",
  contrastTitle: "\xD6l\xE7\xFClen kontrast",
  contrastLead: "Onayl\u0131 hex de\u011Ferlerinden WCAG 2 kontrast oran\u0131 form\xFCl\xFCyle hesaplan\u0131r. Bir oran iki rengi \xF6l\xE7er; hi\xE7bir \xFCr\xFCn\xFCn eri\u015Filebilirlik denetimi de\u011Fildir.",
  gridTitle: "Kontrast tablosu",
  gridHint: "Sat\u0131rda metin rengi, s\xFCtunda zemin. Oranlar a\u015Fa\u011F\u0131 yuvarlan\u0131r.",
  gridOmitted: "{count} renkten fazla: tablo okunakl\u0131 kals\u0131n diye \xE7\u0131kar\u0131ld\u0131. Bildirilen kombinasyonlar yine \xF6l\xE7\xFCl\xFCr.",
  gridCorner: "Metin \u2193 \xB7 Zemin \u2192",
  ratio: "{ratio}:1",
  normalText: "Normal metin 4.5:1",
  largeText: "B\xFCy\xFCk metin 3:1",
  enhanced: "Geli\u015Fmi\u015F 7:1",
  passes: "Kar\u015F\u0131l\u0131yor",
  fails: "Alt\u0131nda",
  textOn: "{bg} \xFCzerinde {fg}",
  sample: "\xD6rnek metin",
  typeTitle: "Tipografi",
  typeLead: "Aile, yedek ve boyutuyla yaz\u0131 rolleri; markan\u0131n destekledi\u011Fi her dilde dizilmi\u015F.",
  fallbackLabel: "Yedek",
  sizeLabel: "{size} px",
  lineHeightLabel: "sat\u0131r y\xFCksekli\u011Fi {value}",
  sizeUnset: "Boyut belirlenmedi",
  fontNote: "Aile ad\u0131yla dizilir. Yaz\u0131 tipi bu cihazda y\xFCkl\xFC de\u011Filse taray\u0131c\u0131 yede\u011Fi kullan\u0131r; Fars\xE7a sat\u0131rlar, yaz\u0131 tipinde Arap alfabesi glifleri yoksa Vazirmatn ile g\xF6sterilir. Studio markadan hi\xE7bir yaz\u0131 tipi dosyas\u0131 y\xFCklemez.",
  scriptName: { en: "\u0130ngilizce", fa: "Fars\xE7a", tr: "T\xFCrk\xE7e" },
  specimenLine: en.specimenLine,
  logoTitle: "Logo yap\u0131s\u0131",
  logoLead: "Onayl\u0131 ana dosyan\u0131n \xE7evresinde bo\u015Fluk ve en k\xFC\xE7\xFCk boyut.",
  clearSpace: "Bo\u015Fluk",
  minSize: "Ekranda en k\xFC\xE7\xFCk boyut",
  minPrint: "Bask\u0131da en k\xFC\xE7\xFCk boyut",
  clearSpaceX: "{value} \xD7 i\u015Faret y\xFCksekli\u011Fi",
  clearSpacePx: "en k\xFC\xE7\xFCk boyutta {value} px",
  notSet: "Belirlenmedi",
  masterFile: "Ana dosya",
  drawnAtMin: "Onayl\u0131 en k\xFC\xE7\xFCk boyutta, ger\xE7ek piksel",
  constructionNote: "Bo\u015Fluk her y\xF6nde i\u015Faretin kenar\u0131ndan \xF6l\xE7\xFCl\xFCr; en k\xFC\xE7\xFCk boyut i\u015Faret y\xFCksekli\u011Fi boyunca \xF6l\xE7\xFCl\xFCr.",
  constructionUnknownSize: "Ana dosya oranlar\u0131n\u0131 belirtmiyor, bu y\xFCzden \xE7izim kare bir \xE7er\xE7eve kullan\u0131r. De\u011Ferler kesindir; \xE7er\xE7eve de\u011Fildir.",
  awaitingKicker: "Onayl\u0131 varl\u0131k bekleniyor",
  awaitingColorTitle: "Palet onayl\u0131 renk rollerini bekliyor",
  awaitingColorBody: "Renk \xF6rnekleri, kombinasyonlar ve \xF6l\xE7\xFClen kontrast, renk rolleri onaylan\u0131nca \xE7izilir. Burada hi\xE7bir \u015Fey taslaktan \xE7izilmez.",
  awaitingTypeTitle: "Yaz\u0131 \xF6rne\u011Fi onayl\u0131 yaz\u0131 rollerini bekliyor",
  awaitingTypeBody: "Yaz\u0131 rolleri onaylan\u0131nca her rol \u0130ngilizce, Fars\xE7a ve T\xFCrk\xE7e dizilir. Burada hi\xE7bir \u015Fey taslaktan dizilmez.",
  awaitingLogoTitle: "Logo yap\u0131s\u0131 bekliyor",
  awaitingLogoBody: "Bo\u015Fluk ve en k\xFC\xE7\xFCk boyut yaln\u0131zca onayl\u0131 bir ana dosyan\u0131n \xE7evresinde, onayl\u0131 bir boyut kural\u0131yla \xE7izilir. O zamana kadar hi\xE7bir logo \xE7izilmez veya ima edilmez.",
  awaitingSpec: "Boyut ve bo\u015Fluk kural\u0131 hen\xFCz onaylanmad\u0131.",
  awaitingMaster: {
    missing: "Kay\u0131tl\u0131 onayl\u0131 bir ana dosya yok.",
    example_only: "Varl\u0131k listesinde yaln\u0131zca \u015Fablon \xF6rnek yer tutucular\u0131 var. Bunlar asla logo olarak kullan\u0131lmaz.",
    not_previewable: "Onayl\u0131 bir ana dosya kay\u0131tl\u0131, ancak dosyas\u0131 g\xFCvenle okunamad\u0131.",
    ambiguous: "Birden \xE7ok onayl\u0131 logo dosyas\u0131 kay\u0131tl\u0131 ve hi\xE7biri ana dosya olarak adland\u0131r\u0131lmam\u0131\u015F, bu y\xFCzden hi\xE7biri \xE7izilmiyor. Tahmin yap\u0131lmaz."
  },
  masterBadge: { draft_tag: "Taslak etiketli", internal_only: "Dahili \xB7 yay\u0131mlanmad\u0131" },
  stepMasterAmbiguous: "\u0130ki veya daha fazla onayl\u0131 logo dosyas\u0131 var ve hi\xE7biri ana dosya olarak adland\u0131r\u0131lmam\u0131\u015F: birine master etiketi verin (veya a\xE7\u0131k/koyu \xE7ifte on-light ve on-dark etiketleri), ya da varl\u0131k kimli\u011Fini onayl\u0131 \u201CAna dosya konumu\u201D yan\u0131t\u0131nda (brand.logo.masters) yaz\u0131n.",
  stepMasterNotPreviewable: "Marka deposunda npm run brand:assets -- check komutunu \xE7al\u0131\u015Ft\u0131r\u0131n, bildirdi\u011Fi dosyay\u0131 d\xFCzeltin veya yeniden d\u0131\u015Fa aktar\u0131n (d\xFCzeltilebiliyorsa normalize <id>), ard\u0131ndan yeni dosyay\u0131 onaylay\u0131n.",
  masterCandidates: "Onayl\u0131 logo dosyalar\u0131: {ids}",
  systemTitle: "Logo sistemi",
  systemLead: "Ana dosya, a\xE7\u0131k ve koyu arka planlar i\xE7in s\xFCr\xFCmleri ve simge; her biri kendi onayl\u0131 dosyas\u0131ndan \xE7izilir.",
  plateOnLight: "A\xE7\u0131k arka planda",
  plateOnDark: "Koyu arka planda",
  iconTitle: "Simge",
  iconFavicon: "Favicon",
  iconAvatar: "Avatar",
  variantMissing: { on_light: "A\xE7\u0131k arka planlar i\xE7in onayl\u0131 bir dosya belirlenmedi. on-light etiketi verin.", on_dark: "Koyu arka planlar i\xE7in onayl\u0131 bir dosya belirlenmedi. on-dark etiketi verin.", icon: "Onayl\u0131 bir simge belirlenmedi. icon etiketi verin (birden \xE7ok varsa brand.logo.masters i\xE7inde adland\u0131r\u0131n)." },
  roleByFileName: "Dosya ad\u0131na g\xF6re yerle\u015Ftirildi; do\u011Frulamak i\xE7in varl\u0131k listesinde dosyaya on-light veya on-dark etiketi verin.",
  awaitingDraft: "Bir taslak var ve incelemeyi bekliyor.",
  awaitingWithheld: "De\u011Fer k\u0131s\u0131tl\u0131 ve burada g\xF6sterilmiyor.",
  awaitingStepsTitle: "Bu sayfay\u0131 tamamlamak i\xE7in",
  stepApprove: "\u201C{label}\u201D sorusunu yan\u0131tlay\u0131n ve onaylay\u0131n.",
  stepMaster: "Ana dosyay\u0131 varl\u0131k listesine logo etiketi, lisans ve checksum ile kaydedip onaylay\u0131n; birden \xE7ok logo varsa brand.logo.masters i\xE7inde adland\u0131r\u0131n (veya master etiketi verin).",
  ready: "Onayl\u0131 veriden \xE7izildi",
  waiting: "Bekliyor",
  pageColor: "Renk",
  pageType: "Yaz\u0131",
  pageLogo: "Logo",
  pageSources: "Kaynaklar",
  plate: "Levha {n}"
};
var IDENTITY_TEXT = { en, fa, tr };

// packages/brand-core/src/visual/i18n.ts
var VISUAL_LANGS = ["en", "fa", "tr"];
function isVisualLang(value2) {
  return typeof value2 === "string" && VISUAL_LANGS.includes(value2);
}
var en2 = {
  dir: "ltr",
  identity: IDENTITY_TEXT.en,
  entities: ENTITY_TEXT.en,
  zone: {
    key_partners: { title: "Key partners", prompt: "Who do we depend on to deliver?" },
    key_activities: { title: "Key activities", prompt: "What must we do well, every week?" },
    key_resources: { title: "Key resources", prompt: "Which assets make the offer possible?" },
    value_propositions: { title: "Value propositions", prompt: "Why does the customer choose us?" },
    customer_relationships: { title: "Customer relationships", prompt: "How do we win, keep and support customers?" },
    channels: { title: "Channels", prompt: "How do customers find, buy and receive the offer?" },
    customer_segments: { title: "Customer segments", prompt: "Who do we create value for?" },
    cost_structure: { title: "Cost structure", prompt: "What drives our costs?" },
    revenue_streams: { title: "Revenue streams", prompt: "How does value turn into income?" }
  },
  state: {
    approved: "Approved",
    assumption: "Draft, not approved",
    recommendation: "Suggestion, not a decision",
    missing: "Missing",
    withheld: "Withheld",
    stale: "Approved, review overdue",
    conflicting: "Conflicting",
    not_applicable: "Not applicable"
  },
  zoneState: { complete: "Complete", partial: "Partial", missing: "Missing", withheld: "Withheld", not_applicable: "Not applicable" },
  missingReason: { unanswered: "Not answered yet", unknown: "The owner said this is unknown", skipped: "Skipped by the owner", deprecated: "The last answer was deprecated", not_published: "Not published" },
  claim: {
    informed_by: "Informed by",
    aligned_with: "Aligned with",
    verified_against: "Verified against",
    externally_certified: "Externally certified",
    original_professional_template: "Original Brand OS template"
  },
  proposed: {
    "business.model.key_activities": "Which activities must the business perform well to deliver each offer?",
    "business.model.key_resources": "Which resources (people, systems, IP, assets) are essential to deliver each offer?",
    "business.model.segments": "List each customer segment separately and say how it differs from the others.",
    "business.model.cost_items": "List the main cost categories, fixed or variable, without amounts."
  },
  text: {
    canvasTitle: "Business Model Canvas",
    canvasKicker: "Strategy \xB7 Business model",
    editionInternal: "Internal edition",
    editionPublic: "Public edition",
    editionInternalNote: "Approved facts are canonical. Drafts are labelled and are not decisions. Restricted values are withheld. Gaps stay gaps.",
    editionPublicNote: "Only approved, published, public facts. Drafts and restricted values are left out.",
    illustrative: "ILLUSTRATIVE / MOCK DATA",
    illustrativeNote: "A golden example built from invented fixture data. Not a real brand, not approved, not a template answer.",
    asOf: "As of {date}",
    asOfNone: "No approved fact yet",
    asOfLabel: "Data as of",
    commit: "Source commit",
    classification: "Classification",
    classInternal: "Internal. Owner and team only.",
    classPublic: "Public",
    zoneIndex: "Canvas zones",
    zoneIndexHint: "Jump to a zone. The canvas keeps its nine-zone layout and scrolls sideways on small screens.",
    nextQuestions: "To fill this zone",
    proposedQuestion: "New question (proposed, not in the interview yet)",
    existingQuestion: "Answer and approve",
    related: "Related answers",
    relatedHint: "These may inform the zone; they do not answer it.",
    gapTitle: "No question owns this zone yet",
    gapBody: "Nothing is shown here until the owner answers and approves it. Nothing was guessed.",
    withheldValue: "Restricted value withheld",
    notApplicableZone: "The owner marked this not applicable.",
    notApplicableProfile: "Not applicable to this profile.",
    standsFor: "From your personal answer {id}.",
    profileNotApplicableBody: "Nothing in this framework applies to this brand\u2019s interview profile and no personal answer stands in for it. For a full plan of a venture, set brand.profile to universal with the personal module on, or give the venture its own repository.",
    relationshipsTitle: "Links between zones",
    relationshipsBody: "Segments, offers, channels and revenue streams are single prose answers today, so no link between them is drawn. Linked entities are a planned interview change.",
    sourcesTitle: "Sources and states",
    sourcesIntro: "Every entry on the canvas, the question that owns it, its state and its approved version.",
    colField: "Field",
    colState: "State",
    colVersion: "Version",
    colApproved: "Approved on",
    colSources: "Source ids",
    frameworkTitle: "Framework",
    licence: "Licence status",
    sourceLink: "Reference",
    notVerified: "Source page not re-checked by a person yet",
    checked: "Source checked",
    summaryTitle: "Coverage",
    decisionTitle: "What this supports",
    decisionBody: "A one-page read of how the business creates, delivers and captures value, with every gap named.",
    printTitle: "Print or save as PDF",
    printHint: "Use the browser\u2019s Print command. The page is laid out for A3 landscape; the second page lists every source.",
    pageCanvas: "Canvas",
    pageSources: "Sources",
    statusLegend: "States",
    noValueYet: "Not answered yet",
    version: "v{version}",
    openPrint: "Print view (internal)",
    openPrintPublic: "Print view (public)",
    backToCanvas: "Back to the canvas",
    notApplicableTitle: "Not used for this profile",
    notApplicableBody: "A personal brand gets a Business Model Canvas only with the founder or consultant facet.",
    runningHead: "Brand OS \xB7 Business Model Canvas",
    pending: "This commit was synced before the canvas existed. Press Refresh to build it.",
    unavailable: "The canvas could not be built from this commit. The rest of the brand is unaffected.",
    printButton: "Print or save as PDF",
    printOnly: "Studio is read-only: this view only prints what is already merged.",
    detailsTitle: "Details and sources",
    detailsFields: "Question ids",
    sourceShort: "Source"
  }
};
var fa2 = {
  dir: "rtl",
  identity: IDENTITY_TEXT.fa,
  entities: ENTITY_TEXT.fa,
  zone: {
    key_partners: { title: "\u0634\u0631\u06A9\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC", prompt: "\u0628\u0631\u0627\u06CC \u0627\u0631\u0627\u0626\u0647 \u0628\u0647 \u0686\u0647 \u06A9\u0633\u0627\u0646\u06CC \u0648\u0627\u0628\u0633\u062A\u0647\u200C\u0627\u06CC\u0645\u061F" },
    key_activities: { title: "\u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC", prompt: "\u0686\u0647 \u06A9\u0627\u0631\u0647\u0627\u06CC\u06CC \u0631\u0627 \u0628\u0627\u06CC\u062F \u0647\u0631 \u0647\u0641\u062A\u0647 \u062E\u0648\u0628 \u0627\u0646\u062C\u0627\u0645 \u062F\u0647\u06CC\u0645\u061F" },
    key_resources: { title: "\u0645\u0646\u0627\u0628\u0639 \u06A9\u0644\u06CC\u062F\u06CC", prompt: "\u06A9\u062F\u0627\u0645 \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627 \u0627\u0631\u0627\u0626\u0647\u0654 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0631\u0627 \u0645\u0645\u06A9\u0646 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F\u061F" },
    value_propositions: { title: "\u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC", prompt: "\u0645\u0634\u062A\u0631\u06CC \u0686\u0631\u0627 \u0645\u0627 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F" },
    customer_relationships: { title: "\u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0645\u0634\u062A\u0631\u06CC", prompt: "\u0686\u06AF\u0648\u0646\u0647 \u0645\u0634\u062A\u0631\u06CC \u0631\u0627 \u062C\u0630\u0628\u060C \u062D\u0641\u0638 \u0648 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u06CC\u0645\u061F" },
    channels: { title: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627", prompt: "\u0645\u0634\u062A\u0631\u06CC \u0686\u06AF\u0648\u0646\u0647 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0631\u0627 \u067E\u06CC\u062F\u0627 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0645\u06CC\u200C\u062E\u0631\u062F \u0648 \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F\u061F" },
    customer_segments: { title: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC", prompt: "\u0628\u0631\u0627\u06CC \u0686\u0647 \u06A9\u0633\u0627\u0646\u06CC \u0627\u0631\u0632\u0634 \u0645\u06CC\u200C\u0633\u0627\u0632\u06CC\u0645\u061F" },
    cost_structure: { title: "\u0633\u0627\u062E\u062A\u0627\u0631 \u0647\u0632\u06CC\u0646\u0647", prompt: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0647\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u0645\u0627 \u0631\u0627 \u0645\u06CC\u200C\u0633\u0627\u0632\u062F\u061F" },
    revenue_streams: { title: "\u062C\u0631\u06CC\u0627\u0646\u200C\u0647\u0627\u06CC \u062F\u0631\u0622\u0645\u062F", prompt: "\u0627\u0631\u0632\u0634 \u0686\u06AF\u0648\u0646\u0647 \u0628\u0647 \u062F\u0631\u0622\u0645\u062F \u062A\u0628\u062F\u06CC\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F\u061F" }
  },
  state: {
    approved: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
    assumption: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u060C \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647",
    recommendation: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u060C \u0646\u0647 \u062A\u0635\u0645\u06CC\u0645",
    missing: "\u062B\u0628\u062A\u200C\u0646\u0634\u062F\u0647",
    withheld: "\u0645\u062D\u0631\u0645\u0627\u0646\u0647\u060C \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    stale: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0639\u0642\u0628 \u0627\u0641\u062A\u0627\u062F\u0647",
    conflicting: "\u0645\u062A\u0646\u0627\u0642\u0636",
    not_applicable: "\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F"
  },
  zoneState: { complete: "\u06A9\u0627\u0645\u0644", partial: "\u0646\u0627\u0642\u0635", missing: "\u062B\u0628\u062A\u200C\u0646\u0634\u062F\u0647", withheld: "\u0645\u062D\u0631\u0645\u0627\u0646\u0647", not_applicable: "\u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F" },
  missingReason: { unanswered: "\u0647\u0646\u0648\u0632 \u067E\u0627\u0633\u062E\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647", unknown: "\u0645\u0627\u0644\u06A9 \u06AF\u0641\u062A\u0647 \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0627\u0633\u062A", skipped: "\u0645\u0627\u0644\u06A9 \u0627\u0632 \u0622\u0646 \u06AF\u0630\u0634\u062A\u0647 \u0627\u0633\u062A", deprecated: "\u0622\u062E\u0631\u06CC\u0646 \u067E\u0627\u0633\u062E \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F\u0647", not_published: "\u0645\u0646\u062A\u0634\u0631 \u0646\u0634\u062F\u0647" },
  claim: {
    informed_by: "\u0628\u0627 \u0627\u0644\u0647\u0627\u0645 \u0627\u0632",
    aligned_with: "\u0647\u0645\u200C\u0631\u0627\u0633\u062A\u0627 \u0628\u0627",
    verified_against: "\u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647 \u062F\u0631 \u0628\u0631\u0627\u0628\u0631",
    externally_certified: "\u062F\u0627\u0631\u0627\u06CC \u06AF\u0648\u0627\u0647\u06CC \u0645\u0633\u062A\u0642\u0644",
    original_professional_template: "\u0642\u0627\u0644\u0628 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC Brand OS"
  },
  proposed: {
    "business.model.key_activities": "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0628\u0631\u0627\u06CC \u0627\u0631\u0627\u0626\u0647\u0654 \u0647\u0631 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0628\u0627\u06CC\u062F \u06A9\u062F\u0627\u0645 \u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627 \u0631\u0627 \u062E\u0648\u0628 \u0627\u0646\u062C\u0627\u0645 \u062F\u0647\u062F\u061F",
    "business.model.key_resources": "\u0628\u0631\u0627\u06CC \u0627\u0631\u0627\u0626\u0647\u0654 \u0647\u0631 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u060C \u06A9\u062F\u0627\u0645 \u0645\u0646\u0627\u0628\u0639 (\u0627\u0641\u0631\u0627\u062F\u060C \u0633\u0627\u0645\u0627\u0646\u0647\u200C\u0647\u0627\u060C \u062F\u0627\u0631\u0627\u06CC\u06CC \u0641\u06A9\u0631\u06CC\u060C \u062A\u062C\u0647\u06CC\u0632\u0627\u062A) \u0636\u0631\u0648\u0631\u06CC\u200C\u0627\u0646\u062F\u061F",
    "business.model.segments": "\u0647\u0631 \u0628\u062E\u0634 \u0645\u0634\u062A\u0631\u06CC \u0631\u0627 \u062C\u062F\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F \u0648 \u0628\u06AF\u0648\u06CC\u06CC\u062F \u0628\u0627 \u0628\u0642\u06CC\u0647 \u0686\u0647 \u0641\u0631\u0642\u06CC \u062F\u0627\u0631\u062F.",
    "business.model.cost_items": "\u062F\u0633\u062A\u0647\u200C\u0647\u0627\u06CC \u0627\u0635\u0644\u06CC \u0647\u0632\u06CC\u0646\u0647 \u0631\u0627\u060C \u062B\u0627\u0628\u062A \u06CC\u0627 \u0645\u062A\u063A\u06CC\u0631\u060C \u0628\u062F\u0648\u0646 \u0645\u0628\u0644\u063A \u0641\u0647\u0631\u0633\u062A \u06A9\u0646\u06CC\u062F."
  },
  text: {
    canvasTitle: "\u0628\u0648\u0645 \u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
    canvasKicker: "\u0627\u0633\u062A\u0631\u0627\u062A\u0698\u06CC \xB7 \u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
    editionInternal: "\u0646\u0633\u062E\u0647\u0654 \u062F\u0627\u062E\u0644\u06CC",
    editionPublic: "\u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC",
    editionInternalNote: "\u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0645\u0631\u062C\u0639\u200C\u0627\u0646\u062F. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0628\u0631\u0686\u0633\u0628 \u062F\u0627\u0631\u0646\u062F \u0648 \u062A\u0635\u0645\u06CC\u0645 \u0646\u06CC\u0633\u062A\u0646\u062F. \u0645\u0642\u0627\u062F\u06CC\u0631 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F. \u062C\u0627\u0647\u0627\u06CC \u062E\u0627\u0644\u06CC \u062E\u0627\u0644\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F.",
    editionPublicNote: "\u0641\u0642\u0637 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0645\u0646\u062A\u0634\u0631\u0634\u062F\u0647 \u0648 \u0639\u0645\u0648\u0645\u06CC. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0648 \u0645\u0642\u0627\u062F\u06CC\u0631 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u062D\u0630\u0641 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    illustrative: "ILLUSTRATIVE / MOCK DATA \xB7 \u0646\u0645\u0648\u0646\u0647\u0654 \u0633\u0627\u062E\u062A\u06AF\u06CC",
    illustrativeNote: "\u0646\u0645\u0648\u0646\u0647\u0654 \u0645\u0631\u062C\u0639 \u0633\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0627\u0632 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0633\u0627\u062E\u062A\u06AF\u06CC. \u0628\u0631\u0646\u062F \u0648\u0627\u0642\u0639\u06CC \u0646\u06CC\u0633\u062A\u060C \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647 \u0648 \u067E\u0627\u0633\u062E \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0646\u06CC\u0633\u062A.",
    asOf: "\u0628\u0647\u200C\u0631\u0648\u0632 \u062A\u0627 {date}",
    asOfNone: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0648\u0627\u0642\u0639\u06CC\u062A\u06CC \u062A\u0623\u06CC\u06CC\u062F \u0646\u0634\u062F\u0647",
    asOfLabel: "\u062A\u0627\u0631\u06CC\u062E \u062F\u0627\u062F\u0647\u200C\u0647\u0627",
    commit: "\u06A9\u0627\u0645\u06CC\u062A \u0645\u0646\u0628\u0639",
    classification: "\u0633\u0637\u062D \u062F\u0633\u062A\u0631\u0633\u06CC",
    classInternal: "\u062F\u0627\u062E\u0644\u06CC\u061B \u0641\u0642\u0637 \u0645\u0627\u0644\u06A9 \u0648 \u062A\u06CC\u0645.",
    classPublic: "\u0639\u0645\u0648\u0645\u06CC",
    zoneIndex: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0628\u0648\u0645",
    zoneIndexHint: "\u0628\u0647 \u06CC\u06A9 \u0628\u062E\u0634 \u0628\u0631\u0648\u06CC\u062F. \u0628\u0648\u0645 \u0686\u06CC\u062F\u0645\u0627\u0646 \u0646\u064F\u0647\u200C\u0628\u062E\u0634\u06CC \u062E\u0648\u062F \u0631\u0627 \u062D\u0641\u0638 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u062F\u0631 \u0635\u0641\u062D\u0647\u200C\u0647\u0627\u06CC \u06A9\u0648\u0686\u06A9 \u0627\u0641\u0642\u06CC \u067E\u06CC\u0645\u0627\u06CC\u0634 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    nextQuestions: "\u0628\u0631\u0627\u06CC \u062A\u06A9\u0645\u06CC\u0644 \u0627\u06CC\u0646 \u0628\u062E\u0634",
    proposedQuestion: "\u067E\u0631\u0633\u0634 \u062C\u062F\u06CC\u062F (\u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC\u060C \u0647\u0646\u0648\u0632 \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647 \u0646\u06CC\u0633\u062A)",
    existingQuestion: "\u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F",
    related: "\u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0645\u0631\u062A\u0628\u0637",
    relatedHint: "\u0645\u0645\u06A9\u0646 \u0627\u0633\u062A \u0628\u0647 \u0627\u06CC\u0646 \u0628\u062E\u0634 \u06A9\u0645\u06A9 \u06A9\u0646\u0646\u062F\u060C \u0627\u0645\u0627 \u067E\u0627\u0633\u062E \u0622\u0646 \u0646\u06CC\u0633\u062A\u0646\u062F.",
    gapTitle: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u067E\u0631\u0633\u0634\u06CC \u0645\u0627\u0644\u06A9 \u0627\u06CC\u0646 \u0628\u062E\u0634 \u0646\u06CC\u0633\u062A",
    gapBody: "\u062A\u0627 \u0648\u0642\u062A\u06CC \u0645\u0627\u0644\u06A9 \u067E\u0627\u0633\u062E \u0646\u062F\u0647\u062F \u0648 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06A9\u0646\u062F\u060C \u0627\u06CC\u0646\u062C\u0627 \u0686\u06CC\u0632\u06CC \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632\u06CC \u062D\u062F\u0633 \u0632\u062F\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
    withheldValue: "\u0645\u0642\u062F\u0627\u0631 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    notApplicableZone: "\u0645\u0627\u0644\u06A9 \u0627\u06CC\u0646 \u0645\u0648\u0631\u062F \u0631\u0627 \u0646\u0627\u0645\u0631\u062A\u0628\u0637 \u0627\u0639\u0644\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A.",
    notApplicableProfile: "\u062F\u0631 \u0627\u06CC\u0646 \u0646\u0645\u0627\u06CC\u0647 \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F.",
    standsFor: "\u0627\u0632 \u067E\u0627\u0633\u062E \u0634\u062E\u0635\u06CC \u0634\u0645\u0627 {id}.",
    profileNotApplicableBody: "\u0647\u06CC\u0686 \u0628\u062E\u0634\u06CC \u0627\u0632 \u0627\u06CC\u0646 \u0686\u0627\u0631\u0686\u0648\u0628 \u062F\u0631 \u0646\u0645\u0627\u06CC\u0647\u0654 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F \u0648 \u067E\u0627\u0633\u062E \u0634\u062E\u0635\u06CC\u200C\u0627\u06CC \u062C\u0627\u06CC \u0622\u0646 \u0631\u0627 \u0646\u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F. \u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u06A9\u0627\u0645\u0644 \u06CC\u06A9 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u060C brand.profile \u0631\u0627 universal \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F \u0648 \u0645\u0627\u0698\u0648\u0644 \u0634\u062E\u0635\u06CC \u0631\u0627 \u0631\u0648\u0634\u0646 \u0646\u06AF\u0647 \u062F\u0627\u0631\u06CC\u062F\u060C \u06CC\u0627 \u0628\u0631\u0627\u06CC \u0622\u0646 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0645\u062E\u0632\u0646 \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u0628\u0633\u0627\u0632\u06CC\u062F.",
    relationshipsTitle: "\u067E\u06CC\u0648\u0646\u062F \u0645\u06CC\u0627\u0646 \u0628\u062E\u0634\u200C\u0647\u0627",
    relationshipsBody: "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC\u060C \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0647\u0627\u060C \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0648 \u062C\u0631\u06CC\u0627\u0646\u200C\u0647\u0627\u06CC \u062F\u0631\u0622\u0645\u062F \u0627\u06A9\u0646\u0648\u0646 \u0647\u0631 \u06A9\u062F\u0627\u0645 \u06CC\u06A9 \u067E\u0627\u0633\u062E \u0645\u062A\u0646\u06CC\u200C\u0627\u0646\u062F\u061B \u0628\u0646\u0627\u0628\u0631\u0627\u06CC\u0646 \u0647\u06CC\u0686 \u067E\u06CC\u0648\u0646\u062F\u06CC \u0645\u06CC\u0627\u0646\u0634\u0627\u0646 \u0631\u0633\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0645\u0648\u062C\u0648\u062F\u06CC\u062A\u200C\u0647\u0627\u06CC \u067E\u06CC\u0648\u0646\u062F\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC\u200C\u0634\u062F\u0647\u0654 \u0645\u0635\u0627\u062D\u0628\u0647 \u0627\u0633\u062A.",
    sourcesTitle: "\u0645\u0646\u0627\u0628\u0639 \u0648 \u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627",
    sourcesIntro: "\u0647\u0631 \u0645\u0648\u0631\u062F \u0631\u0648\u06CC \u0628\u0648\u0645\u060C \u067E\u0631\u0633\u0634\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0622\u0646 \u0627\u0633\u062A\u060C \u0648\u0636\u0639\u06CC\u062A \u0648 \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u0634.",
    colField: "\u0641\u06CC\u0644\u062F",
    colState: "\u0648\u0636\u0639\u06CC\u062A",
    colVersion: "\u0646\u0633\u062E\u0647",
    colApproved: "\u062A\u0627\u0631\u06CC\u062E \u062A\u0623\u06CC\u06CC\u062F",
    colSources: "\u0634\u0646\u0627\u0633\u0647\u0654 \u0645\u0646\u0627\u0628\u0639",
    frameworkTitle: "\u0686\u0627\u0631\u0686\u0648\u0628",
    licence: "\u0648\u0636\u0639\u06CC\u062A \u0645\u062C\u0648\u0632",
    sourceLink: "\u0645\u0631\u062C\u0639",
    notVerified: "\u0635\u0641\u062D\u0647\u0654 \u0645\u0631\u062C\u0639 \u0647\u0646\u0648\u0632 \u062A\u0648\u0633\u0637 \u06CC\u06A9 \u0641\u0631\u062F \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0631\u0631\u0633\u06CC \u0646\u0634\u062F\u0647 \u0627\u0633\u062A",
    checked: "\u0628\u0631\u0631\u0633\u06CC \u0645\u0646\u0628\u0639",
    summaryTitle: "\u067E\u0648\u0634\u0634",
    decisionTitle: "\u0627\u06CC\u0646 \u0628\u0648\u0645 \u0628\u0647 \u0686\u0647 \u062A\u0635\u0645\u06CC\u0645\u06CC \u06A9\u0645\u06A9 \u0645\u06CC\u200C\u06A9\u0646\u062F",
    decisionBody: "\u0646\u0645\u0627\u06CC\u06CC \u06CC\u06A9\u200C\u0635\u0641\u062D\u0647\u200C\u0627\u06CC \u0627\u0632 \u0627\u06CC\u0646\u200C\u06A9\u0647 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0686\u06AF\u0648\u0646\u0647 \u0627\u0631\u0632\u0634 \u0645\u06CC\u200C\u0633\u0627\u0632\u062F\u060C \u0645\u06CC\u200C\u0631\u0633\u0627\u0646\u062F \u0648 \u062F\u0631\u0622\u0645\u062F \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F\u061B \u0628\u0627 \u0646\u0627\u0645 \u0628\u0631\u062F\u0646 \u0627\u0632 \u0647\u0631 \u062C\u0627\u06CC \u062E\u0627\u0644\u06CC.",
    printTitle: "\u0686\u0627\u067E \u06CC\u0627 \u0630\u062E\u06CC\u0631\u0647 \u0628\u0647\u200C\u0635\u0648\u0631\u062A PDF",
    printHint: "\u0627\u0632 \u0641\u0631\u0645\u0627\u0646 \xAB\u0686\u0627\u067E\xBB \u0645\u0631\u0648\u0631\u06AF\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F. \u0635\u0641\u062D\u0647 \u0628\u0631\u0627\u06CC A3 \u0627\u0641\u0642\u06CC \u0686\u06CC\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A\u061B \u0635\u0641\u062D\u0647\u0654 \u062F\u0648\u0645 \u0647\u0645\u0647\u0654 \u0645\u0646\u0627\u0628\u0639 \u0631\u0627 \u0641\u0647\u0631\u0633\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    pageCanvas: "\u0628\u0648\u0645",
    pageSources: "\u0645\u0646\u0627\u0628\u0639",
    statusLegend: "\u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627",
    noValueYet: "\u0647\u0646\u0648\u0632 \u067E\u0627\u0633\u062E\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647",
    version: "\u0646\u0633\u062E\u0647\u0654 {version}",
    openPrint: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E (\u062F\u0627\u062E\u0644\u06CC)",
    openPrintPublic: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E (\u0639\u0645\u0648\u0645\u06CC)",
    backToCanvas: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0628\u0648\u0645",
    notApplicableTitle: "\u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0646\u0645\u0627\u06CC\u0647 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    notApplicableBody: "\u0628\u0631\u0646\u062F \u0634\u062E\u0635\u06CC \u0641\u0642\u0637 \u0628\u0627 \u062C\u0646\u0628\u0647\u0654 \xAB\u0628\u0646\u06CC\u0627\u0646\u200C\u06AF\u0630\u0627\u0631\xBB \u06CC\u0627 \xAB\u0645\u0634\u0627\u0648\u0631\xBB \u0628\u0648\u0645 \u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u062F.",
    runningHead: "Brand OS \xB7 \u0628\u0648\u0645 \u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
    pending: "\u0627\u06CC\u0646 \u06A9\u0627\u0645\u06CC\u062A \u067E\u06CC\u0634 \u0627\u0632 \u0648\u062C\u0648\u062F \u0628\u0648\u0645 \u0647\u0645\u06AF\u0627\u0645 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0628\u0631\u0627\u06CC \u0633\u0627\u062E\u062A\u0646 \u0622\u0646 \xAB\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC\xBB \u0631\u0627 \u0628\u0632\u0646\u06CC\u062F.",
    unavailable: "\u0628\u0648\u0645 \u0627\u0632 \u0627\u06CC\u0646 \u06A9\u0627\u0645\u06CC\u062A \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F. \u0628\u0642\u06CC\u0647\u0654 \u0628\u0631\u0646\u062F \u062A\u062D\u062A \u062A\u0623\u062B\u06CC\u0631 \u0646\u06CC\u0633\u062A.",
    printButton: "\u0686\u0627\u067E \u06CC\u0627 \u0630\u062E\u06CC\u0631\u0647 \u0628\u0647\u200C\u0635\u0648\u0631\u062A PDF",
    printOnly: "Studio \u0641\u0642\u0637\u200C\u062E\u0648\u0627\u0646\u062F\u0646\u06CC \u0627\u0633\u062A: \u0627\u06CC\u0646 \u0646\u0645\u0627 \u0641\u0642\u0637 \u0622\u0646\u0686\u0647 \u0627\u062F\u063A\u0627\u0645 \u0634\u062F\u0647 \u0631\u0627 \u0686\u0627\u067E \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    detailsTitle: "\u062C\u0632\u0626\u06CC\u0627\u062A \u0648 \u0645\u0646\u0627\u0628\u0639",
    detailsFields: "\u0634\u0646\u0627\u0633\u0647\u0654 \u067E\u0631\u0633\u0634\u200C\u0647\u0627",
    sourceShort: "\u0645\u0646\u0628\u0639"
  }
};
var tr2 = {
  dir: "ltr",
  identity: IDENTITY_TEXT.tr,
  entities: ENTITY_TEXT.tr,
  zone: {
    key_partners: { title: "Kilit ortaklar", prompt: "Teslimat i\xE7in kime ba\u011Fl\u0131y\u0131z?" },
    key_activities: { title: "Kilit faaliyetler", prompt: "Her hafta neyi iyi yapmal\u0131y\u0131z?" },
    key_resources: { title: "Kilit kaynaklar", prompt: "Teklifi hangi varl\u0131klar m\xFCmk\xFCn k\u0131l\u0131yor?" },
    value_propositions: { title: "De\u011Fer \xF6nerileri", prompt: "M\xFC\u015Fteri bizi neden se\xE7iyor?" },
    customer_relationships: { title: "M\xFC\u015Fteri ili\u015Fkileri", prompt: "M\xFC\u015Fteriyi nas\u0131l kazan\u0131yor, tutuyor ve destekliyoruz?" },
    channels: { title: "Kanallar", prompt: "M\xFC\u015Fteri teklifi nas\u0131l buluyor, sat\u0131n al\u0131yor ve teslim al\u0131yor?" },
    customer_segments: { title: "M\xFC\u015Fteri segmentleri", prompt: "Kimin i\xE7in de\u011Fer yarat\u0131yoruz?" },
    cost_structure: { title: "Maliyet yap\u0131s\u0131", prompt: "Maliyetlerimizi ne belirliyor?" },
    revenue_streams: { title: "Gelir ak\u0131\u015Flar\u0131", prompt: "De\u011Fer nas\u0131l gelire d\xF6n\xFC\u015F\xFCyor?" }
  },
  state: {
    approved: "Onayl\u0131",
    assumption: "Taslak, onaylanmad\u0131",
    recommendation: "\xD6neri, karar de\u011Fil",
    missing: "Eksik",
    withheld: "Gizli tutuldu",
    stale: "Onayl\u0131, g\xF6zden ge\xE7irme gecikti",
    conflicting: "\xC7eli\u015Fkili",
    not_applicable: "Uygulanmaz"
  },
  zoneState: { complete: "Tamam", partial: "K\u0131smi", missing: "Eksik", withheld: "Gizli", not_applicable: "Uygulanmaz" },
  missingReason: { unanswered: "Hen\xFCz yan\u0131tlanmad\u0131", unknown: "Sahip bunun bilinmedi\u011Fini s\xF6yledi", skipped: "Sahip atlad\u0131", deprecated: "Son yan\u0131t kullan\u0131mdan kald\u0131r\u0131ld\u0131", not_published: "Yay\u0131mlanmad\u0131" },
  claim: {
    informed_by: "Esinlenilen kaynak",
    aligned_with: "Uyumlu",
    verified_against: "Kar\u015F\u0131la\u015Ft\u0131r\u0131larak do\u011Fruland\u0131",
    externally_certified: "Ba\u011F\u0131ms\u0131z sertifikal\u0131",
    original_professional_template: "\xD6zg\xFCn Brand OS \u015Fablonu"
  },
  proposed: {
    "business.model.key_activities": "\u0130\u015Fletme her teklifi sunmak i\xE7in hangi faaliyetleri iyi yapmal\u0131?",
    "business.model.key_resources": "Her teklifi sunmak i\xE7in hangi kaynaklar (insanlar, sistemler, fikri m\xFClkiyet, varl\u0131klar) gerekli?",
    "business.model.segments": "Her m\xFC\u015Fteri segmentini ayr\u0131 yaz\u0131n ve di\u011Ferlerinden fark\u0131n\u0131 belirtin.",
    "business.model.cost_items": "Ana maliyet kalemlerini, sabit veya de\u011Fi\u015Fken, tutar vermeden listeleyin."
  },
  text: {
    canvasTitle: "\u0130\u015F Modeli Kanvas\u0131",
    canvasKicker: "Strateji \xB7 \u0130\u015F modeli",
    editionInternal: "\u0130\xE7 s\xFCr\xFCm",
    editionPublic: "Kamuya a\xE7\u0131k s\xFCr\xFCm",
    editionInternalNote: "Onayl\u0131 bilgiler esast\u0131r. Taslaklar etiketlidir ve karar de\u011Fildir. K\u0131s\u0131tl\u0131 de\u011Ferler gizlenir. Bo\u015Fluklar bo\u015F kal\u0131r.",
    editionPublicNote: "Yaln\u0131zca onayl\u0131, yay\u0131mlanm\u0131\u015F ve kamuya a\xE7\u0131k bilgiler. Taslaklar ve k\u0131s\u0131tl\u0131 de\u011Ferler \xE7\u0131kar\u0131ld\u0131.",
    illustrative: "ILLUSTRATIVE / MOCK DATA \xB7 TEMS\u0130L\u0130 \xD6RNEK",
    illustrativeNote: "Uydurma test verisiyle haz\u0131rlanm\u0131\u015F \xF6rnek. Ger\xE7ek bir marka de\u011Fil, onayl\u0131 de\u011Fil, haz\u0131r cevap de\u011Fil.",
    asOf: "{date} itibar\u0131yla",
    asOfNone: "Hen\xFCz onayl\u0131 bilgi yok",
    asOfLabel: "Veri tarihi",
    commit: "Kaynak commit",
    classification: "S\u0131n\u0131fland\u0131rma",
    classInternal: "\u0130\xE7 kullan\u0131m. Yaln\u0131zca sahip ve ekip.",
    classPublic: "Kamuya a\xE7\u0131k",
    zoneIndex: "Kanvas alanlar\u0131",
    zoneIndexHint: "Bir alana gidin. Kanvas dokuz alanl\u0131 d\xFCzenini korur ve k\xFC\xE7\xFCk ekranlarda yatay kayar.",
    nextQuestions: "Bu alan\u0131 doldurmak i\xE7in",
    proposedQuestion: "Yeni soru (\xF6nerilen, hen\xFCz g\xF6r\xFC\u015Fmede yok)",
    existingQuestion: "Yan\u0131tlay\u0131n ve onaylay\u0131n",
    related: "\u0130lgili yan\u0131tlar",
    relatedHint: "Bu alan\u0131 besleyebilirler ama onu yan\u0131tlamazlar.",
    gapTitle: "Bu alan\u0131n hen\xFCz bir sorusu yok",
    gapBody: "Sahip yan\u0131tlay\u0131p onaylayana kadar burada hi\xE7bir \u015Fey g\xF6sterilmez. Hi\xE7bir \u015Fey tahmin edilmedi.",
    withheldValue: "K\u0131s\u0131tl\u0131 de\u011Fer gizlendi",
    notApplicableZone: "Sahip bunu uygulanmaz olarak i\u015Faretledi.",
    notApplicableProfile: "Bu profil i\xE7in ge\xE7erli de\u011Fil.",
    standsFor: "Ki\u015Fisel yan\u0131t\u0131n\u0131zdan: {id}.",
    profileNotApplicableBody: "Bu \xE7er\xE7evenin hi\xE7bir par\xE7as\u0131 bu markan\u0131n g\xF6r\xFC\u015Fme profili i\xE7in ge\xE7erli de\u011Fil ve yerine ge\xE7en bir ki\u015Fisel yan\u0131t yok. Bir giri\u015Fimin tam plan\u0131 i\xE7in brand.profile de\u011Ferini universal yap\u0131p ki\u015Fisel mod\xFCl\xFC a\xE7\u0131k tutun ya da giri\u015Fime ayr\u0131 bir depo a\xE7\u0131n.",
    relationshipsTitle: "Alanlar aras\u0131 ba\u011Flant\u0131lar",
    relationshipsBody: "Segmentler, teklifler, kanallar ve gelir ak\u0131\u015Flar\u0131 bug\xFCn tek metin yan\u0131tlar\u0131d\u0131r; bu y\xFCzden aralar\u0131nda ba\u011Flant\u0131 \xE7izilmez. Ba\u011Flant\u0131l\u0131 varl\u0131klar planlanan bir g\xF6r\xFC\u015Fme de\u011Fi\u015Fikli\u011Fidir.",
    sourcesTitle: "Kaynaklar ve durumlar",
    sourcesIntro: "Kanvastaki her kay\u0131t, ona sahip olan soru, durumu ve onayl\u0131 s\xFCr\xFCm\xFC.",
    colField: "Alan",
    colState: "Durum",
    colVersion: "S\xFCr\xFCm",
    colApproved: "Onay tarihi",
    colSources: "Kaynak kimlikleri",
    frameworkTitle: "\xC7er\xE7eve",
    licence: "Lisans durumu",
    sourceLink: "Kaynak",
    notVerified: "Kaynak sayfa hen\xFCz bir ki\u015Fi taraf\u0131ndan yeniden kontrol edilmedi",
    checked: "Kaynak kontrol\xFC",
    summaryTitle: "Kapsam",
    decisionTitle: "Neyi destekler",
    decisionBody: "\u0130\u015Fletmenin de\u011Feri nas\u0131l yaratt\u0131\u011F\u0131n\u0131, sundu\u011Funu ve gelire \xE7evirdi\u011Fini tek sayfada, her bo\u015Flu\u011Fu ad\u0131yla g\xF6stererek okutur.",
    printTitle: "Yazd\u0131r veya PDF olarak kaydet",
    printHint: "Taray\u0131c\u0131n\u0131n Yazd\u0131r komutunu kullan\u0131n. Sayfa A3 yatay i\xE7in d\xFCzenlendi; ikinci sayfa t\xFCm kaynaklar\u0131 listeler.",
    pageCanvas: "Kanvas",
    pageSources: "Kaynaklar",
    statusLegend: "Durumlar",
    noValueYet: "Hen\xFCz yan\u0131tlanmad\u0131",
    version: "s{version}",
    openPrint: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC (i\xE7)",
    openPrintPublic: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC (kamuya a\xE7\u0131k)",
    backToCanvas: "Kanvasa d\xF6n",
    notApplicableTitle: "Bu profil i\xE7in kullan\u0131lm\u0131yor",
    notApplicableBody: "Ki\u015Fisel marka, i\u015F modeli kanvas\u0131n\u0131 yaln\u0131zca kurucu veya dan\u0131\u015Fman y\xF6n\xFCyle al\u0131r.",
    runningHead: "Brand OS \xB7 \u0130\u015F Modeli Kanvas\u0131",
    pending: "Bu commit kanvas eklenmeden \xF6nce e\u015Fitlendi. Olu\u015Fturmak i\xE7in Yenile\u2019ye bas\u0131n.",
    unavailable: "Kanvas bu commit\u2019ten olu\u015Fturulamad\u0131. Markan\u0131n geri kalan\u0131 etkilenmedi.",
    printButton: "Yazd\u0131r veya PDF olarak kaydet",
    printOnly: "Studio salt okunurdur: bu g\xF6r\xFCn\xFCm yaln\u0131zca birle\u015Ftirilmi\u015F olan\u0131 yazd\u0131r\u0131r.",
    detailsTitle: "Ayr\u0131nt\u0131lar ve kaynaklar",
    detailsFields: "Soru kimlikleri",
    sourceShort: "Kaynak"
  }
};
var CATALOGS = { en: en2, fa: fa2, tr: tr2 };
function visualCatalog(lang) {
  return CATALOGS[lang];
}
function fillVisual(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, name) => name in vars ? String(vars[name]) : match);
}

// packages/brand-core/src/visual/fixtures.ts
var ILLUSTRATIVE_BRAND = { id: "illustrative-example", name: "Example Co. (fictional)" };
var APPROVED_AT = "2026-10-02T09:00:00.000Z";
var FIXTURE = [
  // Visual V3.1 list questions: approved segments, draft activities and cost items with links, resources missing
  // (the designed empty list zone), and one link to an item that does not exist (unresolved).
  {
    id: "business.model.segments",
    label: "Customer segments",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT,
    list: [
      { id: "seg-1", tags: [{ field: "priority", value: "primary" }], links: [], text: { en: { name: "Working adults changing jobs", detail: "Ten minutes a day, on the phone" }, fa: { name: "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u062F\u0631 \u062D\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644", detail: "\u0631\u0648\u0632\u06CC \u062F\u0647 \u062F\u0642\u06CC\u0642\u0647\u060C \u0631\u0648\u06CC \u06AF\u0648\u0634\u06CC" }, tr: { name: "\u0130\u015F de\u011Fi\u015Ftiren \xE7al\u0131\u015Fan yeti\u015Fkinler", detail: "G\xFCnde on dakika, telefonda" } } },
      { id: "seg-2", tags: [{ field: "priority", value: "secondary" }], links: [], text: { en: { name: "Employers buying team seats" }, fa: { name: "\u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646\u06CC \u06A9\u0647 \u0635\u0646\u062F\u0644\u06CC \u062A\u06CC\u0645\u06CC \u0645\u06CC\u200C\u062E\u0631\u0646\u062F" }, tr: { name: "Ekip koltu\u011Fu sat\u0131n alan i\u015Fverenler" } } }
    ]
  },
  {
    id: "business.model.key_activities",
    label: "Key activities",
    state: "assumption",
    note: "Owner draft. Not approved.",
    list: [
      { id: "act-1", tags: [{ field: "category", value: "production" }], links: ["seg-1", "res-1"], text: { en: { name: "Lesson production", detail: "Weekly, reviewed by a teacher" }, fa: { name: "\u062A\u0648\u0644\u06CC\u062F \u062F\u0631\u0633", detail: "\u0647\u0641\u062A\u06AF\u06CC\u060C \u0628\u0627 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0645\u0639\u0644\u0645" }, tr: { name: "Ders \xFCretimi", detail: "Haftal\u0131k, \xF6\u011Fretmen kontrol\xFCnde" } } },
      { id: "act-2", tags: [{ field: "category", value: "problem_solving" }], links: ["seg-2"], text: { en: { name: "Partner onboarding" }, fa: { name: "\u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0634\u0631\u06CC\u06A9\u0627\u0646" }, tr: { name: "Ortak kat\u0131l\u0131m\u0131" } } }
    ]
  },
  { id: "business.model.key_resources", label: "Key resources", state: "missing", note: "Not answered yet." },
  {
    id: "business.model.cost_items",
    label: "Cost items",
    state: "assumption",
    note: "Owner draft. Not approved.",
    list: [
      { id: "cost-1", tags: [{ field: "behaviour", value: "variable" }], links: ["act-1"], text: { en: { name: "Content production" }, fa: { name: "\u062A\u0648\u0644\u06CC\u062F \u0645\u062D\u062A\u0648\u0627" }, tr: { name: "\u0130\xE7erik \xFCretimi" } } },
      { id: "cost-2", tags: [{ field: "behaviour", value: "variable" }], links: [], text: { en: { name: "Cloud hosting", detail: "Grows with active learners" }, fa: { name: "\u0645\u06CC\u0632\u0628\u0627\u0646\u06CC \u0627\u0628\u0631\u06CC", detail: "\u0628\u0627 \u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u06AF\u0627\u0646 \u0641\u0639\u0627\u0644 \u0631\u0634\u062F \u0645\u06CC\u200C\u06A9\u0646\u062F" }, tr: { name: "Bulut bar\u0131nd\u0131rma", detail: "Aktif \xF6\u011Frenciyle b\xFCy\xFCr" } } }
    ]
  },
  {
    id: "business.partners.channels",
    label: "Partners",
    state: "approved",
    version: 2,
    approved_at: APPROVED_AT,
    value: {
      en: "Two regional training firms resell team seats. One payment provider handles billing.",
      fa: "\u062F\u0648 \u0645\u0624\u0633\u0633\u0647\u0654 \u0622\u0645\u0648\u0632\u0634\u06CC \u0645\u0646\u0637\u0642\u0647\u200C\u0627\u06CC \u0635\u0646\u062F\u0644\u06CC\u200C\u0647\u0627\u06CC \u062A\u06CC\u0645\u06CC \u0631\u0627 \u0645\u06CC\u200C\u0641\u0631\u0648\u0634\u0646\u062F. \u06CC\u06A9 \u062F\u0631\u06AF\u0627\u0647 \u067E\u0631\u062F\u0627\u062E\u062A \u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0631\u0627 \u0627\u0646\u062C\u0627\u0645 \u0645\u06CC\u200C\u062F\u0647\u062F.",
      tr: "\u0130ki b\xF6lgesel e\u011Fitim firmas\u0131 ekip koltuklar\u0131n\u0131 yeniden sat\u0131yor. Faturalamay\u0131 bir \xF6deme sa\u011Flay\u0131c\u0131s\u0131 yap\u0131yor."
    }
  },
  {
    id: "business.ops.vendors",
    label: "Vendors",
    state: "assumption",
    note: "Owner draft. Not approved.",
    value: {
      en: "Cloud hosting; two freelance illustrators.",
      fa: "\u0645\u06CC\u0632\u0628\u0627\u0646\u06CC \u0627\u0628\u0631\u06CC\u061B \u062F\u0648 \u062A\u0635\u0648\u06CC\u0631\u06AF\u0631 \u0622\u0632\u0627\u062F\u06A9\u0627\u0631.",
      tr: "Bulut bar\u0131nd\u0131rma; iki serbest ill\xFCstrat\xF6r."
    }
  },
  {
    id: "business.offer.value_proposition",
    label: "Value proposition",
    state: "approved",
    version: 3,
    approved_at: APPROVED_AT,
    value: {
      en: "Busy adults reach a useful conversation level in a new language in ten minutes a day.",
      fa: "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u067E\u0631\u0645\u0634\u063A\u0644\u0647 \u0628\u0627 \u0631\u0648\u0632\u06CC \u062F\u0647 \u062F\u0642\u06CC\u0642\u0647 \u0628\u0647 \u0633\u0637\u062D \u0645\u06A9\u0627\u0644\u0645\u0647\u0654 \u06A9\u0627\u0631\u0628\u0631\u062F\u06CC \u062F\u0631 \u06CC\u06A9 \u0632\u0628\u0627\u0646 \u062A\u0627\u0632\u0647 \u0645\u06CC\u200C\u0631\u0633\u0646\u062F.",
      tr: "Yo\u011Fun yeti\u015Fkinler g\xFCnde on dakikayla yeni bir dilde i\u015Fe yarar konu\u015Fma seviyesine ula\u015F\u0131r."
    }
  },
  {
    id: "business.offer.summary",
    label: "Offer",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT,
    value: {
      en: "Mobile app with short daily lessons, plus a team plan for employers.",
      fa: "\u0627\u067E\u0644\u06CC\u06A9\u06CC\u0634\u0646 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0628\u0627 \u062F\u0631\u0633\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0631\u0648\u0632\u0627\u0646\u0647\u060C \u0628\u0647\u200C\u0639\u0644\u0627\u0648\u0647\u0654 \u0637\u0631\u062D \u062A\u06CC\u0645\u06CC \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646.",
      tr: "K\u0131sa g\xFCnl\xFCk derslerle mobil uygulama ve i\u015Fverenler i\xE7in ekip plan\u0131."
    }
  },
  {
    id: "business.sales.motion",
    label: "Sales motion",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT,
    value: { en: "Self-serve; partner-led for teams.", fa: "\u0633\u0644\u0641\u200C\u0633\u0631\u0648\u06CC\u0633\u061B \u0628\u0631\u0627\u06CC \u062A\u06CC\u0645\u200C\u0647\u0627 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0634\u0631\u06CC\u06A9.", tr: "Self servis; ekipler i\xE7in ortak \xFCzerinden." }
  },
  {
    id: "business.cx.onboarding",
    label: "Onboarding outcome",
    state: "stale",
    version: 1,
    approved_at: "2026-03-01T09:00:00.000Z",
    review_due: "2026-09-01",
    value: {
      en: "First lesson finished within the first session.",
      fa: "\u0627\u0648\u0644\u06CC\u0646 \u062F\u0631\u0633 \u062F\u0631 \u0647\u0645\u0627\u0646 \u062C\u0644\u0633\u0647\u0654 \u0627\u0648\u0644 \u062A\u0645\u0627\u0645 \u0634\u0648\u062F.",
      tr: "\u0130lk ders ilk oturumda tamamlan\u0131r."
    }
  },
  { id: "business.cx.channels", label: "Support channels", state: "missing", note: "Not answered yet." },
  {
    id: "business.marketing.channels",
    label: "Channels",
    state: "approved",
    version: 2,
    approved_at: APPROVED_AT,
    value: {
      en: "App stores, short-form video, partner newsletters.",
      fa: "\u0641\u0631\u0648\u0634\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC \u0627\u067E\u0644\u06CC\u06A9\u06CC\u0634\u0646\u060C \u0648\u06CC\u062F\u06CC\u0648\u06CC \u06A9\u0648\u062A\u0627\u0647\u060C \u062E\u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u0634\u0631\u06A9\u0627.",
      tr: "Uygulama ma\u011Fazalar\u0131, k\u0131sa video, ortak b\xFCltenleri."
    }
  },
  { id: "business.sales.consumer_path", label: "Consumer purchase path", state: "not_applicable", note: "Marked not applicable by the owner." },
  {
    id: "business.customer.primary_segment",
    label: "Primary customer",
    state: "approved",
    version: 2,
    approved_at: APPROVED_AT,
    value: {
      en: "Working adults, 25\u201345, learning a language for a job move.",
      fa: "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u06F2\u06F5 \u062A\u0627 \u06F4\u06F5 \u0633\u0627\u0644\u0647 \u06A9\u0647 \u0628\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644 \u0632\u0628\u0627\u0646 \u0645\u06CC\u200C\u0622\u0645\u0648\u0632\u0646\u062F.",
      tr: "\u0130\u015F de\u011Fi\u015Fikli\u011Fi i\xE7in dil \xF6\u011Frenen 25\u201345 ya\u015F aras\u0131 \xE7al\u0131\u015Fan yeti\u015Fkinler."
    }
  },
  {
    id: "business.sales.buyer",
    label: "Buyer versus user",
    state: "assumption",
    note: "Owner draft. Not approved.",
    value: { en: "Teams: HR buys, employees use.", fa: "\u062A\u06CC\u0645\u200C\u0647\u0627: \u0645\u0646\u0627\u0628\u0639 \u0627\u0646\u0633\u0627\u0646\u06CC \u0645\u06CC\u200C\u062E\u0631\u062F\u060C \u06A9\u0627\u0631\u06A9\u0646\u0627\u0646 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.", tr: "Ekipler: \u0130K sat\u0131n al\u0131r, \xE7al\u0131\u015Fanlar kullan\u0131r." }
  },
  { id: "business.finance.costs", label: "Cost drivers", state: "withheld", version: 1, approved_at: APPROVED_AT, note: "Restricted. Approved, but the value is never shown in a document." },
  {
    id: "business.finance.economics_note",
    label: "Pricing economics note",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT,
    value: {
      en: "Content production is the largest variable cost; hosting scales with active learners.",
      fa: "\u062A\u0648\u0644\u06CC\u062F \u0645\u062D\u062A\u0648\u0627 \u0628\u0632\u0631\u06AF\u200C\u062A\u0631\u06CC\u0646 \u0647\u0632\u06CC\u0646\u0647\u0654 \u0645\u062A\u063A\u06CC\u0631 \u0627\u0633\u062A\u061B \u0645\u06CC\u0632\u0628\u0627\u0646\u06CC \u0628\u0627 \u062A\u0639\u062F\u0627\u062F \u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u06AF\u0627\u0646 \u0641\u0639\u0627\u0644 \u0631\u0634\u062F \u0645\u06CC\u200C\u06A9\u0646\u062F.",
      tr: "En b\xFCy\xFCk de\u011Fi\u015Fken maliyet i\xE7erik \xFCretimi; bar\u0131nd\u0131rma aktif \xF6\u011Frenciyle \xF6l\xE7eklenir."
    }
  },
  {
    id: "business.model.revenue",
    label: "Revenue model",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT,
    value: {
      en: "Monthly and annual subscriptions; per-seat team licences.",
      fa: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0627\u0647\u0627\u0646\u0647 \u0648 \u0633\u0627\u0644\u0627\u0646\u0647\u061B \u0645\u062C\u0648\u0632 \u062A\u06CC\u0645\u06CC \u0628\u0647 \u0627\u0632\u0627\u06CC \u0647\u0631 \u06A9\u0627\u0631\u0628\u0631.",
      tr: "Ayl\u0131k ve y\u0131ll\u0131k abonelik; koltuk ba\u015F\u0131na ekip lisans\u0131."
    }
  },
  {
    id: "business.sales.pricing",
    label: "Pricing summary",
    state: "assumption",
    note: "Owner draft. Not approved.",
    value: {
      en: "Free first week, then one paid tier (amount not decided).",
      fa: "\u0647\u0641\u062A\u0647\u0654 \u0627\u0648\u0644 \u0631\u0627\u06CC\u06AF\u0627\u0646\u060C \u0633\u067E\u0633 \u06CC\u06A9 \u067E\u0644\u0646 \u067E\u0648\u0644\u06CC (\u0645\u0628\u0644\u063A \u0647\u0646\u0648\u0632 \u062A\u0639\u06CC\u06CC\u0646 \u0646\u0634\u062F\u0647).",
      tr: "\u0130lk hafta \xFCcretsiz, sonra tek \xFCcretli paket (tutar belirlenmedi)."
    }
  }
];
function illustrativeBusinessModelCanvas(lang = "en", audience = "internal") {
  const byId = new Map(FIXTURE.map((entry2) => [entry2.id, entry2]));
  const existing2 = /* @__PURE__ */ new Set([...FIXTURE.map((entry2) => entry2.id), ...BMC_ZONES.flatMap((zone) => zone.related)]);
  const zones = BMC_ZONES.map((spec) => ({
    spec,
    existing: existing2,
    entries: spec.questions.flatMap((id) => {
      const fixture = byId.get(id);
      if (!fixture) return [];
      const approved = fixture.state === "approved" || fixture.state === "stale" || fixture.state === "withheld" && fixture.approved_at !== void 0;
      const hidden = audience === "public" && !approved;
      const items = hidden || !fixture.list ? null : fixture.list.map((item) => ({ id: item.id, name: item.text[lang].name, detail: item.text[lang].detail ?? null, tags: item.tags, links: item.links }));
      const entry2 = {
        id: fixture.id,
        label: fixture.label,
        state: hidden ? "missing" : fixture.state,
        value: items ? items.map((item) => item.name).join(" \xB7 ") : hidden || !fixture.value ? null : fixture.value[lang],
        ...items ? { items } : {},
        sources: [`fixture:${fixture.id}`],
        version: approved ? fixture.version ?? null : null,
        approved_at: approved ? fixture.approved_at ?? null : null,
        review_due: fixture.review_due ?? null,
        note: hidden ? "Not published." : fixture.note ?? null,
        missing_reason: hidden ? "not_published" : fixture.state === "missing" ? "unanswered" : null,
        approved
      };
      return [entry2];
    })
  }));
  return canvasDocument({ brand_id: ILLUSTRATIVE_BRAND.id, brand_name: ILLUSTRATIVE_BRAND.name, audience, illustrative: true, zones });
}

// packages/brand-core/src/visual/fixtures-identity.ts
var APPROVED_AT2 = "2026-10-02T09:00:00.000Z";
var VALUES = {
  color: "primary #123A73; onPrimary #FFFFFF; surface #F7F5F2; onSurface #1B1F24; accent #D5FE00; onAccent #121212; muted #6B7480; danger #B42318",
  type: "display: Rajdhani, Arial Narrow, sans-serif @ 48px/1.05; heading: Inter, system-ui, sans-serif @ 24px/1.25; body: Inter, system-ui, sans-serif @ 16px/1.55; caption: Inter, system-ui, sans-serif @ 12px/1.4",
  logo: "min-size: 24px; clear-space: 0.5x; min-print: 10mm"
};
var LABELS = { color: "Color roles", type: "Type roles and scale", logo: "Minimum size and clear space" };
function fixtureEntry(key, state2, version) {
  const id = IDENTITY_QUESTIONS[key];
  const approved = state2 === "approved" || state2 === "stale";
  const type = key === "color" ? "color" : key === "type" ? "font" : "logo_spec";
  const value2 = state2 === "missing" || state2 === "withheld" ? null : VALUES[key];
  return {
    entry: {
      id,
      label: LABELS[key],
      state: state2,
      value: value2,
      sources: [`fixture:${id}`],
      version: approved ? version : null,
      approved_at: approved ? APPROVED_AT2 : null,
      review_due: null,
      note: state2 === "assumption" ? "Owner draft. Not approved." : null,
      missing_reason: state2 === "missing" ? "unanswered" : null
    },
    structured: value2 ? parseStructured(type, value2) : null
  };
}
var MOCK_MASTER = {
  asset_id: "fixture.logo.mock-master",
  name: "MOCK master mark (fictional)",
  version: "1.0.0",
  approved: true,
  published: true,
  tags: ["logo", "master"],
  example: false,
  preview_key: "fixture-mock-master",
  mime: "image/svg+xml",
  width: 240,
  height: 80
};
var EXAMPLE_ONLY = { ...MOCK_MASTER, asset_id: "asset.logo.example-wordmark", name: "EXAMPLE wordmark placeholder", approved: false, published: false, tags: ["logo", "example", "draft"], example: true };
function illustrativeVisualIdentity(audience = "internal", variant = "complete") {
  const awaiting3 = variant === "awaiting";
  const color = fixtureEntry("color", awaiting3 ? audience === "public" ? "missing" : "assumption" : "approved", 3);
  if (awaiting3 && audience === "public") color.entry.missing_reason = "not_published";
  return identityDocument({
    brand_id: ILLUSTRATIVE_BRAND.id,
    brand_name: ILLUSTRATIVE_BRAND.name,
    audience,
    illustrative: true,
    color,
    type: fixtureEntry("type", awaiting3 ? "missing" : "approved", 2),
    logo: fixtureEntry("logo", "approved", 1),
    masters: awaiting3 ? [EXAMPLE_ONLY] : [MOCK_MASTER],
    scripts: ["en", "fa", "tr"]
  });
}

// packages/brand-core/src/visual/print-profiles.ts
var PRINT_PROFILE_SPECS = {
  book_a4_portrait: {
    id: "book_a4_portrait",
    status: "ready",
    orientation: "portrait",
    width_mm: 210,
    height_mm: 297,
    named_page: "bk-a4",
    margin_mm: { top: 12, bottom: 11, inner: 22, outer: 17 },
    head_mm: 9,
    folio_mm: 8,
    gap_mm: 6
  },
  canvas_a3_landscape: {
    id: "canvas_a3_landscape",
    status: "ready",
    orientation: "landscape",
    width_mm: 420,
    height_mm: 297,
    named_page: "auto",
    margin_mm: { top: 10, bottom: 12, inner: 14, outer: 14 },
    head_mm: 0,
    folio_mm: 0,
    gap_mm: 6
  },
  deck_16_9: {
    id: "deck_16_9",
    status: "planned",
    orientation: "landscape",
    width_mm: 338.67,
    height_mm: 190.5,
    named_page: "bk-deck",
    margin_mm: { top: 12, bottom: 12, inner: 16, outer: 16 },
    head_mm: 0,
    folio_mm: 6,
    gap_mm: 6
  }
};
function bodyHeightMm(spec) {
  return spec.height_mm - spec.margin_mm.top - spec.margin_mm.bottom - spec.head_mm - spec.folio_mm - 2 * spec.gap_mm;
}
function printProfile(id) {
  return PRINT_PROFILE_SPECS[id];
}

// packages/brand-core/src/visual/i18n-book.ts
var en3 = {
  bookTitle: "Brand Book",
  coverKicker: "Brand Book",
  coverChapter: "Chapter",
  imprintTitle: "Imprint",
  imprintBrand: "Brand",
  imprintDocument: "Document",
  imprintEdition: "Edition",
  imprintAsOf: "Facts as of",
  imprintCommit: "Source commit",
  imprintTypeset: "Typeset in",
  typesetValue: "Inter, Rajdhani and Vazirmatn, under the SIL Open Font License 1.1",
  imprintFormat: "Format",
  formatBook: "A4 portrait book, {pages} pages",
  imprintRules: "Every plate is drawn from approved facts and the approved master file only. Drafts are never printed, restricted values are withheld, and gaps stay visible as gaps.",
  imprintClaims: "Framework and standard names show what informed the method. This book is not a certification and claims no conformance.",
  imprintOrigin: "Composed by Brand OS from the brand repository at the commit above.",
  imprintOriginFixture: "Composed by Brand OS from fictional example data. Nothing in it is a brand fact.",
  contentsTitle: "Contents",
  contentsPage: "Page",
  appendixTitle: "Sources and framework",
  continued: "{title}, continued",
  tableContinues: "Continues on the next page",
  notes: "Notes",
  noteRef: "Note {n}",
  folio: "Page {n}",
  printHint: 'A4 portrait book. Print with the browser, margins "None" or "Default", background graphics on.',
  exportWrote: "wrote {file}",
  exportNoChrome: "No Chrome found (set CHROME_PATH) or --no-pdf given: HTML only, paginated with built-in estimates.",
  exportMeasured: "measured {count} blocks in Chrome; pagination uses the measured heights",
  exportOverflow: "warning: page {page} of {file} still overflows after measuring; please report it",
  exportPlanned: "The {profile} profile is planned, not built yet. Nothing was written.",
  exportRefusedPath: "Refused: the output folder must be outside brand/ and .private folders, so generated files never mix with brand truth.",
  exportRefusedAgent: "Refused: brand:export-visual is an owner command and does not run under an agent token.",
  exportNoDocument: "This brand has no {doc} document to export (the module may be off, or the brand has no answers yet).",
  imprintUncommitted: "plus changes in brand/ not yet committed",
  exportUncommitted: "note: brand/ has changes that are not committed yet. The export shows this working copy, and the imprint says so next to the commit.",
  exportMeasureFailed: "warning: measuring in Chrome failed; pagination uses the built-in estimates, and the overflow check still runs"
};
var fa3 = {
  bookTitle: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F",
  coverKicker: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F",
  coverChapter: "\u0641\u0635\u0644",
  imprintTitle: "\u0634\u0646\u0627\u0633\u0646\u0627\u0645\u0647",
  imprintBrand: "\u0628\u0631\u0646\u062F",
  imprintDocument: "\u0633\u0646\u062F",
  imprintEdition: "\u0648\u06CC\u0631\u0627\u06CC\u0634",
  imprintAsOf: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0627 \u062A\u0627\u0631\u06CC\u062E",
  imprintCommit: "\u06A9\u0627\u0645\u06CC\u062A \u0645\u0646\u0628\u0639",
  imprintTypeset: "\u062D\u0631\u0648\u0641\u200C\u0686\u06CC\u0646\u06CC",
  typesetValue: "Inter\u060C Rajdhani \u0648 \u0648\u0632\u06CC\u0631\u0645\u062A\u0646\u060C \u0628\u0627 \u0645\u062C\u0648\u0632 SIL Open Font License 1.1",
  imprintFormat: "\u0642\u0637\u0639",
  formatBook: "\u06A9\u062A\u0627\u0628 A4 \u0639\u0645\u0648\u062F\u06CC\u060C {pages} \u0635\u0641\u062D\u0647",
  imprintRules: "\u0647\u0631 \u0635\u0641\u062D\u0647\u0654 \u0646\u0645\u0648\u0646\u0647 \u0641\u0642\u0637 \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0647\u0631\u06AF\u0632 \u0686\u0627\u067E \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u060C \u0645\u0642\u0627\u062F\u06CC\u0631 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u067E\u0646\u0647\u0627\u0646 \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F \u0648 \u062C\u0627\u0647\u0627\u06CC \u062E\u0627\u0644\u06CC \u062E\u0627\u0644\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
  imprintClaims: "\u0646\u0627\u0645 \u0686\u0627\u0631\u0686\u0648\u0628\u200C\u0647\u0627 \u0648 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F\u0647\u0627 \u0641\u0642\u0637 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F \u0631\u0648\u0634 \u0627\u0632 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0627\u0644\u0647\u0627\u0645 \u06AF\u0631\u0641\u062A\u0647 \u0627\u0633\u062A. \u0627\u06CC\u0646 \u06A9\u062A\u0627\u0628 \u06AF\u0648\u0627\u0647\u06CC\u200C\u0646\u0627\u0645\u0647 \u0646\u06CC\u0633\u062A \u0648 \u0627\u062F\u0639\u0627\u06CC \u0627\u0646\u0637\u0628\u0627\u0642 \u0646\u062F\u0627\u0631\u062F.",
  imprintOrigin: "\u0627\u06CC\u0646 \u06A9\u062A\u0627\u0628 \u0631\u0627 Brand OS \u0627\u0632 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F \u062F\u0631 \u06A9\u0627\u0645\u06CC\u062A \u0628\u0627\u0644\u0627 \u0633\u0627\u062E\u062A\u0647 \u0627\u0633\u062A.",
  imprintOriginFixture: "\u0627\u06CC\u0646 \u06A9\u062A\u0627\u0628 \u0631\u0627 Brand OS \u0627\u0632 \u062F\u0627\u062F\u0647\u0654 \u0646\u0645\u0648\u0646\u0647\u0654 \u062E\u06CC\u0627\u0644\u06CC \u0633\u0627\u062E\u062A\u0647 \u0627\u0633\u062A. \u0647\u06CC\u0686\u200C\u0686\u06CC\u0632 \u062F\u0631 \u0622\u0646 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0628\u0631\u0646\u062F \u0646\u06CC\u0633\u062A.",
  contentsTitle: "\u0641\u0647\u0631\u0633\u062A",
  contentsPage: "\u0635\u0641\u062D\u0647",
  appendixTitle: "\u0645\u0646\u0627\u0628\u0639 \u0648 \u0686\u0627\u0631\u0686\u0648\u0628",
  continued: "{title} (\u0627\u062F\u0627\u0645\u0647)",
  tableContinues: "\u0627\u062F\u0627\u0645\u0647 \u062F\u0631 \u0635\u0641\u062D\u0647\u0654 \u0628\u0639\u062F",
  notes: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627",
  noteRef: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A {n}",
  folio: "\u0635\u0641\u062D\u0647\u0654 {n}",
  printHint: "\u06A9\u062A\u0627\u0628 A4 \u0639\u0645\u0648\u062F\u06CC. \u0628\u0627 \u0645\u0631\u0648\u0631\u06AF\u0631 \u0686\u0627\u067E \u06A9\u0646\u06CC\u062F\u060C \u062D\u0627\u0634\u06CC\u0647 \xAB\u0647\u06CC\u0686\xBB \u06CC\u0627 \xAB\u067E\u06CC\u0634\u200C\u0641\u0631\u0636\xBB \u0648 \u06AF\u0631\u0627\u0641\u06CC\u06A9 \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0631\u0648\u0634\u0646.",
  exportWrote: "{file} \u0646\u0648\u0634\u062A\u0647 \u0634\u062F",
  exportNoChrome: "Chrome \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F (CHROME_PATH \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F) \u06CC\u0627 --no-pdf \u062F\u0627\u062F\u0647 \u0634\u062F: \u0641\u0642\u0637 HTML\u060C \u0628\u0627 \u0635\u0641\u062D\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0631 \u067E\u0627\u06CC\u0647\u0654 \u0628\u0631\u0622\u0648\u0631\u062F \u062F\u0627\u062E\u0644\u06CC.",
  exportMeasured: "{count} \u0628\u0644\u0648\u06A9 \u062F\u0631 Chrome \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0634\u062F\u061B \u0635\u0641\u062D\u0647\u200C\u0628\u0646\u062F\u06CC \u0627\u0632 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u0647\u0627\u06CC \u0648\u0627\u0642\u0639\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F",
  exportOverflow: "\u0647\u0634\u062F\u0627\u0631: \u0635\u0641\u062D\u0647\u0654 {page} \u0627\u0632 {file} \u067E\u0633 \u0627\u0632 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0647\u0646\u0648\u0632 \u0633\u0631\u0631\u06CC\u0632 \u062F\u0627\u0631\u062F\u061B \u0644\u0637\u0641\u0627\u064B \u06AF\u0632\u0627\u0631\u0634 \u062F\u0647\u06CC\u062F",
  exportPlanned: "\u067E\u0631\u0648\u0641\u0627\u06CC\u0644 {profile} \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0634\u062F\u0647 \u0648\u0644\u06CC \u0647\u0646\u0648\u0632 \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0686\u06CC\u0632\u06CC \u0646\u0648\u0634\u062A\u0647 \u0646\u0634\u062F.",
  exportRefusedPath: "\u0631\u062F \u0634\u062F: \u067E\u0648\u0634\u0647\u0654 \u062E\u0631\u0648\u062C\u06CC \u0628\u0627\u06CC\u062F \u0628\u06CC\u0631\u0648\u0646 \u0627\u0632 brand/ \u0648 \u067E\u0648\u0634\u0647\u200C\u0647\u0627\u06CC .private \u0628\u0627\u0634\u062F \u062A\u0627 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u0633\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0628\u0627 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u0635\u0644\u06CC \u0628\u0631\u0646\u062F \u0642\u0627\u0637\u06CC \u0646\u0634\u0648\u0646\u062F.",
  exportRefusedAgent: "\u0631\u062F \u0634\u062F: brand:export-visual \u0641\u0631\u0645\u0627\u0646 \u0645\u0627\u0644\u06A9 \u0627\u0633\u062A \u0648 \u0628\u0627 \u062A\u0648\u06A9\u0646 \u0639\u0627\u0645\u0644 \u0627\u062C\u0631\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  exportNoDocument: "\u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0633\u0646\u062F {doc} \u0628\u0631\u0627\u06CC \u062E\u0631\u0648\u062C\u06CC \u0646\u062F\u0627\u0631\u062F (\u0634\u0627\u06CC\u062F \u0645\u0627\u0698\u0648\u0644 \u062E\u0627\u0645\u0648\u0634 \u0627\u0633\u062A \u06CC\u0627 \u0647\u0646\u0648\u0632 \u067E\u0627\u0633\u062E\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647).",
  imprintUncommitted: "\u0628\u0647\u200C\u0647\u0645\u0631\u0627\u0647 \u062A\u063A\u06CC\u06CC\u0631\u0647\u0627\u06CC\u06CC \u062F\u0631 brand/ \u06A9\u0647 \u0647\u0646\u0648\u0632 \u06A9\u0627\u0645\u06CC\u062A \u0646\u0634\u062F\u0647\u200C\u0627\u0646\u062F",
  exportUncommitted: "\u062A\u0648\u062C\u0647: \u062F\u0631 brand/ \u062A\u063A\u06CC\u06CC\u0631\u0647\u0627\u06CC\u06CC \u0647\u0633\u062A \u06A9\u0647 \u0647\u0646\u0648\u0632 \u06A9\u0627\u0645\u06CC\u062A \u0646\u0634\u062F\u0647\u200C\u0627\u0646\u062F. \u062E\u0631\u0648\u062C\u06CC \u0647\u0645\u06CC\u0646 \u0646\u0633\u062E\u0647\u0654 \u0641\u0639\u0644\u06CC \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F \u0648 \u0634\u0646\u0627\u0633\u0646\u0627\u0645\u0647 \u0647\u0645 \u06A9\u0646\u0627\u0631 \u06A9\u0627\u0645\u06CC\u062A \u0627\u06CC\u0646 \u0631\u0627 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F.",
  exportMeasureFailed: "\u0647\u0634\u062F\u0627\u0631: \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u062F\u0631 Chrome \u0627\u0646\u062C\u0627\u0645 \u0646\u0634\u062F\u061B \u0635\u0641\u062D\u0647\u200C\u0628\u0646\u062F\u06CC \u0627\u0632 \u0628\u0631\u0622\u0648\u0631\u062F \u062F\u0627\u062E\u0644\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0628\u0631\u0631\u0633\u06CC \u0633\u0631\u0631\u06CC\u0632 \u0647\u0645\u0686\u0646\u0627\u0646 \u0627\u0646\u062C\u0627\u0645 \u0645\u06CC\u200C\u0634\u0648\u062F"
};
var tr3 = {
  bookTitle: "Marka Kitab\u0131",
  coverKicker: "Marka Kitab\u0131",
  coverChapter: "B\xF6l\xFCm",
  imprintTitle: "K\xFCnye",
  imprintBrand: "Marka",
  imprintDocument: "Belge",
  imprintEdition: "S\xFCr\xFCm",
  imprintAsOf: "Bilgilerin tarihi",
  imprintCommit: "Kaynak commit",
  imprintTypeset: "Dizgi",
  typesetValue: "Inter, Rajdhani ve Vazirmatn, SIL Open Font License 1.1 ile",
  imprintFormat: "Bi\xE7im",
  formatBook: "A4 dikey kitap, {pages} sayfa",
  imprintRules: "Her levha yaln\u0131zca onayl\u0131 bilgilerden ve onayl\u0131 ana dosyadan \xE7izilir. Taslaklar asla bas\u0131lmaz, k\u0131s\u0131tl\u0131 de\u011Ferler gizlenir, bo\u015Fluklar bo\u015Fluk olarak g\xF6r\xFCn\xFCr.",
  imprintClaims: "\xC7er\xE7eve ve standart adlar\u0131 y\xF6nteme neyin yol g\xF6sterdi\u011Fini belirtir. Bu kitap bir sertifika de\u011Fildir ve uygunluk iddias\u0131 ta\u015F\u0131maz.",
  imprintOrigin: "Brand OS taraf\u0131ndan, yukar\u0131daki commit an\u0131ndaki marka deposundan derlendi.",
  imprintOriginFixture: "Brand OS taraf\u0131ndan kurgusal \xF6rnek verilerle derlendi. \u0130\xE7indekilerin hi\xE7biri marka bilgisi de\u011Fildir.",
  contentsTitle: "\u0130\xE7indekiler",
  contentsPage: "Sayfa",
  appendixTitle: "Kaynaklar ve \xE7er\xE7eve",
  continued: "{title} (devam)",
  tableContinues: "Sonraki sayfada devam ediyor",
  notes: "Notlar",
  noteRef: "Not {n}",
  folio: "Sayfa {n}",
  printHint: 'A4 dikey kitap. Taray\u0131c\u0131yla yazd\u0131r\u0131n; kenar bo\u015Flu\u011Fu "Yok" veya "Varsay\u0131lan", arka plan grafikleri a\xE7\u0131k.',
  exportWrote: "{file} yaz\u0131ld\u0131",
  exportNoChrome: "Chrome bulunamad\u0131 (CHROME_PATH ayarlay\u0131n) veya --no-pdf verildi: yaln\u0131zca HTML, yerle\u015Fik tahminlerle sayfaland\u0131.",
  exportMeasured: "Chrome'da {count} blok \xF6l\xE7\xFCld\xFC; sayfalama \xF6l\xE7\xFClen y\xFCkseklikleri kullan\u0131yor",
  exportOverflow: "uyar\u0131: {file} dosyas\u0131n\u0131n {page}. sayfas\u0131 \xF6l\xE7\xFCmden sonra h\xE2l\xE2 ta\u015F\u0131yor; l\xFCtfen bildirin",
  exportPlanned: "{profile} profili planland\u0131 ama hen\xFCz yap\u0131lmad\u0131. Hi\xE7bir \u015Fey yaz\u0131lmad\u0131.",
  exportRefusedPath: "Reddedildi: \xE7\u0131kt\u0131 klas\xF6r\xFC brand/ ve .private klas\xF6rlerinin d\u0131\u015F\u0131nda olmal\u0131; \xFCretilen dosyalar marka ger\xE7e\u011Fiyle kar\u0131\u015Fmaz.",
  exportRefusedAgent: "Reddedildi: brand:export-visual bir sahip komutudur ve ajan belirteciyle \xE7al\u0131\u015Fmaz.",
  exportNoDocument: "Bu markan\u0131n d\u0131\u015Fa aktar\u0131lacak {doc} belgesi yok (mod\xFCl kapal\u0131 olabilir ya da hen\xFCz yan\u0131t yok).",
  imprintUncommitted: "ve brand/ i\xE7inde hen\xFCz commit edilmemi\u015F de\u011Fi\u015Fiklikler",
  exportUncommitted: "not: brand/ i\xE7inde hen\xFCz commit edilmemi\u015F de\u011Fi\u015Fiklikler var. D\u0131\u015Fa aktar\u0131m bu \xE7al\u0131\u015Fma kopyas\u0131n\u0131 g\xF6sterir; k\xFCnye bunu commit bilgisinin yan\u0131nda belirtir.",
  exportMeasureFailed: "uyar\u0131: Chrome'da \xF6l\xE7\xFCm ba\u015Far\u0131s\u0131z oldu; sayfalama yerle\u015Fik tahminleri kullan\u0131yor, ta\u015Fma denetimi yine \xE7al\u0131\u015F\u0131yor"
};
var BOOK_TEXT = { en: en3, fa: fa3, tr: tr3 };
function bookText(lang) {
  return BOOK_TEXT[lang];
}

// packages/brand-core/src/visual/competitors.ts
var OWN_BRAND_FACTS = {
  offer: "business.offer.summary",
  audience: "business.customer.primary_segment",
  geography: "business.market.geography",
  public_price: "business.sales.pricing",
  public_message: "business.offer.value_proposition",
  visual_language: "brand.color.roles",
  observable_channels: "business.marketing.channels"
};
var CELL_STATE = {
  observed: "present",
  unverified: "unverified",
  historical: "historical",
  conflicting: "conflicting",
  needs_review: "needs_review",
  unknown: "unknown"
};
var OWN_LABEL_CHARS = 160;
function clip(text3) {
  const clean = text3.replace(/\s+/g, " ").trim();
  return clean.length > OWN_LABEL_CHARS ? `${clean.slice(0, OWN_LABEL_CHARS - 1).trimEnd()}\u2026` : clean;
}
function drawable(entry2) {
  return entry2.state === "approved" || entry2.state === "stale";
}
function ownCell(criterion, source2) {
  const entry2 = drawable(source2.entry) ? source2.entry : { ...source2.entry, value: null };
  const swatches2 = drawable(entry2) && source2.structured?.type === "color" ? source2.structured.colors.map((color) => color.hex).filter((hex) => /^#[0-9a-fA-F]{6}$/.test(hex)).slice(0, 6) : [];
  const label = drawable(entry2) ? source2.structured?.type === "color" ? source2.structured.colors.map((color) => color.role).join(" \xB7 ") : entry2.value ? clip(entry2.value) : "" : "";
  return { criterion, state: drawable(entry2) ? "present" : "unknown", labels: label ? [label] : [], swatches: swatches2, footnotes: [], own: entry2 };
}
function blockBase(id, filled, asOf, sources) {
  return {
    block_id: id,
    framework_id: null,
    data_state: filled,
    sources,
    as_of: asOf,
    computed_from: ["brand/competitive/shared/landscape.json"],
    visibility: "internal",
    renderer_variant: id === "competitor-matrix" ? "matrix.book.v1" : id === "positioning-map" ? "positioning.map.v1" : "prices.strip.v1",
    layout_constraints: { preserve_topology: false, min_print_pt: 7, print_profile: "book_a4_portrait" }
  };
}
function staleAt(sources, now, maxDays) {
  if (!sources.length) return false;
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T00:00:00Z`);
  const newest = sources.map((s) => Date.parse(`${s.observed_on}T00:00:00Z`)).reduce((a, b) => Math.max(a, b));
  if (!Number.isFinite(newest)) return false;
  return Math.floor((today - newest) / 864e5) - 1 > maxDays;
}
function agedLandscape(landscape, now) {
  const maxDays = DEFAULT_STALENESS_DAYS.market_observation;
  const current = /* @__PURE__ */ new Set(["observed", "unverified"]);
  const aged = structuredClone(landscape);
  for (const competitor of aged.competitors) for (const cell of competitor.cells) if (current.has(cell.state) && staleAt(cell.sources, now, maxDays)) cell.state = "historical";
  for (const row of aged.prices.rows) if (current.has(row.state) && staleAt([row.source], now, maxDays)) row.state = "historical";
  const pos = aged.positioning;
  if (pos) {
    for (const pair of [pos.own, ...pos.competitors]) for (const p of [pair.x, pair.y]) if (p.state === "evidenced" && staleAt(p.sources, now, pos.stale_after_days)) p.state = "stale";
  }
  return aged;
}
function comparisonDocument(input) {
  const criteria = [...SHARED_CRITERIA];
  const landscape = input.read.state === "shared" ? input.now ? agedLandscape(input.read.landscape, input.now) : input.read.landscape : null;
  const footnotes = [];
  const noteFor = (source2) => {
    const found = footnotes.find((item) => item.source_class === source2.source_class && item.host === source2.host && item.observed_on === source2.observed_on);
    if (found) return found.n;
    const n = footnotes.length + 1;
    footnotes.push({ n, source_class: source2.source_class, host: source2.host, observed_on: source2.observed_on });
    return n;
  };
  const ownRow = {
    row_id: "own",
    kind: "own_brand",
    name: input.brand_name,
    relationship: [],
    markets: [],
    official_domain: null,
    needs_refresh: false,
    cells: criteria.map((criterion) => ownCell(criterion, input.own[criterion] ?? { entry: missingEntry(OWN_BRAND_FACTS[criterion]), structured: null }))
  };
  const rows2 = [ownRow];
  for (const competitor of landscape?.competitors ?? []) {
    rows2.push({
      row_id: competitor.competitor_id,
      kind: "competitor",
      name: competitor.display_name,
      relationship: [...competitor.relationship],
      markets: [...competitor.markets],
      official_domain: competitor.official_domain,
      needs_refresh: competitor.assessment === "needs_refresh",
      cells: competitor.cells.map((cell) => ({ criterion: cell.criterion, state: CELL_STATE[cell.state], labels: [...cell.labels], swatches: [], footnotes: cell.sources.map(noteFor), own: null }))
    });
  }
  const nameOf = new Map((landscape?.competitors ?? []).map((c) => [c.competitor_id, c.display_name]));
  const groups = [];
  for (const price2 of landscape?.prices.rows ?? []) {
    const row = {
      competitor_id: price2.competitor_id,
      competitor_name: nameOf.get(price2.competitor_id) ?? "",
      offer_name: price2.offer_name,
      amount: price2.amount,
      currency: price2.currency,
      market: price2.market,
      billing_period: price2.billing_period,
      billing_commitment: price2.billing_commitment,
      tax_inclusion: price2.tax_inclusion,
      promotion: price2.promotion,
      feature_scope: price2.feature_scope,
      rate_label: price2.rate_label,
      state: price2.state,
      footnote: noteFor(price2.source)
    };
    const group = groups.find((g) => g.currency === price2.currency);
    if (group) group.rows.push(row);
    else groups.push({ currency: price2.currency, rows: [row] });
  }
  const priced = new Set((landscape?.prices.rows ?? []).map((p) => p.competitor_id));
  const unpriced = (landscape?.competitors ?? []).filter((c) => !priced.has(c.competitor_id)).map((c) => c.display_name);
  const competitorCells = rows2.filter((r) => r.kind === "competitor").flatMap((r) => r.cells);
  const known = competitorCells.filter((cell) => cell.state !== "unknown").length;
  const matrixState = !competitorCells.length || !known ? "missing" : known === competitorCells.length ? "complete" : "partial";
  const asOf = landscape?.as_of ?? null;
  const ownSources = Object.values(input.own).flatMap((source2) => drawable(source2.entry) ? source2.entry.sources : []);
  const matrix = {
    ...blockBase("competitor-matrix", matrixState, asOf, [...new Set(ownSources)]),
    type: "competitor_matrix",
    criteria,
    rows: rows2,
    footnotes,
    share_state: input.read.state,
    withheld_reason: input.read.state === "withheld" ? input.read.reason : null,
    not_shared: landscape ? { ...landscape.not_shared } : null,
    withheld_text: landscape?.withheld_text ?? 0
  };
  const strip = {
    ...blockBase("price-strip", groups.length ? unpriced.length ? "partial" : "complete" : "missing", asOf, []),
    type: "price_strip",
    groups,
    unpriced,
    ranked: false,
    currency_conversion: "none"
  };
  const map = positioningMap(landscape, input.read.state, input.brand_name, noteFor);
  const summary = emptyStatusSummary();
  for (const cell of ownRow.cells) if (cell.own) summary[cell.own.state] += 1;
  return {
    schema: VISUAL_SCHEMA,
    schema_version: 1,
    document_kind: "competitor_comparison",
    brand_id: input.brand_id,
    brand_name: input.brand_name,
    audience: "internal",
    illustrative: input.illustrative,
    origin: input.illustrative ? "illustrative_fixture" : "brand_repository",
    as_of: asOf,
    classification: "internal",
    print_profile: "book_a4_portrait",
    status_summary: summary,
    framework_refs: [],
    blocks: [matrix, strip, map]
  };
}
var DRAWN = /* @__PURE__ */ new Set(["evidenced", "stale", "conflicting"]);
function positioningMap(landscape, shareState, brandName, noteFor) {
  const pos = landscape?.positioning ?? null;
  const points = [];
  const unplotted = [];
  if (pos && landscape) {
    const names2 = new Map(landscape.competitors.map((c) => [c.competitor_id, c.display_name]));
    const placed2 = (p) => ({ state: p.state, bands: [...p.bands] });
    const subjects = [{ subject_id: "own", kind: "own_brand", name: brandName, x: pos.own.x, y: pos.own.y }, ...pos.competitors.map((c) => ({ subject_id: c.competitor_id, kind: "competitor", name: names2.get(c.competitor_id) ?? "", x: c.x, y: c.y }))];
    for (const s of subjects) {
      const drawn = DRAWN.has(s.x.state) && DRAWN.has(s.y.state);
      const point = { subject_id: s.subject_id, kind: s.kind, name: s.name, n: null, x: placed2(s.x), y: placed2(s.y), footnotes: [] };
      if (drawn) {
        point.footnotes = [...new Set([...s.x.sources, ...s.y.sources].map(noteFor))].sort((a, b) => a - b);
        if (s.kind === "competitor") point.n = points.filter((p) => p.kind === "competitor").length + 1;
        points.push(point);
      } else {
        unplotted.push(point);
      }
    }
  }
  const competitorsTotal = pos ? pos.competitors.length + 1 : 0;
  const state2 = !points.length ? "missing" : points.length === competitorsTotal ? "complete" : "partial";
  return {
    ...blockBase("positioning-map", state2, landscape?.as_of ?? null, []),
    type: "positioning_map",
    axes: pos ? { x: pos.axes.x, y: pos.axes.y } : null,
    bands: pos ? [...pos.bands] : [],
    stale_after_days: pos?.stale_after_days ?? null,
    points,
    unplotted,
    share_state: shareState
  };
}
function missingEntry(id) {
  return { id, label: id, state: "missing", value: null, sources: [], version: null, approved_at: null, review_due: null, note: null, missing_reason: "unanswered" };
}
function buildCompetitorComparison(engine, read, options = {}) {
  const root = engine.workspaceRoot();
  const config = engine.config();
  const brandId = config.brand.slug;
  const now = options.now ?? /* @__PURE__ */ new Date();
  const facts = readFacts(root, "approved", brandId);
  const answers = latestAnswers(engine.ledger().records);
  const context = { facts, answers, audience: "internal", root, brandId, evidence: readEvidence(root), now };
  const own2 = {};
  for (const [criterion, id] of Object.entries(OWN_BRAND_FACTS)) {
    const question = engine.question(id);
    if (!question) {
      own2[criterion] = { entry: missingEntry(id), structured: null };
      continue;
    }
    const item = itemFor(question, context);
    const fact = facts[id];
    const status = answers.get(id)?.status;
    const { approved: _approved, ...entry2 } = entryFromItem(item, fact, false, now, status === "unknown" || status === "skipped" || status === "deprecated" ? status : "unanswered");
    void _approved;
    own2[criterion] = { entry: entry2, structured: item.structured };
  }
  return comparisonDocument({ brand_id: brandId, brand_name: String(config.brand.name ?? brandId), illustrative: false, read, own: own2, now });
}

// packages/brand-core/src/visual/i18n-competitors.ts
var en4 = {
  kicker: "Market and competition",
  title: "Competitor comparison matrix",
  lead: "How the competitors you reviewed compare with your brand on the same standard criteria. Drawn only from the landscape you shared; nothing is ranked, scored or converted.",
  navLabel: "Competitor comparison",
  ownBrand: "Your brand",
  ownRowNote: "Your row shows approved facts only. Drafts and gaps show their state, never a value.",
  criteria: {
    offer: "Offer",
    audience: "Target audience",
    geography: "Markets served",
    public_price: "Public pricing",
    public_message: "Key message",
    visual_language: "Visual identity",
    observable_channels: "Channels"
  },
  cellState: {
    present: "Observed",
    unverified: "Observed, source not verified",
    historical: "Historical",
    conflicting: "Sources disagree",
    needs_review: "Source needs review",
    absent: "Not offered (source states it)",
    unknown: "Unknown"
  },
  relationship: { direct: "Direct competitor", indirect: "Indirect competitor", substitute: "Substitute", aspirational_benchmark: "Benchmark" },
  sourceClass: {
    competitor_own_page: "Competitor\u2019s own page",
    platform_documentation: "Platform documentation",
    independent_reporting: "Independent reporting",
    analyst_inference: "Analyst view",
    owner_statement: "Owner statement",
    first_party_data: "First-party data",
    unreadable: "Source not readable"
  },
  readOn: "read {date}",
  markets: "Markets",
  verifiedDomain: "Verified domain",
  needsRefresh: "Needs refresh",
  competitorCol: "Business",
  matrixCaption: "Rows are businesses, columns are standard comparison criteria. Row order is alphabetical, not a ranking.",
  sourcesTitle: "Sources",
  sourcesLead: "Who is speaking and when the source was read. Quotes stay in the owner\u2019s private research notes.",
  pricesTitle: "Published prices",
  pricesLead: "As each competitor publishes them, grouped by currency. Never ranked, never converted.",
  period: { month: "per month", year: "per year", one_time: "one-time", unknown: "period unknown" },
  commitment: { monthly: "billed monthly", annual: "billed annually", none: "no commitment", unknown: "billing unknown" },
  tax: { included: "tax included", excluded: "tax excluded", unknown: "tax unknown" },
  rateLabel: {
    standard_rate: "Standard rate",
    promotional: "Promotional",
    promotion_unknown: "Promotion not known",
    monthly_rate_billed_annually: "Monthly rate, billed annually",
    terms_unknown: "Terms unknown"
  },
  priceState: { observed: "Current", unverified: "Current, not verified", historical: "Historical", conflicting: "Sources disagree" },
  market: "Market {market}",
  currencyGroup: "Prices in {currency}",
  noConversion: "No currency conversion. Prices in different currencies, markets or terms are not comparable as they stand.",
  unpricedTitle: "No public price shared",
  unpricedBody: "Unknown stays unknown: no price is assumed.",
  noPrices: "No public prices were shared.",
  emptyTitle: "No competitor landscape shared yet",
  emptyBody: "This matrix is drawn only from a file you write and commit yourself. Your competitor research stays private until then.",
  emptyStepsTitle: "To share it",
  emptySteps: [
    "Review competitors in your local index: npm run brand:competitive -- list",
    "Mark each one you have checked: npm run brand:competitive -- status --id \u2026 --status owner_reviewed",
    "Write the shared file: npm run brand:competitive -- share",
    "Review the diff, then commit and merge it. Studio shows the matrix after the next sync."
  ],
  sharedEmptyTitle: "Shared, but no reviewed competitors yet",
  sharedEmptyBody: "The shared landscape has no owner-reviewed competitors. Candidates are never shown here.",
  withheldTitle: "The shared landscape was not shown",
  withheldBody: "The shared competitor file on this commit did not pass Studio\u2019s checks: {reason}. Run the share command again and commit the result.",
  withheldReason: {
    symlink: "it is a symbolic link",
    unreadable: "it could not be read",
    invalid_record: "its contents are not in the expected shape",
    wrong_brand: "it belongs to another brand",
    unsafe_text: "it looks like it contains private data"
  },
  notShared: "Not shown: {candidates} unreviewed candidate(s), {disputed} disputed, {archived} archived.",
  withheldText: "{count} label(s) were left out because they matched a source quote or looked private.",
  legendTitle: "How to read the matrix",
  neverTitle: "What this page never says",
  never: [
    "No ranking, score or winner.",
    "No currency conversion or price comparison across terms.",
    "No ad performance, market share or private commercial terms.",
    "Not a legal clearance, and it approves nothing."
  ],
  detailsIds: "Technical ids",
  openPrint: "Print view",
  backToMatrix: "Back to the comparison matrix",
  printTitle: "Print or save as PDF",
  runningHead: "Brand OS \xB7 Competitor comparison matrix",
  pageMatrix: "Comparison matrix",
  pagePrices: "Published prices",
  pageSources: "Sources",
  bannerTitle: "Competitor comparison matrix",
  bannerBody: "See how the competitors you reviewed compare with your brand on standard criteria.",
  bannerLink: "Open the matrix",
  internalOnly: "Internal edition only: a comparison that names other businesses has no public edition.",
  asOfNone: "Nothing shared yet"
};
var fa4 = {
  kicker: "\u0628\u0627\u0632\u0627\u0631 \u0648 \u0631\u0642\u0627\u0628\u062A",
  title: "\u0645\u0627\u062A\u0631\u06CC\u0633 \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0631\u0642\u0628\u0627",
  lead: "\u0631\u0642\u0628\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F\u060C \u0628\u0627 \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u06CC\u06A9\u0633\u0627\u0646 \u06A9\u0646\u0627\u0631 \u0628\u0631\u0646\u062F \u0634\u0645\u0627. \u0641\u0642\u0637 \u0627\u0632 \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0628\u0647\u200C\u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0634\u062A\u0647\u200C\u0634\u062F\u0647 \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u0647\u06CC\u0686 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC\u060C \u0627\u0645\u062A\u06CC\u0627\u0632\u062F\u0647\u06CC \u06CC\u0627 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632\u06CC \u062F\u0631 \u06A9\u0627\u0631 \u0646\u06CC\u0633\u062A.",
  navLabel: "\u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0631\u0642\u0628\u0627",
  ownBrand: "\u0628\u0631\u0646\u062F \u0634\u0645\u0627",
  ownRowNote: "\u0631\u062F\u06CC\u0641 \u0634\u0645\u0627 \u0641\u0642\u0637 \u0648\u0627\u0642\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F. \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633\u200C\u0647\u0627 \u0648 \u062C\u0627\u0647\u0627\u06CC \u062E\u0627\u0644\u06CC \u0641\u0642\u0637 \u0648\u0636\u0639\u06CC\u062A\u0634\u0627\u0646 \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F\u060C \u0646\u0647 \u0645\u0642\u062F\u0627\u0631 \u0631\u0627.",
  criteria: {
    offer: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F",
    audience: "\u0645\u062E\u0627\u0637\u0628 \u0647\u062F\u0641",
    geography: "\u0628\u0627\u0632\u0627\u0631\u0647\u0627\u06CC \u062A\u062D\u062A \u067E\u0648\u0634\u0634",
    public_price: "\u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u0639\u0645\u0648\u0645\u06CC",
    public_message: "\u067E\u06CC\u0627\u0645 \u0627\u0635\u0644\u06CC",
    visual_language: "\u0647\u0648\u06CC\u062A \u0628\u0635\u0631\u06CC",
    observable_channels: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627"
  },
  cellState: {
    present: "\u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647",
    unverified: "\u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0634\u062F\u0647\u060C \u0645\u0646\u0628\u0639 \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647",
    historical: "\u0642\u062F\u06CC\u0645\u06CC",
    conflicting: "\u0645\u0646\u0627\u0628\u0639 \u0646\u0627\u0647\u0645\u062E\u0648\u0627\u0646",
    needs_review: "\u0645\u0646\u0628\u0639 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u0627\u0631\u062F",
    absent: "\u0627\u0631\u0627\u0626\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F (\u0628\u0647 \u06AF\u0641\u062A\u0647\u0654 \u0645\u0646\u0628\u0639)",
    unknown: "\u0646\u0627\u0645\u0639\u0644\u0648\u0645"
  },
  relationship: { direct: "\u0631\u0642\u06CC\u0628 \u0645\u0633\u062A\u0642\u06CC\u0645", indirect: "\u0631\u0642\u06CC\u0628 \u063A\u06CC\u0631\u0645\u0633\u062A\u0642\u06CC\u0645", substitute: "\u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646", aspirational_benchmark: "\u0627\u0644\u06AF\u0648\u06CC \u0645\u0631\u062C\u0639" },
  sourceClass: {
    competitor_own_page: "\u0635\u0641\u062D\u0647\u0654 \u062E\u0648\u062F \u0631\u0642\u06CC\u0628",
    platform_documentation: "\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u067E\u0644\u062A\u0641\u0631\u0645",
    independent_reporting: "\u06AF\u0632\u0627\u0631\u0634 \u0645\u0633\u062A\u0642\u0644",
    analyst_inference: "\u062F\u06CC\u062F\u06AF\u0627\u0647 \u062A\u062D\u0644\u06CC\u0644\u06AF\u0631",
    owner_statement: "\u0627\u0638\u0647\u0627\u0631 \u0645\u0627\u0644\u06A9",
    first_party_data: "\u062F\u0627\u062F\u0647\u0654 \u062F\u0633\u062A\u200C\u0627\u0648\u0644",
    unreadable: "\u0645\u0646\u0628\u0639 \u062E\u0648\u0627\u0646\u0627 \u0646\u06CC\u0633\u062A"
  },
  readOn: "\u062E\u0648\u0627\u0646\u062F\u0647\u200C\u0634\u062F\u0647 \u062F\u0631 {date}",
  markets: "\u0628\u0627\u0632\u0627\u0631\u0647\u0627",
  verifiedDomain: "\u062F\u0627\u0645\u0646\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  needsRefresh: "\u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC",
  competitorCol: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
  matrixCaption: "\u0631\u062F\u06CC\u0641\u200C\u0647\u0627 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627 \u0648 \u0633\u062A\u0648\u0646\u200C\u0647\u0627 \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0645\u0642\u0627\u06CC\u0633\u0647\u200C\u0627\u0646\u062F. \u062A\u0631\u062A\u06CC\u0628 \u0631\u062F\u06CC\u0641\u200C\u0647\u0627 \u0627\u0644\u0641\u0628\u0627\u06CC\u06CC \u0627\u0633\u062A\u060C \u0646\u0647 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC.",
  sourcesTitle: "\u0645\u0646\u0627\u0628\u0639",
  sourcesLead: "\u0686\u0647 \u06A9\u0633\u06CC \u0633\u062E\u0646 \u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F \u0648 \u0645\u0646\u0628\u0639 \u06A9\u06CC \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647 \u0627\u0633\u062A. \u0646\u0642\u0644\u200C\u0642\u0648\u0644\u200C\u0647\u0627 \u062F\u0631 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u062E\u0635\u0648\u0635\u06CC \u0645\u0627\u0644\u06A9 \u0645\u06CC\u200C\u0645\u0627\u0646\u0646\u062F.",
  pricesTitle: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0645\u0646\u062A\u0634\u0631\u0634\u062F\u0647",
  pricesLead: "\u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0647\u0631 \u0631\u0642\u06CC\u0628 \u0645\u0646\u062A\u0634\u0631 \u06A9\u0631\u062F\u0647\u060C \u0628\u0647 \u062A\u0641\u06A9\u06CC\u06A9 \u0627\u0631\u0632. \u0647\u0631\u06AF\u0632 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627 \u062A\u0628\u062F\u06CC\u0644 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  period: { month: "\u0645\u0627\u0647\u0627\u0646\u0647", year: "\u0633\u0627\u0644\u0627\u0646\u0647", one_time: "\u06CC\u06A9\u200C\u0628\u0627\u0631\u0647", unknown: "\u062F\u0648\u0631\u0647\u0654 \u0646\u0627\u0645\u0639\u0644\u0648\u0645" },
  commitment: { monthly: "\u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0645\u0627\u0647\u0627\u0646\u0647", annual: "\u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0633\u0627\u0644\u0627\u0646\u0647", none: "\u0628\u062F\u0648\u0646 \u062A\u0639\u0647\u062F", unknown: "\u0646\u062D\u0648\u0647\u0654 \u0635\u0648\u0631\u062A\u200C\u062D\u0633\u0627\u0628 \u0646\u0627\u0645\u0639\u0644\u0648\u0645" },
  tax: { included: "\u0628\u0627 \u0645\u0627\u0644\u06CC\u0627\u062A", excluded: "\u0628\u062F\u0648\u0646 \u0645\u0627\u0644\u06CC\u0627\u062A", unknown: "\u0648\u0636\u0639\u06CC\u062A \u0645\u0627\u0644\u06CC\u0627\u062A \u0646\u0627\u0645\u0639\u0644\u0648\u0645" },
  rateLabel: {
    standard_rate: "\u0646\u0631\u062E \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F",
    promotional: "\u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u06CC",
    promotion_unknown: "\u0648\u0636\u0639\u06CC\u062A \u062A\u062E\u0641\u06CC\u0641 \u0646\u0627\u0645\u0639\u0644\u0648\u0645",
    monthly_rate_billed_annually: "\u0646\u0631\u062E \u0645\u0627\u0647\u0627\u0646\u0647 \u0628\u0627 \u067E\u0631\u062F\u0627\u062E\u062A \u0633\u0627\u0644\u0627\u0646\u0647",
    terms_unknown: "\u0634\u0631\u0627\u06CC\u0637 \u0646\u0627\u0645\u0639\u0644\u0648\u0645"
  },
  priceState: { observed: "\u062C\u0627\u0631\u06CC", unverified: "\u062C\u0627\u0631\u06CC\u060C \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647", historical: "\u0642\u062F\u06CC\u0645\u06CC", conflicting: "\u0645\u0646\u0627\u0628\u0639 \u0646\u0627\u0647\u0645\u062E\u0648\u0627\u0646" },
  market: "\u0628\u0627\u0632\u0627\u0631 {market}",
  currencyGroup: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0647 {currency}",
  noConversion: "\u0647\u06CC\u0686 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632\u06CC \u0627\u0646\u062C\u0627\u0645 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0642\u06CC\u0645\u062A\u200C\u0647\u0627 \u0628\u0627 \u0627\u0631\u0632\u060C \u0628\u0627\u0632\u0627\u0631 \u06CC\u0627 \u0634\u0631\u0627\u06CC\u0637 \u0645\u062A\u0641\u0627\u0648\u062A\u060C \u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0647\u0633\u062A\u0646\u062F \u0642\u0627\u0628\u0644 \u0645\u0642\u0627\u06CC\u0633\u0647 \u0646\u06CC\u0633\u062A\u0646\u062F.",
  unpricedTitle: "\u0642\u06CC\u0645\u062A \u0639\u0645\u0648\u0645\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0646\u0634\u062F\u0647",
  unpricedBody: "\u0646\u0627\u0645\u0639\u0644\u0648\u0645\u060C \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F: \u0647\u06CC\u0686 \u0642\u06CC\u0645\u062A\u06CC \u0641\u0631\u0636 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  noPrices: "\u0647\u06CC\u0686 \u0642\u06CC\u0645\u062A \u0639\u0645\u0648\u0645\u06CC\u200C\u0627\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
  emptyTitle: "\u0647\u0646\u0648\u0632 \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0631\u0642\u0628\u0627 \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0646\u0634\u062F\u0647",
  emptyBody: "\u0627\u06CC\u0646 \u0645\u0627\u062A\u0631\u06CC\u0633 \u0641\u0642\u0637 \u0627\u0632 \u0641\u0627\u06CC\u0644\u06CC \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u062E\u0648\u062F\u062A\u0627\u0646 \u0645\u06CC\u200C\u0646\u0648\u06CC\u0633\u06CC\u062F \u0648 commit \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F. \u062A\u0627 \u0622\u0646 \u0632\u0645\u0627\u0646 \u067E\u0698\u0648\u0647\u0634 \u0631\u0642\u0628\u0627 \u062E\u0635\u0648\u0635\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
  emptyStepsTitle: "\u0628\u0631\u0627\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC",
  emptySteps: [
    "\u0631\u0642\u0628\u0627 \u0631\u0627 \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u0645\u062D\u0644\u06CC \u062E\u0648\u062F \u0645\u0631\u0648\u0631 \u06A9\u0646\u06CC\u062F: npm run brand:competitive -- list",
    "\u0647\u0631 \u0631\u0642\u06CC\u0628\u06CC \u0631\u0627 \u06A9\u0647 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F \u0639\u0644\u0627\u0645\u062A \u0628\u0632\u0646\u06CC\u062F: npm run brand:competitive -- status --id \u2026 --status owner_reviewed",
    "\u0641\u0627\u06CC\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F: npm run brand:competitive -- share",
    "\u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0631\u0627 \u0645\u0631\u0648\u0631 \u06A9\u0646\u06CC\u062F\u060C \u0633\u067E\u0633 commit \u0648 merge \u06A9\u0646\u06CC\u062F. Studio \u067E\u0633 \u0627\u0632 \u0647\u0645\u06AF\u0627\u0645\u200C\u0633\u0627\u0632\u06CC \u0628\u0639\u062F\u06CC \u0645\u0627\u062A\u0631\u06CC\u0633 \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F."
  ],
  sharedEmptyTitle: "\u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F\u0647\u060C \u0627\u0645\u0627 \u0647\u0646\u0648\u0632 \u0631\u0642\u06CC\u0628 \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647\u200C\u0627\u06CC \u0646\u06CC\u0633\u062A",
  sharedEmptyBody: "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0647\u06CC\u0686 \u0631\u0642\u06CC\u0628 \u0628\u0631\u0631\u0633\u06CC\u200C\u0634\u062F\u0647 \u062A\u0648\u0633\u0637 \u0645\u0627\u0644\u06A9 \u0646\u062F\u0627\u0631\u062F. \u0646\u0627\u0645\u0632\u062F\u0647\u0627 \u0647\u0631\u06AF\u0632 \u0627\u06CC\u0646\u062C\u0627 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
  withheldTitle: "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0634\u062F",
  withheldBody: "\u0641\u0627\u06CC\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0631\u0642\u0628\u0627 \u062F\u0631 \u0627\u06CC\u0646 commit \u0627\u0632 \u0628\u0631\u0631\u0633\u06CC\u200C\u0647\u0627\u06CC Studio \u0639\u0628\u0648\u0631 \u0646\u06A9\u0631\u062F: {reason}. \u0641\u0631\u0645\u0627\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u06AF\u0630\u0627\u0631\u06CC \u0631\u0627 \u062F\u0648\u0628\u0627\u0631\u0647 \u0627\u062C\u0631\u0627 \u0648 \u0646\u062A\u06CC\u062C\u0647 \u0631\u0627 commit \u06A9\u0646\u06CC\u062F.",
  withheldReason: {
    symlink: "\u06CC\u06A9 \u067E\u06CC\u0648\u0646\u062F \u0646\u0645\u0627\u062F\u06CC\u0646 \u0627\u0633\u062A",
    unreadable: "\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F",
    invalid_record: "\u0645\u062D\u062A\u0648\u0627\u06CC \u0622\u0646 \u0633\u0627\u062E\u062A\u0627\u0631 \u0645\u0648\u0631\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0631\u0627 \u0646\u062F\u0627\u0631\u062F",
    wrong_brand: "\u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u0628\u0631\u0646\u062F \u062F\u06CC\u06AF\u0631\u06CC \u0627\u0633\u062A",
    unsafe_text: "\u0628\u0647 \u0646\u0638\u0631 \u0645\u06CC\u200C\u0631\u0633\u062F \u062F\u0627\u062F\u0647\u0654 \u062E\u0635\u0648\u0635\u06CC \u062F\u0627\u0631\u062F"
  },
  notShared: "\u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0634\u062F\u0647: {candidates} \u0646\u0627\u0645\u0632\u062F \u0628\u0631\u0631\u0633\u06CC\u200C\u0646\u0634\u062F\u0647\u060C {disputed} \u0645\u0648\u0631\u062F \u0645\u0646\u0627\u0642\u0634\u0647\u060C {archived} \u0628\u0627\u06CC\u06AF\u0627\u0646\u06CC\u200C\u0634\u062F\u0647.",
  withheldText: "{count} \u0628\u0631\u0686\u0633\u0628 \u06A9\u0646\u0627\u0631 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F\u060C \u0686\u0648\u0646 \u0628\u0627 \u0646\u0642\u0644\u200C\u0642\u0648\u0644 \u0645\u0646\u0628\u0639 \u06CC\u06A9\u06CC \u0628\u0648\u062F \u06CC\u0627 \u062E\u0635\u0648\u0635\u06CC \u0628\u0647 \u0646\u0638\u0631 \u0645\u06CC\u200C\u0631\u0633\u06CC\u062F.",
  legendTitle: "\u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u062E\u0648\u0627\u0646\u062F\u0646 \u0645\u0627\u062A\u0631\u06CC\u0633",
  neverTitle: "\u0622\u0646\u0686\u0647 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u0647\u0631\u06AF\u0632 \u0646\u0645\u06CC\u200C\u06AF\u0648\u06CC\u062F",
  never: [
    "\u0647\u06CC\u0686 \u0631\u062A\u0628\u0647\u200C\u0628\u0646\u062F\u06CC\u060C \u0627\u0645\u062A\u06CC\u0627\u0632 \u06CC\u0627 \u0628\u0631\u0646\u062F\u0647\u200C\u0627\u06CC.",
    "\u0647\u06CC\u0686 \u062A\u0628\u062F\u06CC\u0644 \u0627\u0631\u0632\u06CC \u06CC\u0627 \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0642\u06CC\u0645\u062A \u0628\u0627 \u0634\u0631\u0627\u06CC\u0637 \u0645\u062A\u0641\u0627\u0648\u062A.",
    "\u0647\u06CC\u0686 \u062F\u0627\u062F\u0647\u0654 \u0639\u0645\u0644\u06A9\u0631\u062F \u062A\u0628\u0644\u06CC\u063A\u0627\u062A\u060C \u0633\u0647\u0645 \u0628\u0627\u0632\u0627\u0631 \u06CC\u0627 \u0634\u0631\u0627\u06CC\u0637 \u062A\u062C\u0627\u0631\u06CC \u062E\u0635\u0648\u0635\u06CC.",
    "\u0645\u062C\u0648\u0632 \u062D\u0642\u0648\u0642\u06CC \u0646\u06CC\u0633\u062A \u0648 \u0647\u06CC\u0686 \u0686\u06CC\u0632\u06CC \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0646\u0645\u06CC\u200C\u06A9\u0646\u062F."
  ],
  detailsIds: "\u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627\u06CC \u0641\u0646\u06CC",
  openPrint: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E\u06CC",
  backToMatrix: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0645\u0627\u062A\u0631\u06CC\u0633 \u0645\u0642\u0627\u06CC\u0633\u0647",
  printTitle: "\u0686\u0627\u067E \u06CC\u0627 \u0630\u062E\u06CC\u0631\u0647 \u0628\u0647\u200C\u0635\u0648\u0631\u062A PDF",
  runningHead: "Brand OS \xB7 \u0645\u0627\u062A\u0631\u06CC\u0633 \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0631\u0642\u0628\u0627",
  pageMatrix: "\u0645\u0627\u062A\u0631\u06CC\u0633 \u0645\u0642\u0627\u06CC\u0633\u0647",
  pagePrices: "\u0642\u06CC\u0645\u062A\u200C\u0647\u0627\u06CC \u0645\u0646\u062A\u0634\u0631\u0634\u062F\u0647",
  pageSources: "\u0645\u0646\u0627\u0628\u0639",
  bannerTitle: "\u0645\u0627\u062A\u0631\u06CC\u0633 \u0645\u0642\u0627\u06CC\u0633\u0647\u0654 \u0631\u0642\u0628\u0627",
  bannerBody: "\u0628\u0628\u06CC\u0646\u06CC\u062F \u0631\u0642\u0628\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F \u0628\u0627 \u0645\u0639\u06CC\u0627\u0631\u0647\u0627\u06CC \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F \u0686\u06AF\u0648\u0646\u0647 \u06A9\u0646\u0627\u0631 \u0628\u0631\u0646\u062F \u0634\u0645\u0627 \u0642\u0631\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u0646\u062F.",
  bannerLink: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0627\u062A\u0631\u06CC\u0633",
  internalOnly: "\u0641\u0642\u0637 \u0646\u0633\u062E\u0647\u0654 \u062F\u0627\u062E\u0644\u06CC: \u0645\u0642\u0627\u06CC\u0633\u0647\u200C\u0627\u06CC \u06A9\u0647 \u0646\u0627\u0645 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631 \u0631\u0627 \u0645\u06CC\u200C\u0628\u0631\u062F \u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC \u0646\u062F\u0627\u0631\u062F.",
  asOfNone: "\u0647\u0646\u0648\u0632 \u0686\u06CC\u0632\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0646\u0634\u062F\u0647"
};
var tr4 = {
  kicker: "Pazar ve rekabet",
  title: "Rakip kar\u015F\u0131la\u015Ft\u0131rma matrisi",
  lead: "\u0130nceledi\u011Finiz rakiplerin ayn\u0131 standart \xF6l\xE7\xFCtlerde markan\u0131zla kar\u015F\u0131la\u015Ft\u0131rmas\u0131. Yaln\u0131zca payla\u015Ft\u0131\u011F\u0131n\u0131z rekabet g\xF6r\xFCn\xFCm\xFCnden \xE7izilir; s\u0131ralama, puanlama veya kur d\xF6n\xFC\u015F\xFCm\xFC yoktur.",
  navLabel: "Rakip kar\u015F\u0131la\u015Ft\u0131rmas\u0131",
  ownBrand: "Markan\u0131z",
  ownRowNote: "Sizin sat\u0131r\u0131n\u0131z yaln\u0131zca onayl\u0131 bilgileri g\xF6sterir. Taslaklar ve bo\u015Fluklar de\u011Feri de\u011Fil, yaln\u0131zca durumu g\xF6sterir.",
  criteria: {
    offer: "Teklif",
    audience: "Hedef kitle",
    geography: "Hizmet verilen pazarlar",
    public_price: "A\xE7\u0131k fiyatland\u0131rma",
    public_message: "Ana mesaj",
    visual_language: "G\xF6rsel kimlik",
    observable_channels: "Kanallar"
  },
  cellState: {
    present: "G\xF6zlendi",
    unverified: "G\xF6zlendi, kaynak do\u011Frulanmad\u0131",
    historical: "Eski",
    conflicting: "Kaynaklar \xE7eli\u015Fiyor",
    needs_review: "Kaynak g\xF6zden ge\xE7irilmeli",
    absent: "Sunulmuyor (kaynak belirtiyor)",
    unknown: "Bilinmiyor"
  },
  relationship: { direct: "Do\u011Frudan rakip", indirect: "Dolayl\u0131 rakip", substitute: "\u0130kame", aspirational_benchmark: "\xD6rnek al\u0131nan" },
  sourceClass: {
    competitor_own_page: "Rakibin kendi sayfas\u0131",
    platform_documentation: "Platform belgeleri",
    independent_reporting: "Ba\u011F\u0131ms\u0131z haber",
    analyst_inference: "Analist g\xF6r\xFC\u015F\xFC",
    owner_statement: "Sahip beyan\u0131",
    first_party_data: "Birinci taraf verisi",
    unreadable: "Kaynak okunamad\u0131"
  },
  readOn: "{date} tarihinde okundu",
  markets: "Pazarlar",
  verifiedDomain: "Do\u011Frulanm\u0131\u015F alan ad\u0131",
  needsRefresh: "Yenilenmeli",
  competitorCol: "\u0130\u015Fletme",
  matrixCaption: "Sat\u0131rlar i\u015Fletmeler, s\xFCtunlar standart kar\u015F\u0131la\u015Ft\u0131rma \xF6l\xE7\xFCtleridir. Sat\u0131r s\u0131ras\u0131 alfabetiktir, s\u0131ralama de\u011Fildir.",
  sourcesTitle: "Kaynaklar",
  sourcesLead: "Kimin konu\u015Ftu\u011Fu ve kayna\u011F\u0131n ne zaman okundu\u011Fu. Al\u0131nt\u0131lar sahibin \xF6zel ara\u015Ft\u0131rma notlar\u0131nda kal\u0131r.",
  pricesTitle: "Yay\u0131mlanan fiyatlar",
  pricesLead: "Her rakibin yay\u0131mlad\u0131\u011F\u0131 \u015Fekliyle, para birimine g\xF6re gruplanm\u0131\u015F. Asla s\u0131ralanmaz, asla d\xF6n\xFC\u015Ft\xFCr\xFClmez.",
  period: { month: "ayl\u0131k", year: "y\u0131ll\u0131k", one_time: "tek seferlik", unknown: "d\xF6nem bilinmiyor" },
  commitment: { monthly: "ayl\u0131k fatural\u0131", annual: "y\u0131ll\u0131k fatural\u0131", none: "taahh\xFCts\xFCz", unknown: "faturalama bilinmiyor" },
  tax: { included: "vergi dahil", excluded: "vergi hari\xE7", unknown: "vergi bilinmiyor" },
  rateLabel: {
    standard_rate: "Standart fiyat",
    promotional: "Kampanyal\u0131",
    promotion_unknown: "Kampanya durumu bilinmiyor",
    monthly_rate_billed_annually: "Ayl\u0131k fiyat, y\u0131ll\u0131k fatural\u0131",
    terms_unknown: "Ko\u015Fullar bilinmiyor"
  },
  priceState: { observed: "G\xFCncel", unverified: "G\xFCncel, do\u011Frulanmad\u0131", historical: "Eski", conflicting: "Kaynaklar \xE7eli\u015Fiyor" },
  market: "Pazar {market}",
  currencyGroup: "{currency} fiyatlar\u0131",
  noConversion: "Kur d\xF6n\xFC\u015F\xFCm\xFC yap\u0131lmaz. Farkl\u0131 para birimi, pazar veya ko\u015Fullardaki fiyatlar oldu\u011Fu haliyle kar\u015F\u0131la\u015Ft\u0131r\u0131lamaz.",
  unpricedTitle: "A\xE7\u0131k fiyat payla\u015F\u0131lmad\u0131",
  unpricedBody: "Bilinmeyen bilinmeyen olarak kal\u0131r: hi\xE7bir fiyat varsay\u0131lmaz.",
  noPrices: "A\xE7\u0131k fiyat payla\u015F\u0131lmad\u0131.",
  emptyTitle: "Hen\xFCz rekabet g\xF6r\xFCn\xFCm\xFC payla\u015F\u0131lmad\u0131",
  emptyBody: "Bu matris yaln\u0131zca sizin yaz\u0131p commit etti\u011Finiz bir dosyadan \xE7izilir. O zamana kadar rakip ara\u015Ft\u0131rman\u0131z \xF6zel kal\u0131r.",
  emptyStepsTitle: "Payla\u015Fmak i\xE7in",
  emptySteps: [
    "Yerel dizininizdeki rakipleri g\xF6zden ge\xE7irin: npm run brand:competitive -- list",
    "\u0130nceledi\u011Finiz her birini i\u015Faretleyin: npm run brand:competitive -- status --id \u2026 --status owner_reviewed",
    "Payla\u015F\u0131lan dosyay\u0131 yaz\u0131n: npm run brand:competitive -- share",
    "Fark\u0131 inceleyin, sonra commit edip birle\u015Ftirin. Studio matrisi bir sonraki e\u015Fitlemeden sonra g\xF6sterir."
  ],
  sharedEmptyTitle: "Payla\u015F\u0131ld\u0131, ama hen\xFCz incelenmi\u015F rakip yok",
  sharedEmptyBody: "Payla\u015F\u0131lan g\xF6r\xFCn\xFCmde sahibin inceledi\u011Fi rakip yok. Adaylar burada hi\xE7 g\xF6sterilmez.",
  withheldTitle: "Payla\u015F\u0131lan rekabet g\xF6r\xFCn\xFCm\xFC g\xF6sterilmedi",
  withheldBody: "Bu commit\u2019teki payla\u015F\u0131lan rakip dosyas\u0131 Studio denetimlerinden ge\xE7medi: {reason}. Payla\u015Fma komutunu yeniden \xE7al\u0131\u015Ft\u0131r\u0131p sonucu commit edin.",
  withheldReason: {
    symlink: "sembolik ba\u011Flant\u0131",
    unreadable: "okunamad\u0131",
    invalid_record: "i\xE7eri\u011Fi beklenen yap\u0131da de\u011Fil",
    wrong_brand: "ba\u015Fka bir markaya ait",
    unsafe_text: "\xF6zel veri i\xE7eriyor gibi g\xF6r\xFCn\xFCyor"
  },
  notShared: "G\xF6sterilmeyen: {candidates} incelenmemi\u015F aday, {disputed} itirazl\u0131, {archived} ar\u015Fivlenmi\u015F.",
  withheldText: "{count} etiket bir kaynak al\u0131nt\u0131s\u0131yla e\u015Fle\u015Fti\u011Fi veya \xF6zel g\xF6r\xFCnd\xFC\u011F\xFC i\xE7in \xE7\u0131kar\u0131ld\u0131.",
  legendTitle: "Matris nas\u0131l okunur",
  neverTitle: "Bu sayfan\u0131n asla s\xF6ylemedikleri",
  never: [
    "S\u0131ralama, puan veya kazanan yok.",
    "Kur d\xF6n\xFC\u015F\xFCm\xFC veya farkl\u0131 ko\u015Fullardaki fiyatlar\u0131n kar\u015F\u0131la\u015Ft\u0131rmas\u0131 yok.",
    "Reklam performans\u0131, pazar pay\u0131 veya \xF6zel ticari ko\u015Fullar yok.",
    "Hukuki uygunluk onay\u0131 de\u011Fildir ve hi\xE7bir \u015Feyi onaylamaz."
  ],
  detailsIds: "Teknik kimlikler",
  openPrint: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC",
  backToMatrix: "Kar\u015F\u0131la\u015Ft\u0131rma matrisine d\xF6n",
  printTitle: "Yazd\u0131r veya PDF olarak kaydet",
  runningHead: "Brand OS \xB7 Rakip kar\u015F\u0131la\u015Ft\u0131rma matrisi",
  pageMatrix: "Kar\u015F\u0131la\u015Ft\u0131rma matrisi",
  pagePrices: "Yay\u0131mlanan fiyatlar",
  pageSources: "Kaynaklar",
  bannerTitle: "Rakip kar\u015F\u0131la\u015Ft\u0131rma matrisi",
  bannerBody: "\u0130nceledi\u011Finiz rakiplerin standart \xF6l\xE7\xFCtlerde markan\u0131zla nas\u0131l kar\u015F\u0131la\u015Ft\u0131r\u0131ld\u0131\u011F\u0131n\u0131 g\xF6r\xFCn.",
  bannerLink: "Matrisi a\xE7",
  internalOnly: "Yaln\u0131zca i\xE7 s\xFCr\xFCm: ba\u015Fka i\u015Fletmeleri ad\u0131yla anan bir kar\u015F\u0131la\u015Ft\u0131rman\u0131n kamuya a\xE7\u0131k s\xFCr\xFCm\xFC yoktur.",
  asOfNone: "Hen\xFCz payla\u015F\u0131lan bir \u015Fey yok"
};
var COMPETITOR_TEXT = { en: en4, fa: fa4, tr: tr4 };
function competitorText(lang) {
  return COMPETITOR_TEXT[lang];
}

// packages/brand-core/src/visual/fixtures-competitors.ts
var OWN_VALUES = {
  offer: { label: "Offer summary", value: "Guided ten-minute language lessons with a weekly live session", state: "approved" },
  audience: { label: "Primary customer segment", value: "Working adults learning a second language for their job", state: "approved" },
  geography: { label: "Target market", value: "T\xFCrkiye and the Gulf, online", state: "approved" },
  public_price: { label: "Pricing", value: null, state: "assumption" },
  public_message: { label: "Value proposition", value: "Fluency that fits a working day", state: "approved" },
  visual_language: { label: "Color roles", value: "primary #123A73; onPrimary #FFFFFF; surface #F7F5F2; accent #D5FE00", state: "approved" },
  observable_channels: { label: "Marketing channels", value: null, state: "missing" }
};
function own() {
  const out = {};
  for (const criterion of SHARED_CRITERIA) {
    const spec = OWN_VALUES[criterion];
    const approved = spec.state === "approved";
    const id = OWN_BRAND_FACTS[criterion];
    out[criterion] = {
      entry: {
        id,
        label: spec.label,
        state: spec.state,
        value: spec.value,
        sources: [`fixture:${id}`],
        version: approved ? 1 : null,
        approved_at: approved ? "2026-10-02T09:00:00.000Z" : null,
        review_due: null,
        note: null,
        missing_reason: spec.state === "missing" ? "unanswered" : null
      },
      structured: criterion === "visual_language" && spec.value ? parseStructured("color", spec.value) : null
    };
  }
  return out;
}
var OWN_PAGE = (host, day) => ({ source_class: "competitor_own_page", host, observed_on: day });
var PRESS = { source_class: "independent_reporting", host: "trade-weekly.example", observed_on: "2026-10-28" };
function cells(spec) {
  return SHARED_CRITERIA.map((criterion) => ({ criterion, ...spec[criterion] ?? { state: "unknown", labels: [], sources: [] } }));
}
function price(id, offer, amount, currency, market, extra, source2) {
  return {
    competitor_id: id,
    offer_name: offer,
    amount,
    currency,
    market,
    billing_period: "month",
    billing_commitment: "monthly",
    tax_inclusion: "unknown",
    promotion: "none_observed",
    feature_scope: null,
    rate_label: "standard_rate",
    state: "observed",
    source: source2,
    ...extra
  };
}
var A = "cmp_00000000-0000-4000-8000-00000000000a";
var B = "cmp_00000000-0000-4000-8000-00000000000b";
var C = "cmp_00000000-0000-4000-8000-00000000000c";
function illustrativeLandscape() {
  const avenra = OWN_PAGE("avenra.example", "2026-11-14");
  const kestrel = OWN_PAGE("kestrel-learn.example", "2026-11-18");
  return {
    schema: SHARED_LANDSCAPE_SCHEMA,
    schema_version: 1,
    kind: "competitive_shared_landscape",
    brand_slug: ILLUSTRATIVE_BRAND.id,
    as_of: "2026-11-18",
    criteria: [...SHARED_CRITERIA],
    competitors: [
      {
        competitor_id: A,
        display_name: "Avenra (fictional)",
        relationship: ["direct"],
        geographic_relevance: ["international"],
        markets: ["TR", "US"],
        official_domain: "avenra.example",
        assessment: "owner_reviewed",
        cells: cells({
          offer: { state: "observed", labels: ["Self-paced app, three plans"], sources: [avenra] },
          audience: { state: "observed", labels: ["Students and travellers"], sources: [avenra] },
          public_price: { state: "observed", labels: ["Plans listed on own pricing page"], sources: [avenra] },
          public_message: { state: "conflicting", labels: ["Learn anywhere", "Exam-focused"], sources: [avenra, PRESS] },
          visual_language: { state: "observed", labels: ["Orange accent, rounded type"], sources: [avenra] },
          observable_channels: { state: "unverified", labels: ["Short-video ads"], sources: [PRESS] }
        })
      },
      {
        competitor_id: B,
        display_name: "Kestrel Learn (fictional)",
        relationship: ["direct", "substitute"],
        geographic_relevance: ["regional"],
        markets: ["AE", "TR"],
        official_domain: "kestrel-learn.example",
        assessment: "needs_refresh",
        cells: cells({
          offer: { state: "observed", labels: ["Live group classes"], sources: [kestrel] },
          geography: { state: "observed", labels: ["Gulf and T\xFCrkiye"], sources: [kestrel] },
          public_price: { state: "historical", labels: ["Monthly plan, older page"], sources: [OWN_PAGE("kestrel-learn.example", "2026-06-02")] },
          public_message: { state: "observed", labels: ["Speak in 30 days"], sources: [kestrel] },
          observable_channels: { state: "needs_review", labels: [], sources: [] }
        })
      },
      {
        competitor_id: C,
        display_name: "Moraq Studio (fictional)",
        relationship: ["indirect"],
        geographic_relevance: ["local"],
        markets: ["TR"],
        official_domain: null,
        assessment: "owner_reviewed",
        cells: cells({
          offer: { state: "observed", labels: ["One-to-one tutoring"], sources: [PRESS] },
          audience: { state: "observed", labels: ["Corporate teams"], sources: [PRESS] }
        })
      }
    ],
    prices: {
      rows: [
        price(B, "Monthly", 180, "AED", "AE", { billing_commitment: "unknown", promotion: "unknown", rate_label: "promotion_unknown", state: "historical" }, OWN_PAGE("kestrel-learn.example", "2026-06-02")),
        price(A, "Pro", 249, "TRY", "TR", { promotion: "promotional", rate_label: "promotional", feature_scope: "First three months" }, avenra),
        price(A, "Plus", 9.99, "USD", "US", { billing_commitment: "monthly", tax_inclusion: "excluded" }, avenra),
        price(A, "Pro", 7, "USD", "US", { billing_commitment: "annual", rate_label: "monthly_rate_billed_annually" }, avenra)
      ],
      ranked: false,
      currency_conversion: "none"
    },
    not_shared: { candidates: 2, disputed: 0, archived: 1 },
    withheld_text: 1,
    authorizes: []
  };
}
var placed = (state2, bands, sources) => ({ state: state2, bands, sources });
var NONE = { state: "unknown", bands: [], sources: [] };
function illustrativePositioning() {
  const avenra = OWN_PAGE("avenra.example", "2026-11-14");
  const kestrel = OWN_PAGE("kestrel-learn.example", "2026-11-18");
  const owner = { source_class: "owner_statement", host: null, observed_on: "2026-11-10" };
  return {
    axes: {
      x: { label: { en: "Guidance", fa: "\u0645\u06CC\u0632\u0627\u0646 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC", tr: "Rehberlik" }, low: { en: "Self-paced", fa: "\u062E\u0648\u062F\u0622\u0645\u0648\u0632", tr: "Kendi h\u0131z\u0131nda" }, high: { en: "Live teacher", fa: "\u0645\u0639\u0644\u0645 \u0632\u0646\u062F\u0647", tr: "Canl\u0131 \xF6\u011Fretmen" } },
      y: { label: { en: "Price level", fa: "\u0633\u0637\u062D \u0642\u06CC\u0645\u062A", tr: "Fiyat d\xFCzeyi" }, low: { en: "Budget", fa: "\u0627\u0642\u062A\u0635\u0627\u062F\u06CC", tr: "Ekonomik" }, high: { en: "Premium", fa: "\u0645\u0645\u062A\u0627\u0632", tr: "Premium" } }
    },
    bands: ["low", "lower_mid", "mid", "upper_mid", "high"],
    stale_after_days: 90,
    own: { x: placed("evidenced", ["mid"], [owner]), y: placed("evidenced", ["upper_mid"], [owner]) },
    competitors: [
      { competitor_id: A, x: placed("evidenced", ["low"], [avenra]), y: placed("conflicting", ["lower_mid", "mid"], [avenra, PRESS]) },
      { competitor_id: B, x: placed("evidenced", ["high"], [kestrel]), y: placed("stale", ["high"], [OWN_PAGE("kestrel-learn.example", "2026-06-02")]) },
      { competitor_id: C, x: placed("evidenced", ["high"], [PRESS]), y: NONE }
    ]
  };
}
function illustrativeCompetitorComparison(variant = "complete") {
  const landscape = illustrativeLandscape();
  if (variant === "complete") landscape.positioning = illustrativePositioning();
  const read = variant === "empty" ? { state: "not_shared" } : { state: "shared", landscape };
  return comparisonDocument({ brand_id: ILLUSTRATIVE_BRAND.id, brand_name: ILLUSTRATIVE_BRAND.name, illustrative: true, read, own: own() });
}

// packages/brand-core/src/visual/i18n-positioning.ts
var en5 = {
  title: "Positioning map",
  lead: "Where your brand and the competitors you reviewed sit on the two axes you chose. A business is placed only where a dated source supports both positions.",
  page: "Positioning map",
  ownBrand: "Your brand",
  band: { low: "Low", lower_mid: "Lower-mid", mid: "Mid", upper_mid: "Upper-mid", high: "High" },
  state: { evidenced: "Evidenced", stale: "Source older than {days} days", conflicting: "Sources disagree", needs_review: "Source needs review", unknown: "Unknown" },
  axisX: "Horizontal axis",
  axisY: "Vertical axis",
  keyTitle: "Who is where",
  keyName: "Business",
  keyPlace: "Position",
  keyState: "Evidence",
  keySources: "Sources",
  mapAria: "Positioning map: {x} across, {y} up. {count} placed.",
  pointAria: "{name}: {x}, {y}. {state}.",
  rangeNote: "A dashed box is a range: the sources disagree, so both readings are drawn and none is chosen.",
  staleNote: "A dashed ring marks a position whose only sources are older than {days} days. It is still drawn, but it needs a fresh look.",
  unknownTitle: "Not placed",
  unknownBody: "No dated source supports a position on both axes yet. Unknown stays unknown; nothing is estimated.",
  noPointsTitle: "No positions with sources yet",
  noPointsBody: "Your axes are shared, but no business has a dated source for both of them. Record positions from your research notes, then share again.",
  emptyTitle: "No positioning axes shared yet",
  emptyBody: "This map uses only the two axes you choose and positions you back with a source. The tool never suggests an axis or a position.",
  emptyStepsTitle: "To draw it",
  emptySteps: [
    "Choose your two axes and name their ends: npm run brand:competitive -- axes set \u2026",
    "Record each position from a research note: npm run brand:competitive -- position add \u2026",
    "Write the shared file: npm run brand:competitive -- share",
    "Review the diff, then commit and merge it. Studio shows the map after the next sync."
  ],
  withheldTitle: "The shared file was not shown",
  withheldBody: "The map uses the same shared file as the matrix, and that file did not pass its checks.",
  ownerWords: "Axis names are your own words.",
  notAMeasurement: "Positions are qualitative bands read from sources, not measurements or scores."
};
var fa5 = {
  title: "\u0646\u0642\u0634\u0647\u0654 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC",
  lead: "\u0628\u0631\u0646\u062F \u0634\u0645\u0627 \u0648 \u0631\u0642\u0628\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F \u0631\u0648\u06CC \u062F\u0648 \u0645\u062D\u0648\u0631\u06CC \u06A9\u0647 \u062E\u0648\u062F\u062A\u0627\u0646 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F \u06A9\u062C\u0627 \u0642\u0631\u0627\u0631 \u0645\u06CC\u200C\u06AF\u06CC\u0631\u0646\u062F. \u0647\u0631 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u0631\u0648\u06CC \u0646\u0642\u0634\u0647 \u0645\u06CC\u200C\u0622\u06CC\u062F \u06A9\u0647 \u0645\u0646\u0628\u0639\u06CC \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631 \u0647\u0631 \u062F\u0648 \u062C\u0627\u06CC\u06AF\u0627\u0647\u0634 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u062F.",
  page: "\u0646\u0642\u0634\u0647\u0654 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC",
  ownBrand: "\u0628\u0631\u0646\u062F \u0634\u0645\u0627",
  band: { low: "\u06A9\u0645", lower_mid: "\u0645\u062A\u0648\u0633\u0637 \u0631\u0648 \u0628\u0647 \u067E\u0627\u06CC\u06CC\u0646", mid: "\u0645\u062A\u0648\u0633\u0637", upper_mid: "\u0645\u062A\u0648\u0633\u0637 \u0631\u0648 \u0628\u0647 \u0628\u0627\u0644\u0627", high: "\u0632\u06CC\u0627\u062F" },
  state: { evidenced: "\u062F\u0627\u0631\u0627\u06CC \u0645\u0646\u0628\u0639", stale: "\u0645\u0646\u0628\u0639 \u0642\u062F\u06CC\u0645\u06CC\u200C\u062A\u0631 \u0627\u0632 {days} \u0631\u0648\u0632", conflicting: "\u0645\u0646\u0627\u0628\u0639 \u0628\u0627 \u0647\u0645 \u0627\u062E\u062A\u0644\u0627\u0641 \u062F\u0627\u0631\u0646\u062F", needs_review: "\u0645\u0646\u0628\u0639 \u0646\u06CC\u0627\u0632 \u0628\u0647 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u062F\u0627\u0631\u062F", unknown: "\u0646\u0627\u0645\u0639\u0644\u0648\u0645" },
  axisX: "\u0645\u062D\u0648\u0631 \u0627\u0641\u0642\u06CC",
  axisY: "\u0645\u062D\u0648\u0631 \u0639\u0645\u0648\u062F\u06CC",
  keyTitle: "\u0686\u0647 \u06A9\u0633\u06CC \u06A9\u062C\u0627\u0633\u062A",
  keyName: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
  keyPlace: "\u062C\u0627\u06CC\u06AF\u0627\u0647",
  keyState: "\u067E\u0634\u062A\u0648\u0627\u0646\u0647",
  keySources: "\u0645\u0646\u0627\u0628\u0639",
  mapAria: "\u0646\u0642\u0634\u0647\u0654 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC: {x} \u062F\u0631 \u0627\u0641\u0642\u060C {y} \u062F\u0631 \u0639\u0645\u0648\u062F. {count} \u0645\u0648\u0631\u062F \u0631\u0648\u06CC \u0646\u0642\u0634\u0647.",
  pointAria: "{name}: {x}\u060C {y}. {state}.",
  rangeNote: "\u06A9\u0627\u062F\u0631 \u062E\u0637\u200C\u0686\u06CC\u0646 \u06CC\u0639\u0646\u06CC \u0628\u0627\u0632\u0647: \u0645\u0646\u0627\u0628\u0639 \u0628\u0627 \u0647\u0645 \u0627\u062E\u062A\u0644\u0627\u0641 \u062F\u0627\u0631\u0646\u062F\u060C \u067E\u0633 \u0647\u0631 \u062F\u0648 \u062E\u0648\u0627\u0646\u0634 \u06A9\u0634\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  staleNote: "\u062D\u0644\u0642\u0647\u0654 \u062E\u0637\u200C\u0686\u06CC\u0646 \u06CC\u0639\u0646\u06CC \u062A\u0646\u0647\u0627 \u0645\u0646\u0627\u0628\u0639 \u0627\u06CC\u0646 \u062C\u0627\u06CC\u06AF\u0627\u0647 \u0642\u062F\u06CC\u0645\u06CC\u200C\u062A\u0631 \u0627\u0632 {days} \u0631\u0648\u0632 \u0647\u0633\u062A\u0646\u062F. \u0647\u0646\u0648\u0632 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0627\u0645\u0627 \u0628\u0627\u06CC\u062F \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0631\u0631\u0633\u06CC \u0634\u0648\u062F.",
  unknownTitle: "\u0631\u0648\u06CC \u0646\u0642\u0634\u0647 \u0646\u06CC\u0627\u0645\u062F\u0647",
  unknownBody: "\u0647\u0646\u0648\u0632 \u0645\u0646\u0628\u0639 \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631\u06CC \u0628\u0631\u0627\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647 \u0631\u0648\u06CC \u0647\u0631 \u062F\u0648 \u0645\u062D\u0648\u0631 \u0646\u06CC\u0633\u062A. \u0646\u0627\u0645\u0639\u0644\u0648\u0645\u060C \u0646\u0627\u0645\u0639\u0644\u0648\u0645 \u0645\u06CC\u200C\u0645\u0627\u0646\u062F\u061B \u0647\u06CC\u0686 \u062A\u062E\u0645\u06CC\u0646\u06CC \u0632\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  noPointsTitle: "\u0647\u0646\u0648\u0632 \u062C\u0627\u06CC\u06AF\u0627\u0647\u06CC \u0628\u0627 \u0645\u0646\u0628\u0639 \u062B\u0628\u062A \u0646\u0634\u062F\u0647",
  noPointsBody: "\u0645\u062D\u0648\u0631\u0647\u0627\u06CC \u0634\u0645\u0627 \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F\u060C \u0627\u0645\u0627 \u0647\u06CC\u0686 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u06CC \u0628\u0631\u0627\u06CC \u0647\u0631 \u062F\u0648 \u0645\u062D\u0648\u0631 \u0645\u0646\u0628\u0639 \u062A\u0627\u0631\u06CC\u062E\u200C\u062F\u0627\u0631 \u0646\u062F\u0627\u0631\u062F. \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0631\u0627 \u0627\u0632 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A\u200C\u0647\u0627\u06CC \u067E\u0698\u0648\u0647\u0634\u06CC \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F \u0648 \u062F\u0648\u0628\u0627\u0631\u0647 \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F.",
  emptyTitle: "\u0647\u0646\u0648\u0632 \u0645\u062D\u0648\u0631\u06CC \u0628\u0631\u0627\u06CC \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u06CC\u0627\u0628\u06CC \u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0647 \u0646\u0634\u062F\u0647",
  emptyBody: "\u0627\u06CC\u0646 \u0646\u0642\u0634\u0647 \u0641\u0642\u0637 \u0627\u0632 \u062F\u0648 \u0645\u062D\u0648\u0631\u06CC \u06A9\u0647 \u062E\u0648\u062F\u062A\u0627\u0646 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F \u0648 \u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0628\u0627 \u0645\u0646\u0628\u0639 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u06CC\u200C\u06A9\u0646\u06CC\u062F \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u0628\u0632\u0627\u0631 \u0647\u0631\u06AF\u0632 \u0645\u062D\u0648\u0631 \u06CC\u0627 \u062C\u0627\u06CC\u06AF\u0627\u0647\u06CC \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
  emptyStepsTitle: "\u0628\u0631\u0627\u06CC \u0633\u0627\u062E\u062A\u0646 \u0622\u0646",
  emptySteps: [
    "\u062F\u0648 \u0645\u062D\u0648\u0631 \u062E\u0648\u062F \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u0648 \u062F\u0648 \u0633\u0631\u0634\u0627\u0646 \u0631\u0627 \u0646\u0627\u0645\u200C\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646\u06CC\u062F: npm run brand:competitive -- axes set \u2026",
    "\u0647\u0631 \u062C\u0627\u06CC\u06AF\u0627\u0647 \u0631\u0627 \u0627\u0632 \u06CC\u06A9 \u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u067E\u0698\u0648\u0647\u0634\u06CC \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F: npm run brand:competitive -- position add \u2026",
    "\u0641\u0627\u06CC\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F: npm run brand:competitive -- share",
    "diff \u0631\u0627 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0646\u06CC\u062F\u060C \u0633\u067E\u0633 commit \u0648 merge \u06A9\u0646\u06CC\u062F. Studio \u067E\u0633 \u0627\u0632 \u0647\u0645\u06AF\u0627\u0645\u200C\u0633\u0627\u0632\u06CC \u0628\u0639\u062F\u06CC \u0646\u0642\u0634\u0647 \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F."
  ],
  withheldTitle: "\u0641\u0627\u06CC\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0634\u062F",
  withheldBody: "\u0646\u0642\u0634\u0647 \u0627\u0632 \u0647\u0645\u0627\u0646 \u0641\u0627\u06CC\u0644 \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC\u0650 \u0645\u0627\u062A\u0631\u06CC\u0633 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0622\u0646 \u0641\u0627\u06CC\u0644 \u062F\u0631 \u0628\u0631\u0631\u0633\u06CC\u200C\u0647\u0627 \u067E\u0630\u06CC\u0631\u0641\u062A\u0647 \u0646\u0634\u062F.",
  ownerWords: "\u0646\u0627\u0645 \u0645\u062D\u0648\u0631\u0647\u0627 \u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u062E\u0648\u062F \u0634\u0645\u0627\u0633\u062A.",
  notAMeasurement: "\u062C\u0627\u06CC\u06AF\u0627\u0647\u200C\u0647\u0627 \u0628\u0627\u0632\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u06CC\u0641\u06CC\u200C\u0627\u0646\u062F \u06A9\u0647 \u0627\u0632 \u0645\u0646\u0627\u0628\u0639 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F\u060C \u0646\u0647 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u06CC\u0627 \u0627\u0645\u062A\u06CC\u0627\u0632."
};
var tr5 = {
  title: "Konumland\u0131rma haritas\u0131",
  lead: "Markan\u0131z\u0131n ve inceledi\u011Finiz rakiplerin, se\xE7ti\u011Finiz iki eksende nerede durdu\u011Fu. Bir i\u015Fletme yaln\u0131zca tarihli bir kaynak iki konumu da destekledi\u011Finde haritaya yerle\u015Ftirilir.",
  page: "Konumland\u0131rma haritas\u0131",
  ownBrand: "Markan\u0131z",
  band: { low: "D\xFC\u015F\xFCk", lower_mid: "Orta-alt", mid: "Orta", upper_mid: "Orta-\xFCst", high: "Y\xFCksek" },
  state: { evidenced: "Kaynakl\u0131", stale: "Kaynak {days} g\xFCnden eski", conflicting: "Kaynaklar \xE7eli\u015Fiyor", needs_review: "Kaynak g\xF6zden ge\xE7irilmeli", unknown: "Bilinmiyor" },
  axisX: "Yatay eksen",
  axisY: "Dikey eksen",
  keyTitle: "Kim nerede",
  keyName: "\u0130\u015Fletme",
  keyPlace: "Konum",
  keyState: "Dayanak",
  keySources: "Kaynaklar",
  mapAria: "Konumland\u0131rma haritas\u0131: yatayda {x}, dikeyde {y}. {count} yerle\u015Ftirildi.",
  pointAria: "{name}: {x}, {y}. {state}.",
  rangeNote: "Kesikli kutu bir aral\u0131kt\u0131r: kaynaklar \xE7eli\u015Fiyor, bu y\xFCzden iki okuma da \xE7izilir ve hi\xE7biri se\xE7ilmez.",
  staleNote: "Kesikli halka, tek kaynaklar\u0131 {days} g\xFCnden eski olan bir konumu g\xF6sterir. H\xE2l\xE2 \xE7izilir ama yeniden bak\u0131lmal\u0131d\u0131r.",
  unknownTitle: "Yerle\u015Ftirilmedi",
  unknownBody: "Hen\xFCz iki eksende de konumu destekleyen tarihli bir kaynak yok. Bilinmeyen bilinmeyen kal\u0131r; hi\xE7bir \u015Fey tahmin edilmez.",
  noPointsTitle: "Hen\xFCz kaynakl\u0131 konum yok",
  noPointsBody: "Eksenleriniz payla\u015F\u0131ld\u0131, ancak hi\xE7bir i\u015Fletmenin iki eksen i\xE7in de tarihli kayna\u011F\u0131 yok. Konumlar\u0131 ara\u015Ft\u0131rma notlar\u0131n\u0131zdan kaydedin ve yeniden payla\u015F\u0131n.",
  emptyTitle: "Hen\xFCz konumland\u0131rma ekseni payla\u015F\u0131lmad\u0131",
  emptyBody: "Bu harita yaln\u0131zca sizin se\xE7ti\u011Finiz iki ekseni ve bir kaynakla destekledi\u011Finiz konumlar\u0131 kullan\u0131r. Ara\xE7 asla eksen ya da konum \xF6nermez.",
  emptyStepsTitle: "\xC7izmek i\xE7in",
  emptySteps: [
    "\u0130ki ekseninizi se\xE7in ve u\xE7lar\u0131n\u0131 adland\u0131r\u0131n: npm run brand:competitive -- axes set \u2026",
    "Her konumu bir ara\u015Ft\u0131rma notundan kaydedin: npm run brand:competitive -- position add \u2026",
    "Payla\u015F\u0131lan dosyay\u0131 yaz\u0131n: npm run brand:competitive -- share",
    "Fark\u0131 inceleyin, sonra commit edip birle\u015Ftirin. Studio haritay\u0131 bir sonraki e\u015Fitlemeden sonra g\xF6sterir."
  ],
  withheldTitle: "Payla\u015F\u0131lan dosya g\xF6sterilmedi",
  withheldBody: "Harita, matrisle ayn\u0131 payla\u015F\u0131lan dosyay\u0131 kullan\u0131r ve o dosya denetimlerden ge\xE7emedi.",
  ownerWords: "Eksen adlar\u0131 sizin kendi s\xF6zlerinizdir.",
  notAMeasurement: "Konumlar kaynaklardan okunan niteliksel bantlard\u0131r; \xF6l\xE7\xFCm ya da puan de\u011Fildir."
};
var POSITIONING_TEXT = { en: en5, fa: fa5, tr: tr5 };
function positioningText(lang) {
  return POSITIONING_TEXT[lang] ?? en5;
}

// packages/brand-core/src/visual/mascot.ts
var MASCOT_SHEET_STAGES = 6;
var MAX_STATES = 300;
var MAX_STAGES = 12;
var FRONT_ANGLE = "mascot.angle.front";
var USABLE = /* @__PURE__ */ new Set(["approved", "published"]);
var IN_PROGRESS = /* @__PURE__ */ new Set(["created", "reviewed"]);
function text(value2, max) {
  return typeof value2 === "string" && value2.trim() ? value2.trim().slice(0, max) : null;
}
function texts(value2, max, count2) {
  return Array.isArray(value2) ? value2.map((item) => text(item, max)).filter((item) => item !== null).slice(0, count2) : [];
}
function rows(value2) {
  return Array.isArray(value2) ? value2.filter((item) => typeof item === "object" && item !== null && !Array.isArray(item)) : [];
}
function categoryOf(value2) {
  return typeof value2 === "string" && MASCOT_CATEGORIES.includes(value2) ? value2 : "other";
}
var GAP_RANK = { not_previewable: 4, in_review: 3, example_only: 2, not_published: 1, not_drawn: 0 };
function better(a, b) {
  return a === null || GAP_RANK[b] > GAP_RANK[a] ? b : a;
}
function judge(item, rowStatus, assets, audience) {
  const status = typeof item.status === "string" ? item.status : "defined";
  const asset = assets.get(String(item.asset_id));
  if (status === "deprecated") return { view: null, gap: null };
  if (asset?.example) return { view: null, gap: "example_only" };
  if (audience === "public") {
    const published = status === "published" && rowStatus === "published" && asset?.approved && asset.published && !asset.tags.includes("draft");
    if (!published) return { view: null, gap: "not_published" };
  }
  if (!USABLE.has(status) || !USABLE.has(rowStatus)) return { view: null, gap: IN_PROGRESS.has(status) || USABLE.has(status) ? "in_review" : null };
  if (!asset || !asset.approved) return { view: null, gap: "in_review" };
  if (!asset.preview_key || !asset.mime) return { view: null, gap: "not_previewable" };
  const badges2 = [];
  if (audience === "internal" && asset.tags.includes("draft")) badges2.push("draft_tag");
  if (audience === "internal" && !(status === "published" && asset.published)) badges2.push("internal_only");
  return {
    view: {
      artwork_id: String(item.id).slice(0, 200),
      asset_id: asset.asset_id,
      name: asset.name,
      version: text(item.version, 40) ?? asset.version,
      stage: text(item.stage, 200) ?? "any",
      angle: text(item.angle, 200),
      preview_key: asset.preview_key,
      mime: asset.mime,
      badges: badges2
    },
    gap: null
  };
}
function pick(candidates) {
  const sorted = [...candidates].sort((a, b) => Number(b.view.angle === FRONT_ANGLE) - Number(a.view.angle === FRONT_ANGLE) || a.row_index - b.row_index || a.view.artwork_id.localeCompare(b.view.artwork_id));
  return sorted[0] ?? null;
}
function base(input) {
  return {
    block_id: input.block_id,
    framework_id: "MASCOT-MODEL-SHEET",
    data_state: input.total > 0 && input.filled === input.total ? "complete" : input.filled > 0 ? "partial" : "missing",
    sources: input.sources,
    as_of: null,
    computed_from: input.computed_from,
    visibility: input.audience,
    renderer_variant: input.variant,
    layout_constraints: { preserve_topology: false, min_print_pt: 7, print_profile: "book_a4_portrait" }
  };
}
function mascotAtlasDocument(input) {
  const assets = new Map(input.assets.map((asset) => [asset.asset_id, asset]));
  const states = input.enabled ? rows(input.states).slice(0, MAX_STATES) : [];
  const byStage = /* @__PURE__ */ new Map();
  const stageGaps = /* @__PURE__ */ new Map();
  const entries2 = [];
  states.forEach((state2, row_index) => {
    const rowStatus = typeof state2.status === "string" ? state2.status : "defined";
    if (rowStatus === "deprecated") return;
    const drawable2 = [];
    let gap = null;
    for (const item of rows(state2.artwork).slice(0, 50)) {
      const judged = judge(item, rowStatus, assets, input.audience);
      const stage = text(item.stage, 200) ?? "any";
      if (judged.view) {
        drawable2.push({ view: judged.view, row_index });
        if (stage !== "any") byStage.set(stage, [...byStage.get(stage) ?? [], { view: judged.view, row_index }]);
      } else if (judged.gap) {
        gap = better(gap, judged.gap);
        if (stage !== "any") stageGaps.set(stage, better(stageGaps.get(stage) ?? null, judged.gap));
      }
    }
    const chosen = pick(drawable2);
    const name = text(state2.name, 120) ?? text(state2.id, 120) ?? "\u2014";
    const fallbackGap = input.audience === "public" ? "not_published" : "not_drawn";
    entries2.push({
      state_id: String(state2.id ?? "").slice(0, 200),
      category: categoryOf(state2.category),
      name,
      mvp: state2.mvp === true,
      artwork: chosen?.view ?? null,
      variants: Math.max(0, drawable2.length - 1),
      gap: chosen ? null : gap ?? fallbackGap,
      usage: chosen ? text(state2.usage, 400) : null,
      do: chosen ? texts(state2.do, 300, 8) : [],
      dont: chosen ? texts(state2.dont, 300, 8) : []
    });
  });
  const drawn = entries2.filter((entry2) => entry2.artwork).length;
  const inReview = entries2.filter((entry2) => entry2.gap === "in_review").length;
  const atlasSources = [...new Set(entries2.flatMap((entry2) => entry2.artwork ? [`asset:${entry2.artwork.asset_id}`] : []))];
  const atlas = {
    ...base({ block_id: "mascot-atlas", filled: drawn, total: entries2.length, sources: atlasSources, audience: input.audience, variant: "mascot.atlas.v1", computed_from: ["brand/mascot/catalog.yaml", "brand/assets/asset-manifest.yaml"] }),
    type: "mascot_atlas",
    module_enabled: input.enabled,
    entries: entries2,
    counts: { states: entries2.length, drawn, in_review: inReview, awaiting: entries2.length - drawn }
  };
  const recorded = (input.enabled ? rows(input.stages) : []).filter((stage) => text(stage.id, 200) !== null && stage.status !== "deprecated").map((stage, index) => ({ stage, order: typeof stage.order === "number" && Number.isFinite(stage.order) ? stage.order : 1e3 + index })).sort((a, b) => a.order - b.order).slice(0, MAX_STAGES);
  const slots = recorded.map(({ stage }, index) => {
    const id = text(stage.id, 200);
    const definition = stage.configuration === "example" ? "example" : typeof stage.status === "string" && USABLE.has(stage.status) ? "approved" : "draft";
    const chosen = pick(byStage.get(id) ?? []);
    const fallbackGap = input.audience === "public" ? "not_published" : "not_drawn";
    return {
      order: index + 1,
      stage_id: id,
      name: input.audience === "public" && definition !== "approved" ? null : text(stage.name, 120) ?? id,
      definition,
      summary: definition === "approved" ? text(stage.summary, 400) : null,
      artwork: chosen?.view ?? null,
      gap: chosen ? null : stageGaps.get(id) ?? fallbackGap
    };
  });
  for (let order = slots.length + 1; order <= MASCOT_SHEET_STAGES; order += 1) {
    slots.push({ order, stage_id: null, name: null, definition: "not_defined", summary: null, artwork: null, gap: input.audience === "public" ? "not_published" : "not_drawn" });
  }
  const stageDrawn = slots.filter((slot) => slot.artwork).length;
  const evolution = {
    ...base({
      block_id: "mascot-evolution",
      filled: stageDrawn,
      total: slots.length,
      sources: [...new Set(slots.flatMap((slot) => slot.artwork ? [`asset:${slot.artwork.asset_id}`] : []))],
      audience: input.audience,
      variant: "mascot.evolution.v1",
      computed_from: ["brand/mascot/stages.yaml", "brand/mascot/catalog.yaml", "brand/assets/asset-manifest.yaml"]
    }),
    type: "mascot_evolution",
    module_enabled: input.enabled,
    slots,
    recorded: recorded.length,
    example_configuration: recorded.some(({ stage }) => stage.configuration === "example")
  };
  const summary = emptyStatusSummary();
  summary.approved = drawn;
  summary.missing = entries2.length - drawn;
  return {
    schema: VISUAL_SCHEMA,
    schema_version: 1,
    document_kind: "mascot_atlas",
    brand_id: input.brand_id,
    brand_name: input.brand_name,
    audience: input.audience,
    illustrative: input.illustrative,
    origin: input.illustrative ? "illustrative_fixture" : "brand_repository",
    as_of: null,
    classification: input.audience === "public" ? "public" : "internal",
    print_profile: "book_a4_portrait",
    status_summary: summary,
    framework_refs: [frameworkRef("MASCOT-MODEL-SHEET")],
    blocks: [atlas, evolution]
  };
}
function buildMascotAtlas(engine, audience, options = {}) {
  const root = engine.workspaceRoot();
  const config = engine.config();
  const enabled = config.modules.mascot.enabled === true;
  return mascotAtlasDocument({
    brand_id: config.brand.slug,
    brand_name: String(config.brand.name ?? config.brand.slug),
    audience,
    illustrative: false,
    enabled,
    states: enabled ? readMascotStates(root) : [],
    stages: enabled ? readMascotStages(root) : [],
    assets: options.assets ?? []
  });
}

// packages/brand-core/src/visual/i18n-mascot.ts
var en6 = {
  kicker: "Brand Book \xB7 Character",
  title: "Mascot atlas",
  lead: "Every expression and pose of the character, drawn only from approved artwork, with when to use it and when not to. A state without approved artwork stays an empty frame until a file is approved.",
  contents: "Contents",
  atlasTitle: "Mascot atlas",
  atlasLead: "Approved artwork by category: expressions, poses, product states, learning moments, props and campaigns. Each plate carries the recorded usage and the do and don\u2019t notes.",
  evolutionTitle: "Six-stage evolution sheet",
  evolutionLead: "The character\u2019s growth stages side by side, in order. A stage shows artwork only when an approved file is recorded for that stage; every other stage is a clear placeholder.",
  ready: "Approved artwork",
  waiting: "Awaiting approved artwork",
  atlasCount: "{drawn} of {states} states drawn from approved artwork",
  awaitingCount: "{count} waiting for artwork",
  inReviewCount: "{count} in review, not approved",
  category: {
    emotion: "Expressions",
    action: "Poses",
    ui: "Product UI states",
    learning: "Learning moments",
    prop: "Prop interactions",
    seasonal: "Seasonal and campaign",
    other: "Other states"
  },
  useLabel: "Use",
  doLabel: "Do",
  dontLabel: "Don\u2019t use",
  variants: "{count} more approved variants",
  coreSet: "Core set",
  badge: { draft_tag: "File still tagged draft", internal_only: "Internal only, not published" },
  gap: {
    in_review: "Artwork in review, not approved",
    not_previewable: "Approved, but the file cannot be previewed",
    example_only: "Only a template placeholder",
    not_drawn: "No artwork yet",
    not_published: "Not published"
  },
  awaitingTitle: "Not yet drawn",
  awaitingLead: "These states are defined in the catalog but have no approved artwork. They are listed by name only; nothing is drawn in their place.",
  awaitingKicker: "Awaiting approved artwork",
  emptyTitle: "No approved mascot artwork yet",
  emptyBody: "The catalog describes the character\u2019s states, but none has an approved file. The atlas fills in plate by plate as artwork is approved; it never shows generated or placeholder art as the character.",
  emptyStepsTitle: "To fill this page",
  emptySteps: [
    "Register the artwork file in the asset manifest and approve it with a checksum.",
    "Add the artwork to its state in the mascot catalog and move the artwork and the state to approved.",
    "Publish the artwork before it may appear in the public edition."
  ],
  moduleOffTitle: "The mascot module is off",
  moduleOffBody: "This brand has no character. Turn the mascot module on in the brand configuration if one is planned.",
  stageLabel: "Stage {n}",
  definition: { approved: "Approved stage", draft: "Draft stage definition", example: "Example configuration", not_defined: "Not defined" },
  stageNameHidden: "Stage name not published",
  exampleConfigNote: "The stage names come from the template\u2019s example configuration. They are not a rule for this brand until the owner replaces or approves them.",
  stagesRecorded: "{count} stages recorded",
  evolutionEmptyTitle: "No stage has approved artwork yet",
  evolutionEmptyBody: "Each frame waits for an approved file recorded for its stage. Nothing is drawn in between.",
  placeholderArt: "Empty frame: awaiting approved artwork",
  mockArt: "Mock artwork (fictional)",
  artworkFile: "Artwork file",
  neverNote: "Drawn only from approved files in the asset manifest. Nothing on this page is generated, traced or inferred.",
  openPrint: "Print or save as PDF",
  openPrintPublic: "Public edition",
  backToAtlas: "Back to the mascot atlas",
  printTitle: "Mascot atlas, print view",
  runningHead: "Brand Book \xB7 Mascot atlas",
  pageAtlas: "Mascot atlas",
  pageEvolution: "Evolution sheet",
  pageSources: "Sources",
  idsTitle: "Artwork and asset ids",
  idsLead: "The catalog, artwork and asset ids behind each drawn plate.",
  colState: "State",
  colArtwork: "Artwork id",
  colAsset: "Asset id",
  colStage: "Stage",
  noIds: "No artwork is drawn, so there are no ids to list.",
  linkTitle: "Mascot atlas",
  linkBody: "Every expression, pose and growth stage drawn from approved artwork only, as a printable book chapter.",
  linkLabel: "Open the mascot atlas"
};
var fa6 = {
  kicker: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F \xB7 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631",
  title: "\u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  lead: "\u0647\u0645\u0647\u0654 \u062D\u0627\u0644\u062A\u200C\u0647\u0627 \u0648 \u0698\u0633\u062A\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631\u060C \u0641\u0642\u0637 \u0627\u0632 \u0631\u0648\u06CC \u0622\u062B\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0647\u0645\u0631\u0627\u0647 \u0628\u0627 \u0627\u06CC\u0646\u06A9\u0647 \u06A9\u062C\u0627 \u0628\u0647 \u06A9\u0627\u0631 \u0631\u0648\u062F \u0648 \u06A9\u062C\u0627 \u0646\u0647. \u062D\u0627\u0644\u062A\u06CC \u06A9\u0647 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u062F \u062A\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06CC\u06A9 \u0641\u0627\u06CC\u0644\u060C \u0642\u0627\u0628 \u062E\u0627\u0644\u06CC \u0645\u06CC\u200C\u0645\u0627\u0646\u062F.",
  contents: "\u0641\u0647\u0631\u0633\u062A",
  atlasTitle: "\u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  atlasLead: "\u0622\u062B\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0647 \u062A\u0641\u06A9\u06CC\u06A9 \u062F\u0633\u062A\u0647: \u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC \u0686\u0647\u0631\u0647\u060C \u0698\u0633\u062A\u200C\u0647\u0627\u060C \u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u0645\u062D\u0635\u0648\u0644\u060C \u0644\u062D\u0638\u0647\u200C\u0647\u0627\u06CC \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC\u060C \u0627\u0634\u06CC\u0627 \u0648 \u06A9\u0645\u067E\u06CC\u0646\u200C\u0647\u0627. \u0647\u0631 \u0635\u0641\u062D\u0647 \u06A9\u0627\u0631\u0628\u0631\u062F \u062B\u0628\u062A\u200C\u0634\u062F\u0647 \u0648 \u0646\u06A9\u062A\u0647\u200C\u0647\u0627\u06CC \u0628\u0627\u06CC\u062F\u0647\u0627 \u0648 \u0646\u0628\u0627\u06CC\u062F\u0647\u0627 \u0631\u0627 \u062F\u0627\u0631\u062F.",
  evolutionTitle: "\u0628\u0631\u06AF\u0647\u0654 \u062A\u06A9\u0627\u0645\u0644 \u0634\u0634\u200C\u0645\u0631\u062D\u0644\u0647\u200C\u0627\u06CC",
  evolutionLead: "\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0631\u0634\u062F \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u06A9\u0646\u0627\u0631 \u0647\u0645 \u0648 \u0628\u0647 \u062A\u0631\u062A\u06CC\u0628. \u0647\u0631 \u0645\u0631\u062D\u0644\u0647 \u0641\u0642\u0637 \u0648\u0642\u062A\u06CC \u0627\u062B\u0631 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F \u06A9\u0647 \u0641\u0627\u06CC\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0628\u0631\u0627\u06CC \u0647\u0645\u0627\u0646 \u0645\u0631\u062D\u0644\u0647 \u062B\u0628\u062A \u0634\u062F\u0647 \u0628\u0627\u0634\u062F\u061B \u0628\u0642\u06CC\u0647\u0654 \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627 \u062C\u0627\u06CC\u200C\u0646\u06AF\u0647\u062F\u0627\u0631 \u0631\u0648\u0634\u0646\u200C\u0627\u0646\u062F.",
  ready: "\u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  waiting: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  atlasCount: "{drawn} \u0627\u0632 {states} \u062D\u0627\u0644\u062A \u0627\u0632 \u0631\u0648\u06CC \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  awaitingCount: "{count} \u062D\u0627\u0644\u062A \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u062B\u0631",
  inReviewCount: "{count} \u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u060C \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647",
  category: {
    emotion: "\u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC \u0686\u0647\u0631\u0647",
    action: "\u0698\u0633\u062A\u200C\u0647\u0627",
    ui: "\u0648\u0636\u0639\u06CC\u062A\u200C\u0647\u0627\u06CC \u0631\u0627\u0628\u0637 \u0645\u062D\u0635\u0648\u0644",
    learning: "\u0644\u062D\u0638\u0647\u200C\u0647\u0627\u06CC \u06CC\u0627\u062F\u06AF\u06CC\u0631\u06CC",
    prop: "\u062A\u0639\u0627\u0645\u0644 \u0628\u0627 \u0627\u0634\u06CC\u0627",
    seasonal: "\u0641\u0635\u0644\u06CC \u0648 \u06A9\u0645\u067E\u06CC\u0646",
    other: "\u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC \u062F\u06CC\u06AF\u0631"
  },
  useLabel: "\u06A9\u0627\u0631\u0628\u0631\u062F",
  doLabel: "\u0628\u0627\u06CC\u062F\u0647\u0627",
  dontLabel: "\u0646\u0628\u0627\u06CC\u062F\u0647\u0627",
  variants: "{count} \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u062F\u06CC\u06AF\u0631",
  coreSet: "\u0645\u062C\u0645\u0648\u0639\u0647\u0654 \u0627\u0635\u0644\u06CC",
  badge: { draft_tag: "\u0641\u0627\u06CC\u0644 \u0647\u0646\u0648\u0632 \u0628\u0631\u0686\u0633\u0628 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u062F\u0627\u0631\u062F", internal_only: "\u0641\u0642\u0637 \u062F\u0627\u062E\u0644\u06CC\u060C \u0645\u0646\u062A\u0634\u0631\u0646\u0634\u062F\u0647" },
  gap: {
    in_review: "\u0627\u062B\u0631 \u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u060C \u062A\u0623\u06CC\u06CC\u062F\u0646\u0634\u062F\u0647",
    not_previewable: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0627\u0645\u0627 \u067E\u06CC\u0634\u200C\u0646\u0645\u0627\u06CC\u0634 \u0641\u0627\u06CC\u0644 \u0645\u0645\u06A9\u0646 \u0646\u06CC\u0633\u062A",
    example_only: "\u0641\u0642\u0637 \u062C\u0627\u06CC\u200C\u0646\u06AF\u0647\u062F\u0627\u0631 \u0642\u0627\u0644\u0628",
    not_drawn: "\u0647\u0646\u0648\u0632 \u0627\u062B\u0631\u06CC \u0646\u06CC\u0633\u062A",
    not_published: "\u0645\u0646\u062A\u0634\u0631\u0646\u0634\u062F\u0647"
  },
  awaitingTitle: "\u0647\u0646\u0648\u0632 \u062A\u0631\u0633\u06CC\u0645 \u0646\u0634\u062F\u0647",
  awaitingLead: "\u0627\u06CC\u0646 \u062D\u0627\u0644\u062A\u200C\u0647\u0627 \u062F\u0631 \u06A9\u0627\u062A\u0627\u0644\u0648\u06AF \u062A\u0639\u0631\u06CC\u0641 \u0634\u062F\u0647\u200C\u0627\u0646\u062F \u0627\u0645\u0627 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u0646\u062F. \u0641\u0642\u0637 \u0646\u0627\u0645\u0634\u0627\u0646 \u0622\u0645\u062F\u0647 \u0627\u0633\u062A \u0648 \u0686\u06CC\u0632\u06CC \u0628\u0647 \u062C\u0627\u06CC\u0634\u0627\u0646 \u06A9\u0634\u06CC\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  awaitingKicker: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  emptyTitle: "\u0647\u0646\u0648\u0632 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0627\u0632 \u0645\u0627\u0633\u06A9\u0627\u062A \u0646\u06CC\u0633\u062A",
  emptyBody: "\u06A9\u0627\u062A\u0627\u0644\u0648\u06AF \u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0631\u0627 \u062A\u0648\u0635\u06CC\u0641 \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0627\u0645\u0627 \u0647\u06CC\u0686\u200C\u06A9\u062F\u0627\u0645 \u0641\u0627\u06CC\u0644 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u0646\u062F. \u0627\u0637\u0644\u0633 \u0628\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0647\u0631 \u0627\u062B\u0631 \u0635\u0641\u062D\u0647\u200C\u0628\u0647\u200C\u0635\u0641\u062D\u0647 \u067E\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u0647\u0631\u06AF\u0632 \u0627\u062B\u0631 \u0633\u0627\u062E\u062A\u06AF\u06CC \u06CC\u0627 \u062C\u0627\u06CC\u200C\u0646\u06AF\u0647\u062F\u0627\u0631 \u0631\u0627 \u0628\u0647 \u062C\u0627\u06CC \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0646\u0634\u0627\u0646 \u0646\u0645\u06CC\u200C\u062F\u0647\u062F.",
  emptyStepsTitle: "\u0628\u0631\u0627\u06CC \u067E\u0631 \u0634\u062F\u0646 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647",
  emptySteps: [
    "\u0641\u0627\u06CC\u0644 \u0627\u062B\u0631 \u0631\u0627 \u062F\u0631 \u0641\u0647\u0631\u0633\u062A \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627 \u062B\u0628\u062A \u0648 \u0628\u0627 \u0686\u06A9\u200C\u0633\u0627\u0645 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F.",
    "\u0627\u062B\u0631 \u0631\u0627 \u0628\u0647 \u062D\u0627\u0644\u062A\u0634 \u062F\u0631 \u06A9\u0627\u062A\u0627\u0644\u0648\u06AF \u0645\u0627\u0633\u06A9\u0627\u062A \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u0648 \u0627\u062B\u0631 \u0648 \u062D\u0627\u0644\u062A \u0631\u0627 \u0628\u0647 \xAB\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\xBB \u0628\u0628\u0631\u06CC\u062F.",
    "\u067E\u06CC\u0634 \u0627\u0632 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0631 \u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC\u060C \u0627\u062B\u0631 \u0631\u0627 \u0645\u0646\u062A\u0634\u0631 \u06A9\u0646\u06CC\u062F."
  ],
  moduleOffTitle: "\u0645\u0627\u0698\u0648\u0644 \u0645\u0627\u0633\u06A9\u0627\u062A \u062E\u0627\u0645\u0648\u0634 \u0627\u0633\u062A",
  moduleOffBody: "\u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0646\u062F\u0627\u0631\u062F. \u0627\u06AF\u0631 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631\u06CC \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 \u0627\u0633\u062A\u060C \u0645\u0627\u0698\u0648\u0644 \u0645\u0627\u0633\u06A9\u0627\u062A \u0631\u0627 \u062F\u0631 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0628\u0631\u0646\u062F \u0631\u0648\u0634\u0646 \u06A9\u0646\u06CC\u062F.",
  stageLabel: "\u0645\u0631\u062D\u0644\u0647\u0654 {n}",
  definition: { approved: "\u0645\u0631\u062D\u0644\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", draft: "\u062A\u0639\u0631\u06CC\u0641 \u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u0645\u0631\u062D\u0644\u0647", example: "\u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0645\u0648\u0646\u0647", not_defined: "\u062A\u0639\u0631\u06CC\u0641\u200C\u0646\u0634\u062F\u0647" },
  stageNameHidden: "\u0646\u0627\u0645 \u0645\u0631\u062D\u0644\u0647 \u0645\u0646\u062A\u0634\u0631 \u0646\u0634\u062F\u0647",
  exampleConfigNote: "\u0646\u0627\u0645 \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627 \u0627\u0632 \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0645\u0648\u0646\u0647\u0654 \u0642\u0627\u0644\u0628 \u0622\u0645\u062F\u0647 \u0627\u0633\u062A. \u062A\u0627 \u0645\u0627\u0644\u06A9 \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646 \u06CC\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0646\u06A9\u0646\u062F\u060C \u0642\u0627\u0639\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0646\u06CC\u0633\u062A\u0646\u062F.",
  stagesRecorded: "{count} \u0645\u0631\u062D\u0644\u0647 \u062B\u0628\u062A \u0634\u062F\u0647",
  evolutionEmptyTitle: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0645\u0631\u062D\u0644\u0647\u200C\u0627\u06CC \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0646\u062F\u0627\u0631\u062F",
  evolutionEmptyBody: "\u0647\u0631 \u0642\u0627\u0628 \u0645\u0646\u062A\u0638\u0631 \u0641\u0627\u06CC\u0644\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0627\u0633\u062A \u06A9\u0647 \u0628\u0631\u0627\u06CC \u0647\u0645\u0627\u0646 \u0645\u0631\u062D\u0644\u0647 \u062B\u0628\u062A \u0634\u062F\u0647 \u0628\u0627\u0634\u062F. \u0686\u06CC\u0632\u06CC \u0645\u06CC\u0627\u0646 \u0622\u0646\u200C\u0647\u0627 \u06A9\u0634\u06CC\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  placeholderArt: "\u0642\u0627\u0628 \u062E\u0627\u0644\u06CC: \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u062B\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  mockArt: "\u0627\u062B\u0631 \u0646\u0645\u0648\u0646\u0647 (\u0633\u0627\u062E\u062A\u06AF\u06CC)",
  artworkFile: "\u0641\u0627\u06CC\u0644 \u0627\u062B\u0631",
  neverNote: "\u0641\u0642\u0637 \u0627\u0632 \u0641\u0627\u06CC\u0644\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0641\u0647\u0631\u0633\u062A \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u062F\u0631 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u062A\u0648\u0644\u06CC\u062F\u060C \u0631\u062F\u06AF\u06CC\u0631\u06CC \u06CC\u0627 \u062D\u062F\u0633 \u0632\u062F\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
  openPrint: "\u0686\u0627\u067E \u06CC\u0627 \u0630\u062E\u06CC\u0631\u0647 \u0628\u0647 PDF",
  openPrintPublic: "\u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC",
  backToAtlas: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  printTitle: "\u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A\u060C \u0646\u0645\u0627\u06CC \u0686\u0627\u067E\u06CC",
  runningHead: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F \xB7 \u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  pageAtlas: "\u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  pageEvolution: "\u0628\u0631\u06AF\u0647\u0654 \u062A\u06A9\u0627\u0645\u0644",
  pageSources: "\u0645\u0646\u0627\u0628\u0639",
  idsTitle: "\u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627\u06CC \u0627\u062B\u0631 \u0648 \u062F\u0627\u0631\u0627\u06CC\u06CC",
  idsLead: "\u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627\u06CC \u06A9\u0627\u062A\u0627\u0644\u0648\u06AF\u060C \u0627\u062B\u0631 \u0648 \u062F\u0627\u0631\u0627\u06CC\u06CC \u067E\u0634\u062A \u0647\u0631 \u0635\u0641\u062D\u0647\u0654 \u062A\u0631\u0633\u06CC\u0645\u200C\u0634\u062F\u0647.",
  colState: "\u062D\u0627\u0644\u062A",
  colArtwork: "\u0634\u0646\u0627\u0633\u0647\u0654 \u0627\u062B\u0631",
  colAsset: "\u0634\u0646\u0627\u0633\u0647\u0654 \u062F\u0627\u0631\u0627\u06CC\u06CC",
  colStage: "\u0645\u0631\u062D\u0644\u0647",
  noIds: "\u0627\u062B\u0631\u06CC \u062A\u0631\u0633\u06CC\u0645 \u0646\u0634\u062F\u0647\u060C \u067E\u0633 \u0634\u0646\u0627\u0633\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0641\u0647\u0631\u0633\u062A \u0646\u06CC\u0633\u062A.",
  linkTitle: "\u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A",
  linkBody: "\u0647\u0645\u0647\u0654 \u062D\u0627\u0644\u062A\u200C\u0647\u0627\u060C \u0698\u0633\u062A\u200C\u0647\u0627 \u0648 \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0631\u0634\u062F\u060C \u0641\u0642\u0637 \u0627\u0632 \u0631\u0648\u06CC \u0622\u062B\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0628\u0647 \u0634\u06A9\u0644 \u0641\u0635\u0644\u06CC \u0642\u0627\u0628\u0644 \u0686\u0627\u067E \u0627\u0632 \u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F.",
  linkLabel: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A"
};
var tr6 = {
  kicker: "Marka Kitab\u0131 \xB7 Karakter",
  title: "Maskot atlas\u0131",
  lead: "Karakterin t\xFCm ifadeleri ve pozlar\u0131, yaln\u0131zca onayl\u0131 \xE7izimlerden; ne zaman kullan\u0131laca\u011F\u0131 ve ne zaman kullan\u0131lmayaca\u011F\u0131yla. Onayl\u0131 \xE7izimi olmayan bir durum, bir dosya onaylanana kadar bo\u015F \xE7er\xE7eve olarak kal\u0131r.",
  contents: "\u0130\xE7indekiler",
  atlasTitle: "Maskot atlas\u0131",
  atlasLead: "Kategoriye g\xF6re onayl\u0131 \xE7izimler: ifadeler, pozlar, \xFCr\xFCn durumlar\u0131, \xF6\u011Frenme anlar\u0131, nesneler ve kampanyalar. Her levha kay\u0131tl\u0131 kullan\u0131m\u0131 ve yap\u0131lacaklar ile yap\u0131lmayacaklar notlar\u0131n\u0131 ta\u015F\u0131r.",
  evolutionTitle: "Alt\u0131 a\u015Famal\u0131 geli\u015Fim sayfas\u0131",
  evolutionLead: "Karakterin geli\u015Fim a\u015Famalar\u0131 yan yana ve s\u0131rayla. Bir a\u015Fama yaln\u0131zca o a\u015Fama i\xE7in kay\u0131tl\u0131 onayl\u0131 bir dosya varsa \xE7izim g\xF6sterir; di\u011Fer her a\u015Fama a\xE7\u0131k bir yer tutucudur.",
  ready: "Onayl\u0131 \xE7izim",
  waiting: "Onayl\u0131 \xE7izim bekleniyor",
  atlasCount: "{states} durumdan {drawn} tanesi onayl\u0131 \xE7izimden",
  awaitingCount: "{count} durum \xE7izim bekliyor",
  inReviewCount: "{count} incelemede, onaylanmad\u0131",
  category: {
    emotion: "\u0130fadeler",
    action: "Pozlar",
    ui: "\xDCr\xFCn aray\xFCz\xFC durumlar\u0131",
    learning: "\xD6\u011Frenme anlar\u0131",
    prop: "Nesne etkile\u015Fimleri",
    seasonal: "Sezonluk ve kampanya",
    other: "Di\u011Fer durumlar"
  },
  useLabel: "Kullan\u0131m",
  doLabel: "Yap\u0131n",
  dontLabel: "Kullanmay\u0131n",
  variants: "{count} onayl\u0131 varyant daha",
  coreSet: "Temel set",
  badge: { draft_tag: "Dosya h\xE2l\xE2 taslak etiketli", internal_only: "Yaln\u0131zca i\xE7 kullan\u0131m, yay\u0131mlanmad\u0131" },
  gap: {
    in_review: "\xC7izim incelemede, onaylanmad\u0131",
    not_previewable: "Onayl\u0131, ancak dosya \xF6nizlenemiyor",
    example_only: "Yaln\u0131zca \u015Fablon yer tutucusu",
    not_drawn: "Hen\xFCz \xE7izim yok",
    not_published: "Yay\u0131mlanmad\u0131"
  },
  awaitingTitle: "Hen\xFCz \xE7izilmedi",
  awaitingLead: "Bu durumlar katalogda tan\u0131ml\u0131 ama onayl\u0131 \xE7izimleri yok. Yaln\u0131zca adlar\u0131yla listelenir; yerlerine hi\xE7bir \u015Fey \xE7izilmez.",
  awaitingKicker: "Onayl\u0131 \xE7izim bekleniyor",
  emptyTitle: "Hen\xFCz onayl\u0131 maskot \xE7izimi yok",
  emptyBody: "Katalog karakterin durumlar\u0131n\u0131 tan\u0131ml\u0131yor, ancak hi\xE7birinin onayl\u0131 dosyas\u0131 yok. Atlas, \xE7izimler onayland\u0131k\xE7a levha levha dolar; \xFCretilmi\u015F ya da yer tutucu bir g\xF6rseli asla karakter olarak g\xF6stermez.",
  emptyStepsTitle: "Bu sayfay\u0131 doldurmak i\xE7in",
  emptySteps: [
    "\xC7izim dosyas\u0131n\u0131 varl\u0131k manifestosuna kaydedin ve sa\u011Flama toplam\u0131yla onaylay\u0131n.",
    "\xC7izimi maskot katalo\u011Fundaki durumuna ekleyin; \xE7izimi ve durumu onayl\u0131 yap\u0131n.",
    "Genel s\xFCr\xFCmde g\xF6r\xFCnmeden \xF6nce \xE7izimi yay\u0131mlay\u0131n."
  ],
  moduleOffTitle: "Maskot mod\xFCl\xFC kapal\u0131",
  moduleOffBody: "Bu markan\u0131n bir karakteri yok. Planlan\u0131yorsa marka yap\u0131land\u0131rmas\u0131nda maskot mod\xFCl\xFCn\xFC a\xE7\u0131n.",
  stageLabel: "{n}. a\u015Fama",
  definition: { approved: "Onayl\u0131 a\u015Fama", draft: "Taslak a\u015Fama tan\u0131m\u0131", example: "\xD6rnek yap\u0131land\u0131rma", not_defined: "Tan\u0131mlanmad\u0131" },
  stageNameHidden: "A\u015Fama ad\u0131 yay\u0131mlanmad\u0131",
  exampleConfigNote: "A\u015Fama adlar\u0131 \u015Fablonun \xF6rnek yap\u0131land\u0131rmas\u0131ndan gelir. Sahip bunlar\u0131 de\u011Fi\u015Ftirene ya da onaylayana kadar bu marka i\xE7in bir kural de\u011Fildir.",
  stagesRecorded: "{count} a\u015Fama kay\u0131tl\u0131",
  evolutionEmptyTitle: "Hen\xFCz hi\xE7bir a\u015Faman\u0131n onayl\u0131 \xE7izimi yok",
  evolutionEmptyBody: "Her \xE7er\xE7eve, kendi a\u015Famas\u0131 i\xE7in kay\u0131tl\u0131 onayl\u0131 bir dosya bekler. Aralar\u0131na hi\xE7bir \u015Fey \xE7izilmez.",
  placeholderArt: "Bo\u015F \xE7er\xE7eve: onayl\u0131 \xE7izim bekleniyor",
  mockArt: "\xD6rnek \xE7izim (kurgusal)",
  artworkFile: "\xC7izim dosyas\u0131",
  neverNote: "Yaln\u0131zca varl\u0131k manifestosundaki onayl\u0131 dosyalardan \xE7izilir. Bu sayfadaki hi\xE7bir \u015Fey \xFCretilmemi\u015F, kopyalanmam\u0131\u015F ya da tahmin edilmemi\u015Ftir.",
  openPrint: "Yazd\u0131r veya PDF olarak kaydet",
  openPrintPublic: "Genel s\xFCr\xFCm",
  backToAtlas: "Maskot atlas\u0131na d\xF6n",
  printTitle: "Maskot atlas\u0131, bask\u0131 g\xF6r\xFCn\xFCm\xFC",
  runningHead: "Marka Kitab\u0131 \xB7 Maskot atlas\u0131",
  pageAtlas: "Maskot atlas\u0131",
  pageEvolution: "Geli\u015Fim sayfas\u0131",
  pageSources: "Kaynaklar",
  idsTitle: "\xC7izim ve varl\u0131k kimlikleri",
  idsLead: "\xC7izilen her levhan\u0131n arkas\u0131ndaki katalog, \xE7izim ve varl\u0131k kimlikleri.",
  colState: "Durum",
  colArtwork: "\xC7izim kimli\u011Fi",
  colAsset: "Varl\u0131k kimli\u011Fi",
  colStage: "A\u015Fama",
  noIds: "\xC7izim g\xF6sterilmiyor, bu y\xFCzden listelenecek kimlik yok.",
  linkTitle: "Maskot atlas\u0131",
  linkBody: "T\xFCm ifadeler, pozlar ve geli\u015Fim a\u015Famalar\u0131 yaln\u0131zca onayl\u0131 \xE7izimlerden, yazd\u0131r\u0131labilir bir kitap b\xF6l\xFCm\xFC olarak.",
  linkLabel: "Maskot atlas\u0131n\u0131 a\xE7"
};
var MASCOT_TEXT = { en: en6, fa: fa6, tr: tr6 };
function mascotText(lang) {
  return MASCOT_TEXT[lang] ?? en6;
}

// packages/brand-core/src/visual/fixtures-mascot.ts
function mockAsset(id, extra = {}) {
  return {
    asset_id: `fixture.mascot.${id}`,
    name: `MOCK ${id} (fictional)`,
    version: "1.0.0",
    approved: true,
    published: true,
    tags: ["mascot"],
    example: false,
    preview_key: `fixture-mascot-${id}`,
    mime: "image/svg+xml",
    width: 400,
    height: 400,
    ...extra
  };
}
var NOTES = {
  do: ["Use beside a real success the user can see.", "Keep at least the smallest listed surface size."],
  dont: ["Do not use for a payment or an error.", "Do not crop the silhouette."]
};
function state(id, category, name, status, artwork, mvp = true) {
  return { id: `mascot.${category}.${id}`, category, name, status, mvp, usage: `MOCK usage line for ${name}.`, ...NOTES, artwork };
}
function art(id, stage, status, angle = "mascot.angle.front") {
  return { id: `art.${id}`, stage, asset_id: `fixture.mascot.${id}`, status, version: "1.0.0", angle };
}
var STAGES = ["Seed", "Sprout", "Explorer", "Guide", "Mentor", "Keeper"].map((name, index) => ({ id: `fixture.stage.${index + 1}`, order: index + 1, name: `MOCK ${name}`, configuration: "brand", status: index < 4 ? "approved" : "draft", summary: `MOCK summary of the ${name.toLowerCase()} stage.` }));
function illustrativeMascotAtlas(audience = "internal", variant = "partial") {
  const empty = variant === "empty";
  const states = [
    state("joyful", "emotion", "Joyful", empty ? "defined" : "published", empty ? [] : [art("joyful", "fixture.stage.1", "published"), art("joyful-side", "fixture.stage.2", "published", "mascot.angle.left-profile")]),
    state("curious", "emotion", "Curious", empty ? "defined" : "approved", empty ? [] : [art("curious", "fixture.stage.2", "approved")]),
    state("worried", "emotion", "Worried", empty ? "defined" : "reviewed", empty ? [] : [art("worried", "any", "reviewed")]),
    state("sad", "emotion", "Sad", "defined", []),
    state("waving", "action", "Waving", empty ? "defined" : "published", empty ? [] : [art("waving", "fixture.stage.3", "published")]),
    state("thinking", "action", "Thinking", "defined", [], false),
    state("loading", "ui", "Loading", "defined", []),
    state("launch", "seasonal", "Launch", "defined", [], false)
  ];
  const assets = [mockAsset("joyful"), mockAsset("joyful-side"), mockAsset("curious", { tags: ["mascot", "draft"], published: false }), mockAsset("worried", { approved: false, published: false, preview_key: null, mime: null }), mockAsset("waving")];
  return mascotAtlasDocument({
    brand_id: ILLUSTRATIVE_BRAND.id,
    brand_name: ILLUSTRATIVE_BRAND.name,
    audience,
    illustrative: true,
    enabled: true,
    states,
    stages: STAGES,
    assets: empty ? [] : assets
  });
}

// packages/brand-core/src/visual/publishing.ts
var EXPORT_PROFILES = ["public", "investor", "internal"];
var APPROVED_ONLY = ["approved", "stale"];
var EXPORT_PROFILE_SPECS = {
  public: { id: "public", edition: "public", shows: APPROVED_ONLY, finance_values: false, draft_marks: false, private_sources: false },
  investor: { id: "investor", edition: "internal", shows: APPROVED_ONLY, finance_values: false, draft_marks: false, private_sources: false },
  internal: { id: "internal", edition: "internal", shows: DATA_STATES, finance_values: true, draft_marks: true, private_sources: true }
};
var PUBLISHING_DOCUMENT_TYPES = ["brand_book", "visual_identity", "business_model_canvas", "mascot_atlas", "competitor_comparison", "business_plan", "marketing_plan"];
var PERSONAL_PUBLISHING_TYPES = [
  "personal_brand_book",
  "professional_bio",
  "linkedin_pack",
  "website_pack",
  "media_kit",
  "speaker_kit",
  "content_strategy",
  "portfolio_pack",
  "services_pack",
  "evidence_register"
];
var PERSONAL_PUBLISHING_KIND = {
  personal_brand_book: "personal-brand-book",
  professional_bio: "professional-bio",
  linkedin_pack: "linkedin-pack",
  website_pack: "website-pack",
  media_kit: "media-kit",
  speaker_kit: "speaker-kit",
  content_strategy: "content-strategy",
  portfolio_pack: "portfolio-pack",
  services_pack: "services-pack",
  evidence_register: "evidence-register"
};
var PROFILE_DOCUMENTS = {
  public: ["brand_book", "visual_identity", "business_model_canvas", "mascot_atlas", "personal_brand_book", "professional_bio", "linkedin_pack", "website_pack", "media_kit", "speaker_kit", "portfolio_pack", "services_pack"],
  investor: ["brand_book", "visual_identity", "business_model_canvas", "mascot_atlas", "business_plan", "marketing_plan"],
  internal: [...PUBLISHING_DOCUMENT_TYPES, ...PERSONAL_PUBLISHING_TYPES]
};
function profilePermits(profile, type) {
  return PROFILE_DOCUMENTS[profile].includes(type);
}
function questionClassifier(engine) {
  const byId = new Map(
    engine.questions().map((question) => [
      question.id,
      { sensitivity: question.sensitivity, finance: question.id.startsWith("business.finance.") || /(^|[.-])finance($|[.-])/.test(question.module) || question.approval_grant === "financial" }
    ])
  );
  return (id) => byId.get(id);
}
var PRIVATE_SOURCE = /(^|[/\\])\.private([/\\]|$)/;
var REDACTION_NOTE = {
  restricted: "Restricted. Never shown in any export.",
  finance: "Finance figure. Withheld outside the internal profile.",
  private_source: "Cites an owner-only source. Withheld outside the internal profile.",
  not_approved: "Not approved. Withheld outside the internal profile.",
  unknown_question: "Not in the question bank. Withheld outside the internal profile."
};
function redactionReason(entry2, spec, classify) {
  const known = classify(entry2.id);
  if (known?.sensitivity === "restricted") return "restricted";
  if (spec.id === "internal") return null;
  if (!known) return "unknown_question";
  if (known.finance && !spec.finance_values) return "finance";
  if (!spec.private_sources && entry2.sources.some((source2) => PRIVATE_SOURCE.test(source2))) return "private_source";
  if (!spec.shows.includes(entry2.state)) return "not_approved";
  return null;
}
function isEntry(value2) {
  if (!value2 || typeof value2 !== "object") return false;
  const record = value2;
  return typeof record.id === "string" && typeof record.state === "string" && "value" in record && Array.isArray(record.sources) && "missing_reason" in record;
}
var EMPTY_STATES = /* @__PURE__ */ new Set(["missing", "withheld", "not_applicable"]);
function redactEntry(entry2, spec, classify, tally) {
  const sources = spec.private_sources ? entry2.sources : entry2.sources.filter((source2) => !PRIVATE_SOURCE.test(source2));
  const reason = redactionReason(entry2, spec, classify);
  if (!reason) return { ...entry2, sources };
  if (EMPTY_STATES.has(entry2.state) && entry2.value === null) return { ...entry2, sources };
  tally.redacted += 1;
  tally.moves.push([entry2.state, "withheld"]);
  return { ...entry2, state: "withheld", value: null, sources, approved_at: null, review_due: null, version: null, note: REDACTION_NOTE[reason], missing_reason: null };
}
function walk(value2, spec, classify, tally) {
  if (Array.isArray(value2)) return value2.map((item) => walk(item, spec, classify, tally));
  if (!value2 || typeof value2 !== "object") return value2;
  if (isEntry(value2)) return redactEntry(value2, spec, classify, tally);
  const out = {};
  for (const [key, child] of Object.entries(value2)) out[key] = walk(child, spec, classify, tally);
  return out;
}
function clearDerived(block, spec) {
  if (block.type === "color_palette" && block.source.value === null) {
    block.colors = [];
    block.combinations = [];
    block.grid = null;
  }
  if (block.type === "typography_specimen" && block.source.value === null) block.roles = [];
  if (block.type === "logo_construction") {
    if (block.source.value === null) block.spec = null;
    if (!spec.draft_marks && block.master) {
      if (block.master.badges.includes("draft_tag") && block.master.badges.includes("internal_only")) {
        block.master = null;
        block.master_state = "missing";
      } else block.master = { ...block.master, badges: [] };
    }
    if (!spec.draft_marks) {
      const keep = (variant) => !variant || variant.badges.includes("draft_tag") && variant.badges.includes("internal_only") ? null : { ...variant, badges: [] };
      if (block.system !== void 0) {
        const system = block.master && block.system ? { on_light: keep(block.system.on_light), on_dark: keep(block.system.on_dark), icon: keep(block.system.icon) } : null;
        block.system = system && (system.on_light || system.on_dark || system.icon) ? system : null;
      }
      if (block.candidates !== void 0) block.candidates = [];
    }
  }
  if (block.type === "mascot_atlas" && !spec.draft_marks) redactAtlas(block);
  if (block.type === "mascot_evolution" && !spec.draft_marks) redactEvolution(block);
}
function redactAtlas(block) {
  block.entries = block.entries.map((entry2) => {
    if (entry2.gap === "in_review") return { ...entry2, gap: "not_published" };
    if (!entry2.artwork) return entry2;
    if (entry2.artwork.badges.includes("draft_tag")) return { ...entry2, artwork: null, variants: 0, gap: "not_published", usage: null, do: [], dont: [] };
    return { ...entry2, artwork: { ...entry2.artwork, badges: [] } };
  });
  const drawn = block.entries.filter((entry2) => entry2.artwork).length;
  block.counts = { states: block.entries.length, drawn, in_review: 0, awaiting: block.entries.length - drawn };
}
function redactEvolution(block) {
  block.slots = block.slots.map((slot) => {
    const base3 = slot.definition === "approved" ? slot : { ...slot, name: null, summary: null };
    if (base3.gap === "in_review") return { ...base3, gap: "not_published" };
    if (!base3.artwork) return base3;
    if (base3.artwork.badges.includes("draft_tag")) return { ...base3, artwork: null, gap: "not_published" };
    return { ...base3, artwork: { ...base3.artwork, badges: [] } };
  });
}
var VISUAL_TYPE = {
  business_model_canvas: "business_model_canvas",
  visual_identity: "visual_identity",
  competitor_comparison: "competitor_comparison",
  mascot_atlas: "mascot_atlas",
  // Visual V3.3: the journey map and SOSTAC overview are views of the marketing plan, the OKR tree of the business plan.
  customer_journey: "marketing_plan",
  sostac_overview: "marketing_plan",
  okr_tree: "business_plan"
};
function redactVisualDocument(doc, profile, classify) {
  const spec = EXPORT_PROFILE_SPECS[profile];
  const type = VISUAL_TYPE[doc.document_kind];
  if (!type || !profilePermits(profile, type)) return null;
  if (spec.edition === "public" && doc.audience !== "public") return null;
  const tally = { redacted: 0, moves: [] };
  const blocks2 = walk(doc.blocks, spec, classify, tally).map((block) => {
    const copy = { ...block };
    clearDerived(copy, spec);
    return copy;
  });
  const status_summary = { ...doc.status_summary };
  for (const [from, to] of tally.moves) {
    if (status_summary[from] > 0) status_summary[from] -= 1;
    status_summary[to] += 1;
  }
  const document = { ...doc, framework_refs: doc.framework_refs.map((ref) => ({ ...ref })), blocks: blocks2, status_summary };
  return { profile, document, redacted: tally.redacted };
}
var DOCUMENT_TYPE = {
  "brand-book": "brand_book",
  "business-plan": "business_plan",
  "marketing-plan": "marketing_plan",
  ...Object.fromEntries(Object.entries(PERSONAL_PUBLISHING_KIND).map(([type, kind]) => [kind, type]))
};
function redactDocumentModel(model, profile, classify) {
  const spec = EXPORT_PROFILE_SPECS[profile];
  const type = DOCUMENT_TYPE[model.kind];
  if (!type || !profilePermits(profile, type)) return null;
  if (spec.edition === "public" && model.audience !== "public") return null;
  let redacted = 0;
  const sections = model.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const sources = spec.private_sources ? [...item.source_ids] : item.source_ids.filter((source2) => !PRIVATE_SOURCE.test(source2));
      const state2 = item.withheld ? "withheld" : item.tag === "approved" ? "approved" : item.tag === "missing" ? "missing" : item.tag;
      const reason = redactionReason({ id: item.id, state: state2, value: item.value === null ? null : String(item.value), sources: item.source_ids }, spec, classify);
      const hasValue2 = item.value !== null || item.structured !== null;
      if (!reason || !hasValue2) return { ...item, source_ids: sources };
      redacted += 1;
      return { ...item, value: null, structured: null, source_ids: sources, version: null, withheld: true, tag: item.tag === "approved" ? item.tag : "missing", note: REDACTION_NOTE[reason] };
    })
  }));
  const cleaned = redacted > 0 ? sections.map(({ drafts: _drafts, ...section }) => section) : sections;
  return { profile, document: { ...model, sections: cleaned }, redacted };
}
function redactBook(book, profile, classify) {
  const spec = EXPORT_PROFILE_SPECS[profile];
  if (!profilePermits(profile, book.book_kind === "brand_book" ? "brand_book" : "business_plan")) return null;
  if (spec.edition === "public" && book.audience !== "public") return null;
  const tally = { redacted: 0, moves: [] };
  const entries2 = (list) => list.map((entry2) => {
    const out = redactEntry(entry2, spec, classify, tally);
    return book.audience === "public" && out.state === "withheld" ? { ...out, state: "missing", note: null, missing_reason: "not_published" } : out;
  });
  const valued = (list) => list.some((entry2) => (entry2.state === "approved" || entry2.state === "stale") && entry2.value !== null);
  const gap = (chapter_id, awaiting3) => ({ kind: "unavailable", chapter_id, reason: "no_approved_facts", awaiting: book.audience === "internal" ? awaiting3 : [] });
  const chapters = book.chapters.map((chapter) => {
    if (chapter.kind === "facts") {
      const kept = entries2(chapter.entries);
      return valued(kept) ? { ...chapter, entries: kept } : gap(chapter.chapter_id, kept);
    }
    if (chapter.kind === "plate") return { ...chapter, entries: entries2(chapter.entries) };
    if (chapter.kind === "canvas") {
      const zones = chapter.zones.map((zone) => ({ ...zone, entries: entries2(zone.entries) }));
      return valued(zones.flatMap((zone) => zone.entries)) ? { ...chapter, zones } : gap(chapter.chapter_id, zones.flatMap((zone) => zone.entries));
    }
    return { ...chapter, awaiting: entries2(chapter.awaiting) };
  });
  const embedded = (doc) => doc ? redactVisualDocument(doc, profile, classify)?.document ?? null : null;
  const identity = embedded(book.identity);
  const canvas = embedded(book.canvas);
  const printed2 = chapters.flatMap((chapter) => chapter.kind === "facts" || chapter.kind === "plate" ? chapter.entries : chapter.kind === "canvas" ? chapter.zones.flatMap((zone) => zone.entries) : []);
  const as_of = [...printed2.map((entry2) => entry2.value !== null ? entry2.approved_at : null), book.book_kind === "brand_book" ? identity?.as_of : null].filter((date) => Boolean(date)).sort().at(-1) ?? null;
  return { profile, document: { ...book, identity, canvas, chapters, as_of }, redacted: tally.redacted };
}
var PRINT_VIEWS = {
  business_model_canvas: ["public", "internal"],
  visual_identity: ["public", "internal"],
  mascot_atlas: ["public", "internal"],
  competitor_comparison: ["internal"]
};
var EXPORT_COMMANDS = {
  brand_book: {
    public: "npm run brand:export-visual -- --doc brand-book --edition public",
    internal: "npm run brand:export-visual -- --doc brand-book --edition internal"
  },
  // Personal documents export as Markdown through the existing local command; Studio shows it as text only.
  ...Object.fromEntries(
    PERSONAL_PUBLISHING_TYPES.map((type) => [
      type,
      Object.fromEntries(
        ["public", "internal"].filter((profile) => PROFILE_DOCUMENTS[profile].includes(type)).map((profile) => [profile, `npm run brand:document -- --type ${PERSONAL_PUBLISHING_KIND[type]} --audience ${profile}`])
      )
    ])
  )
};
function publishingExportCommand(type, profile) {
  if (!profilePermits(profile, type)) return null;
  return EXPORT_COMMANDS[type]?.[profile] ?? null;
}
function exportOf(type, profile) {
  if (!profilePermits(profile, type)) return "none";
  if (PRINT_VIEWS[type]?.includes(profile)) return "print";
  return publishingExportCommand(type, profile) ? "command" : "planned";
}
function countVisual(doc) {
  let shown2 = 0;
  let gaps = 0;
  const visit = (value2) => {
    if (Array.isArray(value2)) return value2.forEach(visit);
    if (!value2 || typeof value2 !== "object") return;
    if (isEntry(value2)) {
      if (value2.state === "not_applicable") return;
      if (value2.value !== null) shown2 += 1;
      else gaps += 1;
      return;
    }
    for (const child of Object.values(value2)) visit(child);
  };
  for (const block of doc.blocks) {
    if (block.type === "citation_list") continue;
    if (block.type === "mascot_atlas") {
      shown2 += block.entries.filter((entry2) => entry2.artwork).length;
      gaps += block.entries.filter((entry2) => !entry2.artwork).length;
      continue;
    }
    if (block.type === "mascot_evolution") {
      shown2 += block.slots.filter((slot) => slot.artwork).length;
      gaps += block.slots.filter((slot) => !slot.artwork && slot.stage_id).length;
      continue;
    }
    if (block.type === "competitor_matrix") {
      for (const row of block.rows) for (const cell of row.cells) {
        if (cell.own) visit(cell.own);
        else if (cell.state === "unknown") gaps += 1;
        else shown2 += 1;
      }
      continue;
    }
    visit(block);
  }
  return { shown: shown2, gaps };
}
function countDocument(model) {
  let shown2 = 0;
  let gaps = 0;
  for (const section of model.sections) for (const item of section.items) {
    if (item.tag === "recommendation" && item.value === null) continue;
    if (item.value !== null || item.structured !== null) shown2 += 1;
    else gaps += 1;
  }
  return { shown: shown2, gaps };
}
function readiness(counts) {
  if (counts.shown === 0) return "empty";
  return counts.gaps === 0 ? "ready" : "partial";
}
function buildPublishingGallery(engine, input) {
  const classify = input.classify ?? questionClassifier(engine);
  const cells2 = [];
  const prose = { brand_book: "brand-book", business_plan: "business-plan", marketing_plan: "marketing-plan" };
  const editions = (type) => {
    if (type === "business_model_canvas") return input.bmc ?? null;
    if (type === "visual_identity") return input.identity ?? null;
    if (type === "mascot_atlas") return input.mascot ?? null;
    if (type === "competitor_comparison") return input.competitors ? { internal: input.competitors, public: input.competitors } : null;
    return null;
  };
  const proseCache = /* @__PURE__ */ new Map();
  const proseDoc = (kind, edition) => {
    const key = `${kind}:${edition}`;
    if (!proseCache.has(key)) proseCache.set(key, buildNamedDocument(engine, kind, edition));
    return proseCache.get(key);
  };
  for (const type of PERSONAL_PUBLISHING_TYPES) prose[type] = PERSONAL_PUBLISHING_KIND[type];
  const personal = moduleEnabled({ optional: "personal" }, engine.config());
  const personalTypes = personal ? PERSONAL_PUBLISHING_TYPES.filter((type) => proseDoc(PERSONAL_PUBLISHING_KIND[type], "internal").sections.length > 0) : [];
  const documentTypes = [...PUBLISHING_DOCUMENT_TYPES, ...personalTypes];
  for (const type of documentTypes) {
    for (const profile of EXPORT_PROFILES) {
      const spec = EXPORT_PROFILE_SPECS[profile];
      const base3 = { document_type: type, profile, export: exportOf(type, profile), redacted: 0 };
      if (!profilePermits(profile, type)) {
        cells2.push({ ...base3, readiness: "blocked", shown: 0, gaps: 0, paper: null });
        continue;
      }
      const kind = prose[type];
      if (kind) {
        const redacted = redactDocumentModel(proseDoc(kind, spec.edition), profile, classify);
        const counts2 = redacted ? countDocument(redacted.document) : { shown: 0, gaps: 0 };
        const sections = redacted?.document.sections ?? [];
        const notApplicable2 = sections.length > 0 && sections.every((section) => section.status === "not_applicable");
        cells2.push({ ...base3, ...counts2, redacted: redacted?.redacted ?? 0, readiness: notApplicable2 ? "not_applicable" : readiness(counts2), paper: "book_a4_portrait" });
        continue;
      }
      const pair = editions(type);
      const source2 = pair ? pair[spec.edition] : null;
      const result = source2 ? redactVisualDocument(source2, profile, classify) : null;
      if (!result) {
        cells2.push({ ...base3, readiness: "empty", shown: 0, gaps: 0, paper: null });
        continue;
      }
      const unshared = result.document.blocks.some((block) => block.type === "competitor_matrix" && block.share_state !== "shared");
      const counts = unshared ? { shown: 0, gaps: 0 } : countVisual(result.document);
      const notApplicable = type === "business_model_canvas" && input.bmc?.applies === false || type === "mascot_atlas" && result.document.blocks.some((block) => block.type === "mascot_atlas" && !block.module_enabled);
      cells2.push({ ...base3, ...counts, redacted: result.redacted, readiness: notApplicable ? "not_applicable" : readiness(counts), paper: result.document.print_profile });
    }
  }
  return { schema: "brand-os.publishing-gallery/1", profiles: [...EXPORT_PROFILES], document_types: documentTypes, cells: cells2, review_due: reviewDue(engine, input.now ?? /* @__PURE__ */ new Date()) };
}
function reviewDue(engine, now) {
  try {
    let due = 0;
    for (const fact of Object.values(readFacts(engine.workspaceRoot(), "approved", engine.config().brand.slug))) {
      const at = fact.review_due ? Date.parse(fact.review_due) : NaN;
      if (Number.isFinite(at) && at < now.getTime()) due += 1;
    }
    return due;
  } catch {
    return 0;
  }
}

// packages/brand-core/src/visual/full-book.ts
var BOOK_SCHEMA = "brand-os.visual-book/1";
function valueless(entry2) {
  const { items: _items, legacy: _legacy, ...rest } = entry2;
  return { ...rest, value: null };
}
function printableEntry(entry2) {
  if (entry2.state === "recommendation") return null;
  if (entry2.state === "approved" || entry2.state === "stale") return entry2;
  return valueless(entry2);
}
function printable(entries2, audience) {
  return entries2.map(printableEntry).filter((entry2) => entry2 !== null).map((entry2) => audience === "public" && entry2.state !== "approved" && entry2.state !== "stale" && entry2.na_reason !== "profile" ? { ...valueless(entry2), state: "missing", note: null, missing_reason: "not_published" } : entry2);
}
function hasValue(entries2) {
  return entries2.some((entry2) => (entry2.state === "approved" || entry2.state === "stale") && entry2.value !== null);
}
function unavailable(chapter_id, reason, audience, awaiting3 = []) {
  return { kind: "unavailable", chapter_id, reason, awaiting: audience === "internal" ? awaiting3 : [] };
}
function profileNotApplicable(entries2) {
  return entries2.length > 0 && entries2.every((entry2) => entry2.na_reason === "profile");
}
function factsChapter(chapter_id, entries2, audience) {
  const kept = printable(entries2, audience);
  if (hasValue(kept)) return { kind: "facts", chapter_id, entries: kept };
  return unavailable(chapter_id, profileNotApplicable(kept) ? "not_applicable" : "no_approved_facts", audience, kept);
}
var BRAND_BOOK_SECTIONS = { overview: "overview", strategy: "strategy", verbal: "verbal", color: "color", type: "type", logo: "logo", governance: "governance" };
var REPORT_SECTIONS = {
  executive_summary: "executive-summary",
  customer_problem: "customer-problem",
  business_model: "business-model",
  product: "product",
  financials: "financials",
  goals: "goals",
  risks: "risks"
};
var ON_PLATE = /* @__PURE__ */ new Set([...Object.values(IDENTITY_QUESTIONS), "brand.logo.masters"]);
function latest(dates) {
  return dates.filter((date) => Boolean(date)).sort().at(-1) ?? null;
}
function referenceOnly(canvas) {
  return { ...canvas, blocks: canvas.blocks.filter((block) => block.type !== "business_model_canvas") };
}
function composeBook(input) {
  const { audience } = input;
  const section = (id) => id ? input.sections[id] ?? [] : [];
  const chapters = [];
  if (input.kind === "brand_book") {
    for (const id of ["overview", "strategy", "verbal"]) chapters.push(factsChapter(id, section(BRAND_BOOK_SECTIONS[id]), audience));
    for (const id of ["color", "type", "logo"]) {
      if (!input.identity) chapters.push(factsChapter(id, section(BRAND_BOOK_SECTIONS[id]), audience));
      else chapters.push({ kind: "plate", chapter_id: id, entries: printable(section(BRAND_BOOK_SECTIONS[id]).filter((entry2) => !ON_PLATE.has(entry2.id)), audience) });
    }
    chapters.push(unavailable("mascot", input.mascot === "on" ? "separate_print" : "module_off", audience));
    chapters.push(factsChapter("governance", section(BRAND_BOOK_SECTIONS.governance), audience));
    chapters.push(unavailable("motion", "planned", audience));
    chapters.push(unavailable("applications", "planned", audience));
  } else {
    for (const id of ["executive_summary", "customer_problem", "business_model"]) chapters.push(factsChapter(id, section(REPORT_SECTIONS[id]), audience));
    const block = input.canvas?.blocks.find((item) => item.type === "business_model_canvas");
    if (block && block.type === "business_model_canvas") {
      const zones = BMC_ZONE_IDS.map((zone_id) => {
        const zone = block.zones.find((item) => item.zone_id === zone_id);
        return { zone_id, order: zone?.order ?? BMC_ZONE_IDS.indexOf(zone_id) + 1, entries: printable(zone?.entries ?? [], audience) };
      });
      const all = zones.flatMap((zone) => zone.entries);
      chapters.push(hasValue(all) ? { kind: "canvas", chapter_id: "business_model_canvas", zones } : unavailable("business_model_canvas", profileNotApplicable(all) ? "not_applicable" : "no_approved_facts", audience, all));
    } else chapters.push(unavailable("business_model_canvas", "no_approved_facts", audience));
    if (audience === "internal") chapters.push(unavailable("competitors", input.competitors ? "separate_print" : "no_approved_facts", audience));
    for (const id of ["product", "financials", "goals", "risks"]) chapters.push(factsChapter(id, section(REPORT_SECTIONS[id]), audience));
  }
  const printed2 = chapters.flatMap((chapter) => chapter.kind === "facts" || chapter.kind === "plate" ? chapter.entries : chapter.kind === "canvas" ? chapter.zones.flatMap((zone) => zone.entries) : []);
  return {
    schema: BOOK_SCHEMA,
    schema_version: 1,
    book_kind: input.kind,
    brand_id: input.brand_id,
    brand_name: input.brand_name,
    audience,
    illustrative: input.illustrative,
    origin: input.illustrative ? "illustrative_fixture" : "brand_repository",
    as_of: latest([...printed2.map((entry2) => entry2.value !== null ? entry2.approved_at : null), input.kind === "brand_book" ? input.identity?.as_of : null]),
    identity: input.kind === "brand_book" ? input.identity ?? null : null,
    canvas: input.kind === "business_report" && input.canvas ? referenceOnly(input.canvas) : null,
    chapters
  };
}
function specEntries(engine, spec, audience, now) {
  const root = engine.workspaceRoot();
  const brandId = engine.config().brand.slug;
  const facts = readFacts(root, "approved", brandId);
  const answers = latestAnswers(engine.ledger().records);
  const context = { facts, answers, audience, root, brandId, evidence: readEvidence(root), now };
  const out = {};
  const applicability = brandApplicability(engine);
  const resolve = (ids) => {
    const known = ids.filter((id) => engine.question(id));
    return applicability.refsFor(known);
  };
  for (const section of spec.sections) {
    out[section.id] = resolve(section.questions).flatMap((ref) => {
      const question = engine.question(ref.id);
      const framed = question ? frameworkEntry(engine, context, ref, now) : null;
      if (!question || !framed) return [];
      const { approved: _approved, ...entry2 } = framed;
      return [question.sensitivity === "restricted" ? { ...valueless(entry2), state: audience === "public" ? "missing" : "withheld", missing_reason: audience === "public" ? "not_published" : null } : entry2];
    });
  }
  return out;
}
function buildBook(engine, kind, audience, options = {}) {
  const config = engine.config();
  const now = options.now ?? /* @__PURE__ */ new Date();
  const spec = kind === "brand_book" ? BRAND_BOOK : BUSINESS_PLAN;
  const rows2 = options.competitors?.blocks.find((block) => block.type === "competitor_matrix");
  return composeBook({
    kind,
    audience,
    brand_id: config.brand.slug,
    brand_name: String(config.brand.name ?? config.brand.slug),
    illustrative: false,
    sections: specEntries(engine, spec, audience, now),
    identity: options.identity ?? null,
    canvas: options.canvas ?? null,
    mascot: config.modules.mascot.enabled ? "on" : "off",
    competitors: Boolean(rows2 && rows2.type === "competitor_matrix" && rows2.rows.some((row) => row.kind === "competitor"))
  });
}

// packages/brand-core/src/visual/i18n-full-book.ts
var en7 = {
  book: {
    brand_book: {
      title: "Brand Book",
      kicker: "Brand Book \xB7 full edition",
      lead: "The brand in one book: strategy, voice, visual identity and governance, drawn from approved facts only.",
      running: "Brand Book"
    },
    business_report: {
      title: "Business Report",
      kicker: "Business Report",
      lead: "The business in one report: offer, customer, model, product, plan and risks, drawn from approved facts only. Restricted figures are never printed.",
      running: "Business Report"
    }
  },
  chapter: {
    overview: { title: "Brand overview", lead: "What the brand is called, what it offers and who it is for." },
    strategy: { title: "Strategy", lead: "Purpose, vision, values, differentiation and the promise the brand keeps." },
    verbal: { title: "Verbal identity", lead: "How the brand writes: name use, voice, do and don\u2019t pairs and forbidden language." },
    mascot: { title: "Mascot", lead: "The approved character, its states and its six-stage evolution." },
    governance: { title: "Governance", lead: "Who approves brand changes, how versions and deprecations work, and the rules for AI use." },
    motion: { title: "Motion", lead: "How the brand moves on screen: timing, easing and transitions." },
    applications: { title: "Applications", lead: "The brand applied to social posts, documents and product screens." },
    executive_summary: { title: "Executive summary", lead: "The business, its offer, its stage and the next milestone." },
    customer_problem: { title: "Customer and problem", lead: "Who the customer is, where, and which pains the offer addresses." },
    business_model: { title: "Business model", lead: "How the business earns money, sells, prices and defends its position." },
    business_model_canvas: { title: "Business Model Canvas", lead: "The nine zones of the canvas with their approved entries, in the canonical order." },
    competitors: { title: "Competitive landscape", lead: "Owner-reviewed competitors compared on cited, current observations." },
    product: { title: "Product", lead: "What ships first, its public status and the roadmap." },
    financials: { title: "Financial plan", lead: "Currency and basis. Restricted figures are never printed in any edition." },
    goals: { title: "Goals and KPIs", lead: "Annual and quarterly goals and the north-star metric." },
    risks: { title: "Risks and dependencies", lead: "Known risks and how they are reviewed." }
  },
  unavailableKicker: "Not yet available",
  unavailableTitle: "{chapter} is not in this edition yet",
  unavailable: {
    no_approved_facts: "No approved facts for this chapter yet. Nothing is invented to fill it: the chapter appears when the owner approves its answers.",
    planned: "This chapter is planned and not built yet. When it is, it will be drawn from approved facts only.",
    separate_print: "This chapter needs its own page layout, so it prints as a separate document for now: {where}.",
    module_off: "This module is turned off for the brand, so the chapter has nothing to show.",
    not_applicable: "This chapter does not apply to this brand\u2019s interview profile, so it has nothing to show."
  },
  separateWhere: {
    mascot: "Studio, Assets, Mascot atlas, Print",
    competitors: "Studio, Competitors, Print"
  },
  awaitingTitle: "What would fill it",
  stateReady: "Approved content",
  stateUnavailable: "Not yet available",
  draftNotPrinted: "Draft awaiting approval. Not printed.",
  withheldNotPrinted: "Restricted. Never printed.",
  notApplicable: "Marked not applicable",
  notApplicableProfile: "Not applicable to this profile",
  approvedOn: "approved {date}",
  rulesTitle: "Rules",
  sourcesIntro: "Every entry this book cites, the fact or asset it is drawn from, its state and its approved version.",
  canvasNote: "The full A3 canvas prints on its own: npm run brand:export-visual -- --doc bmc.",
  zoneGap: "No approved entry yet",
  labels: {},
  exportUnknownDoc: "--doc must be identity, bmc, brand-book or business-report (got {doc}).",
  exportReportNotPublic: "The Business Report is never public: it is the business plan, which only the internal edition may print. Use --edition internal."
};
var fa7 = {
  book: {
    brand_book: {
      title: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F",
      kicker: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F \xB7 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0627\u0645\u0644",
      lead: "\u0628\u0631\u0646\u062F \u062F\u0631 \u06CC\u06A9 \u06A9\u062A\u0627\u0628: \u0631\u0627\u0647\u0628\u0631\u062F\u060C \u0644\u062D\u0646\u060C \u0647\u0648\u06CC\u062A \u0628\u0635\u0631\u06CC \u0648 \u062D\u0627\u06A9\u0645\u06CC\u062A\u060C \u0641\u0642\u0637 \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647.",
      running: "\u06A9\u062A\u0627\u0628 \u0628\u0631\u0646\u062F"
    },
    business_report: {
      title: "\u06AF\u0632\u0627\u0631\u0634 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
      kicker: "\u06AF\u0632\u0627\u0631\u0634 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
      lead: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u062F\u0631 \u06CC\u06A9 \u06AF\u0632\u0627\u0631\u0634: \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u060C \u0645\u0634\u062A\u0631\u06CC\u060C \u0645\u062F\u0644\u060C \u0645\u062D\u0635\u0648\u0644\u060C \u0628\u0631\u0646\u0627\u0645\u0647 \u0648 \u0631\u06CC\u0633\u06A9\u200C\u0647\u0627\u060C \u0641\u0642\u0637 \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647. \u0627\u0631\u0642\u0627\u0645 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u0647\u0631\u06AF\u0632 \u0686\u0627\u067E \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
      running: "\u06AF\u0632\u0627\u0631\u0634 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631"
    }
  },
  chapter: {
    overview: { title: "\u0646\u0645\u0627\u06CC \u06A9\u0644\u06CC \u0628\u0631\u0646\u062F", lead: "\u0646\u0627\u0645 \u0628\u0631\u0646\u062F\u060C \u0622\u0646\u0686\u0647 \u0639\u0631\u0636\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0628\u0631\u0627\u06CC \u0686\u0647 \u06A9\u0633\u06CC \u0627\u0633\u062A." },
    strategy: { title: "\u0631\u0627\u0647\u0628\u0631\u062F", lead: "\u0647\u062F\u0641\u060C \u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632\u060C \u0627\u0631\u0632\u0634\u200C\u0647\u0627\u060C \u062A\u0645\u0627\u06CC\u0632 \u0648 \u0642\u0648\u0644\u06CC \u06A9\u0647 \u0628\u0631\u0646\u062F \u0646\u06AF\u0647 \u0645\u06CC\u200C\u062F\u0627\u0631\u062F." },
    verbal: { title: "\u0647\u0648\u06CC\u062A \u06A9\u0644\u0627\u0645\u06CC", lead: "\u0628\u0631\u0646\u062F \u0686\u0637\u0648\u0631 \u0645\u06CC\u200C\u0646\u0648\u06CC\u0633\u062F: \u06A9\u0627\u0631\u0628\u0631\u062F \u0646\u0627\u0645\u060C \u0644\u062D\u0646\u060C \u062C\u0641\u062A\u200C\u0647\u0627\u06CC \xAB\u0628\u06AF\u0648 \u0648 \u0646\u06AF\u0648\xBB \u0648 \u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u0645\u0645\u0646\u0648\u0639." },
    mascot: { title: "\u0634\u062E\u0635\u06CC\u062A \u0628\u0631\u0646\u062F (\u0645\u0627\u0633\u06A9\u0627\u062A)", lead: "\u0634\u062E\u0635\u06CC\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u062D\u0627\u0644\u062A\u200C\u0647\u0627\u06CC\u0634 \u0648 \u062A\u06A9\u0627\u0645\u0644 \u0634\u0634\u200C\u0645\u0631\u062D\u0644\u0647\u200C\u0627\u06CC \u0622\u0646." },
    governance: { title: "\u062D\u0627\u06A9\u0645\u06CC\u062A", lead: "\u0686\u0647 \u06A9\u0633\u06CC \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0628\u0631\u0646\u062F \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u0645\u06CC\u200C\u06A9\u0646\u062F\u060C \u0646\u0633\u062E\u0647\u200C\u0647\u0627 \u0648 \u06A9\u0646\u0627\u0631\u06AF\u0630\u0627\u0634\u062A\u0646\u200C\u0647\u0627 \u0686\u0637\u0648\u0631 \u06A9\u0627\u0631 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F \u0648 \u0642\u0648\u0627\u0639\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC." },
    motion: { title: "\u062D\u0631\u06A9\u062A", lead: "\u0628\u0631\u0646\u062F \u0631\u0648\u06CC \u0635\u0641\u062D\u0647 \u0686\u0637\u0648\u0631 \u062D\u0631\u06A9\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F: \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC\u060C \u0634\u062A\u0627\u0628 \u0648 \u06AF\u0630\u0627\u0631\u0647\u0627." },
    applications: { title: "\u06A9\u0627\u0631\u0628\u0631\u062F\u0647\u0627", lead: "\u0628\u0631\u0646\u062F \u0631\u0648\u06CC \u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC\u060C \u0627\u0633\u0646\u0627\u062F \u0648 \u0635\u0641\u062D\u0647\u200C\u0647\u0627\u06CC \u0645\u062D\u0635\u0648\u0644." },
    executive_summary: { title: "\u062E\u0644\u0627\u0635\u0647\u0654 \u0645\u062F\u06CC\u0631\u06CC\u062A\u06CC", lead: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u060C \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u0634\u060C \u0645\u0631\u062D\u0644\u0647\u200C\u0627\u0634 \u0648 \u0646\u0642\u0637\u0647\u0654 \u0639\u0637\u0641 \u0628\u0639\u062F\u06CC." },
    customer_problem: { title: "\u0645\u0634\u062A\u0631\u06CC \u0648 \u0645\u0633\u0626\u0644\u0647", lead: "\u0645\u0634\u062A\u0631\u06CC \u06A9\u06CC\u0633\u062A\u060C \u06A9\u062C\u0627\u0633\u062A \u0648 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u06A9\u062F\u0627\u0645 \u062F\u0631\u062F\u0647\u0627 \u0631\u0627 \u062D\u0644 \u0645\u06CC\u200C\u06A9\u0646\u062F." },
    business_model: { title: "\u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631", lead: "\u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0686\u0637\u0648\u0631 \u062F\u0631\u0622\u0645\u062F \u062F\u0627\u0631\u062F\u060C \u0645\u06CC\u200C\u0641\u0631\u0648\u0634\u062F\u060C \u0642\u06CC\u0645\u062A \u0645\u06CC\u200C\u06AF\u0630\u0627\u0631\u062F \u0648 \u0627\u0632 \u062C\u0627\u06CC\u06AF\u0627\u0647\u0634 \u062F\u0641\u0627\u0639 \u0645\u06CC\u200C\u06A9\u0646\u062F." },
    business_model_canvas: { title: "\u0628\u0648\u0645 \u0645\u062F\u0644 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631", lead: "\u0646\u064F\u0647 \u0628\u062E\u0634 \u0628\u0648\u0645 \u0628\u0627 \u0645\u062F\u062E\u0644\u200C\u0647\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u060C \u0628\u0647 \u062A\u0631\u062A\u06CC\u0628 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F." },
    competitors: { title: "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632 \u0631\u0642\u0627\u0628\u062A\u06CC", lead: "\u0631\u0642\u0628\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u0628\u0631\u0631\u0633\u06CC \u06A9\u0631\u062F\u0647\u060C \u0628\u0631 \u067E\u0627\u06CC\u0647\u0654 \u0645\u0634\u0627\u0647\u062F\u0647\u200C\u0647\u0627\u06CC \u0645\u0633\u062A\u0646\u062F \u0648 \u0628\u0647\u200C\u0631\u0648\u0632." },
    product: { title: "\u0645\u062D\u0635\u0648\u0644", lead: "\u0627\u0648\u0644 \u0686\u0647 \u0686\u06CC\u0632\u06CC \u0639\u0631\u0636\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0648\u0636\u0639\u06CC\u062A \u0639\u0645\u0648\u0645\u06CC \u0622\u0646 \u0648 \u0646\u0642\u0634\u0647\u0654 \u0631\u0627\u0647." },
    financials: { title: "\u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u0645\u0627\u0644\u06CC", lead: "\u0648\u0627\u062D\u062F \u067E\u0648\u0644 \u0648 \u0645\u0628\u0646\u0627\u06CC \u062D\u0633\u0627\u0628\u062F\u0627\u0631\u06CC. \u0627\u0631\u0642\u0627\u0645 \u0645\u062D\u0631\u0645\u0627\u0646\u0647 \u062F\u0631 \u0647\u06CC\u0686 \u0648\u06CC\u0631\u0627\u06CC\u0634\u06CC \u0686\u0627\u067E \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F." },
    goals: { title: "\u0627\u0647\u062F\u0627\u0641 \u0648 \u0634\u0627\u062E\u0635\u200C\u0647\u0627", lead: "\u0647\u062F\u0641\u200C\u0647\u0627\u06CC \u0633\u0627\u0644\u0627\u0646\u0647 \u0648 \u0641\u0635\u0644\u06CC \u0648 \u0634\u0627\u062E\u0635 \u0633\u062A\u0627\u0631\u0647\u0654 \u0642\u0637\u0628\u06CC." },
    risks: { title: "\u0631\u06CC\u0633\u06A9\u200C\u0647\u0627 \u0648 \u0648\u0627\u0628\u0633\u062A\u06AF\u06CC\u200C\u0647\u0627", lead: "\u0631\u06CC\u0633\u06A9\u200C\u0647\u0627\u06CC \u0634\u0646\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u0648 \u0631\u0648\u0634 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0622\u0646\u200C\u0647\u0627." }
  },
  unavailableKicker: "\u0647\u0646\u0648\u0632 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A",
  unavailableTitle: "\xAB{chapter}\xBB \u0647\u0646\u0648\u0632 \u062F\u0631 \u0627\u06CC\u0646 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0646\u06CC\u0633\u062A",
  unavailable: {
    no_approved_facts: "\u0647\u0646\u0648\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0641\u0635\u0644 \u0646\u06CC\u0633\u062A. \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u067E\u0631 \u06A9\u0631\u062F\u0646 \u0622\u0646 \u0633\u0627\u062E\u062A\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F: \u0648\u0642\u062A\u06CC \u0645\u0627\u0644\u06A9 \u067E\u0627\u0633\u062E\u200C\u0647\u0627 \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u062F\u060C \u0641\u0635\u0644 \u0638\u0627\u0647\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F.",
    planned: "\u0627\u06CC\u0646 \u0641\u0635\u0644 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0634\u062F\u0647 \u0648\u0644\u06CC \u0647\u0646\u0648\u0632 \u0633\u0627\u062E\u062A\u0647 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0648\u0642\u062A\u06CC \u0633\u0627\u062E\u062A\u0647 \u0634\u0648\u062F\u060C \u0641\u0642\u0637 \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u062E\u0648\u0627\u0647\u062F \u0628\u0648\u062F.",
    separate_print: "\u0627\u06CC\u0646 \u0641\u0635\u0644 \u0635\u0641\u062D\u0647\u200C\u0622\u0631\u0627\u06CC\u06CC \u062E\u0648\u062F\u0634 \u0631\u0627 \u0644\u0627\u0632\u0645 \u062F\u0627\u0631\u062F\u060C \u067E\u0633 \u0641\u0639\u0644\u0627\u064B \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u0686\u0627\u067E \u0645\u06CC\u200C\u0634\u0648\u062F: {where}.",
    module_off: "\u0627\u06CC\u0646 \u0645\u0627\u0698\u0648\u0644 \u0628\u0631\u0627\u06CC \u0628\u0631\u0646\u062F \u062E\u0627\u0645\u0648\u0634 \u0627\u0633\u062A\u060C \u067E\u0633 \u0627\u06CC\u0646 \u0641\u0635\u0644 \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0646 \u0646\u062F\u0627\u0631\u062F.",
    not_applicable: "\u0627\u06CC\u0646 \u0641\u0635\u0644 \u062F\u0631 \u0646\u0645\u0627\u06CC\u0647\u0654 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F\u060C \u067E\u0633 \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0646 \u0646\u062F\u0627\u0631\u062F."
  },
  separateWhere: {
    mascot: "Studio\u060C \u062F\u0627\u0631\u0627\u06CC\u06CC\u200C\u0647\u0627\u060C \u0627\u0637\u0644\u0633 \u0645\u0627\u0633\u06A9\u0627\u062A\u060C \u0686\u0627\u067E",
    competitors: "Studio\u060C \u0631\u0642\u0628\u0627\u060C \u0686\u0627\u067E"
  },
  awaitingTitle: "\u0686\u0647 \u0686\u06CC\u0632\u06CC \u0622\u0646 \u0631\u0627 \u067E\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F",
  stateReady: "\u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
  stateUnavailable: "\u0647\u0646\u0648\u0632 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A",
  draftNotPrinted: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633 \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0623\u06CC\u06CC\u062F. \u0686\u0627\u067E \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  withheldNotPrinted: "\u0645\u062D\u0631\u0645\u0627\u0646\u0647. \u0647\u0631\u06AF\u0632 \u0686\u0627\u067E \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  notApplicable: "\u0646\u0627\u0645\u0631\u0628\u0648\u0637 \u0639\u0644\u0627\u0645\u062A \u062E\u0648\u0631\u062F\u0647",
  notApplicableProfile: "\u062F\u0631 \u0627\u06CC\u0646 \u0646\u0645\u0627\u06CC\u0647 \u0645\u0648\u0636\u0648\u0639\u06CC\u062A \u0646\u062F\u0627\u0631\u062F",
  approvedOn: "\u062A\u0623\u06CC\u06CC\u062F {date}",
  rulesTitle: "\u0642\u0648\u0627\u0639\u062F",
  sourcesIntro: "\u0647\u0645\u0647\u0654 \u0645\u062F\u062E\u0644\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u06A9\u062A\u0627\u0628 \u0628\u0647 \u0622\u0646\u200C\u0647\u0627 \u0627\u0631\u062C\u0627\u0639 \u0645\u06CC\u200C\u062F\u0647\u062F\u060C \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06CC\u0627 \u0641\u0627\u06CC\u0644\u06CC \u06A9\u0647 \u0627\u0632 \u0622\u0646 \u0622\u0645\u062F\u0647\u200C\u0627\u0646\u062F\u060C \u0648\u0636\u0639\u06CC\u062A \u0648 \u0646\u0633\u062E\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u0654 \u0622\u0646\u200C\u0647\u0627.",
  canvasNote: "\u0628\u0648\u0645 \u06A9\u0627\u0645\u0644 A3 \u062C\u062F\u0627\u06AF\u0627\u0646\u0647 \u0686\u0627\u067E \u0645\u06CC\u200C\u0634\u0648\u062F: npm run brand:export-visual -- --doc bmc.",
  zoneGap: "\u0647\u0646\u0648\u0632 \u0645\u062F\u062E\u0644 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647\u200C\u0627\u06CC \u0646\u06CC\u0633\u062A",
  labels: {
    "business.identity.trade_name": "\u0646\u0627\u0645 \u062A\u062C\u0627\u0631\u06CC",
    "brand.identity.public_name_override": "\u0646\u0627\u0645 \u0639\u0645\u0648\u0645\u06CC \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646",
    "brand.verbal.tagline": "\u0634\u0639\u0627\u0631",
    "business.offer.summary": "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F",
    "business.customer.primary_segment": "\u0645\u0634\u062A\u0631\u06CC \u0627\u0635\u0644\u06CC",
    "brand.strategy.purpose": "\u0647\u062F\u0641",
    "brand.strategy.vision": "\u0686\u0634\u0645\u200C\u0627\u0646\u062F\u0627\u0632",
    "brand.strategy.values": "\u0627\u0631\u0632\u0634\u200C\u0647\u0627",
    "brand.strategy.differentiation": "\u062A\u0645\u0627\u06CC\u0632",
    "brand.strategy.promise": "\u0642\u0648\u0644 \u0628\u0631\u0646\u062F",
    "brand.personality.traits": "\u0634\u062E\u0635\u06CC\u062A",
    "brand.strategy.decision_rule": "\u0642\u0627\u0639\u062F\u0647\u0654 \u062A\u0635\u0645\u06CC\u0645",
    "brand.verbal.name_use": "\u06A9\u0627\u0631\u0628\u0631\u062F \u0646\u0627\u0645",
    "brand.verbal.voice": "\u0644\u062D\u0646",
    "brand.verbal.voice_pairs": "\u0628\u06AF\u0648 \u0648 \u0646\u06AF\u0648\u06CC \u0644\u062D\u0646",
    "brand.verbal.forbidden": "\u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u0645\u0645\u0646\u0648\u0639",
    "brand.verbal.microcopy": "\u0627\u0635\u0644 \u0645\u062A\u0646\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647",
    "brand.verbal.localization": "\u0628\u0648\u0645\u06CC\u200C\u0633\u0627\u0632\u06CC",
    "brand.color.roles": "\u0646\u0642\u0634\u200C\u0647\u0627\u06CC \u0631\u0646\u06AF",
    "brand.color.themes": "\u062A\u0645\u200C\u0647\u0627",
    "brand.color.semantics": "\u0631\u0646\u06AF\u200C\u0647\u0627\u06CC \u0645\u0639\u0646\u0627\u06CC\u06CC",
    "brand.color.contrast": "\u0647\u062F\u0641 \u06A9\u0646\u062A\u0631\u0627\u0633\u062A",
    "brand.type.intent": "\u0647\u062F\u0641 \u062D\u0631\u0648\u0641",
    "brand.type.scale": "\u0646\u0642\u0634\u200C\u0647\u0627 \u0648 \u0645\u0642\u06CC\u0627\u0633 \u062D\u0631\u0648\u0641",
    "brand.type.fallback": "\u0633\u06CC\u0627\u0633\u062A \u062D\u0631\u0648\u0641 \u062C\u0627\u06CC\u06AF\u0632\u06CC\u0646",
    "brand.type.license": "\u0648\u0636\u0639\u06CC\u062A \u0645\u062C\u0648\u0632",
    "brand.type.rtl": "\u0631\u0627\u0633\u062A\u200C\u0628\u0647\u200C\u0686\u067E \u0648 \u0632\u0628\u0627\u0646\u200C\u0647\u0627",
    "brand.logo.variants": "\u0646\u0633\u062E\u0647\u200C\u0647\u0627\u06CC \u0644\u0627\u0632\u0645",
    "brand.logo.min_size": "\u06A9\u0645\u06CC\u0646\u0647\u0654 \u0627\u0646\u062F\u0627\u0632\u0647 \u0648 \u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC",
    "brand.logo.clear_space": "\u0641\u0636\u0627\u06CC \u062E\u0627\u0644\u06CC",
    "brand.logo.misuse": "\u0642\u0648\u0627\u0639\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647\u0654 \u0646\u0627\u062F\u0631\u0633\u062A",
    "brand.logo.masters": "\u0645\u062D\u0644 \u0641\u0627\u06CC\u0644 \u0627\u0635\u0644\u06CC",
    "brand.gov.approver": "\u062A\u0623\u06CC\u06CC\u062F\u06A9\u0646\u0646\u062F\u0647\u0654 \u0628\u0631\u0646\u062F",
    "brand.gov.versioning": "\u0646\u0633\u062E\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC",
    "brand.gov.deprecation": "\u06A9\u0646\u0627\u0631\u06AF\u0630\u0627\u0634\u062A\u0646",
    "brand.gov.license": "\u0645\u062C\u0648\u0632 \u0645\u062D\u062A\u0648\u0627",
    "brand.gov.ai": "\u0645\u0646\u0634\u0623 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC",
    "brand.gov.cadence": "\u062F\u0648\u0631\u0647\u0654 \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC",
    "business.offer.value_proposition": "\u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
    "business.stage.current": "\u0645\u0631\u062D\u0644\u0647\u0654 \u0641\u0639\u0644\u06CC",
    "business.plan.milestone": "\u0646\u0642\u0637\u0647\u0654 \u0639\u0637\u0641 \u0628\u0639\u062F\u06CC",
    "business.problem.pains": "\u062F\u0631\u062F\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC",
    "business.market.geography": "\u062C\u063A\u0631\u0627\u0641\u06CC\u0627",
    "business.model.revenue": "\u0645\u062F\u0644 \u062F\u0631\u0622\u0645\u062F",
    "business.sales.motion": "\u0631\u0648\u0634 \u0641\u0631\u0648\u0634",
    "business.sales.pricing": "\u062E\u0644\u0627\u0635\u0647\u0654 \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC",
    "business.model.defensibility": "\u062F\u0641\u0627\u0639\u200C\u067E\u0630\u06CC\u0631\u06CC",
    "business.model.segments": "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC",
    "business.model.key_activities": "\u0641\u0639\u0627\u0644\u06CC\u062A\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC",
    "business.model.key_resources": "\u0645\u0646\u0627\u0628\u0639 \u06A9\u0644\u06CC\u062F\u06CC",
    "business.model.cost_items": "\u0627\u0642\u0644\u0627\u0645 \u0647\u0632\u06CC\u0646\u0647",
    "business.product.mvp": "\u0645\u0631\u0632 \u0646\u0633\u062E\u0647\u0654 \u0627\u0648\u0644",
    "business.product.public_status": "\u0648\u0636\u0639\u06CC\u062A \u0639\u0645\u0648\u0645\u06CC",
    "business.product.roadmap": "\u0627\u0641\u0642 \u0646\u0642\u0634\u0647\u0654 \u0631\u0627\u0647",
    "business.finance.currency": "\u0648\u0627\u062D\u062F \u067E\u0648\u0644 \u06AF\u0632\u0627\u0631\u0634",
    "business.finance.basis": "\u0645\u0628\u0646\u0627\u06CC \u062D\u0633\u0627\u0628\u062F\u0627\u0631\u06CC",
    "business.finance.revenue_figure": "\u0631\u0642\u0645 \u062F\u0631\u0622\u0645\u062F",
    "business.finance.costs": "\u0639\u0648\u0627\u0645\u0644 \u0647\u0632\u06CC\u0646\u0647",
    "business.finance.runway": "\u0645\u062F\u062A \u062F\u0648\u0627\u0645 \u0646\u0642\u062F\u06CC\u0646\u06AF\u06CC",
    "business.goals.annual": "\u0647\u062F\u0641 \u0633\u0627\u0644\u0627\u0646\u0647",
    "business.goals.quarter": "\u062A\u0645\u0631\u06A9\u0632 \u0641\u0635\u0644\u06CC",
    "business.goals.north_star": "\u062A\u0639\u0631\u06CC\u0641 \u0633\u062A\u0627\u0631\u0647\u0654 \u0642\u0637\u0628\u06CC",
    "business.plan.risks": "\u0631\u06CC\u0633\u06A9\u200C\u0647\u0627\u06CC \u0627\u0635\u0644\u06CC",
    "business.partners.risk_process": "\u0628\u0627\u0632\u0628\u06CC\u0646\u06CC \u0631\u06CC\u0633\u06A9",
    "business.partners.channels": "\u0647\u0645\u06A9\u0627\u0631\u0627\u0646",
    "business.ops.vendors": "\u062A\u0623\u0645\u06CC\u0646\u200C\u06A9\u0646\u0646\u062F\u06AF\u0627\u0646",
    "business.cx.onboarding": "\u0646\u062A\u06CC\u062C\u0647\u0654 \u0634\u0631\u0648\u0639 \u06A9\u0627\u0631 \u0645\u0634\u062A\u0631\u06CC",
    "business.cx.channels": "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC",
    "business.marketing.channels": "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627",
    "business.sales.consumer_path": "\u0645\u0633\u06CC\u0631 \u062E\u0631\u06CC\u062F \u0645\u0634\u062A\u0631\u06CC",
    "business.sales.buyer": "\u062E\u0631\u06CC\u062F\u0627\u0631 \u062F\u0631 \u0628\u0631\u0627\u0628\u0631 \u06A9\u0627\u0631\u0628\u0631",
    "business.finance.economics_note": "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0627\u0642\u062A\u0635\u0627\u062F \u0642\u06CC\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC"
  },
  exportUnknownDoc: "--doc \u0628\u0627\u06CC\u062F identity\u060C bmc\u060C brand-book \u06CC\u0627 business-report \u0628\u0627\u0634\u062F (\u062F\u0627\u062F\u0647 \u0634\u062F: {doc}).",
  exportReportNotPublic: "\u06AF\u0632\u0627\u0631\u0634 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0647\u0631\u06AF\u0632 \u0639\u0645\u0648\u0645\u06CC \u0646\u06CC\u0633\u062A: \u0627\u06CC\u0646 \u0647\u0645\u0627\u0646 \u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u0627\u0633\u062A \u0648 \u0641\u0642\u0637 \u0646\u0633\u062E\u0647\u0654 \u062F\u0627\u062E\u0644\u06CC \u0686\u0627\u067E \u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u0632 --edition internal \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F."
};
var tr7 = {
  book: {
    brand_book: {
      title: "Marka Kitab\u0131",
      kicker: "Marka Kitab\u0131 \xB7 tam s\xFCr\xFCm",
      lead: "Marka tek kitapta: strateji, ses, g\xF6rsel kimlik ve y\xF6neti\u015Fim, yaln\u0131zca onayl\u0131 bilgilerden.",
      running: "Marka Kitab\u0131"
    },
    business_report: {
      title: "\u0130\u015F Raporu",
      kicker: "\u0130\u015F Raporu",
      lead: "\u0130\u015Fletme tek raporda: teklif, m\xFC\u015Fteri, model, \xFCr\xFCn, plan ve riskler, yaln\u0131zca onayl\u0131 bilgilerden. K\u0131s\u0131tl\u0131 rakamlar asla bas\u0131lmaz.",
      running: "\u0130\u015F Raporu"
    }
  },
  chapter: {
    overview: { title: "Markaya genel bak\u0131\u015F", lead: "Markan\u0131n ad\u0131, ne sundu\u011Fu ve kimin i\xE7in oldu\u011Fu." },
    strategy: { title: "Strateji", lead: "Ama\xE7, vizyon, de\u011Ferler, farkl\u0131la\u015Fma ve markan\u0131n tuttu\u011Fu s\xF6z." },
    verbal: { title: "S\xF6zel kimlik", lead: "Markan\u0131n nas\u0131l yazd\u0131\u011F\u0131: ad kullan\u0131m\u0131, ses, yap ve yapma \xE7iftleri, yasak dil." },
    mascot: { title: "Maskot", lead: "Onayl\u0131 karakter, durumlar\u0131 ve alt\u0131 a\u015Famal\u0131 evrimi." },
    governance: { title: "Y\xF6neti\u015Fim", lead: "Marka de\u011Fi\u015Fikliklerini kimin onaylad\u0131\u011F\u0131, s\xFCr\xFCm ve kullan\u0131mdan kald\u0131rman\u0131n nas\u0131l i\u015Fledi\u011Fi ve yapay zek\xE2 kurallar\u0131." },
    motion: { title: "Hareket", lead: "Markan\u0131n ekranda nas\u0131l hareket etti\u011Fi: zamanlama, yumu\u015Fatma ve ge\xE7i\u015Fler." },
    applications: { title: "Uygulamalar", lead: "Markan\u0131n sosyal g\xF6nderilerde, belgelerde ve \xFCr\xFCn ekranlar\u0131nda uygulan\u0131\u015F\u0131." },
    executive_summary: { title: "Y\xF6netici \xF6zeti", lead: "\u0130\u015Fletme, teklifi, a\u015Famas\u0131 ve bir sonraki kilometre ta\u015F\u0131." },
    customer_problem: { title: "M\xFC\u015Fteri ve sorun", lead: "M\xFC\u015Fterinin kim oldu\u011Fu, nerede oldu\u011Fu ve teklifin hangi s\u0131k\u0131nt\u0131lar\u0131 \xE7\xF6zd\xFC\u011F\xFC." },
    business_model: { title: "\u0130\u015F modeli", lead: "\u0130\u015Fletmenin nas\u0131l gelir elde etti\u011Fi, satt\u0131\u011F\u0131, fiyatlad\u0131\u011F\u0131 ve konumunu korudu\u011Fu." },
    business_model_canvas: { title: "\u0130\u015F Modeli Kanvas\u0131", lead: "Kanvas\u0131n dokuz alan\u0131 ve onayl\u0131 girdileri, standart s\u0131rayla." },
    competitors: { title: "Rekabet ortam\u0131", lead: "Sahibin inceledi\u011Fi rakipler, kaynakl\u0131 ve g\xFCncel g\xF6zlemlerle kar\u015F\u0131la\u015Ft\u0131r\u0131l\u0131r." },
    product: { title: "\xDCr\xFCn", lead: "\u0130lk neyin \xE7\u0131kaca\u011F\u0131, kamuya a\xE7\u0131k durumu ve yol haritas\u0131." },
    financials: { title: "Finansal plan", lead: "Para birimi ve muhasebe esas\u0131. K\u0131s\u0131tl\u0131 rakamlar hi\xE7bir s\xFCr\xFCmde bas\u0131lmaz." },
    goals: { title: "Hedefler ve KPI\u2019lar", lead: "Y\u0131ll\u0131k ve \xE7eyreklik hedefler ve kuzey y\u0131ld\u0131z\u0131 metri\u011Fi." },
    risks: { title: "Riskler ve ba\u011F\u0131ml\u0131l\u0131klar", lead: "Bilinen riskler ve nas\u0131l g\xF6zden ge\xE7irildikleri." }
  },
  unavailableKicker: "Hen\xFCz mevcut de\u011Fil",
  unavailableTitle: "{chapter} hen\xFCz bu s\xFCr\xFCmde yok",
  unavailable: {
    no_approved_facts: "Bu b\xF6l\xFCm i\xE7in hen\xFCz onayl\u0131 bilgi yok. Bo\u015Flu\u011Fu doldurmak i\xE7in hi\xE7bir \u015Fey uydurulmaz: sahip yan\u0131tlar\u0131 onaylad\u0131\u011F\u0131nda b\xF6l\xFCm g\xF6r\xFCn\xFCr.",
    planned: "Bu b\xF6l\xFCm planland\u0131 ama hen\xFCz yap\u0131lmad\u0131. Yap\u0131ld\u0131\u011F\u0131nda yaln\u0131zca onayl\u0131 bilgilerden \xE7izilecek.",
    separate_print: "Bu b\xF6l\xFCm\xFCn kendi sayfa d\xFCzenine ihtiyac\u0131 var, bu y\xFCzden \u015Fimdilik ayr\u0131 bir belge olarak bas\u0131l\u0131yor: {where}.",
    module_off: "Bu mod\xFCl marka i\xE7in kapal\u0131, bu y\xFCzden b\xF6l\xFCmde g\xF6sterilecek bir \u015Fey yok.",
    not_applicable: "Bu b\xF6l\xFCm bu markan\u0131n g\xF6r\xFC\u015Fme profili i\xE7in ge\xE7erli de\u011Fil, bu y\xFCzden g\xF6sterilecek bir \u015Fey yok."
  },
  separateWhere: {
    mascot: "Studio, Varl\u0131klar, Maskot atlas\u0131, Yazd\u0131r",
    competitors: "Studio, Rakipler, Yazd\u0131r"
  },
  awaitingTitle: "Onu ne doldurur",
  stateReady: "Onayl\u0131 i\xE7erik",
  stateUnavailable: "Hen\xFCz mevcut de\u011Fil",
  draftNotPrinted: "Onay bekleyen taslak. Bas\u0131lmaz.",
  withheldNotPrinted: "K\u0131s\u0131tl\u0131. Asla bas\u0131lmaz.",
  notApplicable: "Uygulanamaz olarak i\u015Faretlendi",
  notApplicableProfile: "Bu profil i\xE7in ge\xE7erli de\u011Fil",
  approvedOn: "{date} onayland\u0131",
  rulesTitle: "Kurallar",
  sourcesIntro: "Bu kitab\u0131n and\u0131\u011F\u0131 her girdi, dayand\u0131\u011F\u0131 bilgi ya da dosya, durumu ve onayl\u0131 s\xFCr\xFCm\xFC.",
  canvasNote: "Tam A3 kanvas ayr\u0131 bas\u0131l\u0131r: npm run brand:export-visual -- --doc bmc.",
  zoneGap: "Hen\xFCz onayl\u0131 girdi yok",
  labels: {
    "business.identity.trade_name": "Ticari ad",
    "brand.identity.public_name_override": "Kamuya a\xE7\u0131k ad",
    "brand.verbal.tagline": "Slogan",
    "business.offer.summary": "Teklif",
    "business.customer.primary_segment": "Birincil m\xFC\u015Fteri",
    "brand.strategy.purpose": "Ama\xE7",
    "brand.strategy.vision": "Vizyon",
    "brand.strategy.values": "De\u011Ferler",
    "brand.strategy.differentiation": "Farkl\u0131la\u015Fma",
    "brand.strategy.promise": "Marka s\xF6z\xFC",
    "brand.personality.traits": "Ki\u015Filik",
    "brand.strategy.decision_rule": "Karar kural\u0131",
    "brand.verbal.name_use": "Ad kullan\u0131m\u0131",
    "brand.verbal.voice": "Ses tonu",
    "brand.verbal.voice_pairs": "Ses i\xE7in yap ve yapma",
    "brand.verbal.forbidden": "Yasak dil",
    "brand.verbal.microcopy": "Mikro metin ilkesi",
    "brand.verbal.localization": "Yerelle\u015Ftirme",
    "brand.color.roles": "Renk rolleri",
    "brand.color.themes": "Temalar",
    "brand.color.semantics": "Anlamsal renkler",
    "brand.color.contrast": "Kontrast hedefi",
    "brand.type.intent": "Yaz\u0131 amac\u0131",
    "brand.type.scale": "Yaz\u0131 rolleri ve \xF6l\xE7e\u011Fi",
    "brand.type.fallback": "Yedek yaz\u0131 politikas\u0131",
    "brand.type.license": "Lisans durumu",
    "brand.type.rtl": "Sa\u011Fdan sola ve diller",
    "brand.logo.variants": "Gereken varyantlar",
    "brand.logo.min_size": "En k\xFC\xE7\xFCk boyut ve bo\u015Fluk",
    "brand.logo.clear_space": "Bo\u015F alan",
    "brand.logo.misuse": "Yanl\u0131\u015F kullan\u0131m kurallar\u0131",
    "brand.logo.masters": "Ana dosyan\u0131n yeri",
    "brand.gov.approver": "Marka onaylay\u0131c\u0131s\u0131",
    "brand.gov.versioning": "S\xFCr\xFCmleme",
    "brand.gov.deprecation": "Kullan\u0131mdan kald\u0131rma",
    "brand.gov.license": "\u0130\xE7erik lisans\u0131",
    "brand.gov.ai": "Yapay zek\xE2 k\xF6keni",
    "brand.gov.cadence": "Bak\u0131m s\u0131kl\u0131\u011F\u0131",
    "business.offer.value_proposition": "De\u011Fer \xF6nerisi",
    "business.stage.current": "Faaliyet a\u015Famas\u0131",
    "business.plan.milestone": "Sonraki kilometre ta\u015F\u0131",
    "business.problem.pains": "M\xFC\u015Fteri s\u0131k\u0131nt\u0131lar\u0131",
    "business.market.geography": "Co\u011Frafya",
    "business.model.revenue": "Gelir modeli",
    "business.sales.motion": "Sat\u0131\u015F yakla\u015F\u0131m\u0131",
    "business.sales.pricing": "Fiyatland\u0131rma \xF6zeti",
    "business.model.defensibility": "Savunulabilirlik",
    "business.model.segments": "M\xFC\u015Fteri segmentleri",
    "business.model.key_activities": "Kilit faaliyetler",
    "business.model.key_resources": "Kilit kaynaklar",
    "business.model.cost_items": "Maliyet kalemleri",
    "business.product.mvp": "MVP s\u0131n\u0131r\u0131",
    "business.product.public_status": "Kamuya a\xE7\u0131k durum",
    "business.product.roadmap": "Yol haritas\u0131 ufku",
    "business.finance.currency": "Raporlama para birimi",
    "business.finance.basis": "Muhasebe esas\u0131",
    "business.finance.revenue_figure": "Gelir rakam\u0131",
    "business.finance.costs": "Maliyet etkenleri",
    "business.finance.runway": "Nakit \xF6mr\xFC",
    "business.goals.annual": "Y\u0131ll\u0131k hedef",
    "business.goals.quarter": "\xC7eyrek oda\u011F\u0131",
    "business.goals.north_star": "Kuzey y\u0131ld\u0131z\u0131 tan\u0131m\u0131",
    "business.plan.risks": "Ba\u015Fl\u0131ca riskler",
    "business.partners.risk_process": "Risk incelemesi",
    "business.partners.channels": "Ortaklar",
    "business.ops.vendors": "Tedarik\xE7iler",
    "business.cx.onboarding": "Ba\u015Flang\u0131\xE7 sonucu",
    "business.cx.channels": "Destek kanallar\u0131",
    "business.marketing.channels": "Kanallar",
    "business.sales.consumer_path": "T\xFCketici sat\u0131n alma yolu",
    "business.sales.buyer": "Al\u0131c\u0131 ve kullan\u0131c\u0131",
    "business.finance.economics_note": "Fiyatland\u0131rma ekonomisi notu"
  },
  exportUnknownDoc: "--doc identity, bmc, brand-book veya business-report olmal\u0131 (verilen: {doc}).",
  exportReportNotPublic: "\u0130\u015F Raporu hi\xE7bir zaman herkese a\xE7\u0131k de\u011Fildir: i\u015F plan\u0131n\u0131n kendisidir ve yaln\u0131zca i\xE7 s\xFCr\xFCm bas\u0131labilir. --edition internal kullan\u0131n."
};
var FULL_BOOK_TEXT = { en: en7, fa: fa7, tr: tr7 };
function fullBookText(lang) {
  return FULL_BOOK_TEXT[lang];
}
function entryLabel(lang, id, fallback) {
  return FULL_BOOK_TEXT[lang].labels[id] ?? fallback;
}

// packages/brand-core/src/visual/fixtures-full-book.ts
var APPROVED_AT3 = "2026-10-02T09:00:00.000Z";
var FIXTURE_DRAFT_SENTINEL = "DRAFT-SENTINEL never printed";
var FIXTURE_RESTRICTED_SENTINEL = "RESTRICTED-SENTINEL 4,200,000";
function entry(row, lang, audience) {
  const approved = row.state === "approved" || row.state === "stale";
  const state2 = audience === "public" && !approved ? "missing" : row.state;
  const value2 = typeof row.value === "string" ? row.value : row.value?.[lang] ?? null;
  return {
    id: row.id,
    label: row.label,
    state: state2,
    value: state2 === "missing" || state2 === "withheld" || state2 === "not_applicable" ? null : value2,
    sources: [`fixture:${row.id}`],
    version: approved ? row.version ?? 1 : null,
    approved_at: approved ? APPROVED_AT3 : null,
    review_due: row.state === "stale" ? "2026-11-01T00:00:00.000Z" : null,
    note: row.state === "assumption" ? "Owner draft. Not approved." : row.state === "withheld" ? "Restricted. Approved, but the value is never shown in a document." : null,
    missing_reason: state2 === "missing" ? audience === "public" ? "not_published" : "unanswered" : null
  };
}
var v = (en8, fa8, tr8) => ({ en: en8, fa: fa8, tr: tr8 });
var BRAND_BOOK_ROWS = {
  overview: [
    { id: "business.identity.trade_name", label: "Trade name", state: "approved", value: ILLUSTRATIVE_BRAND.name, version: 1 },
    { id: "brand.verbal.tagline", label: "Tagline", state: "approved", version: 2, value: v("Ten minutes a day, a new language for life.", "\u0631\u0648\u0632\u06CC \u062F\u0647 \u062F\u0642\u06CC\u0642\u0647\u060C \u06CC\u06A9 \u0632\u0628\u0627\u0646 \u062A\u0627\u0632\u0647 \u0628\u0631\u0627\u06CC \u0647\u0645\u06CC\u0634\u0647.", "G\xFCnde on dakika, \xF6m\xFCr boyu yeni bir dil.") },
    { id: "business.offer.summary", label: "Offer", state: "approved", version: 3, value: v("A mobile course that teaches conversation through short daily dialogues with a friendly tutor character.", "\u062F\u0648\u0631\u0647\u0654 \u0645\u0648\u0628\u0627\u06CC\u0644\u06CC \u06A9\u0647 \u0628\u0627 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u0648 \u06CC\u06A9 \u0634\u062E\u0635\u06CC\u062A \u0645\u0639\u0644\u0645 \u0645\u0647\u0631\u0628\u0627\u0646\u060C \u0645\u06A9\u0627\u0644\u0645\u0647 \u06CC\u0627\u062F \u0645\u06CC\u200C\u062F\u0647\u062F.", "K\u0131sa g\xFCnl\xFCk diyaloglar ve sevimli bir \xF6\u011Fretmen karakteriyle konu\u015Fma \xF6\u011Freten bir mobil kurs.") },
    { id: "business.customer.primary_segment", label: "Primary customer", state: "approved", version: 1, value: v("Busy adults aged 25\u201345 who relocate for work.", "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u067E\u0631\u0645\u0634\u063A\u0644\u0647\u0654 \u06F2\u06F5 \u062A\u0627 \u06F4\u06F5 \u0633\u0627\u0644\u0647 \u06A9\u0647 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631 \u0645\u0647\u0627\u062C\u0631\u062A \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.", "\u0130\u015F i\xE7in ta\u015F\u0131nan 25\u201345 ya\u015F aras\u0131 yo\u011Fun yeti\u015Fkinler.") }
  ],
  strategy: [
    { id: "brand.strategy.purpose", label: "Purpose", state: "approved", version: 2, value: v("Make starting a life in a new country less lonely.", "\u0634\u0631\u0648\u0639 \u0632\u0646\u062F\u06AF\u06CC \u062F\u0631 \u06A9\u0634\u0648\u0631\u06CC \u062A\u0627\u0632\u0647 \u0631\u0627 \u06A9\u0645\u062A\u0631 \u062A\u0646\u0647\u0627 \u06A9\u0646\u06CC\u0645.", "Yeni bir \xFClkede hayata ba\u015Flamay\u0131 daha az yaln\u0131z k\u0131lmak.") },
    { id: "brand.strategy.vision", label: "Vision", state: "assumption", value: FIXTURE_DRAFT_SENTINEL },
    { id: "brand.strategy.values", label: "Values", state: "approved", version: 1, value: v("Warmth over polish; progress over perfection; honest about effort.", "\u06AF\u0631\u0645\u06CC \u067E\u06CC\u0634 \u0627\u0632 \u0638\u0627\u0647\u0631\u061B \u067E\u06CC\u0634\u0631\u0641\u062A \u067E\u06CC\u0634 \u0627\u0632 \u06A9\u0645\u0627\u0644\u061B \u0635\u062F\u0627\u0642\u062A \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u062A\u0644\u0627\u0634.", "Cilal\u0131ktan \xF6nce s\u0131cakl\u0131k; m\xFCkemmellikten \xF6nce ilerleme; emek konusunda d\xFCr\xFCstl\xFCk.") },
    { id: "brand.strategy.differentiation", label: "Differentiation", state: "stale", version: 1, value: v("Dialogues are written for real errands (a bank, a clinic, a landlord), not tourist phrases.", "\u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u0647\u0627 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0647\u0627\u06CC \u0648\u0627\u0642\u0639\u06CC (\u0628\u0627\u0646\u06A9\u060C \u062F\u0631\u0645\u0627\u0646\u06AF\u0627\u0647\u060C \u0635\u0627\u062D\u0628\u200C\u062E\u0627\u0646\u0647) \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647\u200C\u0627\u0646\u062F\u060C \u0646\u0647 \u062C\u0645\u0644\u0647\u200C\u0647\u0627\u06CC \u062A\u0648\u0631\u06CC\u0633\u062A\u06CC.", "Diyaloglar turist c\xFCmleleri i\xE7in de\u011Fil, ger\xE7ek i\u015Fler (banka, klinik, ev sahibi) i\xE7in yaz\u0131l\u0131r.") },
    { id: "brand.strategy.promise", label: "Brand promise", state: "missing" }
  ],
  verbal: [
    { id: "brand.verbal.voice", label: "Tone of voice", state: "approved", version: 1, value: v("Calm, encouraging, plain words. Never sarcastic.", "\u0622\u0631\u0627\u0645\u060C \u062F\u0644\u06AF\u0631\u0645\u200C\u06A9\u0646\u0646\u062F\u0647\u060C \u0648\u0627\u0698\u0647\u200C\u0647\u0627\u06CC \u0633\u0627\u062F\u0647. \u0647\u0631\u06AF\u0632 \u0637\u0639\u0646\u0647\u200C\u0622\u0645\u06CC\u0632 \u0646\u06CC\u0633\u062A.", "Sakin, cesaretlendirici, sade kelimeler. Asla alayc\u0131 de\u011Fil.") },
    { id: "brand.verbal.forbidden", label: "Forbidden language", state: "approved", version: 1, value: v('"Fluent in 7 days", "guaranteed", "native-like".', "\xAB\u0645\u0633\u0644\u0637 \u062F\u0631 \u06F7 \u0631\u0648\u0632\xBB\u060C \xAB\u062A\u0636\u0645\u06CC\u0646\u06CC\xBB\u060C \xAB\u0645\u062B\u0644 \u0632\u0628\u0627\u0646 \u0645\u0627\u062F\u0631\u06CC\xBB.", '"7 g\xFCnde ak\u0131c\u0131", "garantili", "ana dili gibi".') },
    { id: "brand.verbal.microcopy", label: "Microcopy principle", state: "missing" }
  ],
  color: [{ id: "brand.color.contrast", label: "Contrast target", state: "approved", version: 1, value: v("Body text at least 4.5:1 against its background.", "\u0645\u062A\u0646 \u0628\u062F\u0646\u0647 \u062F\u0633\u062A\u200C\u06A9\u0645 \u06F4\u066B\u06F5 \u0628\u0647 \u06F1 \u0646\u0633\u0628\u062A \u0628\u0647 \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647.", "G\xF6vde metni arka plana kar\u015F\u0131 en az 4,5:1.") }],
  type: [{ id: "brand.type.rtl", label: "RTL and locales", state: "approved", version: 1, value: v("Persian is set in Vazirmatn, right to left.", "\u0641\u0627\u0631\u0633\u06CC \u0628\u0627 \u0648\u0632\u06CC\u0631\u0645\u062A\u0646 \u0648 \u0631\u0627\u0633\u062A\u200C\u0628\u0647\u200C\u0686\u067E \u062D\u0631\u0648\u0641\u200C\u0686\u06CC\u0646\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F.", "Fars\xE7a Vazirmatn ile sa\u011Fdan sola dizilir.") }],
  logo: [{ id: "brand.logo.misuse", label: "Misuse rules", state: "missing" }],
  governance: [
    { id: "brand.gov.approver", label: "Brand approver", state: "missing" },
    { id: "brand.gov.versioning", label: "Versioning", state: "assumption", value: FIXTURE_DRAFT_SENTINEL }
  ]
};
var REPORT_ROWS = {
  "executive-summary": [
    { id: "business.identity.trade_name", label: "Trade name", state: "approved", value: ILLUSTRATIVE_BRAND.name, version: 1 },
    { id: "business.offer.summary", label: "Offer", state: "approved", version: 3, value: v("A mobile course that teaches conversation through short daily dialogues with a friendly tutor character.", "\u062F\u0648\u0631\u0647\u0654 \u0645\u0648\u0628\u0627\u06CC\u0644\u06CC \u06A9\u0647 \u0628\u0627 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u0648 \u06CC\u06A9 \u0634\u062E\u0635\u06CC\u062A \u0645\u0639\u0644\u0645 \u0645\u0647\u0631\u0628\u0627\u0646\u060C \u0645\u06A9\u0627\u0644\u0645\u0647 \u06CC\u0627\u062F \u0645\u06CC\u200C\u062F\u0647\u062F.", "K\u0131sa g\xFCnl\xFCk diyaloglar ve sevimli bir \xF6\u011Fretmen karakteriyle konu\u015Fma \xF6\u011Freten bir mobil kurs.") },
    { id: "business.stage.current", label: "Operating stage", state: "approved", version: 1, value: v("Paid pilot with two partner firms.", "\u0622\u0632\u0645\u0627\u06CC\u0634 \u067E\u0648\u0644\u06CC \u0628\u0627 \u062F\u0648 \u0634\u0631\u06A9\u062A \u0647\u0645\u06A9\u0627\u0631.", "\u0130ki ortak firmayla \xFCcretli pilot.") },
    { id: "business.plan.milestone", label: "Next milestone", state: "assumption", value: FIXTURE_DRAFT_SENTINEL }
  ],
  "customer-problem": [
    { id: "business.customer.primary_segment", label: "Primary customer", state: "approved", version: 1, value: v("Busy adults aged 25\u201345 who relocate for work.", "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u067E\u0631\u0645\u0634\u063A\u0644\u0647\u0654 \u06F2\u06F5 \u062A\u0627 \u06F4\u06F5 \u0633\u0627\u0644\u0647 \u06A9\u0647 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631 \u0645\u0647\u0627\u062C\u0631\u062A \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.", "\u0130\u015F i\xE7in ta\u015F\u0131nan 25\u201345 ya\u015F aras\u0131 yo\u011Fun yeti\u015Fkinler.") },
    { id: "business.problem.pains", label: "Customer pains", state: "approved", version: 2, value: v("No time for classes; textbook phrases fail at real appointments.", "\u0648\u0642\u062A\u06CC \u0628\u0631\u0627\u06CC \u06A9\u0644\u0627\u0633 \u0646\u06CC\u0633\u062A\u061B \u062C\u0645\u0644\u0647\u200C\u0647\u0627\u06CC \u06A9\u062A\u0627\u0628\u06CC \u062F\u0631 \u0642\u0631\u0627\u0631\u0647\u0627\u06CC \u0648\u0627\u0642\u0639\u06CC \u06A9\u0627\u0631 \u0646\u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.", "Ders i\xE7in zaman yok; ders kitab\u0131 c\xFCmleleri ger\xE7ek randevularda i\u015Fe yaram\u0131yor.") },
    { id: "business.market.geography", label: "Geography", state: "missing" }
  ],
  "business-model": [
    { id: "business.model.revenue", label: "Revenue model", state: "approved", version: 1, value: v("Monthly subscription; team seats sold through partners.", "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0627\u0647\u0627\u0646\u0647\u061B \u0635\u0646\u062F\u0644\u06CC\u200C\u0647\u0627\u06CC \u062A\u06CC\u0645\u06CC \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0647\u0645\u06A9\u0627\u0631\u0627\u0646 \u0641\u0631\u0648\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.", "Ayl\u0131k abonelik; ekip koltuklar\u0131 ortaklar \xFCzerinden sat\u0131l\u0131r.") },
    { id: "business.sales.pricing", label: "Pricing summary", state: "missing" }
  ],
  product: [{ id: "business.product.mvp", label: "MVP boundary", state: "approved", version: 1, value: v("Three languages, forty dialogues each, offline audio.", "\u0633\u0647 \u0632\u0628\u0627\u0646\u060C \u0647\u0631 \u06A9\u062F\u0627\u0645 \u0686\u0647\u0644 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u060C \u0635\u062F\u0627\u06CC \u0622\u0641\u0644\u0627\u06CC\u0646.", "\xDC\xE7 dil, her biri k\u0131rk diyalog, \xE7evrimd\u0131\u015F\u0131 ses.") }],
  financials: [
    { id: "business.finance.currency", label: "Reporting currency", state: "approved", version: 1, value: "EUR" },
    { id: "business.finance.revenue_figure", label: "Revenue figure", state: "withheld", value: FIXTURE_RESTRICTED_SENTINEL },
    { id: "business.finance.runway", label: "Runway", state: "withheld", value: FIXTURE_RESTRICTED_SENTINEL }
  ],
  goals: [
    { id: "business.goals.annual", label: "Annual objective", state: "missing" },
    { id: "business.goals.north_star", label: "North star definition", state: "assumption", value: FIXTURE_DRAFT_SENTINEL }
  ],
  risks: [{ id: "business.plan.risks", label: "Top risks", state: "approved", version: 1, value: v("Partner concentration: two partners bring most team seats.", "\u062A\u0645\u0631\u06A9\u0632 \u0647\u0645\u06A9\u0627\u0631: \u0628\u06CC\u0634\u062A\u0631 \u0635\u0646\u062F\u0644\u06CC\u200C\u0647\u0627\u06CC \u062A\u06CC\u0645\u06CC \u0627\u0632 \u062F\u0648 \u0647\u0645\u06A9\u0627\u0631 \u0645\u06CC\u200C\u0622\u06CC\u062F.", "Ortak yo\u011Funlu\u011Fu: ekip koltuklar\u0131n\u0131n \xE7o\u011Fu iki ortaktan geliyor.") }]
};
function illustrativeBook(kind, lang = "en", audience = "internal") {
  const rows2 = kind === "brand_book" ? BRAND_BOOK_ROWS : REPORT_ROWS;
  const sections = Object.fromEntries(Object.entries(rows2).map(([id, list]) => [id, list.map((row) => entry(row, lang, audience))]));
  return composeBook({
    kind,
    audience,
    brand_id: ILLUSTRATIVE_BRAND.id,
    brand_name: ILLUSTRATIVE_BRAND.name,
    illustrative: true,
    sections,
    identity: kind === "brand_book" ? illustrativeVisualIdentity(audience, "complete") : null,
    canvas: kind === "business_report" ? illustrativeBusinessModelCanvas(lang, audience) : null,
    mascot: "on",
    competitors: true
  });
}

// packages/brand-core/src/visual/plan.ts
var JOURNEY_QUESTION = "business.marketing.journey_stages";
var JOURNEY_HYPOTHESIS = "business.marketing.journey";
var SEGMENTS_QUESTION = "business.model.segments";
var OBJECTIVES_QUESTION = "business.goals.objectives";
var KEY_RESULTS_QUESTION = "business.goals.key_results";
var ANNUAL_OBJECTIVE = "business.goals.annual";
var SOSTAC_SPECS = [
  { stage: "situation", questions: ["business.stage.current", "business.customer.primary_segment", "business.problem.pains", "business.market.geography"], related: [JOURNEY_HYPOTHESIS, "business.plan.risks"] },
  { stage: "objectives", questions: [OBJECTIVES_QUESTION, "business.marketing.objective", ANNUAL_OBJECTIVE], related: ["business.goals.quarter", "business.goals.north_star"] },
  { stage: "strategy", questions: ["business.offer.value_proposition", "brand.strategy.differentiation", "business.marketing.pillars"], related: ["business.growth.loops"] },
  { stage: "tactics", questions: ["business.marketing.channels", "business.marketing.paid_media", "business.sales.motion"], related: ["business.marketing.utm", JOURNEY_QUESTION] },
  { stage: "action", questions: ["business.plan.milestone", "business.ops.tracker", "business.ops.roles"], related: ["business.growth.owner"] },
  { stage: "control", questions: [KEY_RESULTS_QUESTION, "business.goals.sources", "business.marketing.attribution", "business.goals.cadence"], related: ["business.goals.plan_vs_actual"] }
];
var PLAN_QUESTIONS = [.../* @__PURE__ */ new Set([JOURNEY_QUESTION, JOURNEY_HYPOTHESIS, SEGMENTS_QUESTION, OBJECTIVES_QUESTION, KEY_RESULTS_QUESTION, ANNUAL_OBJECTIVE, ...SOSTAC_SPECS.flatMap((spec) => spec.questions)])];
function absentEntry(id) {
  return { id, label: id, state: "missing", value: null, sources: [], version: null, approved_at: null, review_due: null, note: null, missing_reason: "unanswered", approved: false };
}
function publicEntry(entry2) {
  const { approved: _approved, ...rest } = entry2;
  void _approved;
  return rest;
}
function latest2(entries2) {
  const dates = entries2.map((entry2) => entry2.approved_at).filter((at) => typeof at === "string" && Number.isFinite(Date.parse(at)));
  return dates.length ? dates.reduce((a, b) => Date.parse(b) > Date.parse(a) ? b : a) : null;
}
function blockState(entries2) {
  if (entries2.length && entries2.every((entry2) => entry2.approved)) return "complete";
  return entries2.some((entry2) => entry2.value !== null || entry2.state === "withheld") ? "partial" : "missing";
}
function nextFor(ids, input) {
  const out = [];
  for (const id of ids) {
    const source2 = input.sources.get(id);
    if (!input.existing.has(id)) {
      if (entitySpec(id)) out.push({ id, kind: "proposed" });
      continue;
    }
    if (source2 && !source2.entry.approved && source2.entry.state !== "not_applicable" && !out.some((item) => item.id === source2.entry.id)) out.push({ id: source2.entry.id, kind: "existing" });
  }
  return out;
}
function unique(entries2) {
  const seen = /* @__PURE__ */ new Set();
  return entries2.filter((entry2) => seen.has(entry2.id) ? false : (seen.add(entry2.id), true));
}
function base2(input, kind, entries2, computedFrom) {
  return {
    block_id: kind,
    framework_id: FRAMEWORK_OF[kind],
    data_state: blockState(entries2),
    sources: [...new Set(entries2.flatMap((entry2) => entry2.sources))],
    as_of: latest2(entries2),
    computed_from: computedFrom,
    visibility: input.audience,
    renderer_variant: `${kind}.v1`,
    layout_constraints: { preserve_topology: kind !== "okr_tree", min_print_pt: 7, print_profile: "canvas_a3_landscape" }
  };
}
var FRAMEWORK_OF = { customer_journey: "CUSTOMER-JOURNEY-MAP", sostac_overview: "SOSTAC", okr_tree: "OKR" };
function documentOf(input, kind, block, entries2) {
  const summary = emptyStatusSummary();
  for (const entry2 of entries2) summary[entry2.state] += 1;
  const refs = [frameworkRef(FRAMEWORK_OF[kind])];
  return {
    schema: VISUAL_SCHEMA,
    schema_version: 1,
    document_kind: kind,
    brand_id: input.brand_id,
    brand_name: input.brand_name,
    audience: input.audience,
    illustrative: input.illustrative,
    origin: input.illustrative ? "illustrative_fixture" : "brand_repository",
    as_of: latest2(entries2),
    classification: input.audience === "public" ? "public" : "internal",
    print_profile: "canvas_a3_landscape",
    status_summary: summary,
    framework_refs: refs,
    blocks: [block]
  };
}
function source(input, id) {
  return input.sources.get(id) ?? { entry: absentEntry(id), items: null };
}
function field(item, key) {
  const value2 = item.fields[key];
  return value2 === void 0 || value2 === "" ? null : value2;
}
function num(item, key) {
  const value2 = field(item, key);
  if (value2 === null) return null;
  const parsed = Number(value2);
  return Number.isFinite(parsed) ? parsed : null;
}
function names(src) {
  return new Map((src.items ?? []).map((item) => [item.id, item.fields.name ?? ""]));
}
function linkOf(id, visible2) {
  return { id, name: visible2.get(id) ?? null };
}
function isLegacy(src) {
  return src.entry.legacy === true;
}
function journeyDocument(input) {
  const list = source(input, JOURNEY_QUESTION);
  const hypothesis = input.existing.has(JOURNEY_HYPOTHESIS) ? source(input, JOURNEY_HYPOTHESIS) : null;
  const segments = names(source(input, SEGMENTS_QUESTION));
  const stages = (list.items ?? []).map((item, index) => {
    const emotion = field(item, "emotion");
    return {
      id: item.id,
      order: index + 1,
      name: item.fields.name ?? "",
      goal: field(item, "goal"),
      lanes: { touchpoints: field(item, "touchpoints"), actions: field(item, "actions"), pains: field(item, "pains"), opportunities: field(item, "opportunities") },
      emotion: emotion && JOURNEY_EMOTIONS.includes(emotion) ? emotion : null,
      evidence: field(item, "evidence"),
      segments: item.links.map((id) => linkOf(id, segments))
    };
  });
  const entries2 = [list.entry, ...hypothesis ? [hypothesis.entry] : []];
  const block = {
    ...base2(input, "customer_journey", entries2, [JOURNEY_QUESTION, JOURNEY_HYPOTHESIS, SEGMENTS_QUESTION]),
    type: "journey_swimlane",
    source: publicEntry(list.entry),
    hypothesis: hypothesis ? publicEntry(hypothesis.entry) : null,
    stages,
    legacy: isLegacy(list),
    next_questions: nextFor([JOURNEY_QUESTION, JOURNEY_HYPOTHESIS], input)
  };
  return documentOf(input, "customer_journey", block, entries2.map(publicEntry));
}
function sostacDocument(input) {
  const all = [];
  const sections = SOSTAC_SPECS.map((spec, index) => {
    const entries2 = unique(spec.questions.filter((id) => input.existing.has(id)).map((id) => source(input, id).entry));
    all.push(...entries2);
    return {
      stage: spec.stage,
      order: index + 1,
      state: zoneState(entries2, entries2.length === 0),
      entries: entries2.map(publicEntry),
      next_questions: nextFor(spec.questions, input),
      related: spec.related.filter((id) => input.existing.has(id))
    };
  });
  if (sections.map((section) => section.stage).join() !== SOSTAC_STAGES.join()) throw new Error("SOSTAC stages out of order");
  const block = { ...base2(input, "sostac_overview", all, SOSTAC_SPECS.flatMap((spec) => spec.questions)), type: "sostac_overview", sections };
  return documentOf(input, "sostac_overview", block, all.map(publicEntry));
}
function keyResultOf(item, objectives) {
  const target = num(item, "target");
  const unit = field(item, "unit");
  const src = field(item, "source");
  if (target === null || unit === null || src === null) return null;
  const current = num(item, "current");
  const baseline = num(item, "baseline");
  const measure = current === null ? "not_measured" : baseline === null ? "no_baseline" : "measured";
  const progress = measure === "measured" && target !== baseline ? (current - baseline) / (target - baseline) : null;
  const link = item.links[0];
  return {
    id: item.id,
    name: item.fields.name ?? "",
    target,
    current,
    baseline,
    unit,
    source: src,
    measured_on: field(item, "measured_on"),
    measure,
    progress,
    objective: link ? linkOf(link, objectives) : null
  };
}
function okrDocument(input) {
  const objectivesSrc = source(input, OBJECTIVES_QUESTION);
  const resultsSrc = source(input, KEY_RESULTS_QUESTION);
  const root = input.existing.has(ANNUAL_OBJECTIVE) ? source(input, ANNUAL_OBJECTIVE) : null;
  const visible2 = names(objectivesSrc);
  const results = (resultsSrc.items ?? []).map((item) => keyResultOf(item, visible2)).filter((kr) => kr !== null);
  const objectives = (objectivesSrc.items ?? []).map((item) => ({
    id: item.id,
    name: item.fields.name ?? "",
    detail: field(item, "detail"),
    period: field(item, "period"),
    key_results: results.filter((kr) => kr.objective?.id === item.id)
  }));
  const unlinked = results.filter((kr) => !kr.objective || !visible2.has(kr.objective.id));
  const entries2 = unique([objectivesSrc.entry, resultsSrc.entry, ...root ? [root.entry] : []]);
  const block = {
    ...base2(input, "okr_tree", entries2, [OBJECTIVES_QUESTION, KEY_RESULTS_QUESTION, ANNUAL_OBJECTIVE]),
    type: "okr_tree",
    root: root ? publicEntry(root.entry) : null,
    objectives_source: publicEntry(objectivesSrc.entry),
    key_results_source: publicEntry(resultsSrc.entry),
    objectives,
    unlinked,
    legacy: { objectives: isLegacy(objectivesSrc), key_results: isLegacy(resultsSrc) },
    next_questions: nextFor([OBJECTIVES_QUESTION, KEY_RESULTS_QUESTION, ANNUAL_OBJECTIVE], input)
  };
  return documentOf(input, "okr_tree", block, entries2.map(publicEntry));
}
function planSources(engine, audience, options = {}) {
  const root = engine.workspaceRoot();
  const config = engine.config();
  const brandId = config.brand.slug;
  const now = options.now ?? /* @__PURE__ */ new Date();
  const facts = readFacts(root, "approved", brandId);
  const answers = latestAnswers(engine.ledger().records);
  const context = { facts, answers, audience, root, brandId, evidence: readEvidence(root), now };
  const existing2 = new Set(engine.questions().map((question) => question.id));
  const applicability = brandApplicability(engine);
  const sources = /* @__PURE__ */ new Map();
  for (const id of PLAN_QUESTIONS) {
    if (!engine.question(id)) continue;
    const ref = applicability.refs(id)[0];
    const entry2 = ref ? frameworkEntry(engine, context, ref, now) : null;
    if (!entry2) continue;
    const visible2 = entry2.value !== null && entry2.state !== "withheld" && !entry2.legacy;
    const question = visible2 ? engine.question(entry2.id) : void 0;
    const structured = question ? itemFor(question, context).structured : null;
    const items = structured?.type === "repeating_entity" ? structured.items.map((one) => ({ id: one.id, fields: { ...one.fields }, links: [...one.links] })) : null;
    sources.set(id, { entry: entry2, items });
  }
  return { brand_id: brandId, brand_name: String(config.brand.name ?? brandId), audience, illustrative: false, sources, existing: existing2 };
}
function buildPlanDocuments(engine, audience, options = {}) {
  const input = planSources(engine, audience, options);
  return { journey: journeyDocument(input), sostac: sostacDocument(input), okr: okrDocument(input) };
}

// packages/brand-core/src/visual/fixtures-plan.ts
var APPROVED_AT4 = "2026-10-02T09:00:00.000Z";
var LATER = "2026-11-12T09:00:00.000Z";
function t(en8, fa8, tr8) {
  return { en: en8, fa: fa8, tr: tr8 };
}
var FIXTURE2 = [
  {
    id: "business.model.segments",
    label: "Customer segments",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT4,
    items: [
      { id: "seg-1", fields: { priority: "primary" }, text: { en: { name: "Working adults changing jobs" }, fa: { name: "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u062F\u0631 \u062D\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644" }, tr: { name: "\u0130\u015F de\u011Fi\u015Ftiren \xE7al\u0131\u015Fan yeti\u015Fkinler" } } },
      { id: "seg-2", fields: { priority: "secondary" }, text: { en: { name: "Employers buying team seats" }, fa: { name: "\u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646\u06CC \u06A9\u0647 \u0635\u0646\u062F\u0644\u06CC \u062A\u06CC\u0645\u06CC \u0645\u06CC\u200C\u062E\u0631\u0646\u062F" }, tr: { name: "Ekip koltu\u011Fu sat\u0131n alan i\u015Fverenler" } } }
    ]
  },
  {
    id: "business.marketing.journey_stages",
    label: "Customer journey stages",
    state: "approved",
    version: 2,
    approved_at: LATER,
    items: [
      {
        id: "stage-1",
        fields: { emotion: "neutral" },
        links: ["seg-1"],
        text: {
          en: { name: "Discover", goal: "Find a course that fits a busy week", touchpoints: "Search, a friend\u2019s post", actions: "Reads two reviews", pains: "Too many similar apps", opportunities: "A one-line promise on the first screen", evidence: "12 owner interviews" },
          fa: { name: "\u06A9\u0634\u0641", goal: "\u067E\u06CC\u062F\u0627 \u06A9\u0631\u062F\u0646 \u062F\u0648\u0631\u0647\u200C\u0627\u06CC \u06A9\u0647 \u0628\u0627 \u0647\u0641\u062A\u0647\u0654 \u0634\u0644\u0648\u063A \u062C\u0648\u0631 \u0628\u0627\u0634\u062F", touchpoints: "\u062C\u0633\u062A\u200C\u0648\u062C\u0648\u060C \u067E\u0633\u062A \u06CC\u06A9 \u062F\u0648\u0633\u062A", actions: "\u062F\u0648 \u0646\u0642\u062F \u0631\u0627 \u0645\u06CC\u200C\u062E\u0648\u0627\u0646\u062F", pains: "\u0627\u067E\u200C\u0647\u0627\u06CC \u0645\u0634\u0627\u0628\u0647 \u0632\u06CC\u0627\u062F", opportunities: "\u06CC\u06A9 \u0648\u0639\u062F\u0647\u0654 \u06CC\u06A9\u200C\u062E\u0637\u06CC \u062F\u0631 \u0635\u0641\u062D\u0647\u0654 \u0627\u0648\u0644", evidence: "\u06F1\u06F2 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u06CC \u0645\u0627\u0644\u06A9" },
          tr: { name: "Ke\u015Fif", goal: "Yo\u011Fun bir haftaya uyan bir kurs bulmak", touchpoints: "Arama, bir arkada\u015F\u0131n payla\u015F\u0131m\u0131", actions: "\u0130ki yorum okuyor", pains: "\xC7ok say\u0131da benzer uygulama", opportunities: "\u0130lk ekranda tek sat\u0131rl\u0131k bir vaat", evidence: "Sahibin 12 g\xF6r\xFC\u015Fmesi" }
        }
      },
      {
        id: "stage-2",
        fields: { emotion: "negative" },
        links: ["seg-1", "seg-2"],
        text: {
          en: { name: "Compare", goal: "Know the real price", touchpoints: "Pricing page", actions: "Opens three tabs", pains: "Price only after sign-up" },
          fa: { name: "\u0645\u0642\u0627\u06CC\u0633\u0647", goal: "\u062F\u0627\u0646\u0633\u062A\u0646 \u0642\u06CC\u0645\u062A \u0648\u0627\u0642\u0639\u06CC", touchpoints: "\u0635\u0641\u062D\u0647\u0654 \u0642\u06CC\u0645\u062A", actions: "\u0633\u0647 \u0632\u0628\u0627\u0646\u0647 \u0628\u0627\u0632 \u0645\u06CC\u200C\u06A9\u0646\u062F", pains: "\u0642\u06CC\u0645\u062A \u0641\u0642\u0637 \u0628\u0639\u062F \u0627\u0632 \u062B\u0628\u062A\u200C\u0646\u0627\u0645" },
          tr: { name: "Kar\u015F\u0131la\u015Ft\u0131rma", goal: "Ger\xE7ek fiyat\u0131 \xF6\u011Frenmek", touchpoints: "Fiyat sayfas\u0131", actions: "\xDC\xE7 sekme a\xE7\u0131yor", pains: "Fiyat ancak kay\u0131ttan sonra" }
        }
      },
      {
        id: "stage-3",
        fields: { emotion: "positive" },
        text: {
          en: { name: "Sign up", goal: "Start in under a minute", touchpoints: "App store, onboarding", actions: "Picks a goal", opportunities: "Skip the long placement test" },
          fa: { name: "\u062B\u0628\u062A\u200C\u0646\u0627\u0645", goal: "\u0634\u0631\u0648\u0639 \u062F\u0631 \u06A9\u0645\u062A\u0631 \u0627\u0632 \u06CC\u06A9 \u062F\u0642\u06CC\u0642\u0647", touchpoints: "\u0641\u0631\u0648\u0634\u06AF\u0627\u0647 \u0627\u067E\u060C \u0622\u0634\u0646\u0627\u06CC\u06CC \u0627\u0648\u0644\u06CC\u0647", actions: "\u06CC\u06A9 \u0647\u062F\u0641 \u0627\u0646\u062A\u062E\u0627\u0628 \u0645\u06CC\u200C\u06A9\u0646\u062F", opportunities: "\u062D\u0630\u0641 \u0622\u0632\u0645\u0648\u0646 \u062A\u0639\u06CC\u06CC\u0646 \u0633\u0637\u062D \u0637\u0648\u0644\u0627\u0646\u06CC" },
          tr: { name: "Kay\u0131t", goal: "Bir dakikadan k\u0131sa s\xFCrede ba\u015Flamak", touchpoints: "Uygulama ma\u011Fazas\u0131, ilk kullan\u0131m", actions: "Bir hedef se\xE7iyor", opportunities: "Uzun seviye testini atlamak" }
        }
      },
      {
        id: "stage-4",
        fields: { emotion: "very_negative" },
        text: {
          en: { name: "First week", goal: "Keep a daily habit", touchpoints: "Push reminder, lesson", actions: "Misses day three", pains: "Reminders at the wrong hour", opportunities: "Let the learner pick the reminder time" },
          fa: { name: "\u0647\u0641\u062A\u0647\u0654 \u0627\u0648\u0644", goal: "\u062D\u0641\u0638 \u0639\u0627\u062F\u062A \u0631\u0648\u0632\u0627\u0646\u0647", touchpoints: "\u06CC\u0627\u062F\u0622\u0648\u0631\u060C \u062F\u0631\u0633", actions: "\u0631\u0648\u0632 \u0633\u0648\u0645 \u0631\u0627 \u0627\u0632 \u062F\u0633\u062A \u0645\u06CC\u200C\u062F\u0647\u062F", pains: "\u06CC\u0627\u062F\u0622\u0648\u0631 \u062F\u0631 \u0633\u0627\u0639\u062A \u0646\u0627\u0645\u0646\u0627\u0633\u0628", opportunities: "\u0627\u0646\u062A\u062E\u0627\u0628 \u0633\u0627\u0639\u062A \u06CC\u0627\u062F\u0622\u0648\u0631 \u0628\u0627 \u062E\u0648\u062F \u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u0647" },
          tr: { name: "\u0130lk hafta", goal: "G\xFCnl\xFCk al\u0131\u015Fkanl\u0131\u011F\u0131 s\xFCrd\xFCrmek", touchpoints: "Hat\u0131rlatma bildirimi, ders", actions: "\xDC\xE7\xFCnc\xFC g\xFCn\xFC ka\xE7\u0131r\u0131yor", pains: "Yanl\u0131\u015F saatte gelen hat\u0131rlatmalar", opportunities: "Hat\u0131rlatma saatini \xF6\u011Frenci se\xE7sin" }
        }
      },
      {
        id: "stage-5",
        fields: { emotion: "very_positive" },
        links: ["seg-9"],
        text: {
          en: { name: "Recommend", goal: "Share a visible win", touchpoints: "Certificate, share card", actions: "Posts a streak", opportunities: "A team invite after week four" },
          fa: { name: "\u062A\u0648\u0635\u06CC\u0647", goal: "\u0628\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u06AF\u0630\u0627\u0634\u062A\u0646 \u06CC\u06A9 \u0645\u0648\u0641\u0642\u06CC\u062A", touchpoints: "\u06AF\u0648\u0627\u0647\u06CC\u060C \u06A9\u0627\u0631\u062A \u0627\u0634\u062A\u0631\u0627\u06A9", actions: "\u0631\u06A9\u0648\u0631\u062F \u0631\u0648\u0632\u0647\u0627\u06CC \u067E\u06CC\u0627\u067E\u06CC \u0631\u0627 \u0645\u0646\u062A\u0634\u0631 \u0645\u06CC\u200C\u06A9\u0646\u062F", opportunities: "\u062F\u0639\u0648\u062A \u062A\u06CC\u0645\u06CC \u0628\u0639\u062F \u0627\u0632 \u0647\u0641\u062A\u0647\u0654 \u0686\u0647\u0627\u0631\u0645" },
          tr: { name: "Tavsiye", goal: "G\xF6r\xFCn\xFCr bir ba\u015Far\u0131y\u0131 payla\u015Fmak", touchpoints: "Sertifika, payla\u015F\u0131m kart\u0131", actions: "Seri g\xFCn\xFCn\xFC payla\u015F\u0131yor", opportunities: "D\xF6rd\xFCnc\xFC haftadan sonra ekip daveti" }
        }
      }
    ]
  },
  {
    id: "business.marketing.journey",
    label: "Journey hypothesis",
    state: "assumption",
    value: t(
      "Awareness comes from friends; conversion breaks at the price page; retention is unmeasured.",
      "\u0622\u06AF\u0627\u0647\u06CC \u0627\u0632 \u0631\u0627\u0647 \u062F\u0648\u0633\u062A\u0627\u0646 \u0645\u06CC\u200C\u0622\u06CC\u062F\u061B \u062A\u0628\u062F\u06CC\u0644 \u062F\u0631 \u0635\u0641\u062D\u0647\u0654 \u0642\u06CC\u0645\u062A \u0645\u06CC\u200C\u0634\u06A9\u0646\u062F\u061B \u0646\u06AF\u0647\u062F\u0627\u0634\u062A \u0647\u0646\u0648\u0632 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
      "Fark\u0131ndal\u0131k arkada\u015Flardan geliyor; d\xF6n\xFC\u015F\xFCm fiyat sayfas\u0131nda k\u0131r\u0131l\u0131yor; elde tutma \xF6l\xE7\xFClmedi."
    )
  },
  {
    id: "business.goals.annual",
    label: "Annual objective",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT4,
    value: t("Prove that working adults finish a course on their phone.", "\u062B\u0627\u0628\u062A \u06A9\u0646\u06CC\u0645 \u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u06CC\u06A9 \u062F\u0648\u0631\u0647 \u0631\u0627 \u0631\u0648\u06CC \u06AF\u0648\u0634\u06CC \u062A\u0645\u0627\u0645 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.", "\xC7al\u0131\u015Fan yeti\u015Fkinlerin bir kursu telefonda bitirdi\u011Fini kan\u0131tlamak.")
  },
  {
    id: "business.goals.objectives",
    label: "Objectives (OKR)",
    state: "approved",
    version: 1,
    approved_at: APPROVED_AT4,
    items: [
      { id: "obj-1", fields: { period: "2027 Q1" }, text: { en: { name: "Learners build a daily habit", detail: "Retention before growth" }, fa: { name: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u06AF\u0627\u0646 \u0639\u0627\u062F\u062A \u0631\u0648\u0632\u0627\u0646\u0647 \u0628\u0633\u0627\u0632\u0646\u062F", detail: "\u0646\u06AF\u0647\u062F\u0627\u0634\u062A \u067E\u06CC\u0634 \u0627\u0632 \u0631\u0634\u062F" }, tr: { name: "\xD6\u011Frenciler g\xFCnl\xFCk al\u0131\u015Fkanl\u0131k kazans\u0131n", detail: "B\xFCy\xFCmeden \xF6nce elde tutma" } } },
      { id: "obj-2", fields: { period: "2027 Q1" }, text: { en: { name: "Employers see value in team seats" }, fa: { name: "\u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646 \u0627\u0631\u0632\u0634 \u0635\u0646\u062F\u0644\u06CC \u062A\u06CC\u0645\u06CC \u0631\u0627 \u0628\u0628\u06CC\u0646\u0646\u062F" }, tr: { name: "\u0130\u015Fverenler ekip koltuklar\u0131n\u0131n de\u011Ferini g\xF6rs\xFCn" } } },
      { id: "obj-3", fields: { period: "2027 Q2" }, text: { en: { name: "A clear price before sign-up" }, fa: { name: "\u0642\u06CC\u0645\u062A \u0631\u0648\u0634\u0646 \u067E\u06CC\u0634 \u0627\u0632 \u062B\u0628\u062A\u200C\u0646\u0627\u0645" }, tr: { name: "Kay\u0131ttan \xF6nce net fiyat" } } }
    ]
  },
  {
    id: "business.goals.key_results",
    label: "Key results (OKR)",
    state: "assumption",
    items: [
      { id: "kr-1", fields: { target: "40", current: "26", baseline: "12", measured_on: "2026-11-20" }, links: ["obj-1"], text: { en: { name: "Learners active on 5 of 7 days", unit: "%", source: "Product analytics" }, fa: { name: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u06AF\u0627\u0646 \u0641\u0639\u0627\u0644 \u062F\u0631 \u06F5 \u0631\u0648\u0632 \u0627\u0632 \u06F7 \u0631\u0648\u0632", unit: "\u066A", source: "\u062A\u062D\u0644\u06CC\u0644 \u0645\u062D\u0635\u0648\u0644" }, tr: { name: "7 g\xFCn\xFCn 5\u2019inde aktif \xF6\u011Frenciler", unit: "%", source: "\xDCr\xFCn analiti\u011Fi" } } },
      { id: "kr-2", fields: { target: "20", current: "6" }, links: ["obj-1"], text: { en: { name: "Learners finishing week one", unit: "learners", source: "Lesson log" }, fa: { name: "\u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u06AF\u0627\u0646\u06CC \u06A9\u0647 \u0647\u0641\u062A\u0647\u0654 \u0627\u0648\u0644 \u0631\u0627 \u062A\u0645\u0627\u0645 \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F", unit: "\u0646\u0641\u0631", source: "\u06AF\u0632\u0627\u0631\u0634 \u062F\u0631\u0633\u200C\u0647\u0627" }, tr: { name: "\u0130lk haftay\u0131 bitiren \xF6\u011Frenciler", unit: "\xF6\u011Frenci", source: "Ders kayd\u0131" } } },
      { id: "kr-3", fields: { target: "3" }, links: ["obj-2"], text: { en: { name: "Employer pilots signed", unit: "pilots", source: "Sales tracker" }, fa: { name: "\u067E\u0627\u06CC\u0644\u0648\u062A\u200C\u0647\u0627\u06CC \u0627\u0645\u0636\u0627\u0634\u062F\u0647 \u0628\u0627 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646", unit: "\u067E\u0627\u06CC\u0644\u0648\u062A", source: "\u0631\u062F\u06CC\u0627\u0628 \u0641\u0631\u0648\u0634" }, tr: { name: "\u0130mzalanan i\u015Fveren pilotlar\u0131", unit: "pilot", source: "Sat\u0131\u015F takibi" } } },
      { id: "kr-4", fields: { target: "5", current: "4", baseline: "9", measured_on: "2026-11-18" }, links: ["obj-3"], text: { en: { name: "Support questions about price per week", unit: "questions", source: "Help desk" }, fa: { name: "\u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u062F\u0631\u0628\u0627\u0631\u0647\u0654 \u0642\u06CC\u0645\u062A \u062F\u0631 \u0647\u0641\u062A\u0647", unit: "\u067E\u0631\u0633\u0634", source: "\u0645\u06CC\u0632 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC" }, tr: { name: "Haftal\u0131k fiyat sorular\u0131", unit: "soru", source: "Destek masas\u0131" } } },
      { id: "kr-5", fields: { target: "2", current: "1", baseline: "0" }, links: ["obj-9"], text: { en: { name: "Partner channels live", unit: "channels", source: "Partner list" }, fa: { name: "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627\u06CC \u0634\u0631\u06CC\u06A9 \u0641\u0639\u0627\u0644", unit: "\u06A9\u0627\u0646\u0627\u0644", source: "\u0641\u0647\u0631\u0633\u062A \u0634\u0631\u06CC\u06A9\u0627\u0646" }, tr: { name: "Canl\u0131 ortak kanallar", unit: "kanal", source: "Ortak listesi" } } }
    ]
  },
  { id: "business.stage.current", label: "Business stage", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("Private beta", "\u0646\u0633\u062E\u0647\u0654 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u062E\u0635\u0648\u0635\u06CC", "\xD6zel beta") },
  { id: "business.customer.primary_segment", label: "Primary customer", state: "approved", version: 3, approved_at: APPROVED_AT4, value: t("Working adults changing jobs", "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u062F\u0631 \u062D\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644", "\u0130\u015F de\u011Fi\u015Ftiren \xE7al\u0131\u015Fan yeti\u015Fkinler") },
  { id: "business.problem.pains", label: "Customer pains", state: "stale", version: 1, approved_at: "2026-03-01T09:00:00.000Z", review_due: "2026-09-01", value: t("No time for classes; apps feel like games, not progress.", "\u0628\u0631\u0627\u06CC \u06A9\u0644\u0627\u0633 \u0648\u0642\u062A \u0646\u062F\u0627\u0631\u0646\u062F\u061B \u0627\u067E\u200C\u0647\u0627 \u062D\u0633 \u0628\u0627\u0632\u06CC \u0645\u06CC\u200C\u062F\u0647\u0646\u062F\u060C \u0646\u0647 \u067E\u06CC\u0634\u0631\u0641\u062A.", "Derse zaman yok; uygulamalar ilerleme de\u011Fil oyun gibi.") },
  { id: "business.market.geography", label: "Markets", state: "missing" },
  { id: "business.marketing.objective", label: "Marketing objective", state: "assumption", value: t("Learn whether the price page is the main drop-off.", "\u0628\u0641\u0647\u0645\u06CC\u0645 \u0622\u06CC\u0627 \u0635\u0641\u062D\u0647\u0654 \u0642\u06CC\u0645\u062A \u0627\u0635\u0644\u06CC\u200C\u062A\u0631\u06CC\u0646 \u0646\u0642\u0637\u0647\u0654 \u0631\u06CC\u0632\u0634 \u0627\u0633\u062A.", "Fiyat sayfas\u0131n\u0131n ana kay\u0131p noktas\u0131 olup olmad\u0131\u011F\u0131n\u0131 \xF6\u011Frenmek.") },
  { id: "business.offer.value_proposition", label: "Value proposition", state: "approved", version: 2, approved_at: APPROVED_AT4, value: t("Ten minutes a day, built around a real job move.", "\u0631\u0648\u0632\u06CC \u062F\u0647 \u062F\u0642\u06CC\u0642\u0647\u060C \u0633\u0627\u062E\u062A\u0647\u200C\u0634\u062F\u0647 \u062D\u0648\u0644 \u06CC\u06A9 \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644 \u0648\u0627\u0642\u0639\u06CC.", "G\xFCnde on dakika, ger\xE7ek bir i\u015F de\u011Fi\u015Fikli\u011Fi etraf\u0131nda.") },
  { id: "brand.strategy.differentiation", label: "Differentiation", state: "missing" },
  { id: "business.marketing.pillars", label: "Content pillars", state: "assumption", value: t("Career stories; five-minute grammar.", "\u062F\u0627\u0633\u062A\u0627\u0646\u200C\u0647\u0627\u06CC \u0634\u063A\u0644\u06CC\u061B \u062F\u0633\u062A\u0648\u0631 \u0632\u0628\u0627\u0646 \u067E\u0646\u062C\u200C\u062F\u0642\u06CC\u0642\u0647\u200C\u0627\u06CC.", "Kariyer hik\xE2yeleri; be\u015F dakikal\u0131k dilbilgisi.") },
  { id: "business.marketing.channels", label: "Channels", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("Founder posts and partner newsletters. No paid social.", "\u067E\u0633\u062A\u200C\u0647\u0627\u06CC \u0628\u0646\u06CC\u0627\u0646\u200C\u06AF\u0630\u0627\u0631 \u0648 \u062E\u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u0634\u0631\u06CC\u06A9\u0627\u0646. \u0628\u062F\u0648\u0646 \u062A\u0628\u0644\u06CC\u063A \u067E\u0648\u0644\u06CC \u062F\u0631 \u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC.", "Kurucu payla\u015F\u0131mlar\u0131 ve ortak b\xFCltenleri. \xDCcretli sosyal medya yok.") },
  { id: "business.marketing.paid_media", label: "Paid media", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("no", "no", "no") },
  { id: "business.sales.motion", label: "Sales motion", state: "missing" },
  { id: "business.plan.milestone", label: "Next milestone", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("Twenty learners finish week one.", "\u0628\u06CC\u0633\u062A \u06CC\u0627\u062F\u06AF\u06CC\u0631\u0646\u062F\u0647 \u0647\u0641\u062A\u0647\u0654 \u0627\u0648\u0644 \u0631\u0627 \u062A\u0645\u0627\u0645 \u06A9\u0646\u0646\u062F.", "Yirmi \xF6\u011Frenci ilk haftay\u0131 bitirsin.") },
  { id: "business.ops.tracker", label: "Task tracker", state: "assumption", value: t("A shared board in the team\u2019s tracker.", "\u06CC\u06A9 \u0628\u0631\u062F \u0645\u0634\u062A\u0631\u06A9 \u062F\u0631 \u0627\u0628\u0632\u0627\u0631 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u062A\u06CC\u0645.", "Ekibin takip arac\u0131nda ortak bir pano.") },
  { id: "business.ops.roles", label: "Roles", state: "missing" },
  { id: "business.goals.sources", label: "Metric sources", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("Product analytics; help desk.", "\u062A\u062D\u0644\u06CC\u0644 \u0645\u062D\u0635\u0648\u0644\u061B \u0645\u06CC\u0632 \u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC.", "\xDCr\xFCn analiti\u011Fi; destek masas\u0131.") },
  { id: "business.marketing.attribution", label: "Attribution", state: "approved", version: 1, approved_at: APPROVED_AT4, value: t("self-reported", "self-reported", "self-reported") },
  { id: "business.goals.cadence", label: "Review cadence", state: "assumption", value: t("Every second Friday.", "\u0647\u0631 \u062F\u0648 \u0647\u0641\u062A\u0647 \u06CC\u06A9\u200C\u0628\u0627\u0631\u060C \u062C\u0645\u0639\u0647.", "\u0130ki haftada bir cuma.") }
];
function itemsFor(source2, lang) {
  return (source2.items ?? []).map((item) => {
    const fields = {};
    for (const [key, value2] of Object.entries({ ...item.fields ?? {}, ...item.text[lang] })) if (value2 !== "") fields[key] = value2;
    return { id: item.id, fields, links: [...item.links ?? []] };
  });
}
function sourceFor(fixture, lang, edition, variant) {
  const approved = fixture.state === "approved" || fixture.state === "stale";
  const hidden = variant === "empty" || edition === "public" && !approved || fixture.state === "missing";
  const items = !hidden && fixture.items ? itemsFor(fixture, lang) : null;
  const value2 = hidden ? null : items ? items.map((item) => item.fields.name ?? "").join(" \xB7 ") : fixture.value?.[lang] ?? null;
  const entry2 = {
    id: fixture.id,
    label: fixture.label,
    state: hidden ? "missing" : fixture.state,
    value: value2,
    sources: hidden ? [] : [`fixture:${fixture.id}`],
    version: hidden ? null : fixture.version ?? null,
    approved_at: hidden || !approved ? null : fixture.approved_at ?? null,
    review_due: hidden || !approved ? null : fixture.review_due ?? null,
    note: hidden ? null : approved ? null : "Owner draft. Not approved.",
    missing_reason: hidden ? edition === "public" ? "not_published" : "unanswered" : null,
    ...items ? { items: items.map((item) => ({ id: item.id, name: item.fields.name ?? "", detail: item.fields.detail ?? item.fields.goal ?? null, tags: [], links: [...item.links] })) } : {},
    approved: !hidden && approved && fixture.state === "approved"
  };
  return { entry: entry2, items };
}
function fixtureInput(lang, edition, variant) {
  const sources = /* @__PURE__ */ new Map();
  for (const fixture of FIXTURE2) sources.set(fixture.id, sourceFor(fixture, lang, edition, variant));
  return { brand_id: ILLUSTRATIVE_BRAND.id, brand_name: ILLUSTRATIVE_BRAND.name, audience: edition, illustrative: true, sources, existing: new Set(PLAN_QUESTIONS) };
}
function illustrativeJourney(lang, edition = "internal", variant = "full") {
  return journeyDocument(fixtureInput(lang, edition, variant));
}
function illustrativeSostac(lang, edition = "internal", variant = "full") {
  return sostacDocument(fixtureInput(lang, edition, variant));
}
function illustrativeOkr(lang, edition = "internal", variant = "full") {
  return okrDocument(fixtureInput(lang, edition, variant));
}

// packages/brand-core/src/visual/strategy-lists.ts
var SWOT_AREAS = [
  { area: "strengths", question: "business.swot.strengths", related: ["brand.strategy.differentiation", "business.model.defensibility"] },
  { area: "weaknesses", question: "business.swot.weaknesses", related: ["business.plan.risks"] },
  { area: "opportunities", question: "business.swot.opportunities", related: ["business.market.geography"] },
  { area: "threats", question: "business.swot.threats", related: ["business.plan.risks", "business.partners.risk_process"] }
];
var TOWS_AREA = { area: "tows", question: "business.swot.tows", related: ["business.goals.quarter"] };
var VALUE_FIT_AREAS = [
  { area: "products_services", question: "business.fit.products", related: ["business.offer.summary"] },
  { area: "gain_creators", question: "business.fit.creators", related: ["business.offer.value_proposition"] },
  { area: "pain_relievers", question: "business.fit.relievers", related: ["business.offer.value_proposition"] },
  { area: "customer_jobs", question: "business.fit.jobs", related: ["business.product.jobs"] },
  { area: "gains", question: "business.fit.gains", related: [] },
  { area: "pains", question: "business.fit.pains", related: ["business.problem.pains"] }
];
var SEGMENTS_QUESTION2 = "business.model.segments";
var SWOT_TOWS_QUESTIONS = [...SWOT_AREAS.map((spec) => spec.question), TOWS_AREA.question];
var VALUE_FIT_QUESTIONS = VALUE_FIT_AREAS.map((spec) => spec.question);
function stripApproved(entry2) {
  const { approved: _approved, ...rest } = entry2;
  void _approved;
  return rest;
}
function areaState(entry2) {
  if (!entry2) return "missing";
  if (entry2.state === "not_applicable") return "not_applicable";
  if (entry2.approved) return "complete";
  if (entry2.state === "withheld") return "withheld";
  if (entry2.state === "missing") return "missing";
  return "partial";
}
function area(spec, order, input, entry2) {
  const raw = input.entries.get(spec.question) ?? null;
  const next = [];
  if (!raw) {
    if (!input.existing.has(spec.question)) next.push({ id: spec.question, kind: "proposed" });
  } else if (!raw.approved && raw.state !== "not_applicable") next.push({ id: raw.id, kind: "existing" });
  return { area_id: spec.area, order, state: areaState(raw), entry: entry2, next_questions: next, related: spec.related.filter((id) => input.existing.has(id)) };
}
function numberSources(entries2, input) {
  const notes = [];
  const byRef = /* @__PURE__ */ new Map();
  const byKey = /* @__PURE__ */ new Map();
  const hiddenRefs = /* @__PURE__ */ new Set();
  const keyOf = (ref) => {
    if (!byRef.has(ref)) {
      const resolved = input.resolve(ref);
      const shown2 = resolved.ref !== "" && (input.audience === "internal" || resolved.kind === "fact" && resolved.status === "approved" || resolved.kind === "web" && resolved.status === "recorded");
      if (shown2) {
        if (!byKey.has(resolved.ref)) {
          const note = { n: notes.length + 1, ...resolved };
          notes.push(note);
          byKey.set(resolved.ref, note);
        }
        byRef.set(ref, resolved.ref);
      } else {
        byRef.set(ref, null);
        hiddenRefs.add(ref);
      }
    }
    return byRef.get(ref) ?? null;
  };
  const out = entries2.map((entry2) => {
    if (!entry2?.items) return entry2;
    const items = entry2.items.map((item) => {
      if (!item.sources?.length) return item;
      const kept = [...new Set(item.sources.map(keyOf).filter((key) => key !== null))];
      const { sources: _sources, ...rest } = item;
      void _sources;
      return kept.length ? { ...rest, sources: kept } : rest;
    });
    return { ...entry2, items };
  });
  return { entries: out, notes, hidden: hiddenRefs.size };
}
function baseBlock(input, block_id, framework, entries2, variant, computed_from, areas) {
  const approvedDates = entries2.map((entry2) => entry2.approved_at).filter((at) => typeof at === "string" && Number.isFinite(Date.parse(at)));
  const asOf = approvedDates.length ? approvedDates.reduce((latest3, at) => Date.parse(at) > Date.parse(latest3) ? at : latest3) : null;
  const state2 = areas.length > 0 && areas.every((a) => a.state === "complete") ? "complete" : areas.some((a) => a.state !== "missing") ? "partial" : "missing";
  return {
    block_id,
    framework_id: framework,
    data_state: state2,
    sources: [...new Set(entries2.flatMap((entry2) => entry2.sources))],
    as_of: asOf,
    computed_from,
    visibility: input.audience,
    renderer_variant: variant,
    layout_constraints: { preserve_topology: true, min_print_pt: 7, print_profile: "book_a4_portrait" }
  };
}
function namesOf(entries2) {
  return new Map(entries2.flatMap((entry2) => (entry2?.items ?? []).map((item) => [item.id, item.name])));
}
function linksOf(entries2, names2) {
  return entries2.flatMap((entry2) => (entry2?.items ?? []).flatMap((item) => item.links.map((to) => ({ from: item.id, to, state: names2.has(to) ? "resolved" : "unresolved" }))));
}
function documentShell(input, kind, framework, entries2, blocks2) {
  const summary = emptyStatusSummary();
  for (const entry2 of entries2) summary[entry2.state] += 1;
  const dates = entries2.map((entry2) => entry2.approved_at).filter((at) => typeof at === "string" && Number.isFinite(Date.parse(at)));
  return {
    schema: VISUAL_SCHEMA,
    schema_version: 1,
    document_kind: kind,
    brand_id: input.brand_id,
    brand_name: input.brand_name,
    audience: input.audience,
    illustrative: input.illustrative,
    origin: input.illustrative ? "illustrative_fixture" : "brand_repository",
    as_of: dates.length ? dates.reduce((latest3, at) => Date.parse(at) > Date.parse(latest3) ? at : latest3) : null,
    classification: input.audience === "public" ? "public" : "internal",
    print_profile: "book_a4_portrait",
    status_summary: summary,
    framework_refs: [frameworkRef(framework)],
    blocks: blocks2
  };
}
function notesBlock(input, block_id, framework, numbered, computed_from) {
  return {
    type: "source_notes",
    block_id,
    framework_id: framework,
    data_state: numbered.notes.length ? "complete" : "missing",
    sources: numbered.notes.map((note) => note.ref),
    as_of: null,
    computed_from,
    visibility: input.audience,
    renderer_variant: "source_notes.numbered.v1",
    layout_constraints: { preserve_topology: false, min_print_pt: 7, print_profile: "book_a4_portrait" },
    notes: numbered.notes,
    hidden: numbered.hidden
  };
}
function swotTowsDocument(input) {
  const specs = [...SWOT_AREAS, TOWS_AREA];
  const raw = specs.map((spec) => input.entries.get(spec.question) ?? null);
  const numbered = numberSources(raw.map((entry2) => entry2 ? stripApproved(entry2) : null), input);
  const swotEntries = numbered.entries.slice(0, 4);
  const towsEntry = numbered.entries[4] ?? null;
  const quadrants = SWOT_AREAS.map((spec, index) => area(spec, index + 1, input, swotEntries[index] ?? null));
  const present = raw.filter((entry2) => entry2 !== null);
  const swot = {
    ...baseBlock(input, "swot", "SWOT", present.filter((entry2) => entry2.id !== TOWS_AREA.question), "swot.quadrants.v1", SWOT_AREAS.map((spec) => spec.question), quadrants),
    type: "swot",
    quadrants
  };
  const names2 = namesOf(swotEntries);
  const towsArea = area(TOWS_AREA, 5, input, towsEntry);
  const cells2 = Object.fromEntries(TOWS_TYPES.map((type) => [type, []]));
  const unplaced = [];
  for (const item of towsEntry?.items ?? []) {
    const type = item.tags.find((tag) => tag.field === "type")?.value;
    if (type && TOWS_TYPES.includes(type)) cells2[type].push(item.id);
    else unplaced.push(item.id);
  }
  const tows = {
    ...baseBlock(input, "tows", "TOWS", present.filter((entry2) => entry2.id === TOWS_AREA.question), "tows.matrix.v1", [TOWS_AREA.question, ...SWOT_AREAS.map((spec) => spec.question)], [towsArea]),
    type: "tows_matrix",
    area: towsArea,
    cells: cells2,
    unplaced,
    links: linksOf([towsEntry], names2),
    names: Object.fromEntries(names2)
  };
  return documentShell(input, "swot_tows", "SWOT", present, [swot, tows, notesBlock(input, "swot-sources", "SWOT", numbered, ["swot", "tows"])]);
}
function valuePropositionDocument(input) {
  const raw = VALUE_FIT_AREAS.map((spec) => input.entries.get(spec.question) ?? null);
  const numbered = numberSources(raw.map((entry2) => entry2 ? stripApproved(entry2) : null), input);
  const zones = VALUE_FIT_AREAS.map((spec, index) => area(spec, index + 1, input, numbered.entries[index] ?? null));
  const segments = input.entries.get(SEGMENTS_QUESTION2) ?? null;
  const names2 = namesOf([...numbered.entries, segments]);
  const byZone = (zone) => zones.find((z) => z.area_id === zone)?.entry?.items ?? [];
  const fitRows = (targets, from) => targets.map((target) => ({ id: target.id, addressed_by: from.filter((item) => item.links.includes(target.id)).map((item) => item.id) }));
  const present = raw.filter((entry2) => entry2 !== null);
  const block = {
    ...baseBlock(input, "vpc", "VPC", present, "vpc.square_circle.v1", [...VALUE_FIT_QUESTIONS, SEGMENTS_QUESTION2], zones),
    type: "value_proposition_canvas",
    zones,
    fit: { pains: fitRows(byZone("pains"), byZone("pain_relievers")), gains: fitRows(byZone("gains"), byZone("gain_creators")) },
    links: linksOf(numbered.entries, names2),
    names: Object.fromEntries(names2)
  };
  return documentShell(input, "value_proposition", "VPC", present, [block, notesBlock(input, "vpc-sources", "VPC", numbered, ["vpc"])]);
}
var MAX_HOST = 120;
var MAX_URL = 200;
function webSource(ref) {
  try {
    const url = new URL(ref);
    const address = `${url.origin}${url.pathname}`;
    return { kind: "web", ref: address.slice(0, MAX_URL), label: null, host: url.hostname.slice(0, MAX_HOST), url: address.length > MAX_URL ? null : address, status: "recorded" };
  } catch {
    return { kind: "web", ref: "", label: null, host: null, url: null, status: "not_available" };
  }
}
function inputFor(engine, audience, questions, options) {
  const root = engine.workspaceRoot();
  const config = engine.config();
  const brandId = config.brand.slug;
  const now = options.now ?? /* @__PURE__ */ new Date();
  const facts = readFacts(root, "approved", brandId);
  const answers = latestAnswers(engine.ledger().records);
  let evidence = [];
  try {
    evidence = readEvidence(root);
  } catch {
    evidence = [];
  }
  const context = { facts, answers, audience, root, brandId, evidence, now };
  const existing2 = new Set(engine.questions().map((question) => question.id));
  const entries2 = /* @__PURE__ */ new Map();
  const applicability = brandApplicability(engine);
  for (const id of questions) {
    if (!engine.question(id)) continue;
    const ref = applicability.refs(id)[0];
    const entry2 = ref ? frameworkEntry(engine, context, ref, now) : null;
    if (entry2) entries2.set(id, entry2);
  }
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const resolve = (ref) => {
    const kind = sourceRefKind(ref);
    if (kind === "web") return webSource(ref);
    if (kind === "knowledge") {
      const title = options.sharedNotes?.get(ref) ?? null;
      return { kind, ref, label: title ? title.slice(0, 200) : null, host: null, url: null, status: title ? "shared" : "not_available" };
    }
    if (kind === "evidence") {
      const record = evidenceById.get(ref);
      const status = record?.status === "verified" ? "verified" : record?.status === "pending" ? "recorded" : "not_available";
      return { kind, ref, label: null, host: null, url: null, status };
    }
    const question = engine.question(ref);
    if (!question) return { kind: "fact", ref, label: null, host: null, url: null, status: "not_available" };
    const item = itemFor(question, context);
    const approved = item.tag === "approved" && !item.withheld;
    return { kind: "fact", ref, label: question.label, host: null, url: null, status: approved ? "approved" : "not_available" };
  };
  return { brand_id: brandId, brand_name: String(config.brand.name ?? brandId), audience, illustrative: false, entries: entries2, existing: existing2, resolve };
}
function buildSwotTows(engine, audience, options = {}) {
  return swotTowsDocument(inputFor(engine, audience, SWOT_TOWS_QUESTIONS, options));
}
function buildValueProposition(engine, audience, options = {}) {
  return valuePropositionDocument(inputFor(engine, audience, [...VALUE_FIT_QUESTIONS, SEGMENTS_QUESTION2], options));
}

// packages/brand-core/src/visual/fixtures-strategy.ts
var APPROVED_AT5 = "2026-10-02T09:00:00.000Z";
var conf = (value2) => [{ field: "confidence", value: value2 }];
var SWOT = [
  {
    id: "business.swot.strengths",
    label: "Strengths",
    state: "approved",
    items: [
      { id: "str-1", tags: conf("evidenced"), sources: ["business.offer.summary", "https://example.com/review-process?ref=fixture"], text: { en: { name: "Teacher-reviewed lessons", detail: "Every lesson is checked before release" }, fa: { name: "\u062F\u0631\u0633\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0634\u062F\u0647 \u062A\u0648\u0633\u0637 \u0645\u0639\u0644\u0645", detail: "\u0647\u0631 \u062F\u0631\u0633 \u067E\u06CC\u0634 \u0627\u0632 \u0627\u0646\u062A\u0634\u0627\u0631 \u0628\u0631\u0631\u0633\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F" }, tr: { name: "\xD6\u011Fretmen kontroll\xFC dersler", detail: "Her ders yay\u0131ndan \xF6nce kontrol edilir" } } },
      { id: "str-2", tags: conf("owner_view"), text: { en: { name: "Ten-minute daily format" }, fa: { name: "\u0642\u0627\u0644\u0628 \u0631\u0648\u0632\u0627\u0646\u0647\u0654 \u062F\u0647\u200C\u062F\u0642\u06CC\u0642\u0647\u200C\u0627\u06CC" }, tr: { name: "G\xFCnl\xFCk on dakikal\u0131k format" } } }
    ]
  },
  {
    id: "business.swot.weaknesses",
    label: "Weaknesses",
    state: "assumption",
    items: [
      { id: "wk-1", tags: conf("owner_view"), text: { en: { name: "Small content team", detail: "Two people write every course" }, fa: { name: "\u062A\u06CC\u0645 \u0645\u062D\u062A\u0648\u0627\u06CC \u06A9\u0648\u0686\u06A9", detail: "\u062F\u0648 \u0646\u0641\u0631 \u0647\u0645\u0647\u0654 \u062F\u0648\u0631\u0647\u200C\u0647\u0627 \u0631\u0627 \u0645\u06CC\u200C\u0646\u0648\u06CC\u0633\u0646\u062F" }, tr: { name: "K\xFC\xE7\xFCk i\xE7erik ekibi", detail: "T\xFCm kurslar\u0131 iki ki\u015Fi yaz\u0131yor" } } },
      { id: "wk-2", tags: conf("hypothesis"), sources: ["kn_example-offline-interviews", "kn_example-private-note"], text: { en: { name: "No offline mode" }, fa: { name: "\u0646\u0628\u0648\u062F \u062D\u0627\u0644\u062A \u0622\u0641\u0644\u0627\u06CC\u0646" }, tr: { name: "\xC7evrimd\u0131\u015F\u0131 mod yok" } } }
    ]
  },
  {
    id: "business.swot.opportunities",
    label: "Opportunities",
    state: "approved",
    items: [
      { id: "opp-1", tags: conf("evidenced"), sources: ["https://example.org/upskilling-survey", "ev-0001"], text: { en: { name: "Employers fund upskilling" }, fa: { name: "\u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646 \u0647\u0632\u06CC\u0646\u0647\u0654 \u0627\u0631\u062A\u0642\u0627\u06CC \u0645\u0647\u0627\u0631\u062A \u0631\u0627 \u0645\u06CC\u200C\u062F\u0647\u0646\u062F" }, tr: { name: "\u0130\u015Fverenler beceri geli\u015Fimini finanse ediyor" } } },
      { id: "opp-2", tags: conf("hypothesis"), text: { en: { name: "Remote hiring across borders" }, fa: { name: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0632 \u0631\u0627\u0647 \u062F\u0648\u0631 \u0641\u0631\u0627\u062A\u0631 \u0627\u0632 \u0645\u0631\u0632\u0647\u0627" }, tr: { name: "S\u0131n\u0131r \xF6tesi uzaktan i\u015Fe al\u0131m" } } }
    ]
  },
  { id: "business.swot.threats", label: "Threats", state: "missing" },
  {
    id: "business.swot.tows",
    label: "TOWS strategies",
    state: "assumption",
    items: [
      { id: "tows-1", tags: [{ field: "type", value: "so" }], links: ["str-1", "opp-1"], text: { en: { name: "Team seats for employer upskilling budgets", detail: "Sell reviewed courses to HR teams" }, fa: { name: "\u0635\u0646\u062F\u0644\u06CC \u062A\u06CC\u0645\u06CC \u0628\u0631\u0627\u06CC \u0628\u0648\u062F\u062C\u0647\u0654 \u0627\u0631\u062A\u0642\u0627\u06CC \u0645\u0647\u0627\u0631\u062A \u06A9\u0627\u0631\u0641\u0631\u0645\u0627\u06CC\u0627\u0646", detail: "\u0641\u0631\u0648\u0634 \u062F\u0648\u0631\u0647\u200C\u0647\u0627\u06CC \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC\u200C\u0634\u062F\u0647 \u0628\u0647 \u062A\u06CC\u0645\u200C\u0647\u0627\u06CC \u0645\u0646\u0627\u0628\u0639 \u0627\u0646\u0633\u0627\u0646\u06CC" }, tr: { name: "\u0130\u015Fveren beceri b\xFCt\xE7eleri i\xE7in ekip koltuklar\u0131", detail: "Kontroll\xFC kurslar\u0131 \u0130K ekiplerine sat" } } },
      { id: "tows-2", tags: [{ field: "type", value: "wo" }], links: ["wk-1", "opp-2"], text: { en: { name: "Hire remote course writers" }, fa: { name: "\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0646\u0648\u06CC\u0633\u0646\u062F\u0647\u0654 \u062F\u0648\u0631\u0647 \u0627\u0632 \u0631\u0627\u0647 \u062F\u0648\u0631" }, tr: { name: "Uzaktan kurs yazar\u0131 i\u015Fe al" } } },
      { id: "tows-3", tags: [{ field: "type", value: "wt" }], links: ["wk-2", "thr-1"], text: { en: { name: "Short offline lesson packs" }, fa: { name: "\u0628\u0633\u062A\u0647\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u062F\u0631\u0633 \u0622\u0641\u0644\u0627\u06CC\u0646" }, tr: { name: "K\u0131sa \xE7evrimd\u0131\u015F\u0131 ders paketleri" } } },
      { id: "tows-4", links: ["str-2"], text: { en: { name: "Weekly progress note for HR" }, fa: { name: "\u06AF\u0632\u0627\u0631\u0634 \u0647\u0641\u062A\u06AF\u06CC \u067E\u06CC\u0634\u0631\u0641\u062A \u0628\u0631\u0627\u06CC \u0645\u0646\u0627\u0628\u0639 \u0627\u0646\u0633\u0627\u0646\u06CC" }, tr: { name: "\u0130K i\xE7in haftal\u0131k ilerleme notu" } } }
    ]
  }
];
var VPC = [
  {
    id: "business.fit.products",
    label: "Products and services",
    state: "approved",
    items: [
      { id: "prod-1", tags: [{ field: "kind", value: "digital" }], links: ["seg-1"], text: { en: { name: "Mobile lesson app" }, fa: { name: "\u0627\u067E \u062F\u0631\u0633 \u0645\u0648\u0628\u0627\u06CC\u0644\u06CC" }, tr: { name: "Mobil ders uygulamas\u0131" } } },
      { id: "prod-2", tags: [{ field: "kind", value: "service" }], text: { en: { name: "Team seat licence" }, fa: { name: "\u0645\u062C\u0648\u0632 \u0635\u0646\u062F\u0644\u06CC \u062A\u06CC\u0645\u06CC" }, tr: { name: "Ekip koltu\u011Fu lisans\u0131" } } }
    ]
  },
  {
    id: "business.fit.creators",
    label: "Gain creators",
    state: "approved",
    items: [{ id: "gcr-1", links: ["gain-1", "prod-1"], sources: ["business.offer.summary"], text: { en: { name: "A certificate for each level", detail: "Shareable with an employer" }, fa: { name: "\u06AF\u0648\u0627\u0647\u06CC \u0628\u0631\u0627\u06CC \u0647\u0631 \u0633\u0637\u062D", detail: "\u0642\u0627\u0628\u0644 \u0627\u0631\u0627\u0626\u0647 \u0628\u0647 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627" }, tr: { name: "Her seviye i\xE7in sertifika", detail: "\u0130\u015Fverenle payla\u015F\u0131labilir" } } }]
  },
  {
    id: "business.fit.relievers",
    label: "Pain relievers",
    state: "assumption",
    items: [
      { id: "rel-1", links: ["pain-1", "prod-1"], text: { en: { name: "Lessons that fit a commute" }, fa: { name: "\u062F\u0631\u0633\u200C\u0647\u0627\u06CC\u06CC \u0628\u0647 \u0627\u0646\u062F\u0627\u0632\u0647\u0654 \u0645\u0633\u06CC\u0631 \u0631\u0641\u062A\u200C\u0648\u0622\u0645\u062F" }, tr: { name: "Yolculu\u011Fa s\u0131\u011Fan dersler" } } },
      { id: "rel-2", links: ["pain-2"], sources: ["ev-0001"], text: { en: { name: "Teacher feedback within a day" }, fa: { name: "\u0628\u0627\u0632\u062E\u0648\u0631\u062F \u0645\u0639\u0644\u0645 \u0638\u0631\u0641 \u06CC\u06A9 \u0631\u0648\u0632" }, tr: { name: "Bir g\xFCn i\xE7inde \xF6\u011Fretmen geri bildirimi" } } }
    ]
  },
  {
    id: "business.fit.jobs",
    label: "Customer jobs",
    state: "approved",
    items: [
      { id: "job-1", tags: [{ field: "kind", value: "functional" }], links: ["seg-1"], text: { en: { name: "Pass a job interview in a new language" }, fa: { name: "\u0642\u0628\u0648\u0644\u06CC \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647\u0654 \u0634\u063A\u0644\u06CC \u0628\u0647 \u0632\u0628\u0627\u0646 \u062A\u0627\u0632\u0647" }, tr: { name: "Yeni bir dilde i\u015F g\xF6r\xFC\u015Fmesini ge\xE7mek" } } },
      { id: "job-2", tags: [{ field: "kind", value: "emotional" }], text: { en: { name: "Feel ready to speak at work" }, fa: { name: "\u0622\u0645\u0627\u062F\u06AF\u06CC \u0628\u0631\u0627\u06CC \u0635\u062D\u0628\u062A \u062F\u0631 \u0645\u062D\u0644 \u06A9\u0627\u0631" }, tr: { name: "\u0130\u015Fte konu\u015Fmaya haz\u0131r hissetmek" } } }
    ]
  },
  {
    id: "business.fit.gains",
    label: "Customer gains",
    state: "approved",
    items: [
      { id: "gain-1", tags: [{ field: "relevance", value: "desired" }], links: ["seg-1"], text: { en: { name: "Progress to show an employer" }, fa: { name: "\u067E\u06CC\u0634\u0631\u0641\u062A\u06CC \u06A9\u0647 \u0628\u0634\u0648\u062F \u0628\u0647 \u06A9\u0627\u0631\u0641\u0631\u0645\u0627 \u0646\u0634\u0627\u0646 \u062F\u0627\u062F" }, tr: { name: "\u0130\u015Fverene g\xF6sterilecek ilerleme" } } },
      { id: "gain-2", tags: [{ field: "relevance", value: "expected" }], text: { en: { name: "Confidence when speaking" }, fa: { name: "\u0627\u0639\u062A\u0645\u0627\u062F\u0628\u0647\u200C\u0646\u0641\u0633 \u0647\u0646\u06AF\u0627\u0645 \u0635\u062D\u0628\u062A" }, tr: { name: "Konu\u015Furken \xF6zg\xFCven" } } }
    ]
  },
  {
    id: "business.fit.pains",
    label: "Customer pains",
    state: "approved",
    items: [
      { id: "pain-1", tags: [{ field: "severity", value: "extreme" }], links: ["seg-1", "job-1"], sources: ["business.problem.pains"], text: { en: { name: "No time after work" }, fa: { name: "\u0646\u0628\u0648\u062F \u0648\u0642\u062A \u0628\u0639\u062F \u0627\u0632 \u06A9\u0627\u0631" }, tr: { name: "\u0130\u015F sonras\u0131 zaman yok" } } },
      { id: "pain-2", tags: [{ field: "severity", value: "moderate" }], text: { en: { name: "Unsure if pronunciation is right" }, fa: { name: "\u0645\u0637\u0645\u0626\u0646 \u0646\u0628\u0648\u062F\u0646 \u0627\u0632 \u062F\u0631\u0633\u062A\u06CC \u062A\u0644\u0641\u0638" }, tr: { name: "Telaffuzun do\u011Fru olup olmad\u0131\u011F\u0131ndan emin olmamak" } } },
      { id: "pain-3", tags: [{ field: "severity", value: "light" }], text: { en: { name: "Apps feel like games, not work" }, fa: { name: "\u0627\u067E\u200C\u0647\u0627 \u0634\u0628\u06CC\u0647 \u0628\u0627\u0632\u06CC\u200C\u0627\u0646\u062F\u060C \u0646\u0647 \u06A9\u0627\u0631" }, tr: { name: "Uygulamalar i\u015F gibi de\u011Fil oyun gibi" } } }
    ]
  },
  {
    id: SEGMENTS_QUESTION2,
    label: "Customer segments",
    state: "approved",
    items: [{ id: "seg-1", text: { en: { name: "Working adults changing jobs" }, fa: { name: "\u0628\u0632\u0631\u06AF\u0633\u0627\u0644\u0627\u0646 \u0634\u0627\u063A\u0644 \u062F\u0631 \u062D\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631 \u0634\u063A\u0644" }, tr: { name: "\u0130\u015F de\u011Fi\u015Ftiren \xE7al\u0131\u015Fan yeti\u015Fkinler" } } }]
  }
];
function resolveFixture(ref) {
  if (ref === "business.offer.summary") return { kind: "fact", ref, label: "Offer summary", host: null, url: null, status: "approved" };
  if (ref === "business.problem.pains") return { kind: "fact", ref, label: "Customer pains", host: null, url: null, status: "approved" };
  if (ref === "kn_example-offline-interviews") return { kind: "knowledge", ref, label: "Interview notes: offline use (fictional)", host: null, url: null, status: "shared" };
  if (ref === "ev-0001") return { kind: "evidence", ref, label: null, host: null, url: null, status: "verified" };
  if (ref.startsWith("https://")) {
    const url = new URL(ref);
    const address = `${url.origin}${url.pathname}`;
    return { kind: "web", ref: address, label: null, host: url.hostname, url: address, status: "recorded" };
  }
  return { kind: ref.startsWith("kn_") ? "knowledge" : "fact", ref, label: null, host: null, url: null, status: "not_available" };
}
function entries(lists, lang, audience) {
  const out = /* @__PURE__ */ new Map();
  for (const list of lists) {
    const approved = list.state === "approved";
    const hidden = audience === "public" && !approved || list.state === "missing";
    const items = hidden || !list.items ? null : list.items.map((item) => ({ id: item.id, name: item.text[lang].name, detail: item.text[lang].detail ?? null, tags: item.tags ?? [], links: item.links ?? [], ...item.sources ? { sources: item.sources } : {} }));
    out.set(list.id, {
      id: list.id,
      label: list.label,
      state: hidden ? "missing" : list.state,
      value: items ? items.map((item) => item.name).join(" \xB7 ") : null,
      ...items ? { items } : {},
      sources: [`fixture:${list.id}`],
      version: approved ? 1 : null,
      approved_at: approved ? APPROVED_AT5 : null,
      review_due: null,
      note: hidden && audience === "public" ? "Not published." : list.state === "assumption" ? "Owner draft. Not approved." : null,
      missing_reason: hidden ? audience === "public" ? "not_published" : "unanswered" : null,
      approved
    });
  }
  return out;
}
function existing(lists, related) {
  return /* @__PURE__ */ new Set([...lists.map((list) => list.id), ...related]);
}
function illustrativeSwotTows(lang = "en", audience = "internal") {
  return swotTowsDocument({
    brand_id: ILLUSTRATIVE_BRAND.id,
    brand_name: ILLUSTRATIVE_BRAND.name,
    audience,
    illustrative: true,
    entries: entries(SWOT, lang, audience),
    existing: existing(SWOT, [...SWOT_AREAS, TOWS_AREA].flatMap((spec) => spec.related)),
    resolve: resolveFixture
  });
}
function illustrativeValueProposition(lang = "en", audience = "internal") {
  return valuePropositionDocument({
    brand_id: ILLUSTRATIVE_BRAND.id,
    brand_name: ILLUSTRATIVE_BRAND.name,
    audience,
    illustrative: true,
    entries: entries(VPC, lang, audience),
    existing: existing(VPC, VALUE_FIT_AREAS.flatMap((spec) => spec.related)),
    resolve: resolveFixture
  });
}

// packages/brand-core/src/visual/i18n-plan.ts
var EN = {
  common: {
    openPrint: "Print view",
    openPrintPublic: "Public print view",
    printTitle: "Print view",
    printHint: "A3 landscape. Use the browser\u2019s Print command and choose \u201CSave as PDF\u201D.",
    sourcesTitle: "Sources",
    sourcesLead: "Every answer this page is drawn from, with its state, version and approval date.",
    colAnswer: "Answer",
    colState: "State",
    colVersion: "Version",
    colApproved: "Approved",
    idsTitle: "Question and item ids",
    idsLead: "For the interview command and for agents. Ids never appear in the main view.",
    nextTitle: "Next questions",
    nextLead: "What the owner can answer or approve next to complete this page.",
    relatedTitle: "Related answers",
    pageMain: "Overview",
    pageSources: "Sources and method",
    folio: "Page {page} of {pages}",
    legacyTitle: "Written as free text",
    legacyBody: "This answer is text, not a list of items, so it is shown as written. Re-enter it as a list in the interview to draw it.",
    notInBank: "This question is not in this brand\u2019s question bank yet (older template). A template update adds it.",
    emptyStepsTitle: "How to fill this page",
    countItems: "{count} items",
    linkHidden: "an item not shown in this edition",
    noValue: "\u2014"
  },
  journey: {
    kicker: "Market \xB7 Customer journey",
    title: "Customer Journey Map",
    lead: "The recorded stages of the customer journey, read across five lanes: touchpoints, customer actions, emotion, pain points and opportunities.",
    back: "Back to the journey map",
    stagesLabel: "Journey stages",
    lanesLabel: "Lanes",
    stageNum: "Stage {n}",
    goal: "Customer goal",
    evidence: "Evidence",
    forSegments: "For",
    lane: { touchpoints: "Touchpoints", actions: "Customer actions", emotion: "Emotion", pains: "Pain points", opportunities: "Opportunities" },
    laneHint: {
      touchpoints: "Where the customer meets the brand",
      actions: "What the customer does",
      emotion: "How the customer feels",
      pains: "What gets in the way",
      opportunities: "What the brand could improve"
    },
    emotion: { very_positive: "Delighted", positive: "Positive", neutral: "Neutral", negative: "Negative", very_negative: "Frustrated" },
    emotionNone: "Not recorded",
    curveLabel: "Emotion curve across the stages",
    hypothesisTitle: "Journey hypothesis",
    emptyTitle: "No journey stages recorded yet",
    emptyBody: "The map is drawn from the owner\u2019s list of journey stages. Nothing is guessed from the funnel hypothesis.",
    emptySteps: [
      "Run the interview for \u201CCustomer journey stages\u201D and add the stages in order.",
      "For each stage, record touchpoints, what the customer does, how they feel, pains and opportunities.",
      "Approve the list; the map updates on the next sync."
    ],
    emptyPublic: "No approved, published journey stages yet."
  },
  sostac: {
    kicker: "Strategy \xB7 Marketing plan",
    title: "SOSTAC\xAE overview",
    lead: "The marketing plan read in the six SOSTAC\xAE stages, from where the business is now to how progress is checked.",
    back: "Back to the SOSTAC\xAE overview",
    stage: {
      situation: { title: "Situation", prompt: "Where are we now?" },
      objectives: { title: "Objectives", prompt: "Where do we want to be?" },
      strategy: { title: "Strategy", prompt: "How do we get there?" },
      tactics: { title: "Tactics", prompt: "Which channels and tools?" },
      action: { title: "Action", prompt: "Who does what, and when?" },
      control: { title: "Control", prompt: "How do we measure and review?" }
    },
    flowLabel: "The six SOSTAC\xAE stages in order",
    stageEmpty: "No answer speaks to this stage yet.",
    toOkr: "Objectives and key results are drawn as a tree on the OKR page.",
    toJourney: "Customer journey stages are drawn on the journey map.",
    emptyPublic: "Nothing approved and published for this stage yet."
  },
  okr: {
    kicker: "Strategy \xB7 Goals",
    title: "OKR tree",
    lead: "Objectives with their measurable key results. Every key result has a target, a unit and the system that measures it.",
    back: "Back to the OKR tree",
    treeLabel: "Objectives and key results",
    root: "Annual objective",
    rootMissing: "No annual objective recorded",
    objective: "Objective",
    keyResult: "Key result",
    period: "Period",
    target: "Target",
    current: "Current",
    baseline: "Baseline",
    source: "Measured in",
    measuredOn: "Measured on",
    measure: { measured: "Measured", no_baseline: "No baseline", not_measured: "Not measured yet" },
    progress: "{pct} of the way from baseline to target",
    exceeded: "Target reached",
    behind: "Below the baseline",
    noKeyResults: "No key result recorded for this objective yet.",
    unlinkedTitle: "Key results without a visible objective",
    unlinkedLead: "They link to no objective, or to one not shown in this edition. They are listed here, never moved under another objective.",
    objectiveHidden: "Objective not shown in this edition",
    noObjective: "No objective linked",
    emptyTitle: "No objectives or key results recorded yet",
    emptyBody: "The tree is drawn from the owner\u2019s objectives and structured key results. A key result needs a target, a unit and a source; nothing is estimated.",
    emptySteps: [
      "Add the objectives for the period (\u201CObjectives (OKR)\u201D).",
      "Add key results with a target, a unit and the system that measures them, each linked to one objective.",
      "Record the current value and a baseline when you have them; progress is drawn only from a baseline."
    ],
    emptyPublic: "No approved, published objectives yet.",
    counts: "{objectives} objectives \xB7 {results} key results",
    planNote: "Targets are plans, not results. Current values are as recorded on the date shown."
  },
  labels: {
    "business.marketing.journey_stages": "Customer journey stages",
    "business.marketing.journey": "Journey hypothesis",
    "business.model.segments": "Customer segments",
    "business.goals.objectives": "Objectives",
    "business.goals.key_results": "Key results",
    "business.goals.annual": "Annual objective",
    "business.stage.current": "Business stage",
    "business.customer.primary_segment": "Primary customer",
    "business.problem.pains": "Customer pains",
    "business.market.geography": "Markets",
    "business.marketing.objective": "Marketing objective",
    "business.offer.value_proposition": "Value proposition",
    "brand.strategy.differentiation": "Differentiation",
    "business.marketing.pillars": "Content pillars",
    "business.marketing.channels": "Channels",
    "business.marketing.paid_media": "Paid media",
    "business.sales.motion": "Sales motion",
    "business.plan.milestone": "Next milestone",
    "business.ops.tracker": "Task tracker",
    "business.ops.roles": "Roles",
    "business.goals.sources": "Metric sources",
    "business.marketing.attribution": "Attribution",
    "business.goals.cadence": "Review cadence"
  }
};
var FA = {
  common: {
    openPrint: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E",
    openPrintPublic: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E \u0639\u0645\u0648\u0645\u06CC",
    printTitle: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E",
    printHint: "A3 \u0627\u0641\u0642\u06CC. \u0627\u0632 \u0641\u0631\u0645\u0627\u0646 \xAB\u0686\u0627\u067E\xBB \u0645\u0631\u0648\u0631\u06AF\u0631 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F \u0648 \xAB\u0630\u062E\u06CC\u0631\u0647 \u0628\u0647\u200C\u0635\u0648\u0631\u062A PDF\xBB \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F.",
    sourcesTitle: "\u0645\u0646\u0627\u0628\u0639",
    sourcesLead: "\u0647\u0645\u0647\u0654 \u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u0627\u0632 \u0622\u0646\u200C\u0647\u0627 \u0633\u0627\u062E\u062A\u0647 \u0634\u062F\u0647\u060C \u0628\u0627 \u0648\u0636\u0639\u06CC\u062A\u060C \u0646\u0633\u062E\u0647 \u0648 \u062A\u0627\u0631\u06CC\u062E \u062A\u0623\u06CC\u06CC\u062F.",
    colAnswer: "\u067E\u0627\u0633\u062E",
    colState: "\u0648\u0636\u0639\u06CC\u062A",
    colVersion: "\u0646\u0633\u062E\u0647",
    colApproved: "\u062A\u0623\u06CC\u06CC\u062F",
    idsTitle: "\u0634\u0646\u0627\u0633\u0647\u0654 \u067E\u0631\u0633\u0634\u200C\u0647\u0627 \u0648 \u0645\u0648\u0627\u0631\u062F",
    idsLead: "\u0628\u0631\u0627\u06CC \u0641\u0631\u0645\u0627\u0646 \u0645\u0635\u0627\u062D\u0628\u0647 \u0648 \u0628\u0631\u0627\u06CC \u0639\u0627\u0645\u0644\u200C\u0647\u0627. \u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627 \u0647\u0631\u06AF\u0632 \u062F\u0631 \u0646\u0645\u0627\u06CC \u0627\u0635\u0644\u06CC \u062F\u06CC\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    nextTitle: "\u067E\u0631\u0633\u0634\u200C\u0647\u0627\u06CC \u0628\u0639\u062F\u06CC",
    nextLead: "\u0622\u0646\u0686\u0647 \u0645\u0627\u0644\u06A9 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0631\u0627\u06CC \u06A9\u0627\u0645\u0644 \u0634\u062F\u0646 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u067E\u0627\u0633\u062E \u062F\u0647\u062F \u06CC\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u062F.",
    relatedTitle: "\u067E\u0627\u0633\u062E\u200C\u0647\u0627\u06CC \u0645\u0631\u062A\u0628\u0637",
    pageMain: "\u0646\u0645\u0627\u06CC \u06A9\u0644\u06CC",
    pageSources: "\u0645\u0646\u0627\u0628\u0639 \u0648 \u0631\u0648\u0634",
    folio: "\u0635\u0641\u062D\u0647\u0654 {page} \u0627\u0632 {pages}",
    legacyTitle: "\u0628\u0647\u200C\u0635\u0648\u0631\u062A \u0645\u062A\u0646 \u0622\u0632\u0627\u062F \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647",
    legacyBody: "\u0627\u06CC\u0646 \u067E\u0627\u0633\u062E \u0645\u062A\u0646 \u0627\u0633\u062A\u060C \u0646\u0647 \u0641\u0647\u0631\u0633\u062A\u06CC \u0627\u0632 \u0645\u0648\u0627\u0631\u062F\u060C \u067E\u0633 \u0647\u0645\u0627\u0646\u200C\u0637\u0648\u0631 \u06A9\u0647 \u0646\u0648\u0634\u062A\u0647 \u0634\u062F\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0628\u0631\u0627\u06CC \u0631\u0633\u0645 \u0622\u0646\u060C \u062F\u0631 \u0645\u0635\u0627\u062D\u0628\u0647 \u062F\u0648\u0628\u0627\u0631\u0647 \u0622\u0646 \u0631\u0627 \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u0641\u0647\u0631\u0633\u062A \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
    notInBank: "\u0627\u06CC\u0646 \u067E\u0631\u0633\u0634 \u0647\u0646\u0648\u0632 \u062F\u0631 \u0628\u0627\u0646\u06A9 \u067E\u0631\u0633\u0634 \u0627\u06CC\u0646 \u0628\u0631\u0646\u062F \u0646\u06CC\u0633\u062A (\u0642\u0627\u0644\u0628 \u0642\u062F\u06CC\u0645\u06CC\u200C\u062A\u0631). \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0642\u0627\u0644\u0628 \u0622\u0646 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
    emptyStepsTitle: "\u0686\u06AF\u0648\u0646\u0647 \u0627\u06CC\u0646 \u0635\u0641\u062D\u0647 \u0631\u0627 \u06A9\u0627\u0645\u0644 \u06A9\u0646\u06CC\u062F",
    countItems: "{count} \u0645\u0648\u0631\u062F",
    linkHidden: "\u0645\u0648\u0631\u062F\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    noValue: "\u2014"
  },
  journey: {
    kicker: "\u0628\u0627\u0632\u0627\u0631 \xB7 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    title: "\u0646\u0642\u0634\u0647\u0654 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    lead: "\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u062B\u0628\u062A\u200C\u0634\u062F\u0647\u0654 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC\u060C \u062F\u0631 \u067E\u0646\u062C \u0631\u062F\u06CC\u0641: \u0646\u0642\u0627\u0637 \u062A\u0645\u0627\u0633\u060C \u0627\u0642\u062F\u0627\u0645\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC\u060C \u0627\u062D\u0633\u0627\u0633\u060C \u0646\u0642\u0627\u0637 \u062F\u0631\u062F \u0648 \u0641\u0631\u0635\u062A\u200C\u0647\u0627.",
    back: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0646\u0642\u0634\u0647\u0654 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    stagesLabel: "\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0633\u0641\u0631",
    lanesLabel: "\u0631\u062F\u06CC\u0641\u200C\u0647\u0627",
    stageNum: "\u0645\u0631\u062D\u0644\u0647\u0654 {n}",
    goal: "\u0647\u062F\u0641 \u0645\u0634\u062A\u0631\u06CC",
    evidence: "\u0634\u0648\u0627\u0647\u062F",
    forSegments: "\u0628\u0631\u0627\u06CC",
    lane: { touchpoints: "\u0646\u0642\u0627\u0637 \u062A\u0645\u0627\u0633", actions: "\u0627\u0642\u062F\u0627\u0645\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC", emotion: "\u0627\u062D\u0633\u0627\u0633", pains: "\u0646\u0642\u0627\u0637 \u062F\u0631\u062F", opportunities: "\u0641\u0631\u0635\u062A\u200C\u0647\u0627" },
    laneHint: {
      touchpoints: "\u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0634\u062A\u0631\u06CC \u0628\u0627 \u0628\u0631\u0646\u062F \u0631\u0648\u0628\u0647\u200C\u0631\u0648 \u0645\u06CC\u200C\u0634\u0648\u062F",
      actions: "\u06A9\u0627\u0631\u06CC \u06A9\u0647 \u0645\u0634\u062A\u0631\u06CC \u0627\u0646\u062C\u0627\u0645 \u0645\u06CC\u200C\u062F\u0647\u062F",
      emotion: "\u062D\u0633\u06CC \u06A9\u0647 \u0645\u0634\u062A\u0631\u06CC \u062F\u0627\u0631\u062F",
      pains: "\u0622\u0646\u0686\u0647 \u0645\u0627\u0646\u0639 \u0645\u06CC\u200C\u0634\u0648\u062F",
      opportunities: "\u0622\u0646\u0686\u0647 \u0628\u0631\u0646\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u0647\u062A\u0631 \u06A9\u0646\u062F"
    },
    emotion: { very_positive: "\u0628\u0633\u06CC\u0627\u0631 \u0631\u0627\u0636\u06CC", positive: "\u0645\u062B\u0628\u062A", neutral: "\u062E\u0646\u062B\u06CC", negative: "\u0645\u0646\u0641\u06CC", very_negative: "\u0628\u0633\u06CC\u0627\u0631 \u0646\u0627\u0631\u0627\u0636\u06CC" },
    emotionNone: "\u062B\u0628\u062A \u0646\u0634\u062F\u0647",
    curveLabel: "\u0645\u0646\u062D\u0646\u06CC \u0627\u062D\u0633\u0627\u0633 \u062F\u0631 \u0637\u0648\u0644 \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627",
    hypothesisTitle: "\u0641\u0631\u0636\u06CC\u0647\u0654 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    emptyTitle: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0645\u0631\u062D\u0644\u0647\u200C\u0627\u06CC \u0627\u0632 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647",
    emptyBody: "\u0646\u0642\u0634\u0647 \u0627\u0632 \u0641\u0647\u0631\u0633\u062A \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0633\u0641\u0631 \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u062B\u0628\u062A \u06A9\u0631\u062F\u0647 \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0627\u0632 \u0641\u0631\u0636\u06CC\u0647\u0654 \u0642\u06CC\u0641 \u062D\u062F\u0633 \u0632\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    emptySteps: [
      "\u0645\u0635\u0627\u062D\u0628\u0647 \u0631\u0627 \u0628\u0631\u0627\u06CC \xAB\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC\xBB \u0627\u062C\u0631\u0627 \u06A9\u0646\u06CC\u062F \u0648 \u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627 \u0631\u0627 \u0628\u0647 \u062A\u0631\u062A\u06CC\u0628 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F.",
      "\u0628\u0631\u0627\u06CC \u0647\u0631 \u0645\u0631\u062D\u0644\u0647 \u0646\u0642\u0627\u0637 \u062A\u0645\u0627\u0633\u060C \u06A9\u0627\u0631 \u0645\u0634\u062A\u0631\u06CC\u060C \u0627\u062D\u0633\u0627\u0633 \u0627\u0648\u060C \u062F\u0631\u062F\u0647\u0627 \u0648 \u0641\u0631\u0635\u062A\u200C\u0647\u0627 \u0631\u0627 \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F.",
      "\u0641\u0647\u0631\u0633\u062A \u0631\u0627 \u062A\u0623\u06CC\u06CC\u062F \u06A9\u0646\u06CC\u062F\u061B \u0646\u0642\u0634\u0647 \u062F\u0631 \u0647\u0645\u06AF\u0627\u0645\u200C\u0633\u0627\u0632\u06CC \u0628\u0639\u062F\u06CC \u0628\u0647\u200C\u0631\u0648\u0632 \u0645\u06CC\u200C\u0634\u0648\u062F."
    ],
    emptyPublic: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0645\u0631\u062D\u0644\u0647\u0654 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0645\u0646\u062A\u0634\u0631\u0634\u062F\u0647\u200C\u0627\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F."
  },
  sostac: {
    kicker: "\u0631\u0627\u0647\u0628\u0631\u062F \xB7 \u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC",
    title: "\u0646\u0645\u0627\u06CC \u06A9\u0644\u06CC SOSTAC\xAE",
    lead: "\u0628\u0631\u0646\u0627\u0645\u0647\u0654 \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC \u062F\u0631 \u0634\u0634 \u0645\u0631\u062D\u0644\u0647\u0654 SOSTAC\xAE\u060C \u0627\u0632 \u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0644\u06CC \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 \u062A\u0627 \u0634\u06CC\u0648\u0647\u0654 \u0633\u0646\u062C\u0634 \u067E\u06CC\u0634\u0631\u0641\u062A.",
    back: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0646\u0645\u0627\u06CC \u06A9\u0644\u06CC SOSTAC\xAE",
    stage: {
      situation: { title: "\u0648\u0636\u0639\u06CC\u062A", prompt: "\u0627\u06A9\u0646\u0648\u0646 \u06A9\u062C\u0627 \u0647\u0633\u062A\u06CC\u0645\u061F" },
      objectives: { title: "\u0627\u0647\u062F\u0627\u0641", prompt: "\u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u06CC\u0645 \u0628\u0647 \u06A9\u062C\u0627 \u0628\u0631\u0633\u06CC\u0645\u061F" },
      strategy: { title: "\u0631\u0627\u0647\u0628\u0631\u062F", prompt: "\u0686\u06AF\u0648\u0646\u0647 \u0628\u0647 \u0622\u0646\u062C\u0627 \u0645\u06CC\u200C\u0631\u0633\u06CC\u0645\u061F" },
      tactics: { title: "\u062A\u0627\u06A9\u062A\u06CC\u06A9\u200C\u0647\u0627", prompt: "\u0628\u0627 \u06A9\u062F\u0627\u0645 \u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627 \u0648 \u0627\u0628\u0632\u0627\u0631\u0647\u0627\u061F" },
      action: { title: "\u0627\u0642\u062F\u0627\u0645", prompt: "\u0686\u0647 \u06A9\u0633\u06CC\u060C \u0686\u0647 \u06A9\u0627\u0631\u06CC\u060C \u0686\u0647 \u0632\u0645\u0627\u0646\u06CC\u061F" },
      control: { title: "\u06A9\u0646\u062A\u0631\u0644", prompt: "\u0686\u06AF\u0648\u0646\u0647 \u0645\u06CC\u200C\u0633\u0646\u062C\u06CC\u0645 \u0648 \u0645\u0631\u0648\u0631 \u0645\u06CC\u200C\u06A9\u0646\u06CC\u0645\u061F" }
    },
    flowLabel: "\u0634\u0634 \u0645\u0631\u062D\u0644\u0647\u0654 SOSTAC\xAE \u0628\u0647 \u062A\u0631\u062A\u06CC\u0628",
    stageEmpty: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u067E\u0627\u0633\u062E\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u0645\u0631\u062D\u0644\u0647 \u0645\u0631\u0628\u0648\u0637 \u0646\u06CC\u0633\u062A.",
    toOkr: "\u0627\u0647\u062F\u0627\u0641 \u0648 \u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC \u062F\u0631 \u0635\u0641\u062D\u0647\u0654 OKR \u0628\u0647\u200C\u0635\u0648\u0631\u062A \u062F\u0631\u062E\u062A \u0631\u0633\u0645 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    toJourney: "\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC \u0631\u0648\u06CC \u0646\u0642\u0634\u0647\u0654 \u0633\u0641\u0631 \u0631\u0633\u0645 \u0634\u062F\u0647\u200C\u0627\u0646\u062F.",
    emptyPublic: "\u0647\u0646\u0648\u0632 \u0686\u06CC\u0632\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0645\u0631\u062D\u0644\u0647 \u062A\u0623\u06CC\u06CC\u062F \u0648 \u0645\u0646\u062A\u0634\u0631 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A."
  },
  okr: {
    kicker: "\u0631\u0627\u0647\u0628\u0631\u062F \xB7 \u0627\u0647\u062F\u0627\u0641",
    title: "\u062F\u0631\u062E\u062A OKR",
    lead: "\u0647\u062F\u0641\u200C\u0647\u0627 \u0628\u0627 \u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC \u0642\u0627\u0628\u0644\u200C\u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC\u200C\u0634\u0627\u0646. \u0647\u0631 \u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC \u06CC\u06A9 \u0639\u062F\u062F \u0647\u062F\u0641\u060C \u06CC\u06A9 \u0648\u0627\u062D\u062F \u0648 \u0633\u0627\u0645\u0627\u0646\u0647\u0654 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u062F\u0627\u0631\u062F.",
    back: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u062F\u0631\u062E\u062A OKR",
    treeLabel: "\u0647\u062F\u0641\u200C\u0647\u0627 \u0648 \u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC",
    root: "\u0647\u062F\u0641 \u0633\u0627\u0644\u0627\u0646\u0647",
    rootMissing: "\u0647\u062F\u0641 \u0633\u0627\u0644\u0627\u0646\u0647\u200C\u0627\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647",
    objective: "\u0647\u062F\u0641",
    keyResult: "\u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC",
    period: "\u062F\u0648\u0631\u0647",
    target: "\u0647\u062F\u0641 \u0639\u062F\u062F\u06CC",
    current: "\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC",
    baseline: "\u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647",
    source: "\u0645\u0646\u0628\u0639 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC",
    measuredOn: "\u062A\u0627\u0631\u06CC\u062E \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC",
    measure: { measured: "\u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC\u200C\u0634\u062F\u0647", no_baseline: "\u0628\u062F\u0648\u0646 \u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647", not_measured: "\u0647\u0646\u0648\u0632 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0646\u0634\u062F\u0647" },
    progress: "{pct} \u0627\u0632 \u0645\u0633\u06CC\u0631 \u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647 \u062A\u0627 \u0647\u062F\u0641",
    exceeded: "\u0647\u062F\u0641 \u0645\u062D\u0642\u0642 \u0634\u062F",
    behind: "\u067E\u0627\u06CC\u06CC\u0646\u200C\u062A\u0631 \u0627\u0632 \u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647",
    noKeyResults: "\u0647\u0646\u0648\u0632 \u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u0647\u062F\u0641 \u062B\u0628\u062A \u0646\u0634\u062F\u0647.",
    unlinkedTitle: "\u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC \u0628\u062F\u0648\u0646 \u0647\u062F\u0641\u0650 \u0642\u0627\u0628\u0644\u200C\u0646\u0645\u0627\u06CC\u0634",
    unlinkedLead: "\u0628\u0647 \u0647\u06CC\u0686 \u0647\u062F\u0641\u06CC \u067E\u06CC\u0648\u0646\u062F \u0646\u062F\u0627\u0631\u0646\u062F\u060C \u06CC\u0627 \u0628\u0647 \u0647\u062F\u0641\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0627\u06CC\u0646\u200C\u062C\u0627 \u0641\u0647\u0631\u0633\u062A \u0634\u062F\u0647\u200C\u0627\u0646\u062F \u0648 \u0647\u0631\u06AF\u0632 \u0632\u06CC\u0631 \u0647\u062F\u0641 \u062F\u06CC\u06AF\u0631\u06CC \u062C\u0627\u0628\u0647\u200C\u062C\u0627 \u0646\u0645\u06CC\u200C\u0634\u0648\u0646\u062F.",
    objectiveHidden: "\u0647\u062F\u0641\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F",
    noObjective: "\u0628\u0647 \u0647\u06CC\u0686 \u0647\u062F\u0641\u06CC \u067E\u06CC\u0648\u0646\u062F \u0646\u062F\u0627\u0631\u062F",
    emptyTitle: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0647\u062F\u0641 \u06CC\u0627 \u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647",
    emptyBody: "\u062F\u0631\u062E\u062A \u0627\u0632 \u0647\u062F\u0641\u200C\u0647\u0627 \u0648 \u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC \u0633\u0627\u062E\u062A\u200C\u06CC\u0627\u0641\u062A\u0647\u0654 \u0645\u0627\u0644\u06A9 \u0633\u0627\u062E\u062A\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F. \u0647\u0631 \u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC \u06CC\u06A9 \u0647\u062F\u0641 \u0639\u062F\u062F\u06CC\u060C \u06CC\u06A9 \u0648\u0627\u062D\u062F \u0648 \u06CC\u06A9 \u0645\u0646\u0628\u0639 \u0644\u0627\u0632\u0645 \u062F\u0627\u0631\u062F\u061B \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u062A\u062E\u0645\u06CC\u0646 \u0632\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
    emptySteps: [
      "\u0647\u062F\u0641\u200C\u0647\u0627\u06CC \u0627\u06CC\u0646 \u062F\u0648\u0631\u0647 \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F (\xAB\u0647\u062F\u0641\u200C\u0647\u0627 (OKR)\xBB).",
      "\u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC \u0631\u0627 \u0628\u0627 \u0647\u062F\u0641 \u0639\u062F\u062F\u06CC\u060C \u0648\u0627\u062D\u062F \u0648 \u0633\u0627\u0645\u0627\u0646\u0647\u0654 \u0627\u0646\u062F\u0627\u0632\u0647\u200C\u06AF\u06CC\u0631\u06CC \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F \u0648 \u0647\u0631 \u06A9\u062F\u0627\u0645 \u0631\u0627 \u0628\u0647 \u06CC\u06A9 \u0647\u062F\u0641 \u067E\u06CC\u0648\u0646\u062F \u062F\u0647\u06CC\u062F.",
      "\u0645\u0642\u062F\u0627\u0631 \u0641\u0639\u0644\u06CC \u0648 \u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647 \u0631\u0627 \u0627\u06AF\u0631 \u062F\u0627\u0631\u06CC\u062F \u062B\u0628\u062A \u06A9\u0646\u06CC\u062F\u061B \u067E\u06CC\u0634\u0631\u0641\u062A \u0641\u0642\u0637 \u0627\u0632 \u0645\u0642\u062F\u0627\u0631 \u067E\u0627\u06CC\u0647 \u0631\u0633\u0645 \u0645\u06CC\u200C\u0634\u0648\u062F."
    ],
    emptyPublic: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0647\u062F\u0641 \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0648 \u0645\u0646\u062A\u0634\u0631\u0634\u062F\u0647\u200C\u0627\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F.",
    counts: "{objectives} \u0647\u062F\u0641 \xB7 {results} \u0646\u062A\u06CC\u062C\u0647\u0654 \u06A9\u0644\u06CC\u062F\u06CC",
    planNote: "\u0647\u062F\u0641\u200C\u0647\u0627\u06CC \u0639\u062F\u062F\u06CC \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0627\u0646\u062F\u060C \u0646\u0647 \u0646\u062A\u06CC\u062C\u0647. \u0645\u0642\u062F\u0627\u0631\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u0647\u0645\u0627\u0646\u200C\u0627\u0646\u062F \u06A9\u0647 \u062F\u0631 \u062A\u0627\u0631\u06CC\u062E \u0646\u0634\u0627\u0646\u200C\u062F\u0627\u062F\u0647\u200C\u0634\u062F\u0647 \u062B\u0628\u062A \u0634\u062F\u0647\u200C\u0627\u0646\u062F."
  },
  labels: {
    "business.marketing.journey_stages": "\u0645\u0631\u062D\u0644\u0647\u200C\u0647\u0627\u06CC \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    "business.marketing.journey": "\u0641\u0631\u0636\u06CC\u0647\u0654 \u0633\u0641\u0631 \u0645\u0634\u062A\u0631\u06CC",
    "business.model.segments": "\u0628\u062E\u0634\u200C\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC",
    "business.goals.objectives": "\u0647\u062F\u0641\u200C\u0647\u0627",
    "business.goals.key_results": "\u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC \u06A9\u0644\u06CC\u062F\u06CC",
    "business.goals.annual": "\u0647\u062F\u0641 \u0633\u0627\u0644\u0627\u0646\u0647",
    "business.stage.current": "\u0645\u0631\u062D\u0644\u0647\u0654 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
    "business.customer.primary_segment": "\u0645\u0634\u062A\u0631\u06CC \u0627\u0635\u0644\u06CC",
    "business.problem.pains": "\u062F\u0631\u062F\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC",
    "business.market.geography": "\u0628\u0627\u0632\u0627\u0631\u0647\u0627",
    "business.marketing.objective": "\u0647\u062F\u0641 \u0628\u0627\u0632\u0627\u0631\u06CC\u0627\u0628\u06CC",
    "business.offer.value_proposition": "\u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
    "brand.strategy.differentiation": "\u062A\u0645\u0627\u06CC\u0632",
    "business.marketing.pillars": "\u0633\u062A\u0648\u0646\u200C\u0647\u0627\u06CC \u0645\u062D\u062A\u0648\u0627",
    "business.marketing.channels": "\u06A9\u0627\u0646\u0627\u0644\u200C\u0647\u0627",
    "business.marketing.paid_media": "\u062A\u0628\u0644\u06CC\u063A\u0627\u062A \u067E\u0648\u0644\u06CC",
    "business.sales.motion": "\u0634\u06CC\u0648\u0647\u0654 \u0641\u0631\u0648\u0634",
    "business.plan.milestone": "\u06AF\u0627\u0645 \u0645\u0647\u0645 \u0628\u0639\u062F\u06CC",
    "business.ops.tracker": "\u0627\u0628\u0632\u0627\u0631 \u067E\u06CC\u06AF\u06CC\u0631\u06CC \u06A9\u0627\u0631\u0647\u0627",
    "business.ops.roles": "\u0646\u0642\u0634\u200C\u0647\u0627",
    "business.goals.sources": "\u0645\u0646\u0627\u0628\u0639 \u0633\u0646\u062C\u0647",
    "business.marketing.attribution": "\u0646\u0633\u0628\u062A\u200C\u062F\u0647\u06CC",
    "business.goals.cadence": "\u062F\u0648\u0631\u0647\u0654 \u0628\u0627\u0632\u0628\u06CC\u0646\u06CC"
  }
};
var TR = {
  common: {
    openPrint: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC",
    openPrintPublic: "Herkese a\xE7\u0131k bask\u0131 g\xF6r\xFCn\xFCm\xFC",
    printTitle: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC",
    printHint: "A3 yatay. Taray\u0131c\u0131n\u0131n Yazd\u0131r komutunu kullan\u0131n ve \u201CPDF olarak kaydet\u201Di se\xE7in.",
    sourcesTitle: "Kaynaklar",
    sourcesLead: "Bu sayfan\u0131n dayand\u0131\u011F\u0131 her yan\u0131t; durumu, s\xFCr\xFCm\xFC ve onay tarihiyle.",
    colAnswer: "Yan\u0131t",
    colState: "Durum",
    colVersion: "S\xFCr\xFCm",
    colApproved: "Onay",
    idsTitle: "Soru ve \xF6\u011Fe kimlikleri",
    idsLead: "G\xF6r\xFC\u015Fme komutu ve ajanlar i\xE7in. Kimlikler ana g\xF6r\xFCn\xFCmde hi\xE7 yer almaz.",
    nextTitle: "S\u0131radaki sorular",
    nextLead: "Bu sayfay\u0131 tamamlamak i\xE7in sahibin yan\u0131tlayabilece\u011Fi veya onaylayabilece\u011Fi \u015Feyler.",
    relatedTitle: "\u0130lgili yan\u0131tlar",
    pageMain: "Genel bak\u0131\u015F",
    pageSources: "Kaynaklar ve y\xF6ntem",
    folio: "Sayfa {page} / {pages}",
    legacyTitle: "Serbest metin olarak yaz\u0131lm\u0131\u015F",
    legacyBody: "Bu yan\u0131t bir \xF6\u011Fe listesi de\u011Fil, metin; bu y\xFCzden yaz\u0131ld\u0131\u011F\u0131 gibi g\xF6steriliyor. \xC7izilmesi i\xE7in g\xF6r\xFC\u015Fmede liste olarak yeniden girin.",
    notInBank: "Bu soru bu markan\u0131n soru bankas\u0131nda hen\xFCz yok (eski \u015Fablon). Bir \u015Fablon g\xFCncellemesi onu ekler.",
    emptyStepsTitle: "Bu sayfa nas\u0131l doldurulur",
    countItems: "{count} \xF6\u011Fe",
    linkHidden: "bu s\xFCr\xFCmde g\xF6sterilmeyen bir \xF6\u011Fe",
    noValue: "\u2014"
  },
  journey: {
    kicker: "Pazar \xB7 M\xFC\u015Fteri yolculu\u011Fu",
    title: "M\xFC\u015Fteri Yolculu\u011Fu Haritas\u0131",
    lead: "M\xFC\u015Fteri yolculu\u011Funun kay\u0131tl\u0131 a\u015Famalar\u0131, be\u015F \u015Feritte: temas noktalar\u0131, m\xFC\u015Fteri eylemleri, duygu, sorun noktalar\u0131 ve f\u0131rsatlar.",
    back: "Yolculuk haritas\u0131na d\xF6n",
    stagesLabel: "Yolculuk a\u015Famalar\u0131",
    lanesLabel: "\u015Eeritler",
    stageNum: "A\u015Fama {n}",
    goal: "M\xFC\u015Fteri hedefi",
    evidence: "Kan\u0131t",
    forSegments: "Kimin i\xE7in",
    lane: { touchpoints: "Temas noktalar\u0131", actions: "M\xFC\u015Fteri eylemleri", emotion: "Duygu", pains: "Sorun noktalar\u0131", opportunities: "F\u0131rsatlar" },
    laneHint: {
      touchpoints: "M\xFC\u015Fterinin markayla kar\u015F\u0131la\u015Ft\u0131\u011F\u0131 yer",
      actions: "M\xFC\u015Fterinin yapt\u0131\u011F\u0131",
      emotion: "M\xFC\u015Fterinin hissetti\u011Fi",
      pains: "\xD6n\xFCne \xE7\u0131kan engeller",
      opportunities: "Markan\u0131n iyile\u015Ftirebilece\u011Fi"
    },
    emotion: { very_positive: "\xC7ok memnun", positive: "Olumlu", neutral: "N\xF6tr", negative: "Olumsuz", very_negative: "\xC7ok rahats\u0131z" },
    emotionNone: "Kaydedilmedi",
    curveLabel: "A\u015Famalar boyunca duygu e\u011Frisi",
    hypothesisTitle: "Yolculuk hipotezi",
    emptyTitle: "Hen\xFCz kay\u0131tl\u0131 yolculuk a\u015Famas\u0131 yok",
    emptyBody: "Harita, sahibin yolculuk a\u015Famalar\u0131 listesinden \xE7izilir. Huni hipotezinden hi\xE7bir \u015Fey tahmin edilmez.",
    emptySteps: [
      "\u201CM\xFC\u015Fteri yolculu\u011Fu a\u015Famalar\u0131\u201D i\xE7in g\xF6r\xFC\u015Fmeyi \xE7al\u0131\u015Ft\u0131r\u0131n ve a\u015Famalar\u0131 s\u0131rayla ekleyin.",
      "Her a\u015Fama i\xE7in temas noktalar\u0131n\u0131, m\xFC\u015Fterinin yapt\u0131klar\u0131n\u0131, hissini, sorunlar\u0131 ve f\u0131rsatlar\u0131 kaydedin.",
      "Listeyi onaylay\u0131n; harita bir sonraki e\u015Fitlemede g\xFCncellenir."
    ],
    emptyPublic: "Hen\xFCz onayl\u0131 ve yay\u0131mlanm\u0131\u015F yolculuk a\u015Famas\u0131 yok."
  },
  sostac: {
    kicker: "Strateji \xB7 Pazarlama plan\u0131",
    title: "SOSTAC\xAE genel bak\u0131\u015F\u0131",
    lead: "Pazarlama plan\u0131 alt\u0131 SOSTAC\xAE a\u015Famas\u0131nda: i\u015Fletmenin bug\xFCnk\xFC durumundan ilerlemenin nas\u0131l \xF6l\xE7\xFCld\xFC\u011F\xFCne kadar.",
    back: "SOSTAC\xAE genel bak\u0131\u015F\u0131na d\xF6n",
    stage: {
      situation: { title: "Durum", prompt: "\u015Eu an neredeyiz?" },
      objectives: { title: "Hedefler", prompt: "Nereye varmak istiyoruz?" },
      strategy: { title: "Strateji", prompt: "Oraya nas\u0131l var\u0131r\u0131z?" },
      tactics: { title: "Taktikler", prompt: "Hangi kanallar ve ara\xE7lar?" },
      action: { title: "Eylem", prompt: "Kim, neyi, ne zaman yap\u0131yor?" },
      control: { title: "Kontrol", prompt: "Nas\u0131l \xF6l\xE7\xFCp g\xF6zden ge\xE7iriyoruz?" }
    },
    flowLabel: "S\u0131ras\u0131yla alt\u0131 SOSTAC\xAE a\u015Famas\u0131",
    stageEmpty: "Bu a\u015Famaya hen\xFCz hi\xE7bir yan\u0131t de\u011Finmiyor.",
    toOkr: "Ama\xE7lar ve anahtar sonu\xE7lar OKR sayfas\u0131nda a\u011Fa\xE7 olarak \xE7izilir.",
    toJourney: "M\xFC\u015Fteri yolculu\u011Fu a\u015Famalar\u0131 yolculuk haritas\u0131nda \xE7izilir.",
    emptyPublic: "Bu a\u015Fama i\xE7in hen\xFCz onayl\u0131 ve yay\u0131mlanm\u0131\u015F bir \u015Fey yok."
  },
  okr: {
    kicker: "Strateji \xB7 Ama\xE7lar",
    title: "OKR a\u011Fac\u0131",
    lead: "Ama\xE7lar ve \xF6l\xE7\xFClebilir anahtar sonu\xE7lar\u0131. Her anahtar sonucun bir hedefi, bir birimi ve onu \xF6l\xE7en bir sistemi var.",
    back: "OKR a\u011Fac\u0131na d\xF6n",
    treeLabel: "Ama\xE7lar ve anahtar sonu\xE7lar",
    root: "Y\u0131ll\u0131k ama\xE7",
    rootMissing: "Kay\u0131tl\u0131 y\u0131ll\u0131k ama\xE7 yok",
    objective: "Ama\xE7",
    keyResult: "Anahtar sonu\xE7",
    period: "D\xF6nem",
    target: "Hedef",
    current: "G\xFCncel",
    baseline: "Ba\u015Flang\u0131\xE7",
    source: "\xD6l\xE7\xFCld\xFC\u011F\xFC yer",
    measuredOn: "\xD6l\xE7\xFCm tarihi",
    measure: { measured: "\xD6l\xE7\xFCld\xFC", no_baseline: "Ba\u015Flang\u0131\xE7 de\u011Feri yok", not_measured: "Hen\xFCz \xF6l\xE7\xFClmedi" },
    progress: "Ba\u015Flang\u0131\xE7tan hedefe yolun {pct} kadar\u0131",
    exceeded: "Hedefe ula\u015F\u0131ld\u0131",
    behind: "Ba\u015Flang\u0131\xE7 de\u011Ferinin alt\u0131nda",
    noKeyResults: "Bu ama\xE7 i\xE7in hen\xFCz anahtar sonu\xE7 kaydedilmedi.",
    unlinkedTitle: "G\xF6r\xFCn\xFCr bir amac\u0131 olmayan anahtar sonu\xE7lar",
    unlinkedLead: "Hi\xE7bir amaca ya da bu s\xFCr\xFCmde g\xF6sterilmeyen bir amaca ba\u011Fl\u0131lar. Burada listelenirler; asla ba\u015Fka bir amac\u0131n alt\u0131na ta\u015F\u0131nmazlar.",
    objectiveHidden: "Bu s\xFCr\xFCmde g\xF6sterilmeyen ama\xE7",
    noObjective: "Ba\u011Fl\u0131 ama\xE7 yok",
    emptyTitle: "Hen\xFCz kay\u0131tl\u0131 ama\xE7 veya anahtar sonu\xE7 yok",
    emptyBody: "A\u011Fa\xE7, sahibin ama\xE7lar\u0131ndan ve yap\u0131land\u0131r\u0131lm\u0131\u015F anahtar sonu\xE7lar\u0131ndan \xE7izilir. Her anahtar sonu\xE7 bir hedef, bir birim ve bir kaynak ister; hi\xE7bir \u015Fey tahmin edilmez.",
    emptySteps: [
      "D\xF6nemin ama\xE7lar\u0131n\u0131 ekleyin (\u201CAma\xE7lar (OKR)\u201D).",
      "Anahtar sonu\xE7lar\u0131 hedef, birim ve onlar\u0131 \xF6l\xE7en sistemle ekleyin; her birini bir amaca ba\u011Flay\u0131n.",
      "Varsa g\xFCncel de\u011Feri ve ba\u015Flang\u0131\xE7 de\u011Ferini kaydedin; ilerleme yaln\u0131zca ba\u015Flang\u0131\xE7 de\u011Ferinden \xE7izilir."
    ],
    emptyPublic: "Hen\xFCz onayl\u0131 ve yay\u0131mlanm\u0131\u015F ama\xE7 yok.",
    counts: "{objectives} ama\xE7 \xB7 {results} anahtar sonu\xE7",
    planNote: "Hedefler pland\u0131r, sonu\xE7 de\u011Fildir. G\xFCncel de\u011Ferler g\xF6sterilen tarihte kaydedildi\u011Fi gibidir."
  },
  labels: {
    "business.marketing.journey_stages": "M\xFC\u015Fteri yolculu\u011Fu a\u015Famalar\u0131",
    "business.marketing.journey": "Yolculuk hipotezi",
    "business.model.segments": "M\xFC\u015Fteri segmentleri",
    "business.goals.objectives": "Ama\xE7lar",
    "business.goals.key_results": "Anahtar sonu\xE7lar",
    "business.goals.annual": "Y\u0131ll\u0131k ama\xE7",
    "business.stage.current": "\u0130\u015Fletme a\u015Famas\u0131",
    "business.customer.primary_segment": "Birincil m\xFC\u015Fteri",
    "business.problem.pains": "M\xFC\u015Fteri sorunlar\u0131",
    "business.market.geography": "Pazarlar",
    "business.marketing.objective": "Pazarlama amac\u0131",
    "business.offer.value_proposition": "De\u011Fer \xF6nerisi",
    "brand.strategy.differentiation": "Farkl\u0131la\u015Fma",
    "business.marketing.pillars": "\u0130\xE7erik s\xFCtunlar\u0131",
    "business.marketing.channels": "Kanallar",
    "business.marketing.paid_media": "\xDCcretli medya",
    "business.sales.motion": "Sat\u0131\u015F modeli",
    "business.plan.milestone": "Sonraki kilometre ta\u015F\u0131",
    "business.ops.tracker": "\u0130\u015F takip arac\u0131",
    "business.ops.roles": "Roller",
    "business.goals.sources": "Metrik kaynaklar\u0131",
    "business.marketing.attribution": "\u0130li\u015Fkilendirme",
    "business.goals.cadence": "G\xF6zden ge\xE7irme s\u0131kl\u0131\u011F\u0131"
  }
};
var PLAN_TEXT = { en: EN, fa: FA, tr: TR };
function planText(lang) {
  return PLAN_TEXT[lang];
}
function planLabel(lang, id, fallback) {
  return PLAN_TEXT[lang].labels[id] ?? fallback;
}

// packages/brand-core/src/visual/i18n-strategy.ts
var EN2 = {
  swotPageTitle: "SWOT / TOWS",
  swotTitle: "SWOT analysis",
  swotLead: "Strengths and weaknesses inside the business, opportunities and threats outside it, each as its own item with its sources.",
  towsTitle: "TOWS matrix",
  towsLead: "Strategies that follow from the SWOT, each placed by its recorded type and linked to the items it uses.",
  vpcTitle: "Value Proposition Canvas",
  vpcLead: "The value map beside the customer profile. Fit is shown only where a reliever is linked to a pain or a creator to a gain.",
  kicker: "Strategy Lab",
  quadrant: {
    strengths: { title: "Strengths", prompt: "Internal \xB7 helpful", empty: "No strengths listed yet" },
    weaknesses: { title: "Weaknesses", prompt: "Internal \xB7 harmful", empty: "No weaknesses listed yet" },
    opportunities: { title: "Opportunities", prompt: "External \xB7 helpful", empty: "No opportunities listed yet" },
    threats: { title: "Threats", prompt: "External \xB7 harmful", empty: "No threats listed yet" }
  },
  axisInternal: "Internal",
  axisExternal: "External",
  axisHelpful: "Helpful",
  axisHarmful: "Harmful",
  tows: {
    so: { title: "SO strategies", lead: "Use strengths to seize opportunities" },
    st: { title: "ST strategies", lead: "Use strengths to counter threats" },
    wo: { title: "WO strategies", lead: "Fix weaknesses by using opportunities" },
    wt: { title: "WT strategies", lead: "Reduce weaknesses and avoid threats" }
  },
  towsEmptyCell: "No strategy of this type yet",
  towsEmptyTitle: "No TOWS strategies listed yet",
  towsUnplaced: "Strategies without a type (not placed in a cell)",
  uses: "Uses",
  zone: {
    products_services: { title: "Products & services", prompt: "What you offer", empty: "No products or services listed yet" },
    gain_creators: { title: "Gain creators", prompt: "How the offer creates gains", empty: "No gain creators listed yet" },
    pain_relievers: { title: "Pain relievers", prompt: "How the offer relieves pains", empty: "No pain relievers listed yet" },
    customer_jobs: { title: "Customer jobs", prompt: "What the customer is trying to get done", empty: "No customer jobs listed yet" },
    gains: { title: "Gains", prompt: "Outcomes the customer wants", empty: "No gains listed yet" },
    pains: { title: "Pains", prompt: "What annoys or blocks the customer", empty: "No pains listed yet" }
  },
  valueMap: "Value map",
  customerProfile: "Customer profile",
  forSegment: "For",
  addresses: "Answers",
  fitTitle: "Fit",
  fitLead: "Read only from the links the owner recorded. Nothing is matched by wording and there is no score.",
  painsRelieved: "{done} of {total} pains have a linked reliever",
  gainsCreated: "{done} of {total} gains have a linked creator",
  fitColPain: "Pain",
  fitColRelievers: "Relieved by",
  fitColGain: "Gain",
  fitColCreators: "Created by",
  fitNoReliever: "No reliever linked yet",
  fitNoCreator: "No creator linked yet",
  fitEmpty: "Fit appears once pains or gains are listed.",
  emptyBody: "Nothing is filled in for you. The owner lists the items; each one can cite its sources.",
  sourcesTitle: "Sources",
  sourcesLead: "Numbered in reading order. A source is named, never quoted; an approved answer is cited by its label only.",
  sourceKind: { fact: "Approved answer", knowledge: "Knowledge note", evidence: "Evidence record", web: "Web page" },
  sourceStatus: {
    approved: "Approved",
    shared: "Shared note: an idea, not a fact",
    verified: "Verified",
    recorded: "Recorded, not verified",
    not_available: "Not available in this edition"
  },
  sourcesHidden: "{count} internal sources are not shown in the public edition.",
  sourcesNone: "No item cites a source yet.",
  sourceMark: "Sources",
  idsTitle: "Item ids and sources",
  idsLead: "For editing in the brand repository. Ids never change when an item is edited or moved.",
  idsColItem: "Item",
  idsColId: "Id",
  idsColSources: "Source references",
  editHint: "Lists are edited in the brand repository: npm run brand:interview -- --question <id> --entity add|edit|move|remove|list (--sources ref,ref). Studio only shows them.",
  openPrint: "Open print view",
  openPrintPublic: "Print public edition",
  backToSwot: "Back to SWOT / TOWS",
  backToVpc: "Back to the Value Proposition Canvas",
  printTitle: "Print view",
  pageSources: "Sources and framework",
  linkSwot: "SWOT / TOWS",
  linkVpc: "Value Proposition Canvas",
  linksTitle: "Also in Strategy Lab"
};
var FA2 = {
  swotPageTitle: "SWOT / TOWS",
  swotTitle: "\u062A\u062D\u0644\u06CC\u0644 SWOT",
  swotLead: "\u0642\u0648\u062A\u200C\u0647\u0627 \u0648 \u0636\u0639\u0641\u200C\u0647\u0627\u06CC \u062F\u0631\u0648\u0646 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u060C \u0641\u0631\u0635\u062A\u200C\u0647\u0627 \u0648 \u062A\u0647\u062F\u06CC\u062F\u0647\u0627\u06CC \u0628\u06CC\u0631\u0648\u0646 \u0627\u0632 \u0622\u0646\u061B \u0647\u0631 \u06A9\u062F\u0627\u0645 \u06CC\u06A9 \u0645\u0648\u0631\u062F \u062C\u062F\u0627 \u0628\u0627 \u0645\u0646\u0627\u0628\u0639 \u062E\u0648\u062F\u0634.",
  towsTitle: "\u0645\u0627\u062A\u0631\u06CC\u0633 TOWS",
  towsLead: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0627\u0632 SWOT \u0646\u062A\u06CC\u062C\u0647 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F\u061B \u0647\u0631 \u0631\u0627\u0647\u0628\u0631\u062F \u062F\u0631 \u062E\u0627\u0646\u0647\u0654 \u0646\u0648\u0639 \u062B\u0628\u062A\u200C\u0634\u062F\u0647\u200C\u0627\u0634 \u0648 \u0628\u0627 \u067E\u06CC\u0648\u0646\u062F \u0628\u0647 \u0645\u0648\u0627\u0631\u062F\u06CC \u06A9\u0647 \u0627\u0632 \u0622\u0646\u200C\u0647\u0627 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u06A9\u0646\u062F.",
  vpcTitle: "\u0628\u0648\u0645 \u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
  vpcLead: "\u0646\u0642\u0634\u0647\u0654 \u0627\u0631\u0632\u0634 \u062F\u0631 \u06A9\u0646\u0627\u0631 \u0646\u06CC\u0645\u200C\u0631\u062E \u0645\u0634\u062A\u0631\u06CC. \u062A\u0646\u0627\u0633\u0628 \u0641\u0642\u0637 \u062C\u0627\u06CC\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u06CC\u06A9 \u062F\u0631\u0645\u0627\u0646 \u0628\u0647 \u06CC\u06A9 \u062F\u0631\u062F \u06CC\u0627 \u06CC\u06A9 \u062E\u0627\u0644\u0642 \u062F\u0633\u062A\u0627\u0648\u0631\u062F \u0628\u0647 \u06CC\u06A9 \u062F\u0633\u062A\u0627\u0648\u0631\u062F \u067E\u06CC\u0648\u0646\u062F \u062E\u0648\u0631\u062F\u0647 \u0628\u0627\u0634\u062F.",
  kicker: "\u0622\u0632\u0645\u0627\u06CC\u0634\u06AF\u0627\u0647 \u0631\u0627\u0647\u0628\u0631\u062F",
  quadrant: {
    strengths: { title: "\u0642\u0648\u062A\u200C\u0647\u0627", prompt: "\u062F\u0631\u0648\u0646\u06CC \xB7 \u0633\u0648\u062F\u0645\u0646\u062F", empty: "\u0647\u0646\u0648\u0632 \u0642\u0648\u062A\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    weaknesses: { title: "\u0636\u0639\u0641\u200C\u0647\u0627", prompt: "\u062F\u0631\u0648\u0646\u06CC \xB7 \u0632\u06CC\u0627\u0646\u200C\u0622\u0648\u0631", empty: "\u0647\u0646\u0648\u0632 \u0636\u0639\u0641\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    opportunities: { title: "\u0641\u0631\u0635\u062A\u200C\u0647\u0627", prompt: "\u0628\u06CC\u0631\u0648\u0646\u06CC \xB7 \u0633\u0648\u062F\u0645\u0646\u062F", empty: "\u0647\u0646\u0648\u0632 \u0641\u0631\u0635\u062A\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    threats: { title: "\u062A\u0647\u062F\u06CC\u062F\u0647\u0627", prompt: "\u0628\u06CC\u0631\u0648\u0646\u06CC \xB7 \u0632\u06CC\u0627\u0646\u200C\u0622\u0648\u0631", empty: "\u0647\u0646\u0648\u0632 \u062A\u0647\u062F\u06CC\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" }
  },
  axisInternal: "\u062F\u0631\u0648\u0646\u06CC",
  axisExternal: "\u0628\u06CC\u0631\u0648\u0646\u06CC",
  axisHelpful: "\u0633\u0648\u062F\u0645\u0646\u062F",
  axisHarmful: "\u0632\u06CC\u0627\u0646\u200C\u0622\u0648\u0631",
  tows: {
    so: { title: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC SO", lead: "\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0642\u0648\u062A\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC \u06AF\u0631\u0641\u062A\u0646 \u0641\u0631\u0635\u062A\u200C\u0647\u0627" },
    st: { title: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC ST", lead: "\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0642\u0648\u062A\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC \u0645\u0642\u0627\u0628\u0644\u0647 \u0628\u0627 \u062A\u0647\u062F\u06CC\u062F\u0647\u0627" },
    wo: { title: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC WO", lead: "\u0631\u0641\u0639 \u0636\u0639\u0641\u200C\u0647\u0627 \u0628\u0627 \u06A9\u0645\u06A9 \u0641\u0631\u0635\u062A\u200C\u0647\u0627" },
    wt: { title: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC WT", lead: "\u06A9\u0645 \u06A9\u0631\u062F\u0646 \u0636\u0639\u0641\u200C\u0647\u0627 \u0648 \u062F\u0648\u0631\u06CC \u0627\u0632 \u062A\u0647\u062F\u06CC\u062F\u0647\u0627" }
  },
  towsEmptyCell: "\u0647\u0646\u0648\u0632 \u0631\u0627\u0647\u0628\u0631\u062F\u06CC \u0627\u0632 \u0627\u06CC\u0646 \u0646\u0648\u0639 \u0646\u06CC\u0633\u062A",
  towsEmptyTitle: "\u0647\u0646\u0648\u0632 \u0631\u0627\u0647\u0628\u0631\u062F TOWS \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A",
  towsUnplaced: "\u0631\u0627\u0647\u0628\u0631\u062F\u0647\u0627\u06CC \u0628\u062F\u0648\u0646 \u0646\u0648\u0639 (\u062F\u0631 \u0647\u06CC\u0686 \u062E\u0627\u0646\u0647\u200C\u0627\u06CC \u0642\u0631\u0627\u0631 \u0646\u06AF\u0631\u0641\u062A\u0647\u200C\u0627\u0646\u062F)",
  uses: "\u0628\u0631 \u067E\u0627\u06CC\u0647\u0654",
  zone: {
    products_services: { title: "\u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0648 \u062E\u062F\u0645\u0627\u062A", prompt: "\u0622\u0646\u0686\u0647 \u0627\u0631\u0627\u0626\u0647 \u0645\u06CC\u200C\u062F\u0647\u06CC\u062F", empty: "\u0647\u0646\u0648\u0632 \u0645\u062D\u0635\u0648\u0644 \u06CC\u0627 \u062E\u062F\u0645\u062A\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    gain_creators: { title: "\u062E\u0627\u0644\u0642\u0627\u0646 \u062F\u0633\u062A\u0627\u0648\u0631\u062F", prompt: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0634\u0645\u0627 \u0686\u0637\u0648\u0631 \u062F\u0633\u062A\u0627\u0648\u0631\u062F \u0645\u06CC\u200C\u0633\u0627\u0632\u062F", empty: "\u0647\u0646\u0648\u0632 \u062E\u0627\u0644\u0642 \u062F\u0633\u062A\u0627\u0648\u0631\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    pain_relievers: { title: "\u062F\u0631\u0645\u0627\u0646\u200C\u06A9\u0646\u0646\u062F\u0647\u200C\u0647\u0627\u06CC \u062F\u0631\u062F", prompt: "\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0634\u0645\u0627 \u0686\u0637\u0648\u0631 \u062F\u0631\u062F \u0631\u0627 \u06A9\u0645 \u0645\u06CC\u200C\u06A9\u0646\u062F", empty: "\u0647\u0646\u0648\u0632 \u062F\u0631\u0645\u0627\u0646\u06CC \u0628\u0631\u0627\u06CC \u062F\u0631\u062F \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    customer_jobs: { title: "\u06A9\u0627\u0631\u0647\u0627\u06CC \u0645\u0634\u062A\u0631\u06CC", prompt: "\u0645\u0634\u062A\u0631\u06CC \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F \u0686\u0647 \u06A9\u0627\u0631\u06CC \u0631\u0627 \u0627\u0646\u062C\u0627\u0645 \u062F\u0647\u062F", empty: "\u0647\u0646\u0648\u0632 \u06A9\u0627\u0631 \u0645\u0634\u062A\u0631\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    gains: { title: "\u062F\u0633\u062A\u0627\u0648\u0631\u062F\u0647\u0627", prompt: "\u0646\u062A\u06CC\u062C\u0647\u200C\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u0634\u062A\u0631\u06CC \u0645\u06CC\u200C\u062E\u0648\u0627\u0647\u062F", empty: "\u0647\u0646\u0648\u0632 \u062F\u0633\u062A\u0627\u0648\u0631\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" },
    pains: { title: "\u062F\u0631\u062F\u0647\u0627", prompt: "\u0622\u0646\u0686\u0647 \u0645\u0634\u062A\u0631\u06CC \u0631\u0627 \u0622\u0632\u0627\u0631 \u0645\u06CC\u200C\u062F\u0647\u062F \u06CC\u0627 \u0645\u062A\u0648\u0642\u0641 \u0645\u06CC\u200C\u06A9\u0646\u062F", empty: "\u0647\u0646\u0648\u0632 \u062F\u0631\u062F\u06CC \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" }
  },
  valueMap: "\u0646\u0642\u0634\u0647\u0654 \u0627\u0631\u0632\u0634",
  customerProfile: "\u0646\u06CC\u0645\u200C\u0631\u062E \u0645\u0634\u062A\u0631\u06CC",
  forSegment: "\u0628\u0631\u0627\u06CC",
  addresses: "\u067E\u0627\u0633\u062E \u0628\u0647",
  fitTitle: "\u062A\u0646\u0627\u0633\u0628",
  fitLead: "\u0641\u0642\u0637 \u0627\u0632 \u067E\u06CC\u0648\u0646\u062F\u0647\u0627\u06CC\u06CC \u062E\u0648\u0627\u0646\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u0645\u0627\u0644\u06A9 \u062B\u0628\u062A \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A. \u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0627\u0632 \u0631\u0648\u06CC \u0648\u0627\u0698\u0647\u200C\u0647\u0627 \u062C\u0641\u062A \u0646\u0645\u06CC\u200C\u0634\u0648\u062F \u0648 \u0627\u0645\u062A\u06CC\u0627\u0632\u06CC \u062F\u0631 \u06A9\u0627\u0631 \u0646\u06CC\u0633\u062A.",
  painsRelieved: "{done} \u0627\u0632 {total} \u062F\u0631\u062F\u060C \u062F\u0631\u0645\u0627\u0646\u0650 \u067E\u06CC\u0648\u0646\u062F\u062E\u0648\u0631\u062F\u0647 \u062F\u0627\u0631\u0646\u062F",
  gainsCreated: "{done} \u0627\u0632 {total} \u062F\u0633\u062A\u0627\u0648\u0631\u062F\u060C \u062E\u0627\u0644\u0642\u0650 \u067E\u06CC\u0648\u0646\u062F\u062E\u0648\u0631\u062F\u0647 \u062F\u0627\u0631\u0646\u062F",
  fitColPain: "\u062F\u0631\u062F",
  fitColRelievers: "\u062F\u0631\u0645\u0627\u0646 \u0628\u0627",
  fitColGain: "\u062F\u0633\u062A\u0627\u0648\u0631\u062F",
  fitColCreators: "\u0633\u0627\u062E\u062A\u0647 \u0628\u0627",
  fitNoReliever: "\u0647\u0646\u0648\u0632 \u062F\u0631\u0645\u0627\u0646\u06CC \u067E\u06CC\u0648\u0646\u062F \u0646\u062E\u0648\u0631\u062F\u0647 \u0627\u0633\u062A",
  fitNoCreator: "\u0647\u0646\u0648\u0632 \u062E\u0627\u0644\u0642\u06CC \u067E\u06CC\u0648\u0646\u062F \u0646\u062E\u0648\u0631\u062F\u0647 \u0627\u0633\u062A",
  fitEmpty: "\u062A\u0646\u0627\u0633\u0628 \u0648\u0642\u062A\u06CC \u062F\u06CC\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u06A9\u0647 \u062F\u0631\u062F\u0647\u0627 \u06CC\u0627 \u062F\u0633\u062A\u0627\u0648\u0631\u062F\u0647\u0627 \u062B\u0628\u062A \u0634\u0648\u0646\u062F.",
  emptyBody: "\u0647\u06CC\u0686 \u0686\u06CC\u0632 \u0628\u0647\u200C\u062C\u0627\u06CC \u0634\u0645\u0627 \u067E\u0631 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F. \u0645\u0627\u0644\u06A9 \u0645\u0648\u0627\u0631\u062F \u0631\u0627 \u0641\u0647\u0631\u0633\u062A \u0645\u06CC\u200C\u06A9\u0646\u062F \u0648 \u0647\u0631 \u0645\u0648\u0631\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u0646\u0627\u0628\u0639 \u062E\u0648\u062F\u0634 \u0631\u0627 \u0630\u06A9\u0631 \u06A9\u0646\u062F.",
  sourcesTitle: "\u0645\u0646\u0627\u0628\u0639",
  sourcesLead: "\u0628\u0647 \u062A\u0631\u062A\u06CC\u0628 \u062E\u0648\u0627\u0646\u062F\u0646 \u0634\u0645\u0627\u0631\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F\u0647\u200C\u0627\u0646\u062F. \u0627\u0632 \u0645\u0646\u0628\u0639 \u0641\u0642\u0637 \u0646\u0627\u0645 \u0628\u0631\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F\u060C \u0646\u0642\u0644\u200C\u0642\u0648\u0644 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F\u061B \u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647 \u0641\u0642\u0637 \u0628\u0627 \u0639\u0646\u0648\u0627\u0646\u0634 \u0630\u06A9\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F.",
  sourceKind: { fact: "\u067E\u0627\u0633\u062E \u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647", knowledge: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u062F\u0627\u0646\u0634", evidence: "\u0633\u0646\u062F \u0634\u0627\u0647\u062F", web: "\u0635\u0641\u062D\u0647\u0654 \u0648\u0628" },
  sourceStatus: {
    approved: "\u062A\u0623\u06CC\u06CC\u062F\u0634\u062F\u0647",
    shared: "\u06CC\u0627\u062F\u062F\u0627\u0634\u062A \u0627\u0634\u062A\u0631\u0627\u06A9\u06CC: \u06CC\u06A9 \u0627\u06CC\u062F\u0647\u060C \u0646\u0647 \u06CC\u06A9 \u0648\u0627\u0642\u0639\u06CC\u062A",
    verified: "\u0631\u0627\u0633\u062A\u06CC\u200C\u0622\u0632\u0645\u0627\u06CC\u06CC\u200C\u0634\u062F\u0647",
    recorded: "\u062B\u0628\u062A\u200C\u0634\u062F\u0647\u060C \u0631\u0627\u0633\u062A\u06CC\u200C\u0622\u0632\u0645\u0627\u06CC\u06CC\u200C\u0646\u0634\u062F\u0647",
    not_available: "\u062F\u0631 \u0627\u06CC\u0646 \u0646\u0633\u062E\u0647 \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A"
  },
  sourcesHidden: "{count} \u0645\u0646\u0628\u0639 \u062F\u0627\u062E\u0644\u06CC \u062F\u0631 \u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC \u0646\u0634\u0627\u0646 \u062F\u0627\u062F\u0647 \u0646\u0645\u06CC\u200C\u0634\u0648\u062F.",
  sourcesNone: "\u0647\u0646\u0648\u0632 \u0647\u06CC\u0686 \u0645\u0648\u0631\u062F\u06CC \u0645\u0646\u0628\u0639\u06CC \u0630\u06A9\u0631 \u0646\u06A9\u0631\u062F\u0647 \u0627\u0633\u062A.",
  sourceMark: "\u0645\u0646\u0627\u0628\u0639",
  idsTitle: "\u0634\u0646\u0627\u0633\u0647\u0654 \u0645\u0648\u0627\u0631\u062F \u0648 \u0645\u0646\u0627\u0628\u0639",
  idsLead: "\u0628\u0631\u0627\u06CC \u0648\u06CC\u0631\u0627\u06CC\u0634 \u062F\u0631 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F. \u0634\u0646\u0627\u0633\u0647\u200C\u0647\u0627 \u0628\u0627 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u06CC\u0627 \u062C\u0627\u0628\u0647\u200C\u062C\u0627\u06CC\u06CC \u0645\u0648\u0631\u062F \u062A\u063A\u06CC\u06CC\u0631 \u0646\u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.",
  idsColItem: "\u0645\u0648\u0631\u062F",
  idsColId: "\u0634\u0646\u0627\u0633\u0647",
  idsColSources: "\u0627\u0631\u062C\u0627\u0639 \u0645\u0646\u0627\u0628\u0639",
  editHint: "\u0641\u0647\u0631\u0633\u062A\u200C\u0647\u0627 \u062F\u0631 \u0645\u062E\u0632\u0646 \u0628\u0631\u0646\u062F \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0645\u06CC\u200C\u0634\u0648\u0646\u062F: npm run brand:interview -- --question <id> --entity add|edit|move|remove|list (--sources ref,ref). Studio \u0641\u0642\u0637 \u0622\u0646\u200C\u0647\u0627 \u0631\u0627 \u0646\u0634\u0627\u0646 \u0645\u06CC\u200C\u062F\u0647\u062F.",
  openPrint: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0646\u0645\u0627\u06CC \u0686\u0627\u067E",
  openPrintPublic: "\u0686\u0627\u067E \u0646\u0633\u062E\u0647\u0654 \u0639\u0645\u0648\u0645\u06CC",
  backToSwot: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 SWOT / TOWS",
  backToVpc: "\u0628\u0627\u0632\u06AF\u0634\u062A \u0628\u0647 \u0628\u0648\u0645 \u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
  printTitle: "\u0646\u0645\u0627\u06CC \u0686\u0627\u067E",
  pageSources: "\u0645\u0646\u0627\u0628\u0639 \u0648 \u0686\u0627\u0631\u0686\u0648\u0628",
  linkSwot: "SWOT / TOWS",
  linkVpc: "\u0628\u0648\u0645 \u0627\u0631\u0632\u0634 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F\u06CC",
  linksTitle: "\u062F\u0631 \u0622\u0632\u0645\u0627\u06CC\u0634\u06AF\u0627\u0647 \u0631\u0627\u0647\u0628\u0631\u062F"
};
var TR2 = {
  swotPageTitle: "SWOT / TOWS",
  swotTitle: "SWOT analizi",
  swotLead: "\u0130\u015Fletmenin i\xE7indeki g\xFC\xE7l\xFC ve zay\u0131f y\xF6nler, d\u0131\u015F\u0131ndaki f\u0131rsatlar ve tehditler; her biri kaynaklar\u0131yla ayr\u0131 bir madde.",
  towsTitle: "TOWS matrisi",
  towsLead: "SWOT analizinden \xE7\u0131kan stratejiler; her biri kay\u0131tl\u0131 t\xFCr\xFCne g\xF6re yerle\u015Fir ve kulland\u0131\u011F\u0131 maddelere ba\u011Flan\u0131r.",
  vpcTitle: "De\u011Fer \xD6nerisi Kanvas\u0131",
  vpcLead: "De\u011Fer haritas\u0131, m\xFC\u015Fteri profilinin yan\u0131nda. Uyum yaln\u0131zca bir giderici bir s\u0131k\u0131nt\u0131ya ya da bir yarat\u0131c\u0131 bir kazan\u0131ma ba\u011Fland\u0131\u011F\u0131nda g\xF6sterilir.",
  kicker: "Strateji Laboratuvar\u0131",
  quadrant: {
    strengths: { title: "G\xFC\xE7l\xFC y\xF6nler", prompt: "\u0130\xE7 \xB7 yararl\u0131", empty: "Hen\xFCz g\xFC\xE7l\xFC y\xF6n yaz\u0131lmad\u0131" },
    weaknesses: { title: "Zay\u0131f y\xF6nler", prompt: "\u0130\xE7 \xB7 zararl\u0131", empty: "Hen\xFCz zay\u0131f y\xF6n yaz\u0131lmad\u0131" },
    opportunities: { title: "F\u0131rsatlar", prompt: "D\u0131\u015F \xB7 yararl\u0131", empty: "Hen\xFCz f\u0131rsat yaz\u0131lmad\u0131" },
    threats: { title: "Tehditler", prompt: "D\u0131\u015F \xB7 zararl\u0131", empty: "Hen\xFCz tehdit yaz\u0131lmad\u0131" }
  },
  axisInternal: "\u0130\xE7",
  axisExternal: "D\u0131\u015F",
  axisHelpful: "Yararl\u0131",
  axisHarmful: "Zararl\u0131",
  tows: {
    so: { title: "SO stratejileri", lead: "G\xFC\xE7l\xFC y\xF6nlerle f\u0131rsatlar\u0131 yakala" },
    st: { title: "ST stratejileri", lead: "G\xFC\xE7l\xFC y\xF6nlerle tehditleri kar\u015F\u0131la" },
    wo: { title: "WO stratejileri", lead: "F\u0131rsatlarla zay\u0131f y\xF6nleri gider" },
    wt: { title: "WT stratejileri", lead: "Zay\u0131f y\xF6nleri azalt, tehditlerden ka\xE7\u0131n" }
  },
  towsEmptyCell: "Bu t\xFCrde hen\xFCz strateji yok",
  towsEmptyTitle: "Hen\xFCz TOWS stratejisi yaz\u0131lmad\u0131",
  towsUnplaced: "T\xFCr\xFC olmayan stratejiler (bir h\xFCcreye yerle\u015Fmedi)",
  uses: "Dayanak",
  zone: {
    products_services: { title: "\xDCr\xFCnler ve hizmetler", prompt: "Ne sunuyorsunuz", empty: "Hen\xFCz \xFCr\xFCn veya hizmet yaz\u0131lmad\u0131" },
    gain_creators: { title: "Kazan\u0131m yarat\u0131c\u0131lar", prompt: "Teklif kazan\u0131m\u0131 nas\u0131l yarat\u0131yor", empty: "Hen\xFCz kazan\u0131m yarat\u0131c\u0131 yaz\u0131lmad\u0131" },
    pain_relievers: { title: "S\u0131k\u0131nt\u0131 gidericiler", prompt: "Teklif s\u0131k\u0131nt\u0131y\u0131 nas\u0131l gideriyor", empty: "Hen\xFCz s\u0131k\u0131nt\u0131 giderici yaz\u0131lmad\u0131" },
    customer_jobs: { title: "M\xFC\u015Fteri i\u015Fleri", prompt: "M\xFC\u015Fteri neyi halletmeye \xE7al\u0131\u015F\u0131yor", empty: "Hen\xFCz m\xFC\u015Fteri i\u015Fi yaz\u0131lmad\u0131" },
    gains: { title: "Kazan\u0131mlar", prompt: "M\xFC\u015Fterinin istedi\u011Fi sonu\xE7lar", empty: "Hen\xFCz kazan\u0131m yaz\u0131lmad\u0131" },
    pains: { title: "S\u0131k\u0131nt\u0131lar", prompt: "M\xFC\u015Fteriyi rahats\u0131z eden veya durduran \u015Feyler", empty: "Hen\xFCz s\u0131k\u0131nt\u0131 yaz\u0131lmad\u0131" }
  },
  valueMap: "De\u011Fer haritas\u0131",
  customerProfile: "M\xFC\u015Fteri profili",
  forSegment: "Kimin i\xE7in",
  addresses: "Yan\u0131tlad\u0131\u011F\u0131",
  fitTitle: "Uyum",
  fitLead: "Yaln\u0131zca sahibin kaydetti\u011Fi ba\u011Flant\u0131lardan okunur. Hi\xE7bir \u015Fey kelimelere g\xF6re e\u015Fle\u015Ftirilmez ve puan verilmez.",
  painsRelieved: "{total} s\u0131k\u0131nt\u0131n\u0131n {done} tanesinin ba\u011Fl\u0131 bir gidericisi var",
  gainsCreated: "{total} kazan\u0131m\u0131n {done} tanesinin ba\u011Fl\u0131 bir yarat\u0131c\u0131s\u0131 var",
  fitColPain: "S\u0131k\u0131nt\u0131",
  fitColRelievers: "Gideren",
  fitColGain: "Kazan\u0131m",
  fitColCreators: "Yaratan",
  fitNoReliever: "Hen\xFCz ba\u011Fl\u0131 giderici yok",
  fitNoCreator: "Hen\xFCz ba\u011Fl\u0131 yarat\u0131c\u0131 yok",
  fitEmpty: "Uyum, s\u0131k\u0131nt\u0131lar veya kazan\u0131mlar yaz\u0131ld\u0131\u011F\u0131nda g\xF6r\xFCn\xFCr.",
  emptyBody: "Sizin yerinize hi\xE7bir \u015Fey doldurulmaz. Maddeleri sahibi yazar; her madde kaynaklar\u0131n\u0131 belirtebilir.",
  sourcesTitle: "Kaynaklar",
  sourcesLead: "Okuma s\u0131ras\u0131na g\xF6re numaralan\u0131r. Kaynak ad\u0131yla an\u0131l\u0131r, al\u0131nt\u0131lanmaz; onayl\u0131 bir yan\u0131t yaln\u0131zca etiketiyle an\u0131l\u0131r.",
  sourceKind: { fact: "Onayl\u0131 yan\u0131t", knowledge: "Bilgi notu", evidence: "Kan\u0131t kayd\u0131", web: "Web sayfas\u0131" },
  sourceStatus: {
    approved: "Onayl\u0131",
    shared: "Payla\u015F\u0131lan not: bir fikir, olgu de\u011Fil",
    verified: "Do\u011Fruland\u0131",
    recorded: "Kaydedildi, do\u011Frulanmad\u0131",
    not_available: "Bu s\xFCr\xFCmde yok"
  },
  sourcesHidden: "{count} i\xE7 kaynak herkese a\xE7\u0131k s\xFCr\xFCmde g\xF6sterilmez.",
  sourcesNone: "Hen\xFCz hi\xE7bir madde kaynak belirtmedi.",
  sourceMark: "Kaynaklar",
  idsTitle: "Madde kimlikleri ve kaynaklar",
  idsLead: "Marka deposunda d\xFCzenlemek i\xE7in. Bir madde d\xFCzenlendi\u011Finde veya ta\u015F\u0131nd\u0131\u011F\u0131nda kimli\u011Fi de\u011Fi\u015Fmez.",
  idsColItem: "Madde",
  idsColId: "Kimlik",
  idsColSources: "Kaynak referanslar\u0131",
  editHint: "Listeler marka deposunda d\xFCzenlenir: npm run brand:interview -- --question <id> --entity add|edit|move|remove|list (--sources ref,ref). Studio yaln\u0131zca g\xF6sterir.",
  openPrint: "Bask\u0131 g\xF6r\xFCn\xFCm\xFCn\xFC a\xE7",
  openPrintPublic: "Herkese a\xE7\u0131k s\xFCr\xFCm\xFC yazd\u0131r",
  backToSwot: "SWOT / TOWS sayfas\u0131na d\xF6n",
  backToVpc: "De\u011Fer \xD6nerisi Kanvas\u0131na d\xF6n",
  printTitle: "Bask\u0131 g\xF6r\xFCn\xFCm\xFC",
  pageSources: "Kaynaklar ve \xE7er\xE7eve",
  linkSwot: "SWOT / TOWS",
  linkVpc: "De\u011Fer \xD6nerisi Kanvas\u0131",
  linksTitle: "Strateji Laboratuvar\u0131nda"
};
var STRATEGY_TEXT = { en: EN2, fa: FA2, tr: TR2 };
function strategyText(lang) {
  return STRATEGY_TEXT[lang];
}

// packages/brand-core/src/visual/audit.ts
var VISUAL_RUBRIC = [
  { level: 1, id: "model", checks: ["model", "core_tests"] },
  { level: 2, id: "languages", checks: ["i18n"] },
  { level: 3, id: "states", checks: ["empty_state", "studio_tests"] },
  { level: 4, id: "publication_safe", checks: ["print", "rtl", "redaction"] },
  { level: 5, id: "release_grade", checks: ["visual_qa", "standards"] }
];
var LEVEL_OF = Object.fromEntries(VISUAL_RUBRIC.flatMap((row) => row.checks.map((check) => [check, row.level])));
var allLangs = (build) => () => VISUAL_LANGS.map(build);
var positioningOnly = (variant) => illustrativeCompetitorComparison(variant).blocks.filter((block) => block.type === "positioning_map");
var VISUAL_MODULES = [
  {
    id: "business_model_canvas",
    title: "Business Model Canvas",
    slice: "V0 + V3.1",
    document_type: "business_model_canvas",
    builder: { file: "packages/brand-core/src/visual/bmc.ts", export: "buildBusinessModelCanvas" },
    core_tests: ["tests/visual-bmc.test.ts"],
    studio_tests: ["tests/studio-visual.test.ts", "tests/studio-visual-browser.test.ts"],
    // V3.1 (structured BMC list zones, repeating_entity) landed inside this module: its catalog is checked here.
    catalogs: ["visual", "entities"],
    empty: () => illustrativeBusinessModelCanvas("en", "internal"),
    public_fixture: () => VISUAL_LANGS.map((lang) => illustrativeBusinessModelCanvas(lang, "public")),
    redaction_test: { file: "tests/visual-publishing.test.ts", pattern: /buildBusinessModelCanvas\(engine, 'public'\)/ },
    print: { file: "tests/studio-visual.test.ts", pattern: /business-model\/print/ },
    rtl: { file: "tests/studio-visual.test.ts", pattern: /dir="rtl"/ },
    baselines: "bmc-a3",
    cites: () => illustrativeBusinessModelCanvas("en", "internal")
  },
  {
    id: "visual_identity",
    title: "Visual identity chapter",
    slice: "V2.1",
    document_type: "visual_identity",
    builder: { file: "packages/brand-core/src/visual/identity.ts", export: "buildVisualIdentity" },
    core_tests: ["tests/visual-identity.test.ts"],
    studio_tests: ["tests/studio-visual-identity.test.ts", "tests/studio-visual-print-book.test.ts"],
    catalogs: ["visual", "identity", "book"],
    empty: () => illustrativeVisualIdentity("internal", "awaiting"),
    public_fixture: () => [illustrativeVisualIdentity("public", "complete"), illustrativeVisualIdentity("public", "awaiting")],
    redaction_test: { file: "tests/visual-publishing.test.ts", pattern: /buildVisualIdentity\(engine, 'public'\)/ },
    print: { file: "tests/studio-visual-identity.test.ts", pattern: /visual-identity\/print/ },
    rtl: { file: "tests/studio-visual-print-book.test.ts", pattern: /dir="rtl"/ },
    baselines: "book-a4",
    cites: () => illustrativeVisualIdentity("internal", "complete")
  },
  {
    id: "mascot_atlas",
    title: "Mascot atlas and evolution sheet",
    slice: "V3.4",
    document_type: "mascot_atlas",
    builder: { file: "packages/brand-core/src/visual/mascot.ts", export: "buildMascotAtlas" },
    core_tests: ["tests/visual-mascot.test.ts"],
    studio_tests: ["tests/studio-visual-mascot.test.ts", "tests/studio-visual-mascot-browser.test.ts"],
    catalogs: ["visual", "mascot"],
    empty: () => illustrativeMascotAtlas("internal", "empty"),
    public_fixture: () => [illustrativeMascotAtlas("public", "partial"), illustrativeMascotAtlas("public", "empty")],
    redaction_test: { file: "tests/visual-publishing.test.ts", pattern: /buildMascotAtlas\(engine, 'public'\)/ },
    print: { file: "tests/studio-visual-mascot.test.ts", pattern: /mascot\/print/ },
    rtl: { file: "tests/studio-visual-mascot.test.ts", pattern: /dir="rtl"/ },
    baselines: null,
    cites: () => illustrativeMascotAtlas("internal", "partial")
  },
  {
    id: "brand_book",
    title: "Full Brand Book",
    slice: "V4.2",
    document_type: "brand_book",
    builder: { file: "packages/brand-core/src/visual/full-book.ts", export: "buildBook" },
    core_tests: ["tests/visual-full-book.test.ts"],
    studio_tests: ["tests/studio-visual-full-book.test.ts"],
    catalogs: ["full_book", "book"],
    empty: { file: "tests/visual-full-book.test.ts", pattern: /every chapter is a designed gap/ },
    public_fixture: () => VISUAL_LANGS.map((lang) => illustrativeBook("brand_book", lang, "public")),
    sentinels: [FIXTURE_DRAFT_SENTINEL, FIXTURE_RESTRICTED_SENTINEL],
    redaction_test: { file: "tests/visual-publishing.test.ts", pattern: /public Brand Book passes the public profile/ },
    print: { file: "tests/studio-visual-full-book.test.ts", pattern: /--doc brand-book/ },
    rtl: { file: "tests/studio-visual-full-book.test.ts", pattern: /dir="\$\{lang === 'fa' \? 'rtl'/ },
    baselines: "brand-book-a4",
    cites: () => illustrativeBook("brand_book", "en", "internal")
  },
  {
    id: "business_report",
    title: "Business Report",
    slice: "V4.2",
    document_type: "business_plan",
    builder: { file: "packages/brand-core/src/visual/full-book.ts", export: "buildBook" },
    core_tests: ["tests/visual-full-book.test.ts"],
    studio_tests: ["tests/studio-visual-full-book.test.ts"],
    catalogs: ["full_book", "book"],
    empty: { file: "tests/visual-full-book.test.ts", pattern: /every chapter is a designed gap/ },
    print: { file: "tests/studio-visual-full-book.test.ts", pattern: /business-report/ },
    rtl: { file: "tests/studio-visual-full-book.test.ts", pattern: /dir="\$\{lang === 'fa' \? 'rtl'/ },
    baselines: "business-report-a4",
    cites: () => illustrativeBook("business_report", "en", "internal")
  },
  {
    id: "competitor_comparison",
    title: "Competitor comparison matrix and price strip",
    slice: "V2.2",
    document_type: "competitor_comparison",
    builder: { file: "packages/brand-core/src/visual/competitors.ts", export: "buildCompetitorComparison" },
    core_tests: ["tests/visual-competitors.test.ts"],
    studio_tests: ["tests/studio-visual-competitors.test.ts", "tests/studio-visual-competitors-browser.test.ts"],
    catalogs: ["visual", "competitor"],
    empty: () => illustrativeCompetitorComparison("empty"),
    print: { file: "tests/studio-visual-competitors.test.ts", pattern: /competitors\/print/ },
    rtl: { file: "tests/studio-visual-competitors.test.ts", pattern: /dir="rtl"/ },
    baselines: null,
    cites: () => illustrativeCompetitorComparison("complete")
  },
  {
    id: "positioning_map",
    title: "Positioning map",
    slice: "V2.3",
    document_type: "competitor_comparison",
    builder: { file: "packages/brand-core/src/visual/competitors.ts", export: "comparisonDocument" },
    core_tests: ["tests/visual-positioning.test.ts"],
    studio_tests: ["tests/studio-visual-positioning.test.ts"],
    catalogs: ["positioning"],
    empty: () => positioningOnly("no_axes"),
    print: { file: "tests/studio-visual-positioning.test.ts", pattern: /print view/ },
    rtl: { file: "tests/studio-visual-positioning.test.ts", pattern: /RTL|dir="rtl"/ },
    baselines: null,
    cites: () => positioningOnly("complete")
  },
  {
    id: "publishing_gallery",
    title: "Publishing gallery and Command Center",
    slice: "V4.1",
    owner_only: true,
    builder: { file: "packages/brand-core/src/visual/publishing.ts", export: "buildPublishingGallery" },
    core_tests: ["tests/visual-publishing.test.ts"],
    studio_tests: ["tests/studio-publishing.test.ts", "tests/studio-publishing-browser.test.ts"],
    catalogs: ["studio.publishing"],
    empty: { file: "tests/visual-publishing.test.ts", pattern: /blocks what a profile may not receive/ },
    print: null,
    rtl: { file: "tests/studio-publishing-browser.test.ts", pattern: /dir="rtl"|rtl/i },
    baselines: null,
    cites: () => null
  },
  {
    id: "swot_tows",
    title: "SWOT / TOWS",
    slice: "V3.2",
    // No publishing document type: the lists are internal; Studio still renders a public edition of designed gaps.
    builder: { file: "packages/brand-core/src/visual/strategy-lists.ts", export: "buildSwotTows" },
    core_tests: ["tests/visual-strategy.test.ts"],
    studio_tests: ["tests/studio-visual-strategy.test.ts"],
    catalogs: ["visual", "strategy"],
    empty: { file: "tests/studio-visual-strategy.test.ts", pattern: /a designed empty quadrant/ },
    public_fixture: allLangs((lang) => illustrativeSwotTows(lang, "public")),
    redaction_test: { file: "tests/visual-strategy.test.ts", pattern: /public shows nothing unpublished/ },
    print: { file: "tests/studio-visual-strategy.test.ts", pattern: /swot-tows\/print/ },
    rtl: { file: "tests/studio-visual-strategy.test.ts", pattern: /text inside the quadrants is right-to-left/ },
    baselines: null,
    cites: () => illustrativeSwotTows("en", "internal")
  },
  {
    id: "value_proposition",
    title: "Value Proposition Canvas",
    slice: "V3.2",
    builder: { file: "packages/brand-core/src/visual/strategy-lists.ts", export: "buildValueProposition" },
    core_tests: ["tests/visual-strategy.test.ts"],
    studio_tests: ["tests/studio-visual-strategy.test.ts"],
    catalogs: ["visual", "strategy"],
    empty: { file: "tests/studio-visual-strategy.test.ts", pattern: /Public edition: these lists are internal[\s\S]*value-proposition[\s\S]*Not published/ },
    public_fixture: allLangs((lang) => illustrativeValueProposition(lang, "public")),
    redaction_test: { file: "tests/visual-strategy.test.ts", pattern: /the public edition drops internal sources/ },
    print: { file: "tests/studio-visual-strategy.test.ts", pattern: /value-proposition\/print/ },
    rtl: { file: "tests/studio-visual-strategy.test.ts", pattern: /faVpc\.text, \/<html lang="fa" dir="rtl">/ },
    baselines: null,
    cites: () => illustrativeValueProposition("en", "internal")
  },
  {
    id: "customer_journey",
    title: "Customer journey swimlane",
    slice: "V3.3",
    document_type: "marketing_plan",
    builder: { file: "packages/brand-core/src/visual/plan.ts", export: "journeyDocument" },
    core_tests: ["tests/visual-plan.test.ts"],
    studio_tests: ["tests/studio-visual-plan.test.ts"],
    catalogs: ["visual", "plan"],
    empty: () => illustrativeJourney("en", "internal", "empty"),
    public_fixture: allLangs((lang) => illustrativeJourney(lang, "public")),
    redaction_test: { file: "tests/visual-plan.test.ts", pattern: /public edition: drafts never appear/ },
    print: { file: "tests/studio-visual-plan.test.ts", pattern: /'market\/customer-journey'[\s\S]*\$\{pathname\}\/print/ },
    rtl: { file: "tests/studio-visual-plan.test.ts", pattern: /the swimlane is not forced left-to-right: it mirrors/ },
    baselines: null,
    cites: () => illustrativeJourney("en", "internal")
  },
  {
    id: "sostac_overview",
    title: "SOSTAC overview",
    slice: "V3.3",
    document_type: "marketing_plan",
    builder: { file: "packages/brand-core/src/visual/plan.ts", export: "sostacDocument" },
    core_tests: ["tests/visual-plan.test.ts"],
    studio_tests: ["tests/studio-visual-plan.test.ts"],
    catalogs: ["visual", "plan"],
    empty: () => illustrativeSostac("en", "internal", "empty"),
    public_fixture: allLangs((lang) => illustrativeSostac(lang, "public")),
    redaction_test: { file: "tests/visual-plan.test.ts", pattern: /public edition: drafts never appear/ },
    print: { file: "tests/studio-visual-plan.test.ts", pattern: /strategy\/sostac\/print/ },
    rtl: { file: "tests/studio-visual-plan.test.ts", pattern: /faPrint\.text, \/<html lang="fa" dir="rtl">/ },
    baselines: null,
    cites: () => illustrativeSostac("en", "internal")
  },
  {
    id: "okr_tree",
    title: "OKR tree",
    slice: "V3.3",
    document_type: "business_plan",
    builder: { file: "packages/brand-core/src/visual/plan.ts", export: "okrDocument" },
    core_tests: ["tests/visual-plan.test.ts"],
    studio_tests: ["tests/studio-visual-plan.test.ts"],
    catalogs: ["visual", "plan"],
    empty: () => illustrativeOkr("en", "internal", "empty"),
    public_fixture: allLangs((lang) => illustrativeOkr(lang, "public")),
    redaction_test: { file: "tests/visual-plan.test.ts", pattern: /public edition: drafts never appear/ },
    print: { file: "tests/studio-visual-plan.test.ts", pattern: /strategy\/okrs\/print/ },
    rtl: { file: "tests/studio-visual-plan.test.ts", pattern: /the progress bar fills from the right in Persian/ },
    baselines: null,
    cites: () => illustrativeOkr("en", "internal")
  }
];

// apps/studio/src/projection.ts
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
var import_yaml = __toESM(require_dist(), 1);
var PREVIEW_MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};
var NO_PREVIEW_STATUSES = /* @__PURE__ */ new Set(["rejected", "retired", "revoked", "deprecated", "archived", "withdrawn", "retracted"]);
var IDENTITY_MASTER_RULE = 3;
var ProjectionError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
};
function display(value2) {
  if (value2 === null || value2 === void 0) return null;
  const text3 = typeof value2 === "string" ? value2 : JSON.stringify(value2);
  return text3.length > 2e3 ? `${text3.slice(0, 2e3)}\u2026` : text3;
}
function readYaml(root, relative, fallback) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return fallback;
  try {
    return (0, import_yaml.parse)(fs.readFileSync(file, "utf8")) ?? fallback;
  } catch {
    return fallback;
  }
}
var SECRET_PATTERNS = [/bos_at_[A-Za-z0-9_-]{20,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/];
function assertNoSecrets(value2) {
  const text3 = JSON.stringify(value2);
  if (SECRET_PATTERNS.some((pattern) => pattern.test(text3))) throw new ProjectionError("unsafe_projection", "The repository content looks like it contains a credential. Studio refused to display it.");
}
var STUDIO_COACH_LIMIT = 5;
function projectCoach(engine, review) {
  try {
    const draftIds = review.filter((item) => item.state === "draft").map((item) => item.question_id);
    const changeIds = review.filter((item) => item.state === "change_pending").map((item) => item.question_id);
    const result = coachBeforeApproval(engine, { draftIds, changeIds }, { moment: "studio_overview", limit: STUDIO_COACH_LIMIT });
    if (result.silent.agent_token || result.silent.unavailable === draftIds.length && draftIds.length > 0) return null;
    const coach = {
      authority: "derived_advice",
      authorizes: [],
      rule_version: result.rule_version,
      checked: result.checked,
      more: result.more,
      notes: result.notes.map((note) => ({
        question_id: note.question_id,
        status: note.status,
        criterion: note.criterion,
        canonical_question_id: note.canonical_question_id,
        text: { en: coachNoteText(note, "en"), fa: coachNoteText(note, "fa"), tr: coachNoteText(note, "tr") }
      }))
    };
    assertNoSecrets(coach);
    return coach;
  } catch {
    return null;
  }
}
function projectKnowledge(engine) {
  try {
    const knowledge = buildStudioKnowledge(engine);
    assertNoSecrets(knowledge);
    return knowledge;
  } catch {
    return null;
  }
}
function projectCalendar(root, slug) {
  try {
    const calendar = buildStudioCalendar(root, slug);
    assertNoSecrets(calendar);
    return calendar;
  } catch {
    return null;
  }
}
function projectStrategy(root, slug) {
  try {
    const strategy = buildStudioStrategy(root, slug);
    assertNoSecrets(strategy);
    return strategy;
  } catch {
    return null;
  }
}
function projectSocialKit(root, slug) {
  try {
    const kit = buildStudioSocialKit(root, slug);
    assertNoSecrets(kit);
    return kit;
  } catch {
    return null;
  }
}
function projectCreative(root, slug) {
  try {
    const creative = buildStudioCreative(root, slug);
    assertNoSecrets(creative);
    return creative;
  } catch {
    return null;
  }
}
function projectVisual(engine, masters, assets, knowledge = null) {
  try {
    const classify = questionClassifier(engine);
    const visual = {
      bmc: { applies: canvasApplies(engine), internal: buildBusinessModelCanvas(engine, "internal"), public: publicEdition(buildBusinessModelCanvas(engine, "public"), classify) },
      identity: { internal: buildVisualIdentity(engine, "internal", { masters }), public: publicEdition(buildVisualIdentity(engine, "public", { masters }), classify), master_rule: IDENTITY_MASTER_RULE },
      competitors: buildCompetitorComparison(engine, readSharedLandscape(engine.workspaceRoot(), engine.config().brand.slug)),
      mascot: { internal: buildMascotAtlas(engine, "internal", { assets }), public: publicEdition(buildMascotAtlas(engine, "public", { assets }), classify) }
    };
    const book = (kind, edition) => buildBook(engine, kind, edition, { identity: visual.identity?.[edition] ?? null, canvas: visual.bmc[edition], competitors: visual.competitors ?? null });
    visual.books = {
      brand_book: { internal: book("brand_book", "internal"), public: publicBook(book("brand_book", "public"), classify) },
      business_report: { internal: book("business_report", "internal"), public: null }
    };
    const sharedNotes = new Map((knowledge?.notes ?? []).map((note) => [note.id, note.title]));
    visual.strategy = {
      swot: { internal: buildSwotTows(engine, "internal", { sharedNotes }), public: buildSwotTows(engine, "public", { sharedNotes }) },
      value_proposition: { internal: buildValueProposition(engine, "internal", { sharedNotes }), public: buildValueProposition(engine, "public", { sharedNotes }) }
    };
    visual.plans = { applies: canvasApplies(engine), internal: buildPlanDocuments(engine, "internal"), public: buildPlanDocuments(engine, "public") };
    assertNoSecrets(visual);
    return visual;
  } catch {
    return null;
  }
}
function publicEdition(doc, classify) {
  const redacted = redactVisualDocument(doc, "public", classify);
  if (!redacted) throw new ProjectionError("unsafe_projection", "A public visual edition was refused by the public profile.");
  return redacted.document;
}
function publicBook(book, classify) {
  const redacted = redactBook(book, "public", classify);
  if (!redacted) throw new ProjectionError("unsafe_projection", "A public book was refused by the public profile.");
  return redacted.document;
}
function projectPublishing(engine, visual) {
  try {
    const gallery = buildPublishingGallery(engine, { bmc: visual?.bmc ?? null, identity: visual?.identity ?? null, mascot: visual?.mascot ?? null, competitors: visual?.competitors ?? null });
    assertNoSecrets(gallery);
    return gallery;
  } catch {
    return null;
  }
}
function engineRecord(root) {
  const file = path.join(root, ".brand-os", "engine", "VERSION");
  if (!fs.existsSync(file)) return null;
  const version = fs.readFileSync(file, "utf8").trim();
  return /^[0-9A-Za-z.+-]{1,60}$/.test(version) ? { version } : null;
}
function templateRecord(root) {
  try {
    const record = readTemplateRecord(root);
    if (!record) return null;
    const repository = record.repository && /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/.test(record.repository) ? record.repository : null;
    return { commit: record.commit, repository };
  } catch {
    return null;
  }
}
function buildProjection(root, expectedSlug) {
  if (!fs.existsSync(path.join(root, "brand", "brand.config.yaml"))) throw new ProjectionError("not_brand_os", "The repository has no brand/brand.config.yaml.");
  const engine = new InterviewEngine(root);
  const config = engine.config();
  if (config.brand.slug !== expectedSlug) {
    throw new ProjectionError("slug_mismatch", "The repository belongs to a different brand slug than the one registered in Studio. Nothing was displayed.");
  }
  const dashboard = buildDashboard(engine, "internal");
  const personal = config.modules.personal?.enabled === true;
  const facets = personal ? [...config.modules.personal?.facets ?? []] : [];
  const documents = {};
  for (const kind of ["brand-book", "business-plan", "marketing-plan"]) documents[kind] = buildNamedDocument(engine, kind, "internal");
  const personalDocs = [];
  if (personal) {
    for (const kind of PERSONAL_DOCUMENT_KINDS) {
      const model = buildNamedDocument(engine, kind, "internal");
      if (model.sections.length > 0) {
        documents[kind] = model;
        personalDocs.push(kind);
      }
    }
  }
  const approvedFacts = readFacts(root, "approved", config.brand.slug);
  const questions = new Map(engine.questions().map((question) => [question.id, question]));
  let restrictedWithheld = 0;
  let approvedCount = 0;
  for (const [id, fact] of Object.entries(approvedFacts)) {
    if (fact.status !== "approved") continue;
    approvedCount += 1;
    if (fact.classification === "restricted" || questions.get(id)?.sensitivity === "restricted") restrictedWithheld += 1;
  }
  const groups = /* @__PURE__ */ new Map();
  for (const module of dashboard.modules) {
    const entry2 = groups.get(module.group) ?? { group: module.group, required: 0, required_approved: 0, required_unanswered: 0, pending_review: 0, applicable: 0 };
    entry2.required += module.required;
    entry2.applicable = (entry2.applicable ?? 0) + module.applicable;
    entry2.required_approved += module.required_approved;
    entry2.required_unanswered += module.required_unanswered;
    entry2.pending_review += module.pending_review;
    groups.set(module.group, entry2);
  }
  const compiled = compileTokens(root);
  const approvals = readYaml(root, "brand/tokens/approvals.yaml", {}).approved ?? {};
  const policy = readPublicationPolicy(root);
  const tokens = Object.entries(compiled.flat).map(([id, token]) => {
    const approved = approvals[id]?.value_sha256 === tokenDigest(token);
    const value2 = token.hex ?? (typeof token.value === "string" || typeof token.value === "number" ? String(token.value) : JSON.stringify(token.value));
    return {
      id,
      type: token.type,
      value: value2.slice(0, 300),
      state: approved ? "approved" : "draft",
      published: approved && policy.approved_token_ids.includes(id),
      source: token.source,
      source_fact: token.sourceFact ?? null,
      example: token.source === "base" && !approved
    };
  });
  const manifest = readYaml(root, "brand/assets/asset-manifest.yaml", {});
  const previews = [];
  const logoCandidates = [];
  const assetCandidates = [];
  const sizes = /* @__PURE__ */ new Map();
  const assets = (manifest.assets ?? []).slice(0, 2e3).flatMap((asset) => {
    if (typeof asset.id !== "string" || typeof asset.path !== "string") return [];
    const status = typeof asset.status === "string" ? asset.status : "unknown";
    const approved = status === "approved" || status === "published";
    const published = approved && policy.approved_asset_ids.includes(asset.id) && rightsBlocker(root, asset) === null;
    const ext = path.extname(asset.path).toLowerCase();
    const mime = PREVIEW_MIME[ext] ?? null;
    let preview_key = null;
    let unavailable_reason = null;
    let unavailable_detail = null;
    const checksum = typeof asset.checksum_sha256 === "string" && /^[0-9a-f]{64}$/.test(asset.checksum_sha256) ? asset.checksum_sha256 : null;
    const draft = !approved && !NO_PREVIEW_STATUSES.has(status);
    if (!approved && !draft) unavailable_reason = "not_approved";
    else if (!mime) unavailable_reason = "unsupported_type";
    else if (!checksum && approved) unavailable_reason = "checksum";
    else {
      const inspected = inspectAssetForPublication(root, asset.path, checksum);
      if (inspected.ok) {
        const bytes = fs.readFileSync(inspected.realPath);
        preview_key = checksum ?? createHash("sha256").update(bytes).digest("hex");
        sizes.set(preview_key, imageSize(bytes, mime));
        previews.push({ key: preview_key, source: inspected.realPath, mime });
      } else {
        unavailable_reason = inspected.reason === "missing" ? "not_present" : inspected.reason === "checksum" ? "checksum" : "unsafe";
        const issues = inspected.issues ?? [];
        const first = issues.find((issue) => !issue.fixable) ?? issues[0];
        if (first) unavailable_detail = { code: first.code, line: first.line, fixable: issues.every((issue) => issue.fixable) };
      }
    }
    const tags = Array.isArray(asset.tags) ? asset.tags.filter((tag) => typeof tag === "string") : [];
    assetCandidates.push({
      asset_id: asset.id.slice(0, 200),
      name: (typeof asset.name === "string" ? asset.name : asset.id).slice(0, 200),
      version: typeof asset.version === "string" ? asset.version.slice(0, 40) : null,
      approved,
      published,
      tags: tags.slice(0, 50),
      example: tags.includes("example") || /EXAMPLE/.test(String(asset.license ?? "")),
      preview_key: approved ? preview_key : null,
      mime: approved && preview_key ? mime : null,
      width: null,
      height: null
    });
    if (tags.includes("logo") || LOGO_ICON_TAGS.some((tag) => tags.includes(tag))) {
      const size = preview_key ? sizes.get(preview_key) ?? null : null;
      logoCandidates.push({
        asset_id: asset.id.slice(0, 200),
        name: (typeof asset.name === "string" ? asset.name : asset.id).slice(0, 200),
        version: typeof asset.version === "string" ? asset.version.slice(0, 40) : null,
        approved,
        published,
        tags: tags.slice(0, 50),
        example: tags.includes("example") || /example/i.test(asset.id) || /EXAMPLE/.test(String(asset.license ?? "")),
        paths: [asset.path, asset.preview].filter((item) => typeof item === "string" && item.length > 0).map((item) => item.slice(0, 500)),
        preview_key: approved ? preview_key : null,
        mime: approved && preview_key ? mime : null,
        width: size?.width ?? null,
        height: size?.height ?? null
      });
    }
    const kind = asset.path.split("/")[2] ?? tags[0] ?? "asset";
    return [
      {
        id: asset.id.slice(0, 200),
        name: (typeof asset.name === "string" ? asset.name : asset.id).slice(0, 200),
        kind: kind.slice(0, 50),
        status,
        visibility: typeof asset.visibility === "string" ? asset.visibility : "internal",
        license: display(asset.license),
        usage: display(asset.usage),
        restrictions: display(asset.restrictions),
        approved,
        published,
        preview_key,
        preview_state: preview_key ? approved ? "approved" : "draft" : null,
        mime: preview_key ? mime : null,
        unavailable_reason,
        unavailable_detail,
        example: isExampleAsset(asset)
      }
    ];
  });
  let mascot = null;
  if (config.modules.mascot.enabled) {
    const catalog = { states: readMascotStates(root) };
    const stages = { stages: readMascotStages(root) };
    const byStatus = {};
    const byCategory = {};
    let ready = 0;
    for (const state2 of catalog.states ?? []) {
      const status = typeof state2.status === "string" ? state2.status : "defined";
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      const category = typeof state2.category === "string" ? state2.category : "other";
      byCategory[category] = (byCategory[category] ?? 0) + 1;
      if ((status === "approved" || status === "published") && Array.isArray(state2.source_assets) && state2.source_assets.length > 0) ready += 1;
    }
    mascot = {
      states: (catalog.states ?? []).length,
      by_status: byStatus,
      by_category: byCategory,
      artwork_ready: ready,
      stages: (stages.stages ?? []).slice(0, 50).map((stage) => ({ id: String(stage.id).slice(0, 100), name: String(stage.name ?? stage.id).slice(0, 100), status: String(stage.status ?? "draft") }))
    };
  }
  const knowledge = projectKnowledge(engine);
  const visual = projectVisual(engine, logoCandidates, assetCandidates, knowledge);
  const book = documents["brand-book"];
  if (book) documents["brand-book"] = { ...book, sections: book.sections.map((section) => section.id === "logo" ? { ...section, status: logoChapterStatus(section.status, visual?.identity?.internal) } : section) };
  const projection = {
    schema_version: 1,
    brand: {
      name: config.brand.name,
      name_status: String(config.brand.name_status ?? "unknown"),
      slug: config.brand.slug,
      profile: config.brand.profile ?? "universal",
      kind: personal || config.brand.profile === "personal-brand" ? "personal-brand" : "business",
      industry: String(config.brand.industry ?? "TBD"),
      default_locale: config.brand.default_locale,
      supported_locales: [...config.brand.supported_locales],
      publish_docs: config.brand.publish_docs,
      status: String(config.brand.status ?? "draft"),
      initialized: config.brand.initialized === true,
      modules: { mascot: config.modules.mascot.enabled, gamification: config.modules.gamification.enabled, personal, facets }
    },
    overview: {
      coverage: dashboard.coverage.coverage,
      approval: dashboard.coverage.approval,
      required: dashboard.coverage.required,
      required_unanswered: dashboard.coverage.required_unanswered,
      pending_review: dashboard.review_queue.pending,
      approved_facts: approvedCount,
      restricted_withheld: restrictedWithheld,
      contradictions: dashboard.contradictions.length,
      groups: [...groups.values()],
      next: dashboard.next.slice(0, 8)
    },
    modules: dashboard.modules,
    review: dashboard.review_queue.items.slice(0, 300).map((item) => ({
      question_id: item.question_id,
      module: item.module,
      label: item.label,
      state: item.state,
      withheld: item.withheld,
      draft_value: item.withheld ? null : display(item.draft_value),
      approved_value: item.withheld ? null : display(item.approved_value),
      approved_version: item.approved_version,
      reason: item.reason
    })),
    contradictions: dashboard.contradictions.slice(0, 100),
    documents,
    tokens: { items: tokens, approved: tokens.filter((token) => token.state === "approved").length, draft: tokens.filter((token) => token.state === "draft").length, errors: compiled.errors.length },
    assets,
    mascot,
    personal: personal ? { facets, documents: personalDocs } : null,
    knowledge,
    creative: projectCreative(root, engine.config().brand.slug),
    calendar: projectCalendar(root, engine.config().brand.slug),
    strategy: projectStrategy(root, engine.config().brand.slug),
    socialKit: projectSocialKit(root, engine.config().brand.slug),
    template: templateRecord(root),
    engine: engineRecord(root),
    visual,
    coach: projectCoach(engine, dashboard.review_queue.items),
    publishing: projectPublishing(engine, visual)
  };
  assertNoSecrets(projection);
  return { projection, previews };
}

// apps/studio/src/views/html.ts
var SafeHtml = class {
  constructor(value2) {
    this.value = value2;
  }
  value;
  toString() {
    return this.value;
  }
};
var ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };
function escapeHtml(value2) {
  return String(value2).replace(/[&<>"'`]/g, (char) => ESCAPES[char] ?? char);
}
function render(value2) {
  if (value2 === null || value2 === void 0 || value2 === false) return "";
  if (Array.isArray(value2)) return value2.map(render).join("");
  if (value2 instanceof SafeHtml) return value2.value;
  return escapeHtml(value2);
}
var RTL_CHAR = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
var LATIN_CHAR = /[A-Za-z\u00C0-\u024F]/;
var TECHNICAL = /\b(?:https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+|[\w./-]*[\w-]\.[A-Za-z0-9]{1,5}\b|[\w-]+(?:\/[\w.-]+)+)/g;
var LTR_RUN = /https?:\/\/[^\s<>"'()[\]{}\u060C\u061B]+|[A-Za-z0-9\u00C0-\u024F][\w\u00C0-\u024F.@/+#&%=~:-]*(?:[ \t]+[A-Za-z0-9\u00C0-\u024F][\w\u00C0-\u024F.@/+#&%=~:-]*)*/g;
var RTL_RUN = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF](?:[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF\s]|\u200C|\u200D)*/g;
function mixedDirection(text3) {
  if (!RTL_CHAR.test(text3) || !LATIN_CHAR.test(text3)) return null;
  let rtl = 0;
  let ltr = 0;
  for (const word of text3.replace(TECHNICAL, " ").split(/\s+/)) {
    if (RTL_CHAR.test(word)) rtl += 1;
    else if (LATIN_CHAR.test(word)) ltr += 1;
  }
  return rtl >= ltr ? "rtl" : "ltr";
}
function bidiMarkup(text3, dir = mixedDirection(text3)) {
  if (!dir) return escapeHtml(text3);
  const pattern = dir === "rtl" ? LTR_RUN : RTL_RUN;
  const runDir = dir === "rtl" ? "ltr" : "rtl";
  let out = "";
  let last = 0;
  for (const match of text3.matchAll(pattern)) {
    let run = match[0];
    run = dir === "rtl" ? run.replace(/[.,;:!?)\]}-]+$/, "") : run.replace(/\s+$/, "");
    const start = match.index ?? 0;
    if (!run || dir === "rtl" && !LATIN_CHAR.test(run)) continue;
    out += escapeHtml(text3.slice(last, start)) + `<bdi class="bidi-run" dir="${runDir}">${escapeHtml(run)}</bdi>`;
    last = start + run.length;
  }
  return out + escapeHtml(text3.slice(last));
}
var NO_BIDI_TAGS = /* @__PURE__ */ new Set(["textarea", "title", "option", "script", "style", "text", "tspan", "textpath"]);
var AUTO_TAG = /^<([A-Za-z][\w-]*)\b[^<>]*\sdir="auto"[^<>]*>\s*$/;
function renderInto(out, value2) {
  if (typeof value2 !== "string" || !RTL_CHAR.test(value2) || !LATIN_CHAR.test(value2)) return { out, text: render(value2) };
  const open = out.lastIndexOf("<");
  const tail = open >= 0 ? out.slice(open) : "";
  const tag = AUTO_TAG.exec(tail);
  if (!tag || NO_BIDI_TAGS.has(tag[1].toLowerCase())) return { out, text: render(value2) };
  const dir = mixedDirection(value2);
  return { out: out.slice(0, open) + tail.replace(/(\s)dir="auto"/, `$1dir="${dir}" data-bidi="mixed"`), text: bidiMarkup(value2, dir) };
}
function html(strings, ...values) {
  let out = strings[0] ?? "";
  for (let index = 0; index < values.length; index += 1) {
    const next = renderInto(out, values[index]);
    out = next.out + next.text + (strings[index + 1] ?? "");
  }
  return new SafeHtml(out);
}
function trusted(markup) {
  return new SafeHtml(markup);
}
function join(items, separator = "") {
  return new SafeHtml(items.map((item) => item.value).join(separator));
}
function safeHex(value2) {
  return typeof value2 === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value2.trim()) ? value2.trim() : null;
}

// apps/studio/src/views/icons.ts
var PATHS = {
  logo: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="4"/><rect x="3" y="13" width="8" height="8" rx="4"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 11h6"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 3"/>',
  handoff: '<path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  dot: '<circle cx="12" cy="12" r="4"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  skip: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 7.5-2"/>',
  git: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7M8.3 7.1l7.4 3.8"/>',
  pr: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M6 8.5v7M18 15.5V9a3 3 0 0 0-3-3h-4M13 3.5 10.5 6 13 8.5"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>'
};
var DIRECTIONAL = /* @__PURE__ */ new Set(["chevron", "logout"]);
function icon(name, className = "") {
  const classes = ["icon", DIRECTIONAL.has(name) ? "icon-dir" : "", className].filter(Boolean).join(" ");
  return trusted(
    `<svg class="${classes}" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`
  );
}

// apps/studio/src/views/visual-primitives.ts
var STATE_META = {
  approved: { tone: "approved", icon: "checkCircle" },
  stale: { tone: "stale", icon: "history" },
  assumption: { tone: "draft", icon: "clock" },
  recommendation: { tone: "suggestion", icon: "sparkle" },
  missing: { tone: "missing", icon: "circle" },
  withheld: { tone: "withheld", icon: "lock" },
  conflicting: { tone: "conflict", icon: "alert" },
  not_applicable: { tone: "na", icon: "skip" }
};
function stateChip(cat, state2) {
  const meta = STATE_META[state2];
  return html`<span class="vz-chip vz-chip--${meta.tone}">${icon(meta.icon)}<span>${cat.state[state2]}</span></span>`;
}
function legend(cat, states) {
  return html`<ul class="vz-legend" aria-label="${cat.text.statusLegend}">${states.map((state2) => html`<li>${stateChip(cat, state2)}</li>`)}</ul>`;
}
function two(n) {
  return String(n).padStart(2, "0");
}
function dateOnly(iso, lang) {
  if (!iso) return null;
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return null;
  return new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeZone: "UTC" }).format(at);
}
function illustrativeStamp(cat, doc) {
  if (!doc.illustrative) return html``;
  return html`<p class="vz-mock" role="note"><strong>${cat.text.illustrative}</strong> <span>${cat.text.illustrativeNote}</span></p>`;
}
function ghostChart(input) {
  const variant = input.variant ?? "lines";
  const body = input.body ? html`<p class="vz-gap-body">${input.body}</p>` : "";
  if (variant === "lines") return html`<div class="vz-gap"><span class="vz-gap-ghost" aria-hidden="true"></span><p class="vz-gap-title">${input.title}</p>${body}</div>`;
  const shapes = variant === "swatches" ? html`<span class="vz-ghost-swatches" aria-hidden="true"><span></span><span></span><span></span><span></span></span>` : variant === "specimen" ? html`<span class="vz-ghost-specimen" aria-hidden="true"><span class="vz-ghost-aa">Aa</span><span class="vz-gap-ghost"></span></span>` : html`<span class="vz-ghost-mark" aria-hidden="true"><span></span></span>`;
  return html`<div class="vz-gap vz-gap--${variant}">${shapes}<p class="vz-gap-title">${input.title}</p>${body}</div>`;
}
function sourceFootnote(cat, lang, source2, extra = []) {
  if (!source2) return html``;
  const approved = dateOnly(source2.approved_at, lang);
  const parts = [html`<span class="vz-foot-label" dir="auto">${source2.label}</span>`];
  if (source2.version !== null) parts.push(html`<span>${fillVisual(cat.text.version, { version: source2.version })}</span>`);
  if (approved) parts.push(html`<span>${fillVisual(cat.text.asOf, { date: approved })}</span>`);
  for (const item of extra) parts.push(html`<span>${item}</span>`);
  return html`<p class="vz-foot"><span class="vz-foot-kind">${cat.text.sourceShort}</span> ${join(parts, '<span class="vz-foot-sep" aria-hidden="true"> \xB7 </span>')} ${stateChip(cat, source2.state)}</p>`;
}
function miniMap(label, cells2, size, linked) {
  const { unitX, unitY } = size;
  const shapes = cells2.map((cell) => {
    const shape = html`<rect class="vz-map-cell vz-map--${cell.state}" x="${cell.x * unitX + 1}" y="${cell.y * unitY + 1}" width="${cell.w * unitX - 2}" height="${cell.h * unitY - 2}" rx="1.5"/><text class="vz-map-num" x="${cell.x * unitX + 4}" y="${cell.y * unitY + 9}">${cell.num}</text>`;
    return linked && cell.href ? html`<a href="${cell.href}" aria-label="${cell.label}"><title>${cell.label}</title>${shape}</a>` : html`<g role="img" aria-label="${cell.label}">${shape}</g>`;
  });
  const box = `0 0 ${size.cols * unitX} ${size.rows * unitY}`;
  if (!linked) return html`<svg class="vz-map" viewBox="${box}" role="img" aria-label="${label}" dir="ltr">${shapes}</svg>`;
  return html`<nav class="vz-map-nav" aria-label="${label}"><svg class="vz-map" viewBox="${box}" dir="ltr" focusable="false">${shapes}</svg></nav>`;
}

// apps/studio/src/views/visual.ts
var ZONE_ICON = { complete: "checkCircle", partial: "clock", missing: "circle", withheld: "lock", not_applicable: "skip" };
function zoneChip(cat, state2) {
  return html`<span class="vz-zchip vz-zchip--${state2}">${icon(ZONE_ICON[state2])}<span>${cat.zoneState[state2]}</span></span>`;
}
function itemNames(block) {
  return new Map(block.zones.flatMap((zone) => zone.entries.flatMap((entry2) => (entry2.items ?? []).map((item) => [item.id, item.name]))));
}
var PRINT_ITEMS = 4;
function itemsView(cat, entry2, items, names2, lang, mode) {
  const spec = entitySpec(entry2.id);
  const numbers4 = new Intl.NumberFormat(lang);
  const shown2 = mode === "print" ? items.slice(0, PRINT_ITEMS) : items;
  const more = items.length - shown2.length;
  return html`<ol class="vz-items" aria-label="${fillVisual(cat.entities.itemCount, { count: numbers4.format(items.length) })}">${shown2.map(
    (item) => html`<li class="vz-item">
      <span class="vz-item-name" dir="auto">${item.name}</span>${item.tags.map((tag) => html` <span class="vz-item-tag">${spec ? entityOptionLabel(spec, tag.field, tag.value, lang) : tag.value}</span>`)}
      ${item.detail ? html`<span class="vz-item-detail" dir="auto">${item.detail}</span>` : ""}
      ${item.links.length ? html`<span class="vz-item-links"><span class="vz-item-links-k">${cat.entities.linkTo}:</span> ${join(
      item.links.map((link) => names2.has(link) ? html`<span class="vz-item-link" dir="auto">${names2.get(link)}</span>` : html`<span class="vz-item-link vz-item-link--hidden">${cat.entities.linkHidden}</span>`),
      ", "
    )}</span>` : ""}
    </li>`
  )}</ol>${more > 0 ? html`<p class="vz-items-more">${fillVisual(cat.entities.moreItems, { count: numbers4.format(more) })}</p>` : ""}`;
}
function entryView(cat, entry2, names2 = /* @__PURE__ */ new Map(), lang = "en", mode = "screen") {
  const meta = STATE_META[entry2.state];
  const body = entry2.items && entry2.items.length ? itemsView(cat, entry2, entry2.items, names2, lang, mode) : entry2.legacy && entry2.value !== null ? html`<p class="vz-entry-value" dir="auto">${entry2.value}</p><p class="vz-legacy">${icon("alert")}<span>${cat.entities.legacy}</span><span class="vz-legacy-hint">${cat.entities.legacyHint}</span></p>` : entry2.state === "withheld" ? html`<p class="vz-entry-value vz-entry-value--withheld">${icon("lock")}<span>${cat.text.withheldValue}</span></p>` : entry2.state === "not_applicable" ? html`<p class="vz-entry-value vz-entry-value--ghost">${entry2.na_reason === "profile" ? cat.text.notApplicableProfile : cat.text.notApplicableZone}</p>` : entry2.value === null ? html`<p class="vz-entry-value vz-entry-value--ghost">${entry2.missing_reason ? cat.missingReason[entry2.missing_reason] : cat.text.noValueYet}</p>` : html`<p class="vz-entry-value" dir="auto">${entry2.value}</p>`;
  return html`<li class="vz-entry vz-entry--${meta.tone}">
    ${body}${entry2.stands_for ? html`<p class="vz-entry-from">${fillVisual(cat.text.standsFor, { id: entry2.id })}</p>` : ""}
    <p class="vz-entry-meta"><span class="vz-entry-label" dir="auto">${entry2.label}</span>${stateChip(cat, entry2.state)}${entry2.version !== null ? html`<span class="vz-entry-version">${fillVisual(cat.text.version, { version: entry2.version })}</span>` : ""}</p>
  </li>`;
}
function emptyListZone(zone) {
  return zone.zone_id in LIST_ZONES && zone.entries.some((entry2) => entitySpec(entry2.id)) && zone.entries.every((entry2) => entry2.value === null && entry2.state !== "withheld");
}
var LIST_ZONES = { key_activities: true, key_resources: true, customer_segments: true, cost_structure: true };
function zoneView(cat, zone, opts, names2 = /* @__PURE__ */ new Map()) {
  const title = cat.zone[zone.zone_id];
  const id = `${opts.idPrefix}-zone-${zone.zone_id}`;
  const gap = zone.entries.length === 0;
  const emptyList = !gap && emptyListZone(zone);
  return html`<article class="vz-zone vz-zone--${zone.zone_id} vz-zstate--${zone.state} vz-o${zone.order}" id="${id}" aria-labelledby="${id}-t" tabindex="-1">
    <header class="vz-zone-head">
      <span class="vz-zone-num" aria-hidden="true">${two(zone.order)}</span>
      <h3 class="vz-zone-title" id="${id}-t">${title.title}</h3>
      ${zoneChip(cat, zone.state)}
    </header>
    <p class="vz-zone-prompt">${title.prompt}</p>
    ${gap ? ghostChart({ title: cat.text.gapTitle }) : emptyList ? ghostChart({ title: cat.entities.emptyTitle[zone.zone_id], body: cat.entities.emptyBody }) : html`<ul class="vz-entries">${zone.entries.map((entry2) => entryView(cat, entry2, names2, opts.lang, opts.mode))}</ul>`}
  </article>`;
}
function canvasView(cat, block, opts) {
  const names2 = itemNames(block);
  const grid = html`<div class="vz-bmc" dir="ltr" role="group" aria-label="${cat.text.canvasTitle}">
    ${block.zones.map((zone) => html`<div class="vz-cell vz-cell--${zone.zone_id}" dir="${cat.dir}">${zoneView(cat, zone, opts, names2)}</div>`)}
  </div>`;
  if (opts.mode === "print") return grid;
  return html`<div class="vz-scroll" tabindex="0" role="region" aria-label="${cat.text.canvasTitle}">${grid}</div>`;
}
var BMC_GEOMETRY = {
  key_partners: [0, 0, 2, 2],
  key_activities: [2, 0, 2, 1],
  key_resources: [2, 1, 2, 1],
  value_propositions: [4, 0, 2, 2],
  customer_relationships: [6, 0, 2, 1],
  channels: [6, 1, 2, 1],
  customer_segments: [8, 0, 2, 2],
  cost_structure: [0, 2, 5, 1],
  revenue_streams: [5, 2, 5, 1]
};
function miniMap2(cat, block, idPrefix, linked) {
  const cells2 = block.zones.map((zone) => {
    const [x, y, w, h] = BMC_GEOMETRY[zone.zone_id] ?? [0, 0, 1, 1];
    return { key: zone.zone_id, x, y, w, h, num: two(zone.order), state: zone.state, label: `${two(zone.order)} ${cat.zone[zone.zone_id].title}: ${cat.zoneState[zone.state]}`, href: `#${idPrefix}-zone-${zone.zone_id}` };
  });
  return miniMap(cat.text.zoneIndex, cells2, { cols: 10, rows: 3, unitX: 20, unitY: 16 }, linked);
}
function summaryView(cat, doc, lang) {
  const numbers4 = new Intl.NumberFormat(lang);
  const order = ["approved", "stale", "assumption", "recommendation", "withheld", "missing", "not_applicable", "conflicting"];
  return html`<dl class="vz-summary">${order.filter((state2) => doc.status_summary[state2] > 0 || state2 === "approved" || state2 === "missing").map((state2) => html`<div class="vz-summary-item vz-summary--${STATE_META[state2].tone}"><dt>${stateChip(cat, state2)}</dt><dd>${numbers4.format(doc.status_summary[state2])}</dd></div>`)}</dl>`;
}
function frameworkPanel(cat, ref, lang, mode) {
  return html`<section class="vz-panel vz-framework" aria-labelledby="vz-fw-${ref.framework_id}">
    <h2 class="vz-panel-title" id="vz-fw-${ref.framework_id}">${cat.text.frameworkTitle}</h2>
    <p class="vz-claim"><span class="vz-claim-kind">${cat.claim[ref.permitted_claim]}</span> <span dir="ltr">${ref.title}</span> <span class="vz-muted" dir="ltr">· ${ref.authority} · ${ref.edition}</span></p>
    <p class="vz-muted" dir="ltr">${ref.usage_note}</p>
    <dl class="vz-meta">
      <div><dt>${cat.text.licence}</dt><dd><code class="vz-code" dir="ltr">${ref.license_status}</code></dd></div>
      <div><dt>${cat.text.sourceLink}</dt><dd>${mode === "screen" ? html`<a href="${ref.source_url}" target="_blank" rel="noopener noreferrer" dir="ltr">${ref.source_url}</a>` : html`<span dir="ltr">${ref.source_url}</span>`}</dd></div>
      <div><dt>${cat.text.checked}</dt><dd>${ref.verified_on ? dateOnly(ref.verified_on, lang) : cat.text.notVerified}</dd></div>
    </dl>
  </section>`;
}
function relationshipsPanel(cat, block) {
  const rel = block?.relationships;
  if (!block || !rel || !rel.modeled) {
    const body = rel && !rel.modeled && rel.reason === "no_list_items" ? cat.entities.linksNoneNoItems : cat.entities.linksNoneProse;
    return html`<section class="vz-panel vz-limits" aria-labelledby="vz-links-title">
    <h2 class="vz-panel-title" id="vz-links-title">${cat.entities.linksTitle}</h2>
    <p>${body}</p>
  </section>`;
  }
  const names2 = itemNames(block);
  const zoneTitle = (zone) => zone ? cat.zone[zone].title : "\u2014";
  return html`<section class="vz-panel vz-links" aria-labelledby="vz-links-title">
    <h2 class="vz-panel-title" id="vz-links-title">${cat.entities.linksTitle}</h2>
    <p class="vz-muted">${cat.entities.linksLead}</p>
    ${rel.links.length === 0 ? html`<p>${cat.entities.linksEmpty}</p>` : html`<table class="vz-table vz-links-table">
      <thead><tr><th scope="col">${cat.entities.linksColFrom}</th><th scope="col">${cat.entities.linksColTo}</th><th scope="col">${cat.entities.linksColState}</th></tr></thead>
      <tbody>${rel.links.map(
    (link) => html`<tr class="vz-link vz-link--${link.state}">
          <td><span class="vz-zone-ref">${zoneTitle(link.from_zone)}</span> <span dir="auto">${names2.get(link.from) ?? ""}</span></td>
          <td><span class="vz-zone-ref">${zoneTitle(link.to_zone)}</span> ${link.state === "resolved" ? html`<span dir="auto">${names2.get(link.to) ?? ""}</span>` : html`<span class="vz-muted">${cat.entities.linkHidden}</span>`}</td>
          <td>${link.state === "resolved" ? cat.entities.linkResolved : cat.entities.linkUnresolved}</td>
        </tr>`
  )}</tbody>
    </table>`}
  </section>`;
}
function citationTable(cat, block, canvas, lang, withValues) {
  const entries2 = new Map(canvas.zones.flatMap((zone) => zone.entries.map((entry2) => [entry2.id, { entry: entry2, zone }])));
  return html`<section class="vz-panel vz-sources" aria-labelledby="vz-sources-title">
    <h2 class="vz-panel-title" id="vz-sources-title">${cat.text.sourcesTitle}</h2>
    <p class="vz-muted">${cat.text.sourcesIntro}</p>
    <table class="vz-table">
      <thead><tr><th scope="col">${cat.text.colField}</th><th scope="col">${cat.text.colState}</th>${withValues ? html`<th scope="col">${cat.text.canvasTitle}</th>` : ""}<th scope="col">${cat.text.colVersion}</th><th scope="col">${cat.text.colApproved}</th><th scope="col">${cat.text.colSources}</th></tr></thead>
      <tbody>${block.items.map((item) => {
    const found = entries2.get(item.id);
    return html`<tr>
          <th scope="row"><span class="vz-zone-ref">${found ? `${two(found.zone.order)} ${cat.zone[found.zone.zone_id].title}` : ""}</span><span class="vz-entry-label" dir="auto">${item.label}</span><code class="vz-code" dir="ltr">${item.id}</code></th>
          <td>${stateChip(cat, item.state)}</td>
          ${withValues ? html`<td class="vz-table-value" dir="auto">${found?.entry.value ?? "\u2014"}</td>` : ""}
          <td>${item.version !== null ? fillVisual(cat.text.version, { version: item.version }) : "\u2014"}</td>
          <td>${dateOnly(item.approved_at, lang) ?? "\u2014"}</td>
          <td>${join((found?.entry.sources ?? []).slice(0, 4).map((source2) => html`<code class="vz-code" dir="ltr">${source2}</code>`), " ")}</td>
        </tr>`;
  })}</tbody>
    </table>
  </section>`;
}
function blocks(doc) {
  const canvas = doc.blocks.find((block) => block.type === "business_model_canvas");
  const citations2 = doc.blocks.find((block) => block.type === "citation_list");
  if (!canvas || !citations2) throw new Error("A business model canvas document needs a canvas and a citation block.");
  return { canvas, citations: citations2 };
}
function printDocument(input) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const { canvas, citations: citations2 } = blocks(doc);
  const internal = doc.audience === "internal";
  const asOf = dateOnly(doc.as_of, lang);
  const edition = internal ? cat.text.editionInternal : cat.text.editionPublic;
  const head2 = html`<header class="vz-print-head">
      <div class="vz-print-titles">
        <p class="vz-kicker"><span class="vz-kicker-bar" aria-hidden="true"></span>${cat.text.canvasKicker}</p>
        <h1 class="vz-print-title">${cat.text.canvasTitle}</h1>
        <p class="vz-print-brand" dir="auto">${doc.brand_name}</p>
      </div>
      <dl class="vz-print-meta">
        <div><dt>${cat.text.classification}</dt><dd><span class="vz-edition vz-edition--${doc.audience}">${edition}</span></dd></div>
        <div><dt>${cat.text.asOfLabel}</dt><dd>${asOf ? fillVisual(cat.text.asOf, { date: asOf }) : cat.text.asOfNone}</dd></div>
        <div><dt>${cat.text.commit}</dt><dd><code class="vz-code" dir="ltr">${input.commit ? input.commit.slice(0, 12) : "\u2014"}</code></dd></div>
      </dl>
    </header>`;
  const foot = (page, n) => html`<footer class="vz-print-foot"><span>${cat.text.runningHead}</span><span dir="auto">${doc.brand_name}</span><span>${internal ? cat.text.classInternal : cat.text.classPublic}</span><span>${page} · <bdi dir="ltr">${n}</bdi></span></footer>`;
  return html`<!doctype html>
<html lang="${lang}" dir="${cat.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="same-origin">
<title>${cat.text.canvasTitle} · ${doc.brand_name}</title>
${input.head}
</head>
<body class="vz-print-body${doc.illustrative ? " vz-is-mock" : ""}">
${input.toolbar}
<main class="vz-print" id="main">
  <section class="vz-page vz-page--canvas" aria-label="${cat.text.pageCanvas}">
    ${illustrativeStamp(cat, doc)}
    ${head2}
    ${canvasView(cat, canvas, { lang, mode: "print", showNext: false, idPrefix: "p" })}
    <div class="vz-print-under">
      ${legend(cat, ["approved", "stale", "assumption", "withheld", "missing", "not_applicable"])}
      <p class="vz-attrib"><span class="vz-claim-kind">${cat.claim.informed_by}</span> <span dir="ltr">Business Model Canvas · Strategyzer</span></p>
    </div>
    ${foot(cat.text.pageCanvas, 1)}
  </section>
  <section class="vz-page vz-page--sources" aria-label="${cat.text.pageSources}">
    ${foot(cat.text.pageSources, 2)}
    ${illustrativeStamp(cat, doc)}
    <div class="vz-sources-grid">
      <div class="vz-main">
        ${citationTable(cat, citations2, canvas, lang, true)}
        ${internal ? html`<section class="vz-panel vz-next-panel"><h2 class="vz-panel-title">${cat.text.nextQuestions}</h2><ul class="vz-next-all">${canvas.zones.filter((zone) => zone.next_questions.length).map((zone) => html`<li><strong>${two(zone.order)} ${cat.zone[zone.zone_id].title}</strong> ${join(zone.next_questions.map((q) => html`<code class="vz-code" dir="ltr">${q.id}</code>`), " ")}</li>`)}</ul></section>` : ""}
      </div>
      <div class="vz-side">
        <section class="vz-panel"><h2 class="vz-panel-title">${cat.text.summaryTitle}</h2>${summaryView(cat, doc, lang)}${miniMap2(cat, canvas, "p", false)}<p class="vz-muted vz-edition-note">${internal ? cat.text.editionInternalNote : cat.text.editionPublicNote} ${cat.text.gapBody}</p></section>
        ${frameworkPanel(cat, doc.framework_refs[0], lang, "print")}
        ${relationshipsPanel(cat, canvas)}
      </div>
    </div>
  </section>
</main>
</body>
</html>`;
}

// apps/studio/src/views/visual-identity.ts
function numbers(lang) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });
}
function ratioText(ctx, ratio) {
  return fillVisual(ctx.cat.identity.ratio, { ratio: numbers(ctx.lang).format(ratio) });
}
function plateHead(n, id, title, lead, state2, ref = null) {
  return html`<header class="vz-plate-head">
    <p class="vz-plate-num"><span>${typeof n === "number" ? two(n) : n}</span>${state2}</p>
    <h2 class="vz-plate-title" id="${id}-t">${title}${ref ?? ""}</h2>
    <p class="vz-plate-lead">${lead}</p>
  </header>`;
}
function footParts(ctx, entry2, extra = []) {
  const approved = dateOnly(entry2.approved_at, ctx.lang);
  const parts = [html`<span class="vz-foot-label" dir="auto">${entry2.label}</span>`];
  if (entry2.version !== null) parts.push(html`<span>${fillVisual(ctx.cat.text.version, { version: entry2.version })}</span>`);
  if (approved) parts.push(html`<span>${fillVisual(ctx.cat.text.asOf, { date: approved })}</span>`);
  for (const item of extra) parts.push(html`<span dir="auto">${item}</span>`);
  return html`<span class="vz-foot-kind">${ctx.cat.text.sourceShort}</span> ${join(parts, '<span class="vz-foot-sep" aria-hidden="true"> \xB7 </span>')} ${stateChip(ctx.cat, entry2.state)}`;
}
function plateFoot(ctx, entry2, extra = []) {
  return html`<p class="vz-foot">${footParts(ctx, entry2, extra)}</p>`;
}
function awaiting(ctx, input) {
  const t2 = ctx.cat.identity;
  return html`<div class="vz-await">
    <div class="vz-await-art">${ghostChart({ title: t2.awaitingKicker, variant: input.variant })}</div>
    <div class="vz-await-copy">
      <p class="vz-await-kicker">${icon("clock")}<span>${t2.awaitingKicker}</span></p>
      <h3 class="vz-await-title">${input.title}</h3>
      <p class="vz-await-body">${input.body}</p>
      <ul class="vz-await-reasons">${input.reasons.map((reason) => html`<li>${reason.state ? stateChip(ctx.cat, reason.state) : ""}<span>${reason.text}</span></li>`)}</ul>
      ${ctx.showNext && input.steps.length ? html`<div class="vz-await-steps"><p class="vz-await-steps-title">${t2.awaitingStepsTitle}</p><ol>${input.steps.map((step) => html`<li dir="auto">${step}</li>`)}</ol></div>` : ""}
    </div>
  </div>`;
}
function entryReason(ctx, entry2) {
  const t2 = ctx.cat.identity;
  if (entry2.state === "assumption" || entry2.state === "recommendation") return { text: t2.awaitingDraft, state: entry2.state };
  if (entry2.state === "withheld") return { text: t2.awaitingWithheld, state: "withheld" };
  return { text: entry2.missing_reason ? ctx.cat.missingReason[entry2.missing_reason] : ctx.cat.text.noValueYet, state: entry2.state };
}
function inkOn(hex) {
  return contrastRatio("#121212", hex) >= contrastRatio("#FFFFFF", hex) ? "#121212" : "#FFFFFF";
}
function levelMarks(ctx, pair) {
  const t2 = ctx.cat.identity;
  const mark = (ok, label) => html`<li class="vz-level vz-level--${ok ? "pass" : "fail"}">${icon(ok ? "checkCircle" : "circle")}<span><span class="vz-level-verdict">${ok ? t2.passes : t2.fails}</span> ${label}</span></li>`;
  return html`<ul class="vz-levels">${mark(pair.aa_normal, t2.normalText)}${mark(pair.aa_large, t2.largeText)}${mark(pair.aaa_normal, t2.enhanced)}</ul>`;
}
function hexMap(block) {
  return new Map(block.colors.map((color) => [color.role, color.hex]));
}
function swatchList(block, ctx, colors) {
  const t2 = ctx.cat.identity;
  return html`<ul class="vz-swatches" aria-label="${t2.rolesTitle}">${colors.map((color) => {
    const hex = safeHex(color.hex) ?? "#000000";
    return html`<li class="vz-swatch">
      <svg class="vz-swatch-chip" dir="ltr" role="img" aria-label="${color.role} ${hex}"><rect width="100%" height="100%" fill="${hex}"/><rect width="100%" height="100%" fill="none" class="vz-swatch-edge"/><text x="10" y="88%" fill="${inkOn(hex)}" direction="ltr" class="vz-swatch-aa">Aa</text></svg>
      <p class="vz-swatch-role" dir="ltr">${color.role}</p>
      <p class="vz-swatch-values" dir="ltr"><span>${hex}</span><span>RGB ${color.rgb.join(" ")}</span></p>
    </li>`;
  })}</ul>`;
}
function comboList(block, ctx, pairs) {
  const t2 = ctx.cat.identity;
  const hexOf = hexMap(block);
  return html`<ul class="vz-combos">${pairs.map((pair) => {
    const fg = safeHex(hexOf.get(pair.foreground)) ?? "#000000";
    const bg = safeHex(hexOf.get(pair.background)) ?? "#FFFFFF";
    const label = fillVisual(t2.textOn, { fg: pair.foreground, bg: pair.background });
    return html`<li class="vz-combo">
          <svg class="vz-combo-chip" dir="ltr" viewBox="0 0 240 120" role="img" aria-label="${label}"><rect width="240" height="120" fill="${bg}"/><rect x="0.5" y="0.5" width="239" height="119" fill="none" class="vz-swatch-edge"/><text x="18" y="70" fill="${fg}" direction="ltr" class="vz-combo-aa">Aa</text><text x="18" y="100" fill="${fg}" direction="ltr" class="vz-combo-sample">${t2.sample}</text></svg>
          <div class="vz-combo-meta"><p class="vz-combo-label" dir="ltr">${label}</p><p class="vz-combo-ratio"><bdi dir="ltr">${ratioText(ctx, pair.ratio)}</bdi></p>${levelMarks(ctx, pair)}</div>
        </li>`;
  })}</ul>`;
}
function contrastTable(block, ctx, rows2 = null, caption = null) {
  const t2 = ctx.cat.identity;
  const grid = block.grid;
  const hexOf = hexMap(block);
  const [from, to] = rows2 ?? [0, grid.roles.length];
  return html`<div class="vz-grid-wrap" ${ctx.mode === "screen" ? html`tabindex="0" role="region" aria-label="${t2.gridTitle}"` : ""}><table class="vz-cgrid">
        <caption>${caption ?? t2.gridHint}</caption>
        <thead><tr><th scope="col" class="vz-cgrid-corner">${t2.gridCorner}</th>${grid.roles.map((role) => html`<th scope="col" dir="ltr"><svg class="vz-cgrid-dot" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" fill="${safeHex(hexOf.get(role)) ?? "#000000"}"/></svg>${role}</th>`)}</tr></thead>
        <tbody>${grid.roles.slice(from, to).map((fg, index) => {
    const row = from + index;
    return html`<tr><th scope="row" dir="ltr"><svg class="vz-cgrid-dot" viewBox="0 0 10 10" aria-hidden="true"><rect width="10" height="10" fill="${safeHex(hexOf.get(fg)) ?? "#000000"}"/></svg>${fg}</th>${grid.roles.map((bg, col) => {
      if (row === col) return html`<td class="vz-cgrid-self">—</td>`;
      const ratio = grid.ratios[row][col];
      const level = ratio >= 7 ? "aaa" : ratio >= 4.5 ? "aa" : ratio >= 3 ? "large" : "low";
      return html`<td class="vz-cgrid-cell vz-cgrid--${level}"><span class="vz-cgrid-ratio">${numbers(ctx.lang).format(ratio)}</span></td>`;
    })}</tr>`;
  })}</tbody>
      </table></div>`;
}
function gridKey() {
  return html`<p class="vz-grid-key"><span class="vz-key vz-cgrid--aaa">7+</span><span class="vz-key vz-cgrid--aa">4.5+</span><span class="vz-key vz-cgrid--large">3+</span><span class="vz-key vz-cgrid--low">&lt; 3</span></p>`;
}
function colorPaletteView(block, ctx) {
  const t2 = ctx.cat.identity;
  const id = "vi-color";
  const ready = block.colors.length > 0;
  const head2 = plateHead(ctx.plateNum?.(1) ?? 1, id, t2.colorTitle, t2.colorLead, ready ? html`<span class="vz-plate-state vz-plate-state--ready">${t2.ready}</span>` : html`<span class="vz-plate-state">${t2.waiting}</span>`, ready && ctx.note ? ctx.note(block.source) : null);
  if (!ready) {
    const steps = [fillVisual(t2.stepApprove, { label: block.source.label })];
    return html`<section class="vz-plate vz-plate--color" id="${id}" aria-labelledby="${id}-t">${head2}${awaiting(ctx, { variant: "swatches", title: t2.awaitingColorTitle, body: t2.awaitingColorBody, reasons: [entryReason(ctx, block.source)], steps })}</section>`;
  }
  const swatches2 = swatchList(block, ctx, block.colors);
  const combos = block.combinations.length ? comboList(block, ctx, block.combinations) : html`<p class="vz-note">${t2.combinationsNone}</p>`;
  const grid = block.grid ? contrastTable(block, ctx) : html`<p class="vz-note">${fillVisual(t2.gridOmitted, { count: 10 })}</p>`;
  return html`<section class="vz-plate vz-plate--color" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    <h3 class="vz-sub">${t2.rolesTitle}</h3>
    ${swatches2}
    <div class="vz-plate-split">
      <div><h3 class="vz-sub">${t2.combinationsTitle}</h3><p class="vz-note">${t2.combinationsLead}</p>${combos}</div>
      <div><h3 class="vz-sub">${t2.contrastTitle}</h3><p class="vz-note">${t2.contrastLead}</p>${grid}${gridKey()}</div>
    </div>
    ${ctx.note ? "" : plateFoot(ctx, block.source)}
  </section>`;
}
var BUNDLED = { inter: "Studio Inter", rajdhani: "Studio Rajdhani", vazirmatn: "Studio Vazirmatn" };
function familyList(role, script) {
  const names2 = [role.family, ...role.fallback].map((name) => name.replace(/["'<>&;{}\\]/g, "").trim()).filter(Boolean);
  const withBundled = names2.flatMap((name) => BUNDLED[name.toLowerCase()] ? [BUNDLED[name.toLowerCase()], name] : [name]);
  if (script === "fa") {
    const generic = withBundled.findIndex((name) => /^(serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-[a-z-]+)$/i.test(name));
    const at = generic === -1 ? withBundled.length : generic;
    withBundled.splice(at, 0, "Studio Vazirmatn", "Vazirmatn");
  }
  return withBundled.map((name) => /\s/.test(name) ? `'${name}'` : name).join(", ");
}
function fit(sample, size, width) {
  const max = Math.max(8, Math.floor(width / (size * 0.55)));
  if (sample.length <= max) return sample;
  const words = sample.split(" ");
  let out = "";
  for (const word of words) {
    if ((out ? `${out} ${word}` : word).length > max) break;
    out = out ? `${out} ${word}` : word;
  }
  return out || sample.slice(0, max);
}
function typeRoleItem(block, role, ctx) {
  const t2 = ctx.cat.identity;
  const n = numbers(ctx.lang);
  const size = role.size_px ?? 16;
  const lh = role.line_height ?? 1.3;
  const rowH = Math.ceil(size * lh + 18);
  const lines = block.scripts.map((script) => {
    const sample = fit(t2.specimenLine[script], size, ctx.mode === "print" ? 440 : 620);
    const rtl = script === "fa";
    return html`<div class="vz-spec-line"><p class="vz-spec-script">${t2.scriptName[script]}</p><svg class="vz-spec-svg" dir="${rtl ? "rtl" : "ltr"}" width="100%" height="${rowH}" role="img" aria-label="${role.role}, ${t2.scriptName[script]}: ${sample}"><text x="${rtl ? "100%" : 0}" y="${Math.round(size * 0.95 + 6)}" font-family="${familyList(role, script)}" font-size="${size}" direction="${rtl ? "rtl" : "ltr"}" text-anchor="start" class="vz-spec-text" ${rtl ? html`lang="fa"` : html`lang="${script}"`}>${sample}</text></svg></div>`;
  });
  return html`<li class="vz-type-role">
      <div class="vz-type-meta">
        <p class="vz-type-name" dir="ltr">${role.role}</p>
        <svg class="vz-type-aa" dir="ltr" viewBox="0 0 120 96" role="img" aria-label="${role.family}"><text x="0" y="78" font-family="${familyList(role, "en")}" font-size="84" direction="ltr" class="vz-spec-text">Aa</text></svg>
        <dl class="vz-type-dl">
          <div><dt class="vz-vh">${t2.familyLabel}</dt><dd class="vz-type-family" dir="ltr">${role.family}</dd></div>
          <div><dt>${t2.fallbackLabel}</dt><dd dir="ltr">${role.fallback.join(", ")}</dd></div>
          <div><dt class="vz-vh">${t2.scaleLabel}</dt><dd>${role.size_px !== null ? fillVisual(t2.sizeLabel, { size: n.format(role.size_px) }) : t2.sizeUnset}${role.line_height !== null ? html` · ${fillVisual(t2.lineHeightLabel, { value: n.format(role.line_height) })}` : ""}</dd></div>
        </dl>
      </div>
      <div class="vz-type-specimen">${lines}</div>
    </li>`;
}
function typographySpecimenView(block, ctx) {
  const t2 = ctx.cat.identity;
  const id = "vi-type";
  const ready = block.roles.length > 0;
  const head2 = plateHead(ctx.plateNum?.(2) ?? 2, id, t2.typeTitle, t2.typeLead, ready ? html`<span class="vz-plate-state vz-plate-state--ready">${t2.ready}</span>` : html`<span class="vz-plate-state">${t2.waiting}</span>`, ready && ctx.note ? ctx.note(block.source) : null);
  if (!ready) {
    return html`<section class="vz-plate vz-plate--type" id="${id}" aria-labelledby="${id}-t">${head2}${awaiting(ctx, { variant: "specimen", title: t2.awaitingTypeTitle, body: t2.awaitingTypeBody, reasons: [entryReason(ctx, block.source)], steps: [fillVisual(t2.stepApprove, { label: block.source.label })] })}</section>`;
  }
  const roles = block.roles.map((role) => typeRoleItem(block, role, ctx));
  return html`<section class="vz-plate vz-plate--type" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    <ol class="vz-type-roles">${roles}</ol>
    <p class="vz-note vz-type-note">${t2.fontNote}</p>
    ${ctx.note ? "" : plateFoot(ctx, block.source)}
  </section>`;
}
function clearUnits(spec) {
  return spec.clear_space.unit === "x" ? spec.clear_space.value * 100 : spec.clear_space.value / spec.min_size_px * 100;
}
function constructionDrawing(ctx, block) {
  const t2 = ctx.cat.identity;
  const spec = block.spec;
  const master = block.master;
  const known = master.width !== null && master.height !== null && master.width > 0 && master.height > 0;
  const markH = 100;
  const markW = known ? Math.min(600, Math.max(20, master.width / master.height * 100)) : 100;
  const c = Math.min(200, clearUnits(spec));
  const pad = 46;
  const W = markW + 2 * c + 2 * pad;
  const H = markH + 2 * c + 2 * pad;
  const x0 = pad + c;
  const y0 = pad + c;
  const url = ctx.assetUrl(master.preview_key);
  const clearLabel = spec.clear_space.unit === "x" ? fillVisual(t2.clearSpaceX, { value: numbers(ctx.lang).format(spec.clear_space.value) }) : fillVisual(t2.clearSpacePx, { value: numbers(ctx.lang).format(spec.clear_space.value) });
  const mark = url ? html`<image href="${url}" x="${x0}" y="${y0}" width="${markW}" height="${markH}" preserveAspectRatio="xMidYMid meet"/>` : html`<g class="vz-mockmark"><rect x="${x0}" y="${y0}" width="${markW}" height="${markH}"/><text x="${x0 + markW / 2}" y="${y0 + markH / 2 + 6}" text-anchor="middle">${t2.mockMark}</text></g>`;
  const tick = (x1, y1, x2, y2) => html`<line class="vz-dim" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  return html`<svg class="vz-construct" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t2.clearSpace}: ${clearLabel}" dir="ltr">
    <rect class="vz-clear-zone" x="${pad}" y="${pad}" width="${markW + 2 * c}" height="${markH + 2 * c}"/>
    <rect class="vz-mark-box" x="${x0}" y="${y0}" width="${markW}" height="${markH}"/>
    ${mark}
    ${tick(pad, pad - 14, x0, pad - 14)}${tick(pad, pad - 20, pad, pad - 8)}${tick(x0, pad - 20, x0, pad - 8)}
    <text class="vz-dim-label" x="${pad + c / 2}" y="${pad - 24}" text-anchor="middle">${spec.clear_space.unit === "x" ? `${spec.clear_space.value}x` : `${spec.clear_space.value}px`}</text>
    ${spec.clear_space.unit === "x" ? html`${tick(x0 + markW + c + 14, y0, x0 + markW + c + 14, y0 + markH)}${tick(x0 + markW + c + 8, y0, x0 + markW + c + 20, y0)}${tick(x0 + markW + c + 8, y0 + markH, x0 + markW + c + 20, y0 + markH)}<text class="vz-dim-label" x="${x0 + markW + c + 26}" y="${y0 + markH / 2 + 5}">x</text>` : ""}
  </svg>`;
}
function logoConstructionView(block, ctx) {
  const t2 = ctx.cat.identity;
  const id = "vi-logo";
  const ready = block.spec !== null && block.master !== null;
  const head2 = plateHead(ctx.plateNum?.(3) ?? 3, id, t2.logoTitle, t2.logoLead, ready ? html`<span class="vz-plate-state vz-plate-state--ready">${t2.ready}</span>` : html`<span class="vz-plate-state">${t2.waiting}</span>`, ready && ctx.note ? ctx.note(block.source, [block.master.name]) : null);
  if (!ready) {
    const reasons = [];
    const steps = [];
    if (!block.spec) {
      const reason = entryReason(ctx, block.source);
      reasons.push({ text: `${t2.awaitingSpec} ${reason.text}`, state: reason.state });
      steps.push(fillVisual(t2.stepApprove, { label: block.source.label }));
    }
    if (!block.master) {
      reasons.push({ text: t2.awaitingMaster[block.master_state === "approved" ? "missing" : block.master_state], state: null });
      const candidates = ctx.doc.audience === "internal" && ctx.showNext ? block.candidates ?? [] : [];
      if (candidates.length) reasons.push({ text: fillVisual(t2.masterCandidates, { ids: candidates.join(", ") }), state: null });
      steps.push(block.master_state === "ambiguous" ? t2.stepMasterAmbiguous : block.master_state === "not_previewable" ? t2.stepMasterNotPreviewable : t2.stepMaster);
    }
    return html`<section class="vz-plate vz-plate--logo" id="${id}" aria-labelledby="${id}-t">${head2}${awaiting(ctx, { variant: "mark", title: t2.awaitingLogoTitle, body: t2.awaitingLogoBody, reasons, steps })}${ctx.mode === "screen" ? logoSystemView(block, ctx) : ""}</section>`;
  }
  const spec = block.spec;
  const master = block.master;
  const n = numbers(ctx.lang);
  const url = ctx.assetUrl(master.preview_key);
  const clearLabel = spec.clear_space.unit === "x" ? fillVisual(t2.clearSpaceX, { value: n.format(spec.clear_space.value) }) : fillVisual(t2.clearSpacePx, { value: n.format(spec.clear_space.value) });
  const minimum = url ? html`<img class="vz-min-img" src="${url}" alt="${master.name}" height="${spec.min_size_px}" decoding="async">` : html`<svg class="vz-min-img" viewBox="0 0 ${Math.round((master.width && master.height ? master.width / master.height : 1) * spec.min_size_px)} ${spec.min_size_px}" height="${spec.min_size_px}" width="${Math.round((master.width && master.height ? master.width / master.height : 1) * spec.min_size_px)}" role="img" aria-label="${t2.mockMark}"><rect class="vz-mockmark-min" width="100%" height="100%"/></svg>`;
  const known = master.width !== null && master.height !== null;
  const badges2 = ctx.doc.audience === "internal" && master.badges.length ? html`<span class="vz-master-badges">${master.badges.map((badge) => html`<span class="vz-chip vz-chip--draft vz-master-badge" data-badge="${badge}">${t2.masterBadge[badge]}</span>`)}</span>` : "";
  return html`<section class="vz-plate vz-plate--logo" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    <div class="vz-logo-layout">
      <figure class="vz-logo-figure">${constructionDrawing(ctx, block)}<figcaption class="vz-note">${t2.constructionNote}${known ? "" : html` ${t2.constructionUnknownSize}`}</figcaption></figure>
      <div class="vz-logo-side">
        <dl class="vz-spec">
          <div><dt>${t2.clearSpace}</dt><dd>${clearLabel}</dd></div>
          <div><dt>${t2.minSize}</dt><dd>${fillVisual(t2.sizeLabel, { size: n.format(spec.min_size_px) })}</dd></div>
          <div><dt>${t2.minPrint}</dt><dd>${spec.min_print_mm !== null ? html`<bdi dir="ltr">${n.format(spec.min_print_mm)} mm</bdi>` : t2.notSet}</dd></div>
          <div><dt>${t2.masterFile}</dt><dd dir="auto">${master.name}${master.version ? html` <span class="vz-muted" dir="ltr">v${master.version}</span>` : ""}${badges2}</dd></div>
        </dl>
        <figure class="vz-min"><div class="vz-min-stage">${minimum}</div><figcaption class="vz-note">${t2.drawnAtMin}</figcaption></figure>
      </div>
    </div>
    ${ctx.mode === "screen" ? logoSystemView(block, ctx) : ""}
    ${ctx.note ? "" : plateFoot(ctx, block.source, [master.name])}
  </section>`;
}
function variantBadges(ctx, variant) {
  const t2 = ctx.cat.identity;
  return ctx.doc.audience === "internal" && variant.badges.length ? html`<span class="vz-master-badges">${variant.badges.map((badge) => html`<span class="vz-chip vz-chip--draft vz-master-badge" data-badge="${badge}">${t2.masterBadge[badge]}</span>`)}</span>` : "";
}
function variantImage(ctx, variant, className, size = null) {
  const url = ctx.assetUrl(variant.preview_key);
  const dims = size === null ? "" : html` width="${size}" height="${size}"`;
  return url ? html`<img class="${className}" src="${url}" alt="${variant.name}"${dims} decoding="async">` : html`<svg class="${className}" viewBox="0 0 120 40" role="img" aria-label="${ctx.cat.identity.mockMark}"${dims}><rect class="vz-mockmark-min" width="100%" height="100%"/></svg>`;
}
function logoSystemView(block, ctx) {
  const system = block.system;
  if (!system) return html``;
  const t2 = ctx.cat.identity;
  const internal = ctx.doc.audience === "internal";
  const caption = (variant, label) => html`<figcaption class="vz-note"><span class="vz-logo-plate-label">${label}</span> <span dir="auto">${variant.name}</span>${variant.version ? html` <span class="vz-muted" dir="ltr">v${variant.version}</span>` : ""}${variantBadges(ctx, variant)}${internal && variant.role_by === "file_name" ? html`<span class="vz-logo-role-note">${t2.roleByFileName}</span>` : ""}</figcaption>`;
  const plate = (role, label) => {
    const variant = system[role];
    const tone = role === "on_light" ? "light" : "dark";
    if (!variant) return internal ? html`<figure class="vz-logo-plate vz-logo-plate--${tone} is-empty" data-role="${role}"><div class="vz-logo-plate-stage"></div><figcaption class="vz-note"><span class="vz-logo-plate-label">${label}</span> ${t2.variantMissing[role]}</figcaption></figure>` : "";
    return html`<figure class="vz-logo-plate vz-logo-plate--${tone}" data-role="${role}"><div class="vz-logo-plate-stage">${variantImage(ctx, variant, "vz-logo-plate-img")}</div>${caption(variant, label)}</figure>`;
  };
  const icon2 = system.icon;
  const sizes = [[16, t2.iconFavicon], [32, t2.iconFavicon], [48, t2.iconFavicon], [96, t2.iconAvatar], [160, t2.iconAvatar]];
  const n = numbers(ctx.lang);
  const iconPart = icon2 ? html`<figure class="vz-logo-icon" data-role="icon"><ul class="vz-logo-icon-sizes">${sizes.map(([size, label]) => html`<li class="vz-logo-icon-size${label === t2.iconAvatar ? " vz-logo-icon-size--avatar" : ""}">${variantImage(ctx, icon2, "vz-logo-icon-img", size)}<span class="vz-note">${label} · ${fillVisual(t2.sizeLabel, { size: n.format(size) })}</span></li>`)}</ul>${caption(icon2, t2.iconTitle)}</figure>` : internal ? html`<p class="vz-note vz-logo-icon is-empty" data-role="icon">${t2.variantMissing.icon}</p>` : "";
  return html`<div class="vz-logo-system">
    <h3 class="vz-sub">${t2.systemTitle}</h3>
    <p class="vz-note">${t2.systemLead}</p>
    <div class="vz-logo-plates">${plate("on_light", t2.plateOnLight)}${plate("on_dark", t2.plateOnDark)}</div>
    ${iconPart}
  </div>`;
}
function sourceRows(block, ctx) {
  const cat = ctx.cat;
  const logo = ctx.doc.blocks.find((item) => item.type === "logo_construction");
  return {
    items: block.items.map((item) => html`<tr>
        <th scope="row"><span class="vz-entry-label" dir="auto">${item.label}</span><code class="vz-code" dir="ltr">${item.id}</code></th>
        <td>${stateChip(cat, item.state)}</td>
        <td>${item.version !== null ? fillVisual(cat.text.version, { version: item.version }) : "\u2014"}</td>
        <td>${dateOnly(item.approved_at, ctx.lang) ?? "\u2014"}</td>
      </tr>`),
    master: logo?.master ? html`<tr><th scope="row"><span class="vz-entry-label" dir="auto">${cat.identity.masterFile}: ${logo.master.name}</span><code class="vz-code" dir="ltr">${logo.master.asset_id}</code></th><td>${stateChip(cat, "approved")}</td><td>${logo.master.version ? html`<span dir="ltr">v${logo.master.version}</span>` : "\u2014"}</td><td>—</td></tr>` : null
  };
}
function sourcesHead(cat) {
  return html`<thead><tr><th scope="col">${cat.text.colField}</th><th scope="col">${cat.text.colState}</th><th scope="col">${cat.text.colVersion}</th><th scope="col">${cat.text.colApproved}</th></tr></thead>`;
}
function identitySources(block, ctx) {
  const cat = ctx.cat;
  const rows2 = sourceRows(block, ctx);
  return html`<section class="vz-panel vz-sources" aria-labelledby="vi-sources-title">
    <h2 class="vz-panel-title" id="vi-sources-title">${cat.text.sourcesTitle}</h2>
    <p class="vz-muted">${cat.identity.sourcesIntro}</p>
    <table class="vz-table">
      ${sourcesHead(cat)}
      <tbody>${rows2.items}
      ${rows2.master ?? ""}
      </tbody>
    </table>
  </section>`;
}
function frameworkNote(cat, ref, mode, lang) {
  return html`<section class="vz-panel vz-framework" aria-labelledby="vi-fw-${ref.framework_id}">
    <h2 class="vz-panel-title" id="vi-fw-${ref.framework_id}">${cat.text.frameworkTitle}</h2>
    <p class="vz-claim"><span class="vz-claim-kind">${cat.claim[ref.permitted_claim]}</span> <span dir="ltr">${ref.title}</span> <span class="vz-muted" dir="ltr">· ${ref.authority} · ${ref.edition}</span></p>
    <p class="vz-muted" dir="ltr">${ref.usage_note}</p>
    <dl class="vz-meta">
      <div><dt>${cat.text.licence}</dt><dd><code class="vz-code" dir="ltr">${ref.license_status}</code></dd></div>
      <div><dt>${cat.text.sourceLink}</dt><dd>${mode === "screen" ? html`<a href="${ref.source_url}" target="_blank" rel="noopener noreferrer" dir="ltr">${ref.source_url}</a>` : html`<span dir="ltr">${ref.source_url}</span>`}</dd></div>
      <div><dt>${cat.text.checked}</dt><dd>${ref.verified_on ? dateOnly(ref.verified_on, lang) : cat.text.notVerified}</dd></div>
    </dl>
  </section>`;
}

// apps/studio/src/views/visual-competitors.ts
var CELL_META = {
  present: { tone: "present", icon: "checkCircle" },
  unverified: { tone: "unverified", icon: "info" },
  historical: { tone: "historical", icon: "history" },
  conflicting: { tone: "conflicting", icon: "alert" },
  needs_review: { tone: "review", icon: "refresh" },
  absent: { tone: "absent", icon: "skip" },
  unknown: { tone: "unknown", icon: "circle" }
};
function text2(ctx) {
  return competitorText(ctx.lang);
}
function criterionLabel(t2, criterion) {
  return t2.criteria[criterion] ?? criterion;
}
function cellMark(t2, state2) {
  const meta = CELL_META[state2];
  return html`<span class="vz-cmp-mark vz-cmp--${meta.tone}">${icon(meta.icon)}<span>${t2.cellState[state2]}</span></span>`;
}
function footnoteRefs(ctx, notes) {
  if (!notes.length) return html``;
  const fmt = new Intl.NumberFormat(ctx.lang);
  const items = notes.map((n) => ctx.mode === "screen" ? html`<a href="#cmp-fn-${n}" aria-label="${ctx.cat.text.sourceShort} ${fmt.format(n)}">${fmt.format(n)}</a>` : html`<span>${fmt.format(n)}</span>`);
  return html`<sup class="vz-cmp-fn">${join(items, '<span aria-hidden="true">,</span>')}</sup>`;
}
function swatches(cell) {
  const hexes = cell.swatches.map(safeHex).filter((hex) => hex !== null);
  if (!hexes.length) return html``;
  return html`<svg class="vz-cmp-swatches" viewBox="0 0 ${hexes.length * 18} 16" aria-hidden="true" focusable="false">${hexes.map((hex, i) => html`<circle cx="${i * 18 + 8}" cy="8" r="7" fill="${hex}" stroke="#121212" stroke-opacity="0.18"/>`)}</svg>`;
}
function ownCellView(ctx, cell) {
  const t2 = text2(ctx);
  const entry2 = cell.own;
  if (!entry2 || cell.state !== "present") return html`<td class="vz-cmp-cell vz-cmp-cell--own vz-cmp-cell--empty">${entry2 ? stateChip(ctx.cat, entry2.state) : cellMark(t2, "unknown")}</td>`;
  return html`<td class="vz-cmp-cell vz-cmp-cell--own">
    ${swatches(cell)}
    ${cell.labels.map((label) => html`<p class="vz-cmp-label" dir="auto">${label}</p>`)}
    ${entry2.state === "stale" ? stateChip(ctx.cat, "stale") : ""}
  </td>`;
}
function cellView(ctx, cell) {
  const t2 = text2(ctx);
  return html`<td class="vz-cmp-cell vz-cmp-cell--${CELL_META[cell.state].tone}">
    ${cellMark(t2, cell.state)}
    ${cell.labels.length ? html`<ul class="vz-cmp-labels">${cell.labels.map((label) => html`<li dir="auto">${label}</li>`)}</ul>` : ""}
    ${footnoteRefs(ctx, cell.footnotes)}
  </td>`;
}
function rowHead(ctx, row) {
  const t2 = text2(ctx);
  if (row.kind === "own_brand") {
    return html`<th scope="row" class="vz-cmp-row-head vz-cmp-row-head--own"><span class="vz-cmp-own-kicker">${t2.ownBrand}</span><span class="vz-cmp-name" dir="auto">${row.name}</span></th>`;
  }
  const rel = row.relationship.map((r) => t2.relationship[r] ?? r);
  return html`<th scope="row" class="vz-cmp-row-head">
    <span class="vz-cmp-name" dir="auto">${row.name}</span>
    ${rel.length ? html`<span class="vz-cmp-rel">${rel.join(" \xB7 ")}</span>` : ""}
    ${row.markets.length ? html`<span class="vz-cmp-markets"><span class="vz-vh">${t2.markets}: </span><span dir="ltr">${row.markets.join(" \xB7 ")}</span></span>` : ""}
    ${row.official_domain ? html`<span class="vz-cmp-domain">${icon("shield")}<span class="vz-vh">${t2.verifiedDomain}: </span><span dir="ltr">${row.official_domain}</span></span>` : ""}
    ${row.needs_refresh ? html`<span class="vz-cmp-refresh">${icon("history")}<span>${t2.needsRefresh}</span></span>` : ""}
  </th>`;
}
function plateHead2(n, id, title, lead) {
  return html`<header class="vz-plate-head">
    <p class="vz-plate-num"><span>${two(n)}</span></p>
    <h2 class="vz-plate-title" id="${id}-t">${title}</h2>
    <p class="vz-plate-lead">${lead}</p>
  </header>`;
}
function emptyMatrix(ctx, block) {
  const t2 = text2(ctx);
  const withheld = block.share_state === "withheld";
  const sharedEmpty = block.share_state === "shared";
  const title = withheld ? t2.withheldTitle : sharedEmpty ? t2.sharedEmptyTitle : t2.emptyTitle;
  const reason = block.withheld_reason ? t2.withheldReason[block.withheld_reason] ?? block.withheld_reason : "";
  const body = withheld ? fillVisual(t2.withheldBody, { reason }) : sharedEmpty ? t2.sharedEmptyBody : t2.emptyBody;
  const ghostRows = [0, 1, 2, 3];
  return html`<div class="vz-await vz-cmp-await">
    <div class="vz-await-art">
      <div class="vz-cmp-ghost" aria-hidden="true">
        <span class="vz-cmp-ghost-head"></span>${block.criteria.map(() => html`<span class="vz-cmp-ghost-col"></span>`)}
        ${ghostRows.map(() => html`<span class="vz-cmp-ghost-name"></span>${block.criteria.map(() => html`<span class="vz-cmp-ghost-dot"></span>`)}`)}
      </div>
    </div>
    <div class="vz-await-copy">
      <p class="vz-await-kicker">${icon(withheld ? "alert" : "clock")}<span>${t2.pageMatrix}</span></p>
      <h3 class="vz-await-title">${title}</h3>
      <p class="vz-await-body">${body}</p>
      ${ctx.showNext && !withheld ? html`<div class="vz-await-steps"><p class="vz-await-steps-title">${t2.emptyStepsTitle}</p><ol>${t2.emptySteps.map((step) => html`<li dir="auto">${step}</li>`)}</ol></div>` : ""}
    </div>
  </div>`;
}
function competitorMatrixView(block, ctx) {
  const t2 = text2(ctx);
  const competitors = block.rows.filter((row) => row.kind === "competitor");
  const id = "cmp-matrix";
  const head2 = plateHead2(1, id, t2.pageMatrix, t2.matrixCaption);
  if (!competitors.length) return html`<section class="vz-plate vz-cmp-plate" id="${id}" aria-labelledby="${id}-t">${head2}${emptyMatrix(ctx, block)}</section>`;
  const table = html`<table class="vz-cmp-table">
      <caption class="vz-vh">${t2.title}</caption>
      <thead><tr><th scope="col" class="vz-cmp-corner">${t2.competitorCol}</th>${block.criteria.map((criterion) => html`<th scope="col">${criterionLabel(t2, criterion)}</th>`)}</tr></thead>
      <tbody>${block.rows.map((row) => html`<tr class="vz-cmp-row${row.kind === "own_brand" ? " vz-cmp-row--own" : ""}">${rowHead(ctx, row)}${row.cells.map((cell) => row.kind === "own_brand" ? ownCellView(ctx, cell) : cellView(ctx, cell))}</tr>`)}</tbody>
    </table>`;
  const states = ["present", "unverified", "historical", "conflicting", "needs_review", "unknown"];
  return html`<section class="vz-plate vz-cmp-plate" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    ${ctx.mode === "screen" ? html`<div class="vz-cmp-scroll" role="region" aria-labelledby="${id}-t" tabindex="0">${table}</div>` : table}
    <div class="vz-cmp-under">
      <ul class="vz-legend vz-cmp-legend" aria-label="${t2.legendTitle}">${states.map((state2) => html`<li>${cellMark(t2, state2)}</li>`)}</ul>
      <p class="vz-note">${t2.ownRowNote}</p>
    </div>
  </section>`;
}
function priceItem(ctx, row) {
  const t2 = text2(ctx);
  const fmt = new Intl.NumberFormat(ctx.lang, { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(row.amount) ? 0 : 2 });
  const terms = [
    t2.period[row.billing_period] ?? row.billing_period,
    t2.commitment[row.billing_commitment] ?? row.billing_commitment,
    t2.tax[row.tax_inclusion] ?? row.tax_inclusion,
    fillVisual(t2.market, { market: row.market })
  ];
  const rate = t2.rateLabel[row.rate_label] ?? row.rate_label;
  const state2 = t2.priceState[row.state] ?? row.state;
  const standard = row.rate_label === "standard_rate";
  return html`<li class="vz-strip-item vz-strip--${row.state}">
    <p class="vz-strip-who"><span class="vz-strip-name" dir="auto">${row.competitor_name}</span><span class="vz-strip-offer" dir="auto">${row.offer_name}</span></p>
    <p class="vz-strip-amount" dir="ltr"><span class="vz-strip-num">${fmt.format(row.amount)}</span><span class="vz-strip-cur">${row.currency}</span></p>
    <p class="vz-strip-terms">${terms.join(" \xB7 ")}</p>
    ${row.feature_scope ? html`<p class="vz-strip-scope" dir="auto">${row.feature_scope}</p>` : ""}
    <p class="vz-strip-tags"><span class="vz-tag${standard ? "" : " vz-tag--caveat"}">${rate}</span><span class="vz-tag vz-tag--${row.state}">${state2}</span>${footnoteRefs(ctx, [row.footnote])}</p>
  </li>`;
}
function priceStripView(block, ctx) {
  const t2 = text2(ctx);
  const id = "cmp-prices";
  const matrix = ctx.doc.blocks.find((b) => b.type === "competitor_matrix");
  const anyCompetitor = matrix ? matrix.rows.some((row) => row.kind === "competitor") : false;
  if (!anyCompetitor) return html``;
  return html`<section class="vz-plate vz-cmp-plate" id="${id}" aria-labelledby="${id}-t">
    ${plateHead2(2, id, t2.pricesTitle, t2.pricesLead)}
    ${block.groups.length ? join(
    block.groups.map(
      (group) => html`<section class="vz-strip-group" aria-label="${fillVisual(t2.currencyGroup, { currency: group.currency })}">
              <header class="vz-strip-head"><span class="vz-strip-code" dir="ltr">${group.currency}</span><span class="vz-strip-rule" aria-hidden="true"></span></header>
              <ol class="vz-strip">${group.rows.map((row) => priceItem(ctx, row))}</ol>
            </section>`
    )
  ) : html`<p class="vz-note">${t2.noPrices}</p>`}
    ${block.unpriced.length ? html`<div class="vz-strip-unpriced"><p class="vz-sub">${t2.unpricedTitle}</p><ul>${block.unpriced.map((name) => html`<li><span dir="auto">${name}</span>${cellMark(t2, "unknown")}</li>`)}</ul><p class="vz-note">${t2.unpricedBody}</p></div>` : ""}
    <p class="vz-note vz-strip-noconv">${icon("info")}<span>${t2.noConversion}</span></p>
  </section>`;
}

// apps/studio/src/views/visual-positioning.ts
function mirrorsX(lang) {
  return lang === "fa";
}
var CELL = 96;
var RANGE_INSET = 10;
var STATE_META2 = {
  evidenced: { tone: "present", icon: "checkCircle" },
  stale: { tone: "historical", icon: "history" },
  conflicting: { tone: "conflicting", icon: "alert" },
  needs_review: { tone: "review", icon: "refresh" },
  unknown: { tone: "unknown", icon: "circle" }
};
function ownerWords(label, lang) {
  return (lang === "fa" ? label.fa : lang === "tr" ? label.tr : null) ?? label.en;
}
function stateName(t2, state2, days) {
  return fillVisual(t2.state[state2], { days: days ?? 90 });
}
function stateMark(t2, state2, days) {
  const meta = STATE_META2[state2];
  return html`<span class="vz-cmp-mark vz-cmp--${meta.tone}">${icon(meta.icon)}<span>${stateName(t2, state2, days)}</span></span>`;
}
function bandName(t2, band) {
  return t2.band[band] ?? band;
}
function placeText(t2, placement) {
  if (!placement.bands.length) return t2.state.unknown;
  const first = bandName(t2, placement.bands[0]);
  const last = bandName(t2, placement.bands[placement.bands.length - 1]);
  return first === last ? first : `${first} \u2013 ${last}`;
}
function span(block, placement) {
  const idx = placement.bands.map((band) => block.bands.indexOf(band)).filter((i) => i >= 0);
  if (!idx.length) return [0, 0];
  return [Math.min(...idx), Math.max(...idx)];
}
function pointLabel(t2, point) {
  return point.kind === "own_brand" ? `${t2.ownBrand} \xB7 ${point.name}` : point.name;
}
function pointState(point) {
  const states = [point.x.state, point.y.state];
  if (states.includes("conflicting")) return "conflicting";
  if (states.includes("stale")) return "stale";
  return "evidenced";
}
function layout(block, mirror) {
  const n = Math.max(block.bands.length, 1);
  const size = n * CELL;
  const raw = block.points.map((point) => {
    const [x0, x1] = span(block, point.x);
    const [y0, y1] = span(block, point.y);
    const cx = ((x0 + x1) / 2 + 0.5) * CELL;
    const cy = size - ((y0 + y1) / 2 + 0.5) * CELL;
    const range = x0 !== x1 || y0 !== y1 ? { x0: x0 * CELL + RANGE_INSET, x1: (x1 + 1) * CELL - RANGE_INSET, y0: size - (y1 + 1) * CELL + RANGE_INSET, y1: size - y0 * CELL - RANGE_INSET } : null;
    return { point, cx, cy, range };
  });
  const groups = /* @__PURE__ */ new Map();
  for (const item of raw) {
    const key = `${item.cx},${item.cy}`;
    groups.set(key, [...groups.get(key) ?? [], item]);
  }
  for (const group of groups.values()) group.forEach((item, k) => item.cx += (k - (group.length - 1) / 2) * 34);
  if (mirror)
    for (const item of raw) {
      item.cx = size - item.cx;
      if (item.range) item.range = { ...item.range, x0: size - item.range.x1, x1: size - item.range.x0 };
    }
  return { size, placed: raw };
}
function marker(ctx, t2, block, item) {
  const { point, cx, cy } = item;
  const fmt = new Intl.NumberFormat(ctx.lang);
  const state2 = pointState(point);
  const aria = fillVisual(t2.pointAria, { name: pointLabel(t2, point), x: placeText(t2, point.x), y: placeText(t2, point.y), state: stateName(t2, state2, block.stale_after_days) });
  const ring = state2 === "stale" ? html`<circle class="vz-pos-stale" cx="${cx}" cy="${cy}" r="21"/>` : "";
  const shape = point.kind === "own_brand" ? html`<rect class="vz-pos-own" x="${cx - 12}" y="${cy - 12}" width="24" height="24" transform="rotate(45 ${cx} ${cy})"/>` : html`<circle class="vz-pos-dot" cx="${cx}" cy="${cy}" r="14"/><text class="vz-pos-num" x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central">${fmt.format(point.n ?? 0)}</text>`;
  return html`<g class="vz-pos-point vz-pos-point--${state2}" role="img" aria-label="${aria}"><title>${aria}</title>${ring}${shape}</g>`;
}
function plot(ctx, t2, block) {
  const mirror = mirrorsX(ctx.lang);
  const { size, placed: placed2 } = layout(block, mirror);
  const n = block.bands.length;
  const lines = Array.from({ length: Math.max(n - 1, 0) }, (_, i) => (i + 1) * CELL);
  const mid = size / 2;
  const x = block.axes ? ownerWords(block.axes.x.label, ctx.lang) : "";
  const y = block.axes ? ownerWords(block.axes.y.label, ctx.lang) : "";
  const label = fillVisual(t2.mapAria, { x, y, count: new Intl.NumberFormat(ctx.lang).format(block.points.length) });
  const ranges = placed2.filter((item) => item.range).map((item) => html`<rect class="vz-pos-range" x="${item.range.x0}" y="${item.range.y0}" width="${item.range.x1 - item.range.x0}" height="${item.range.y1 - item.range.y0}" rx="6"/>`);
  const order = [...placed2.filter((p) => p.point.kind !== "own_brand"), ...placed2.filter((p) => p.point.kind === "own_brand")];
  return html`<svg class="vz-pos-svg" viewBox="-2 -2 ${size + 4} ${size + 4}" role="group" aria-label="${label}" dir="ltr" data-x-direction="${mirror ? "rtl" : "ltr"}" focusable="false">
    <rect class="vz-pos-field" x="0" y="0" width="${size}" height="${size}"/>
    ${lines.map((at) => html`<line class="vz-pos-grid" x1="${at}" y1="0" x2="${at}" y2="${size}"/><line class="vz-pos-grid" x1="0" y1="${at}" x2="${size}" y2="${at}"/>`)}
    <line class="vz-pos-cross" x1="${mid}" y1="0" x2="${mid}" y2="${size}"/><line class="vz-pos-cross" x1="0" y1="${mid}" x2="${size}" y2="${mid}"/>
    <rect class="vz-pos-frame-line" x="0" y="0" width="${size}" height="${size}"/>
    ${ranges}
    ${order.map((item) => marker(ctx, t2, block, item))}
  </svg>`;
}
function figure(ctx, t2, block) {
  const axes = block.axes;
  const words = (l) => ownerWords(l, ctx.lang);
  const mirror = mirrorsX(ctx.lang);
  return html`<figure class="vz-pos-figure">
    <div class="vz-pos-chart${mirror ? " vz-pos-chart--mirrored" : ""}" dir="${mirror ? "rtl" : "ltr"}">
      <div class="vz-pos-yaxis">
        <p class="vz-pos-pole vz-pos-pole--high" dir="auto">${words(axes.y.high)}</p>
        <p class="vz-pos-axis-name"><span class="vz-vh">${t2.axisY}: </span><span class="vz-pos-arrow" aria-hidden="true">↑</span><span dir="auto">${words(axes.y.label)}</span></p>
        <p class="vz-pos-pole vz-pos-pole--low" dir="auto">${words(axes.y.low)}</p>
      </div>
      <div class="vz-pos-plot">${plot(ctx, t2, block)}</div>
      <div class="vz-pos-xaxis">
        <p class="vz-pos-pole vz-pos-pole--low" dir="auto">${words(axes.x.low)}</p>
        <p class="vz-pos-axis-name"><span class="vz-vh">${t2.axisX}: </span><span dir="auto">${words(axes.x.label)}</span><span class="vz-pos-arrow" aria-hidden="true">${mirror ? "\u2190" : "\u2192"}</span></p>
        <p class="vz-pos-pole vz-pos-pole--high" dir="auto">${words(axes.x.high)}</p>
      </div>
    </div>
    <figcaption class="vz-pos-caption">
      <p class="vz-note">${t2.notAMeasurement} ${t2.ownerWords}</p>
      ${block.points.some((p) => p.x.state === "conflicting" || p.y.state === "conflicting") ? html`<p class="vz-note vz-pos-note"><span class="vz-pos-swatch vz-pos-swatch--range" aria-hidden="true"></span><span>${t2.rangeNote}</span></p>` : ""}
      ${block.points.some((p) => p.x.state === "stale" || p.y.state === "stale") ? html`<p class="vz-note vz-pos-note"><span class="vz-pos-swatch vz-pos-swatch--stale" aria-hidden="true"></span><span>${fillVisual(t2.staleNote, { days: block.stale_after_days ?? 90 })}</span></p>` : ""}
    </figcaption>
  </figure>`;
}
function keyMark(ctx, point) {
  if (point.kind === "own_brand") return html`<span class="vz-pos-key-own" aria-hidden="true"></span>`;
  return html`<span class="vz-pos-key-dot" aria-hidden="true">${new Intl.NumberFormat(ctx.lang).format(point.n ?? 0)}</span>`;
}
function axisStates(ctx, t2, block, point) {
  const axes = block.axes;
  const states = [.../* @__PURE__ */ new Set([point.x.state, point.y.state])];
  if (states.length === 1) return stateMark(t2, states[0], block.stale_after_days);
  return html`<span class="vz-pos-states"><span class="vz-pos-state-line"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.x.label, ctx.lang)}</span>${stateMark(t2, point.x.state, block.stale_after_days)}</span><span class="vz-pos-state-line"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.y.label, ctx.lang)}</span>${stateMark(t2, point.y.state, block.stale_after_days)}</span></span>`;
}
function keyTable(ctx, t2, block) {
  const axes = block.axes;
  const own2 = block.points.filter((p) => p.kind === "own_brand");
  const rows2 = [...own2, ...block.points.filter((p) => p.kind !== "own_brand")];
  return html`<table class="vz-pos-key">
    <caption class="vz-sub">${t2.keyTitle}</caption>
    <thead><tr><th scope="col" class="vz-pos-key-n"><span class="vz-vh">#</span></th><th scope="col">${t2.keyName}</th><th scope="col">${t2.keyPlace}</th><th scope="col">${t2.keyState}</th><th scope="col">${t2.keySources}</th></tr></thead>
    <tbody>${rows2.map(
    (point) => html`<tr class="${point.kind === "own_brand" ? "vz-pos-key-row--own" : ""}">
        <td class="vz-pos-key-n">${keyMark(ctx, point)}</td>
        <th scope="row">${point.kind === "own_brand" ? html`<span class="vz-cmp-own-kicker">${t2.ownBrand}</span>` : ""}<span class="vz-pos-key-name" dir="auto">${point.name}</span></th>
        <td><span class="vz-pos-place"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.x.label, ctx.lang)}</span><span>${placeText(t2, point.x)}</span></span><span class="vz-pos-place"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.y.label, ctx.lang)}</span><span>${placeText(t2, point.y)}</span></span></td>
        <td>${axisStates(ctx, t2, block, point)}</td>
        <td>${footnoteRefs(ctx, point.footnotes)}</td>
      </tr>`
  )}</tbody>
  </table>`;
}
function margin(ctx, t2, block) {
  if (!block.unplotted.length || !block.axes) return html``;
  const axes = block.axes;
  return html`<aside class="vz-pos-margin" aria-labelledby="pos-unknown-t">
    <p class="vz-sub" id="pos-unknown-t">${t2.unknownTitle}</p>
    <ul>${block.unplotted.map(
    (point) => html`<li>
        <span class="vz-pos-margin-name">${point.kind === "own_brand" ? html`<span class="vz-cmp-own-kicker">${t2.ownBrand}</span>` : ""}<span dir="auto">${point.name}</span></span>
        <span class="vz-pos-state-line"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.x.label, ctx.lang)}</span>${stateMark(t2, point.x.state, block.stale_after_days)}</span>
        <span class="vz-pos-state-line"><span class="vz-pos-axis-tag" dir="auto">${ownerWords(axes.y.label, ctx.lang)}</span>${stateMark(t2, point.y.state, block.stale_after_days)}</span>
      </li>`
  )}</ul>
    <p class="vz-note">${t2.unknownBody}</p>
  </aside>`;
}
function awaiting2(ctx, t2, block) {
  const withheld = block.share_state === "withheld";
  return html`<div class="vz-await vz-pos-await">
    <div class="vz-await-art"><div class="vz-pos-ghost" aria-hidden="true"><span></span><span></span><span></span><span></span></div></div>
    <div class="vz-await-copy">
      <p class="vz-await-kicker">${icon(withheld ? "alert" : "clock")}<span>${t2.page}</span></p>
      <h3 class="vz-await-title">${withheld ? t2.withheldTitle : t2.emptyTitle}</h3>
      <p class="vz-await-body">${withheld ? t2.withheldBody : t2.emptyBody}</p>
      ${ctx.showNext && !withheld ? html`<div class="vz-await-steps"><p class="vz-await-steps-title">${t2.emptyStepsTitle}</p><ol>${t2.emptySteps.map((step) => html`<li dir="auto">${step}</li>`)}</ol></div>` : ""}
    </div>
  </div>`;
}
var POSITIONING_PLATE = 3;
function positioningMapView(block, ctx) {
  const t2 = positioningText(ctx.lang);
  const id = "cmp-map";
  const head2 = html`<header class="vz-plate-head">
    <p class="vz-plate-num"><span>${two(POSITIONING_PLATE)}</span></p>
    <h2 class="vz-plate-title" id="${id}-t">${t2.title}</h2>
    <p class="vz-plate-lead">${t2.lead}</p>
  </header>`;
  if (!block.axes) return html`<section class="vz-plate vz-cmp-plate vz-pos-plate" id="${id}" aria-labelledby="${id}-t">${head2}${awaiting2(ctx, t2, block)}</section>`;
  return html`<section class="vz-plate vz-cmp-plate vz-pos-plate" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    <div class="vz-pos-layout">
      ${figure(ctx, t2, block)}
      <div class="vz-pos-side">
        ${block.points.length ? keyTable(ctx, t2, block) : html`<div class="vz-pos-nopoints"><p class="vz-sub">${t2.noPointsTitle}</p><p class="vz-note">${t2.noPointsBody}</p></div>`}
        ${margin(ctx, t2, block)}
      </div>
    </div>
  </section>`;
}

// apps/studio/src/views/visual-mascot.ts
function numbers2(lang) {
  return new Intl.NumberFormat(lang);
}
function count(ctx, template, values) {
  const n = numbers2(ctx.lang);
  return fillVisual(template, Object.fromEntries(Object.entries(values).map(([key, value2]) => [key, n.format(value2)])));
}
var GAP_TONE = {
  in_review: { tone: "draft", icon: "clock" },
  not_previewable: { tone: "stale", icon: "history" },
  example_only: { tone: "missing", icon: "circle" },
  not_drawn: { tone: "missing", icon: "circle" },
  not_published: { tone: "withheld", icon: "lock" }
};
function gapChip(t2, gap) {
  const meta = GAP_TONE[gap];
  return html`<span class="vz-chip vz-chip--${meta.tone}" data-gap="${gap}">${icon(meta.icon)}<span>${t2.gap[gap]}</span></span>`;
}
function plateHead3(n, id, title, lead, ready, t2) {
  return html`<header class="vz-plate-head">
    <p class="vz-plate-num"><span>${two(n)}</span><span class="vz-plate-state${ready ? " vz-plate-state--ready" : ""}">${ready ? t2.ready : t2.waiting}</span></p>
    <h2 class="vz-plate-title" id="${id}-t">${title}</h2>
    <p class="vz-plate-lead">${lead}</p>
  </header>`;
}
function emptyFrame(t2, label) {
  return html`<div class="vz-mframe vz-mframe--empty" role="img" aria-label="${t2.placeholderArt}"><span class="vz-mframe-crop" aria-hidden="true"></span>${label ? html`<span class="vz-mframe-label">${label}</span>` : ""}</div>`;
}
function artFrame(ctx, t2, art2, alt) {
  const url = ctx.assetUrl(art2.preview_key);
  if (url) return html`<div class="vz-mframe"><img class="vz-mframe-img" src="${url}" alt="${alt}" loading="lazy" decoding="async"></div>`;
  if (ctx.doc.illustrative) return html`<div class="vz-mframe vz-mframe--mock" role="img" aria-label="${t2.mockArt}"><span class="vz-mframe-crop" aria-hidden="true"></span><span class="vz-mframe-label">${t2.mockArt}</span></div>`;
  return emptyFrame(t2, t2.gap.not_previewable);
}
function badges(ctx, t2, art2) {
  if (ctx.doc.audience !== "internal" || !art2.badges.length) return html``;
  return html`<span class="vz-master-badges">${art2.badges.map((badge) => html`<span class="vz-chip vz-chip--draft vz-master-badge" data-badge="${badge}">${t2.badge[badge]}</span>`)}</span>`;
}
function card(ctx, t2, entry2) {
  const art2 = entry2.artwork;
  const notes = (label, items, kind) => items.length ? html`<div class="vz-mnotes vz-mnotes--${kind}"><p class="vz-mnotes-title">${icon(kind === "do" ? "checkCircle" : "skip")}<span>${label}</span></p><ul>${items.map((item) => html`<li dir="auto">${item}</li>`)}</ul></div>` : "";
  return html`<li class="vz-mcard">
    <figure class="vz-mcard-figure">${artFrame(ctx, t2, art2, entry2.name)}</figure>
    <div class="vz-mcard-body">
      <h4 class="vz-mcard-name" dir="auto">${entry2.name}</h4>
      <p class="vz-mcard-tags">${stateChip(ctx.cat, "approved")}${entry2.mvp ? html`<span class="vz-mtag">${t2.coreSet}</span>` : ""}${badges(ctx, t2, art2)}</p>
      ${entry2.usage ? html`<p class="vz-mcard-use"><span class="vz-mcard-k">${t2.useLabel}</span> <span dir="auto">${entry2.usage}</span></p>` : ""}
      ${notes(t2.doLabel, entry2.do, "do")}
      ${notes(t2.dontLabel, entry2.dont, "dont")}
      <p class="vz-mcard-file"><span class="vz-mcard-k">${t2.artworkFile}</span> <span dir="auto">${art2.name}</span>${art2.version ? html` <span class="vz-muted" dir="ltr">v${art2.version}</span>` : ""}${entry2.variants ? html` · ${count(ctx, t2.variants, { count: entry2.variants })}` : ""}</p>
    </div>
  </li>`;
}
function categories(entries2) {
  return MASCOT_CATEGORIES.map((category) => [category, entries2.filter((entry2) => entry2.category === category)]).filter(([, items]) => items.length > 0);
}
function emptyPlate(ctx, t2, input) {
  return html`<div class="vz-await">
    <div class="vz-await-art">${emptyFrame(t2, t2.awaitingKicker)}</div>
    <div class="vz-await-copy">
      <p class="vz-await-kicker">${icon("clock")}<span>${t2.awaitingKicker}</span></p>
      <h3 class="vz-await-title">${input.title}</h3>
      <p class="vz-await-body">${input.body}</p>
      ${input.reasons.length ? html`<ul class="vz-await-reasons">${input.reasons.map((reason) => html`<li>${reason}</li>`)}</ul>` : ""}
      ${ctx.showNext && input.steps.length ? html`<div class="vz-await-steps"><p class="vz-await-steps-title">${t2.emptyStepsTitle}</p><ol>${input.steps.map((step) => html`<li>${step}</li>`)}</ol></div>` : ""}
    </div>
  </div>`;
}
function plateFoot2(ctx, t2) {
  return html`<p class="vz-foot"><span class="vz-foot-kind">${ctx.cat.text.sourceShort}</span> <span>${t2.neverNote}</span></p>`;
}
function mascotAtlasView(block, ctx) {
  const t2 = mascotText(ctx.lang);
  const id = "ma-atlas";
  const ready = block.counts.drawn > 0;
  const head2 = plateHead3(1, id, t2.atlasTitle, t2.atlasLead, ready, t2);
  const open = (body) => html`<section class="vz-plate vz-plate--atlas" id="${id}" aria-labelledby="${id}-t">${head2}${body}${plateFoot2(ctx, t2)}</section>`;
  if (!block.module_enabled) return open(emptyPlate(ctx, t2, { title: t2.moduleOffTitle, body: t2.moduleOffBody, reasons: [], steps: [] }));
  const internal = ctx.doc.audience === "internal";
  const tally = html`<p class="vz-mtally">
    <span class="vz-mtally-main">${count(ctx, t2.atlasCount, { drawn: block.counts.drawn, states: block.counts.states })}</span>
    ${internal && block.counts.in_review ? html`<span>${count(ctx, t2.inReviewCount, { count: block.counts.in_review })}</span>` : ""}
  </p>`;
  if (!ready) {
    const reasons = [html`${gapChip(t2, internal ? "not_drawn" : "not_published")}<span>${count(ctx, t2.awaitingCount, { count: block.counts.awaiting })}</span>`];
    if (internal && block.counts.in_review) reasons.push(html`${gapChip(t2, "in_review")}<span>${count(ctx, t2.inReviewCount, { count: block.counts.in_review })}</span>`);
    return open(html`${tally}${emptyPlate(ctx, t2, { title: t2.emptyTitle, body: t2.emptyBody, reasons, steps: t2.emptySteps })}`);
  }
  const drawn = categories(block.entries.filter((entry2) => entry2.artwork));
  const waiting = categories(block.entries.filter((entry2) => !entry2.artwork));
  const awaiting3 = internal && waiting.length ? html`<section class="vz-mawait" aria-labelledby="${id}-await">
        <h3 class="vz-sub" id="${id}-await">${t2.awaitingTitle}</h3>
        <p class="vz-note">${t2.awaitingLead}</p>
        <dl class="vz-mawait-list">${waiting.map(([category, items]) => html`<div><dt>${t2.category[category]}</dt><dd><ul>${items.map((entry2) => html`<li${entry2.gap === "in_review" ? html` class="is-review"` : ""}><span dir="auto">${entry2.name}</span>${entry2.gap && entry2.gap !== "not_drawn" ? gapChip(t2, entry2.gap) : ""}</li>`)}</ul></dd></div>`)}</dl>
      </section>` : "";
  return open(html`${tally}
    ${drawn.map(([category, items]) => html`<section class="vz-mgroup" aria-labelledby="${id}-${category}"><h3 class="vz-sub" id="${id}-${category}">${t2.category[category]}</h3><ol class="vz-mcards">${items.map((entry2) => card(ctx, t2, entry2))}</ol></section>`)}
    ${awaiting3}`);
}
function mascotEvolutionView(block, ctx) {
  const t2 = mascotText(ctx.lang);
  const id = "ma-evolution";
  const drawn = block.slots.filter((slot) => slot.artwork).length;
  const head2 = plateHead3(2, id, t2.evolutionTitle, t2.evolutionLead, drawn > 0, t2);
  if (!block.module_enabled) return html`<section class="vz-plate vz-plate--evolution" id="${id}" aria-labelledby="${id}-t">${head2}${emptyPlate(ctx, t2, { title: t2.moduleOffTitle, body: t2.moduleOffBody, reasons: [], steps: [] })}${plateFoot2(ctx, t2)}</section>`;
  const internal = ctx.doc.audience === "internal";
  const slots = block.slots.map((slot) => {
    const label = fillVisual(t2.stageLabel, { n: numbers2(ctx.lang).format(slot.order) });
    const name = slot.name ?? (slot.definition === "not_defined" ? t2.definition.not_defined : t2.stageNameHidden);
    const art2 = slot.artwork ? artFrame(ctx, t2, slot.artwork, `${label}: ${name}`) : emptyFrame(t2, null);
    const definition = slot.definition === "approved" ? "" : internal || slot.definition === "not_defined" ? html`<span class="vz-mtag vz-mtag--${slot.definition}">${t2.definition[slot.definition]}</span>` : "";
    return html`<li class="vz-stage${slot.artwork ? " is-drawn" : ""}">
      <p class="vz-stage-num"><span>${two(slot.order)}</span><span class="vz-vh">${label}</span></p>
      <figure class="vz-stage-figure">${art2}</figure>
      <h3 class="vz-stage-name"${slot.name ? html` dir="auto"` : ""}>${name}</h3>
      <p class="vz-stage-tags">${slot.artwork ? html`${stateChip(ctx.cat, "approved")}${badges(ctx, t2, slot.artwork)}` : gapChip(t2, slot.gap ?? "not_drawn")}${definition}</p>
      ${slot.summary ? html`<p class="vz-stage-summary" dir="auto">${slot.summary}</p>` : ""}
    </li>`;
  });
  return html`<section class="vz-plate vz-plate--evolution" id="${id}" aria-labelledby="${id}-t">
    ${head2}
    <p class="vz-mtally"><span class="vz-mtally-main">${count(ctx, t2.stagesRecorded, { count: block.recorded })}</span>${drawn === 0 ? html`<span>${t2.evolutionEmptyTitle}</span>` : ""}</p>
    <ol class="vz-stages" aria-label="${t2.evolutionTitle}">${slots}</ol>
    ${drawn === 0 ? html`<p class="vz-note">${t2.evolutionEmptyBody}</p>` : ""}
    ${internal && block.example_configuration ? html`<p class="vz-note vz-mexample">${icon("info")}<span>${t2.exampleConfigNote}</span></p>` : ""}
    ${plateFoot2(ctx, t2)}
  </section>`;
}

// apps/studio/src/views/visual-strategy.ts
var PRINT_AREA_ITEMS = 6;
var PRINT_ZONE_ITEMS = 4;
var AREA_ICON = { complete: "checkCircle", partial: "clock", missing: "circle", withheld: "lock", not_applicable: "skip" };
function num2(lang, n) {
  return new Intl.NumberFormat(lang, { minimumIntegerDigits: 2, useGrouping: false }).format(n);
}
function num3(lang, n) {
  return new Intl.NumberFormat(lang, { useGrouping: false }).format(n);
}
function areaChip(cat, state2) {
  return html`<span class="vz-zchip vz-zchip--${state2}">${icon(AREA_ICON[state2])}<span>${cat.zoneState[state2]}</span></span>`;
}
function notesOf(doc) {
  return doc.blocks.find((block) => block.type === "source_notes");
}
function noteNumbers(ctx) {
  return new Map((notesOf(ctx.doc)?.notes ?? []).map((note) => [note.ref, note.n]));
}
function sourceMarks(ctx, item, numbers4) {
  const ns = (item.sources ?? []).map((ref) => numbers4.get(ref)).filter((n) => n !== void 0);
  if (!ns.length) return html``;
  const t2 = strategyText(ctx.lang);
  const marks = ns.map((n) => ctx.mode === "screen" ? html`<a href="#${ctx.doc.document_kind}-src-${n}">${num3(ctx.lang, n)}</a>` : html`<span>${num3(ctx.lang, n)}</span>`);
  return html`<sup class="vz-src" aria-label="${t2.sourceMark} ${ns.map((n) => num3(ctx.lang, n)).join(", ")}">${join(marks, '<span aria-hidden="true">,</span>')}</sup>`;
}
function linkNames(ctx, links, names2) {
  return join(
    links.map((link) => link in names2 ? html`<span class="vz-item-link" dir="auto">${names2[link]}</span>` : html`<span class="vz-item-link vz-item-link--hidden">${ctx.cat.entities.linkHidden}</span>`),
    ", "
  );
}
function itemLinks(ctx, t2, item, names2, otherLabel) {
  if (!item.links.length) return html``;
  const segments = item.links.filter((link) => link.startsWith("seg-"));
  const others = item.links.filter((link) => !link.startsWith("seg-"));
  const row = (label, links) => links.length ? html`<span class="vz-item-links"><span class="vz-item-links-k">${label}:</span> ${linkNames(ctx, links, names2)}</span>` : "";
  return html`${row(t2.forSegment, segments)}${row(otherLabel, others)}`;
}
function itemList(ctx, questionId, items, names2, linkLabel, limit = PRINT_AREA_ITEMS) {
  const t2 = strategyText(ctx.lang);
  const spec = entitySpec(questionId);
  const numbers4 = noteNumbers(ctx);
  const shown2 = ctx.mode === "print" ? items.slice(0, limit) : items;
  const more = items.length - shown2.length;
  return html`<ol class="vz-items vz-sitems" aria-label="${fillVisual(ctx.cat.entities.itemCount, { count: num3(ctx.lang, items.length) })}">${shown2.map(
    (item) => html`<li class="vz-item">
      <span class="vz-item-name" dir="auto">${item.name}</span>${sourceMarks(ctx, item, numbers4)}${item.tags.map((tag) => html` <span class="vz-item-tag">${spec ? entityOptionLabel(spec, tag.field, tag.value, ctx.lang) : tag.value}</span>`)}
      ${item.detail ? html`<span class="vz-item-detail" dir="auto">${item.detail}</span>` : ""}
      ${itemLinks(ctx, t2, item, names2, linkLabel)}
    </li>`
  )}</ol>${more > 0 ? html`<p class="vz-items-more">${fillVisual(ctx.cat.entities.moreItems, { count: num3(ctx.lang, more) })}</p>` : ""}`;
}
function areaBody(ctx, area2, emptyTitle, names2, linkLabel, limit = PRINT_AREA_ITEMS) {
  const entry2 = area2.entry;
  if (entry2?.items?.length) return itemList(ctx, entry2.id, entry2.items, names2, linkLabel, limit);
  if (entry2?.legacy && entry2.value !== null) {
    return html`<p class="vz-entry-value" dir="auto">${entry2.value}</p><p class="vz-legacy">${icon("alert")}<span>${ctx.cat.entities.legacy}</span><span class="vz-legacy-hint">${ctx.cat.entities.legacyHint}</span></p>`;
  }
  if (entry2?.state === "withheld") return html`<p class="vz-entry-value vz-entry-value--withheld">${icon("lock")}<span>${ctx.cat.text.withheldValue}</span></p>`;
  if (entry2?.state === "not_applicable") return html`<p class="vz-entry-value vz-entry-value--ghost">${entry2.na_reason === "profile" ? ctx.cat.text.notApplicableProfile : ctx.cat.text.notApplicableZone}</p>`;
  if (entry2?.stands_for && entry2.value !== null) return html`<p class="vz-entry-value" dir="auto">${entry2.value}</p><p class="vz-entry-from">${fillVisual(ctx.cat.text.standsFor, { id: entry2.id })}</p>`;
  const t2 = strategyText(ctx.lang);
  const reason = entry2?.missing_reason && entry2.missing_reason !== "unanswered" ? ctx.cat.missingReason[entry2.missing_reason] : ctx.doc.audience === "public" ? ctx.cat.missingReason.not_published : t2.emptyBody;
  return ghostChart({ title: emptyTitle, body: reason });
}
function areaMeta(ctx, area2) {
  const entry2 = area2.entry;
  if (!entry2 || entry2.value === null) return areaChip(ctx.cat, area2.state);
  return html`${stateChip(ctx.cat, entry2.state)}${entry2.version !== null ? html`<span class="vz-entry-version">${fillVisual(ctx.cat.text.version, { version: num3(ctx.lang, entry2.version) })}</span>` : ""}`;
}
function plateHead4(ctx, n, id, title, lead, ready) {
  return html`<header class="vz-plate-head">
    <p class="vz-plate-num"><span>${num2(ctx.lang, n)}</span><span class="vz-plate-state${ready ? " vz-plate-state--ready" : ""}">${ready ? ctx.cat.zoneState.complete : ctx.cat.zoneState.partial}</span></p>
    <h2 class="vz-plate-title" id="${id}-t">${title}</h2>
    <p class="vz-plate-lead">${lead}</p>
  </header>`;
}
function swotView(block, ctx) {
  const t2 = strategyText(ctx.lang);
  const id = "st-swot";
  const cells2 = block.quadrants.map((area2) => {
    const q = t2.quadrant[area2.area_id];
    return html`<article class="vz-swot-q vz-swot-q--${area2.area_id} vz-zstate--${area2.state}" dir="${ctx.cat.dir}" aria-labelledby="${id}-${area2.area_id}">
      <header class="vz-swot-head">
        <span class="vz-swot-letter" aria-hidden="true">${area2.area_id.charAt(0).toUpperCase()}</span>
        <h3 class="vz-swot-title" id="${id}-${area2.area_id}">${q.title}</h3>
        <p class="vz-swot-prompt">${q.prompt}</p>
        <p class="vz-swot-meta">${areaMeta(ctx, area2)}</p>
      </header>
      ${areaBody(ctx, area2, q.empty, {}, "")}
    </article>`;
  });
  return html`<section class="vz-plate vz-plate--swot" id="${id}" aria-labelledby="${id}-t">
    ${plateHead4(ctx, 1, id, t2.swotTitle, t2.swotLead, block.data_state === "complete")}
    <div class="vz-swot" dir="ltr" role="group" aria-label="${t2.swotTitle}">
      <span class="vz-swot-axis vz-swot-axis--helpful" dir="${ctx.cat.dir}">${t2.axisHelpful}</span>
      <span class="vz-swot-axis vz-swot-axis--harmful" dir="${ctx.cat.dir}">${t2.axisHarmful}</span>
      <span class="vz-swot-axis vz-swot-axis--internal" dir="${ctx.cat.dir}">${t2.axisInternal}</span>
      <span class="vz-swot-axis vz-swot-axis--external" dir="${ctx.cat.dir}">${t2.axisExternal}</span>
      ${cells2}
    </div>
  </section>`;
}
var TOWS_POSITION = { so: "vz-tows-so", wo: "vz-tows-wo", st: "vz-tows-st", wt: "vz-tows-wt" };
function swotItemsOf(doc, quadrant) {
  const swot = doc.blocks.find((block) => block.type === "swot");
  return swot?.quadrants.find((area2) => area2.area_id === quadrant)?.entry?.items ?? [];
}
function towsView(block, ctx) {
  const t2 = strategyText(ctx.lang);
  const id = "st-tows";
  const strategies = new Map((block.area.entry?.items ?? []).map((item) => [item.id, item]));
  const numbers4 = noteNumbers(ctx);
  const strategy = (item) => html`<li class="vz-item">
    <span class="vz-item-name" dir="auto">${item.name}</span>${sourceMarks(ctx, item, numbers4)}
    ${item.detail ? html`<span class="vz-item-detail" dir="auto">${item.detail}</span>` : ""}
    ${item.links.length ? html`<span class="vz-item-links"><span class="vz-item-links-k">${t2.uses}:</span> ${linkNames(ctx, item.links, block.names)}</span>` : ""}
  </li>`;
  const header = (quadrant, cls) => {
    const items = swotItemsOf(ctx.doc, quadrant);
    const shown2 = ctx.mode === "print" ? items.slice(0, 4) : items;
    return html`<div class="vz-tows-h ${cls}" dir="${ctx.cat.dir}">
      <p class="vz-tows-h-title"><span class="vz-swot-letter" aria-hidden="true">${quadrant.charAt(0).toUpperCase()}</span><span>${t2.quadrant[quadrant].title}</span></p>
      ${shown2.length ? html`<ul class="vz-tows-h-items">${shown2.map((item) => html`<li dir="auto">${item.name}</li>`)}</ul>${items.length > shown2.length ? html`<p class="vz-items-more">${fillVisual(ctx.cat.entities.moreItems, { count: num3(ctx.lang, items.length - shown2.length) })}</p>` : ""}` : html`<p class="vz-tows-h-none">${t2.quadrant[quadrant].empty}</p>`}
    </div>`;
  };
  const cell = (type) => {
    const items = block.cells[type].map((itemId) => strategies.get(itemId)).filter((item) => item !== void 0);
    const shown2 = ctx.mode === "print" ? items.slice(0, PRINT_AREA_ITEMS) : items;
    return html`<article class="vz-tows-cell ${TOWS_POSITION[type]}${items.length ? "" : " is-empty"}" dir="${ctx.cat.dir}" aria-labelledby="${id}-${type}">
      <h3 class="vz-tows-title" id="${id}-${type}">${t2.tows[type].title}</h3>
      <p class="vz-tows-lead">${t2.tows[type].lead}</p>
      ${shown2.length ? html`<ol class="vz-items vz-sitems">${shown2.map(strategy)}</ol>${items.length > shown2.length ? html`<p class="vz-items-more">${fillVisual(ctx.cat.entities.moreItems, { count: num3(ctx.lang, items.length - shown2.length) })}</p>` : ""}` : html`<p class="vz-tows-none">${t2.towsEmptyCell}</p>`}
    </article>`;
  };
  const hasItems = (block.area.entry?.items?.length ?? 0) > 0;
  const unplaced = block.unplaced.map((itemId) => strategies.get(itemId)).filter((item) => item !== void 0);
  const body = hasItems ? html`<div class="vz-tows" dir="ltr" role="group" aria-label="${t2.towsTitle}">
        <span class="vz-tows-corner" aria-hidden="true"></span>
        ${header("strengths", "vz-tows-hs")}${header("weaknesses", "vz-tows-hw")}
        ${header("opportunities", "vz-tows-ho")}${cell("so")}${cell("wo")}
        ${header("threats", "vz-tows-ht")}${cell("st")}${cell("wt")}
      </div>
      ${unplaced.length ? html`<section class="vz-tows-unplaced" aria-labelledby="${id}-unplaced"><h3 class="vz-sub" id="${id}-unplaced">${t2.towsUnplaced}</h3><ol class="vz-items vz-sitems">${unplaced.map(strategy)}</ol></section>` : ""}
      <p class="vz-swot-meta">${areaMeta(ctx, block.area)}</p>` : html`<div class="vz-tows-empty">${areaBody(ctx, block.area, t2.towsEmptyTitle, block.names, t2.uses)}</div>`;
  return html`<section class="vz-plate vz-plate--tows" id="${id}" aria-labelledby="${id}-t">
    ${plateHead4(ctx, 2, id, t2.towsTitle, t2.towsLead, block.data_state === "complete")}
    ${body}
  </section>`;
}
function vpcZone(ctx, block, zoneId) {
  const t2 = strategyText(ctx.lang);
  const area2 = block.zones.find((zone) => zone.area_id === zoneId);
  if (!area2) return html``;
  const z = t2.zone[zoneId];
  return html`<article class="vz-vpc-zone vz-vpc-zone--${zoneId} vz-zstate--${area2.state}" dir="${ctx.cat.dir}" aria-labelledby="vpc-${zoneId}">
    <header class="vz-vpc-head">
      <span class="vz-zone-num" aria-hidden="true">${num2(ctx.lang, area2.order)}</span>
      <h3 class="vz-vpc-title" id="vpc-${zoneId}">${z.title}</h3>
      <p class="vz-vpc-prompt">${z.prompt}</p>
      <p class="vz-swot-meta">${areaMeta(ctx, area2)}</p>
    </header>
    ${areaBody(ctx, area2, z.empty, block.names, t2.addresses, PRINT_ZONE_ITEMS)}
  </article>`;
}
function fitTable(ctx, block, heading = true) {
  const t2 = strategyText(ctx.lang);
  const rows2 = (fit2, colA, colB, none, summary) => {
    if (!fit2.length) return html``;
    const done = fit2.filter((row) => row.addressed_by.length > 0).length;
    return html`<div class="vz-fit-group">
      <p class="vz-fit-summary"><span class="vz-fit-count">${fillVisual(summary, { done: num3(ctx.lang, done), total: num3(ctx.lang, fit2.length) })}</span></p>
      <table class="vz-table vz-fit-table">
        <thead><tr><th scope="col">${colA}</th><th scope="col">${colB}</th></tr></thead>
        <tbody>${fit2.map((row) => html`<tr class="${row.addressed_by.length ? "is-fit" : "is-gap"}"><th scope="row"><span dir="auto">${block.names[row.id] ?? ctx.cat.entities.linkHidden}</span></th><td>${row.addressed_by.length ? html`<span class="vz-fit-mark" aria-hidden="true">${icon("checkCircle")}</span>${linkNames(ctx, row.addressed_by, block.names)}` : html`<span class="vz-fit-gap">${icon("circle")}<span>${none}</span></span>`}</td></tr>`)}</tbody>
      </table>
    </div>`;
  };
  const any = block.fit.pains.length + block.fit.gains.length > 0;
  return html`<section class="vz-fit" id="vpc-fit" aria-labelledby="vpc-fit-t">
    ${heading ? html`<h3 class="vz-sub" id="vpc-fit-t">${t2.fitTitle}</h3><p class="vz-note">${t2.fitLead}</p>` : ""}
    ${any ? html`<div class="vz-fit-grid">${rows2(block.fit.pains, t2.fitColPain, t2.fitColRelievers, t2.fitNoReliever, t2.painsRelieved)}${rows2(block.fit.gains, t2.fitColGain, t2.fitColCreators, t2.fitNoCreator, t2.gainsCreated)}</div>` : html`<p class="vz-note">${t2.fitEmpty}</p>`}
  </section>`;
}
function valuePropositionView(block, ctx) {
  const t2 = strategyText(ctx.lang);
  const id = "vpc-canvas";
  return html`<section class="vz-plate vz-plate--vpc" id="${id}" aria-labelledby="${id}-t">
    ${plateHead4(ctx, 1, id, t2.vpcTitle, t2.vpcLead, block.data_state === "complete")}
    <div class="vz-vpc" dir="ltr" role="group" aria-label="${t2.vpcTitle}">
      <div class="vz-vpc-map" role="group" aria-label="${t2.valueMap}">
        <p class="vz-vpc-label" dir="${ctx.cat.dir}">${t2.valueMap}</p>
        ${vpcZone(ctx, block, "products_services")}${vpcZone(ctx, block, "gain_creators")}${vpcZone(ctx, block, "pain_relievers")}
      </div>
      <span class="vz-vpc-fit" aria-hidden="true"><span></span><span></span></span>
      <div class="vz-vpc-profile" role="group" aria-label="${t2.customerProfile}">
        <p class="vz-vpc-label" dir="${ctx.cat.dir}">${t2.customerProfile}</p>
        ${vpcZone(ctx, block, "gains")}${vpcZone(ctx, block, "pains")}${vpcZone(ctx, block, "customer_jobs")}
      </div>
    </div>
    ${ctx.mode === "screen" ? fitTable(ctx, block) : ""}
  </section>`;
}
function noteLine(ctx, t2, note) {
  const name = note.kind === "web" ? note.host ? ctx.mode === "screen" && note.url ? html`<a href="${note.url}" target="_blank" rel="noopener noreferrer nofollow" dir="ltr">${note.host}</a>` : html`<span dir="ltr">${note.host}</span>` : html`` : note.label ? html`<span dir="auto">${note.label}</span>` : html``;
  return html`<li class="vz-snote vz-snote--${note.status}" id="${ctx.doc.document_kind}-src-${note.n}">
    <span class="vz-snote-n">${num3(ctx.lang, note.n)}</span>
    <span class="vz-snote-body"><span class="vz-snote-kind">${t2.sourceKind[note.kind]}</span>${name}<span class="vz-snote-status">${t2.sourceStatus[note.status]}</span></span>
  </li>`;
}
function sourceNotesView(block, ctx) {
  const t2 = strategyText(ctx.lang);
  return html`<section class="vz-plate vz-plate--snotes" id="${ctx.doc.document_kind}-sources" aria-labelledby="${ctx.doc.document_kind}-sources-t">
    <h2 class="vz-sub" id="${ctx.doc.document_kind}-sources-t">${t2.sourcesTitle}</h2>
    <p class="vz-note">${t2.sourcesLead}</p>
    ${block.notes.length ? html`<ol class="vz-snotes">${block.notes.map((note) => noteLine(ctx, t2, note))}</ol>` : html`<p class="vz-note">${t2.sourcesNone}</p>`}
    ${block.hidden > 0 ? html`<p class="vz-note">${fillVisual(t2.sourcesHidden, { count: num3(ctx.lang, block.hidden) })}</p>` : ""}
  </section>`;
}

// apps/studio/src/views/visual-plan.ts
function numbers3(lang) {
  return new Intl.NumberFormat(lang, { maximumFractionDigits: 4 });
}
function percent(lang, value2) {
  return new Intl.NumberFormat(lang, { style: "percent", maximumFractionDigits: 0 }).format(value2);
}
function labelOf(lang, entry2) {
  return planLabel(lang, entry2.id, entry2.label);
}
function sourceLine(cat, lang, entry2) {
  const version = entry2.version !== null ? [fillVisual(cat.text.version, { version: numbers3(lang).format(entry2.version) })] : [];
  return sourceFootnote(cat, lang, { label: labelOf(lang, entry2), state: entry2.state, version: null, approved_at: entry2.approved_at }, version);
}
var ZONE_ICON2 = { complete: "checkCircle", partial: "clock", missing: "circle", withheld: "lock", not_applicable: "skip" };
function sectionChip(cat, state2) {
  return html`<span class="vz-zchip vz-zchip--${state2}">${icon(ZONE_ICON2[state2])}<span>${cat.zoneState[state2]}</span></span>`;
}
function planEmpty(t2, input) {
  return html`<div class="vz-plan-empty vz-plan-empty--${input.variant}">
    <span class="vz-plan-ghost vz-plan-ghost--${input.variant}" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
    <div class="vz-plan-empty-text">
      <p class="vz-plan-empty-title">${input.title}</p>
      <p class="vz-plan-empty-body">${input.body}</p>
      ${input.steps?.length ? html`<p class="vz-plan-empty-steps-title">${t2.common.emptyStepsTitle}</p><ol class="vz-plan-empty-steps">${input.steps.map((step) => html`<li>${step}</li>`)}</ol>` : ""}
    </div>
  </div>`;
}
function legacyNote(t2, entry2) {
  return html`<div class="vz-plan-legacy">
    ${entry2.value !== null ? html`<p class="vz-entry-value" dir="auto">${entry2.value}</p>` : ""}
    <p class="vz-legacy">${icon("alert")}<span>${t2.common.legacyTitle}</span><span class="vz-legacy-hint">${t2.common.legacyBody}</span></p>
  </div>`;
}
var EMOTION_Y = { very_positive: 14, positive: 32, neutral: 50, negative: 68, very_negative: 86 };
function emotionCell(t2, stages, index, rtl) {
  const stage = stages[index];
  const level = stage.emotion;
  if (!level) return html`<td class="vz-jm-cell vz-jm-cell--emotion vz-jm-cell--empty"><span class="vz-jm-none">${t2.journey.emotionNone}</span></td>`;
  const y = EMOTION_Y[level];
  const prev = stages[index - 1]?.emotion ?? null;
  const next = stages[index + 1]?.emotion ?? null;
  const startY = prev ? (EMOTION_Y[prev] + y) / 2 : null;
  const endY = next ? (EMOTION_Y[next] + y) / 2 : null;
  const leftY = rtl ? endY : startY;
  const rightY = rtl ? startY : endY;
  const points = [leftY !== null ? `0,${leftY}` : null, `50,${y}`, rightY !== null ? `100,${rightY}` : null].filter(Boolean).join(" ");
  return html`<td class="vz-jm-cell vz-jm-cell--emotion">
    <div class="vz-jm-emo vz-jm-emo--${level}">
      <svg class="vz-jm-curve" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <line class="vz-jm-axis" x1="0" y1="50" x2="100" y2="50" vector-effect="non-scaling-stroke"/>
        ${points.includes(" ") ? html`<polyline class="vz-jm-line" points="${points}" fill="none" vector-effect="non-scaling-stroke"/>` : ""}
      </svg>
      <span class="vz-jm-dot" aria-hidden="true"></span>
      <span class="vz-jm-emo-label">${t2.journey.emotion[level]}</span>
    </div>
  </td>`;
}
function laneCell(t2, value2, lane) {
  if (value2 === null) return html`<td class="vz-jm-cell vz-jm-cell--${lane} vz-jm-cell--empty"><span class="vz-jm-none" aria-label="${t2.journey.emotionNone}">${t2.common.noValue}</span></td>`;
  return html`<td class="vz-jm-cell vz-jm-cell--${lane}"><p dir="auto">${value2}</p></td>`;
}
function stageHead(t2, lang, stage) {
  return html`<th scope="col" class="vz-jm-stage">
    <span class="vz-jm-stage-num">${fillVisual(t2.journey.stageNum, { n: numbers3(lang).format(stage.order) })}</span>
    <span class="vz-jm-stage-name" dir="auto">${stage.name}</span>
    ${stage.goal ? html`<span class="vz-jm-goal"><span class="vz-jm-k">${t2.journey.goal}</span> <span dir="auto">${stage.goal}</span></span>` : ""}
    ${stage.segments.length ? html`<span class="vz-jm-segs"><span class="vz-jm-k">${t2.journey.forSegments}</span> ${join(
    stage.segments.map((link) => link.name !== null ? html`<span class="vz-item-tag" dir="auto">${link.name}</span>` : html`<span class="vz-item-tag vz-item-link--hidden">${t2.common.linkHidden}</span>`),
    " "
  )}</span>` : ""}
  </th>`;
}
var TEXT_LANES_TOP = ["touchpoints", "actions"];
var TEXT_LANES_BOTTOM = ["pains", "opportunities"];
function laneHead(t2, lane) {
  return html`<th scope="row" class="vz-jm-lane vz-jm-lane--${lane}"><span class="vz-jm-lane-name">${t2.journey.lane[lane]}</span><span class="vz-jm-lane-hint">${t2.journey.laneHint[lane]}</span></th>`;
}
function journeyView(block, ctx) {
  const { cat, lang, mode } = ctx;
  const t2 = planText(lang);
  const rtl = cat.dir === "rtl";
  const stages = block.stages;
  const hypothesis = block.hypothesis && block.hypothesis.value !== null ? html`<aside class="vz-jm-hypo"><p class="vz-overline">${t2.journey.hypothesisTitle} ${stateChip(cat, block.hypothesis.state)}</p><p class="vz-jm-hypo-text" dir="auto">${block.hypothesis.value}</p></aside>` : "";
  let body;
  if (block.legacy) body = legacyNote(t2, block.source);
  else if (block.source.state === "withheld") body = html`<p class="vz-entry-value vz-entry-value--withheld">${icon("lock")}<span>${cat.text.withheldValue}</span></p>`;
  else if (!stages.length)
    body = planEmpty(t2, { variant: "journey", title: t2.journey.emptyTitle, body: ctx.doc.audience === "public" ? t2.journey.emptyPublic : t2.journey.emptyBody, steps: ctx.showNext ? t2.journey.emptySteps : null });
  else {
    const dense = stages.length > 6 ? " vz-jm--dense" : "";
    body = html`<div class="vz-jm-scroll"${mode === "screen" ? html` role="region" tabindex="0" aria-label="${t2.journey.stagesLabel}"` : ""}>
      <table class="vz-jm vz-jm--n${Math.min(stages.length, 10)}${dense}">
        <caption class="vz-sr">${t2.journey.title}</caption>
        <thead><tr><td class="vz-jm-corner"><span class="vz-jm-corner-k">${t2.journey.lanesLabel}</span> <span aria-hidden="true">${rtl ? "\u2190" : "\u2192"}</span> <span class="vz-jm-corner-k">${t2.journey.stagesLabel}</span></td>${stages.map((stage) => stageHead(t2, lang, stage))}</tr></thead>
        <tbody>
          ${TEXT_LANES_TOP.map((lane) => html`<tr class="vz-jm-row vz-jm-row--${lane}">${laneHead(t2, lane)}${stages.map((stage) => laneCell(t2, stage.lanes[lane], lane))}</tr>`)}
          <tr class="vz-jm-row vz-jm-row--emotion" aria-label="${t2.journey.curveLabel}">${laneHead(t2, "emotion")}${stages.map((_, index) => emotionCell(t2, stages, index, rtl))}</tr>
          ${TEXT_LANES_BOTTOM.map((lane) => html`<tr class="vz-jm-row vz-jm-row--${lane}">${laneHead(t2, lane)}${stages.map((stage) => laneCell(t2, stage.lanes[lane], lane))}</tr>`)}
          ${stages.some((stage) => stage.evidence) ? html`<tr class="vz-jm-row vz-jm-row--evidence"><th scope="row" class="vz-jm-lane vz-jm-lane--evidence"><span class="vz-jm-lane-name">${t2.journey.evidence}</span></th>${stages.map(
      (stage) => stage.evidence ? html`<td class="vz-jm-cell vz-jm-cell--evidence"><p dir="auto">${icon("info")} ${stage.evidence}</p></td>` : html`<td class="vz-jm-cell vz-jm-cell--evidence vz-jm-cell--empty"><span class="vz-jm-none">${t2.common.noValue}</span></td>`
    )}</tr>` : ""}
        </tbody>
      </table>
    </div>`;
  }
  return html`<section class="vz-plan vz-plan--journey" aria-label="${t2.journey.title}">
    ${hypothesis}
    ${body}
    ${block.source.value !== null || block.source.state !== "missing" ? sourceLine(cat, lang, block.source) : ""}
  </section>`;
}
var SOSTAC_LETTER = { situation: "S", objectives: "O", strategy: "S", tactics: "T", action: "A", control: "C" };
var PRINT_ITEMS2 = 4;
function planEntry(cat, t2, lang, entry2, mode) {
  const meta = STATE_META[entry2.state];
  let body;
  if (entry2.items && entry2.items.length) {
    const shown2 = mode === "print" ? entry2.items.slice(0, PRINT_ITEMS2) : entry2.items;
    const more = entry2.items.length - shown2.length;
    body = html`<ol class="vz-items" aria-label="${fillVisual(t2.common.countItems, { count: numbers3(lang).format(entry2.items.length) })}">${shown2.map(
      (item) => html`<li class="vz-item"><span class="vz-item-name" dir="auto">${item.name}</span>${item.detail ? html`<span class="vz-item-detail" dir="auto">${item.detail}</span>` : ""}</li>`
    )}</ol>${more > 0 ? html`<p class="vz-items-more">${fillVisual(cat.entities.moreItems, { count: numbers3(lang).format(more) })}</p>` : ""}`;
  } else if (entry2.legacy && entry2.value !== null) body = html`<p class="vz-entry-value" dir="auto">${entry2.value}</p><p class="vz-legacy">${icon("alert")}<span>${t2.common.legacyTitle}</span></p>`;
  else if (entry2.state === "withheld") body = html`<p class="vz-entry-value vz-entry-value--withheld">${icon("lock")}<span>${cat.text.withheldValue}</span></p>`;
  else if (entry2.state === "not_applicable") body = html`<p class="vz-entry-value vz-entry-value--ghost">${entry2.na_reason === "profile" ? cat.text.notApplicableProfile : cat.text.notApplicableZone}</p>`;
  else if (entry2.value === null) body = html`<p class="vz-entry-value vz-entry-value--ghost">${entry2.missing_reason ? cat.missingReason[entry2.missing_reason] : cat.text.noValueYet}</p>`;
  else body = html`<p class="vz-entry-value" dir="auto">${entry2.value}</p>`;
  return html`<li class="vz-entry vz-entry--${meta.tone}">
    <p class="vz-entry-meta"><span class="vz-entry-label">${labelOf(lang, entry2)}</span>${stateChip(cat, entry2.state)}${entry2.version !== null ? html`<span class="vz-entry-version">${fillVisual(cat.text.version, { version: numbers3(lang).format(entry2.version) })}</span>` : ""}</p>
    ${body}${entry2.stands_for ? html`<p class="vz-entry-from">${fillVisual(cat.text.standsFor, { id: entry2.id })}</p>` : ""}
  </li>`;
}
function sostacStage(cat, t2, lang, section, ctx) {
  const title = t2.sostac.stage[section.stage];
  const id = `${ctx.idPrefix}-sostac-${section.stage}`;
  const visible2 = section.entries.some((entry2) => entry2.value !== null || entry2.state === "withheld");
  const note = section.stage === "objectives" || section.stage === "control" ? t2.sostac.toOkr : null;
  return html`<li class="vz-sos vz-sos--${section.stage} vz-zstate--${section.state}" id="${id}" aria-labelledby="${id}-t">
    <header class="vz-sos-head">
      <span class="vz-sos-letter" aria-hidden="true" dir="ltr">${SOSTAC_LETTER[section.stage]}</span>
      <span class="vz-sos-num" aria-hidden="true">${numbers3(lang).format(section.order)}</span>
      <h3 class="vz-sos-title" id="${id}-t">${title.title}</h3>
      ${sectionChip(cat, section.state)}
    </header>
    <p class="vz-sos-prompt">${title.prompt}</p>
    ${section.entries.length === 0 ? html`<div class="vz-gap"><span class="vz-gap-ghost" aria-hidden="true"></span><p class="vz-gap-title">${t2.sostac.stageEmpty}</p></div>` : !visible2 && ctx.doc.audience === "public" ? html`<div class="vz-gap"><span class="vz-gap-ghost" aria-hidden="true"></span><p class="vz-gap-title">${t2.sostac.emptyPublic}</p></div>` : html`<ul class="vz-entries">${section.entries.map((entry2) => planEntry(cat, t2, lang, entry2, ctx.mode))}</ul>`}
    ${note && ctx.mode === "screen" ? html`<p class="vz-sos-note">${note}</p>` : ""}
  </li>`;
}
function sostacView(block, ctx) {
  const t2 = planText(ctx.lang);
  return html`<section class="vz-plan vz-plan--sostac" aria-label="${t2.sostac.title}">
    <ol class="vz-sostac" aria-label="${t2.sostac.flowLabel}">${block.sections.map((section) => sostacStage(ctx.cat, t2, ctx.lang, section, ctx))}</ol>
  </section>`;
}
var MEASURE_ICON = { measured: "dot", no_baseline: "alert", not_measured: "circle" };
function value(lang, n, unit) {
  if (n === null) return html`<span class="vz-kr-none">—</span>`;
  return html`<span class="vz-kr-num">${numbers3(lang).format(n)}</span> <span class="vz-kr-unit" dir="auto">${unit}</span>`;
}
function progressBar(t2, lang, kr, rtl) {
  if (kr.progress === null) return html``;
  const share = Math.max(0, Math.min(1, kr.progress));
  const width = Math.round(share * 1e3) / 10;
  const x = rtl ? 100 - width : 0;
  const flag = kr.progress >= 1 ? html`<span class="vz-kr-flag vz-kr-flag--done">${icon("check")}<span>${t2.okr.exceeded}</span></span>` : kr.progress < 0 ? html`<span class="vz-kr-flag vz-kr-flag--behind">${icon("alert")}<span>${t2.okr.behind}</span></span>` : "";
  return html`<div class="vz-kr-progress">
    <svg class="vz-kr-bar" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect class="vz-kr-track" x="0" y="0" width="100" height="6" rx="3"/>${width > 0 ? html`<rect class="vz-kr-fill" x="${x}" y="0" width="${width}" height="6" rx="3"/>` : ""}</svg>
    <p class="vz-kr-progress-text">${fillVisual(t2.okr.progress, { pct: percent(lang, kr.progress) })} ${flag}</p>
  </div>`;
}
function krCard(cat, t2, lang, kr, num4, source2, orphan) {
  const measured = kr.measured_on ? dateOnly(`${kr.measured_on}T00:00:00Z`, lang) : null;
  return html`<article class="vz-kr vz-kr--${kr.measure}">
    <header class="vz-kr-head"><span class="vz-kr-k">${t2.okr.keyResult} ${num4}</span>${stateChip(cat, source2.state)}</header>
    <p class="vz-kr-name" dir="auto">${kr.name}</p>
    <dl class="vz-kr-fig">
      <div class="vz-kr-fig--current"><dt>${t2.okr.current}</dt><dd>${value(lang, kr.current, kr.unit)}</dd></div>
      <div class="vz-kr-fig--target"><dt>${t2.okr.target}</dt><dd>${value(lang, kr.target, kr.unit)}</dd></div>
      ${kr.baseline !== null ? html`<div class="vz-kr-fig--baseline"><dt>${t2.okr.baseline}</dt><dd>${value(lang, kr.baseline, kr.unit)}</dd></div>` : ""}
    </dl>
    ${progressBar(t2, lang, kr, cat.dir === "rtl")}
    <p class="vz-kr-measure vz-kr-measure--${kr.measure}">${icon(MEASURE_ICON[kr.measure])}<span>${t2.okr.measure[kr.measure]}</span></p>
    <p class="vz-kr-source"><span class="vz-kr-k">${t2.okr.source}</span> <span dir="auto">${kr.source}</span>${measured ? html` · <span class="vz-kr-k">${t2.okr.measuredOn}</span> ${measured}` : ""}</p>
    ${orphan ? html`<p class="vz-kr-orphan">${icon("alert")}<span>${kr.objective ? kr.objective.name ?? t2.okr.objectiveHidden : t2.okr.noObjective}</span></p>` : ""}
  </article>`;
}
function okrTreeView(block, ctx) {
  const { cat, lang } = ctx;
  const t2 = planText(lang);
  const nf = numbers3(lang);
  const root = block.root;
  const rootCard = html`<div class="vz-okr-root">
    <p class="vz-okr-k">${t2.okr.root}</p>
    ${root && root.value !== null ? html`<p class="vz-okr-root-text" dir="auto">${root.value}</p>${stateChip(cat, root.state)}` : html`<p class="vz-okr-root-text vz-okr-root-text--ghost">${t2.okr.rootMissing}</p>`}
  </div>`;
  const legacy = [block.legacy.objectives ? legacyNote(t2, block.objectives_source) : "", block.legacy.key_results ? legacyNote(t2, block.key_results_source) : ""];
  const total = block.objectives.reduce((sum, objective) => sum + objective.key_results.length, 0) + block.unlinked.length;
  let tree;
  const mapped = [block.objectives_source, block.key_results_source].filter((entry2) => entry2.stands_for && (entry2.value !== null || entry2.state === "withheld"));
  if (!block.objectives.length && !block.unlinked.length) {
    tree = block.legacy.objectives || block.legacy.key_results ? html`` : mapped.length ? html`<ul class="vz-entries">${mapped.map((entry2) => planEntry(cat, t2, lang, entry2, ctx.mode))}</ul>` : planEmpty(t2, { variant: "okr", title: t2.okr.emptyTitle, body: ctx.doc.audience === "public" ? t2.okr.emptyPublic : t2.okr.emptyBody, steps: ctx.showNext ? t2.okr.emptySteps : null });
  } else {
    const branches = block.objectives.map((objective, index) => {
      const n = nf.format(index + 1);
      return html`<li class="vz-okr-branch">
        <article class="vz-okr-obj">
          <header class="vz-kr-head"><span class="vz-okr-k">${t2.okr.objective} ${n}</span>${stateChip(cat, block.objectives_source.state)}</header>
          <p class="vz-okr-obj-name" dir="auto">${objective.name}</p>
          ${objective.detail ? html`<p class="vz-okr-obj-detail" dir="auto">${objective.detail}</p>` : ""}
          ${objective.period ? html`<p class="vz-okr-period"><span class="vz-kr-k">${t2.okr.period}</span> <span dir="auto">${objective.period}</span></p>` : ""}
        </article>
        ${objective.key_results.length ? html`<ol class="vz-okr-krs">${objective.key_results.map((kr, krIndex) => html`<li class="vz-okr-leaf">${krCard(cat, t2, lang, kr, `${n}.${nf.format(krIndex + 1)}`, block.key_results_source, false)}</li>`)}</ol>` : html`<div class="vz-okr-krs vz-okr-krs--empty"><p class="vz-kr-none">${t2.okr.noKeyResults}</p></div>`}
      </li>`;
    });
    tree = html`<div class="vz-okr-tree" role="group" aria-label="${t2.okr.treeLabel}">
      ${rootCard}
      ${block.objectives.length ? html`<ol class="vz-okr-objectives">${branches}</ol>` : ""}
    </div>
    ${block.unlinked.length ? html`<section class="vz-okr-unlinked" aria-label="${t2.okr.unlinkedTitle}"><h3 class="vz-okr-unlinked-title">${t2.okr.unlinkedTitle}</h3><p class="vz-muted">${t2.okr.unlinkedLead}</p><div class="vz-okr-unlinked-grid">${block.unlinked.map((kr, index) => krCard(cat, t2, lang, kr, nf.format(index + 1), block.key_results_source, true))}</div></section>` : ""}`;
  }
  const showRootAlone = !block.objectives.length && !block.unlinked.length;
  return html`<section class="vz-plan vz-plan--okr" aria-label="${t2.okr.title}">
    ${block.objectives.length || block.unlinked.length ? html`<p class="vz-okr-counts">${fillVisual(t2.okr.counts, { objectives: nf.format(block.objectives.length), results: nf.format(total) })}</p>` : ""}
    ${showRootAlone && root && root.value !== null ? rootCard : ""}
    ${legacy}
    ${tree}
    <p class="vz-okr-note">${t2.okr.planNote}</p>
    <div class="vz-okr-sources">${sourceLine(cat, lang, block.objectives_source)}${sourceLine(cat, lang, block.key_results_source)}</div>
  </section>`;
}

// apps/studio/src/views/visual-registry.ts
function canvasOf(doc) {
  return doc.blocks.find((block) => block.type === "business_model_canvas") ?? null;
}
var RENDERERS = {
  business_model_canvas: (block, ctx) => canvasView(ctx.cat, block, { lang: ctx.lang, mode: ctx.mode, showNext: ctx.showNext, idPrefix: ctx.idPrefix }),
  citation_list: (block, ctx) => {
    if (ctx.doc.document_kind === "visual_identity") return identitySources(block, ctx);
    const canvas = canvasOf(ctx.doc);
    if (!canvas) throw new Error("A citation list needs the block it cites.");
    return citationTable(ctx.cat, block, canvas, ctx.lang, ctx.mode === "print");
  },
  color_palette: colorPaletteView,
  typography_specimen: typographySpecimenView,
  logo_construction: logoConstructionView,
  competitor_matrix: competitorMatrixView,
  price_strip: priceStripView,
  positioning_map: positioningMapView,
  mascot_atlas: mascotAtlasView,
  mascot_evolution: mascotEvolutionView,
  swot: swotView,
  tows_matrix: towsView,
  value_proposition_canvas: valuePropositionView,
  source_notes: sourceNotesView,
  journey_swimlane: journeyView,
  sostac_overview: sostacView,
  okr_tree: okrTreeView
};
function renderBlock(block, ctx) {
  const render2 = RENDERERS[block.type];
  return render2(block, ctx);
}

// apps/studio/src/views/visual-print-book.ts
var PROFILE = printProfile("book_a4_portrait");
var BOOK_BODY_MM = bodyHeightMm(PROFILE);
var GAP_MM = 5;
var NOTES_RULE_MM = 5;
var CONTINUES_MM = 6;
var CONTINUED_MM = 9;
var SLACK_MM = 4;
function noteMm(note, heights) {
  return heights?.get(`note:${note.n}`) ?? 6;
}
function notesMm(notes, heights) {
  return notes.length ? NOTES_RULE_MM + notes.reduce((sum, note) => sum + noteMm(note, heights), 0) : 0;
}
function flowMm(flow, heights) {
  if (flow.kind === "block") return heights?.get(flow.id) ?? flow.mm;
  return tableHeadMm(flow, heights) + flow.rows.reduce((sum, row, i) => sum + rowMm(flow, i, heights), 0);
}
function tableHeadMm(flow, heights) {
  return heights?.get(`${flow.id}:head`) ?? flow.headMm;
}
function rowMm(flow, i, heights) {
  return heights?.get(`${flow.id}:r${i}`) ?? flow.rows[i];
}
function tablePieceMm(flow, i, heights) {
  if (i >= flow.rows.length) return tableHeadMm(flow, heights);
  return tableHeadMm(flow, heights) + rowMm(flow, i, heights) + (i + 1 < flow.rows.length ? CONTINUES_MM : 0);
}
function firstPieceMm(flow, heights) {
  if (flow.kind === "block") return flowMm(flow, heights);
  return tablePieceMm(flow, 0, heights);
}
function paginate(sections, heights, budget = BOOK_BODY_MM - SLACK_MM) {
  const pages = [];
  for (const section of sections) {
    let page = { section, continued: false, parts: [], notes: [], used: 0 };
    const used = () => page.used + (page.parts.length ? GAP_MM : 0);
    const fits = (mm, notes = []) => used() + mm + notesMm([...page.notes, ...notes], heights) <= budget;
    const turn = () => {
      pages.push(page);
      page = { section, continued: true, parts: [], notes: [], used: CONTINUED_MM };
    };
    const place = (id, part, mm, notes = []) => {
      page.used = used() + mm;
      page.parts.push({ id, html: part });
      page.notes.push(...notes);
    };
    section.flows.forEach((flow, index) => {
      if (flow.kind === "block") {
        const next = section.flows[index + 1];
        const need = flowMm(flow, heights) + (flow.keepWithNext && next ? GAP_MM + firstPieceMm(next, heights) : 0);
        if (!fits(need, flow.notes) && page.parts.length) turn();
        place(flow.id, flow.html, flowMm(flow, heights), flow.notes);
        return;
      }
      let i = 0;
      let part = 0;
      while (i < flow.rows.length) {
        const head2 = tableHeadMm(flow, heights);
        if (!fits(tablePieceMm(flow, i, heights)) && page.parts.length) turn();
        let take2 = 0;
        let mm = head2;
        while (i + take2 < flow.rows.length) {
          const more = i + take2 + 1 < flow.rows.length;
          const next = mm + rowMm(flow, i + take2, heights);
          if (take2 > 0 && !fits(next + (more ? CONTINUES_MM : 0))) break;
          mm = next;
          take2 += 1;
        }
        const continues = i + take2 < flow.rows.length;
        place(
          `${flow.id}:${part}`,
          flow.render([i, i + take2], { index: part, continues }),
          mm + (continues ? CONTINUES_MM : 0)
        );
        i += take2;
        part += 1;
        if (continues) turn();
      }
    });
    if (page.parts.length) pages.push(page);
  }
  return pages;
}
function digits(lang, n, min = 1) {
  return new Intl.NumberFormat(lang, { minimumIntegerDigits: min, useGrouping: false }).format(n);
}
var px = (value2) => value2 * 0.2646;
function typeRoleMm(block, role) {
  const size = role.size_px ?? 16;
  const line = Math.ceil(size * (role.line_height ?? 1.3) + 18);
  const specimen = block.scripts.reduce((sum, _script) => sum + px(line + 18), 0) + px(10) * Math.max(0, block.scripts.length - 1);
  return Math.max(specimen, 52) + 4;
}
function blockFlow(id, content, mm, extra = {}) {
  return { kind: "block", id, html: content, mm, ...extra };
}
function take(builder) {
  return builder.notes.splice(0, builder.notes.length);
}
function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
function subHead(title, lead) {
  return html`<h3 class="vz-sub">${title}</h3>${lead ? html`<p class="vz-note">${lead}</p>` : ""}`;
}
function colorFlows(block, builder) {
  const { ctx } = builder;
  const t2 = ctx.cat.identity;
  if (block.colors.length === 0) return [blockFlow("color:await", renderBlock(block, ctx), 165, { notes: take(builder) })];
  const head2 = plateHead(ctx.plateNum?.(1) ?? 1, "vi-color", t2.colorTitle, t2.colorLead, html`<span class="vz-plate-state vz-plate-state--ready">${t2.ready}</span>`, ctx.note(block.source));
  const flows = [blockFlow("color:head", head2, 34, { keepWithNext: true, notes: take(builder) }), blockFlow("color:roles", subHead(t2.rolesTitle, null), 4, { keepWithNext: true })];
  chunks(block.colors, 4).forEach((row, i) => flows.push(blockFlow(`color:sw${i}`, swatchList(block, ctx, row), 47)));
  flows.push(blockFlow("color:combos", subHead(t2.combinationsTitle, t2.combinationsLead), 15, { keepWithNext: true }));
  if (block.combinations.length) chunks(block.combinations, 2).forEach((row, i) => flows.push(blockFlow(`color:cb${i}`, comboList(block, ctx, row), 26)));
  else flows.push(blockFlow("color:cb-none", html`<p class="vz-note">${t2.combinationsNone}</p>`, 8));
  flows.push(blockFlow("color:contrast", subHead(t2.contrastTitle, t2.contrastLead), 15, { keepWithNext: true }));
  const grid = block.grid;
  if (!grid) {
    flows.push(blockFlow("color:grid-none", html`<p class="vz-note">${fillVisual(t2.gridOmitted, { count: 10 })}</p>`, 8));
    return flows;
  }
  const b = bookText(ctx.lang);
  flows.push({
    kind: "table",
    id: "color:grid",
    headMm: 17.5,
    rows: grid.roles.map(() => 7.2),
    render: ([from, to], part) => {
      const caption = part.index === 0 ? null : fillVisual(b.continued, { title: t2.contrastTitle });
      return html`${contrastTable(block, ctx, [from, to], caption)}${part.continues ? html`<p class="bk-continues">${b.tableContinues}</p>` : gridKey()}`;
    }
  });
  return flows;
}
function typeFlows(block, builder) {
  const { ctx } = builder;
  const t2 = ctx.cat.identity;
  if (block.roles.length === 0) return [blockFlow("type:await", renderBlock(block, ctx), 165, { notes: take(builder) })];
  const head2 = plateHead(ctx.plateNum?.(2) ?? 2, "vi-type", t2.typeTitle, t2.typeLead, html`<span class="vz-plate-state vz-plate-state--ready">${t2.ready}</span>`, ctx.note(block.source));
  const flows = [blockFlow("type:head", head2, 34, { keepWithNext: true, notes: take(builder) })];
  block.roles.forEach((role, i) => flows.push(blockFlow(`type:r${i}`, html`<ol class="vz-type-roles" start="${i + 1}">${typeRoleItem(block, role, ctx)}</ol>`, typeRoleMm(block, role))));
  flows.push(blockFlow("type:note", html`<p class="vz-note vz-type-note">${t2.fontNote}</p>`, 13.5));
  return flows;
}
function logoFlows(block, builder) {
  const ready = block.spec !== null && block.master !== null;
  const content = renderBlock(block, builder.ctx);
  const flows = [blockFlow(ready ? "logo:plate" : "logo:await", content, ready ? 205 : 165, { notes: take(builder) })];
  if (block.system) flows.push(blockFlow("logo:system", logoSystemView(block, builder.ctx), 110));
  return flows;
}
function appendixFlows(doc, citations2, builder, intro) {
  const { ctx } = builder;
  const cat = ctx.cat;
  const b = bookText(ctx.lang);
  const internal = doc.audience === "internal";
  const flows = [
    blockFlow("appendix:head", html`<header class="bk-appendix-head"><h2 class="bk-appendix-title" id="bk-sources-t">${cat.text.sourcesTitle}</h2><p class="vz-note">${intro ?? cat.identity.sourcesIntro}</p></header>`, 24, { keepWithNext: true })
  ];
  if (citations2) {
    const rows2 = sourceRows(citations2, ctx);
    const all = [...rows2.items, ...rows2.master ? [rows2.master] : []];
    flows.push({
      kind: "table",
      id: "appendix:sources",
      headMm: 6,
      rows: all.map(() => 9.5),
      render: ([from, to], info) => html`<table class="vz-table bk-table">${info.index > 0 ? html`<caption class="bk-caption">${fillVisual(b.continued, { title: cat.text.sourcesTitle })}</caption>` : ""}${sourcesHead(cat)}<tbody>${all.slice(from, to)}</tbody></table>${info.continues ? html`<p class="bk-continues">${b.tableContinues}</p>` : ""}`
    });
  }
  flows.push(blockFlow("appendix:legend", legend(cat, ["approved", "stale", "assumption", "withheld", "missing"]), 7));
  doc.framework_refs.forEach((ref, i) => flows.push(blockFlow(`appendix:fw${i}`, frameworkNote(cat, ref, "print", ctx.lang), 54)));
  flows.push(blockFlow("appendix:edition", html`<p class="vz-muted vz-edition-note">${internal ? cat.text.editionInternalNote : cat.text.editionPublicNote}</p>`, 8));
  return flows;
}
function isBlock(type) {
  return (block) => block.type === type;
}
function bookBuilder(input, plateNum) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const b = bookText(lang);
  const notes = [];
  let counter = 0;
  const note = (entry2, extra = []) => {
    counter += 1;
    const n = counter;
    const icx = { cat, lang, mode: "print", doc, showNext: false, assetUrl: input.assetUrl };
    notes.push({ n, body: footParts(icx, entry2, extra) });
    return html`<sup class="bk-ref"><a href="#bk-note-${n}" id="bk-ref-${n}" aria-label="${fillVisual(b.noteRef, { n: digits(lang, n) })}">${digits(lang, n)}</a></sup>`;
  };
  const ctx = { cat, lang, mode: "print", doc, idPrefix: "bk", showNext: false, assetUrl: input.assetUrl, note, ...plateNum ? { plateNum } : {} };
  return { ctx, notes };
}
function identitySections(input) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const t2 = cat.identity;
  const b = bookText(lang);
  const builder = bookBuilder(input);
  const color = doc.blocks.find(isBlock("color_palette"));
  const type = doc.blocks.find(isBlock("typography_specimen"));
  const logo = doc.blocks.find(isBlock("logo_construction"));
  const citations2 = doc.blocks.find(isBlock("citation_list"));
  const state2 = (ready) => ({ text: ready ? t2.ready : t2.waiting, ready });
  const sections = [];
  if (color) sections.push({ id: "color", title: t2.colorTitle, num: two(1), state: state2(color.colors.length > 0), flows: colorFlows(color, builder) });
  if (type) sections.push({ id: "type", title: t2.typeTitle, num: two(2), state: state2(type.roles.length > 0), flows: typeFlows(type, builder) });
  if (logo) sections.push({ id: "logo", title: t2.logoTitle, num: two(3), state: state2(logo.spec !== null && logo.master !== null), flows: logoFlows(logo, builder) });
  sections.push({ id: "appendix", title: b.appendixTitle, num: null, state: null, flows: appendixFlows(doc, citations2, builder) });
  return sections;
}
var COMPACT_TOC = 7;
var FRONT = 3;
function sheet(input, frame) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const b = bookText(lang);
  const side = frame.folio % 2 === 1 ? "recto" : "verso";
  const classification = doc.audience === "internal" ? cat.text.classInternal : cat.text.classPublic;
  const notes = frame.notes.length ? html`<aside class="bk-notes" aria-label="${b.notes}"><ol>${frame.notes.map((note) => html`<li id="bk-note-${note.n}"><a class="bk-note-num" href="#bk-ref-${note.n}">${digits(lang, note.n)}</a><span class="bk-note-body vz-foot">${note.body}</span></li>`)}</ol></aside>` : "";
  return html`<section class="bk-sheet bk-${side} bk-sheet--${frame.kind}" id="bk-p${frame.folio}" data-folio="${frame.folio}" aria-label="${frame.label}">
    <header class="bk-head">${frame.runningHead ? html`<span class="bk-head-class">${classification}${doc.illustrative ? html` · <strong>${cat.text.illustrative}</strong>` : ""}</span><span class="bk-head-title" dir="auto">${frame.runningHead}</span>` : ""}</header>
    <div class="bk-body"><div class="bk-flows">${frame.body}</div>${notes}</div>
    <footer class="bk-folio">${frame.showFolio ? html`<span class="bk-folio-num" aria-label="${fillVisual(b.folio, { n: digits(lang, frame.folio) })}">${digits(lang, frame.folio)}</span>` : ""}</footer>
  </section>`;
}
function mockStamp(input) {
  const cat = visualCatalog(input.lang);
  if (!input.doc.illustrative) return html``;
  return html`<p class="vz-mock bk-mock" role="note"><strong>${cat.text.illustrative}</strong> <span>${cat.text.illustrativeNote}</span></p>`;
}
function cover(input, frame) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const asOf = dateOnly(doc.as_of, lang);
  const edition = doc.audience === "internal" ? cat.text.editionInternal : cat.text.editionPublic;
  return html`<div class="bk-cover">
    <p class="bk-cover-kicker"><span class="vz-kicker-bar" aria-hidden="true"></span>${frame.kicker}</p>
    <div class="bk-cover-main">
      <p class="bk-cover-brand" dir="auto">${doc.brand_name}</p>
      <h1 class="bk-cover-title">${frame.title}</h1>
      <p class="bk-cover-lead">${frame.lead}</p>
    </div>
    ${mockStamp(input)}
    <dl class="bk-cover-meta">
      <div><dt>${cat.text.classification}</dt><dd><span class="vz-edition vz-edition--${doc.audience}">${edition}</span></dd></div>
      <div><dt>${cat.text.asOfLabel}</dt><dd>${asOf ? fillVisual(cat.text.asOf, { date: asOf }) : cat.text.asOfNone}</dd></div>
    </dl>
  </div>`;
}
function imprint(input, frame, pageCount) {
  const { doc, lang } = input;
  const cat = visualCatalog(lang);
  const b = bookText(lang);
  const asOf = dateOnly(doc.as_of, lang);
  const edition = doc.audience === "internal" ? cat.text.editionInternal : cat.text.editionPublic;
  return html`<div class="bk-imprint">
    ${mockStamp(input)}
    <h2 class="bk-imprint-title">${b.imprintTitle}</h2>
    <dl class="bk-imprint-list">
      <div><dt>${b.imprintBrand}</dt><dd dir="auto">${doc.brand_name}</dd></div>
      <div><dt>${b.imprintDocument}</dt><dd>${frame.imprintDocument}</dd></div>
      <div><dt>${b.imprintEdition}</dt><dd>${edition}</dd></div>
      <div><dt>${b.imprintAsOf}</dt><dd>${asOf ?? cat.text.asOfNone}</dd></div>
      <div><dt>${b.imprintCommit}</dt><dd><code class="vz-code" dir="ltr">${input.commit ? input.commit.slice(0, 12) : "\u2014"}</code>${input.commit && input.uncommitted ? html` <span class="bk-imprint-uncommitted">${b.imprintUncommitted}</span>` : ""}</dd></div>
      <div><dt>${b.imprintFormat}</dt><dd>${fillVisual(b.formatBook, { pages: digits(lang, pageCount) })}</dd></div>
      <div><dt>${b.imprintTypeset}</dt><dd>${b.typesetValue}</dd></div>
    </dl>
    <p class="bk-imprint-text">${b.imprintRules}</p>
    <p class="bk-imprint-text">${b.imprintClaims}</p>
    <p class="bk-imprint-text bk-imprint-origin">${doc.illustrative ? b.imprintOriginFixture : b.imprintOrigin}</p>
  </div>`;
}
function contents(input, frame, sections, firstPage) {
  const { lang } = input;
  const b = bookText(lang);
  return html`<div class="bk-contents${sections.length > COMPACT_TOC ? " bk-contents--compact" : ""}">
    <p class="vz-kicker"><span class="vz-kicker-bar" aria-hidden="true"></span>${frame.contentsKicker}</p>
    <h2 class="bk-contents-title">${b.contentsTitle}</h2>
    <p class="bk-contents-lead">${frame.lead}</p>
    <nav class="bk-toc" aria-label="${b.contentsTitle}">
      <p class="bk-toc-col" aria-hidden="true"><span></span><span>${b.contentsPage}</span></p>
      <ol>${sections.map((section) => {
    const page = firstPage.get(section.id);
    return html`<li class="bk-toc-item${section.num ? "" : " bk-toc-item--appendix"}"><a href="#bk-p${page}"><span class="bk-toc-num">${section.num ?? ""}</span><span class="bk-toc-name">${section.title}</span><span class="bk-toc-leader" aria-hidden="true"></span><span class="bk-toc-page" data-toc-page="${page}">${digits(lang, page)}</span>${section.state ? html`<span class="bk-toc-state${section.state.ready ? " is-ready" : ""}">${section.state.text}</span>` : ""}</a></li>`;
  })}</ol>
    </nav>
  </div>`;
}
function layoutBook(sections, heights) {
  const pages = paginate(sections, heights);
  const firstPage = /* @__PURE__ */ new Map();
  pages.forEach((page, i) => {
    if (!firstPage.has(page.section.id)) firstPage.set(page.section.id, FRONT + 1 + i);
  });
  return { sections, pages, firstPage, pageCount: FRONT + pages.length };
}
function layoutIdentityBook(input) {
  return layoutBook(identitySections(input), input.heights);
}
function documentShell2(input, title, bodyClass, main2) {
  const cat = visualCatalog(input.lang);
  return html`<!doctype html>
<html lang="${input.lang}" dir="${cat.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="same-origin">
<title>${title}</title>
${input.head}
</head>
<body class="${bodyClass}${input.doc.illustrative ? " vz-is-mock" : ""}">
${input.toolbar}
${main2}
</body>
</html>`;
}
function renderBook(input, frame, layout2) {
  const { doc, lang } = input;
  const b = bookText(lang);
  const bookHead = html`${frame.running} · <span dir="auto">${doc.brand_name}</span>`;
  const sheets = [
    sheet(input, { folio: 1, kind: "cover", label: frame.title, runningHead: null, showFolio: false, body: cover(input, frame), notes: [] }),
    sheet(input, { folio: 2, kind: "imprint", label: b.imprintTitle, runningHead: null, showFolio: false, body: imprint(input, frame, layout2.pageCount), notes: [] }),
    sheet(input, { folio: 3, kind: "contents", label: b.contentsTitle, runningHead: null, showFolio: true, body: contents(input, frame, layout2.sections, layout2.firstPage), notes: [] })
  ];
  layout2.pages.forEach((page, i) => {
    const folio = FRONT + 1 + i;
    const running = folio % 2 === 0 ? bookHead : html`${page.section.title}`;
    const kicker = page.continued ? html`<p class="bk-continued">${fillVisual(b.continued, { title: page.section.title })}</p>` : "";
    const body = html`${kicker}${join(page.parts.map((part) => html`<div class="bk-flow" data-flow="${part.id}">${part.html}</div>`))}`;
    sheets.push(sheet(input, { folio, kind: page.section.id === "appendix" ? "appendix" : "plate", label: fillVisual(b.folio, { n: digits(lang, folio) }), runningHead: running, showFolio: true, body, notes: page.notes }));
  });
  const main2 = html`<main class="vz-print bk-book" id="main">${join(sheets)}</main>`;
  return { html: documentShell2(input, `${frame.title} \xB7 ${doc.brand_name}`, "vz-print-body vz-book-body bk-doc", main2), pageCount: layout2.pageCount };
}
function identityFrame(lang) {
  const cat = visualCatalog(lang);
  const b = bookText(lang);
  return { title: cat.identity.chapterTitle, kicker: b.coverKicker, lead: cat.identity.chapterLead, contentsKicker: cat.identity.chapterKicker, running: b.bookTitle, imprintDocument: `${b.bookTitle} \xB7 ${cat.identity.chapterTitle}` };
}
function identityBookDocument(input) {
  return renderBook(input, identityFrame(input.lang), layoutIdentityBook(input));
}
function bookGalley(input, sections) {
  const all = [];
  const notes = [];
  for (const section of sections) {
    for (const flow of section.flows) {
      if (flow.kind === "block") {
        all.push(html`<div class="bk-flow" data-flow="${flow.id}">${flow.html}</div>`);
        notes.push(...flow.notes ?? []);
      } else {
        all.push(html`<div class="bk-flow" data-flow-table="${flow.id}" data-rows="${flow.rows.length}">${flow.render([0, flow.rows.length], { index: 0, continues: false })}</div>`);
      }
    }
  }
  const lang = input.lang;
  const noteList = html`<aside class="bk-notes"><ol>${notes.map((note) => html`<li data-note="${note.n}"><a class="bk-note-num">${digits(lang, note.n)}</a><span class="bk-note-body vz-foot">${note.body}</span></li>`)}</ol></aside>`;
  const main2 = html`<main class="vz-print bk-book" id="main"><section class="bk-sheet bk-recto bk-galley"><header class="bk-head"></header><div class="bk-body"><div class="bk-flows">${join(all)}</div>${noteList}</div><footer class="bk-folio"></footer></section></main>`;
  return documentShell2(input, "galley", "vz-print-body vz-book-body bk-doc", main2);
}
function identityBookGalley(input) {
  return bookGalley(input, identitySections(input));
}

// apps/studio/src/views/visual-print-full.ts
function shell(input) {
  return { doc: input.book, lang: input.lang, commit: input.commit, uncommitted: input.uncommitted, head: input.head, toolbar: input.toolbar };
}
function baseDocument(book) {
  const doc = book.identity ?? book.canvas;
  if (doc) return doc;
  return {
    schema: VISUAL_SCHEMA,
    schema_version: 1,
    document_kind: "visual_identity",
    brand_id: book.brand_id,
    brand_name: book.brand_name,
    audience: book.audience,
    illustrative: book.illustrative,
    origin: book.origin,
    as_of: book.as_of,
    classification: book.audience,
    print_profile: "book_a4_portrait",
    status_summary: emptyStatusSummary(),
    framework_refs: [],
    blocks: []
  };
}
function fullBookFrame(book, lang) {
  const t2 = fullBookText(lang).book[book.book_kind];
  return { title: t2.title, kicker: t2.kicker, lead: t2.lead, contentsKicker: t2.title, running: t2.running, imprintDocument: t2.title };
}
function chapterTitle(chapter, lang) {
  const id = chapter.chapter_id;
  const identity = visualCatalog(lang).identity;
  if (id === "color") return identity.colorTitle;
  if (id === "type") return identity.typeTitle;
  if (id === "logo") return identity.logoTitle;
  return fullBookText(lang).chapter[id].title;
}
function textMm(text3, perLine = 72, lineMm = 6) {
  return Math.max(1, Math.ceil(text3.length / perLine)) * lineMm;
}
function gapReason(entry2, lang) {
  const t2 = fullBookText(lang);
  const cat = visualCatalog(lang);
  if (entry2.state === "assumption" || entry2.state === "recommendation") return t2.draftNotPrinted;
  if (entry2.state === "withheld") return t2.withheldNotPrinted;
  if (entry2.state === "not_applicable") return entry2.na_reason === "profile" ? t2.notApplicableProfile : t2.notApplicable;
  return entry2.missing_reason ? cat.missingReason[entry2.missing_reason] : cat.text.noValueYet;
}
function printed(entry2) {
  return (entry2.state === "approved" || entry2.state === "stale") && entry2.value !== null;
}
function itemNames2(book) {
  const names2 = /* @__PURE__ */ new Map();
  for (const chapter of book.chapters) {
    const entries2 = chapter.kind === "facts" || chapter.kind === "plate" ? chapter.entries : chapter.kind === "canvas" ? chapter.zones.flatMap((zone) => zone.entries) : [];
    for (const entry2 of entries2) if (printed(entry2)) for (const item of entry2.items ?? []) names2.set(item.id, item.name);
  }
  return names2;
}
function valueBody(entry2, names2, lang, cls) {
  const cat = visualCatalog(lang);
  if (entry2.items && entry2.items.length) {
    const spec = entitySpec(entry2.id);
    const label = (item) => item.tags.map((tag) => html`<span class="fb-item-tag">${spec ? entityOptionLabel(spec, tag.field, tag.value, lang) : tag.value}</span>`);
    return html`<ol class="fb-items ${cls}">${entry2.items.map(
      (item, i) => html`<li class="fb-item"><p class="fb-item-head"><span class="fb-item-num">${digits(lang, i + 1, 2)}</span><span class="fb-item-name" dir="auto">${item.name}</span>${label(item)}</p>${item.detail ? html`<p class="fb-item-detail" dir="auto">${item.detail}</p>` : ""}${item.links.length ? html`<p class="fb-item-links"><span class="fb-item-links-k">${cat.entities.linkTo}:</span> ${join(
        item.links.map((link) => names2.has(link) ? html`<span dir="auto">${names2.get(link)}</span>` : html`<span class="fb-item-link--hidden">${cat.entities.linkHidden}</span>`),
        lang === "fa" ? "\u060C " : ", "
      )}</p>` : ""}</li>`
    )}</ol>`;
  }
  const value2 = html`<p class="fb-entry-value" dir="auto">${entry2.value}</p>`;
  return entry2.legacy ? html`${value2}<p class="fb-legacy">${cat.entities.legacy}</p>` : value2;
}
function valueMm(entry2, perLine, lineMm) {
  if (!entry2.items?.length) return textMm(entry2.value ?? "", perLine, lineMm) + (entry2.legacy ? lineMm : 0);
  return entry2.items.reduce((sum, item) => sum + 2 + textMm(item.name, perLine, lineMm) + (item.detail ? textMm(item.detail, perLine, lineMm) : 0) + (item.links.length ? lineMm : 0), 0);
}
function entryFlow(id, entry2, lang, names2 = /* @__PURE__ */ new Map()) {
  const cat = visualCatalog(lang);
  const t2 = fullBookText(lang);
  const label = entryLabel(lang, entry2.id, entry2.label);
  if (!printed(entry2)) {
    return blockFlow(id, html`<div class="fb-entry fb-entry--gap"><p class="fb-entry-label" dir="auto">${label}</p><p class="fb-entry-gap">${stateChip(cat, entry2.state)}<span>${gapReason(entry2, lang)}</span></p></div>`, 15);
  }
  const date = dateOnly(entry2.approved_at, lang);
  const meta = [entry2.version !== null ? fillVisual(cat.text.version, { version: digits(lang, entry2.version) }) : null, date ? fillVisual(t2.approvedOn, { date }) : null].filter((part) => part !== null);
  return blockFlow(
    id,
    html`<div class="fb-entry"><p class="fb-entry-label" dir="auto">${label}</p>${valueBody(entry2, names2, lang, "")}<p class="fb-entry-meta">${stateChip(cat, entry2.state)}${meta.map((part) => html`<span>${part}</span>`)}</p></div>`,
    18 + valueMm(entry2, 72, 6)
  );
}
function visible(entries2, book) {
  return book.audience === "public" ? entries2.filter(printed) : entries2;
}
function head(id, num4, title, lead, ready, lang) {
  const t2 = fullBookText(lang);
  const state2 = ready ? html`<span class="vz-plate-state vz-plate-state--ready">${t2.stateReady}</span>` : html`<span class="vz-plate-state">${t2.stateUnavailable}</span>`;
  return blockFlow(`${id}:head`, plateHead(num4, `fb-${id}`, title, lead, state2), lead ? 34 : 26, { keepWithNext: true });
}
function unavailableFlows(chapter, num4, lang) {
  const t2 = fullBookText(lang);
  const cat = visualCatalog(lang);
  const title = chapterTitle(chapter, lang);
  const lead = chapter.chapter_id in t2.chapter ? t2.chapter[chapter.chapter_id].lead : "";
  const where = t2.separateWhere[chapter.chapter_id] ?? "";
  const awaiting3 = chapter.awaiting;
  const body = html`<div class="fb-unavailable">
    <div class="fb-unavailable-art">${ghostChart({ title: t2.unavailableKicker, variant: "lines" })}</div>
    <div class="fb-unavailable-copy">
      <p class="fb-unavailable-kicker">${icon("clock")}<span>${t2.unavailableKicker}</span></p>
      <h3 class="fb-unavailable-title">${fillVisual(t2.unavailableTitle, { chapter: title })}</h3>
      <p class="fb-unavailable-body">${fillVisual(t2.unavailable[chapter.reason], { where })}</p>
      ${awaiting3.length ? html`<p class="fb-unavailable-sub">${t2.awaitingTitle}</p><ul class="fb-unavailable-list">${awaiting3.map((entry2) => html`<li>${stateChip(cat, entry2.state)}<span dir="auto">${entryLabel(lang, entry2.id, entry2.label)}</span></li>`)}</ul>` : ""}
    </div>
  </div>`;
  return [head(chapter.chapter_id, num4, title, lead, false, lang), blockFlow(`${chapter.chapter_id}:unavailable`, body, 92 + awaiting3.length * 8)];
}
function canvasFlows(chapter, book, num4, lang) {
  const t2 = fullBookText(lang);
  const cat = visualCatalog(lang);
  const flows = [head(chapter.chapter_id, num4, t2.chapter.business_model_canvas.title, t2.chapter.business_model_canvas.lead, true, lang)];
  const names2 = itemNames2(book);
  for (const zone of chapter.zones) {
    const entries2 = visible(zone.entries, book);
    const items = entries2.map(
      (entry2) => printed(entry2) ? html`<li class="fb-zone-entry">${valueBody(entry2, names2, lang, "fb-items--zone")}<p class="fb-entry-meta">${stateChip(cat, entry2.state)}<span dir="auto">${entryLabel(lang, entry2.id, entry2.label)}</span></p></li>` : html`<li class="fb-zone-entry fb-zone-entry--gap">${stateChip(cat, entry2.state)}<span dir="auto">${entryLabel(lang, entry2.id, entry2.label)}</span><span>${gapReason(entry2, lang)}</span></li>`
    );
    const mm = 14 + entries2.reduce((sum, entry2) => sum + (printed(entry2) ? 12 + valueMm(entry2, 72, 5.5) : 9), 0);
    flows.push(
      blockFlow(
        `canvas:${zone.zone_id}`,
        html`<section class="fb-zone"><h3 class="fb-zone-title"><span class="fb-zone-num">${digits(lang, zone.order, 2)}</span><span>${cat.zone[zone.zone_id].title}</span></h3>${items.length ? html`<ul class="fb-zone-list">${items}</ul>` : html`<p class="fb-zone-gap">${t2.zoneGap}</p>`}</section>`,
        items.length ? mm : 22
      )
    );
  }
  flows.push(blockFlow("canvas:note", html`<p class="vz-note fb-canvas-note">${t2.canvasNote}</p>`, 12));
  return flows;
}
function rulesFlows(id, entries2, lang, names2) {
  if (!entries2.length) return [];
  const t2 = fullBookText(lang);
  return [blockFlow(`${id}:rules`, html`<h3 class="vz-sub fb-rules-title">${t2.rulesTitle}</h3>`, 10, { keepWithNext: true }), ...entries2.map((entry2, i) => entryFlow(`${id}:r${i}`, entry2, lang, names2))];
}
function plateFlows(chapter, book, builder, lang) {
  const identity = book.identity;
  const rules = rulesFlows(chapter.chapter_id, visible(chapter.entries, book), lang, itemNames2(book));
  if (!identity) return rules;
  if (chapter.chapter_id === "color") {
    const block2 = identity.blocks.find(isBlock("color_palette"));
    return [...block2 ? colorFlows(block2, builder) : [], ...rules];
  }
  if (chapter.chapter_id === "type") {
    const block2 = identity.blocks.find(isBlock("typography_specimen"));
    return [...block2 ? typeFlows(block2, builder) : [], ...rules];
  }
  const block = identity.blocks.find(isBlock("logo_construction"));
  return [...block ? logoFlows(block, builder) : [], ...rules];
}
function plateReady(book, id) {
  const identity = book.identity;
  if (!identity) return false;
  if (id === "color") return (identity.blocks.find(isBlock("color_palette"))?.colors.length ?? 0) > 0;
  if (id === "type") return (identity.blocks.find(isBlock("typography_specimen"))?.roles.length ?? 0) > 0;
  const logo = identity.blocks.find(isBlock("logo_construction"));
  return Boolean(logo && logo.spec !== null && logo.master !== null);
}
function citations(book, lang) {
  const seen = /* @__PURE__ */ new Map();
  const cited = book.identity?.blocks.find(isBlock("citation_list"));
  for (const item of cited?.items ?? []) seen.set(item.id, { ...item, label: entryLabel(lang, item.id, item.label) });
  for (const chapter of book.chapters) {
    const entries2 = chapter.kind === "facts" || chapter.kind === "plate" ? chapter.entries : chapter.kind === "canvas" ? chapter.zones.flatMap((zone) => zone.entries) : [];
    for (const entry2 of visible(entries2, book)) {
      if (!seen.has(entry2.id)) seen.set(entry2.id, { id: entry2.id, label: entryLabel(lang, entry2.id, entry2.label), state: entry2.state, version: entry2.version, approved_at: entry2.approved_at });
    }
  }
  return [...seen.values()];
}
function fullBookSections(input) {
  const { book, lang } = input;
  const t2 = fullBookText(lang);
  const cat = visualCatalog(lang);
  const base3 = baseDocument(book);
  const plateNumbers = /* @__PURE__ */ new Map();
  book.chapters.forEach((chapter, i) => {
    const plate = { color: 1, type: 2, logo: 3 }[chapter.chapter_id];
    if (chapter.kind === "plate" && plate) plateNumbers.set(plate, digits(lang, i + 1, 2));
  });
  const names2 = itemNames2(book);
  const builder = bookBuilder({ doc: base3, lang, assetUrl: input.assetUrl }, (n) => plateNumbers.get(n) ?? digits(lang, n, 2));
  const sections = book.chapters.map((chapter, i) => {
    const num4 = digits(lang, i + 1, 2);
    const title = chapterTitle(chapter, lang);
    if (chapter.kind === "unavailable") return { id: chapter.chapter_id, title, num: num4, state: { text: t2.stateUnavailable, ready: false }, flows: unavailableFlows(chapter, num4, lang) };
    if (chapter.kind === "canvas") return { id: chapter.chapter_id, title, num: num4, state: { text: t2.stateReady, ready: true }, flows: canvasFlows(chapter, book, num4, lang) };
    if (chapter.kind === "plate") {
      const ready = plateReady(book, chapter.chapter_id);
      return { id: chapter.chapter_id, title, num: num4, state: { text: ready ? cat.identity.ready : cat.identity.waiting, ready }, flows: plateFlows(chapter, book, builder, lang) };
    }
    const lead = t2.chapter[chapter.chapter_id].lead;
    const flows = [head(chapter.chapter_id, num4, title, lead, true, lang), ...visible(chapter.entries, book).map((entry2, j) => entryFlow(`${chapter.chapter_id}:e${j}`, entry2, lang, names2))];
    return { id: chapter.chapter_id, title, num: num4, state: { text: t2.stateReady, ready: true }, flows };
  });
  sections.push({ id: "appendix", title: bookText(lang).appendixTitle, num: null, state: null, flows: appendixFlows({ audience: book.audience, framework_refs: base3.framework_refs }, { items: citations(book, lang) }, builder, t2.sourcesIntro) });
  return sections;
}
function layoutFullBook(input) {
  return layoutBook(fullBookSections(input), input.heights);
}
function fullBookDocument(input) {
  return renderBook(shell(input), fullBookFrame(input.book, input.lang), layoutFullBook(input));
}
function fullBookGalley(input) {
  return bookGalley(shell(input), fullBookSections(input));
}

// scripts/export-visual.ts
var ROOT = path2.resolve(import.meta.dirname, "..");
var STATIC = process.env.BRAND_OS_ENGINE_ASSETS ? path2.join(process.env.BRAND_OS_ENGINE_ASSETS, "studio-static") : path2.join(ROOT, "apps", "studio", "static");
var FONT_MIME = { ".woff2": "font/woff2" };
var MAX_ASSET_BYTES = 8 * 1024 * 1024;
var HELP = `brand:export-visual [options]

  --doc <doc>                   identity: Brand Book "Visual identity" chapter (default); bmc: Business Model Canvas;
                                brand-book: the full Brand Book; business-report: the Business Report
  --lang en|fa|tr|all           language of the labels (default: all of en, fa, tr the brand supports)
  --edition internal|public     internal (default) or the public edition (approved and published only);
                                the business report has no public edition
  --profile <id>                book_a4_portrait (identity, brand-book, business-report), canvas_a3_landscape (bmc);
                                deck_16_9 is planned
  --out <dir>                   output folder (default dist/visual-export); never inside brand/ or .private
  --fixture                     render the ILLUSTRATIVE / MOCK DATA fixture instead of this repository
  --no-pdf                      HTML only (no Chrome needed)

Writes <doc>.<edition>.<lang>.html (and .pdf). Refused while ${AGENT_TOKEN_ENV} is set.`;
var ExportError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
};
var EXPORT_DOCS = ["identity", "bmc", "brand-book", "business-report"];
var FULL_BOOKS = { "brand-book": "brand_book", "business-report": "business_report" };
function isFullDoc(doc) {
  return doc in FULL_BOOKS;
}
function findChrome() {
  const candidates = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  return candidates.filter((item) => Boolean(item)).find((file) => fs2.existsSync(file)) ?? null;
}
function lstatOrNull(file) {
  try {
    return fs2.lstatSync(file);
  } catch {
    return null;
  }
}
function realTarget(file) {
  let existing2 = file;
  while (!lstatOrNull(existing2) && path2.dirname(existing2) !== existing2) existing2 = path2.dirname(existing2);
  try {
    return path2.join(fs2.realpathSync(existing2), path2.relative(existing2, file));
  } catch {
    return null;
  }
}
function checkOutput(root, out) {
  const resolved = path2.resolve(root, out);
  const refuse = () => {
    throw new ExportError("path", bookText("en").exportRefusedPath);
  };
  const real = realTarget(resolved);
  if (real === null) refuse();
  const brands = [path2.resolve(root, "brand"), realTarget(path2.resolve(root, "brand"))].filter((dir) => dir !== null);
  for (const candidate of [resolved, real]) {
    if (brands.some((brand) => candidate === brand || candidate.startsWith(brand + path2.sep))) refuse();
    if (candidate.split(path2.sep).includes(".private")) refuse();
  }
  return resolved;
}
function refuseLink(file) {
  if (lstatOrNull(file)?.isSymbolicLink()) throw new ExportError("path", bookText("en").exportRefusedPath);
}
function writeOutput(file, data) {
  refuseLink(file);
  fs2.writeFileSync(file, data);
}
function embeddedStyles(book) {
  let css = fs2.readFileSync(path2.join(STATIC, "visual.css"), "utf8");
  if (book) css += `
${fs2.readFileSync(path2.join(STATIC, "visual-book.css"), "utf8")}`;
  return css.replace(/url\("\/static\/fonts\/([a-z0-9-]+\.woff2)"\)/g, (_all, file) => {
    const bytes = fs2.readFileSync(path2.join(STATIC, "fonts", file));
    return `url("data:${FONT_MIME[path2.extname(file)]};base64,${bytes.toString("base64")}")`;
  });
}
function assetEmbedder(previews) {
  const byKey = new Map(previews.map((preview) => [preview.key, preview]));
  return (key) => {
    const preview = byKey.get(key);
    if (!preview) return null;
    const stat = fs2.statSync(preview.source);
    if (stat.size > MAX_ASSET_BYTES) return null;
    return `data:${preview.mime};base64,${fs2.readFileSync(preview.source).toString("base64")}`;
  };
}
function commitOf(root) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  const sha = result.status === 0 ? result.stdout.trim() : "";
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
}
function brandUncommitted(root) {
  const result = spawnSync("git", ["status", "--porcelain", "--", "brand"], { cwd: root, encoding: "utf8" });
  return result.status === 0 && result.stdout.trim().length > 0;
}
function committed(options) {
  const commit = commitOf(options.root);
  const uncommitted = commit !== null && brandUncommitted(options.root);
  if (uncommitted) options.log(bookText(options.langs[0] ?? "en").exportUncommitted);
  return { commit, uncommitted };
}
function loadSource(options) {
  const full = isFullDoc(options.doc) ? FULL_BOOKS[options.doc] : null;
  if (options.fixture) {
    if (full) return { doc: null, book: illustrativeBook(full, "en", options.edition), assetUrl: () => null, commit: null, uncommitted: false };
    const doc2 = options.doc === "identity" ? illustrativeVisualIdentity(options.edition, "complete") : illustrativeBusinessModelCanvas("en", options.edition);
    return { doc: doc2, book: null, assetUrl: () => null, commit: null, uncommitted: false };
  }
  const slug = new InterviewEngine(options.root).config().brand.slug;
  const { projection, previews } = buildProjection(options.root, slug);
  const visual = projection.visual;
  if (full) {
    const book = visual?.books?.[full]?.[options.edition] ?? null;
    if (!book) throw new ExportError("no_document", fillVisual(bookText(options.langs[0] ?? "en").exportNoDocument, { doc: options.doc }));
    return { doc: null, book, assetUrl: assetEmbedder(previews), ...committed(options) };
  }
  const doc = !visual ? null : options.doc === "identity" ? visual.identity?.[options.edition] ?? null : visual.bmc.applies ? visual.bmc[options.edition] : null;
  if (!doc) throw new ExportError("no_document", fillVisual(bookText(options.langs[0] ?? "en").exportNoDocument, { doc: options.doc }));
  return { doc, book: null, assetUrl: assetEmbedder(previews), ...committed(options) };
}
function dumpDom(chrome, file) {
  try {
    return execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--allow-file-access-from-files", "--window-size=1200,2000", "--virtual-time-budget=15000", "--dump-dom", pathToFileURL(file).href], { encoding: "utf8", timeout: 12e4, maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
}
function readResult(dom, id) {
  if (!dom) return null;
  const match = dom.match(new RegExp(`<pre id="${id}">([^<]*)</pre>`));
  if (!match) return null;
  return JSON.parse(match[1].replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&"));
}
var MEASURE = `document.fonts.ready.then(() => {
  const mm = (px) => (px * 25.4) / 96
  const out = {}
  for (const el of document.querySelectorAll('[data-flow]')) out[el.dataset.flow] = mm(el.getBoundingClientRect().height)
  for (const el of document.querySelectorAll('[data-flow-table]')) {
    const id = el.dataset.flowTable
    let sum = 0
    el.querySelectorAll('tbody > tr').forEach((tr, i) => { const h = mm(tr.getBoundingClientRect().height); out[id + ':r' + i] = h; sum += h })
    out[id + ':head'] = mm(el.getBoundingClientRect().height) - sum
  }
  for (const el of document.querySelectorAll('[data-note]')) out['note:' + el.dataset.note] = mm(el.getBoundingClientRect().height) + 1
  const pre = document.createElement('pre'); pre.id = 'bk-measure'; pre.textContent = JSON.stringify(out); document.body.append(pre)
})`;
var CHECK = `document.fonts.ready.then(() => {
  const bad = [...document.querySelectorAll('.bk-sheet')].filter((s) => { const b = s.querySelector('.bk-body'); return b && b.scrollHeight > b.clientHeight + 1 }).map((s) => Number(s.dataset.folio))
  const pre = document.createElement('pre'); pre.id = 'bk-check'; pre.textContent = JSON.stringify(bad); document.body.append(pre)
})`;
function measureBook(chrome, input, galleyFile) {
  return measureGalley(chrome, identityBookGalley(input).value, galleyFile);
}
function measureGalley(chrome, galley, galleyFile) {
  writeOutput(galleyFile, withScript(galley, MEASURE));
  try {
    const result = readResult(dumpDom(chrome, galleyFile), "bk-measure");
    return result ? new Map(Object.entries(result).filter(([, value2]) => Number.isFinite(value2))) : void 0;
  } finally {
    fs2.rmSync(galleyFile, { force: true });
  }
}
function withScript(page, script) {
  return page.replace("</body>", `<script>${script}</script>
</body>`);
}
function printPdf(chrome, htmlFile, pdfFile) {
  refuseLink(pdfFile);
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--no-pdf-header-footer", "--allow-file-access-from-files", `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href], { stdio: "ignore", timeout: 12e4 });
  const text3 = fs2.readFileSync(pdfFile).toString("latin1");
  return (text3.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length || null;
}
function shown(root, file) {
  const relative = path2.relative(root, file);
  return relative && !relative.startsWith("..") && !path2.isAbsolute(relative) ? relative : file;
}
function exportVisual(options) {
  if (process.env[AGENT_TOKEN_ENV]) throw new ExportError("agent_token", bookText("en").exportRefusedAgent);
  const bookLike = options.doc !== "bmc";
  const profile = options.profile ?? (bookLike ? "book_a4_portrait" : "canvas_a3_landscape");
  const spec = PRINT_PROFILE_SPECS[profile];
  const t2 = bookText(options.langs[0] ?? "en");
  if (spec.status === "planned") throw new ExportError("planned", fillVisual(t2.exportPlanned, { profile }));
  const expected = bookLike ? "book_a4_portrait" : "canvas_a3_landscape";
  if (profile !== expected) throw new ExportError("usage", `--profile ${profile} does not apply to --doc ${options.doc} (use ${expected}).`);
  if (options.doc === "business-report" && options.edition === "public") throw new ExportError("usage", fullBookText(options.langs[0] ?? "en").exportReportNotPublic);
  const out = checkOutput(options.root, options.out);
  const source2 = loadSource(options);
  fs2.mkdirSync(out, { recursive: true });
  checkOutput(options.root, out);
  const book = bookLike;
  const head2 = html`<style>${trusted(embeddedStyles(book))}</style>`;
  const chrome = options.pdf ? options.chrome : null;
  if (!chrome) options.log(t2.exportNoChrome);
  const results = [];
  for (const lang of options.langs) {
    const name = `${options.doc}.${options.edition}.${lang}`;
    const htmlFile = path2.join(out, `${name}.html`);
    let page;
    let measured = 0;
    if (source2.book) {
      const full = options.fixture && isFullDoc(options.doc) ? illustrativeBook(FULL_BOOKS[options.doc], lang, options.edition) : source2.book;
      const input = { book: full, lang, commit: source2.commit, uncommitted: source2.uncommitted, head: head2, toolbar: html``, assetUrl: source2.assetUrl };
      const heights = chrome ? measureGalley(chrome, fullBookGalley(input).value, path2.join(out, `.${name}.galley.html`)) : void 0;
      if (heights) {
        measured = heights.size;
        options.log(fillVisual(bookText(lang).exportMeasured, { count: measured }));
      } else if (chrome) options.log(bookText(lang).exportMeasureFailed);
      page = fullBookDocument({ ...input, heights }).html;
    } else if (book) {
      const doc = source2.doc;
      const input = { doc, lang, commit: source2.commit, uncommitted: source2.uncommitted, head: head2, toolbar: html``, assetUrl: source2.assetUrl };
      const heights = chrome ? measureBook(chrome, input, path2.join(out, `.${name}.galley.html`)) : void 0;
      if (heights) {
        measured = heights.size;
        options.log(fillVisual(bookText(lang).exportMeasured, { count: measured }));
      } else if (chrome) options.log(bookText(lang).exportMeasureFailed);
      page = identityBookDocument({ ...input, heights }).html;
    } else {
      const doc = options.fixture ? illustrativeBusinessModelCanvas(lang, options.edition) : source2.doc;
      page = printDocument({ doc, lang, commit: source2.commit, head: head2, toolbar: html`` });
    }
    assertNoSecrets(page.value);
    writeOutput(htmlFile, page.value);
    options.log(fillVisual(bookText(lang).exportWrote, { file: shown(options.root, htmlFile) }));
    let pdf = null;
    let pages = null;
    let overflow = [];
    if (chrome) {
      pdf = path2.join(out, `${name}.pdf`);
      pages = printPdf(chrome, htmlFile, pdf);
      options.log(fillVisual(bookText(lang).exportWrote, { file: shown(options.root, pdf) }));
      if (book) {
        const checkFile = path2.join(out, `.${name}.check.html`);
        writeOutput(checkFile, withScript(page.value, CHECK));
        overflow = readResult(dumpDom(chrome, checkFile), "bk-check") ?? [];
        fs2.rmSync(checkFile, { force: true });
        for (const folio of overflow) options.log(fillVisual(bookText(lang).exportOverflow, { page: folio, file: path2.basename(htmlFile) }));
      }
    }
    results.push({ lang, html: htmlFile, pdf, pages, measured, overflow });
  }
  return results;
}
function langsFor(root, value2, fixture) {
  if (value2 && value2 !== "all") {
    if (!isVisualLang(value2)) throw new ExportError("usage", `--lang must be en, fa, tr or all (got ${value2}).`);
    return [value2];
  }
  if (fixture) return [...VISUAL_LANGS];
  const supported = new InterviewEngine(root).config().brand.supported_locales ?? [];
  const langs = VISUAL_LANGS.filter((lang) => supported.includes(lang));
  return langs.length ? langs : ["en"];
}
function main() {
  const { values } = parseArgs({
    options: {
      doc: { type: "string" },
      lang: { type: "string" },
      edition: { type: "string" },
      profile: { type: "string" },
      out: { type: "string" },
      root: { type: "string" },
      fixture: { type: "boolean" },
      "no-pdf": { type: "boolean" },
      help: { type: "boolean" }
    }
  });
  if (values.help) {
    console.log(HELP);
    return 0;
  }
  try {
    const root = path2.resolve(values.root ?? process.cwd());
    const doc = values.doc ?? "identity";
    if (!EXPORT_DOCS.includes(doc)) throw new ExportError("usage", fillVisual(fullBookText("en").exportUnknownDoc, { doc }));
    const edition = values.edition ?? "internal";
    if (edition !== "internal" && edition !== "public") throw new ExportError("usage", `--edition must be internal or public (got ${edition}).`);
    const profile = values.profile ?? null;
    if (profile !== null && !(profile in PRINT_PROFILE_SPECS)) throw new ExportError("usage", `--profile must be one of ${Object.keys(PRINT_PROFILE_SPECS).join(", ")}.`);
    exportVisual({
      root,
      doc,
      langs: langsFor(root, values.lang, Boolean(values.fixture)),
      edition,
      profile,
      out: values.out ?? path2.join("dist", "visual-export"),
      fixture: Boolean(values.fixture),
      pdf: !values["no-pdf"],
      chrome: findChrome(),
      log: (line) => console.log(line)
    });
    return 0;
  } catch (error) {
    if (error instanceof ExportError) {
      console.error(error.message);
      return error.code === "usage" ? 64 : 2;
    }
    throw error;
  }
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href || process.env.BRAND_OS_ENTRY === "export-visual") process.exitCode = main();
export {
  EXPORT_DOCS,
  ExportError,
  brandUncommitted,
  checkOutput,
  exportVisual,
  findChrome,
  measureBook,
  measureGalley
};
