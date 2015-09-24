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
	this.phaserGame.newBuilding = {
		active : false,
		target : null
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
		originY : 0
	};
	this.hoverItem = null;

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
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_PLACEMENT, CONSTANTS.ROOT_SPRITES_LOC + 'tile_selections.png', 100, 100, 3);
	this.phaserGame.load.spritesheet(CONSTANTS.MINI_MAP_BUTTONS, CONSTANTS.ROOT_SPRITES_LOC + 'mini_map_buttons.png', 51, 28, 6);

	// Load tile images
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_SPRITESHEET, CONSTANTS.ROOT_SPRITES_LOC + 'map_tiles.png', 100, 100, 64);

	// Load particles
	this.phaserGame.load.image(CONSTANTS.PARTICLE_YELLOW_SHOT, CONSTANTS.ROOT_SPRITES_LOC + 'p_yellowShot.png');
	
	// Load game frame images
	this.phaserGame.load.image(CONSTANTS.MINI_MAP, CONSTANTS.ROOT_SPRITES_LOC + 'mini_map.png');
	this.phaserGame.load.image(CONSTANTS.UNIT_DETAILS, CONSTANTS.ROOT_SPRITES_LOC + 'unit_details.png');
	this.phaserGame.load.image(CONSTANTS.MINIMAP_MAJARO, CONSTANTS.ROOT_SPRITES_LOC + 'map_items/majaro/minimap.png');
	
	// Load game object icons
	for(var i = 0; i < 6; i++) {
		this.phaserGame.load.image(CONSTANTS.COLOUR_["TANK"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/tank_' + CONSTANTS.COLOUR_["TANK"][i].COLOUR + '.png');
		this.phaserGame.load.image(CONSTANTS.COLOUR_["TURRET"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/turret_' + CONSTANTS.COLOUR_["TURRET"][i].COLOUR + '.png');
		this.phaserGame.load.image(CONSTANTS.COLOUR_["HUB"][i].ICON, CONSTANTS.ROOT_SPRITES_LOC + 'icons/tank_hub_' + CONSTANTS.COLOUR_["HUB"][i].COLOUR + '.png');
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
	this.phaserGame.canvas.oncontextmenu = function(e) {
		e.preventDefault();
	}

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
		func_RequestExplosion : function(mapGroup, explosionId, ownerId,
				explosionInstanceId, x, y) {
			self.explosionManager.requestExplosion(mapGroup, explosionId,
					ownerId, explosionInstanceId, x, y)
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
	

	//Adding information text to the game screen
	var style = {
		font: "bold 12px Arial", fill: "#fff", 
	    align: "left", // the alignment of the text is independent of the bounds, try changing to 'center' or 'right'
	    boundsAlignH: "left", 
	    boundsAlignV: "top"
	};

	// Draw the gameframe
	this.drawGameScreen();

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
	if (this.phaserGame.newBuilding.active) {
		var cell = this.mouse.position.toCell();
		var canPlace = this.isSquareEmpty(cell.col, cell.row);
		this.mapRender.placementHover(cell.col, cell.row, canPlace);
	}

	// Update all buildings and units
	for (var index = 0; index < this.buildings.length; index++) { this.buildings[index].update(); }
	for (var index = 0; index < this.units.length; index++) { this.units[index].update(); }
	for (var index = 0; index < this.productionUnits.length; index++) { this.productionUnits[index].update(); }

	// Search for collisions between fireable objects
	this.explosionCollisionCheck();

	// Update pointer position
	this.updatePointerPosition();

//	// Get state of players in game
	if (!this.phaserGame.finished) { this.updatePlayerStatus(); }
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
}

Engine.prototype.onMouseUp = function(pointer) {
	
	// Break if new unit has just been selected
	if (this.selectedJustSet) {
		this.selectedJustSet = false;
		return;
	}

	// Save self reference
	var self = this;

	// Check for key press
	var ctrlDown = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.CONTROL);
	var shiftDown = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.SHIFT);

	// Positional values for cell and xy
	var point = this.mouse.position;
	var cell = point.toCell();
	
	// Flag for general pointer actions handled
	var clickHandled = false;

	// Perform checks for left click
	if (pointer.leftButton.isDown) {

		// Create new building
		if (this.phaserGame.newBuilding.active) {

			// Render placement overlay
			if (this.isSquareEmpty(cell.col, cell.row) && this.isSquareWithinBaseRange(cell.col, cell.row)) {
				console.log(this.isSquareWithinBaseRange(cell.col, cell.row));
				self.phaserGame.newBuilding.target.setPosition(cell);
				this.serverAPI.requestBuildingPlacement(this.phaserGame.newBuilding);
				self.phaserGame.newBuilding.active = false;
				self.mapRender.clearPlacementHover();
			}

		// Manage selected units
		} else if (this.selected.length > 0) {

			// Calculate item at point
			var enemyAtPoint = this.getItemAtPoint(point, false, true);
			var friendlyAtPoint = this.getItemAtPoint(point, true, true);

			// Process selected items
			for (var selectedIndex = 0; selectedIndex < this.selected.length; selectedIndex++) {

				// Process selected tank
				if (this.selected[selectedIndex].gameCore.identifier == "TANK") {
					if (this.isSquareEmpty(cell.col, cell.row)) {
						var targetUnit = this.selected[0];
						if (targetUnit) {
							clickHandled = true;
							if (ctrlDown) {
								targetUnit.shootAtXY(point);
							} else {
								this.serverAPI.requestUnitMoveCell(targetUnit, cell);
							}
						}
					} else {
						if (enemyAtPoint) {
							clickHandled = true;
							this.serverAPI.requestObjectAttackObject(this.selected[selectedIndex].gameCore.instanceId, enemyAtPoint.gameCore.instanceId);
						}
					}
				}

				// Process selected turret
				if (this.selected[selectedIndex].gameCore.identifier == "TURRET") {
					var sourceObjectId = this.selected[selectedIndex].gameCore.instanceId;
					if (enemyAtPoint) {
						clickHandled = true;
						this.serverAPI.requestObjectAttackObject(sourceObjectId, enemyAtPoint.gameCore.instanceId);
					}
					if (ctrlDown && !enemyAtPoint && !friendlyAtPoint) {
						clickHandled = true;
						this.selected[selectedIndex].shootAtXY(point);
//						this.serverAPI.requestDefenceAttackXY([this.selected[selectedIndex]], this.mouse.position.x, this.mouse.position.y);
					}
				}
				
				// Deselect selection if selected building and player clicks away - clickHandled to prevent alternat building specific options
				if (!clickHandled && !this.selected[selectedIndex].gameCore.isUnit && !enemyAtPoint && !friendlyAtPoint) {
					this.selected = [];
				}
			}

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
			
			if(this.selected.length < 1) {
				 this.updateSelectedGameObjectDetails(null);
			}
		}
	}

	// Perform checks for right click
	if (!clickHandled && pointer.rightButton.isDown) {
		this.selected = [];
		this.setGameObjectDetailsVisibility(false);
	}

}

Engine.prototype.onMouseMove = function(pointer, x, y) {

	// Update pointer position
	this.updatePointerPosition();

	// Process updates for selection rectangle
	if (pointer.isDown && pointer.leftButton.isDown) {
		
		// Reset selected items
		if (this.selectionRectangle.selectActive
				&& this.selectionRectangle.rect.width * this.selectionRectangle.rect.height > 40) {
			this.selected = [];
			this.hoverItem = null;
		}

		// Set new rectangle selection coordinates
		this.selectionRectangle.selectActive = true;
		this.selectionRectangle.rect.width = (this.mouse.position.x - this.selectionRectangle.originX);
		this.selectionRectangle.rect.height = (this.mouse.position.y - this.selectionRectangle.originY);

	} else {

		// Run search for any selected units
		if (this.selectionRectangle.selectActive
				&& this.selectionRectangle.rect.width
						* this.selectionRectangle.rect.height > 40) {
			this.selected = this.getSelectionArray();
		}

		// Mark selection as not active and reset
		this.selectionRectangle.selectActive = false;
		this.selectionRectangle.rect.x = this.mouse.position.x;
		this.selectionRectangle.rect.y = this.mouse.position.y;
		this.selectionRectangle.originX = this.mouse.position.x;
		this.selectionRectangle.originY = this.mouse.position.y;
		this.selectionRectangle.rect.width = 0;
		this.selectionRectangle.rect.height = 0;

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
	if (char == '1') { this.purchaseObject("TURRET"); }

	// Submit request for tank purchase
	if (char == '2') { this.purchaseObject("TANK"); }
	
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


// ------------------------------ UTILITY METHODS ------------------------------ //

Engine.prototype.purchaseObject = function(objectId) {
	
	// Get current cell over
	var cell = this.mouse.position.toCell();
	
	// Define new request objects
	var newBuildingCore = null;
	var newUnitCore = null;

	// Create building objects for tanks
	switch (objectId) {
		case "TURRET":
			var gameCore = new GameCore(objectId, cell);
			gameCore.setPlayer(this.currentPlayer);
			this.createNewBuildingObject(gameCore);
			break;
		case "TANK":
			newUnitCore = new GameCore(objectId, cell);
			newUnitCore.setPlayer(this.currentPlayer);
			this.serverAPI.purchaseRequest(newUnitCore);
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
//				if () {
//					updatePointerForm(CONSTANTS.CURSOR_INVALID);
//				} else {
					updatePointerForm(CONSTANTS.CURSOR_MOVE);
//				}
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
	var moveAmount = { x: Math.min(this.mapRender.width - mapBound.x, Math.max(cell.col - mapBound.x, 0)),
					   y: Math.min(this.mapRender.height - mapBound.y, Math.max(cell.row - mapBound.y, 0)) };
	
	// Move camera to centralise cell
	this.phaserGame.camera.x = (moveAmount.x * CONSTANTS.TILE_WIDTH) + (CONSTANTS.TILE_WIDTH / 2);
	this.phaserGame.camera.y = (moveAmount.y * CONSTANTS.TILE_HEIGHT) + (CONSTANTS.TILE_HEIGHT / 2);
}

Engine.prototype.manageMapMovement = function() {

	// Update camera with up, down, left and right keys
	if (this.cursors.up.isDown) { this.phaserGame.camera.y -= CONSTANTS.CAMERA_VELOCITY; }
	else if (this.cursors.down.isDown) { this.phaserGame.camera.y += CONSTANTS.CAMERA_VELOCITY; }
	
	if (this.cursors.left.isDown) { this.phaserGame.camera.x -= CONSTANTS.CAMERA_VELOCITY; }
	else if (this.cursors.right.isDown) { this.phaserGame.camera.x += CONSTANTS.CAMERA_VELOCITY; }
	
	// Update mouse values
	this.mouse.position = new Point(this.phaserGame.camera.x + this.phaserGame.input.mousePointer.x,
			this.phaserGame.camera.y + this.phaserGame.input.mousePointer.y);
	
	// Process updates for mouse
	this.updatePointerPosition();
}

Engine.prototype.drawGameScreen = function() {
	this.miniMap = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH), 0, CONSTANTS.MINI_MAP);
	this.miniMap.fixedToCamera = true;
	this.miniMap.z = 90;
	
	var self = this;
	
	// TO DO, MAKE PROCESSING DYNAMIC
	this.displayedMinimap = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH) + 92, 31, CONSTANTS.MINIMAP_MAJARO);
	this.displayedMinimap.fixedToCamera = true;
	this.displayedMinimap.z = 92;
	
	this.homeButton = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH) + 65, 318, CONSTANTS.MINI_MAP_BUTTONS);
	this.homeButton.frame = 4;
	this.homeButton.fixedToCamera = true;
	this.homeButton.z = 92;
	this.homeButton.inputEnabled = true;
	this.homeButton.events.onInputOver.add(function() {
		self.homeButton.frame = 5;
	}, this);
	this.homeButton.events.onInputOut.add(function() {
		self.homeButton.frame = 4;
	});
	this.homeButton.events.onInputUp.add(function() {
		self.positionCameraOverCell(self.spawnPoint);
	});
	
	this.defenceButton = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH) + 120, 317, CONSTANTS.MINI_MAP_BUTTONS);
	this.defenceButton.frame = 2;
	this.defenceButton.fixedToCamera = true;
	this.defenceButton.z = 92;
	this.defenceButton.inputEnabled = true;
	this.defenceButton.events.onInputOver.add(function() {
		self.defenceButton.frame = 3;
	});
	this.defenceButton.events.onInputOut.add(function() {
		self.defenceButton.frame = 2;
	});
	this.defenceButton.events.onInputUp.add(function() {
		self.purchaseObject("TURRET");
	});
	
	this.tankButton = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH) + 178, 318, CONSTANTS.MINI_MAP_BUTTONS);
	this.tankButton.frame = 0;
	this.tankButton.fixedToCamera = true;
	this.tankButton.z = 92;
	this.tankButton.inputEnabled = true;
	this.tankButton.events.onInputOver.add(function() {
		self.tankButton.frame = 1;
	});
	this.tankButton.events.onInputOut.add(function() {
		self.tankButton.frame = 0;
	});
	this.tankButton.events.onInputUp.add(function() {
		self.purchaseObject("TANK");
	});
	
	
	this.gameObjectDetailsMenu = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.UNIT_DETAILS_WIDTH),
			(CONSTANTS.GAME_SCREEN_HEIGHT - CONSTANTS.UNIT_DETAILS_HEIGHT), CONSTANTS.UNIT_DETAILS);
	this.gameObjectDetailsMenu.z = 90;
	this.gameObjectDetailsMenu.fixedToCamera = true;
	this.gameObjectDetailsMenu.visible = false;
	
	this.gameObjectDetailsIcon = this.phaserGame.add.sprite((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.UNIT_DETAILS_WIDTH) + 128,
			(CONSTANTS.GAME_SCREEN_HEIGHT - CONSTANTS.UNIT_DETAILS_HEIGHT) + 48, CONSTANTS.COLOUR_["TANK"][0].ICON);
	this.gameObjectDetailsIcon.z = 92;
	this.gameObjectDetailsIcon.fixedToCamera = true;
	this.gameObjectDetailsIcon.visible = false;
	
	// Draw player money label
	var style = {
		font: "bold 12px Arial",
		fill: "#fff", 
		boundsAlignH: "center",
		boundsAlignV: "middle"
	};
	
	this.moneyLabel = this.phaserGame.add.text((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.MINI_MAP_WIDTH) + 250, 323, this.currentPlayer.cash, style);
	this.moneyLabel.setTextBounds(0, 0, 108, 25);
	this.moneyLabel.fixedToCamera = true;
	this.moneyLabel.z = 92;
	
	this.gameObjectDetailsText = this.phaserGame.add.text((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.UNIT_DETAILS_WIDTH) + 37,
			(CONSTANTS.GAME_SCREEN_HEIGHT - CONSTANTS.UNIT_DETAILS_HEIGHT) + 31, "Nothing Selected.", style);
	this.gameObjectDetailsText.setTextBounds(0, 0, 204, 14);
	this.gameObjectDetailsText.z = 92;
	this.gameObjectDetailsText.fixedToCamera = true;
	this.gameObjectDetailsText.visible = false;
	
	this.gameObjectHealthText = this.phaserGame.add.text((CONSTANTS.GAME_SCREEN_WIDTH - CONSTANTS.UNIT_DETAILS_WIDTH) + 30,
			(CONSTANTS.GAME_SCREEN_HEIGHT - CONSTANTS.UNIT_DETAILS_HEIGHT) + 58, "", style);
	this.gameObjectHealthText.setTextBounds(0, 0, 70, 70);
	this.gameObjectHealthText.z = 92;
	this.gameObjectHealthText.fixedToCamera = true;
	this.gameObjectHealthText.visible = false;
	
	this.hudGroup.add(this.miniMap);
	this.hudGroup.add(this.displayedMinimap);
	this.hudGroup.add(this.gameObjectDetailsMenu);
	this.hudGroup.add(this.homeButton);
	this.hudGroup.add(this.defenceButton);
	this.hudGroup.add(this.tankButton);
	this.hudGroup.add(this.gameObjectDetailsIcon);
}

