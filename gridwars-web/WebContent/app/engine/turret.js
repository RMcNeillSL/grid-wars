function Turret(engineCore, gameCore, mapGroup, turretGroup, xy, col, row, width, height, inBuildingMode) {

	// Make sure dependencies has been passed
	if (turretGroup) {

		// Save core game object and update cell/point
		this.gameCore = gameCore;
		this.gameCore.point = new Point(xy.x + width/2, xy.y + height/2);
		this.gameCore.cell = new Cell(col, row);
		
		// Save engine core object
		this.engineCore = engineCore;
		this.turretGroup = turretGroup;
		this.mapGroup = mapGroup;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = this.gameCore.point.x;
		this.top = this.gameCore.point.y;
		this.col = col;
		this.row = row;
		
		// Set default misc values
		this.rotateSpeed = 3;
		this.damageExplosions = [];
		this.shootTarget = { instanceId: null, point: null, angle: 0, increment: 0, isFiring: false, readyToFire: false };
		this.target = { active: false, angle: 0, increment: this.rotateSpeed, x: -1, y: -1 };
		this.bullets = { firing: false, speed: 15, elapsed: 0, incUnitX: 0, incUnitY: 0, targetX: 0, targetY: 0, interval: null };
		
		// Create turret base object
		this.baseSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TURRET, this.gameCore.colour.BASE);
		this.baseSegment.anchor.setTo(0.5, 0.5);
		this.baseSegment.width = this.width;
		this.baseSegment.height = this.height;
		this.baseSegment.z = 10;
		this.turretGroup.add(this.baseSegment);
		
		// Create turrent cannon sprite
		this.topSegment = this.engineCore.phaserEngine.add.sprite(this.left, this.top, CONSTANTS.SPRITE_TURRET, this.gameCore.colour.TOP);
		this.topSegment.anchor.setTo(0.5, 0.55);
		this.topSegment.width = this.width;
		this.topSegment.height = this.height;
		this.topSegment.z = 11;
		this.turretGroup.add(this.topSegment);
		
		// Animations
		this.charge = this.topSegment.animations.add('charge', this.gameCore.colour.CHARGE, 5, false);
		this.cool = this.topSegment.animations.add('cool', this.gameCore.colour.COOL, 15, false);
		this.fireAndCool = this.topSegment.animations.add('fireAndCool', this.gameCore.colour.FIREANDCOOL, 35, false);
		
		// Link events to methods
		this.charge.onComplete.add(function(sprite, animation) { sprite.animations.play('fireAndCool'); });
		this.fireAndCool.onComplete.add(function(sprite, animation) { });
		
		// Particle creation function
		var self = this;
		var createParticleEmitter = function(x, y, particleImage) {
			var result = self.engineCore.phaserEngine.add.emitter(0, 0, 200);
			result.makeParticles(CONSTANTS.PARTICLE_YELLOW_SHOT);
			result.setRotation(0, 0);
			result.setAlpha(0.3, 0.8);
			result.setScale(0.1, 0.1);
			result.gravity = 0;
			return result;
		}
		
		// Create shoot particles
		this.bulletParticle01 = createParticleEmitter(0, 0, CONSTANTS.PARTICLE_YELLOW_SHOT);
		this.bulletParticle02 = createParticleEmitter(0, 0, CONSTANTS.PARTICLE_YELLOW_SHOT);
		this.bulletParticle01.start(false, 50, 10); this.bulletParticle01.on = false;
		this.bulletParticle02.start(false, 50, 10); this.bulletParticle02.on = false;

		// Charge onComplete function
		this.charge.onComplete.add(function(sprite, animation) {
			
			// Define shoot targetXY
			var targetXY = new Point(0, 0);
			
			// Check if using old firing system
			if (self.shootTarget.isFiring) {
				var target = self.engineCore.func_GetObjectFromInstanceId(self.shootTarget.instanceId);
				if (target) {
					targetXY.x = target.left;
					targetXY.y = target.top;
				}
			} else {
				targetXY.x = self.target.x;
				targetXY.y = self.target.y;
			}

			// Setup default bullet particle information
			self.bullets.firing = true;
			self.bullets.elapsed = 0;
			
			// Save target location for bullets
			self.bullets.targetX = targetXY.x;
			self.bullets.targetY = targetXY.y;
			
			// Calculate angles for firing
			self.bulletParticle01.fireAngleX = Math.sin((360-self.topSegment.angle+14) * (Math.PI/180));
			self.bulletParticle01.fireAngleY = Math.cos((self.topSegment.angle-14) * (Math.PI/180));
			self.bulletParticle02.fireAngleX = Math.sin((360-self.topSegment.angle-14) * (Math.PI/180));
			self.bulletParticle02.fireAngleY = Math.cos((self.topSegment.angle+14) * (Math.PI/180));
			
			// Position fire sprites at end of turret
			self.bulletParticle01.x = (-self.width/2) * self.bulletParticle01.fireAngleX + self.left;
			self.bulletParticle01.y = (-self.height/2) * self.bulletParticle01.fireAngleY + self.top;
			self.bulletParticle02.x = (-self.width/2) * self.bulletParticle02.fireAngleX + self.left;
			self.bulletParticle02.y = (-self.height/2) * self.bulletParticle02.fireAngleY + self.top;

			self.bullets.incUnitX = -self.bullets.speed * Math.sin((360-self.topSegment.angle) * (Math.PI/180));
			self.bullets.incUnitY = -self.bullets.speed * Math.cos((self.topSegment.angle) * (Math.PI/180));
			
			// Call firing animation
			self.topSegment.animations.stop('fireAndCool', true);
			self.topSegment.animations.frame = 1;
			sprite.animations.play('fireAndCool');
			
			// Show particle emitters
			self.bulletParticle01.on = true;
			self.bulletParticle02.on = true;
		});
		
		// Set current mode based on build flag
		this.setBuildingMode(inBuildingMode);

	} else {
		if (!this.engineCore.phaserEngine) { console.log("ERROR: Failed to construct turret, missing phaserRef."); }
	}
	
}

