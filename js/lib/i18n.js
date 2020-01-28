
define(function () {
  'use strict';

  /**
   * Definitions
   */

  function forEachTextNode(node, callback) {
    let currentNode, treeWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT
    );
    currentNode = treeWalker.currentNode;
    while (currentNode) {
      callback.call(currentNode, currentNode);
      currentNode = treeWalker.nextNode();
    }
  }

  function getReplacer(dictionary) {
    const isDefined = Object.prototype.hasOwnProperty.bind(dictionary);
    return function replacer(match, term) {
      if (isDefined(term)) {
        return dictionary[term];
      }
      return match;
    }
  }

  function translateTextNode(replacer, node) {
    const oldValue = node.nodeValue + '';
    const newValue = oldValue.replace(/#(\w+)/g, replacer);
    if (newValue !== oldValue) {
      node.nodeValue = newValue;
    }
  }

  /**
   * API
   */

  return function i18n(rootNode, dictionary) {
    if (rootNode instanceof Node && Object(dictionary) === dictionary) {
      const replacer = getReplacer(dictionary);
      forEachTextNode(rootNode, function eachNode(node) {
        translateTextNode(replacer, node);
      });
    }
  };
});
