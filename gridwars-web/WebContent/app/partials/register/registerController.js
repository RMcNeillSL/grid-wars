'use strict';

(function () {
	
	function RegisterController ($scope, $location, registerService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.registerService = registerService;

		// Declare variables

		// Constructor functions
		this.createRegisterRequest = function (username, password, param) {

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
			register: function (username, password) {
				var _this = this;
				_this.$scope.noPassword = false;
				_this.$scope.noUsername = false;

				if(username && password) {
					password = CryptoJS.MD5(password).toString();
					var register = this.createRegisterRequest(username, password);
					this.registerService.sendRegister(register, function(response) {
						_this.$scope.response = response;
						if (response === 200) {
							_this.changeView('/login');
						}
					});
				} else if (username) {
					_this.$scope.noPassword = true;
				} else if (password) {
					_this.$scope.noUsername = true;
				} else {
					_this.$scope.noPassword = true;
					_this.$scope.noUsername = true;
				}
			},

			goToLogin: function () {
				this.changeView('/login');
			},

			changeView: function (path) {
				this.$location.path(path);
			}
	}

	RegisterController.$inject = ['$scope', '$location', 'gridWarsApp.register.service'];

	angular.module('gridWarsApp.register.module').controller('gridWarsApp.register.controller', RegisterController);
}());
