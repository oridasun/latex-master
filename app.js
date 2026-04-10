/**
 * LaTeX Master – app.js
 * Render mode: MathJax SVG → <img data:image/svg+xml>
 *   • Pega como imagen en Word, Google Docs, Notion, etc.
 *   • Sin canvas → sin problema de "tainted canvas"
 *   • Personalizable: tamaño, color, negrita, fondo
 * Unicode / Plain: conversión a texto sin dependencias externas.
 */
'use strict';

/* ============================================================
   i18n
   ============================================================ */
const dict = {
  es: {
    title:        'LaTeX Master',
    subtitle:     'Limpia el código LaTeX de tus textos',
    placeholder:  'Pega aquí el texto con código LaTeX...',
    btnConvert:   'Limpiar texto',
    btnCopy:      'Copiar resultado',
    btnDownload:  'Descargar HTML',
    btnDownloadPdf: '🖨 Imprimir / PDF',
    modeRender:   '🖼 Renderizar como imágenes',
    modeUnicode:  'Unicode (√, α, ½)',
    modePlain:    'Texto plano (sqrt, alpha, 1/2)',
    resultTitle:  'Texto limpio:',
    copied:       '¡Copiado!',
    noFormulas:   'No se encontraron fórmulas LaTeX',
    rendering:    'Generando imágenes matemáticas…',
    loadingMath:  'Cargando motor matemático (solo la primera vez)…',
    styleLabel:   'Estilo de fórmulas:',
    styleSize:    'Tamaño',
    styleColor:   'Color',
    styleBold:    'Negrita',
    styleBg:      'Fondo',
    bgWhite:      'Blanco',
    bgTransp:     'Transparente',
    helpTitle:    '¿Necesitas ayuda?',
    linkFaq:      '❓ Preguntas Frecuentes',
    linkSupport:  '✉️ Contactar soporte',
    linkCoffee:   '☕ Invítame a un café',
    heroDesc:     '¿Tienes un documento con fórmulas LaTeX como <code>$\\frac{1}{2}$</code> o <code>\\sqrt{x}</code>? LaTeX Master las convierte a texto legible o imágenes de alta calidad con un solo clic, sin instalar nada.',
    heroBeforeLabel: 'TEXTO ORIGINAL',
    heroAfterLabel:  'RESULTADO',
    modeRenderDesc:  'Ideal para Word, Google Docs o Notion',
    modeUnicodeDesc: 'Para texto digital con símbolos matemáticos',
    modePlainDesc:   'Para email, código o apps sin soporte de símbolos',
    placeholder:  'Ejemplo: La energía es $E = mc^2$ y la raíz $\\sqrt{a^2 + b^2}$. Pega aquí tu texto con fórmulas LaTeX...',
  },
  en: {
    title:        'LaTeX Master',
    subtitle:     'Clean LaTeX code from your texts',
    placeholder:  'Example: The energy is $E = mc^2$ and the root $\\sqrt{a^2 + b^2}$. Paste your text with LaTeX formulas here...',
    btnConvert:   'Clean text',
    btnCopy:      'Copy result',
    btnDownload:  'Download HTML',
    btnDownloadPdf: '🖨 Print / PDF',
    modeRender:   '🖼 Render as images',
    modeUnicode:  'Unicode (√, α, ½)',
    modePlain:    'Plain text (sqrt, alpha, 1/2)',
    resultTitle:  'Clean text:',
    copied:       'Copied!',
    noFormulas:   'No LaTeX formulas found',
    rendering:    'Generating math images…',
    loadingMath:  'Loading math engine (first time only)…',
    styleLabel:   'Formula style:',
    styleSize:    'Size',
    styleColor:   'Color',
    styleBold:    'Bold',
    styleBg:      'Background',
    bgWhite:      'White',
    bgTransp:     'Transparent',
    helpTitle:    'Need help?',
    linkFaq:      '❓ FAQ',
    linkSupport:  '✉️ Contact support',
    linkCoffee:   '☕ Buy me a coffee',
    heroDesc:     'Do you have a document with LaTeX formulas like <code>$\\frac{1}{2}$</code> or <code>\\sqrt{x}</code>? LaTeX Master converts them to readable text or high-quality images in one click, with no installation required.',
    heroBeforeLabel: 'ORIGINAL TEXT',
    heroAfterLabel:  'RESULT',
    modeRenderDesc:  'Ideal for Word, Google Docs or Notion',
    modeUnicodeDesc: 'For digital text with mathematical symbols',
    modePlainDesc:   'For email, code or apps without symbol support',
  },
};

/* ============================================================
   Superscript / subscript maps  (unicode/plain modes)
   ============================================================ */
