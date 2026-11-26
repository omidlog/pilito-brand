import { createRequire as __engineRequire } from 'node:module'; const require = __engineRequire(import.meta.url);
import {
  evaluateKit,
  kitSafetyProblems,
  readKit
} from "./chunk-AQ6QTRSP.mjs";

// packages/brand-core/src/social-kit/rotation.ts
function surfacesForFormat(format, channel) {
  if (channel === "linkedin") {
    if (format === "post") return ["linkedin_post"];
    if (format === "carousel") return ["linkedin_document"];
    return [];
  }
  switch (format) {
    case "reel":
    case "short_video":
      return ["reel", "reel_cover"];
    case "post":
      return ["post"];
    case "carousel":
      return ["carousel"];
    case "story":
      return ["story"];
    case "video":
      return ["thumbnail"];
    default:
      return [];
  }
}
function rotateStyles(approvedStyleIds, slotIndex) {
  if (approvedStyleIds.length === 0) return null;
  const index = Number.isInteger(slotIndex) && slotIndex >= 0 ? slotIndex : 0;
  return approvedStyleIds[index % approvedStyleIds.length] ?? null;
}
function stylesForFormat(root, format, channel, brandSlug) {
  const surfaces = surfacesForFormat(format, channel);
  const base = { format, channel: channel ?? null, surfaces };
  if (surfaces.length === 0) return { ...base, styles: {}, state: "not_applicable" };
  const read = readKit(root, brandSlug);
  if (read.state !== "ok") return { ...base, styles: {}, state: read.state };
  if (kitSafetyProblems(read.kit).length) return { ...base, styles: {}, state: "invalid" };
  const states = evaluateKit(root, read.kit);
  const styles = {};
  for (const surface of surfaces) styles[surface] = states.filter((state) => state.style.surface === surface && state.status === "approved").map((state) => state.style.id);
  return { ...base, styles, state: "ok" };
}

export {
  surfacesForFormat,
  rotateStyles,
  stylesForFormat
};
