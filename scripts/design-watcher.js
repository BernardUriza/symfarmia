#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DesignSystemWatcher {
  constructor() {
    this.legacyPath = path.resolve(__dirname, '../legacy-design');
    this.diaryPath = path.resolve(__dirname, '../dev-notes/diary.md');
    this.hashFile = path.join(this.legacyPath, '.design-hash');
  }

  watchDesignChanges() {
    const lastHash = this.getLastDesignHash();
    const currentHash = this.calculateDesignHash();

    if (lastHash !== currentHash) {
      this.logDesignChange(currentHash);
      this.updateDiary();
      this.notifyTeam();
    }
  }

  calculateDesignHash() {
    try {
      const currentPath = path.join(this.legacyPath, 'figma-exports', 'current');
      const output = execSync(`find ${currentPath} -type f -exec md5sum {} + | md5sum`);
      return output.toString().trim().split(' ')[0];
    } catch (error) {
      return 'no-design-found';
    }
  }

  getLastDesignHash() {
    if (fs.existsSync(this.hashFile)) {
      return fs.readFileSync(this.hashFile, 'utf8').trim();
    }
    return null;
  }

  logDesignChange(hash) {
    fs.writeFileSync(this.hashFile, hash);
  }

  updateDiary() {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const entry = `\n<!-- ENTRY_START: DESIGN_AUTO_${Date.now()} -->\n## 🎨 Design System Update [${timestamp}]\n**Context**: Figma export updated\n**Status**: 🔄 DESIGN_REFERENCE_UPDATED\n**Changes**: New design assets detected in /legacy-design/current/\n**Impact**: All UI components should be reviewed against new reference\n\n**Action Required**:\n- [ ] Review visual changes\n- [ ] Update component mappings\n- [ ] Test existing UI against new design\n- [ ] Update component migration status\n\n**Next**: Developers should check /legacy-design/migration-log.md\n<!-- ENTRY_END: DESIGN_AUTO_${Date.now()} -->\n`;
    fs.appendFileSync(this.diaryPath, entry);
  }

  notifyTeam() {
    console.log('🎨 Legacy design updated. Diary entry added.');
  }
}

module.exports = DesignSystemWatcher;
