// Constructor

function Engine(gameplayConfig, playerId, serverAPI, func_GameFinished) {
	
	// Mark engine as loading
	this.engineLoading = true;
	this.responseBuffer = [];

	// Create redirecting functions
	var self = this;
	var local_preload = function() { self.preload(); }
	var local_create = function() { self.create(); }
	var local_update = function() { self.update(); }
	var local_render = function() { self.render(); }

	// Create phaser game object
	this.phaserGame = new Phaser.Game(CONSTANTS.GAME_SCREEN_WIDTH, CONSTANTS.GAME_SCREEN_HEIGHT, Phaser.CANVAS,
			'gridwars-engine', {
				preload : local_preload,
				create : local_create,
				update : local_update,
				render : local_render
			});
	
	// Game finishing variables
	this.phaserGame.finished = false;
	this.gameFinishedCallback = func_GameFinished;

	// Introduce dynamic pointer objects
	this.newBuilding = {
		active : false,
		target : null,
		placeCallback : null
	};
	
	// Create user objects
	this.currentPlayer = null;
	this.players = [];
	for (var index = 0; index < gameplayConfig.userName.length; index++) {
		var newPlayer = new Player(gameplayConfig.userName[index],
				gameplayConfig.userColour[index],
				gameplayConfig.userTeam[index],
				(gameplayConfig.userName[index] == playerId),
				gameplayConfig.startingCash);
		this.players.push(newPlayer);
		if (gameplayConfig.userName[index] == playerId) {
			this.currentPlayer = newPlayer;
		}
	}

	// Save and setup server object
	this.serverAPI = serverAPI;

	// Define core phaser objects
	this.engineCore = null;
	this.mapRender = null;
	this.explosionManager = null;
	this.gameplayConfig = gameplayConfig;
	this.mouse = { position : new Point(0, 0) };

	// Define game camera variables
	this.cursors = null;
	
	// Define game object arrays
	this.units = [];
	this.productionUnits = [];
	this.buildings = [];
	
	// Define selection variables
	this.selected = [];
	this.selectedJustSet = false;
	this.selectedLines = [];
	this.selectionRectangle = {
		selectActive : false,
		rect : null,
		originX : 0,
		originY : 0,
		miniMapClickStart : false
	};
	this.middleClickScroll = {
		isActive	: false,
		originX		: 0,
		originY		: 0
	}
	this.rightClickScroll = {
		isActive	: false
	}
	this.hoverItem = null;
	this.tankBuildInProgress = false;		// ROB
	this.turretBuildInProgress = false;

	// Define sprite groups
	this.mapGroup = null;
	this.mapOverlayGroup = null;
	this.turretGroup = null;
	this.buildingGroup = null;
	this.tankGroup = null;
	this.hudGroup = null;

	// Player results
	this.playerResults = [];
}

