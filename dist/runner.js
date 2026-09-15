"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/runner-entry.ts
var import_fs4 = __toESM(require("fs"));

// src/figma-walk.ts
var SVG_NODE_TYPES = /* @__PURE__ */ new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "LINE",
  "STAR",
  "POLYGON",
  "ELLIPSE"
]);
var DECORATIVE_VECTOR_CLUSTER_MIN = 3;
var PASS_THROUGH_BOUNDS_TOLERANCE = 2;
var ANNOTATION_NODE_TYPES = /* @__PURE__ */ new Set([
  "SECTION",
  "STICKY",
  "SHAPE_WITH_TEXT",
  "CONNECTOR",
  "STAMP"
]);
var BOUND_VAR_PROP_MAP = {
  fills: ["color", "backgroundColor"],
  strokes: "borderColor",
  fontSize: "fontSize",
  fontFamily: "fontFamily",
  fontWeight: "fontWeight",
  lineHeight: "lineHeight",
  cornerRadius: "borderRadius",
  topLeftRadius: "borderRadius",
  paddingTop: "paddingTop",
  paddingBottom: "paddingBottom",
  paddingLeft: "paddingLeft",
  paddingRight: "paddingRight",
  itemSpacing: "spacingY",
  counterAxisSpacing: "counterAxisSpacing"
};
var VARIANT_STATE_MAP = {
  hover: "hover",
  hovered: "hover",
  focus: "focus",
  focused: "focus",
  "focus-visible": "focus",
  disabled: "disabled",
  active: "active",
  pressed: "pressed",
  default: "default",
  rest: "default",
  normal: "default",
  idle: "default"
};
var STATE_PROPERTY_KEYS = ["state", "variant", "status", "interaction", "mode"];
var MOCK_PATTERNS = [
  /^lorem\s+ipsum/i,
  /^placeholder$/i,
  /^label$/i,
  /^text$/i,
  /^title$/i,
  /^heading$/i,
  /^cta$/i,
  /^button\s*text$/i,
  /^description$/i,
  /^subtitle$/i,
  /^body\s*text$/i,
  /^caption$/i,
  /^link$/i,
  /^menu\s*item$/i,
  /^your\s*text/i,
  /^sample/i,
  /^type\s+here/i,
  /^enter\s+/i,
  /^click\s+here$/i,
  /^read\s+more$/i,
  /^learn\s+more$/i,
  /^item\s*\d*$/i,
  /^option\s*\d*$/i,
  /^tab\s*\d*$/i
];
function isMockText(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (MOCK_PATTERNS.some((p) => p.test(trimmed))) return true;
  if (/lorem\s+ipsum/i.test(trimmed)) return true;
  return false;
}
function isGibberishText(text) {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length < 2 || trimmed.length > 12) return false;
  if (/^(asdf|fdsa|qwer|qwerty|zxcv|test|dummy|temp)\w*$/.test(trimmed)) return true;
  if (/^[a-z]{2,10}$/.test(trimmed)) {
    const consonants = trimmed.replace(/[aeiou]/g, "").length;
    const ratio = consonants / trimmed.length;
    if (ratio > 0.7 && /[bcdfghjklmnpqrstvwxyz]{3,}/.test(trimmed)) return true;
  }
  return false;
}
var DESCRIPTION_PATTERNS = [
  /\bmockup\b/i,
  /\bprototype\b/i,
  /\bwireframe\b/i,
  /\bshowcas/i,
  /\brecreate\b/i,
  /\bwebsite\s+design\b/i,
  /\bdesign\s+spec\b/i,
  /\binterface\s+mockup\b/i,
  /\bshowing\s+\w+\s+\w+/i
];
var GENERIC_FIGMA_NAMES = /* @__PURE__ */ new Set([
  "button",
  "heading",
  "heading 1",
  "heading 2",
  "heading 3",
  "heading 4",
  "heading 5",
  "heading 6",
  "paragraph",
  "link",
  "label",
  "input",
  "text",
  "title",
  "subtitle",
  "description",
  "image",
  "icon",
  "divider",
  "spacer",
  "card",
  "modal",
  "dropdown",
  "checkbox",
  "radio",
  "toggle",
  "switch",
  "avatar",
  "badge",
  "tooltip",
  "tab",
  "menu item"
]);
function isDescriptionText(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();
  if (GENERIC_FIGMA_NAMES.has(lower)) return true;
  if (DESCRIPTION_PATTERNS.some((p) => p.test(trimmed))) return true;
  return false;
}
function colorFromRgba(color) {
  if (!color) return void 0;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a;
  if (a !== void 0 && a < 1) return `rgba(${r}, ${g}, ${b}, ${a})`;
  return `rgb(${r}, ${g}, ${b})`;
}
function safeBackgroundColor(bgColor) {
  if (!bgColor) return void 0;
  if (bgColor.r === 0 && bgColor.g === 0 && bgColor.b === 0 && (bgColor.a === void 0 || bgColor.a === 0)) {
    return void 0;
  }
  return colorFromRgba(bgColor);
}
function colorFromPaint(paint) {
  if (!paint) return void 0;
  if (paint.type === "SOLID" && paint.color) return colorFromRgba(paint.color);
  if (paint.type?.startsWith("GRADIENT_") && paint.gradientStops && paint.gradientStops.length > 0) {
    for (const stop of paint.gradientStops) {
      if (stop.color && (stop.color.a === void 0 || stop.color.a > 0.1)) {
        return colorFromRgba(stop.color);
      }
    }
    return colorFromRgba(paint.gradientStops[0].color);
  }
  return void 0;
}
function isNearWhiteOrBlack(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (!match) return false;
  const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return r > 240 && g > 240 && b > 240 || r < 15 && g < 15 && b < 15;
}
function extractColorFromChildren(node, depth = 0) {
  if (!node.children || node.children.length === 0 || depth > 20) {
    return { color: void 0, hasImageFill: false };
  }
  const bgFallback = [];
  let hasImageFill = false;
  for (const child of node.children) {
    if (!child.fills || child.fills.length === 0) continue;
    for (const fill of child.fills) {
      if (fill.visible === false || fill.opacity !== void 0 && fill.opacity < 0.1) continue;
      if (fill.type === "IMAGE") {
        hasImageFill = true;
        continue;
      }
      const color = colorFromPaint(fill);
      if (!color) continue;
      if (isNearWhiteOrBlack(color)) bgFallback.push(color);
      else return { color, hasImageFill };
    }
  }
  for (const child of node.children) {
    if (!child.strokes || child.strokes.length === 0) continue;
    for (const stroke of child.strokes) {
      const color = colorFromPaint(stroke);
      if (color && !isNearWhiteOrBlack(color)) return { color, hasImageFill };
    }
  }
  for (const child of node.children) {
    const nested = extractColorFromChildren(child, depth + 1);
    if (nested.hasImageFill) hasImageFill = true;
    if (nested.color) return { color: nested.color, hasImageFill };
  }
  if (bgFallback.length > 0) return { color: bgFallback[0], hasImageFill };
  return { color: void 0, hasImageFill };
}
function mapLayoutModeToDisplay(layoutMode) {
  if (layoutMode === "HORIZONTAL" || layoutMode === "VERTICAL") return "flex";
  if (layoutMode === "GRID") return "grid";
  return void 0;
}
function mapPrimaryAxisAlign(value) {
  const map = {
    MIN: "flex-start",
    CENTER: "center",
    MAX: "flex-end",
    SPACE_BETWEEN: "space-between"
  };
  const result = value ? map[value] : void 0;
  return result === "flex-start" ? void 0 : result;
}
function mapCounterAxisAlign(value) {
  const map = {
    MIN: "flex-start",
    CENTER: "center",
    MAX: "flex-end",
    BASELINE: "baseline"
  };
  const result = value ? map[value] : void 0;
  if (!result || result === "flex-start") return void 0;
  return result;
}
function mapCounterAxisAlignContent(value) {
  if (value === "SPACE_BETWEEN") return "space-between";
  return void 0;
}
function parseVariantState(node) {
  if (node.componentProperties) {
    for (const [key, prop] of Object.entries(node.componentProperties)) {
      const lowerKey = key.toLowerCase();
      if (STATE_PROPERTY_KEYS.some((k) => lowerKey.includes(k))) {
        const normalized = VARIANT_STATE_MAP[String(prop.value).toLowerCase()];
        if (normalized) return normalized;
      }
    }
  }
  const name = node.name || "";
  const slashIdx = name.lastIndexOf("/");
  if (slashIdx !== -1) {
    const suffix = name.slice(slashIdx + 1).trim().toLowerCase();
    const eqIdx = suffix.indexOf("=");
    const candidate = eqIdx !== -1 ? suffix.slice(eqIdx + 1).split(",")[0].trim() : suffix;
    const normalized = VARIANT_STATE_MAP[candidate];
    if (normalized) return normalized;
  }
  return void 0;
}
function extractBaseComponentName(name) {
  if (!name) return void 0;
  const slashIdx = name.indexOf("/");
  if (slashIdx === -1) return void 0;
  return name.slice(0, slashIdx).trim() || void 0;
}
function extractTokenBindings(boundVars, varMap) {
  if (!boundVars || !varMap) return void 0;
  const bindings = {};
  for (const [figmaProp, binding] of Object.entries(boundVars)) {
    const specProps = BOUND_VAR_PROP_MAP[figmaProp];
    if (!specProps) continue;
    const firstBinding = Array.isArray(binding) ? binding[0] : binding;
    if (!firstBinding?.id) continue;
    const variable = varMap.get(firstBinding.id);
    if (!variable) continue;
    const tokenBinding = {
      variableId: firstBinding.id,
      variableName: variable.name,
      collectionName: variable.collectionName
    };
    const props = Array.isArray(specProps) ? specProps : [specProps];
    for (const prop of props) {
      bindings[prop] = tokenBinding;
    }
  }
  return Object.keys(bindings).length > 0 ? bindings : void 0;
}
function isDecorativeShapeCluster(node, parent) {
  try {
    if (!parent || !parent.children) return false;
    if (!SVG_NODE_TYPES.has(node.type)) return false;
    if (Array.isArray(node.exportSettings) && node.exportSettings.length > 0) return false;
    let svgSiblings = 0;
    for (const child of parent.children) {
      if (!child) continue;
      if (Array.isArray(child.exportSettings) && child.exportSettings.length > 0) {
        return false;
      }
      if (SVG_NODE_TYPES.has(child.type)) svgSiblings++;
    }
    return svgSiblings >= DECORATIVE_VECTOR_CLUSTER_MIN;
  } catch {
    return false;
  }
}
function isPassThroughWrapper(node, parent) {
  try {
    if (node.type !== "GROUP") return false;
    if (!parent || !parent.absoluteBoundingBox || !node.absoluteBoundingBox) return false;
    if (Array.isArray(node.exportSettings) && node.exportSettings.length > 0) return false;
    const hasLayout = !!(node.layoutMode && node.layoutMode !== "NONE" || [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].some((v) => typeof v === "number" && v > 0) || typeof node.itemSpacing === "number" && node.itemSpacing > 0);
    if (hasLayout) return false;
    const hasFill = Array.isArray(node.fills) && node.fills.some(
      (f) => f && f.visible !== false && (typeof f.opacity !== "number" || f.opacity >= 0.1)
    );
    if (hasFill) return false;
    const hasStroke = Array.isArray(node.strokes) && node.strokes.some(
      (s) => s && s.visible !== false && (typeof s.opacity !== "number" || s.opacity >= 0.1)
    );
    if (hasStroke) return false;
    const nb = node.absoluteBoundingBox;
    const pb = parent.absoluteBoundingBox;
    const dx = Math.abs(nb.x - pb.x);
    const dy = Math.abs(nb.y - pb.y);
    const dw = Math.abs(nb.width - pb.width);
    const dh = Math.abs(nb.height - pb.height);
    return dx <= PASS_THROUGH_BOUNDS_TOLERANCE && dy <= PASS_THROUGH_BOUNDS_TOLERANCE && dw <= PASS_THROUGH_BOUNDS_TOLERANCE && dh <= PASS_THROUGH_BOUNDS_TOLERANCE;
  } catch {
    return false;
  }
}
function walkNode(node, specs, parentNames = [], rootBounds, varMap, parentNodeId, depth = 0, childIndex = 0, opts) {
  if (node.visible === false) return;
  if (ANNOTATION_NODE_TYPES.has(node.type)) return;
  const inComponentInstance = !!opts?.inComponentInstance;
  const parent = opts?.parent ?? null;
  if (!inComponentInstance) {
    try {
      if (isDecorativeShapeCluster(node, parent)) {
        if (opts?.pruneStats) opts.pruneStats.clusters++;
        return;
      }
      if (isPassThroughWrapper(node, parent)) {
        if (opts?.pruneStats) opts.pruneStats.wrappers++;
        if (node.children && node.children.length > 0) {
          node.children.forEach((child, index) => walkNode(
            child,
            specs,
            parentNames,
            rootBounds,
            varMap,
            parentNodeId,
            // GRANDPARENT id, not node.id
            depth,
            // keep same depth (we collapsed this level)
            index,
            { ...opts, parent }
            // grandparent stays the parent
          ));
        }
        return;
      }
    } catch {
      if (opts?.pruneStats) opts.pruneStats.errors++;
    }
  }
  const name = node.name || "Unnamed";
  const clampRadius = (v) => Math.min(v, 9999);
  let borderRadius;
  if (node.cornerRadius !== void 0 && node.cornerRadius > 0) {
    borderRadius = `${clampRadius(node.cornerRadius)}px`;
  } else if (node.rectangleCornerRadii && node.rectangleCornerRadii[0] > 0) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii.map(clampRadius);
    borderRadius = tl === tr && tr === br && br === bl ? `${tl}px` : `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  let boundingBox;
  let relativePosition;
  if (node.absoluteBoundingBox) {
    const box = node.absoluteBoundingBox;
    boundingBox = { x: box.x, y: box.y, width: box.width, height: box.height };
    if (rootBounds && rootBounds.width > 0 && rootBounds.height > 0) {
      const centerX = box.x + box.width / 2 - rootBounds.x;
      const centerY = box.y + box.height / 2 - rootBounds.y;
      relativePosition = {
        xPercent: centerX / rootBounds.width,
        yPercent: centerY / rootBounds.height
      };
    }
  }
  let primaryColor;
  let fallbackBgColor;
  let hasImageFill = false;
  let hasGradientFill = false;
  for (const fill of node.fills || []) {
    if (fill.visible === false || fill.opacity !== void 0 && fill.opacity < 0.1) continue;
    if (fill.type === "IMAGE") {
      hasImageFill = true;
      continue;
    }
    if (fill.type?.startsWith("GRADIENT_")) hasGradientFill = true;
    const color = colorFromPaint(fill);
    if (!color) continue;
    if (isNearWhiteOrBlack(color)) {
      if (!fallbackBgColor) fallbackBgColor = color;
    } else {
      primaryColor = color;
      break;
    }
  }
  if (!primaryColor && fallbackBgColor) primaryColor = fallbackBgColor;
  if (!primaryColor && node.children && node.children.length > 0 && ["GROUP", "FRAME", "COMPONENT", "INSTANCE"].includes(node.type)) {
    const childColor = extractColorFromChildren(node);
    primaryColor = childColor.color;
    hasImageFill = hasImageFill || childColor.hasImageFill;
  }
  const isSvgShape = SVG_NODE_TYPES.has(node.type);
  const lowerName = name.toLowerCase();
  let strokeColor;
  for (const stroke of node.strokes || []) {
    if (stroke.visible === false || stroke.opacity !== void 0 && stroke.opacity < 0.1) continue;
    const color = colorFromPaint(stroke);
    if (color) {
      strokeColor = color;
      if (isSvgShape && (!primaryColor || isNearWhiteOrBlack(primaryColor))) primaryColor = color;
      break;
    }
  }
  const elementType = isSvgShape ? lowerName.includes("icon") ? "icon" : "shape" : void 0;
  const hasExplicitPadding = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].some((value) => typeof value === "number" && value > 0);
  const hasExplicitGap = typeof node.itemSpacing === "number" && node.itemSpacing > 0;
  const isLayoutContainer = !!(node.layoutMode && node.layoutMode !== "NONE" || hasExplicitPadding || hasExplicitGap);
  const spec = {
    nodeId: node.id,
    name,
    childCount: node.children?.length || 0,
    text: node.characters,
    fontFamily: node.style?.fontFamily,
    fontSize: node.style?.fontSize ? `${node.style.fontSize}px` : void 0,
    fontWeight: node.style?.fontWeight ? String(node.style.fontWeight) : void 0,
    // INTRINSIC_% is Figma's sentinel for "auto" line height — not a real value.
    lineHeight: node.style?.lineHeightPx && node.style?.lineHeightUnit !== "INTRINSIC_%" ? `${node.style.lineHeightPx}px` : void 0,
    // TEXT nodes: fills = foreground/text color. Containers: fills = background fill.
    color: node.type === "TEXT" ? primaryColor : void 0,
    colorFromGradient: hasGradientFill || void 0,
    colorFromImage: hasImageFill || void 0,
    borderColor: strokeColor,
    backgroundColor: node.type === "TEXT" ? void 0 : primaryColor || safeBackgroundColor(node.backgroundColor),
    borderRadius,
    paddingTop: node.paddingTop !== void 0 ? `${node.paddingTop}px` : void 0,
    paddingBottom: node.paddingBottom !== void 0 ? `${node.paddingBottom}px` : void 0,
    paddingLeft: node.paddingLeft !== void 0 ? `${node.paddingLeft}px` : void 0,
    paddingRight: node.paddingRight !== void 0 ? `${node.paddingRight}px` : void 0,
    paddingY: node.paddingTop !== void 0 && node.paddingBottom !== void 0 ? `${(node.paddingTop + node.paddingBottom) / 2}px` : void 0,
    spacingY: node.itemSpacing !== void 0 ? `${node.itemSpacing}px` : void 0,
    counterAxisSpacing: node.counterAxisSpacing !== void 0 ? `${node.counterAxisSpacing}px` : void 0,
    width: node.absoluteBoundingBox?.width,
    height: node.absoluteBoundingBox?.height,
    boundingBox,
    relativePosition,
    elementType,
    nodeType: node.type,
    exportSettings: node.exportSettings,
    section: parentNames.length > 0 ? parentNames.join(" > ") : void 0,
    parentNodeId,
    layoutDepth: depth,
    childIndex,
    isLayoutContainer: isLayoutContainer || void 0,
    layoutScope: void 0,
    // classifyFigmaLayoutScope is extension-only
    // Layout properties (auto-layout frames only)
    ...node.layoutMode && node.layoutMode !== "NONE" ? {
      display: mapLayoutModeToDisplay(node.layoutMode),
      flexDirection: node.layoutMode === "VERTICAL" ? "column" : "row",
      justifyContent: mapPrimaryAxisAlign(node.primaryAxisAlignItems),
      alignItems: mapCounterAxisAlign(node.counterAxisAlignItems),
      alignContent: mapCounterAxisAlignContent(node.counterAxisAlignContent),
      flexWrap: node.layoutWrap === "WRAP" ? "wrap" : void 0,
      overflow: node.clipsContent === true ? "hidden" : void 0
    } : {},
    // Layout sizing behavior (Fill Container / Hug Contents / Fixed)
    layoutSizingHorizontal: node.layoutSizingHorizontal,
    layoutSizingVertical: node.layoutSizingVertical,
    // Constrained dimensions (only when explicitly set)
    minWidth: node.minWidth != null && node.minWidth > 0 ? `${node.minWidth}px` : void 0,
    maxWidth: node.maxWidth != null && node.maxWidth > 0 ? `${node.maxWidth}px` : void 0,
    minHeight: node.minHeight != null && node.minHeight > 0 ? `${node.minHeight}px` : void 0,
    maxHeight: node.maxHeight != null && node.maxHeight > 0 ? `${node.maxHeight}px` : void 0,
    // Design token bindings (from Figma Variables API)
    tokenBindings: extractTokenBindings(node.boundVariables, varMap || null),
    // Component variant metadata
    variantState: parseVariantState(node),
    variantProperties: node.componentProperties ? Object.fromEntries(
      Object.entries(node.componentProperties).map(([k, v]) => [k, String(v.value)])
    ) : void 0,
    componentSetId: node.componentSetId,
    baseComponentName: extractBaseComponentName(node.name)
  };
  const hasNonZeroPadding = [spec.paddingTop, spec.paddingBottom, spec.paddingLeft, spec.paddingRight].some((p) => p && parseFloat(p) > 0);
  const hasNonZeroGap = spec.spacingY && parseFloat(spec.spacingY) > 0;
  const hasLayoutSignals = !!(spec.display && (hasNonZeroPadding || hasNonZeroGap));
  const hasContent = !!spec.text || !!spec.fontFamily || !!spec.color || !!spec.backgroundColor || !!spec.borderColor || !!spec.borderRadius || isSvgShape || hasLayoutSignals;
  if (hasContent) {
    const textContent = spec.text?.trim() || "";
    const hasTypographySignals = !!(spec.fontSize || spec.fontWeight || spec.fontFamily);
    if (textContent) {
      if (isDescriptionText(textContent)) {
      } else if (isMockText(textContent) && !hasTypographySignals) {
      } else if (isGibberishText(textContent) && !hasTypographySignals) {
      } else {
        specs.push(spec);
      }
    } else {
      specs.push(spec);
    }
  }
  if (node.children && node.children.length > 0) {
    const nextParents = [...parentNames, name];
    const enteringInstance = node.type === "INSTANCE" || node.type === "COMPONENT" || node.type === "COMPONENT_SET";
    const childOpts = {
      ...opts,
      parent: node,
      inComponentInstance: inComponentInstance || enteringInstance
    };
    node.children.forEach((child, index) => walkNode(
      child,
      specs,
      nextParents,
      rootBounds,
      varMap,
      node.id,
      depth + 1,
      index,
      childOpts
    ));
  }
}

// src/figma.ts
function figmaAuthHeaders(token) {
  return { "Authorization": `Bearer ${token}` };
}
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var isValidFileKey = (value) => /^[A-Za-z0-9_-]{15,200}$/.test(value);
var isValidNodeId = (value) => /^\d+:\d+$/.test(value);
async function fetchFigmaVariables(fileKey, figmaToken) {
  try {
    const endpoint = `https://api.figma.com/v1/files/${fileKey}/variables/local`;
    const headers = figmaAuthHeaders(figmaToken);
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      console.log(`[fidel-ci] Variables API returned ${response.status} \u2014 skipping token resolution`);
      return null;
    }
    const payload = await response.json();
    if (!payload.meta?.variables) return null;
    const collections = payload.meta.variableCollections;
    const varMap = /* @__PURE__ */ new Map();
    for (const [id, v] of Object.entries(payload.meta.variables)) {
      const collection = collections[v.variableCollectionId];
      varMap.set(id, {
        id,
        name: v.name,
        resolvedType: v.resolvedType,
        collectionName: collection?.name || "Unknown",
        valuesByMode: {}
      });
    }
    console.log(`[fidel-ci] Loaded ${varMap.size} Figma variables from ${Object.keys(collections).length} collections`);
    return varMap;
  } catch (err) {
    console.log("[fidel-ci] Variables API fetch failed:", err);
    return null;
  }
}
function parseFigmaUrl(figmaUrl) {
  if (!isNonEmptyString(figmaUrl)) return null;
  try {
    const url = new URL(figmaUrl);
    const parts = url.pathname.split("/");
    const idx = parts.findIndex((part) => part === "file" || part === "design");
    if (idx === -1 || idx + 1 >= parts.length) return null;
    const fileKey = parts[idx + 1];
    const nodeParam = url.searchParams.get("node-id");
    if (!fileKey || !nodeParam) return null;
    if (!isValidFileKey(fileKey)) return null;
    const nodeId = nodeParam.replace(/-/g, ":");
    if (!isValidNodeId(nodeId)) return null;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}
async function getFigmaSpecsWithBounds(fileKey, nodeId, figmaToken) {
  const endpoint = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const headers = figmaAuthHeaders(figmaToken);
  const [response, varMap] = await Promise.all([
    fetch(endpoint, { headers }),
    fetchFigmaVariables(fileKey, figmaToken)
  ]);
  if (!response.ok) {
    if (response.status === 429) throw new Error("Figma rate limit: Too many requests. Please wait 1-2 minutes.");
    if (response.status === 403) throw new Error("Token does not have access to this file. Verify FIDEL_FIGMA_TOKEN has view access.");
    if (response.status === 404) throw new Error("Figma file not found \u2014 check that the URL is correct.");
    throw new Error(`Figma API error: ${response.status}`);
  }
  const payload = await response.json();
  const firstNode = payload.nodes ? Object.values(payload.nodes)[0] : void 0;
  const root = firstNode?.document;
  if (!root) throw new Error("Figma response did not include the requested node.");
  const frameBounds = root.absoluteBoundingBox || { x: 0, y: 0, width: 1440, height: 900 };
  const specs = [];
  walkNode(root, specs, [], root.absoluteBoundingBox, varMap);
  return { specs, frameBounds };
}
async function getFigmaSpecs(fileKey, nodeId, figmaToken) {
  const result = await getFigmaSpecsWithBounds(fileKey, nodeId, figmaToken);
  return result.specs;
}

// src/run-errors.ts
var ERROR_CODE_META = {
  TARGET_AUTH_WALL: {
    retryable: false,
    userMessage: "This page is behind a login or password. Fidel can't validate protected pages yet - try a public preview URL.",
    shortLabel: "Login required"
  },
  TARGET_UNREACHABLE: {
    retryable: false,
    userMessage: "We couldn't reach that page. Check the URL is correct and publicly reachable from the internet.",
    shortLabel: "Page unreachable"
  },
  TARGET_TIMEOUT: {
    retryable: true,
    userMessage: "The page took too long to load. Try again, or try a lighter version of the page.",
    shortLabel: "Page timed out"
  },
  TARGET_CSP_BLOCKED: {
    retryable: false,
    userMessage: "The page blocked our request. It may have bot protection or strict security rules.",
    shortLabel: "Request blocked"
  },
  FIGMA_ACCESS_DENIED: {
    retryable: false,
    userMessage: "Figma file not accessible. Make sure you have View or Edit access and the file is not restricted.",
    shortLabel: "Figma access denied"
  },
  FIGMA_TOKEN_EXPIRED: {
    retryable: false,
    userMessage: "Your Figma session has expired. Sign out and sign back in to reconnect Figma.",
    shortLabel: "Figma session expired"
  },
  FIGMA_NOT_FOUND: {
    retryable: false,
    userMessage: "Figma file not found. Check the URL \u2014 the file may have been deleted or moved.",
    shortLabel: "Figma file not found"
  },
  FIGMA_RATE_LIMITED: {
    retryable: true,
    userMessage: "Figma rate limit hit. Wait 1\u20132 minutes, then try again.",
    shortLabel: "Figma rate limit"
  },
  PIPELINE_TIMEOUT: {
    retryable: true,
    userMessage: "Validation took too long to respond. Try again in a moment.",
    shortLabel: "Validation timed out"
  },
  PIPELINE_ERROR: {
    retryable: true,
    userMessage: "Validation failed. Try again \u2014 if it keeps failing, contact support.",
    shortLabel: "Validation failed"
  },
  ZERO_ELEMENTS_MATCHED: {
    retryable: false,
    userMessage: "No page elements were found during capture. Make sure the page loads correctly and is not blank.",
    shortLabel: "No elements found"
  },
  PERSIST_FAILED: {
    retryable: true,
    userMessage: "The results were generated but could not be saved. Try again in a moment.",
    shortLabel: "Save failed"
  },
  SESSION_EXPIRED: {
    retryable: false,
    userMessage: "This site's saved session has expired. Reconnect it to validate again.",
    shortLabel: "Session expired"
  },
  CAPABILITY_UNAVAILABLE: {
    retryable: false,
    userMessage: "Validating sites that need a saved sign-in isn't available right now. This one's on us \u2014 contact support and we'll get it working.",
    shortLabel: "Capability unavailable"
  },
  PROVIDER_REQUEST_REJECTED: {
    retryable: false,
    userMessage: "This validation couldn't be completed. Trying again won't change the result \u2014 contact support if you need it looked at.",
    shortLabel: "Validation rejected"
  },
  INVALID_REFERENCE_URL: {
    retryable: false,
    userMessage: "The reference URL is invalid. It must start with https:// and point to a real page.",
    shortLabel: "Invalid reference URL"
  },
  INVALID_TARGET_URL: {
    retryable: false,
    userMessage: "The target URL is invalid. It must start with https:// and point to a real page.",
    shortLabel: "Invalid target URL"
  },
  DESIGN_SYSTEM_NOT_AVAILABLE: {
    retryable: false,
    userMessage: "Design system unavailable. Connect a repo with a parsed theme to use this validation mode.",
    shortLabel: "Design system unavailable"
  },
  DESIGN_SYSTEM_CONTEXT_NOT_AVAILABLE: {
    retryable: false,
    userMessage: "Design system unavailable. The selected brand context is not available. Choose another or reconnect it in Settings.",
    shortLabel: "Brand context unavailable"
  },
  DESIGN_SYSTEM_INCOMPATIBLE: {
    retryable: false,
    userMessage: "This design system can't be checked yet. We support Tailwind + shadcn today and are adding more \u2014 reconnect a supported design system, or check back soon.",
    shortLabel: "Design system not supported yet"
  },
  FLOW_STEP_FAILED: {
    retryable: false,
    userMessage: "A flow validation step failed. Check that all prototype transitions in the Figma file point to valid frames.",
    shortLabel: "Flow step failed"
  },
  UNKNOWN_ERROR: {
    retryable: true,
    userMessage: "Something went wrong during validation. Try again \u2014 if it keeps failing, contact support.",
    shortLabel: "Unknown error"
  }
};

// src/api-base.ts
var SUPABASE_URL = "https://ddufcgkwjcdseggjaiil.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_JCHgvBld-swO93653cDH9A_urU0alOo";

// src/pipeline.ts
var DEFAULT_TIMEOUT_MS = 9e4;
var WARNING_PAYLOAD_BYTES = 2 * 1024 * 1024;
async function runPipeline(figmaSpecs, domElements, pipelineUrl, authToken, textMode = "styling-only", authMode = "pipeline-secret", options = {}) {
  const bodyPayload = { figmaSpecs, domElements, textMode };
  if (options.figmaUrl) bodyPayload.figmaUrl = options.figmaUrl;
  if (options.liveUrl) bodyPayload.liveUrl = options.liveUrl;
  if (options.idempotencyKey) bodyPayload.idempotencyKey = options.idempotencyKey;
  const body = JSON.stringify(bodyPayload);
  const bodySize = Buffer.byteLength(body);
  if (bodySize > WARNING_PAYLOAD_BYTES) {
    console.log(
      `[fidel-ci] Warning: payload is ${(bodySize / 1024 / 1024).toFixed(1)}MB; consider narrowing the snapshot scope`
    );
  }
  const headers = {
    "Content-Type": "application/json"
  };
  if (authMode === "pipeline-secret") {
    headers["X-Pipeline-Secret"] = authToken;
  } else {
    headers.Authorization = `Bearer ${authToken}`;
    headers.apikey = SUPABASE_ANON_KEY;
  }
  const response = await fetch(pipelineUrl, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  });
  const responseText = await response.text();
  const parsed = safeJsonParse(responseText);
  if (!response.ok) {
    const errorMessage = (extractErrorMessage(parsed) ?? responseText.trim()) || `HTTP ${response.status}`;
    console.error(`[fidel-ci] Pipeline error (${response.status}):`, errorMessage.slice(0, 500));
    const errorCode = extractErrorCode(parsed);
    if (errorCode) {
      const meta = ERROR_CODE_META[errorCode];
      if (meta) {
        const err = new Error(meta.userMessage);
        err.pipelineErrorPayload = { errorCode, isRetryable: meta.retryable, userMessage: meta.userMessage };
        throw err;
      }
    }
    if (response.status === 401) {
      throw new Error(
        "Pipeline authentication failed.\nIf running locally, your session may have expired \u2014 run `npx usefidel login` to re-authenticate.\nIf running in CI, make sure the repo is linked: run `npx usefidel link` from this repository."
      );
    }
    if (response.status === 429) {
      throw new Error("Pipeline rate limit exceeded. Please wait before retrying.");
    }
    throw new Error(`Pipeline returned an error (HTTP ${response.status}). Check the CI logs for details.`);
  }
  if (!isPipelineResult(parsed)) {
    throw new Error("Pipeline returned an unexpected response shape");
  }
  return parsed;
}
function safeJsonParse(value) {
  if (value.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function extractErrorMessage(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value;
  if (typeof record.error === "string" && record.error.trim() !== "") {
    return record.error;
  }
  if (typeof record.detail === "string" && record.detail.trim() !== "") {
    return record.detail;
  }
  return null;
}
function extractErrorCode(value) {
  if (!value || typeof value !== "object") return null;
  const record = value;
  if (typeof record.errorCode === "string" && record.errorCode.trim() !== "") {
    return record.errorCode;
  }
  return null;
}
function isPipelineResult(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value;
  const meta = record.meta;
  return typeof record.ok === "boolean" && Array.isArray(record.diffs) && typeof record.score === "number" && typeof record.totalDiffs === "number" && !!meta && typeof meta === "object" && typeof meta.pipelineMs === "number";
}
function fnv1a32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
async function saveRunToSupabaseAsRunner(figmaUrl, liveUrl, pipeline, supabaseToken, elapsedMs) {
  return saveRunToSupabaseWithOptions({
    figmaUrl,
    liveUrl,
    pipeline,
    supabaseToken,
    elapsedMs,
    source: "github-runner"
  });
}
async function saveRunToSupabaseWithOptions(opts) {
  const { figmaUrl, liveUrl, supabaseToken, elapsedMs, errorPayload, errorMessage } = opts;
  const pipeline = opts.pipeline;
  const figmaFileKey = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)?.[1] ?? "";
  const nodeId = new URL(figmaUrl).searchParams.get("node-id") ?? "";
  const normalizedLiveUrl = liveUrl.replace(/[?&](?:utm_\w+|fbclid|gclid|ref)=[^&]*/g, "").replace(/\/+$/, "");
  const caseIdRaw = `${figmaFileKey}:${nodeId}:${normalizedLiveUrl}`;
  let hostname = "";
  try {
    hostname = new URL(normalizedLiveUrl).hostname.replace(/^www\./, "");
  } catch {
  }
  const caseId = `${hostname}_${fnv1a32(caseIdRaw)}`;
  const isError = !!errorPayload;
  const diffPayload = (pipeline?.diffs ?? []).map((d, idx) => ({
    diffIndex: idx,
    displayName: d.displayName || d.name || "Unknown element",
    category: d.category || "style",
    severity: d.severity || "medium",
    matchConfidence: d.matchConfidence ?? null,
    variantState: d.variantState ?? null,
    figmaNodeId: d.figma?.nodeId ?? null,
    domSelector: d.dom?.selector ?? null,
    displaySelector: d.dom?.displaySelector ?? null,
    properties: (d.properties || []).map((p) => ({
      name: p.name,
      expected: p.expected,
      actual: p.actual,
      delta: p.delta
    })),
    tokenBindings: d.tokenBindings ?? null
  }));
  const body = {
    figmaUrl,
    liveUrl,
    caseId,
    fidelityScore: pipeline?.score ?? 0,
    timingMs: elapsedMs,
    diffs: diffPayload,
    source: opts.source ?? "github-action",
    status: isError ? "error" : "complete"
  };
  if (isError && errorPayload) {
    body.errorCode = errorPayload.errorCode;
    body.isRetryable = errorPayload.isRetryable;
    body.errorMessage = errorMessage ?? errorPayload.userMessage;
  }
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/save-run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseToken}`,
      apikey: SUPABASE_ANON_KEY
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15e3)
  });
  if (resp.ok) {
    console.log(`[fidel-ci] Run saved to Supabase (status: ${isError ? "error" : "complete"})`);
  } else {
    const respBody = await resp.text().catch(() => "");
    console.error(`[fidel-ci] Failed to save run (non-fatal): HTTP ${resp.status}`, respBody.slice(0, 200));
  }
}

// src/snapshot.ts
var import_playwright = require("playwright");
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));

// src/synthesize-icon-nodes.ts
var MIN_ICON_AREA = 144;
var PRE_SORT_HARD_CAP = 2e3;
var POST_FILTER_CAP = 100;
async function harvestIconCandidates(page) {
  return await page.evaluate(({ minArea, hardCap }) => {
    const all = Array.from(document.querySelectorAll("svg, img"));
    const total = all.length;
    const truncated = all.slice(0, hardCap);
    const droppedByPreSortCap = total - truncated.length;
    const TEXT_FLOW_TAGS = /* @__PURE__ */ new Set([
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "LI",
      "BLOCKQUOTE",
      "FIGCAPTION"
    ]);
    const isInsideTextFlow = (el) => {
      let cur = el.parentElement;
      while (cur) {
        if (TEXT_FLOW_TAGS.has(cur.tagName)) {
          const text = (cur.textContent || "").trim();
          if (text.length > 0) return true;
        }
        cur = cur.parentElement;
      }
      return false;
    };
    let droppedBySize = 0;
    let droppedByText = 0;
    const out = [];
    truncated.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const pageX = rect.left + window.scrollX;
      const pageY = rect.top + window.scrollY;
      if (rect.width * rect.height < minArea) {
        droppedBySize++;
        return;
      }
      if (isInsideTextFlow(el)) {
        droppedByText++;
        return;
      }
      const name = el.getAttribute("aria-label") || el.alt || el.getAttribute("title") || "";
      out.push({
        index: i,
        tagName: el.tagName.toUpperCase(),
        bounds: {
          x: pageX,
          y: pageY,
          width: rect.width,
          height: rect.height
        },
        name,
        parentBackendDOMNodeIds: []
        // caller resolves
      });
    });
    return {
      candidates: out,
      stats: {
        totalCandidates: total,
        droppedByPreSortCap,
        droppedBySize,
        droppedByText
      }
    };
  }, { minArea: MIN_ICON_AREA, hardCap: PRE_SORT_HARD_CAP });
}
function emitSyntheticNodes(candidates, existingAXBackendIds, axNodeByBackendId, rootAxNodeId) {
  const dedup = [];
  let droppedByDuplicate = 0;
  for (const c of candidates) {
    if (existingAXBackendIds.has(c.ownBackendDOMNodeId)) {
      droppedByDuplicate++;
      continue;
    }
    dedup.push(c);
  }
  let kept = dedup;
  let droppedByPostFilterCap = 0;
  if (dedup.length > POST_FILTER_CAP) {
    const sorted = [...dedup].sort((a, b) => {
      const areaA = a.bounds.width * a.bounds.height;
      const areaB = b.bounds.width * b.bounds.height;
      return areaA - areaB;
    });
    droppedByPostFilterCap = sorted.length - POST_FILTER_CAP;
    kept = sorted.slice(droppedByPostFilterCap);
  }
  const nodes = [];
  for (let i = 0; i < kept.length; i++) {
    const c = kept[i];
    let parentAxNodeId = rootAxNodeId;
    let parentDepth = 0;
    for (const ancestorBackendId of c.parentBackendDOMNodeIds) {
      const ancestor = axNodeByBackendId.get(ancestorBackendId);
      if (ancestor) {
        parentAxNodeId = ancestor.axNodeId;
        parentDepth = ancestor.depth;
        break;
      }
    }
    nodes.push({
      axNodeId: `synthetic-icon-${i}`,
      role: "image",
      name: c.name,
      value: "",
      backendDOMNodeId: c.ownBackendDOMNodeId,
      bounds: c.bounds,
      children: [],
      // flat — no recursion (per spec)
      depth: parentDepth + 1,
      parentAxNodeId,
      siblingIndex: 0,
      childCount: 0,
      isLandmark: false,
      isHidden: false,
      synthesized: true,
      computedStyles: null,
      parentComputedStyles: null,
      tagName: c.tagName,
      selector: ""
      // not used for synthetic nodes
    });
  }
  return {
    nodes,
    stats: {
      droppedByDuplicate,
      droppedByPostFilterCap,
      synthesizedCount: nodes.length
    }
  };
}
async function resolveCandidateBackendIds(page, cdp, candidates) {
  if (candidates.length === 0) return [];
  await page.evaluate((indices) => {
    const all = Array.from(document.querySelectorAll("svg, img"));
    for (const idx of indices) {
      if (all[idx]) {
        all[idx].setAttribute("data-fidel-icon-id", String(idx));
      }
    }
  }, candidates.map((c) => c.index));
  const { root } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
  const resolved = [];
  for (const c of candidates) {
    try {
      const { nodeId } = await cdp.send("DOM.querySelector", {
        nodeId: root.nodeId,
        selector: `[data-fidel-icon-id="${c.index}"]`
      });
      if (!nodeId) continue;
      const { node } = await cdp.send("DOM.describeNode", {
        nodeId,
        depth: 0
      });
      const ancestorIds = [];
      let curNodeId = node.parentId;
      let walkDepth = 0;
      while (curNodeId && walkDepth < 20) {
        try {
          const { node: ancestor } = await cdp.send("DOM.describeNode", {
            nodeId: curNodeId,
            depth: 0
          });
          if (ancestor.backendNodeId > 0) {
            ancestorIds.push(ancestor.backendNodeId);
          }
          curNodeId = ancestor.parentId;
        } catch {
          break;
        }
        walkDepth++;
      }
      resolved.push({
        ...c,
        ownBackendDOMNodeId: node.backendNodeId,
        parentBackendDOMNodeIds: ancestorIds
      });
    } catch {
    }
  }
  await page.evaluate((indices) => {
    const all = Array.from(document.querySelectorAll("[data-fidel-icon-id]"));
    for (const el of all) {
      el.removeAttribute("data-fidel-icon-id");
    }
  }, candidates.map((c) => c.index)).catch(() => {
  });
  return resolved;
}

// src/ax-tree-extractor.ts
if (typeof CSS === "undefined" || typeof CSS.escape !== "function") {
  globalThis.CSS = {
    escape: (str) => {
      return str.replace(/([^\w-])/g, "\\$1");
    }
  };
}
var LANDMARK_ROLES = /* @__PURE__ */ new Set([
  "banner",
  // <header> (page-level)
  "navigation",
  // <nav>
  "main",
  // <main>
  "contentinfo",
  // <footer> (page-level)
  "complementary",
  // <aside>
  "form",
  // <form> with accessible name
  "region",
  // <section> with accessible name
  "search"
  // search landmark
]);
var SKIP_ROLES = /* @__PURE__ */ new Set([
  "none",
  "presentation",
  "generic"
  // bare <div>/<span> with no semantic meaning
]);
var COLLAPSIBLE_ROLES = /* @__PURE__ */ new Set(["none", "presentation", "generic"]);
function shouldCollapse(node) {
  if (!COLLAPSIBLE_ROLES.has(node.role)) return false;
  if (node.name && node.name.trim().length > 0) return false;
  if (node.isLandmark) return false;
  if (node.tagName === "SECTION") return false;
  return true;
}
function collapseGenericNodes(root) {
  for (let i = root.children.length - 1; i >= 0; i--) {
    collapseGenericNodes(root.children[i]);
  }
  const newChildren = [];
  for (const child of root.children) {
    if (shouldCollapse(child)) {
      for (const grandchild of child.children) {
        grandchild.parentAxNodeId = root.axNodeId;
        if (!grandchild.bounds && child.bounds) {
          grandchild.bounds = { ...child.bounds };
        }
        if (grandchild.backendDOMNodeId === 0 && child.backendDOMNodeId > 0) {
          grandchild.backendDOMNodeId = child.backendDOMNodeId;
        }
        newChildren.push(grandchild);
      }
    } else {
      newChildren.push(child);
    }
  }
  root.children = newChildren;
  root.childCount = newChildren.length;
  for (let i = 0; i < root.children.length; i++) {
    root.children[i].siblingIndex = i;
  }
}
async function extractAXTree(page, options) {
  const startTime = Date.now();
  const cdp = await page.context().newCDPSession(page);
  if (!options?.skipScroll) try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 100);
      });
    });
    await page.waitForTimeout(1e3);
  } catch {
  }
  const { nodes: rawAXNodes } = await cdp.send("Accessibility.getFullAXTree");
  await cdp.send("DOM.enable");
  const { root: domRoot } = await cdp.send("DOM.getDocument", { depth: -1, pierce: true });
  let domNodeCount = 0;
  function countDOMNodes(node) {
    domNodeCount++;
    if (node.children) node.children.forEach(countDOMNodes);
    if (node.contentDocument) countDOMNodes(node.contentDocument);
  }
  countDOMNodes(domRoot);
  const axNodeMap = /* @__PURE__ */ new Map();
  for (const node of rawAXNodes) {
    axNodeMap.set(node.nodeId, node);
  }
  const pageMetrics = await page.evaluate(() => ({
    width: Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth
    ),
    height: Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight
    )
  }));
  let allNodes = [];
  async function buildNode(rawNode, depth, parentAxNodeId, siblingIndex) {
    const role = rawNode.role?.value || "unknown";
    const name = rawNode.name?.value || "";
    const value = rawNode.value?.value || "";
    const backendDOMNodeId = rawNode.backendDOMNodeId || 0;
    const isHidden = rawNode.ignored === true;
    let bounds = null;
    let tagName = "";
    let selector = "";
    if (backendDOMNodeId > 0 && !isHidden) {
      try {
        const { model } = await cdp.send("DOM.getBoxModel", {
          backendNodeId: backendDOMNodeId
        });
        if (model) {
          bounds = {
            x: model.content[0],
            y: model.content[1],
            width: model.width,
            height: model.height
          };
        }
      } catch {
      }
      try {
        const { node: domNodeInfo } = await cdp.send("DOM.describeNode", {
          backendNodeId: backendDOMNodeId
        });
        tagName = (domNodeInfo.localName || domNodeInfo.nodeName || "").toUpperCase();
        const attrs = domNodeInfo.attributes || [];
        const attrMap = /* @__PURE__ */ new Map();
        for (let i = 0; i < attrs.length; i += 2) {
          attrMap.set(attrs[i], attrs[i + 1]);
        }
        if (attrMap.has("id") && attrMap.get("id")) {
          selector = `#${CSS.escape(attrMap.get("id"))}`;
        } else if (attrMap.has("data-testid")) {
          selector = `[data-testid="${attrMap.get("data-testid")}"]`;
        } else if (attrMap.has("data-qa")) {
          selector = `[data-qa="${attrMap.get("data-qa")}"]`;
        } else if (attrMap.has("data-cy")) {
          selector = `[data-cy="${attrMap.get("data-cy")}"]`;
        } else if (attrMap.has("aria-label")) {
          selector = `${tagName.toLowerCase()}[aria-label="${attrMap.get("aria-label")}"]`;
        } else {
          selector = tagName.toLowerCase();
        }
      } catch {
        tagName = "";
        selector = "";
      }
    }
    const childIds = rawNode.childIds || [];
    const node = {
      axNodeId: rawNode.nodeId,
      role,
      name,
      value,
      backendDOMNodeId,
      bounds,
      children: [],
      depth,
      parentAxNodeId,
      siblingIndex,
      childCount: childIds.length,
      isLandmark: LANDMARK_ROLES.has(role),
      isHidden,
      computedStyles: null,
      // Populated later on demand
      parentComputedStyles: null,
      // Populated later by populateComputedStyles()
      tagName,
      selector
    };
    allNodes.push(node);
    for (let i = 0; i < childIds.length; i++) {
      const childRaw = axNodeMap.get(childIds[i]);
      if (childRaw) {
        const childNode = await buildNode(childRaw, depth + 1, rawNode.nodeId, i);
        if (childNode) {
          node.children.push(childNode);
        }
      }
    }
    node.childCount = node.children.length;
    return node;
  }
  const rootRaw = rawAXNodes[0];
  const root = await buildNode(rootRaw, 0, null, 0);
  if (!root) {
    throw new Error("Failed to build AX tree: root node is null");
  }
  collapseGenericNodes(root);
  allNodes = [];
  function flattenTree(node) {
    allNodes.push(node);
    for (const child of node.children) {
      flattenTree(child);
    }
  }
  flattenTree(root);
  function recomputeDepths(node, depth) {
    node.depth = depth;
    for (const child of node.children) {
      recomputeDepths(child, depth + 1);
    }
  }
  recomputeDepths(root, 0);
  try {
    const harvest = await harvestIconCandidates(page);
    if (harvest.candidates.length > 0) {
      const resolved = await resolveCandidateBackendIds(page, cdp, harvest.candidates);
      const existingAXBackendIds = /* @__PURE__ */ new Set();
      const axNodeByBackendId = /* @__PURE__ */ new Map();
      for (const n of allNodes) {
        if (n.backendDOMNodeId > 0) {
          existingAXBackendIds.add(n.backendDOMNodeId);
          axNodeByBackendId.set(n.backendDOMNodeId, n);
        }
      }
      const emit = emitSyntheticNodes(
        resolved,
        existingAXBackendIds,
        axNodeByBackendId,
        root.axNodeId
      );
      for (const synthNode of emit.nodes) {
        const parent = allNodes.find((n) => n.axNodeId === synthNode.parentAxNodeId) ?? root;
        synthNode.siblingIndex = parent.children.length;
        parent.children.push(synthNode);
        parent.childCount = parent.children.length;
        allNodes.push(synthNode);
      }
      console.log(JSON.stringify({
        tag: "[kp]",
        event: "icon_synthesis",
        ...harvest.stats,
        ...emit.stats
      }));
    }
  } catch (err) {
    console.warn("[kp] icon_synthesis_failed", err?.message ?? err);
  }
  const semanticNodes = allNodes.filter(
    (n) => !n.isHidden && !SKIP_ROLES.has(n.role) && n.backendDOMNodeId > 0
  );
  const landmarks = allNodes.filter((n) => n.isLandmark && !n.isHidden);
  await cdp.send("DOM.disable");
  await cdp.detach();
  const extractionTimeMs = Date.now() - startTime;
  return {
    root,
    allNodes,
    semanticNodes,
    landmarks,
    pageWidth: pageMetrics.width,
    pageHeight: pageMetrics.height,
    domNodeCount,
    extractionTimeMs
  };
}

