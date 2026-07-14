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

// src/setup.ts
var import_child_process = require("child_process");
function setup() {
  try {
    require.resolve("playwright");
    console.log("[fidel-ci] Playwright already installed, skipping npm install.");
  } catch {
    console.log("[fidel-ci] Installing Playwright...");
    (0, import_child_process.execSync)("npm install --no-save playwright", {
      stdio: "inherit",
      timeout: 12e4
    });
  }
  try {
    const result = (0, import_child_process.execSync)("npx playwright install --dry-run chromium 2>&1", {
      encoding: "utf8",
      timeout: 1e4
    });
    if (result.includes("already installed")) {
      console.log("[fidel-ci] Chromium already installed, skipping.");
      return;
    }
  } catch {
  }
  console.log("[fidel-ci] Installing Chromium browser...");
  (0, import_child_process.execSync)("npx playwright install chromium --with-deps", {
    stdio: "inherit",
    timeout: 3e5
  });
  console.log("[fidel-ci] Setup complete.");
}
setup();
