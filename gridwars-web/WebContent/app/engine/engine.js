// Constructor

function Engine(gameplayConfig, playerId, serverAPI) {

	var self = this;
	var local_preload = function() { self.preload(); }
	var local_create = function() { self.create(); }
	var local_update = function() { self.update(); }

	// Create phaser game object
	this.phaserGame = new Phaser.Game(800, 600, Phaser.AUTO, 'gridwars-engine',
			{
				preload : local_preload,
				create : local_create,
				update : local_update
			});

	// Introduce dynamic pointer objects
	this.phaserGame.newBuilding = { active : false, target : null };

	// Create user objects
	this.currentPlayer = null;
	this.players = [];
	for (var index = 0; index < gameplayConfig.userName.length; index++) {
		var newPlayer = new Player(gameplayConfig.userName[index],
				gameplayConfig.userColour[index],
				gameplayConfig.userTeam[index],
				(gameplayConfig.userName[index] == playerId));
		this.players.push(newPlayer);
		if (gameplayConfig.userName[index] == playerId) {
			this.currentPlayer = newPlayer;
		}
	}
	console.log(this.players);

	// Save and setup server object
	this.serverAPI = serverAPI;

	// Define core phaser objects
	this.mapRender = null;
	this.explosionManager = null;
	this.gameplayConfig = gameplayConfig;
	this.mouse = {
		x : 0,
		y : 0
	};

	// Define core phaser object arrays
	this.units = [];
	this.buildings = [];

	// Define sprite groups
	this.mapGroup = null;
	this.mapOverlayGroup = null;
	this.turretGroup = null;
	this.tankGroup = null;

}

Engine.prototype.preload = function() {

	// Set system to render even when not active
	this.phaserGame.stage.disableVisibilityChange = true;

	// Load sprite sheets
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TURRET, CONSTANTS.ROOT_SPRITES_LOC + 'turret.png', 100, 100, 78);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK, CONSTANTS.ROOT_SPRITES_LOC + 'tank.png', 100, 100, 7);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_IMPACT_DECALS, CONSTANTS.ROOT_SPRITES_LOC + 'impactDecals.png', 50, 50, 4);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_A, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionA.png', 128, 128, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_B, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionB.png', 128, 128, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_PLACEMENT, CONSTANTS.ROOT_SPRITES_LOC + 'tile_selections.png', 100, 100, 3);

	// Load tile images
	this.phaserGame.load.image(CONSTANTS.MAP_TILE_A, CONSTANTS.ROOT_SPRITES_LOC + 'mapTileA.png');
	this.phaserGame.load.image(CONSTANTS.MAP_TILE_B, CONSTANTS.ROOT_SPRITES_LOC + 'mapTileB.png');

	// Load particles
	this.phaserGame.load.image(CONSTANTS.PARTICLE_YELLOW_SHOT, CONSTANTS.ROOT_SPRITES_LOC + 'p_yellowShot.png');

}

Engine.prototype.create = function() {

	// Create self reference
	var self = this;
	var local_onKeyPressed = function(char) { self.onKeyPressed(char); }

	// Create sprite groups
	this.mapGroup = this.phaserGame.add.group();
	this.mapOverlayGroup = this.phaserGame.add.group();
	this.turretGroup = this.phaserGame.add.group();
	this.tankGroup = this.phaserGame.add.group();

	// Construct explosion manager
	this.explosionManager = new ExplosionManager(this.phaserGame);

	// Construct map renderer
	this.mapRender = new MapRenderer(this.phaserGame, this.mapGroup, this.mapOverlayGroup, this.gameplayConfig.width, this.gameplayConfig.height, this.gameplayConfig.cells);

	// Construct event listeners
	this.phaserGame.input.onDown.add(this.onMouseClick, this);
	this.phaserGame.input.keyboard.addCallbacks(this, null, null, local_onKeyPressed);
	this.phaserGame.input.addMoveCallback(this.onMouseMove, this);

}

Engine.prototype.update = function() {

	// Render map
	this.mapRender.renderMap();

	// Render placement overlay
	if (this.phaserGame.newBuilding.active) {
		var cell = (new Point(this.mouse.x, this.mouse.y)).toCell();
		var canPlace = this.isSquareEmpty(cell.col, cell.row);
		this.mapRender.placementHover(cell.col, cell.row, canPlace);
	}

	// Update all buildings and units
	for (var index = 0; index < this.buildings.length; index++) { this.buildings[index].update(); }
	for (var index = 0; index < this.units.length; index++) { this.units[index].update(); }

}

// Input event methods

