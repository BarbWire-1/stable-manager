#!/usr/bin/env node
/**
 * Stable Manager
 ** MIT License
 * Copyright(c) 2025 BarbrWire-1 aka Barbara Kälin
 *
 * @format
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const [cmd, fileArg, flag] = process.argv.slice(2);
const FORCE = flag === "--force" || fileArg === "--force";
const DEEP = flag === "--deep" || fileArg === "--deep";

/**
 * Find project root (nearest package.json), fallback to cwd.
 */
function findRoot(startDir = process.cwd()) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
  return startDir;
}
const ROOT = findRoot();

const rel = (f) => path.relative(ROOT, f);

/**
 * Ask user for confirmation (y/n).
 */
function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Fail if no stable file exists.
 */
function failNoStable(stable) {
  console.error(`❌ No stable file exists yet: ${rel(stable)}`);
  console.error(`   Run "promote" first to create a stable baseline.`);
  process.exit(1);
}

/**
 * List *-stable.* and *-backup.* files.
 */
function listSpecialFiles(dir = ROOT, results = [], recursive = false) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (["node_modules", "dist", "build"].includes(entry.name)) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) listSpecialFiles(full, results, recursive);
    } else if (/(?:-stable|-backup)\.[^.]+$/.test(entry.name)) {
      results.push(rel(full));
    }
  }
  return results;
}

/**
 * get the current version from this package's package.json
 */
function getVersion() {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    // adjust path if your script lives in ./bin/stable-manager.js
    const pkgPath = path.resolve(__dirname, "../package.json");
    const pkg = require(pkgPath);
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}
const version = getVersion();


/**
 * Show help text.
 */
function showHelp() {
  console.log(`
📘 Stable Manager v${version}

Usage:
  stable-manager promote <path/to/file> [--force]   Copy working → stable (creates/updates <file>-stable.ext)
  stable-manager restore <path/to/file> [--force]   Copy stable → working (restores baseline, saves backup)
  stable-manager clean [--force]                    Remove all *-stable.* and *-backup.* files
  stable-manager list [dir] [--deep]                Show tracked stable/backup files (safe, no auto-scan)
  stable-manager -h/help                            Show this message
  stable-manager -v/--version                       Show version

Examples:
  stable-manager promote src/core/snap-core.js
  stable-manager restore src/core/snap-core.js
  stable-manager clean
  stable-manager list ./src --deep

⚡ --force   Skip confirmations (use with care!)
`);
}

async function run() {
  switch (cmd) {
    case "promote": {
      if (!fileArg || fileArg.startsWith("--")) {
        console.error("❌ Missing file path for promote.");
        return showHelp();
      }

      const WORKING = path.resolve(ROOT, fileArg);
      if (!fs.existsSync(WORKING)) {
        console.error(`❌ File not found: ${rel(WORKING)}`);
        process.exit(1);
      }

      const { dir, name, ext } = path.parse(WORKING);
      const STABLE = path.join(dir, `${name}-stable${ext}`);
      const working = fs.readFileSync(WORKING, "utf8");

      if (FORCE) {
        fs.writeFileSync(STABLE, working);
        console.log(`✅ Stable version created/updated (forced): ${rel(STABLE)}`);
        break;
      }

      const ans = await ask(`⚡ Promote ${rel(WORKING)} → ${rel(STABLE)}? (y/n) `);
      if (ans === "y" || ans === "yes") {
        fs.writeFileSync(STABLE, working);
        console.log(`✅ Stable version created/updated: ${rel(STABLE)}`);
      } else {
        console.log("❌ Aborted.");
      }
      break;
    }

    case "restore": {
      if (!fileArg || fileArg.startsWith("--")) {
        console.error("❌ Missing file path for restore.");
        return showHelp();
      }

      const WORKING = path.resolve(ROOT, fileArg);
      const { dir, name, ext } = path.parse(WORKING);
      const STABLE = path.join(dir, `${name}-stable${ext}`);
      const BACKUP = path.join(dir, `${name}-backup${ext}`);

      if (!fs.existsSync(STABLE)) failNoStable(STABLE);

      const doRestore = async () => {
        if (fs.existsSync(WORKING)) {
          fs.copyFileSync(WORKING, BACKUP);
          console.log(`💾 Backup saved: ${rel(BACKUP)}`);
        }
        fs.copyFileSync(STABLE, WORKING);
        console.log(`✅ Working version restored: ${rel(WORKING)}`);
      };

      if (FORCE) {
        await doRestore();
        break;
      }

      const ans = await ask(
        `⏪ Restore ${rel(STABLE)} → ${rel(WORKING)} (backup will be saved)? (y/n) `
      );
      if (ans === "y" || ans === "yes") {
        await doRestore();
      } else {
        console.log("❌ Aborted.");
      }
      break;
    }

    case "clean": {
      const files = listSpecialFiles(ROOT, [], true);
      if (!files.length) {
        console.log("📂 No stable/backup files to remove.");
        break;
      }

      const doClean = () => {
        files.forEach((f) => {
          fs.unlinkSync(path.resolve(ROOT, f));
          console.log(`🗑️ Removed: ${f}`);
        });
        console.log("✅ Clean complete.");
      };

      if (FORCE) {
        doClean();
        break;
      }

      const ans = await ask(
        `⚠️ Remove ALL stable/backup files (${files.length} found)? (y/n) `
      );
      if (ans === "y" || ans === "yes") {
        doClean();
      } else {
        console.log("❌ Aborted.");
      }
      break;
    }

    case "list": {
      const baseDir =
        fileArg && !fileArg.startsWith("--")
          ? path.resolve(ROOT, fileArg)
          : ROOT;

      if (!fs.existsSync(baseDir)) {
        console.error(`❌ Directory not found: ${rel(baseDir)}`);
        process.exit(1);
      }

      const files = listSpecialFiles(baseDir, [], DEEP);
      if (files.length) {
        console.log("📂 Tracked stable/backup files:");
        files.forEach((f) => console.log("  - " + f));
      } else {
        console.log("📂 No stable/backup files found in " + rel(baseDir));
      }
      break;
    }

    case "v":
    case "-v":
    case "--v":
    case "version":
    case "--version":
      console.log(`📘 Stable Manager v${version}`);
      break;

    case "help":
    case "--help":
    case "-h":
      showHelp();
      break;

    default:
      console.error(`❌ Unknown command: ${cmd}`);
      showHelp();
  }
}


run();
