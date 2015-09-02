'use strict';

(function() {
	function ServersService($http) {
		this.$http = $http;
		var self = this;
		this.openSocket(self);
	}
	ServersService.prototype = {
		openSocket : function(_this) {
			this.socket = io.connect("http://localhost:8080", {
			    reconnection: false
			});

			this.socket.on("connect", function() {
				_this.socket.emit("joinServerLobby", "");
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

			this.$http.post("/gridwars/rest/game/join/", lobbyId)
			.then(function(response) {
				callback(response.data);
				self.socket.emit("leaveServerLobby", "");
				self.socket.emit("forceDisconnect");
			}, function(response) {
				if (response.status === 401) {
					console.log("Unauthorised.");
				}
			});
		}
	}

	ServersService.$inject = [ '$http' ];

	angular.module('gridWarsApp.servers.module').service(
			'gridWarsApp.servers.service', ServersService);
}());