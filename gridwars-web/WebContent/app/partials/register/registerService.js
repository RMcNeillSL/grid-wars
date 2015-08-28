'use strict';

(function () {
	
	function RegisterService ($http) {
		this.$http = $http;
	}
	RegisterService.prototype = {
			sendRegister: function (register) {
				this.$http.post("/gridwars/rest/register", register).then(function (response) {
					console.log("New user created");
				}, function (response) {
					if (response.status === 400) {
						alert("Username already exists");
					} else if (response.status === 500) {
						alert("Internal server error");
					}
				});
			}
	}
	
	RegisterService.$inject = ['$http'];
	
	angular.module('gridWarsApp.register.module').service('gridWarsApp.register.service', RegisterService);
}());