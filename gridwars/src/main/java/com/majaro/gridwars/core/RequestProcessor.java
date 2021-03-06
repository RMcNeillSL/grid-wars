package com.majaro.gridwars.core;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Iterator;

import com.majaro.gridwars.api.SocketService;
import com.majaro.gridwars.apiobjects.AuthRequest;
import com.majaro.gridwars.apiobjects.GameInitRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.GameplayConfig;
import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.apiobjects.RefreshGameLobbyRequest;
import com.majaro.gridwars.apiobjects.RegRequest;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Coordinate;
import com.majaro.gridwars.game.GameStaticMap;

public class RequestProcessor {
	
	private static RequestProcessor instance = null;
	
	// Thread safe variables
	private static Object mutex = new Object();

	// Game array objects
	private ArrayList<GameLobby> activeGameLobbys;
	private ArrayList<GameStaticMap> gameMaps;

	// Session management arrays
	private ArrayList<Session> activeSessions;

	// DB interaction objects
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	
	// Socket variables
	@SuppressWarnings("unused")
	private SocketService socketService;
	
	// GUI server application
	private ServerGUI serverGUI = null;
	
	// Constants
	private static final String DEFAULT_LOBBY_NAME = "Europe Server #";

	
	// Constructors
	
	public static RequestProcessor getInstance() {
		if(instance == null) {
			synchronized(mutex) {
				if(instance == null) instance = new RequestProcessor();
			}
		}
		
		return instance;
	}
	
