/**
 * Enterprise AI Course Art Studio & Smart Banner Helper
 * Dynamically generates real enterprise-grade course covers, thumbnails, and banners
 * with topic-tailored vector emblems, logos, code overlays, and custom typography.
 */

const CATEGORY_BANNERS = {
  'Programming': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
  'Java': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop',
  'Python': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
  'AI & ML': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1000&auto=format&fit=crop',
  'Design': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  'UI/UX': 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop',
  'Graphic Design': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop',
  '3D Modeling': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
  'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
  'Business': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
  'Cyber Security': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
  'Cloud': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
  'Soft Skills': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop',
};

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop';

export function getCourseBannerUrl(course) {
  if (!course) return DEFAULT_BANNER;
  const url = course.bannerUrl || course.thumbnailUrl;
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/'))) {
    return url;
  }
  const category = course.category || '';
  const title = course.title || '';

  for (const key in CATEGORY_BANNERS) {
    if (category.toLowerCase().includes(key.toLowerCase()) || title.toLowerCase().includes(key.toLowerCase())) {
      return CATEGORY_BANNERS[key];
    }
  }

  return DEFAULT_BANNER;
}

export function getCourseThumbnailUrl(course) {
  if (!course) return DEFAULT_BANNER;
  const url = course.thumbnailUrl || course.bannerUrl;
  if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/'))) {
    return url;
  }
  return getCourseBannerUrl(course);
}

export function getCategoryPresetBanners() {
  return CATEGORY_BANNERS;
}