Turret.prototype.markDamage = function(explosionInstanceId) {
	
	// Add new damage instance to log
	this.damageExplosions.push(explosionInstanceId);
	
	// Add timeout for damage
	var self = this;
	setTimeout(function() {
		var removeIndex = self.damageExplosions.indexOf(explosionInstanceId);
		self.damageExplosions.splice(removeIndex, 1);
	}, CONSTANTS.EXPLOSION_DAMAGE_TIMEOUT);
	
}

Turret.prototype.isDamageMarkRegistered = function(explosionInstanceId) {
	return !(this.damageExplosions.indexOf(explosionInstanceId) == -1);
}

Turret.prototype.getCollisionLayers = function() {
	return [this.baseSegment, this.topSegment];
}

Turret.prototype.setBuildingMode = function(inBuildingMode) {
	
	if (inBuildingMode) {
		this.baseSegment.visible = false;
		this.topSegment.visible = false; 
	} else {
		this.baseSegment.visible = true;
		this.topSegment.visible = true; 		
	}
	
}

Turret.prototype.setPosition = function(cell) {
	
	// Update internal position keepers
	this.left = cell.toPoint().x + this.width/2;
	this.top = cell.toPoint().y + this.height/2;
	this.col = cell.col;
	this.row = cell.row;
	
	// Update game core
	this.gameCore.cell = cell;
	this.gameCore.point = cell.toPoint();
	
	// Update sprite positioning
	this.baseSegment.x = this.left;
	this.baseSegment.y = this.top;
	this.topSegment.x = this.left;
	this.topSegment.y = this.top;
	
}

Turret.prototype.update = function() {
	
	if (this.bullets.firing) {
		this.manageFiringBullets();
	}
	
	// Process turret rotation
	if (this.shootTarget &&
			(this.shootTarget.point || this.shootTarget.instanceId) ) {
		this.processTurretRotation();
	}
	
	// Process turret firing event
	if (this.shootTarget.readyToFire &&
			!this.shootTarget.isFiring) {
		this.processTurretFire();
	}
}

Turret.prototype.shootAtXY = function(point) {

	// Halt any target fire currently set
	this.topSegment.animations.stop('fireAndCool', true);
	this.topSegment.animations.frame = this.gameCore.colour.TOP;
	
	// Generate angle information
	var rotationData = this.gameCore.calculateRotateToPointData(this.topSegment.angle, new Point(this.left, this.top), point, this.rotateSpeed);

	// Save info to shoot target
	this.shootTarget.increment = rotationData.angleIncrement;
	this.shootTarget.point = rotationData.targetPoint;
	this.shootTarget.angle = rotationData.target360Angle;
	this.shootTarget.isFiring = false;
	this.shootTarget.readyToFire = false;
}

Turret.prototype.lockonAndShoot = function(targetObject) {
	
	// Check if a target needs assigning
	if (targetObject) {
		
		// Halt any target fire currently set
		this.topSegment.animations.stop('fireAndCool', true);
		this.topSegment.animations.frame = this.gameCore.colour.TOP;
		
		// Save target information
		this.shootTarget.instanceId = targetObject.gameCore.instanceId;
		this.shootTarget.isFiring = false;
		this.shootTarget.readyToFire = false;
	}
}

