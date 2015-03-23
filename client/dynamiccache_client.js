/* global Promise, BroadcastChannel */
var DynamicCacheClient = {
  getSW: function() {
    return navigator.serviceWorker.getRegistration().then(function(reg) {
      return reg.active;
    });
  },
  channel: null,
  getChannel: function() {
    if (this.channel === null) {
      this.channel = new BroadcastChannel(undefined);
    }
    return this.channel;
  },
  onMessage: function(cb) {
    if (typeof BroadcastChannel === 'function') {
      var channel = this.getChannel();
      channel.onmessage = function(evt) {
        if (typeof cb === 'function') {
          cb(evt.data);
        }
      };
    } else {
      function listenToMessage(evt) {
        if (typeof cb === 'function') {
          cb(evt.data);
        }
      }
      window.removeEventListener('message', listenToMessage);
      window.addEventListener('message', listenToMessage);
    }
  },
  sendMessage: function(msg) {
   return this.getSW().then(function(sw) {
     sw.postMessage(msg);
   });
  },
  listAll: function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.onMessage(function(data) {
        resolve(data);
      });
      self.sendMessage({'command': 'list'});
    });
  },
  postContent: function(url, content) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.onMessage(function() {
        resolve();
      });
      self.sendMessage({
        'command': 'post',
        'parameters': {
          'url': url,
          'content': content
        }
      });
    });
  },
  deleteContent: function(url) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.onMessage(function() {
        resolve();
      });
      self.sendMessage({
        'command': 'delete',
        'parameters': {
          'url': url
        }
      });
    });
  }
};
