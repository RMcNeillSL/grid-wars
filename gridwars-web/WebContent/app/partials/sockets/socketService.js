'use strict';

function SocketShiz () {
	
	// create socket
	console.log("Socket connection to: " + CONSTANTS.SOCKET_SERVER);
	this.sockets = io.connect(CONSTANTS.SOCKET_SERVER, {
		"force new connection": true,
		"timeout" : 5000
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

	this.sockets.on(CONSTANTS.SOCKET_REC_GAME_CONFIG, function (response) {
		if (self.onGameConfig) { self.onGameConfig(response); }
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

	this.sockets.on(CONSTANTS.SOCKET_REC_CHANGE_USER_COLOUR, function (response) {
		if (self.onChangeColour) { self.onChangeColour(response); }
	});

	this.sockets.on(CONSTANTS.SOCKET_REC_CHANGE_USER_TEAM, function (response) {
		if (self.onTeamChange) { self.onTeamChange(response); }
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

}

SocketShiz.prototype.resetCallbacks = function() {

	// SET DEFAULT CALLBACKS
	this.onConnect 				= null;

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
}

SocketShiz.prototype.bindEvent = function(bindingIdentifier, callback) {
	// Connection established
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CONNECT) {
		console.log("Binding set up for connection");
		this.onConnect = callback;
	}

	// SERVER LOBBY: Server lobby Update
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_SERVER_LOBBY_UPDATE) {
		console.log("Binding set up for server lobby update");
		this.onServerLobbyUpdate = callback;
	}

	// SERVER LOBBY: Refresh game lobby (on config update)
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_REFRESH_GAME_LOBBY) {
		console.log("Binding set up for lobby refresh");
		this.onRefreshGameLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHAT_MESSAGE) {
		console.log("Binding set up for chat messages");
		this.onReceiveChatMessage = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_USER_JOINED_GAME_LOBBY) {
		console.log("Binding set up for joined game lobby");
		this.onUserJoinedGameLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_CONFIG) {
		console.log("Binding set up for game configs");
		this.onGameConfig = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LOBBY_USER_LIST) {
		console.log("Binding set up for user list");
		this.onLobbyUserList = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_MAP_CHANGE_ERROR) {
		console.log("Binding set up for map change error");
		this.onMapChangeError = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_TOGGLE_USER_READY) {
		console.log("Binding set up for user toggle ready");
		this.onUserToggleReady = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHANGE_USER_COLOUR) {
		console.log("Binding set up for user change colour");
		this.onChangeColour = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_CHANGE_USER_TEAM) {
		console.log("Binding set up for user change team");
		this.onTeamChange = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_GAME_INIT) {
		console.log("Binding set up for game init");
		this.onGameInit = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LEADER_CHANGED) {
		console.log("Binding set up for leader changed");
		this.onLeaderChanged = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_USER_LEFT_GAME_LOBBY) {
		console.log("Binding set up for user leaving lobby");
		this.onUserLeftLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_LEFT_LOBBY) {
		console.log("Binding set up for left lobby");
		this.onLeftLobby = callback;
	}
	
	// GAME LOBBY: 
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_ROOM_DELETED) {
		console.log("Binding set up for room delete");
		this.onRoomDelete = callback;
	}

}

SocketShiz.prototype.emitEvent = function (emitIdentifier, data) {
	this.sockets.emit(emitIdentifier, data);
}