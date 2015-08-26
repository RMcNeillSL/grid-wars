'use strict';

(function () {
	
	function LoginController () {
	}
	LoginController.prototype = {
			login: function () {
				
			}
	}
	
	LoginController.$inject = ['gridWarsApp.login.service'];
	
	angular.module('gridWarsApp.login.module').controller('gridWarsApp.login.controller', LoginController);
}());
