package com.majaro.gridwars.core;

import java.util.ArrayList;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.apiobjects.GameJoinResponse;
import com.majaro.gridwars.apiobjects.GameplayRequest;
import com.majaro.gridwars.apiobjects.GameplayResponse;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Const;
import com.majaro.gridwars.game.Const.E_GameType;
import com.majaro.gridwars.game.Engine;
import com.majaro.gridwars.game.GameConfig;
import com.majaro.gridwars.game.GameStaticMap;

public class GameLobby {
	
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
	public void initGame(GameStaticMap gameMap) {
		
		this.engine = new Engine(this.gameConfig, this.connectedUsers, gameMap);
		
	}
	public void startGame() {
		
		this.engine.start();
		
	}
	public boolean started() {
		return this.engine != null;
	}
	public void lobbyDropUser(int userId) {
		this.engine.dropUser(userId);
	}
	public GameplayResponse[] processGameplayRequest(GameplayRequest gameplayRequest, int userId) {
		return this.engine.processGameplayRequest(gameplayRequest, userId);
	}
	public GameplayResponse setupGameSpawns() {
		return this.engine.setupGameSpawns();
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

	// Game configuration interaction functions
	public GameConfig getGameConfig() { return this.gameConfig; };
	public boolean updateGameConfig(GameJoinResponse gameJoinResponse, User user, GameStaticMap map) {
		if(user.getId() == this.connectedUsers.get(0).getLinkedUser().getId())
		{
			this.gameConfig.updateGameConfig(map,
					gameJoinResponse.getMaxPlayers(), 
					gameJoinResponse.getGameType(),
					gameJoinResponse.getStartingCash(),
					gameJoinResponse.getGameSpeed(),
					gameJoinResponse.getUnitHealth(),
					gameJoinResponse.getBuildingHealth(),
					gameJoinResponse.getTurretHealth(),
					gameJoinResponse.isRandomCrates(),
					gameJoinResponse.isRedeployableMCV());
			return true;
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
	public boolean changeLobbyLeader (int userId, int targetUserId) {
		if(userId == this.connectedUsers.get(0).getLinkedUser().getId()) {
			LobbyUser currentLeader = this.getLobbyUser(userId);
			LobbyUser target = this.getLobbyUser(targetUserId);
			int targetIndex = this.getLobbyUserIndexFromUserId(targetUserId);

			this.connectedUsers.set(0, target);
			this.connectedUsers.set(targetIndex, currentLeader);

			return true;
		}
		return false;
	}
	
	// Game lobby setup methods	
	public boolean checkAllReady () {
		boolean allReady = true;
		for (int index = 1; index < this.connectedUsers.size(); index++) {
			if (this.connectedUsers.get(index).isReady() == false) {
				allReady = false;
			}
		}
		return allReady;
	}

	public void removeLobbyUser (int userId) {
		int index = this.getLobbyUserIndexFromUserId(userId);
		this.connectedUsers.remove(index);
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
	
	
	// Getter methods	
	
	// Select an unused colour for the player
	private String getUnusedColour() {
		String result = Const.COLOURS[0];
		boolean colourInUse = false;
		for (String colour : Const.COLOURS) {
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
	public E_GameType getGameType() { return this.gameConfig.getGameType(); }
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
		for (int index = 0; index < this.connectedUsers.size(); index++) {
			if (this.connectedUsers.get(index).getLinkedUser().getId() == userId) {
				return this.connectedUsers.get(index);
			}
		}
		return null;
	}
	
	private int getLobbyUserIndexFromUserId(int userId) {
		for (int index = 0; index < this.connectedUsers.size(); index++) {
			if (this.connectedUsers.get(index).getLinkedUser().getId() == userId) {
				return index;
			}
		}
		return -1;
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
