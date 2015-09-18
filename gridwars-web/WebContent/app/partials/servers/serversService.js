'use strict';

(function() {
	function ServersService($rootScope, $http) {
		this.$rootScope = $rootScope;
		this.$http = $http;
		self = this;
	}
	ServersService.prototype = {
		onConnect: function () {
			console.log("Socket connection established");
		},
		onDisconnect: function () {
			console.log("The socket has disconnected in severs");
		},
		joinServerLobby: function () {
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_JOIN_SERVER_LOBBY);
		},
		refreshServerList: function () {
			console.log("Sending refresh server list request");
			self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_GET_SERVERS);
		},
		serverLobbyUpdate: function (data) {
			self.$rootScope.servers = data;
			self.$rootScope.$apply();
		},
		refreshGameLobby: function (data) {
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
				self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_REFRESH_GAME_LOBBY, response.data);
				self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_LEAVE_SERVER_LOBBY);
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
					self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_REFRESH_GAME_LOBBY, response.data);
					self.$rootScope.sockets.emitEvent(CONSTANTS.SOCKET_SEND_LEAVE_SERVER_LOBBY);
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