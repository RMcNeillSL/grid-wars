'use strict';

(function () {

	function CreateService ($rootScope, $http) {
		this.$http = $http;

		this.socket = io.connect("http://localhost:81", {
			"reconnection delay": 2000,
			"force new connection": false,
			query: "user=" + $rootScope.currentUser
		});

		this.socket.on("connect", function () {
			console.log("I am connected");
		});

		this.socket.on("message", function(message) {
			console.log("gots a message");
		})
	}
	CreateService.prototype = {
			sendMessage: function () {
				var data = {hello: "helloworld"};
				console.log(data);
				this.socket.emit("message", data);
				console.log("sending");
			}
	}

	CreateService.$inject = ['$rootScope', '$http'];

	angular.module('gridWarsApp.create.module').service('gridWarsApp.create.service', CreateService);
}());