'use strict';

(function () {
	
	function createController () {
	}
	createController.prototype = {
			login: function () {
				
			}
	}

	
	angular.module('gridWarsApp.create.module').controller('gridWarsApp.create.controller', createController);
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