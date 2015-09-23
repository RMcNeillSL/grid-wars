function Tank(engineCore, gameCore, mapGroup, tankGroup, xy, col, row, width, height, inBuildingMode) {

	// Make sure dependencies has been passed
	if (tankGroup) {

		// Save core game object and update cell/point
		this.gameCore = gameCore;
		this.gameCore.point = new Point(xy.x + width/2, xy.y + height/2);
		this.gameCore.cell = new Cell(col, row);
		
		// Save engine core
		this.engineCore = engineCore;
		this.tankGroup = tankGroup;
		this.mapGroup = mapGroup;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = this.gameCore.point.x;
		this.top = this.gameCore.point.y;
		this.col = col;
		this.row = row;
		
		// Set default misc values
		this.waypoints = [];
		this.damageExplosions = [];
		this.moveSpeed = 1; // MUST BE A MULTIPLE OF 100(size of a square)!
		this.rotateSpeed = 2;
		this.turretRotateSpeed = 2;
		this.shootTarget = { instanceId: null, point: null, angle: 0, increment: 0, isFiring: false, readyToFire: false };
		this.bullets = { firing: false, speed: 15, elapsed: 0, incUnitX: 0, incUnitY: 0, targetX: 0, targetY: 0, interval: null };
		this.waypointControl = { trackPlacementFrequency: 30, moveStepCount: 0 };
		
		// Create turret base object
		this.bodySegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TANK, this.gameCore.colour.BODY);
		this.bodySegment.anchor.setTo(0.48, 0.5);
		this.bodySegment.z = 10;
		this.tankGroup.add(this.bodySegment);
		
		// Create turrent cannon sprite
		this.turretSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TANK, this.gameCore.colour.TURRET);
		this.turretSegment.anchor.setTo(0.49, 0.82);
		this.turretSegment.z = 11;
		this.tankGroup.add(this.turretSegment);
		
		// Animations
		this.fire = this.turretSegment.animations.add('fire', this.gameCore.colour.FIRE, 30, false);

		// Create reference to 'this' for below functions
		var self = this;
		
		// Create fire callback function
		this.fire.onComplete.add(function(sprite, animation) {
			setTimeout(function() { self.shootTarget.isFiring = false; }, 2000);
			if (self.shootTarget.instanceId) {
				var target = self.engineCore.func_GetObjectFromInstanceId(self.shootTarget.instanceId);
				if (target) {
					self.engineCore.func_RequestExplosion(
							self.mapGroup,
							CONSTANTS.SPRITE_EXPLOSION_A,
							self.gameCore.playerId,
							self.gameCore.instanceId + "_A",
							target.left,
							target.top);
				}
			} else if (self.shootTarget.point) {
				self.engineCore.func_RequestExplosion(
						self.mapGroup,
						CONSTANTS.SPRITE_EXPLOSION_A,
						self.gameCore.playerId,
						self.gameCore.instanceId + "_A",
						self.shootTarget.point.x,
						self.shootTarget.point.y);
			}
		});

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
	
	// Process tank turret rotation
	if (this.shootTarget &&
			(this.shootTarget.point || this.shootTarget.instanceId) ) {
		if (this.shootTarget.point) { this.processTurretRotation(); }
		if (this.shootTarget.instanceId) { this.lockonAndShoot(); }
	}
	
	// Process tank turret firing event
	if (this.shootTarget.readyToFire &&
			!this.shootTarget.isFiring) {
		this.processTurretFire();
	}
}

Tank.prototype.lockonAndShoot = function(targetObject) {
	
	// Check if a target needs assigning
	if (targetObject) {
		
		// Save target information
		this.shootTarget.instanceId = targetObject.gameCore.instanceId;
		this.shootTarget.isFiring = false;
		this.shootTarget.readyToFire = false;

		// Calculate rotation and point data
		var sourcePoint = new Point(this.left, this.top);
		var targetPoint = new Point(target.left, target.top);
		var rotationData = this.gameCore.calculateRotateToPointData(this.turretSegment.angle, sourcePoint, targetPoint, this.rotateSpeed);
		
		// Save data to shoot target object
		this.shootTarget.increment = rotationData.angleIncrement;
	}
	
	// Run calculations if a target object is assigned
	if (this.shootTarget.instanceId) {
		
		// Save reference to target
		var target = this.engineCore.func_GetObjectFromInstanceId(this.shootTarget.instanceId);
		
		// Make sure a target was found
		if (target) {
			
			// Calculate rotation and point data
			var sourcePoint = new Point(this.left, this.top);
			var targetPoint = new Point(target.left, target.top);
			var rotationData = this.gameCore.calculateRotateToPointData(this.turretSegment.angle, sourcePoint, targetPoint, this.rotateSpeed);
			
			// Identify further rotation or begin charging animation (if target is in range)
			if (!this.gameCore.angleInErrorMargin(this.gameCore.phaserAngleTo360(this.turretSegment.angle), rotationData.target360Angle, this.shootTarget.increment) &&
					!this.shootTarget.isFiring) {
				this.shootTarget.increment = rotationData.angleIncrement;
				this.rotate(this.shootTarget.increment, false, true);
				this.shootTarget.readyToFire = false;
			} else {
				this.shootTarget.readyToFire = (this.gameCore.pythag(sourcePoint, targetPoint) <= this.gameCore.range * 1.1);
			}
			
		} else {
			this.shootTarget.instanceId = null;
		}
	}
}

