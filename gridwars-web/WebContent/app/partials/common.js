
// Record of all waiting timers
var existingWaiters = [];

// Waiting function to keep games synchronised
function Waiter(waitCondition, successMethod, interval) {

	// Save passed variables
	var running = false;
	this.waitCondition = waitCondition;
	this.successMethod = successMethod;
	this.interval = interval;
	
	// Add this to record of waiters
	existingWaiters.push(this);

	// Save this reference for anonymous methods
	var self = this;

	// Local method for main waiting execution
	var run = function() {
		console.log("Waiting...");
		if (running) {
			if (self.waitCondition()) {
				running = false;
				self.successMethod();
			} else {
				setTimeout(run, interval);
			}
		} else {
			running = false;
		}
	}

	// Start waiter
	this.start = function() {
		if (!running) {
			running = true;
			run();
		}
	}

	// Halt waiter
	this.stop = function() {
		running = false;
	}

}
