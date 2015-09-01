'use strict';

(function () {

	function CreateService ($rootScope, $http) {
		this.$http = $http;
		this.$rootScope = $rootScope;

		this.socket = io.connect("http://localhost:8080", {
			"reconnection delay": 2000,
			"force new connection": false
		});

		this.socket.on("connect", function () {

		});

		this.socket.on("message", function(data) {
			$rootScope.lobbyMessages.push(data);
			console.log($rootScope.lobbyMessages);
			$rootScope.$apply();
		});
	}
	CreateService.prototype = {
			sendMessage: function () {
				this.socket.emit("sendMessage", {
					"user" : this.$rootScope.currentUser,
					"message" : "world"
				});
				this.$http.post("/gridwars/rest/auth", auth).then(function (response) {
					console.log("Login successful!");
				}, function (response) {
					if (response.status === 401) {
						alert("Username or password invalid");
					} else if (response.status === 409) {
						alert("Username already logged in");
					} else if (response.status === 500) {
						alert("Internal server error");
					} else {
						console.log("ERROR: Unhandled status code: ", response.status);
					}
				});
			}
	}

	CreateService.$inject = ['$rootScope', '$http'];

	angular.module('gridWarsApp.create.module').service('gridWarsApp.create.service', CreateService);
}());