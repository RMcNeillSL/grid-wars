package com.majaro.gridwars.core;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;

import org.joda.time.DateTime;

import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOServer;
import com.majaro.gridwars.api.SocketService;
import com.majaro.gridwars.apiobjects.AuthRequest;
import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.RegRequest;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.GameConfig;
import com.majaro.gridwars.game.GameMap;
import com.majaro.gridwars.game.Constants.E_GameType;

public class RequestProcessor {

	// Game array objects
	private ArrayList<GameLobby> activeGameLobbys;
	private ArrayList<GameMap> gameMaps;
	
	// Session management arrays
	private ArrayList<Session> activeSessions;
	private Thread sessionCleanUpThread;
	private Runnable sessionCleanUp;
	
	// DB interaction objects
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	
	
	// Constructors
	
	public RequestProcessor() {
		
		// Set default array values
		this.activeGameLobbys = new ArrayList<GameLobby>();
		this.activeSessions = new ArrayList<Session>();
		this.gameMaps = new ArrayList<GameMap>();
		
		// Create game maps
		this.gameMaps.add(new GameMap("1", "Hunting Ground", 2));		
		
		// Construct DB link
		this.dao = new EntityManager(PERSISTENCE_UNIT);
		
		// Setup sessions and sockets
		initialiseSessionCleanUp();
		SocketService socketService = new SocketService(this);
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
			
			// Proceed if prerequisits are present
			if (user != null) {

				// Check player isnt already in a lobby
				for (GameLobby gameLobby : this.activeGameLobbys) {
					if (gameLobby.includesUser(user)) {
						inGame = true;
						break;
					}
				}
				
				// Create new game lobby
				if (!inGame) {
					GameLobby gameLobby = new GameLobby(GenerateUniqueGameLobbyId(), user, this.gameMaps.get(0));
					responseConfig = new GameJoinResponse(gameLobby);
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
				gameLobby.addUser(user);
				responseConfig = new GameJoinResponse(gameLobby);
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

	public ArrayList<GameMap> listGameMaps() {
		return this.gameMaps;
	}

	public void updateGameConfig(GameJoinResponse gameJoinResponse) {
		
		// Proceed if gamelobby and gameconfig are found
		GameLobby gameLobby = this.getGameLobbyFromLobbyId(gameJoinResponse.getLobbyId());
		if (gameLobby != null) {
			GameConfig gameConfig = gameLobby.getGameConfig();
			if (gameConfig != null) {
				gameConfig.updateGameConfig(this.getGameMapFromId(gameJoinResponse.getMapId()), 
						gameJoinResponse.getMaxPlayers(), 
						gameJoinResponse.getGameType());
			}
		}
		
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
				if (s.getUser() == user) {
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

	
	// User login and registration methods
	
	public int register(RegRequest regRequest) {
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
			if (session.getSocketSessionId() == sessionId) {
				return session.getUser();
			}
		}
		return null;
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
		System.out.println(lobbyId);
		for (GameLobby gameLobby : this.activeGameLobbys) {
			System.out.println(gameLobby.getLobbyId());
			if (gameLobby.getLobbyId().equals(lobbyId)) {
				return gameLobby;
			}
		}
		return null;
	}
	
	private GameMap getGameMapFromId(String gameMapId) {
		for (GameMap gameMap : this.gameMaps) {
			if (gameMap.getMapId() == gameMapId) {
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
	
}