const SUP_D = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const SUP_L = {a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',n:'ⁿ',o:'ᵒ',p:'ᵖ',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ','+':'⁺','-':'⁻','=':'⁼','(':'⁽',')':'⁾'};
const SUB_D = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
const SUB_L = {a:'ₐ',e:'ₑ',h:'ₕ',i:'ᵢ',j:'ⱼ',k:'ₖ',l:'ₗ',m:'ₘ',n:'ₙ',o:'ₒ',p:'ₚ',r:'ᵣ',s:'ₛ',t:'ₜ',u:'ᵤ',v:'ᵥ',x:'ₓ','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎'};
const toSup = s => s.split('').map(c => SUP_D[c]||SUP_L[c]||c).join('');
const toSub = s => s.split('').map(c => SUB_D[c]||SUB_L[c]||c).join('');
const FRAC_UNI = {'1/2':'½','1/3':'⅓','2/3':'⅔','1/4':'¼','3/4':'¾','1/5':'⅕','2/5':'⅖','3/5':'⅗','4/5':'⅘','1/6':'⅙','5/6':'⅚','1/7':'⅐','1/8':'⅛','3/8':'⅜','5/8':'⅝','7/8':'⅞','1/9':'⅑','1/10':'⅒'};

/* ============================================================
   Unicode / plain-text conversion rules
   ============================================================ */
