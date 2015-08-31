'use strict';

(function () {
	
	function TestingController ($scope, testingService) {
		
		// Save injected items
		this.$scope = $scope;
		this.testingService = testingService;
		
		// Declare variables
		$scope.username = "jamUser01";
		$scope.password = "password";
		$scope.lobbyId = "";
		$scope.lobbyList = [];
		$scope.mapList = [];
		$scope.currentGame = [];
		
		// Constructor functions
		this.createAuthRequest = function(username, password, params) {
			password = CryptoJS.MD5(password).toString();			
			var newAuthRequest = {'usernameAttempt': username, 'passwordAttempt': password};
			if (params) {
				
			}
			return newAuthRequest;
		}
		
	}
	TestingController.prototype = {
			login: function () {
				var self = this;
				
				var updateMaps = function(newMapList) {
					self.$scope.mapList = newMapList;
					console.log(newMapList);
				}
				
				var updateLobbies = function(newLobbyList) {
					self.$scope.lobbyList = newLobbyList;
					console.log(newLobbyList);
				};
				
				var updateScope = function() {
					self.testingService.getLobbies(updateLobbies);
					self.testingService.getMaps(updateMaps);
				}
				
				this.testingService.sendLogin(this.createAuthRequest(this.$scope.username, this.$scope.password), updateScope);
			},
			newLobby: function () {		
				var self = this;

				var updateMaps = function(newMapList) {
					self.$scope.mapList = newMapList;
					console.log(newMapList);
				}
				
				var updateLobbies = function(newLobbyList) {
					self.$scope.lobbyList = newLobbyList;
					console.log(newLobbyList);
				};
				
				var updateScope = function(gameJoinResponse) {
					self.$scope.currentGame = [gameJoinResponse];
					console.log(gameJoinResponse);
					self.testingService.getLobbies(updateLobbies);
					self.testingService.getMaps(updateMaps);
				}
				
				this.testingService.newLobby(updateScope);
				
			},
			joinLobby: function () {
				var self = this;
				
				var updateScope = function(gameJoinResponse) {
					self.$scope.currentGame = [gameJoinResponse];
					console.log(gameJoinResponse);
				}
				
				this.testingService.joinLobby(this.$scope.lobbyId, updateScope);
			}
	}

	TestingController.$inject = ['$scope', 'gridWarsApp.testing.service'];
	
	angular.module('gridWarsApp.testing.module').controller('gridWarsApp.testing.controller', TestingController);
}());
