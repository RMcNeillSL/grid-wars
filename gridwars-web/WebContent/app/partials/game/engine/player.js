function Player(playerId, isUser) {
	
	// Mark current player as user
	this.userBoolean = true;
	
	// Save playerId
	this.playerId = playerId;
	
	// Define array object
	this.turrets = [];
	this.tanks = [];
	
}

Player.prototype.isSquareEmpty = function(col, row) {
	
	// Set default result
	var isEmpty = true;
	
	// Search through all turrets for possible col/row match
	for (var index = 0; index < this.turrets.length; index ++) {
		if (this.turrets[index].col == col && this.turrets[index].row == row) {
			isEmpty = false;
			break;
		}
	}
	
	// Return calculated answer
	return isEmpty;
	
}

Player.prototype.placeDefence = function(defenceObject) {
	
	this.turrets.push(defenceObject);
	
}