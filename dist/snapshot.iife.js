"use strict";
(() => {
  // ../extension/src/content/svg-extractor.ts
  var NAMED_COLORS = {
    white: "rgb(255, 255, 255)",
    black: "rgb(0, 0, 0)",
    red: "rgb(255, 0, 0)",
    blue: "rgb(0, 0, 255)",
    green: "rgb(0, 128, 0)",
    transparent: "rgba(0, 0, 0, 0)"
  };
  function normalizeColor(value) {
    if (!value || value === "none" || value === "transparent" || value === "currentColor") return null;
    const color = value.trim().toLowerCase();
    if (color.startsWith("rgb")) {
      const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      return match ? `rgb(${match[1]}, ${match[2]}, ${match[3]})` : value;
    }
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      let r;
      let g;
      let b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6 || hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        return null;
      }
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
      return `rgb(${r}, ${g}, ${b})`;
    }
    return NAMED_COLORS[color] || null;
  }
  function elementAreaWeight(element) {
    try {
      const svgElement = element;
      if (typeof svgElement.getBBox === "function") {
        const box = svgElement.getBBox();
        return Math.max(box.width * box.height, 1);
      }
    } catch {
    }
    return 1;
  }
  function getSvgAccessibleName(element) {
    const direct = element.getAttribute("aria-label");
    if (direct && direct.trim()) return direct.trim();
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const idParts = labelledBy.split(/\s+/).map((id) => id.trim()).filter(Boolean);
      const labelText = idParts.map((id) => document.getElementById(id)?.textContent?.trim()).filter((value) => !!value && value.length > 0).join(" ").trim();
      if (labelText) return labelText;
    }
    const title = element.querySelector("title")?.textContent?.trim();
    if (title) return title;
    const svgTextNodes = Array.from(element.querySelectorAll("text, tspan")).map((node) => node.textContent?.trim()).filter((value) => !!value && value.length > 0);
    if (svgTextNodes.length > 0) {
      return svgTextNodes.join(" ").replace(/\s+/g, " ").trim();
    }
    const inlineText = element.textContent?.trim();
    if (inlineText && inlineText.length <= 200) {
      return inlineText.replace(/\s+/g, " ");
    }
    const parent = element.parentElement?.getAttribute("aria-label")?.trim();
    if (parent) return parent;
    return void 0;
  }
  function extractSvgColor(element) {
    const colors = [];
    const descendants = element.querySelectorAll("*");
    for (const node of descendants) {
      try {
        const style = window.getComputedStyle(node);
        const fill = style.fill;
        if (fill && fill !== "none" && fill !== "transparent" && !fill.startsWith("url(")) {
          const normalized = normalizeColor(fill);
          if (normalized) colors.push({ color: normalized, weight: elementAreaWeight(node) });
        }
        const stroke = style.stroke;
        const strokeWidth = parseFloat(style.strokeWidth || "0");
        if (stroke && stroke !== "none" && strokeWidth > 0) {
          const normalized = normalizeColor(stroke);
          if (normalized) colors.push({ color: normalized, weight: elementAreaWeight(node) * 0.5 });
        }
        const fillAttr = node.getAttribute("fill");
        if (fillAttr && fillAttr !== "none" && fillAttr !== "currentColor" && !fillAttr.startsWith("url(")) {
          const normalized = normalizeColor(fillAttr);
          if (normalized && !colors.some((c) => c.color === normalized)) {
            colors.push({ color: normalized, weight: elementAreaWeight(node) });
          }
        }
      } catch {
      }
    }
    if (colors.length === 0) {
      try {
        const fallback = window.getComputedStyle(element.parentElement || element).color;
        return normalizeColor(fallback);
      } catch {
        return null;
      }
    }
    const filtered = colors.filter((entry) => {
      const match = entry.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return true;
      const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
      const nearWhite = r > 245 && g > 245 && b > 245;
      const nearBlack = r < 10 && g < 10 && b < 10;
      return !nearWhite && !nearBlack;
    });
    const pool = filtered.length > 0 ? filtered : colors;
    pool.sort((a, b) => b.weight - a.weight);
    return pool[0]?.color || null;
  }

  // ../extension/src/content/dom-snapshot.ts
  var SNAPSHOT_SELECTORS = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "button",
    '[role="button"]',
    '[type="button"]',
    '[type="submit"]',
    'a[class*="btn"]',
    'a[class*="button"]',
    'div[class*="btn"]',
    'div[class*="button"]',
    ".btn",
    ".button",
    "a",
    "input",
    "textarea",
    "select",
    "p",
    "span",
    "li",
    '[class*="card"]',
    '[class*="Card"]',
    '[class*="container"]',
    '[class*="Container"]',
    '[class*="wrapper"]',
    '[class*="Wrapper"]',
    ".card",
    '[class*="label"]',
    '[class*="Label"]',
    '[class*="title"]',
    '[class*="Title"]',
    '[class*="heading"]',
    '[class*="Heading"]',
    '[class*="text"]',
    '[class*="Text"]',
    ".label",
    ".text",
    ".title",
    ".heading",
    '[class*="cta"]',
    '[class*="CTA"]',
    '[class*="action"]',
    '[class*="Action"]',
    '[class*="badge"]',
    '[class*="Badge"]',
    '[class*="chip"]',
    '[class*="Chip"]',
    '[class*="tag"]',
    '[class*="Tag"]',
    '[class*="avatar"]',
    '[class*="Avatar"]',
    '[class*="icon"]',
    '[class*="Icon"]',
    '[class*="alert"]',
    '[class*="Alert"]',
    '[class*="toast"]',
    '[class*="Toast"]',
    '[class*="modal"]',
    '[class*="Modal"]',
    '[class*="dialog"]',
    '[class*="Dialog"]',
    '[class*="hero"]',
    '[class*="Hero"]',
    '[class*="banner"]',
    '[class*="Banner"]',
    '[class*="footer"]',
    '[class*="Footer"]',
    '[class*="price"]',
    '[class*="Price"]',
    '[class*="product"]',
    '[class*="Product"]',
    // Structural/landmark ARIA roles
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[role="form"]',
    '[role="region"]',
    '[role="main"]',
    '[role="tabpanel"]',
    '[role="group"]',
    '[role="search"]',
    "section",
    "main",
    "form",
    // Table structure capture — needed for row-level parent constraints in matching
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    '[role="table"]',
    '[role="row"]',
    '[role="rowgroup"]',
    '[role="cell"]',
    '[role="columnheader"]',
    '[role="rowheader"]',
    // Improvement #4: explicit SVG capture.
    "svg",
    '[role="img"]',
    // Image capture: <img> tags for icons, logos, product images
    "img"
  ];
  var IMPLICIT_ROLES = {
    a: "link",
    article: "article",
    aside: "complementary",
    button: "button",
    details: "group",
    dialog: "dialog",
    footer: "contentinfo",
    form: "form",
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
    header: "banner",
    hr: "separator",
    img: "img",
    input: "textbox",
    li: "listitem",
    main: "main",
    menu: "list",
    nav: "navigation",
    ol: "list",
    option: "option",
    output: "status",
    progress: "progressbar",
    section: "region",
    select: "combobox",
    summary: "button",
    table: "table",
    td: "cell",
    textarea: "textbox",
    th: "columnheader",
    tr: "row",
    ul: "list"
  };
  function getComputedRole(element) {
    const explicitRole = element.getAttribute("role")?.trim().split(/\s+/)[0];
    if (explicitRole) return explicitRole;
    const tag = element.tagName.toLowerCase();
    if (tag === "input") {
      const type = element.type?.toLowerCase() || "text";
      switch (type) {
        case "button":
        case "submit":
        case "reset":
        case "image":
          return "button";
        case "checkbox":
          return "checkbox";
        case "radio":
          return "radio";
        case "range":
          return "slider";
        case "search":
          return "searchbox";
        default:
          return "textbox";
      }
    }
    if (tag === "a") {
      return element.hasAttribute("href") ? "link" : void 0;
    }
    if (tag === "img") {
      const alt = element.getAttribute("alt");
      if (alt === "") return "presentation";
      return "img";
    }
    return IMPLICIT_ROLES[tag];
  }
  function getHeadingLevel(element) {
    const tag = element.tagName.toLowerCase();
    const match = tag.match(/^h([1-6])$/);
    if (match) return parseInt(match[1], 10);
    const role = element.getAttribute("role");
    if (role === "heading") {
      const level = element.getAttribute("aria-level");
      if (level) return parseInt(level, 10);
      return 2;
    }
    return void 0;
  }
  function getAccessibleName(element) {
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const parts = labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean);
      if (parts.length > 0) return parts.join(" ");
    }
    const ariaLabel = element.getAttribute("aria-label")?.trim();
    if (ariaLabel) return ariaLabel;
    const tag = element.tagName.toLowerCase();
    if (["input", "select", "textarea"].includes(tag)) {
      const id = element.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label?.textContent?.trim()) return label.textContent.trim();
      }
      const parentLabel = element.closest("label");
      if (parentLabel) {
        const clone = parentLabel.cloneNode(true);
        const inputs = clone.querySelectorAll("input, select, textarea");
        inputs.forEach((inp) => inp.remove());
        const labelText = clone.textContent?.trim();
        if (labelText) return labelText;
      }
      const placeholder = element.placeholder?.trim();
      if (placeholder) return placeholder;
    }
    if (tag === "img") {
      const alt = element.alt?.trim();
      if (alt) return alt;
    }
    if (tag === "svg") {
      const title2 = element.querySelector("title");
      if (title2?.textContent?.trim()) return title2.textContent.trim();
      const svgAriaLabel = element.getAttribute("aria-label")?.trim();
      if (svgAriaLabel) return svgAriaLabel;
    }
    const title = element.getAttribute("title")?.trim();
    if (title) return title;
    const textRoles = ["button", "link", "heading", "tab", "menuitem", "option", "treeitem"];
    const role = getComputedRole(element);
    if (role && textRoles.includes(role)) {
      const text = element.textContent?.trim();
      if (text && text.length <= 200) return text;
    }
    return void 0;
  }
  function cleanText(value) {
    const trimmed = (value || "").trim();
    if (!trimmed) return void 0;
    if (trimmed.length >= 200) return void 0;
    return trimmed;
  }
  function directTextContent(el) {
    let text = "";
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent || "";
      }
    }
    return text.trim();
  }
  function getInheritedBackgroundColor(el) {
    const elRect = el.getBoundingClientRect();
    const elArea = elRect.width * elRect.height;
    let current = el.parentElement;
    let depth = 0;
    while (current && depth < 3) {
      const tag = current.tagName;
      if (tag === "HTML" || tag === "BODY") break;
      const parentStyle = window.getComputedStyle(current);
      if (parentStyle.backgroundImage && parentStyle.backgroundImage !== "none") {
        current = current.parentElement;
        depth++;
        continue;
      }
      const bg = parentStyle.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        const parentRect = current.getBoundingClientRect();
        const parentArea = parentRect.width * parentRect.height;
        if (elArea <= 0) {
          return bg;
        }
        if (parentArea / elArea <= 3) {
          return bg;
        }
      }
      current = current.parentElement;
      depth++;
    }
    return void 0;
  }
  var FIDEL_ATTR = "data-fidel-id";
  var fidelSeq = 0;
  function stableSelector(element) {
    let id = element.getAttribute(FIDEL_ATTR);
    if (!id) {
      id = `fi-${++fidelSeq}`;
      element.setAttribute(FIDEL_ATTR, id);
    }
    return `[${FIDEL_ATTR}="${id}"]`;
  }
  function getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    const node = element.nodeName.toLowerCase();
    const classes = Array.from(element.classList).filter((c) => !c.startsWith("_")).slice(0, 2);
    if (classes.length > 0) return `${node}.${classes.join(".")}`;
    const dataAttr = Array.from(element.attributes).filter((a) => a.name.startsWith("data-") && a.name !== FIDEL_ATTR).slice(0, 1);
    if (dataAttr.length > 0) return `${node}[${dataAttr[0].name}="${dataAttr[0].value}"]`;
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((el) => el.nodeName === element.nodeName);
      const index = siblings.indexOf(element);
      if (siblings.length > 1) return `${node}:nth-of-type(${index + 1})`;
    }
    return node;
  }
  function getElementLocation(element) {
    const structuralTags = ["header", "nav", "main", "aside", "footer", "section", "article"];
    const parts = [];
    let current = element.parentElement;
    while (current && parts.length < 2) {
      const tag = current.tagName.toLowerCase();
      if (structuralTags.includes(tag)) {
        const ariaLabel = current.getAttribute("aria-label");
        if (ariaLabel) {
          parts.unshift(ariaLabel);
        } else {
          const heading = current.querySelector("h1, h2, h3, h4, h5, h6");
          if (heading?.textContent) {
            parts.unshift(heading.textContent.trim().substring(0, 30));
          } else {
            parts.unshift(tag.charAt(0).toUpperCase() + tag.slice(1));
          }
        }
      }
      const role = current.getAttribute("role");
      if (role && ["banner", "navigation", "main", "complementary", "contentinfo"].includes(role)) {
        const roleLabel = current.getAttribute("aria-label") || role;
        parts.unshift(roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1));
      }
      current = current.parentElement;
    }
    return parts.length > 0 ? parts.join(", ") : void 0;
  }
  function getChildIndex(element) {
    const parent = element.parentElement;
    if (!parent) return 0;
    return Array.from(parent.children).indexOf(element);
  }
  function hasMaterialLayoutSignal(style) {
    const display = style.display;
    const isFlexOrGrid = display === "flex" || display === "inline-flex" || display === "grid" || display === "inline-grid";
    if (isFlexOrGrid) return true;
    const gap = Math.max(
      parseFloat(style.gap) || 0,
      parseFloat(style.rowGap) || 0,
      parseFloat(style.columnGap) || 0
    );
    if (gap > 0) return true;
    const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingRight) || 0) + (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.paddingLeft) || 0);
    return padding >= 16;
  }
  function isLayoutContainerElement(element) {
    return hasMaterialLayoutSignal(window.getComputedStyle(element));
  }
  function getLayoutParentElement(element) {
    let current = element.parentElement;
    let depth = 0;
    while (current && depth < 8) {
      if (isLayoutContainerElement(current)) return current;
      current = current.parentElement;
      depth++;
    }
    return null;
  }
  function getLayoutDepth(element) {
    let depth = 0;
    let current = element.parentElement;
    while (current) {
      if (isLayoutContainerElement(current)) depth++;
      current = current.parentElement;
    }
    return depth;
  }
  function classifyLayoutScope(element, style, boundingBox) {
    if (!hasMaterialLayoutSignal(style)) return "leaf";
    const rect = boundingBox || element.getBoundingClientRect();
    const area = Math.max(0, rect.width) * Math.max(0, rect.height);
    const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
    const idClassText = `${element.id} ${element.className || ""}`.toLowerCase();
    const structuralShell = /\b(page|main|layout|wrapper|container|content)\b/.test(idClassText);
    const semanticSection = /\b(hero|header|footer|nav|section|pricing|feature|signup|form|modal|dialog)\b/.test(idClassText);
    if (structuralShell && area >= viewportArea * 0.35) return "page-shell";
    if (semanticSection || area >= viewportArea * 0.18) return "section";
    return "component";
  }
  function overlapsHeavily(a, b) {
    if (!a || !b) return false;
    const left = Math.max(a.x, b.x);
    const top = Math.max(a.y, b.y);
    const right = Math.min(a.x + a.width, b.x + b.width);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    const width = right - left;
    const height = bottom - top;
    if (width <= 0 || height <= 0) return false;
    const intersection = width * height;
    const minArea = Math.max(1, Math.min(a.width * a.height, b.width * b.height));
    const overlapRatio = intersection / minArea;
    const aCx = a.x + a.width / 2;
    const aCy = a.y + a.height / 2;
    const bCx = b.x + b.width / 2;
    const bCy = b.y + b.height / 2;
    const centerDistance = Math.hypot(aCx - bCx, aCy - bCy);
    const maxCenterDistance = Math.max(6, Math.min(a.width, a.height, b.width, b.height) * 0.25);
    return overlapRatio >= 0.85 && centerDistance <= maxCenterDistance;
  }
  function annotateOverlapGroups(elements) {
    const parent = Array.from({ length: elements.length }, (_, i) => i);
    function find(x) {
      let current = x;
      while (parent[current] !== current) {
        parent[current] = parent[parent[current]];
        current = parent[current];
      }
      return current;
    }
    function union(a, b) {
      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) parent[rootB] = rootA;
    }
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (overlapsHeavily(elements[i].boundingBox, elements[j].boundingBox)) {
          union(i, j);
        }
      }
    }
    const groups = /* @__PURE__ */ new Map();
    for (let i = 0; i < elements.length; i++) {
      const root = find(i);
      const bucket = groups.get(root) || [];
      bucket.push(i);
      groups.set(root, bucket);
    }
    const annotated = elements.map((element) => ({ ...element }));
    let seq = 0;
    for (const indexes of groups.values()) {
      if (indexes.length < 2) continue;
      const groupId = `ov-${++seq}`;
      const selectors = indexes.map((index) => annotated[index].selector);
      for (const index of indexes) {
        annotated[index].overlapGroupId = groupId;
        annotated[index].overlapPeers = selectors.filter((selector) => selector !== annotated[index].selector);
      }
    }
    return annotated;
  }
  function isNavigationElement(element) {
    let current = element;
    while (current) {
      const className = current.className?.toLowerCase?.() || "";
      const id = current.id?.toLowerCase() || "";
      const role = current.getAttribute("role")?.toLowerCase() || "";
      const aria = current.getAttribute("aria-label")?.toLowerCase() || "";
      if (className.includes("nav") || className.includes("navigation") || className.includes("sidebar") || className.includes("side-bar") || className.includes("menu") || className.includes("header") || className.includes("chrome") || className.includes("topbar") || className.includes("top-bar") || id.includes("nav") || id.includes("navigation") || id.includes("sidebar") || id.includes("menu") || id.includes("header") || id.includes("chrome") || id.includes("topbar") || role === "navigation" || role === "banner" || aria.includes("navigation") || aria.includes("menu") || current.tagName === "HEADER") {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  function rootFontSizePx() {
    const raw = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(raw) && raw > 0 ? raw : void 0;
  }
  function toDomElement(element, viewportWidth, viewportHeight, rootFontSize, boundsOrigin) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const absoluteX = rect.left + window.scrollX;
    const absoluteY = rect.top + window.scrollY;
    const boundingBox = {
      x: absoluteX,
      y: absoluteY,
      width: rect.width,
      height: rect.height
    };
    const centerX = absoluteX + rect.width / 2 - (boundsOrigin?.x || 0);
    const centerY = absoluteY + rect.height / 2 - (boundsOrigin?.y || 0);
    const relativePosition = {
      xPercent: (boundsOrigin ? centerX / boundsOrigin.width : centerX / viewportWidth) || 0.5,
      yPercent: (boundsOrigin ? centerY / boundsOrigin.height : centerY / viewportHeight) || 0.5
    };
    const isSvg = element.tagName.toLowerCase() === "svg" || element.getAttribute("role") === "img";
    const isImg = element.tagName.toLowerCase() === "img";
    const svgColor = isSvg ? extractSvgColor(element) : null;
    const svgName = isSvg ? getSvgAccessibleName(element) : void 0;
    let rawText;
    if (isSvg) {
      rawText = svgName;
    } else if (isImg) {
      rawText = cleanText(element.alt) || cleanText(element.getAttribute("aria-label"));
    } else {
      const direct = directTextContent(element);
      const hasChildElements = element.children.length > 0;
      rawText = hasChildElements ? cleanText(direct) : cleanText(direct || element.textContent);
    }
    let imgElementType;
    if (isImg) {
      const isSmall = rect.width <= 100 && rect.height <= 100;
      imgElementType = isSmall ? "icon" : "shape";
    }
    const computedRole = getComputedRole(element);
    const accessibleName = getAccessibleName(element);
    const headingLevel = getHeadingLevel(element);
    const parentSelector = element.parentElement ? stableSelector(element.parentElement) : void 0;
    const layoutParent = getLayoutParentElement(element);
    const layoutParentSelector = layoutParent ? stableSelector(layoutParent) : void 0;
    const layoutDepth = getLayoutDepth(element);
    const childIndex = getChildIndex(element);
    const isLayoutContainer = isLayoutContainerElement(element);
    const layoutScope = classifyLayoutScope(element, style, boundingBox);
    const dom = {
      selector: stableSelector(element),
      displaySelector: getElementSelector(element),
      // PR 28-02: full classList enables variant-signature matching in the
      // Phase 27 design-system validator. Filtered to non-empty strings so
      // tokenizers downstream don't have to defend against `""` entries.
      classList: Array.from(element.classList).filter(Boolean),
      tagName: element.tagName.toLowerCase(),
      inputType: element instanceof HTMLInputElement ? element.type?.toLowerCase() || "text" : void 0,
      childCount: element.children.length,
      role: computedRole,
      accessibleName: cleanText(accessibleName),
      headingLevel,
      text: cleanText(rawText),
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      rootFontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textAlign: style.textAlign,
      textTransform: style.textTransform,
      textDecoration: style.textDecoration,
      fontStyle: style.fontStyle,
      color: svgColor || style.color,
      backgroundColor: style.backgroundColor,
      inheritedBackgroundColor: style.backgroundColor === "rgba(0, 0, 0, 0)" || style.backgroundColor === "transparent" ? getInheritedBackgroundColor(element) : void 0,
      borderRadius: style.borderRadius,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      borderBottomRightRadius: style.borderBottomRightRadius,
      borderBottomLeftRadius: style.borderBottomLeftRadius,
      borderStyle: style.borderStyle,
      borderColor: style.borderColor,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      borderTopWidth: style.borderTopWidth,
      borderRightWidth: style.borderRightWidth,
      borderBottomWidth: style.borderBottomWidth,
      borderLeftWidth: style.borderLeftWidth,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      width: style.width,
      height: style.height,
      minWidth: style.minWidth,
      maxWidth: style.maxWidth,
      minHeight: style.minHeight,
      maxHeight: style.maxHeight,
      display: style.display,
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      alignContent: style.alignContent,
      flexWrap: style.flexWrap,
      overflow: style.overflow,
      gap: style.gap,
      rowGap: style.rowGap,
      columnGap: style.columnGap,
      flexGrow: style.flexGrow,
      boxShadow: style.boxShadow,
      opacity: style.opacity,
      visible: !!element.offsetParent || style.position === "fixed",
      location: getElementLocation(element),
      boundingBox,
      relativePosition,
      elementType: isSvg ? "icon" : imgElementType,
      parentSelector,
      layoutParentSelector,
      layoutDepth,
      childIndex,
      layoutScope,
      isLayoutContainer
    };
    return dom;
  }
  function isPlaceholderImage(element) {
    if (element.tagName.toLowerCase() !== "img") return false;
    const img = element;
    if (img.getAttribute("aria-hidden") === "true") return true;
    const src = img.src || "";
    if (src.startsWith("data:image/svg+xml") || src.startsWith("data:image/gif")) return true;
    if (img.naturalWidth === 0 && img.naturalHeight === 0 && !img.complete) return true;
    return false;
  }
  function isSignificantContainer(el) {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) return false;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.width >= vw * 0.9 && rect.height >= vh * 0.9) return false;
    const bgImg = style.backgroundImage;
    if (bgImg && bgImg !== "none") return false;
    const bg = style.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return true;
    const br = parseFloat(style.borderRadius);
    if (!isNaN(br) && br > 0) return true;
    if (style.boxShadow && style.boxShadow !== "none") return true;
    const bw = Math.max(
      parseFloat(style.borderTopWidth) || 0,
      parseFloat(style.borderRightWidth) || 0,
      parseFloat(style.borderBottomWidth) || 0,
      parseFloat(style.borderLeftWidth) || 0
    );
    if (bw > 0 && style.borderStyle !== "none") return true;
    const ow = parseFloat(style.outlineWidth) || 0;
    if (ow > 0 && style.outlineStyle !== "none") return true;
    const role = el.getAttribute("role");
    if (role && ["dialog", "alertdialog", "form", "region", "tabpanel", "group"].includes(role)) return true;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const padLeft = parseFloat(style.paddingLeft) || 0;
    if (padTop + padRight + padBottom + padLeft >= 16) return true;
    const display = style.display;
    if ((display === "flex" || display === "inline-flex" || display === "grid") && style.gap && style.gap !== "normal" && parseFloat(style.gap) > 0) return true;
    return false;
  }
  function collectAncestorContainers(leaves) {
    const seen = new Set(leaves);
    const containers = [];
    const MAX_DEPTH = 5;
    for (const leaf of leaves) {
      let current = leaf.parentElement;
      let depth = 0;
      while (current && depth < MAX_DEPTH) {
        if (seen.has(current)) {
          current = current.parentElement;
          depth++;
          continue;
        }
        seen.add(current);
        const tag = current.tagName;
        if (tag === "HTML" || tag === "BODY" || tag === "HEAD") break;
        if (isSignificantContainer(current)) {
          containers.push(current);
        }
        current = current.parentElement;
        depth++;
      }
    }
    return containers;
  }
  function getCandidateElements(includeNavigation = false) {
    const all = Array.from(document.querySelectorAll(SNAPSHOT_SELECTORS.join(",")));
    const withoutPlaceholders = all.filter((el) => !isPlaceholderImage(el));
    const leaves = includeNavigation ? withoutPlaceholders : withoutPlaceholders.filter((el) => !isNavigationElement(el));
    const ancestors = collectAncestorContainers(leaves);
    return [...leaves, ...ancestors];
  }
  function snapshotDOM(includeNavigation = false) {
    const elements = getCandidateElements(includeNavigation);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const rootFontSize = rootFontSizePx();
    return annotateOverlapGroups(elements.map((el) => toDomElement(el, viewportWidth, viewportHeight, rootFontSize)).filter((el) => el.visible));
  }
  var PSEUDO_STATE_PROPS = [
    "color",
    "backgroundColor",
    "borderColor",
    "borderStyle",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "boxShadow",
    "opacity",
    "borderRadius"
  ];
  function isInteractiveElement(el) {
    const tag = el.tagName.toLowerCase();
    if (["button", "a", "input", "textarea", "select"].includes(tag)) return true;
    const role = el.getAttribute("role");
    if (role && ["button", "link", "tab", "menuitem", "checkbox", "radio", "switch", "option"].includes(role)) return true;
    if (el.getAttribute("tabindex") !== null) return true;
    return false;
  }
  function captureBaseStyles(style) {
    const base = {};
    for (const prop of PSEUDO_STATE_PROPS) {
      base[prop] = style.getPropertyValue(prop === "borderRadius" ? "border-radius" : camelToKebab(prop));
    }
    return base;
  }
  function camelToKebab(str) {
    return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  }
  function diffFromBase(base, current) {
    const diff = {};
    let hasDiff = false;
    for (const prop of PSEUDO_STATE_PROPS) {
      const kebab = prop === "borderRadius" ? "border-radius" : camelToKebab(prop);
      const val = current.getPropertyValue(kebab);
      if (val !== base[prop]) {
        diff[prop] = val;
        hasDiff = true;
      }
    }
    return hasDiff ? diff : null;
  }
  function getStylesFromSheets(element, pseudoClass) {
    const props = {};
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSStyleRule) {
            const sel = rule.selectorText;
            if (!sel.includes(":" + pseudoClass)) continue;
            const baseSel = sel.replace(new RegExp(":" + pseudoClass + "\\b", "g"), "");
            try {
              if (element.matches(baseSel)) {
                for (const prop of Array.from(rule.style)) {
                  props[prop] = rule.style.getPropertyValue(prop);
                }
              }
            } catch {
            }
          }
        }
      } catch {
      }
    }
    return props;
  }
  function isScrollable(el) {
    return el.scrollTop !== 0 || el.scrollLeft !== 0 || el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  }
  function recordScrollPositions(scope) {
    const out = [{ target: null, left: window.scrollX, top: window.scrollY }];
    const scroller = document.scrollingElement;
    const push = (el) => {
      if (el === scroller || !isScrollable(el)) return;
      out.push({ target: el, left: el.scrollLeft, top: el.scrollTop });
    };
    if (scope) {
      let node = scope.parentNode;
      while (node) {
        if (node instanceof Element) push(node);
        node = node instanceof ShadowRoot ? node.host : node.parentNode;
      }
    } else {
      for (const el of Array.from(document.querySelectorAll("*"))) push(el);
    }
    return out;
  }
  function restoreScrollPositions(positions) {
    let moved = 0;
    for (const p of positions) {
      if (p.target === null) {
        if (window.scrollX === p.left && window.scrollY === p.top) continue;
        window.scrollTo({ left: p.left, top: p.top, behavior: "instant" });
        moved++;
      } else {
        if (!p.target.isConnected) continue;
        if (p.target.scrollLeft === p.left && p.target.scrollTop === p.top) continue;
        p.target.scrollTo({ left: p.left, top: p.top, behavior: "instant" });
        moved++;
      }
    }
    return moved;
  }
  async function capturePseudoStateStyles(element, states) {
    const scroll = recordScrollPositions(element);
    try {
      return await capturePseudoStateStylesUnscrolled(element, states);
    } finally {
      restoreScrollPositions(scroll);
    }
  }
  async function capturePseudoStateStylesUnscrolled(element, states) {
    const htmlEl = element;
    const result = {};
    const baseStyle = window.getComputedStyle(element);
    const base = captureBaseStyles(baseStyle);
    for (const state of states) {
      let diff = null;
      if (state === "hover") {
        htmlEl.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, cancelable: true }));
        htmlEl.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false, cancelable: false }));
        await new Promise((r) => setTimeout(r, 30));
        const hoverStyle = window.getComputedStyle(element);
        diff = diffFromBase(base, hoverStyle);
        htmlEl.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, cancelable: true }));
        htmlEl.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false, cancelable: false }));
        if (!diff) {
          const sheetProps = getStylesFromSheets(element, "hover");
          if (Object.keys(sheetProps).length > 0) {
            const filtered = {};
            let hasAny = false;
            for (const prop of PSEUDO_STATE_PROPS) {
              const kebab = prop === "borderRadius" ? "border-radius" : camelToKebab(prop);
              if (sheetProps[kebab] && sheetProps[kebab] !== base[prop]) {
                filtered[prop] = sheetProps[kebab];
                hasAny = true;
              }
            }
            if (hasAny) diff = filtered;
          }
        }
      } else if (state === "focus") {
        htmlEl.focus({ preventScroll: true });
        await new Promise((r) => setTimeout(r, 20));
        const focusStyle = window.getComputedStyle(element);
        diff = diffFromBase(base, focusStyle);
        htmlEl.blur();
      } else if (state === "focus-visible") {
        htmlEl.focus({ preventScroll: true });
        await new Promise((r) => setTimeout(r, 20));
        const focusVisibleStyle = window.getComputedStyle(element);
        diff = diffFromBase(base, focusVisibleStyle);
        htmlEl.blur();
        if (!diff) {
          const sheetProps = getStylesFromSheets(element, "focus-visible");
          if (Object.keys(sheetProps).length > 0) {
            const filtered = {};
            let hasAny = false;
            for (const prop of PSEUDO_STATE_PROPS) {
              const kebab = prop === "borderRadius" ? "border-radius" : camelToKebab(prop);
              if (sheetProps[kebab] && sheetProps[kebab] !== base[prop]) {
                filtered[prop] = sheetProps[kebab];
                hasAny = true;
              }
            }
            if (hasAny) diff = filtered;
          }
        }
      } else if (state === "active" || state === "pressed") {
        htmlEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
        await new Promise((r) => setTimeout(r, 20));
        const activeStyle = window.getComputedStyle(element);
        diff = diffFromBase(base, activeStyle);
        htmlEl.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
      }
      if (diff) {
        result[state] = diff;
      }
    }
    return result;
  }
  var CSSVAR_DEFAULT_CAPS = {
    maxStyleSheets: 200,
    maxRules: 5e4,
    maxDepth: 16,
    maxElements: 64,
    maxNames: 5e3,
    maxMs: 5e3,
    maxDeclarations: 2e4,
    maxInlineElements: 2e3,
    maxScopeSelectors: 3e3,
    maxScopeProbes: 4e3,
    maxProbesPerSelector: 32,
    maxAnimations: 500
  };
  var THEME_SCOPE_SELECTORS = [".dark", ".light", "[data-theme]", "[data-mode]", "[data-color-scheme]"];
  var CSS_WIDE_KEYWORD = /^(initial|inherit|unset|revert|revert-layer)$/i;
  function isGroupingRule(rule) {
    return typeof rule.cssRules !== "undefined";
  }
  function splitSelectorList(selector) {
    const parts = [];
    let depth = 0;
    let quote = null;
    let start = 0;
    for (let i = 0; i < selector.length; i++) {
      const ch = selector[i];
      if (quote) {
        if (ch === "\\") i++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
      else if (ch === "," && depth === 0) {
        parts.push(selector.slice(start, i).trim());
        start = i + 1;
      }
    }
    parts.push(selector.slice(start).trim());
    return parts.filter(Boolean);
  }
  var PSEUDO_ELEMENT_PART = /(^|[^\\])(::|:(before|after|first-line|first-letter)\b)/i;
  var SHADOW_ONLY_PART = /(^|[^\\]):(host-context|host|slotted|part)\b|::(slotted|part)\b/i;
  var ROOT_ONLY_PART = /^(:root|html)$/i;
  var HOST_ONLY_PART = /^:host(\([^)]*\))?$/i;
  var USE_ANCESTRY = /(^|[\s>+~(,])use(?![\w-])/i;
  var READABLE_PSEUDO_ELEMENT = /^(.*?)(?:::(before|after|marker|placeholder|backdrop|file-selector-button|selection|first-line|first-letter)|(?<!:):(before|after|first-line|first-letter))$/i;
  function splitPseudoElementPart(part) {
    const m = READABLE_PSEUDO_ELEMENT.exec(part);
    if (!m) return null;
    let origin = m[1];
    if (origin.endsWith("\\")) return null;
    if (PSEUDO_ELEMENT_PART.test(origin)) return null;
    origin = origin.trim();
    if (origin === "" || /[>+~\s]$/.test(m[1])) origin = `${origin} *`.trim();
    return { origin, pseudo: `::${(m[2] ?? m[3]).toLowerCase()}` };
  }
  function conditionMatches(rule, conditionText) {
    try {
      if (typeof CSSMediaRule !== "undefined" && rule instanceof CSSMediaRule) {
        return window.matchMedia(conditionText).matches;
      }
      if (typeof CSSSupportsRule !== "undefined" && rule instanceof CSSSupportsRule) {
        return typeof CSS !== "undefined" && typeof CSS.supports === "function" ? CSS.supports(conditionText) : true;
      }
    } catch {
      return true;
    }
    return true;
  }
  var TOP_LEVEL = { parent: null, parentAuthored: null, scope: null, inScope: false, broken: false };
  function replaceSelectorToken(selector, token, replacement) {
    let out = "";
    let count = 0;
    let quote = null;
    for (let i = 0; i < selector.length; i++) {
      const ch = selector[i];
      if (quote) {
        out += ch;
        if (ch === "\\" && i + 1 < selector.length) {
          out += selector[++i];
          continue;
        }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "\\" && i + 1 < selector.length) {
        out += ch + selector[++i];
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        out += ch;
        continue;
      }
      if (selector.startsWith(token, i)) {
        const next = selector[i + token.length] ?? "";
        if (!(token[0] === ":" && /[\w-]/.test(next))) {
          out += replacement;
          count++;
          i += token.length - 1;
          continue;
        }
      }
      out += ch;
    }
    return { text: out, count };
  }
  function resolveNestedSelector(text, nest) {
    if (nest.broken) return null;
    if (!nest.parent && !nest.inScope) return text;
    const out = [];
    for (const part of splitSelectorList(text)) {
      let p = part;
      const amp = replaceSelectorToken(p, "&", "");
      if (amp.count > 0) {
        const target = nest.parent ?? (nest.inScope ? nest.scope : null);
        if (!target || PSEUDO_ELEMENT_PART.test(target)) return null;
        p = replaceSelectorToken(p, "&", `:is(${target})`).text;
      }
      const sc = replaceSelectorToken(p, ":scope", "");
      if (sc.count > 0) {
        if (!nest.scope) return null;
        p = replaceSelectorToken(p, ":scope", `:is(${nest.scope})`).text;
      }
      if (amp.count === 0 && sc.count === 0 && nest.parent) {
        if (PSEUDO_ELEMENT_PART.test(nest.parent)) return null;
        p = `:is(${nest.parent}) ${p}`;
      }
      out.push(p);
    }
    return out.join(", ");
  }
  function captureCssVariableState(options = {}) {
    const caps = { ...CSSVAR_DEFAULT_CAPS, ...options };
    const startedAt = Date.now();
    const warnings = [];
    const declarations = [];
    const sites = [];
    const discovered = /* @__PURE__ */ new Set();
    const keyframesProps = /* @__PURE__ */ new Map();
    let sheetsSeen = 0;
    let rulesSeen = 0;
    let truncated = false;
    let traversalStopped = false;
    let provenanceUnverified = false;
    const warned = /* @__PURE__ */ new Set();
    const note = (kind, detail) => {
      if (kind !== "stylesheet_inaccessible") truncated = true;
      const key = `${kind}\0${detail}`;
      if (warned.has(key)) return;
      warned.add(key);
      if (warnings.length < 100) warnings.push({ kind, detail });
    };
    const outOfTime = () => Date.now() - startedAt > caps.maxMs;
    const record = (decl, site) => {
      if (declarations.length >= caps.maxDeclarations) {
        note("cap_declarations", `stopped after ${caps.maxDeclarations} custom-property declarations`);
        traversalStopped = true;
        return false;
      }
      if (!discovered.has(decl.name) && discovered.size >= caps.maxNames) {
        note("cap_names", `stopped after ${caps.maxNames} distinct names`);
        return true;
      }
      discovered.add(decl.name);
      declarations.push(decl);
      sites.push(site);
      return true;
    };
    const visitRules = (rules, href, layers, conditions, active, depth, tree, nest) => {
      if (traversalStopped) return;
      if (depth > caps.maxDepth) {
        note("cap_depth", `nesting deeper than ${caps.maxDepth} in ${href ?? "<style>"}`);
        return;
      }
      for (const rule of Array.from(rules)) {
        if (traversalStopped) return;
        if (rulesSeen++ >= caps.maxRules) {
          note("cap_rules", `stopped after ${caps.maxRules} rules`);
          traversalStopped = true;
          return;
        }
        if (outOfTime()) {
          note("cap_time", `stopped after ${caps.maxMs}ms during traversal`);
          traversalStopped = true;
          return;
        }
        const isStyleRule = typeof CSSStyleRule !== "undefined" && rule instanceof CSSStyleRule;
        const isScopeRule = typeof globalThis.CSSScopeRule !== "undefined" && rule instanceof globalThis.CSSScopeRule;
        const ruleName = rule.constructor?.name ?? "";
        const isNestedDeclarations = ruleName === "CSSNestedDeclarations";
        const isKeyframe = typeof CSSKeyframeRule !== "undefined" && rule instanceof CSSKeyframeRule;
        const ruleStyle = rule.style;
        let ownQuery = null;
        if (ruleStyle && typeof ruleStyle.getPropertyValue === "function") {
          let selector;
          let site;
          if (isStyleRule) {
            selector = rule.selectorText ?? "";
            ownQuery = resolveNestedSelector(selector, nest);
            site = { kind: "rule", root: tree.root, host: tree.host, query: ownQuery, element: null, pseudo: "" };
          } else if (isNestedDeclarations) {
            const target = nest.broken ? null : nest.parent ?? (nest.inScope ? nest.scope : null);
            selector = nest.parentAuthored ?? (nest.inScope ? ":scope" : "");
            site = { kind: "rule", root: tree.root, host: tree.host, query: target, element: null, pseudo: "" };
          } else if (isKeyframe) {
            const parentName = rule.parentRule?.name ?? "";
            selector = `@keyframes ${parentName} ${rule.keyText}`;
            let props = keyframesProps.get(parentName);
            if (!props) {
              props = /* @__PURE__ */ new Map();
              keyframesProps.set(parentName, props);
            }
            for (const propName of Array.from(ruleStyle)) {
              if (propName.startsWith("--")) props.set(propName, ruleStyle.getPropertyValue(propName).trim());
            }
            site = { kind: "none", root: tree.root, host: tree.host, query: null, element: null, pseudo: "" };
          } else {
            selector = `@${ruleName || "rule"}`;
            site = { kind: "rule", root: tree.root, host: tree.host, query: null, element: null, pseudo: "" };
          }
          for (const propName of Array.from(ruleStyle)) {
            if (!propName.startsWith("--")) continue;
            const ok = record(
              {
                name: propName,
                value: ruleStyle.getPropertyValue(propName).trim(),
                selector,
                href,
                layers: layers.slice(),
                conditions: conditions.slice(),
                active
              },
              site
            );
            if (!ok) return;
          }
        }
        if (isGroupingRule(rule)) {
          let nestedRules = null;
          try {
            nestedRules = rule.cssRules;
          } catch {
            nestedRules = null;
          }
          if (!nestedRules) continue;
          const layerName = rule.name;
          const conditionText = rule.conditionText;
          const nextLayers = typeof layerName === "string" && layerName ? layers.concat(layerName) : layers;
          const nextConditions = typeof conditionText === "string" && conditionText ? conditions.concat(conditionText) : conditions;
          const nextActive = typeof conditionText === "string" && conditionText ? active && conditionMatches(rule, conditionText) : active;
          let nextNest = nest;
          if (isStyleRule) {
            nextNest = {
              parent: ownQuery,
              parentAuthored: rule.selectorText ?? "",
              scope: nest.scope,
              inScope: nest.inScope,
              broken: nest.broken || ownQuery === null
            };
          } else if (isScopeRule) {
            const start = rule.start ?? null;
            const resolvedStart = start ? resolveNestedSelector(start, nest) : null;
            nextNest = {
              parent: null,
              parentAuthored: null,
              scope: resolvedStart,
              inScope: true,
              broken: nest.broken || start !== null && resolvedStart === null
            };
          }
          visitRules(nestedRules, href, nextLayers, nextConditions, nextActive, depth + 1, tree, nextNest);
        }
        if (typeof CSSImportRule !== "undefined" && rule instanceof CSSImportRule) {
          if (rule.styleSheet) visitSheet(rule.styleSheet, tree, depth + 1);
        }
      }
    };
    const visitSheet = (sheet, tree, depth = 0) => {
      if (traversalStopped) return;
      if (sheetsSeen++ >= caps.maxStyleSheets) {
        note("cap_stylesheets", `stopped after ${caps.maxStyleSheets} stylesheets`);
        return;
      }
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        provenanceUnverified = true;
        note("stylesheet_inaccessible", sheet.href ?? "<unknown href>");
        return;
      }
      visitRules(rules, sheet.href, [], [], true, depth, tree, TOP_LEVEL);
    };
    const documentTree = { root: document, host: null };
    const allSheets = [];
    try {
      allSheets.push(...Array.from(document.styleSheets));
    } catch {
    }
    try {
      const adopted = document.adoptedStyleSheets;
      if (adopted) allSheets.push(...Array.from(adopted));
    } catch {
    }
    for (const sheet of allSheets) visitSheet(sheet, documentTree);
    const shadowHosts = [];
    const shadowRoots = [];
    try {
      const queue = [document];
      let hostCapHit = false;
      while (queue.length > 0 && !hostCapHit) {
        const scopeRoot = queue.shift();
        const all = scopeRoot.querySelectorAll("*");
        for (let i = 0; i < all.length; i++) {
          const el = all[i];
          const root = el.shadowRoot;
          if (!root) continue;
          if (shadowHosts.length >= caps.maxElements) {
            note("cap_elements", `stopped after ${caps.maxElements} shadow hosts`);
            hostCapHit = true;
            break;
          }
          shadowHosts.push(el);
          shadowRoots.push(root);
          queue.push(root);
          const tree = { root, host: el };
          try {
            for (const s of Array.from(root.styleSheets ?? [])) visitSheet(s, tree);
          } catch {
          }
          try {
            const adopted = root.adoptedStyleSheets;
            if (adopted) for (const s of Array.from(adopted)) visitSheet(s, tree);
          } catch {
          }
        }
      }
    } catch {
    }
    let inlineElements = 0;
    try {
      const trees = [documentTree].concat(shadowRoots.map((root, i) => ({ root, host: shadowHosts[i] })));
      outer: for (const tree of trees) {
        const list = tree.root.querySelectorAll('[style*="--"]');
        for (let i = 0; i < list.length; i++) {
          if (traversalStopped) break outer;
          if (inlineElements >= caps.maxInlineElements) {
            note("cap_inline", `stopped after ${caps.maxInlineElements} elements with inline custom properties`);
            break outer;
          }
          if (outOfTime()) {
            note("cap_time", `stopped after ${caps.maxMs}ms reading style attributes`);
            break outer;
          }
          const el = list[i];
          const style = el.style;
          if (!style) continue;
          inlineElements++;
          for (let p = 0; p < style.length; p++) {
            const propName = style[p];
            if (!propName.startsWith("--")) continue;
            const ok = record(
              {
                name: propName,
                value: style.getPropertyValue(propName).trim(),
                selector: el === document.documentElement ? "html" : "[style]",
                href: null,
                layers: [],
                conditions: [],
                active: true,
                origin: "inline"
              },
              { kind: "inline", root: tree.root, host: tree.host, query: null, element: el, pseudo: "" }
            );
            if (!ok) break outer;
          }
        }
      }
    } catch {
    }
    try {
      const running = typeof document.getAnimations === "function" ? document.getAnimations() : [];
      let animated = 0;
      for (const anim of running) {
        if (traversalStopped) break;
        const effect = anim.effect;
        const target = effect && typeof effect.getKeyframes === "function" ? effect.target : null;
        if (!effect || !target) continue;
        let frames = [];
        try {
          frames = effect.getKeyframes();
        } catch {
          continue;
        }
        const cssName = anim.animationName;
        if (typeof cssName === "string" && keyframesProps.has(cssName)) {
          frames = frames.concat([Object.fromEntries(keyframesProps.get(cssName))]);
        }
        let counted = false;
        for (const frame of frames) {
          for (const key of Object.keys(frame)) {
            if (!key.startsWith("--")) continue;
            if (!counted) {
              if (animated >= caps.maxAnimations) {
                note("cap_scope_search", `stopped after ${caps.maxAnimations} running animations that set custom properties`);
                traversalStopped = true;
                break;
              }
              animated++;
              counted = true;
            }
            const ok = record(
              {
                name: key,
                value: String(frame[key] ?? "").trim(),
                selector: "@animation",
                href: null,
                layers: [],
                conditions: [],
                active: true,
                origin: "animation"
              },
              {
                kind: "animation",
                root: target.getRootNode() ?? document,
                host: null,
                query: null,
                element: target,
                pseudo: effect.pseudoElement ?? ""
              }
            );
            if (!ok) break;
          }
          if (traversalStopped) break;
        }
      }
    } catch {
    }
    const expected = (options.expectedNames ?? []).map((n) => n.startsWith("--") ? n : `--${n}`);
    const allNames = Array.from(/* @__PURE__ */ new Set([...expected, ...discovered]));
    if (allNames.length > caps.maxNames) {
      note("cap_names", `${allNames.length - caps.maxNames} expected or discovered names beyond the ${caps.maxNames}-name limit were not resolved`);
    }
    const names = allNames.slice(0, caps.maxNames);
    const resolved = {};
    const scoped = {};
    const scopes = {};
    const styleCaches = /* @__PURE__ */ new Map();
    const readOn = (el, pseudo = "") => {
      let cache = styleCaches.get(pseudo);
      if (!cache) {
        cache = /* @__PURE__ */ new Map();
        styleCaches.set(pseudo, cache);
      }
      if (cache.has(el)) return cache.get(el) ?? null;
      let style;
      try {
        style = pseudo ? window.getComputedStyle(el, pseudo) : window.getComputedStyle(el);
      } catch {
        style = null;
      }
      cache.set(el, style);
      return style;
    };
    const valueOn = (style, name) => {
      try {
        return style.getPropertyValue(name).trim();
      } catch {
        return "";
      }
    };
    const rootStyle = readOn(document.documentElement);
    if (rootStyle) {
      for (const name of names) {
        const value = valueOn(rootStyle, name);
        if (value === "") continue;
        resolved[name] = value;
        scopes[name] = { kind: "root", selector: ":root" };
      }
    }
    const pending = new Set(names.filter((n) => !Object.prototype.hasOwnProperty.call(resolved, n)));
    const unresolvedAtRoot = pending.size;
    const declaringSelectors = /* @__PURE__ */ new Map();
    for (const d of declarations) {
      if (!d.active || !d.selector) continue;
      const list = declaringSelectors.get(d.name);
      if (list) list.push(d.selector);
      else declaringSelectors.set(d.name, [d.selector]);
    }
    const safeMatches = (el, selector) => {
      try {
        return el.matches(selector);
      } catch {
        return false;
      }
    };
    const attribute = (el, name, scope) => {
      const selectors = declaringSelectors.get(name);
      if (!selectors || selectors.length === 0) return scope;
      if (selectors.some((s) => safeMatches(el, s))) return scope;
      let ancestor = el.parentElement;
      let hops = 0;
      while (ancestor && hops++ < caps.maxDepth) {
        for (let i = selectors.length - 1; i >= 0; i--) {
          if (safeMatches(ancestor, selectors[i])) {
            return {
              kind: "inherited",
              selector: selectors[i],
              source: selectors[i],
              element: scope.selector
            };
          }
        }
        ancestor = ancestor.parentElement;
      }
      return scope;
    };
    const witness = (name, value, scope) => {
      scoped[name] = { value, scope };
      scopes[name] = scope;
      pending.delete(name);
    };
    const probe = (el, wanted, scopeFor, pseudo = "") => {
      const style = readOn(el, pseudo);
      if (!style) return 0;
      let found = 0;
      for (const name of wanted) {
        if (!pending.has(name)) continue;
        const value = valueOn(style, name);
        if (value === "") continue;
        witness(name, value, scopeFor(name));
        found++;
      }
      return found;
    };
    const preferred = [];
    const seenPreferred = /* @__PURE__ */ new Set();
    const addPreferred = (el, scope) => {
      if (!el || el === document.documentElement || seenPreferred.has(el)) return;
      if (preferred.length >= caps.maxElements) return;
      seenPreferred.add(el);
      preferred.push({ el, scope });
    };
    addPreferred(document.body, { kind: "body", selector: "body" });
    for (const selector of THEME_SCOPE_SELECTORS.concat(options.scopeSelectors ?? [])) {
      try {
        const list = document.querySelectorAll(selector);
        for (let i = 0; i < list.length && preferred.length < caps.maxElements; i++) {
          addPreferred(list[i], { kind: "scoped", selector });
        }
      } catch {
      }
    }
    for (const { el, scope } of preferred) {
      if (pending.size === 0 || outOfTime()) break;
      probe(el, Array.from(pending), (name) => attribute(el, name, scope));
    }
    const groups = /* @__PURE__ */ new Map();
    const nodeIds = /* @__PURE__ */ new Map();
    const idOf = (n) => {
      let id = nodeIds.get(n);
      if (id === void 0) {
        id = nodeIds.size;
        nodeIds.set(n, id);
      }
      return id;
    };
    const candidateNames = /* @__PURE__ */ new Set();
    for (let i = 0; i < declarations.length; i++) {
      const d = declarations[i];
      const site = sites[i];
      if (site.kind === "none") continue;
      if (!d.active || !pending.has(d.name)) continue;
      if (d.value === "" || CSS_WIDE_KEYWORD.test(d.value)) continue;
      candidateNames.add(d.name);
      const key = site.kind === "rule" ? `r${idOf(site.root)}|${site.query === null ? `?${d.selector}` : `q${site.query}`}` : `${site.kind[0]}${idOf(site.element)}|${site.pseudo}`;
      let group = groups.get(key);
      if (!group) {
        group = { selector: site.query ?? d.selector, site, names: /* @__PURE__ */ new Set() };
        groups.set(key, group);
      }
      group.names.add(d.name);
    }
    const unexamined = /* @__PURE__ */ new Map();
    const leaveUnexamined = (names2, kind) => {
      for (const n of names2) if (pending.has(n) && !unexamined.has(n)) unexamined.set(n, kind);
    };
    let useElements = null;
    const hasUseElements = () => {
      if (useElements === null) {
        try {
          useElements = document.querySelector("use") !== null;
        } catch {
          useElements = true;
        }
      }
      return useElements;
    };
    let selectorsQueried = 0;
    let probes = 0;
    let searchStopped = null;
    const stillWanted = (g) => Array.from(g.names).filter((n) => pending.has(n));
    for (const group of groups.values()) {
      let wanted = stillWanted(group);
      if (wanted.length === 0) continue;
      if (searchStopped) {
        leaveUnexamined(wanted, searchStopped);
        continue;
      }
      if (outOfTime()) {
        note("cap_time", `stopped after ${caps.maxMs}ms during resolution`);
        searchStopped = "cap_time";
        leaveUnexamined(wanted, "cap_time");
        continue;
      }
      if (selectorsQueried >= caps.maxScopeSelectors) {
        searchStopped = "cap_scope_search";
        leaveUnexamined(wanted, "cap_scope_search");
        continue;
      }
      selectorsQueried++;
      const { site } = group;
      const shadowScope = site.host ? { kind: "shadow", selector: site.host.tagName.toLowerCase() } : null;
      const scopeOn = (el) => (name) => {
        if (shadowScope) return shadowScope;
        const own = { kind: "scoped", selector: group.selector };
        return site.kind === "rule" ? attribute(el, name, own) : own;
      };
      const sources = [];
      const pseudoParts = [];
      let uninspectable = false;
      if (site.kind !== "rule") {
        if (site.element) sources.push({ els: [site.element], pseudo: site.pseudo });
      } else if (site.query === null) {
        uninspectable = true;
      } else {
        const queryable = [];
        for (const part of splitSelectorList(site.query)) {
          if (!site.host && ROOT_ONLY_PART.test(part)) continue;
          if (site.host && HOST_ONLY_PART.test(part)) {
            sources.push({ els: [site.host], pseudo: "" });
            continue;
          }
          if (SHADOW_ONLY_PART.test(part)) {
            uninspectable = true;
            continue;
          }
          if (PSEUDO_ELEMENT_PART.test(part)) {
            const split = splitPseudoElementPart(part);
            if (!split) {
              uninspectable = true;
              continue;
            }
            pseudoParts.push({ origin: split.origin, pseudo: split.pseudo });
            continue;
          }
          queryable.push(part);
        }
        if (queryable.length > 0) {
          try {
            sources.push({ els: site.root.querySelectorAll(queryable.join(", ")), pseudo: "" });
          } catch {
            for (const part of queryable) {
              try {
                sources.push({ els: site.root.querySelectorAll(part), pseudo: "" });
              } catch {
                uninspectable = true;
              }
            }
          }
        }
        for (const { origin, pseudo } of pseudoParts) {
          try {
            sources.push({ els: site.root.querySelectorAll(origin), pseudo });
          } catch {
            uninspectable = true;
          }
        }
      }
      let misses = 0;
      let stoppedBy = null;
      scan: for (const source of sources) {
        for (let i = 0; i < source.els.length; i++) {
          if (wanted.length === 0) break scan;
          const el = source.els[i];
          if (el === document.documentElement && source.pseudo === "") continue;
          if (probes >= caps.maxScopeProbes) {
            stoppedBy = searchStopped = "cap_scope_search";
            break scan;
          }
          if (misses >= caps.maxProbesPerSelector) {
            stoppedBy = "cap_scope_search";
            break scan;
          }
          if (outOfTime()) {
            note("cap_time", `stopped after ${caps.maxMs}ms during resolution`);
            stoppedBy = searchStopped = "cap_time";
            break scan;
          }
          probes++;
          if (probe(el, wanted, scopeOn(el), source.pseudo) > 0) {
            misses = 0;
            wanted = wanted.filter((n) => pending.has(n));
          } else {
            misses++;
          }
        }
      }
      if (!uninspectable && site.kind === "rule" && site.query !== null && USE_ANCESTRY.test(site.query) && hasUseElements()) {
        uninspectable = true;
      }
      if (wanted.length > 0) {
        if (stoppedBy) leaveUnexamined(wanted, stoppedBy);
        else if (uninspectable) leaveUnexamined(wanted, "scope_uninspectable");
      }
    }
    const gaps = /* @__PURE__ */ new Map();
    for (const [name, kind] of unexamined) {
      if (!pending.has(name)) continue;
      const list = gaps.get(kind);
      if (list) list.push(name);
      else gaps.set(kind, [name]);
    }
    let unexaminedCount = 0;
    for (const [kind, list] of gaps) {
      unexaminedCount += list.length;
      const sample = list.slice(0, 3).join(", ");
      const why = kind === "scope_uninspectable" ? "is declared only where script cannot evaluate it (a vendor pseudo-element, ::slotted/::part, an implicit @scope, an unmodelled at-rule)" : kind === "cap_time" ? `was not searched before the ${caps.maxMs}ms limit` : `was not fully searched (limits: ${caps.maxScopeSelectors} selectors, ${caps.maxScopeProbes} element reads, ${caps.maxProbesPerSelector} consecutive misses per selector)`;
      note(kind, `${list.length} custom ${list.length === 1 ? "property" : "properties"} (${sample}${list.length > 3 ? ", \u2026" : ""}) ${why}`);
    }
    let completeness;
    if (provenanceUnverified || truncated) {
      completeness = "partial";
    } else if (discovered.size === 0 && expected.length > 0) {
      completeness = "expected_only";
    } else {
      completeness = "complete";
    }
    let witnessedCount = 0;
    for (const n of candidateNames) if (!pending.has(n)) witnessedCount++;
    let exhaustedCount = 0;
    for (const n of candidateNames) if (pending.has(n) && !unexamined.has(n)) exhaustedCount++;
    const stats = {
      stylesheets: sheetsSeen,
      rules: rulesSeen,
      declarations: declarations.length,
      names: names.length,
      unresolvedAtRoot,
      candidateNames: candidateNames.size,
      witnessed: witnessedCount,
      exhausted: exhaustedCount,
      unexamined: unexaminedCount,
      selectorsQueried,
      probes,
      inlineElements,
      shadowHosts: shadowHosts.length,
      ms: Date.now() - startedAt
    };
    return { resolved, scoped, scopes, declarations, warnings, completeness, provenanceUnverified, stats };
  }
  function captureCssVariables(expectedNames) {
    return captureCssVariableState({ expectedNames }).resolved;
  }

  // src/snapshot-bundle.ts
  window.__fidel_snapshot = {
    snapshotDOM,
    capturePseudoStateStyles,
    isInteractiveElement,
    captureCssVariables,
    captureCssVariableState,
    recordScrollPositions,
    restoreScrollPositions
  };
})();
