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
	this.phaserGame = new Phaser.Game(800, 600, Phaser.CANVAS,
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
				0);
		this.players.push(newPlayer);
		if (gameplayConfig.userName[index] == playerId) {
			this.currentPlayer = newPlayer;
			this.currentPlayer.playerCash = gameplayConfig.startingCash;
		}
	}

	// Save and setup server object
	this.serverAPI = serverAPI;

	// Define core phaser objects
	this.engineCore = null;
	this.mapRender = null;
	this.explosionManager = null;
	this.gameplayConfig = gameplayConfig;
	this.mouse = {
		x : 0,
		y : 0
	};

	// Define game camera variables
	this.cursors = null;
	
	// Define game object arrays
	this.units = [];
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
	this.tankGroup = null;

	// player results
	this.playerResults = [];
}

Engine.prototype.preload = function() {

	// Set system to render even when not active
	this.phaserGame.stage.disableVisibilityChange = true;

	// Load sprite sheets
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_CURSORS, CONSTANTS.ROOT_SPRITES_LOC + 'cursors.png', 32, 32, 28);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TURRET, CONSTANTS.ROOT_SPRITES_LOC + 'turret.png', 100, 100, 78);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK, CONSTANTS.ROOT_SPRITES_LOC + 'tank.png', 100, 100, 41);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_TANK_TRACKS, CONSTANTS.ROOT_SPRITES_LOC + 'tank_tracks.png', 48, 34, 4);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_IMPACT_DECALS, CONSTANTS.ROOT_SPRITES_LOC + 'impactDecals.png', 50, 50, 4);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_A, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionA.png', 50, 50, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_B, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionB.png', 128, 128, 10);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_C, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionC.png', 120, 120, 20);
	this.phaserGame.load.spritesheet(CONSTANTS.SPRITE_EXPLOSION_D, CONSTANTS.ROOT_SPRITES_LOC + 'p_explosionD.png', 96, 96, 20);
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_PLACEMENT, CONSTANTS.ROOT_SPRITES_LOC + 'tile_selections.png', 100, 100, 3);

	// Load tile images
	this.phaserGame.load.spritesheet(CONSTANTS.MAP_TILE_SPRITESHEET, CONSTANTS.ROOT_SPRITES_LOC + 'map_tiles.png', 100, 100, 16);

	// Load particles
	this.phaserGame.load.image(CONSTANTS.PARTICLE_YELLOW_SHOT, CONSTANTS.ROOT_SPRITES_LOC + 'p_yellowShot.png');

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
	this.tankGroup = this.phaserGame.add.group();
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
			this.phaserGame.height / CONSTANTS.TILE_EIGHT);

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

	this.moneyLabel = this.phaserGame.add.text(650, 5, "Money: " + this.currentPlayer.playerCash, style);
	this.moneyLabel.fixedToCamera = true;

	// Create cursor object
	this.pointer = { sprite : null, point : new Point(0, 0) };
	this.pointer.sprite = this.phaserGame.add.sprite(0, 0, CONSTANTS.SPRITE_CURSORS, 0);
	this.pointer.sprite.z = 100;
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_NORMAL, CONSTANTS.CURSOR_SPRITE_NORMAL, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_NORMAL_ENEMY, CONSTANTS.CURSOR_SPRITE_NORMAL_ENEMY, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_INVALID, CONSTANTS.CURSOR_SPRITE_INVALID, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_ATTACK, CONSTANTS.CURSOR_SPRITE_ATTACK, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_FORCE_ATTACK, CONSTANTS.CURSOR_SPRITE_FORCE_ATTACK, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_MOVE, CONSTANTS.CURSOR_SPRITE_MOVE, 30, true);
	this.pointer.sprite.animations.add(CONSTANTS.CURSOR_MOVE_CLICK, CONSTANTS.CURSOR_SPRITE_MOVE_CLICK, 30, true);
	this.pointer.sprite.animations.play(CONSTANTS.CURSOR_NORMAL);
	this.highestGroup.add(this.pointer.sprite);

	// Position camera over spawn point
	for (var index = 0; index < this.players.length; index++) {
		if (this.players[index].playerId == this.currentPlayer.playerId) {
			var spawnPoint = new Cell(this.gameplayConfig.spawnCoordinates[index].col,
					this.gameplayConfig.spawnCoordinates[index].row);
			this.positionCameraOverCell(spawnPoint);
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
    
    // Update player money label
    this.moneyLabel.setText("Money: " + this.currentPlayer.playerCash);
    
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

	// Search for collisions between fireable objects
	this.explosionCollisionCheck();

	// Update pointer position
	this.updatePointerPosition();

	// Get state of players in game
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
		for (var lineX = healthBarBounds.left; lineX < healthBarBounds.left + healthBarBounds.width * healthPercent; lineX += 5) {
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
				this.phaserGame.debug.geom(new Phaser.Circle(this.selected[selectedIndex].left, this.selected[selectedIndex].top, this.selected[selectedIndex].gameCore.range), 'rgba(255,255,255,0.6)', false);
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
	var itemAtPoint = this.getItemAtPoint(new Point(this.mouse.x, this.mouse.y), true, false);
	
	// Set new selection if one does not already exist
	if (itemAtPoint) {
		this.selected = [itemAtPoint];
		this.selectedJustSet = true;
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
	var point = new Point(this.mouse.x, this.mouse.y);
	var cell = point.toCell();

	// Perform checks for left click
	if (pointer.leftButton.isDown) {

		// Create new building
		if (this.phaserGame.newBuilding.active) {

			// Render placement overlay
			if (this.isSquareEmpty(cell.col, cell.row)) {
				self.phaserGame.newBuilding.target.setPosition(cell);
				this.serverAPI.requestBuildingPlacement(this.phaserGame.newBuilding);
				self.phaserGame.newBuilding.active = false;
				self.mapRender.clearPlacementHover();
			}

		// Manage selected units
		} else if (this.selected.length > 0) {

			// Process selected items
			for (var selectedIndex = 0; selectedIndex < this.selected.length; selectedIndex++) {

				// Process selected tank
				if (this.selected[selectedIndex].gameCore.identifier == "TANK") {
					if (this.isSquareEmpty(cell.col, cell.row)) {
						var targetUnit = this.selected[0];
						if (targetUnit) {
							if (ctrlDown) {
								targetUnit.shootAtXY(point);
							} else {
								this.serverAPI.requestUnitMoveCell(targetUnit, cell);
							}
						}
					}
				}

				// Process selected turret
				if (this.selected[selectedIndex].gameCore.identifier == "TURRET") {
					var sourceObjectId = this.selected[selectedIndex].gameCore.instanceId;
					var itemAtPoint = this.getItemAtPoint(point, false, true);
					if (itemAtPoint) {
						var targetObjectId = itemAtPoint.gameCore.instanceId;
						this.serverAPI.requestObjectAttackObject(sourceObjectId, targetObjectId);
					}
//					this.serverAPI.requestDefenceAttackXY([this.selected[selectedIndex]], this.mouse.x,this.mouse.y);
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
		}
	}

	// Perform checks for right click
	if (pointer.rightButton.isDown) {
		this.selected = [];
	}

}

Engine.prototype.onMouseMove = function(pointer, x, y) {

	// Save position information
	this.mouse.x = this.phaserGame.camera.x + x;
	this.mouse.y = this.phaserGame.camera.y + y;

	// Update pointer position
	this.updatePointerPosition();

	// Process updates for selection rectangle
	if (pointer.isDown) {
		
		// Reset selected items
		if (this.selectionRectangle.selectActive
				&& this.selectionRectangle.rect.width * this.selectionRectangle.rect.height > 40) {
			this.selected = [];
			this.hoverItem = null;
		}

		// Set new rectangle selection coordinates
		this.selectionRectangle.selectActive = true;
		this.selectionRectangle.rect.width = (this.mouse.x - this.selectionRectangle.originX);
		this.selectionRectangle.rect.height = (this.mouse.y - this.selectionRectangle.originY);

	} else {

		// Run search for any selected units
		if (this.selectionRectangle.selectActive
				&& this.selectionRectangle.rect.width
						* this.selectionRectangle.rect.height > 40) {
			this.selected = this.getSelectionArray();
		}

		// Mark selection as not active and reset
		this.selectionRectangle.selectActive = false;
		this.selectionRectangle.rect.x = this.mouse.x;
		this.selectionRectangle.rect.y = this.mouse.y;
		this.selectionRectangle.originX = this.mouse.x;
		this.selectionRectangle.originY = this.mouse.y;
		this.selectionRectangle.rect.width = 0;
		this.selectionRectangle.rect.height = 0;

		// Select hover items
		this.hoverItem = this.getItemAtPoint(new Point(this.mouse.x, this.mouse.y), true, true);
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

	// Check if creating a new object
	if (char == '1' || char == '2' || char == '3') {

		// Game core object
		var self = this;
		var cell = (new Point(this.mouse.x, this.mouse.y)).toCell();

		// Set active building object
		if (char == '1') {
			var gameCore = new GameCore("TURRET", cell);
			gameCore.setPlayer(this.currentPlayer);
			this.createNewBuildingObject(gameCore);
		}

		// Set active building object -phaserRef, -mapGroup, -tankGroup, -xy,
		// width, height, func_explosionRequest
		if (char == '2') {
			var gameCore = new GameCore("TANK", cell);
			gameCore.setPlayer(this.currentPlayer);
			this.phaserGame.newBuilding.active = true;
			this.phaserGame.newBuilding.target = new Tank(this.engineCore,
					gameCore, this.mapGroup, this.tankGroup, cell.toPoint(),
					cell.col, cell.row, 100, 100, true);
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


// ------------------------------ UTILITY METHODS ------------------------------ //

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
	var itemAtPoint = this.getItemAtPoint(new Point(this.mouse.x, this.mouse.y), true, true);
	
	// Get ctrl state
	var ctrlState = this.phaserGame.input.keyboard.isDown(Phaser.Keyboard.CONTROL);
	
	// Process selection for nothing
	if (nothingSelected) {
		if (!itemAtPoint || itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
			this.updatePointerForm(CONSTANTS.CURSOR_NORMAL);
		} else {
			this.updatePointerForm(CONSTANTS.CURSOR_NORMAL_ENEMY);
		}
	}
	
	// Process selection for unit
	if (unitSelected) {
		if (!itemAtPoint) {
			this.updatePointerForm(CONSTANTS.CURSOR_SPRITE_MOVE);
		} else {
			if (itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
				this.updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			} else {
				this.updatePointerForm(CONSTANTS.CURSOR_ATTACK);
			}
		}
	}

	// Process selection for defence
	if (defenceSelected) {
		if (itemAtPoint) {
			if (itemAtPoint.gameCore.playerId == this.currentPlayer.playerId) {
				this.updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			} else {
				this.updatePointerForm(CONSTANTS.CURSOR_ATTACK);
			}
		} else {
			if (ctrlState) {
				this.updatePointerForm(CONSTANTS.CURSOR_FORCE_ATTACK);
			} else {
				this.updatePointerForm(CONSTANTS.CURSOR_NORMAL);
			}
		}
	}
	
	// Process selection for building
	if (buildingSelected) {
		
	}
}

Engine.prototype.updatePointerPosition = function(point) {
	
	// Check if point was passed (default to cursor)
	if (!point) { point = new Point(this.mouse.x, this.mouse.y); }
	
	// Position sprite at mouse point
	this.pointer.sprite.x = point.x;
	this.pointer.sprite.y = point.y;
}

Engine.prototype.updatePointerForm = function(formId) {
	
	// Check for special case forms
	
	// Run standard conversion straight to passed form
	this.pointer.sprite.animations.play(formId);

//	this.pointer.sprite = this.phaserGame.add.sprite(0, 0, CONSTANTS.SPRITE_CURSORS, 0);
//	this.turretSegment.animations.add(, CONSTANTS.CURSOR_SPRITE_NORMAL, 30, true);
//	this.turretSegment.animations.add(, CONSTANTS.CURSOR_SPRITE_NORMAL_ENEMY, 30, true);
//	this.turretSegment.animations.add(CONSTANTS.CURSOR_INVALID, CONSTANTS.CURSOR_SPRITE_INVALID, 30, true);
//	this.turretSegment.animations.add(CONSTANTS.CURSOR_ATTACK, CONSTANTS.CURSOR_SPRITE_ATTACK, 30, true);
//	this.turretSegment.animations.add(CONSTANTS., CONSTANTS.CURSOR_SPRITE_FORCE_ATTACK, 30, true);
//	this.turretSegment.animations.add(CONSTANTS.CURSOR_MOVE, CONSTANTS.CURSOR_SPRITE_MOVE, 30, true);
//	this.turretSegment.animations.add(CONSTANTS.CURSOR_MOVE_CLICK, CONSTANTS.CURSOR_SPRITE_MOVE_CLICK, 30, true);
//	this.turretSegment.animations.play(CONSTANTS.CURSOR_NORMAL);
}

Engine.prototype.positionCameraOverCell = function(cell) {
	
	// Calculate map bounds
	var mapBound = Math.ceil(this.mapRender.screenCellWidth / 2);
	var mapBounds = {
		left: mapBound,
		right: this.mapRender.width,
		top: mapBound,
		bottom: this.mapRender.height,
	}
	
	// Calculate centre cell
	cell.col = Math.min(mapBounds.right, Math.max(cell.col, mapBounds.left));
	cell.row = Math.min(mapBounds.bottom, Math.max(cell.row, mapBounds.top));
	
	// Move camera to centralise cell
	this.phaserGame.camera.x = (cell.col - mapBounds.left) * CONSTANTS.TILE_WIDTH;
	this.phaserGame.camera.y = (cell.row - mapBounds.top) * CONSTANTS.TILE_HEIGHT;
}

Engine.prototype.manageMapMovement = function() {

	// Update camera with up and down keys
	if (this.cursors.up.isDown) { this.phaserGame.camera.y -= CONSTANTS.CAMERA_VELOCITY; }
    else if (this.cursors.down.isDown) { this.phaserGame.camera.y += CONSTANTS.CAMERA_VELOCITY; }

	// Update camera with left and right keys
    if (this.cursors.left.isDown) { this.phaserGame.camera.x -= CONSTANTS.CAMERA_VELOCITY; }
    else if (this.cursors.right.isDown) { this.phaserGame.camera.x += CONSTANTS.CAMERA_VELOCITY; }
}

Engine.prototype.updatePlayerStatus = function() {
	var self = this;
	var deadPlayers = self.players.slice();

	var removeArray = [];
	
	for (var index = 0; index < deadPlayers.length; index++) {
		if (!deadPlayers[index].hasPlacedObject) {
			removeArray.push(index);
		}
	}
	
	for (var index = (removeArray.length-1); index >= 0; index--) {
		deadPlayers.splice(removeArray[index], 1);
	}
	
	self.units.filter(function(unit) {
		for (var index = 0; index < deadPlayers.length; index++) {
			if (unit.gameCore.playerId === deadPlayers[index].playerId) {
				deadPlayers.splice(index, 1);
				break;
			}
		}
	});

	self.buildings.filter(function(building) {
		for (var index = 0; index < deadPlayers.length; index++) {
			if (building.gameCore.playerId === deadPlayers[index].playerId) {
				deadPlayers.splice(index, 1);
				break;
			}
		}
	});

	if (deadPlayers.length > 0) {
		for (var i1 = 0; i1 < deadPlayers.length; i1++) {
			var playerAlreadyDead = false;

			for (var i2 = 0; i2 < self.playerResults.length; i2++) {
				if (self.playerResults[i2].player === deadPlayers[i1].playerId) {
					playerAlreadyDead = true;
					break;
				}
			}

			if (!playerAlreadyDead) {
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
			if (!isDead) {
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

Engine.prototype.updateNewUnitCell = function(sender, oldCell, newCell) {

	// Check if sender is unit owner
	if (sender.gameCore.playerId == this.currentPlayer.playerId) {

		// Submit update message to server
		this.serverAPI.requestUpdateUnitCell(sender, newCell);

		// Debugging output
		// console.log("UpdateCell (" + newCell.col + "," + newCell.row + ")");
	}

}

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
	this.phaserGame.newBuilding.target = new Turret(this.engineCore, gameCore,
			this.mapGroup, this.turretGroup, gameCore.cell.toPoint(),
			gameCore.cell.col, gameCore.cell.row, 100, 100, true);
}

Engine.prototype.purchaseObject = function(item) {
	
	var cell = (new Point(this.mouse.x, this.mouse.y)).toCell();

	if (item === "TURRET") {
		var gameCore = new GameCore("TURRET", cell);
		gameCore.setPlayer(this.currentPlayer);
		this.createNewBuildingObject(gameCore);
		console.log("TURRET PURCHASED");
	} else if (item === "TANK") {
		var gameCore = new GameCore("TANK", cell);
		gameCore.setPlayer(this.currentPlayer);
		this.phaserGame.newBuilding.active = true;
		this.phaserGame.newBuilding.target = new Tank(this.engineCore,
				gameCore, this.mapGroup, this.tankGroup, cell.toPoint(),
				cell.col, cell.row, 100, 100, true);
		console.log("TANK PURCHASED");
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
		
		// deduct cost from player
		if(refObject.playerId == this.currentPlayer.playerId && !keepCash) {
			this.currentPlayer.playerCash -= CONSTANTS.GAME_BUILDINGS[0].cost;
		}

		// Create GameCore object
		var gameCore = new GameCore("TURRET", refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);

		// Construct object for positioning
		var newBuilding = new Turret(this.engineCore, gameCore, this.mapGroup,
				this.turretGroup, refObject.xy, refObject.col, refObject.row,
				100, 100, false);

		// Add object to building array
		this.buildings.push(newBuilding);
		
		//ONLY USED FOR TESTING PURPOSES, REMOVE ONCE BASES ARE PLACED BY DEFAULT.
		for(var index = 0; index < this.players.length; index++) {
			if(!this.players[index].hasPlacedObject && this.players[index].playerId === refObject.playerId) {
				this.players[index].hasPlacedObject = true;
				break;
			}
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

			// Determine if unit was destroyed
			if (gameObject.gameCore.health == 0) {
				this.explosionManager.requestDestruction(this.mapGroup,
						CONSTANTS.DEBRIS_TANK, CONSTANTS.SPRITE_EXPLOSION_C,
						gameObject.left, gameObject.top);
				removeList.push(refObject.instanceId);
				
				console.log(refObject.killer);
				if(refObject.killer == this.currentPlayer.playerId) {
					this.currentPlayer.playerCash += Math.floor(gameObject.gameCore.cost*1.2);
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
			this.currentPlayer.playerCash -= CONSTANTS.GAME_UNITS[0].cost;
		}

		// Create GameCore object
		var gameCore = new GameCore("TANK", refObject.cell);
		gameCore.setInstanceId(refObject.instanceId);
		gameCore.setPlayer(refObject.player);

		// Create self reference
		var self = this;

		// Construct object for positioning
		var newTank = new Tank(this.engineCore, gameCore, this.mapGroup, this.tankGroup, refObject.xy, refObject.col, refObject.row, 100, 100, false);

		// Add object to unit array
		this.units.push(newTank);

		//ONLY USED FOR TESTING PURPOSES, REMOVE ONCE BASES ARE PLACED BY DEFAULT.
		for(var index = 0; index < this.players.length; index++) {
			if(!this.players[index].hasPlacedObject && this.players[index].playerId === refObject.playerId) {
				this.players[index].hasPlacedObject = true;
				break;
			}
		}
	}
}

Engine.prototype.processInsufficientFunds = function(responseData) {
	
	// iterate through all of the buildings
	for (var index = 0; index < responseData.source.length; index++) {
		var refObject = {
			playerId : responseData.target[index],
			playerCash : responseData.source[index]
		};
	
		if(refObject.playerId == this.currentPlayer.playerId) {
			this.currentPlayer.playerCash = parseInt(refObject.playerCash);
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
				this.processNewBuilding(responseData);
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
