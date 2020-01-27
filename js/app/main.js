
define([
  'query',
  'i18n',
  './slides',
  './config'
], function (query, i18n, slides, config) {
  console.info('Ready!');
  const lang = query.get('lang') || 'en_US';
  i18n(document.querySelector('main'), config.i18n[lang]);
  slides.init();
});