Turret.prototype.processTurretRotation = function() {

	// Generate target point
	var targetPoint = null;
	var sourcePoint = new Point(this.left, this.top);
	if (this.shootTarget.point) { targetPoint = this.shootTarget.point; }
	if (this.shootTarget.instanceId) {
		var target = this.engineCore.func_GetObjectFromInstanceId(this.shootTarget.instanceId);
		if (target) { targetPoint = new Point(target.left, target.top); }
		else { this.shootTarget.instanceId = null; }
	}

	// Run calculations if a target object is assigned
	if (targetPoint && sourcePoint) {

		// Calculate rotation and point data
		var rotationData = this.gameCore.calculateRotateToPointData(this.topSegment.angle, sourcePoint, targetPoint, this.rotateSpeed);
		
		// Identify further rotation or begin charging animation (if target is in range)
		if (!this.gameCore.angleInErrorMargin(this.gameCore.phaserAngleTo360(this.topSegment.angle), rotationData.target360Angle, rotationData.angleIncrement) &&
				!this.shootTarget.isFiring) {
			this.rotate(this.shootTarget.increment);
			this.shootTarget.increment = rotationData.angleIncrement;
			this.shootTarget.readyToFire = false;
		} else {
			this.bullets.targetX = rotationData.targetPoint.x;
			this.bullets.targetY = rotationData.targetPoint.y;
			this.shootTarget.readyToFire = (this.gameCore.pythag(sourcePoint, targetPoint) <= this.gameCore.range * 1.1);
		}
	}
}

Turret.prototype.processTurretFire = function() {
	this.shootTarget.isFiring = true;
	this.charge.play();
}

Turret.prototype.manageFiringBullets = function() {

	// Proceed to manage movement of firing particles
	if (this.bullets.firing) {

		// Calculate new elapsed distance
		var elapsedDistance = this.bullets.elapsed * this.bullets.speed;
		this.bullets.elapsed = this.bullets.elapsed + 1;
		
		// Position fire sprites at end of turret
		this.bulletParticle01.x += this.bullets.incUnitX;
		this.bulletParticle01.y += this.bullets.incUnitY;
		this.bulletParticle02.x += this.bullets.incUnitX;
		this.bulletParticle02.y += this.bullets.incUnitY;
		
		// Calculate center point and error margin
		var centerBulletX = (this.bulletParticle01.x + this.bulletParticle02.x) / 2;
		var centerBulletY = (this.bulletParticle01.y + this.bulletParticle02.y) / 2;
		var deltaX = parseFloat(this.bulletParticle01.x - this.bulletParticle02.x);
		var deltaY = parseFloat(this.bulletParticle01.y - this.bulletParticle02.y);
		var errorMargin = Math.sqrt(deltaX*deltaX + deltaY*deltaY) / 2;
		
		// Check if bullets have reached target
		if (centerBulletX - this.bullets.speed - errorMargin < this.bullets.targetX &&
				centerBulletX + this.bullets.speed + errorMargin > this.bullets.targetX && 
				centerBulletY - this.bullets.speed - errorMargin < this.bullets.targetY &&
				centerBulletY + this.bullets.speed + errorMargin > this.bullets.targetY ||
				elapsedDistance > this.gameCore.range * 1.5) {
			this.bullets.incUnitX = 0;
			this.bullets.incUnitY = 0;
			this.bullets.interval = null;
			this.bullets.firing = false;
			this.bulletParticle01.on = false;
			this.bulletParticle02.on = false;
			this.engineCore.func_RequestExplosion(this.mapGroup, CONSTANTS.SPRITE_EXPLOSION_B, this.gameCore.playerId, this.gameCore.instanceId + "_A", this.bulletParticle01.x, this.bulletParticle01.y);
			this.engineCore.func_RequestExplosion(this.mapGroup, CONSTANTS.SPRITE_EXPLOSION_B, this.gameCore.playerId, this.gameCore.instanceId + "_B", this.bulletParticle02.x, this.bulletParticle02.y);
			var self = this;
			setTimeout(function() { self.shootTarget.isFiring = false; }, 3000);
		}
	}
}

Turret.prototype.rotate = function(angle) {
	this.topSegment.angle += angle;
}

Turret.prototype.play_anim = function(animId) {
	
}

Turret.prototype.destroy = function() {
	this.baseSegment.animations.destroy();
	this.baseSegment.destroy();
	this.topSegment.animations.destroy();
	this.topSegment.destroy();
	this.bulletParticle01.destroy();
	this.bulletParticle02.destroy();
}

Turret.prototype.getBounds = function() {
	var tempBounds = this.baseSegment.getBounds();
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

Turret.prototype.getHealthRenderBounds = function() {

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

Turret.prototype.getCells = function() {
	return this.gameCore.getCells();
}