// src/snapshot.ts
var SCROLL_SCRIPT = `
  (async () => {
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const getScrollHeight = () => document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    let currentPosition = 0;
    let previousHeight = getScrollHeight();
    let stableCount = 0;

    while (currentPosition < getScrollHeight()) {
      currentPosition += viewportHeight;
      window.scrollTo(0, currentPosition);
      await delay(150);

      const newHeight = getScrollHeight();
      if (newHeight === previousHeight) {
        stableCount++;
        if (stableCount >= 3) break;
      } else {
        stableCount = 0;
        previousHeight = newHeight;
      }

      if (currentPosition > 50000) break;
    }

    window.scrollTo(0, 0);
    await delay(100);
  })()
`;
async function scrollFullPage(page) {
  await page.evaluate(SCROLL_SCRIPT);
}
async function captureSnapshotWithPage(options) {
  const {
    url,
    viewport = { width: 1440, height: 900 },
    waitForLoadState = "networkidle",
    waitAfterLoadMs = 500,
    waitForSelector,
    scrollToBottom = true,
    auth
  } = options;
  const browser = await import_playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, bypassCSP: true });
  if (auth?.type === "cookie" && auth.cookies) {
    await context.addCookies(auth.cookies.map((c) => ({ ...c, path: "/" })));
  }
  if (auth?.type === "basic" && auth.username && auth.password) {
    await context.setHTTPCredentials({ username: auth.username, password: auth.password });
  }
  const page = await context.newPage();
  if (auth?.type === "header" && auth.headers) {
    await page.setExtraHTTPHeaders(auth.headers);
  }
  try {
    await page.goto(url, { waitUntil: waitForLoadState, timeout: 3e4 });
  } catch (err) {
    if (waitForLoadState === "networkidle" && err.message?.includes("Timeout")) {
      console.log("[fidel-ci] networkidle timed out \u2014 page loaded, continuing with snapshot");
    } else {
      throw err;
    }
  }
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: 1e4 });
  }
  if (scrollToBottom) {
    await scrollFullPage(page);
  }
  await page.waitForTimeout(waitAfterLoadMs);
  const iifeSource = import_fs.default.readFileSync(
    import_path.default.join(__dirname, "..", "dist", "snapshot.iife.js"),
    "utf8"
  );
  const domElements = await page.evaluate(`
    ${iifeSource}
    window.__fidel_snapshot.snapshotDOM(true);
  `);
  let axTree = null;
  try {
    axTree = await extractAXTree(page, { skipScroll: true });
    console.log(`[fidel-ci] AX tree: ${axTree.semanticNodes.length} semantic nodes, ${axTree.landmarks.length} landmarks, ${axTree.extractionTimeMs}ms`);
  } catch (err) {
    console.log("[fidel-ci] AX tree extraction skipped:", err.message);
  }
  try {
    const captureResult = await page.evaluate(`
      (async () => {
        const { capturePseudoStateStyles, isInteractiveElement } = window.__fidel_snapshot;
        if (!capturePseudoStateStyles || !isInteractiveElement) return {};

        const results = {};
        const fidelElements = document.querySelectorAll('[data-fidel-id]');
        const states = ['hover', 'focus', 'focus-visible', 'active'];

        for (const el of fidelElements) {
          if (!isInteractiveElement(el)) continue;
          const fidelId = el.getAttribute('data-fidel-id');
          if (!fidelId) continue;
          let naturalState = 'default';
          const ariaInvalid = el.getAttribute('aria-invalid');
          const ariaDisabled = el.getAttribute('aria-disabled');
          if ((el.disabled === true) || ariaDisabled === 'true') {
            naturalState = 'disabled';
          } else if (ariaInvalid === 'true') {
            naturalState = 'invalid';
          }
          let styles = undefined;
          try {
            const captured = await capturePseudoStateStyles(el, states);
            if (captured && Object.keys(captured).length > 0) styles = captured;
          } catch {}
          results[fidelId] = { styles, naturalState };
        }
        return results;
      })()
    `);
    if (captureResult && Object.keys(captureResult).length > 0) {
      let countWithStyles = 0;
      for (const el of domElements) {
        const fidelId = el.selector?.match(/data-fidel-id="([^"]+)"/)?.[1];
        if (!fidelId) continue;
        const cap = captureResult[fidelId];
        if (!cap) continue;
        if (cap.styles) {
          el.pseudoStateStyles = cap.styles;
          countWithStyles += 1;
        }
        if (cap.naturalState && cap.naturalState !== "default") {
          el.naturalState = cap.naturalState;
        }
      }
      console.log(`[fidel-ci] Captured state evidence for ${countWithStyles} interactive elements`);
    }
  } catch (err) {
    console.log("[fidel-ci] Pseudo-state capture skipped:", err.message);
  }
  return { elements: domElements, axTree, page, browser };
}
async function captureSnapshot(options) {
  const result = await captureSnapshotWithPage(options);
  await result.browser.close();
  return { elements: result.elements, axTree: result.axTree };
}

