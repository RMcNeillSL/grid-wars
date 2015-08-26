package com.majaro.gridwars.core;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;

import org.joda.time.DateTime;

import com.majaro.gridwars.dao.EntityManager;

public class RequestProcessor {

	private ArrayList<GameLobby> activeGameLobbys;
	private ArrayList<Session> activeSessions;
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao;
	
	public RequestProcessor() {
		this.activeGameLobbys = new ArrayList<GameLobby>();
		this.activeSessions = new ArrayList<Session>();
		this.dao = new EntityManager(PERSISTENCE_UNIT);
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

	public int NewGame() {
		
		// Declare/initialise variables
		int ResponseCode = 200;
		
		// Attempt - create new game 
//		try {
			
			// Create new game lobby
			GameLobby gameLobby = new GameLobby(GenerateUniqueGameLobbyId());
			this.activeGameLobbys.add(gameLobby);
			
//		} catch (Exception e) {
//			ResponseCode = 500;
//		}
//		
		// Return determined response
		return ResponseCode;
		
	}

	public int JoinGame(int lobbyId) {
		
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

	public int StartGame() {
		
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
	
	public ArrayList<GameLobby> ListGames() {
		return this.activeGameLobbys;
	}
	
	private void addNewSession(String sessionId, int userId) {
		Session session = new Session(sessionId, userId);
		this.activeSessions.add(session);
	}
	
	public void extendSessionExpiry(String sessionId) {
		int index = -1;
		
		for(Session s: activeSessions) {
			if(s.sessionId == sessionId) {
				index = activeSessions.indexOf(s);
			}
		}
		
		if(index != -1) {
			activeSessions.get(index).extendSessionExpiry();
		}
	}
	
	public boolean isSessionAuthenticated(String sessionId) {
		boolean exists = false;
		
		for(Session s: activeSessions) {
			if(s.sessionId == sessionId) {
				exists = true;
			}
		}
				
		return exists;
	}
	
	public boolean authenticate(String sessionId, AuthRequest authRequest) {
		int userId = dao.Authenticate(authRequest.getUsernameAttempt(), authRequest.getPasswordAttempt());
		
		if(userId > -1) {
			addNewSession(sessionId, userId);
		}
		
		return userId > -1; 
	}
	
	protected class Session {
		private String sessionId;
		private DateTime sessionExpiry;
		private int userId;
		private static final int MINUTES_UNTIL_TIMEOUT = 15;
		
		public Session(String sessionId, int userId) {
			this.sessionId = sessionId;
			this.userId = userId;
			this.sessionExpiry = new DateTime();
			this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
		}
		
		public String getSessionId() {
			return this.sessionId;
		}
		
		public int getUserId() {
			return this.userId;
		}
		
		public DateTime getSessionExpiry() {
			return this.sessionExpiry;
		}
		
		public void extendSessionExpiry() {
			
			this.sessionExpiry.plusMinutes(MINUTES_UNTIL_TIMEOUT);
		}
	}
}
