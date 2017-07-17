var express = require('express'),
    path = require('path'),
    jade = require('jade');

var app = new express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
  res.render('layout', { title: 'Node.js / Distance Mapper', subtitle: 'Da click sobre los marcadores se mostrara la distancia en millas nauticas (podras saber de nueva cuenta las millas dando click sobre las lineas)' });
});

app.listen(3000)
