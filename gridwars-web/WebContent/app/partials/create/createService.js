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
			console.log("I am connected");
		});

		this.socket.on("message", function(data) {
			console.log(data.user, ":", data.message);
		});
	}
	CreateService.prototype = {
			sendMessage: function () {
				this.socket.emit("sendMessage", {
					"user" : this.$rootScope.currentUser,
					"message" : "world"
				});
			}
	}

	CreateService.$inject = ['$rootScope', '$http'];

	angular.module('gridWarsApp.create.module').service('gridWarsApp.create.service', CreateService);
}());