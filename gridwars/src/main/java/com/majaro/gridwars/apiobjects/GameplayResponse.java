package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.game.Const;
import com.majaro.gridwars.game.Const.E_GameplayResponseCode;
import com.majaro.gridwars.game.Const.E_GameplayRequestCode;
import com.majaro.gridwars.game.Const.GameObject;

public class GameplayResponse {
	
	// Coordinates object
	private class Coordinate {
		private int col;
		private int row;
		public Coordinate(int col, int row) {
			this.col = col;
			this.row = row;
		}
	}
	
	// Response variables
	private E_GameplayResponseCode responseCode;
	private ArrayList<Coordinate> coords;
	private ArrayList<GameObject> source;
	private ArrayList<GameObject> target;
		
	// Constructors
	public GameplayResponse() {

		// Construct arrays
		this.coords = new ArrayList<Coordinate>();
		this.source = new ArrayList<GameObject>();
		this.target = new ArrayList<GameObject>();
		
		// Set default values
		this.responseCode = E_GameplayResponseCode.GENERIC_UNKNOWN_ERROR;

	}
	public GameplayResponse(E_GameplayResponseCode responseCode) {
		
		// Call default constructor
		this();
		
		// Save passed response code
		this.responseCode = responseCode;
		
		// Format remaining response data
		
	}
	
	// Public utility functions
	public Coordinate createGameObject(int col, int row) {
		return new Coordinate(col, row);
	}
	
	// Setters for server
	public void addCoord(int col, int row) {
		this.coords.add(new Coordinate(col, row));
	}
	public void addSource(GameObject gameObject) {
		this.source.add(gameObject);
	}
	public void addTarget(GameObject gameObject) {
		this.target.add(gameObject);
	}
	
	// Getters for summary view
	@JsonView(GameplayResponse.Views.Summary.class)
	public E_GameplayResponseCode getResponseCode() {
		return this.responseCode;
	}
	@JsonView(GameplayResponse.Views.Summary.class)
	public int[] getCoords() {
		int[] result = new int[this.coords.size()*2];
		for (int index = 0; index < this.coords.size(); index ++) {
			result[index*2] = this.coords.get(index).col;
			result[index*2+1] = this.coords.get(index).row;
		}
		return result;
	}
	@JsonView(GameplayResponse.Views.Summary.class)
	public String[] getSource() { return Const.getIdentifierArrayFromGameObjectList(this.source, false); }
	@JsonView(GameplayResponse.Views.Summary.class)
	public String[] getTarget() { return Const.getIdentifierArrayFromGameObjectList(this.target, false); }
	
	// Class views
	public static class Views {
		public static class Summary {}
	}
	
	// To string debug methods
	public String toString() {
		
		// Declare string objects
		String newLine = System.getProperty("line.separator") + "    ";
		String outputString = "";
		
		// Compile output string
		outputString = this.responseCode.toString();
		
		// Return generated response
		return "Gameplay Response: " + outputString;
	}

}
