'use strict';

(function () {
	
	function RegisterService ($http) {
		this.$http = $http;
	}
	RegisterService.prototype = {
			sendRegister: function (register, callback) {
				this.$http.post("/gridwars/rest/register", register).then(function (response) {
					callback(response.status);
				}, function (response) {
					if (response.status === 400) {
					} else if (response.status === 500) {
						console.log("Internal server error");
					}
					callback(response.status);
				});
			}
	}

	RegisterService.$inject = ['$http'];

	angular.module('gridWarsApp.register.module').service('gridWarsApp.register.service', RegisterService);
}());