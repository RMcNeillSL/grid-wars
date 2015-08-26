'use strict';

(function () {
	
	function resultsController () {
	}
	resultsController.prototype = {
			login: function () {
				
			}
	}

	
	angular.module('gridWarsApp.results.module').controller('gridWarsApp.results.controller', resultsController);
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