Engine.prototype.onMouseClick = function(pointer, x, y) {

	// Save self reference
	var self = this;
	
	// Check for key press
	var ctrlDown = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.CONTROL);
	
	// Positional values for cell and xy
	var point = new Point(this.mouse.x, this.mouse.y);
	var cell = point.toCell();
	
	// Perform checks for type of click
	if (this.phaserGame.newBuilding.active) {
		
		// Render placement overlay
		if (this.isSquareEmpty(cell.col, cell.row)) {
			self.phaserGame.newBuilding.target.setPosition(cell);
			this.serverAPI.requestBuildingPlacement(this.phaserGame.newBuilding);
			self.phaserGame.newBuilding.active = false;
			self.mapRender.clearPlacementHover();
		}
		
	} else if (ctrlDown) {
		
		// Check if square is empty
		if (this.isSquareEmpty(cell.col, cell.row)) {
			var targetUnit = this.units[0];
			if (targetUnit) {
				this.serverAPI.requestUnitMoveCell(targetUnit, cell);
			}
		}
		
	} else {

		// Generate list of defences for attack
		var defences = [];
		for (var index = 0; index < this.buildings.length; index++) {
			if (this.buildings[index].gameCore.isDefence
					&& this.currentPlayer.playerId == this.buildings[index].gameCore.playerId) {
				defences.push(this.buildings[index]);
			}
		}

		// Submit request to fire all turrets
		this.serverAPI.requestDefenceAttackXY(defences, this.mouse.x,
				this.mouse.y);

	}

}

Engine.prototype.onMouseMove = function(pointer, x, y) {

	// Save position information
	this.mouse.x = x;
	this.mouse.y = y;

}

Engine.prototype.onKeyPressed = function(char) {

	// Check if creating a new object
	/*if (char == '1' || char == '2' || char == '3') {

		// Game core object
		var cell = (new Point(this.mouse.x, this.mouse.y)).toCell();
		var gameCore = new GameCore("TURRET", cell);
		gameCore.setPlayer(this.currentPlayer);

		// Set active building object
		if (char == '1') {
			this.createNewBuildingObject(gameCore);
		}

		// Set active building object -phaserRef, -mapGroup, -tankGroup, -xy,
		// width, height, func_explosionRequest
		if (char == '2') {
			var gameCore = new GameCore("TANK", cell);
			this.phaserGame.newBuilding.active = true;
			this.phaserGame.newBuilding.target = new Tank(this.phaserGame, gameCore, this.mapGroup, this.tankGroup,
					cell.toPoint(), cell.col, cell.row, 100, 100,
	                this.explosionManager.requestExplosion, true);
		}
	}*/

}

// Utility methods

Engine.prototype.isSquareEmpty = function(col, row) {
	for (var index = 0; index < this.buildings.length; index++) {
		if (this.buildings[index].gameCore.cell.col == col
				&& this.buildings[index].gameCore.cell.row == row) {
			return false;
		}
	}
	return true;
}

Engine.prototype.createNewBuildingObject = function(gameCore) {

	// Create new object and return
	this.phaserGame.newBuilding.active = true;
	this.phaserGame.newBuilding.target = new Turret(this.phaserGame, gameCore, this.mapGroup, this.turretGroup,
			gameCore.cell.toPoint(), gameCore.cell.col, gameCore.cell.row, 100, 100,
            this.explosionManager.requestExplosion, true);
}

Engine.prototype.purchaseObject = function(item) {
	var cell = (new Point(this.mouse.x, this.mouse.y)).toCell();
	var gameCore = new GameCore("TURRET", cell);
	gameCore.setPlayer(this.currentPlayer);
	
	if(item === "TURRET") {
		this.createNewBuildingObject(gameCore);
	} else if (item === "TANK") {
		var gameCore = new GameCore("TANK", cell);
		this.phaserGame.newBuilding.active = true;
		this.phaserGame.newBuilding.target = new Tank(this.phaserGame, gameCore, this.mapGroup, this.tankGroup,
				cell.toPoint(), cell.col, cell.row, 100, 100,
                this.explosionManager.requestExplosion, true);
	}
}

Engine.prototype.getObjectFromInstanceId = function(instanceId) {

	// Look through buildings
	for (var index = 0; index < this.buildings.length; index++) {
		if (this.buildings[index].gameCore.instanceId == instanceId) {
			return this.buildings[index];
		}
	}

	// Look through units
	for (var index = 0; index < this.units.length; index++) {
		if (this.units[index].gameCore.instanceId == instanceId) {
			return this.units[index];
		}
	}

	// Return erroneous result
	return null;
}

Engine.prototype.getPlayerFromPlayerId = function(playerId) {

	// Search for player
	for (var index = 0; index < this.players.length; index ++) {
		if (this.players[index].playerId === playerId) {
			return this.players[index];
		}
	}
	
	// Return not found
	return null;
}

