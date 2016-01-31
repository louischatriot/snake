var game = new Game()
  , paused = false
  , stopped = false
  ;

/**
 * Handle directions change
 */
$('body').on('keydown', function (e) {
  switch (e.keyCode) {
    case 37:
      game.changeDirection(Game.directions.LEFT);
      break;
    case 39:
      game.changeDirection(Game.directions.RIGHT);
      break;
    case 38:
      game.changeDirection(Game.directions.TOP);
      break;
    case 40:
      game.changeDirection(Game.directions.BOTTOM);
      break;
    case 27:   // ESC
      paused = paused ? false : true;
      break;
    case 65:   // a
      game.generateApple();
      break;
  }
});


/**
 * Game lost
 */
game.on('lost', function () {
  stopped = true;
  $('#message').html('<h2>You lost!</h2>');
});

var lastTime = Date.now();

/**
 * Main loop
 * For now, the snake will slow down as it gets larger, which can be fixed
 * Some testing shows that computers are so fast that even huge snakes do not actually slow
 * the snake down (at least on my machine). I'll probably now optimize it :)
 */
setInterval(function () {
  if (paused || stopped) { return; }
  game.tick();
  if (stopped) { return; }   // Game can be stopped by a tick, don't redraw then
  game.redrawSnake();
}, 100);
