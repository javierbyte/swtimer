var path = require('path')
var express = require('express')

var app = express()

var PORT = process.env.PORT || 3000

app.use('/dist', express.static('./dist'))
app.use('/styles', express.static('./styles'))
app.use('/public', express.static('./public'))

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../index.html'))
});

app.listen(PORT, function(err) {
  if (err) return console.error(err)
  console.log('Production listening at http://localhost:' + PORT)
})
