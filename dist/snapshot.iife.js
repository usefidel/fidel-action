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
  function toDomElement(element, viewportWidth, viewportHeight, boundsOrigin) {
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
    return annotateOverlapGroups(elements.map((el) => toDomElement(el, viewportWidth, viewportHeight)).filter((el) => el.visible));
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
  async function capturePseudoStateStyles(element, states) {
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
        htmlEl.focus();
        await new Promise((r) => setTimeout(r, 20));
        const focusStyle = window.getComputedStyle(element);
        diff = diffFromBase(base, focusStyle);
        htmlEl.blur();
      } else if (state === "focus-visible") {
        htmlEl.focus();
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
  function captureCssVariables() {
    const vars = {};
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          for (const propName of Array.from(rule.style)) {
            if (propName.startsWith("--")) {
              vars[propName] = rule.style.getPropertyValue(propName).trim();
            }
          }
        }
      }
    }
    return vars;
  }

  // src/snapshot-bundle.ts
  window.__fidel_snapshot = { snapshotDOM, capturePseudoStateStyles, isInteractiveElement, captureCssVariables };
})();
