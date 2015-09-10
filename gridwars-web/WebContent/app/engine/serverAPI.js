function GameplayRequest(requestCode, newBuilding) {
	this.requestCode = requestCode;
	this.targetCellX = newBuilding.col;
	this.targetCellY = newBuilding.row;
	this.source = [newBuilding.identifier];
	this.target = [];
}


function ServerAPI(gameService) {

	// Save passed variables
	this.gameService = gameService;
	
}

ServerAPI.prototype.requestBuildingPlacement = function(callback, newBuilding) {
	
	// Make sure a building object is present
	if (newBuilding) {
		
		// Generate request object
		var request = new GameplayRequest("NEW_BUILDING", newBuilding.target);
		console.log(request);
		this.gameService.gameplayRequestAndWait(callback, request);
		
	} else {
		console.log("ERROR: Attempted to construct building from no source.");
	}
	
	// Return failed
	return null;
	
}
