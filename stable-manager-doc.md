# 📘 stable-manager

A tiny zero-dependency CLI tool to manage **working vs. stable versions** of your files.
Useful when experimenting with code but keeping a safe baseline around.

---

## ✨ Features
- No dependencies — just plain Node.js
- Create a **stable** copy of any file on demand
- Restore the **working** file from its stable baseline
- Automatically creates a **backup** of your last working state when restoring
- `clean` command to remove all `*-stable.*` and `*.backup.*` files
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

```sh
stable-manager promote <path/to/file> [--force]   # copy working → stable
stable-manager restore <path/to/file> [--force]   # copy stable → working (creates backup of current working file)
stable-manager clean                             # remove all stable & backup files
stable-manager -h/help                              # show usage
stable-manager -v/--version                         # show version
stable-manager list [--deep] shows a list of all stble/backup files in folder -> project

```

### Examples

```sh
stable-manager promote src/core/snap-core.js
stable-manager restore src/components/math-card/math-card.js
stable-manager clean
stable-manager list ./src --deep


```

This will create/update files like:

```
src/core/snap-core.js         → src/core/snap-core-stable.js
src/core/snap-core-backup.js  → backup of the working file before restore

```

---

## 📂 Tracked files

`stable-manager` automatically lists which `*-stable.*` and `*-backup*`files it finds in your project.

---

## 🛡️ Safety Net

- **Stable file** (`*-stable.*`): your trusted baseline.
- **Backup file** (`*-backup.*`): automatically created when you restore, so you never lose your in-progress experiments by mistake.
- **Clean**: removes all stables and backups if you want to start fresh or your DONE!!!.

## ❓ FAQ

---
### Why use this instead of Git?
Sometimes you just want a **quick, human-visible baseline** without staging or committing.
This tool lets you experiment freely and roll back instantly, without touching version control.

### Does this only work for JavaScript?
No! It works with **any file type or language** — C++, Python, Rust, configs, docs, you name it.
`stable-manager` doesn’t parse code, it just keeps a `*-stable` copy of your file.

### Can I delete a stable file?
Yes, just remove the `*-stable.*` file manually. The tool won’t auto-recreate it unless you promote again.

---

## 🛡️ License

MIT — feel free to use, share, and improve!
