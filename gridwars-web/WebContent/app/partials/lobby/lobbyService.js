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
		onConnect: function () {
			console.log("Socket connection established in game lobby");
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_JOIN_GAME_LOBBY, {
				"user" : self.$rootScope.currentUser
			});
			self.$rootScope.currentlyInLobby = true;
		},
		onDisconnect: function () {
			console.log("The socket has disconnected in game lobby");
		},
		onChatMessage: function (data) {
			self.$rootScope.lobbyMessages.push(data);
			self.$rootScope.$apply();
		},
		userJoinedGameLobby: function (data) {
			var userJoinedMessage = {
					"user" : data,
					"message" : "has joined the lobby"
				};
			self.$rootScope.lobbyMessages.push(userJoinedMessage);
			self.$rootScope.$apply();
		},
		newGameConfig: function (mapId, mapName, maxPlayers, gameType, mapMaxPlayers, startingCash, 
				gameSpeed, unitHealth, buildingHealth, turretHealth, randomCrates, redeployableMCV) {
			self.$rootScope.gameConfig = {
					"mapId" 			: mapId,
					"mapName"			: mapName,
					"maxPlayers" 		: maxPlayers,
					"gameType" 			: gameType,
					"mapMaxPlayers"		: mapMaxPlayers,
					"startingCash" 		: startingCash,
					"gameSpeed" 		: gameSpeed,
					"unitHealth" 		: unitHealth,
					"buildingHealth" 	: buildingHealth,
					"turretHealth" 		: turretHealth,
					"randomCrates" 		: randomCrates,
					"redeployableMCV" 	: redeployableMCV
				}
			self.$rootScope.mapName = self.$rootScope.gameConfig.mapName.toLowerCase();
			self.$rootScope.mapName = self.$rootScope.mapName.split(' ').join('_');
			self.$rootScope.$apply();
		},
		newUserList: function (lobbyUserList) {
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
		},
		mapChangeError: function (message) {
			self.$rootScope.gameConfig.mapId = self.$rootScope.previousMapId;
			self.$rootScope.gameConfig.mapName = self.$rootScope.previousMapName;
			alert(message);
			self.$rootScope.$apply();
		},
		toggleUserReady: function (userId) {
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
		},
		changeUserColour: function (userId, colour) {
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
		},
		changeUserTeam: function (userId, team) {
			for (var i = 0; i < self.$rootScope.lobbyUserList.length; i++) {
				if (userId === self.$rootScope.lobbyUserList[i].linkedUser.id) {
					self.$rootScope.lobbyUserList[i].playerTeam = team;
				}
			}
			self.$rootScope.$apply();
		},
		gameInitialising: function () {
			self.$rootScope.lobbyMessages.push({user: "SERVER", message: "All users ready - initialising game"});
			self.$window.sessionStorage.gameInitialised = false;
			self.$location.path("/game");
			self.$rootScope.$apply();
		},
		leaderChanged: function (targetUsername) {
			if (targetUsername == self.$rootScope.currentUser) {
				self.$rootScope.gameLeader = true;
				self.$window.sessionStorage.gameLeader = true;
			} else {
				self.$rootScope.gameLeader = false;
				self.$window.sessionStorage.gameLeader = false;
			}

			self.$rootScope.lobbyMessages.push({user: "SERVER", message: "Leader has been changed to " + targetUsername});
			self.$rootScope.$apply();
		},
		userLeftLobby: function (username) {
			self.$rootScope.lobbyMessages.push({user: "SERVER", message: username + " has left the lobby"});
			self.$rootScope.$apply();
		},
		leftLobby: function () {
			if (self.$rootScope.loggedOut) {
				self.$location.path("/login");
			} else {
				self.$location.path("/servers");
			}
			self.$rootScope.$apply();
		},
		roomDeleted: function () {
			alert("The lobby leader has delete the lobby, returning to the server lobby page");
			self.$location.path("/servers");
			self.$rootScope.$apply();
		},
		getMaps: function () {
			self.$http.get("/gridwars/rest/game/maps").then(function(response) {
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
			var chatObject = {
					"user" : self.$rootScope.currentUser,
					"message" : newMessage
				};
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_CHAT_MESSAGE, chatObject);
		},
		getConfig: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_GET_NEW_CONFIG);
		},
		getUsers: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_GET_NEW_USER_LIST);
		},
		joinGameLobby: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_JOIN_GAME_LOBBY, {
				"user" : self.$rootScope.currentUser
			});
			self.$rootScope.currentlyInLobby = true;
			self.$rootScope.gameLobbyName = self.$rootScope.gameConfig.lobbyName;
		},
		updateConfig: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_UPDATE_GAME_CONFIG, this.$rootScope.gameConfig);
		},
		toggleReady: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_USER_TOGGLE_READY);
		},
		changeColour: function (colour) {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_USER_CHANGE_COLOUR, colour);
		},
		changeTeam: function (team) {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_USER_CHANGE_TEAM, team);
		},
		startGame: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_GAME_INIT);
		},
		changeLeader: function (userId) {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_CHANGE_LOBBY_LEADER, userId);
		},
		leaveGame: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_LEAVE_GAME_LOBBY);
			self.$rootScope.gameLeader = false;
			self.$window.sessionStorage.gameLeader = false;
			self.$rootScope.currentlyInLobby = false;
		}
	}

	LobbyService.$inject = ['$rootScope', '$location', '$window', '$http'];

	angular.module('gridWarsApp.lobby.module').service('gridWarsApp.lobby.service', LobbyService);
}());