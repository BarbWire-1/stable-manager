
# 📘 stable-manager

A tiny zero-dependency CLI tool to manage **working vs. stable versions** of your files.
Useful when experimenting with code but keeping a safe baseline around.

---

## ✨ Features
- No dependencies — just plain Node.js (requires a recent Node runtime)
- Create a **stable** copy of any file on demand
- Restore the **working** file from its stable baseline
- Automatically creates a **backup** of your last working state when restoring
- `clean` command to remove `*-stable.*` and `*-backup.*` files
- `list` command to show tracked stable/backup files (safe by default)
- `--deep` flag to enable recursive/deep scanning when listing or cleaning
- Simple `y/n` confirmation (or `--force` to skip prompts)
- Works with **any project structure** and **any file type**

---

## 📦 Installation

Clone or install globally:

```sh
git clone https://github.com/BarbWire-1/stable-manager.git
cd stable-manager
pnpm link --global    # or npm link
```

Now `stable-manager` is available everywhere.

---

## 🚀 Usage

```
stable-manager promote <path/to/file> [--force]       # copy working → stable
stable-manager restore <path/to/file> [--force]       # copy stable → working (creates backup of current working file)
stable-manager list [<path>] [--deep]                 # list tracked stable/backup files (safe, non-recursive by default)
stable-manager clean [<path>] [--deep] [--force]      # remove stable/backup files (ask before deleting)
stable-manager help                                    # show usage
stable-manager --version                               # show version
```

### Notes on `list` & `--deep`
- `list` without a `<path>` searches **only the current working directory** (non-recursive) — this is deliberate to avoid scanning your entire filesystem accidentally.
- `list <path>` searches the given directory (non-recursive by default).
- Add `--deep` to recurse into subdirectories (e.g. `stable-manager list src --deep`) — use with care.
- `clean` follows the same rules: `clean` without `--deep` will operate at the specified directory level only; add `--deep` to remove recursively.

### Examples

```sh
# Promote a file to stable (creates src/core/snap-core-stable.js)
stable-manager promote src/core/snap-core.js

# Restore a working file from stable (saves a backup like src/core/snap-core-backup.js)
stable-manager restore src/core/snap-core.js

# List stable/backup files in current directory (non-recursive)
stable-manager list

# List stable/backup files in src recursively
stable-manager list src --deep

# Remove stable/backup files in current directory (asks first)
stable-manager clean

# Force-remove stable/backup files in src recursively (no prompt)
stable-manager clean src --deep --force
```

This will create/update files like:

```
src/core/snap-core.js         → src/core/snap-core-stable.js
src/core/snap-core-backup.js  → backup of the working file before restore
```

---

## 📂 Tracked files

`stable-manager` can show which `*-stable.*` and `*-backup.*` files exist.  
By default `list` is safe (non-recursive) — add `--deep` to include subfolders.

---

## 🛡️ Safety Net

- **Stable file** (`*-stable.*`): your trusted baseline.
- **Backup file** (`*-backup.*`): automatically created when you restore, so you never lose your in-progress experiments.
- **List** defaults to non-recursive to avoid accidental full-disk scans (use `--deep` to explicitly opt-in).
- **Clean** only deletes files that match the stable/backup pattern; with `--deep` it will recurse into subfolders (confirmations are requested unless `--force` is used).

---

## ❓ FAQ

### Why use this instead of Git?
Sometimes you just want a **quick, human-visible baseline** without staging or committing.
This tool lets you experiment freely and roll back instantly, without touching version control.

### Does this only work for JavaScript?
No! It works with **any file type or language** — C++, Python, Rust, configs, docs, you name it.
`stable-manager` doesn’t parse code, it just keeps a `*-stable` copy of your file.

### Can I delete a stable file?
Yes, just remove the `*-stable.*` file manually. The tool won’t auto-recreate it unless you `promote` again.

### Is scanning safe?
Yes — by default `list` and `clean` operate non-recursively in the specified directory (or current working dir if none specified). Use `--deep` to explicitly request recursion.

---

## 🛡️ License

MIT — feel free to use, share, and improve!
