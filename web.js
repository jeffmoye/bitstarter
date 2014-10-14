var express = require('express');
var app = express();
var fs = require('fs');

app.set('port', process.env.PORT || 8080);
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  var output = '';
//  output = 'Hello World2!';
  output = fs.readFileSync('./index.html', 'utf8').toString();
  response.send(output);
});

app.listen(app.get('port'), function() {
  console.log("Application is listening on port " + app.get('port'));
});
