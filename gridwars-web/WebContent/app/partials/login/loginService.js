'use strict';

(function () {
	
	function LoginService ($http) {
		this.$http = $http;
	}
	LoginService.prototype = {
			sendLogin: function (auth, callback) {
				$.ajax({
				    type: "POST",
				    url: "/gridwars/rest/auth",
				    data: JSON.stringify({
				    	usernameAttempt: auth.usernameAttempt,
				    	passwordAttempt: auth.passwordAttempt
				    }),
				    contentType: "application/json; charset=utf-8",
				    dataType: "json",
				    complete: function(res) {
				    	console.log(res);
				    	callback(res);
				    }
				});
				
//				this.$http.post("/gridwars/rest/auth", auth)
//				.then(function(res) {
//					console.log(res.data);
//				});
			}
	}
	
	LoginService.$inject = ['$http'];
	
	angular.module('gridWarsApp.login.module').service('gridWarsApp.login.service', LoginService);
}());