function buildRules(mode) {
  const u = mode === 'unicode';
  return [
    [/\$\$([\s\S]*?)\$\$/g,     (_, x) => x.trim()],
    [/\\\[([\s\S]*?)\\\]/g,     (_, x) => x.trim()],
    [/\$([\s\S]*?)\$/g,         (_, x) => x.trim()],
    [/\\\(([\s\S]*?)\\\)/g,     (_, x) => x.trim()],
    [/\\frac\{([^}]*)\}\{([^}]*)\}/g,(_, n, d)=>{ const k=`${n.trim()}/${d.trim()}`; return (u&&FRAC_UNI[k])?FRAC_UNI[k]:`${n.trim()}/${d.trim()}`; }],
    [/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g,(_, n, x)=>u?`${toSup(n)}√${x}`:`root(${n},${x})`],
    [/\\sqrt\{([^}]*)\}/g, (_, x)=>u?`√${x}`:`sqrt(${x})`],
    [/\\sqrt\s+(\S+)/g,    (_, x)=>u?`√${x}`:`sqrt(${x})`],
    [/\^\{\\circ\}/g,'°'],[/\^\\circ\b/g,'°'],
    [/\\alpha\b/g,u?'α':'alpha'],[/\\beta\b/g,u?'β':'beta'],[/\\gamma\b/g,u?'γ':'gamma'],
    [/\\delta\b/g,u?'δ':'delta'],[/\\epsilon\b/g,u?'ε':'epsilon'],[/\\varepsilon\b/g,u?'ε':'epsilon'],
    [/\\zeta\b/g,u?'ζ':'zeta'],[/\\eta\b/g,u?'η':'eta'],[/\\theta\b/g,u?'θ':'theta'],
    [/\\vartheta\b/g,u?'ϑ':'theta'],[/\\iota\b/g,u?'ι':'iota'],[/\\kappa\b/g,u?'κ':'kappa'],
    [/\\lambda\b/g,u?'λ':'lambda'],[/\\mu\b/g,u?'μ':'mu'],[/\\nu\b/g,u?'ν':'nu'],
    [/\\xi\b/g,u?'ξ':'xi'],[/\\pi\b/g,u?'π':'pi'],[/\\varpi\b/g,u?'ϖ':'pi'],
    [/\\rho\b/g,u?'ρ':'rho'],[/\\varrho\b/g,u?'ϱ':'rho'],[/\\sigma\b/g,u?'σ':'sigma'],
    [/\\varsigma\b/g,u?'ς':'sigma'],[/\\tau\b/g,u?'τ':'tau'],[/\\upsilon\b/g,u?'υ':'upsilon'],
    [/\\phi\b/g,u?'φ':'phi'],[/\\varphi\b/g,u?'φ':'phi'],[/\\chi\b/g,u?'χ':'chi'],
    [/\\psi\b/g,u?'ψ':'psi'],[/\\omega\b/g,u?'ω':'omega'],
    [/\\Gamma\b/g,u?'Γ':'Gamma'],[/\\Delta\b/g,u?'Δ':'Delta'],[/\\Theta\b/g,u?'Θ':'Theta'],
    [/\\Lambda\b/g,u?'Λ':'Lambda'],[/\\Xi\b/g,u?'Ξ':'Xi'],[/\\Pi\b/g,u?'Π':'Pi'],
    [/\\Sigma\b/g,u?'Σ':'Sigma'],[/\\Upsilon\b/g,u?'Υ':'Upsilon'],[/\\Phi\b/g,u?'Φ':'Phi'],
    [/\\Psi\b/g,u?'Ψ':'Psi'],[/\\Omega\b/g,u?'Ω':'Omega'],
    [/\\times\b/g,u?'×':'*'],[/\\div\b/g,u?'÷':'/'],[/\\pm\b/g,u?'±':'+/-'],
    [/\\mp\b/g,u?'∓':'-/+'],[/\\cdot\b/g,u?'·':'*'],[/\\ast\b/g,u?'∗':'*'],
    [/\\leq\b/g,u?'≤':'<='],[/\\geq\b/g,u?'≥':'>='],[/\\le\b/g,u?'≤':'<='],
    [/\\ge\b/g,u?'≥':'>='],[/\\neq\b/g,u?'≠':'!='],[/\\ne\b/g,u?'≠':'!='],
    [/\\approx\b/g,u?'≈':'~='],[/\\equiv\b/g,u?'≡':'==='],[/\\sim\b/g,u?'∼':'~'],
    [/\\propto\b/g,u?'∝':'proportional to'],[/\\ll\b/g,u?'≪':'<<'],[/\\gg\b/g,u?'≫':'>>'],
    [/\\in\b/g,u?'∈':'in'],[/\\notin\b/g,u?'∉':'not in'],[/\\subset\b/g,u?'⊂':'subset'],
    [/\\subseteq\b/g,u?'⊆':'subset='],[/\\cup\b/g,u?'∪':'union'],[/\\cap\b/g,u?'∩':'intersect'],
    [/\\emptyset\b/g,u?'∅':'{}'],[/\\forall\b/g,u?'∀':'for all'],[/\\exists\b/g,u?'∃':'exists'],
    [/\\neg\b/g,u?'¬':'not'],[/\\land\b/g,u?'∧':'and'],[/\\lor\b/g,u?'∨':'or'],
    [/\\sum\b/g,u?'∑':'sum'],[/\\prod\b/g,u?'∏':'prod'],[/\\int\b/g,u?'∫':'integral'],
    [/\\iint\b/g,u?'∬':'double-integral'],[/\\iiint\b/g,u?'∭':'triple-integral'],
    [/\\oint\b/g,u?'∮':'contour-integral'],[/\\partial\b/g,u?'∂':'d'],
    [/\\nabla\b/g,u?'∇':'nabla'],[/\\infty\b/g,u?'∞':'infinity'],
    [/\\rightarrow\b/g,u?'→':'->'],[/\\leftarrow\b/g,u?'←':'<-'],
    [/\\Rightarrow\b/g,u?'⇒':'=>'],[/\\Leftarrow\b/g,u?'⇐':'<='],
    [/\\leftrightarrow\b/g,u?'↔':'<->'],[/\\Leftrightarrow\b/g,u?'⇔':'<=>'],
    [/\\to\b/g,u?'→':'->'],[/\\mapsto\b/g,u?'↦':'|->'],
    [/\\circ\b/g,u?'∘':'o'],[/\\degree\b/g,'°'],[/\\bullet\b/g,u?'•':'*'],
    [/\\euro\b/g,'€'],[/\\pounds\b/g,'£'],
    [/\\%/g,'%'],[/\\&/g,'&'],[/\\#/g,'#'],[/\\_/g,'_'],[/\\\$/g,'$'],
    [/\\cdots\b/g,u?'⋯':'...'],[/\\ldots\b/g,u?'…':'...'],[/\\vdots\b/g,u?'⋮':':'],
    [/\\langle\b/g,u?'⟨':'<'],[/\\rangle\b/g,u?'⟩':'>'],
    [/\\(?:text|mathrm|mathit|mathbf|mathsf|mathtt|mathbb|mathcal|operatorname)\{([^}]*)\}/g,'$1'],
    [/\\(?:textbf|textit|texttt|textrm|textsf|emph)\{([^}]*)\}/g,'$1'],
    [/\\(?:overline|underline|hat|bar|tilde|vec|dot|ddot)\{([^}]*)\}/g,'$1'],
    [/\\(?:left|right)\s*/g,''],[/\\(?:big|Big|bigg|Bigg)[lr]?/g,''],
    [/\^\{([^}]*)\}/g,(_, s)=>u?toSup(s):`^(${s})`],
    [/_\{([^}]*)\}/g, (_, s)=>u?toSub(s):`_(${s})`],
    [/\^([0-9a-zA-Z+\-])/g,(_, c)=>u?toSup(c):`^${c}`],
    [/_([0-9a-zA-Z+\-])/g, (_, c)=>u?toSub(c):`_${c}`],
    [/\\(?:quad|qquad|,|;|:|!| )\b/g,' '],[/\\(?:hspace|vspace)\{[^}]*\}/g,' '],
    [/\\begin\{[^}]*\}/g,''],[/\\end\{[^}]*\}/g,''],
    [/\\[a-zA-Z]+\b\s*/g,''],[/[{}]/g,''],
    [/[^\S\n]+/g,' '],[/^ /gm,''],[/ $/gm,''],
  ];
}

