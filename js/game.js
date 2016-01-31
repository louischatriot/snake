function Game (_opts) {
  var opts = _opts || {};
  this.snake = [];   // Implement as cyclic array for performance?
                     // For now index 0 points to the head
  this.boardX = opts.boardX || 50;
  this.boardY = opts.boardY || 30;

  // Snake starts at middle vertically and 1/3 starting from the left
  var x0 = Math.floor(this.boardX / 3);
  var y0 = Math.floor(this.boardY / 2);
  var snakeStartLength = opts.snakeStartLength || 5;
  for (var i = 0; i < snakeStartLength; i += 1) {
    this.snake[i] = { x: x0 - i, y: y0 };
  }
  this.snakeDirection = Game.directions.RIGHT;
  this.commands = [];

  // Board parameters
  this.squareSize = opts.squareSize || 16;
  this.$container = $(opts.containerId || '#board');
  this.$container.css('position', 'relative');
  this.$container.width(this.squareSize * this.boardX);
  this.$container.height(this.squareSize * this.boardY);
  this.$container.css('border', '1px solid black');

  // Apples. Hmmm, apples.
  this.apples = {};
  this.sizeIncreasePerApple = opts.sizeIncreasePerApple || 7;
  this.applesOnMap = opts.applesOnMap || 4;
  for (var i = 0; i < this.applesOnMap; i += 1) { this.generateApple(); }
  this.segmentsToAdd = [];

  // Event emitter
  this.listeners = {};
}

Game.directions = { LEFT: 'left', RIGHT: 'right', BOTTOM: 'bottom', TOP: 'top' };
Game.movements = {};
Game.movements[Game.directions.LEFT] = { x: -1, y: 0 };
Game.movements[Game.directions.RIGHT] = { x: 1, y: 0 };
Game.movements[Game.directions.BOTTOM] = { x: 0, y: 1 };
Game.movements[Game.directions.TOP] = { x: 0, y: -1 };

// Event Emitter
Game.prototype.on = function(evt, listener) {
  if (!this.listeners[evt]) { this.listeners[evt] = []; }
  this.listeners[evt].push(listener);
};

Game.prototype.emit = function (evt, message) {
  if (this.listeners[evt]) {
    this.listeners[evt].forEach(function (fn) { fn(message); });
  }
};


/**
 * Pretty self-explaining
 */
Game.getOppositeDirection = function (direction) {
  if (direction === Game.directions.LEFT) { return Game.directions.RIGHT; }
  if (direction === Game.directions.RIGHT) { return Game.directions.LEFT; }
  if (direction === Game.directions.TOP) { return Game.directions.BOTTOM; }
  if (direction === Game.directions.BOTTOM) { return Game.directions.TOP; }
};


/**
 * Generate an apple.
 * TODO: don't generate apples on taken spots (by another apple or the snake)
 */
Game.prototype.generateApple = function (_x, _y) {
  var x = _x || 1 + Math.floor(Math.random() * (this.boardX - 1));
  var y = _y || 1 + Math.floor(Math.random() * (this.boardY - 1));

  var $apple = $('<div class="apple">');
  $apple.width(this.squareSize);
  $apple.height(this.squareSize);
  $apple.css('left', (x * this.squareSize) + 'px');
  $apple.css('top', (y * this.squareSize) + 'px');

  this.$container.append($apple);
  this.apples[x + '-' + y] = $apple;
};


/**
 * Move time forward by one tick, so the snake moves by one square
 */
Game.prototype.tick = function () {
  if (this.commands.length > 0) { this.snakeDirection = this.commands.shift(); }

  // Eating an apple - Detecting collision, removing apple and placing new one
  var i;
  if (this.apples[this.snake[0].x + '-' + this.snake[0].y]) {
    for (i = 0; i < this.sizeIncreasePerApple; i += 1) {
      this.segmentsToAdd.push({ x: this.snake[this.snake.length - 1].x, y: this.snake[this.snake.length - 1].y });
    }
    this.generateApple();
    this.apples[this.snake[0].x + '-' + this.snake[0].y].remove();
    delete this.apples[this.snake[0].x + '-' + this.snake[0].y];
  }

  // Translate snake segments
  for (i = this.snake.length - 2; i >= 0; i -= 1) {
    this.snake[i + 1] = this.snake[i];
  }
  this.snake[0] = {};
  this.snake[0].x = this.snake[1].x + Game.movements[this.snakeDirection].x;
  this.snake[0].y = this.snake[1].y + Game.movements[this.snakeDirection].y;

  // Eating an apple - Grow snake
  if (this.segmentsToAdd.length > 0) { this.snake.push(this.segmentsToAdd.shift()); }

  // Collisions
  if (this.snake[0].x < 0 || this.snake[0].x >= this.boardX || this.snake[0].y < 0 || this.snake[0].y >= this.boardY) {
    this.emit('lost');
  }
  for (i = 1; i < this.snake.length; i += 1) {
    if (this.snake[0].x === this.snake[i].x && this.snake[0].y === this.snake[i].y) {
      this.emit('lost');
    }
  }
};


/**
 * Redraw the snake
 * @param {Boolean} redrawAll Optional, defaults to false, if true redraw all squares not just head and tail
 */
Game.prototype.redrawSnake = function (redrawAll) {
  var self = this;

  // TODO: actually use redrawAll
  // TODO: don't redraw everything
  // TODO: use 6 different snake tiles to have a nice, non overlapping snake

  this.$container.find('div.snake-body').remove();
  this.snake.forEach(function (p) {
    var $square = $('<div class="snake-body">');
    $square.width(self.squareSize);
    $square.height(self.squareSize);
    $square.css('left', (p.x * self.squareSize) + 'px');
    $square.css('top', (p.y * self.squareSize) + 'px');

    self.$container.append($square);
  });
};


/**
 * Do a turn
 * Don't turn backwards in one go, that's a stupid automatic loss
 * Change direction as soon as possible. If two commands are fired between two ticks,
 * record them and play on two adjacent ticks (very fast players  will hate this gameplay otherwise)
 * TODO: should really limit this.commands to size 2 and not record additional commands but given
 *       the typical snake speed that is not necessary
 */
Game.prototype.changeDirection = function (newDirection) {
  if (newDirection === Game.getOppositeDirection(this.snakeDirection) && this.commands.length === 0) { return; }
  this.commands.push(newDirection);
};