Engine.prototype.updateSelectedGameObjectDetails = function(selectedGameObject) {
	if(selectedGameObject != null) {
		this.gameObjectDetailsText.setText(selectedGameObject.gameCore.identifier);
		this.gameObjectHealthText.setText((Math.floor(selectedGameObject.gameCore.health / selectedGameObject.gameCore.maxHealth)*100) + "%");
		this.gameObjectDetailsIcon.loadTexture(selectedGameObject.gameCore.colour.ICON);
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
					playerId : deadPlayers[i1].playerId,
					feedback : deadPlayers[i1].playerId + " finished in place: "
							+ (self.players.length - self.playerResults.length) + "."
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
					playerId : self.players[index].playerId,
					feedback : self.players[index].playerId + " finished in place: 1."
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
				&& this.units[tankIndex].top < selRect.bottom) {
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

				// Process damage calculation
				damageAmount = 50;

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

			// Test each building with current explosion
			for (var index = 0; index < this.buildings.length; index++) {
				if (!this.buildings[index]
						.isDamageMarkRegistered(explosionRegister[explosionIndex].explosionInstanceId)
						&& this.buildings[index].gameCore.playerId == this.currentPlayer.playerId
						&& this.buildings[index].gameCore.playerId != explosionRegister[explosionIndex].ownerId
						&& explosionHitTest(explosionRegister[explosionIndex],
								this.buildings[index].getCollisionLayers())) {
					this.buildings[index].markDamage(explosionRegister[explosionIndex].explosionInstanceId);
					this.serverAPI.requestDamageSubmission([this.buildings[index]], damageAmount, explosionRegister[explosionIndex].ownerId);
				}
			}

			// Test each unit with current explosion
			for (var index = 0; index < this.units.length; index++) {
				if (!this.units[index]
						.isDamageMarkRegistered(explosionRegister[explosionIndex].explosionInstanceId)
						&& this.units[index].gameCore.playerId == this.currentPlayer.playerId
						&& this.units[index].gameCore.playerId != explosionRegister[explosionIndex].ownerId
						&& explosionHitTest(explosionRegister[explosionIndex],
								this.units[index].getCollisionLayers())) {
					this.units[index].markDamage(explosionRegister[explosionIndex].explosionInstanceId);
					this.serverAPI.requestDamageSubmission([this.units[index]], damageAmount, explosionRegister[explosionIndex].ownerId);
				}
			}

		}
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

// REMOVE THIS ONCE SERVER SIDE RANGE CHECK IS DONE
Engine.prototype.isSquareWithinBaseRange = function(col, row) {
	return (row <= (this.spawnPoint.row+4) && row >= (this.spawnPoint.row-4)
			&& col <= (this.spawnPoint.col+4) && col >= (this.spawnPoint.col-4));
}

Engine.prototype.isSquareEmpty = function(col, row) {
	
	// Run check against map manager
	if (this.mapRender.isCellObstructed(new Cell(col, row))) {
		return false;
	}
	
	// Generate list of all items to process
	var potentialObstructions = this.buildings.concat(this.units);
	
	// Loop through all potential matches identifying cells to check
	for (var index = 0; index < potentialObstructions.length; index++) {
		var cells = potentialObstructions[index].getCells();
		for (var cellIndex = 0; cellIndex < cells.length; cellIndex ++) {
			if (cells[cellIndex].col == col && cells[cellIndex].row == row) {
				return false;
			}
		}
	}
	
	// Return empty if nothing was found
	return true;
}

Engine.prototype.createNewBuildingObject = function(gameCore) {

	// Create new object and return
	this.phaserGame.newBuilding.active = true;
	this.phaserGame.newBuilding.target = new Turret(this.engineCore, gameCore,
			this.mapGroup, this.turretGroup, gameCore.cell.toPoint(),
			gameCore.cell.col, gameCore.cell.row, 100, 100, true);
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
	
	// Function to determine type of object being placed
	var getObjectType = function(identifier) {
		for (var buildingIndex = 0; buildingIndex < CONSTANTS.GAME_BUILDINGS.length; buildingIndex ++) {
			if (identifier == CONSTANTS.GAME_BUILDINGS[buildingIndex].identifier) {
				return "BUILDING";
			}
		}
		for (var unitIndex = 0; unitIndex < CONSTANTS.GAME_UNITS.length; unitIndex ++) {
			if (identifier == CONSTANTS.GAME_UNITS[unitIndex].identifier) {
				return "UNIT";
			}
		}
		return "UNKNOWN";
	}

	// Define worker variables
	var mockUnitResponseData = { responseCode: "DEBUG_PLACEMENT", coords: [], misc: [], source: [], target: [] };
	var mockBuildingResponseData = { responseCode: "NEW_BUILDING", coords: [], misc: [], source: [], target: [] };
	var arrayIdentifier = null;
	
	// Construct building and unit arrays
	for (var index = 0; index < responseData.source.length; index ++) {
		
		// Add to correct array
		arrayIdentifier = getObjectType(responseData.source[index]);
		
		// Populate unit array
		if (arrayIdentifier == "UNIT") {
			mockUnitResponseData.coords.push(responseData.coords[index]);
			mockUnitResponseData.misc.push(responseData.misc[index]);
			mockUnitResponseData.source.push(responseData.source[index]);
			mockUnitResponseData.target.push(responseData.target[index]);
		}
		
		// Populate building array
		if (arrayIdentifier == "BUILDING") {
			console.log("Hub placed at: (" + responseData.coords[index].col + "," + responseData.coords[index].row + ")");
			mockBuildingResponseData.coords.push(responseData.coords[index]);
			mockBuildingResponseData.misc.push(responseData.misc[index]);
			mockBuildingResponseData.source.push(responseData.source[index]);
			mockBuildingResponseData.target.push(responseData.target[index]);			
		}
	}

	// Submit mock request arrays
	this.processDebugPlacement(mockUnitResponseData, true);
	this.processNewBuilding(mockBuildingResponseData, true);
}

Engine.prototype.processPurchaseObject = function(responseData) {

	// Identify object from response
	var gameObject = this.getObjectFromIdentifier(responseData.source[0]);
	
	// Purchase finished callback
	var self = this;
	var purchaseFinished = function() {
		
		// Locate purchase object from player and purchaseObjectId 
		var purchaseObject = self.currentPlayer.getPurchase(responseData.target[0]);
		
		// Run purchase finished request
		self.serverAPI.purchaseFinishedRequest(purchaseObject);
		
		// Log to screen finished purchase
		console.log("READY: " + responseData.target[0]);
	}
	
	// Begin purchase timer with appropriate callback
	console.log("BOUGHT: " + responseData.target[0]);
	var purchaseTimeout = setTimeout(purchaseFinished, 3000);
	var purchaseObject = { gameObject: gameObject.identifier, instanceId: responseData.target[0], purchaseTimeout: purchaseTimeout };
	
	// Add item to list of purchased items
	this.currentPlayer.addPurchase(purchaseObject);
	
	// Deduct cash from player
	this.currentPlayer.reduceCash(gameObject.cost);
}

Engine.prototype.processPurchasePending = function(responseData) {
	
}

Engine.prototype.processPurchaseFinished = function(responseData) {

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
				newUnitObject = new Tank(this.engineCore, gameCore, this.mapGroup, this.tankGroup, spawnPoint, spawnCell.col, spawnCell.row, 100, 100, false);
				break;
		}
		
		// Make sure new unit was created
		if (newUnitObject) {
			
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
				self.units.push(newUnitObject);
				
				// Run hub reset animation
				tankHub.resetTankHub();
			}
		
			// Construct tank animation from hub
			tankHub.animateTankCreate(newUnitObject, function() {

				// Add object to unit array
				self.units.push(newUnitObject);
			});
		}
	}
}

