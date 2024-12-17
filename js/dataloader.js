/**
 * dataloader.js
 * 
 * taken from mbtaviz.github.io
 * 
 * Copyright 2014 Michael Barry & Brian Card.  MIT open-source lincense.
 *
 * A thin layer sitting on top of d3.json and d3.csv that handles asynchronous loading
 * of multiple data files, progress reporting, and error hanldling.  File size and hashes
 * must exist in files.js (created by tools/update-file-sizes.js) in order to load a file.
 *
 * Usage:
 * VIZ.requiresData(['json!file.json', 'csv!file.csv'])
 * .progress(function (percent) { ... })
 * .done(function (jsonFile, csvFile) { ... });
 */

 (function () {
  "use strict";

  function Listener(files, changesPageSize) {
    var self = this;
    self.files = files;
    self.changesPageSize = changesPageSize;
    this.data = {};
    self.progressListeners = [];
    self.doneListeners = [];
    self.errorListeners = [];
    self.amountLoaded = {};

    files.forEach(function (file) {
      if (file in self.amountLoaded) {
        throw "duplicate file name " + file;
      }
      self.amountLoaded[file] = 0; // Track loaded state only
    });

    self.totalFiles = files.length; // Total files to track progress
    self.loadedFiles = 0;

    files.forEach(function (file) {
      var parts = file.split('!');
      var type = parts[0]; // File type: json or csv
      var name = parts[1]; // File name

      // Fetch file without size or hash
      d3[type](name)
        .on('progress', function (event) {
          self.fileProgress(file, event.loaded);
        })
        .get(function (error, data) {
          if (error) {
            self.errorListeners.forEach(function (listener) {
              listener(error);
            });
            self.doneListeners = [];
            self.progressListeners = [];
          } else {
            self.fileDone(file, data);
          }
        });
    });
  }

  Listener.prototype.progress = function (callback) {
    this.progressListeners.push(callback);
    return this;
  };

  Listener.prototype.done = function (callback) {
    this.doneListeners.push(callback);
    return this;
  };

  Listener.prototype.onerror = function (callback) {
    this.errorListeners.push(callback);
    return this;
  };

  Listener.prototype.fileProgress = function (file, amountLoaded) {
    this.amountLoaded[file] = amountLoaded || 0; // Placeholder for progress
    var percent = Math.round(
      (Object.keys(this.amountLoaded).length / this.totalFiles) * 100
    );
    this.progressListeners.forEach(function (listener) {
      listener(percent);
    });
  };

  Listener.prototype.fileDone = function (file, data) {
    var self = this;
    this.data[file] = data;
    self.loadedFiles++;

    // When all files are loaded
    if (self.loadedFiles === self.totalFiles) {
      var results = self.files.map(function (file) {
        return self.data[file];
      });
      self.doneListeners.forEach(function (listener) {
        listener.apply(self, results);
      });
      if (self.changesPageSize) {
        VIZ.anchorScroll();
      }
    }
  };

  VIZ.requiresData = function (files, changesPageSize) {
    var listener = new Listener(files, changesPageSize);
    return listener;
  };
})();
