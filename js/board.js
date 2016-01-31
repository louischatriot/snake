function Board (_opts) {
  var opts = _opts || {};

  this.squareSize = opts.squareSize || 8;
  this.$container = $(opts.containerId || '#board');
}


