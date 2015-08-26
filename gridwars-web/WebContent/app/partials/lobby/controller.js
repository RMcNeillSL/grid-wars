'use strict';

(function () {
	
	function lobbyController () {
	}
	lobbyController.prototype = {
			login: function () {
				
			}
	}

	
	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', lobbyController);
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