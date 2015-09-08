'use strict';

(function () {

	function LobbyService ($rootScope, $location, $http) {
		this.$http = $http;
		this.$rootScope = $rootScope;
		this.$location = $location;
		self = this;
		
		console.log("TEST");

		this.socket = io.connect("http://localhost:8080", {
			"force new connection": true
		});

		this.socket.on("connect", function () {
			self.socket.emit("joinGameLobby", {
				"user" : self.$rootScope.currentUser
			});
		});

		this.socket.on("gameLobbyMessage", function(data) {
			$rootScope.lobbyMessages.push(data);
			$rootScope.$apply();
		});

		this.socket.on("userJoinedGameLobby", function(data) {
			var userJoinedMessage = {
					"user" : data,
					"message" : "has joined the lobby"
				};
			$rootScope.lobbyMessages.push(userJoinedMessage);
			$rootScope.$apply();
		});

		this.socket.on("gameConfig", function(mapId, maxPlayers, gameType, mapMaxPlayers) {
			self.$rootScope.gameConfig.mapId = mapId;
			self.$rootScope.gameConfig.maxPlayers = maxPlayers;
			self.$rootScope.gameConfig.gameType = gameType;
			self.$rootScope.gameConfig.mapMaxPlayers = mapMaxPlayers;
			$rootScope.$apply();
		});

		this.socket.on("lobbyUserList", function(lobbyUserList) {
			$rootScope.lobbyUserList = lobbyUserList;
			var tempNotReadyCount = 0;
			$rootScope.connectedUsers = 0;

			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				for (var x = 0; x < $rootScope.colourList.length; x++) {
					if ($rootScope.lobbyUserList[i].playerColour === $rootScope.colourList[x]) {
						$rootScope.colourList.splice(x, 1);
					}
				}
				if ($rootScope.lobbyUserList[i].ready == false) {
					tempNotReadyCount++;
				}
				$rootScope.connectedUsers++;
			}

			$rootScope.notReadyCount = tempNotReadyCount-1;

			$rootScope.connectedUserCount = $rootScope.lobbyUserList.length;

			if ($rootScope.gameConfig) {
				for (var i = ($rootScope.lobbyUserList.length); i < self.$rootScope.gameConfig.mapMaxPlayers; i++) {
					var emptyPlayer = {
							factionId : -1,
							linkedUser : { id : -1, username : "Empty"},
							playerColour : "N/A",
							playerTeam : 0,
							ready : null
					}

					if (i < $rootScope.gameConfig.maxPlayers) {
						emptyPlayer.linkedUser.username = "Open";
					} else {
						emptyPlayer.linkedUser.username = "Closed";
					}
					$rootScope.lobbyUserList.push(emptyPlayer);
				}
			}
			$rootScope.$apply();
		});

		this.socket.on("mapChangeError", function (message) {
			alert(message);
		});

		this.socket.on("toggleUserReady", function (userId) {
			var tempNotReadyCount = 0;

			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				if (userId === $rootScope.lobbyUserList[i].linkedUser.id && $rootScope.lobbyUserList[i].ready != null) {
					$rootScope.lobbyUserList[i].ready = !$rootScope.lobbyUserList[i].ready;
				}
				if ($rootScope.lobbyUserList[i].ready == false) {
					tempNotReadyCount++;
				}
			}
			$rootScope.notReadyCount = tempNotReadyCount-1;
			$rootScope.$apply();
		});

		this.socket.on("changeUserColour", function(userId, colour) {
			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				if (userId === $rootScope.lobbyUserList[i].linkedUser.id) {
					for (var x = 0; x < $rootScope.colourList.length; x++) {
						if ($rootScope.colourList[x] === colour) {
							$rootScope.colourList[x] = $rootScope.lobbyUserList[i].playerColour;
						}
					}
					$rootScope.lobbyUserList[i].playerColour = colour;
				}
			}
			$rootScope.$apply();
		});

		this.socket.on("changeUserTeam", function(userId, team) {
			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				if (userId === $rootScope.lobbyUserList[i].linkedUser.id) {
					$rootScope.lobbyUserList[i].playerTeam = team;
				}
			}
			$rootScope.$apply();
		});

		this.socket.on("gameInitialising", function () {
			$rootScope.lobbyMessages.push({user: "SERVER", message: "All users ready - initialising game"});
			self.$location.path("/game");
			$rootScope.$apply();
		});

		this.socket.on("leaderChanged", function (targetUsername) {
			if (targetUsername == $rootScope.currentUser) {
				self.$rootScope.gameLeader = true;
			} else {
				self.$rootScope.gameLeader = false;
			}

			$rootScope.lobbyMessages.push({user: "SERVER", message: "Leader has been changed to " + targetUsername});
			$rootScope.$apply();
		});

		this.socket.on("userLeftLobby", function (username) {
			$rootScope.lobbyMessages.push({user: "SERVER", message: username + " has left the lobby"});
			$rootScope.$apply();
		});

		this.socket.on("leftLobby", function () {
			self.socket.emit("forceDisconnect");
			self.$location.path("/servers");
			$rootScope.$apply();
		});

		this.socket.on("roomDeleted", function () {
			alert("The lobby leader has delete the lobby, returning to the server lobby page");
			self.$location.path("/servers");
			$rootScope.$apply();
		});

		this.$http.get("/gridwars/rest/game/maps").then(function(response) {
			response.data.forEach(function(map) {
				$rootScope.mapList.push(map);
			});
		}, function(response) {
			if (response.status !== 200) {
				console.log("ERROR.");		//TODO: Add more error checking
			}
		});

	}
	
	LobbyService.prototype = {
			sendMessage: function (newMessage) {
				var tempObject = {
						"user" : this.$rootScope.currentUser,
						"message" : newMessage
					};
				this.socket.emit("sendMessage", tempObject);
			},
			joinGameLobby: function () {
				this.socket.emit("joinGameLobby");
			},
			updateConfig: function () {
				this.socket.emit("updateGameConfig", this.$rootScope.gameConfig);
			},
			toggleReady: function () {
				this.socket.emit("userToggleReady");
			},
			changeColour: function (colour) {
				this.socket.emit("userChangeColour", colour);
			},
			changeTeam: function (team) {
				this.socket.emit("userChangeTeam", team);
			},
			startGame: function () {
				this.socket.emit("startGameInitialisation");
			},
			changeLeader: function (userId) {
				this.socket.emit("changeLobbyLeader", userId);
			},
			leaveGame: function () {
				this.socket.emit("leaveLobby");
			}
	}

	LobbyService.$inject = ['$rootScope', '$location','$http'];

	angular.module('gridWarsApp.lobby.module').service('gridWarsApp.lobby.service', LobbyService);
}());