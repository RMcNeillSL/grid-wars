'use strict';

(function () {
	
	function GameService ($rootScope, $http) {
		
		// Save passed variables
		this.$http = $http;
		this.$rootScope = $rootScope;
	}
	GameService.prototype = {
			onConnect: function() {
				console.log("Socket connection in game");
				if (this.$rootScope.inDebug) {
					this.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_JOIN_GAME_LOBBY, { "user" : this.$rootScope.currentUser });
				}
			},
			onDisconnect: function() {
				console.log("Socket disconnected in game");
			},
			joinGame: function () {
				this.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_JOIN_GAME);
			},
			onGameJoin: function (userId) {
				this.$rootScope.socketsReady = (userId == this.$rootScope.currentUser || this.$rootScope.socketsReady);
				console.log("UserId:" + userId);
				console.log("currentUser:" + this.$rootScope.currentUser);
			},
			gameInit: function(gameplayConfig) {
				console.log("REC: Game initialisation request received.");
				console.log(gameplayConfig);
				this.$rootScope.gameplayConfig = gameplayConfig;
			},
			gameStart: function() {
				this.$rootScope.gameLoaded = true;
				this.$rootScope.$apply();
				console.log("REC: Game has started over sockets");
			},
			gameplayResponse: function(response) {
				// Format coords of response
				var tempCoords = response.coords.slice(0);
				response.coords = []; var newCoord = {};
				for (var index = 0; index < tempCoords.length; index = index + 2) {
					response.coords.push(new Cell(tempCoords[index], tempCoords[index+1]));
				}
				
				// Log response for debug
				function GameplayResponse(response) {
					this.responseCode = response.responseCode;
					if (response.coords) { this.coords = response.coords; } else { this.coords = []; }
					if (response.source) { this.source = response.source; } else { this.source = []; }
					if (response.target) { this.target = response.target; } else { this.target = []; }
					if (response.misc) { this.misc = response.misc; } else { this.misc = []; }
				}
				var gameplayResponse = new GameplayResponse(response);
				console.log(gameplayResponse);
				
				// Invoke response method
				this.$rootScope.gameplayResponse = gameplayResponse;
				if (this.$rootScope.gameplayResponseManager) {
					this.$rootScope.gameplayResponseManager(gameplayResponse);
				}
			},
			
			
			// Game startup socket methods
			gameInitRequest: function(waiter) {
				var self = this;
				console.log("SND: Submitted game init request");
				this.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_ACTUAL_GAME_INIT, {
					"lobbyId" : this.$rootScope.gameConfig.lobbyId
				});
//				self.socket.emit("initGame", {
//					"lobbyId" : self.$rootScope.gameConfig.lobbyId
//				});
				if (waiter) { waiter.start(); }
			},
			gameStartRequest: function() {
				console.log("SND: Marking user as ready to play");
				this.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_START_GAME);
				//this.socket.emit("startGame");
			},
			gameplayRequest: function(data) {
				this.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_GAMEPLAY_REQUEST, data);
				//this.socket.emit("gameplayRequest", data);
			},
			
			
			// Debug methods to make testing easier
			debugConnect: function (callback) {
				this.$rootScope.inDebug = true;
				this.$rootScope.currentUser = "JamesHill05";
				this.$rootScope.gameLeader = true;
				var self = this;
				this.$http.post("/gridwars/rest/auth", {
					"usernameAttempt" : "JamesHill05",
					"passwordAttempt" : "password"
				}).then(function (response) {
					console.log("SUCCESS: Connected");
					console.log(response.data);
					self.debugNewLobby(callback);
				}, function (response) {
					if (response.status === 500) {
						self.debugNewLobby(callback);
					} else {
						console.log("ERROR: Failed to connect");
					}
				});
			},
			debugNewLobby: function (callback) {
				var self = this;
				this.$http.post("/gridwars/rest/game/new").then(function(response) {
					console.log("SUCCESS: New game retrieved");
					self.$rootScope.gameConfig = response.data;
					console.log(self.$rootScope.gameConfig);
					if (callback) { callback("L", response.data); }
				}, function(response) {
					if (response.status === 401) {
						console.log("ERROR: Unauthorised access request");
					} else {
						self.debugGetLobbyInformation(callback);
					}
				});
			},
			debugGetLobbyInformation: function (callback) {
				var self = this;
				this.$http.get("/gridwars/rest/user/game").then(function(response) {
					console.log("SUCCESS: Existing game retrieved");
					self.$rootScope.gameConfig = response.data;
					console.log(self.$rootScope.gameConfig);
					if (callback) { callback("L", response.data); }
				}, function (error) {
					console.log("ERROR: Failed to retrieve game");
				});
			}
	}
	
	GameService.$inject = ['$rootScope', '$http'];
	
	angular.module('gridWarsApp.game.module').service('gridWarsApp.game.service', GameService);
}());