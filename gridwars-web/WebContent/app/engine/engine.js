
// Constructor

function Engine(gameplayConfig, playerId, serverAPI) {

	var self = this;
	var local_preload = function() { self.preload(); }
	var local_create = function() { self.create(); }
	var local_update = function() { self.update(); }
	
	// Create phaser game object
	this.phaserGame = new Phaser.Game(800, 600, Phaser.AUTO, CONSTANTS.GAME_NAME, { preload: local_preload, create: local_create, update: local_update });

	// Introduce dynamic pointer objects
	this.phaserGame.newBuilding = { active: false, target: null };
	
	// Create user objects
	this.currentPlayer = null;
	this.players = [];
	for (var index = 0; index < gameplayConfig.userName.length; index ++) {
		var newPlayer = new Player(gameplayConfig.userName[index], 
				gameplayConfig.userColour[index], 
				gameplayConfig.userTeam[index], 
				(gameplayConfig.userName[index] == playerId));
		this.players.push(newPlayer);
		if (gameplayConfig.userName[index] == playerId) {
			this.currentPlayer = newPlayer;
		}
	}
	
	// Save and setup server object
	this.serverAPI = serverAPI;
	
	// Define core phaser objects
	this.mapRender = null;
	this.explosionManager = null;
	this.gameplayConfig = gameplayConfig;
	this.mouse = {x: 0, y: 0};
	
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

	// Load sprite sheets
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TURRET, CONSTANTS.ROOT_SPRITES_LOC + 'turret.png', 100, 100, 13);
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
	this.mapRender = new MapRenderer(this.phaserGame, this.mapGroup, this.mapOverlayGroup, 
			this.gameplayConfig.width, this.gameplayConfig.height, this.gameplayConfig.cells);

	// Construct event listeners
	this.phaserGame.input.onDown.add(this.onMouseClick, this);
	this.phaserGame.input.keyboard.addCallbacks(this, null, null, local_onKeyPressed) ;
	this.phaserGame.input.addMoveCallback(this.onMouseMove, this);
	
}

Engine.prototype.update = function() {

	// Render map
	this.mapRender.renderMap();

	// Render placement overlay
	if (this.phaserGame.newBuilding.active) {
		var colRow = this.mapRender.xyToColRow(this.phaserGame.input.mousePointer.x, this.phaserGame.input.mousePointer.y);
		var canPlace = this.isSquareEmpty(colRow.col, colRow.row);
		this.mapRender.placementHover(colRow.col, colRow.row, canPlace);
	}
	
	// Render test turrets
	for (var index = 0; index < this.buildings.length; index ++) {
		this.buildings[index].update();
	}
	
}


// Input event methods

Engine.prototype.onMouseClick = function(pointer, x, y) {
	
	// Save self reference
	var self = this;
	
	// Render placement overlay
	if (this.phaserGame.newBuilding.active) {
		var colRow = this.mapRender.xyToColRow(this.mouse.x, this.mouse.y);
		var xy = this.mapRender.colRowToXY(colRow.col, colRow.row);
		var canPlace = this.currentPlayer.isSquareEmpty(colRow.col, colRow.row);
		if (canPlace) {
			self.phaserGame.newBuilding.target.setPosition(xy.x, xy.y, colRow.col, colRow.row);
			
			this.serverAPI.requestBuildingPlacement(null, this.phaserGame.newBuilding);
			self.phaserGame.newBuilding.active = false;
			self.mapRender.clearPlacementHover();
			
//			this.serverAPI.requestBuildingPlacement(function(response) {
//				self.phaserGame.newBuilding.active = false;
//				self.phaserGame.newBuilding.target.setBuildingMode(false);
//				self.currentPlayer.placeDefence(self.phaserGame.newBuilding.target);
//				self.mapRender.clearPlacementHover();
//			}, this.phaserGame.newBuilding);
			
		}
	} else {

		for (var index = 0; index < this.buildings.length; index ++) {
			this.buildings[index].rotateAndShoot(this.mouse.x, this.mouse.y);
		}
		
	}
	
}

Engine.prototype.onMouseMove = function(pointer, x, y) {
	
	// Save position information
	this.mouse.x = x;
	this.mouse.y = y;
	
}

Engine.prototype.onKeyPressed = function(char) {

	// Set active building object
	if (char == '1') {
		this.phaserGame.newBuilding.active = true;
		this.phaserGame.newBuilding.target = new Turret(this.phaserGame, this.mapGroup, this.turretGroup,
                this.mapRender.colRowToXY(0, 0),
                0, 0, 100, 100,
                this.explosionManager.requestExplosion, true);
	}

	// Set active building object -phaserRef, -mapGroup, -tankGroup, -xy, width, height, func_explosionRequest
	if (char == '2') {
		this.phaserGame.newBuilding.active = true;
		this.phaserGame.newBuilding.target = new Tank(this.phaserGame, this.mapGroup, this.tankGroup,
                this.mapRender.colRowToXY(0, 0),
                0, 0, 100, 100,
                this.explosionManager.requestExplosion, true);
	}

	if (char == '3') {
		this.processGameplayResponse({
			responseCode: "WAYPOINT_PATH_COORDS",
			coords: [{col: 4, row: 5}, {col: 4, row: 6}, {col: 5, row: 6}],
			source: ["U000", "U000", "U000"],
			target: []
		});
	}

	if (char == '4') {
		new Tank(this.phaserGame, this.mapGroup, this.tankGroup,
                this.mapRender.colRowToXY(0, 0),
                0, 0, 100, 100,
                this.explosionManager.requestExplosion, true);
	}
	
}


// Utility methods

Engine.prototype.isSquareEmpty = function(col, row) {
	for (var index = 0; index < this.buildings.length; index ++) {
		if (this.buildings[index].col == col && this.buildings[index].row == row) {
			return false;
		}
	}
	return true;
}


// Specialised methods for dealing with individual responses

Engine.prototype.processNewBuilding = function(responseData) {
	
	// Iterate through all buildings
	for (var index = 0; index < responseData.source.length; index ++) {
		
		// Create quick reference object
		var refObject = {
				identifier: responseData.source[index], 
				col: responseData.coords[index].col,
				row: responseData.coords[index].row,
			};
		
		// Create XY position from col/row
		var xy = this.mapRender.colRowToXY(refObject.col, refObject.row);
		
		// Construct object for positioning
		var newBuilding = new Turret(this.phaserGame,  this.mapGroup, this.turretGroup, xy, refObject.col, refObject.row, 100, 100, 
				this.explosionManager.requestExplosion, false);
		
		// Add object to building array
		this.buildings.push(newBuilding);
	}
	
}


// Process any server messages and call appropriate functions

Engine.prototype.processGameplayResponse = function(responseData) {
	
	switch(responseData.responseCode) {
	    case "NEW_BUILDING":
	        this.processNewBuilding(responseData);
	        break;
//	    case n:
//	        code block
//	        break;
	    default:
	        // Do nothing
	}
	
}