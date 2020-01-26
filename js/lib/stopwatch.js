/* global define */

define(function () {

  /**
   * Constants
   */

  const MIN_PERIOD = 50;

  /**
   * Globals
   */

  const contextCallbacks = new WeakMap();

  /**
   * Functions
   */

  function bind(action, context) {
    return action.bind(context, context);
  }

  function init(context, timeStamp) {
    context.timerId = 0;
    if (!context.killed) {
      context.initTimeStamp = timeStamp;
      context.lastTickTimeStamp = timeStamp;
      context.taskStats[0].initTimeStamp = timeStamp;
      schedule(context, tick);
    }
  }

  function render() {
    // Nothing yet...
  }

  function schedule(context, action) {
    if (context.timerId !== 0) {
      cancelAnimationFrame(context.timerId);
    }
    context.timerId = requestAnimationFrame(bind(action, context));
    return context;
  }

  function update(context, timeStamp) {
    let shouldResetTimer = true;
    const elapsedTime = timeStamp - context.initTimeStamp;

    // update previous time stamp first
    context.lastTickTimeStamp = timeStamp;

    // check if the current task completed
    if (context.currentTaskCompleted) {
      const currentTaskStats = getCurrentTaskStats(context);
      currentTaskStats.endTimeStamp = timeStamp;
      context.numberOfTasksRemaining--;
      if (context.numberOfTasksRemaining > 0) {
        const nextTaskStats = getCurrentTaskStats(context);
        nextTaskStats.initTimeStamp = timeStamp;
        context.currentTaskCompleted = false;
        context.cumulativeTaskTime =
          (context.totalTime - elapsedTime) / context.numberOfTasksRemaining;
      }
    }

    if (
      elapsedTime >= context.totalTime ||
      context.numberOfTasksRemaining < 1 ||
      context.killed
    ) {
      context.endTimeStamp = timeStamp;
      shouldResetTimer = false;
    }

    // Request view update
    render(context);

    return shouldResetTimer;
  }

  function tick(context, timeStamp) {
    context.timerId = 0;
    const elapsedTimeSinceLastTick = timeStamp - context.lastTickTimeStamp;
    if (
      (elapsedTimeSinceLastTick < MIN_PERIOD && !context.killed) ||
      update(context, timeStamp)
    ) {
      schedule(context, tick);
    } else {
      clean(context);
    }
  }

  function clean(context) {
    const callback = contextCallbacks.get(context);
    if (typeof callback !== 'undefined') {
      contextCallbacks.delete(context);
      if (typeof callback === 'function') {
        try {
          callback.call(context, context);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  function getCurrentTaskStats(context) {
    const index = context.numberOfTasks - context.numberOfTasksRemaining;
    if (index >= 0) {
      return context.taskStats[index];
    }
    return null;
  }

  function createTaskStats(numberOfTasks) {
    const taskStats = new Array(numberOfTasks);
    for (let i = 0; i < numberOfTasks; ++i) {
      taskStats[i] = Object.seal({
        initTimeStamp: 0,
        endTimeStamp: 0
      });
    }
    return taskStats;
  }

  function create(targetCanvas, totalTime, numberOfTasks) {
    const taskTime = totalTime / numberOfTasks;
    return Object.seal({
      killed: false,
      targetCanvas,
      totalTime,
      numberOfTasks,
      taskTime: totalTime / numberOfTasks,
      cumulativeTaskTime: taskTime,
      numberOfTasksRemaining: numberOfTasks,
      taskStats: createTaskStats(numberOfTasks),
      currentTaskCompleted: false,
      initTimeStamp: 0,
      endTimeStamp: 0,
      lastTickTimeStamp: 0,
      currentTaskInitTimeStamp: 0,
      timerId: 0
    });
  }

  /**
   * API
   */

  function walk(context) {
    if (!context.killed) {
      context.currentTaskCompleted = true;
    }
  }

  function kill(context) {
    if (!context.killed && context.endTimeStamp === 0) {
      context.killed = true;
    }
  }

  return function stopwatch(targetCanvas, totalTime, numberOfTasks, callback) {
    if (
      targetCanvas instanceof HTMLCanvasElement &&
      totalTime > 0 &&
      numberOfTasks > 0
    ) {
      const context = schedule(create(targetCanvas, totalTime * 1000, numberOfTasks), init);
      if (typeof callback === 'function') {
        contextCallbacks.set(context, callback);
      }
      return Object.freeze({
        walk: bind(walk, context),
        kill: bind(kill, context)
      });
    }
    return null;
  };
});
