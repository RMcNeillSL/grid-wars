function Player(playerId, colour, team, isUser, startingCash) {

	// Save passed values
	this.playerId = playerId;
	this.colour = colour;
	this.team = team;
	this.userBoolean = isUser;
	this.purchases = [];			// Purchase object --> (gameObject: identifier of object, instanceId: instanceId for object, purchaseTimeout: timeout function, built: boolean)
	this.cash = startingCash;
	this.baseHasSpawned = false;

	// Set player RGB value from colour string
	switch (this.colour) {
		case "blue":
			this.RGB = { red : 17, green : 38, blue : 129 };
			break;
		case "red":
			this.RGB = { red : 102, green : 1, blue : 1 };
			break;
		case "purple":
			this.RGB = { red : 60, green : 14, blue : 66 };
			break;
		case "green":
			this.RGB = { red : 0, green : 61, blue : 0 };
			break;
		case "yellow":
			this.RGB = { red : 129, green : 70, blue : 0 };
			break;
		case "cyan":
			this.RGB = { red : 2, green : 78, blue : 78 };
			break;
		default:
			this.RGB = { red : 0, green : 0, blue : 0 };
			break;
	}
	
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