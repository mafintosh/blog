I am a big believer in learning by doing. Basically the best way to learn a new programming language, or any other skill for that matter, is to dive in, find a project you are interested in building and just start. Sure you'll get plenty of things wrong but everytime you do you'll have a better understanding of why things failed and be better equipped to not make the same mistakes later on.

Compared to other people I know I started out programming relatively late. Before starting university in 2006 I hadn't really done any kind of programming. The language of choice at my university was Java so that was the first language I started programming in.

I didn't have anything to compare it to but I loved programming Java because it, put simply, allowed me to make my computer do things. I was studying math at the time so the first programs I wrote were relatively math heavy. A simple calculator and an RSA encryption tool were among my first programs.

I quickly pivoted to writing more advanced things. I took a "Introduction to Computer Networking" class where the professor showed how you could connect two different computers on a local network using a tcp server and client. It was crazy inspiring!

Writing networked things in Java was a bit complicated. I would use a lot of abstractions (interfaces, abstract classes, big class hieracies) but things still didn't always work. Writing networked programs are hard and I had very little experience and made a lot of beginners mistakes. This was around 2009 and a friend showed me an article about this new thing that had just come out called Node.js

I started playing around with Node and immediately started liking it since writing tcp servers were a lot simpler in Node than it was in Java. This was my first intro to Javascript as well - a language I knew very little about.

``` js
// a tcp echo server in javascript
// try finding a "production ready" one in java and you'll see the difference

var net = require('net')

var server = net.createServer(function (socket) {
  socket.pipe(socket)
})

server.listen(10000)
```

About the same time me and a friend of mine from university, Tobias ([@freeall](https://github.com/freeall)) had been discussing writing a simple program that would help us share files with each other. A classic problem that most developers try to solve at one point. Tobias had also just discovered node and was new to Javascript as well.

We basically had no idea what we were doing. We grokked through some of the examples on the Node.js website and figured out how to create http servers. Node also had a file api and we would write files and userdata to files on the harddrive. Neither of us had at this time had ever really used a database before so just decided on using the file system for all user data.

More and more of the code we wrote looked alike so we started to copy-paste code around. This, of course, quickly turned into a mess and was hard to maintain. When we fixed a bug in our shared code we had to re-copy-paste it multiple places all over the code base. Node had just gotten the `require` call so to solve this we decided to write a module. Our first main module was called `common`. The code is actually still online on Github, https://github.com/gett/common and you can still download it from npm (we put it up there later when npm became a thing). It was a utility grab bag module full of a bunch of convenience functions.

The "common" module was heavily inspired by the patterns described in "Javascript the Good Parts". It is the only book I've ever read about javascript.
We were very excited about that module and a couple of our friends who were starting out with Node at the same time started using it as well.

The main problem with having a utility grab bag module was that it was really hard to decide what went into that module and what didn't. At that point our metric was that if code was being used twice it would go in the common module. Basically an anti copy-paste pattern. Today I just split everything into a bunch of small modules instead.

Javascript was asynchronous but neither of us had done enough sync programming for this to be really different. It was just how node worked. Inspired by Tim Caswell's [step](https://github.com/creationix/step) module we decided to write a flow control library as well. I read Tim's code multiple times and rewrote my own version. We didn't really re-use other peoples code at the time - that has definitely changed now though. Our step function was of course added as a function inside the common module. This pattern worked well for us and helped us avoid "callback hell".

I don't use any flow control libraries any more. I just use named functions and put more things into modules.

We actually ended up launching our project as a website and company called kkloud, which we later renamed to Ge.tt. Having it be an actual thing that other people could use on the internet was a huge motivator for us. I remember the excitement every time we would get a visitor we didn't know personally. It also allowed us to write Javascript every day as full time job. At one point we would spend more or less every hour we were awake writing Javascript. Although I wouldn't recommend this to anyone, it certainly gave us a lot of experience fast.

A bunch of people started using it. Soon we discovered that our approach of using the file system as a database didn't really work that well when multiple people were using the site at once. We decided we needed to understand how to use a database. After some quick research we set up a MongoDB instance which was all the hype at the time. We didn't really understand how it worked but it used JSON as a query language for storing documents. We knew that JSON was easy to write in Node. That was the killer feature for us. There was already a driver written for it Node called [mongodb-native](http://github.com/mongodb/node-mongodb-native) but it was a bit hard to use. We decided to write a wrapper for it that would make it a bit more user friendly. The wrapper was originally just called "db" (which was available on npm at the time!) but I soon renamed it to [mongojs](https://github.com/mafintosh/mongojs).

In the end I think we rewrote our entire code base about 5-6 times as we became more experienced and better understood Javascript and Node. Over time we got a better understanding of what we were actually building which helped us make our code a lot simpler. We never really decided to sit down and rewrite everything. It was just something that incrementally happened. It is also incredible difficult to find actual performance bottlenecks before deploying code. We didn't really cache anything until we found a couple of places in our server code where caching some specific database content allowed us to serve 10x more customers on the same hardware.

I think the main thing I learned about writing javascript is that isolating code in small modules is almost always a good idea. Replacing a small module is a lot easier than trying to rewrite parts of a big coupled and entangled code base when a great idea turns out not to be.

So to sum up my experience

* Find a project that motivates you.
* Writing bad code is better than not writing any code. Learn from your mistakes.
* Read other people's code.
* Don't listen too much to other devs / books / blogs.
  Do things your own way. Again, learn from your mistakes.
* Don't be afraid to reinvent the wheel. You'll learn a lot doing so.
* Always publish your code to Github.
  It doesn't matter if you think it's bad. It gives you a notion of finishing things