	private RequestProcessor() {

		// Set default array values
		this.activeGameLobbys = new ArrayList<GameLobby>();
		this.activeSessions = new ArrayList<Session>();
		this.gameMaps = new ArrayList<GameStaticMap>();

		// Create game maps
		this.gameMaps.add(new GameStaticMap("1", "Hunting Ground", 28, 28,
				new int[] { 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,38,31,31,31,31,31,31,31,31,31,36,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,38,58,0,0,0,0,0,0,0,0,0,59,36,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,38,58,0,0,0,0,0,0,0,0,0,0,0,59,31,36,2,2,2,2,2,
						2,2,2,2,2,38,31,58,0,0,60,33,33,33,33,33,33,33,57,0,0,0,59,36,2,2,2,2,
						2,2,2,2,38,58,0,0,0,0,32,2,2,2,2,2,2,2,34,0,0,0,0,59,36,2,2,2,
						2,2,2,38,58,46,39,39,44,0,32,2,2,2,2,2,2,38,58,0,0,0,0,0,32,2,2,2,
						2,2,2,34,0,42,1,1,62,44,59,31,31,31,31,31,31,58,46,39,39,44,0,0,32,2,2,2,
						2,2,2,34,0,42,1,1,1,40,56,48,48,48,48,48,55,46,63,1,1,40,0,0,32,2,2,2,
						2,2,2,34,0,42,1,1,1,40,56,48,48,48,48,48,55,42,1,1,1,62,44,0,32,2,2,2,
						2,2,2,34,0,45,64,1,61,43,0,0,68,9,65,0,0,45,64,1,1,1,40,0,32,2,2,2,
						2,2,2,34,0,0,45,41,43,68,9,9,13,70,14,65,0,0,45,41,41,41,43,60,35,2,2,2,
						2,2,2,37,57,0,0,0,0,8,70,69,69,70,69,10,0,0,0,0,0,60,33,35,2,2,2,2,
						2,2,2,2,37,33,57,0,0,67,11,11,11,11,11,66,0,0,0,60,33,35,2,2,2,2,2,2,
						2,2,2,2,2,2,37,57,0,0,0,0,0,0,0,0,0,60,33,35,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,37,57,0,0,0,0,0,0,0,60,35,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,37,33,33,33,33,33,33,33,35,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2 },
				new Coordinate[] { new Coordinate(6, 12),
				                   new Coordinate(19, 13) }));

		this.gameMaps.add(new GameStaticMap("2", "MaJaRo", 32, 32,
				new int[] {	2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,38,31,36,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,38,31,31,31,31,31,31,31,36,2,2,2,2,2,38,58,0,59,31,31,31,31,31,36,2,2,2,2,
						2,2,2,38,58,46,39,39,44,0,0,0,59,36,2,2,2,2,34,0,0,0,0,46,39,39,44,59,36,2,2,2,
						2,2,2,34,0,42,1,1,62,44,0,0,53,59,36,2,2,2,34,0,0,0,46,63,1,1,40,0,32,2,2,2,
						2,2,2,34,0,42,1,1,1,40,56,48,51,60,35,2,2,2,34,53,0,0,42,1,1,1,40,0,32,2,2,2,
						2,2,2,37,57,42,1,1,1,40,0,0,47,32,2,2,2,2,34,52,48,55,42,1,1,1,40,60,35,2,2,2,
						2,2,2,2,34,45,64,1,61,43,0,0,47,32,2,2,2,2,34,47,0,0,45,64,1,61,43,32,2,2,2,2,
						2,2,2,2,34,0,45,41,43,0,0,0,47,48,48,48,48,48,48,47,0,0,0,45,41,43,0,32,2,2,2,2,
						2,2,2,2,34,0,0,0,0,0,0,0,47,32,2,2,2,2,34,47,0,0,0,0,0,0,0,32,2,2,2,2,
						2,2,2,2,37,57,68,9,65,0,0,0,47,32,2,2,2,2,34,47,0,0,68,9,9,65,60,35,2,2,2,2,
						2,2,2,2,2,34,8,70,10,0,0,0,47,32,2,2,2,2,34,47,0,0,8,70,69,10,32,2,2,2,2,2,
						2,2,2,2,2,34,8,70,10,0,0,0,47,32,2,2,2,2,34,47,0,0,67,11,11,66,32,2,2,2,2,2,
						2,2,2,2,2,34,67,11,66,0,0,0,47,59,31,31,31,31,58,47,0,0,0,0,0,0,59,36,2,2,2,2,
						2,2,2,2,38,58,0,0,0,0,0,0,52,48,48,48,48,48,48,51,0,0,0,0,0,0,0,59,36,2,2,2,
						2,2,2,38,58,0,0,0,0,0,0,0,52,48,48,48,48,48,48,51,0,0,0,0,0,0,0,0,32,2,2,2,
						2,2,2,34,0,0,0,0,0,0,0,0,47,60,33,33,33,33,57,47,0,0,0,0,0,0,0,0,32,2,2,2,
						2,2,2,34,0,0,0,0,0,0,0,0,47,32,2,2,2,2,34,47,0,0,0,68,9,65,0,0,32,2,2,2,
						2,2,2,34,0,0,68,9,9,65,0,0,47,32,2,2,2,2,34,47,0,0,0,8,69,10,0,0,32,2,2,2,
						2,2,2,37,57,0,8,70,69,10,0,0,47,32,2,2,2,2,34,47,0,0,0,8,69,10,0,60,35,2,2,2,
						2,2,2,2,37,57,67,11,11,66,0,0,47,32,2,2,2,2,34,47,0,0,0,67,11,66,60,35,2,2,2,2,
						2,2,2,2,2,34,0,0,0,0,0,0,47,48,48,48,48,48,48,47,0,0,0,0,0,0,32,2,2,2,2,2,
						2,2,2,2,2,34,46,39,39,44,0,0,47,32,2,2,2,2,34,47,0,0,46,39,39,44,32,2,2,2,2,2,
						2,2,2,2,38,58,42,1,1,62,44,0,47,32,2,2,2,2,34,47,0,46,63,1,1,40,59,36,2,2,2,2,
						2,2,2,38,58,46,63,1,1,1,40,56,51,32,2,2,2,2,34,52,55,42,1,1,1,62,44,59,36,2,2,2,
						2,2,2,37,57,42,1,1,1,61,43,0,54,32,2,2,2,2,34,54,0,45,64,1,1,1,40,0,32,2,2,2,
						2,2,2,2,34,45,41,41,41,43,0,0,60,35,2,2,2,2,37,57,0,0,45,41,41,41,43,60,35,2,2,2,
						2,2,2,2,37,33,33,33,33,33,33,33,35,2,2,2,2,2,2,37,33,33,33,33,33,33,33,35,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
						2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2},
				new Coordinate[] { new Coordinate(6, 5),
								   new Coordinate(22, 24),
						           new Coordinate(8, 27),
				                   new Coordinate(25, 8) }));

		// Construct DB link
		this.dao = new EntityManager(PERSISTENCE_UNIT);

		// Setup GUI for the server
//		this.serverGUI = new ServerGUI();
		
		// Setup sessions and sockets
//		initialiseSessionCleanUp();
		this.socketService = new SocketService(this);
	}

	
	// Gameplay methods
	
	public String validateGameInitRequest(GameInitRequest gameInitRequest, String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		if (gameLobby != null && user != null && gameLobby.isLobbyLeader(user)) {
			return gameLobby.getLobbyId();
		}
		return null;
	}
	
