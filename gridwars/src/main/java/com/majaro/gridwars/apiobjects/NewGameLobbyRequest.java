package com.majaro.gridwars.apiobjects;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.GameMap;

public class NewGameLobbyRequest {
	private String lobbyId;
	private String mapId;
	private String mapName;
	private int maxPlayers;
	private String gameType;
	private String lobbyName;
	
	public NewGameLobbyRequest() { }
	
	public NewGameLobbyRequest(String lobbyId, String lobbyName, String mapId, int maxPlayers, String gameType, String mapName) {
		super();
		this.setLobbyId(lobbyId);
		this.setLobbyName(lobbyName);
		this.setMapId(mapId);
		this.setMaxPlayers(maxPlayers);
		this.setGameType(gameType);
		this.setMapName(mapName);
	}
	
	public String getLobbyId() {
		return lobbyId;
	}
	
	public String getLobbyName() {
		return lobbyName;
	}
	
	public String getMapId() {
		return mapId;
	}
	
	public String getMapName() {
		return mapName;
	}
	
	public int getMaxPlayers() {
		return maxPlayers;
	}
	
	public String getGameType() {
		return gameType;
	}
	
	public void setLobbyId(String lobbyId) {
		this.lobbyId = lobbyId;
	}
	
	public void setLobbyName(String lobbyName) {
		this.lobbyName = lobbyName;
	}
	
	public void setMapId(String mapId) {
		this.mapId = mapId;
	}
	
	public void setMapName(String mapName) {
		this.mapName = mapName;
	}
	
	public void setMaxPlayers(int maxPlayers) {
		this.maxPlayers = maxPlayers;
	}
	
	public void setGameType(String gameType) {
		this.gameType = gameType;
	}
}
