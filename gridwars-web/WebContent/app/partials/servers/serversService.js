'use strict';

(function() {
	function ServersService($rootScope, $http) {
		this.$rootScope = $rootScope;
		this.$http = $http;
		self = this;
	}
	ServersService.prototype = {
		openSocket : function() {
			var _this = this;
			console.log("Socket connection to: " + CONSTANTS.SOCKET_SERVER);
			this.serversSocket = io.connect(CONSTANTS.SOCKET_SERVER, {
				"force new connection" : true
			});

			this.serversSocket.on("connect", function() {
				_this.serversSocket.emit("joinServerLobby", "");
			});

			this.serversSocket.on("updateServerLobby", function(data) {
				self.$rootScope.servers = data;
				console.log(data);
				self.$rootScope.$apply();
			});

			this.serversSocket.on("refreshGameLobby", function(data) {
				console.log(data);
				var exists = false;
				var serverIndex = -1;

				exists = self.$rootScope.servers.some(function(server) {
					if (server.lobbyId === data.lobbyId) {
						serverIndex = self.$rootScope.servers.indexOf(server);
						return server.lobbyId === data.lobbyId;
					}
				});

				if (exists) {
					self.$rootScope.servers.splice(serverIndex, 1);
				}

				self.$rootScope.servers.push(data);
				self.$rootScope.$apply();
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
				self.serversSocket.emit("refreshGameLobby", response.data);
				self.serversSocket.emit("leaveServerLobby", "");
				self.serversSocket.emit("forceDisconnect");
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
						self.serversSocket.emit("refreshGameLobby", response.data);
						self.serversSocket.emit("leaveServerLobby", "");
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