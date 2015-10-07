function MapRenderer(phaserRef, mapGroup, mapOverlayGroup, fogOfWarGroup, width, height, cells, screenCellWidth, screenCellHeight) {
	
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
		return newMapTile;
	}

	// Create tile-map mapping
	this.tileMapping = {};

	// BASE TILES
	this.tileMapping[0]  = mapTile(CONSTANTS.MAP_BASE_DIRT);											// Base dirt tile
	this.tileMapping[1]  = mapTile(CONSTANTS.MAP_BASE_GRASS);											// Base grass tile
	this.tileMapping[2]  = mapTile(CONSTANTS.MAP_BASE_WATER);											// Base water tile
	this.tileMapping[3]  = mapTile(CONSTANTS.MAP_BASE_ROCK);											// Base rock tile

	// ROCK DETAILS
	// ROCK EDGES
	this.tileMapping[8]  = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_EDGE, 0);		// Rock right
	this.tileMapping[9]  = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_EDGE, 90);		// Rock bottom
	this.tileMapping[10] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_EDGE, 180);		// Rock left
	this.tileMapping[11] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_EDGE, -90);		// Rock top

	// ROCK CORNERS
	this.tileMapping[12] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_CORNER, 0);		// Rock corner top right
	this.tileMapping[13] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_CORNER, 90);		// Rock corner bottom right
	this.tileMapping[14] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_CORNER, 180);	// Rock corner bottom left
	this.tileMapping[15] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_CORNER, -90);	// Rock corner top left

	// MISC ROCK
	this.tileMapping[16] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_A, 0);			// Rock A - dense  - dirt
	this.tileMapping[17] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_B, 0);			// Rock B - dense  - dirt
	this.tileMapping[18] = mapTile(CONSTANTS.MAP_BASE_WATER, CONSTANTS.MAP_DETAIL_ROCKS_C, 0);			// Rock C - sparse - water
	this.tileMapping[19] = mapTile(CONSTANTS.MAP_BASE_WATER, CONSTANTS.MAP_DETAIL_ROCKS_D, 0);			// Rock D - sparse - water
	this.tileMapping[20] = mapTile(CONSTANTS.MAP_BASE_WATER, CONSTANTS.MAP_DETAIL_ROCKS_E, 0);			// Rock E - sparse - water

	// WATER DETAILS
	// WATER EDGES
	this.tileMapping[23] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_BOTTOM, 0);		// Water bottom
	this.tileMapping[24] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_LEFT, 0);		// Water left
	this.tileMapping[25] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_TOP, 0);			// Water top
	this.tileMapping[26] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_RIGHT, 0);		// Water right

	// WATER CORNERS
	this.tileMapping[27] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_TL, 0);			// Water top left
	this.tileMapping[28] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_BL, 0);			// Water bottom left
	this.tileMapping[29] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_TR, 0);			// Water top right
	this.tileMapping[30] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_BR, 0);			// Water bottom right

	// SHORE DETAILS
	// SHORE EDGES
	this.tileMapping[31] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_TOP, 0);			// Shore bottom
	this.tileMapping[32] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_RIGHT, 0);		// Shore left
	this.tileMapping[33] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_BOTTOM, 0);		// Shore top
	this.tileMapping[34] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_LEFT, 0);		// Shore right

	// SHORE CORNERS
	this.tileMapping[35] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_BR, 0);			// Shore bottom right
	this.tileMapping[36] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_TR, 0);			// Shore top right
	this.tileMapping[37] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_BL, 0);			// Shore bottom left
	this.tileMapping[38] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_TL, 0);			// Shore top left

	// GRASS DETAILS
	// GRASS EDGES
	this.tileMapping[39] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_TOP, 0);			// Grass top
	this.tileMapping[40] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_RIGHT, 0);		// Grass right
	this.tileMapping[41] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_BOTTOM, 0);		// Grass bottom
	this.tileMapping[42] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_LEFT, 0);		// Grass left

	// GRASS CORNERS
	this.tileMapping[43] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_BR, 0);			// Grass bottom right
	this.tileMapping[44] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_TR, 0);			// Grass top right
	this.tileMapping[45] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_BL, 0);			// Grass bottom left
	this.tileMapping[46] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_TL, 0);			// Grass top left

	// ROAD ON DIRT
	this.tileMapping[47] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_VERT, 0);			//
	this.tileMapping[48] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_HORI, 0);			//
	this.tileMapping[49] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_VERT_JUNCT, 0);	//
	this.tileMapping[50] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_VERT_JUNCT, 180);	//
	this.tileMapping[51] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_HORI_JUNCT, 0);	//
	this.tileMapping[52] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_HORI_JUNCT, 180);	//
	this.tileMapping[53] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_VERT_END, 0);		//
	this.tileMapping[54] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_VERT_END, 180);	//
	this.tileMapping[55] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_HORI_END, 0);		//
	this.tileMapping[56] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROAD_HORI_END, 180);	//

	// Inverse corners - shore
	this.tileMapping[57] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_ITR, 0);
	this.tileMapping[58] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_IBR, 0);
	this.tileMapping[59] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_IBL, 0);
	this.tileMapping[60] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_SHORE_ITL, 0);

	// Inverse corners - grass
	this.tileMapping[61] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_IBR, 0);
	this.tileMapping[62] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_ITR, 0);
	this.tileMapping[63] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_ITL, 0);
	this.tileMapping[64] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_GRASS_IBL, 0);
	
	// Inverse corner - rocks
	this.tileMapping[65] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_ICORNER, 0);		// Top right
	this.tileMapping[66] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_ICORNER, 90);	// Bottom right
	this.tileMapping[67] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_ICORNER, 180);	// Bottom left
	this.tileMapping[68] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_ROCKS_ICORNER, -90);	// Top left
	
	this.tileMapping[69] = mapTile(CONSTANTS.MAP_BASE_ROCK, CONSTANTS.MAP_DETAIL_ROCKS_A, 0);
	this.tileMapping[70] = mapTile(CONSTANTS.MAP_BASE_ROCK, CONSTANTS.MAP_DETAIL_ROCKS_B, 0);

	this.tileMapping[71] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_IBL, 0);
	this.tileMapping[72] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_ITL, 0);
	this.tileMapping[73] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_ITR, 0);
	this.tileMapping[74] = mapTile(CONSTANTS.MAP_BASE_DIRT, CONSTANTS.MAP_DETAIL_WATER_IBR, 0);

	// Create map images
	this.mapTiles = [];
	// sprite - tile image sprite
	// 
	// building - any building taking up square
	//

	// Generate fog of war tiles for the screen
	this.fogOfWarTiles = [];
	for (var rowIndex = 0; rowIndex < this.screenCellHeight + 1; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.screenCellWidth + 1; colIndex ++) {
			
			// Create new fog of war tile
			var newFogOfWarTile = this.phaserRef.add.sprite(
					CONSTANTS.TILE_WIDTH * colIndex + (CONSTANTS.TILE_WIDTH / 2), 
					CONSTANTS.TILE_HEIGHT * rowIndex + (CONSTANTS.TILE_HEIGHT / 2),
					CONSTANTS.MAP_TILE_FOG_OF_WAR,
					CONSTANTS.MAP_FOW_FULL);
			newFogOfWarTile.anchor.setTo(0.5, 0.5);
			newFogOfWarTile.width = CONSTANTS.TILE_WIDTH;
			newFogOfWarTile.height = CONSTANTS.TILE_HEIGHT;
			fogOfWarGroup.add(newFogOfWarTile);

			// Add new FOW tile to array
			this.fogOfWarTiles.push(newFogOfWarTile);
		}
	}

	// Save local reference to this
	var self = this;
	
	// Function to create a single map tile at specified col/row
	var createMapTile = function(cellId, col, row) {

		// Create sprite for current tile
		var baseSprite = null;
		var detailSprite = null;
		if (self.tileMapping[cellId]) {

			// Create base sprite
			baseSprite = self.phaserRef.add.sprite(
					CONSTANTS.TILE_WIDTH * col + (CONSTANTS.TILE_WIDTH / 2), 
					CONSTANTS.TILE_HEIGHT * row + (CONSTANTS.TILE_HEIGHT / 2),
					CONSTANTS.MAP_TILE_SPRITESHEET,
					self.tileMapping[cellId].baseSource);
			baseSprite.anchor.setTo(0.5, 0.5);
			baseSprite.width = CONSTANTS.TILE_WIDTH;
			baseSprite.height = CONSTANTS.TILE_HEIGHT;
			mapGroup.add(baseSprite);

			// Create detail sprite
			if (self.tileMapping[cellId].detailSource) {
				detailSprite = self.phaserRef.add.sprite(
						CONSTANTS.TILE_WIDTH * col + (CONSTANTS.TILE_WIDTH / 2), 
						CONSTANTS.TILE_HEIGHT * row + (CONSTANTS.TILE_HEIGHT / 2),
						CONSTANTS.MAP_TILE_SPRITESHEET,
						self.tileMapping[cellId].detailSource);
				detailSprite.anchor.setTo(0.5, 0.5);
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
		this.baseId = self.tileMapping[cellId].baseSource;
		this.detailSprite = detailSprite;
		this.detailId = self.tileMapping[cellId].detailSource;
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

MapRenderer.prototype.placementHover = function(cell, canPlace, cellsWithinRange) {

	// Define local variables
	var tileRef = null;
	var cellInHubRange = false;

	// Iterate through all tiles
	for (var rowIndex = 0; rowIndex < this.height; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.width; colIndex ++) {

			// Create cell reference
			tileRef = this.getTileFromColRow(colIndex, rowIndex);

			// Check if cell is in hub range
			cellInHubRange = false;
			for (var rangeIndex = 0; rangeIndex < cellsWithinRange.length; rangeIndex++) {
				if (colIndex == cellsWithinRange[rangeIndex].col && rowIndex == cellsWithinRange[rangeIndex].row) {
					cellInHubRange = true;
				}
			}

			// Check for tile retrieval success
			if (tileRef) {
				if (cell.col == colIndex && cell.row == rowIndex) {
					if (canPlace && cellInHubRange) {
						tileRef.placementSprite.frame = 1;
					} else {
						tileRef.placementSprite.frame = 2;
					}
					tileRef.placementSprite.visible = true;
				} else {
					if (cellInHubRange) {
						tileRef.placementSprite.frame = 3;
						tileRef.placementSprite.visible = true;
					} else {
						tileRef.placementSprite.visable = false;
					}
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
		
		// Destroyed flag
		var destroyed = false;

		// Create tank track sprite
		var tankTracks = this.phaserRef.add.sprite(point.x, point.y, CONSTANTS.SPRITE_TANK_TRACKS, 0);
		tankTracks.z = 0;
		tankTracks.angle = angle;
		tankTracks.anchor.setTo(0.5, 0.5);
		mapGroup.add(tankTracks);
		
		// Set animation completed event
		var fadeOut = new CustomAnimation(tankTracks, null, 0.25);
		fadeOut.onComplete = function(sprite) {
			destroyed = true;
			sprite.animations.destroy();
			sprite.destroy();
		};
		
		// Play fade out animation
		fadeOut.play();
		
		// Return function to update visibility state
		return {
			centreCell : (new Point(tankTracks.x, tankTracks.y)).toCell(),
			setVisible : function(visible) { 
					if (!destroyed) { tankTracks.visible = visible; }
					return destroyed;
				}
		}
	}
}

MapRenderer.prototype.isCellObstructed = function(cell) {
	var checkCell = this.getTileFromColRow(cell.col, cell.row);
	var invalidBaseIds = [CONSTANTS.MAP_BASE_WATER, CONSTANTS.MAP_BASE_ROCK];
	var invalidDetailIds = [CONSTANTS.MAP_DETAIL_ROCKS_EDGE, CONSTANTS.MAP_DETAIL_ROCKS_CORNER, CONSTANTS.MAP_DETAIL_ROCKS_A, CONSTANTS.MAP_DETAIL_ROCKS_B, CONSTANTS.MAP_DETAIL_ROCKS_C, CONSTANTS.MAP_DETAIL_ROCKS_D, CONSTANTS.MAP_DETAIL_ROCKS_E, CONSTANTS.MAP_DETAIL_ROCKS_ICORNER,
	                        CONSTANTS.MAP_DETAIL_WATER_TOP, CONSTANTS.MAP_DETAIL_WATER_RIGHT, CONSTANTS.MAP_DETAIL_WATER_BOTTOM, CONSTANTS.MAP_DETAIL_WATER_LEFT, CONSTANTS.MAP_DETAIL_WATER_BR, CONSTANTS.MAP_DETAIL_WATER_TR, CONSTANTS.MAP_DETAIL_WATER_BL, CONSTANTS.MAP_DETAIL_WATER_TL,
	                        CONSTANTS.MAP_DETAIL_SHORE_BOTTOM, CONSTANTS.MAP_DETAIL_SHORE_LEFT, CONSTANTS.MAP_DETAIL_SHORE_TOP, CONSTANTS.MAP_DETAIL_SHORE_RIGHT, CONSTANTS.MAP_DETAIL_SHORE_BR, CONSTANTS.MAP_DETAIL_SHORE_TR, CONSTANTS.MAP_DETAIL_SHORE_BL, CONSTANTS.MAP_DETAIL_SHORE_TL,
	                        CONSTANTS.MAP_DETAIL_SHORE_ITR, CONSTANTS.MAP_DETAIL_SHORE_IBR, CONSTANTS.MAP_DETAIL_SHORE_IBL, CONSTANTS.MAP_DETAIL_SHORE_ITL];
	if (checkCell) {
		return (invalidBaseIds.indexOf(checkCell.baseId) > -1  ||
				invalidDetailIds.indexOf(checkCell.detailId) > -1);
	}
	return false;
}

MapRenderer.prototype.repositionFogOfWarWithMap = function(screenPoint) {
	
	// Get top cell coordiantes of map visible in screen
	var cellPoint = screenPoint.toCell().toPoint();
	
	// Generate fog of war tiles for the screen
	for (var rowIndex = 0; rowIndex < this.screenCellHeight + 1; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.screenCellWidth + 1; colIndex ++) {
			var fogOfWarTileRef = this.fogOfWarTiles[rowIndex * (this.screenCellWidth + 1) + colIndex];
			fogOfWarTileRef.x = cellPoint.x + CONSTANTS.TILE_WIDTH * colIndex + (CONSTANTS.TILE_WIDTH / 2);
			fogOfWarTileRef.y = cellPoint.y + CONSTANTS.TILE_HEIGHT * rowIndex + (CONSTANTS.TILE_HEIGHT / 2);
		}
	}
}

MapRenderer.prototype.updateFoWTileFrames = function(screenCell, foWVisibilityMap) {
	
	// Generate fog of war tiles for the screen
	for (var rowIndex = 0; rowIndex < this.screenCellHeight + 1; rowIndex ++) {
		for (var colIndex = 0; colIndex < this.screenCellWidth + 1; colIndex ++) {
			
			// Save reference to FoW tile and new frame state
			var fogOfWarTileRef = this.fogOfWarTiles[rowIndex * (this.screenCellWidth + 1) + colIndex];
			
			// Create references to screen tile
			var screenCellCol = colIndex + screenCell.col;
			var screenCellRow = rowIndex + screenCell.row;
			if (screenCellCol < this.width && screenCellRow < this.height) {
				var newFrameState = foWVisibilityMap[screenCellRow * this.width + screenCellCol];
				
				// Set new frame
				if (newFrameState.frame != CONSTANTS.MAP_FOW_VISIBLE) {
					fogOfWarTileRef.frame = newFrameState.frame;
					fogOfWarTileRef.angle = newFrameState.angle;
					fogOfWarTileRef.visible = true;
				} else {
					fogOfWarTileRef.visible = false;
				}
			}
		}
	}
}

MapRenderer.prototype.renderMap = function() {
	
}