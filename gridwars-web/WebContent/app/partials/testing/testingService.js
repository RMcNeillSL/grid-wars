'use strict';

(function () {
	
	function TestingService ($http) {
		
		// Save injected items
		this.$http = $http;
		
	}
	TestingService.prototype = {
			sendLogin: function (authRequest, callback) {
				this.$http.post("/gridwars/rest/auth", authRequest).then(function (response) {
					console.log("SUCCESS - Logged in.");
					if (callback) { callback(); }
				}, function(error) {
					console.log("ERROR - Failed to login.");
				});
			},
			newLobby: function (callback) {
				this.$http.post("/gridwars/rest/game/new").then(function (response) {
					console.log("SUCCESS - New lobby made.");
					if (callback) { callback(response.data); }
				}, function(error) {
					console.log("ERROR - New lobby not made.");
				});
			},
			joinLobby: function (lobbyId, callback) {
				this.$http.post("/gridwars/rest/game/join", lobbyId).then(function (response) {
					console.log("SUCCESS - Game lobby joined.");
					if (callback) { callback(response.data); }
				}, function(error) {
					console.log("ERROR - Failed to join game lobby.");
				});
			},
			getLobbies: function(callback) {
				this.$http.get("/gridwars/rest/game/list").then(function (response) {
					console.log("SUCCESS - Lobby list retrieved.");
					var lobbyList = response.data;
					if (lobbyList && callback) {
						callback(lobbyList);
					}
				}, function(error) {
					console.log("ERROR - Lobby list not retrieved.");
				});
			},
			getMaps: function(callback) {
				this.$http.get("/gridwars/rest/game/maps").then(function (response) {
					console.log("SUCCESS - Map list retrieved.");
					var mapList = response.data;
					if (mapList && callback) {
						callback(mapList);
					}
				}, function(error) {
					console.log("ERROR - Map list not retrieved.");
				});
			}
	}

	TestingService.$inject = ['$http'];
	
	angular.module('gridWarsApp.testing.module').service('gridWarsApp.testing.service', TestingService);
}());