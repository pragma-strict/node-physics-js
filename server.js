const express = require("express");

const app = express();

app.set('views', __dirname + '/public/view');

app.use(express.static(__dirname + '/public'));

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//--Define routes
app.get('/', (req, res) => {
  res.sendfile('./public/pages/home.html', {
  });
});
