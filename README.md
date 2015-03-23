#DynamicCache

A middleware layer for [ServiceWorkerWare](https://github.com/arcturus/serviceworkerware/) that will allow you to modify the content of a cache.

## Usage

In your ServiceWorker code:

```
importScripts('./sww.js');
importScripts('./dynamiccache.js');

var worker = new self.ServiceWorkerWare();
worker.use(new DynamicCache('dynamic'));

worker.init();
```

You create a new `DynamicCache` object, and pass a string, representing the name of the cache that this worker will be handling.


## API

You'll find the following methods:

+ `list`: get a full list of all url handled by this middleware.
+ `post`: add or modify the content on the cache. Will receive a json object to specify the content:
++ `content`: object (or string), representing the content.
++ `url`: string, the url to be cached.
++ `headers`: (optional), object containing the headers (like 'Content-Type') that will be send with your response object.

Why there is no `get` method? The middleware will be returning the content during the `onFetch` phase, so any HTTP request will give you the content.




