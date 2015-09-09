package com.majaro.gridwars.core;

import java.util.ArrayList;

public class GameAndUserInfo {

	// Lobby information
	private String lobbyId = "";
	private ArrayList<LobbyUser> connectedUsers;
	
	// User information
	private int userId;
	private String username;

	public GameAndUserInfo(String lobbyId, int userId, ArrayList<LobbyUser> connectedUsers, String username) {
		// Create core objects
		this.lobbyId = lobbyId;
		this.userId = userId;
		this.connectedUsers = connectedUsers;
		this.username = username;
	}

	public String getLobbyId() {
		return lobbyId;
	}

	public int getUserId() {
		return userId;
	}

	public ArrayList<LobbyUser> getConnectedUsers() {
		return connectedUsers;
	}

	public String getUsername() {
		return username;
	}

}
