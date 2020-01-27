
(function (cornerstone) {

  function setupLungCt() {
    const presets = {
      softtissue: [400, 20],
      lung: [1600, -600],
      bone: [2000, 300]
    };
    const element = document.getElementById('dicomImageLungCt');
    const displayInfo = (function () {
      const infoElement = document.getElementById('dicomImageLungCtInfo');
      return function displayInfo(viewport) {
        const ww = Math.round(viewport.voi.windowWidth);
        const wc = Math.round(viewport.voi.windowCenter);
        infoElement.textContent = `WW: ${ww}, WC: ${wc}`;
      };
    }());

    cornerstone.enable(element);
    cornerstone.loadImage('ctexample://1').then(function (image) {
      cornerstone.displayImage(element, image);
      const viewport = cornerstone.getViewport(element);

      displayInfo(viewport);

      // Buttons
      document.getElementById('dicomImageLungCtButtons').addEventListener('click', function (e) {
        const { target } = e;
        if (target.nodeType === Node.ELEMENT_NODE) {
          let { preset } = target.dataset;
          if (preset && presets.hasOwnProperty(preset)) {
            preset = presets[preset];
            viewport.voi.windowWidth = preset[0];
            viewport.voi.windowCenter = preset[1];
            cornerstone.setViewport(element, viewport);
            displayInfo(viewport);
          }
        }
      });

      // Mouse Events
      element.addEventListener('mousedown', function (e1) {
        let lastX = e1.pageX;
        let lastY = e1.pageY;
  
        function mouseMoveHandler(e2) {
          const deltaX = e2.pageX - lastX;
          const deltaY = e2.pageY - lastY;
          lastX = e2.pageX;
          lastY = e2.pageY;
          let viewport = cornerstone.getViewport(element);
          viewport.voi.windowWidth += (deltaX / viewport.scale);
          viewport.voi.windowCenter += (deltaY / viewport.scale);
          cornerstone.setViewport(element, viewport);
          displayInfo(viewport);
        }
  
        function mouseUpHandler() {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        }
  
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      });
    });
  }

  setupLungCt();

}(cornerstone));