function convertLatex(text, mode) {
  if (!text.trim()) return text;
  let r = text;
  for (const [pat, rep] of buildRules(mode)) r = r.replace(pat, rep);
  return r;
}

/* ============================================================
   LaTeX block finder
   ============================================================ */
function findLatexBlocks(text) {
  const blocks = [];
  let i = 0;
  while (i < text.length) {
    // $$...$$ display
    if (text[i]==='$' && text[i+1]==='$') {
      const c = text.indexOf('$$', i+2);
      if (c!==-1) { blocks.push({start:i,end:c+2,formula:text.slice(i+2,c).trim(),display:true}); i=c+2; continue; }
    }
    // \[...\] display
    if (text[i]==='\\' && text[i+1]==='[') {
      const c = text.indexOf('\\]', i+2);
      if (c!==-1) { blocks.push({start:i,end:c+2,formula:text.slice(i+2,c).trim(),display:true}); i=c+2; continue; }
    }
    // \(...\) inline
    if (text[i]==='\\' && text[i+1]==='(') {
      const c = text.indexOf('\\)', i+2);
      if (c!==-1) { blocks.push({start:i,end:c+2,formula:text.slice(i+2,c).trim(),display:false}); i=c+2; continue; }
    }
    // $...$ inline (not $$)
    if (text[i]==='$' && text[i+1]!=='$') {
      let j = i+1;
      while (j<text.length && !(text[j]==='$' && text[j-1]!=='\\')) j++;
      if (j<text.length) {
        const formula = text.slice(i+1,j).trim();
        if (formula.length>0) { blocks.push({start:i,end:j+1,formula,display:false}); i=j+1; continue; }
      }
    }
    i++;
  }
  return blocks;
}

