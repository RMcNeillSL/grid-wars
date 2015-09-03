function MapRenderer(phaserRef, mapGroup, mapData) {
	
	// Save passed phaser reference
	this.phaserRef = phaserRef;
	
	// Save map data
	this.mapData = mapData;
	this.width = mapData.width;
	this.height = mapData.height;
	this.tileWidth = 100;
	this.tileHeight = 100;
	
	// Create tile-map mapping
	this.tileMapping = {};
	this.tileMapping[0] = CONSTANTS.MAP_TILE_A;
	this.tileMapping[1] = CONSTANTS.MAP_TILE_B;
	
	// Create map images
	this.tileSprites = [];
	
	// Generate map sprites
	var colIndex = 0;
	var rowIndex = 0;
	var currentTile = null;
	for (var index = 0; index < this.mapData.map.length; index ++) {
		
		// Create sprite for current tile
		if (this.tileMapping[this.mapData.map[index]]) {
			currentTile = this.phaserRef.add.sprite(this.tileWidth * colIndex,
					this.tileHeight * rowIndex,
					this.tileMapping[this.mapData.map[index]], 0);
			currentTile.width = this.tileWidth;
			currentTile.height = this.tileHeight;
			mapGroup.add(currentTile);
		}
		
		// Check if reached the end of the row
		if (colIndex >= this.width-1) {
			rowIndex ++;
			colIndex = 0;
		} else {
			colIndex ++;
		}
	}
	
}

MapRenderer.prototype.ColRowToXY = function(col, row) {
	
	return {x: col * this.tileWidth, y: row * this.tileHeight };
	
}

MapRenderer.prototype.renderMap = function() {
	
}