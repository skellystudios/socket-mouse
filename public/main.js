$(function() {

  var socket = io();

  var alpha = 0;
  var beta = 0;

  function deviceOrientationListener(event) {
    alpha = Math.round(event.alpha);
    beta = Math.round(event.beta);
    socket.emit('position', alpha, beta);
  }

  if (window.DeviceOrientationEvent) {
     window.addEventListener("deviceorientation", deviceOrientationListener);
     $('body').click(function() {
       socket.emit('center', alpha);
    });
  }
  else {
      console.log("Sorry, your browser doesn't support Device Orientation");
  }

  // Whenever the server emits 'new message', update the chat body
  socket.on('position', function (data) {
    console.log(data);
    var alpha = data['alpha'];
    var beta = data['beta'];

    var w = window.innerWidth;
    var h = window.innerHeight;

    var top = (h/2 + (h* beta) * -1);
    var left = alpha * w;

    console.log(left, top)
    $('.cursor').css({left: left, top: top, position:'absolute'});
  });

});
