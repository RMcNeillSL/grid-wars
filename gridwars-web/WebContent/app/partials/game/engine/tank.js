function Tank(phaserRef, mapGroup, tankGroup, xy, width, height, func_explosionRequest) {

	// Make sure dependencies has been passed
	if (tankGroup) {
		
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
		
		// Set default misc values
		this.rotateSpeed = 3;
		this.target = { active: false, angle: 0, increment: this.rotateSpeed, x: -1, y: -1 };
		this.bullets = { firing: false, speed: 15, elapsed: 0, incUnitX: 0, incUnitY: 0, targetX: 0, targetY: 0, interval: null };
		
		// Create turret base object
		this.bodySegment = this.phaserRef.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TURRET, 0);
		this.bodySegment.anchor.setTo(0.5, 0.5);
		this.bodySegment.z = 10;
		this.tankGroup.add(this.bodySegment);
		
		// Create turrent cannon sprite
		this.turretSegment = this.phaserRef.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TURRET, 1);
		this.turretSegment.anchor.setTo(0.5, 0.5);
		this.turretSegment.z = 11;
		
	} else {
		if (!phaserRef) { console.log("ERROR: Failed to construct tank, missing phaserRef."); }
	}
	
}