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
  let fallbackFromText = false;
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
      if (isNearWhiteOrBlack(color)) {
        if (bgFallback.length === 0 && child.type === "TEXT") fallbackFromText = true;
        bgFallback.push(color);
      } else return child.type === "TEXT" ? { color, hasImageFill, fromText: true } : { color, hasImageFill };
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
    if (nested.color) return nested.fromText ? { color: nested.color, hasImageFill, fromText: true } : { color: nested.color, hasImageFill };
  }
  if (bgFallback.length > 0) return fallbackFromText ? { color: bgFallback[0], hasImageFill, fromText: true } : { color: bgFallback[0], hasImageFill };
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
var COMPONENT_KEY_RE = /^[A-Za-z0-9_-]{1,128}$/;
var NODE_ID_LIKE_RE = /^[A-Za-z0-9:;_-]{1,128}$/;
function componentMeta(node, components) {
  if (!components) return void 0;
  const id = node.type === "INSTANCE" ? node.componentId : node.type === "COMPONENT" ? node.id : void 0;
  if (!id || !Object.prototype.hasOwnProperty.call(components, id)) return void 0;
  return components[id] ?? void 0;
}
function resolveComponentKey(node, components) {
  const key = componentMeta(node, components)?.key;
  return typeof key === "string" && COMPONENT_KEY_RE.test(key) ? key : void 0;
}
function resolveMainComponentSetId(node, components) {
  const setId = componentMeta(node, components)?.componentSetId;
  return typeof setId === "string" && NODE_ID_LIKE_RE.test(setId) ? setId : void 0;
}
function componentIdentityFields(node, components) {
  const componentKey = resolveComponentKey(node, components);
  const mainComponentSetId = resolveMainComponentSetId(node, components);
  return {
    ...componentKey === void 0 ? {} : { componentKey },
    ...mainComponentSetId === void 0 ? {} : { mainComponentSetId }
  };
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
function resolveFluidWidth(node) {
  if (node.layoutSizingHorizontal === "FILL") return { cssWidth: "auto", flexGrow: 1 };
  if (node.layoutSizingHorizontal === "HUG") return { cssWidth: "fit-content" };
  if (node.layoutSizingHorizontal === "FIXED") return null;
  if (node.layoutGrow === 1) return { cssWidth: "auto", flexGrow: 1 };
  if (node.primaryAxisSizingMode === "AUTO" && node.layoutMode !== "VERTICAL") {
    return { cssWidth: "fit-content" };
  }
  return null;
}
function walkNode(node, specs, parentNames = [], rootBounds, varMap, parentNodeId, depth = 0, childIndex = 0, opts) {
  if (node.visible === false) return;
  if (ANNOTATION_NODE_TYPES.has(node.type)) return;
  const ownOpacity = typeof node.opacity === "number" && Number.isFinite(node.opacity) ? Math.min(1, Math.max(0, node.opacity)) : 1;
  const effectiveOpacity = (opts?.ancestorOpacity ?? 1) * ownOpacity;
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
            { ...opts, parent, ancestorOpacity: effectiveOpacity }
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
  let backgroundFromText = false;
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
    if (childColor.color && childColor.fromText) backgroundFromText = true;
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
    ...opts?.includeFluidWidth ? resolveFluidWidth(node) ?? {} : {},
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
    ...componentIdentityFields(node, opts?.components),
    componentSetId: node.componentSetId,
    baseComponentName: extractBaseComponentName(node.name)
  };
  if (effectiveOpacity < 1) spec.effectiveOpacity = effectiveOpacity;
  const unpainted = [];
  if (backgroundFromText && spec.backgroundColor) unpainted.push("backgroundColor");
  const strokeWidths = node.individualStrokeWeights ? [node.individualStrokeWeights.top, node.individualStrokeWeights.right, node.individualStrokeWeights.bottom, node.individualStrokeWeights.left] : node.strokeWeight !== void 0 ? [node.strokeWeight] : [];
  if (spec.borderColor && strokeWidths.length > 0 && strokeWidths.every((w) => w === 0)) unpainted.push("borderColor");
  if (effectiveOpacity === 0) {
    for (const key of ["color", "backgroundColor", "borderColor"]) {
      if (spec[key] && !unpainted.includes(key)) unpainted.push(key);
    }
  }
  if (!node.children || node.children.length === 0) {
    for (const key of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"]) {
      if (spec[key] !== void 0) unpainted.push(key);
    }
  }
  if (unpainted.length > 0) spec.unpaintedProperties = unpainted;
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
      inComponentInstance: inComponentInstance || enteringInstance,
      ancestorOpacity: effectiveOpacity
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
var RATE_LIMIT_RETRIES = 3;
var RATE_LIMIT_MAX_WAIT_MS = 3e4;
var RATE_LIMIT_DEFAULT_WAIT_MS = 5e3;
async function figmaFetch(url, init, sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms))) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, init);
    if (response.status !== 429 || attempt >= RATE_LIMIT_RETRIES) return response;
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1e3 : RATE_LIMIT_DEFAULT_WAIT_MS * 2 ** attempt;
    if (waitMs > RATE_LIMIT_MAX_WAIT_MS) return response;
    console.log(`[fidel-ci] Figma rate limit (429); retry ${attempt + 1}/${RATE_LIMIT_RETRIES} in ${Math.round(waitMs / 1e3)}s`);
    await sleep2(waitMs);
  }
}
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var isValidFileKey = (value) => /^[A-Za-z0-9_-]{15,200}$/.test(value);
var isValidNodeId = (value) => /^\d+:\d+$/.test(value);
async function fetchFigmaVariables(fileKey, figmaToken) {
  try {
    const endpoint = `https://api.figma.com/v1/files/${fileKey}/variables/local`;
    const headers = figmaAuthHeaders(figmaToken);
    const response = await figmaFetch(endpoint, { headers });
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
    figmaFetch(endpoint, { headers }),
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
  walkNode(root, specs, [], root.absoluteBoundingBox, varMap, void 0, 0, 0, {
    includeFluidWidth: (process.env.FIDEL_MATCH_SCALE_X ?? "").trim().toLowerCase() === "on"
  });
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
    userMessage: "Your Figma connection has expired. Reconnect Figma to keep validating.",
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
  WIRE_SCHEMA_MISMATCH: {
    retryable: false,
    userMessage: "The Fidel Action and the Fidel service disagree on the request format. Update the Action.",
    shortLabel: "Update the Action"
  },
  INCOMPATIBLE_ACTION_VERSION: {
    retryable: false,
    userMessage: "This Fidel Action is no longer compatible with the Fidel service. Upgrade to usefidel/fidel-action@v3.",
    shortLabel: "Upgrade the Action"
  },
  UNKNOWN_ERROR: {
    retryable: true,
    userMessage: "Something went wrong during validation. Try again \u2014 if it keeps failing, contact support.",
    shortLabel: "Unknown error"
  }
};

// src/unstructured-error.ts
var BOT_PROTECTION_ERROR = "Page blocked by bot protection";
var FIGMA_STATUS = /^figma api error: (\d{3})\b/;
var FIGMA_STATUS_CODES = {
  "401": "FIGMA_TOKEN_EXPIRED",
  "403": "FIGMA_ACCESS_DENIED",
  "404": "FIGMA_NOT_FOUND",
  "429": "FIGMA_RATE_LIMITED"
};
var typed = (code) => ({
  errorCode: code,
  isRetryable: ERROR_CODE_META[code].retryable,
  userMessage: ERROR_CODE_META[code].userMessage
});
function classifyUnstructuredError(message) {
  const lower = message.trim().toLowerCase();
  const figma = FIGMA_STATUS.exec(lower);
  if (figma && FIGMA_STATUS_CODES[figma[1]]) return typed(FIGMA_STATUS_CODES[figma[1]]);
  if (lower.includes("blocked by bot protection")) return typed("TARGET_CSP_BLOCKED");
  if (lower.includes("timeout") || lower.includes("timed out")) return typed("PIPELINE_TIMEOUT");
  if (lower.includes("zero dom elements") || lower.includes("snapshot returned zero")) return typed("ZERO_ELEMENTS_MATCHED");
  if (lower.includes("figma") && (lower.includes("not accessible") || lower.includes("access denied"))) return typed("FIGMA_ACCESS_DENIED");
  if (lower.includes("figma") && lower.includes("not found")) return typed("FIGMA_NOT_FOUND");
  if (lower.includes("rate limit")) return typed("FIGMA_RATE_LIMITED");
  if (lower.includes("unreachable") || lower.includes("url not ready")) return typed("TARGET_UNREACHABLE");
  return null;
}

// node_modules/@usefidel/contracts/dist/pipeline-wire-version.js
var PIPELINE_WIRE_VERSION = "fidel.pipeline-wire/1";

// src/pipeline.ts
var PACKAGE_VERSION = "3.3.0";
var DEFAULT_TIMEOUT_MS = 9e4;
var WARNING_PAYLOAD_BYTES = 2 * 1024 * 1024;
var LAMBDA_MAX_BODY_BYTES = 6 * 1024 * 1024;
var CONTAINER_CAPTURE_BODY_BUDGET = 3.5 * 1024 * 1024;
function toAxTreePayload(axTree) {
  const stripChildren = (n) => ({ ...n, children: [] });
  const payload = {
    semanticNodes: axTree.semanticNodes.map(stripChildren),
    landmarks: axTree.landmarks.map(stripChildren),
    pageWidth: axTree.pageWidth,
    pageHeight: axTree.pageHeight,
    domNodeCount: axTree.domNodeCount,
    extractionTimeMs: axTree.extractionTimeMs
  };
  if (axTree.containerCapture) payload.containerCapture = axTree.containerCapture;
  return payload;
}
function isCaptureIncompleteRow(row) {
  if (!row || typeof row !== "object") return false;
  const r = row;
  return r.category === "missing" && r.evidenceState === "unverified" && r.reasonCode === "capture_incomplete";
}
function boundedText(value) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (t === "") return null;
  return t.length > 200 ? t.slice(0, 200) : t;
}
var RUNNER_NOT_VERIFIED_CAP = 25;
function runnerFindingFields(diffs) {
  const findings = diffs.filter((d) => !isCaptureIncompleteRow(d));
  const count = (severity) => findings.filter((d) => d.severity === severity).length;
  const summaries = findings.filter((d) => d.severity === "critical" || d.severity === "high").slice(0, 25).map((d) => ({
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
  const notVerified = notVerifiedItems(diffs);
  return {
    criticalCount: count("critical"),
    highCount: count("high"),
    mediumCount: count("medium"),
    diffs: summaries,
    ...notVerified.length > 0 ? { notVerified: notVerified.slice(0, RUNNER_NOT_VERIFIED_CAP), notVerifiedCount: notVerified.length } : {}
  };
}
function notVerifiedItems(diffs) {
  const out = [];
  for (const d of diffs) {
    if (!isCaptureIncompleteRow(d)) continue;
    const r = d;
    const text = boundedText(r.figma?.text);
    out.push({
      figmaNodeId: boundedText(r.figma?.nodeId),
      // Bounded before quoting (200 - 7), so a long text keeps its closing quote.
      name: (text !== null ? `Text "${text.slice(0, 193)}"` : null) ?? boundedText(r.displayName) ?? boundedText(r.figma?.name) ?? "Unknown element"
    });
  }
  return out;
}
var CONFIGURATION_ERROR_CODES = /* @__PURE__ */ new Set([
  "INCOMPATIBLE_ACTION_VERSION",
  "WIRE_SCHEMA_MISMATCH"
]);
function classifyFailureBatch(errorCodes) {
  if (errorCodes.length === 0) return "none";
  const allConfiguration = errorCodes.every(
    (code) => typeof code === "string" && CONFIGURATION_ERROR_CODES.has(code)
  );
  return allConfiguration ? "configuration_required" : "operational_failure";
}
function assertUsableBackend(backend, context) {
  const fail = (why) => {
    throw new Error(`[fidel-runner] refusing to run: ${context} backend ${why}`);
  };
  if (!backend.url) fail("URL is empty");
  if (!backend.anonKey) fail("key is empty");
  let parsed;
  try {
    parsed = new URL(backend.url);
  } catch {
    return fail(`URL is not a URL: ${JSON.stringify(backend.url.slice(0, 60))}`);
  }
  if (parsed.protocol !== "https:") fail(`URL is not https (${parsed.protocol})`);
  if (!parsed.hostname.endsWith(".supabase.co")) {
    fail(`URL host ${parsed.hostname} is not a .supabase.co host`);
  }
}
async function runPipelineWithBackend(figmaSpecs, domElements, pipelineUrl, authToken, textMode, authMode, options, backend) {
  assertUsableBackend(backend, "pipeline");
  return runPipelineInternal(
    figmaSpecs,
    domElements,
    pipelineUrl,
    authToken,
    textMode,
    authMode,
    options,
    backend.anonKey,
    "runner"
  );
}
async function runPipelineInternal(figmaSpecs, domElements, pipelineUrl, authToken, textMode, authMode, options, apikey, caller) {
  const bodyPayload = {
    // Brief 2.1. Declares which request contract this build speaks. Its
    // ABSENCE means fidel.pipeline-wire/0 — a pre-2.1 Action — which the
    // Lambda accepts or rejects per FIDEL_WIRE_STRICT.
    wire: PIPELINE_WIRE_VERSION,
    validationMode: "figma_vs_live",
    figmaSpecs,
    domElements,
    textMode
  };
  if (options.figmaUrl) bodyPayload.figmaUrl = options.figmaUrl;
  if (options.liveUrl) bodyPayload.liveUrl = options.liveUrl;
  if (options.idempotencyKey) bodyPayload.idempotencyKey = options.idempotencyKey;
  if (options.viewport) bodyPayload.viewport = options.viewport;
  let body;
  if (options.axTree) {
    const axPayload = toAxTreePayload(options.axTree);
    bodyPayload.axTree = axPayload;
    if (axPayload.containerCapture && options.containerCaptureGrant) bodyPayload.containerCaptureGrant = options.containerCaptureGrant;
    let withAxTree = JSON.stringify(bodyPayload);
    if (axPayload.containerCapture && Buffer.byteLength(withAxTree) > CONTAINER_CAPTURE_BODY_BUDGET) {
      console.log(`[fidel-ci] container_capture_dropped_size bytes=${Buffer.byteLength(withAxTree)}`);
      delete axPayload.containerCapture;
      delete bodyPayload.containerCaptureGrant;
      withAxTree = JSON.stringify(bodyPayload);
    }
    if (Buffer.byteLength(withAxTree) > LAMBDA_MAX_BODY_BYTES) {
      console.log(`[fidel-ci] axtree_dropped_size bytes=${Buffer.byteLength(withAxTree)}`);
      delete bodyPayload.axTree;
      delete bodyPayload.containerCaptureGrant;
      body = JSON.stringify(bodyPayload);
    } else {
      body = withAxTree;
    }
  } else {
    body = JSON.stringify(bodyPayload);
  }
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
    headers.apikey = apikey;
  }
  headers[caller === "runner" ? "X-Fidel-Runner-Version" : "X-Fidel-Action-Version"] = PACKAGE_VERSION;
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
        const record = parsed && typeof parsed === "object" ? parsed : {};
        const upgradeTo = typeof record.upgradeTo === "string" && record.upgradeTo.length <= 120 ? record.upgradeTo : void 0;
        const docs = typeof record.docs === "string" && record.docs.length <= 300 ? record.docs : void 0;
        err.pipelineErrorPayload = {
          errorCode,
          isRetryable: meta.retryable,
          userMessage: meta.userMessage,
          ...upgradeTo ? { upgradeTo } : {},
          ...docs ? { docs } : {}
        };
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
async function saveRunForRunner(opts) {
  assertUsableBackend(opts.backend, "save-run");
  return saveRunTo(opts.backend, { ...opts, source: "github-runner" });
}
async function saveRunTo(backend, opts) {
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
  const allDiffs = pipeline?.diffs ?? [];
  const notVerified = notVerifiedItems(allDiffs);
  const findings = notVerified.length > 0 ? allDiffs.filter((d) => !isCaptureIncompleteRow(d)) : allDiffs;
  const diffPayload = findings.map((d, idx) => ({
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
  if (notVerified.length > 0) body.notVerified = notVerified;
  if (isError && errorPayload) {
    body.errorCode = errorPayload.errorCode;
    body.isRetryable = errorPayload.isRetryable;
    body.errorMessage = errorMessage ?? errorPayload.userMessage;
  }
  const diagnostics = pipeline?.diagnostics;
  if (diagnostics && typeof diagnostics === "object") {
    if (typeof diagnostics.actionVersion === "string") body.actionVersion = diagnostics.actionVersion;
    if (typeof diagnostics.runnerVersion === "string") body.runnerVersion = diagnostics.runnerVersion;
    if (typeof diagnostics.pipelineBuild === "string") body.pipelineBuild = diagnostics.pipelineBuild;
    if (typeof diagnostics.wire === "string") body.wireVersion = diagnostics.wire;
    if (typeof diagnostics.clientWire === "string") body.inboundWire = diagnostics.clientWire;
  }
  const resp = await fetch(`${backend.url}/functions/v1/save-run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseToken}`,
      apikey: backend.anonKey
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15e3)
  });
  if (resp.ok) {
    console.log(`[fidel-ci] Run saved to Supabase (status: ${isError ? "error" : "complete"})`);
    const saved = await resp.json().catch(() => null);
    if (typeof saved?.runId !== "string") return null;
    return { runId: saved.runId, webUrl: typeof saved.webUrl === "string" ? saved.webUrl : void 0 };
  } else {
    const respBody = await resp.text().catch(() => "");
    console.error(`[fidel-ci] Failed to save run (non-fatal): HTTP ${resp.status}`, respBody.slice(0, 200));
    return null;
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
function legacyShouldCollapse(node) {
  if (!COLLAPSIBLE_ROLES.has(node.role)) return false;
  if (node.name && node.name.trim().length > 0) return false;
  if (node.isLandmark) return false;
  if (node.tagName === "SECTION") return false;
  return true;
}
function childIsMatchableShape(child) {
  if (!childHasGeometry(child) || child.isHidden) return false;
  if (child.name && child.name.trim().length > 0) return true;
  if (child.isLandmark) return true;
  if (!COLLAPSIBLE_ROLES.has(child.role)) return true;
  const tag = (child.tagName || "").toUpperCase();
  if (tag === "SECTION" || tag === "IMG" || tag === "SVG" || tag === "VIDEO" || tag === "CANVAS") return true;
  return child.children.some(childIsMatchableShape);
}
function specShouldCollapse(node) {
  if (!COLLAPSIBLE_ROLES.has(node.role)) return false;
  if (node.name && node.name.trim().length > 0) return false;
  if (node.isLandmark) return false;
  const tag = (node.tagName || "").toUpperCase();
  if ((tag === "SECTION" || tag === "IMG" || tag === "SVG" || tag === "VIDEO" || tag === "CANVAS") && childHasGeometry(node)) {
    return false;
  }
  const matchableChildren = node.children.filter(childIsMatchableShape);
  if (matchableChildren.length > 1) return false;
  if (matchableChildren.length === 1 && tag !== "SECTION" && tag !== "IMG" && tag !== "SVG") return true;
  if (matchableChildren.length >= 1) return false;
  return true;
}
function childHasGeometry(node) {
  return !!node.bounds && node.bounds.width > 0 && node.bounds.height > 0;
}
function matchableNodeMode() {
  const value = process.env.FIDEL_MATCHABLE_NODE;
  if (value === "off" || value === "shadow" || value === "on") return value;
  return "shadow";
}
var AX_COLLAPSE_SHADOW_LOG_CAP = 20;
var axCollapseShadowLogs = 0;
function shouldCollapseAxNode(node) {
  const legacy = legacyShouldCollapse(node);
  const spec = specShouldCollapse(node);
  const mode = matchableNodeMode();
  if (mode === "on") return spec;
  if (mode === "shadow" && legacy !== spec) {
    axCollapseShadowLogs += 1;
    if (axCollapseShadowLogs <= AX_COLLAPSE_SHADOW_LOG_CAP) {
      console.log(JSON.stringify({
        event: "ax_collapse_shadow",
        nodeId: node.axNodeId,
        legacy,
        spec
      }));
    } else if (axCollapseShadowLogs === AX_COLLAPSE_SHADOW_LOG_CAP + 1) {
      console.log(JSON.stringify({
        event: "ax_collapse_shadow",
        suppressedAfter: AX_COLLAPSE_SHADOW_LOG_CAP
      }));
    }
  }
  return legacy;
}
function collapseGenericNodes(root) {
  for (let i = root.children.length - 1; i >= 0; i--) {
    collapseGenericNodes(root.children[i]);
  }
  const newChildren = [];
  for (const child of root.children) {
    if (shouldCollapseAxNode(child)) {
      for (const grandchild of child.children) {
        grandchild.parentAxNodeId = root.axNodeId;
        if (!grandchild.bounds && child.bounds) {
          grandchild.bounds = { ...child.bounds };
        }
        if (grandchild.backendDOMNodeId === 0 && child.backendDOMNodeId > 0) {
          grandchild.backendDOMNodeId = child.backendDOMNodeId;
          grandchild.backendDOMNodeIdInherited = true;
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
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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

// src/font-family-list.ts
var GENERICS = /* @__PURE__ */ new Set([
  "serif",
  "sans-serif",
  "system-ui",
  "cursive",
  "fantasy",
  "math",
  "monospace",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "fangsong"
]);
var CSS_WIDE = /* @__PURE__ */ new Set(["inherit", "initial", "unset", "revert", "revert-layer"]);
var RESERVED_FIRST_WORD = /* @__PURE__ */ new Set(["serif", "sans-serif", "system-ui", "cursive", "fantasy", "math", "monospace"]);
function isWs(ch) {
  return ch === " " || ch === "\n" || ch === "\r" || ch === "	" || ch === "\f";
}
function parseCssEscape(source, index) {
  if (source[index] !== "\\") return null;
  const hexRe = /[0-9a-fA-F]{1,6}/y;
  hexRe.lastIndex = index + 1;
  const hex = hexRe.exec(source);
  if (hex) {
    let next = index + 1 + hex[0].length;
    if (isWs(source[next])) next += 1;
    const code = Number.parseInt(hex[0], 16);
    const char = code === 0 || code > 1114111 ? "\uFFFD" : String.fromCodePoint(code);
    return { char, next };
  }
  const nextChar = source[index + 1];
  if (nextChar === void 0) return { char: "\uFFFD", next: index + 1 };
  if (nextChar === "\n" || nextChar === "\r" && source[index + 2] !== "\n") return { char: "", next: index + 2 };
  if (nextChar === "\r") return { char: "", next: index + 3 };
  return { char: nextChar, next: index + 2 };
}
function parseCssString(source, index) {
  const quote = source[index];
  if (quote !== '"' && quote !== "'") return null;
  let value = "";
  let cursor = index + 1;
  while (cursor < source.length) {
    const ch = source[cursor];
    if (ch === void 0) return null;
    if (ch === quote) return { value, next: cursor + 1 };
    if (ch === "\n" || ch === "\r") return null;
    if (ch === "\\") {
      if (cursor + 1 >= source.length) {
        cursor += 1;
        continue;
      }
      const escaped = parseCssEscape(source, cursor);
      if (!escaped) return null;
      value += escaped.char;
      cursor = escaped.next;
      continue;
    }
    value += ch;
    cursor += 1;
  }
  return { value, next: source.length };
}
function identStart(source, index) {
  const ch = source[index];
  if (ch === void 0) return false;
  if (ch === "\\") return true;
  if (ch === "-") {
    const next = source[index + 1];
    return next === "-" || next === "\\" || next !== void 0 && /[A-Za-z_\u00A0-\uFFFF]/.test(next);
  }
  return /[A-Za-z_\u00A0-\uFFFF]/.test(ch);
}
function identContinue(source, index) {
  const ch = source[index];
  if (ch === void 0) return false;
  if (ch === "\\") return true;
  return /[A-Za-z0-9_\u00A0-\uFFFF-]/.test(ch);
}
function parseIdent(source, index) {
  if (!identStart(source, index)) return null;
  let value = "";
  let cursor = index;
  while (cursor < source.length && identContinue(source, cursor)) {
    const ch = source[cursor];
    if (ch === "\\") {
      const escaped = parseCssEscape(source, cursor);
      if (!escaped || escaped.char === "") return null;
      value += escaped.char;
      cursor = escaped.next;
      continue;
    }
    if (ch === void 0) break;
    value += ch;
    cursor += 1;
  }
  if (value.length === 0 || value === "-") return null;
  return { value, next: cursor };
}
var MAX_FONT_FAMILY_LIST_LENGTH = 4096;
function parseFontFamilyList(value) {
  const families = [];
  let cursor = 0;
  if (typeof value !== "string" || value.length > MAX_FONT_FAMILY_LIST_LENGTH) return { parsed: false, reason: "unparsed" };
  const source = value.trim();
  if (source.length === 0) return { parsed: false, reason: "unparsed" };
  while (cursor < source.length) {
    cursor = skipSpace(source, cursor);
    if (cursor >= source.length) break;
    const quoted = parseCssString(source, cursor);
    if (quoted) {
      families.push({ kind: "family", name: quoted.value });
      cursor = skipSpace(source, quoted.next);
    } else {
      const idents = [];
      while (cursor < source.length) {
        const ident = parseIdent(source, cursor);
        if (!ident) break;
        idents.push(ident.value);
        const after = skipSpace(source, ident.next);
        if (after === ident.next || source[after] === ",") {
          cursor = after;
          break;
        }
        cursor = after;
      }
      if (idents.length === 0) return { parsed: false, reason: "unparsed" };
      const name = idents.join(" ");
      const folded = asciiLower(name);
      const first = asciiLower(idents[0]);
      if (idents.length === 1 && (CSS_WIDE.has(first) || first === "default")) return { parsed: false, reason: "unparsed" };
      if (idents.length === 1 && GENERICS.has(folded)) families.push({ kind: "generic", name: folded });
      else if (RESERVED_FIRST_WORD.has(first)) return { parsed: false, reason: "unparsed" };
      else families.push({ kind: "family", name });
    }
    cursor = skipSpace(source, cursor);
    if (cursor >= source.length) break;
    if (source[cursor] !== ",") return { parsed: false, reason: "unparsed" };
    cursor += 1;
    const next = skipSpace(source, cursor);
    if (next >= source.length) return { parsed: false, reason: "unparsed" };
    cursor = next;
  }
  if (families.length === 0) return { parsed: false, reason: "unparsed" };
  return { parsed: true, families };
}
function skipSpace(source, index) {
  let cursor = index;
  for (; ; ) {
    while (isWs(source[cursor])) cursor += 1;
    if (source[cursor] === "/" && source[cursor + 1] === "*") {
      const end = source.indexOf("*/", cursor + 2);
      cursor = end < 0 ? source.length : end + 2;
      continue;
    }
    return cursor;
  }
}
function asciiLower(value) {
  return value.replace(/[A-Z]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 32));
}

// src/platform-fonts-capture.ts
var import_node_crypto = require("node:crypto");

// src/font-name-table.ts
var import_node_zlib = require("node:zlib");
var MAX_FONT_BYTES = 8 * 1024 * 1024;
var MAX_DECOMPRESSED_BYTES = 24 * 1024 * 1024;
var MAX_NAME_TABLE_BYTES = 512 * 1024;
var MAX_AUX_TABLE_BYTES = 64 * 1024;
var MAX_NAME_RECORDS = 4096;
var MAX_TABLES = 512;
var MAX_COLLECTION_FONTS = 64;
var MAX_NAME_LENGTH = 256;
var MAX_FVAR_AXES = 64;
var MAX_FVAR_INSTANCES = 1024;
var MAX_STAT_VALUES = 1024;
var MAX_DECOMPRESS_MS = 250;
var Bounds = class extends Error {
};
var Reader = class {
  constructor(b) {
    this.b = b;
  }
  get length() {
    return this.b.length;
  }
  u8(o) {
    if (!Number.isInteger(o) || o < 0 || o + 1 > this.b.length) throw new Bounds();
    return this.b[o];
  }
  u16(o) {
    return this.u8(o) << 8 | this.u8(o + 1);
  }
  u32(o) {
    return (this.u16(o) << 16 >>> 0) + this.u16(o + 2);
  }
  i32(o) {
    return this.u32(o) | 0;
  }
  slice(o, len) {
    if (!Number.isInteger(o) || !Number.isInteger(len) || o < 0 || len < 0 || o + len > this.b.length) throw new Bounds();
    return this.b.subarray(o, o + len);
  }
};
var TAG_NAME = 1851878757;
var TAG_FVAR = 1719034226;
var TAG_STAT = 1398030676;
async function readFontNames(bytes) {
  try {
    if (!(bytes instanceof Uint8Array)) return { ok: false, reason: "error" };
    if (bytes.length > MAX_FONT_BYTES) return { ok: false, reason: "too-large" };
    if (bytes.length < 12) return { ok: false, reason: "truncated" };
    const r = new Reader(bytes);
    const sig = r.u32(0);
    if (sig === 2001684018) return await fromWoff2(r);
    if (sig === 2001684038) return fromWoff(r);
    if (sig === 1953784678) return fromCollection(r);
    if (sig === 65536 || sig === 1330926671 || sig === 1953658213) {
      const tables = sfntTables(r, 0);
      if (!tables) return { ok: false, reason: "no-name-table" };
      const face = faceFromTables(tables);
      return face ? { ok: true, format: "sfnt", faces: [face] } : { ok: false, reason: "bad-name-table" };
    }
    return { ok: false, reason: "unknown-format" };
  } catch (e) {
    return { ok: false, reason: e instanceof Bounds ? "truncated" : "error" };
  }
}
function sfntTables(r, base) {
  const numTables = r.u16(base + 4);
  if (numTables > MAX_TABLES) throw new Bounds();
  let name = null;
  let fvar;
  let stat;
  let variable = false;
  for (let i = 0; i < numTables; i++) {
    const rec = base + 12 + i * 16;
    const tag = r.u32(rec);
    if (tag !== TAG_NAME && tag !== TAG_FVAR && tag !== TAG_STAT) continue;
    const offset = r.u32(rec + 8);
    const length = r.u32(rec + 12);
    if (tag === TAG_FVAR) variable = true;
    if (tag === TAG_NAME) {
      if (length > MAX_NAME_TABLE_BYTES) return null;
      name = r.slice(offset, length);
    } else if (length <= MAX_AUX_TABLE_BYTES) {
      const data = r.slice(offset, length);
      if (tag === TAG_FVAR) fvar = data;
      else stat = data;
    }
  }
  return name ? { name, variable, ...fvar ? { fvar } : {}, ...stat ? { stat } : {} } : null;
}
function fromCollection(r) {
  const numFonts = r.u32(8);
  if (numFonts === 0 || numFonts > MAX_COLLECTION_FONTS) return { ok: false, reason: "bad-name-table" };
  const faces = [];
  for (let i = 0; i < numFonts; i++) {
    const tables = sfntTables(r, r.u32(12 + i * 4));
    const face = tables ? faceFromTables(tables) : null;
    if (face) faces.push(face);
  }
  return faces.length > 0 ? { ok: true, format: "ttc", faces } : { ok: false, reason: "no-name-table" };
}
function fromWoff(r) {
  const numTables = r.u16(12);
  if (numTables > MAX_TABLES) return { ok: false, reason: "bad-name-table" };
  const read = (i, cap) => {
    const rec = 44 + i * 20;
    const offset = r.u32(rec + 4);
    const compLength = r.u32(rec + 8);
    const origLength = r.u32(rec + 12);
    if (origLength > cap || compLength > origLength) return null;
    const data = r.slice(offset, compLength);
    if (compLength === origLength) return data;
    let table;
    try {
      table = (0, import_node_zlib.inflateSync)(data, { maxOutputLength: cap });
    } catch {
      return "failed";
    }
    return table.length === origLength ? table : "failed";
  };
  let tables = null;
  let fvar;
  let stat;
  let variable = false;
  for (let i = 0; i < numTables; i++) {
    const tag = r.u32(44 + i * 20);
    if (tag === TAG_NAME) {
      const t = read(i, MAX_NAME_TABLE_BYTES);
      if (t === "failed") return { ok: false, reason: "decompress-failed" };
      if (t === null) return { ok: false, reason: "bad-name-table" };
      tables = { name: t, variable: false };
    } else if (tag === TAG_FVAR || tag === TAG_STAT) {
      if (tag === TAG_FVAR) variable = true;
      const t = read(i, MAX_AUX_TABLE_BYTES);
      if (t instanceof Uint8Array) {
        if (tag === TAG_FVAR) fvar = t;
        else stat = t;
      }
    }
  }
  if (!tables) return { ok: false, reason: "no-name-table" };
  const face = faceFromTables({ name: tables.name, variable, ...fvar ? { fvar } : {}, ...stat ? { stat } : {} });
  return face ? { ok: true, format: "woff", faces: [face] } : { ok: false, reason: "bad-name-table" };
}
var WOFF2_TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill"
];
function base128(r, o) {
  let value = 0;
  for (let i = 0; i < 5; i++) {
    const byte = r.u8(o + i);
    if (i === 0 && byte === 128) throw new Bounds();
    if (value > 536870911) throw new Bounds();
    value = value * 128 + (byte & 127);
    if ((byte & 128) === 0) return { value, next: o + i + 1 };
  }
  throw new Bounds();
}
async function fromWoff2(r) {
  const flavor = r.u32(4);
  if (flavor === 1953784678) return { ok: false, reason: "collection-in-woff2" };
  const numTables = r.u16(12);
  const totalCompressedSize = r.u32(20);
  if (numTables > MAX_TABLES) return { ok: false, reason: "bad-name-table" };
  let o = 48;
  let streamOffset = 0;
  const wanted = [];
  let variable = false;
  for (let i = 0; i < numTables; i++) {
    const flags = r.u8(o);
    o += 1;
    const tagIndex = flags & 63;
    const transform = flags >> 6;
    let tag;
    if (tagIndex === 63) {
      const t = r.u32(o);
      o += 4;
      tag = String.fromCharCode(t >>> 24, t >>> 16 & 255, t >>> 8 & 255, t & 255);
    } else tag = WOFF2_TAGS[tagIndex] ?? "";
    const orig = base128(r, o);
    o = orig.next;
    let length = orig.value;
    const transformed = tag === "glyf" || tag === "loca" ? transform !== 3 : transform !== 0;
    if (transformed) {
      const t = base128(r, o);
      o = t.next;
      length = t.value;
    }
    if (tag === "fvar") variable = true;
    if (tag === "name") {
      if (transformed || length > MAX_NAME_TABLE_BYTES) return { ok: false, reason: "bad-name-table" };
      wanted.push({ tag: "name", at: streamOffset, length });
    } else if ((tag === "fvar" || tag === "STAT") && !transformed && length <= MAX_AUX_TABLE_BYTES) {
      wanted.push({ tag, at: streamOffset, length });
    }
    streamOffset += length;
    if (streamOffset > MAX_DECOMPRESSED_BYTES) return { ok: false, reason: "too-large" };
  }
  if (!wanted.some((w) => w.tag === "name")) return { ok: false, reason: "no-name-table" };
  const compressed = r.slice(o, totalCompressedSize);
  const parts = await decompressRanges(compressed, wanted);
  if (!parts) return { ok: false, reason: "decompress-failed" };
  const get = (tag) => parts[wanted.findIndex((w) => w.tag === tag)];
  const fvar = get("fvar");
  const stat = get("STAT");
  const face = faceFromTables({ name: get("name"), variable, ...fvar ? { fvar } : {}, ...stat ? { stat } : {} });
  return face ? { ok: true, format: "woff2", faces: [face] } : { ok: false, reason: "bad-name-table" };
}
function decompressRanges(compressed, ranges) {
  const end = ranges.reduce((m, x) => Math.max(m, x.at + x.length), 0);
  const out = ranges.map((x) => new Uint8Array(x.length));
  return new Promise((resolve) => {
    let pos = 0;
    let done = false;
    const stream = (0, import_node_zlib.createBrotliDecompress)({ chunkSize: 64 * 1024 });
    const timer = setTimeout(() => finish(false), MAX_DECOMPRESS_MS);
    function finish(ok) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      stream.removeAllListeners("data");
      stream.on("error", () => {
      });
      stream.destroy();
      resolve(ok ? out : null);
    }
    stream.on("data", (chunk) => {
      if (done) return;
      const start = pos;
      pos += chunk.length;
      ranges.forEach((x, i) => {
        const from = Math.max(x.at, start);
        const to = Math.min(x.at + x.length, pos);
        if (from < to) out[i].set(chunk.subarray(from - start, to - start), from - x.at);
      });
      if (pos >= end) finish(true);
    });
    stream.on("error", () => finish(false));
    stream.on("end", () => finish(pos >= end));
    if (end === 0) {
      finish(true);
      return;
    }
    stream.end(Buffer.from(compressed.buffer, compressed.byteOffset, compressed.byteLength));
  });
}
var MAC_ROMAN_HIGH = String.fromCharCode(
  196,
  197,
  199,
  201,
  209,
  214,
  220,
  225,
  224,
  226,
  228,
  227,
  229,
  231,
  233,
  232,
  234,
  235,
  237,
  236,
  238,
  239,
  241,
  243,
  242,
  244,
  246,
  245,
  250,
  249,
  251,
  252,
  8224,
  176,
  162,
  163,
  167,
  8226,
  182,
  223,
  174,
  169,
  8482,
  180,
  168,
  8800,
  198,
  216,
  8734,
  177,
  8804,
  8805,
  165,
  181,
  8706,
  8721,
  8719,
  960,
  8747,
  170,
  186,
  937,
  230,
  248,
  191,
  161,
  172,
  8730,
  402,
  8776,
  8710,
  171,
  187,
  8230,
  160,
  192,
  195,
  213,
  338,
  339,
  8211,
  8212,
  8220,
  8221,
  8216,
  8217,
  247,
  9674,
  255,
  376,
  8260,
  8364,
  8249,
  8250,
  64257,
  64258,
  8225,
  183,
  8218,
  8222,
  8240,
  194,
  202,
  193,
  203,
  200,
  205,
  206,
  207,
  204,
  211,
  212,
  63743,
  210,
  218,
  219,
  217,
  305,
  710,
  732,
  175,
  728,
  729,
  730,
  184,
  733,
  731,
  711
);
function decodeName(platform, encoding, bytes) {
  let out = "";
  if (platform === 0 || platform === 3 && (encoding === 1 || encoding === 10 || encoding === 0)) {
    const n = bytes.length - bytes.length % 2;
    for (let i = 0; i < n && out.length < MAX_NAME_LENGTH; i += 2) out += String.fromCharCode(bytes[i] << 8 | bytes[i + 1]);
  } else if (platform === 1 && encoding === 0) {
    for (let i = 0; i < bytes.length && out.length < MAX_NAME_LENGTH; i++) {
      const c = bytes[i];
      out += c < 128 ? String.fromCharCode(c) : MAC_ROMAN_HIGH[c - 128];
    }
  } else {
    return null;
  }
  const clean = out.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!clean || /[\uD800-\uDFFF]/.test(clean.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ""))) return null;
  return clean.slice(0, MAX_NAME_LENGTH);
}
function rank(platform, language) {
  if (platform === 3) return language === 1033 ? 0 : 1;
  if (platform === 0) return 2;
  if (platform === 1) return language === 0 ? 3 : 4;
  return 9;
}
function parseNameRecords(table) {
  if (table.length > MAX_NAME_TABLE_BYTES) return null;
  const r = new Reader(table);
  try {
    const count = r.u16(2);
    const storage = r.u16(4);
    if (count > MAX_NAME_RECORDS) return null;
    const best = /* @__PURE__ */ new Map();
    for (let i = 0; i < count; i++) {
      const rec = 6 + i * 12;
      const platform = r.u16(rec);
      const encoding = r.u16(rec + 2);
      const language = r.u16(rec + 4);
      const nameId = r.u16(rec + 6);
      const length = r.u16(rec + 8);
      const offset = r.u16(rec + 10);
      let bytes;
      try {
        bytes = r.slice(storage + offset, length);
      } catch {
        continue;
      }
      const value = decodeName(platform, encoding, bytes);
      if (value === null) continue;
      const k = rank(platform, language);
      const prev = best.get(nameId);
      if (!prev || k < prev.rank) best.set(nameId, { rank: k, value });
    }
    return new Map([...best].map(([id, v]) => [id, v.value]));
  } catch {
    return null;
  }
}
function readFvar(fvar) {
  const r = new Reader(fvar);
  try {
    if (r.u16(0) !== 1) return null;
    const axesArrayOffset = r.u16(4);
    const axisCount = r.u16(8);
    const axisSize = r.u16(10);
    const instanceCount = r.u16(12);
    const instanceSize = r.u16(14);
    if (axisCount === 0 || axisCount > MAX_FVAR_AXES || axisSize < 20 || instanceCount > MAX_FVAR_INSTANCES) return null;
    if (instanceCount > 0 && instanceSize < 4 + 4 * axisCount) return null;
    const axes = [];
    for (let i = 0; i < axisCount; i++) {
      const at = axesArrayOffset + i * axisSize;
      axes.push({ tag: r.u32(at), def: r.i32(at + 8) });
    }
    const base = axesArrayOffset + axisCount * axisSize;
    for (let j = 0; j < instanceCount; j++) {
      const at = base + j * instanceSize;
      const sub = r.u16(at);
      let isDefault = true;
      for (let k = 0; k < axisCount && isDefault; k++) if (r.i32(at + 4 + k * 4) !== axes[k].def) isDefault = false;
      if (isDefault) return { axes, defaultSubfamilyNameId: sub };
    }
    return { axes };
  } catch {
    return null;
  }
}
function statDefaultNames(stat, axes, names) {
  const r = new Reader(stat);
  try {
    if (r.u16(0) !== 1) return null;
    const designAxisSize = r.u16(4);
    const designAxisCount = r.u16(6);
    const designAxesOffset = r.u32(8);
    const axisValueCount = r.u16(12);
    const valuesOffset = r.u32(14);
    if (designAxisSize < 8 || designAxisCount > MAX_FVAR_AXES || axisValueCount > MAX_STAT_VALUES) return null;
    const design = [];
    for (let i = 0; i < designAxisCount; i++) {
      const at = designAxesOffset + i * designAxisSize;
      design.push({ tag: r.u32(at), ordering: r.u16(at + 6) });
    }
    const values = [];
    for (let i = 0; i < axisValueCount; i++) {
      const at = valuesOffset + r.u16(valuesOffset + i * 2);
      const format = r.u16(at);
      if (format !== 1 && format !== 2 && format !== 3) continue;
      values.push({ axisIndex: r.u16(at + 2), flags: r.u16(at + 4), nameId: r.u16(at + 6), value: r.i32(at + 8) });
    }
    const order = design.map((d, i) => ({ ...d, i })).sort((a, b) => a.ordering - b.ordering || a.i - b.i);
    const out = [];
    for (const d of order) {
      const axis = axes.find((a) => a.tag === d.tag);
      if (!axis) continue;
      const v = values.find((x) => x.axisIndex === d.i && x.value === axis.def);
      if (!v) return null;
      if (v.flags & 2) continue;
      const name = names.get(v.nameId);
      if (!name) return null;
      out.push(name);
    }
    return out;
  } catch {
    return null;
  }
}
var asciiLower2 = (s) => s.replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 32));
function deriveVariableFamily(names, fvar, stat) {
  const typographic = names.get(16);
  if (typographic) return typographic;
  const n1 = names.get(1);
  if (!n1 || !fvar) return void 0;
  const parsed = readFvar(fvar);
  if (!parsed) return void 0;
  let style;
  if (parsed.defaultSubfamilyNameId !== void 0) style = names.get(parsed.defaultSubfamilyNameId);
  if (style === void 0 && stat) {
    const list = statDefaultNames(stat, parsed.axes, names);
    if (list) style = list.join(" ");
  }
  if (style === void 0) return void 0;
  const s = style.trim().replace(/\s+/g, " ");
  if (!s) return n1;
  const n = n1.trim().replace(/\s+/g, " ");
  if (asciiLower2(n).endsWith(` ${asciiLower2(s)}`)) return n.slice(0, n.length - s.length - 1).trim() || void 0;
  const n2 = names.get(2);
  if (n2 && asciiLower2(n2.trim()) === asciiLower2(s)) return n;
  return void 0;
}
var alnum = (s) => asciiLower2(s).replace(/[^a-z0-9]/g, "");
function familyConsistentWithPostScript(family, postScriptName) {
  if (!postScriptName) return false;
  const f = alnum(family);
  const p = alnum(postScriptName.split("-")[0] ?? "");
  if (Math.min(f.length, p.length) < 3) return false;
  return f.startsWith(p) || p.startsWith(f);
}
function faceFromTables(t) {
  const names = parseNameRecords(t.name);
  if (!names) return null;
  const postScriptName = names.get(6);
  const candidate = t.variable ? deriveVariableFamily(names, t.fvar, t.stat) : names.get(16) ?? names.get(1);
  const base = { ...postScriptName ? { postScriptName } : {}, ...t.variable ? { variable: true } : {} };
  if (candidate === void 0) {
    if (!postScriptName && !names.get(16) && !names.get(1)) return null;
    return t.variable ? { ...base, familyStatus: "underived" } : base;
  }
  if (!familyConsistentWithPostScript(candidate, postScriptName)) return { ...base, familyStatus: "inconsistent" };
  return { family: candidate, ...base };
}

// src/platform-fonts-capture.ts
var DEPLOYED_PLATFORM_FONT_LIMITS = {
  maxReads: 3e3,
  budgetMs: 8e3,
  callTimeoutMs: 2e3,
  // Evidence reads get their own slices inside the budget, so they cannot eat
  // the node reads (review L-R2): at least 5 s of the 8 s stay for the nodes.
  sheetBudgetMs: 1500,
  fontFileBudgetMs: 1500
};
function deployedPlatformFontCaptureOn() {
  return (process.env.FIDEL_CAPTURE_PLATFORM_FONTS ?? "").trim().toLowerCase() === "on";
}
var MAX_EVIDENCE_NAME_LENGTH = 256;
var MAX_EVIDENCE_FACES = 512;
var MAX_CSS_FAMILIES_PER_RECORD = 16;
var MAX_FONT_FACE_RULES = 512;
var MAX_SHEETS = 64;
var MAX_SHEET_TEXT_LENGTH = 1e6;
var MAX_SHEET_TEXT_TOTAL = 4e6;
var MAX_SRC_LENGTH = 4096;
function evidenceName(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_EVIDENCE_NAME_LENGTH ? trimmed : null;
}
function asciiFold(value) {
  return value.replace(/[A-Z]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 32));
}
function localFontNames(src) {
  if (typeof src !== "string" || src.length > MAX_SRC_LENGTH) return [];
  const out = [];
  const re = /local\(([^)]*)\)/gi;
  let m;
  while ((m = re.exec(src)) !== null && out.length < MAX_CSS_FAMILIES_PER_RECORD) {
    const inner = (m[1] ?? "").trim();
    const quote = inner[0];
    let raw;
    if (quote === '"' || quote === "'") {
      raw = inner.length >= 2 && inner.endsWith(quote) && !inner.slice(1, -1).includes(quote) ? inner.slice(1, -1) : null;
    } else {
      raw = /["']/.test(inner) ? null : inner.split(/\s+/).filter(Boolean).join(" ");
    }
    const name = raw === null ? null : evidenceName(raw);
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}
function indexFontFaceEvidence(evidence) {
  const index = { byPlatformFamily: /* @__PURE__ */ new Map(), byLocalName: /* @__PURE__ */ new Map() };
  for (const face of evidence.cdp) {
    const list = index.byPlatformFamily.get(face.platformFamily) ?? [];
    if (list.length < MAX_EVIDENCE_FACES) list.push({ cssFamily: face.cssFamily, ...face.files ? { files: face.files } : {} });
    index.byPlatformFamily.set(face.platformFamily, list);
  }
  for (const rule of evidence.local) {
    for (const name of rule.localNames) {
      const key = asciiFold(name);
      const list = index.byLocalName.get(key) ?? [];
      if (!list.includes(rule.cssFamily) && list.length < MAX_CSS_FAMILIES_PER_RECORD) list.push(rule.cssFamily);
      index.byLocalName.set(key, list);
    }
  }
  return index;
}
function facesForRecord(font, index) {
  const ps = font.postScriptName;
  return (index.byPlatformFamily.get(font.familyName) ?? []).filter((face) => {
    if (!ps || !face.files || face.files.some((f) => f.variable)) return true;
    const named = face.files.filter((f) => f.postScriptName);
    return named.length === 0 || named.some((f) => f.postScriptName === ps);
  });
}
function fileFamilyForRecord(font, evidence) {
  if (font.isCustomFont !== true) return void 0;
  const index = "byLocalName" in evidence ? evidence : indexFontFaceEvidence(evidence);
  const faces = facesForRecord(font, index);
  if (faces.length === 0) return void 0;
  let family;
  for (const face of faces) {
    if (!face.files || face.files.length === 0) return void 0;
    const ps = font.postScriptName;
    const candidates = ps && face.files.some((f) => f.postScriptName === ps) ? face.files.filter((f) => f.postScriptName === ps) : face.files;
    for (const f of candidates) {
      const name = evidenceName(f.family);
      if (!name) return void 0;
      if (family === void 0) family = name;
      else if (asciiFold(family) !== asciiFold(name)) return void 0;
    }
  }
  return family;
}
function cssFamiliesForRecord(font, evidence) {
  const index = "byLocalName" in evidence ? evidence : indexFontFaceEvidence(evidence);
  const out = [];
  const add = (names) => {
    for (const name of names ?? []) if (out.length < MAX_CSS_FAMILIES_PER_RECORD && !out.includes(name)) out.push(name);
  };
  if (font.isCustomFont === true) {
    add(facesForRecord(font, index).map((face) => face.cssFamily));
  } else {
    add(index.byLocalName.get(asciiFold(font.familyName)));
    if (typeof font.postScriptName === "string") add(index.byLocalName.get(asciiFold(font.postScriptName)));
  }
  return out;
}
var MAX_FONT_FILES = 32;
var MAX_FONT_URL_LENGTH = 4096;
var MAX_DATA_URL_LENGTH = Math.ceil(MAX_FONT_BYTES / 3) * 4 + 256;
var MAX_DATA_URL_RETAINED = 16 * 1024 * 1024;
function dataKey(src, whole) {
  const h = (0, import_node_crypto.createHash)("sha256");
  if (whole) h.update(src);
  else h.update(src.slice(0, 1024)).update(src.slice(-1024));
  return `data:${src.length}:${h.digest("hex").slice(0, 24)}${whole ? "" : ":dropped"}`;
}
var MAX_WATCHED_FONT_RESPONSES = 64;
var FONT_RESPONSES = /* @__PURE__ */ new WeakMap();
function urlKey(url) {
  if (typeof url !== "string" || url.length === 0 || url.length > MAX_FONT_URL_LENGTH) return null;
  const hash = url.indexOf("#");
  return hash < 0 ? url : url.slice(0, hash);
}
function watchFontResponses(page) {
  try {
    if (FONT_RESPONSES.has(page)) return;
    const seen = /* @__PURE__ */ new Map();
    FONT_RESPONSES.set(page, seen);
    page.on("response", (response) => {
      try {
        if (seen.size >= MAX_WATCHED_FONT_RESPONSES) return;
        if (response.request().resourceType() !== "font") return;
        const key = urlKey(response.url());
        if (key && !seen.has(key)) seen.set(key, response);
      } catch {
      }
    });
  } catch {
  }
}
function decodeFontDataUrl(src) {
  if (typeof src !== "string" || !/^data:/i.test(src) || src.length > MAX_DATA_URL_LENGTH) return null;
  const comma = src.indexOf(",");
  if (comma < 0 || comma > 256) return null;
  const payload = src.slice(comma + 1);
  if (/;base64$/i.test(src.slice(5, comma))) {
    if (!/^[A-Za-z0-9+/=\s]*$/.test(payload)) return null;
    const buf = Buffer.from(payload, "base64");
    return buf.length > MAX_FONT_BYTES ? null : new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  }
  const out = [];
  for (let i = 0; i < payload.length; i++) {
    if (out.length > MAX_FONT_BYTES) return null;
    const c = payload.charCodeAt(i);
    if (c === 37 && /^[0-9A-Fa-f]{2}$/.test(payload.slice(i + 1, i + 3))) {
      out.push(parseInt(payload.slice(i + 1, i + 3), 16));
      i += 2;
    } else if (c < 128) out.push(c);
    else return null;
  }
  return Uint8Array.from(out);
}
var StepStop = class extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
};
async function capturePlatformFonts(page, axNodes, limits = {}) {
  const started = Date.now();
  const stats = {
    attempted: 0,
    withGlyphs: 0,
    empty: 0,
    failed: 0,
    staticTextWithGlyphs: 0,
    customResolved: 0,
    customUnresolved: 0,
    status: "complete",
    skipped: 0,
    fontFamilyReads: 0,
    elapsedMs: 0
  };
  const targets = axNodes.filter((n) => !n.isHidden && !n.backendDOMNodeIdInherited && n.backendDOMNodeId > 0 && n.platformFonts === void 0);
  if (targets.length === 0) {
    stats.elapsedMs = Date.now() - started;
    return stats;
  }
  const budgetEnd = limits.budgetMs === void 0 ? Infinity : started + limits.budgetMs;
  const callTimeout = limits.callTimeoutMs ?? Infinity;
  const bounded = async (work, end = budgetEnd) => {
    const left = Math.min(end, budgetEnd) - Date.now();
    if (left <= 0) throw new StepStop("budget");
    const wait = Math.min(left, callTimeout);
    if (!Number.isFinite(wait)) return work();
    let timer;
    const call = work();
    call.catch(() => {
    });
    try {
      return await Promise.race([
        call,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new StepStop(wait === left ? "budget" : "call-timeout")), wait);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
  const staged = /* @__PURE__ */ new Map();
  let cdp = null;
  const evidence = { cdp: [], local: [] };
  const dataSources = /* @__PURE__ */ new Map();
  let dataRetained = 0;
  const onFontsUpdated = (event) => {
    if (evidence.cdp.length >= MAX_EVIDENCE_FACES) return;
    const cssFamily = evidenceName(event?.font?.fontFamily);
    const platformFamily = evidenceName(event?.font?.platformFontFamily);
    if (!cssFamily || !platformFamily) return;
    const rawSrc = event?.font?.src;
    let src;
    if (typeof rawSrc === "string" && rawSrc.length > 0) {
      if (/^data:/i.test(rawSrc)) {
        if (rawSrc.length <= MAX_DATA_URL_LENGTH) {
          const retain = dataSources.size < MAX_FONT_FILES && dataRetained + rawSrc.length <= MAX_DATA_URL_RETAINED;
          src = dataKey(rawSrc, retain);
          if (retain && !dataSources.has(src)) {
            dataSources.set(src, rawSrc);
            dataRetained += rawSrc.length;
          }
        }
      } else if (rawSrc.length <= MAX_FONT_URL_LENGTH) {
        src = rawSrc;
      }
    }
    if (evidence.cdp.some((f) => f.cssFamily === cssFamily && f.platformFamily === platformFamily && f.src === src)) return;
    evidence.cdp.push({ cssFamily, platformFamily, ...src !== void 0 ? { src } : {} });
  };
  const sheets = [];
  let sheetsSeen = 0;
  const onStyleSheetAdded = (event) => {
    sheetsSeen++;
    const id = event?.header?.styleSheetId;
    const length = event?.header?.length;
    if (typeof id === "string" && sheets.length < MAX_SHEETS) {
      sheets.push({ id, length: typeof length === "number" && Number.isFinite(length) ? length : void 0, inline: event?.header?.isInline === true });
    }
  };
  const tryBounded = async (work, end) => {
    try {
      return await bounded(work, end);
    } catch {
      return null;
    }
  };
  try {
    cdp = await bounded(() => page.context().newCDPSession(page));
    const session = cdp;
    if (typeof session.on === "function") {
      session.on("CSS.fontsUpdated", onFontsUpdated);
      session.on("CSS.styleSheetAdded", onStyleSheetAdded);
    }
    await bounded(() => session.send("DOM.enable"));
    await bounded(() => session.send("DOM.getDocument", { depth: 0 }));
    await bounded(() => session.send("CSS.enable"));
    const sheetEnd = limits.sheetBudgetMs === void 0 ? budgetEnd : Date.now() + limits.sheetBudgetMs;
    let textRead = 0;
    let unreadableSheets = Math.max(0, sheetsSeen - sheets.length);
    let oversizedSheets = 0;
    let sheetsRead = 0;
    const rules = [];
    for (const sheet of sheets) {
      if (sheet.length !== void 0 && sheet.length > MAX_SHEET_TEXT_LENGTH) {
        oversizedSheets++;
        unreadableSheets++;
        continue;
      }
      if (textRead + (sheet.length ?? 0) > MAX_SHEET_TEXT_TOTAL || Date.now() >= sheetEnd) {
        unreadableSheets++;
        continue;
      }
      const res = await tryBounded(() => session.send("CSS.getStyleSheetText", { styleSheetId: sheet.id }), sheetEnd);
      const text = typeof res?.text === "string" ? res.text : null;
      if (text === null || text.length === 0 && !sheet.inline) {
        unreadableSheets++;
        continue;
      }
      sheetsRead++;
      textRead += Math.min(text.length, MAX_SHEET_TEXT_LENGTH);
      if (text.length > MAX_SHEET_TEXT_LENGTH) oversizedSheets++;
      for (const r of parseFontFaceRules(text)) if (rules.length < MAX_FONT_FACE_RULES) rules.push(r);
    }
    evidence.local = localTiesFromRules(rules);
    stats.aliasEvidence = { cdpFaces: evidence.cdp.length, localFaces: evidence.local.length, unreadableSheets, sheetsRead, oversizedSheets };
    if (evidence.cdp.length > 0) stats.fontFiles = await readFontFileNames(
      evidence,
      FONT_RESPONSES.get(page),
      dataSources,
      tryBounded,
      limits.fontFileBudgetMs === void 0 ? budgetEnd : Date.now() + limits.fontFileBudgetMs
    );
    const loadedFaces = new Set(evidence.cdp.map((f) => asciiFold(f.cssFamily)));
    const evidenceIndex = indexFontFaceEvidence(evidence);
    const byBackend = /* @__PURE__ */ new Map();
    for (let i = 0; i < targets.length; i++) {
      const node = targets[i];
      let read = byBackend.get(node.backendDOMNodeId);
      if (read === void 0) {
        if (limits.maxReads !== void 0 && byBackend.size >= limits.maxReads) {
          stats.stopReason = "node-cap";
          break;
        }
        read = { fonts: null, nodeId: 0 };
        try {
          const { nodeIds } = await bounded(() => session.send("DOM.pushNodesByBackendIdsToFrontend", {
            backendNodeIds: [node.backendDOMNodeId]
          }));
          if (nodeIds?.[0]) {
            read.nodeId = nodeIds[0];
            const res = await bounded(() => session.send("CSS.getPlatformFontsForNode", { nodeId: nodeIds[0] }));
            read.fonts = res.fonts ?? [];
          }
        } catch (e) {
          if (e instanceof StepStop) throw e;
          read.fonts = null;
        }
        byBackend.set(node.backendDOMNodeId, read);
      }
      stats.attempted++;
      const fonts = read.fonts;
      if (fonts === null) {
        stats.failed++;
        continue;
      }
      let computedFamily = node.computedStyles?.["font-family"];
      if (computedFamily === void 0 && read.nodeId && needsCssFamily(fonts)) {
        stats.fontFamilyReads++;
        try {
          const res = await bounded(() => session.send("CSS.getComputedStyleForNode", { nodeId: read.nodeId }));
          computedFamily = res.computedStyle?.find((p) => p.name === "font-family")?.value;
        } catch (e) {
          if (e instanceof StepStop) throw e;
        }
      }
      const cssFamily = resolveCustomCssFamily(fonts, computedFamily, loadedFaces);
      staged.set(node, fonts.map((f) => {
        const custom = f.isCustomFont === true;
        if (custom && f.glyphCount > 0) {
          if (cssFamily) stats.customResolved++;
          else stats.customUnresolved++;
        }
        const cssFamilies = cssFamiliesForRecord(f, evidenceIndex);
        const fileFamily = custom && stats.fontFiles ? fileFamilyForRecord(f, evidenceIndex) : void 0;
        if (fileFamily !== void 0 && f.glyphCount > 0) stats.fontFiles.recordsNamed++;
        return {
          family: f.familyName,
          ...f.postScriptName ? { postScriptName: f.postScriptName } : {},
          isCustomFont: custom,
          ...custom && cssFamily ? { cssFamily } : {},
          ...cssFamilies.length > 0 ? { cssFamilies } : {},
          ...fileFamily !== void 0 ? { fileFamily } : {},
          glyphCount: f.glyphCount
        };
      }));
      if (fonts.some((f) => f.glyphCount > 0)) {
        stats.withGlyphs++;
        if (node.role === "StaticText") stats.staticTextWithGlyphs++;
      } else {
        stats.empty++;
      }
    }
  } catch (e) {
    stats.stopReason = e instanceof StepStop ? e.reason : "error";
  } finally {
    const session = cdp;
    if (session) {
      if (typeof session.off === "function") {
        session.off("CSS.fontsUpdated", onFontsUpdated);
        session.off("CSS.styleSheetAdded", onStyleSheetAdded);
      }
      await Promise.race([
        (async () => {
          await session.send("CSS.disable").catch(() => {
          });
          await session.detach().catch(() => {
          });
        })(),
        new Promise((resolve) => setTimeout(resolve, 1e3))
      ]);
    }
  }
  if (limits.signal?.aborted) staged.clear();
  for (const [node, record] of staged) node.platformFonts = record;
  if (stats.stopReason) {
    stats.skipped = targets.length - staged.size - stats.failed;
    stats.status = staged.size > 0 ? "truncated" : "not-captured";
  }
  if (limits.signal?.aborted) {
    stats.status = "not-captured";
    stats.skipped = targets.length - stats.failed;
  }
  stats.elapsedMs = Date.now() - started;
  return stats;
}
async function readFontFileNames(evidence, responses, dataSources, tryBounded, end) {
  const out = { faces: 0, read: 0, named: 0, inconsistent: 0, underived: 0, unavailable: 0, oversized: 0, failed: 0, recordsNamed: 0 };
  const bySrc = /* @__PURE__ */ new Map();
  for (const face of evidence.cdp) {
    const src = face.src;
    if (src === void 0) {
      out.unavailable++;
      continue;
    }
    if (bySrc.has(src)) {
      const files2 = bySrc.get(src);
      if (files2) face.files = files2;
      continue;
    }
    if (bySrc.size >= MAX_FONT_FILES) break;
    out.faces++;
    bySrc.set(src, null);
    let bytes = null;
    if (src.startsWith("data:")) {
      const url = dataSources.get(src);
      dataSources.delete(src);
      if (url === void 0) {
        out.unavailable++;
        continue;
      }
      bytes = decodeFontDataUrl(url);
      if (bytes === null) {
        out.oversized++;
        continue;
      }
    } else {
      const key = urlKey(src);
      const response = key ? responses?.get(key) : void 0;
      if (!response) {
        out.unavailable++;
        continue;
      }
      let declared = NaN;
      try {
        declared = Number(response.headers()["content-length"]);
      } catch {
      }
      if (Number.isFinite(declared) && declared > MAX_FONT_BYTES) {
        out.oversized++;
        continue;
      }
      if (Date.now() >= end) {
        out.failed++;
        continue;
      }
      const body = await tryBounded(() => response.body(), end);
      if (body === null) {
        out.failed++;
        continue;
      }
      if (body.length > MAX_FONT_BYTES) {
        out.oversized++;
        continue;
      }
      bytes = new Uint8Array(body.buffer, body.byteOffset, body.length);
    }
    out.read++;
    const names = await tryBounded(() => readFontNames(bytes), end);
    const files = names?.ok ? names.faces.filter((f) => f.family !== void 0 || f.postScriptName !== void 0) : [];
    if (files.length === 0) {
      out.failed++;
      continue;
    }
    if (files.some((f) => f.family !== void 0)) out.named++;
    else if (files.some((f) => f.familyStatus === "underived")) out.underived++;
    else if (files.some((f) => f.familyStatus === "inconsistent")) out.inconsistent++;
    bySrc.set(src, files);
    face.files = files;
  }
  dataSources.clear();
  for (const face of evidence.cdp) if (!face.files && face.src !== void 0) {
    const files = bySrc.get(face.src);
    if (files) face.files = files;
  }
  return out;
}
function needsCssFamily(fonts) {
  return new Set(fonts.filter((f) => f.isCustomFont === true && f.glyphCount > 0).map((f) => f.familyName)).size === 1;
}
function parseFontFaceRules(cssText) {
  const out = [];
  if (typeof cssText !== "string") return out;
  const n = Math.min(cssText.length, MAX_SHEET_TEXT_LENGTH);
  let i = 0;
  while (i < n && out.length < MAX_FONT_FACE_RULES) {
    const ch = cssText[i];
    if (ch === "/" && cssText[i + 1] === "*") {
      const e = cssText.indexOf("*/", i + 2);
      i = e < 0 ? n : e + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = skipString(cssText, i, n);
      continue;
    }
    if (ch === "@" && i + 10 <= n && cssText.slice(i + 1, i + 10).toLowerCase() === "font-face" && !/[A-Za-z0-9_-]/.test(cssText[i + 10] ?? "")) {
      let j = i + 10;
      while (j < n && cssText[j] !== "{" && cssText[j] !== ";" && cssText[j] !== "}") j++;
      if (j >= n || cssText[j] !== "{") {
        i = j + 1;
        continue;
      }
      const decls = [];
      let k = j + 1;
      let startDecl = k;
      let depth = 0;
      while (k < n) {
        const c = cssText[k];
        if (c === "/" && cssText[k + 1] === "*") {
          const e = cssText.indexOf("*/", k + 2);
          k = e < 0 ? n : e + 2;
          continue;
        }
        if (c === '"' || c === "'") {
          k = skipString(cssText, k, n);
          continue;
        }
        if (c === "(") depth++;
        else if (c === ")" && depth > 0) depth--;
        else if ((c === ";" || c === "}") && depth === 0) {
          decls.push(cssText.slice(startDecl, k));
          startDecl = k + 1;
          if (c === "}") break;
        }
        k++;
      }
      let family = "";
      let src = "";
      for (const d of decls) {
        const colon = d.indexOf(":");
        if (colon < 0) continue;
        const name = d.slice(0, colon).trim().toLowerCase();
        const value = d.slice(colon + 1).trim();
        if (name === "font-family") family = value;
        else if (name === "src") src = value;
      }
      if (family && src) out.push({ family, src });
      i = k + 1;
      continue;
    }
    i++;
  }
  return out;
}
function skipString(text, start, end) {
  const quote = text[start];
  let i = start + 1;
  while (i < end) {
    const c = text[i];
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === quote || c === "\n") return i + 1;
    i++;
  }
  return end;
}
function localTiesFromRules(rules) {
  const local = [];
  for (const rule of rules) {
    if (local.length >= MAX_FONT_FACE_RULES) break;
    if (rule.src.length > MAX_SRC_LENGTH || !/local\(/i.test(rule.src)) continue;
    const parsed = parseFontFamilyList(rule.family);
    const cssFamily = parsed.parsed && parsed.families.length === 1 && parsed.families[0].kind === "family" ? evidenceName(parsed.families[0].name) : null;
    const localNames = localFontNames(rule.src);
    if (cssFamily && localNames.length > 0) local.push({ cssFamily, localNames });
  }
  return local;
}
function resolveCustomCssFamily(fonts, computedFontFamily, loadedFaces) {
  const custom = new Set(fonts.filter((f) => f.isCustomFont === true && f.glyphCount > 0).map((f) => f.familyName));
  if (custom.size !== 1 || !computedFontFamily) return void 0;
  const parsed = parseFontFamilyList(computedFontFamily);
  if (!parsed.parsed) return void 0;
  const hit = parsed.families.find((f) => f.kind === "family" && loadedFaces.has(f.name.toLowerCase()));
  return hit?.name;
}

// src/held-stubs/field-placeholder-capture.ts
var DEPLOYED_FIELD_PLACEHOLDER_LIMITS = {
  maxFields: 0,
  budgetMs: 0,
  callTimeoutMs: 0
};
function fieldPlaceholderCaptureOn() {
  return false;
}
function markUnreadFields(_axNodes, _reason) {
  return 0;
}
async function captureFieldPlaceholders(_page, _axNodes, _limits = {}) {
  return {
    status: "not-captured",
    fields: 0,
    read: 0,
    withPlaceholder: 0,
    truncated: 0,
    withVisibleLabel: 0,
    labelUndetermined: 0,
    failed: 0,
    skipped: 0,
    timedOut: 0,
    unresolved: 0,
    notEligible: 0,
    elapsedMs: 0
  };
}

// src/held-stubs/container-capture.ts
function containerCaptureLive(_until, _nowMs) {
  return false;
}
async function captureContainerCapture(_cdp, _axNodes, _limits = {}) {
  return { capture: null, stats: { status: "failed", sourceNodes: 0, keptNodes: 0, bytes: 0, elapsedMs: 0 } };
}

// src/held-stubs/capture-layout-settle.ts
function captureLayoutSettleOn() {
  return false;
}
async function settleLayout(_page, _opts = {}) {
  return { status: "skipped", elapsedMs: 0, samples: 0, changes: 0 };
}

// src/bot-challenge.ts
function botChallengeCheckOn() {
  return (process.env.FIDEL_CAPTURE_BOT_CHALLENGE ?? "").trim().toLowerCase() === "on";
}
var BODY_TEXT_LIMIT = 2e3;
var READ_TIMEOUT_MS = 3e3;
var CHALLENGE_TITLE = /^\s*(just a moment|attention required|performing security verification)\b/i;
var CHALLENGE_TEXT = /performing security verification|verify you are human|checking (if the site connection is secure|your browser)/i;
var PROBE_MARKER = "__fidelBotChallengeProbe";
function detectBotChallenge(s) {
  const matched = [];
  if ((s.cfMitigated ?? "").trim().toLowerCase() === "challenge") matched.push("cf_mitigated_header");
  if (s.title && CHALLENGE_TITLE.test(s.title)) matched.push("challenge_title");
  if (s.hasChallengeMarkup) matched.push("challenge_markup");
  if (s.bodyText && CHALLENGE_TEXT.test(s.bodyText)) matched.push("challenge_text");
  const onPageNow = matched.some((m) => m !== "cf_mitigated_header");
  return { challenged: onPageNow && matched.length >= 2, matched };
}
var SIGNALS_EXPRESSION = `(() => {
  /* ${PROBE_MARKER} */
  const text = (document.body && document.body.innerText) || '';
  return {
    title: String(document.title || '').slice(0, 200),
    bodyText: text.slice(0, ${BODY_TEXT_LIMIT}),
    hasChallengeMarkup: !!document.querySelector(
      'script[src*="/cdn-cgi/challenge-platform/"], #challenge-form, #cf-chl-widget, #challenge-stage'
    ),
  };
})()`;
async function readChallengeSignals(page, response) {
  const signals = {};
  try {
    const h = response?.headers() ?? {};
    if (typeof h["cf-mitigated"] === "string") signals.cfMitigated = h["cf-mitigated"].toLowerCase();
  } catch {
  }
  let timer;
  try {
    const read = await Promise.race([
      page.evaluate(SIGNALS_EXPRESSION),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(null), READ_TIMEOUT_MS);
      })
    ]);
    if (read && typeof read === "object") {
      const r = read;
      if (typeof r.title === "string") signals.title = r.title;
      if (typeof r.bodyText === "string") signals.bodyText = r.bodyText;
      if (typeof r.hasChallengeMarkup === "boolean") signals.hasChallengeMarkup = r.hasChallengeMarkup;
    }
  } catch {
  } finally {
    if (timer) clearTimeout(timer);
  }
  return signals;
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

    // 'instant' overrides CSS scroll-behavior: smooth, which would otherwise
    // leave the page mid-animation (a few px down) when the snapshot runs.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    await delay(100);
  })()
`;
async function scrollToTopForSnapshot(page) {
  await page.evaluate(`window.scrollTo({ top: 0, left: 0, behavior: 'instant' });`);
  await page.waitForTimeout(200);
  let scrollY = await page.evaluate("window.scrollY");
  if (scrollY !== 0) {
    await page.evaluate(`
      (() => {
        const style = document.documentElement.style;
        const previous = style.scrollBehavior;
        style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        style.scrollBehavior = previous;
      })()
    `);
    await page.waitForTimeout(100);
    scrollY = await page.evaluate("window.scrollY");
  }
  return scrollY;
}
var CAPTURE_SCROLL_KEY = "__fidel_capture_scroll";
async function restoreCaptureScroll(page) {
  return await page.evaluate(`
    (() => {
      const saved = window.${CAPTURE_SCROLL_KEY};
      const api = window.__fidel_snapshot;
      const moved = saved && api && api.restoreScrollPositions ? api.restoreScrollPositions(saved) : 0;
      return { moved, scrollX: window.scrollX, scrollY: window.scrollY };
    })()
  `);
}
var PSEUDO_STATE_CAPTURE_SCRIPT = `
  (async () => {
    const { capturePseudoStateStyles, isInteractiveElement, recordScrollPositions, restoreScrollPositions } = window.__fidel_snapshot;
    if (!capturePseudoStateStyles || !isInteractiveElement) return {};
    // Leave the page at the scroll position of the snapshot, whatever the
    // interactions below do (see CAPTURE_SCROLL_KEY).
    const saved = window.${CAPTURE_SCROLL_KEY} || (recordScrollPositions ? recordScrollPositions() : null);
    try {
      return await captureAll();
    } finally {
      if (saved && restoreScrollPositions) restoreScrollPositions(saved);
    }

    async function captureAll() {
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
    }
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
  if (options.watchFontFiles === true || deployedPlatformFontCaptureOn()) watchFontResponses(page);
  if (auth?.type === "header" && auth.headers) {
    await page.setExtraHTTPHeaders(auth.headers);
  }
  let navResponse = null;
  try {
    navResponse = await page.goto(url, { waitUntil: waitForLoadState, timeout: 3e4 });
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
  const topY = Number(await scrollToTopForSnapshot(page).catch(() => NaN));
  if (topY !== 0) console.log(`[fidel-ci] WARNING: window.scrollY is ${Number.isFinite(topY) ? topY : "not a number"} before the snapshot`);
  let layoutSettle;
  if (captureLayoutSettleOn()) {
    layoutSettle = await settleLayout(page);
    console.log(`[fidel-ci] Layout settle: ${JSON.stringify(layoutSettle)}`);
  }
  if (botChallengeCheckOn()) {
    const verdict = detectBotChallenge(await readChallengeSignals(page, navResponse));
    if (verdict.challenged) {
      console.log(`[fidel-ci] Bot-check page detected (${verdict.matched.join(", ")})`);
      await browser.close().catch(() => {
      });
      throw new Error(BOT_PROTECTION_ERROR);
    }
  }
  const iifeSource = import_fs.default.readFileSync(
    import_path.default.join(__dirname, "..", "dist", "snapshot.iife.js"),
    "utf8"
  );
  const domElements = await page.evaluate(`
    ${iifeSource}
    window.${CAPTURE_SCROLL_KEY} = window.__fidel_snapshot.recordScrollPositions();
    window.__fidel_snapshot.snapshotDOM(true);
  `);
  let axTree = null;
  try {
    axTree = await extractAXTree(page, { skipScroll: true });
    console.log(`[fidel-ci] AX tree: ${axTree.semanticNodes.length} semantic nodes, ${axTree.landmarks.length} landmarks, ${axTree.extractionTimeMs}ms`);
  } catch (err) {
    console.log("[fidel-ci] AX tree extraction skipped:", err.message);
  }
  if (axTree && axTree.semanticNodes.length > 0 && containerCaptureLive(options.containerCaptureUntil, Date.now())) {
    try {
      const cdp = await page.context().newCDPSession(page);
      try {
        const { capture, stats } = await captureContainerCapture(cdp, axTree.semanticNodes, { domNodeCount: axTree.domNodeCount });
        if (capture) axTree.containerCapture = capture;
        console.log(`[fidel-ci] Container capture: ${stats.status}, ${stats.keptNodes} of ${stats.sourceNodes} nodes, ${stats.bytes} bytes, ${stats.elapsedMs}ms`);
      } finally {
        await Promise.race([cdp.detach().catch(() => {
        }), new Promise((resolve) => setTimeout(resolve, 2e3).unref())]);
      }
    } catch {
      console.log("[fidel-ci] Container capture skipped: no CDP session");
    }
  }
  if (axTree && axTree.semanticNodes.length > 0 && deployedPlatformFontCaptureOn()) {
    try {
      const stats = await capturePlatformFonts(page, axTree.semanticNodes, DEPLOYED_PLATFORM_FONT_LIMITS);
      console.log(`[fidel-ci] Platform fonts: ${stats.status}, ${stats.withGlyphs} with glyphs, ${stats.failed} failed, ${stats.skipped} skipped, ${stats.elapsedMs}ms`);
    } catch (err) {
      console.log("[fidel-ci] Platform font capture skipped:", err.message);
    }
  }
  let fieldPlaceholder;
  if (axTree && axTree.semanticNodes.length > 0 && fieldPlaceholderCaptureOn()) {
    try {
      fieldPlaceholder = await captureFieldPlaceholders(page, axTree.semanticNodes, DEPLOYED_FIELD_PLACEHOLDER_LIMITS);
      console.log(`[fidel-ci] Field placeholders: ${fieldPlaceholder.status}, ${fieldPlaceholder.read} of ${fieldPlaceholder.fields} read, ${fieldPlaceholder.withPlaceholder} with placeholder, ${fieldPlaceholder.skipped + fieldPlaceholder.unresolved + fieldPlaceholder.failed + fieldPlaceholder.notEligible} unread, ${fieldPlaceholder.elapsedMs}ms`);
    } catch (err) {
      const marked = markUnreadFields(axTree.semanticNodes, "error");
      fieldPlaceholder = {
        status: "not-captured",
        stopReason: "error",
        fields: marked,
        read: 0,
        withPlaceholder: 0,
        truncated: 0,
        withVisibleLabel: 0,
        labelUndetermined: 0,
        failed: 0,
        skipped: marked,
        timedOut: 0,
        unresolved: 0,
        notEligible: 0,
        elapsedMs: 0
      };
      console.log("[fidel-ci] Field placeholder capture skipped");
    }
  }
  try {
    const captureResult = await page.evaluate(PSEUDO_STATE_CAPTURE_SCRIPT);
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
  try {
    const scroll = await restoreCaptureScroll(page);
    const moved = Number(scroll.moved);
    if (moved > 0) console.log(`[fidel-ci] Restored ${Number.isFinite(moved) ? moved : "some"} scroll offset(s) after capture`);
  } catch {
  }
  return { elements: domElements, axTree, page, browser, ...layoutSettle ? { layoutSettle } : {}, ...fieldPlaceholder ? { fieldPlaceholder } : {} };
}
async function captureSnapshot(options) {
  const result = await captureSnapshotWithPage(options);
  await result.browser.close();
  return { elements: result.elements, axTree: result.axTree };
}

// src/config.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));

// src/viewport-from-frame.ts
var VIEWPORT_MIN_PX = 320;
var VIEWPORT_MAX_PX = 2560;
var DEFAULT_VIEWPORT_WIDTH = 1440;
var FRAME_VIEWPORT_MISMATCH_RATIO = 0.02;
function isFrameViewportMismatch(frameWidth, viewportWidth) {
  if (!(viewportWidth > 0) || !Number.isFinite(frameWidth) || !Number.isFinite(viewportWidth)) {
    return false;
  }
  return Math.abs(frameWidth - viewportWidth) / viewportWidth > FRAME_VIEWPORT_MISMATCH_RATIO;
}
function warnFrameViewportMismatch(frameWidth, viewportWidth) {
  if (!isFrameViewportMismatch(frameWidth, viewportWidth)) return false;
  console.log(`[fidel-ci] frame_viewport_mismatch frame=${frameWidth} viewport=${viewportWidth}`);
  return true;
}
var TOP_LEVEL_CACHE_TTL_MS = 5 * 60 * 1e3;

// src/config.ts
var WORKSPACE_SLUG = /^[a-z0-9][a-z0-9._-]{0,99}$/;
function isWorkspaceSlug(value) {
  return typeof value === "string" && WORKSPACE_SLUG.test(value);
}
var DEFAULT_VIEWPORT = { width: DEFAULT_VIEWPORT_WIDTH, height: 900 };
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
  const { checks, defaults, triggers, designSystemChecks, workspace } = parsed;
  if (workspace !== void 0 && !isWorkspaceSlug(workspace)) {
    throw new Error(
      'fidel.config.json "workspace" must be a workspace short name such as "devstaging". Run `npx usefidel init` to set it, or remove the field.'
    );
  }
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
    triggers: validatedTriggers,
    designSystemChecks: parseDesignSystemChecks(designSystemChecks),
    ...workspace !== void 0 ? { workspace } : {}
  };
}
var MAX_DESIGN_SYSTEM_CHECKS = 10;
function parseDesignSystemChecks(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const entry of raw) {
    if (out.length >= MAX_DESIGN_SYSTEM_CHECKS) break;
    if (!isRecord(entry)) continue;
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    const url = typeof entry.url === "string" ? entry.url.trim() : "";
    if (!name || !url) continue;
    const brandKey = typeof entry.brandKey === "string" && entry.brandKey.trim() ? entry.brandKey.trim() : void 0;
    out.push({ name, url, ...brandKey ? { brandKey } : {} });
  }
  return out;
}
var TEMPLATE_TOKEN = /\{(pr|sha|branch)\}|\$\{([A-Z_][A-Z0-9_]*)\}|\$([A-Z_][A-Z0-9_]*)/g;
var CREDENTIAL_PREFIXES = [
  "FIGMA_",
  "SUPABASE_",
  "FIDEL_",
  "KENSA_",
  "DISPATCH_",
  "SNAPSHOT_",
  "ACTIONS_",
  "RUNNER_",
  "INPUT_",
  "AWS_",
  "ANTHROPIC_"
];
var CREDENTIAL_FRAGMENTS = [
  "TOKEN",
  "SECRET",
  "PASSWORD",
  "PASSWD",
  "PASSPHRASE",
  "JWT",
  "CREDENTIAL",
  "PRIVATE",
  "COOKIE",
  "BEARER",
  "SIGNATURE",
  "APIKEY",
  "WEBHOOK",
  "DATABASE",
  "CONNECTION",
  "HMAC"
];
var CREDENTIAL_SEGMENTS = /* @__PURE__ */ new Set([
  "KEY",
  "KEYS",
  "AUTH",
  "OAUTH",
  "BASICAUTH",
  "AUTHORIZATION",
  "SESSION",
  "SESSIONS",
  "CERT",
  "CERTS",
  "CERTIFICATE",
  "SALT",
  "DSN",
  "PAT",
  "PWD",
  "PASS",
  "PW",
  "SIG",
  "URI",
  "DB",
  "JSON",
  "CONN",
  "CREDS"
]);
function isCredentialLikeEnvName(name) {
  const upper = name.toUpperCase();
  if (CREDENTIAL_PREFIXES.some((prefix) => upper.startsWith(prefix))) return true;
  if (CREDENTIAL_FRAGMENTS.some((fragment) => upper.includes(fragment))) return true;
  return upper.split("_").some((segment) => CREDENTIAL_SEGMENTS.has(segment) || segment.length > 3 && segment.endsWith("KEY"));
}
var CREDENTIAL_VALUE_SHAPES = [
  // URL with an embedded password: scheme://user:pass@host
  /[a-z][a-z0-9+.-]*:\/\/[^/?#\s@]*:[^/?#\s@]+@/i,
  // JSON Web Token (header.payload…)
  /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/,
  // Well-known token formats (GitHub, Figma, Supabase, Stripe, Slack, AWS key ids)
  /(?:gh[pousr]_|github_pat_|figd_|sb_secret_|sk_live_|sk_test_|rk_live_|xox[abprs]-)[A-Za-z0-9_-]{16,}/,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/,
  // PEM private key material
  /PRIVATE KEY-{3,}/
];
function looksLikeCredentialValue(value) {
  return CREDENTIAL_VALUE_SHAPES.some((shape) => shape.test(value));
}
var ConfigVariableRefusedError = class extends Error {
  variables;
  constructor(variables, mode) {
    const refs = variables.map((name) => `$${name}`).join(", ");
    super(
      mode === "workflow" ? `fidel.config.json references ${refs}, which Fidel will not expand: it looks like a credential (by name or by value). A resolved URL is fetched, stored with the run and linked from the pull-request comment, so it must not carry a secret.` : `fidel.config.json references ${refs}, but environment variables are not available to config strings on the Fidel GitHub App. Use {pr}, {sha} or {branch} instead.`
    );
    this.name = "ConfigVariableRefusedError";
    this.variables = variables;
  }
};
function buildRunnerTemplateVariables(env) {
  return {
    pr: env.PR_NUMBER || void 0,
    sha: env.HEAD_SHA || void 0,
    branch: env.HEAD_BRANCH || void 0,
    envExpansion: "none"
  };
}
function substituteVars(input, vars) {
  const mode = vars.envExpansion === "workflow" ? "workflow" : "none";
  const refused = /* @__PURE__ */ new Set();
  const output = input.replace(
    TEMPLATE_TOKEN,
    (_match, template, braced, bare) => {
      if (template === "pr") return vars.pr ?? "";
      if (template === "sha") return vars.sha ?? "";
      if (template === "branch") return vars.branch ?? "";
      const name = braced ?? bare;
      if (mode !== "workflow" || isCredentialLikeEnvName(name)) {
        refused.add(name);
        return "";
      }
      const value = process.env[name] ?? "";
      if (looksLikeCredentialValue(value)) {
        refused.add(name);
        return "";
      }
      return value;
    }
  );
  if (refused.size > 0) throw new ConfigVariableRefusedError([...refused], mode);
  return output;
}
function resolveCheck(check, defaults, vars) {
  const explicitViewport = check.viewport ?? defaults?.viewport;
  const viewport = explicitViewport ?? DEFAULT_VIEWPORT;
  const waitAfterLoadMs = check.waitAfterLoadMs ?? defaults?.waitAfterLoadMs ?? DEFAULT_WAIT_AFTER_LOAD_MS;
  const waitForLoadState = check.waitForLoadState ?? defaults?.waitForLoadState ?? DEFAULT_WAIT_FOR_LOAD_STATE;
  const textMode = check.textMode ?? defaults?.textMode ?? DEFAULT_TEXT_MODE;
  return {
    name: check.name.trim(),
    figma: substituteVars(check.figma, vars),
    url: substituteVars(check.url, vars),
    viewport,
    viewportExplicit: explicitViewport != null,
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
var MIN_VIEWPORT_PX = VIEWPORT_MIN_PX;
var MAX_VIEWPORT_PX = VIEWPORT_MAX_PX;
function requireViewportAxis(value, location) {
  const n = requirePositiveInteger(value, location);
  if (n < MIN_VIEWPORT_PX || n > MAX_VIEWPORT_PX) {
    throw new Error(
      `${location} must be between ${MIN_VIEWPORT_PX} and ${MAX_VIEWPORT_PX} (got ${n})`
    );
  }
  return n;
}
function validateViewport(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be an object`);
  }
  return {
    width: requireViewportAxis(value.width, `${location}.width`),
    height: requireViewportAxis(value.height, `${location}.height`)
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
var import_crypto = __toESM(require("crypto"));
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
var DEFAULT_TTL_MS = 24 * 60 * 60 * 1e3;
function getCacheDir(baseDir) {
  return baseDir || import_path3.default.join(process.cwd(), ".fidel-cache");
}
function getCacheFilePath(fileKey, nodeId, baseDir) {
  const name = import_crypto.default.createHash("sha256").update(`${fileKey}:${nodeId}`).digest("hex");
  return import_path3.default.join(getCacheDir(baseDir), `${name}.json`);
}
function getCachedSpecs(fileKey, nodeId, options) {
  const filePath = getCacheFilePath(fileKey, nodeId, options?.cacheDir);
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;
  try {
    if (!import_fs3.default.existsSync(filePath)) return null;
    const raw = import_fs3.default.readFileSync(filePath, "utf8");
    const entry = JSON.parse(raw);
    if (entry.fileKey !== fileKey || entry.nodeId !== nodeId) return null;
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
  "incompatible_action_version",
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
  incompatible_action_version: "customer_configuration",
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
  incompatible_action_version: "This Fidel Action is no longer compatible with the Fidel service. Upgrade to usefidel/fidel-action@v3.",
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
  let url;
  try {
    url = substituteVars(check.url, opts.templateVariables);
  } catch (err) {
    return operationalFailure(check, check.url, startedAt, err.message || String(err));
  }
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
  const axTree = data.axTree ?? null;
  if (axTree) {
    const semanticCount = Array.isArray(axTree.semanticNodes) ? axTree.semanticNodes.length : "?";
    console.log(`[fidel-runner] Snapshot Lambda AX tree: ${semanticCount} semantic nodes`);
  }
  return { domElements: data.domElements, axTree };
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
async function main() {
  const configJson = process.env.CONFIG_JSON;
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
  const supabaseJwt = process.env.SUPABASE_JWT;
  const pipelineUrl = process.env.PIPELINE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const headSha = process.env.HEAD_SHA;
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
  const runnerTemplateVariables = buildRunnerTemplateVariables(process.env);
  const dsTemplateVariables = runnerTemplateVariables;
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
  let resolvedChecks;
  try {
    const tmpConfigPath = "/tmp/fidel.config.json";
    import_fs4.default.writeFileSync(tmpConfigPath, effectiveConfigJson, "utf8");
    config = loadConfig(tmpConfigPath);
    resolvedChecks = config.checks.map(
      (check) => resolveCheck(check, config.defaults, runnerTemplateVariables)
    );
  } catch (err) {
    console.error(`[fidel-runner] Invalid config: ${err.message}`);
    process.exit(1);
  }
  console.log(`[fidel-runner] Running ${resolvedChecks.length} check(s)`);
  const results = [];
  const repositoryFullName = process.env.REPOSITORY || "";
  const backend = {
    url: process.env.SUPABASE_URL || "",
    anonKey: supabaseAnonKey || ""
  };
  try {
    assertUsableBackend(backend, "runner");
  } catch (err) {
    console.error(err.message);
    console.error(
      "[fidel-runner] SUPABASE_URL and SUPABASE_ANON_KEY must both name the project this dispatch targets. They are resolved together by the workflow's env gate; a missing or malformed pair is a configuration fault, not a check failure."
    );
    process.exit(1);
  }
  for (const check of resolvedChecks) {
    results.push(await runCheck(check, figmaToken, pipelineUrl, supabaseJwt, backend, repositoryFullName, headSha || ""));
  }
  const resultsB64 = Buffer.from(JSON.stringify(results)).toString("base64");
  const successCount = results.filter((r) => r.status === "success").length;
  const failCount = results.filter((r) => r.status === "failed").length;
  const failedResults = results.filter((r) => r.status === "failed");
  const firstFailure = failedResults[0];
  const failureClass = classifyFailureBatch(failedResults.map((r) => r.errorCode));
  const errorCodeOutput = firstFailure?.errorCode ?? "";
  if (outputFile) {
    import_fs4.default.appendFileSync(outputFile, `results=${resultsB64}
`);
    if (errorCodeOutput) {
      import_fs4.default.appendFileSync(outputFile, `error_code=${errorCodeOutput}
`);
    }
    if (firstFailure?.upgradeTo) {
      import_fs4.default.appendFileSync(outputFile, `upgrade_to=${firstFailure.upgradeTo}
`);
    }
    if (failedResults.length > 0) {
      import_fs4.default.appendFileSync(outputFile, `failure_class=${failureClass}
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
async function runCheck(check, figmaToken, pipelineUrl, supabaseToken, backend, repositoryFullName, headSha) {
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
    const frameWidth = figmaSpecs[0]?.boundingBox?.width;
    if (typeof frameWidth === "number") {
      warnFrameViewportMismatch(frameWidth, check.viewport.width);
    }
    await waitForUrl(check.url);
    const snapshotLambdaUrl = process.env.SNAPSHOT_LAMBDA_URL;
    const snapshotLambdaSecret = process.env.SNAPSHOT_LAMBDA_SECRET || "";
    let domElements;
    let axTree = null;
    if (snapshotLambdaUrl) {
      if (!snapshotLambdaSecret) {
        console.log("[fidel-runner] Warning: SNAPSHOT_LAMBDA_SECRET is not set \u2014 Lambda may reject unauthenticated requests");
      }
      const lambdaResult = await captureSnapshotViaLambda(snapshotLambdaUrl, snapshotLambdaSecret, {
        url: check.url,
        viewport: check.viewport,
        waitAfterLoadMs: check.waitAfterLoadMs,
        waitForLoadState: check.waitForLoadState,
        waitForSelector: check.waitForSelector
      });
      domElements = lambdaResult.domElements;
      axTree = lambdaResult.axTree;
    } else {
      const snapshotResult = await captureSnapshot({
        url: check.url,
        viewport: check.viewport,
        waitAfterLoadMs: check.waitAfterLoadMs,
        waitForLoadState: check.waitForLoadState,
        waitForSelector: check.waitForSelector
      });
      domElements = snapshotResult.elements;
      axTree = snapshotResult.axTree;
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
    const pipeline = await runPipelineWithBackend(
      figmaSpecs,
      domElements,
      pipelineUrl,
      supabaseToken,
      check.textMode,
      "supabase-jwt",
      { figmaUrl: check.figma, liveUrl: check.url, idempotencyKey, viewport: check.viewport, axTree },
      backend
    );
    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[fidel-runner] "${check.name}" scored ${pipeline.score}/100 with ${pipeline.totalDiffs} issue(s)`
    );
    saveRunForRunner({
      figmaUrl: check.figma,
      liveUrl: check.url,
      pipeline,
      supabaseToken,
      elapsedMs,
      backend
    }).catch((err) => {
      console.log(`[fidel-runner] Save run failed (non-fatal): ${err.message}`);
    });
    return {
      name: check.name,
      status: "success",
      figmaUrl: check.figma,
      previewUrl: check.url,
      score: pipeline.score,
      totalDiffs: pipeline.totalDiffs,
      // Counts and summaries over findings only; capture-incomplete rows go
      // to `notVerified` (Rule B, rule-b-presentation/PLAN.md D3).
      ...runnerFindingFields(pipeline.diffs),
      elapsedMs
    };
  } catch (error) {
    const message = error.message || String(error);
    const elapsedMs = Date.now() - startedAt;
    console.error(`[fidel-runner] Check "${check.name}" failed: ${message}`);
    const errorPayload = deriveErrorPayload(error, message);
    saveRunForRunner({
      figmaUrl: check.figma,
      liveUrl: check.url,
      pipeline: null,
      supabaseToken,
      elapsedMs,
      errorPayload,
      errorMessage: message.slice(0, 500),
      backend
    }).catch((saveErr) => {
      console.log(`[fidel-runner] Save error run failed (non-fatal): ${saveErr.message}`);
    });
    return {
      name: check.name,
      status: "failed",
      figmaUrl: check.figma,
      previewUrl: check.url,
      error: errorPayload.userMessage,
      errorCode: errorPayload.errorCode,
      upgradeTo: errorPayload.upgradeTo,
      isRetryable: errorPayload.isRetryable,
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
  const classified = classifyUnstructuredError(message);
  if (classified) return classified;
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
void main();