	public GameplayConfig generateGameplayConfig(String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		if (gameLobby != null) {
			return new GameplayConfig(gameLobby, this.getGameMapFromId(gameLobby.getMapId()));
		}
		return null;
	}
	
	public void initGameEngine(String lobbyId) {
		GameLobby gameLobby = this.getGameLobbyFromLobbyId(lobbyId);
		if (gameLobby != null && !gameLobby.started()) {
			GameStaticMap gameMap = this.getGameMapFromId(gameLobby.getMapId());
			if (gameMap != null) {
				gameLobby.initGame(gameMap);
			}
		}
	}
	
	public void startGameEngine(String lobbyId) {
		GameLobby gameLobby = this.getGameLobbyFromLobbyId(lobbyId);
		if (gameLobby != null && gameLobby.started()) {
			gameLobby.startGame();
		}
	}
	
	public boolean markUserAsReady(String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		if (gameLobby != null && user != null) {
			return gameLobby.areAllUsersReadyAndUpdate(user);
		}
		return false;
	}
	
	public GameplayResponse[] processGameplayRequest(GameplayRequest gameplayRequest, String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		if (gameLobby != null && user != null) {
			return gameLobby.processGameplayRequest(gameplayRequest, user.getId());
		}
		return new GameplayResponse[0];
	}
	
	public GameplayResponse setupGameSpawns(String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		if (gameLobby != null) {
			return gameLobby.setupGameSpawns();
		}
		return new GameplayResponse();
	}
	
	
	// Managing game lobbies including joining, creating and game info retrieval

	public GameJoinResponse newGame(String sessionId) {

		// Declare/initialise variables
		GameJoinResponse responseConfig = null;

		// Attempt - create new game
		try {

			// Setup variables to work with
			boolean inGame = false;
			User user = this.getUserFromRESTSessionId(sessionId);
			
			// Proceed if prerequisites are present
			if (user != null) {

				// Check player isn't already in a lobby
				for (GameLobby gameLobby : this.activeGameLobbys) {
					if (gameLobby.includesUser(user)) {
						inGame = true;
						break;
					}
				}
				
				// Create new game lobby
				if (!inGame) {
					String lobbyName = generateValidLobbyName();
					GameLobby gameLobby = new GameLobby(GenerateUniqueGameLobbyId(), user, this.gameMaps.get(0), lobbyName);
					LobbyUser lobbyUser = gameLobby.getLobbyUser(user.getId());
					responseConfig = new GameJoinResponse(gameLobby, lobbyUser);
					this.activeGameLobbys.add(gameLobby);
				}
			}


		} catch (Exception e) {
			responseConfig = null;
		}

		// Return determined response
		return responseConfig;

	}

	public GameJoinResponse joinGame(String lobbyId, String sessionId) {

		// Declare/initialise variables
		GameJoinResponse responseConfig = null;

		// Attempt - join a lobby identified by a given Id
		try {

			GameLobby gameLobby = this.getGameLobbyFromLobbyId(lobbyId);
			User user = this.getUserFromRESTSessionId(sessionId);
			if (gameLobby != null && user != null && !gameLobby.includesUser(user) && gameLobby.canJoin()) {
				LobbyUser lobbyUser = gameLobby.addUser(user);
				responseConfig = new GameJoinResponse(gameLobby, lobbyUser);
			}

		} catch (Exception e) {
			responseConfig = null;
		}

		// Return determined response
		return responseConfig;

	}

	public ArrayList<GameLobby> listGames() {
		return this.activeGameLobbys;
	}

	public ArrayList<GameStaticMap> listGameMaps() {
		return this.gameMaps;
	}
	
	public void deleteGameLobby (String gameLobbyId) {
		for (int index = 0; index < this.activeGameLobbys.size(); index++) {
			if (this.activeGameLobbys.get(index).getLobbyId().equals(gameLobbyId)) {
				this.activeGameLobbys.remove(index);
			}
		}
	}

	public boolean updateGameConfig(String sessionId, GameJoinResponse gameJoinResponse) {
		// Proceed if gamelobby and gameconfig are found
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		boolean updateComplete = false;

		if (gameLobby != null) {
			updateComplete = gameLobby.updateGameConfig(gameJoinResponse, user, this.getGameMapFromId(gameJoinResponse.getMapId()));
		}

		return updateComplete;
	}

	public GameJoinResponse getUsersGame(String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromRESTSessionId(sessionId);
		User user = this.getUserFromRESTSessionId(sessionId);
		if (gameLobby != null && user != null) {
			LobbyUser lobbyUser = gameLobby.getLobbyUser(user.getId());
			if (lobbyUser != null) {
				return new GameJoinResponse(gameLobby, lobbyUser);
			}
		}
		return null;
	}
	
