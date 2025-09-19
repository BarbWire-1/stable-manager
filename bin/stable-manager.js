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

const [cmd, fileArg, flag] = process.argv.slice(2);
const FORCE = flag === "--force";

const rel = (f) => path.relative(process.cwd(), f);

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
 * Recursively find all *-stable.* and *-backup.* files under cwd.
 */
function listSpecialFiles(dir = process.cwd(), results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listSpecialFiles(full, results);
    } else if (/(?:-stable|-backup)\.[^.]+$/.test(entry.name)) {
      results.push(rel(full));
    }
  }
  return results;
}

/**
 * get the current version from package.json
 */
function getVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
    );
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
  stable-manager -h/help                            Show this message
  stable-manager -v/--version                       Show version

Examples:
  stable-manager promote src/core/snap-core.js
  stable-manager restore src/core/snap-core.js
  stable-manager clean

⚡ --force   Skip confirmations (use with care!)
`);

  const stables = listSpecialFiles().filter((f) => f.includes("-stable"));
  if (stables.length) {
    console.log("📂 Currently tracked stable files:");
    stables.forEach((f) => console.log("  - " + f));
  } else {
    console.log(
      "📂 No stable files found yet. Use 'promote <file>' to create one."
    );
  }

  console.log(
    "\n💡 Tip: 'restore' creates backups automatically. Use 'clean' to remove all stables and backups.\n"
  );
}

async function run() {
  switch (cmd) {
    case "promote": {
      if (!fileArg) return showHelp();

      const WORKING = path.resolve(process.cwd(), fileArg);
      const { dir, name, ext } = path.parse(WORKING);
      const STABLE = path.join(dir, `${name}-stable${ext}`);
      const working = fs.readFileSync(WORKING, "utf8");

      if (FORCE) {
        fs.writeFileSync(STABLE, working);
        console.log(
          `✅ Stable version created/updated (forced): ${rel(STABLE)}`
        );
        break;
      }

      const ans = await ask(
        `⚡ Promote ${rel(WORKING)} → ${rel(STABLE)}? (y/n) `
      );
      if (ans === "y" || ans === "yes") {
        fs.writeFileSync(STABLE, working);
        console.log(`✅ Stable version created/updated: ${rel(STABLE)}`);
      } else {
        console.log("❌ Aborted.");
      }
      break;
    }

    case "restore": {
      if (!fileArg) return showHelp();

      const WORKING = path.resolve(process.cwd(), fileArg);
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
      const files = listSpecialFiles();
      if (!files.length) {
        console.log("📂 No stable/backup files to remove.");
        break;
      }

      const doClean = () => {
        files.forEach((f) => {
          fs.unlinkSync(path.resolve(process.cwd(), f));
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
    default:
      showHelp();
  }
}

run();
