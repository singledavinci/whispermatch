# WhisperMatch PWA - Icon Generation Instructions

The WhisperMatch app icon features a pink-purple gradient heart with circuit board patterns, representing the fusion of love and blockchain technology.

## Icon Design
- **Base Design**: Circuit-pattern heart with soft glow
- **Colors**: Pink (#ec4899) to Purple (#a855f7) gradient
- **Background**: Dark (#0a0a0c)
- **Style**: Modern, minimalist, tech-forward

## Required Sizes

Generate the following sizes from the 512x512 master icon:

```bash
# Install ImageMagick if not already installed
# brew install imagemagick (Mac)
# sudo apt-get install imagemagick (Linux)

cd frontend/public/icons

# Generate all sizes from master
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## Alternative: Online Tool

If ImageMagick is not available, use:
1. https://realfavicongenerator.net/
2. Upload the 512x512 icon
3. Download all generated sizes
4. Place in `frontend/public/icons/`

## Verification

After generating, verify all files exist:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png (master)
