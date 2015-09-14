
// Common game variables stored in a single object, required for syncing with the server

function GameCore(identifier, cell) {
	
	// Save passed values
	this.identifier = identifier;
	this.cell = cell;
	
	// Set default values
	this.point = new Point(0, 0);
	this.width = 0;
	this.height = 0;
	this.instanceId = null;
	this.playerId = null;
	this.colour = null;
	
	// FLag properties (not existing in all objects)
	this.isDefence = false;
	
	// Populate values from identifier
	if (this.identifier == "TURRET") {
		this.width = 100;
		this.height = 100;
		this.isDefence = true;
	}
	
	// Declare methods
	this.setInstanceId = function(instanceId) {
		this.instanceId = instanceId;
	}
	this.setPlayer = function(player) {
		this.playerId = player.playerId;
		this.colour = CONSTANTS.COLOUR_TURRET[0];
		for (var index = 1; index < CONSTANTS.COLOUR_TURRET.length; index ++) {
			if (player.colour === CONSTANTS.COLOUR_TURRET[index].COLOUR) {
				this.colour = CONSTANTS.COLOUR_TURRET[index];
			}
		}
	}
}


function Point(x, y) {
	this.x = x;
	this.y = y;
}

Point.prototype.toCell = function() {
	return new Cell(Math.floor(this.x / CONSTANTS.TILE_WIDTH), Math.floor(this.y / CONSTANTS.TILE_HEIGHT));
}


function Cell(col, row) {
	this.col = col;
	this.row = row;
}

Cell.prototype.toPoint = function() {
	return new Point(this.col * CONSTANTS.TILE_WIDTH, this.row * CONSTANTS.TILE_HEIGHT);
}

Cell.prototype.toCenterPoint = function() {
	return new Point(this.col * CONSTANTS.TILE_WIDTH + CONSTANTS.TILE_WIDTH / 2, this.row * CONSTANTS.TILE_HEIGHT + CONSTANTS.TILE_HEIGHT / 2);
}
