package com.majaro.gridwars.apiobjects;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.game.Constants.E_GameType;

public class GameJoinResponse {
	
	// Set getter reference objects
	private GameLobby sourceGameLobby = null;
	
	// Set setter variables
	private String lobbyId = null;
	private String lobbyName = null;
	private String mapId = null;
	private int maxPlayers = -1;
	private int mapMaxPlayers = -1;
	private E_GameType gameType = E_GameType.UNDEFINED;

	
	// Constructors
	public GameJoinResponse() {}
	public GameJoinResponse(GameLobby sourceGameLobby) {
		super();
		this.sourceGameLobby = sourceGameLobby;
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
	public int getMaxPlayers() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getMaxPlayers(); 
		} else if (this.sourceGameLobby == null && this.maxPlayers != -1) {
			return this.maxPlayers;
		}
		return -1;
	}
	
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getMapMaxPlayers() { return this.sourceGameLobby.getGameConfig().getMapMaxPlayers(); }	
	
	@JsonView(GameJoinResponse.Views.Summary.class)
	public E_GameType getGameType() { 
		if (this.sourceGameLobby != null) {
			return this.sourceGameLobby.getGameConfig().getGameType(); 
		} else if (this.sourceGameLobby == null && this.gameType != null) {
			return this.gameType;
		}
		return E_GameType.UNDEFINED;
	}


	// Setters for request passing
	public void setLobbyId(String lobbyId) { this.lobbyId = lobbyId; }
	public void setLobbyName(String lobbyName) { this.lobbyName = lobbyName; }
	public void setMapId(String mapId) { this.mapId = mapId; }
	public void setMaxPlayers(int maxPlayers) { this.maxPlayers = maxPlayers; }
	public void setMapMaxPlayers(int mapMaxPlayers) { this.mapMaxPlayers = mapMaxPlayers; }
	public void setGameType(E_GameType gameType) { this.gameType = gameType; }

	
	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
