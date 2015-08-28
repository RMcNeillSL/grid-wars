'use strict';

(function () {
	
	function LoginService ($http) {
		this.$http = $http;
	}
	LoginService.prototype = {
			sendLogin: function (auth) {
				this.$http.post("/gridwars/rest/auth", auth).then(function (response) {
					console.log("log in successful!");
				}, function (response) {
					if (response.status === 401) {
						alert("Username or password invalid");
					} else if (response.status === 409) {
						alert("Username already logged in");
					} else if (response.status === 500) {
						alert("Internal server error");
					}
				});
			}
	}
	
	LoginService.$inject = ['$http'];
	
	angular.module('gridWarsApp.login.module').service('gridWarsApp.login.service', LoginService);
}());