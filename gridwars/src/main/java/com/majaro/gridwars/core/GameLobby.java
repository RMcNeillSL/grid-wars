package com.majaro.gridwars.core;

import java.util.ArrayList;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Constants.E_GameType;
import com.majaro.gridwars.game.Engine;
import com.majaro.gridwars.game.GameConfig;
import com.majaro.gridwars.game.GameStaticMap;

public class GameLobby {
	
	private static final String[] colours = {"blue", "red", "yellow", "orange", "green", "pink"};

	private String lobbyId = "";
	private ArrayList<LobbyUser> connectedUsers;
	private GameConfig gameConfig = null;
	private Engine engine = null;
	private String lobbyName;
	
	// Constructor
	public GameLobby(String lobbyId, User user, GameStaticMap map, String lobbyName) {
		
		// Create core objects
		this.lobbyId = lobbyId;
		this.lobbyName = lobbyName;
		this.gameConfig = new GameConfig(map, E_GameType.FREE_FOR_ALL);
		
		// Link user who created lobby to lobby
		this.connectedUsers = new ArrayList<LobbyUser>();
		this.connectedUsers.add(new LobbyUser(user, 0, "blue", 0));
	}

	// Gameplay methods
	public void initGame() {
		
	}
	public void startGame() {
		
	}
	
	// User management methods
	public LobbyUser addUser(User user) {
		LobbyUser lobbyUser = null;
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			if (this.connectedUsers.get(index).getLinkedUser().getId() == user.getId()) {
				lobbyUser = this.connectedUsers.get(index);
			}
		}
		if (lobbyUser == null) {
			lobbyUser = new LobbyUser(user, this.connectedUsers.size()-1, this.getUnusedColour(), 0);
			this.connectedUsers.add(lobbyUser);
		}
		return lobbyUser;
	}
	public boolean canJoin() {
		return true;
	}
	public boolean includesUser(User checkUser) {
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			if (this.connectedUsers.get(index).getLinkedUser().getId() == checkUser.getId()) {
				return true;
			}
		}
		return false;
	}
	public boolean isLobbyLeader(User checkUser) {
		return (checkUser == this.connectedUsers.get(0).getLinkedUser());
	}
	public void updateUserTeam(int currentUserId, int team) {
		this.getLobbyUser(currentUserId).setPlayerTeam(team);
		this.setAllNotReady();
	}
	public boolean updateUserColour(int currentUserId, String colour) {
		boolean colourUsed = false;

		for (int index = 0; index < this.connectedUsers.size(); index++) {
			if (this.connectedUsers.get(index).getPlayerColour().equalsIgnoreCase(colour)) {
				colourUsed = true;
			}
		}

		if (colourUsed == false) {
			this.getLobbyUser(currentUserId).setPlayerColour(colour);
			this.setAllNotReady();
			return true;
		}
		return false;
	}
	public void updateUserReady(int currentUserId) {
		boolean userReady = this.getLobbyUser(currentUserId).isReady();
		this.getLobbyUser(currentUserId).setReady(!userReady);
	}
	public void setAllNotReady () {
		for (int index = 0; index < this.connectedUsers.size(); index++) {
			this.connectedUsers.get(index).setReady(false);
		}
	}
	public boolean areAllUsersReadyAndUpdate(User user) {
		for (LobbyUser lobbyUser : this.connectedUsers) {
			if (lobbyUser.getLinkedUser().getId() == user.getId()) {
				lobbyUser.markGameAsInitialised();
			} else {
				if (!lobbyUser.isReady()) {
					return false;
				}	
			}
		}
		return true;
	}
	
	// Select an unused colour for the player
	private String getUnusedColour() {
		String result = this.colours[0];
		boolean colourInUse = false;
		for (String colour : this.colours) {
			result = colour;
			colourInUse = false;
			for (int index = 0; index < this.connectedUsers.size(); index ++) {
				if (this.connectedUsers.get(index).getPlayerColour() == result) {
					colourInUse = true;
				}
			}
			if (!colourInUse) { break; }
		}
		return result;
	}

	// Game configuration interaction functions
	public GameConfig getGameConfig() { return this.gameConfig; };
	public void update(GameJoinResponse gameJoinResponse, User user, GameStaticMap map) {
		if (this.gameConfig != null && this.connectedUsers.size() > 0 && this.includesUser(user)) {
			// Update game config if request is sent from the creator
			if(user.getId() == this.connectedUsers.get(0).getLinkedUser().getId())
			{
				this.gameConfig.updateGameConfig(map,
						gameJoinResponse.getMaxPlayers(), 
						gameJoinResponse.getGameType());
			}
		}
	}

	// Getters for summary view
	@JsonView(GameLobby.Views.Summary.class)
	public String getLobbyId() { return this.lobbyId; }
	@JsonView(GameLobby.Views.Summary.class)
	public String getMapId() { return this.gameConfig.getMapId(); }
	@JsonView(GameLobby.Views.Summary.class)
	public int getMaxPlayers() { return this.gameConfig.getMaxPlayers(); }
	@JsonView(GameLobby.Views.Summary.class)
	public int getPlayerCount() { return this.connectedUsers.size(); }
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
			result.add(Integer.toString(this.connectedUsers.get(index).getLinkedUser().getId()));
		}
		return result;
	}
	public LobbyUser getLobbyUser(int userId) {
		ArrayList<LobbyUser> connectedUsers = this.getConnectedLobbyUsers();
		for (int index = 0; index < this.connectedUsers.size(); index++) {
			if (connectedUsers.get(index).getLinkedUser().getId() == userId) {
				return connectedUsers.get(index);
			}
		}
		return null;
	}
	@JsonView(GameLobby.Views.Summary.class)
	public ArrayList<LobbyUser> getConnectedLobbyUsers() {
		return this.connectedUsers;
	}

	// Getters for detail view
	@JsonView(GameLobby.Views.Detailed.class)
	public ArrayList<User> getConnectedUsers() {
		ArrayList<User> users = new ArrayList<User>();
		for (int index = 0; index < this.connectedUsers.size(); index ++) {
			users.add(this.connectedUsers.get(index).getLinkedUser());
		}
		return users;
	}

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
