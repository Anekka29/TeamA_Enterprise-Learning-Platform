const S={Programming:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",Java:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",Python:"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop","AI & ML":"https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1000&auto=format&fit=crop",Design:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop","UI/UX":"https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop","Graphic Design":"https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop","3D Modeling":"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",Marketing:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",Business:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop","Cyber Security":"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop","Data Science":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",Cloud:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop","Soft Skills":"https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"},y="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop";function C(e){if(!e)return y;const o=e.bannerUrl||e.thumbnailUrl;if(o&&(o.startsWith("http://")||o.startsWith("https://")||o.startsWith("data:image/")))return o;const a=e.category||"",p=e.title||"";for(const c in S)if(a.toLowerCase().includes(c.toLowerCase())||p.toLowerCase().includes(c.toLowerCase()))return S[c];return y}function U(e){if(!e)return y;const o=e.thumbnailUrl||e.bannerUrl;return o&&(o.startsWith("http://")||o.startsWith("https://")||o.startsWith("data:image/"))?o:C(e)}function f(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function R(e="",o=""){const a=`${e} ${o}`.toLowerCase();return/java|spring|backend|hibernate|maven|jvm|microservice/.test(a)?"JAVA":/python|ai|machine|learning|deep|neural|data science|pandas|numpy|tensorflow|pytorch|chatgpt|llm/.test(a)?"PYTHON_AI":/react|frontend|javascript|js|web|html|css|next|vue|angular|typescript|node|full stack/.test(a)?"REACT_WEB":/cyber|security|ethical|hacking|firewall|network|crypto|penetration|bug bounty/.test(a)?"CYBER_SECURITY":/cloud|aws|azure|devops|docker|kubernetes|server|linux|sysadmin/.test(a)?"CLOUD_DEVOPS":/design|ui|ux|figma|graphic|photoshop|illustrator|canvas|adobe/.test(a)?"DESIGN":/3d|animation|blender|unreal|unity|game|render|cgi/.test(a)?"THREE_D":"GENERAL"}function d(e="",o="Programming",a=!1,p=0){const m=(e.trim()||"Software Development Masterclass").split(" ").map(r=>r?r.charAt(0).toUpperCase()+r.slice(1):"").join(" "),h=(o.trim()||"Tech & Engineering").toUpperCase(),u=R(e,o),x={JAVA:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",PYTHON_AI:"https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200&auto=format&fit=crop",REACT_WEB:"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop",CYBER_SECURITY:"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",CLOUD_DEVOPS:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",DESIGN:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",THREE_D:"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop",GENERAL:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"},$={JAVA:{bg1:"#064e3b",bg2:"#022c22",accent:"#10b981",glow:"#34d399",badgeBg:"#059669",codeSnippet:`public class JavaCourse {
  public static void main(String[] args) {
    System.out.println("SkillSphere Java");
  }
}`},PYTHON_AI:{bg1:"#31103f",bg2:"#0f051d",accent:"#c084fc",glow:"#f472b6",badgeBg:"#9333ea",codeSnippet:`import torch
import numpy as np
model = NeuralNetwork(layers=128)
print("AI Model Trained 100%")`},REACT_WEB:{bg1:"#0f172a",bg2:"#0284c7",accent:"#38bdf8",glow:"#818cf8",badgeBg:"#0284c7",codeSnippet:`import React from "react";
export default function App() {
  return <SkillSphereCatalog />;
}`},CYBER_SECURITY:{bg1:"#451a03",bg2:"#18181b",accent:"#f59e0b",glow:"#ef4444",badgeBg:"#d97706",codeSnippet:`01001001 01001110 01010100 01010010
[FIREWALL ENFORCED: 256-BIT BITCODE]
STATUS: AUTHENTICATED & SECURE`},CLOUD_DEVOPS:{bg1:"#0c4a6e",bg2:"#0369a1",accent:"#06b6d4",glow:"#38bdf8",badgeBg:"#0284c7",codeSnippet:`docker run -d -p 8080:8080 skillsphere/backend:latest
kubectl scale deployment --replicas=5`},DESIGN:{bg1:"#4c1d95",bg2:"#1e1b4b",accent:"#a855f7",glow:"#f43f5e",badgeBg:"#7c3aed",codeSnippet:`/* UI Canvas System */
:root {
  --primary: #a855f7;
  --radius: 16px;
}`},THREE_D:{bg1:"#1e1b4b",bg2:"#0f172a",accent:"#6366f1",glow:"#ec4899",badgeBg:"#4f46e5",codeSnippet:`const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial()
);`},GENERAL:{bg1:"#0f172a",bg2:"#1e293b",accent:"#10b981",glow:"#38bdf8",badgeBg:"#059669",codeSnippet:`class SkillSphere {
  constructor() { this.version = "2.0"; }
}`}},k=["JAVA","REACT_WEB","PYTHON_AI","CYBER_SECURITY"],w=p>0?k[(p-1)%k.length]:u,t=$[w]||$.GENERAL,E=x[w]||x.GENERAL;let b=m,n="";if(m.length>20){const r=m.split(" "),i=Math.ceil(r.length/2);b=r.slice(0,i).join(" "),n=r.slice(i).join(" ")}const T=(r,i,s=1)=>{switch(w){case"JAVA":return`
          <g transform="translate(${r-50*s}, ${i-50*s}) scale(${s})">
            <circle cx="50" cy="50" r="46" fill="rgba(16,185,129,0.25)" stroke="${t.glow}" stroke-width="2.5"/>
            <path d="M 40 25 C 38 18, 48 18, 44 12" fill="none" stroke="${t.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 50 25 C 48 18, 58 18, 54 12" fill="none" stroke="${t.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 60 25 C 58 18, 68 18, 64 12" fill="none" stroke="${t.glow}" stroke-width="3" stroke-linecap="round"/>
            <path d="M 32 35 L 35 62 C 35 70, 65 70, 65 62 L 68 35 Z" fill="${t.accent}"/>
            <path d="M 68 40 C 78 40, 78 52, 67 54" fill="none" stroke="${t.accent}" stroke-width="4"/>
            <rect x="28" y="70" width="44" height="5" rx="2.5" fill="${t.glow}"/>
            <text x="50" y="52" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">JAVA</text>
          </g>
        `;case"REACT_WEB":return`
          <g transform="translate(${r-50*s}, ${i-50*s}) scale(${s})">
            <circle cx="50" cy="50" r="10" fill="${t.glow}"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${t.glow}" stroke-width="3.5" transform="rotate(0 50 50)"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${t.glow}" stroke-width="3.5" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="${t.glow}" stroke-width="3.5" transform="rotate(120 50 50)"/>
          </g>
        `;case"PYTHON_AI":return`
          <g transform="translate(${r-50*s}, ${i-50*s}) scale(${s})">
            <circle cx="50" cy="50" r="46" fill="rgba(192,132,252,0.25)" stroke="${t.glow}" stroke-width="2.5"/>
            <line x1="25" y1="35" x2="50" y2="20" stroke="${t.glow}" stroke-width="2"/>
            <line x1="50" y1="20" x2="75" y2="35" stroke="${t.glow}" stroke-width="2"/>
            <line x1="75" y1="35" x2="75" y2="65" stroke="${t.glow}" stroke-width="2"/>
            <line x1="75" y1="65" x2="50" y2="80" stroke="${t.glow}" stroke-width="2"/>
            <line x1="50" y1="80" x2="25" y2="65" stroke="${t.glow}" stroke-width="2"/>
            <line x1="25" y1="65" x2="25" y2="35" stroke="${t.glow}" stroke-width="2"/>
            <circle cx="50" cy="50" r="10" fill="#ffffff"/>
          </g>
        `;default:return`
          <g transform="translate(${r-50*s}, ${i-50*s}) scale(${s})">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="rgba(255,255,255,0.1)" stroke="${t.glow}" stroke-width="3"/>
            <line x1="50" y1="10" x2="50" y2="90" stroke="${t.glow}" stroke-width="2"/>
            <circle cx="50" cy="50" r="9" fill="${t.glow}"/>
          </g>
        `}};if(!a){const s=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="thumbBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg1}"/>
      <stop offset="60%" stop-color="${t.bg2}"/>
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
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="100%" stop-color="${t.glow}"/>
    </linearGradient>
  </defs>

  <!-- Base Gradient Background -->
  <rect width="800" height="450" fill="url(#thumbBgGrad)"/>

  <!-- High-Res Unsplash Photo Overlay -->
  <image href="${E}" x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" opacity="0.4"/>

  <!-- Dark Reading Overlay -->
  <rect width="800" height="450" fill="url(#thumbOverlay)"/>

  <!-- Topic Vector Emblem Right Side -->
  ${T(630,225,1.7)}

  <!-- Content Container Left Side -->
  <g transform="translate(45, 45)">
    <!-- Top Badges -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="145" height="30" rx="15" fill="${t.badgeBg}"/>
      <text x="14" y="19" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" letter-spacing="1">✦ SKILLSPHERE</text>

      <rect x="157" y="0" width="155" height="30" rx="15" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/>
      <text x="172" y="19" fill="${t.glow}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="0.8">${f(h)}</text>
    </g>

    <!-- Title Section -->
    <g transform="translate(0, 100)">
      <text fill="url(#thumbTitleGrad)" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${n?40:48}">
        <tspan x="0" dy="42">${f(b)}</tspan>
        ${n?`<tspan x="0" dy="52">${f(n)}</tspan>`:""}
      </text>

      <!-- Accent Line under Title -->
      <rect x="0" y="${n?106:54}" width="150" height="6" rx="3" fill="url(#thumbAccent)"/>
    </g>

    <!-- Footer Stats -->
    <g transform="translate(0, 340)">
      <text fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900">
        ★★★★★ <tspan fill="rgba(255,255,255,0.9)" font-size="13" font-weight="700">4.9 • PRO CERTIFICATION</tspan>
      </text>
    </g>
  </g>
</svg>
    `.trim();return`data:image/svg+xml;utf8,${encodeURIComponent(s)}`}const l=1200,g=450,A=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${g}" width="${l}" height="${g}">
  <defs>
    <linearGradient id="bannerBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${t.bg1}"/>
      <stop offset="55%" stop-color="${t.bg2}"/>
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
      <stop offset="0%" stop-color="${t.accent}"/>
      <stop offset="100%" stop-color="${t.glow}"/>
    </linearGradient>
  </defs>

  <!-- Base Gradient Background -->
  <rect width="${l}" height="${g}" fill="url(#bannerBgGrad)"/>

  <!-- High-Res Unsplash Topic Photo Background -->
  <image href="${E}" x="0" y="0" width="${l}" height="${g}" preserveAspectRatio="xMidYMid slice" opacity="0.38"/>

  <!-- Dark Reading Overlay -->
  <rect width="${l}" height="${g}" fill="url(#bannerOverlay)"/>

  <!-- Top & Bottom Horizontal Neon Accent Bars -->
  <rect x="0" y="0" width="${l}" height="6" fill="url(#bannerLine)"/>
  <rect x="0" y="${g-6}" width="${l}" height="6" fill="url(#bannerLine)"/>

  <!-- Code Snippet Watermark Overlay -->
  <g opacity="0.12" transform="translate(520, 55)">
    <text fill="#ffffff" font-family="monospace" font-size="13" font-weight="600">
      ${f(t.codeSnippet).split(`
`).map((r,i)=>`<tspan x="0" dy="${i===0?0:20}">${r}</tspan>`).join("")}
    </text>
  </g>

  <!-- Right Side Architectural Tech Vector Emblem -->
  ${T(940,225,1.8)}

  <!-- Left Side Content Section -->
  <g transform="translate(55, 50)">
    <!-- Badges Row -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="165" height="32" rx="16" fill="${t.badgeBg}"/>
      <text x="14" y="20" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" letter-spacing="1.2">✦ SKILLSPHERE AI</text>

      <rect x="177" y="0" width="190" height="32" rx="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
      <text x="192" y="20" fill="${t.glow}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="1">${f(h)}</text>
    </g>

    <!-- Main Course Title -->
    <g transform="translate(0, 135)">
      <text fill="url(#bannerTitle)" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${n?42:48}">
        <tspan x="0" dy="0">${f(b)}</tspan>
        ${n?`<tspan x="0" dy="54">${f(n)}</tspan>`:""}
      </text>

      <!-- Accent Line under Title -->
      <rect x="0" y="${n?72:24}" width="170" height="6" rx="3" fill="url(#bannerLine)"/>
    </g>

    <!-- Footer Tagline -->
    <g transform="translate(0, 340)">
      <text fill="rgba(255,255,255,0.9)" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" letter-spacing="1">
        ENTERPRISE MASTERCLASS • LIVE HANDS-ON LABS • INDUSTRY CERTIFICATE
      </text>
    </g>
  </g>
</svg>
  `.trim();return`data:image/svg+xml;utf8,${encodeURIComponent(A)}`}function v(e="",o="Programming",a=0,p=!0){if(p)return{thumbnailUrl:d(e,o,!1,a),bannerUrl:d(e,o,!0,a)};const c=`${e} ${o}`.trim().toLowerCase(),m=[{keywords:["java","spring","backend"],thumbnailUrl:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",bannerUrl:"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop"},{keywords:["react","next","frontend","web","javascript","html","css","typescript"],thumbnailUrl:"https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",bannerUrl:"https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop"},{keywords:["ai","machine","learning","python","neural","data"],thumbnailUrl:"https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=800&auto=format&fit=crop",bannerUrl:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"},{keywords:["design","ui","ux","figma","graphic"],thumbnailUrl:"https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop",bannerUrl:"https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop"},{keywords:["cyber","security","ethical","hacking","network"],thumbnailUrl:"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",bannerUrl:"https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop"}];for(const h of m)if(h.keywords.some(u=>c.includes(u)))return{thumbnailUrl:h.thumbnailUrl,bannerUrl:h.bannerUrl};return{thumbnailUrl:d(e,o,!1,a),bannerUrl:d(e,o,!0,a)}}export{C as a,v as b,U as g};
