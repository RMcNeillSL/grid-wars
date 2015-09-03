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
		
		this.socket.on("gameConfig", function(data) {
			console.log(data);
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
				this.socket.emit("updateGameConfig", {
					"@class" : "com.majaro.gridwars.apiobject.GameJoinResponse".config
				});
				console.log("HIT CLIENT");
			}
	}

	LobbyService.$inject = ['$rootScope', '$http'];

	angular.module('gridWarsApp.lobby.module').service('gridWarsApp.lobby.service', LobbyService);
}());