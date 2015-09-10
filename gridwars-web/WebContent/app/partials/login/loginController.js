'use strict';

(function() {

	function LoginController($scope, $location, $rootScope, $window, loginService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$window = $window;
		this.loginService = loginService;
		this.$rootScope.pageName = "Login";

		// Declare variables
		$scope.username = "TestUser"; // REMOVE LATER
		$scope.password = "password";
		if(this.$rootScope.newUsername && this.$rootScope.newPassword) {
			this.login(this.$rootScope.newUsername, this.$rootScope.newPassword);
			this.$rootScope.newUsername = "";
			this.$rootScope.newPassword = "";
			return;
		}
	};

	LoginController.prototype = {
		login : function(username, password) {
			var _this = this;
			var auth = {
				"usernameAttempt" : username,
				"passwordAttempt" : password
			};
			this.loginService.sendLogin(auth, function(response) {
				_this.$scope.response = response;
				if (response === 200) {
					_this.$rootScope.currentUser = username;
					_this.$window.sessionStorage.username = username;
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

	LoginController.$inject = [ '$scope', '$location', '$rootScope', '$window', 'gridWarsApp.login.service' ];

	angular.module('gridWarsApp.login.module').controller(
			'gridWarsApp.login.controller', LoginController);
}());
