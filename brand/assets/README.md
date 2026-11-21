# Assets

Source files and exports are different. Large video, 3D, and print masters should use Git LFS or `assets.bucket_url`, with a checksum in `asset-manifest.yaml`.

The SVG files in this template are EXAMPLE placeholders so links and checksums are real. They are not a logo or a character.

Approved assets must set `present: true` and match `checksum_sha256`. Missing assets stay `present: false`.
