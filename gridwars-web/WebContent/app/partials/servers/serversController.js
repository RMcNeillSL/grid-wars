'use strict';

(function() {

	function ServersController($scope, $location, $rootScope, $window, serversService) {
		this.$scope = $scope;
		this.serversService = serversService;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$window = $window;
		this.$rootScope.servers = []
		this.$rootScope.pageName = "Servers";
		this.loadServers();
		this.serversService.openSocket();
		console.log(this.$window.sessionStorage.username);
	}

	ServersController.prototype = {
		loadServers : function() {
			var self = this;

			var updateServers = function(response) {
				self.$rootScope.servers = response;
			};

			this.serversService.getServers(updateServers);
		},
		logOut : function() {
			var self = this;
			$.post("gridwars/rest/logout");
			self.$location.path("/login");
		},
		createGame : function() {
			var self = this;

			var updateNewGameResponse = function(response) {
				self.$rootScope.gameConfig = response;
				self.$rootScope.gameLeader = true;
				self.$window.sessionStorage.gameLeader = true;
				console.log(response);
				self.$location.path("/lobby");
			};

			this.serversService.createGame(updateNewGameResponse);
		},
		joinGame : function(lobbyId) {
			var self = this;

			var updateJoinGameResponse = function(response) {
				self.$rootScope.gameConfig = response;
				self.$window.sessionStorage.gameLeader = false;
				//self.$rootScope.joinGameResponse = response;
				self.$location.path("/lobby");
			};

			this.serversService.joinGame(lobbyId, updateJoinGameResponse);
		},
		formatGameType : function(gameType) {
			if (gameType === "FREE_FOR_ALL") {
				return "Free for all";
			} else if (gameType === "DM00") {
				return "Death Match 00";
			}
		}
	}

	ServersController.$inject = [ '$scope', '$location', '$rootScope', '$window',
			'gridWarsApp.servers.service' ];

	angular.module('gridWarsApp.servers.module').controller(
			'gridWarsApp.servers.controller', ServersController);
}());
