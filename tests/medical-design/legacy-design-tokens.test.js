const path = require('path');

describe('Legacy design tokens', () => {
  const tokens = require(path.resolve(
    __dirname,
    '../../legacy-design/design-tokens/medical-theme.json'
  ));

  it('should match the approved medical design tokens', () => {
    expect(tokens).toMatchSnapshot();
  });
});