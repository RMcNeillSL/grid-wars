package com.majaro.gridwars.apiobjects;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.game.Constants.E_GameType;

public class GameJoinResponse {
	
	// Set getter reference objects
	private GameLobby sourceGameLobby = null;
	
	// Set setter variables
	private String lobbyId = null;
	private String mapId = null;
	private int maxPlayers = -1;
	private int mapMaxPlayers = -1;
	private E_GameType gameType = E_GameType.UNDEFINED;

	
	// Constructors
	public GameJoinResponse(GameLobby sourceGameLobby) {
		this.sourceGameLobby = sourceGameLobby;
	}

	
	// Getters for summary view
	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getLobbyId() { return this.sourceGameLobby.getLobbyId(); }
	@JsonView(GameJoinResponse.Views.Summary.class)
	public String getMapId() { return this.sourceGameLobby.getGameConfig().getMapId(); }
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getMaxPlayers() { return this.sourceGameLobby.getGameConfig().getMaxPlayers(); }
	@JsonView(GameJoinResponse.Views.Summary.class)
	public int getMapMaxPlayers() { return this.sourceGameLobby.getGameConfig().getMapMaxPlayers(); }	
	@JsonView(GameJoinResponse.Views.Summary.class)
	public E_GameType getGameType() { return this.sourceGameLobby.getGameConfig().getGameType(); }


	// Setters for request passing
	public void setLobbyId(String lobbyId) { this.lobbyId = lobbyId; }
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
