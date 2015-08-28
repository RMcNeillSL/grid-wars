'use strict';

(function ($scope) {
	
	function LoginController ($scope, loginService) {
		
		// Save injected items
		this.loginService = loginService;
		this.$scope = $scope;
		
		// Declare variables
		$scope.username = "TestUser";
		$scope.password = "password";
		
		// Constructor functions
		this.createAuthRequest = function (username, password, param) {
			
			var newAuthRequest = {
					"usernameAttempt": username,
					"passwordAttempt": password
			};
			
			if (param) {
				
			};
			
			return newAuthRequest;
		};
	};
	
	LoginController.prototype = {
			login: function (username, password) {
				var auth = this.createAuthRequest(username, password);
				this.loginService.sendLogin(auth);
				//this.$scope.username = "";
				//this.$scope.password = "";
			}
	};
	
	LoginController.$inject = ['$scope', 'gridWarsApp.login.service'];
	
	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