function escapeSvgText(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Detect Topic Type based on title and category keywords
 */
function detectTopicType(title = '', category = '') {
  const text = `${title} ${category}`.toLowerCase();

  if (/java|spring|backend|hibernate|maven|jvm|microservice/.test(text)) {
    return 'JAVA';
  }
  if (/python|ai|machine|learning|deep|neural|data science|pandas|numpy|tensorflow|pytorch|chatgpt|llm/.test(text)) {
    return 'PYTHON_AI';
  }
  if (/react|frontend|javascript|js|web|html|css|next|vue|angular|typescript|node|full stack/.test(text)) {
    return 'REACT_WEB';
  }
  if (/cyber|security|ethical|hacking|firewall|network|crypto|penetration|bug bounty/.test(text)) {
    return 'CYBER_SECURITY';
  }
  if (/cloud|aws|azure|devops|docker|kubernetes|server|linux|sysadmin/.test(text)) {
    return 'CLOUD_DEVOPS';
  }
  if (/design|ui|ux|figma|graphic|photoshop|illustrator|canvas|adobe/.test(text)) {
    return 'DESIGN';
  }
  if (/3d|animation|blender|unreal|unity|game|render|cgi/.test(text)) {
    return 'THREE_D';
  }
  return 'GENERAL';
}

/**
 * Generates an Enterprise-Grade Dynamic SVG Cover / Banner
 */
export function generateDynamicAISvg(title = '', category = 'Programming', isBanner = false, themeIndex = 0) {
  const rawTitle = (title.trim() || 'Software Development Masterclass');
  const displayTitle = rawTitle.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
  const displayCategory = (category.trim() || 'Tech & Engineering').toUpperCase();
  const topic = detectTopicType(title, category);

  // High-resolution Unsplash photo background overlays matched to topic
  const topicPhotos = {
    JAVA: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
    PYTHON_AI: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop',
    REACT_WEB: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
    CYBER_SECURITY: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    CLOUD_DEVOPS: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    DESIGN: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    THREE_D: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
    GENERAL: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
  };

  const topicThemes = {
    JAVA: { bg1: '#064e3b', bg2: '#022c22', accent: '#10b981', glow: '#34d399', badgeBg: '#059669', codeSnippet: 'public class JavaCourse {\n  public static void main(String[] args) {\n    System.out.println("Enterprise Learning Platform Java");\n  }\n}' },
    PYTHON_AI: { bg1: '#31103f', bg2: '#0f051d', accent: '#c084fc', glow: '#f472b6', badgeBg: '#9333ea', codeSnippet: 'import torch\nimport numpy as np\nmodel = NeuralNetwork(layers=128)\nprint("AI Model Trained 100%")' },
    REACT_WEB: { bg1: '#0f172a', bg2: '#0284c7', accent: '#38bdf8', glow: '#818cf8', badgeBg: '#0284c7', codeSnippet: 'import React from "react";\nexport default function App() {\n  return <Enterprise Learning PlatformCatalog />;\n}' },
    CYBER_SECURITY: { bg1: '#451a03', bg2: '#18181b', accent: '#f59e0b', glow: '#ef4444', badgeBg: '#d97706', codeSnippet: '01001001 01001110 01010100 01010010\n[FIREWALL ENFORCED: 256-BIT BITCODE]\nSTATUS: AUTHENTICATED & SECURE' },
    CLOUD_DEVOPS: { bg1: '#0c4a6e', bg2: '#0369a1', accent: '#06b6d4', glow: '#38bdf8', badgeBg: '#0284c7', codeSnippet: 'docker run -d -p 8080:8080 skillsphere/backend:latest\nkubectl scale deployment --replicas=5' },
    DESIGN: { bg1: '#4c1d95', bg2: '#1e1b4b', accent: '#a855f7', glow: '#f43f5e', badgeBg: '#7c3aed', codeSnippet: '/* UI Canvas System */\n:root {\n  --primary: #a855f7;\n  --radius: 16px;\n}' },
    THREE_D: { bg1: '#1e1b4b', bg2: '#0f172a', accent: '#6366f1', glow: '#ec4899', badgeBg: '#4f46e5', codeSnippet: 'const mesh = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial()\n);' },
    GENERAL: { bg1: '#0f172a', bg2: '#1e293b', accent: '#10b981', glow: '#38bdf8', badgeBg: '#059669', codeSnippet: 'class Enterprise Learning Platform {\n  constructor() { this.version = "2.0"; }\n}' }
  };

  const themeKeys = ['JAVA', 'REACT_WEB', 'PYTHON_AI', 'CYBER_SECURITY'];
  const activeThemeKey = themeIndex > 0 ? themeKeys[(themeIndex - 1) % themeKeys.length] : topic;
  const theme = topicThemes[activeThemeKey] || topicThemes.GENERAL;
  const photoUrl = topicPhotos[activeThemeKey] || topicPhotos.GENERAL;

  // Split title if long
  let line1 = displayTitle;
  let line2 = '';
  if (displayTitle.length > 20) {
    const words = displayTitle.split(' ');
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  // Topic vector graphic generator
  const renderTopicVector = (cx, cy, scaleFactor = 1.0) => {
    switch (activeThemeKey) {
      case 'JAVA':
        return `
          <g transform="translate(${cx - 50 * scaleFactor}, ${cy - 50 * scaleFactor}) scale(${scaleFactor})">
            <circle cx="50" cy="50" r="46" fill="rgba(16,185,129,0.25)" stroke="${theme.glow}" stroke-width="2.5"/>
            <path d="M 40 25 C 38 18, 48 18, 44 12" fill="none" stroke="${theme.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 50 25 C 48 18, 58 18, 54 12" fill="none" stroke="${theme.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 60 25 C 58 18, 68 18, 64 12" fill="none" stroke="${theme.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 32 35 L 35 62 C 35 70, 65 70, 65 62 L 68 35 Z" fill="${theme.accent}"/>
            <path d="M 68 40 C 78 40, 78 52, 67 54" fill="none" stroke="${theme.accent}" stroke-width="4"/>
            <rect x="28" y="70" width="44" height="5" rx="2.5" fill="${theme.glow}"/>
            <text x="50" y="52" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">JAVA</text>
          </g>
        `;
      case 'REACT_WEB':
        return `
          <g transform="translate(${cx - 50 * scaleFactor}, ${cy - 50 * scaleFactor}) scale(${scaleFactor})">
            <circle cx="50" cy="50" r="10" fill="${theme.glow}"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${theme.glow}" stroke-width="3.5" transform="rotate(0 50 50)"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${theme.glow}" stroke-width="3.5" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${theme.glow}" stroke-width="3.5" transform="rotate(120 50 50)"/>
          </g>
        `;
      case 'PYTHON_AI':
        return `
          <g transform="translate(${cx - 50 * scaleFactor}, ${cy - 50 * scaleFactor}) scale(${scaleFactor})">
            <circle cx="50" cy="50" r="46" fill="rgba(192,132,252,0.25)" stroke="${theme.glow}" stroke-width="2.5"/>
            <line x1="25" y1="35" x2="50" y2="20" stroke="${theme.glow}" stroke-width="2"/>
            <line x1="50" y1="20" x2="75" y2="35" stroke="${theme.glow}" stroke-width="2"/>
            <line x1="75" y1="35" x2="75" y2="65" stroke="${theme.glow}" stroke-width="2"/>
            <line x1="75" y1="65" x2="50" y2="80" stroke="${theme.glow}" stroke-width="2"/>
            <line x1="50" y1="80" x2="25" y2="65" stroke="${theme.glow}" stroke-width="2"/>
            <line x1="25" y1="65" x2="25" y2="35" stroke="${theme.glow}" stroke-width="2"/>
            <circle cx="50" cy="50" r="10" fill="#ffffff"/>
          </g>
        `;
      default:
        return `
          <g transform="translate(${cx - 50 * scaleFactor}, ${cy - 50 * scaleFactor}) scale(${scaleFactor})">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="rgba(255,255,255,0.1)" stroke="${theme.glow}" stroke-width="3"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="${theme.glow}" stroke-width="2"/>
            <circle cx="50" cy="50" r="9" fill="${theme.glow}"/>
          </g>
        `;
    }
  };

  // ---------------------------------------------------------------------------
  // 1. THUMBNAIL LAYOUT (Aspect Ratio 800x450 - Perfect 16:9 Fit inside Card)
  // ---------------------------------------------------------------------------
  if (!isBanner) {
    const width = 800;
    const height = 450;

    const svgThumbnail = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="thumbBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="60%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="thumbOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(15,23,42,0.95)"/>
      <stop offset="60%" stop-color="rgba(15,23,42,0.80)"/>
      <stop offset="100%" stop-color="rgba(15,23,42,0.35)"/>
    </linearGradient>
    <linearGradient id="thumbTitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="thumbAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.glow}"/>
    </linearGradient>
  </defs>

  <!-- Base Gradient Background -->
  <rect width="${width}" height="${height}" fill="url(#thumbBgGrad)"/>

  <!-- High-Res Unsplash Photo Overlay -->
  <image href="${photoUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.4"/>

  <!-- Dark Reading Overlay -->
  <rect width="${width}" height="${height}" fill="url(#thumbOverlay)"/>

  <!-- Topic Vector Emblem Right Side -->
  ${renderTopicVector(630, 225, 1.7)}

  <!-- Content Container Left Side -->
  <g transform="translate(45, 45)">
    <!-- Top Badges -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="145" height="30" rx="15" fill="${theme.badgeBg}"/>
      <text x="14" y="19" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" letter-spacing="1">✦ SKILLSPHERE</text>

      <rect x="157" y="0" width="155" height="30" rx="15" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
      <text x="172" y="19" fill="${theme.glow}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="0.8">${escapeSvgText(displayCategory)}</text>
    </g>

    <!-- Title Section -->
    <g transform="translate(0, 100)">
      <text fill="url(#thumbTitleGrad)" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${line2 ? 40 : 48}">
        <tspan x="0" dy="42">${escapeSvgText(line1)}</tspan>
        ${line2 ? `<tspan x="0" dy="52">${escapeSvgText(line2)}</tspan>` : ''}
      </text>

      <!-- Accent Line under Title -->
      <rect x="0" y="${line2 ? 106 : 54}" width="150" height="6" rx="3" fill="url(#thumbAccent)"/>
    </g>

    <!-- Footer Stats -->
    <g transform="translate(0, 340)">
      <text fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900">
        ★★★★★ <tspan fill="rgba(255,255,255,0.9)" font-size="13" font-weight="700">4.9 • PRO CERTIFICATION</tspan>
      </text>
    </g>
  </g>
</svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgThumbnail)}`;
  }

  // ---------------------------------------------------------------------------
  // 2. BANNER LAYOUT (Aspect Ratio 1200x450 - Wide Landscape Hero Banner)
  // ---------------------------------------------------------------------------
  const width = 1200;
  const height = 450;

  const svgBanner = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bannerBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="55%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="bannerOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(15,23,42,0.95)"/>
      <stop offset="50%" stop-color="rgba(15,23,42,0.7)"/>
      <stop offset="100%" stop-color="rgba(15,23,42,0.15)"/>
    </linearGradient>
    <linearGradient id="bannerTitle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="bannerLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="${theme.glow}"/>
    </linearGradient>
  </defs>

  <!-- Base Gradient Background -->
  <rect width="${width}" height="${height}" fill="url(#bannerBgGrad)"/>

  <!-- High-Res Unsplash Topic Photo Background -->
  <image href="${photoUrl}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.38"/>

  <!-- Dark Reading Overlay -->
  <rect width="${width}" height="${height}" fill="url(#bannerOverlay)"/>

  <!-- Top & Bottom Horizontal Neon Accent Bars -->
  <rect x="0" y="0" width="${width}" height="6" fill="url(#bannerLine)"/>
  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="url(#bannerLine)"/>

  <!-- Code Snippet Watermark Overlay -->
  <g opacity="0.12" transform="translate(520, 55)">
    <text fill="#ffffff" font-family="monospace" font-size="13" font-weight="600">
      ${escapeSvgText(theme.codeSnippet).split('\n').map((line, idx) => `<tspan x="0" dy="${idx === 0 ? 0 : 20}">${line}</tspan>`).join('')}
    </text>
  </g>

  <!-- Right Side Architectural Tech Vector Emblem -->
  ${renderTopicVector(940, 225, 1.8)}

  <!-- Left Side Content Section -->
  <g transform="translate(55, 50)">
    <!-- Badges Row -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="165" height="32" rx="16" fill="${theme.badgeBg}"/>
      <text x="14" y="20" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" letter-spacing="1.2">✦ SKILLSPHERE AI</text>

      <rect x="177" y="0" width="190" height="32" rx="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
      <text x="192" y="20" fill="${theme.glow}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="1">${escapeSvgText(displayCategory)}</text>
    </g>

    <!-- Main Course Title -->
    <g transform="translate(0, 135)">
      <text fill="url(#bannerTitle)" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${line2 ? 42 : 48}">
        <tspan x="0" dy="0">${escapeSvgText(line1)}</tspan>
        ${line2 ? `<tspan x="0" dy="54">${escapeSvgText(line2)}</tspan>` : ''}
      </text>

      <!-- Accent Line under Title -->
      <rect x="0" y="${line2 ? 72 : 24}" width="170" height="6" rx="3" fill="url(#bannerLine)"/>
    </g>

    <!-- Footer Tagline -->
    <g transform="translate(0, 340)">
      <text fill="rgba(255,255,255,0.9)" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1">
        ENTERPRISE MASTERCLASS • LIVE HANDS-ON LABS • INDUSTRY CERTIFICATE
      </text>
    </g>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgBanner)}`;
}

