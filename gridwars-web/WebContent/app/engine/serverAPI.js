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
		if (params.target) { this.target = params.target; }
	}
	
	// Debug output for console
	var gameplayRequest = this; console.log(gameplayRequest);
}


function ServerAPI(gameService) {

	// Save passed variables
	this.gameService = gameService;
	
}

ServerAPI.prototype.requestBuildingPlacement = function(newBuilding) {
	
	// Make sure a building object is present
	if (newBuilding) {
		
		// Define variables
		var request = null;
		
		// Check if debug tank pathfinding request
		if (newBuilding.target instanceof Turret) {

			// Create request params
			var params = {
					source: [newBuilding.target.gameCore.identifier],
					targetCellX: newBuilding.target.gameCore.cell.col,
					targetCellY: newBuilding.target.gameCore.cell.row
			};
			
			// Generate request object
			request = new GameplayRequest("NEW_BUILDING", params);

		} else if (newBuilding.target instanceof Tank) {

			// Create request params
			var params = {
					source: [newBuilding.target.gameCore.identifier],
					targetCellX: newBuilding.target.gameCore.cell.col,
					targetCellY: newBuilding.target.gameCore.cell.row
			};
			
			// Generate request object
			request = new GameplayRequest("DEBUG_PLACEMENT", params);

		}
		
		// Submit request if one was constructed
		if (request) {
			this.gameService.gameplayRequest(request);
		}
		
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

		// Submit request
		this.gameService.gameplayRequest(request);
	
	} else {
		console.log("ERROR: Attempted to target XY with missing XY.");
	}
	
}

ServerAPI.prototype.requestUnitMoveCell = function(units, cell) {

	// Make sure a required information is present
	if (units && cell) {

		// Create request params
		var params = {
				source: [units.gameCore.instanceId],
				targetCellX: cell.col,
				targetCellY: cell.row
		};
		
		// Generate request object
		var request = new GameplayRequest("WAYPOINT_PATH_COORDS", params);
	
		// Submit request
		this.gameService.gameplayRequest(request);
	
	} else {
		if (!units) { console.log("ERROR: Attempted to move units to cell with missing units."); }
		else if (!cell) { console.log("ERROR: Attempted to move units to cell with missing cell."); }
		else { console.log("ERROR: Unable to move units to cell for unknown reason"); }
	}	
}

ServerAPI.prototype.requestUpdateUnitCell = function(unit, newCell) {
	
	// Make sure required information is present
	if (unit && newCell) {
		
		// Create request params
		var params = {
				source: [unit.gameCore.instanceId],
				targetCellX: newCell.col,
				targetCellY: newCell.row
		};
		
		// Generate request object
		var request = new GameplayRequest("WAYPOINT_UPDATE_UNIT_CELL", params);
		
		// Submit request
		this.gameService.gameplayRequest(request);
		
	}
	
}

ServerAPI.prototype.requestDamageSubmission = function(units, damageAmount) {

	// Make sure required information is present
	if (units && damageAmount) {
		
		// Create request params
		var params = {
				source: [],
				target: [damageAmount]
		};
		
		// Populate damage unit list
		for (var unitIndex = 0; unitIndex < units.length; unitIndex ++) {
			params.source.push(units[unitIndex].gameCore.instanceId);
		}
		
		// Generate request object
		var request = new GameplayRequest("DAMAGE_OBJECT", params);
		
		// Submit request
		this.gameService.gameplayRequest(request);
		
	}
	
}









