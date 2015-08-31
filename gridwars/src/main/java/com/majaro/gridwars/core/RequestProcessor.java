package com.majaro.gridwars.core;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;

import org.joda.time.DateTime;

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
	
	// Socket objects
	private Configuration config;
	private SocketIOServer server;

	
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
		initSocketConfig();
	}

	
	// Initialisation methods
	
	private void initSocketConfig() {
		try {
			config = new Configuration();
			config.setHostname("localhost");
			config.setPort(81);

			server = new SocketIOServer(config);
			SocketService socketService = new SocketService();
			server.addListeners(socketService);
			server.start();
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
	}

	
	// Managing game lobbies including joining, creating and game info retrieval

	public GameJoinResponse newGame(String sessionId) {

		// Declare/initialise variables
		GameJoinResponse responseConfig = null;

		// Attempt - create new game
		try {

			// Check player isnt already in the lobby
			boolean inGame = false;
			User user = this.getUserFromSessionId(sessionId);
			if (user != null) {
				for (GameLobby gameLobby : this.activeGameLobbys) {
					if (gameLobby.includesUser(user)) {
						inGame = true;
						break;
					}
				}
			}

			// Create new game lobby
			if (user != null && !inGame) {
				GameLobby gameLobby = new GameLobby(GenerateUniqueGameLobbyId(), user, this.gameMaps.get(0));
				responseConfig = new GameJoinResponse(gameLobby);
				this.activeGameLobbys.add(gameLobby);
			}

		} catch (Exception e) {
			responseConfig = null;
		}

		// Return determined response
		return responseConfig;

	}

	public int joinGame(int lobbyId) {

		// Declare/initialise variables
		int ResponseCode = 200;

		// Attempt - join a lobby identified by a given Id
		try {

			for (GameLobby gameLobby : this.activeGameLobbys) {
				if (gameLobby.canJoin()) {

				}
			}

		} catch (Exception e) {
			ResponseCode = 500;
		}

		// Return determined response
		return ResponseCode;

	}

	public ArrayList<GameLobby> listGames() {
		return this.activeGameLobbys;
	}

	public ArrayList<GameMap> listGameMaps() {
		return this.gameMaps;
	}

	
	// Session authentication and management methods

	private void addNewSession(String sessionId, int userId) {
		Session session = new Session(sessionId, userId);
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
		int userId = dao.authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());

		if (userId > -1) {
			boolean userLoggedIn = false;

			for (Session s : activeSessions) {
				if (s.getUserId() == userId) {
					userLoggedIn = true;
					break;
				}
			}

			if (!userLoggedIn) {
				addNewSession(sessionId, userId);
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
	
	public User getUserFromSessionId(String sessionId) {
		int userId = -1;

		for (Session s : activeSessions) {
			if (s.getSessionId() == sessionId) {
				userId = s.getUserId();
				break;
			}
		}

		return dao.getUser(userId);
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
