function Player(playerId, colour, team, isUser, startingCash) {

	// Save passed values
	this.playerId = playerId;
	this.colour = colour;
	this.team = team;
	this.userBoolean = isUser;
	this.purchases = [];
	this.cash = startingCash;
}

Player.prototype.getPurchase = function(instanceId) {
	for (var index = 0; index < this.purchases.length; index ++) {
		if (this.purchases[index].instanceId == instanceId) {
			return this.purchases[index];
		}
	}
	return null;
}

Player.prototype.addPurchase = function(newPurchase) {
	this.purchases.push(newPurchase);
}

Player.prototype.removePurchase = function() {
	
}

Player.prototype.reduceCash = function(amount) {
	this.cash = this.cash - amount;
}

Player.prototype.placeDefence = function(defenceObject) {
	
	this.turrets.push(defenceObject);
	
}