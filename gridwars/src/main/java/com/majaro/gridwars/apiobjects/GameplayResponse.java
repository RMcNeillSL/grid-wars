package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.game.Const;
import com.majaro.gridwars.game.Const.E_GameplayResponseCode;
import com.majaro.gridwars.game.Const.GameDefence;
import com.majaro.gridwars.game.Const.E_GameplayRequestCode;
import com.majaro.gridwars.game.Const.GameObject;
import com.majaro.gridwars.game.Coordinate;
import com.majaro.gridwars.game.DynGameBuilding;
import com.majaro.gridwars.game.DynGameUnit;

public class GameplayResponse {
	
	// Response variables
	private boolean senderResponseOnly = false;
	private E_GameplayResponseCode responseCode;
	private ArrayList<Coordinate> coords;
	private ArrayList<String> sourceString;
	private ArrayList<String> targetString;
	private ArrayList<String> misc;
		
	// Constructors
	public GameplayResponse() {

		// Construct arrays
		this.coords = new ArrayList<Coordinate>();
		this.sourceString = new ArrayList<String>();
		this.targetString = new ArrayList<String>();
		this.misc = new ArrayList<String>();
		
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
	
	// Single flag function (and flag getters)
	public void flagForSenderOnly() { this.senderResponseOnly = true; }
	public boolean isSenderOnly () { return this.senderResponseOnly; }
	
	// Setters for server
	public void addCoord(int col, int row) {
		this.coords.add(new Coordinate(col, row));
	}
	public void addCoord(Coordinate coord) {
		this.coords.add(coord);
	}
	public void addSource(String sourceString) {
		this.sourceString.add(sourceString);
	}
	public void addTarget(String targetString) {
		this.targetString.add(targetString);
	}
	public void addMisc(String miscString) {
		this.misc.add(miscString);
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
			result[index*2] = this.coords.get(index).getCol();
			result[index*2+1] = this.coords.get(index).getRow();
		}
		return result;
	}
	@JsonView(GameplayResponse.Views.Summary.class)
	public String[] getMisc() {
		String[] result = new String[this.misc.size()];
		for (int index = 0; index < this.misc.size(); index ++) {
			result[index] = this.misc.get(index);
		}
		return result;
	}
	@JsonView(GameplayResponse.Views.Summary.class)
	public String[] getSource() { return this.sourceString.toArray(new String[this.sourceString.size()]); }
	@JsonView(GameplayResponse.Views.Summary.class)
	public String[] getTarget() { return this.targetString.toArray(new String[this.targetString.size()]); }
	
	// Utility methods
	private String[] getInstanceArrayFromDynGameBuildingList(ArrayList<GameObject> dynGameBuildings, boolean keepErroneous) {
		if (dynGameBuildings == null) {
			return null;
		} else {
			ArrayList<String> resultArray = new ArrayList<String>();
			for (GameObject gameObject : dynGameBuildings) {
				if (gameObject instanceof DynGameBuilding) {
					resultArray.add(((DynGameBuilding) gameObject).getInstanceId());
				}
			}
			return resultArray.toArray(new String[resultArray.size()]);
		}
	}
	private String[] getInstanceArrayFromDynGameUnitList(ArrayList<GameObject> dynGameUnits, boolean keepErroneous) {
		if (dynGameUnits == null) {
			return null;
		} else {
			ArrayList<String> resultArray = new ArrayList<String>();
			for (GameObject gameObject : dynGameUnits) {
				if (gameObject instanceof DynGameUnit) {
					resultArray.add(((DynGameUnit) gameObject).getInstanceId());
				}
			}
			return resultArray.toArray(new String[resultArray.size()]);
		}
	}
	
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
		return "Gameplay Response: " + 
			newLine + "Response Code: " + outputString;
	}

}
