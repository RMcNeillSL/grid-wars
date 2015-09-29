package com.majaro.gridwars.game;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.game.GameStaticMap.Views.Summary;

public class Coordinate {
	
	// Core variables
	private int col;
	private int row;
	
	// Constructor
	public Coordinate(int col, int row) {
		this.col = col;
		this.row = row;
	}
	
	// Getters
	@JsonView(GameStaticMap.Views.Summary.class)
	public int getCol() { return this.col; }
	@JsonView(GameStaticMap.Views.Summary.class)
	public int getRow() { return this.row; }
	
	// Comparison methods
	public boolean equals(Coordinate compareCoord) {
		return (this.col == compareCoord.col &&
				this.row == compareCoord.row);
	}
	public double distanceTo(Coordinate toCoord) {
		return Math.sqrt(
				(toCoord.getCol() - this.getCol()) * (toCoord.getCol() - this.getCol()) +
				(toCoord.getRow() - this.getRow()) * (toCoord.getRow() - this.getRow()) );
	}
	
	// Class views
	public static class Views {
		public static class Detailed extends Summary {}
		public static class Summary {}
	}
}