/* global require */

require.config({
    baseUrl: 'js/lib',
    paths: {
      app: '../app'
    }
});

require(['app/main']);
