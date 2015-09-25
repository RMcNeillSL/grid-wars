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
		var self = this

		// Set up new sockets or reset if they exist
		if (!this.$rootScope.sockets) {
			console.log("Creating sockets");
			this.$rootScope.sockets = new SocketShiz();
		} else {
			this.$rootScope.sockets.resetCallbacks();
		}

		// Bind the events we need for this page
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CONNECT, this.serversService.onConnect);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_DISCONNECT, this.serversService.onDisconnect);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_SERVER_LOBBY_UPDATE, this.serversService.serverLobbyUpdate);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_REFRESH_GAME_LOBBY, this.serversService.refreshGameLobby);

		this.refresh = setInterval(function() {self.serversService.refreshServerList(); }, 1000);
		this.serversService.joinServerLobby();
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
			clearInterval(self.refresh);
			self.$location.path("/login");
		},
		createGame : function() {
			var self = this;

			var updateNewGameResponse = function(response) {
				self.$rootScope.gameConfig = response;
				self.$rootScope.gameLeader = true;
				self.$window.sessionStorage.gameLeader = true;
				clearInterval(self.refresh);
				self.$location.path("/lobby");
			};
			clearInterval(this.refresh);
			this.serversService.createGame(updateNewGameResponse);
		},
		joinGame : function(lobbyId) {
			var self = this;

			var updateJoinGameResponse = function(response) {
				self.$rootScope.gameConfig = response;
				self.$window.sessionStorage.gameLeader = false;
				clearInterval(self.refresh);
				self.$location.path("/lobby");
			};
			clearInterval(this.refresh);
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
