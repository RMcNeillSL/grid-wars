'use strict';

(function () {

	function LobbyService ($rootScope, $location, $window, $http) {
		this.$http = $http;
		this.$rootScope = $rootScope;
		this.$window = $window;
		this.$location = $location;
		self = this;
	}

	LobbyService.prototype = {
		socketSetup: function () {
			self = this;
			console.log("Socket connection to: " + CONSTANTS.SOCKET_SERVER);
			this.lobbySocket = io.connect(CONSTANTS.SOCKET_SERVER, {
				"force new connection": true
			});

			this.lobbySocket.on("connect", function () {
				self.lobbySocket.emit("joinGameLobby", {
					"user" : self.$rootScope.currentUser
				});
			});

			this.lobbySocket.on("gameLobbyMessage", function(data) {
				self.$rootScope.lobbyMessages.push(data);
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("userJoinedGameLobby", function(data) {
				var userJoinedMessage = {
						"user" : data,
						"message" : "has joined the lobby"
					};
				self.$rootScope.lobbyMessages.push(userJoinedMessage);
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("gameConfig", function(mapId, maxPlayers, gameType, mapMaxPlayers, startingCash, 
				gameSpeed, unitHealth, buildingHealth, turretHealth, randomCrates, redeployableMCV) {
				self.$rootScope.gameConfig = {
					"mapId" : mapId,
					"maxPlayers" : maxPlayers,
					"gameType" : gameType,
					"mapMaxPlayers": mapMaxPlayers,
					"startingCash" : startingCash,
					"gameSpeed" : gameSpeed,
					"unitHealth" : unitHealth,
					"buildingHealth" : buildingHealth,
					"turretHealth" : turretHealth,
					"randomCrates" : randomCrates,
					"redeployableMCV" : redeployableMCV
				}
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("lobbyUserList", function(lobbyUserList) {
				self.$rootScope.lobbyUserList = lobbyUserList;
				var tempNotReadyCount = 0;
				self.$rootScope.connectedUsers = 0;

				for (var i = 0; i < self.$rootScope.lobbyUserList.length; i++) {
					for (var x = 0; x < self.$rootScope.colourList.length; x++) {
						if (self.$rootScope.lobbyUserList[i].playerColour === self.$rootScope.colourList[x]) {
							self.$rootScope.colourList.splice(x, 1);
						}
					}
					if (self.$rootScope.lobbyUserList[i].ready == false) {
						tempNotReadyCount++;
					}
					self.$rootScope.connectedUsers++;
				}

				self.$rootScope.notReadyCount = tempNotReadyCount-1;

				self.$rootScope.connectedUserCount = self.$rootScope.lobbyUserList.length;

				if (self.$rootScope.gameConfig) {
					for (var i = (self.$rootScope.lobbyUserList.length); i < self.$rootScope.gameConfig.mapMaxPlayers; i++) {
						var emptyPlayer = {
								factionId : -1,
								linkedUser : { id : -1, username : "Empty"},
								playerColour : "N/A",
								playerTeam : 0,
								ready : null
						}

						if (i < self.$rootScope.gameConfig.maxPlayers) {
							emptyPlayer.linkedUser.username = "Open";
						} else {
							emptyPlayer.linkedUser.username = "Closed";
						}
						self.$rootScope.lobbyUserList.push(emptyPlayer);
					}
				}
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("mapChangeError", function (message) {
				self.$rootScope.gameConfig.mapId = self.$rootScope.previousMapId;
				alert(message);
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("toggleUserReady", function (userId) {
				var tempNotReadyCount = 0;

				for (var i = 0; i < self.$rootScope.lobbyUserList.length; i++) {
					if (userId === self.$rootScope.lobbyUserList[i].linkedUser.id && self.$rootScope.lobbyUserList[i].ready != null) {
						self.$rootScope.lobbyUserList[i].ready = !self.$rootScope.lobbyUserList[i].ready;
					}
					if (self.$rootScope.lobbyUserList[i].ready == false) {
						tempNotReadyCount++;
					}
				}
				self.$rootScope.notReadyCount = tempNotReadyCount-1;
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("changeUserColour", function(userId, colour) {
				for (var i = 0; i < self.$rootScope.lobbyUserList.length; i++) {
					if (userId === self.$rootScope.lobbyUserList[i].linkedUser.id) {
						for (var x = 0; x < self.$rootScope.colourList.length; x++) {
							if (self.$rootScope.colourList[x] === colour) {
								self.$rootScope.colourList[x] = self.$rootScope.lobbyUserList[i].playerColour;
							}
						}
						self.$rootScope.lobbyUserList[i].playerColour = colour;
					}
				}
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("changeUserTeam", function(userId, team) {
				for (var i = 0; i < self.$rootScope.lobbyUserList.length; i++) {
					if (userId === self.$rootScope.lobbyUserList[i].linkedUser.id) {
						self.$rootScope.lobbyUserList[i].playerTeam = team;
					}
				}
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("gameInitialising", function () {
				self.$rootScope.lobbyMessages.push({user: "SERVER", message: "All users ready - initialising game"});
				self.$location.path("/game");
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("leaderChanged", function (targetUsername) {
				if (targetUsername == self.$rootScope.currentUser) {
					self.$rootScope.gameLeader = true;
					self.$window.sessionStorage.gameLeader = true;
				} else {
					self.$rootScope.gameLeader = false;
					self.$window.sessionStorage.gameLeader = false;
				}

				self.$rootScope.lobbyMessages.push({user: "SERVER", message: "Leader has been changed to " + targetUsername});
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("userLeftLobby", function (username) {
				self.$rootScope.lobbyMessages.push({user: "SERVER", message: username + " has left the lobby"});
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("leftLobby", function () {
				self.lobbySocket.emit("forceDisconnect");
				if (self.$rootScope.loggedOut) {
					self.$location.path("/login");
				} else {
					self.$location.path("/servers");
				}
				self.$rootScope.$apply();
			});

			this.lobbySocket.on("roomDeleted", function () {
				alert("The lobby leader has delete the lobby, returning to the server lobby page");
				self.$location.path("/servers");
				self.$rootScope.$apply();
			});
		},
		getMaps: function () {
			this.$http.get("/gridwars/rest/game/maps").then(function(response) {
				response.data.forEach(function(map) {
					self.$rootScope.mapList.push(map);
				});
			}, function(response) {
				if (response.status !== 200) {
					console.log("ERROR.");		//TODO: Add more error checking
				}
			});
		},
		sendMessage: function (newMessage) {
			var tempObject = {
					"user" : self.$rootScope.currentUser,
					"message" : newMessage
				};
			this.lobbySocket.emit("sendMessage", tempObject);
		},
		getConfig: function () {
			this.lobbySocket.emit("getNewConfig");
		},
		getUsers: function () {
			this.lobbySocket.emit("getNewUserList");
		},
		joinGameLobby: function () {
			this.lobbySocket.emit("joinGameLobby");
			this.$rootScope.gameLobbyName = self.$rootScope.gameConfig.lobbyName;
		},
		updateConfig: function () {
			this.lobbySocket.emit("updateGameConfig", self.$rootScope.gameConfig);
		},
		toggleReady: function () {
			this.lobbySocket.emit("userToggleReady");
		},
		changeColour: function (colour) {
			this.lobbySocket.emit("userChangeColour", colour);
		},
		changeTeam: function (team) {
			this.lobbySocket.emit("userChangeTeam", team);
		},
		startGame: function () {
			this.lobbySocket.emit("startGameInitialisation");
		},
		changeLeader: function (userId) {
			this.lobbySocket.emit("changeLobbyLeader", userId);
		},
		leaveGame: function () {
			this.lobbySocket.emit("leaveLobby");
			self.$rootScope.gameLeader = false;
			self.$window.sessionStorage.gameLeader = false;
		}
	}

	LobbyService.$inject = ['$rootScope', '$location', '$window', '$http'];

	angular.module('gridWarsApp.lobby.module').service('gridWarsApp.lobby.service', LobbyService);
}());