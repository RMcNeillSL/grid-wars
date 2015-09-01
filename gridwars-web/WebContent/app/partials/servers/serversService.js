'use strict';

(function() {
	function ServersService($http) {
		this.$http = $http;
		var self = this;

		this.socket = io.connect("http://localhost:81");

		this.socket.on("connect", function() {
			self.socket.emit("test", {
				"hello" : "world"
			});
		});
	}
	ServersService.prototype = {
		getServers : function(callback) {
			this.$http.get("/gridwars/rest/game/list").then(function(response) {
				callback(response.data);
			}, function(response) {
				if (response.status === 401) {
					console.log("Unauthorised.");
				}
			});
		}
	}

	ServersService.$inject = [ '$http' ];

	angular.module('gridWarsApp.servers.module').service(
			'gridWarsApp.servers.service', ServersService);
}());