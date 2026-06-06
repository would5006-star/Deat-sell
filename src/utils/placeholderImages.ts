/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates an aesthetic, high-contrast vector gradient banner as a Base64 SVG Image.
 * Ideal for premium Instagram growth mock services, running 100% offline.
 */
export function generateGradientPlaceholder(title: string, category: string, colorIndex = 0): string {
  const gradients = [
    { from: '#6200EA', to: '#00C853', text: '#FFFFFF', sub: 'Premium Optimization' }, // Violet -> Emerald
    { from: '#0F0F0F', to: '#6200EA', text: '#FFFFFF', sub: 'Instagram Growth' },     // Charcoal -> Deep violet
    { from: '#FF4081', to: '#6200EA', text: '#FFFFFF', sub: 'Engagement Maximizer' }, // Pink -> Violet
    { from: '#0F0F0F', to: '#1E1E1E', text: '#00C853', sub: 'Profile Boost' },        // Dark -> Dark charcoal with Green text
    { from: '#2979FF', to: '#1E1E1E', text: '#FFFFFF', sub: 'Verification & Trust' }, // Neon Blue -> Dark
    { from: '#AA00FF', to: '#FF4081', text: '#FFFFFF', sub: 'Viral Reaching Boost' }, // Magenta -> Pink
  ];

  const theme = gradients[colorIndex % gradients.length];
  
  // Format long titles into lines for SVG display
  const titleWords = title.split(' ');
  const titleLine1 = titleWords.slice(0, 3).join(' ');
  const titleLine2 = titleWords.slice(3).join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad-${colorIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.from}" />
        <stop offset="100%" stop-color="${theme.to}" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="2" dy="4" stdDeviation="5" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <rect width="600" height="400" fill="url(#grad-${colorIndex})" />
    
    <!-- Grid overlay pattern for a technical vibe -->
    <path d="M 0,50 L 600,50 M 0,100 L 600,100 M 0,150 L 600,150 M 0,200 L 600,200 M 0,250 L 600,250 M 0,300 L 600,300 M 0,350 L 600,350" stroke="${theme.text}" opacity="0.03" stroke-width="1" />
    <path d="M 50,0 L 50,400 M 100,0 L 100,400 M 150,0 L 150,400 M 200,0 L 200,400 M 250,0 L 250,400 M 300,0 L 300,400 M 350,0 L 350,400 M 400,0 L 400,400 M 450,0 L 450,400 M 500,0 L 500,400 M 550,0 L 550,400" stroke="${theme.text}" opacity="0.03" stroke-width="1" />
    
    <!-- Stylized Instagram Camera Badge -->
    <g transform="translate(480, 60)" opacity="0.15">
      <rect x="0" y="0" width="60" height="60" rx="16" fill="none" stroke="${theme.text}" stroke-width="6"/>
      <circle cx="30" cy="30" r="15" fill="none" stroke="${theme.text}" stroke-width="6"/>
      <circle cx="45" cy="15" r="4" fill="${theme.text}"/>
    </g>
    
    <!-- Content Card -->
    <g transform="translate(40, 50)" filter="url(#shadow)">
      <!-- Pill Label -->
      <rect x="0" y="0" width="160" height="32" rx="16" fill="${theme.text}" opacity="0.15" />
      <text x="14" y="21" fill="${theme.text}" font-family="system-ui, sans-serif" font-weight="800" font-size="12" letter-spacing="0.1em">${category.toUpperCase()}</text>
      
      <!-- Growth Service Subtitle -->
      <text x="0" y="70" fill="${theme.text}" opacity="0.75" font-family="system-ui, sans-serif" font-weight="600" font-size="14" letter-spacing="0.2em">${theme.sub.toUpperCase()}</text>
      
      <!-- Title text with nice typography -->
      <text x="0" y="125" fill="${theme.text}" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.03em">${titleLine1}</text>
      ${titleLine2 ? `<text x="0" y="170" fill="${theme.text}" font-family="system-ui, sans-serif" font-weight="900" font-size="34" letter-spacing="-0.03em">${titleLine2}</text>` : ''}
      
      <!-- Small Premium Badge -->
      <g transform="translate(0, 270)">
        <path d="M0,0 L12,0 M0,6 L8,6 M0,12 L10,12" stroke="${theme.text}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
        <text x="24" y="9" fill="${theme.text}" font-family="system-ui, sans-serif" font-weight="700" font-size="10" letter-spacing="0.15em" opacity="0.8">DEAT SELL QUALITY APPROVED</text>
      </g>
    </g>
    
    <!-- Accent Line -->
    <rect x="0" y="392" width="600" height="8" fill="#00C853" />
  </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
