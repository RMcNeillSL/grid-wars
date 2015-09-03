'use strict';

(function () {

	function LobbyController ($scope, $location, $rootScope, lobbyService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.lobbyService = lobbyService;
		this.$rootScope.lobbyMessages = [];
		this.$rootScope.mapList = [];
		$rootScope.lobbyUserList = [];

		// Declare variables
		this.$scope.userReady = false;

	}

	LobbyController.prototype = {
			toggleUserReady: function () {
				console.log("Toggle ready");
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
			}
	}

	LobbyController.$inject = ['$scope', '$location', '$rootScope', 'gridWarsApp.lobby.service'];


	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', LobbyController);
}());
