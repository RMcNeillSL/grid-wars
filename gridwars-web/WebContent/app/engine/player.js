function Player(playerId, isUser) {
	
	// Mark current player as user
	this.userBoolean = true;
	
	// Save playerId
	this.playerId = playerId;
	
}

Player.prototype.placeDefence = function(defenceObject) {
	
	this.turrets.push(defenceObject);
	
}