
// Common game variables stored in a single object, required for syncing with the server

function GameCore(identifier, cell) {
	
	// Save passed values
	this.identifier = identifier;
	this.cell = cell;
	
	// Set default values
	this.point = cell.toPoint();
	this.width = 100;
	this.height = 100;
	this.instanceId = null;
	this.playerId = null;
	this.colour = null;
	
	// FLag properties (not existing in all objects)
	this.isDefence = false;

	// Create self reference
	var self = this;
	
	// Field population from server source object
	var populateProperties = function(sourceObject, isUnit) {
		self.isUnit = isUnit;
		self.isDefence = (!isUnit && sourceObject.damage && sourceObject.damage > 0);
		if (sourceObject.cost) { self.cost = sourceObject.cost; }
		if (sourceObject.damage) { self.damage = sourceObject.damage; }
		if (sourceObject.health) { self.health = sourceObject.health; self.maxHealth = sourceObject.health; }
		if (sourceObject.power) { self.power = sourceObject.power; }
		if (sourceObject.range) { self.range = sourceObject.range; }
		if (sourceObject.techLv) { self.techLv = sourceObject.techLv; }
		if (sourceObject.speed) { self.speed = sourceObject.speed; }
	}

	// Locate 'building object' to transfer data from server buildings object
	for (var buildingIndex = 0; buildingIndex < CONSTANTS.GAME_BUILDINGS.length; buildingIndex++) {
		if (CONSTANTS.GAME_BUILDINGS[buildingIndex].identifier == identifier) {
			populateProperties(CONSTANTS.GAME_BUILDINGS[buildingIndex], false);
		}
	}

	// Locate 'unit object' to transfer data from server buildings object
	for (var unitIndex = 0; unitIndex < CONSTANTS.GAME_BUILDINGS.length; unitIndex++) {
		if (CONSTANTS.GAME_UNITS[unitIndex].identifier == identifier) {
			populateProperties(CONSTANTS.GAME_UNITS[unitIndex], true);
		}
	}
}

GameCore.prototype.setInstanceId = function(instanceId) {
	this.instanceId = instanceId;
}

GameCore.prototype.setPlayer = function(player) {

	// Link playerId to passed param
	this.playerId = player.playerId;

	// Set up colours
	this.colour = CONSTANTS.COLOUR_[this.identifier][0];
	for (var index = 1; index < CONSTANTS.COLOUR_[this.identifier].length; index ++) {
		if (player.colour === CONSTANTS.COLOUR_[this.identifier][index].COLOUR) {
			this.colour = CONSTANTS.COLOUR_[this.identifier][index];
		}
	}

}

GameCore.prototype.setHealth = function(newHealth) {
	this.health = Math.max(newHealth, 0);
}

GameCore.prototype.phaserAngleTo360 = function(phaserAngle) {
	var outputAngle = phaserAngle;
	if (outputAngle < 0) { outputAngle += 360; }
	return outputAngle;
}

GameCore.prototype.calculateRotateToPointData = function(currentAngle, currentPoint, targetPoint, rotateSpeed) {

	// Check X&Y deltas
	var deltaX = targetPoint.x - currentPoint.x;
	var deltaY = targetPoint.y - currentPoint.y;
	
	// Calculate target angle
	var targetAngle = 0;
	var calcAngle = Math.atan((deltaX*1.0)/deltaY) * 180/Math.PI;
	if (deltaX >= 0 && deltaY >= 0) { targetAngle = 180 - calcAngle; }
	if (deltaX >= 0 && deltaY < 0) { targetAngle = 0 - calcAngle; }
	if (deltaX <= 0 && deltaY >= 0) { targetAngle = -180 - calcAngle; }
	if (deltaX <= 0 && deltaY < 0) { targetAngle = 0 - calcAngle; }

	// Adjust angles to 0-360 values
	var target360Angle = this.phaserAngleTo360(targetAngle);
	var current360Angle = this.phaserAngleTo360(currentAngle);
	
	// Determine move increment direction based on angle size
	var angleIncrement = 0;
	var angleAbsDif = Math.max(target360Angle, current360Angle) - Math.min(target360Angle, current360Angle);
	if (current360Angle < target360Angle && angleAbsDif <= 180) { angleIncrement = rotateSpeed; }
	if (current360Angle < target360Angle && angleAbsDif > 180) { angleIncrement = -rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif <= 180) { angleIncrement = -rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif > 180) { angleIncrement = rotateSpeed; }

	// Return calculated object
	return {
		current360Angle: Math.round(current360Angle),
		target360Angle: Math.round(target360Angle),
		currentPoint: currentPoint,
		targetPoint: targetPoint,
		angleIncrement: angleIncrement
	};
	
}

GameCore.prototype.angleInErrorMargin = function(currentAngle, targetAngle, errorMargin) {
	
	// Make sure error margin is non-negative
	errorMargin = Math.abs(errorMargin);

	// Create checking variables
	var current = {
			angle: currentAngle,
			upper: currentAngle + errorMargin,
			lower: currentAngle - errorMargin
	}
	var target = {
			angle: targetAngle,
			upper: targetAngle + errorMargin,
			lower: targetAngle - errorMargin
	}
	
	// Rotation needed
	var rotationNeeded = 
		( (target.lower < current.angle && target.upper > current.angle) ||
		  (current.upper > 360 && target.lower < 0) ||
		  (current.lower < 0 && target.upper > 360) );
		
	// Return calculated rotation needed
	return rotationNeeded;

}

GameCore.prototype.pythag = function(pointA, pointB) {
	var result = Math.sqrt((pointA.x - pointB.x) + (pointA.y - pointB.y));
	return result;
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
