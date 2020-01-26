
define(['stopwatch'], function (stopwatch) {
  console.log('It Works!');
  const canvas = document.querySelector('section.timer > canvas');
  if (canvas) {
    const s = stopwatch(canvas, 10, 4, function (context) {
      console.log('stopwatch', context);
    });
    document.body.addEventListener('click', function () {
      s.walk();
    }, false);
  }
});