export function generateAICourseCover(title = '', category = 'Programming', themeIndex = 0, useSvgTemplate = true) {
  if (useSvgTemplate) {
    return {
      thumbnailUrl: generateDynamicAISvg(title, category, false, themeIndex),
      bannerUrl: generateDynamicAISvg(title, category, true, themeIndex)
    };
  }

  const query = `${title} ${category}`.trim().toLowerCase();

  const AI_TOPIC_ART = [
    {
      keywords: ['java', 'spring', 'backend'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop'
    },
    {
      keywords: ['react', 'next', 'frontend', 'web', 'javascript', 'html', 'css', 'typescript'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop'
    },
    {
      keywords: ['ai', 'machine', 'learning', 'python', 'neural', 'data'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
    },
    {
      keywords: ['design', 'ui', 'ux', 'figma', 'graphic'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop'
    },
    {
      keywords: ['cyber', 'security', 'ethical', 'hacking', 'network'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  for (const item of AI_TOPIC_ART) {
    if (item.keywords.some(kw => query.includes(kw))) {
      return { thumbnailUrl: item.thumbnailUrl, bannerUrl: item.bannerUrl };
    }
  }

  return {
    thumbnailUrl: generateDynamicAISvg(title, category, false, themeIndex),
    bannerUrl: generateDynamicAISvg(title, category, true, themeIndex)
  };
}
