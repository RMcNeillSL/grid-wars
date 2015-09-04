'use strict';

(function () {
	
	function LoginService ($http) {
		this.$http = $http;
	}
	LoginService.prototype = {
			sendLogin: function (auth, callback) {
				this.$http.post("/gridwars/rest/auth", auth).then(function (response) {
					callback(response.status);
				}, function (response) {
					callback(response.status);
				});
			}
	}
	
	LoginService.$inject = ['$http'];
	
	angular.module('gridWarsApp.login.module').service('gridWarsApp.login.service', LoginService);
}());