function Tank(phaserRef, gameCore, mapGroup, tankGroup, xy, col, row, width, height, func_explosionRequest, inBuildingMode) {

	// Make sure dependencies has been passed
	if (tankGroup) {

		// Save core game object
		this.gameCore = gameCore;
		
		// Save phaser references
		this.phaserRef = phaserRef;
		this.tankGroup = tankGroup;
		this.mapGroup = mapGroup;
		
		// Save passed functions
		this.func_explosionRequest = func_explosionRequest;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = xy.x + this.width/2;
		this.top = xy.y + this.height/2;
		this.col = col;
		this.row = row;
		
		// Set default misc values
		this.rotateSpeed = 3;
		this.target = { active: false, angle: 0, increment: this.rotateSpeed, x: -1, y: -1 };
		this.bullets = { firing: false, speed: 15, elapsed: 0, incUnitX: 0, incUnitY: 0, targetX: 0, targetY: 0, interval: null };
		
		// Create turret base object
		this.bodySegment = this.phaserRef.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TANK, 0);
		this.bodySegment.anchor.setTo(0.5, 0.5);
		this.bodySegment.z = 10;
		this.tankGroup.add(this.bodySegment);
		
		// Create turrent cannon sprite
		this.turretSegment = this.phaserRef.add.sprite(this.left, this.top + this.height * 0.08, CONSTANTS.SPRITE_TANK, 1);
		this.turretSegment.anchor.setTo(0.5, 0.8);
		this.turretSegment.z = 11;
		
		// Create fire animation
//		var fire = this.turretSegment.animations.add('fire', [1,2,3,4,5,1], 20, false);
//		fire.onComplete.add(function(sprite, animation) {setTimeout(function() {fire.play();}, 2000)});
//		fire.play();

		// Set current mode based on build flag
		this.setBuildingMode(inBuildingMode);
		
	} else {
		if (!phaserRef) { console.log("ERROR: Failed to construct tank, missing phaserRef."); }
	}
	
}

Tank.prototype.setBuildingMode = function(inBuildingMode) {
	
	if (inBuildingMode) {
		this.bodySegment.visible = false;
		this.turretSegment.visible = false; 
	} else {
		this.bodySegment.visible = true;
		this.turretSegment.visible = true; 		
	}
	
}

Tank.prototype.setPosition = function(cell) {

	// Update internal position keepers
	this.left = cell.toPoint().x + this.width/2;
	this.top = cell.toPoint().y + this.height/2;
	this.col = cell.col;
	this.row = cell.row;
	
	// Update game core
	this.gameCore.cell = cell;
	this.gameCore.point = cell.toPoint();
	
	// Update sprite positioning
	this.bodySegment.x = this.left;
	this.bodySegment.y = this.top;
	this.turretSegment.x = this.left;
	this.turretSegment.y = this.top;
	
}

Tank.prototype.rotate = function(angle) {
	this.turretSegment.angle += angle;
}

Tank.prototype.update = function() {
//	this.rotate(1);
}