'use strict';

(function () {

	function LobbyController ($scope, $location, $rootScope, $window, lobbyService) {
		
		// Save injected items
		this.$scope = $scope;
		this.$location = $location;
		this.$rootScope = $rootScope;
		this.$window = $window;
		this.lobbyService = lobbyService;

		// Initialise variables
		$rootScope.gameplayConfig = null;
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

		// Create reference for this
		var self = this;
		
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
		
		// Get gameplay configuration details before proceeding
		var configPoller = null;
		var getGameplayConfiguration = function() {
			if (!self.$rootScope.gameConfig) {
				
				// Mark as not leader
				$window.sessionStorage.gameLeader = false;
				$rootScope.gameLeader = false;
				
				// Get lobby information if possible
				if (self.$window.sessionStorage.connectedLobbyId) {
					configPoller = setInterval(function() {
						self.lobbyService.joinGameLobby_JAMES(self.$window.sessionStorage.connectedLobbyId, function(configDataResponse) {
							self.$rootScope.gameConfig = configDataResponse;
						});
					}, 100);
				} else {
					console.log("No LobbyId stored.");
				}
			}
		}
		
		// Run procedure to request gameplay configuration
		getGameplayConfiguration();
		
		// Wait for gameplay configuration to be received before continuing
		(new Waiter(function() { return self.$rootScope.gameConfig; }, function() {
			
			// Clear config poller
			if (configPoller) { clearInterval(configPoller); }

			// Join game lobby socket channel
			if (!self.$rootScope.currentlyInLobby) {
				self.lobbyService.joinGameLobby();
			}

			// Function to poll information until all is received
			function getAllData () {
				self.$rootScope.getData = setTimeout(function () {	
					if (self.$rootScope.mapList.length === 0) {
						console.log("Haven't received maps yet.");
						self.lobbyService.getMaps();
					}
					if (!self.$rootScope.gameConfig) {
						console.log("Haven't received config yet.");
						self.lobbyService.getConfig();
					}
					if (self.$rootScope.lobbyUserList.length === 0) {
						console.log("Haven't received users yet.");
						self.lobbyService.getUsers();
						
					}

					if (self.$rootScope.mapList.length === 0 || 
							!self.$rootScope.gameConfig || 
							self.$rootScope.lobbyUserList.length === 0) {
						getAllData();
					}

					if (self.$rootScope.mapList.length > 0 && 
							self.$rootScope.gameConfig && 
							self.$rootScope.lobbyUserList.length > 0) {
						self.$rootScope.gameLobbyLoaded = true;
						self.$rootScope.$apply();
					}
				}, 100);
			}

			// Poll information from the server
			getAllData();

			self.$rootScope.mapName = self.$rootScope.gameConfig.mapName.toLowerCase();
			self.$rootScope.mapName = self.$rootScope.mapName.split(' ').join('_');

			self.$scope.$on('$locationChangeStart', function (event, next, current) {
				if(self.$rootScope.currentlyInLobby) {
					if(next !== "http://" + window.location.host + "/#/game") {
						self.lobbyService.leaveGame();
						clearTimeout(self.$rootScope.getData);
					}
				}
			});

		}, 100)).start();
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
