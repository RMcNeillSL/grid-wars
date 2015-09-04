'use strict';

(function () {
	
	function GameService ($http) {
		this.$http = $http;
	}
	GameService.prototype = {
			debugConnect: function (callback) {
				var self = this;
				this.$http.post("/gridwars/rest/auth", {
					"usernameAttempt" : "JamesHill05",
					"passwordAttempt" : "password"
				}).then(function (response) {
					console.log("SUCCESS: Connected");
					console.log(response.data);
					self.debugNewLobby(callback);
				}, function (response) {
					if (response.status === 500) {
						self.debugNewLobby(callback);
					} else {
						console.log("ERROR: Failed to connect");
					}
				});
			},
			debugNewLobby: function (callback) {
				var self = this;
				this.$http.post("/gridwars/rest/game/new").then(function(response) {
					console.log("SUCCESS: New game retrieved");
					console.log(response.data);
					self.getMapData(response.data.mapId);
					if (callback) { callback("L", response.data); }
				}, function(response) {
					if (response.status === 401) {
						console.log("ERROR: Unauthorised access request");
					} else {
						self.debugGetLobbyInformation(callback);
					}
				});
			},
			debugGetLobbyInformation: function (callback) {
				var self = this;
				this.$http.get("/gridwars/rest/user/game").then(function(response) {
					console.log("SUCCESS: Existing game retrieved");
					console.log(response.data);
					self.getMapData(response.data.mapId);
					if (callback) { callback("L", response.data); }
				}, function (error) {
					console.log("ERROR: Failed to retrieve game");
				});
			},
			getMapData: function (mapId, callback) {
				this.$http.get("/gridwars/rest/game/map/" + mapId).then(function(response) {
					console.log("SUCCESS: Map data retrieved");
					console.log(response.data);
					if (callback) { callback("M", response.data); }
				}, function (error) {
					console.log("ERROR: Failed to gather map data");
				});
			}
	}
	
	GameService.$inject = ['$http'];
	
	angular.module('gridWarsApp.game.module').service('gridWarsApp.game.service', GameService);
}());