
define(['slides'], function (slides) {

  function keydown(context, e) {
    switch (e.keyCode) {
      case 38: // UP
        if (!notify(context, e, 'next')) {
          context.actions.next();
        }
        break;
      case 40: // DOWN
        if (!notify(context, e, 'prev')) {
          context.actions.prev();
        }
        break;
    }
  }

  function notify(context, e, action) {
    let result = false;
    const { callback } = context;
    if (typeof callback === 'function') {
      try {
        result = callback.call(null, e, action, context.actions);
      } catch (error) {
        console.error(error);
      }
    }
    return result;
  }

  function create(container, selector) {
    const actions = slides(container, selector);
    return Object.seal({
      actions,
      callback: null
    });
  }

  return function slideControls(container, selector) {
    const context = create(container, selector);
    const handler = keydown.bind(context, context);
    document.addEventListener('keydown', handler, true);
    return Object.freeze({
      actions: context.actions,
      change(callback) {
        context.callback = callback;
      },
      destroy() {
        document.removeEventListener('keydown', handler, true);
      }
    });
  }
});
