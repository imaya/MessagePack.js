=========
MessagePack.js
=========

![](https://travis-ci.org/uupaa/MessagePack.js.png)

MessagePack TypedArray version.

# Document

- [WebModule](https://github.com/uupaa/WebModule) ([Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html))
- [Development](https://github.com/uupaa/WebModule/wiki/Development)
- [MessagePack.js wiki](https://github.com/uupaa/MessagePack.js/wiki/MessagePack)


# How to use

```js
<script src="lib/MessagePack.js">
<script>
// for Browser
console.log( MessagePack.unpack(MessagePack.pack("Hello")) ); // -> Hello
</script>
```

```js
// for WebWorkers
importScripts("lib/MessagePack.js");

console.log( MessagePack.unpack(MessagePack.pack("Hello")) ); // -> Hello
```

```js
// for Node.js
var MessagePack = require("lib/MessagePack.js");

console.log( MessagePack.unpack(MessagePack.pack("Hello")) ); // -> Hello
```

