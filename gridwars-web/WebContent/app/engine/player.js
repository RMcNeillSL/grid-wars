function Player(playerId, colour, team, isUser) {

	// Save passed values
	this.playerId = playerId;
	this.colour = colour;
	this.team = team;
	this.userBoolean = isUser;
	
	//ONLY FOR TESTING PURPOSES, REMOVE LATER
	this.hasPlacedObject = false;
}

Player.prototype.placeDefence = function(defenceObject) {
	
	this.turrets.push(defenceObject);
	
}