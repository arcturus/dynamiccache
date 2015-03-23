(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var DynamicCache = require('./lib/dynamiccache.js');

self.DynamicCache = DynamicCache;

},{"./lib/dynamiccache.js":2}],2:[function(require,module,exports){
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

},{"sw-cache-helper":3}],3:[function(require,module,exports){
/* global caches, fetch, Promise, Request, module*/
(function() {
  'use strict';

  var CacheHelper = {
    defaultCacheName: 'offline',
    getCache: function getCache(name) {
      return caches.open(name);
    },
    getDefaultCache: function getDefaultCache() {
      return this.getCache(this.defaultCacheName);
    },
    fetchAndCache: function fetchAndChache(request, cache) {
      return fetch(request.clone()).then(function(response) {
        var clone = response.clone();
        if (parseInt(clone.status) < 400) {
          cache.put(request.clone(), response.clone());
        }

        return response.clone();
      });
    },
    addAll: function addAll(cache, urls) {
      if (!cache) {
        throw new Error('Need a cache to store things');
      }
      // Polyfill until chrome implements it
      if (typeof cache.addAll !== 'undefined') {
        return cache.addAll(urls);
      }

      var promises = [];
      var self = this;
      urls.forEach(function(url) {
        promises.push(self.fetchAndCache(new Request(url), cache));
      });

      return Promise.all(promises);
    }
  };

  module.exports = CacheHelper;
})();

},{}]},{},[1])


//# sourceMappingURL=dynamiccache.js.map