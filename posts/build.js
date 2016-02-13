var posts = require('./index.json')
var fs = require('fs')
var marked = require('marked')
var path = require('path')
var RSS = require('rss')

var feed = new RSS({
  title: '@mafintosh blogs about technology',
  description: '@mafintosh blogs about technology',
  feed_url: 'http://mafintosh.com/rss.xml',
  site_url: 'http://mafintosh.com',
  language: 'en',
  managingEditor: 'Mathias Buus'
})

var template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')

marked.setOptions({
  highlight: function (code, lang) {
    // TODO: find highlighter
    return code
  }
})

posts.forEach(function (post, i) {
  var source = marked(fs.readFileSync(path.join(__dirname, post.source), 'utf-8'))
  var link = post.source.replace('.md', '.html')
  var page = template.replace('{source}', source).replace('{permalink}', '<a href="/' + link + '">' + post.date + ', Mathias Buus</a>').replace('{title}', post.title)

  fs.writeFileSync(path.join(__dirname, '..', link), page)
  if (i === 0) fs.writeFileSync(path.join(__dirname, '../index.html'), page)

  feed.item({
    title: post.title,
    date: post.date,
    author: 'Mathias Buus',
    url: 'http://mafintosh.com/' + link
  })
})

fs.writeFileSync(path.join(__dirname, '../rss.xml'), feed.xml())
