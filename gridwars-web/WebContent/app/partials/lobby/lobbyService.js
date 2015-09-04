'use strict';

(function () {

	function LobbyService ($rootScope, $http) {
		this.$http = $http;
		this.$rootScope = $rootScope;
		self = this;

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

		this.socket.on("gameConfig", function(mapId, maxPlayers, gameType) {
			self.$rootScope.gameConfig.mapId = mapId;
			self.$rootScope.gameConfig.maxPlayers = maxPlayers;
			self.$rootScope.gameConfig.gameType = gameType;
		});

		this.socket.on("lobbyUserList", function(lobbyUserList) {
			$rootScope.lobbyUserList = lobbyUserList;
			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				for (var x = 0; x < $rootScope.colourList.length; x++) {
					if ($rootScope.lobbyUserList[i].playerColour === $rootScope.colourList[x]) {
						$rootScope.colourList.splice(x, 1);
					}
				}
			}
//			for (var i = ($rootScope.lobbyUserList.length-1); i < $rootScope.lobbyUserList.length; i++) {
//				$rootScope.lobbyUserList.push("");
//			}
			$rootScope.$apply();
		});

		this.socket.on("toggleUserReady", function(userId) {
			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				if (userId === $rootScope.lobbyUserList[i].linkedUser.id) {
					$rootScope.lobbyUserList[i].ready = !$rootScope.lobbyUserList[i].ready;
				}
			}
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

		this.socket.on("gameChanges", function() {		// EVERYONE SET TO NOT READY
			for (var i = 0; i < $rootScope.lobbyUserList.length; i++) {
				$rootScope.lobbyUserList[i].ready = false;
			}
			$rootScope.lobbyMessages.push("A setting has changed - unreadying everyone");
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
			joinGameLobby: function() {
				this.socket.emit("joinGameLobby");
			},
			updateConfig: function(config) {
				this.socket.emit("updateGameConfig", config);
			},
			toggleReady: function() {
				this.socket.emit("userToggleReady");
			},
			changeColour: function(colour) {
				this.socket.emit("userChangeColour", colour);
			},
			changeTeam: function(team) {
				this.socket.emit("userChangeTeam", team);
			}
	}

	LobbyService.$inject = ['$rootScope', '$http'];

	angular.module('gridWarsApp.lobby.module').service('gridWarsApp.lobby.service', LobbyService);
}());