function escapeHTML(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================================
   MathJax SVG image rendering
   ─────────────────────────────────────────────────────────────
   MathJax outputs pure SVG (no <foreignObject>) so:
   • No canvas taint → works in all browsers
   • SVG data URL in <img> → pastes as image in Word & Google Docs
   • Vector quality → crisp at any size/zoom
   ============================================================ */

/** Wait until MathJax is initialized and ready to render */
async function waitForMathJax() {
  // Wait up to 30s for MathJax to load
  for (let i = 0; i < 300; i++) {
    if (window.MathJax?.tex2svg) {
      // Also wait for startup to fully complete
      if (window.MathJax.startup?.promise) {
        await window.MathJax.startup.promise;
      }
      return;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('MathJax did not load in time');
}

/** Read formula style from UI controls */
function getFormulaStyle() {
  return {
    fontSize:   parseInt(document.getElementById('fs-size')?.value  || '18', 10),
    color:      document.getElementById('fs-color')?.value          || '#000000',
    bold:       document.getElementById('fs-bold')?.checked         || false,
    background: document.getElementById('fs-bg')?.value             || '#ffffff',
  };
}

/**
 * Render one LaTeX formula → SVG string via MathJax.
 * Applies color, font size, background, and optional bold wrapping.
 */
function renderFormulaToSVG(formula, displayMode, style) {
  const { fontSize=18, color='#000000', bold=false, background='#ffffff' } = style;

  // Wrap in \boldsymbol for proper bold math
  const tex = bold ? `\\boldsymbol{${formula}}` : formula;

  // MathJax.tex2svg() returns a <mjx-container> holding the <svg>
  const container = window.MathJax.tex2svg(tex, {
    display: displayMode,
    em: fontSize,
    ex: Math.round(fontSize * 0.431),
    containerWidth: 1200,
  });

  const svgEl = container.querySelector('svg');
  if (!svgEl) throw new Error('MathJax returned no SVG');

  // Parse viewBox for background rect
  const vbParts = (svgEl.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  const [vx=0, vy=0, vw=100, vh=100] = vbParts;
  const PAD = Math.max(vw, vh) * 0.06; // 6% padding

  // Expand viewBox to add whitespace around the formula
  svgEl.setAttribute('viewBox', `${vx-PAD} ${vy-PAD} ${vw+PAD*2} ${vh+PAD*2}`);

  // Add background rectangle (first child, so it's behind everything)
  if (background && background !== 'transparent') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x',      String(vx - PAD));
    rect.setAttribute('y',      String(vy - PAD));
    rect.setAttribute('width',  String(vw + PAD*2));
    rect.setAttribute('height', String(vh + PAD*2));
    rect.setAttribute('fill',   background);
    svgEl.insertBefore(rect, svgEl.firstChild);
  }

  // Serialize to string
  svgEl.setAttribute('xmlns',       'http://www.w3.org/2000/svg');
  svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  let svgStr = new XMLSerializer().serializeToString(svgEl);

  // Always replace currentColor with explicit hex — standalone SVG has no CSS
  // context to inherit from, so currentColor may not resolve to black in canvas.
  svgStr = svgStr.replace(/currentColor/g, color || '#000000');

  return svgStr;
}

/**
 * CRC-32 helper for PNG chunk integrity.
 */
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Inject a pHYs chunk into a base64-encoded PNG so that Word / Google Docs
 * displays the image at the intended physical size.
 *
 * Without this chunk, apps assume 96 DPI and show the image too large.
 * With SCALE=2 and DPI=192, every 2 canvas pixels = 1 display pixel → correct size.
 */
function injectPngDpi(base64, dpi) {
  const binary = atob(base64);
  const src = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) src[i] = binary.charCodeAt(i);

  // pHYs chunk: 4-len + 4-type + 9-data + 4-crc = 21 bytes
  // Insert right after the IHDR chunk: 8-sig + (4+4+13+4)=25-IHDR = byte 33
  const INSERT = 33;
  const ppm = Math.round(dpi * 10000 / 254); // pixels per meter
  const phys = new Uint8Array(21);
  phys[0]=0; phys[1]=0; phys[2]=0; phys[3]=9;          // data length = 9
  phys[4]=0x70; phys[5]=0x48; phys[6]=0x59; phys[7]=0x73; // 'pHYs'
  phys[8]=(ppm>>24)&0xFF; phys[9]=(ppm>>16)&0xFF; phys[10]=(ppm>>8)&0xFF; phys[11]=ppm&0xFF; // X
  phys[12]=(ppm>>24)&0xFF; phys[13]=(ppm>>16)&0xFF; phys[14]=(ppm>>8)&0xFF; phys[15]=ppm&0xFF; // Y
  phys[16]=1;                                            // unit = metre
  const chk = crc32(phys.slice(4, 17));
  phys[17]=(chk>>24)&0xFF; phys[18]=(chk>>16)&0xFF; phys[19]=(chk>>8)&0xFF; phys[20]=chk&0xFF;

  const out = new Uint8Array(src.length + 21);
  out.set(src.slice(0, INSERT));
  out.set(phys, INSERT);
  out.set(src.slice(INSERT), INSERT + 21);

  let str = '';
  for (let i = 0; i < out.length; i++) str += String.fromCharCode(out[i]);
  return btoa(str);
}

/**
 * Convert MathJax SVG string → PNG data URL via canvas.
 *
 * MathJax SVG is pure vector (no <foreignObject>) — canvas is never tainted.
 * We generate at 2× the intended display size and embed 192 DPI metadata so
 * Word / Google Docs renders it at exactly the right size (matching the text).
 *
 * @param {string}  svgStr      - Serialized SVG (currentColor already replaced)
 * @param {number}  fontSize    - em size passed to MathJax (controls formula height)
 * @param {boolean} displayMode - block (true) or inline (false)
 * @param {boolean} transparent - omit white fill
 */
function svgToPng(svgStr, fontSize, displayMode, transparent) {
  // MathJax SVG dimensions are in "ex" units. Convert to px for the canvas.
  // 1ex ≈ 0.431em at the given font size.
  const exPx = fontSize * 0.431;
  const wM = svgStr.match(/\bwidth="([\d.]+)ex"/);
  const hM = svgStr.match(/\bheight="([\d.]+)ex"/);

  // Target display size in CSS pixels (what the user sees in the document)
  const dispW = wM ? Math.ceil(parseFloat(wM[1]) * exPx) : null;
  const dispH = hM ? Math.ceil(parseFloat(hM[1]) * exPx) : null;

  // Replace ex units with px so the browser renders the SVG at exactly
  // the intended size when loaded into a temporary <img>.
  const svgFixed = dispW && dispH
    ? svgStr.replace(/\bwidth="[\d.]+ex"/, `width="${dispW}px"`)
            .replace(/\bheight="[\d.]+ex"/, `height="${dispH}px"`)
    : svgStr;

  const SCALE = 2;           // 2× pixels → crisp on retina
  const DPI   = 192;         // 2× of 96 DPI → Word shows at 1× (correct) size

  return new Promise((resolve, reject) => {
    const blob = new Blob([svgFixed], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const tmpImg = new Image();

    tmpImg.onload = () => {
      URL.revokeObjectURL(url);

      // Use parsed ex→px dimensions if available; fall back to natural size
      const baseW = dispW || tmpImg.naturalWidth  || 200;
      const baseH = dispH || tmpImg.naturalHeight || 40;
      const cW = Math.round(baseW * SCALE);
      const cH = Math.round(baseH * SCALE);

      const canvas = document.createElement('canvas');
      canvas.width  = cW;
      canvas.height = cH;
      const ctx = canvas.getContext('2d');

      if (!transparent) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cW, cH);
      }
      ctx.drawImage(tmpImg, 0, 0, cW, cH);

      try {
        const raw = canvas.toDataURL('image/png').split(',')[1];
        resolve('data:image/png;base64,' + injectPngDpi(raw, DPI));
      } catch (err) {
        reject(err);
      }
    };

    tmpImg.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG→PNG: image load failed')); };
    tmpImg.src = url;
  });
}

/**
 * Render one formula → PNG <img> element, ready to paste anywhere.
 *
 * Setting explicit width/height HTML attributes is the key to consistent
 * sizing in Google Docs and Word: both apps use the <img> attribute values
 * when pasting HTML, ignoring the PNG's pixel dimensions and DPI metadata.
 */
async function formulaToImgElement(formula, displayMode, style) {
  await waitForMathJax();

  const svgStr = renderFormulaToSVG(formula, displayMode, style);
  const transparent = style.background === 'transparent';

  // Parse the intended CSS display size from MathJax ex-unit dimensions.
  // These represent the "correct" physical size relative to the chosen font.
  const exPx  = style.fontSize * 0.431;
  const wM    = svgStr.match(/\bwidth="([\d.]+)ex"/);
  const hM    = svgStr.match(/\bheight="([\d.]+)ex"/);
  const dispW = wM ? Math.ceil(parseFloat(wM[1]) * exPx) : null;
  const dispH = hM ? Math.ceil(parseFloat(hM[1]) * exPx) : null;

  const pngUrl = await svgToPng(svgStr, style.fontSize, displayMode, transparent);

  const img = document.createElement('img');
  img.src   = pngUrl;
  img.alt   = formula;
  img.title = formula;
  img.className = displayMode ? 'fml-img fml-img--block' : 'fml-img fml-img--inline';

  // Set explicit width/height attributes so Google Docs and Word paste the
  // image at the correct size (they read these attributes, not the PNG DPI).
  if (dispW && dispH) {
    img.setAttribute('width',  String(dispW));
    img.setAttribute('height', String(dispH));
    img.style.width  = dispW + 'px';
    img.style.height = dispH + 'px';
  } else {
    img.style.height = displayMode ? '2.5em' : '1.6em';
    img.style.width  = 'auto';
  }

  img.dataset.formula = formula;
  img.dataset.display = String(displayMode);
  return img;
}

/* ============================================================
   DOM walker: replace LaTeX in text nodes with <img> elements
   ============================================================ */
async function renderTextNodeToImages(node, style) {
  const text = node.textContent;
  if (!/\$|\\[\[(]/.test(text)) return; // fast bail-out: no delimiters

  const blocks = findLatexBlocks(text);
  if (blocks.length === 0) return;

  const fragment = document.createDocumentFragment();
  let last = 0;

  for (const blk of blocks) {
    if (blk.start > last) fragment.appendChild(document.createTextNode(text.slice(last, blk.start)));
    try {
      fragment.appendChild(await formulaToImgElement(blk.formula, blk.display, style));
    } catch {
      // Show original LaTeX highlighted in yellow if rendering fails
      const code = document.createElement('code');
      code.className = 'latex-fallback';
      code.textContent = text.slice(blk.start, blk.end);
      fragment.appendChild(code);
    }
    last = blk.end;
  }
  if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)));
  node.parentNode.replaceChild(fragment, node);
}

