'use strict';

(function() {
	function ServersService($rootScope, $http) {
		this.$rootScope = $rootScope;
		this.$http = $http;
		self = this;
		//this.openSocket();
	}
	ServersService.prototype = {
		openSocket : function() {
			var _this = this;
			this.socket = io.connect("http://localhost:8080", {
				"force new connection" : true
			});

			this.socket.on("connect", function() {
				_this.socket.emit("joinServerLobby", "");
			});

			this.socket.on("refreshGameLobby", function(data) {
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
				self.socket.emit("refreshGameLobby", response.data);
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