'use strict';

(function () {
	
	function LoginService ($http) {
		this.$http = $http;
	}
	LoginService.prototype = {
			sendLogin: function (username, password) {
				this.$http.post("/gridwars/rest/auth", {
					"usernameAttempt": username,
					"passwordAttempt": password
				})
			}
	}
	
	LoginService.$inject = ['$http'];
	
	angular.module('gridWarsApp.login.module').service('gridWarsApp.login.service', LoginService);
}());