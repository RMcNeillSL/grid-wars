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
import com.majaro.gridwars.apiobjects.RegRequest;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.GameStaticMap;

public class RequestProcessor {

	// Game array objects
	private ArrayList<GameLobby> activeGameLobbys;
	private ArrayList<GameStaticMap> gameMaps;

	// Session management arrays
	private ArrayList<Session> activeSessions;
	private Thread sessionCleanUpThread;
	private Runnable sessionCleanUp;

	// DB interaction objects
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	
	// Socket variables
	@SuppressWarnings("unused")
	private SocketService socketService;
	
	// Constants
	private static final String DEFAULT_LOBBY_NAME = "Europe Server #";

	
	// Constructors
	
	public RequestProcessor() {

		// Set default array values
		this.activeGameLobbys = new ArrayList<GameLobby>();
		this.activeSessions = new ArrayList<Session>();
		this.gameMaps = new ArrayList<GameStaticMap>();

		// Create game maps
		this.gameMaps.add(new GameStaticMap("1", "Hunting Ground", 2, 8, 6,
				new int[] {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}));
		this.gameMaps.add(new GameStaticMap("2", "Omaga Beach", 2, 8, 6,
				new int[] {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}));
		this.gameMaps.add(new GameStaticMap("3", "Pearl Harbour", 4, 8, 6,
				new int[] {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}));

		// Construct DB link
		this.dao = new EntityManager(PERSISTENCE_UNIT);

		// Setup sessions and sockets
		initialiseSessionCleanUp();
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
	
	public GameplayResponse processGameplayRequest(GameplayRequest gameplayRequest, String sessionId) {
		GameLobby gameLobby = this.getGameLobbyFromSocketSessionId(sessionId);
		User user = this.getUserFromSocketSessionId(sessionId);
		if (gameLobby != null && user != null) {
			System.out.println("Game lobby exists.");
			GameplayResponse gameplayResponse = gameLobby.processGameplayRequest(gameplayRequest, user.getId());
			return gameplayResponse;
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
		GameLobby gameLobby = this.getGameLobbyFromLobbyId(gameJoinResponse.getLobbyId());
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

	public boolean isSessionAuthenticated(String sessionId) {
		boolean authenticated = false;

		for (Session s : activeSessions) {
			if (s.getSessionId() == sessionId) {
				s.extendSessionExpiry();
				authenticated = true;
				break;
			}
		}

		return authenticated;
	}

	public int authenticate(String sessionId, AuthRequest authRequest) {
		int response = 401;
		User user = dao.authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());

		if (user != null) {
			boolean userLoggedIn = false;

			for (Session s : activeSessions) {
				if (s.getUser().getUsername().equals(user.getUsername())) {
					userLoggedIn = true;
					break;
				}
			}

			if (!userLoggedIn) {
				addNewSession(sessionId, user);
				response = 200;
			} else {
				response = 409;
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

	public void removeLobbyUserAndDeleteLobbyIfEmpty (String sessionId) {
		GameLobby gameLobby = getGameLobbyFromSocketSessionId(sessionId);
		int userId = getUserFromSocketSessionId(sessionId).getId();
		gameLobby.removeLobbyUser(userId);

		if (gameLobby.getConnectedLobbyUsers().size() == 0) {
			this.deleteGameLobby(gameLobby.getLobbyId());
		}
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
			if (session.getUser().getUsername().equals(username)) {
				session.bindSocketSessionId(socketSessionId);
			}
		}
	}

	public User getUserFromSocketSessionId(String sessionId) {
		for (Session session : activeSessions) {
			if (session.getSocketSessionId().equals(sessionId)) {
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
		this.sessionCleanUp = new Runnable() {
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
		this.sessionCleanUpThread.start();
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
