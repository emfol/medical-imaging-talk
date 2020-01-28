
define(function () {
  'use strict';

  const SLIDE_SELECTOR = 'article';

  /**
   * Utils
   */

  function bind(action, context) {
    return action.bind(context, context);
  }

  function reset(slides) {
    const { length } = slides;
    for (let i = 0; i < length; ++i) {
      const slide = slides[i];
      slide.style.top = '100vw';
      slide.style.opacity = 0.0;
    }
  }

  function create(container, selector) {
    const slides = container.querySelectorAll(selector);
    if (slides.length > 0) {
      reset(slides);
      return Object.seal({
        slides,
        currentSlideIndex: -1
      });
    }
    return null;
  }

  /**
   * API
   */

  function go(context, index) {
    const { slides } = context;
    if (index < slides.length) {
      let slide;
      let from = Math.max(context.currentSlideIndex, -1);
      let to = Math.max(index, -1);
      if (from < to) {
        while (from < to) {
          if (from >= 0) {
            slide = slides[from];
            slide.style.top = '-100vh';
            slide.style.opacity = 0.0;
          }
          ++from;
        }
      } else if (from > to) {
        while (from > to) {
          if (from >= 0) {
            slide = slides[from];
            slide.style.top = '100vh';
            slide.style.opacity = 0.0;
          }
          --from;
        }
      }
      if (to >= 0) {
        slide = slides[to];
        slide.style.top = '0vh';
        slide.style.opacity = 1.0;
      }
      context.currentSlideIndex = to;
    }
  }

  function next(context) {
    go(context, context.currentSlideIndex + 1);
  }

  function prev(context) {
    go(context, context.currentSlideIndex - 1);
  }

  function current(context) {
    return context.currentSlideIndex;
  }

  function count(context) {
    return context.slides.length;
  }

  return function slides(container, selector) {
    const context = create(container, selector || SLIDE_SELECTOR);
    if (context !== null) {
      return Object.freeze({
        go: bind(go, context),
        next: bind(next, context),
        prev: bind(prev, context),
        current: bind(current, context),
        count: bind(count, context)
      });
    }
    return null;
  };
});