Engine.prototype.processNewBuilding = function(responseData, keepCash) {

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
		
		// Deduct cost from player
		var newObject = this.getObjectFromIdentifier(refObject.identifier);
		if(refObject.playerId == this.currentPlayer.playerId && !keepCash) {
			this.currentPlayer.cash -= newObject.cost;
			this.moneyLabel.setText(this.currentPlayer.cash); // Redraw player money label
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
				break;
		}
		
		// Make sure new building was made 
		if (newBuilding) {
			
			// Add object to building array
			this.buildings.push(newBuilding);
		}
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
		if (target != null && source != null) {
			source.lockonAndShoot(target);
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
				this.gameObjectHealthText.setText(Math.floor((gameObject.gameCore.health / gameObject.gameCore.maxHealth)*100) + "%");
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

Engine.prototype.processDebugPlacement = function(responseData, keepCash) {

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
		
		// deduct cost from player's cash
		if(refObject.playerId == this.currentPlayer.playerId && !keepCash) {

			this.currentPlayer.cash -= CONSTANTS.GAME_UNITS[0].cost;
			this.moneyLabel.setText(this.currentPlayer.cash); // Redraw player money label						merge conflickt

		}

		// Create GameCore object
		var gameCore = new GameCore("TANK", refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);

		// Create self reference
		var self = this;

		// Construct object for positioning
		var newTank = new Tank(this.engineCore, gameCore, this.mapGroup, this.tankGroup, refObject.xy, refObject.cell.col, refObject.cell.row, 100, 100, false);

		// Add object to unit array
		this.units.push(newTank);
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
			case "NEW_BUILDING":
				this.processNewBuilding(responseData, false);
				break;
			case "PURCHASE_OBJECT":
				this.processPurchaseObject(responseData);
				break;
			case "PURCHASE_PENDING":
				this.processPurchasePending(responseData);
				break;
			case "UNIT_PURCHASE_FINISHED":
				this.processPurchaseFinished(responseData);
				break;
				
			case "DEFENCE_ATTACK_XY":
				this.processDefenceAttackXY(responseData);
				break;
			case "OBJECT_ATTACK_OBJECT":
				this.processObjectAttackObject(responseData);
				break;
			case "WAYPOINT_PATH_COORDS":
				this.processWaypoints(responseData);
				break;
			case "DAMAGE_OBJECT":
				this.processUnitDamage(responseData);
				break;
			case "DEBUG_PLACEMENT":
				this.processDebugPlacement(responseData);
				break;
			case "INSUFFICIENT_FUNDS":
				this.processInsufficientFunds(responseData);
				break;
			case "SETUP_SPAWN_OBJECTS":
				this.processSetupSpawnObjects(responseData);
				break;
			default:
				// Do nothing
				break;
		}
	}
}
