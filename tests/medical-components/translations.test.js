describe('Translation Coverage', () => {
  test('conversation.capture.title must exist', () => {
    const esCommon = require('../../locales/es/common.json');
    const enCommon = require('../../locales/en/common.json');

    expect(esCommon['conversation.capture.title']).toBeDefined();
    expect(enCommon['conversation.capture.title']).toBeDefined();
    expect(esCommon['conversation.capture.title']).not.toMatch(/TODO_TRANSLATE/);
  });

  test('all medical components have translations', () => {
    const esTranslations = require('../../locales/es/common.json');
    const enTranslations = require('../../locales/en/common.json');

    const medicalKeys = [
      'conversation.capture.title',
      'conversation.capture.subtitle',
      'medical.transcription.start',
      'medical.transcription.stop'
    ];

    medicalKeys.forEach(key => {
      expect(esTranslations[key]).toBeDefined();
      expect(enTranslations[key]).toBeDefined();
    });
  });
});
