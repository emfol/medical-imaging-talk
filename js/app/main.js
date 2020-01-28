
define([
  'query',
  'i18n',
  './slides',
  './modalities',
  './dumps',
  './config'
], function (query, i18n, slides, modalities, dumps, config) {
  'use strict';
  console.info('Ready!');
  const lang = query.get('lang') || 'en_US';
  i18n(document.querySelector('main'), config.i18n[lang]);
  slides.init();
  modalities();
  dumps();
});
