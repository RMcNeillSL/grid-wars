'use strict';

(function () {

	function LobbyController ($scope, $location, $rootScope, $window, lobbyService) {
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$window = $window;
		this.lobbyService = lobbyService;
		var _this = this;

		// Initialise variables
		$rootScope.currentUser = this.$window.sessionStorage.username;
		$rootScope.lobbyMessages = [];
		$rootScope.mapList = [];
		$rootScope.lobbyUserList = [];
		$rootScope.colourList = ["blue", "red", "purple", "green", "yellow", "cyan"];
		this.$rootScope.pageName = "Game Lobby";
		$rootScope.deleteSelected = false;
		$rootScope.currentlyInLobby = false;
		$rootScope.gameLobbyLoaded = false;

		if ($window.sessionStorage.gameLeader == "true") {
			$rootScope.gameLeader = true;
		} else {
			$rootScope.gameLeader = false;
		}

		// Setup the socket
		this.lobbyService.socketSetup();

		// Get information from server
		function getAllData () {
			setTimeout(function () {
				if (_this.$rootScope.mapList.length === 0) {
					console.log("Haven't received maps yet.");
					_this.lobbyService.getMaps();
				}
				if (!_this.$rootScope.gameConfig) {
					console.log("Haven't received config yet.");
					_this.lobbyService.getConfig();
				}
				if (_this.$rootScope.lobbyUserList.length === 0) {
					console.log("Haven't received users yet.");
					_this.lobbyService.getUsers();
				}

				if (_this.$rootScope.mapList.length === 0 || !_this.$rootScope.gameConfig || _this.$rootScope.lobbyUserList.length === 0) {
					getAllData();
				}

				if (_this.$rootScope.mapList.length > 0 && _this.$rootScope.gameConfig && _this.$rootScope.lobbyUserList.length > 0) {
					_this.$rootScope.gameLobbyLoaded = true;
					_this.$rootScope.$apply();
				}
			}, 500);
		}

		getAllData();

		$scope.$on('$locationChangeStart', function (event, next, current) {
			if(next !== "http://" + window.location.host + "/#/game") {
				_this.lobbyService.leaveGame();
			}
		});
	}

	LobbyController.prototype = {
			toggleUserReady: function () {
				this.lobbyService.toggleReady();
			},
			changeMap: function (map) {
				this.$rootScope.previousMapId = this.$rootScope.gameConfig.mapId;
				this.$rootScope.gameConfig.mapId = map.mapId;
				this.lobbyService.updateConfig();
			},
			changeCash: function (cash) {
				this.$rootScope.gameConfig.startingCash = cash;
				this.lobbyService.updateConfig();
			},
			changeSpeed: function (speed) {
				this.$rootScope.gameConfig.gameSpeed = speed;
				this.lobbyService.updateConfig();
			},
			changeUnitHealth: function (health) {
				this.$rootScope.gameConfig.unitHealth = health;
				this.lobbyService.updateConfig();
			},
			changeBuildingHealth: function (health) {
				this.$rootScope.gameConfig.buildingHealth = health;
				this.lobbyService.updateConfig();
			},
			changeTurretHealth: function (health) {
				this.$rootScope.gameConfig.turretHealth = health;
				this.lobbyService.updateConfig();
			},
			toggleCrates: function () {
				this.$rootScope.gameConfig.randomCrates = !this.$rootScope.gameConfig.randomCrates;
				this.lobbyService.updateConfig();
			},
			toggleRedeployableMCV: function () {
				this.$rootScope.gameConfig.redeployableMCV = !this.$rootScope.gameConfig.redeployableMCV;
				this.lobbyService.updateConfig();
			},
			resetToDefault: function() {
				this.$rootScope.gameConfig.startingCash = 10000;
				this.$rootScope.gameConfig.gameSpeed = 100;
				this.$rootScope.gameConfig.unitHealth = 100;
				this.$rootScope.gameConfig.buildingHealth = 100;
				this.$rootScope.gameConfig.turretHealth = 100;
				this.$rootScope.gameConfig.randomCrates = false;
				this.$rootScope.gameConfig.redeployableMCV = false;
				this.lobbyService.updateConfig();
				$("#cratesCheckbox").prop("checked", false);
				$("#mcvCheckbox").prop("checked", false);
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
			},
			setTab: function (tab) {
				this.$scope.tabSelect = tab;
			},
			logOut : function() {
				var self = this;
				this.$rootScope.loggedOut = true;
				$.post("gridwars/rest/logout");
				this.lobbyService.leaveGame();
				self.$location.path("/login");
			}
	}

	LobbyController.$inject = ['$scope', '$location', '$rootScope', '$window', 'gridWarsApp.lobby.service'];

	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', LobbyController);
}());
