package com.majaro.gridwars.game;

import com.majaro.gridwars.entities.User;
import com.majaro.gridwars.game.Const.GameBuilding;

public class DynGameBuilding extends GameBuilding {
	
	// Core building object variables
	private int cellX = 0;
	private int cellY = 0;
	
	public DynGameBuilding(GameBuilding gameBuilding, User user, int cellX, int cellY) {
		super(gameBuilding);
	}

}
