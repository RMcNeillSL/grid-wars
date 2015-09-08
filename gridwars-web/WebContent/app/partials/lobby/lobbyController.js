'use strict';

(function () {

	function LobbyController ($scope, $location, $rootScope, lobbyService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.lobbyService = lobbyService;

		// Initialise variables
		$rootScope.lobbyMessages = [];
		$rootScope.mapList = [];
		$rootScope.lobbyUserList = [];
		$rootScope.colourList = ["blue", "red", "yellow", "orange", "green", "pink"];
		$rootScope.deleteSelected = false;

		// Setup the socket
		this.lobbyService.socketSetup();

		// Get information from server
		this.lobbyService.getMaps();
	}

	LobbyController.prototype = {
			toggleUserReady: function () {
				this.lobbyService.toggleReady();
			},
			changeMap: function (mapId) {
				this.$rootScope.gameConfig.mapId = mapId;
				this.lobbyService.updateConfig();
			},
			openSlot: function() {
				if (self.$rootScope.gameConfig.maxPlayers < self.$rootScope.gameConfig.mapMaxPlayers) {
					self.$rootScope.gameConfig.maxPlayers++;
					this.lobbyService.updateConfig();
				} else {
					alert("Cannot increase the players above the map maximum");
				}

			},
			closeSlot: function() {
				if (self.$rootScope.gameConfig.maxPlayers > 2) {
					self.$rootScope.gameConfig.maxPlayers--;
					this.lobbyService.updateConfig();
				} else {
					alert("Cannot reduce the players below 2");
				}
			},
			callSendMessage: function (newMessage) {
				this.lobbyService.sendMessage(newMessage);
				this.$scope.newMessage = "";
			},
			callJoinGameLobby: function () {
				this.lobbyService.joinGameLobby();
			},
			callChangeColour: function (colour) {
				this.lobbyService.changeColour(colour);
			},
			callChangeTeam: function (team) {
				this.lobbyService.changeTeam(team);
			},
			callStartGame: function () {
				this.lobbyService.startGame();
			}, 
			callChangeLeader: function (userId) {
				this.lobbyService.changeLeader(userId);
			},
			callLeaveGame: function () {
				this.lobbyService.leaveGame();
			}
	}

	LobbyController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.lobby.service'];


	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', LobbyController);
}());
