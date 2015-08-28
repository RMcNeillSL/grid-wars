'use strict';

(function () {
	
	function RegisterService ($http) {
		this.$http = $http;
	}
	RegisterService.prototype = {
			sendRegister: function (register) {
				this.$http.post("/gridwars/rest/register", register) //TODO: ERROR CHECKING
			}
	}
	
	RegisterService.$inject = ['$http'];
	
	angular.module('gridWarsApp.register.module').service('gridWarsApp.register.service', RegisterService);
}());