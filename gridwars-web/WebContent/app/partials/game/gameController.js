'use strict';

(function() {
	
	function GameController($rootScope, $scope, $location, $window, gameService) {
		document.onkeydown = function(){
			  switch (event.keyCode){
//			        case 116 : 		//F5 button
//			            event.returnValue = false;
//			            alert("Refreshing will cause you to lose your game.");
//			            return false;
//			        case 82 : 		//R button
//			            if (event.ctrlKey){ 
//			                event.returnValue = false;
//			                alert("Refreshing will cause you to lose your game.");
//			                return false;
//			            }
			        case 27 :		// Escape button
			        	alert("Leaving the game");
			        	var params = {};
			        	var request = new GameplayRequest("PLAYER_LEAVE_GAME", params);
			        	self.gameService.gameplayRequest(request);
			    }
			}

		// Save passed variables
		this.$rootScope = $rootScope;
		this.$scope = $scope;
		this.$location = $location;
		this.$window = $window;
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
		
//		if (self.$window.sessionStorage.gameInitialised == "false") {
			
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
//		gameService.debugConnect();

		// Wait until connections finished before proceeding - then run the game configuration method
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

		self.$window.sessionStorage.gameInitialised = true;
//		} else {
//			alert("You refreshed in a game despite our warnings.  You deserve everything you get");
//			var params = {
//					source: [],
//					target: []
//			};
//			var request = new GameplayRequest("PLAYER_LEAVE_GAME",params);
//			console.log("CALLING LEAVE: ", request);
//			this.gameService.gameplayRequest(request);
//			self.changeView("/servers");
//		}
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

	GameController.$inject = [ '$rootScope', '$scope', '$location', '$window',
			'gridWarsApp.game.service' ];

	angular.module('gridWarsApp.game.module').controller(
			'gridWarsApp.game.controller', GameController);
}());
