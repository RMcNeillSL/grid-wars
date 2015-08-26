'use strict';

(function () {
	
	function serversController () {
	}
	serversController.prototype = {
			login: function () {
				
			}
	}

	
	angular.module('gridWarsApp.servers.module').controller('gridWarsApp.servers.controller', serversController);
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