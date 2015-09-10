'use strict';

(function() {

	function GameController($rootScope, $scope, gameService) {

		$rootScope.pageName = "Game";
		
		// Save passed variables
		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.gameService = gameService;
		
		// Save this reference
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
		var gameInit = function() { gameService.gameInitRequest(gameplayConfigWaiter); }

		// Hacky-slash debug settings
//		this.$rootScope.currentUser = "JamesHill05";

		// Call connect debug methods
		this.$rootScope.socketsReady = false;
//		gameService.debugConnect();
		gameService.initialiseSockets();
		
		// Wait until connections finished before proceeding  
		var connectionWaiter = function() {
			if (self.$rootScope.socketsReady) {
				gameInit();
			} else {
				setTimeout(connectionWaiter, 100);
			}
		};
		connectionWaiter();

	}

	GameController.$inject = [ '$rootScope', '$scope', 'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller('gridWarsApp.game.controller', GameController);
}());
