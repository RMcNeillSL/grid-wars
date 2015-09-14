package com.majaro.gridwars.game;

public class Coordinate {
	private int col;
	private int row;
	public Coordinate(int col, int row) {
		this.col = col;
		this.row = row;
	}
	public int getCol() { return this.col; }
	public int getRow() { return this.row; }
}