// Specialised methods for dealing with individual responses

Engine.prototype.processNewBuilding = function(responseData) {

	// Iterate through all buildings
	for (var index = 0; index < responseData.source.length; index++) {

		// Create quick reference object
		var refObject = {
			instanceId : responseData.target[index],
			identifier : responseData.source[index],
			cell : responseData.coords[index],
			playerId : responseData.misc[index]
		};

		// Create XY position from col/row
		refObject.xy = refObject.cell.toPoint();
		
		// Calculate player from player id
		refObject.player = this.getPlayerFromPlayerId(refObject.playerId);

		// Create GameCore object
		var gameCore = new GameCore("TURRET", refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);

		// Construct object for positioning
		var newBuilding = new Turret(this.phaserGame, gameCore, this.mapGroup,
				this.turretGroup, refObject.xy, refObject.col, refObject.row,
				100, 100, this.explosionManager.requestExplosion, false);

		// Add object to building array
		this.buildings.push(newBuilding);
	}

}

Engine.prototype.processDefenceAttackXY = function(responseData) {

	// Process all items of request
	for (var reqIndex = 0; reqIndex < responseData.source.length; reqIndex++) {

		// Create reference object
		var refObject = {
			instanceId : responseData.source[reqIndex],
			targetX : responseData.coords[reqIndex].col,
			targetY : responseData.coords[reqIndex].row
		};

		// Loop through all defences set to fire
		var defence = null;
		for (var index = 0; index < responseData.source.length; index++) {
			defence = this.getObjectFromInstanceId(refObject.instanceId);
			if (defence != null && defence.gameCore.isDefence) {
				defence.rotateAndShoot(refObject.targetX, refObject.targetY);
			}
		}
	}
}

Engine.prototype.processWaypoints = function(responseData) {

	// Set waypoints to empty
	var waypoints = [];

	// Process all items of request
	for (var reqIndex = 0; reqIndex < responseData.source.length; reqIndex++) {

		// Create reference object
		var refObject = {
			instanceId : responseData.source[reqIndex],
			targetX : responseData.coords[reqIndex].col,
			targetY : responseData.coords[reqIndex].row
		};
		
		// Check if item already exists in waypoints
		var itemExists = false;
		for (var index = 0; index < waypoints.length; index++) {
			if (waypoints[index].instanceId == refObject.instanceId) {
				itemExists = true;
				waypoints[index].path.push((new Cell(refObject.targetX, refObject.targetY).toCenterPoint()));
				break;
			}
		}
		
		// Add new item to waypoints
		if (!itemExists) {
			waypoints.push({ instanceId: refObject.instanceId, path: [(new Cell(refObject.targetX, refObject.targetY)).toCenterPoint()] });
		}
		
	}
	
	// Iterate through waypoints assigning them to objects
	var targetUnit = null;
	for (var index = 0; index < waypoints.length; index ++) {
		targetUnit = this.getObjectFromInstanceId(waypoints[index].instanceId);
		if (targetUnit) { targetUnit.updateWaypoints(waypoints[index].path); }
	}
}

Engine.prototype.processDebugPlacement = function(responseData) {

	// Iterate through all buildings
	for (var index = 0; index < responseData.source.length; index ++) {
		
		// Create quick reference object
		var refObject = {
				instanceId: responseData.target[index],
				identifier: responseData.source[index], 
				cell: responseData.coords[index],
				playerId: responseData.misc[index]
			};
		
		// Create XY position from col/row
		refObject.xy = refObject.cell.toPoint();

		// Calculate player from player id
		refObject.player = this.getPlayerFromPlayerId(refObject.playerId);

		// Create GameCore object
		var gameCore = new GameCore("TANK", refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);
		
		// Construct object for positioning
		var newTank = new Tank(this.phaserGame, gameCore, this.mapGroup, this.tankGroup, refObject.xy, refObject.col, refObject.row, 100, 100, this.explosionManager.requestExplosion, false);
		
		// Add object to unit array
		this.units.push(newTank);
	}
}

// Process any server messages and call appropriate functions

Engine.prototype.processGameplayResponse = function(responseData) {

	switch(responseData.responseCode) {
	    case "NEW_BUILDING":
	        this.processNewBuilding(responseData);
	        break;
	    case "DEFENCE_ATTACK_XY":
	        this.processDefenceAttackXY(responseData);
	        break;
	    case "WAYPOINT_PATH_COORDS":
	        this.processWaypoints(responseData);
	    	break;
	    case "DEBUG_PLACEMENT":
	    	this.processDebugPlacement(responseData);
	    	break;
	    default:
	        // Do nothing
	    	break;
	}

}
