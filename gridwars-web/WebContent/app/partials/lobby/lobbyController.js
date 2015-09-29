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
		$rootScope.pageName = "Game Lobby";
		$rootScope.deleteSelected = false;
		$rootScope.currentlyInLobby = false;
		$rootScope.gameLobbyLoaded = false;
		$rootScope.loggedOut = false;

		if ($window.sessionStorage.gameLeader == "true") {
			$rootScope.gameLeader = true;
		} else {
			$rootScope.gameLeader = false;
		}

		// Set up new sockets or reset if they exist
		if (!this.$rootScope.sockets) {
			this.$rootScope.sockets = new SocketShiz();
		} else {
			this.$rootScope.sockets.resetCallbacks();
		}

		// Bind the events we need for this page
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CONNECT, this.lobbyService.onConnect);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_DISCONNECT, this.lobbyService.onDisconnect);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CHAT_MESSAGE, this.lobbyService.onChatMessage);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_USER_JOINED_GAME_LOBBY, this.lobbyService.userJoinedGameLobby);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_GAME_CONFIG, this.lobbyService.newGameConfig);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_LOBBY_USER_LIST, this.lobbyService.newUserList);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_MAP_CHANGE_ERROR, this.lobbyService.mapChangeError);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_TOGGLE_USER_READY, this.lobbyService.toggleUserReady);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CHANGE_USER_COLOUR, this.lobbyService.changeUserColour);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_CHANGE_USER_TEAM, this.lobbyService.changeUserTeam);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_GAME_INIT, this.lobbyService.gameInitialising);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_LEADER_CHANGED, this.lobbyService.leaderChanged);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_USER_LEFT_GAME_LOBBY, this.lobbyService.userLeftLobby);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_LEFT_LOBBY, this.lobbyService.leftLobby);
		this.$rootScope.sockets.bindEvent (CONSTANTS.SOCKET_REC_ROOM_DELETED, this.lobbyService.roomDeleted);


		if (!this.$rootScope.currentlyInLobby) {
			this.lobbyService.joinGameLobby();
		}

		// Get information from server
		function getAllData () {
			_this.$rootScope.getData = setTimeout(function () {	
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

		this.$rootScope.mapName = this.$rootScope.gameConfig.mapName.toLowerCase();
		this.$rootScope.mapName = this.$rootScope.mapName.split(' ').join('_');

		$scope.$on('$locationChangeStart', function (event, next, current) {
			if(self.$rootScope.currentlyInLobby) {
				if(next !== "http://" + window.location.host + "/#/game") {
					_this.lobbyService.leaveGame();
					clearTimeout(_this.$rootScope.getData);
				}
			}
		});
	}

	LobbyController.prototype = {
			toggleUserReady: function () {
				this.lobbyService.toggleReady();
			},
			changeMap: function (map) {
				this.$rootScope.previousMapId = this.$rootScope.gameConfig.mapId;
				this.$rootScope.previousMapName = this.$rootScope.gameConfig.mapName;
				this.$rootScope.gameConfig.mapId = map.mapId;
				this.$rootScope.gameConfig.mapName = map.mapName;
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
				this.$rootScope.newMessage = "";
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
			}
	}

	LobbyController.$inject = ['$scope', '$location', '$rootScope', '$window', 'gridWarsApp.lobby.service'];

	angular.module('gridWarsApp.lobby.module').controller('gridWarsApp.lobby.controller', LobbyController);
}());
