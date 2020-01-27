/* global define */

define(function () {

  /**
   * Constants
   */

  const MIN_PERIOD = 50;
  const CIRC = 2.0 * Math.PI;

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
      context.lastUpdateTimeStamp = timeStamp;
      context.taskStats[0].initTimeStamp = timeStamp;
      schedule(context, tick);
    }
  }

  function render(context) {
    const { targetCanvas } = context;
    const { width, height } = targetCanvas;
    const r = Math.min(width, height) * 0.5 - 2.0;
    const a = getElapsedTimeRatio(context) * CIRC;
    const g = targetCanvas.getContext('2d');
    g.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
    g.clearRect(0, 0, width, height);
    g.setTransform(0.0, -1.0, 1.0, 0.0, width * 0.5, height * 0.5);
    g.beginPath();
    g.moveTo(r, 0.0);
    g.lineTo(0.0, 0.0);
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    g.arc(0.0, 0.0, r, a, CIRC, false);
    g.fill();
  }

  function schedule(context, action) {
    if (context.timerId !== 0) {
      cancelAnimationFrame(context.timerId);
    }
    context.timerId = requestAnimationFrame(bind(action, context));
    return context;
  }

  function update(context, timeStamp) {
    let elapsedTime, shouldResetTimer = true;

    // update previous time stamp first
    context.lastUpdateTimeStamp = timeStamp;

    // calc elapsed time
    elapsedTime = getElapsedTime(context);

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
    const elapsedTimeSinceLastUpdate = timeStamp - context.lastUpdateTimeStamp;
    if (
      (elapsedTimeSinceLastUpdate < MIN_PERIOD && !context.killed) ||
      update(context, timeStamp)
    ) {
      schedule(context, tick);
    } else {
      clean(context);
    }
  }

  function getElapsedTime(context) {
    return context.lastUpdateTimeStamp - context.initTimeStamp;
  }

  function getElapsedTimeRatio(context) {
    const { totalTime } = context;
    return Math.min(getElapsedTime(context), totalTime) / totalTime;
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
      kicked: false,
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
      lastUpdateTimeStamp: 0,
      timerId: 0
    });
  }

  /**
   * API
   */

  function kick(context) {
    if (!context.kicked) {
      context.kicked = true;
      schedule(context, init);
      return true;
    }
    return false;
  }

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
      const context = create(targetCanvas, totalTime * 1000, numberOfTasks);
      if (typeof callback === 'function') {
        contextCallbacks.set(context, callback);
      }
      return Object.freeze({
        kick: bind(kick, context),
        walk: bind(walk, context),
        kill: bind(kill, context)
      });
    }
    return null;
  };
});
