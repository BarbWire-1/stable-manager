#!/usr/bin/env node
/**
 * Stable Manager
 * MIT License
 * Copyright(c) 2025 BarbWire aka Barbara Kälin
 *

 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';


const [cmd, fileArg, flag] = process.argv.slice(2);
const FORCE = flag === '--force';

const rel = f => path.relative(process.cwd(), f);

/**
 * Ask user for confirmation (y/n).
 */
function ask(question) {
	return new Promise(resolve => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.question(question, answer => {
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
 * Recursively find all *-stable.* files under cwd.
 */
function listStableFiles(dir = process.cwd(), results = []) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			listStableFiles(full, results);
		} else if (/-stable\.[^.]+$/.test(entry.name)) {
			results.push(rel(full));
		}
	}
	return results;
}

/**
 * Show help text.
 */
function showHelp() {
	console.log(`
📘 Stable Manager

Usage:
  promote <path/to/file> [--force]   Copy working → stable (creates/updates <file>-stable.ext)
  restore <path/to/file> [--force]   Copy stable → working (restores baseline)
  help                       Show this message

Examples:
  stable-manager promote src/core/snap-core.js
  stable-manager restore src/core/snap-core.js
`);

	const stables = listStableFiles();
	if (stables.length) {
		console.log('📂 Currently tracked stable files:');
		stables.forEach(f => console.log('  - ' + f));
	} else {
		console.log(
			"📂 No stable files found yet. Use 'promote <file>' to create one."
		);
	}
}

async function run() {
	switch (cmd) {
		case 'promote': {
			if (!fileArg) return showHelp();

			const WORKING = path.resolve(process.cwd(), fileArg);
			const { dir, name, ext } = path.parse(WORKING);
			const STABLE = path.join(dir, `${name}-stable${ext}`);
			const working = fs.readFileSync(WORKING, 'utf8');

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
			if (ans === 'y' || ans === 'yes') {
				fs.writeFileSync(STABLE, working);
				console.log(
					`✅ Stable version created/updated: ${rel(STABLE)}`
				);
			} else {
				console.log('❌ Aborted.');
			}
			break;
		}

		case 'restore': {
			if (!fileArg) return showHelp();

			const WORKING = path.resolve(process.cwd(), fileArg);
			const { dir, name, ext } = path.parse(WORKING);
			const STABLE = path.join(dir, `${name}-stable${ext}`);

			if (!fs.existsSync(STABLE)) failNoStable(STABLE);

			if (FORCE) {
				fs.copyFileSync(STABLE, WORKING);
				console.log(
					`✅ Working version restored (forced): ${rel(WORKING)}`
				);
				break;
			}

			const ans = await ask(
				`⏪ Restore ${rel(STABLE)} → ${rel(WORKING)}? (y/n) `
			);
			if (ans === 'y' || ans === 'yes') {
				fs.copyFileSync(STABLE, WORKING);
				console.log(`✅ Working version restored: ${rel(WORKING)}`);
			} else {
				console.log('❌ Aborted.');
			}
			break;
		}

		case 'help':
		default:
			showHelp();
	}
}

run();
