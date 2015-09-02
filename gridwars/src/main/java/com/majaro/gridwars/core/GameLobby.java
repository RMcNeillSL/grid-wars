package com.majaro.gridwars.core;

import java.util.ArrayList;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Constants.E_GameType;
import com.majaro.gridwars.game.Engine;
import com.majaro.gridwars.game.GameConfig;
import com.majaro.gridwars.game.GameMap;

public class GameLobby {
	
	private static final String[] colours = {"blue", "red", "yellow", "orange", "green", "pink"};
	
	private class LobbyUser {
		
		private int factionId = 0;
		private int playerNumber;
		private String playerColour;
		private int playerTeam;
		private boolean ready = false;
		private User linkedUser = null;
		
		public LobbyUser(User linkedUser, int playerNumber, String playerColour, int playerTeam) {
			this.linkedUser = linkedUser;
			this.playerNumber = playerNumber;
			this.playerColour = playerColour;
			this.playerTeam = playerTeam;
		}
	}

	private String lobbyId = "";
	private ArrayList<LobbyUser> connectedUsers;
	private GameConfig gameConfig = null;
	private Engine engine = null;
	private String lobbyName;
	
	public GameLobby(String lobbyId, User user, GameMap map, String lobbyName) {
		
		// Create core objects
		this.lobbyId = lobbyId;
		this.lobbyName = lobbyName;
		this.gameConfig = new GameConfig(map, E_GameType.FREE_FOR_ALL);
		
		// Link user who created lobby to lobby
		this.connectedUsers = new ArrayList<LobbyUser>();
		this.connectedUsers.add(new LobbyUser(user, 0, "blue", 0));
	}
	
	// Add a new user to the lobby, checking the user is not already present
	public boolean addUser(User user) {
		boolean userExists = false;
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			if (this.connectedUsers.get(index).linkedUser.getId() == user.getId()) {
				userExists = true;
			}
		}
		if (!userExists) {
			this.connectedUsers.add(new LobbyUser(user, this.connectedUsers.size()-1, this.getUnusedColour(), 0));
		}
		return !userExists;
	}
	
	// Select an unused colour for the player
	private String getUnusedColour() {
		String result = this.colours[0];
		boolean colourInUse = false;
		for (String colour : this.colours) {
			result = colour;
			colourInUse = false;
			for (int index = 0; index < this.connectedUsers.size(); index ++) {
				if (this.connectedUsers.get(index).playerColour == result) {
					colourInUse = true;
				}
			}
			if (!colourInUse) { break; }
		}
		return result;
	}

	// Check to see if the lobby can be joined
	public boolean canJoin() {
		return true;
	}
	
	// Check to see if the the lobby includes a user
	public boolean includesUser(User checkUser) {
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			if (this.connectedUsers.get(index).linkedUser.getId() == checkUser.getId()) {
				return true;
			}
		}
		return false;
	}

	// Game configuration interaction functions
	public GameConfig getGameConfig() { return this.gameConfig; };
	
	// Getters for summary view
	@JsonView(GameLobby.Views.Summary.class)
	public String getLobbyId() { return this.lobbyId; }
	@JsonView(GameLobby.Views.Summary.class)
	public String getMapId() { return this.gameConfig.getMapId(); }
	@JsonView(GameLobby.Views.Summary.class)
	public int getMaxPlayers() { return this.gameConfig.getMaxPlayers(); }
	@JsonView(GameLobby.Views.Summary.class)
	public String getMapName() { return this.gameConfig.getMapName(); }
	@JsonView(GameLobby.Views.Summary.class)
	public String getGameType() { return this.gameConfig.getGameType().toString(); }
	@JsonView(GameLobby.Views.Summary.class)
	public String getLobbyName() { return this.lobbyName; }
	@JsonView(GameLobby.Views.Summary.class)
	public ArrayList<String> getConnectedUsersString() {
		ArrayList<String> result = new ArrayList<String>();
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			result.add(Integer.toString(this.connectedUsers.get(index).linkedUser.getId()));
		}
		return result;
	}

	// Getters for detail view
	@JsonView(GameLobby.Views.Detailed.class)
	public ArrayList<User> getConnectedUsers() {
		ArrayList<User> users = null;
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			users.add(this.connectedUsers.get(index).linkedUser);
		}
		return users;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