// src/config.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var DEFAULT_VIEWPORT = { width: 1440, height: 900 };
var DEFAULT_WAIT_AFTER_LOAD_MS = 500;
var DEFAULT_WAIT_FOR_LOAD_STATE = "networkidle";
var DEFAULT_TEXT_MODE = "styling-only";
var VALID_WAIT_STATES = /* @__PURE__ */ new Set(["load", "domcontentloaded", "networkidle"]);
function loadConfig(configPath) {
  const resolvedPath = import_path2.default.resolve(configPath);
  if (!import_fs2.default.existsSync(resolvedPath)) {
    throw new Error(
      `Config file not found: ${resolvedPath}

Create one with:
  npx usefidel init

Or see: https://github.com/usefidel/fidel-action#configuration`
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(import_fs2.default.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to parse ${resolvedPath}: ${error.message}`);
  }
  if (!isRecord(parsed)) {
    throw new Error("fidel.config.json must be a JSON object");
  }
  const { checks, defaults, triggers, designSystemChecks } = parsed;
  if (checks !== void 0 && !Array.isArray(checks)) {
    throw new Error('fidel.config.json "checks" must be an array');
  }
  const hasFigmaChecks = Array.isArray(checks) && checks.length > 0;
  const hasDesignSystemChecks = Array.isArray(designSystemChecks) && designSystemChecks.length > 0;
  if (!hasFigmaChecks && !hasDesignSystemChecks) {
    throw new Error(
      'fidel.config.json has no checks.\n\nIt needs a non-empty "checks" array (Figma frames), a non-empty "designSystemChecks" array (design tokens), or both.\n\nSet it up with:\n  npx usefidel init'
    );
  }
  const validatedChecks = hasFigmaChecks ? checks.map((value, index) => validateCheck(value, `checks[${index}]`)) : [];
  const validatedDefaults = defaults === void 0 ? void 0 : validateDefaults(defaults, "defaults");
  const validatedTriggers = triggers === void 0 ? void 0 : validateTriggers(triggers, "triggers");
  return {
    checks: validatedChecks,
    defaults: validatedDefaults,
    triggers: validatedTriggers
  };
}
function substituteVars(input, vars) {
  return input.replace(/\{pr\}/g, vars.pr ?? "").replace(/\{sha\}/g, vars.sha ?? "").replace(/\{branch\}/g, vars.branch ?? "").replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (_, name) => process.env[name] ?? "").replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, name) => process.env[name] ?? "");
}
function resolveCheck(check, defaults, vars) {
  const viewport = check.viewport ?? defaults?.viewport ?? DEFAULT_VIEWPORT;
  const waitAfterLoadMs = check.waitAfterLoadMs ?? defaults?.waitAfterLoadMs ?? DEFAULT_WAIT_AFTER_LOAD_MS;
  const waitForLoadState = check.waitForLoadState ?? defaults?.waitForLoadState ?? DEFAULT_WAIT_FOR_LOAD_STATE;
  const textMode = check.textMode ?? defaults?.textMode ?? DEFAULT_TEXT_MODE;
  return {
    name: check.name.trim(),
    figma: substituteVars(check.figma, vars),
    url: substituteVars(check.url, vars),
    viewport,
    waitForSelector: check.waitForSelector?.trim() || void 0,
    waitAfterLoadMs,
    waitForLoadState,
    textMode
  };
}
function validateCheck(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be an object`);
  }
  const name = requireString(value.name, `${location}.name`);
  const figma = requireString(value.figma, `${location}.figma`);
  const url = requireString(value.url, `${location}.url`);
  return {
    name,
    figma,
    url,
    viewport: value.viewport === void 0 ? void 0 : validateViewport(value.viewport, `${location}.viewport`),
    waitForSelector: optionalString(value.waitForSelector, `${location}.waitForSelector`),
    waitAfterLoadMs: optionalNonNegativeInteger(value.waitAfterLoadMs, `${location}.waitAfterLoadMs`),
    waitForLoadState: optionalWaitForLoadState(value.waitForLoadState, `${location}.waitForLoadState`),
    textMode: optionalString(value.textMode, `${location}.textMode`),
    // Preserve steps as-is (unknown[]) so the runtime guard in main.ts can
    // detect its presence. No validation of the shape — v2 owns that.
    steps: value.steps !== void 0 ? value.steps : void 0
  };
}
function validateDefaults(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be an object`);
  }
  return {
    viewport: value.viewport === void 0 ? void 0 : validateViewport(value.viewport, `${location}.viewport`),
    waitAfterLoadMs: optionalNonNegativeInteger(value.waitAfterLoadMs, `${location}.waitAfterLoadMs`),
    waitForLoadState: optionalWaitForLoadState(value.waitForLoadState, `${location}.waitForLoadState`),
    textMode: optionalString(value.textMode, `${location}.textMode`)
  };
}
function validateTriggers(value, location) {
  if (!isRecord(value)) {
    console.warn(`[fidel-ci] ${location} is not an object; ignoring`);
    return void 0;
  }
  const { paths } = value;
  if (paths === void 0) {
    return {};
  }
  if (!Array.isArray(paths)) {
    throw new Error(`${location}.paths must be an array of glob strings`);
  }
  if (paths.length > 64) {
    throw new Error(`${location}.paths supports at most 64 entries`);
  }
  const validated = [];
  for (let i = 0; i < paths.length; i += 1) {
    const entry = paths[i];
    if (typeof entry !== "string" || entry.trim() === "") {
      throw new Error(`${location}.paths[${i}] must be a non-empty string`);
    }
    validated.push(entry);
  }
  return { paths: validated };
}
function validateViewport(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be an object`);
  }
  return {
    width: requirePositiveInteger(value.width, `${location}.width`),
    height: requirePositiveInteger(value.height, `${location}.height`)
  };
}
function optionalWaitForLoadState(value, location) {
  if (value === void 0) {
    return void 0;
  }
  if (typeof value !== "string" || !VALID_WAIT_STATES.has(value)) {
    throw new Error(`${location} must be one of: load, domcontentloaded, networkidle`);
  }
  return value;
}
function optionalNonNegativeInteger(value, location) {
  if (value === void 0) {
    return void 0;
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${location} must be a non-negative integer`);
  }
  return value;
}
function requirePositiveInteger(value, location) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${location} must be a positive integer`);
  }
  return value;
}
function requireString(value, location) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${location} must be a non-empty string`);
  }
  return value.trim();
}
function optionalString(value, location) {
  if (value === void 0) {
    return void 0;
  }
  return requireString(value, location);
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/cache.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
var DEFAULT_TTL_MS = 24 * 60 * 60 * 1e3;
function getCacheDir(baseDir) {
  return baseDir || import_path3.default.join(process.cwd(), ".fidel-cache");
}
function getCacheFilePath(fileKey, nodeId, baseDir) {
  const safeNodeId = nodeId.replace(/:/g, "-");
  return import_path3.default.join(getCacheDir(baseDir), `${fileKey}-${safeNodeId}.json`);
}
function getCachedSpecs(fileKey, nodeId, options) {
  const filePath = getCacheFilePath(fileKey, nodeId, options?.cacheDir);
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  try {
    if (!import_fs3.default.existsSync(filePath)) return null;
    const raw = import_fs3.default.readFileSync(filePath, "utf8");
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttl) {
      console.log(`[fidel-ci] Cache expired for ${fileKey}:${nodeId}`);
      return null;
    }
    console.log(`[fidel-ci] Cache hit: ${entry.specs.length} specs for ${fileKey}:${nodeId}`);
    return entry.specs;
  } catch {
    return null;
  }
}
function setCachedSpecs(fileKey, nodeId, specs, options) {
  const dir = getCacheDir(options?.cacheDir);
  const filePath = getCacheFilePath(fileKey, nodeId, options?.cacheDir);
  const entry = {
    specs,
    timestamp: Date.now(),
    fileKey,
    nodeId
  };
  try {
    import_fs3.default.mkdirSync(dir, { recursive: true });
    import_fs3.default.writeFileSync(filePath, JSON.stringify(entry), "utf8");
    console.log(`[fidel-ci] Cached ${specs.length} specs for ${fileKey}:${nodeId}`);
  } catch (err) {
    console.error("[fidel-ci] Failed to write cache:", err);
  }
}
async function getSpecsWithCache(fileKey, nodeId, figmaToken, fetchFn, options) {
  const cached = getCachedSpecs(fileKey, nodeId, options);
  if (cached) return cached;
  const specs = await fetchFn(fileKey, nodeId, figmaToken);
  setCachedSpecs(fileKey, nodeId, specs, options);
  return specs;
}

// src/result-completeness.ts
function confirmedViolationCount(c) {
  if (c.driftCount === null || c.offTokenCount === null) return null;
  return c.driftCount + c.offTokenCount;
}
var EVIDENCE_STATES = [
  "complete",
  "partial",
  "unverified",
  "configuration_required",
  "operational_failure"
];
var INCOMPLETE_REASONS = [
  "css_variable_discovery_partial",
  "css_variable_discovery_expected_only",
  "declaration_provenance_unverified",
  "unverified_token_values",
  "storybook_story_cap",
  "token_reference_missing",
  "token_reference_unresolved",
  "token_syntax_unsupported",
  "applicability_unconfirmed",
  "theme_anchor_unresolved",
  "brand_unresolved",
  "design_system_not_configured",
  "result_read_failed",
  "run_not_finalized",
  "bypass_scan_incomplete",
  "validation_not_attempted",
  "completeness_metadata_missing",
  "completeness_metadata_malformed"
];
function asRecord(v) {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return null;
  return v;
}
var RESPONSIBILITY_CLASS = {
  // Fidel's capability limits — the page was fine, our inspection was not.
  css_variable_discovery_partial: "fidel_capability",
  css_variable_discovery_expected_only: "fidel_capability",
  declaration_provenance_unverified: "fidel_capability",
  unverified_token_values: "fidel_capability",
  storybook_story_cap: "fidel_capability",
  bypass_scan_incomplete: "fidel_capability",
  // S2, the split that matters: `unresolved` is ours, `missing` is theirs. A
  // pointer is only the customer's problem once every `var(--x)` target of the
  // declared value is PROVEN absent from a page whose variable capture was
  // itself complete. Anything short of that proof is `unresolved`.
  token_reference_unresolved: "fidel_capability",
  token_syntax_unsupported: "fidel_capability",
  token_reference_missing: "customer_configuration",
  // Configuration the customer owns.
  theme_anchor_unresolved: "customer_configuration",
  brand_unresolved: "customer_configuration",
  design_system_not_configured: "customer_configuration",
  // Fidel's own machinery.
  result_read_failed: "fidel_system",
  run_not_finalized: "fidel_system",
  validation_not_attempted: "fidel_system",
  completeness_metadata_missing: "fidel_system",
  completeness_metadata_malformed: "fidel_system",
  // Nobody's fault: we were never told this design system governs this page.
  applicability_unconfirmed: "unverified_applicability"
};
var FAIL_CLOSED_REASONS = [
  "completeness_metadata_missing",
  "completeness_metadata_malformed"
];
var NON_GATING_REASONS = INCOMPLETE_REASONS.filter((r) => {
  const cls = RESPONSIBILITY_CLASS[r];
  return (cls === "fidel_capability" || cls === "fidel_system" || cls === "unverified_applicability") && !FAIL_CLOSED_REASONS.includes(r);
});
var BRIDGE_APPLICABILITIES = [
  "user-confirmed",
  "detected",
  "unknown"
];
function isReadinessConsistent(readiness) {
  return Object.values(readiness.categories).every(
    (category) => category.ready === categoryReadyFor(category, readiness.applicability)
  );
}
function categoryReadyFor(category, applicability) {
  return category.total - category.referenceInputs > 0 && category.unresolved === 0 && applicability === "user-confirmed";
}
function parseReadiness(raw) {
  const rec = asRecord(raw);
  if (rec === null) return void 0;
  if (rec.bridge !== "legacy-v1") return void 0;
  const rawCategories = asRecord(rec.categories);
  if (rawCategories === null) return void 0;
  const color = parseReadinessCategory(rawCategories.color);
  const typography = parseReadinessCategory(rawCategories.typography);
  const size = parseReadinessCategory(rawCategories.size);
  if (color === void 0 || typography === void 0 || size === void 0) return void 0;
  if (rec.tuple !== void 0 && asRecord(rec.tuple)?.theme !== "light") return void 0;
  const applicability = BRIDGE_APPLICABILITIES.includes(rec.applicability) ? rec.applicability : "unknown";
  const snapshot = {
    bridge: "legacy-v1",
    tuple: { theme: "light" },
    applicability,
    categories: { color, typography, size }
  };
  if (typeof rec.applicabilityOrigin === "string") {
    snapshot.applicabilityOrigin = rec.applicabilityOrigin;
  }
  if (!isReadinessConsistent(snapshot)) return void 0;
  return snapshot;
}
function parseReadinessCategory(raw) {
  const rec = asRecord(raw);
  if (rec === null) return void 0;
  const total = countOrNull(rec.total);
  const resolved = countOrNull(rec.resolved);
  const unresolved = countOrNull(rec.unresolved);
  const suppressedNegatives = countOrNull(rec.suppressedNegatives);
  if (total === null || resolved === null || unresolved === null || suppressedNegatives === null) {
    return void 0;
  }
  const referenceInputs = rec.referenceInputs === void 0 ? 0 : countOrNull(rec.referenceInputs);
  if (referenceInputs === null) return void 0;
  if (total !== resolved + unresolved + referenceInputs) return void 0;
  if (typeof rec.ready !== "boolean") return void 0;
  const reasons = {};
  const rawReasons = asRecord(rec.reasons);
  if (rawReasons !== null) {
    for (const [key, value] of Object.entries(rawReasons)) {
      if (!isIncompleteReason(key)) continue;
      const count = countOrNull(value);
      if (count === null) continue;
      reasons[key] = count;
    }
  }
  return { total, resolved, referenceInputs, unresolved, ready: rec.ready, reasons, suppressedNegatives };
}
var STATE_RANK = {
  complete: 0,
  partial: 1,
  unverified: 2,
  configuration_required: 3,
  operational_failure: 4
};
function isEvidenceState(v) {
  return typeof v === "string" && EVIDENCE_STATES.includes(v);
}
function isIncompleteReason(v) {
  return typeof v === "string" && INCOMPLETE_REASONS.includes(v);
}
function worseState(a, b) {
  return STATE_RANK[a] >= STATE_RANK[b] ? a : b;
}
function buildCompleteness(input) {
  const reasons = normalizeReasons(input.reasons ?? []);
  let state = input.state;
  const driftCount = countOrNull(input.driftCount);
  const offTokenCount = countOrNull(input.offTokenCount);
  const unverifiedCount = countOrNull(input.unverifiedCount);
  if (state === "complete" && reasons.length > 0) state = "partial";
  if (state === "complete" && (driftCount === null || offTokenCount === null || unverifiedCount === null)) {
    state = "unverified";
    if (!reasons.includes("completeness_metadata_missing")) {
      reasons.push("completeness_metadata_missing");
    }
  }
  if (state !== "complete" && reasons.length === 0) reasons.push("completeness_metadata_missing");
  const out = {
    state,
    reasons,
    verified: state === "complete",
    driftCount,
    offTokenCount,
    unverifiedCount,
    retryable: input.retryable ?? defaultRetryable(state, reasons)
  };
  if (input.readiness !== void 0 && isReadinessConsistent(input.readiness)) {
    out.readiness = input.readiness;
  }
  return out;
}
function ciOutcomeFor(c) {
  if (c.state === "operational_failure") return "fail_operational";
  if (c.state !== "complete") return "incomplete";
  const confirmed = confirmedViolationCount(c);
  if (confirmed === null) return "incomplete";
  return confirmed > 0 ? "fail_violation" : "pass";
}
function summaryHeadline(c) {
  switch (ciOutcomeFor(c)) {
    case "pass":
      return "Verification passed";
    case "fail_violation":
      return "Confirmed violations found";
    case "fail_operational":
      return "Validation failed to run";
    case "incomplete":
      return c.state === "configuration_required" ? "Configuration required" : "Verification incomplete";
  }
}
var COMPLETENESS_ADVISORY_CODE = "result_completeness";
function completenessFromAdvisories(advisories) {
  if (!Array.isArray(advisories)) {
    return buildCompleteness({ state: "unverified", reasons: ["completeness_metadata_missing"], retryable: false });
  }
  const markers = advisories.filter(
    (a) => typeof a === "object" && a !== null && !Array.isArray(a) && a.code === COMPLETENESS_ADVISORY_CODE
  );
  if (markers.length === 0) {
    return buildCompleteness({ state: "unverified", reasons: ["completeness_metadata_missing"], retryable: false });
  }
  const reasons = [];
  let state = "complete";
  let sawUnknownState = false;
  for (const m of markers) {
    if (isEvidenceState(m.state)) state = worseState(state, m.state);
    else sawUnknownState = true;
    if (isIncompleteReason(m.reason)) reasons.push(m.reason);
    else if (m.reason !== "none") sawUnknownState = true;
  }
  if (sawUnknownState) {
    reasons.push("completeness_metadata_malformed");
    state = worseState(state, "unverified");
  }
  const first = markers[0];
  return buildCompleteness({
    state,
    reasons,
    // `get_shared_run` projects advisories down to {code, reason}, so an
    // anonymous viewer receives no counts at all. That must read as
    // unavailable, never as zero.
    driftCount: countOrNull(first.driftCount),
    offTokenCount: countOrNull(first.offTokenCount),
    unverifiedCount: countOrNull(first.unverifiedCount),
    retryable: typeof first.retryable === "boolean" ? first.retryable : void 0,
    // Same projection applies: an anonymous viewer gets {code, reason} only, so
    // this resolves to undefined and the reader must render "not stated".
    readiness: parseReadiness(first.readiness)
  });
}
function describeReasons(reasons) {
  return reasons.map((r) => REASON_TEXT[r]);
}
var REASON_TEXT = {
  css_variable_discovery_partial: "Some stylesheets could not be read, so parts of the page were not inspected.",
  css_variable_discovery_expected_only: "No token values were resolved from the page \u2014 only the expected token names were known.",
  declaration_provenance_unverified: "Token values were observed, but the stylesheet that declares them could not be read.",
  unverified_token_values: "Some token values could not be compared and reached no verdict.",
  storybook_story_cap: "The Storybook story cap was reached, so some stories were not inspected.",
  token_reference_missing: "A declared token references a variable the page does not define.",
  token_reference_unresolved: "A declared token references another variable, and Fidel cannot resolve that reference yet.",
  token_syntax_unsupported: "A declared token uses a value syntax Fidel cannot compare yet.",
  applicability_unconfirmed: "The design system was matched to this page automatically, so nothing was confirmed as a violation.",
  theme_anchor_unresolved: "This team has more than one connected repository and none is designated, so no design system could be selected.",
  brand_unresolved: "More than one brand exists and none was requested, so no brand could be selected.",
  design_system_not_configured: "No design system is connected for this repository.",
  result_read_failed: "The validation result could not be read back.",
  run_not_finalized: "The validation did not reach a final state.",
  bypass_scan_incomplete: "The design-system bypass scan did not cover every changed file.",
  validation_not_attempted: "The validation was not attempted, so nothing was verified.",
  completeness_metadata_missing: "The result carried no completeness information, so full coverage cannot be assumed.",
  completeness_metadata_malformed: "The result carried unreadable completeness information."
};
function defaultRetryable(state, reasons) {
  if (state === "configuration_required") return false;
  if (state === "complete") return false;
  return reasons.some(
    (r) => r === "result_read_failed" || r === "run_not_finalized" || r === "css_variable_discovery_partial" || r === "validation_not_attempted"
  );
}
function normalizeReasons(reasons) {
  return Array.from(new Set(reasons)).sort();
}
function countOrNull(v) {
  if (typeof v !== "number") return null;
  if (!Number.isFinite(v) || !Number.isInteger(v) || v < 0) return null;
  return v;
}

// src/ds-check.ts
var DEFAULT_APP_BASE_URL = "https://app.usefidel.com";
var DEFAULT_POLL_TIMEOUT_MS = 9e4;
var DEFAULT_POLL_INTERVAL_MS = 3e3;
var FETCH_TIMEOUT_MS = 3e4;
async function runDesignSystemChecks(opts) {
  const results = [];
  for (const check of opts.checks) {
    results.push(await runOneDesignSystemCheck(check, opts));
  }
  return results;
}
async function runOneDesignSystemCheck(check, opts) {
  const startedAt = Date.now();
  const url = substituteVars(check.url, opts.templateVariables);
  try {
    const contextKey = check.brandKey ?? "__default__";
    const idempotencyKey = await deriveIdempotencyKey(opts.repoFullName, opts.headSha, contextKey, url);
    const postBody = {
      validationMode: "design_system_vs_live",
      liveUrl: url,
      repoFullName: opts.repoFullName,
      idempotencyKey,
      // Plan 026 §8 — structural, analytics-only source hint (see
      // web-validate/index.ts's requestSource comment). Never authz.
      runnerRequest: true
    };
    if (check.brandKey) {
      postBody.brandKey = check.brandKey;
    }
    if (opts.viewport) {
      postBody.viewport = opts.viewport;
    }
    let postResp = await fetchWithTimeout(opts.webValidateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.supabaseJwt}`,
        apikey: opts.supabaseAnonKey
      },
      body: JSON.stringify(postBody)
    });
    let postJson = await safeJson(postResp);
    if (postResp.status === 409 && postJson?.reason === "request_id_reused") {
      const retrySalt = crypto.randomUUID().slice(0, 8);
      const retryBody = { ...postBody, idempotencyKey: `${idempotencyKey}-${retrySalt}`.slice(0, 128) };
      postResp = await fetchWithTimeout(opts.webValidateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.supabaseJwt}`,
          apikey: opts.supabaseAnonKey
        },
        body: JSON.stringify(retryBody)
      });
      postJson = await safeJson(postResp);
    }
    if (postResp.status === 402) {
      return notAttempted(check, url, startedAt, describeSubscriptionDenial(postJson));
    }
    if (postResp.status === 429) {
      return notAttempted(check, url, startedAt, "Daily validation limit reached \u2014 skipped.");
    }
    if (postResp.status === 422) {
      const errorCode = typeof postJson?.errorCode === "string" ? postJson.errorCode : void 0;
      if (errorCode === "SESSION_EXPIRED") {
        const reconnectUrl = typeof postJson?.reconnectUrl === "string" && postJson.reconnectUrl.startsWith("https://") ? postJson.reconnectUrl : void 0;
        return notAttempted(
          check,
          url,
          startedAt,
          reconnectUrl ? `Connected environment session expired \u2014 reconnect it here: ${reconnectUrl}` : "Connected environment session expired \u2014 reconnect in Fidel settings."
        );
      }
      if (errorCode === "DESIGN_SYSTEM_BRAND_NOT_RESOLVED") {
        const count = typeof postJson?.candidateCount === "number" ? postJson.candidateCount : void 0;
        const suffix = count !== void 0 ? ` (${count} brands connected)` : "";
        return configurationRequired(
          check,
          url,
          startedAt,
          "brand_unresolved",
          postJson?.reason === "requested_brand_absent" ? `The requested brand has no connected design system${suffix}. Designate the intended brand context in Fidel settings.` : `More than one brand is connected and none was requested${suffix}. Designate the intended brand context in Fidel settings.`
        );
      }
      if (errorCode === "DESIGN_SYSTEM_CONTEXT_NOT_AVAILABLE") {
        return configurationRequired(
          check,
          url,
          startedAt,
          "brand_unresolved",
          check.brandKey ? `Unknown or archived brand context "${check.brandKey}" for this repo. Designate the intended brand context in Fidel settings.` : "No active design-system context for this repo. Designate one in Fidel settings."
        );
      }
      if (errorCode === "DESIGN_SYSTEM_NOT_AVAILABLE") {
        return configurationRequired(
          check,
          url,
          startedAt,
          "design_system_not_configured",
          "No parsed design-system theme is connected for this repo. Connect one in Fidel settings."
        );
      }
      return configurationRequired(
        check,
        url,
        startedAt,
        "design_system_not_configured",
        "The design system for this repo could not be resolved. Check the connection in Fidel settings."
      );
    }
    if (postResp.status === 401) {
      return notAttempted(check, url, startedAt, "Not authenticated with Fidel \u2014 skipped.");
    }
    if (postResp.status === 400) {
      const message = typeof postJson?.error === "string" ? postJson.error : "Invalid request";
      return operationalFailure(check, url, startedAt, message);
    }
    if (!postResp.ok || !postJson?.runId) {
      return operationalFailure(check, url, startedAt, `web-validate returned HTTP ${postResp.status}`);
    }
    const runId = postJson.runId;
    if (postJson.status === "complete") {
      return await buildCompletedResult(check, url, runId, startedAt, opts);
    }
    const pollResult = await pollForCompletion(runId, opts);
    if (pollResult === "timeout") {
      return {
        name: check.name,
        brandKey: check.brandKey,
        url,
        status: "neutral",
        runId,
        reason: "Still processing when the check timed out \u2014 nothing was verified. Re-run to get a result.",
        ...completed(buildCompleteness({
          state: "unverified",
          reasons: ["run_not_finalized"],
          retryable: true
        })),
        elapsedMs: Date.now() - startedAt
      };
    }
    if (pollResult === "error") {
      return operationalFailure(check, url, startedAt, "Validation failed while processing.", runId);
    }
    return await buildCompletedResult(check, url, runId, startedAt, opts);
  } catch (err) {
    return operationalFailure(check, url, startedAt, err.message || String(err));
  }
}
async function buildCompletedResult(check, url, runId, startedAt, opts) {
  const read = await fetchRunRow(runId, opts);
  if (!read.ok) {
    return {
      name: check.name,
      brandKey: check.brandKey,
      url,
      status: "neutral",
      runId,
      reason: "The validation ran but its result could not be read back \u2014 nothing was verified.",
      ...completed(buildCompleteness({
        state: "unverified",
        reasons: ["result_read_failed"],
        retryable: true
      })),
      elapsedMs: Date.now() - startedAt
    };
  }
  const runRow = read.row;
  if (runRow.status === "error") {
    return operationalFailure(check, url, startedAt, "The validation did not complete.", runId);
  }
  if (runRow.status !== "complete") {
    return {
      name: check.name,
      brandKey: check.brandKey,
      url,
      status: "neutral",
      runId,
      reason: `The validation is still "${runRow.status}" \u2014 nothing was verified.`,
      ...completed(buildCompleteness({
        state: "unverified",
        reasons: ["run_not_finalized"],
        retryable: true
      })),
      elapsedMs: Date.now() - startedAt
    };
  }
  let completeness = completenessFromAdvisories(runRow.advisories);
  if (completeness.verified && typeof runRow.issue_count !== "number") {
    completeness = buildCompleteness({
      state: "unverified",
      reasons: ["result_read_failed"],
      driftCount: completeness.driftCount,
      unverifiedCount: completeness.unverifiedCount,
      retryable: true
    });
  }
  const tokenDriftCount = runRow.issue_count ?? 0;
  let tracked;
  let seen;
  let unresolved;
  const contextId = runRow.design_system_context_id;
  if (contextId) {
    const rollup = await fetchContextRollupCounts(contextId, opts);
    if (rollup) {
      tracked = rollup.tracked;
      seen = rollup.seen;
      unresolved = rollup.unresolved;
    }
  }
  const token = await mintShareToken(runId, opts);
  const appBase = (opts.appBaseUrl || DEFAULT_APP_BASE_URL).replace(/\/+$/, "");
  const reportUrl = token ? `${appBase}/report/${runId}?t=${token}` : `${appBase}/report/${runId}`;
  return {
    name: check.name,
    brandKey: check.brandKey,
    url,
    status: "success",
    runId,
    reportUrl,
    tokenDriftCount,
    tracked,
    seen,
    unresolved,
    ...completed(completeness),
    elapsedMs: Date.now() - startedAt
  };
}
function completed(completeness) {
  return { completeness, ciOutcome: ciOutcomeFor(completeness) };
}
function notAttempted(check, url, startedAt, reason, runId) {
  return {
    name: check.name,
    brandKey: check.brandKey,
    url,
    status: "neutral",
    reason,
    runId,
    ...completed(buildCompleteness({
      state: "unverified",
      reasons: ["validation_not_attempted"],
      retryable: true
    })),
    elapsedMs: Date.now() - startedAt
  };
}
function configurationRequired(check, url, startedAt, reason, message) {
  return {
    name: check.name,
    brandKey: check.brandKey,
    url,
    status: "neutral",
    reason: message,
    ...completed(buildCompleteness({
      state: "configuration_required",
      reasons: [reason],
      retryable: false
    })),
    elapsedMs: Date.now() - startedAt
  };
}
function operationalFailure(check, url, startedAt, reason, runId) {
  return {
    name: check.name,
    brandKey: check.brandKey,
    url,
    status: "failed",
    runId,
    reason,
    ...completed(buildCompleteness({
      state: "operational_failure",
      reasons: ["run_not_finalized"],
      retryable: true
    })),
    elapsedMs: Date.now() - startedAt
  };
}
function describeSubscriptionDenial(json) {
  const reason = typeof json?.reason === "string" ? json.reason : void 0;
  if (reason === "requires_pro_plan") return "Design-system validation requires a Pro plan \u2014 skipped.";
  if (reason === "ds_validation_limit") return "Monthly design-system validation limit reached for this plan \u2014 skipped.";
  if (reason === "validation_limit") return "Monthly validation limit reached \u2014 skipped.";
  if (reason === "no_subscription") return "No active subscription \u2014 skipped.";
  if (reason === "beta_expired") return "Beta access expired \u2014 skipped.";
  return "Validation limit reached \u2014 skipped.";
}
async function pollForCompletion(runId, opts) {
  const timeoutMs = opts.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
  const intervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const read = await fetchRunRow(runId, opts);
    if (read.ok && read.row.status === "complete") return "complete";
    if (read.ok && read.row.status === "error") return "error";
    await sleep(intervalMs);
  }
  return "timeout";
}
async function fetchRunRow(runId, opts) {
  try {
    const resp = await fetchWithTimeout(
      `${opts.supabaseUrl}/rest/v1/validation_runs?id=eq.${encodeURIComponent(runId)}&select=status,issue_count,design_system_context_id,advisories`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${opts.supabaseJwt}`,
          apikey: opts.supabaseAnonKey
        }
      }
    );
    if (!resp.ok) return { ok: false, reason: "http_error" };
    const rows = await resp.json();
    const row = rows[0];
    return row ? { ok: true, row } : { ok: false, reason: "absent" };
  } catch {
    return { ok: false, reason: "threw" };
  }
}
async function fetchContextRollupCounts(contextId, opts) {
  try {
    const [rollupResp, unresolvedResp] = await Promise.all([
      fetchWithTimeout(`${opts.supabaseUrl}/rest/v1/rpc/get_context_component_rollup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.supabaseJwt}`,
          apikey: opts.supabaseAnonKey
        },
        body: JSON.stringify({ p_context_id: contextId })
      }),
      fetchWithTimeout(`${opts.supabaseUrl}/rest/v1/rpc/get_context_unresolved_summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.supabaseJwt}`,
          apikey: opts.supabaseAnonKey
        },
        body: JSON.stringify({ p_context_id: contextId })
      })
    ]);
    if (!rollupResp.ok || !unresolvedResp.ok) return null;
    const rollupRows = await rollupResp.json();
    const unresolvedRows = await unresolvedResp.json();
    const tracked = rollupRows.length;
    const seen = rollupRows.filter((r) => r.occurrence_count > 0).length;
    const unresolved = unresolvedRows[0]?.unresolved_pending_count ?? 0;
    return { tracked, seen, unresolved };
  } catch {
    return null;
  }
}
async function mintShareToken(runId, opts) {
  try {
    const resp = await fetchWithTimeout(`${opts.supabaseUrl}/rest/v1/rpc/mint_validation_run_share_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.supabaseJwt}`,
        apikey: opts.supabaseAnonKey
      },
      body: JSON.stringify({ p_run_id: runId })
    });
    if (!resp.ok) return null;
    const token = await resp.json();
    return typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}
