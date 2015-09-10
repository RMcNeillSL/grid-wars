'use strict';

(function() {
	
	// Waiting function to keep games synchronised
	function Waiter(waitCondition, successMethod, interval) {
		
		// Save passed variables
		var running = false;
		this.waitCondition = waitCondition;
		this.successMethod = successMethod;
		this.interval = interval;

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
	
	function GameController($rootScope, $scope, gameService) {

		// Save passed variables
		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.gameService = gameService;

		// Setup variables for game page
		this.$rootScope.pageName = "Game";
		this.$rootScope.socketsReady = false;

		// Save this reference for anonymous methods
		var self = this;
		
		// Start game method
		var startGame = function() {

			// Define server interface object
			self.serverAPI = new ServerAPI(gameService);
			
			// Define core game phaser variable
			self.phaserGame = new Engine(self.$rootScope.gameplayConfig, self.$rootScope.currentUser, self.serverAPI);
			self.$rootScope.gameplayResponseManager = function(responseData) {
				self.phaserGame.processGameplayResponse(responseData);
			};
			
			// Submit ready message
			gameService.gameStartRequest();

		}
		
		// Delay and wait for config information before proceeding
		var gameplayConfigWaiter = function() {
			if (self.$rootScope.gameplayConfig) {
				startGame();
			} else {
				setTimeout(gameplayConfigWaiter, 100);
			}
		}
		
		// Local caller methods
		var gameInit = function() {
			if (self.$rootScope.gameLeader) {
				console.log("HOST");
				gameService.gameInitRequest(gameplayConfigWaiter);
			} else {
				console.log("NOT HOST");
				gameplayConfigWaiter();
			}
		}

		// Call connect debug methods
//		gameService.debugConnect();
		gameService.initialiseSockets();
		
		// Wait until connections finished before proceeding  
		(new Waiter(function() { return self.$rootScope.socketsReady; }, gameInit, 100)).start();

	}

	GameController.$inject = [ '$rootScope', '$scope', 'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller('gridWarsApp.game.controller', GameController);
}());
