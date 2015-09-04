'use strict';

(function () {
	
	function RegisterController ($scope, $location, $rootScope, registerService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.registerService = registerService;

		// Declare variables

		// Constructor functions
		this.createRegisterRequest = function (username, password, param) {
			//password1 = CryptoJS.MD5(password1);
			var newRegisterRequest = {
					"newUsername": username,
					"newPassword": password
			};

			if (param) {

			};

			return newRegisterRequest;
		};
	};

	RegisterController.prototype = {
			register: function (username, password1, password2) {
				var _this = this;
				_this.$scope.noPassword = false;
				_this.$scope.noUsername = false;
				_this.$scope.noPasswordMatch = false;

				this.$rootScope.currentUser = username;

				if (password1 === password2) {
					if(username && password1) {
						var register = this.createRegisterRequest(username, password1);
						this.registerService.sendRegister(register, function(response) {
							_this.$scope.response = response;
							if (response === 200) {
								_this.changeView('/login');
							} else if (response === 400) {
								_this.$scope.registerError = "That username is taken.";
							} else if (response === 500) {
								_this.$scope.registerError = "Internal server error.";
							}
						});
					} else if (username) {
						_this.$scope.noPassword = true;
					} else if (password1) {
						_this.$scope.noUsername = true;
					} else {
						_this.$scope.noPassword = true;
						_this.$scope.noUsername = true;
					}
				} else {
					_this.$scope.noPasswordMatch = true;
				}
			},

			goToLogin: function () {
				this.changeView('/login');
			},

			changeView: function (path) {
				this.$location.path(path);
			}
	}

	RegisterController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.register.service'];

	angular.module('gridWarsApp.register.module').controller('gridWarsApp.register.controller', RegisterController);
}());
