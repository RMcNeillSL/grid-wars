package com.majaro.gridwars.core;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;

import org.joda.time.DateTime;

import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

public class RequestProcessor {

	private ArrayList<GameLobby> activeGameLobbys;
	private ArrayList<Session> activeSessions;
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	private Thread sessionCleanUpThread;
	private Runnable sessionCleanUp;
	
	public RequestProcessor() {
		this.activeGameLobbys = new ArrayList<GameLobby>();
		this.activeSessions = new ArrayList<Session>();
		this.dao = new EntityManager(PERSISTENCE_UNIT);
//		 initialiseSessionCleanUp();
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

	public int newGame(String sessionId) {
		
		// Declare/initialise variables
		int ResponseCode = 200;
		
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
				GameLobby gameLobby = new GameLobby(GenerateUniqueGameLobbyId(), user);
				this.activeGameLobbys.add(gameLobby);
			}
			
		} catch (Exception e) {
			ResponseCode = 500;
		}
		
		// Return determined response
		return ResponseCode;
		
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

	public int startGame() {
		
		// Declare/initialise variables
		int ResponseCode = 200;
		
		// Attempt - start a game using the currently connected lobby
		try {
			
		} catch (Exception e) {
			ResponseCode = 500;
		}
		
		// Return determined response
		return ResponseCode;
		
	}
	
	public ArrayList<GameLobby> listGames() {
		return this.activeGameLobbys;
	}
	
	private void initialiseSessionCleanUp() {
		 this.sessionCleanUp = new Runnable() {
			public void run() {
				while(true) {
					if(activeSessions.size() > 0) {
						Iterator<Session> sessionIter = activeSessions.iterator();
						
						while (sessionIter.hasNext()) {
							Session session = sessionIter.next();
							
							if(session.getSessionExpiry().isBeforeNow())
							{
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
	
	private void addNewSession(String sessionId, int userId) {
		Session session = new Session(sessionId, userId);
		this.activeSessions.add(session);
	}
	
	public User getUserFromSessionId(String sessionId) {
		int userId = -1;
		
		for(Session s : activeSessions) {
			if(s.getSessionId() == sessionId) {
				userId = s.getUserId();
				break;
			}
		}
		
		return dao.getUser(userId);
	}
	
	public boolean isSessionAuthenticated(String sessionId) {
		boolean authenticated = false;
		
		for(Session s : activeSessions) {
			if(s.getSessionId() == sessionId) {
				s.extendSessionExpiry();
				authenticated = true;
				break;
			}
		}
				
		return authenticated;
	}
	
	public boolean authenticate(String sessionId, AuthRequest authRequest) {
		int userId = dao.authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());
		
		if(userId > -1) {
			addNewSession(sessionId, userId);
		}
		
		return userId > -1; 
	}
	
	public int register(RegRequest regRequest) {
		return dao.register(regRequest.getNewUsername(), regRequest.getNewPassword());
	}
}
