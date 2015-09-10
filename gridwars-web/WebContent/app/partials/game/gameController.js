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
		this.$scope.gameEngine = CONSTANTS.GAME_NAME;
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
		
		// Call connect debug methods
//		gameService.debugConnect();
		gameService.initialiseSockets();
		
		// Wait until connections finished before proceeding - then run the game configuration method
		var gameplayConfigWaiter = new Waiter(function() { return self.$rootScope.gameplayConfig; }, startGame, 100); // -- should really change so the server has a list of acknowleged users
		(new Waiter(function() { return self.$rootScope.socketsReady; }, function() {
			if (self.$rootScope.gameLeader) {
				setTimeout(function() { gameService.gameInitRequest(gameplayConfigWaiter); }, 500);
			} else {
				gameplayConfigWaiter.start();
			}}, 100)).start();

	}

	GameController.$inject = [ '$rootScope', '$scope', 'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller('gridWarsApp.game.controller', GameController);
}());
