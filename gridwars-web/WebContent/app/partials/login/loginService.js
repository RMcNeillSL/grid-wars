'use strict';

(function () {
	
	function LoginService ($http) {
		this.$http = $http;
	}
	LoginService.prototype = {
			sendLogin: function (auth) {
				this.$http.post("/gridwars/rest/auth", auth) //TODO: ERROR CHECKING
			}
	}
	
	LoginService.$inject = ['$http'];
	
	angular.module('gridWarsApp.login.module').service('gridWarsApp.login.service', LoginService);
}());