Engine.prototype.preload = function() {

	// Set system to render even when not active
	this.phaserGame.stage.disableVisibilityChange = true;
	
	// Load game object sprite sheets
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TURRET, CONSTANTS.ROOT_SPRITES_LOC + 'turret.png', 100, 100, 78);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK, CONSTANTS.ROOT_SPRITES_LOC + 'tank.png', 100, 100, 41);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_HUB, CONSTANTS.ROOT_SPRITES_LOC + 'tank_hub.png', 300, 300, 70);

	// Load sprite sheets
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_CURSORS, CONSTANTS.ROOT_SPRITES_LOC + 'cursors.png', 32, 32, 28);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK_TRACKS, CONSTANTS.ROOT_SPRITES_LOC + 'tank_tracks.png', 48, 34, 4);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_IMPACT_DECALS, CONSTANTS.ROOT_SPRITES_LOC + 'impactDecals.png', 50, 50, 4);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_A, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionA.png', 50, 50, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_B, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionB.png', 128, 128, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_C, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionC.png', 120, 120, 20);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_D, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionD.png', 96, 96, 20);
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_PLACEMENT, CONSTANTS.ROOT_SPRITES_LOC + 'tile_selections.png', 100, 100, 4);

	// Load tile images
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_SPRITESHEET, CONSTANTS.ROOT_SPRITES_LOC + 'map_tiles.png', 100, 100, 64);

	// Load particles
	this.phaserGame.load.image(CONSTANTS.PARTICLE_YELLOW_SHOT, CONSTANTS.ROOT_SPRITES_LOC + 'p_yellowShot.png');

	// Load game HUD spritesheets / images
	this.phaserGame.load.image(CONSTANTS.MINI_MAP, CONSTANTS.ROOT_SPRITES_LOC + 'mini_map.png');
	this.phaserGame.load.image(CONSTANTS.UNIT_DETAILS, CONSTANTS.ROOT_SPRITES_LOC + 'unit_details.png');
	this.phaserGame.load.image(CONSTANTS.MINIMAP_MAJARO, CONSTANTS.ROOT_SPRITES_LOC + 'map_items/majaro/minimap.png');
	this.phaserGame.load.image(CONSTANTS.MINIMAP_HUNTING_GROUND, CONSTANTS.ROOT_SPRITES_LOC + 'map_items/hunting_ground/minimap.png');
	this.phaserGame.load.spritesheet(CONSTANTS.MINI_MAP_BUTTONS, CONSTANTS.ROOT_SPRITES_LOC + 'mini_map_buttons.png', 51, 28, 78);
	this.phaserGame.load.spritesheet(CONSTANTS.UNIT_DETAILS_BUTTONS, CONSTANTS.ROOT_SPRITES_LOC + 'unit_details_buttons.png', 36, 38, 9);

	// Load game object icons
	for(var i = 0; i < 6; i++) {
		this.phaserGame.load.image(CONSTANTS.COLOUR["TANK"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/tank_' + CONSTANTS.COLOUR["TANK"][i].COLOUR + '.png');
		this.phaserGame.load.image(CONSTANTS.COLOUR["TURRET"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/turret_' + CONSTANTS.COLOUR["TURRET"][i].COLOUR + '.png');
		this.phaserGame.load.image(CONSTANTS.COLOUR["HUB"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/tank_hub_' + CONSTANTS.COLOUR["HUB"][i].COLOUR + '.png');
	}
}

Engine.prototype.create = function() {
	
	// Create self reference
	var self = this;
	var local_onKeyPressed = 	function(char) 	{ self.onKeyPressed(char); }
	var local_onKeyDown = 		function() 		{ self.onKeyDown(); }
	var local_onKeyUp = 		function() 		{ self.onKeyUp(); }
	
	// Create sprite groups
	this.mapGroup = this.phaserGame.add.group();
	this.mapOverlayGroup = this.phaserGame.add.group();
	this.turretGroup = this.phaserGame.add.group();
	this.buildingGroup = this.phaserGame.add.group();
	this.tankGroup = this.phaserGame.add.group();
	this.hudGroup = this.phaserGame.add.group();
	this.highestGroup = this.phaserGame.add.group();
	
	// Set map dimensions
	this.phaserGame.world.setBounds(0, 0, this.gameplayConfig.width*CONSTANTS.TILE_WIDTH, this.gameplayConfig.height*CONSTANTS.TILE_HEIGHT);
	
	// Initialise key strokes for camera movement
	this.cursors = this.phaserGame.input.keyboard.createCursorKeys();

	// Start physics engine and disable mouse right event
	this.phaserGame.physics.startSystem(Phaser.Physics.P2JS);
	this.phaserGame.canvas.oncontextmenu = function(e) { e.preventDefault(); }

	// Construct explosion manager
	this.explosionManager = new ExplosionManager(this.phaserGame);

	// Construct map renderer
	this.mapRender = new MapRenderer(this.phaserGame, this.mapGroup,
			this.mapOverlayGroup, this.gameplayConfig.width,
			this.gameplayConfig.height, this.gameplayConfig.cells,
			this.phaserGame.width / CONSTANTS.TILE_WIDTH,
			this.phaserGame.height / CONSTANTS.TILE_HEIGHT);

	// Construct event listeners
	this.phaserGame.input.onUp.add(this.onMouseUp, this);
	this.phaserGame.input.onDown.add(this.onMouseDown, this);
	this.phaserGame.input.keyboard.addCallbacks(this, local_onKeyDown, local_onKeyUp, local_onKeyPressed);
	this.phaserGame.input.addMoveCallback(this.onMouseMove, this);
	
	// Construct selection rectangle
	this.selectionRectangle.rect = new Phaser.Rectangle(0, 0, 100, 100);
	
	// Range renderer graphics object
	this.rangeCircles = this.phaserGame.add.graphics(0, 0);
	
	// Populate selection lines
	for (var count = 0; count < 4; count ++) { this.selectedLines.push(new Phaser.Line(0, 0, 0, 0)); }
	
	// Construct engine core values for unit/building/defence construction
	this.engineCore = {
		phaserEngine : this.phaserGame,
		func_RequestExplosion : function(mapGroup, explosionId, ownerId, explosionInstanceId, x, y) {
			self.explosionManager.requestExplosion(mapGroup, explosionId, ownerId, explosionInstanceId, x, y)
		},
		func_UpdateNewUnitCell : function(sender, oldCell, newCell) {
			self.updateNewUnitCell(sender, oldCell, newCell);
		},
		func_PlaceTankTrack : function(sender, point, angle) {
			self.mapRender.placeTankTrack(self.mapGroup, sender, point, angle);
		},
		func_GetObjectFromInstanceId : function(instanceId) {
			return self.getObjectFromInstanceId(instanceId);
		}
	};
	
	// Draw the gameframe
	this.createGameScreen();

	// Create cursor object
	this.pointer = { sprite : null, point : new Point(0, 0) };
	this.pointer.sprite = this.phaserGame.add.sprite(0, 0, CONSTANTS.SPRITE_CURSORS, 0);
	this.pointer.sprite.z = 100;
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_NORMAL, 		CONSTANTS.CURSOR_SPRITE_NORMAL, 		30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_NORMAL_ENEMY, 	CONSTANTS.CURSOR_SPRITE_NORMAL_ENEMY, 	30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_INVALID, 		CONSTANTS.CURSOR_SPRITE_INVALID, 		30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_ATTACK, 		CONSTANTS.CURSOR_SPRITE_ATTACK, 		30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_FORCE_ATTACK, 	CONSTANTS.CURSOR_SPRITE_FORCE_ATTACK, 	30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_MOVE, 			CONSTANTS.CURSOR_SPRITE_MOVE, 			30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_MOVE_CLICK, 	CONSTANTS.CURSOR_SPRITE_MOVE_CLICK, 	30, true);
	this.pointer.sprite.animations.play(CONSTANTS.CURSOR_NORMAL);
	this.highestGroup.add(this.pointer.sprite);

	// Position camera over spawn point
	for (var index = 0; index < this.players.length; index++) {
		if (this.players[index].playerId == this.currentPlayer.playerId) {
			this.spawnPoint = new Cell(this.gameplayConfig.spawnCoordinates[index].col,
					this.gameplayConfig.spawnCoordinates[index].row);
			console.log("Player spawn: (" + this.spawnPoint.col + "," + this.spawnPoint.row + ")");
			this.positionCameraOverCell(this.spawnPoint);
			break;
		}
	}

	// Mark engine as loaded
	this.engineLoading = false;
}

Engine.prototype.update = function() {

	// Process any responses in buffer
	if (!this.engineLoading && this.responseBuffer && this.responseBuffer.length > 0) {
		this.processGameplayResponse(this.responseBuffer.splice(0, 1)[0]);
	}
	
    // Manage scrolling of the map
    this.manageMapMovement();

	// Render map
	this.mapRender.renderMap();

	// Render placement overlay
	if (this.newBuilding.active) {
		var cell = this.mouse.position.toCell();
		var canPlace = this.isSquareEmpty(cell.col, cell.row);
		// build cells within range here

		this.mapRender.clearPlacementHover();
		this.mapRender.placementHover(cell, canPlace, this.getCellsWithinBuildRangeOfHub());
	}

	// Update all buildings and units
	for (var index = 0; index < this.buildings.length; index++) { this.buildings[index].update(); }
	for (var index = 0; index < this.units.length; index++) { this.units[index].update(); }
	for (var index = 0; index < this.productionUnits.length; index++) { this.productionUnits[index].update(); }

	// Search for collisions between fireable objects
	this.explosionCollisionCheck();

	if (this.middleClickScroll.isActive) {
		if (this.middleClickScroll.originX < (this.mouse.position.x - this.phaserGame.camera.x)) {
			this.phaserGame.camera.x += Math.abs(((this.mouse.position.x - this.phaserGame.camera.x) - this.middleClickScroll.originX))/30;
		}
		if (this.middleClickScroll.originX > (this.mouse.position.x - this.phaserGame.camera.x)) {
			this.phaserGame.camera.x -= Math.abs(((this.mouse.position.x - this.phaserGame.camera.x) - this.middleClickScroll.originX))/30;
		}
		if (this.middleClickScroll.originY < (this.mouse.position.y - this.phaserGame.camera.y)) {
			this.phaserGame.camera.y += Math.abs(((this.mouse.position.y - this.phaserGame.camera.y) - this.middleClickScroll.originY))/30;
		}
		if (this.middleClickScroll.originY > (this.mouse.position.y - this.phaserGame.camera.y)) {
			this.phaserGame.camera.y -= Math.abs(((this.mouse.position.y - this.phaserGame.camera.y) - this.middleClickScroll.originY))/30;
		}
	}
	this.mouse.position = new Point(this.phaserGame.camera.x + this.phaserGame.input.mousePointer.x,
			this.phaserGame.camera.y + this.phaserGame.input.mousePointer.y);

	// Update pointer position
	this.updatePointerPosition();

//	// Get state of players in game
//	if (!this.phaserGame.finished) { this.updatePlayerStatus(); }
}

Engine.prototype.render = function() {
	// Create self reference
	var self = this;

	// Render selection rectangle to scene
	if (this.selectionRectangle.selectActive) {
		this.phaserGame.debug.geom(this.selectionRectangle.rect, 'rgba(0,100,0,0.3)');
	}
	
	// Function to generate/display health for game objects
	var outputUnitHealth = function(targetUnit, healthColour, remainingColour, healthOutline, healthIntervalColour) {

		// Generate health drawing bounds
		var workingHealthBounds = targetUnit.getHealthRenderBounds();
		var healthPercent = (targetUnit.gameCore.health * 1.0) / (targetUnit.gameCore.maxHealth * 1.0);

		// Setup health width effected variables
		var healthBarBounds = {
			top : workingHealthBounds.top,
			bottom : workingHealthBounds.bottom,
			left : targetUnit.left - workingHealthBounds.healthWidth / 2,
			right : targetUnit.left + workingHealthBounds.healthWidth / 2,
			width : workingHealthBounds.healthWidth,
			height : workingHealthBounds.height
		};
		
		// Output health measure
		var healthRect = new Phaser.Rectangle(healthBarBounds.left,
				healthBarBounds.top,
				healthBarBounds.width * healthPercent,
				healthBarBounds.height);
		self.phaserGame.debug.geom(healthRect, healthColour);
		var remainingRect = new Phaser.Rectangle(
				healthBarBounds.left + healthBarBounds.width * healthPercent,
				healthBarBounds.top,
				healthBarBounds.width * (1-healthPercent),
				healthBarBounds.height);
		self.phaserGame.debug.geom(remainingRect, remainingColour);

		// Output health interval lines
		for (var lineX = healthBarBounds.left; lineX < healthBarBounds.left + healthBarBounds.width * healthPercent; lineX += healthBarBounds.height) {
			var healthLine = new Phaser.Line(lineX, healthBarBounds.top, lineX, healthBarBounds.bottom);
			self.phaserGame.debug.geom(healthLine, healthIntervalColour);
		}
		
		// Update line positions
		self.selectedLines[0].setTo(healthBarBounds.left,  healthBarBounds.top, 	healthBarBounds.right, 	healthBarBounds.top);
		self.selectedLines[1].setTo(healthBarBounds.left,  healthBarBounds.bottom, 	healthBarBounds.right, 	healthBarBounds.bottom);
		self.selectedLines[2].setTo(healthBarBounds.left,  healthBarBounds.top, 	healthBarBounds.left, 	healthBarBounds.bottom);
		self.selectedLines[3].setTo(healthBarBounds.right, healthBarBounds.top, 	healthBarBounds.right, 	healthBarBounds.bottom);
		
		// Output lines to screen
		self.phaserGame.debug.geom(self.selectedLines[0], healthOutline);
		self.phaserGame.debug.geom(self.selectedLines[1], healthOutline);
		self.phaserGame.debug.geom(self.selectedLines[2], healthOutline);
		self.phaserGame.debug.geom(self.selectedLines[3], healthOutline);
	}

	// Render selection boxes around selected units to scene
	if (this.selected && this.selected.length > 0) {
		for (var selectedIndex = 0; selectedIndex < this.selected.length; selectedIndex ++) {

			// Draw health bars over selected items
			outputUnitHealth(this.selected[selectedIndex], 'rgba(0,100,0,1)', 'rgba(0,0,0,1)', 'rgba(150,150,150,1)', 'rgba(200,255,200,1)');

			// Draw range circles for selected defences and units
			if (this.selected[selectedIndex].gameCore.range) {
				this.phaserGame.debug.geom(new Phaser.Circle(this.selected[selectedIndex].left, this.selected[selectedIndex].top, this.selected[selectedIndex].gameCore.range * 2), 'rgba(255,255,255,0.4)', false);
			}
		}
	}

	// Render hover object healthbox
	if (this.hoverItem) {
		outputUnitHealth(this.hoverItem, 'rgba(0,100,0,0.5)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)', 'rgba(0,55,0,0.5)');
	}
	
	// Create references for minimap cell width and height
	var miniMapCellWidth = (this.minimap.width * 1.0 / this.mapRender.width);
	var miniMapCellHeight = (this.minimap.height * 1.0 / this.mapRender.height);
	
	// Run through all objects outputting square for each
	var potentialObstructions = this.buildings.concat(this.units);
	for (var index = 0; index < potentialObstructions.length; index ++) {
		if (potentialObstructions[index].gameCore.playerId == this.currentPlayer.playerId) {
			var cells = potentialObstructions[index].gameCore.getCells();
			for (var cellIndex = 0; cellIndex < cells.length; cellIndex ++) {
				
				this.phaserGame.debug.geom(new Phaser.Rectangle(
						this.minimap.x + cells[cellIndex].col * miniMapCellWidth,
						this.minimap.y + cells[cellIndex].row * miniMapCellHeight,
						miniMapCellWidth, miniMapCellHeight), 'rgba(' + this.currentPlayer.RGB.red + ',' + this.currentPlayer.RGB.green + ',' + this.currentPlayer.RGB.blue + ',0.5)');
			}
		}
	}

	// Render current map square in minimap
	this.miniMapViewRectangle.x = this.minimap.x + (this.phaserGame.camera.x / 100) * miniMapCellWidth;
	this.miniMapViewRectangle.y = this.minimap.y + (this.phaserGame.camera.y / 100) * miniMapCellHeight;
	this.phaserGame.debug.geom(this.miniMapViewRectangle, 'rgba(255,255,255,1)', false);
}


// ------------------------------ INPUT EVENT METHODS ------------------------------ //

Engine.prototype.onMouseDown = function(pointer) {

	// Search for potential under mouse selection
	var itemAtPoint = this.getItemAtPoint(this.mouse.position, true, false);

	// Set new selection if one does not already exist
	if (itemAtPoint) {
		this.selected = [itemAtPoint];
		this.selectedJustSet = true;
		this.updateSelectedGameObjectDetails(itemAtPoint);
	}
	
	if (pointer.middleButton.isDown) {
		this.middleClickScroll.isActive = true;
	}
	
	if (pointer.rightButton.isDown) {
		this.rightClickScroll.isActive = false;
	}

	// Check if mouse down occured over minimap
	this.selectionRectangle.miniMapClickStart = this.isPointOverMinimap(this.mouse.position);
}

Engine.prototype.onMouseUp = function(pointer) {
	
	// Break if new unit has just been selected
	if (this.selectedJustSet) {
		this.selectedJustSet = false;
		return;
	}

	// Check for key press
	var ctrlDown = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.CONTROL);
	var shiftDown = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.SHIFT);

	// Positional values for cell and xy
	var point = this.mouse.position;
	var mouseCell = point.toCell();
	
	// Flag for general pointer actions handled
	var clickHandled = false;

	// Perform checks for left click
	if (pointer.leftButton.isDown) {
		
		// Check if clicking on a new location on the map first
		if (this.isPointOverMinimap(point)) {

			// Jump to cell at point
			this.moveToMinimapClick(new Point(point.x - this.minimap.left, point.y - this.minimap.top));
			
		// Create new building
		} else if (this.newBuilding.active) {

			// Render placement overlay
			if (this.isSquareEmpty(mouseCell.col, mouseCell.row) && this.isSquareWithinBaseRange(mouseCell.col, mouseCell.row)) {
				this.newBuilding.target.setPosition(mouseCell);
				this.serverAPI.requestBuildingPlacement(this.newBuilding);
				this.newBuilding.active = false;
				this.mapRender.clearPlacementHover();
			}

		// Manage selected units
		} else if (this.selected.length > 0) {

			// Calculate item at point
			var enemyAtPoint = this.getItemAtPoint(point, false, true);
			var friendlyAtPoint = this.getItemAtPoint(point, true, true);
			
			// Object reference variables
			var objectRef = null;
			var objectType = null;
			var objectInstanceId = null;
			
			// Group API request objects
			var unitsForMoveRequest = [];
			
			// Flags for object click event
			var cellEmpty = this.isSquareEmpty(mouseCell.col, mouseCell.row);

			// Process selected items
			for (var selectedIndex = 0; selectedIndex < this.selected.length; selectedIndex++) {
				
				// Identify type of unit and create reference
				objectRef = this.selected[selectedIndex];
				objectType = CONSTANTS.getObjectType(objectRef.gameCore.identifier);
				objectInstanceId = objectRef.gameCore.instanceId;
				
				// Make sure self is defined
				if (objectRef) {
					
					// Process for units
					if (objectType == "UNIT") {
						if (cellEmpty && ctrlDown) 		{ clickHandled = true;	 } //targetUnit.shootAtXY(point); }
						if (cellEmpty && !ctrlDown) 	{ clickHandled = true; 	unitsForMoveRequest.push(objectRef); } 
						if (!cellEmpty && enemyAtPoint) { clickHandled = true; 	this.serverAPI.requestObjectAttackObject(objectInstanceId, enemyAtPoint.gameCore.instanceId); }
					}
					
					// Process for buildings
					if (objectType == "BUILDING") { }
					
					// Process for defences
					if (objectType == "DEFENCE") {
						if (enemyAtPoint) 				{ clickHandled = true;	this.serverAPI.requestObjectAttackObject(objectInstanceId, enemyAtPoint.gameCore.instanceId); }
//						if (ctrlDown && !enemyAtPoint && !friendlyAtPoint) {
//							clickHandled = true;
//							this.selected[selectedIndex].shootAtXY(point);
////							this.serverAPI.requestDefenceAttackXY([this.selected[selectedIndex]], this.mouse.position.x, this.mouse.position.y);
//						}
					}
				}
			}
			
			// Process any units waiting for move request - generate set of end cells
			if (unitsForMoveRequest.length > 0) { this.moveUnitGroup(unitsForMoveRequest, mouseCell); }
				
			// Deselect selection if selected building and player clicks away - clickHandled to prevent alternat building specific options
			if (!clickHandled && !enemyAtPoint && !friendlyAtPoint) { this.selected = []; }

		// Select units/buildings under mouseXY
		} else {
			
			// Determine item at point
			var itemAtPoint = this.getItemAtPoint(point, true, false);

			// Add to reset select list
			if (itemAtPoint) {
				if (shiftDown) {
					this.selected.push(itemAtPoint);
				} else {
					this.selected = [itemAtPoint];
				}
			}
			
			// Clear selected objects
			if(this.selected.length < 1) {
				 this.updateSelectedGameObjectDetails(null);
			}
		}
	}
	
	if (pointer.middleButton.isDown) {
		this.middleClickScroll.isActive = false;
	}

	// Perform checks for right click
	if (!clickHandled && pointer.rightButton.isDown) {
		if (!this.rightClickScroll.isActive) {
			this.selected = [];
			this.setGameObjectDetailsVisibility(false);
		} else {
			this.rightClickScroll.isActive = false;
		}
	}
	
	// Release mark as mouse down overminimap
	this.selectionRectangle.miniMapClickStart = false;
}

Engine.prototype.onMouseMove = function(pointer, x, y) {

	// Update pointer position
	this.updatePointerPosition();

	// Process updates for selection rectangle
	if (pointer.isDown && pointer.leftButton.isDown) {
		
		// Check if clicking on a new location on the map first
		if (this.isPointOverMinimap(this.mouse.position)) {

			// Jump to cell at point
			this.moveToMinimapClick(new Point(this.mouse.position.x - this.minimap.left, this.mouse.position.y - this.minimap.top));
			
		} else if (!this.selectionRectangle.miniMapClickStart) {

			// Reset selected items
			if (this.selectionRectangle.selectActive
					&& Math.abs(this.selectionRectangle.rect.width
							* this.selectionRectangle.rect.height) > 40) {
				this.selected = [];
				this.hoverItem = null;
			}

			// Set new rectangle selection coordinates
			this.selectionRectangle.selectActive = true;
			this.selectionRectangle.rect.width = (this.mouse.position.x - this.selectionRectangle.originX);
			this.selectionRectangle.rect.height = (this.mouse.position.y - this.selectionRectangle.originY);
		}
	} else if (pointer.rightButton.isDown) {
		x = this.phaserGame.camera.x + this.phaserGame.input.mousePointer.x;
		y = this.phaserGame.camera.y + this.phaserGame.input.mousePointer.y;
		this.rightClickScroll.isActive = true;

		if (x < this.mouse.position.x) {
			this.phaserGame.camera.x += CONSTANTS.CAMERA_SPEED;
		}
		if (x > this.mouse.position.x) {
			this.phaserGame.camera.x -= CONSTANTS.CAMERA_SPEED;
		}
		if (y < this.mouse.position.y) {
			this.phaserGame.camera.y += CONSTANTS.CAMERA_SPEED;
		}
		if (y > this.mouse.position.y) {
			this.phaserGame.camera.y -= CONSTANTS.CAMERA_SPEED;
		}

		this.mouse.position = new Point(this.phaserGame.camera.x + this.phaserGame.input.mousePointer.x,
				this.phaserGame.camera.y + this.phaserGame.input.mousePointer.y);

	} else {
		// Run search for any selected units
		if (this.selectionRectangle.selectActive
				&& Math.abs(this.selectionRectangle.rect.width
						* this.selectionRectangle.rect.height) > 40) {
			this.selected = this.getSelectionArray();
			
			if(this.selected.length === 1) {
				this.updateSelectedGameObjectDetails(this.selected[0]);
			}
		}

		// Mark selection as not active and reset
		this.selectionRectangle.selectActive = false;
		this.selectionRectangle.rect.x = this.mouse.position.x;
		this.selectionRectangle.rect.y = this.mouse.position.y;
		this.selectionRectangle.originX = this.mouse.position.x;
		this.selectionRectangle.originY = this.mouse.position.y;
		this.selectionRectangle.rect.width = 0;
		this.selectionRectangle.rect.height = 0;

		this.rightClickScroll.isActive = false;

		if(!this.middleClickScroll.isActive) {
			this.middleClickScroll.originX = this.mouse.position.x - this.phaserGame.camera.x;
			this.middleClickScroll.originY = this.mouse.position.y - this.phaserGame.camera.y;
		}

		// Select hover items
		this.hoverItem = this.getItemAtPoint(this.mouse.position, true, true);
		if (this.hoverItem) {
			for (var index = 0; index < this.selected.length; index ++) {
				if (this.selected[index].gameCore.instanceId == this.hoverItem.gameCore.instanceId) {
					this.hoverItem = null;
					break;
				}
			}
		}
	}

	// Process updates for mouse
	this.processMouseFormUpdates();
}

Engine.prototype.onKeyPressed = function(char) {

	// Set active building object
	if (char == '1') {
		if (!this.turretBuildInProgress) {
			this.purchaseObject("TURRET"); 
		}
	}

	// Submit request for tank purchase
	if (char == '2') {
		if(!this.tankBuildInProgress) {
			this.purchaseObject("TANK");
		}
	}
	
	// Process mouse form updates
	this.processMouseFormUpdates();
}

Engine.prototype.onKeyDown = function() {
	
	// Process mouse form update
	this.processMouseFormUpdates();
}

Engine.prototype.onKeyUp = function() {
	
	// Process mouse form update
	this.processMouseFormUpdates();
}


//------------------------------ CREATION/DESTRUCTION METHODS ------------------------------ //

Engine.prototype.registerNewGameObject = function(gameObject) {
	
	// Check game object type
	var objectType = CONSTANTS.getObjectType(gameObject.gameCore.identifier);
	
	// Perform correct array addition
	if (objectType == "DEFENCE" || objectType == "BUILDING") {
		this.buildings.push(gameObject);
	} else if (objectType == "UNIT") {
		this.units.push(gameObject);
	}
}

Engine.prototype.deleteItemWithInstanceId = function(instanceId) {

	// Define working variables
	var searchObject = null;
	
	// Search through selected items
	for (var selectedIndex = 0; selectedIndex < this.selected.length; selectedIndex ++) {
		if (this.selected[selectedIndex].gameCore.instanceId == instanceId) {
			searchObject = this.selected[selectedIndex];
			this.selected.splice(selectedIndex, 1);
			break;
		}
	}
	
	// Check hover item
	if (this.hoverItem && this.hoverItem.gameCore.instanceId == instanceId) {
		this.hoverItem = null;
	}

	// Locate and remove item from units/buildings list
	for (var unitIndex = 0; unitIndex < this.units.length; unitIndex++) {
		if (this.units[unitIndex].gameCore.instanceId == instanceId) {
			searchObject = this.units[unitIndex];
			this.units.splice(unitIndex, 1);
			break;
		}
	}
	for (var buildingIndex = 0; buildingIndex < this.buildings.length; buildingIndex++) {
		if (this.buildings[buildingIndex].gameCore.instanceId == instanceId) {
			searchObject = this.buildings[buildingIndex];
			this.buildings.splice(buildingIndex, 1);
			break;
		}
	}

	// Delete the object
	if (searchObject) {
		searchObject.destroy();
	}
}

Engine.prototype.updateNewUnitCell = function(sender, oldCell, newCell) { // Old cell is not currently used - may check to make sure request is not corrupt

	// Check if sender is unit owner
	if (sender.gameCore.playerId == this.currentPlayer.playerId) {

		// Submit update message to server
		this.serverAPI.requestUpdateUnitCell(sender, newCell);

		// Debugging output
		// console.log("UpdateCell (" + newCell.col + "," + newCell.row + ")");
	}

}


// ------------------------------ UTILITY METHODS ------------------------------ //

Engine.prototype.moveUnitGroup = function(unitArray, targetCell) {
	
	// Make sure units exist for processing
	if (unitArray.length > 0) {

		// Working variables
		var targetCells = [new Cell(targetCell.col, targetCell.row)];
		
		// Possible cell class
		var PossibleCell = function(col, row, distance) {
			this.cell = new Cell(col, row);
			this.distance = distance;
		}
		
		// Generate usable cells list			-- optimise by using target cell (+-)searchRegion and increase if not enough cells for units have been found
		var possibleCells = [];
		for (var searchRow = 0; searchRow < this.mapRender.height; searchRow ++) {
			for (var searchCol = 0; searchCol < this.mapRender.width; searchCol ++) {
				if (this.isSquareEmpty(searchCol, searchRow) &&
						!(searchCol == targetCell.col && searchRow == targetCell.row)) {
					possibleCells.push(new PossibleCell(searchCol, searchRow, targetCell.distanceToCell(searchCol, searchRow)));
				}
			}
		}
		possibleCells.sort(function (cellA, cellB) { return cellA.distance - cellB.distance; });
		
//		// Output ordered list of all possible cells
//		for (var index = 0; index < possibleCells.length; index ++) {
//			console.log("(" + possibleCells[index].cell.col + "," + possibleCells[index].cell.row + ") - " + possibleCells[index].distance);
//		}
		
		// Generate list of cells for each unit to move to
		for (var unitIndex = 1; unitIndex < unitArray.length; unitIndex ++) {
			targetCells.push(possibleCells[0].cell);
			possibleCells.splice(0, 1);
		}
		
		// Submit request for unit movement
		this.serverAPI.requestUnitMoveCell(unitArray, targetCells);
	}

}

Engine.prototype.purchaseObject = function(objectId) {
	
	// Get current cell over
	var cell = this.mouse.position.toCell();
	
	// Define new request objects
	var newBuildingCore = null;
	var newUnitCore = null;

	// Create building objects for tanks
	switch (objectId) {
		case "TURRET":
			var newDefenceCore = new GameCore(objectId, cell);
			newDefenceCore.setPlayer(this.currentPlayer);
			this.serverAPI.purchaseRequest(newDefenceCore);
			this.turretBuildInProgress = true;
			break;
		case "TANK":
			newUnitCore = new GameCore(objectId, cell);
			newUnitCore.setPlayer(this.currentPlayer);
			this.serverAPI.purchaseRequest(newUnitCore);
			this.tankBuildInProgress = true;
			break;
	}
	
	// Check submit request for purchase
	if (newBuildingCore) { }
	if (newUnitCore) { }
}

Engine.prototype.processMouseFormUpdates = function() {

	// Selected flags
	var nothingSelected = false;
	var unitSelected = false;
	var defenceSelected = false;
	var buildingSelected = false;

	// Get current cell over
	var cell = this.mouse.position.toCell();

	// Check type of selection occuring
	if (this.selected.length == 0) {
		nothingSelected = true;
	} else if (this.selected.length == 1) {
		if (this.selected[0].gameCore.isUnit) {
			unitSelected = true;
		} else {
			if (this.selected[0].gameCore.isDefence) {
				defenceSelected = true;
			} else {
				buildingSelected = true;
			}
		}
	} else if (this.selected.length > 1) {
		unitSelected = true;
	}
	
	// Gather information about item under mouse
	var itemAtPoint = this.getItemAtPoint(this.mouse.position, true, true);
	
	// Get ctrl state
	var ctrlState = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.CONTROL);
	
	// Update pointer form function
	var self = this;
	var updatePointerForm = function(formId) {
		self.pointer.sprite.animations.play(formId);
	}
	
	// Process selection for nothing
	if (nothingSelected) {
		if (!itemAtPoint || itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
			updatePointerForm(CONSTANTS.CURSOR_NORMAL);
		} else {
			updatePointerForm(CONSTANTS.CURSOR_NORMAL_ENEMY);
		}
	}
	
	// Process selection for unit
	if (unitSelected) {
		if (!itemAtPoint) {
			if (ctrlState) {
				updatePointerForm(CONSTANTS.CURSOR_FORCE_ATTACK);
			} else {
				if (this.mapRender.isCellObstructed(cell)) {
					updatePointerForm(CONSTANTS.CURSOR_INVALID);
				} else {
					updatePointerForm(CONSTANTS.CURSOR_MOVE);
				}
			}
		} else {
			if (itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
				updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			} else {
				updatePointerForm(CONSTANTS.CURSOR_ATTACK);
			}
		}
	}

	// Process selection for defence
	if (defenceSelected) {
		if (itemAtPoint) {
			if (itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
				updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			} else {
				updatePointerForm(CONSTANTS.CURSOR_ATTACK);
			}
		} else {
			if (ctrlState) {
				updatePointerForm(CONSTANTS.CURSOR_FORCE_ATTACK);
			} else {
				updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			}
		}
	}
	
	// Process selection for building
	if (buildingSelected) {
		
	}
}

Engine.prototype.updatePointerPosition = function(point) {
	
	// Check if point was passed (default to cursor)
	if (!point) { point = this.mouse.position; }
	
	// Position sprite at mouse point
	this.pointer.sprite.x = point.x;
	this.pointer.sprite.y = point.y;
}

Engine.prototype.positionCameraOverCell = function(cell) {
	
	// Calculate map bounds
	var mapBound = { x: this.mapRender.screenCellWidth / 2, y : this.mapRender.screenCellHeight / 2 };
	
	// Calculate centre cell
	var moveAmount = { x: Math.min(this.mapRender.width - mapBound.x + (CONSTANTS.TILE_WIDTH / 2), Math.max(cell.col - mapBound.x, 0)),
					   y: Math.min(this.mapRender.height - mapBound.y + (CONSTANTS.TILE_HEIGHT / 2), Math.max(cell.row - mapBound.y, 0)) };
	
	// Move camera to centralise cell
	this.phaserGame.camera.x = (moveAmount.x * CONSTANTS.TILE_WIDTH);
	this.phaserGame.camera.y = (moveAmount.y * CONSTANTS.TILE_HEIGHT);
}

Engine.prototype.manageMapMovement = function() {

	// Update camera with up, down, left and right keys
	if (this.cursors.up.isDown) { this.phaserGame.camera.y -= CONSTANTS.CAMERA_SPEED; }
	if (this.cursors.down.isDown) { this.phaserGame.camera.y += CONSTANTS.CAMERA_SPEED; }
	if (this.cursors.left.isDown) { this.phaserGame.camera.x -= CONSTANTS.CAMERA_SPEED; }
	if (this.cursors.right.isDown) { this.phaserGame.camera.x += CONSTANTS.CAMERA_SPEED; }
	
	// Update mouse values
	this.mouse.position = new Point(this.phaserGame.camera.x + this.phaserGame.input.mousePointer.x,
			this.phaserGame.camera.y + this.phaserGame.input.mousePointer.y);
	
	// Process updates for new map position
	this.updatePointerPosition();
}

Engine.prototype.getButtonAndConstants = function(gameObject) {

	// Identify button to run animation on
	var isUnit = (CONSTANTS.GAME_UNITS.indexOf(gameObject) > -1);
	var isBuilding = (CONSTANTS.GAME_BUILDINGS.indexOf(gameObject) > -1 && (!gameObject.damage));
	var isDefence = (CONSTANTS.GAME_BUILDINGS.indexOf(gameObject) > -1 && (gameObject.damage));

	// Set button to animate
	var animateButton, hudConstants = null;
	if (isUnit) { animateButton = this.tankButton; hudConstants = CONSTANTS.HUD.MAP_CONTROL.UNIT; }
	if (isDefence) { animateButton = this.defenceButton; hudConstants = CONSTANTS.HUD.MAP_CONTROL.DEFENCE; }
	if (isBuilding) { animateButton = this.homeButton; hudConstants = CONSTANTS.HUD.MAP_CONTROL.BUILDING; }
	
	return { animateButton: animateButton, hudConstants: hudConstants };
}

Engine.prototype.startBuildingAnimation = function(gameObject) {

	// Get button and constant data
	var buttonData = this.getButtonAndConstants(gameObject);
	
	// Check if button is defined and run appropriate animation
	if (buttonData.animateButton && buttonData.hudConstants) {
		var frameInterval = ((gameObject.buildTime * 1.0) / buttonData.hudConstants.BUILDING.length);
		buttonData.animateButton.play(buttonData.hudConstants.A_BUILDING, 1000 / frameInterval, false);
	}
}

Engine.prototype.stopBuildingAnimation = function(newObject) {

	// Get button and constant data
	var gameObject = this.getObjectFromIdentifier(newObject.gameCore.identifier);
	var buttonData = this.getButtonAndConstants(gameObject);
	
	// Stop all animations returning to unselected state
	buttonData.animateButton.animations.stop(buttonData.hudConstants.A_BUILDING, buttonData.hudConstants.UNSELECTED);
	buttonData.animateButton.animations.stop(buttonData.hudConstants.A_READY, buttonData.hudConstants.UNSELECTED);
	
	buttonData.animateButton.frame = buttonData.hudConstants.UNSELECTED;
}

Engine.prototype.isPointOverMinimap = function(checkPoint) {
	return (checkPoint.x >= this.minimap.left && checkPoint.x <= this.minimap.right &&
			checkPoint.y >= this.minimap.top && checkPoint.y <= this.minimap.bottom);
}

Engine.prototype.moveToMinimapClick = function(miniMapPoint) {

	// Calculate cell under mouse on map
	var minimapCellWidth = this.minimap.width * 1.0 / this.mapRender.width;
	var minimapCellHeight = this.minimap.height * 1.0 / this.mapRender.height;
	var cellAtMouse = new Cell(Math.floor(miniMapPoint.x / minimapCellWidth),
			Math.floor(miniMapPoint.y / minimapCellHeight));
	
	// Jump to cell at point
	this.positionCameraOverCell(cellAtMouse);
}

Engine.prototype.createGameScreen = function() {

	// Create references to points on screen
	var mapLeft = CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.HUD.MAP_CONTROL.WIDTH;
	var unitLeft = CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.HUD.OBJECT_CONTROL.WIDTH;
	var unitTop = CONSTANTS.GAME_SCREEN_HEIGHT - CONSTANTS.HUD.OBJECT_CONTROL.HEIGHT;

	// Create reference to this
	var self = this;
	
	// Create game button
	var createGameButton = function(spriteInfo, owner, left, top) {
		
		// Calculate sprite information
		var left = left + spriteInfo.LEFT * owner.WIDTH;
		var top = top + spriteInfo.TOP * owner.HEIGHT;
		var width = spriteInfo.WIDTH * owner.WIDTH;
		var height = spriteInfo.HEIGHT * owner.HEIGHT;
		
		// Create sprite variable
		var newButton = self.phaserGame.add.sprite(left, top, CONSTANTS.MINI_MAP_BUTTONS);
		
		// Setup common sprite settings
		newButton.frame = spriteInfo.UNSELECTED;
		newButton.fixedToCamera = true;
		newButton.z = 92;
		newButton.inputEnabled = true;
		newButton.width = width;
		newButton.height = height;
		
		// Return constructed sprite
		return newButton;
	};
	var createMapGameButton = function(spriteData) {
		
		// Create button from generic button creation method
		var newButton = createGameButton(spriteData, CONSTANTS.HUD.MAP_CONTROL, mapLeft, 0);

		// Declare animations
		var buildingAnim = newButton.animations.add(spriteInfo.A_BUILDING, spriteInfo.BUILDING);
		var buildingComplete = newButton.animations.add(spriteInfo.A_READY, [spriteInfo.UNSELECTED, spriteInfo.SELECTED], 4, true);
		
		// Declare animation events
		buildingAnim.onComplete.add(function(sprite, animation) {
			buildingComplete.play();
		});

		// Add listner events
		newButton.events.onInputOver.add(function() {
			
			// Get state of button animation
			var buildingPlaying = buildingAnim.isPlaying;
			var completePlaying = buildingComplete.isPlaying;
			
			// DO NOT interrupt button animation when building
			if (!buildingPlaying && !completePlaying ) { newButton.frame = spriteInfo.SELECTED; }
		});
		newButton.events.onInputOut.add(function() {
			
			// Get state of button animation
			var buildingPlaying = buildingAnim.isPlaying;
			var completePlaying = buildingComplete.isPlaying;
			
			// DO NOT interrupt button animation when building
			if (!buildingPlaying && !completePlaying ) { newButton.frame = spriteInfo.UNSELECTED; }
		});
		newButton.events.onInputUp.add(function() {
			
			// Get state of button animation
			var buildingPlaying = buildingAnim.isPlaying;
			var completePlaying = buildingComplete.isPlaying;
			
			// Run functions for when button is complete
			if (!buildingPlaying && completePlaying) {
				if (spriteInfo == CONSTANTS.HUD.MAP_CONTROL.DEFENCE) {
					
					// Calculate instanceId from button type
					var purchase = self.currentPlayer.getPurchaseFromObjectType("DEFENCE");
					
					// Make sure a purchase was found and complete
					if (purchase && purchase.buildFinished) {
						
						// Construct gameCore object
						var gameCore = new GameCore(purchase.identifier, self.mouse.position.toCell());
						gameCore.setPlayer(self.currentPlayer);
						gameCore.setInstanceId(purchase.instanceId);
						
						// Create turret plant object
						self.newBuilding.active = true;
						self.newBuilding.target = new Turret(self.engineCore, gameCore,
								self.mapGroup, self.turretGroup, gameCore.cell.toPoint(),
								gameCore.cell.col, gameCore.cell.row, 100, 100, true);
						self.newBuilding.placeCallback = function() {
							buildingAnim.stop();
							buildingComplete.stop();
							newButton.frame = spriteInfo.UNSELECTED;
						}
					}
				}
			}
			
			// Run functions when button is idle
			if (!buildingPlaying && !completePlaying) {
				if (spriteInfo == CONSTANTS.HUD.MAP_CONTROL.BUILDING) 	{ self.positionCameraOverCell(self.spawnPoint); }
				if (spriteInfo == CONSTANTS.HUD.MAP_CONTROL.DEFENCE) 	{ self.purchaseObject("TURRET"); }
				if (spriteInfo == CONSTANTS.HUD.MAP_CONTROL.UNIT) 		{ self.purchaseObject("TANK"); }
			}
		});
		
		// Return constructed button
		return newButton;
	};
	var createDetailGameButton = function(spriteData) {
		
		// Create button from generic button creation method
		var newButton = createGameButton(spriteData, CONSTANTS.HUD.OBJECT_CONTROL, unitLeft, unitTop);
		
		// Return constructed button
		return newButton;
	};
	
	// Function to create simple HUD sprites
	var createHUDSprite = function(spriteData, owner, leftStart, topStart, frame, zIndex, visible) {
		var newSprite = self.phaserGame.add.sprite(
				leftStart + owner.WIDTH * spriteData.LEFT,
				topStart + owner.HEIGHT * spriteData.TOP,
				frame);
		newSprite.width = owner.WIDTH * spriteData.WIDTH;
		newSprite.height = owner.HEIGHT * spriteData.HEIGHT;
		newSprite.fixedToCamera = true;
		newSprite.z = zIndex;
		newSprite.visible = visible;
		return newSprite;
	};
	var createHUDLabel = function(spriteData, owner, leftStart, topStart, startingText, zIndex, visible) {
		var newLabel = self.phaserGame.add.text(
				leftStart + owner.WIDTH * spriteData.LEFT,
				topStart + owner.HEIGHT * spriteData.TOP,
				startingText,
				{	font: "bold 12px Arial",
					fill: "#fff", 
					boundsAlignH: "center",
					boundsAlignV: "middle"
				});
		newLabel.setTextBounds(0, 0, owner.WIDTH * spriteData.WIDTH, owner.HEIGHT * spriteData.HEIGHT);
		newLabel.z = zIndex;
		newLabel.fixedToCamera = true;
		newLabel.visible = visible;
		return newLabel;
	};
	var createMapHUDSprite = function(spriteData, frame, zIndex, visible) { return createHUDSprite(spriteData, CONSTANTS.HUD.MAP_CONTROL, mapLeft, 0, frame, zIndex, visible); };
	var createMapHUDText = function(textData, startingText, zIndex, visible) { return createHUDLabel(textData, CONSTANTS.HUD.MAP_CONTROL, mapLeft, 0, startingText, zIndex, visible); };
	var createObjectHUDSprite = function(spriteData, frame, zIndex, visible) { return createHUDSprite(spriteData, CONSTANTS.HUD.OBJECT_CONTROL, unitLeft, unitTop, frame, zIndex, visible); };
	var createObjectHUDText = function(textData, startingText, zIndex, visible) { return createHUDLabel(textData, CONSTANTS.HUD.OBJECT_CONTROL, unitLeft, unitTop, startingText, zIndex, visible); };
	
	// Create map map HUD
	this.mapHUD = this.phaserGame.add.sprite(mapLeft, 0, CONSTANTS.MINI_MAP);
	this.mapHUD.width = CONSTANTS.HUD.MAP_CONTROL.WIDTH;
	this.mapHUD.height = CONSTANTS.HUD.MAP_CONTROL.HEIGHT;
	this.mapHUD.fixedToCamera = true;
	this.mapHUD.z = 90;

	// Create object details HUD
	this.gameObjectDetailsMenu = this.phaserGame.add.sprite(unitLeft, unitTop, CONSTANTS.UNIT_DETAILS);
	this.gameObjectDetailsMenu.width = CONSTANTS.HUD.OBJECT_CONTROL.WIDTH;
	this.gameObjectDetailsMenu.height = CONSTANTS.HUD.OBJECT_CONTROL.HEIGHT;
	this.gameObjectDetailsMenu.fixedToCamera = true;
	this.gameObjectDetailsMenu.z = 90;
	this.gameObjectDetailsMenu.visible = false;
	
	// TODO: Update minimap sprites so that ID = mapId to ease load processing
	switch(this.gameplayConfig.mapId) {
		case "1":
			this.minimap = createHUDSprite(mapLeft + 92, 31, CONSTANTS.MINIMAP_HUNTING_GROUND, 92, true);
			break;
		case "2":
			this.minimap = createHUDSprite(mapLeft + 92, 31, CONSTANTS.MINIMAP_MAJARO, 92, true);
			break;
	}
	
	// Create map control HUD sprites/text/buttons
	this.moneyLabel 			= createMapHUDText(CONSTANTS.HUD.MAP_CONTROL.CASH, this.currentPlayer.cash, 92, true);
	this.homeButton 			= createMapGameButton(CONSTANTS.HUD.MAP_CONTROL.BUILDING);
	this.defenceButton			= createMapGameButton(CONSTANTS.HUD.MAP_CONTROL.DEFENCE);
	this.tankButton 			= createMapGameButton(CONSTANTS.HUD.MAP_CONTROL.UNIT);
	
	// Create object details HUD sprites/text/buttons
	this.gameObjectDetailsIcon 	= createObjectHUDSprite(CONSTANTS.HUD.OBJECT_CONTROL.ICON, CONSTANTS.COLOUR["TANK"][0].ICON, 92, false);
	this.gameObjectDetailsText 	= createObjectHUDText(CONSTANTS.HUD.OBJECT_CONTROL.NAME, "Nothing Selected", 92, false);
	this.gameObjectHealthText 	= createObjectHUDText(CONSTANTS.HUD.OBJECT_CONTROL.HEALTH, "--%", 92, false);
	this.gameObjectSell			= createDetailGameButton();
	
	//CONSTANTS.UNIT_DETAILS_BUTTONS

	// Draw player money label
	var style = {
		font: "bold 12px Arial",
		fill: "#fff", 
		boundsAlignH: "center",
		boundsAlignV: "middle"
	};
	
	// Create minimap rectangle
	var singleCellWidth = this.minimap.width * 1.0 / this.mapRender.width;
	var singleCellHeight = this.minimap.height * 1.0 / this.mapRender.height;
	this.miniMapViewRectangle = new Phaser.Rectangle(
			this.minimap.x + (this.phaserGame.camera.x / 100) * singleCellWidth,
			this.minimap.y + (this.phaserGame.camera.y / 100) * singleCellHeight,
			singleCellWidth * this.mapRender.screenCellWidth - 1,
			singleCellHeight * this.mapRender.screenCellHeight - 1);
	
	// Add all buttons to groups - keep zindex order correct
	this.hudGroup.add(this.mapHUD);
	this.hudGroup.add(this.minimap);
	this.hudGroup.add(this.gameObjectDetailsMenu);
	this.hudGroup.add(this.homeButton);
	this.hudGroup.add(this.defenceButton);
	this.hudGroup.add(this.tankButton);
	this.hudGroup.add(this.gameObjectDetailsIcon);
}

Engine.prototype.updateSelectedGameObjectDetails = function(selectedGameObject) {
	if(selectedGameObject != null) {
		this.gameObjectDetailsText.setText(selectedGameObject.gameCore.identifier);
		this.gameObjectDetailsIcon.loadTexture(selectedGameObject.gameCore.colour.ICON);
		var healthPercentage = (Math.floor(selectedGameObject.gameCore.health / selectedGameObject.gameCore.maxHealth)*100);
		
		if(healthPercentage > 0) {
			this.gameObjectHealthText.setText(healthPercentage + "%");
		}
	}
	
	this.displayedGameObject = selectedGameObject;
	this.setGameObjectDetailsVisibility(selectedGameObject != null);
}

Engine.prototype.setGameObjectDetailsVisibility = function(show) {
	this.gameObjectDetailsText.visible = show;
	this.gameObjectDetailsMenu.visible = show;
	this.gameObjectDetailsIcon.visible = show;
	this.gameObjectHealthText.visible = show;
}

Engine.prototype.updatePlayerStatus = function() {
	var self = this;
	var deadPlayers = self.players.slice();

	var removeArray = [];
	
	for(var index = 0; index < deadPlayers.length; index++) {
		if (self.getPlayerActiveHub(deadPlayers[index].playerId) != null) {
			removeArray.push(index);
		}
	}
	
	for (var index = (removeArray.length-1); index >= 0; index--) {
		deadPlayers.splice(removeArray[index], 1);
	}

	if (deadPlayers.length > 0) {
		for (var i1 = 0; i1 < deadPlayers.length; i1++) {
			var playerAlreadyDead = false;

			for (var i2 = 0; i2 < self.playerResults.length; i2++) {
				if (self.playerResults[i2].player === deadPlayers[i1].playerId) {
					playerAlreadyDead = true;
					break;
				}
			}

			if (!playerAlreadyDead && self.playerResults.length < self.players.length) {
				self.playerResults.push({
					position : self.players.length - self.playerResults.length,
					playerId : deadPlayers[i1].playerId
				});
			}
		}
	}
	
	if (deadPlayers && deadPlayers.length === (self.players.length-1)) {
		for (var index = 0; index < self.players.length; index ++) {
			var isDead = false;
			for (var index2 = 0; index2 < self.playerResults.length; index2 ++) {
				if (self.playerResults[index2].playerId == self.players[index].playerId) {
					isDead = true;
					break;
				}
			}
			if (!isDead && self.playerResults.length < self.players.length) {
				self.playerResults.push({
					position : 1,
					playerId : self.players[index].playerId
				});
				break;
			}
		}
		self.gameFinishedCallback(self.playerResults);
		this.phaserGame.finished = true;
		this.phaserGame.disableStep();
	}
}

Engine.prototype.getItemAtPoint = function(point, playerOwned, enemyOwned) {

	// Declare worker variables
	var itemUnderMouse = null;
	var tempBounds = null;
	var checkBounds = null;

	// Search for unit at XY
	for (var unitIndex = 0; unitIndex < this.units.length; unitIndex++) {
		checkBounds = this.units[unitIndex].getBounds();
		if (checkBounds.left < point.x && checkBounds.right > point.x
				&& checkBounds.top < point.y && checkBounds.bottom > point.y &&
				( (this.units[unitIndex].gameCore.playerId == this.currentPlayer.playerId && playerOwned) ||
				  (this.units[unitIndex].gameCore.playerId != this.currentPlayer.playerId && enemyOwned) ) ) {
			itemUnderMouse = this.units[unitIndex];
		}
	}

	// Search for building at XY
	if (itemUnderMouse == null) {
		for (var buildingIndex = 0; buildingIndex < this.buildings.length; buildingIndex++) {
			checkBounds = this.buildings[buildingIndex].getBounds();
			if (checkBounds.left < point.x && checkBounds.right > point.x
					&& checkBounds.top < point.y && checkBounds.bottom > point.y &&
					( (this.buildings[buildingIndex].gameCore.playerId == this.currentPlayer.playerId && playerOwned) ||
					  (this.buildings[buildingIndex].gameCore.playerId != this.currentPlayer.playerId && enemyOwned) ) ) {
				itemUnderMouse = this.buildings[buildingIndex];
			}
		}
	}

	// Return found item
	return itemUnderMouse;

}

Engine.prototype.getSelectionArray = function() {

	// Define empty result
	var result = [];

	// Calculate selected rectangle
	var selRect = {
		left : Math.min(this.selectionRectangle.rect.left,
				this.selectionRectangle.rect.right),
		top : Math.min(this.selectionRectangle.rect.top,
				this.selectionRectangle.rect.bottom),
		right : Math.max(this.selectionRectangle.rect.left,
				this.selectionRectangle.rect.right),
		bottom : Math.max(this.selectionRectangle.rect.top,
				this.selectionRectangle.rect.bottom),
		width : this.selectionRectangle.rect.width,
		height : this.selectionRectangle.rect.height
	};

	// Search for all units which fall under selection
	for (var tankIndex = 0; tankIndex < this.units.length; tankIndex++) {
		if (this.units[tankIndex].left > selRect.left
				&& this.units[tankIndex].left < selRect.right
				&& this.units[tankIndex].top > selRect.top
				&& this.units[tankIndex].top < selRect.bottom
				&& this.units[tankIndex].gameCore.playerId == this.currentPlayer.playerId) {
			result.push(this.units[tankIndex]);
		}
	}

	// Return calculated result
	return result;

}

Engine.prototype.explosionCollisionCheck = function() {

	// Create self reference
	var self = this;

	// Define working variables
	var damageAmount = 0;

	// Create explosion hit test (calculation) function
	var explosionHitTest = function(explosionSprite, spriteList) {

		// Set default result variable
		var collisionOccured = false;

		// Perform check with explosion and each sprite in the sprite list
		for (var index = 0; index < spriteList.length; index++) {

			// Calculate boundaries for sprites
			var boundsA = explosionSprite.getBounds();
			var boundsB = spriteList[index].getBounds();
			
//			console.log("BOUNDS A: " + boundsA.x + ", " + bounds)

			// Calculate intersect rectangle
			var x_overlap = Math.max(0, Math.min(boundsA.right, boundsB.right)
					- Math.max(boundsA.left, boundsB.left));
			var y_overlap = Math.max(0, Math
					.min(boundsA.bottom, boundsB.bottom)
					- Math.max(boundsA.top, boundsB.top));
			var intersectRect = {
				left : Math.min(boundsA.left, boundsB.left),
				top : Math.max(boundsA.top, boundsB.top),
				right : Math.min(boundsA.left, boundsB.left) + x_overlap,
				bottom : Math.max(boundsA.top, boundsB.top) + y_overlap,
				width : x_overlap,
				height : y_overlap
			};

			// Check an overlap rectangle exists before more accurate collision
			// detection
			if (intersectRect.width * intersectRect.height > 0) {

				// // Output debug info
				// console.log("A: [" + boundsA.top + "," + boundsA.bottom + ","
				// + boundsA.left + "," + boundsA.right + "]");
				// console.log("B: [" + boundsB.top + "," + boundsB.bottom + ","
				// + boundsB.left + "," + boundsB.right + "]");
				// console.log("I: [" + intersectRect.top + "," +
				// intersectRect.bottom + "," + intersectRect.left + "," +
				// intersectRect.right + "]");
				//
				// // Output for debugging
				// self.collisionCanvas.draw(explosionSprite, explosionSprite.x,
				// explosionSprite.y);
				// self.collisionCanvas.draw(spriteB, spriteB.x, spriteB.y);
				//				
				// // XOR sprite A & B
				//				
				// // Check for pixels on colcanvas

				// Mark collision as occuring
				collisionOccured = true;

			}
		}

		// Return calculated result
		return collisionOccured;

	}

	// Get explosion register
	var explosionRegister = this.explosionManager.explosionRegister;
	if (explosionRegister.length > 0) {
		for (var explosionIndex = 0; explosionIndex < this.explosionManager.explosionRegister.length; explosionIndex++) {
			
			// Determine damage for explosion
			var explosionDealerObject = this.getObjectFromInstanceId(explosionRegister[explosionIndex].ownerId);
			
			// Make sure an owner was found			-- Quick fix 		-|- ADD GRAVEYARD ARRAY -|-
			if (explosionDealerObject) {

				// Define information for use calauclating explosion owners
				var explosionDealerPlayer = explosionDealerObject.gameCore.playerId;
				var damageToDeal = explosionDealerObject.gameCore.damage;
				
				// Test each building with current explosion
				for (var index = 0; index < this.buildings.length; index++) {
					if (!this.buildings[index]
							.isDamageMarkRegistered(explosionRegister[explosionIndex].explosionInstanceId)
							&& this.buildings[index].gameCore.playerId == this.currentPlayer.playerId
							&& this.buildings[index].gameCore.playerId != explosionDealerPlayer
							&& explosionHitTest(explosionRegister[explosionIndex],
									this.buildings[index].getCollisionLayers())) {
						this.buildings[index].markDamage(explosionRegister[explosionIndex].explosionInstanceId);
						this.serverAPI.requestDamageSubmission([this.buildings[index]], damageToDeal, explosionDealerPlayer);
					}
				}
				
				// Test each unit with current explosion
				for (var index = 0; index < this.units.length; index++) {
					if (!this.units[index]
							.isDamageMarkRegistered(explosionRegister[explosionIndex].explosionInstanceId)
							&& this.units[index].gameCore.playerId == this.currentPlayer.playerId
							&& this.units[index].gameCore.playerId != explosionDealerPlayer
							&& explosionHitTest(explosionRegister[explosionIndex],
									this.units[index].getCollisionLayers())) {
						this.units[index].markDamage(explosionRegister[explosionIndex].explosionInstanceId);
						this.serverAPI.requestDamageSubmission([this.units[index]], damageToDeal, explosionDealerPlayer);
					}
				}
			}
		}
	}
}

// REMOVE THIS ONCE SERVER SIDE RANGE CHECK IS DONE
Engine.prototype.isSquareWithinBaseRange = function(col, row) {
	return (row <= (this.spawnPoint.row+5) && row >= (this.spawnPoint.row-2)
			&& col <= (this.spawnPoint.col+5) && col >= (this.spawnPoint.col-2));
}

Engine.prototype.getCellsWithinBuildRangeOfHub = function () {
	
	// Declare variables
	var withinRange = [];
	
	// Search for all cells in hub range
	for (var rowIndex = this.spawnPoint.row-2; rowIndex < this.spawnPoint.row+5; rowIndex++) {
		for (var colIndex = this.spawnPoint.col-2; colIndex < this.spawnPoint.col+5; colIndex++) {
			if (this.isSquareEmpty(colIndex, rowIndex)) {
				withinRange.push(new Cell(colIndex, rowIndex));
			}
		}
	}
	
	// Return generated list
	return withinRange;
}

Engine.prototype.isSquareEmpty = function(col, row) {
	
	// Run check against map manager
	if (this.mapRender.isCellObstructed(new Cell(col, row))) {
		return false;
	}
	
	// Generate list of all ingame objects to process
	var potentialObstructions = this.buildings.concat(this.units);
	
	// Loop through all potential matches identifying cells to check
	for (var index = 0; index < potentialObstructions.length; index++) {
		
		// Check if any part of the building is occupying the cell
		var cells = potentialObstructions[index].getCells();
		for (var cellIndex = 0; cellIndex < cells.length; cellIndex ++) {
			if (cells[cellIndex].col == col && cells[cellIndex].row == row) {
				return false;
			}
		}
		
		// Check if building deploy point is at cell
		if (potentialObstructions[index].gameCore.identifier == "HUB") {
			var hubRallyCell = potentialObstructions[index].getRallyCell();
			if (hubRallyCell.col == col && hubRallyCell.row == row) {
				return false;
			}
		}
	}
	
	
	// Return empty if nothing was found
	return true;
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
	for (var index = 0; index < this.players.length; index++) {
		if (this.players[index].playerId === playerId) {
			return this.players[index];
		}
	}

	// Return not found
	return null;
}

Engine.prototype.getObjectFromIdentifier = function(identifier) {
	
	// Iterate through units
	for (var index = 0; index < CONSTANTS.GAME_UNITS.length; index ++) {
		if (CONSTANTS.GAME_UNITS[index].identifier == identifier) {
			return CONSTANTS.GAME_UNITS[index];
		}
	}
	
	// Iterate through buildings
	for (var index = 0; index < CONSTANTS.GAME_BUILDINGS.length; index ++) {
		if (CONSTANTS.GAME_BUILDINGS[index].identifier == identifier) {
			return CONSTANTS.GAME_BUILDINGS[index];
		}
	}
	
	// Return erroneous value
	return null;
}

Engine.prototype.getPlayerActiveHub = function(playerId) {
	for (var index = 0; index < this.buildings.length; index ++) {
		if (this.buildings[index].gameCore.playerId == playerId &&
				this.buildings[index].gameCore.identifier == "HUB") {
			return this.buildings[index];
		}
	}
	return null;
}


// ------------------------------ SPECIALISED METHODS FOR DEALING WITH RESPONSES ------------------------------//

Engine.prototype.processSetupSpawnObjects = function(responseData) {
	
	// Define worker variables
	var mockUnitResponseData = { responseCode: "DEBUG_PLACEMENT", coords: [], misc: [], source: [], target: [] };
	var mockBuildingResponseData = { responseCode: "NEW_BUILDING", coords: [], misc: [], source: [], target: [] };
	var arrayIdentifier = null;

	// Construct building and unit arrays
	for (var index = 0; index < responseData.source.length; index ++) {

		// Add to correct array
		arrayIdentifier = CONSTANTS.getObjectType(responseData.source[index]);
		
		// Populate unit array
		if (arrayIdentifier == "UNIT") {
			mockUnitResponseData.coords.push(responseData.coords[index]);
			mockUnitResponseData.misc.push(responseData.misc[index]);
			mockUnitResponseData.source.push(responseData.source[index]);
			mockUnitResponseData.target.push(responseData.target[index]);
		}

		// Populate building array
		if (arrayIdentifier == "BUILDING" || arrayIdentifier == "DEFENCE") {
			console.log("Hub placed at: (" + responseData.coords[index].col + "," + responseData.coords[index].row + ")");
			mockBuildingResponseData.coords.push(responseData.coords[index]);
			mockBuildingResponseData.misc.push(responseData.misc[index]);
			mockBuildingResponseData.source.push(responseData.source[index]);
			mockBuildingResponseData.target.push(responseData.target[index]);
		}
	}

	// Submit mock request arrays
//	this.processUnitPurchaseFinished(mockUnitResponseData, true);
	this.processNewBuilding(mockBuildingResponseData, true);
}

Engine.prototype.processPurchaseObject = function(responseData) {

	// Identify object from response
	var gameObject = this.getObjectFromIdentifier(responseData.source[0]);

	// Start animation playing		-- { button: animateButton, hudConstants: hudConstants }
	this.startBuildingAnimation(gameObject);

	// Purchase finished callback
	var self = this;
	var purchaseFinished = function() {

		// Locate purchase object from player and purchaseObjectId 
		var purchaseObject = self.currentPlayer.getPurchase(responseData.target[0]);

		// Run purchase finished request
		self.serverAPI.purchaseFinishedRequest(purchaseObject);
	}

	// Begin purchase timer with appropriate callback
	var purchaseTimeout = setTimeout(purchaseFinished, gameObject.buildTime);

	// Add item to list of purchased items
	this.currentPlayer.addPurchase(gameObject.identifier, responseData.target[0], purchaseTimeout);

	// Deduct cash from player
	this.currentPlayer.reduceCash(gameObject.cost);
	this.moneyLabel.setText(this.currentPlayer.cash);
}

Engine.prototype.processPurchasePending = function(responseData) {

}

Engine.prototype.processUnitPurchaseFinished = function(responseData, overridePurchase) {

	// Create quick reference object
	var refObject = {
		instanceId : responseData.target[0],
		identifier : responseData.source[0],
		cell : new Cell(responseData.coords[0].col, responseData.coords[0].row),
		xy : (new Cell(responseData.coords[0].col, responseData.coords[0].row)).toPoint(),
		player : this.getPlayerFromPlayerId(responseData.misc[0])
	};

	// Declare variables
	var newUnitObject = null;

	// Create GameCore object
	var gameCore = new GameCore(refObject.identifier, refObject.cell);
	gameCore.setInstanceId(refObject.instanceId);
	gameCore.setPlayer(refObject.player);

	// Find tank hub object
	var tankHub = this.getPlayerActiveHub(refObject.player.playerId);

	// Make sure tank hub was found
	if (tankHub) {
		
		// Set spawn coordinates for unit
		var spawnCell = new Cell(tankHub.gameCore.cell.col + 1, tankHub.gameCore.cell.row + 1);
		var spawnPoint = spawnCell.toPoint();
		
		// Construct new unit object
		switch (refObject.identifier) {
			case "TANK":
				newUnitObject = new Tank(this.engineCore, gameCore, this.mapGroup, this.tankGroup, spawnPoint, spawnCell.col, spawnCell.row, 100, 100);
				this.tankBuildInProgress = false;
				break;
			default:
				break;
		}
		
		// Make sure new unit was created
		if (newUnitObject) {
			
			// Check if should be overriding production purchase
			if (overridePurchase) {
				newUnitObject.setVisible();
				this.registerNewGameObject(newUnitObject);
			} else {

				// Remove new unit from users purchase queue
				this.currentPlayer.markPurchaseAsBuilt(refObject.instanceId);	// Keep here just to remain consistant
				this.currentPlayer.removePurchase(refObject.instanceId);
				
				// Add new unit to update stream
				this.productionUnits.push(newUnitObject);
				
				// Save self reference
				var self = this;
				
				// Set on complete callback for unit waypoints
				newUnitObject.waypointControl.onComplete = function(endCell) {
					
					// Update tank position on server
					self.serverAPI.requestUpdateUnitCell(newUnitObject, newUnitObject.gameCore.cell);
					
					// Remove new unit from production units array
					for (var index = 0; index < self.productionUnits.length; index ++) {
						if (self.productionUnits[index].gameCore.instanceId == newUnitObject.gameCore.instanceId) {
							self.productionUnits.splice(index, 1);
							break;
						}
					}
					
					// Add new unit to units array
					newUnitObject.inProductionMode = false;
					self.registerNewGameObject(newUnitObject);
					
					// Run hub reset animation and enable button
					tankHub.resetTankHub();
					self.stopBuildingAnimation(newUnitObject);
				}
			
				// Construct tank animation from hub
				tankHub.animateTankCreate(newUnitObject);
			}
		}
	}
}

Engine.prototype.processBuildingPurchaseFinished = function(responseData) {

	// Create quick reference object
	var refObject = {
		instanceId : responseData.target[0],
		identifier : responseData.source[0],
		cell : new Cell(responseData.coords[0].col, responseData.coords[0].row),
		xy : (new Cell(responseData.coords[0].col, responseData.coords[0].row)).toPoint(),
		player : this.getPlayerFromPlayerId(responseData.misc[0])
	};

	// Flag object as built
	this.currentPlayer.markPurchaseAsBuilt(refObject.instanceId);
}

Engine.prototype.processNewBuilding = function(responseData, keepCash) {

	// Iterate through all buildings
	for (var index = 0; index < responseData.source.length; index++) {

		// Create quick reference object
		var refObject = {
			instanceId : responseData.target[index],
			identifier : responseData.source[index],
			cell : responseData.coords[index],
			player : this.getPlayerFromPlayerId(responseData.misc[index])
		};

		// Create XY position from col/row
		refObject.xy = refObject.cell.toPoint();

		// Deduct cost from player
		var newObject = this.getObjectFromIdentifier(refObject.identifier);
		if(refObject.playerId == this.currentPlayer.playerId && !keepCash) {
			this.currentPlayer.cash -= newObject.cost;
			this.moneyLabel.setText(this.currentPlayer.cash); // Redraw player money label
		}
		
		// Locate and remove purchase object from player purchases
		if (this.currentPlayer.playerId == refObject.player.playerId) {
			var objectType = CONSTANTS.getObjectType(refObject.identifier);
			var purchase = this.currentPlayer.getPurchaseFromObjectType(objectType);
			if (purchase) {
				this.currentPlayer.removePurchase(purchase.instanceId);
				if (this.newBuilding.placeCallback) { this.newBuilding.placeCallback(); }
			}
		}

		// Create GameCore object
		var gameCore = new GameCore(refObject.identifier, refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);

		// Construct object for positioning
		var newBuilding = null;
		switch (refObject.identifier) {
			case "HUB":
				newBuilding = new Hub(this.engineCore, gameCore, this.mapGroup, this.highestGroup,
						this.buildingGroup, refObject.xy, refObject.cell.col, refObject.cell.row,
						300, 300, false);
				break;
			case "TURRET":
				newBuilding = new Turret(this.engineCore, gameCore, this.mapGroup,
						this.turretGroup, refObject.xy, refObject.cell.col, refObject.cell.row,
						100, 100, false);
				this.turretBuildInProgress = false;
				break;
		}

		// Add object to building array
		if (newBuilding) { this.registerNewGameObject(newBuilding); }
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
		var defence = this.getObjectFromInstanceId(refObject.instanceId);
		if (defence != null && defence.gameCore.isDefence) {
			defence.rotateAndShoot(refObject.targetX, refObject.targetY);
		}
	}
}

Engine.prototype.processObjectAttackObject = function(responseData) {

	// Process all items of request
	for (var reqIndex = 0; reqIndex < responseData.source.length; reqIndex++) {

		// Create reference object
		var refObject = {
			sourceId : responseData.source[reqIndex],
			targetId : responseData.target[reqIndex],
		};

		// Loop through all defences set to fire
		var source = this.getObjectFromInstanceId(refObject.sourceId);
		var target = this.getObjectFromInstanceId(refObject.targetId);
		if (source != null) {
			if (target == null) {
				source.clearLockonTarget();
			} else {
				source.lockonAndShoot(target);
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
				waypoints[index].path.push((new Cell(refObject.targetX,
						refObject.targetY).toCenterPoint()));
				break;
			}
		}

		// Add new item to waypoints
		if (!itemExists) {
			waypoints.push({
				instanceId : refObject.instanceId,
				path : [ (new Cell(refObject.targetX, refObject.targetY))
						.toCenterPoint() ]
			});
		}

	}

	// Iterate through waypoints assigning them to objects
	var targetUnit = null;
	for (var index = 0; index < waypoints.length; index++) {
		targetUnit = this.getObjectFromInstanceId(waypoints[index].instanceId);
		if (targetUnit) {
			targetUnit.updateWaypoints(waypoints[index].path);
		}
	}
}

Engine.prototype.processUnitDamage = function(responseData) {

	// Define working variables
	var damage = parseInt();
	var removeList = [];

	// Iterate over every unit due damage
	for (var unitIndex = 0; unitIndex < responseData.target.length; unitIndex++) {

		// Create reference object
		var refObject = {
			newHealth : parseInt(responseData.target[unitIndex]),
			instanceId : responseData.source[unitIndex],
			killer : responseData.misc[unitIndex]
		};

		// Get targeted unit
		var gameObject = this.getObjectFromInstanceId(refObject.instanceId);

		// Make sure a unit was found
		if (gameObject) {

			// Submit unit damage
			gameObject.gameCore.setHealth(refObject.newHealth);
			
			// Update health on the game object details menu
			if(gameObject.gameCore.health > 0) {
				this.gameObjectHealthText.setText(Math.floor((refObject.newHealth / gameObject.gameCore.maxHealth)*100) + "%");
			} else {
				this.setGameObjectDetailsVisibility(false);
			}

			// Determine if unit was destroyed
			if (gameObject.gameCore.health == 0) {
				this.explosionManager.requestDestruction(this.mapGroup,
						CONSTANTS.DEBRIS_TANK, CONSTANTS.SPRITE_EXPLOSION_C,
						gameObject.left, gameObject.top);
				removeList.push(refObject.instanceId);

				if(refObject.killer == this.currentPlayer.playerId) {

					this.currentPlayer.cash += Math.floor(gameObject.gameCore.cost*1.2);
					this.moneyLabel.setText(this.currentPlayer.cash); // Redraw player money label

				}
			}

//			// Log to screen
//			console.log(gameObject.gameCore.identifier + " health: " + gameObject.gameCore.health);
		}
	}

	// Delete all items from remove list
	for (var removeIndex = 0; removeIndex < removeList.length; removeIndex++) {
		this.deleteItemWithInstanceId(removeList[removeIndex]);
	}
}

Engine.prototype.processInsufficientFunds = function(responseData) {
	
	// iterate through all of the buildings
	for (var index = 0; index < responseData.source.length; index++) {
		var refObject = {
			playerId : responseData.target[index],
			cash : responseData.source[index]
		};
	
		if(refObject.playerId == this.currentPlayer.playerId) {

			this.currentPlayer.cash = parseInt(refObject.cash);
			this.moneyLabel.setText(this.currentPlayer.cash); // Redraw player money label						merge conflickt

		}
	}
}


// ------------------------------ SERVER GAMEPLAYRESPONSE SWITCH METHOD ------------------------------

Engine.prototype.processGameplayResponse = function(responseData) {

	// Store responses for later processing if engine is not yet ready
	if (this.engineLoading) {
		this.responseBuffer.push(responseData);
	} else {

		// Direct response to appropriate handler
		switch (responseData.responseCode) {

			// ----- Startup responses
			case "SETUP_SPAWN_OBJECTS":
				this.processSetupSpawnObjects(responseData);
				break;
				
			// ----- Purchase responses
			case "PURCHASE_OBJECT":
				this.processPurchaseObject(responseData);
				break;
			case "PURCHASE_PENDING":
				this.processPurchasePending(responseData);
				break;
			case "UNIT_PURCHASE_FINISHED":
				this.processUnitPurchaseFinished(responseData);
				break;
			case "BUILDING_PURCHASE_FINISHED":
				this.processBuildingPurchaseFinished(responseData);
				break;
			
			// ----- Construction of new building/defence responses
			case "NEW_BUILDING":
				this.processNewBuilding(responseData, false);
				break;
				
			// ----- Object attack responses
			case "OBJECT_ATTACK_OBJECT":
				this.processObjectAttackObject(responseData);
				break;
			case "DAMAGE_OBJECT":
				this.processUnitDamage(responseData);
				break;
				
			// ----- Waypoint responses
			case "WAYPOINT_PATH_COORDS":
				this.processWaypoints(responseData);
				break;
				
			// ----- Error responses
			case "INSUFFICIENT_FUNDS":
				this.processInsufficientFunds(responseData);
				break;
				
				
				
			// ----------------------	LEGACY METHODS TO REMOVE
			case "DEFENCE_ATTACK_XY":
				this.processDefenceAttackXY(responseData);
				break;
		}
	}
}