	public RefreshGameLobbyRequest getGameInfo(String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		if (gameLobby != null) {
			return new RefreshGameLobbyRequest(gameLobby.getLobbyId(), gameLobby.getLobbyName(), gameLobby.getMapId(), gameLobby.getMaxPlayers(), 
					gameLobby.getPlayerCount(), gameLobby.getGameType(), gameLobby.getMapName());
		}
		return null;
	}
	
	public GameJoinResponse getAllGAmeConfigBySocketId (String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		if (gameLobby != null && user != null) {
			LobbyUser lobbyUser = gameLobby.getLobbyUser(user.getId());
			if (lobbyUser != null) {
				return new GameJoinResponse(gameLobby, lobbyUser);
			}
		}
		return null;
	}

	
	// Session authentication and management methods

	private void addNewSession(String sessionId, User user) {
		Session session = new Session(sessionId, user);
		this.activeSessions.add(session);
	}

	public synchronized boolean isSessionAuthenticated(String sessionId) {
		boolean authenticated = false;

		for(int index = 0; index < activeSessions.size(); index++) {
			if(activeSessions.get(index).getSessionId().equals(sessionId)) {
				authenticated = true;
				break;
			}
		}

		return authenticated;
	}

	public synchronized String authenticate(String sessionId, AuthRequest authRequest) {
		String response = "401";
		
		User user = dao.authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());

		if (user != null) {
			boolean userLoggedIn = false;

			for(int index = 0; index < activeSessions.size(); index++) {
				if(activeSessions.get(index).getUser().getUsername().equals(user.getUsername())) {
					userLoggedIn = true;
					break;
				}
			}

			if (!userLoggedIn) {
				addNewSession(sessionId, user);
				response = user.getUsername();
			} else {
				response = "409";
			}
		}

