function MapRenderer(phaserRef, mapGroup, mapOverlayGroup, width, height, cells, screenCellWidth, screenCellHeight) {
	
	// Save passed phaser reference
	this.phaserRef = phaserRef;
	
	// Save map data
	this.cells = cells;
	this.width = width;
	this.height = height;
	
	// Save screen information
	this.screenCellWidth  = screenCellWidth;
	this.screenCellHeight = screenCellHeight;
	
	// Create map tile function
	var mapTile = function(baseSource, detailSource, angle) {
		var newMapTile = {baseSource : baseSource, detailSource : null, angle: 0};
		if (detailSource) { newMapTile.detailSource = detailSource; }
		if (angle) { newMapTile.angle = angle; }
		return result;
	}
	
	// Create tile-map mapping
	this.tileMapping = {};
	this.tileMapping[0] = mapTile(CONSTANTS.MAP_TILE_A);
	this.tileMapping[1] = mapTile(CONSTANTS.ROCK_TILE_A);
	this.tileMapping[2] = mapTile(CONSTANTS.ROCK_TILE_B);
	this.tileMapping[3] = mapTile(CONSTANTS.EDGE_ROCKS_TOP);
	this.tileMapping[4] = mapTile(CONSTANTS.EDGE_ROCKS_RIGHT);
	this.tileMapping[5] = mapTile(CONSTANTS.EDGE_ROCKS_BOTTOM);
	this.tileMapping[6] = mapTile(CONSTANTS.EDGE_ROCKS_LEFT);
	this.tileMapping[7] = mapTile(CONSTANTS.CORNER_ROCKS_TOP_LEFT);
	this.tileMapping[8] = mapTile(CONSTANTS.CORNER_ROCKS_TOP_RIGHT);
	this.tileMapping[9] = mapTile(CONSTANTS.CORNER_ROCKS_BOTTOM_LEFT);
	this.tileMapping[10] = mapTile(CONSTANTS.CORNER_ROCKS_BOTTOM_RIGHT);
	
	// Create map images
	this.mapTiles = [];
	// sprite - tile image sprite
	// 
	// building - any building taking up square
	//
	
	// Save local reference to this
	var self = this;
	var createMapTile = function(cellId, col, row) {

		// Create sprite for current tile
		var baseSprite = null;
		var detailSprite = null;
		if (self.tileMapping[cellId]) {
			
			// Create base sprite
			if (self.tileMapping[cellId].baseSource) {
				baseSprite = self.phaserRef.add.sprite(
						CONSTANTS.TILE_WIDTH * col, 
						CONSTANTS.TILE_HEIGHT * row,
						CONSTANTS.MAP_TILE_SPRITESHEET,
						self.tileMapping[cellId].baseSource);
				baseSprite.width = CONSTANTS.TILE_WIDTH;
				baseSprite.height = CONSTANTS.TILE_HEIGHT;
				mapGroup.add(baseSprite);
			}
			
			// Create detail sprite
			if (self.tileMapping[cellId].detailSource) {
				detailSprite = self.phaserRef.add.sprite(
						CONSTANTS.TILE_WIDTH * col, 
						CONSTANTS.TILE_HEIGHT * row,
						CONSTANTS.MAP_TILE_SPRITESHEET,
						self.tileMapping[cellId].detailSource);
				detailSprite.width = CONSTANTS.TILE_WIDTH;
				detailSprite.height = CONSTANTS.TILE_HEIGHT;
				mapGroup.add(detailSprite);
			}
			
			// Rotate detail sprite
			if (detailSprite) {
				detailSprite.angle = self.tileMapping[cellId].angle;
			}
		}
		
		// Create hover placement sprites
		var placementSprite = self.phaserRef.add.sprite(CONSTANTS.TILE_WIDTH * col, CONSTANTS.TILE_HEIGHT * row, CONSTANTS.MAP_TILE_PLACEMENT, 1);
		placementSprite.width = CONSTANTS.TILE_WIDTH;
		placementSprite.height = CONSTANTS.TILE_HEIGHT;
		placementSprite.visible = false;
		mapOverlayGroup.add(placementSprite);
		
		// Save new sprites
		this.baseSprite = baseSprite;
		this.detailSprite = detailSprite;
		this.placementSprite = placementSprite;
		
	}
	
	// Generate map sprites
	var colIndex = 0;
	var rowIndex = 0;
	for (var index = 0; index < this.cells.length; index ++) {
		
		// Add new map tile
		this.mapTiles.push(new createMapTile(this.cells[index], colIndex, rowIndex));
		
		// Check if reached the end of the row
		if (colIndex >= this.width-1) { rowIndex ++; colIndex = 0; } else { colIndex ++; }
	}
	
}

MapRenderer.prototype.isCellInMap = function(cell) {
	return (cell.col >= 0 && cell.col < this.width &&
			cell.row >= 0 && cell.row < this.height);
}

MapRenderer.prototype.getTileFromColRow = function(col, row) {
	if (col + row * this.width < this.mapTiles.length) {
		return this.mapTiles[col + row * this.width];
	} else {
		return null;
	}
}

MapRenderer.prototype.placementHover = function(col, row, canPlace) {
	
	// Define local variables
	var hoverTile = null;
	
	// Iterate through all tiles
	for (var rowIndex = 0; rowIndex < this.height; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.width; colIndex ++) {
			
			// Create cell reference
			hoverTile = this.getTileFromColRow(colIndex, rowIndex);
			
			// Check for tile retrieval success
			if (hoverTile) {
				if (col == colIndex && row == rowIndex) {
					if (canPlace) {
						hoverTile.placementSprite.frame = 1;
					} else {
						hoverTile.placementSprite.frame = 2;
					}
					hoverTile.placementSprite.visible = true;
				} else {
					hoverTile.placementSprite.visible = false;
				}
			}
			
		}
	}
	
}

MapRenderer.prototype.clearPlacementHover = function() {

	// Iterate through all tiles
	for (var rowIndex = 0; rowIndex < this.height; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.width; colIndex ++) {
			hoverTile = this.getTileFromColRow(colIndex, rowIndex);
			if (hoverTile) { hoverTile.placementSprite.visible = false; }
		}
	}
}

MapRenderer.prototype.placeTankTrack = function(mapGroup, sender, point, angle) {

	// Check phaser ref is assigned
	if (this.phaserRef) {

		// Save reference to this for local calls
		var self = this;

		// Create tank track sprite
		var tankTracks = this.phaserRef.add.sprite(point.x, point.y, CONSTANTS.SPRITE_TANK_TRACKS, 0);
		tankTracks.z = 0;
		tankTracks.angle = angle;
		tankTracks.anchor.setTo(0.5, 0.5);
		mapGroup.add(tankTracks);
		
		// Set animation completed event
		var fadeOut = tankTracks.animations.add('localTankTracks');
		fadeOut.onComplete.add(function(sprite, animation) {
			sprite.animations.destroy();
			sprite.destroy();
		});
		
		// Play fade out animation
		fadeOut.play(0.25, false, null);
	}
}

MapRenderer.prototype.renderMap = function() {
	
}