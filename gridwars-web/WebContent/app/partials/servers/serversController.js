'use strict';

(function() {

	function ServersController($scope, $location, $rootScope, serversService) {
		this.$scope = $scope;
		this.serversService = serversService;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$rootScope.servers = [];
		this.loadServers();
	}

	ServersController.prototype = {
		loadServers : function() {
			var self = this;

			var updateServers = function(response) {
				self.$rootScope.servers = response;
			};

			this.serversService.getServers(updateServers);
		},
		createGame : function() {
			var self = this;

			var updateNewGameResponse = function(response) {
				self.$rootScope.newGameResponse = response;
				console.log(self.$rootScope.newGameResponse);
				self.$location.path("/lobby");
			};

			this.serversService.createGame(updateNewGameResponse);
		},
		joinGame : function(lobbyId) {
			var self = this;
			
			var updateJoinGameResponse = function(response) {
				self.$rootScope.joinGameResponse = response;
				console.log(self.$rootScope.joinGameResponse);
				self.$location.path("/lobby");
			};

			this.serversService.joinGame(lobbyId, updateJoinGameResponse);
		}
	}

	ServersController.$inject = [ '$scope', '$location', '$rootScope',
			'gridWarsApp.servers.service' ];

	angular.module('gridWarsApp.servers.module').controller(
			'gridWarsApp.servers.controller', ServersController);
}());