		return response;
	}

	public boolean checkAllReady (String lobbyId) {
		GameLobby gameLobby = getGameLobbyFromLobbyId(lobbyId);
		return gameLobby.checkAllReady();
	}

	public String getUserNameByUserId (String lobbyId, int userId) {
		GameLobby gameLobby = getGameLobbyFromLobbyId(lobbyId);
		return gameLobby.getLobbyUser(userId).getLinkedUser().getUsername();
	}

	public boolean changeLobbyLeader (String sessionId, int targetUserId) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		User user = getUserFromSocketSessionId(sessionId);

		return gameLobby.changeLobbyLeader(user.getId(), targetUserId);
	}

	public void setAllNotReady (String lobbyId) {
		GameLobby gameLobby = getGameLobbyFromLobbyId(lobbyId);
		gameLobby.setAllNotReady();
	}

	public boolean removeLobbyUserAndDeleteLobbyIfEmpty (String sessionId) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		int userId = getUserFromSocketSessionId(sessionId).getId();
		gameLobby.removeLobbyUser(userId);

		if (gameLobby.getConnectedLobbyUsers().size() == 0) {
			this.deleteGameLobby(gameLobby.getLobbyId());
			return true;
		}
		return false;
	}

	public void toggleUserReady (String sessionId) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		int userId = getUserFromSocketSessionId(sessionId).getId();
		gameLobby.updateUserReady(userId);
	}

	public boolean updateUserColour (String sessionId, String colour) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		int userId = getUserFromSocketSessionId(sessionId).getId();

		return gameLobby.updateUserColour(userId, colour);
	}

	public void updateUserTeam (String sessionId, int team) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		int userId = getUserFromSocketSessionId(sessionId).getId();
		gameLobby.updateUserTeam(userId, team);
	}

	
	// User login and registration methods

	public int register(RegRequest regRequest) {
		if(regRequest.getNewUsername().length() < 1 || regRequest.getNewPassword().length() < 1
				|| regRequest.getNewUsername().length() > 15) {
			return 400;
		}
		
		return dao.register(regRequest.getNewUsername(), regRequest.getNewPassword());
	}

	public void LogOut(String sessionId) {
		for (Session s : activeSessions) {
			if (s.getSessionId() == sessionId) {
				activeSessions.remove(activeSessions.indexOf(s));
				break;
			}
		}
	}


	// Utility methods

	public void bindSocketSessionId(String username, String socketSessionId) {
		for (Session session : this.activeSessions) {
			if (session.getUser().getUsername().toUpperCase().equals(username.toUpperCase())) {
				session.bindSocketSessionId(socketSessionId);
			}
		}
	}

	public User getUserFromSocketSessionId(String sessionId) {
		for (Session session : activeSessions) {
			if (session.getSocketSessionId() != null &&
					session.getSocketSessionId().equals(sessionId)) {
				return session.getUser();
			}
		}
		return null;
	}
	
	public ArrayList<LobbyUser> getConnectedLobbyUsersForLobbyId(String lobbyId) {
		GameLobby gameLobby = getGameLobbyFromLobbyId(lobbyId);
		
		return gameLobby.getConnectedLobbyUsers();
	}

	public GameLobby getGameLobbyFromSocketSessionId(String sessionId) {
		User user = this.getUserFromSocketSessionId(sessionId);
		if (user != null) {
			for (GameLobby gameLobby : this.activeGameLobbys) {
				if (gameLobby.includesUser(user)) {
					return gameLobby;
				}
			}
		}
		return null;
	}

	public String getGameLobbyIdFromSocketSessionId(String sessionId) {
		User user = this.getUserFromSocketSessionId(sessionId);
		if (user != null) {
			for (GameLobby gameLobby : this.activeGameLobbys) {
				if (gameLobby.includesUser(user)) {
					return gameLobby.getLobbyId();
				}
			}
		}
		return null;
	}

	public User getUserFromRESTSessionId(String sessionId) {
		for (Session session : activeSessions) {
			if (session.getSessionId() == sessionId) {
				return session.getUser();
			}
		}
		return null;
	}

	public GameLobby getGameLobbyFromRESTSessionId(String sessionId) {
		User user = this.getUserFromRESTSessionId(sessionId);
		if (user != null) {
			for (GameLobby gameLobby : this.activeGameLobbys) {
				if (gameLobby.includesUser(user)) {
					return gameLobby;
				}
			}
		}
		return null;
	}

	private GameLobby getGameLobbyFromLobbyId(String lobbyId) {
		for (GameLobby gameLobby : this.activeGameLobbys) {
			if (gameLobby.getLobbyId().equals(lobbyId)) {
				return gameLobby;
			}
		}
		return null;
	}

	public GameStaticMap getGameMapFromId(String gameMapId) {
		for (GameStaticMap gameMap : this.gameMaps) {
			if (gameMap.getMapId().equals(gameMapId)) {
				return gameMap;
			}
		}
		return null;
	}

	private String GenerateUniqueGameLobbyId() {
		SecureRandom random = new SecureRandom();
		boolean lobbyIdReserved = true;
		String lobbyId = new BigInteger(130, random).toString(32);
		while (lobbyIdReserved) {
			lobbyIdReserved = false;
			lobbyId = new BigInteger(130, random).toString(32);
			for (GameLobby gameLobby : this.activeGameLobbys) {
				if (gameLobby.getLobbyId() == lobbyId) {
					lobbyIdReserved = true;
				}
			}
		}
		return lobbyId;
	}

	private String generateValidLobbyName() {
		String lobbyName = "";
		String currentCount = Integer.toString(activeGameLobbys.size() + 1);

		while (lobbyName == "") {
			boolean nameIsFree = true;
			
			for (GameLobby lobby : activeGameLobbys) {
				if(lobby.getLobbyName().equals(DEFAULT_LOBBY_NAME + currentCount)) {
					nameIsFree = false;
					break;
				}
			}
			
			if(nameIsFree) {
				lobbyName = DEFAULT_LOBBY_NAME + currentCount;
			}
		}
		
		return lobbyName;
	}

	private void initialiseSessionCleanUp() {
/*		this.sessionCleanUp = new Runnable() {
			public void run() {
				while (true) {
					if (activeSessions.size() > 0) {
						Iterator<Session> sessionIter = activeSessions.iterator();

						while (sessionIter.hasNext()) {
							Session session = sessionIter.next();

							if (session.getSessionExpiry().isBeforeNow()) {
								sessionIter.remove();
							}
						}
					}

					try {
						Thread.sleep(30000);
					} catch (InterruptedException e) {
						System.out.println(e.getMessage());
					}
				}
			}
		};

		this.sessionCleanUpThread = new Thread(sessionCleanUp);
		this.sessionCleanUpThread.start();*/
	}

	public GameAndUserInfo validateAndReturnGameLobbyAndUserInfo (String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);

		if (gameLobby == null || user == null) {
			return null;
		}

		return new GameAndUserInfo(gameLobby.getLobbyId(), user.getId(), gameLobby.getConnectedLobbyUsers(), user.getUsername());
	}
}
