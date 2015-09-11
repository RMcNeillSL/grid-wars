function GameplayRequest(requestCode, params) {

	// Set default values
	this.requestCode = requestCode;
	this.targetCellX = 0;
	this.targetCellY = 0;
	this.source = [];
	this.target = [];
	
	// Populate from params
	if (params) {
		if (params.targetCellX) { this.targetCellX = params.targetCellX; }
		if (params.targetCellY) { this.targetCellY = params.targetCellY; }
		if (params.source) { this.source = params.source; }
		if (params.target) { this.source = params.target; }
	}
}


function ServerAPI(gameService) {

	// Save passed variables
	this.gameService = gameService;
	
}

ServerAPI.prototype.requestBuildingPlacement = function(newBuilding) {
	
	// Make sure a building object is present
	if (newBuilding) {
		
		// Create request params
		var params = {
				source: [newBuilding.target.gameCore.identifier],
				targetCellX: newBuilding.target.gameCore.cell.col,
				targetCellY: newBuilding.target.gameCore.cell.row
		};
		
		// Generate request object
		var request = new GameplayRequest("NEW_BUILDING", params);

		console.log(request);
		
		// Submit request
		this.gameService.gameplayRequest(request);
		
	} else {
		console.log("ERROR: Attempted to construct building from no source.");
	}
	
}

ServerAPI.prototype.requestDefenceAttackXY = function(defences, targetX, targetY) {

	// Make sure a building object is present
	if (targetX && targetY) {

		// Create request params
		var params = {
				source: [],
				targetCellX: targetX,
				targetCellY: targetY
		};
		for (var index = 0; index < defences.length; index ++) {
			params.source.push(defences[index].gameCore.instanceId);
		}
		
		// Generate request object
		var request = new GameplayRequest("DEFENCE_ATTACK_XY", params);
	
		console.log(request);
		
		// Submit request
		this.gameService.gameplayRequest(request);
	
	} else {
		console.log("ERROR: Attempted to target XY with missing XY.");
	}
	
}

