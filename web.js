var express = require('express');
var app = express();
var fs = require('fs');

app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send(fs.readFileSync('./index.html', 'utf8').toString);
//  response.send('Hello World2!');
});

app.listen(app.get('port'), function() {
  console.log("Application is listening on port " + app.get('port'));
});
