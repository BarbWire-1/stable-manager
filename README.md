# 📘 stable-manager

A tiny zero-dependency CLI tool to manage **working vs. stable versions** of your files.
Useful when experimenting with code but keeping a safe baseline around.

---

## ✨ Features
- No dependencies — just plain Node.js
- Create a stable copy of any file on demand
- Restore the working file from its stable baseline
- Simple `y/n` confirmation (or `--force` to skip prompts)
- Works with any project structure

---

## 📦 Installation

Clone or install globally:

```sh
git clone https://github.com/YOURNAME/stable-manager.git
cd stable-manager
pnpm link --global    # or npm link
```

Now `stable-manager` is available everywhere.

---

## 🚀 Usage

```sh
stable-manager promote <path/to/file> [--force]   # copy working → stable
stable-manager restore <path/to/file> [--force]   # copy stable → working
stable-manager help                       # show usage
```

### Examples

```sh
stable-manager promote src/core/snap-core.js
stable-manager restore src/components/math-card/math-card.js
```

This will create/update files like:

```
src/core/snap-core.js        → src/core/snap-core-stable.js
src/components/math-card.js  → src/components/math-card-stable.js
```

---

## 📂 Tracked files

`stable-manager` automatically lists which `*-stable.*` files it finds in your project.

---

## 🛡️ License

MIT — feel free to use, share, and improve!
