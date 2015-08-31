package com.majaro.gridwars.apiobjects;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.game.Constants.E_GameType;

public class GameJoinResponse {
	
	private GameLobby sourceGameLobby = null;
	
	public GameJoinResponse(GameLobby sourceGameLobby) {
		this.sourceGameLobby = sourceGameLobby;
	}
	
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
	
	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
