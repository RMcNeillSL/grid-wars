function Engine(gameplayConfig, playerId) {

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
	
	// Define core phaser objects
	this.mapRender = null;
	this.explosionManager = null;
	this.gameplayConfig = gameplayConfig;
	
	// Define core phaser object arrays
	
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
	
}

Engine.prototype.onMouseClick = function(pointer, x, y) {
	
	// Render placement overlay
	if (this.phaserGame.newBuilding.active) {
		var colRow = this.mapRender.xyToColRow(this.phaserGame.input.mousePointer.x, this.phaserGame.input.mousePointer.y);
		var xy = this.mapRender.colRowToXY(colRow.col, colRow.row);
		var canPlace = this.currentPlayer.isSquareEmpty(colRow.col, colRow.row);
		if (canPlace) {
			this.phaserGame.newBuilding.active = false;
			this.phaserGame.newBuilding.target.setPosition(xy.x, xy.y, colRow.col, colRow.row);
			this.phaserGame.newBuilding.target.setBuildingMode(false);
			this.currentPlayer.placeDefence(this.phaserGame.newBuilding.target);
			this.mapRender.clearPlacementHover();
		}
	} else {

		for (var index = 0; index < this.currentPlayer.turrets.length; index ++) {
			this.currentPlayer.turrets[index].rotateAndShoot(this.phaserGame.input.mousePointer.x, this.phaserGame.input.mousePointer.y);
		}
		
	}
	
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
	
}

Engine.prototype.update = function() {

	// Render map
	this.mapRender.renderMap();

	// Render placement overlay
	if (this.phaserGame.newBuilding.active) {
		var colRow = this.mapRender.xyToColRow(this.phaserGame.input.mousePointer.x, this.phaserGame.input.mousePointer.y);
		var canPlace = this.currentPlayer.isSquareEmpty(colRow.col, colRow.row);
		this.mapRender.placementHover(colRow.col, colRow.row, canPlace);
	}
	
	// Render test turrets
//	this.test_turret.update();
	for (var index = 0; index < this.currentPlayer.turrets.length; index ++) {
		this.currentPlayer.turrets[index].update();
	}
	
//	this.test_turret_2.update();
//	this.test_turret_3.update();
//	this.test_turret_4.update();
//	test_tank.update();
	
}

Engine.prototype.getX = function() {
	
	return this.phaserGame.input.mousePointer.x;
	
}

Engine.prototype.getY = function() {
	
	return this.phaserGame.input.mousePointer.y;
	
}

Engine.prototype.getPhaser = function() {
	return this.phaserEngine;
}