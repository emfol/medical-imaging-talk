
define([
  'query',
  'stopwatch',
  'slide-controls',
], function (query, stopwatch, slideControls) {
  'use strict';

  function onSlideChange(context, e, action, actions) {
    if (e.shiftKey && action === 'next') {
      const nextIndex = context.sequence.next();
      if (nextIndex === 0) {
        context.stopwatch.kick();
      } else {
        context.stopwatch.walk();
      }
      actions.go(nextIndex);
      return true;
    }
    return false;
  }

  function getStopwatchDuration() {
    const stopwatch = +query.get('stopwatch');
    if (stopwatch > 0) {
      return stopwatch * 60;
    }
    return 25 * 60;
  }

  function sequence(initialValue) {
    let value = initialValue;
    return Object.freeze({
      next() {
        return ++value;
      }
    });
  }

  return Object.freeze({
    init() {
      const slides = slideControls(document.querySelector('main'));
      const context = Object.freeze({
        sequence: sequence(-1),
        slides,
        stopwatch: stopwatch(
          document.querySelector('section.timer > canvas'),
          getStopwatchDuration(),
          slides.actions.count(),
          s => void console.info('stopwatch', s)
        ),
      });
      // Setup handler for change event
      slides.change(onSlideChange.bind(context, context));
      return context;
    }
  });
});
