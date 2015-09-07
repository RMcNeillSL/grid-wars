function GameplayRequest(requestCode) {
	this.requestCode = requestCode;
}


function ServerAPI(gameService) {

	// Save passed variables
	this.gameService = gameService;
	
}

ServerAPI.prototype.requestBuildingPlacement = function(callback, buildingObject) {
	
	// Make sure a building object is present
	if (buildingObject) {
		
		// Generate request object
		var request = new GameplayRequest("NEW_BUILDING", buildingObject.identifier);
		this.gameService.gameplayRequestAndWait(callback, request);
		
	} else {
		console.log("ERROR: Attempted to construct building from no source.");
	}
	
	// Return failed
	return null;
	
}

