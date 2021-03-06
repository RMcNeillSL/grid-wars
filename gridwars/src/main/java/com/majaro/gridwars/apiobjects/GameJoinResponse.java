package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Const.E_GameType;

public class GameJoinResponse {
	
	// Set getter reference objects
	private GameLobby sourceGameLobby = null;
	private LobbyUser lobbyUser = null;
	
	// Set setter variables
	private String lobbyId = null;
	private String lobbyName = null;
	private String mapId = null;
	private String mapName = null;
	private int maxPlayers = -1;
	private int mapMaxPlayers = -1;
	private E_GameType gameType = E_GameType.UNDEFINED;
	private int startingCash = -1;
	private int gameSpeed = -1;
	private int unitHealth = -1;
	private int buildingHealth = -1;
	private int turretHealth = -1;
	private boolean randomCrates = false;
	private boolean redeployableMCV = false;
	
	private int factionId = 0;
	private int playerNumber;
	private String playerColour;
	private int playerTeam;
	private boolean ready = false;

	
	// Constructors
	public GameJoinResponse() {}
	public GameJoinResponse(GameLobby sourceGameLobby, LobbyUser user) {
		super();
		this.sourceGameLobby = sourceGameLobby;
		this.lobbyUser = lobbyUser;
	}
	
	// Getters for summary view
	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getLobbyId() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getLobbyId(); 
		} else if (this.sourceGameLobby == null && this.lobbyId != null) {
			return this.lobbyId;
		}
		return "";
	}

	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getLobbyName() { return this.sourceGameLobby.getLobbyName(); }

	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getMapId() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getMapId();
		} else if (this.sourceGameLobby == null && this.mapId != null) {
			return this.mapId;
		}
		return "";
	}
	
	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getMapName() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getMapName();
		} else if (this.sourceGameLobby == null && this.mapName != null) {
			return this.mapName;
		}
		return "";
	}

	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getMaxPlayers() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getMaxPlayers(); 
		} else if (this.sourceGameLobby == null && this.maxPlayers != -1) {
			return this.maxPlayers;
		}
		return -1;
	}

	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getPlayerCount() { return this.sourceGameLobby.getPlayerCount(); }
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getMapMaxPlayers() { return this.sourceGameLobby.getGameConfig().getMapMaxPlayers(); }	

	public int getFactionId() {
		return factionId;
	}
	public int getPlayerNumber() {
		return playerNumber;
	}
	public String getPlayerColour() {
		return playerColour;
	}
	public int getPlayerTeam() {
		return playerTeam;
	}
	public boolean isReady() {
		return ready;
	}

	@JsonView(GameJoinResponse.Views.Summary.class)
	public E_GameType getGameType() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getGameType(); 
		} else if (this.sourceGameLobby == null && this.gameType != null) {
			return this.gameType;
		}
		return E_GameType.UNDEFINED;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getStartingCash() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getStartingCash();
		} else if (this.sourceGameLobby == null && this.startingCash != -1) {
			return this.startingCash;
		}
		return -1;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getGameSpeed() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getGameSpeed();
		} else if (this.sourceGameLobby == null && this.gameSpeed != -1) {
			return this.gameSpeed;
		}
		return -1;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getUnitHealth() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getUnitHealth();
		} else if (this.sourceGameLobby == null && this.unitHealth != -1) {
			return this.unitHealth;
		}
		return -1;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getBuildingHealth() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getBuildingHealth();
		} else if (this.sourceGameLobby == null && this.buildingHealth != -1) {
			return this.buildingHealth;
		}
		return -1;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getTurretHealth() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getTurretHealth();
		} else if (this.sourceGameLobby == null && this.turretHealth != -1) {
			return this.turretHealth;
		}
		return -1;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public boolean isRandomCrates() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().isRandomCrates();
		}
		return this.randomCrates;
	}
	@JsonView(GameJoinResponse.Views.Summary.class)
	public boolean isRedeployableMCV() {
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().isRedeployableMCV();
		}
		return this.redeployableMCV;
	}


	// Setters for request passing
	public void setLobbyId(String lobbyId) { this.lobbyId = lobbyId; }
	public void setLobbyName(String lobbyName) { this.lobbyName = lobbyName; }
	public void setMapId(String mapId) { this.mapId = mapId; }
	public void setMaxPlayers(int maxPlayers) { this.maxPlayers = maxPlayers; }
	public void setMapMaxPlayers(int mapMaxPlayers) { this.mapMaxPlayers = mapMaxPlayers; }
	public void setGameType(E_GameType gameType) { this.gameType = gameType; }
	public void setFactionId(int factionId) { this.factionId = factionId; }
	public void setPlayerColour(String playerColour) { this.playerColour = playerColour; }
	public void setPlayerTeam(int playerTeam) { this.playerTeam = playerTeam; }
	public void setReady(boolean ready) { this.ready = ready; }
	public void setStartingCash(int startingCash) { this.startingCash = startingCash; }
	public void setGameSpeed(int gameSpeed) { this.gameSpeed = gameSpeed; }
	public void setUnitHealth(int unitHealth) { this.unitHealth = unitHealth; }
	public void setBuildingHealth(int buildingHealth) { this.buildingHealth = buildingHealth; }
	public void setTurretHealth(int turretHealth) { this.turretHealth = turretHealth; }
	public void setRandomCrates(boolean randomCrates) { this.randomCrates = randomCrates; }
	public void setRedeployableMCV(boolean redeployableMCV) { this.redeployableMCV = redeployableMCV; }

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}

}
