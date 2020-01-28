
(function (cornerstone) {

  function initCornerstone() {
    // Externals
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
  }

  function initCornerstoneTools() {
    cornerstoneTools.init({
      showSVGCursors: true,
    });
  }

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

  function setupLengthToolExotic() {
    const element = document.getElementById('dicomImageLengthToolExotic');
    cornerstone.enable(element);
    const toolName = 'Length';
    const imageIds = [
      `wadouri:images/dicom/exotic-1.dcm`,
      `wadouri:images/dicom/exotic-2.dcm`,
    ];

    const stack = {
      currentImageIdIndex: 0,
      imageIds: imageIds,
    };

    cornerstone.loadImage(imageIds[0]).then(function (image) {
      cornerstoneTools.addStackStateManager(element, ['stack']);
      cornerstoneTools.addToolState(element, 'stack', stack);
      cornerstone.displayImage(element, image);
    });

    // Add the tool
    const apiTool = cornerstoneTools[`${toolName}Tool`];
    cornerstoneTools.addToolForElement(element, apiTool);
    cornerstoneTools.setToolActiveForElement(
      element,
      toolName,
      { mouseButtonMask: 1 },
      ['Mouse']
    );
  }

  initCornerstone();
  initCornerstoneTools();
  setupLungCt();
  setupLengthToolExotic();

}(cornerstone));