async function renderNodeToImages(node, style) {
  if (node.nodeType === Node.TEXT_NODE) {
    await renderTextNodeToImages(node, style);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const child of [...node.childNodes]) await renderNodeToImages(child, style);
  }
}

/* ============================================================
   Text-node conversion for unicode / plain modes
   ============================================================ */
function processTextNodesConvert(node, mode) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = convertLatex(node.textContent, mode);
  } else {
    for (const child of node.childNodes) processTextNodesConvert(child, mode);
  }
}

/** Main HTML processor */
async function processRichHTML(html, mode, style) {
  const div = document.createElement('div');
  div.innerHTML = html;
  if (mode === 'render') {
    await renderNodeToImages(div, style);
  } else {
    processTextNodesConvert(div, mode);
  }
  return div.innerHTML;
}

/* ============================================================
   Paste handler: preserve bold/italic, strip Word/PDF junk
   ============================================================ */
const SAFE_TAGS = new Set(['b','strong','i','em','u','s','strike','sub','sup','br','p','div','span','ul','ol','li','h1','h2','h3','h4','h5','h6']);

function cleanPastedHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}
function sanitizeNode(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType !== Node.ELEMENT_NODE) { child.remove(); continue; }
    const tag = child.tagName.toLowerCase();
    if (SAFE_TAGS.has(tag)) {
      [...child.attributes].forEach(a => child.removeAttribute(a.name));
      sanitizeNode(child);
    } else { sanitizeNode(child); child.replaceWith(...child.childNodes); }
  }
}

