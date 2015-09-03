'use strict';

(function() {
	function ServersService($rootScope, $http) {
		this.$rootScope = $rootScope;
		this.$http = $http;
		var self = this;
		this.openSocket(self);
	}
	ServersService.prototype = {
		openSocket : function(_this) {
			this.socket = io.connect("http://localhost:8080", {
				reconnection : false
			});

			this.socket.on("connect", function() {
				_this.socket.emit("joinServerLobby", "");
			});

			this.socket.on("newGameLobby", function(data) {
				_this.$rootScope.servers.push(data);
				_this.$rootScope.$apply();
				console.log("woah!");
			});
		},
		getServers : function(callback) {
			this.$http.get("/gridwars/rest/game/list").then(function(response) {
				callback(response.data);
			}, function(response) {
				if (response.status === 401) {
					console.log("Unauthorised.");
				}
			});
		},
		createGame : function(callback) {
			var self = this;

			this.$http.post("/gridwars/rest/game/new").then(function(response) {
				callback(response.data);
				self.socket.emit("newGameLobby", {
					"lobbyId" : response.data.lobbyId,
					"lobbyName" : response.data.lobbyName,
					"mapId" : response.data.mapId,
					"maxPlayers" : response.data.maxPlayers,
					"gameType" : response.data.gameType,
					"mapName" : response.data.mapName
				});
				self.socket.emit("leaveServerLobby", "");
				self.socket.emit("forceDisconnect");
			}, function(response) {
				if (response.status === 401) {
					console.log("Unauthorised.");
				}
			});
		},
		joinGame : function(lobbyId, callback) {
			var self = this;
			this.$http.post("/gridwars/rest/game/join/", lobbyId).then(
					function(response) {
						callback(response.data);
						self.socket.emit("leaveServerLobby", "");
					}, function(response) {
						if (response.status === 401) {
							console.log("Unauthorised.");
						}
					});
		}
	}

	ServersService.$inject = [ '$rootScope', '$http' ];

	angular.module('gridWarsApp.servers.module').service(
			'gridWarsApp.servers.service', ServersService);
}());