package com.majaro.gridwars.game;

import java.lang.Math;

public class Grid {
	
	// Define local enumerands
	private enum GridSquareType { PLAYER_OWNED, NEUTRAL }
	
	// - Hold information as to whether the square can be built on or is neutral
	private class GridSquare {
		private GridSquareType gridSquareType;
	}
	
	private int width = 0;
	private int height = 0;
	private GridSquare[] gridSquare = null;
	
	public Grid(int mapWidth, int mapHeight) {
		
		// Generate player zones in map
		int playerZoneWidth = (int) Math.floor(mapWidth / 3);
		for (int yIndex = 0; yIndex < mapHeight; yIndex ++) {
			for (int xIndex = 0; xIndex < mapWidth; xIndex ++) {
				
			}
		}
		
		
		System.out.println(playerZoneWidth);
		
	}
	
}

