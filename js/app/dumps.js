
define(function () {
  'use strict';

  const tuples = [
    ['article #dicom-hexdump-target', 'images/dicom/hexdump.txt'],
    ['article #dicom-dcmdump-target', 'images/dicom/dcmdump.txt']
  ];

  function getText(textarea, path) {
    fetch(path)
      .then(response => response.text())
      .then(text => {
        textarea.value = text;
      });
  }

  return function dumps() {
    tuples.forEach(tuple => {
      getText(
        document.querySelector(tuple[0]),
        tuple[1]
      )
    });
  };
});
