'use strict';

(function ($scope) {

	function LoginController ($scope, $location, loginService) {

		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.loginService = loginService;

		// Declare variables
		$scope.username = "TestUser";		// REMOVE LATER
		$scope.password = "password";		// REMOVE LATER

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
				password = CryptoJS.MD5(password).toString();
				var auth = this.createAuthRequest(username, password);
				var _this = this;
				this.loginService.sendLogin(auth, function(response) {
					_this.$scope.response = response;
					if (response === 200) {
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

	LoginController.$inject = ['$scope', '$location', 'gridWarsApp.login.service'];

	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