/* ============================================================
   Download helpers
   ============================================================ */

/** Shared HTML shell: MathJax CDN renders LaTeX natively in the browser */
function buildDocHTML(bodyHTML, title) {
  return `<!DOCTYPE html>
<html lang="${currentLang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
body{font-family:'Georgia',serif;max-width:820px;margin:2rem auto;padding:1rem 2rem;line-height:1.8;color:#1e293b;font-size:16px}
p{margin:.6em 0}
b,strong{font-weight:700}
i,em{font-style:italic}
</style>
<script>
window.MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]},svg:{fontCache:'local'},startup:{typeset:true}};
<\/script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"><\/script>
</head>
<body>${bodyHTML}</body>
</html>`;
}

/** Download HTML — uses original LaTeX source so MathJax renders it perfectly */
function downloadHTML(inputHTML) {
  const html = buildDocHTML(inputHTML, 'LaTeX Master – resultado');
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  Object.assign(document.createElement('a'), { href: url, download: 'latex-master-resultado.html' }).click();
  URL.revokeObjectURL(url);
}

/** Print / Save as PDF — opens the browser print dialog (works with MathJax SVGs) */
function printOutput(outputHTML) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Permite las ventanas emergentes para poder imprimir.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html lang="${document.documentElement.lang}">
<head>
  <meta charset="UTF-8"/>
  <title>LaTeX Master – Resultado</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 13pt;
      line-height: 1.75;
      margin: 2cm;
      color: #000;
    }
    img { max-width: 100%; vertical-align: middle; }
    @media print { body { margin: 1.5cm; } }
  </style>
