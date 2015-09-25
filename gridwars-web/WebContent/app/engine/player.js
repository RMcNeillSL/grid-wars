function Player(playerId, colour, team, isUser, startingCash) {

	// Save passed values
	this.playerId = playerId;
	this.colour = colour;
	this.team = team;
	this.userBoolean = isUser;
	this.purchases = [];			// Purchase object --> (gameObject: identifier of object, instanceId: instanceId for object, purchaseTimeout: timeout function, built: boolean)
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

Player.prototype.getPurchaseFromObjectType = function(objectType) {
	for (var index = 0; index < this.purchases.length; index ++) {
		var purchaseType = CONSTANTS.getObjectType(this.purchases[index].identifier);
		if (purchaseType == objectType) {
			return this.purchases[index];
		}
	}
	return null;
}

Player.prototype.addPurchase = function(identifier, instance, func_Timeout) {
	var newPurchase = { identifier: identifier, instanceId: instance, purchaseTimeout: func_Timeout, buildFinished: false };
	this.purchases.push(newPurchase);
}

Player.prototype.markPurchaseAsBuilt = function(instance) {
	for (var removeIndex = 0; removeIndex < this.purchases.length; removeIndex ++) {
		if (this.purchases[removeIndex].instanceId == instance) {
			this.purchases[removeIndex].buildFinished = true;
		}
	}
}

Player.prototype.removePurchase = function(instanceId) {
	for (var removeIndex = 0; removeIndex < this.purchases.length; removeIndex ++) {
		if (this.purchases[removeIndex].instanceId == instanceId) {
			this.purchases.splice(removeIndex, 1);
		}
	}
}

Player.prototype.reduceCash = function(amount) {
	this.cash = this.cash - amount;
}

Player.prototype.placeDefence = function(defenceObject) {
	
	this.turrets.push(defenceObject);
	
}