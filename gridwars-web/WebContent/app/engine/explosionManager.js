function ExplosionManager(phaserRef) {
	
	// Save reference variables
	this.phaserRef = phaserRef;
	
}

ExplosionManager.prototype.requestExplosion = function(mapGroup, explosionId, x, y) {
	
	// Check phaser ref is assigned
	if (this.phaserRef && false) {
		
		var self = this;

		// Create impact decal sprite
		var localImpact = this.phaserRef.add.sprite(x, y, CONSTANTS.SPRITE_IMPACT_DECALS, 0);
		localImpact.anchor.setTo(0.5, 0.5);
		localImpact.z = 0;
		localImpact.angle = Math.random() * 100;
		mapGroup.add(localImpact);
		
		// Create explosion sprite
		var localExplosion = this.phaserRef.add.sprite(x, y, explosionId, 0);
		localExplosion.anchor.setTo(0.5, 0.5);
		localExplosion.z = 100;

		// Create fade out animation
		var fadeOut = localImpact.animations.add('localImpaceFade');
		fadeOut.onComplete.add(function(sprite, animation) {
			sprite.animations.destroy();
			sprite.destroy();
		});
		
		// Create explode animation
		var explode = localExplosion.animations.add('localExplode');
		explode.onComplete.add(function(sprite, animation) {
			sprite.animations.destroy();
			sprite.destroy();
			fadeOut.play(0.25, false, null);
		});
		
		// Run explosion animation
		explode.play(30, false, null);
		
	}
	
}