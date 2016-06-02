// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  socket.center = 0;
  var addedUser = false;


  // when the client emits 'stop typing', we broadcast it to others
  socket.on('position', function (alpha, beta) {


    // Adjust alpha relative to the center
    var centered_alpha = -1 * (alpha - socket.center) + 45;
    console.log(socket.center, alpha, centered_alpha)

      // Scale to 0-1
    var adjusted_beta = (beta)/50;
    var adjusted_alpha = (centered_alpha) / 90

    if (adjusted_alpha < 0) { adjusted_alpha = 0; }
    if (adjusted_alpha > 1) { adjusted_alpha = 1; }

        console.log(socket.center, alpha, centered_alpha, adjusted_alpha)
    // console.log(adjusted_alpha, adjusted_beta)
    socket.broadcast.emit('position', {
      alpha: adjusted_alpha,
      beta: adjusted_beta
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('center', function (alpha) {
    console.log("CENTER - " + alpha)
    socket.center = alpha;
  });





  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });



  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
