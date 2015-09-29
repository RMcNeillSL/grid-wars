'use strict';

(function() {
	
	function GameController($rootScope, $scope, $location, gameService) {

		// Save passed variables
		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$location = $location;
		this.gameService = gameService;

		// Setup variables for game page
		this.engineExists = false;
		this.$scope.gameEngine = CONSTANTS.GAME_NAME;
		this.$rootScope.pageName = "Game";
		this.$rootScope.socketsReady = false;
		this.$rootScope.gameLoaded = false;
		
		// Save this reference for anonymous methods
		var self = this;

		// Create/clean socket system
		if (!this.$rootScope.sockets) {
			this.$rootScope.sockets = new SocketShiz();
		} else {
			this.$rootScope.sockets.resetCallbacks();
		}
		
		// Bind new socket events for game controller
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CONNECT, 			function(response) { self.gameService.onConnect(response); });
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_DISCONNECT, 		function(response) { self.gameService.onDisconnect(response); });
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_GAME_JOIN, 			function(response) { self.gameService.onGameJoin(response); });
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_ACTUAL_GAME_INIT, 	function(response) { self.gameService.gameInit(response); });
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_GAME_START, 		function(response) { self.gameService.gameStart(response); });
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_GAMEPLAY_RESPONSE, 	function(response) { self.gameService.gameplayResponse(response); });
		
		// Join current game
		this.gameService.joinGame();

		// Start game method
		var startGame = function() {

			// Finished game callback
			var gameFinished = function(playerResults) {
				var callback = function() {
					self.changeView("/results");
				}
				self.$rootScope.playerResults = playerResults;
				self.gameService.gameComplete(callback);
			}
			
			// Setup game 'constants' for buildings and units
			CONSTANTS.GAME_BUILDINGS = self.$rootScope.gameplayConfig.gameBuildings;
			CONSTANTS.GAME_UNITS = self.$rootScope.gameplayConfig.gameUnits;
			
			// Make sure a second engine is not being created
			if (!self.engineExists) {
				
				// Notify of game starting
				console.log("LOG: Game engine initialising.");

				// Mark engine as constructed
				self.engineExists = true;

				// Define server interface object
				self.serverAPI = new ServerAPI(gameService);
				console.log("LOG: Server API object constructed.");

				// Define core game phaser variable
				self.phaserGame = new Engine(self.$rootScope.gameplayConfig, self.$rootScope.currentUser, self.serverAPI, gameFinished);
				console.log("LOG: Engine object constructed.");
				
				// Link responses for socket communication
				self.$rootScope.gameplayResponseManager = function(responseData) {
					self.phaserGame.processGameplayResponse(responseData);
				};
				console.log("LOG: Linked game sockets to socket manager.");

				// Submit ready message
				(new Waiter(function() { return !self.phaserGame.engineLoading; }, function() {
					gameService.gameStartRequest();
					console.log("LOG: Game start request has been sent.");
				}, 50)).start();
			}
		}

		// Call connect debug methods
		gameService.debugConnect();

		// Wait until connections finished before proceeding - then run the game
		// configuration method
		var gameplayConfigWaiter = new Waiter(function() {
			return self.$rootScope.gameplayConfig;
		}, startGame, 100); // -- should really change so the server has a list of acknowledged users
		(new Waiter(function() { return self.$rootScope.socketsReady; }, function() {
			if (self.$rootScope.gameLeader) {
				setTimeout(function() {
					gameService.gameInitRequest(gameplayConfigWaiter);
				}, 500);
			} else {
				gameplayConfigWaiter.start();
			}
		}, 100)).start();
	}

	GameController.prototype = {
		purchaseObject : function(item) {
			this.phaserGame.purchaseObject(item);
		},
		changeView : function(path) {
			this.$location.path(path);
			this.$rootScope.$apply();
		}
	}

	GameController.$inject = [ '$rootScope', '$scope', '$location',
			'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller(
			'gridWarsApp.game.controller', GameController);
}());
