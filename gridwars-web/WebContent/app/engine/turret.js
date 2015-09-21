function Turret(engineCore, gameCore, mapGroup, turretGroup, xy, col, row, width, height, inBuildingMode) {

	// Make sure dependencies has been passed
	if (turretGroup) {
		
		// Save core game object
		this.gameCore = gameCore;
		
		// Save engine core object
		this.engineCore = engineCore;
		this.turretGroup = turretGroup;
		this.mapGroup = mapGroup;
		
		// Save sprite positioning
		this.width = width;
		this.height = height;
		this.left = xy.x + this.width/2;
		this.top = xy.y + this.height/2;
		this.col = col;
		this.row = row;
		
		// Set default misc values
		this.rotateSpeed = 3;
		this.damageExplosions = [];
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
			
			// Setup default bullet particle information
			self.bullets.firing = true;
			self.bullets.elapsed = 0;
			
			// Save target location for bullets
			self.bullets.targetX = self.target.x;
			self.bullets.targetY = self.target.y;
			
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
			
			// Set movement update interval
			self.bullets.interval = setInterval(function() { self.bullets.elapsed += 1; }, 3);
			
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
	
	if (this.target.active) {
		this.rotateAndShoot();
	}
	
	if (this.bullets.firing) {
		this.manageFiringBullets();
	}
}

Turret.prototype.rotateAndShoot = function(targetX, targetY) {
	
	// Check if a target needs assigning
	if (targetX && targetY) {

		// Check X&Y deltas
		var deltaX = targetX - this.left;
		var deltaY = targetY - this.top;
		
		// Calculate target angle
		var targetAngle = 0;
		var calcAngle = Math.atan((deltaX*1.0)/deltaY) * 180/Math.PI;
		if (deltaX >= 0 && deltaY <= 0) { targetAngle = 0 - calcAngle; }
		if (deltaX >= 0 && deltaY >= 0) { targetAngle = 180 - calcAngle; }
		if (deltaX <= 0 && deltaY >= 0) { targetAngle = -180 - calcAngle; }
		if (deltaX <= 0 && deltaY <= 0) { targetAngle = 0 - calcAngle; }
		
		// Adjust angles to 0-360 values
		this.target.increment = this.rotateSpeed;
		var target360Angle = targetAngle;
		var current360Angle = this.topSegment.angle;
		if (target360Angle < 0) { target360Angle += 360; }
		if (current360Angle < 0) { current360Angle += 360; }
		
		// Determine move increment direction based on angle size
		var angleAbsDif = Math.max(target360Angle, current360Angle) - Math.min(target360Angle, current360Angle);
		if (current360Angle < target360Angle && angleAbsDif <= 180) { this.target.increment = this.rotateSpeed; }
		if (current360Angle < target360Angle && angleAbsDif > 180) { this.target.increment = -this.rotateSpeed; }
		if (current360Angle > target360Angle && angleAbsDif <= 180) { this.target.increment = -this.rotateSpeed; }
		if (current360Angle > target360Angle && angleAbsDif > 180) { this.target.increment = this.rotateSpeed; }
		
		// Save target angle data
		this.target.angle = targetAngle;
		this.target.x = targetX;
		this.target.y = targetY;
		this.target.active = true;
		
	}

	// Proceed to orientate turret to target
	if (this.target.active) {
		
		// Check if charge reset should occur
		if (this.topSegment.angle - (this.rotateSpeed + 1) > this.target.angle ||
				this.topSegment.angle + (this.rotateSpeed + 1) < this.target.angle) {
			this.topSegment.animations.stop('fireAndCool', true);
			this.topSegment.animations.frame = this.gameCore.colour.TOP;
		}
		
		// Check if rotation needs to occur
		if (this.topSegment.angle - (this.rotateSpeed / 2) > this.target.angle ||
				this.topSegment.angle + (this.rotateSpeed / 2) < this.target.angle) {
			this.rotate(this.target.increment);
		} else {
			this.target.active = false;
			this.charge.play();
		}
		
	}
	
}

Turret.prototype.manageFiringBullets = function() {

	// Proceed to manage movement of firing particles
	if (this.bullets.firing) {

		var elapsedDistance = this.bullets.elapsed * this.bullets.speed;
		
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
				centerBulletY + this.bullets.speed + errorMargin > this.bullets.targetY) {
			this.bullets.incUnitX = 0;
			this.bullets.incUnitY = 0;
			clearInterval(this.bullets.interval);
			this.bullets.interval = null;
			this.bullets.firing = false;
			this.bulletParticle01.on = false;
			this.bulletParticle02.on = false;
			this.engineCore.func_RequestExplosion(this.mapGroup, CONSTANTS.SPRITE_EXPLOSION_B, this.gameCore.playerId, this.gameCore.instanceId + "_A", this.bulletParticle01.x, this.bulletParticle01.y);
			this.engineCore.func_RequestExplosion(this.mapGroup, CONSTANTS.SPRITE_EXPLOSION_B, this.gameCore.playerId, this.gameCore.instanceId + "_B", this.bulletParticle02.x, this.bulletParticle02.y);
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
	return this.baseSegment.getBounds();
}

Turret.prototype.getHealthRenderBounds = function() {

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




