var posts = require('./index.json')
var fs = require('fs')
var marked = require('marked')
var path = require('path')

var template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')

marked.setOptions({
  highlight: function (code, lang) {
    // TODO: find highlighter
    return code
  }
})

posts.forEach(function (post, i) {
  var source = marked(fs.readFileSync(path.join(__dirname, post.source), 'utf-8'))
  var page = template.replace('{source}', source).replace('{date}', post.date).replace('{title}', post.title)
  var link = post.source.replace('.md', '.html')

  fs.writeFileSync(path.join(__dirname, '..', link), page)
  if (i === 0) fs.writeFileSync(path.join(__dirname, '../index.html'), page)
})
