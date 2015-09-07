package com.majaro.gridwars.game;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Constants.E_GameBuilding;

public class BuildingObject {
	
	// Core building object variables
	private int cellX = 0;
	private int cellY = 0;
	private E_GameBuilding buildingId;
	
	public BuildingObject(int cellX, int cellY, E_GameBuilding buildingId, User user) {
		this.cellX = cellX;
		this.cellY = cellY;
		this.buildingId = buildingId;
	}

}
