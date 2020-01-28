
define(function () {
  'use strict';

  const SEL_LINK = 'a.modality-link';
  const SEL_LINK_CONTAINER = 'article > div.viewport.the-modalities';
  const SEL_STAGE = 'div.the-modality-image';

  function getImagePath(href) {
    const regex = /#(\w+\.\w+)$/;
    const match = regex.exec(href);
    if (match) {
      return `./images/modalities/${match[1]}`;
    }
    return null;
  }

  function clean(stage) {
    while (stage.firstChild) {
      stage.removeChild(stage.firstChild);
    }
    return stage;
  }

  function dismiss(stage) {
    clean(stage);
    stage.style.display = 'none';
  }

  function show(stage, path) {
    const image = new Image();
    image.src = path;
    clean(stage).appendChild(image);
    stage.style.display = 'block';
  }

  function onClick(context, e) {
    if (e.target.matches(SEL_LINK)) {
      const path = getImagePath(e.target.href);
      if (path) {
        e.preventDefault();
        e.stopPropagation();
        show(context.stage, path);
        return;
      }
    }
    dismiss(context.stage);
  }

  return function modalities() {
    const container = document.querySelector(SEL_LINK_CONTAINER);
    const context = {
      container,
      stage: container.querySelector(SEL_STAGE)
    };
    container.addEventListener('click', onClick.bind(context, context), true);
  };
});
