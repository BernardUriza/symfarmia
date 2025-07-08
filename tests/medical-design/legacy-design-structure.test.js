const fs = require('fs');
const path = require('path');

function getTree(dir) {
  const entries = fs.readdirSync(dir).sort();
  return entries.map(name => {
    const fullPath = path.join(dir, name);
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(fullPath);
      return { [name]: `-> ${target}` };
    } else if (stat.isDirectory()) {
      return { [name]: getTree(fullPath) };
    }
    return name;
  });
}

describe('Legacy design directory structure', () => {
  const baseDir = path.resolve(__dirname, '../../legacy-design');

  it('should match the approved directory structure', () => {
    const tree = getTree(baseDir);
    expect(tree).toMatchSnapshot();
  });
});