async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchWithTimeout(url, init) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}
async function deriveIdempotencyKey(repoFullName, headSha, contextKey, url) {
  const material = `ds:${repoFullName}:${headSha}:${contextKey}:${url}`;
  const encoded = new TextEncoder().encode(material);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `ds-${hex}`.slice(0, 128);
}

// src/runner-entry.ts
async function captureSnapshotViaLambda(lambdaUrl, lambdaSecret, options) {
  console.log(`[fidel-runner] Capturing snapshot via Lambda: ${options.url}`);
  const resp = await fetch(lambdaUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Snapshot-Secret": lambdaSecret
    },
    body: JSON.stringify({
      url: options.url,
      viewport: options.viewport,
      waitForLoadState: options.waitForLoadState ?? "networkidle",
      waitAfterLoadMs: options.waitAfterLoadMs ?? 500,
      waitForSelector: options.waitForSelector,
      scrollToBottom: true
    }),
    signal: AbortSignal.timeout(85e3)
    // Lambda timeout is 90s — abort 5s before to get a clean error
  });
  let data;
  try {
    data = await resp.json();
  } catch {
    const text = await resp.text().catch(() => "(empty body)");
    throw new Error(`Snapshot Lambda returned non-JSON response (${resp.status}): ${text.slice(0, 200)}`);
  }
  if (!resp.ok || !data.ok) {
    throw new Error(`Snapshot Lambda error (${resp.status}): ${data.error || "Unknown error"}${data.detail ? " \u2014 " + data.detail : ""}`);
  }
  console.log(`[fidel-runner] Snapshot Lambda returned ${data.domElements.length} elements in ${data.meta?.captureMs}ms`);
  return data.domElements;
}
function extractDesignSystemChecks(rawConfigJson) {
  if (!rawConfigJson) return [];
  let parsed;
  try {
    parsed = JSON.parse(rawConfigJson);
  } catch {
    return [];
  }
  const raw = parsed.designSystemChecks;
  if (!Array.isArray(raw)) return [];
  const MAX_ENTRIES = 10;
  const out = [];
  for (const entry of raw) {
    if (out.length >= MAX_ENTRIES) break;
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const rec = entry;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    if (!name || !url) continue;
    const brandKey = typeof rec.brandKey === "string" && rec.brandKey.trim() ? rec.brandKey.trim() : void 0;
    out.push({ name, url, ...brandKey ? { brandKey } : {} });
  }
  return out;
}
async function runDesignSystemLegIfConfigured(outputFile, templateVariables, headSha) {
  const dsChecks = extractDesignSystemChecks(process.env.CONFIG_JSON);
  if (dsChecks.length === 0) return;
  const webValidateUrl = process.env.WEB_VALIDATE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseJwt = process.env.SUPABASE_JWT;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const repository = process.env.REPOSITORY;
  if (!webValidateUrl || !supabaseUrl || !supabaseJwt || !supabaseAnonKey || !repository) {
    console.warn(
      "[fidel-runner] designSystemChecks configured but required env vars are missing (WEB_VALIDATE_URL/SUPABASE_URL/SUPABASE_JWT/SUPABASE_ANON_KEY/REPOSITORY) \u2014 skipping DS leg"
    );
    return;
  }
  console.log(`[fidel-runner] Running ${dsChecks.length} design-system check(s)`);
  let dsResults;
  try {
    dsResults = await runDesignSystemChecks({
      checks: dsChecks,
      webValidateUrl,
      supabaseUrl,
      supabaseAnonKey,
      supabaseJwt,
      templateVariables,
      repoFullName: repository,
      headSha: headSha ?? "",
      // Environment-correct report link. Unset on prod (the default is prod),
      // set to the staging web app by fidel-runner.yml when ENV_TAG=staging —
      // otherwise a staging run links to a prod report that does not exist.
      appBaseUrl: process.env.APP_BASE_URL
    });
  } catch (err) {
    console.warn(`[fidel-runner] design-system leg crashed (non-fatal): ${err.message}`);
    return;
  }
  const aggregate = aggregateDsOutcome(dsResults);
  console.log(
    `[fidel-runner] Design-system leg: ${summaryHeadline(aggregate)} \u2014 ` + dsResults.map((r) => `${r.name}=${r.completeness.state}`).join(" ")
  );
  for (const line of describeReasons(aggregate.reasons)) {
    console.log(`[fidel-runner]   \xB7 ${line}`);
  }
  if (outputFile) {
    const dsResultsB64 = Buffer.from(JSON.stringify(dsResults)).toString("base64");
    import_fs4.default.appendFileSync(outputFile, `ds_results=${dsResultsB64}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_result=${ciOutcomeFor(aggregate)}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_completeness=${aggregate.state}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_verified=${aggregate.verified}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_drift_count=${aggregate.driftCount}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_off_token_count=${aggregate.offTokenCount}
`);
    import_fs4.default.appendFileSync(
      outputFile,
      `ds_confirmed_violation_count=${confirmedViolationCount(aggregate)}
`
    );
    import_fs4.default.appendFileSync(outputFile, `ds_unverified_count=${aggregate.unverifiedCount}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_partial_reasons=${aggregate.reasons.join(",")}
`);
    import_fs4.default.appendFileSync(outputFile, `ds_retryable=${aggregate.retryable}
`);
  }
}
function aggregateDsOutcome(results) {
  if (results.length === 0) {
    return buildCompleteness({ state: "unverified", reasons: ["validation_not_attempted"], retryable: false });
  }
  let state = "complete";
  const reasons = [];
  let driftCount = 0;
  let offTokenCount = 0;
  let unverifiedCount = 0;
  let retryable = false;
  for (const r of results) {
    state = worseState(state, r.completeness.state);
    reasons.push(...r.completeness.reasons);
    driftCount = addCounts(driftCount, r.completeness.driftCount);
    offTokenCount = addCounts(offTokenCount, r.completeness.offTokenCount);
    unverifiedCount = addCounts(unverifiedCount, r.completeness.unverifiedCount);
    retryable = retryable || r.completeness.retryable;
  }
  return buildCompleteness({ state, reasons, driftCount, offTokenCount, unverifiedCount, retryable });
}
function addCounts(a, b) {
  if (a === null || b === null) return null;
  return a + b;
}
async function main() {
  const configJson = process.env.CONFIG_JSON;
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
  const supabaseJwt = process.env.SUPABASE_JWT;
  const pipelineUrl = process.env.PIPELINE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const prNumber = process.env.PR_NUMBER;
  const headSha = process.env.HEAD_SHA;
  const headBranch = process.env.HEAD_BRANCH;
  let legs;
  const dispatchLegsRaw = process.env.DISPATCH_LEGS;
  if (dispatchLegsRaw && dispatchLegsRaw.trim().length > 0) {
    try {
      legs = JSON.parse(dispatchLegsRaw);
    } catch (err) {
      console.warn(`[fidel-runner] Failed to parse DISPATCH_LEGS (treating as legacy): ${err.message}`);
    }
  }
  const outputFile = process.env.GITHUB_OUTPUT;
  const dsTemplateVariables = {
    pr: process.env.PR_NUMBER || void 0,
    sha: process.env.HEAD_SHA || void 0,
    branch: process.env.HEAD_BRANCH || void 0
  };
  if (legs?.figma === false) {
    const skipReason = legs.figmaSkipReason ?? "no_design_source";
    console.log(`[fidel-runner] Figma leg skipped (reason: ${skipReason})`);
    await runDesignSystemLegIfConfigured(outputFile, dsTemplateVariables, process.env.HEAD_SHA);
    const skipPayload = {
      status: "completed",
      results: [],
      legs: {
        designSystem: legs.designSystem,
        figma: false,
        figmaSkipReason: skipReason
      }
    };
    const resultsB642 = Buffer.from(JSON.stringify([])).toString("base64");
    if (outputFile) {
      import_fs4.default.appendFileSync(outputFile, `results=${resultsB642}
`);
      import_fs4.default.appendFileSync(outputFile, `dispatch_legs=${Buffer.from(JSON.stringify(skipPayload.legs)).toString("base64")}
`);
    }
    console.log(`[fidel-runner] Completed (figma skipped): 0 checks run`);
    return;
  }
  if (!configJson || !supabaseJwt || !pipelineUrl) {
    console.error("[fidel-runner] Missing required environment variables");
    process.exit(1);
  }
  if (!figmaToken) {
    console.log("[fidel-runner] Figma leg skipped (reason: no_figma_token)");
    await runDesignSystemLegIfConfigured(outputFile, dsTemplateVariables, process.env.HEAD_SHA);
    const skipPayload = {
      status: "completed",
      results: [],
      legs: {
        designSystem: legs?.designSystem,
        figma: false,
        figmaSkipReason: "no_figma_token"
      }
    };
    const resultsB642 = Buffer.from(JSON.stringify([])).toString("base64");
    if (outputFile) {
      import_fs4.default.appendFileSync(outputFile, `results=${resultsB642}
`);
      import_fs4.default.appendFileSync(outputFile, `dispatch_legs=${Buffer.from(JSON.stringify(skipPayload.legs)).toString("base64")}
`);
    }
    console.log("[fidel-runner] Completed (figma skipped): 0 checks run");
    return;
  }
  let effectiveConfigJson = configJson;
  try {
    const rawParsed = JSON.parse(configJson);
    const rawChecks = rawParsed?.checks;
    if (rawChecks !== void 0 && !Array.isArray(rawChecks) && typeof rawChecks === "object" && Array.isArray(rawChecks._legacyEntries)) {
      effectiveConfigJson = JSON.stringify({
        ...rawParsed,
        checks: rawChecks._legacyEntries
      });
    }
  } catch {
  }
  let config;
  try {
    const tmpConfigPath = "/tmp/fidel.config.json";
    import_fs4.default.writeFileSync(tmpConfigPath, effectiveConfigJson, "utf8");
    config = loadConfig(tmpConfigPath);
  } catch (err) {
    console.error(`[fidel-runner] Invalid config: ${err.message}`);
    process.exit(1);
  }
  const templateVariables = {
    pr: prNumber || void 0,
    sha: headSha || void 0,
    branch: headBranch || void 0
  };
  const resolvedChecks = config.checks.map(
    (check) => resolveCheck(check, config.defaults, templateVariables)
  );
  console.log(`[fidel-runner] Running ${resolvedChecks.length} check(s)`);
  const results = [];
  const repositoryFullName = process.env.REPOSITORY || "";
  for (const check of resolvedChecks) {
    results.push(await runCheck(check, figmaToken, pipelineUrl, supabaseJwt, supabaseAnonKey || "", repositoryFullName, headSha || ""));
  }
  const resultsB64 = Buffer.from(JSON.stringify(results)).toString("base64");
  const successCount = results.filter((r) => r.status === "success").length;
  const failCount = results.filter((r) => r.status === "failed").length;
  const firstFailure = results.find((r) => r.status === "failed");
  const errorCodeOutput = firstFailure ? deriveErrorPayload(new Error(firstFailure.error ?? ""), firstFailure.error ?? "").errorCode : "";
  if (outputFile) {
    import_fs4.default.appendFileSync(outputFile, `results=${resultsB64}
`);
    if (errorCodeOutput) {
      import_fs4.default.appendFileSync(outputFile, `error_code=${errorCodeOutput}
`);
    }
    if (legs) {
      import_fs4.default.appendFileSync(outputFile, `dispatch_legs=${Buffer.from(JSON.stringify(legs)).toString("base64")}
`);
    }
  }
  await runDesignSystemLegIfConfigured(outputFile, dsTemplateVariables, headSha);
  console.log(`[fidel-runner] Completed: ${successCount} passed, ${failCount} failed`);
  if (successCount === 0 && failCount > 0) {
    process.exit(1);
  }
}
async function runCheck(check, figmaToken, pipelineUrl, supabaseToken, anonKey, repositoryFullName, headSha) {
  const startedAt = Date.now();
  console.log(`[fidel-runner] Running check "${check.name}"`);
  try {
    const parsedFigmaUrl = parseFigmaUrl(check.figma);
    if (!parsedFigmaUrl) {
      throw new Error(`Invalid Figma URL: ${check.figma}`);
    }
    const figmaSpecs = await getSpecsWithCache(
      parsedFigmaUrl.fileKey,
      parsedFigmaUrl.nodeId,
      figmaToken,
      getFigmaSpecs
    );
    if (figmaSpecs.length === 0) {
      throw new Error(`No Figma specs returned for node ${parsedFigmaUrl.nodeId}`);
    }
    await waitForUrl(check.url);
    const snapshotLambdaUrl = process.env.SNAPSHOT_LAMBDA_URL;
    const snapshotLambdaSecret = process.env.SNAPSHOT_LAMBDA_SECRET || "";
    let domElements;
    if (snapshotLambdaUrl) {
      if (!snapshotLambdaSecret) {
        console.log("[fidel-runner] Warning: SNAPSHOT_LAMBDA_SECRET is not set \u2014 Lambda may reject unauthenticated requests");
      }
      domElements = await captureSnapshotViaLambda(snapshotLambdaUrl, snapshotLambdaSecret, {
        url: check.url,
        viewport: check.viewport,
        waitAfterLoadMs: check.waitAfterLoadMs,
        waitForLoadState: check.waitForLoadState,
        waitForSelector: check.waitForSelector
      });
    } else {
      const snapshotResult = await captureSnapshot({
        url: check.url,
        viewport: check.viewport,
        waitAfterLoadMs: check.waitAfterLoadMs,
        waitForLoadState: check.waitForLoadState,
        waitForSelector: check.waitForSelector
      });
      domElements = snapshotResult.elements;
    }
    if (domElements.length === 0) {
      throw new Error("Snapshot returned zero DOM elements");
    }
    const idempotencyKey = await deriveFigmaIdempotencyKey(
      repositoryFullName,
      headSha,
      check.figma,
      check.url
    );
    const pipeline = await runPipeline(
      figmaSpecs,
      domElements,
      pipelineUrl,
      supabaseToken,
      check.textMode,
      "supabase-jwt",
      { figmaUrl: check.figma, liveUrl: check.url, idempotencyKey }
    );
    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[fidel-runner] "${check.name}" scored ${pipeline.score}/100 with ${pipeline.totalDiffs} issue(s)`
    );
    saveRunToSupabaseAsRunner(check.figma, check.url, pipeline, supabaseToken, elapsedMs).catch((err) => {
      console.log(`[fidel-runner] Save run failed (non-fatal): ${err.message}`);
    });
    return {
      name: check.name,
      status: "success",
      figmaUrl: check.figma,
      previewUrl: check.url,
      score: pipeline.score,
      totalDiffs: pipeline.totalDiffs,
      criticalCount: countSeverity(pipeline.diffs, "critical"),
      highCount: countSeverity(pipeline.diffs, "high"),
      mediumCount: countSeverity(pipeline.diffs, "medium"),
      diffs: summarizeDiffs(pipeline.diffs),
      elapsedMs
    };
  } catch (error) {
    const message = error.message || String(error);
    const elapsedMs = Date.now() - startedAt;
    console.error(`[fidel-runner] Check "${check.name}" failed: ${message}`);
    const errorPayload = deriveErrorPayload(error, message);
    saveRunToSupabaseWithOptions({
      figmaUrl: check.figma,
      liveUrl: check.url,
      pipeline: null,
      supabaseToken,
      elapsedMs,
      errorPayload,
      errorMessage: message.slice(0, 500),
      source: "github-runner"
    }).catch((saveErr) => {
      console.log(`[fidel-runner] Save error run failed (non-fatal): ${saveErr.message}`);
    });
    return {
      name: check.name,
      status: "failed",
      figmaUrl: check.figma,
      previewUrl: check.url,
      error: message,
      elapsedMs
    };
  }
}
async function deriveFigmaIdempotencyKey(repoFullName, headSha, figmaUrl, liveUrl) {
  const material = `figma:${repoFullName}:${headSha}:${figmaUrl}:${liveUrl}`;
  const encoded = new TextEncoder().encode(material);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return `figma-${hex}`.slice(0, 128);
}
function deriveErrorPayload(error, message) {
  const withPayload = error;
  if (withPayload.pipelineErrorPayload) {
    return withPayload.pipelineErrorPayload;
  }
  const lower = message.toLowerCase();
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return { errorCode: "PIPELINE_TIMEOUT", isRetryable: true, userMessage: ERROR_CODE_META.PIPELINE_TIMEOUT.userMessage };
  }
  if (lower.includes("zero dom elements") || lower.includes("snapshot returned zero")) {
    return { errorCode: "ZERO_ELEMENTS_MATCHED", isRetryable: false, userMessage: ERROR_CODE_META.ZERO_ELEMENTS_MATCHED.userMessage };
  }
  if (lower.includes("figma") && (lower.includes("not accessible") || lower.includes("access denied"))) {
    return { errorCode: "FIGMA_ACCESS_DENIED", isRetryable: false, userMessage: ERROR_CODE_META.FIGMA_ACCESS_DENIED.userMessage };
  }
  if (lower.includes("figma") && lower.includes("not found")) {
    return { errorCode: "FIGMA_NOT_FOUND", isRetryable: false, userMessage: ERROR_CODE_META.FIGMA_NOT_FOUND.userMessage };
  }
  if (lower.includes("rate limit")) {
    return { errorCode: "FIGMA_RATE_LIMITED", isRetryable: true, userMessage: ERROR_CODE_META.FIGMA_RATE_LIMITED.userMessage };
  }
  if (lower.includes("unreachable") || lower.includes("url not ready")) {
    return { errorCode: "TARGET_UNREACHABLE", isRetryable: false, userMessage: ERROR_CODE_META.TARGET_UNREACHABLE.userMessage };
  }
  return { errorCode: "UNKNOWN_ERROR", isRetryable: true, userMessage: ERROR_CODE_META.UNKNOWN_ERROR.userMessage };
}
async function waitForUrl(url) {
  let delayMs = 5e3;
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const resp = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(1e4)
      });
      if (resp.status >= 200 && resp.status < 400 || resp.status === 401 || resp.status === 403) {
        return;
      }
    } catch {
    }
    console.log(`[fidel-runner] URL not ready (${attempt}/20): ${url}`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(Math.round(delayMs * 1.5), 3e4);
  }
  throw new Error(`URL unreachable after 20 polling attempts: ${url}`);
}
function countSeverity(diffs, severity) {
  return diffs.filter((d) => d.severity === severity).length;
}
function summarizeDiffs(diffs) {
  return diffs.filter((d) => d.severity === "critical" || d.severity === "high").slice(0, 25).map((d) => ({
    displayName: d.displayName || "",
    severity: d.severity,
    properties: (d.properties || []).slice(0, 3).map((p) => ({
      name: p.name,
      expected: p.expected,
      actual: p.actual
    })),
    figmaName: d.figma?.name,
    domAccessibleName: d.dom?.accessibleName
  }));
}
void main();
