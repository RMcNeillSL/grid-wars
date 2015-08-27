'use strict';

(function () {
	
	function TestingService ($http) {
		
		// Save injected items
		this.$http = $http;
		
	}
	TestingService.prototype = {
			sendLogin: function (authRequest) {
				this.$http.post("/gridwars/rest/auth", authRequest).then(function (response) {
					console.log("SUCCESS - Logged in.");
				}, function(error) {
					console.log("ERROR - Failed to login.");
				});
			},
			newLobby: function (callback) {
				this.$http.get("/gridwars/rest/game/new").then(function (response) {
					console.log("SUCCESS - New lobby made.");
					if (callback) { callback(); }
				}, function(error) {
					console.log("ERROR - New lobby not made.");
				});
			},
			getLobbies: function(callback) {
				this.$http.get("/gridwars/rest/game/list").then(function (response) {
					console.log("SUCCESS - Lobby list retrieved.");
					var lobbyList = response.data;
					if (lobbyList) {
						callback(lobbyList);
					}
				}, function(error) {
					console.log("ERROR - Lobby list not retrieved.");
				});
			}
	}

	TestingService.$inject = ['$http'];
	
	angular.module('gridWarsApp.testing.module').service('gridWarsApp.testing.service', TestingService);
}());