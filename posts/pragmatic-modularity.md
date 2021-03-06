In my opinion the best feature in [Node.js](https://nodejs.org/) is the global [`require`](https://nodejs.org/api/modules.html#modules_modules) function.
Why is `require` great? It is the function that allows you to load in external modules not provided by node core. Not only is this a good feature by itself, but the way `require` loads modules makes Node.js the most module friendly development platform out there today.

`require` works in a very straight forward way.

  1. `require('./{name}')` will load a module relative to the file you are currently writing,
  2. `require('/{absolute-name}')` will load a module from an absolute path,
  3. `require('{module-name}')` will load a module stored in a node_modules folder.

The way Node.js loads modules from the node_modules folder is incredibly smart. Let's say you do `require('request')` in a file stored in `/foo/bar/baz`.
What node will do is look for `request` in the following folders:

  1. `/foo/bar/baz/node_modules/request`
  2. `/foo/bar/node_modules/request`
  3. `/foo/node_modules/request`
  4. `/node_modules/request`

The first folder that contains `request` is the one node will return. Why is this important? It allows us to use multiple versions of `request` trivially. We can simply nest them inside multiple node_modules folders. Here is an example. Let's say my program has two files `foo.js` and `bar.js` that both wanna require request but different versions of it. We can easily do this now by structuring our program like this

```
./foo.js
./node_modules/request <-- version 1
./a-folder/bar.js
./a-folder/node_modules/request <-- version 2
```

Now if `foo.js` does `require('request')` it will load version 1 and if `bar.js` does `require('request')` it will load version 2.
As an added bonus `foo.js` can still require `bar.js` by doing `require('./a-folder/bar.js')`.

The `require` function is also a great example of decoupling in practice (we'll get back to this later). It was added to node before [`npm`](https://www.npmjs.com/), the node package manager, was created.
This meant that external developers could create third party package managers that all could install multiple versions of the same module without node needing to know that this was happening. Node was just reading files from a file system. There was a time we had multiple package managers in node all competing to be "The One True Package Manager".

With npm came an explosion in the amount of packages available for node. Over 300,000 different packages can now be downloaded through npm.

## Writing great modules

So Node.js is great for requiring modules and npm is great is distributing them. This begs the question: what is a good module? I've personally written more than 400 modules. Some good, some bad, some truly terrible. These are some of things I've learned writing them.

### Keep it simple

This one you probably knew already. Try to keep things as simple as possible. Don't introduce new abstractions unless you really have to. Good modules just export a single function that does one thing and one thing only.

If you have a hard time explaining what your module does when writing the README it's probably too complicated and should be split into more modules.

### Lower level is better than higher level

When designing an API for a new module you have to make a lot of decisions. You have to put yourself in the place of the users of the module and think about the different ways they'll wanna use your code. When your users have different use cases this means you'll have to make trade-offs in your API. This can be surprisingly tricky and I often see friends getting stuck trying to publish their new modules because of this.

The solution to this problem is to make your API more low level, meaning that you'll expose less abstractions and require users to call more functions to solve their use cases. In return your API will be more stable and much less likely to change dramatically over time.

An example of this pattern could be a module I wrote a while ago called [multicast-dns](https://github.com/mafintosh/multicast-dns). I started out wanting to make a 100% JavaScript implementation of a service discovery protocol used by [Bonjour](https://en.wikipedia.org/wiki/Bonjour_(software))/[ZeroConf](https://en.wikipedia.org/wiki/Zero-configuration_networking) (the protocol your computer uses to find your printer). All the existing implementations (that `bind`ed to native code) used a lot of abstractions in their APIs, such as a ServiceBrowser that would emit events every time a new service would be discovered on the network. The high level APIs required a lot of state management and retry configuration, and was in general hard to implement. The solution for me was to rethink the problem and come up with the minimal abstraction possible to solve the core problem.

The final API ended up consisting of 2 low level methods and 2 low level events. One pair for sending/receiving a query looking for a service and another pair for answering a query (using the standard protocol underneath). Each method's arguments map very closely to what is being sent over the wire and the module has very little state. Higher level things like retries are left up to the user of the module.

``` js
var mdns = require('multicast-dns')()

mdns.on('response', function(response) {
  console.log('got a response packet:', response)
})

mdns.on('query', function(query) {
  console.log('got a query packet:', query)
})

// lets query for an A record for 'brunhilde.local'
mdns.query({
  questions:[{
    name: 'brunhilde.local',
    type: 'A'
  }]
})
```

The result was a lightweight (~100 LoC) and easy to explain module that has a very stable interface.

An added benefit is that you can always turn a lower level module into a higher level one to make some common use cases simpler. My friend [@watson](https://github.com/watson) actually published a high level implementation of the Bonjour protocol called [bonjour](https://github.com/watson/bonjour) which uses my low level implementation to do the "heavy lifting".

### Avoid peer dependencies

What is a peer dependency? A peer dependency is when you have a function in your program that accepts an instance of some external prototype.
For example, if you write a module that sends back a cool favicon when a user requests `/favicon.ico` you might be tempted to make a function that accepts an [expressjs](https://expressjs.com/) instance (express is a popular node.js web framework), attaches a route handler and returns the favicon.

``` js
module.exports = awesomeFavicon

function awesomeFavicon (app) {
  app.get('/favicon.ico', function (req, res) {
    res.setHeader('Content-Type', 'image/x-icon')
    res.end(coolFavicon)
  })
}
```

What's the problem with this module? The problem is that since we are accepting an instance of external object we can no longer control the version of express this instance uses. What if express were to break the `.get` interface in a later version and release a new major bump? We don't have any way of enforcing that, which quickly turns maintaining this module into dependency hell.

We are also coupling express which makes our module less useful for a bunch of other use cases. What if a user wanted to use the plain http module? or [hapi](http://hapijs.com/) or some other web framework?

What would be a better solution? Usually a peer dependency is a sign that your module is doing too much or coupling too many things. A fix usually evolves around rethinking the purpose of the module without the peer depencency and make the module do less things. For example we could change our module to simply expose a function that returns a favicon.

``` js
module.exports = awesomeFavicon

// it is now up to the user to set up the route
function awesomeFavicon (req, res) {
  res.setHeader('Content-Type', 'image/x-icon')
  res.end(coolFavicon)
}
```

In this version the module does not have any peer dependencies except for an http request and response which comes from node core. In general peer dependencies from node core are more acceptable since they change less often (streams being a big exception here!).

You cannot always avoid peer dependencies but you should try to keep them at an absolute minimum and treat them as very expensive modularity wise.

### Straight forward naming

Choosing a good name for your module is always important. A good sign that your module has a clear one-purpose scope is that you can pick a self-explainatory name consisting of 2-3 words. It can be tempting to come up with funny or "marketing" sounding names but usually that just makes it harder for users to figure out what your module does.

Some examples of great names for small modules are:

* [concat-stream](https://github.com/maxogden/concat-stream) - a stream that concats all input into a single buffer,
* [drag-and-drop-files](https://github.com/mikolalysenko/drag-and-drop-files) - a function that turns a div into a drop area,
* [insert-css](https://github.com/substack/insert-css) - inserts css into the head tag of an html page.

Once in a while you'll end up writing a module that has a bit broader scope than can be expressed in the module name. Recently I wrote a module that fits this pattern. The module is called [hyperdrive](https://github.com/mafintosh/hyperdrive). (Even though you make a bigger module you still want to keep the code base as lean as possible by factoring out various parts of the code base into independent modules.)

An anti-pattern to avoid when doing this is prefixing your dependency names with the parent module name. For example, hyperdrive relies on merkle trees internally and I wanted to factor out the generation of these into a separate module.
The easiest way of doing that would have been to create a new module and call it hyperdrive-merkle-tree-stream and have it generate a merkle tree specifically for what hyperdrive needed. However, by doing this, we introduce a coupling to hyperdrive and are making our new indedepent module much less usable for other projects. Instead the new module was simply called [merkle-tree-stream](https://github.com/mafintosh/merkle-tree-stream) and has no coupling whatsoever to hyperdrive. When hyperdrive uses it, it passes in some configuration that makes it generate the merkle trees it needs.

The disadvantage is a bit more code in your parent module. The advantage is a highly decoupled module that will be much more stable over time and more usable for other developers.

### Beware of I/O

I/O stands for Input/Output and is a general term we use when a program is writing to disk, reading from the network or similar communications. I/O is hard to get right and introduces a hard coupling to your modules. Luckily functions that do I/O in node are easy to identify since node does async I/O. If a function takes a callback or returns a promise it is most likely doing some sort of I/O.

Why is I/O bad? Well it isn't really, except it will couple your module to a specific way of doing things. Here is an example. Let's say we wanted a module that gunzipped an http request. It might look something like this:

``` js
var gunzipRequest = require('gunzip-request')

gunzipRequest('http://example.com', function (err, res) {
  // res is guaranteed to be gunzipped.
})
```

What if I want to gunzip something that isn't available over http? Then I cannot use this module since it couples http. It is easy to fix though. We can use streams to decouple I/O from the module.

``` js
var gunzipStream = require('gunzip-stream')

doRequest('http://example.com', function (err, responseStream) {
  // unzippedStream is guaranteed to be gunzipped
  var unzippedStream = responseStream.pipe(gunzipRequest)
})
```

Now our module works for a lot more use cases! I wrote a module that will gunzip a stream if gzipped. It's called [gunzip-maybe](https://github.com/mafintosh/gunzip-maybe).

## Epilogue

Don't think of the above sections as absolute rules to what constitutes a good module. These are just patterns I've noticed when writing my own. The easiest way to validate them is to start writing modules yourself. When publishing a new module you don't always know if it'll end up being good or bad. Most of the time you'll figure that out while using the module in different use cases. Don't look too much at github stars, or when the last commit was made. A small scoped module might not need updates because it is mostly done.

## Related links

* https://opbeat.com/community/posts/hypermodular-development-by-mathias-buus/ - A talk I did about modules.
* http://substack.net/finding_modules - Great blog post from @substack about finding modules.
