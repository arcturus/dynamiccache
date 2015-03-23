/* global Promise, fetch, Response */
'use strict';

var CacheHelper = require('sw-cache-helper');

function DynamicCache(name) {
  this.name = name;
}

// Handle postMessage events sent to the ServiceWorker
DynamicCache.prototype.onMessage = function dc_onMessage(event) {
  var data = event.data;
  if (this[data.command]) {
    return this[data.command].call(this, data.parameters);
  }
};

// Handles request to the worker, in this case pretty dummy, will
// return the content of the cache.
DynamicCache.prototype.onFetch = function(request, response) {
  return CacheHelper.getCache(this.name).then(function(cache) {
    return cache.match(request).then(function(res) {
      if (!res) {
        return fetch(request);
      }
      return Promise.resolve(res);
    });
  });
};

DynamicCache.prototype.list = function dc_list() {
  var self = this;
  return CacheHelper.getCache(this.name).then(function(cache) {
    return cache.keys().then(function(keys) {
      var result = [];
      // Get just the urls, we have Response object that cannot be cloned
      // to send via postMessage
      keys.forEach(function(key) {
        result.push(key.url);
      });
      self.broadcastMessage(result);
    });
  });
};

DynamicCache.prototype.post = function dc_post(options) {
  var url = options.url;
  var content = options.content;
  var headers = options.headers || {};

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'text/html';
  }

  var response = new Response(content, {
    headers: headers
  });
  return CacheHelper.getCache(this.name).then(function(cache) {
    cache.put(url, response);
  });
};

DynamicCache.prototype.delete = function dc_delete(options) {
  var url = options.url;

  if (!url) {
    return Promise.reject();
  }

  return CacheHelper.getCache(this.name).then(function(cache) {
    return cache.delete(url);
  });
};

module.exports = DynamicCache;
