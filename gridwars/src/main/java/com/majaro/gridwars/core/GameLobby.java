package com.majaro.gridwars.core;

import java.util.ArrayList;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Engine;

public class GameLobby {
	
	private String lobbyId = "";
	private ArrayList<User> connectedUsers;
	private Engine engine = null;
	
	public GameLobby(String lobbyId, User user) {
		this.lobbyId = lobbyId;
		this.connectedUsers = new ArrayList<User>();
		this.connectedUsers.add(user);
		System.out.println(this.connectedUsers.size());
	}
	
	// Check if a passed user object is already in the lobby
	public boolean addUser(User user) {
		boolean userExists = false;
		for (User compareUser : this.connectedUsers) {
			if (compareUser.getId() == user.getId()) {
				userExists = true;
			}
		}
		if (!userExists) {
			this.connectedUsers.add(user);
		}
		return !userExists;
	}

	// Check to see if the user 
	public boolean canJoin() {
		return true;
	}
	public boolean includesUser(User checkUser) {
		for (User user : this.connectedUsers) {
			if (user.getId() == checkUser.getId()) {
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
		for (User user : this.connectedUsers) {
			result.add(Integer.toString(user.getId()));
		}
		return result;
	}

	@JsonView(GameLobby.Views.Detailed.class)
	public ArrayList<User> getConnectedUsers() {
		for (User user : this.connectedUsers) {
			System.out.println(user);
		}
		return this.connectedUsers;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
