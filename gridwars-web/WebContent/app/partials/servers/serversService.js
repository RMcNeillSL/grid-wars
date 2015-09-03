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

			this.socket.on("refreshGameLobby", function(data) {
				var exists = false;
				var serverIndex = -1;

				exists = _this.$rootScope.servers.some(function(server) {
					if (server.lobbyId === data.lobbyId) {
						serverIndex = _this.$rootScope.servers.indexOf(server);
						return server.lobbyId === data.lobbyId;
					}
				});

				if (exists) {
					_this.$rootScope.servers.splice(serverIndex, 1);
				}

				_this.$rootScope.servers.push(data);
				_this.$rootScope.$apply();
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
				self.socket.emit("refreshGameLobby", response.data);
				self.socket.emit("leaveServerLobby", "");
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
						self.socket.emit("refreshGameLobby", response.data);
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