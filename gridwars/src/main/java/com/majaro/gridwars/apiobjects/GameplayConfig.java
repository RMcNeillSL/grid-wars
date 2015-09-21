package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.LobbyUser;
import com.majaro.gridwars.game.Const;
import com.majaro.gridwars.game.Coordinate;
import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameUnit;
import com.majaro.gridwars.game.GameStaticMap;

public class GameplayConfig {
	
	// Map related variables
	private String mapId = "";
	private int width = 0;
	private int height = 0;
	private int[] cells = null;
	private Coordinate[] spawnCoordinates;
	
	// Player related variables
	private ArrayList<String> userName;
	private ArrayList<String> userColour;
	private ArrayList<Integer> userTeam;
	
	// Game setup preferences
	
	// Game object variables
	private GameBuilding[] gameBuildings;
	private GameUnit[] gameUnits;
	
	// Constructor
	public GameplayConfig(GameLobby gameLobby, GameStaticMap gameStaticMap) {
		
		// Save map related variables
		this.mapId = gameStaticMap.getMapId();
		this.width = gameStaticMap.getWidth();
		this.height = gameStaticMap.getHeight();
		this.cells = gameStaticMap.getCells();
		this.spawnCoordinates = gameStaticMap.getSpawnCoordinates();
		
		// Save user listing variables
		this.userName = new ArrayList<String>();
		this.userColour = new ArrayList<String>();
		this.userTeam = new ArrayList<Integer>();
		
		// Populate user settings
		for (LobbyUser lobbyUser : gameLobby.getConnectedLobbyUsers()) {
			this.userName.add(lobbyUser.getLinkedUser().getUsername());
			this.userColour.add(lobbyUser.getPlayerColour());
			this.userTeam.add(lobbyUser.getPlayerTeam());
		}
		
		// Save game setup preferences
		
		
		// Save constants for buildings and units
		this.gameBuildings = Const.BUILDINGS;
		this.gameUnits = Const.UNITS;
		
	}

	
	// Getters for summary view
	@JsonView(GameplayConfig.Views.Summary.class)
	public String getMapId() {
		return this.mapId;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public int getWidth() {
		return this.width;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public int getHeight() {
		return this.height;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public int[] getCells() {
		return this.cells;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public ArrayList<String> getUserName() {
		return this.userName;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public ArrayList<String> getUserColour() {
		return this.userColour;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public ArrayList<Integer> getUserTeam() {
		return this.userTeam;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public GameBuilding[] getGameBuildings() {
		return this.gameBuildings;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public GameUnit[] getGameUnits() {
		return this.gameUnits;
	}
	@JsonView(GameplayConfig.Views.Summary.class)
	public Coordinate[] getSpawnCoordinates() {
		return this.spawnCoordinates;
	}
	

	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
	
}
