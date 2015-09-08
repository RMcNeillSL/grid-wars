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
import com.majaro.gridwars.apiobjects.RefreshGameLobbyRequest;
import com.majaro.gridwars.core.GameAndUserInfo;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.apiobjects.BindSocketRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;

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
		requestProcessor.bindSocketSessionId(username, sessionId);
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			socketServer.addNamespace(gameAndUserInfo.getLobbyId());
			client.joinRoom(gameAndUserInfo.getLobbyId());
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
			broadcastRoomState.sendEvent("userJoinedGameLobby", gameAndUserInfo.getUsername());
			broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
		}
	}

	@OnEvent("sendMessage")
    public void onMessage(SocketIOClient client, MessageRequest data, AckRequest ackRequest) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
			broadcastRoomState.sendEvent("gameLobbyMessage", data);
		}
    }

	@OnEvent("updateGameConfig")
	public void onUpdateGameConfig(SocketIOClient client, GameJoinResponse data) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);
		boolean updateComplete = false;

		if (gameAndUserInfo != null) {
			int mapMaxPlayers = requestProcessor.getGameMapFromId(data.getMapId()).getMaxPlayers();

			if (requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()).size() > mapMaxPlayers) {
				client.sendEvent("mapChangeError", "Cannot change map - too many players in lobby");
			} else {
				if (data.getMaxPlayers() > requestProcessor.getGameMapFromId(data.getMapId()).getMaxPlayers()) {
					data.setMaxPlayers(mapMaxPlayers);
				}

				updateComplete = requestProcessor.updateGameConfig(sessionId, data);

				if (updateComplete) {
					BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
					broadcastRoomState.sendEvent("gameConfig", data.getMapId(), data.getMaxPlayers(), data.getGameType(), mapMaxPlayers);
					requestProcessor.setAllNotReady(sessionId);
					broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
				}
			}
		}
	}

	@OnEvent("startGameInitialisation")
	public void onStartGame (SocketIOClient client) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			boolean allReady = false;
			allReady = requestProcessor.checkAllReady(gameAndUserInfo.getLobbyId());

			if (allReady) {
				BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
				broadcastRoomState.sendEvent("gameInitialising");
			}
		}
	}

	@OnEvent("changeLobbyLeader")
	public void onChangeLeader (SocketIOClient client, int targetUserId) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			String targetUsername = requestProcessor.getUserNameByUserId(gameAndUserInfo.getLobbyId(), targetUserId);
			boolean complete = requestProcessor.changeLobbyLeader(sessionId, targetUserId);

			if (complete) {
				BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
				broadcastRoomState.sendEvent("leaderChanged", targetUsername);
				requestProcessor.setAllNotReady(sessionId);
				broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
			}
		}
	}

	@OnEvent("leaveLobby")
	public void onLeaveLobby (SocketIOClient client) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			requestProcessor.removeLobbyUserAndDeleteLobbyIfEmpty(sessionId);
			client.leaveRoom(gameAndUserInfo.getLobbyId());
			client.sendEvent("leftLobby");
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
			requestProcessor.setAllNotReady(gameAndUserInfo.getLobbyId());
			broadcastRoomState.sendEvent("userLeftLobby", gameAndUserInfo.getUsername());
			broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
			broadcastRoomState.sendEvent("leaderChanged", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()).get(0).getLinkedUser().getUsername());
		}

	}

	@OnEvent("userToggleReady")
	public void onUserToggleReady (SocketIOClient client) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			requestProcessor.toggleUserReady(sessionId);
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
			broadcastRoomState.sendEvent("toggleUserReady", gameAndUserInfo.getUserId());
		}
	}

	@OnEvent("userChangeColour")
	public void gameAndUserInfo(SocketIOClient client, String colour) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			boolean colourChanged = requestProcessor.updateUserColour(sessionId, colour);

			if (colourChanged) {
				BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
				broadcastRoomState.sendEvent("changeUserColour", gameAndUserInfo.getUserId(), colour);
				requestProcessor.setAllNotReady(sessionId);
				broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
			}
		}
	}

	@OnEvent("userChangeTeam")
	public void onUserTeamChange(SocketIOClient client, int team) {
		String sessionId = client.getSessionId().toString();
		GameAndUserInfo gameAndUserInfo = requestProcessor.validateAndReturnGameLobbyAndUserInfo(sessionId);

		if (gameAndUserInfo != null) {
			BroadcastOperations broadcastRoomState = socketServer.getRoomOperations(gameAndUserInfo.getLobbyId());
			requestProcessor.updateUserTeam(sessionId, team);
			broadcastRoomState.sendEvent("changeUserTeam", gameAndUserInfo.getUserId(), team);
			requestProcessor.setAllNotReady(sessionId);
			broadcastRoomState.sendEvent("lobbyUserList", requestProcessor.getConnectedLobbyUsersForLobbyId(gameAndUserInfo.getLobbyId()));
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
