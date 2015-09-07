package com.majaro.gridwars.api;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.majaro.gridwars.apiobjects.MessageRequest;
import com.majaro.gridwars.apiobjects.RefreshGameLobbyRequest;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.GameStaticMap;
import com.majaro.gridwars.apiobjects.BindSocketRequest;
import com.majaro.gridwars.apiobjects.GameInitRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.GameplayConfig;
import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;

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

	@OnEvent("initGame")
	public void initGame(SocketIOClient client, GameInitRequest data, AckRequest ackRequest) {
		String sessionId = client.getSessionId().toString();
		String lobbyId = requestProcessor.validateGameInitRequest(data, sessionId);
		if (lobbyId != null) {
			System.out.println("Initialising game for lobby #" + lobbyId);
			GameplayConfig gameplayConfig = requestProcessor.generateGameplayConfig(sessionId);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("gameInit", gameplayConfig);
			requestProcessor.initGameEngine(lobbyId);
		}
	}
	
	@OnEvent("startGame")
	public void startGame(SocketIOClient client) {
		String sessionId = client.getSessionId().toString();
		String lobbyId = requestProcessor.getGameLobbyIdFromSocketSessionId(sessionId);
		if (requestProcessor.markUserAsReady(sessionId) && lobbyId != null) {
			System.out.println("Starting game in lobby #" + lobbyId);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("gameStart");
		}
	}
	
	@OnEvent("gameplayRequest")
	public void processGameplayRequest(SocketIOClient client, GameplayRequest gameplayRequest) {
		String sessionId = client.getSessionId().toString();
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);
		GameplayResponse gameplayResponse = requestProcessor.processGameplayRequest(gameplayRequest, sessionId);
		BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameLobby.getLobbyId());
		if (gameLobby != null && gameplayResponse != null) {
			broadcastRoomState.sendEvent("lobbyUserList", gameLobby.getConnectedLobbyUsers());
		} else {
			
		}
	}
	
	@OnEvent("joinGameLobby")
	public void onBindSocket(SocketIOClient client, BindSocketRequest data) {
		String username = data.getUser();
		String sessionId = client.getSessionId().toString();
		requestProcessor.bindSocketSessionId(username, sessionId);
		User user = requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			socketServer.addNamespace(lobbyId);
			client.joinRoom(lobbyId);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("userJoinedGameLobby", user.getUsername());
			broadcastRoomState.sendEvent("lobbyUserList", gameLobby.getConnectedLobbyUsers());
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
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			requestProcessor.updateGameConfig(sessionId, data);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			broadcastRoomState.sendEvent("gameConfig", data.getMapId(), data.getMaxPlayers(), data.getGameType());
		}
	}

	@OnEvent("userToggleReady")
	public void onUserToggleReady(SocketIOClient client) {
		String sessionId = client.getSessionId().toString();
		User user = requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			int currentUserId = user.getId();
//			boolean userReady = gameLobby.getLobbyUser(currentUserId).isReady();
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			gameLobby.updateUserReady(currentUserId);
			broadcastRoomState.sendEvent("toggleUserReady", currentUserId);
		}
	}

	@OnEvent("userChangeColour")
	public void onUserColourChange(SocketIOClient client, String colour) {
		String sessionId = client.getSessionId().toString();
		User user = requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			int currentUserId = user.getId();
			boolean colourChanged = gameLobby.updateUserColour(currentUserId, colour);

			if (colourChanged) {
				BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
				broadcastRoomState.sendEvent("changeUserColour", currentUserId, colour);
				broadcastRoomState.sendEvent("gameChanges"); // SET NOT READY
			}
		}
	}

	@OnEvent("userChangeTeam")
	public void onUserTeamChange(SocketIOClient client, int team) {
		String sessionId = client.getSessionId().toString();
		User user = requestProcessor.getUserFromSocketSessionId(sessionId);
		GameLobby gameLobby = requestProcessor.getGameLobbyFromSocketSessionId(sessionId);

		if (user != null && gameLobby != null) {
			String lobbyId = gameLobby.getLobbyId();
			int currentUserId = user.getId();
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(lobbyId);
			gameLobby.updateUserTeam(currentUserId, team);
			broadcastRoomState.sendEvent("changeUserTeam", currentUserId, team);
			broadcastRoomState.sendEvent("gameChanges"); // SET NOT READY
		}
	}

	@OnEvent("joinServerLobby")
	public void onJoinServerLobby(SocketIOClient client, String data, AckRequest ackRequest) {
		client.joinRoom(SERVER_LOBBY_CHANNEL);
		System.out.println("User has entered the server lobby.");
	}

	@OnEvent("leaveServerLobby")
	public void onLeaveServerLobby(SocketIOClient client, String data, AckRequest ackRequest) {
		client.disconnect();
		System.out.println("User has left the server lobby.");
	}
	
	@OnEvent("refreshGameLobby")
	public void onNewGame(SocketIOClient client, RefreshGameLobbyRequest data, AckRequest ackRequest) {
		BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(SERVER_LOBBY_CHANNEL);
		broadcastRoomState.sendEvent("refreshGameLobby", data);
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
