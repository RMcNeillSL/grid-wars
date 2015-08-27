'use strict';

(function () {
	
	function LoginController (loginService) {
		this.loginService = loginService;
	}
	LoginController.prototype = {
			login: function () {
				this.loginService.sendLogin();
			}
	}
	
	LoginController.$inject = ['gridWarsApp.login.service'];
	
	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
