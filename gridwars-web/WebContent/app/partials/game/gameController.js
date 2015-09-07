'use strict';

(function() {

	function GameController($rootScope, $scope, gameService) {
		
		// Save this reference
		var self = this;
		
		// Save passed variables
		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.gameService = gameService;
		
		// Hacky-slash debug settings
		this.$rootScope.currentUser = "JamesHill05";

		// Start game method
		var startGame = function() {

			// Create game config object
			var gameConfig = {
				map : {
					name : "Random Name",
					width : 8,
					height : 6,
					map : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
							0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
				},
				maxPlayers : 2,
				gameType : "FREE_FOR_ALL"
			};

			// Define core game phaser variable
			var phaserGame = new Engine(gameConfig);

			// Define server interface object
			var serverAPI = new ServerAPI();
			
			// Submit ready message
			gameService.gameStartRequest();

		}
		
		// Local caller methods
		var gameInit = function() { gameService.gameInitRequest(startGame); }
		
		// Call connect debug methods
		this.$rootScope.socketsReady = false;
		gameService.debugConnect();
		
		// Wait until connections finished before proceeding
		var connectionWaiter = function() {
			if (self.$rootScope.socketsReady) {
				gameInit();
			} else {
				setTimeout(connectionWaiter, 500);
			}
		};
		connectionWaiter();

	}

	GameController.$inject = [ '$rootScope', '$scope', 'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller('gridWarsApp.game.controller', GameController);
}());
