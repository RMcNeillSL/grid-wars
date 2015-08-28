'use strict';

(function () {
	
	function RegisterController ($scope, registerService) {
		// Save injected items
		this.registerService = registerService;
		this.$scope = $scope;
		
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
				password = CryptoJS.MD5(password).toString();
				console.log(password);
				var register = this.createRegisterRequest(username, password);
				this.registerService.sendRegister(register);
			}
	}

	RegisterController.$inject = ['$scope', 'gridWarsApp.register.service'];
	
	angular.module('gridWarsApp.register.module').controller('gridWarsApp.register.controller', RegisterController);
}());
