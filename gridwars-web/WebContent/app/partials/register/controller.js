'use strict';

(function () {
	
	function registerController () {
	}
	registerController.prototype = {
			login: function () {
				
			}
	}

	
	angular.module('gridWarsApp.register.module').controller('gridWarsApp.register.controller', registerController);
}());

//(function () {
//	
//	function LoginController (loginService) {
//		this.loginService = loginService;
//	}
//	LoginController.prototype = {
//			login: function () {
//				this.loginService.login(this.username, this.password);
//			}
//	}
//	
//	LoginController.$inject = [
//		'gridWarsApp.login.service'
//    ];
//	
//	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
//}());