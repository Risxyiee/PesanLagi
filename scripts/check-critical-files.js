#!/usr/bin/env node

/**
 * Pre-push guard: verifies critical API route files exist and are non-empty.
 * Exit code 1 = at least one file is missing or empty.
 *
 * Usage:
 *   node scripts/check-critical-files.js          # manual check
 *   npm run prepush                                # via package.json script
 */

/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const fs = require("fs");
const path = require("path");

const CRITICAL_FILES = [
  "src/app/api/upload/route.ts",
  "src/app/api/auth/sign-in/route.ts",
  "src/app/api/auth/sign-up/route.ts",
  "src/app/api/midtrans/webhook/route.ts",
  "src/app/api/midtrans/create-transaction/route.ts",
];

const projectRoot = path.resolve(__dirname, "..");
let hasError = false;

for (const file of CRITICAL_FILES) {
  const full = path.join(projectRoot, file);
  try {
    const stat = fs.statSync(full);
    if (stat.size === 0) {
      console.error(`[CRITICAL] ${file} exists but is EMPTY (0 bytes)`);
      hasError = true;
    }
  } catch {
    console.error(`[CRITICAL] ${file} is MISSING`);
    hasError = true;
  }
}

if (hasError) {
  console.error("");
  console.error("Action required: restore missing files before pushing.");
  process.exit(1);
}

console.log("[OK] All critical files present and non-empty.");
