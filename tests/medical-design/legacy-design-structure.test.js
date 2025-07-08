const fs = require('fs');
const path = require('path');

describe('Legacy design directory structure', () => {
  const baseDir = path.resolve(__dirname, '../../legacy-design');

  it('should have design-tokens directory', () => {
    expect(fs.existsSync(path.join(baseDir, 'design-tokens'))).toBe(true);
  });

  it('should have component-registry directory', () => {
    expect(fs.existsSync(path.join(baseDir, 'component-registry'))).toBe(true);
  });

  it('should have figma-exports directory', () => {
    expect(fs.existsSync(path.join(baseDir, 'figma-exports'))).toBe(true);
  });

  it('should have current symlink in figma-exports', () => {
    expect(fs.existsSync(path.join(baseDir, 'figma-exports', 'current'))).toBe(true);
  });

  it('should have legacy_design_system_docs.md file', () => {
    expect(fs.existsSync(path.join(baseDir, 'legacy_design_system_docs.md'))).toBe(true);
  });

  it('should have ComponentMigrationTemplate.md file', () => {
    expect(fs.existsSync(path.join(baseDir, 'ComponentMigrationTemplate.md'))).toBe(true);
  });

  it('should have migration-log.md file', () => {
    expect(fs.existsSync(path.join(baseDir, 'migration-log.md'))).toBe(true);
  });

  it('should have scripts directory', () => {
    expect(fs.existsSync(path.join(baseDir, 'scripts'))).toBe(true);
  });
});