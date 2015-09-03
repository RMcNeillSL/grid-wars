package com.majaro.gridwars.api;

import java.util.ArrayList;
import java.util.List;

import javax.websocket.OnMessage;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.majaro.gridwars.apiobjects.MessageRequest;
import com.majaro.gridwars.apiobjects.NewGameLobbyRequest;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.apiobjects.BindSocketRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.JoinRoomRequest;

public class SocketService {

	// Request processor reference
	private static RequestProcessor requestProcessor;

	// Socket objects
	private Configuration socketServerConfig;
	private SocketIOServer socketServer;
	private static final String SERVER_LOBBY_CHANNEL = "ServerLobby";

	public SocketService (RequestProcessor reqProcessor) {

		// Save passed variables
		requestProcessor = reqProcessor;

		// Generate config for socket server
		socketServerConfig = new Configuration();
		socketServerConfig.setHostname("localhost");
		socketServerConfig.setPort(8080);

		// Construct socket server
		socketServer = new SocketIOServer(socketServerConfig);
		socketServer.addListeners(this);

		// Start socket server
		socketServer.start();
		socketServer.addNamespace(SERVER_LOBBY_CHANNEL);
	}
	
	@OnEvent("joinGameLobby")
	public void onBindSocket(SocketIOClient client, BindSocketRequest data) {
		String username = data.getUser();
		String sessionId = client.getSessionId().toString();
		this.requestProcessor.bindSocketSessionId(username, sessionId);
		User user = this.requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = this.requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			socketServer.addNamespace(lobbyId);
			client.joinRoom(lobbyId);
			System.out.println("CLIENT JOINED " + lobbyId);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("userJoinedGameLobby", user.getUsername());
		}
	}
	
	@OnEvent("sendMessage")
    public void onMessage(SocketIOClient client, MessageRequest data, AckRequest ackRequest) {
		String sessionId = client.getSessionId().toString();
		User user = requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("gameLobbyMessage", data);
		}
    }

	@OnEvent("updateGameConfig")
	public void onUpdateGameConfig(SocketIOClient client, GameJoinResponse data) {
		String sessionId = client.getSessionId().toString();
		GameLobby gameLobby = this.requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			System.out.println("Received new configs " + lobbyId);
			this.requestProcessor.updateGameConfig(sessionId, data);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("gameConfig", data.getMapId(), data.getMaxPlayers(), data.getGameType());
		}
	}

	@OnEvent("joinServerLobby")
	public void onJoinServerLobby(SocketIOClient client, String data, AckRequest ackRequest) {
		client.joinRoom(SERVER_LOBBY_CHANNEL);
		System.out.println("User has entered the server lobby.");
	}

	@OnEvent("leaveServerLobby")
	public void onLeaveServerLobby(SocketIOClient client, String data, AckRequest ackRequest) {
		client.leaveRoom(SERVER_LOBBY_CHANNEL);
		System.out.println("User has left the server lobby.");
	}
	
	@OnEvent("newGameLobby")
	public void onNewGame(SocketIOClient client, NewGameLobbyRequest data, AckRequest ackRequest) {
		BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(SERVER_LOBBY_CHANNEL);
		broadcastRoomState.sendEvent("newGameLobby", data);
	}

	@OnEvent("forceDisconnect")
	public void onForceDisconnet(SocketIOClient client) {
		client.disconnect();
	}

	@OnConnect
	public void onConnectHandler(SocketIOClient client) {
		System.out.println("A user has connected.");
	}

	@OnDisconnect
	public void onDisconnectHandler(SocketIOClient client) {
		System.out.println("A user has disconnected.");
	}
}
