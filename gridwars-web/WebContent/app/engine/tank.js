function Tank(engineCore, gameCore, mapGroup, tankGroup, xy, col, row, width, height, inBuildingMode) {

	// Make sure dependencies has been passed
	if (tankGroup) {

		// Save core game object
		this.gameCore = gameCore;
		
		// Save engine core
		this.engineCore = engineCore;
		this.tankGroup = tankGroup;
		this.mapGroup = mapGroup;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = xy.x + this.width/2;
		this.top = xy.y + this.height/2;
		this.col = col;
		this.row = row;
		
		// Set default misc values
		this.waypoints = [];
		this.damageExplosions = [];
		this.moveSpeed = 1; // MUST BE A MULTIPLE OF 100(size of a square)!
		this.rotateSpeed = 2;
		this.target = { active: false, angle: 0, increment: this.rotateSpeed, x: -1, y: -1 };
		this.bullets = { firing: false, speed: 15, elapsed: 0, incUnitX: 0, incUnitY: 0, targetX: 0, targetY: 0, interval: null };
		
		// Create turret base object
		this.bodySegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TANK, this.gameCore.colour.BODY);
		this.bodySegment.anchor.setTo(0.48, 0.5);
		this.bodySegment.z = 10;
		this.tankGroup.add(this.bodySegment);
//		this.engineCore.phaserEngine.physics.enable(this.bodySegment, Phaser.Physics.ARCADE);
//		this.bodySegment.body.enable = true;
		
		// Create turrent cannon sprite
		this.turretSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TANK, this.gameCore.colour.TURRET);
		this.turretSegment.anchor.setTo(0.49, 0.82);
		this.turretSegment.z = 11;
//		this.engineCore.phaserEngine.physics.enable(this.turretSegment, Phaser.Physics.ARCADE);
//		this.turretSegment.body.enable = true;
		
		// Set current mode based on build flag
		this.setBuildingMode(inBuildingMode);
		
	} else {
		if (!phaserRef) { console.log("ERROR: Failed to construct tank, missing phaserRef."); }
	}
	
}

Tank.prototype.update = function() {
	
	// Process waypoints if they exist
	if (this.waypoints.length > 0) {
		this.progressWaypoints();
	}
}

Tank.prototype.calculateRotateToPointData = function(currentAngle, currentPoint, targetPoint) {

	var current360Angle = currentAngle;

	// Check X&Y deltas
	var deltaX = targetPoint.x - currentPoint.x;
	var deltaY = targetPoint.y - currentPoint.y;
	
	// Calculate target angle
	var targetAngle = 0;
	var calcAngle = Math.atan((deltaX*1.0)/deltaY) * 180/Math.PI;
	if (deltaX >= 0 && deltaY >= 0) { targetAngle = 180 - calcAngle; }
	if (deltaX >= 0 && deltaY < 0) { targetAngle = 0 - calcAngle; }
	if (deltaX <= 0 && deltaY >= 0) { targetAngle = -180 - calcAngle; }
	if (deltaX <= 0 && deltaY < 0) { targetAngle = 0 - calcAngle; }

	// Adjust angles to 0-360 values
	var target360Angle = targetAngle;
	if (target360Angle < 0) { target360Angle += 360; }
	if (current360Angle < 0) { current360Angle += 360; }

	// Determine move increment direction based on angle size
	var angleIncrement = 0;
	var angleAbsDif = Math.max(target360Angle, current360Angle) - Math.min(target360Angle, current360Angle);
//	console.log("Angle difference: " + angleAbsDif);
	if (current360Angle < target360Angle && angleAbsDif <= 180) { angleIncrement = this.rotateSpeed; }
	if (current360Angle < target360Angle && angleAbsDif > 180) { angleIncrement = -this.rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif <= 180) { angleIncrement = -this.rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif > 180) { angleIncrement = this.rotateSpeed; }

	// Return calculated object
	return {
		current360Angle: Math.round(current360Angle),
		target360Angle: Math.round(target360Angle),
		currentPoint: currentPoint,
		targetPoint: targetPoint,
		angleIncrement: angleIncrement
	};
	
}

Tank.prototype.angleInErrorMargin = function(currentAngle, targetAngle, errorMargin) {

	// Create checking variables
	var current = {
			angle: currentAngle,
			upper: currentAngle + errorMargin,
			lower: currentAngle - errorMargin
	}
	var target = {
			angle: targetAngle,
			upper: targetAngle + errorMargin,
			lower: targetAngle - errorMargin
	}
	
	// Rotation needed
	var rotationNeeded = 
		!( (target.lower < current.angle && target.upper > current.angle) ||
		   (current.upper > 360 && target.lower < 0) ||
		   (current.lower < 0 && target.upper > 360) );
		
//	// Check values
//	console.log("Normal: " + (target.lower < current.angle && target.upper > current.angle) +
//			", BigCurrent: " + (current.upper > 360 && target.lower < 0) +
//			", SmallCurrent: " + (current.lower < 0 && target.upper > 360));
	
	// Return calculated rotation needed
	return rotationNeeded;

}

Tank.prototype.rotateToPoint = function(point) {
	if (!this.rotateTest) { this.rotateTest = {}; }
	this.rotateTest.point = point;
}

