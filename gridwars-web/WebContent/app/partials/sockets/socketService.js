'use strict';

function SocketShiz () {
	
	// create socket
	console.log("Socket connection to: " + CONSTANTS.SOCKET_SERVER);
	this.sockets = io.connect(CONSTANTS.SOCKET_SERVER, {
		"force new connection" : false,
		"timeout" : 10000
	});

	// Define default callbacks
	this.resetCallbacks();

	// Save self reference
	var self = this;

	// BIND EVENTS
	// Connection established
	this.sockets.on(CONSTANTS.SOCKET_REC_CONNECT, function (response) {
		if (self.onConnect) {self.onConnect(response); }
	});
	
	this.sockets.on(CONSTANTS.SOCKET_REC_DISCONNECT, function (response) {
		if (self.onDisconnect) {self.onDisconnect(response); }
	});

	// BIND EVENTS - SERVER LOBBY
	// Server lobby Update
	this.sockets.on(CONSTANTS.SOCKET_REC_SERVER_LOBBY_UPDATE, function (response) {
		if (self.onServerLobbyUpdate) { self.onServerLobbyUpdate(response); }
	});

	// Refresh game lobby (on config update)
	this.sockets.on(CONSTANTS.SOCKET_REC_REFRESH_GAME_LOBBY, function (response) {
		if (self.onRefreshGameLobby) { self.onRefreshGameLobby(response); }
	});

	// BIND EVENTS - GAME LOBBY

	this.sockets.on(CONSTANTS.SOCKET_REC_CHAT_MESSAGE, function (response) {
		if (self.onReceiveChatMessage) { self.onReceiveChatMessage(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_USER_JOINED_GAME_LOBBY, function (response) {
		if (self.onUserJoinedGameLobby) { self.onUserJoinedGameLobby(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_GAME_CONFIG, function (mapId, mapName, maxPlayers, gameType, mapMaxPlayers, startingCash, 
			gameSpeed, unitHealth, buildingHealth, turretHealth, randomCrates, redeployableMCV) {
		if (self.onGameConfig) { self.onGameConfig(mapId, mapName, maxPlayers, gameType, mapMaxPlayers, startingCash, 
				gameSpeed, unitHealth, buildingHealth, turretHealth, randomCrates, redeployableMCV); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_LOBBY_USER_LIST, function (response) {
		if (self.onLobbyUserList) { self.onLobbyUserList(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_MAP_CHANGE_ERROR, function (response) {
		if (self.onMapChangeError) { self.onMapChangeError(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_TOGGLE_USER_READY, function (response) {
		if (self.onUserToggleReady) { self.onUserToggleReady(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_CHANGE_USER_COLOUR, function (userId, colour) {
		if (self.onChangeColour) { self.onChangeColour(userId, colour); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_CHANGE_USER_TEAM, function (userId, team) {
		if (self.onTeamChange) { self.onTeamChange(userId, team); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_GAME_INIT, function (response) {
		if (self.onGameInit) { self.onGameInit(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_LEADER_CHANGED, function (response) {
		if (self.onLeaderChanged) { self.onLeaderChanged(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_USER_LEFT_GAME_LOBBY, function (response) {
		if (self.onUserLeftLobby) { self.onUserLeftLobby(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_LEFT_LOBBY, function (response) {
		if (self.onLeftLobby) { self.onLeftLobby(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_ROOM_DELETED, function (response) {
		if (self.onRoomDelete) { self.onRoomDelete(response); }
	});
	
	// BIND EVENTS - GAME
	
	this.sockets.on(CONSTANTS.SOCKET_REC_ACTUAL_GAME_INIT, function (response) {
		if (self.onGameActualInit) { self.onGameActualInit(response); }
	});
	
	this.sockets.on(CONSTANTS.SOCKET_REC_GAME_START, function (response) {
		if (self.onGameStart) { self.onGameStart(response); }
	});
	
	this.sockets.on(CONSTANTS.SOCKET_REC_GAMEPLAY_RESPONSE, function (response) {
		if (self.onGameplayResponse) { self.onGameplayResponse(response); }
	});
	
	this.sockets.on(CONSTANTS.SOCKET_REC_GAME_JOIN, function (response) {
		if (self.onGameJoin) { self.onGameJoin(response); }
	});

}

SocketShiz.prototype.resetCallbacks = function() {

	// SET DEFAULT CALLBACKS
	this.onConnect 				= null;
	this.onDisconnect			= null;

	// SET DEFAULT CALLBACKS - SERVER LOBBY
	this.onServerLobbyUpdate 	= null;
	this.onRefreshGameLobby 	= null;

	// SET DEFAULT CALLBACKS - GAME LOBBY
	this.onReceiveChatMessage	= null;
	this.onUserJoinedGameLobby	= null;
	this.onGameConfig			= null;
	this.onLobbyUserList		= null;
	this.onMapChangeError		= null;
	this.onUserToggleReady		= null;
	this.onChangeColour			= null;
	this.onTeamChange			= null;
	this.onGameInit				= null;
	this.onLeaderChanged		= null;
	this.onUserLeftLobby		= null;
	this.onLeftLobby			= null;
	this.onRoomDelete			= null;
	
	// SET DEFAULT CALLBACKS - GAME
	this.onGameActualInit		= null;
	this.onGameStart			= null;
	this.onGameplayResponse		= null;
	this.onGameJoin				= null;
}

SocketShiz.prototype.bindEvent = function(bindingIdentifier, callback) {
	// Connection established
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CONNECT) {
		this.onConnect = callback;
	}

	if (bindingIdentifier === CONSTANTS.SOCKET_REC_DISCONNECT) {
		this.onDisconnect = callback;
	}

	// SERVER LOBBY: Server lobby Update
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_SERVER_LOBBY_UPDATE) {
		this.onServerLobbyUpdate = callback;
	}

	// SERVER LOBBY: Refresh game lobby (on config update)
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_REFRESH_GAME_LOBBY) {
		this.onRefreshGameLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHAT_MESSAGE) {
		this.onReceiveChatMessage = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_USER_JOINED_GAME_LOBBY) {
		this.onUserJoinedGameLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_CONFIG) {
		this.onGameConfig = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LOBBY_USER_LIST) {
		this.onLobbyUserList = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_MAP_CHANGE_ERROR) {
		this.onMapChangeError = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_TOGGLE_USER_READY) {
		this.onUserToggleReady = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHANGE_USER_COLOUR) {
		this.onChangeColour = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHANGE_USER_TEAM) {
		this.onTeamChange = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_INIT) {
		this.onGameInit = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LEADER_CHANGED) {
		this.onLeaderChanged = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_USER_LEFT_GAME_LOBBY) {
		this.onUserLeftLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LEFT_LOBBY) {
		this.onLeftLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_ROOM_DELETED) {
		this.onRoomDelete = callback;
	}
	
	// GAME: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_ACTUAL_GAME_INIT) {
		this.onGameActualInit = callback;
	}
	
	// GAME: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_START) {
		this.onGameStart = callback;
	}
	
	// GAME: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAMEPLAY_RESPONSE) {
		this.onGameplayResponse = callback;
	}
	
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_JOIN) {
		this.onGameJoin = callback;
	}

}

SocketShiz.prototype.emitEvent = function (emitIdentifier, data) {
	if (data) {
		this.sockets.emit(emitIdentifier, data);
	} else {
		this.sockets.emit(emitIdentifier);
	}
}