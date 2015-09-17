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

	// Bind events

	// Test message
	this.sockets.on(CONSTANTS.SOCKET_REC_TEST_MESSAGE, function (response) {
		if (self.onTestMessage) { self.onTestMessage(response); }
	});
	
	// Connection established
	this.sockets.on(CONSTANTS.SOCKET_REC_CONNECT, function (response) {
		if (self.onConnect) {self.onConnect(reponse); }
	});

	// SERVER LOBBY: Server lobby Update
	this.sockets.on(CONSTANTS.SOCKET_REC_SERVER_LOBBY_UPDATE, function (response) {
		if (self.onServerLobbyUpdate) { self.onServerLobbyUpdate(response); }
	});

	// SERVER LOBBY: Refresh game lobby (on config update)
	this.sockets.on(CONSTANTS.SOCKET_REC_REFRESH_GAME_LOBBY, function (response) {
		if (self.onRefreshGameLobby) { self.onRefreshGameLobby(response); }
	});
}

SocketShiz.prototype.resetCallbacks = function() {

	// Set default callbacks
	this.onTestMessage 			= null;
	this.onConnect 				= null;
	this.onServerLobbyUpdate 	= null;
	this.onRefreshGameLobby 	= null;
}

SocketShiz.prototype.bindEvent = function(bindingIdentifier, callback) {

	// Test message
	if (bindingIdentifier === CONSTANTS.SOCKET_REC_TEST_MESSAGE) {
		console.log("Binding set up for test message");
		this.onTestMessage = callback;
	}

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

}

SocketShiz.prototype.emitEvent = function (emitIdentifier, data) {
	this.sockets.emit(emitIdentifier, data);
}