</head>
<body>${outputHTML}</body>
</html>`);
  win.document.close();
  win.focus();
  // Small delay so SVG images finish rendering before the dialog opens
  setTimeout(() => { win.print(); }, 300);
}

/* ============================================================
   UI helpers
   ============================================================ */
let currentLang = (navigator.language || 'es').startsWith('es') ? 'es' : 'en';
const t = key => dict[currentLang][key];

function applyLang() {
  document.documentElement.lang = currentLang;
  const ids = {
    'app-title': 'title', 'app-subtitle': 'subtitle',
    'btn-convert': 'btnConvert', 'btn-copy': 'btnCopy', 'btn-download': 'btnDownload', 'btn-download-pdf': 'btnDownloadPdf',
    'label-render': 'modeRender', 'label-unicode': 'modeUnicode', 'label-plain': 'modePlain',
    'desc-render': 'modeRenderDesc', 'desc-unicode': 'modeUnicodeDesc', 'desc-plain': 'modePlainDesc',
    'result-title': 'resultTitle', 'style-label': 'styleLabel',
    'style-size-lbl': 'styleSize', 'style-color-lbl': 'styleColor',
    'style-bold-lbl': 'styleBold', 'style-bg-lbl': 'styleBg',
    'help-title': 'helpTitle', 'link-faq': 'linkFaq', 'link-support': 'linkSupport',
    'link-coffee': 'linkCoffee',
    'hero-before-label': 'heroBeforeLabel', 'hero-after-label': 'heroAfterLabel',
  };
  for (const [id, key] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
  // heroDesc uses innerHTML to allow <code> tags
  const heroDescEl = document.getElementById('hero-desc');
  if (heroDescEl) heroDescEl.innerHTML = t('heroDesc');
  ['btn-convert','btn-copy','btn-download','btn-download-pdf'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('aria-label', el.textContent);
  });
  document.getElementById('input-text').dataset.placeholder = t('placeholder');
  const bg = document.getElementById('fs-bg');
  if (bg?.options[0]) { bg.options[0].text = t('bgWhite'); bg.options[1].text = t('bgTransp'); }
  document.title = `${t('title')} – ${t('subtitle')}`;
}

function getMode() { return document.querySelector('input[name="mode"]:checked').value; }

function updateStylePanel() {
  const p = document.getElementById('formula-style-panel');
  if (p) p.hidden = getMode() !== 'render';
}

function setLoading(msg) {
  const box = document.getElementById('output-text');
  box.innerHTML = `<div class="loading-msg"><span class="loading-spinner"></span>${escapeHTML(msg)}</div>`;
  box.classList.remove('empty');
  ['btn-copy','btn-download','btn-convert'].forEach(id => {
    document.getElementById(id).disabled = true;
  });
}

function showOutput(html) {
  const box = document.getElementById('output-text');
  document.getElementById('btn-convert').disabled = false;
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const ok = temp.textContent.trim().length > 0 || !!temp.querySelector('img');
  if (ok) {
    box.innerHTML = html;
    box.classList.remove('empty');
    document.getElementById('btn-copy').disabled         = false;
    document.getElementById('btn-download').disabled     = false;
    document.getElementById('btn-download-pdf').disabled = false;
  } else {
    box.textContent = t('noFormulas');
    box.classList.add('empty');
    document.getElementById('btn-copy').disabled         = true;
    document.getElementById('btn-download').disabled     = true;
    document.getElementById('btn-download-pdf').disabled = true;
  }
}

/* ============================================================
   Copy to clipboard
   <img> tags with SVG data URLs paste as images in Word & Docs
   ============================================================ */
async function copyToClipboard() {
  const box = document.getElementById('output-text');
  if (box.classList.contains('empty')) return;
  const btn = document.getElementById('btn-copy');
  const feedback = () => {
    const orig = btn.textContent;
    btn.textContent = t('copied');
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
  };
  try {
    if (window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':  new Blob([box.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([box.innerText],  { type: 'text/plain' }),
      })]);
    } else {
      await navigator.clipboard.writeText(box.innerText);
    }
    feedback();
  } catch {
    const ta = Object.assign(document.createElement('textarea'),
      { value: box.innerText, style: 'position:fixed;opacity:0' });
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    feedback();
  }
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  applyLang();
  updateStylePanel();

  const inputEl = document.getElementById('input-text');

  /* --- Paste: clean Word/PDF HTML, keep bold/italic --- */
  inputEl.addEventListener('paste', e => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    if (html) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(range.createContextualFragment(cleanPastedHTML(html)));
        range.collapse(false);
      }
    } else {
      document.execCommand('insertText', false, plain);
    }
  });

  /* --- Convert button --- */
  document.getElementById('btn-convert').addEventListener('click', async () => {
    if (!inputEl.textContent.trim()) return;
    const mode  = getMode();
    const style = getFormulaStyle();

    if (mode === 'render') {
      // Check if MathJax is ready; show appropriate loading message
      const mjxReady = !!(window.MathJax?.tex2svg);
      setLoading(mjxReady ? t('rendering') : t('loadingMath'));
      try {
        showOutput(await processRichHTML(inputEl.innerHTML, mode, style));
      } catch (err) {
        console.error('Render error:', err);
        showOutput(inputEl.innerHTML); // fallback
      }
    } else {
      showOutput(await processRichHTML(inputEl.innerHTML, mode, style));
    }
  });

  /* --- Ctrl/Cmd + Enter shortcut --- */
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.getElementById('btn-convert').click();
    }
  });

  /* --- Copy & Download --- */
  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
  document.getElementById('btn-download').addEventListener('click', () => {
    const box = document.getElementById('output-text');
    if (!box.classList.contains('empty')) downloadHTML(inputEl.innerHTML);
  });
  document.getElementById('btn-download-pdf').addEventListener('click', () => {
    const box = document.getElementById('output-text');
    if (!box.classList.contains('empty')) printOutput(box.innerHTML);
  });

  /* --- Language toggle --- */
  document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    applyLang();
    const box = document.getElementById('output-text');
    if (box.classList.contains('empty')) box.textContent = t('noFormulas');
  });

  /* --- Mode change --- */
  document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.addEventListener('change', () => {
      updateStylePanel();
      const box = document.getElementById('output-text');
      if (!box.classList.contains('empty') && box.innerHTML) {
        document.getElementById('btn-convert').click();
      }
    });
  });

  /* --- Size preview label --- */
  document.getElementById('fs-size')?.addEventListener('input', e => {
    const lbl = document.getElementById('fs-size-val');
    if (lbl) lbl.textContent = e.target.value + 'px';
  });
});
