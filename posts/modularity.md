# Modularity

## The `require` function

In my opinion the best feature in Node.js is the global `require` function.
Why is `require` great? It is the function that allow you to load in external modules not provided by node core. Not only is this a good feature by itself, but the way `require` loads modules makes Node.js the most module friendly development platform out there today.

`require` works in a very straight forward way.

  1. `require('./{name}')` will load a module relative to the file you are currently writing
  2. `require('/{absolute-name}')` will load a module from an absolute path
  3. `require('{module-name}')` will load a module stored in a node_modules folder.

The way Node.js loads modules from the node_modules folder is incredible smart. Let's say you do `require('request')` in a file stored in `/foo/bar/baz`.
What node will do is look for `request` in the following folders.

  1. `/foo/bar/baz/node_modules/request`
  2. `/foo/bar/node_modules/request`
  3. `/foo/node_modules/request`
  4. `/node_modules/request`

The first folder that contains request in the one node will return. Why is this important? It allows us to use multiple versions of request very trivially. We can simply nest them inside multiple node_modules folders. Here is an example. Let's say my program has two files `foo.js` and `bar.js` that both wanna require request but different versions of it. We can easily do this now by structuring our program like this

```
./foo.js
./node_modules/request <-- version 1
./a-folder/bar.js
./a-folder/node_modules/request <-- version 2
```

Now if `foo.js` does `require('request')` it will load version 1 and if `bar.js` does `require('request')` it will load version 2.
As an added bonus `foo.js` can still require `bar.js` by doing `require('./a-folder/bar.js')`.

The require function is also a great example of decoupling in practice (we'll get back to this later). It was added to node before `npm`, the node package manager, was created.
This meant that external developers could create third party package managers that all could install multiple versions of the same module without node needing to know that this was happening. Node was just reading files from a file system. There was a time we had multiple package managers in node all competing to be "The One True Package Manager".

With npm came an explosion in the amount of packages available for node. Almost 300.000 different packages can now be downloaded through npm.

## Writing Great Modules

So Node.js is great for requiring modules and npm is great is distributing them. This begs the question. What is a good module? I've personally written more than 400 modules. Some good, some bad, some truly terrible. These are some of things I've learned writing them.
