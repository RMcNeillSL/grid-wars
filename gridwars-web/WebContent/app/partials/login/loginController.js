'use strict';

(function() {

	function LoginController($scope, $location, $rootScope, loginService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.loginService = loginService;

		// Declare variables
		$scope.username = "TestUser";
		$scope.password = "password";
		//$scope.username = $scope.currentUser != "" ? $scope.currentUser : ""; // REMOVE LATER

		// Constructor functions
		this.createAuthRequest = function(username, password, param) {
			//password = CryptoJS.MD5(password).toString();
			var newAuthRequest = {
				"usernameAttempt" : username,
				"passwordAttempt" : password
			};

			return newAuthRequest;
		};
	}
	;

	LoginController.prototype = {
		login : function(username, password) {
			var auth = this.createAuthRequest(username, password);
			var _this = this;
			this.loginService.sendLogin(auth, function(response) {
				_this.$scope.response = response;
				if (response === 200) {
					_this.$rootScope.currentUser = username;
					_this.changeView('/servers');
				} else if (response === 401) {
					_this.$scope.loginError = "Invalid username or password entered.";
				} else if (response === 409) {
					_this.$scope.loginError = "This user is already logged in.";
				} else if (response === 500) {
					_this.$scope.loginError = "Internal server error.";
				}
			});
		},

		goToRegister : function() {
			this.changeView('/register');
		},

		changeView : function(path) {
			this.$location.path(path);
		}
	};

	LoginController.$inject = [ '$scope', '$location', '$rootScope', 'gridWarsApp.login.service' ];

	angular.module('gridWarsApp.login.module').controller(
			'gridWarsApp.login.controller', LoginController);
}());
