function ExplosionManager(phaserRef) {
	
	// Save reference variables
	this.phaserRef = phaserRef;
	
	// Create registered explosion list
	this.explosionRegister = [];
	
}

ExplosionManager.prototype.requestDestruction = function(mapGroup, debrisId, explosionId, x, y) {

	// Check phaser ref is assigned
	if (this.phaserRef) {

		// Save reference to this for local calls
		var self = this;

		// Destroyed flag
		var destroyed = false;

		// Create explosion sprite
		var localExplosion = this.phaserRef.add.sprite(x, y, explosionId, 0);
		localExplosion.anchor.setTo(0.5, 0.5);
		localExplosion.z = 100;
		
		// Create explode animation
		var explode = new CustomAnimation(localExplosion, null, 100);
		explode.onComplete = function(sprite) {
			sprite.animations.destroy();
			sprite.destroy();
		};
		
		// Run explosion animation
		explode.play();
		
		// Return function to update visibility state
		return {
			centreCell : (new Point(localExplosion.x, localExplosion.y)).toCell(),
			setVisible : function(visible) { 
					if (!destroyed) { localExplosion.visible = visible; }
					return destroyed;
				}
		}
	}
}

ExplosionManager.prototype.requestExplosion = function(mapGroup, explosionId, ownerId, explosionInstanceId, x, y) {
	
	// Check phaser ref is assigned
	if (this.phaserRef) {
		
		// Save reference to this for local calls
		var self = this;

		// Destroyed flag
		var destroyed = false;

		// Create impact decal sprite
		var localImpact = this.phaserRef.add.sprite(x, y, CONSTANTS.SPRITE_IMPACT_DECALS, 0);
		localImpact.anchor.setTo(0.5, 0.5);
		localImpact.z = 0;
		localImpact.angle = Math.random() * 100;
		mapGroup.add(localImpact);
		
		// Create explosion sprite
		var localExplosion = this.phaserRef.add.sprite(x, y, explosionId, 0);
		this.phaserRef.physics.enable(localExplosion, Phaser.Physics.ARCADE);
		localExplosion.explosionInstanceId = explosionInstanceId;
		localExplosion.ownerId = ownerId;
		localExplosion.anchor.setTo(0.5, 0.5);
		localExplosion.z = 100;
		this.registerExplosion(localExplosion);
		
		// Create fade out animation
		var fadeOut = new CustomAnimation(localImpact, null, 0.25);
		fadeOut.onComplete = function(sprite) {
			sprite.animations.destroy();
			sprite.destroy();
		};
		
		// Create explode animation
		var explode = new CustomAnimation(localExplosion, null, 30);
		explode.onComplete = function(sprite) {
			var targetIndex = self.explosionRegister.indexOf(sprite);
			self.explosionRegister.splice(targetIndex, 1);
			sprite.animations.destroy();
			sprite.destroy();
			fadeOut.play();
		};
		
		// Run explosion animation
		explode.play();

		// Return function to update visibility state
		return [{
					centreCell : (new Point(localImpact.x, localImpact.y)).toCell(),
					setVisible : function(visible) { 
						if (!destroyed) { localImpact.visible = visible; }
						return destroyed;
					}
				}, {
					centreCell : (new Point(localExplosion.x, localExplosion.y)).toCell(),
					setVisible : function(visible) {
							if (!destroyed) { localExplosion.visible = visible; }
							return destroyed;
					}
				}];
	}
}

ExplosionManager.prototype.registerExplosion = function(explosionSprite) {
	this.explosionRegister.push(explosionSprite);
}

ExplosionManager.prototype.unregisterExplosion = function(sprite) {
	var targetIndex = this.explosionRegister.indexOf(sprite);
	this.explosionRegister.splice(targetIndex, 1);
}
