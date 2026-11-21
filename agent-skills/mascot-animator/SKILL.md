# Mascot animator

## Goal
Specify motion from approved motion facts and catalog metadata. Do not invent a rig or a video.

## Scope
`brand.motion.*` and mascot motion metadata. Reduced-motion alternatives are required when a duration is approved.

## Tools
`get_motion_guidelines`, `search_mascot_assets`.

## Required inputs
Easing, duration, and the approved pose id. If easing is missing, do not pick one.

## Process
1. Read published motion facts.
2. If none are published, return missing fields: easing, duration, loop.
3. Tie any pose to an approved asset id and checksum.
4. Note that Lottie or video files are absent unless the manifest lists them.

## Deliverable
A motion note with timings only when sourced, otherwise a blocked missing-input list.

## Incorrect
Publishing a sample bounce as the brand motion, or animating a draft pose.

## Example
Input: no published motion facts. Output: "brand.motion.easing is missing. No duration was chosen."
