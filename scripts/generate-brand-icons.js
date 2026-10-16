const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. The Official Kynov Vector Mark SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
  <defs>
    <linearGradient id="kynov-icon-grad" x1="15" y1="260" x2="285" y2="10" gradientUnits="userSpaceOnUse">
      <stop class="stop-0" offset="0%" stop-color="#101755" />
      <stop class="stop-1" offset="35%" stop-color="#1B2685" />
      <stop class="stop-2" offset="70%" stop-color="#2D3FEA" />
      <stop class="stop-3" offset="100%" stop-color="#4F62FF" />
    </linearGradient>
    <style>
      @media (prefers-color-scheme: dark) {
        .stop-0 { stop-color: #2D3FEA; }
        .stop-1 { stop-color: #4F62FF; }
        .stop-2 { stop-color: #6366F1; }
        .stop-3 { stop-color: #818CF8; }
      }
    </style>
  </defs>

  <g transform="translate(14, 28)">
    <!-- Main outer structure and inner cutouts -->
    <path 
      d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z" 
      fill="url(#kynov-icon-grad)" 
      fill-rule="evenodd" 
    />
    
    <!-- Lower diagonal leg -->
    <path 
      d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z" 
      fill="url(#kynov-icon-grad)" 
    />
  </g>
</svg>`;

// Standard SVG for static rasterization (without media queries to guarantee reliable rendering in Sharp)
const staticSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" fill="none">
  <defs>
    <linearGradient id="kynov-static-grad" x1="15" y1="260" x2="285" y2="10" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0E164D" />
      <stop offset="35%" stop-color="#1A2680" />
      <stop offset="70%" stop-color="#2D3FEA" />
      <stop offset="100%" stop-color="#4F62FF" />
    </linearGradient>
  </defs>
  <g transform="translate(14, 28)">
    <path 
      d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z" 
      fill="url(#kynov-static-grad)" 
      fill-rule="evenodd" 
    />
    <path 
      d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z" 
      fill="url(#kynov-static-grad)" 
    />
  </g>
</svg>`;

async function run() {
  console.log('Writing SVGs...');
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../app/icon.svg'), svgContent, 'utf8');

  // Rasterize PNGs
  const staticBuf = Buffer.from(staticSvg);

  const pngSizes = [
    { size: 48, file: 'public/icon-48.png' },
    { size: 96, file: 'public/icon-96.png' },
    { size: 192, file: 'public/icon-192.png' },
    { size: 512, file: 'public/icon-512.png' },
  ];

  for (const { size, file } of pngSizes) {
    await sharp(staticBuf)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', file));
    console.log(`Generated ${file} (${size}x${size})`);
  }

  // Apple touch icon (180x180 with sleek dark slate frame)
  const mark120 = await sharp(staticBuf).resize(120, 120).toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 11, g: 15, b: 32, alpha: 1 },
    },
  })
    .composite([{ input: mark120, top: 30, left: 30 }])
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated public/apple-touch-icon.png (180x180)');

  // High-resolution OpenGraph card (1200x630)
  const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#070A18" />
    <defs>
      <radialGradient id="bgGlow" cx="20%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#2D3FEA" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#070A18" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="cornerGlow" cx="90%" cy="10%" r="50%">
        <stop offset="0%" stop-color="#4F62FF" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#070A18" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="ogGrad" x1="15" y1="260" x2="285" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0E164D" />
        <stop offset="35%" stop-color="#1A2680" />
        <stop offset="70%" stop-color="#2D3FEA" />
        <stop offset="100%" stop-color="#4F62FF" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bgGlow)" />
    <rect width="1200" height="630" fill="url(#cornerGlow)" />

    <!-- Subtle grid overlay -->
    <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105" />
      <line x1="0" y1="210" x2="1200" y2="210" />
      <line x1="0" y1="315" x2="1200" y2="315" />
      <line x1="0" y1="420" x2="1200" y2="420" />
      <line x1="0" y1="525" x2="1200" y2="525" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
    </g>

    <!-- Kynov Monogram Mark -->
    <g transform="translate(100, 165) scale(1)">
      <g transform="translate(14, 28)">
        <path 
          d="M 268 7 L 165 7 L 26 155 L 26 66 L 66 42 L 67 96 L 91 71 L 91 0 L 0 54 L 1 192 L 81 240 Z M 218 32 L 124 147 L 103 122 L 67 161 L 66 203 L 35 184 L 35 180 L 175 31 Z M 92 146 L 109 167 L 92 187 Z" 
          fill="url(#ogGrad)" 
          fill-rule="evenodd" 
        />
        <path 
          d="M 130 194 L 166 238 L 270 239 L 184 129 L 168 148 L 220 213 L 176 213 L 145 175 Z" 
          fill="url(#ogGrad)" 
        />
      </g>
    </g>

    <!-- Typography -->
    <text x="430" y="275" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="96" font-weight="800" fill="#FFFFFF" letter-spacing="-0.04em">Kynov</text>
    <text x="435" y="340" font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" font-size="32" font-weight="600" fill="#818CF8" letter-spacing="-0.01em">Agile Velocity &amp; Sprint Tracking</text>
    <text x="435" y="405" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">High-performance Kanban boards, sprint backlogs, velocity sparklines,</text>
    <text x="435" y="440" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">and enterprise-grade team collaboration.</text>

    <!-- Badge -->
    <rect x="435" y="475" width="220" height="38" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="455" cy="494" r="5" fill="#10B981" />
    <text x="470" y="500" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="#F1F5F9">Next-Gen Agile Engine</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(__dirname, '../public/og-image.png'));
  console.log('Generated public/og-image.png (1200x630)');

  // Multi-size favicon.ico using python Pillow
  console.log('Generating multi-resolution favicon.ico...');
  execSync(`python3 -c "
from PIL import Image
img = Image.open('public/icon-512.png')
img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
img.save('app/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print('Saved public/favicon.ico and app/favicon.ico')
"`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
