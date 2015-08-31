'use strict';

(function () {
	
	function TestingController ($scope, testingService) {
		
		// Save injected items
		this.$scope = $scope;
		this.testingService = testingService;
		
		// Declare variables
		$scope.username = "TestUser";
		$scope.password = "password";
		$scope.lobbyList = [];
		
		// Constructor functions
		this.createAuthRequest = function(username, password, params) {
			var newAuthRequest = {'usernameAttempt': username, 'passwordAttempt': password};
			if (params) {
				
			}
			return newAuthRequest;
		}
		
	}
	TestingController.prototype = {
			login: function () {
				this.testingService.sendLogin(this.createAuthRequest(this.$scope.username, this.$scope.password));
				this.testingService.getLobbies();
			},
			newLobby: function () {		
				var self = this;
				
				var updateLobbies = function(newLobbyList) {
					self.$scope.lobbyList = newLobbyList;
					console.log(newLobbyList);
				};
				
				var retrieveLobbies = function() {
					self.testingService.getLobbies(updateLobbies);
				}
				
				this.testingService.newLobby(retrieveLobbies);
				
			},
			joinLobby: function () {
			}
	}

	TestingController.$inject = ['$scope', 'gridWarsApp.testing.service'];
	
	angular.module('gridWarsApp.testing.module').controller('gridWarsApp.testing.controller', TestingController);
}());
