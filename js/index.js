var game = new Game()
  , paused = false
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
 * Main loop
 * For now, the snake will slow down as it gets larger, which can be fixed
 */
setInterval(function () {
  if (paused) { return; }
  game.tick();
  game.redrawSnake();
}, 100);
