/*
 * Pages Helper for showing HTML pages in a single page application
 * without needing an SPA framework.
 * (C) 2025 John Vincent Corcega <jmcorcega@up.edu.ph>
 * 
 * Looking for help with this code?
 * Email me at up@tenseventyseven.xyz
 */

// Load a template HTML from given URL
const loadPage = function(template, callback) {
  let loader = async function() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return
      }

      var newDocument = httpRequest.responseXML;
      if (newDocument === null) {
        console.error("Error: No response document found.");
        return;
      }

      var newContent = httpRequest.responseXML.getElementById('page-container');
      if (newContent === null) {
        console.error("Error: No page-container found in the loaded document.");
        return;
      }

      var contentElement = document.getElementById('page-container');
      contentElement.replaceWith(newContent);
    }

    httpRequest.responseType = "document";
    httpRequest.open("GET", template);
    httpRequest.send();
  };

  loader().then(() => {
    if (callback) {
      setTimeout(() => {
        callback();
      }, 100);
    }
  }).catch((error) => {
    console.error("Error loading page:", error);
  });
}
