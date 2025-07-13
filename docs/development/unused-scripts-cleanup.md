# 🧹 Unused Scripts Cleanup

## 📝 Summary

Removed deprecated and unused npm scripts from package.json to reduce confusion and maintain a clean codebase.

## ❌ Scripts Removed

1. **`deve`** - Internal script, merged into `dev` command
2. **`dev:original`** - Internal script, merged into `dev` command  
3. **`kill:brave-cache:bash`** - Duplicate of `kill:brave-cache` (JS version)
4. **`build:original`** - Deprecated, replaced by `build:guardian`
5. **`deploy`** - Incomplete script that only ran version:generate and build
6. **`dev:all`** - Duplicate of `dev` (both run Next.js + susurro)
7. **`kill-ports`** - Duplicate of `kill:ports`

## ✅ Scripts Kept

- **`build:enhanced`** - Referenced in CI/CD documentation
- **`build:emergency`** - Special build for emergency situations
- **`build:fast`** - Fast build mode referenced in CI/CD
- **`validate-turbo`** - Used by health checks and build guardian
- All **`permanent:*`** scripts - Well-documented permanent server
- All **`setup:*`** and **`test:microservice*`** scripts - Active microservice support

## 🔄 Updates Made

### package.json
- Consolidated `dev` command to directly run build guardian and dev server
- Removed all deprecated scripts

### Documentation Updates
- `CLAUDE.md` - Updated references from `kill-ports` to `kill:ports`
- `docs/development/dev-notes/microservices.md` - Updated script references
- `microservices/susurro-test/integrate-nextjs.sh` - Changed `dev:all` to `dev`
- `scripts/build-guardian.js` - Updated console output

## 📊 Impact

- **Before**: 30 scripts (with 7 unused/duplicates)
- **After**: 23 scripts (all actively used)
- **Benefit**: Cleaner package.json, less confusion for developers

## 🎯 Developer Experience

The main `dev` command remains unchanged from a user perspective:
```bash
npm run dev  # Still starts both Next.js and microservices
```

All commonly used commands remain the same, just removed the clutter.