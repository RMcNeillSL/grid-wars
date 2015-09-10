'use strict';

(function () {
	
	function GameService ($rootScope, $http) {
		
		// Save passed variables
		this.$http = $http;
		this.$rootScope = $rootScope;
		
	}
	GameService.prototype = {
			
			// Socket initialisation method
			initialiseSockets: function() {

				// Save refernce to self
				var self = this;
				
				console.log(this);

				// Socket connect event
				this.socket = io.connect("http://localhost:8080", {
					"force new connection": true
				});

				// On socket connection established submit user join room request
				this.socket.on("connect", function () {
					console.log("Joining lobby room");
					self.socket.emit("joinGameLobby", {
						"user" : self.$rootScope.currentUser
					});
				});

				// When user has joined a room mark sockets as ready
				this.socket.on("userJoinedGameLobby", function (userId) {
					self.$rootScope.socketsReady = (userId == self.$rootScope.currentUser);
					console.log("UserId:" + userId);
					console.log("currentUser:" + self.$rootScope.currentUser);
				});

				// Listen for game initialisation
				this.socket.on("gameInit", function(gameplayConfig) {
					console.log("REC: Game initialisation request received.");
					console.log(gameplayConfig);
					self.$rootScope.gameplayConfig = gameplayConfig;
				});

				// Listen for game start message from server
				this.socket.on("gameStart", function() {
					console.log("REC: Game has started over sockets");
				});

				// Listen for game responses which occurred
				this.socket.on("gameplayResponse", function(response) {
					
					// Format coords of response
					var tempCoords = response.coords.slice(0);
					response.coords = []; var newCoord = {};
					for (var index = 0; index < tempCoords.length; index ++) {
						if (index % 2 == 0) {
							newCoord.col = tempCoords[index];
						} else {
							newCoord.row = tempCoords[index];
							response.coords.push(newCoord);
						}
					}
					
					// Log response for debug
					console.log(response);
					
					// Invoke response method
					self.$rootScope.gameplayResponse = response;
					if (self.$rootScope.gameplayResponseManager) {
						self.$rootScope.gameplayResponseManager(response);
					}
					
				});

			},
			

			// Game startup socket methods
			gameInitRequest: function(callback, data) {
				var self = this;
				console.log("Submitted game init request");
				self.socket.emit("initGame", {
					"lobbyId" : self.$rootScope.gameConfig.lobbyId
				});
				if (callback) { callback(); }
			},
			gameStartRequest: function(callback, data) {
				console.log("Marking user as ready to play");
				this.socket.emit("startGame");
			},
			gameplayRequest: function(callback, data) {
				this.socket.emit("gameplayRequest", data);
			},
			gameplayRequestAndWait: function(callback, data) {
				var self = this;
				self.$rootScope.gameplayResponse = null;
				var waitFunction = function() {
//					console.log("Waiting...");
					if (self.$rootScope.gameplayResponse) {
						if (callback) {
							callback(self.$rootScope.gameplayResponse);
						}
					} else {
						setTimeout(waitFunction, 50);
					}
				}
				waitFunction();
				self.socket.emit("gameplayRequest", data);
			},
			
			
			// Debug methods to make testing easier
			debugConnect: function (callback) {
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
					self.initialiseSockets();
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
					self.initialiseSockets();
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