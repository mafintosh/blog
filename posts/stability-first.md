I am an npm module author. I've written close to 500 modules. Just this past week I've published around 10 new ones.
Modules I maintain have been downloaded more than 750 million times. Lots of my close friends are module authors as well.

You could say I'm invested in the Node.js ecosystem.

I've been using Node since version 0.4. Recently Node 7 was released. When reading the release notes two things caught my eye.

* It introduced a new core url module - a module that could easily have been published to npm instead.
* It deprecated the Buffer constructor when not using `new`. A change that deprecated >1000 npm modules and their dependents.

In addition there is now [a PR open to deprecate the Buffer constructor entirely](https://github.com/nodejs/node/pull/7152). A change that affects tens of thousands modules if not more.

All these changes made me realize how much the priorities of Node has changed in the past years.

## Why does Node work?

I love Node. It is a flexible platform that makes it easy to write a range of different programs. It is used for http servers, bittorrent clients, build tools, next generation p2p social networks, desktop apps and lots more!

In my opinion, Node *works* because of two things:

1. It has a small core with modules to interface with things like the file system, network, etc.
2. It has npm which gives you access to more than 350.000 modules.

The Node module system is built with backwards compatibility as a first class feature. It allows you to use many versions of the same module.
Core modules, unfortunately, do not have this feature. When you require a core module you get the one that was shipped with the version of Node you happen to have installed.

Effectively this makes Node core a "peer dependency". If you are not familiar with the term, it basically means a dependency that is given to you but that you cannot version. You just have to deal with the one you've been given.

When writing modules, peer dependencies are especially frustrating. You cannot rely on new features being available as different users will have different versions of Node installed. Even more problematic, if you make a breaking change to a peer dependency you risk breaking old stable code.

Luckily until recently Node core has been somewhat stable. Old code tends to *just work*.

I recently installed and used https://github.com/maxogden/superlevel - a module with latest commit more than 1.5 years ago, and it still worked perfectly. It worked because it does very few things and is more or less just done. If you look at it's dependency graph there is even a couple of outdated deps in there. They also *just work* because they are small and focused.

When Node core development stalled in 0.10, before the fork to io.js happened we learned some important lessons.

1. Node core governance was broken and desperately needed community intervention.
2. Even with a stalled core project, Node innovation didn't stop. Module authors kept publishing new modules that moved the ecosystem forward.

## Going forward

**Innovation shouldn't come from Node core**. It should come from modules. It should come from modules because they are easy to publish and they are extremely easy to update. We bump the major version when we want to make breaking changes and it doesn't break any old code as that'll just keep depending on the old version. Core doesn't have this luxury.

**Core's job is to be boring: never break, upgrade v8, and be fast.**

Going forward I hope we make a few changes to the way core works.

1. When adding new features ask ourselves: Is this something that really needs to go in core? Once it goes in, it should never go out.
2. When breaking things, acknowledge that Node is now so mature that it isn't feasible anymore for everyone to update their dependencies to the latest version of everything.
3. We shouldn't expect module authors to watch core progress. Core is a noisy place. Outreach is key to get feedback on changes that affect the ecosystem before they are implemented.