Tank.prototype.getCollisionLayers = function() {
	return [this.bodySegment, this.turretSegment];
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

Tank.prototype.rotate = function(angle, rotateBody, rotateTurret) {
	if (rotateBody && rotateTurret) {
		this.bodySegment.angle += angle;
		this.turretSegment.angle += angle;
	} else if (rotateBody) {
		this.bodySegment.angle += angle;
//	} else if (rotateTurret) {
//		this.turretSegment.angle += angle;
	} else {
		this.turretSegment.angle += angle;
	}
}

Tank.prototype.updateWaypoints = function(newWaypoints) {
	
	// Copy over waypoints completely for now
	this.waypoints = newWaypoints;
}

Tank.prototype.progressWaypoints = function() {
	
	// Get next waypoint to move to and save current state
	var nextWaypoint = this.waypoints[0];
	var currentCell = this.gameCore.cell;
	var currentPoint = this.gameCore.point;
	
	// Calculate XY increment to target
	var incX = 0; var incY = 0;
	if (nextWaypoint.x - this.left > 0) { incX = this.moveSpeed; }
	if (nextWaypoint.x - this.left < 0) { incX = -this.moveSpeed; }
	if (nextWaypoint.y - this.top > 0) { incY = this.moveSpeed; }
	if (nextWaypoint.y - this.top < 0) { incY = -this.moveSpeed; }

	// Calculate rotate to point data
	var rotationData = this.calculateRotateToPointData(this.bodySegment.angle, new Point(this.left, this.top), nextWaypoint);
//	console.log(rotationData);

	// Perform rotation
	if (this.angleInErrorMargin(rotationData.current360Angle, rotationData.target360Angle, this.rotateSpeed/2)) {

		// Output debug information
//		console.log("x(" + rotationData.currentPoint.x + "->" + rotationData.targetPoint.x + "), y(" + rotationData.currentPoint.y + "->" + rotationData.targetPoint.y + "), angle(" + rotationData.current360Angle + "->" + rotationData.target360Angle + ")");

//		// Save target angle data
//		this.target.angle = targetAngle;
//		this.target.x = targetX;
//		this.target.y = targetY;
//		this.target.active = true;
		
		// Perform total rotation
		this.rotate(rotationData.angleIncrement, true, true);
		
	} else {

		// Output for debugging in console
//		console.log("Moving: (" + this.left + "," + this.top + ") to (" + (this.left + incX) + "," + (this.top + incY) + ") with target (" + nextWaypoint.x + "," + nextWaypoint.y + ")");

		// Process XY move to target
		this.left = this.left + incX;
		this.top = this.top + incY;
	
		// Update sprite positioning
		this.bodySegment.x = this.bodySegment.x + incX;
		this.bodySegment.y = this.bodySegment.y + incY;
		this.turretSegment.x = this.turretSegment.x + incX;
		this.turretSegment.y = this.turretSegment.y + incY;
		
	}
	
	// Check new cell position
	var newCell = (new Point(this.left, this.top)).toCell();
	this.gameCore.point = new Point(this.left, this.top);
	if (newCell.col != currentCell.col || newCell.row != currentCell.row) {
		this.engineCore.func_UpdateNewUnitCell(this, currentCell, newCell);
		this.gameCore.cell = this.gameCore.point.toCell();
	}
	
	// Update waypoint list by removing first item is point is hit
	if (Math.abs(nextWaypoint.x - this.left) < this.moveSpeed / 2 &&
			Math.abs(nextWaypoint.y - this.top) < this.moveSpeed / 2) {
		this.waypoints.splice(0, 1);
	}
}

Tank.prototype.markDamage = function(explosionInstanceId) {
	
	// Add new damage instance to log
	this.damageExplosions.push(explosionInstanceId);
	
	// Add timeout for damage
	var self = this;
	setTimeout(function() {
		var removeIndex = self.damageExplosions.indexOf(explosionInstanceId);
		self.damageExplosions.splice(removeIndex, 1);
	}, CONSTANTS.EXPLOSION_DAMAGE_TIMEOUT);
	
}

Tank.prototype.isDamageMarkRegistered = function(explosionInstanceId) {
	return !(this.damageExplosions.indexOf(explosionInstanceId) == -1);
}

Tank.prototype.getCollisionLayers = function() {
	return [this.bodySegment, this.turretSegment];
}

Tank.prototype.destroy = function() {
	this.bodySegment.animations.destroy();
	this.bodySegment.destroy();
	this.turretSegment.animations.destroy();
	this.turretSegment.destroy();
}

Tank.prototype.getBounds = function() {
	return this.bodySegment.getBounds();
}

Tank.prototype.getHealthRenderBounds = function() {

	// Calculate rectangle area for health to be displayed
	var absoluteBounds = this.getBounds();
	var healthBounds = {
		left : Math.min(absoluteBounds.x, absoluteBounds.x + absoluteBounds.width) + 15,
		top : Math.min(absoluteBounds.y, absoluteBounds.y + absoluteBounds.height),
		right : Math.max(absoluteBounds.x, absoluteBounds.x + absoluteBounds.width) - 15,
		bottom : Math.min(absoluteBounds.y, absoluteBounds.y + absoluteBounds.height) + 5,
	};
	
	// Add width and height
	healthBounds.width = healthBounds.right - healthBounds.left;
	healthBounds.height = healthBounds.bottom - healthBounds.top;
	
	// Return calculated bounds
	return healthBounds;
}








