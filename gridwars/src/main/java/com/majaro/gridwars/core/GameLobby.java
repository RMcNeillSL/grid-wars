package com.majaro.gridwars.core;

import java.util.ArrayList;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Engine;
import com.majaro.gridwars.game.GameConfig;

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
	private GameConfig gameConfig = new GameConfig();
	private Engine engine = null;
	
	public GameLobby(String lobbyId, User user) {
		this.lobbyId = lobbyId;
		this.connectedUsers = new ArrayList<LobbyUser>();
		this.connectedUsers.add(new LobbyUser(user, 0, "blue", 0));
		System.out.println(this.connectedUsers.size());
	}
	
	// Check if a passed user object is already in the lobby
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

	// Check to see if the user 
	public boolean canJoin() {
		return true;
	}
	public boolean includesUser(User checkUser) {
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			if (this.connectedUsers.get(index).linkedUser.getId() == checkUser.getId()) {
				return true;
			}
		}
		return false;
	}

	@JsonView(GameLobby.Views.Summary.class)
	public String getLobbyId() { return this.lobbyId; }

	@JsonView(GameLobby.Views.Summary.class)
	public ArrayList<String> getConnectedUsersString() {
		ArrayList<String> result = new ArrayList<String>();
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			result.add(Integer.toString(this.connectedUsers.get(index).linkedUser.getId()));
		}
		return result;
	}

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
