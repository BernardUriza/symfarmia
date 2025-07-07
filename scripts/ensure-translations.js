#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");

const ROOT = path.join(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "locales");
const LANGS = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());

function flatten(obj, prefix = "") {
  const res = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      Object.assign(res, flatten(value, newKey));
    } else {
      res[newKey] = value;
    }
  }
  return res;
}

function unflatten(obj) {
  const result = {};
  for (const [flatKey, value] of Object.entries(obj)) {
    if (!flatKey) continue;
    const keys = flatKey.split(".").filter(Boolean);
    if (keys.length === 0) continue;
    let current = result;
    keys.forEach((k, idx) => {
      if (idx === keys.length - 1) {
        current[k] = value;
      } else {
        if (!current[k]) current[k] = {};
        current = current[k];
      }
    });
  }
  return result;
}

function loadLocale(lang) {
  const dir = path.join(LOCALES_DIR, lang);
  const files = glob.sync("*.json", { cwd: dir, absolute: true });
  let merged = {};
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(f, "utf8"));
    merged = { ...merged, ...flatten(data) };
  });
  const autoPath = path.join(dir, "auto_generated.json");
  let auto = {};
  if (fs.existsSync(autoPath)) {
    const data = JSON.parse(fs.readFileSync(autoPath, "utf8"));
    auto = flatten(data);
    merged = { ...merged, ...auto };
  }
  return { merged, auto, autoPath };
}

(async () => {
  const files = await glob(["**/*.{js,jsx,ts,tsx}"], {
    cwd: ROOT,
    ignore: ["node_modules/**", ".next/**"],
  });
  const keyRegex =
    /\bt\(\s*[`'\"]([a-zA-Z0-9_.-]*[_.][a-zA-Z0-9_.-]+)['"`]\s*\)/g;
  const keys = new Set();
  files.forEach((file) => {
    const content = fs.readFileSync(path.join(ROOT, file), "utf8");
    let m;
    while ((m = keyRegex.exec(content))) {
      keys.add(m[1]);
    }
  });

  LANGS.forEach((lang) => {
    const locale = loadLocale(lang);
    let updated = false;
    keys.forEach((key) => {
      if (locale.merged[key] === undefined) {
        locale.auto[key] = key;
        updated = true;
      }
    });
    if (updated) {
      const data = unflatten(locale.auto);
      fs.writeFileSync(locale.autoPath, JSON.stringify(data, null, 2));
      console.log(
        `Updated ${lang} translations at ${path.relative(ROOT, locale.autoPath)}`,
      );
    }
  });
})();
