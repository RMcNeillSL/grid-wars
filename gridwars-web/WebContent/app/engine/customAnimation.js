// Class for custom animations and play speeds

function CustomAnimation(sender, frames, fps) {
	
	// Construct frames if none were passed
	if (frames == null) {
		frames = [];
		for (var index = 0; index < sender.animations.frameTotal; index ++) {
			frames.push(index);
		}
	}
	
	// Save passed variables
	this.sender = sender;
	this.frames = frames;
	this.fps = fps;
	
	// Declare misc variables
	this.playing = false;
	this.currentFrameIndex = 0;
	this.animationTimer = null;
	this.frameInterval = 1000.0 / fps;
	
	// Callback methods
	this.onComplete = null;
}

CustomAnimation.prototype.play = function() {
	
	// Save reference to this
	var self = this;
	
	// Function to run animation
	var animate = function() {
		if (self.playing) {
			if (self.currentFrameIndex < self.frames.length) {
				self.sender.frame = self.frames[self.currentFrameIndex];
				self.currentFrameIndex ++;
				self.animationTimer = setTimeout(animate, self.frameInterval);
			} else {
				self.playing = false;
				self.sender.frame = self.frames[self.frames.length-1];
				if (self.currentFrameIndex == self.frames.length && self.onComplete) {
					self.onComplete(self.sender);
				}
				self.currentFrameIndex = this.frames[0];
			}
		} else {
			self.sender.frame = 0;
			self.currentFrameIndex = this.frames[0];
			clearTimeout(self.animationTimer);
		}
	}

	// Mark as playing
	this.playing = true;
	
	// Start animation
	animate();
}

CustomAnimation.prototype.stop = function() {
	this.playing = false;
	this.sender.frame = 0;
	this.currentFrameIndex = this.frames[0];
	clearTimeout(this.animationTimer);
}