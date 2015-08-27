'use strict';

(function ($scope) {
	
	function LoginController ($scope, loginService) {
		this.loginService = loginService;
		this.$scope = $scope;
	}
	LoginController.prototype = {
			login: function (username, password) {
				console.log("USERNAME: ", username);
				console.log("PASSWORD: ", password);
				this.loginService.sendLogin(username, password);
				this.$scope.username = "";
				this.$scope.password = "";
			}
	}
	
	LoginController.$inject = ['$scope', 'gridWarsApp.login.service'];
	
	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
