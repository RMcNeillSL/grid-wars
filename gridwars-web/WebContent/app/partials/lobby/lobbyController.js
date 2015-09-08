'use strict';

(function () {

	function LobbyController ($scope, $location, $rootScope, lobbyService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.lobbyService = lobbyService;
		$rootScope.lobbyMessages = [];
		$rootScope.mapList = [];
		$rootScope.lobbyUserList = [];
		$rootScope.colourList = ["blue", "red", "yellow", "orange", "green", "pink"];
		this.$rootScope.pageName = "Game Lobby";

		// Declare variables
		//this.$scope.userReady = false;
	}

	LobbyController.prototype = {
			toggleUserReady: function () {
				this.lobbyService.toggleReady();
			},
			changeMap: function (mapId) {
				this.$rootScope.gameConfig.mapId = mapId;
				this.lobbyService.updateConfig(this.$rootScope.gameConfig);
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
			}
	}

	LobbyController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.lobby.service'];


	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', LobbyController);
}());
