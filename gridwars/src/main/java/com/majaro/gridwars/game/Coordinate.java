package com.majaro.gridwars.game;

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
	public int getCol() { return this.col; }
	public int getRow() { return this.row; }
	
	// Comparison methods
	public boolean equals(Coordinate compareCoord) {
		return (this.col == compareCoord.col &&
				this.row == compareCoord.row);
	}
}