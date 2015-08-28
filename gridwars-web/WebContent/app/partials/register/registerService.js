'use strict';

(function () {
	
	function RegisterService ($http) {
		this.$http = $http;
	}
	RegisterService.prototype = {
			sendRegister: function (register, callback) {
				this.$http.post("/gridwars/rest/register", register).then(function (response) {
					console.log("New user created");
					callback(response.status);
				}, function (response) {
					if (response.status === 400) {
						alert("Username already exists");
					} else if (response.status === 500) {
						alert("Internal server error");
					}
					callback(response.status);
				});
			}
	}

	RegisterService.$inject = ['$http'];

	angular.module('gridWarsApp.register.module').service('gridWarsApp.register.service', RegisterService);
}());