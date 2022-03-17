const path = require('path')

module.exports = {
    i18n: {
      defaultLocale: 'de',
      locales: ['en', 'de'],
    },
    interpolation: {
      escapeValue: false
    },
    localePath: path.resolve("./public/locales")
  };