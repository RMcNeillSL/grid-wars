function Hub(engineCore, gameCore, mapGroup, buildingGroup, xy, col, row, width, height, inBuildingMode) {

	// Make sure dependencies has been passed
	if (buildingGroup) {

		// Save core game object and update cell/point
		this.gameCore = gameCore;
		this.gameCore.point = new Point(xy.x + width/2, xy.y + height/2);
		this.gameCore.cell = new Cell(col, row);
		
		// Save engine core object
		this.engineCore = engineCore;
		this.buildingGroup = buildingGroup;
		this.mapGroup = mapGroup;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = this.gameCore.point.x;
		this.top = this.gameCore.point.y;
		this.col = col;
		this.row = row;

		// Create turret base object
		this.hubSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_HUB, this.gameCore.colour.HUB);
		this.hubSegment.anchor.setTo(0.5, 0.5);
		this.hubSegment.width = this.width;
		this.hubSegment.height = this.height;
		this.hubSegment.z = 10;
		this.buildingGroup.add(this.hubSegment);
		
		// Create turrent cannon sprite
		this.shadowSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_HUB, this.gameCore.colour.SHADOW);
		this.shadowSegment.anchor.setTo(0.5, 0.5);
		this.shadowSegment.width = this.width;
		this.shadowSegment.height = this.height;
		this.shadowSegment.z = 11;
		this.buildingGroup.add(this.shadowSegment);
		
		// Animations
		this.open = this.hubSegment.animations.add('open', this.gameCore.colour.OPENING, 10, false);
		this.rise = this.shadowSegment.animations.add('rise', this.gameCore.colour.RISE, 10, false);
		
		// Create self reference for local functions
		var self = this;
		
		// Link events to methods
		this.open.onComplete.add(function(sprite, animation) {
			self.shadowSegment.visible = true;
			self.hubSegment.frame = self.gameCore.colour.OPEN;
			self.rise.play();
		});
		this.rise.onComplete.add(function(sprite, animation) {
			self.shadowSegment.frame = self.gameCore.colour.SHADOW;
			self.shadowSegment.visible = false;
		});
		
		// Set current mode based on build flag
		this.setBuildingMode(inBuildingMode);
		
		// Hide shadow segment initially
		this.shadowSegment.visible = false;
		
		// Debug animation runthrough
		setTimeout(function() { self.open.play(); }, 2000);
		
	} else {
		if (!this.engineCore.phaserEngine) { console.log("ERROR: Failed to construct tank hub, missing phaserRef."); }
	}
	
}

Hub.prototype.markDamage = function(explosionInstanceId) {
	
	// Add new damage instance to log
	this.damageExplosions.push(explosionInstanceId);
	
	// Add timeout for damage
	var self = this;
	setTimeout(function() {
		var removeIndex = self.damageExplosions.indexOf(explosionInstanceId);
		self.damageExplosions.splice(removeIndex, 1);
	}, CONSTANTS.EXPLOSION_DAMAGE_TIMEOUT);
	
}

Hub.prototype.isDamageMarkRegistered = function(explosionInstanceId) {
	return !(this.damageExplosions.indexOf(explosionInstanceId) == -1);
}

Hub.prototype.getCollisionLayers = function() {
	return [this.hubSegment, this.shadowSegment];
}

Hub.prototype.setBuildingMode = function(inBuildingMode) {
	
	if (inBuildingMode) {
		this.hubSegment.visible = false;
		this.shadowSegment.visible = false; 
	} else {
		this.hubSegment.visible = true;
		this.shadowSegment.visible = true; 		
	}
	
}

Hub.prototype.setPosition = function(cell) {
	
	// Update internal position keepers
	this.left = cell.toPoint().x + this.width/2;
	this.top = cell.toPoint().y + this.height/2;
	this.col = cell.col;
	this.row = cell.row;
	
	// Update game core
	this.gameCore.cell = cell;
	this.gameCore.point = cell.toPoint();
	
	// Update sprite positioning
	this.hubSegment.x = this.left;
	this.hubSegment.y = this.top;
	this.shadowSegment.x = this.left;
	this.shadowSegment.y = this.top;
	
}

Hub.prototype.update = function() {
}

Hub.prototype.rotate = function(angle) {
	this.topSegment.angle += angle;
}

Hub.prototype.destroy = function() {
	this.hubSegment.animations.destroy();
	this.hubSegment.destroy();
	this.shadowSegment.animations.destroy();
	this.shadowSegment.destroy();
}

Hub.prototype.getBounds = function() {
	var tempBounds = this.hubSegment.getBounds();
	var tempLeft = this.left - (this.width/2);
	var tempTop = this.top - (this.height/2);
	return {
		left : Math.min(tempLeft, tempLeft + tempBounds.width),
		top : Math.min(tempTop, tempTop + tempBounds.height),
		right : Math.max(tempLeft, tempLeft + tempBounds.width),
		bottom : Math.max(tempTop, tempTop + tempBounds.height),
		width : tempBounds.width,
		height : tempBounds.height
	};
}

Hub.prototype.getHealthRenderBounds = function() {

	// Calculate rectangle area for health to be displayed
	var absoluteBounds = this.getBounds();
	var healthBounds = {
		left : Math.min(absoluteBounds.left, absoluteBounds.left + absoluteBounds.width) + 15,
		top : Math.min(absoluteBounds.top, absoluteBounds.top + absoluteBounds.height),
		right : Math.max(absoluteBounds.left, absoluteBounds.left + absoluteBounds.width) - 15,
		bottom : Math.min(absoluteBounds.top, absoluteBounds.top + absoluteBounds.height) + 10,
		healthWidth : this.width
	};

	// Add width and height
	healthBounds.width = healthBounds.right - healthBounds.left;
	healthBounds.height = healthBounds.bottom - healthBounds.top;
	
	// Return calculated bounds
	return healthBounds;
}

Hub.prototype.getCells = function() {
	return this.gameCore.getCells();
}




