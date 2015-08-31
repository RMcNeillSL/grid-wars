'use strict';

(function ($scope) {

	function LoginController ($scope, $location, $rootScope, loginService) {

		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.loginService = loginService;

		// Declare variables
		//$scope.username = "TestUser";		// REMOVE LATER
		$scope.username = $rootScope.currentUser;
		$scope.password = "password";		// REMOVE LATER

		// Constructor functions
		this.createAuthRequest = function (username, password, param) {
			password = CryptoJS.MD5(password).toString();
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
				var _this = this;
				this.loginService.sendLogin(auth, function(response) {
					_this.$scope.response = response;
					if (response === 200) {
						_this.$rootScope.currentUser = username;
						_this.changeView('/servers');
					}
				});
			},

			goToRegister: function () {
				this.changeView('/register');
			},

			changeView: function (path) {
				this.$location.path(path);
			}
	};

	LoginController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.login.service'];

	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
