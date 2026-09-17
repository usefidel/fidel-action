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
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var ACTION_ROOT = path.join(__dirname, "..");
var ACTION_NODE_PATH = path.join(ACTION_ROOT, "node_modules");
function nodePathEnv() {
  const existing = process.env.NODE_PATH;
  const nodePath = existing ? `${ACTION_NODE_PATH}${path.delimiter}${existing}` : ACTION_NODE_PATH;
  return { ...process.env, NODE_PATH: nodePath };
}
function setup() {
  const env = nodePathEnv();
  try {
    require.resolve("playwright", { paths: [ACTION_ROOT] });
    console.log("[fidel-ci] Playwright already installed, skipping npm install.");
  } catch {
    console.log("[fidel-ci] Installing Playwright...");
    (0, import_child_process.execSync)("npm install --no-save playwright", {
      cwd: ACTION_ROOT,
      env,
      stdio: "inherit",
      timeout: 12e4
    });
  }
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `NODE_PATH=${env.NODE_PATH}
`);
  }
  try {
    const result = (0, import_child_process.execSync)("npx playwright install --dry-run chromium 2>&1", {
      cwd: ACTION_ROOT,
      env,
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
    cwd: ACTION_ROOT,
    env,
    stdio: "inherit",
    timeout: 3e5
  });
  console.log("[fidel-ci] Setup complete.");
}
setup();