Tank.prototype.processTurretFire = function() {
	
	// Mark firing as not possible
	this.shootTarget.isFiring = true;

	// Trigger fire animation
	this.fire.play();
}

Tank.prototype.processTurretRotation = function() {
	
	// Check if rotation is needed
	if (!this.angleInErrorMargin(this.gameCore.phaserAngleTo360(this.turretSegment.angle), this.shootTarget.angle, this.shootTarget.increment)) {

		// Perform total rotation
		this.rotate(this.shootTarget.increment, false, true);
		
		// Mark turret as not ready to fire
		this.shootTarget.readyToFire = false;
		
	} else {
		
		// Mark turret as ready to fire
		this.shootTarget.readyToFire = true;
	}
}

Tank.prototype.shootAtXY = function(point) {
	
	// Generate angle information
	var rotationData = this.calculateRotateToPointData(this.turretSegment.angle, new Point(this.left, this.top), point, this.turretRotateSpeed);

	// Save info to shoot target
	this.shootTarget.increment = rotationData.angleIncrement;
	this.shootTarget.point = rotationData.targetPoint;
	this.shootTarget.angle = rotationData.target360Angle;
	
}

Tank.prototype.calculateRotateToPointData = function(currentAngle, currentPoint, targetPoint, rotateSpeed) {

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
	var target360Angle = this.gameCore.phaserAngleTo360(targetAngle);
	var current360Angle = this.gameCore.phaserAngleTo360(currentAngle);
	
	// Determine move increment direction based on angle size
	var angleIncrement = 0;
	var angleAbsDif = Math.max(target360Angle, current360Angle) - Math.min(target360Angle, current360Angle);
	if (current360Angle < target360Angle && angleAbsDif <= 180) { angleIncrement = rotateSpeed; }
	if (current360Angle < target360Angle && angleAbsDif > 180) { angleIncrement = -rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif <= 180) { angleIncrement = -rotateSpeed; }
	if (current360Angle > target360Angle && angleAbsDif > 180) { angleIncrement = rotateSpeed; }

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
	
	// Make sure error margin is non-negative
	errorMargin = Math.abs(errorMargin);

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
		( (target.lower < current.angle && target.upper > current.angle) ||
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
	
	// Check if unit is currently moving to the second location in waypoints
	if (newWaypoints.length > 1 &&
			this.waypoints.length > 0 &&
			newWaypoints[1].x == this.waypoints[0].x &&
			newWaypoints[1].y == this.waypoints[0].y) {
		
		// Drop first waypoint from new waypoints
		newWaypoints.splice(0, 1);
	}

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
	var rotationData = this.calculateRotateToPointData(this.bodySegment.angle, new Point(this.left, this.top), nextWaypoint, this.rotateSpeed);

	// Perform rotation if tank angle is not within error margins
	if (!this.angleInErrorMargin(rotationData.current360Angle, rotationData.target360Angle, this.rotateSpeed/2)) {
		this.rotate(rotationData.angleIncrement, true, true);
	} else {

		// Process XY move to target
		this.left = this.left + incX;
		this.top = this.top + incY;
		
		// Update sprite positioning
		this.bodySegment.x = this.bodySegment.x + incX;
		this.bodySegment.y = this.bodySegment.y + incY;
		this.turretSegment.x = this.turretSegment.x + incX;
		this.turretSegment.y = this.turretSegment.y + incY;
	}

	// Check if track image needs to be placed
	if (this.waypointControl.moveStepCount == 0) {
		this.engineCore.func_PlaceTankTrack(this, new Point(this.left, this.top), this.bodySegment.angle);
	}
	
	// Increment tank track count making sure it doesnt exceed placement frequency
	this.waypointControl.moveStepCount += 1;
	if (this.waypointControl.moveStepCount >= this.waypointControl.trackPlacementFrequency) {
		this.waypointControl.moveStepCount = 0;
	}
	
	// Check if turret rotation needs recalculating
	if (this.shootTarget && this.shootTarget.point) {
		this.shootAtXY(this.shootTarget.point);
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
	var tempBounds = this.bodySegment.getBounds();
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

Tank.prototype.getHealthRenderBounds = function() {

	// Calculate rectangle area for health to be displayed
	var absoluteBounds = this.getBounds();
	var healthBounds = {
		left : Math.min(absoluteBounds.left, absoluteBounds.left + absoluteBounds.width) + 15,
		top : Math.min(absoluteBounds.top, absoluteBounds.top + absoluteBounds.height),
		right : Math.max(absoluteBounds.left, absoluteBounds.left + absoluteBounds.width) - 15,
		bottom : Math.min(absoluteBounds.top, absoluteBounds.top + absoluteBounds.height) + 5,
		healthWidth : this.width
	};
	
	// Add width and height
	healthBounds.width = healthBounds.right - healthBounds.left;
	healthBounds.height = healthBounds.bottom - healthBounds.top;
	
	// Return calculated bounds
	return healthBounds;
}

Tank.prototype.getCells = function() {
	var workingCellResult = this.gameCore.getCells();
	if (this.waypoints.length > 0) {
		workingCellResult.push(this.waypoints[0].toCell());
	}
	return workingCellResult;
}






