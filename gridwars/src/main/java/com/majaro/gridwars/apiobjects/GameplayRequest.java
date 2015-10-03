package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;
import java.util.Arrays;

import com.majaro.gridwars.game.Const;
import com.majaro.gridwars.game.Const.E_GameplayRequestCode;
import com.majaro.gridwars.game.Const.GameObject;

public class GameplayRequest {
	
	// Core request variables
	private E_GameplayRequestCode requestCode;
	private int targetCellX;
	private int targetCellY;
	private String[] sourceString;
	private String[] targetString;
	private ArrayList<GameObject> source;
	private ArrayList<GameObject> target;
	private ArrayList<String> misc;
	
	// Constructors
	public GameplayRequest() {
		
		// Construct arrays
		this.source = null;
		this.target = null;
		this.misc = new ArrayList<String>();
		
		// Set default values
		this.requestCode = E_GameplayRequestCode.UNKNOWN;
		this.targetCellX = -1;
		this.targetCellY = -1;

	}
	public GameplayRequest(E_GameplayRequestCode requestCode, int targetCellX, int targetCellY, String[] sourceString, String[] targetString, String[] misc) {
		
		// Call alternate constructor
		this();
		
		// Save passed data
		this.requestCode = requestCode;
		this.targetCellX = targetCellX;
		this.targetCellY = targetCellY;

		// Construct and Populate source & target
		this.sourceString = sourceString;
		this.targetString = targetString;
		this.source = generateGameObjectArrayFromString(sourceString, true);
		this.target = generateGameObjectArrayFromString(targetString, true);
		
		// Populate misc arraylist
		this.misc = new ArrayList<String>(Arrays.asList(misc));
	}
	
	// Utility methods
	private ArrayList<GameObject> generateGameObjectArrayFromString(String[] source, boolean keepErroneous) {
		
		// Construct result
		ArrayList<GameObject> result = new ArrayList<GameObject>();
		
		// Make sure source is valid
		if (source != null) {

			// Populate from string source
			GameObject newObject = null;
			for (String sourceItem : source) {
				newObject = Const.getGameObjectFromString(sourceItem);
				if (newObject != null || keepErroneous) {
					result.add(newObject);
				}
			}
			
		}
		
		// Return processed result
		return result;
		
	}
	
	// Setters
	public void setRequestCode(E_GameplayRequestCode requestCode) { this.requestCode = requestCode; }
	public void setTargetCellX(int targetCellX) { this.targetCellX = targetCellX; }
	public void setTargetCellY(int targetCellY) { this.targetCellY = targetCellY; }

	// Setters
	public void setMisc(String[] misc) { this.misc = new ArrayList<String>(Arrays.asList(misc)); }
	
	// Customise view for source in strings
	public void setSource(String[] sourceString) {
		
		// Save source string
		this.sourceString = sourceString;
		
		// Generate request specific values
		if (this.requestCode == E_GameplayRequestCode.NEW_BUILDING) { this.source = generateGameObjectArrayFromString(this.sourceString, true); }
		if (this.requestCode == E_GameplayRequestCode.DEBUG_PLACEMENT) { this.source = generateGameObjectArrayFromString(this.sourceString, true); }
		
	}

	// Customise view for target in strings
	public void setTarget(String[] targetString) {

		// Save source string
		this.targetString = targetString; 

		// Generate request specific values
		if (this.requestCode == E_GameplayRequestCode.NEW_BUILDING) { this.target = generateGameObjectArrayFromString(this.targetString, true);  }
		
	}
	
	// Getters
	public E_GameplayRequestCode getRequestCode() { return this.requestCode; }
	public int getTargetCellX() { return this.targetCellX; }
	public int getTargetCellY() { return this.targetCellY; }
	public ArrayList<GameObject> getSource() { return this.source; }
	public ArrayList<GameObject> getTarget() { return this.target; }
	public ArrayList<String> getMisc() { return this.misc; }
	public String[] getSourceString() { return this.sourceString; }
	public String[] getTargetString() { return this.targetString; }

	// Debugging methods
	public String toString() {
		
//		// Declare string objects
//		String newLine = System.getProperty("line.separator") + "    ";
//		String sourceString = "";
//		String targetString = "";
//		String outputString = "";
//
//		// Populate source string
//		ArrayList<GameObject> tempSource = this.getSource();
//		if (tempSource != null && tempSource.size() > 0) {
//			for (GameObject gameObject : tempSource) {
//				if (gameObject != null ) {
//					sourceString = sourceString + "(" + gameObject.toString() + "), ";
//				} else {
//					sourceString = sourceString + "(null)";
//				}
//			}
//			sourceString.substring(0, sourceString.length()-2);
//		}
//
//		// Populate target string
//		ArrayList<GameObject> tempTarget = this.getTarget();
//		if (tempTarget != null && tempTarget.size() > 0) {
//			for (GameObject gameObject : tempTarget) {
//				if (gameObject != null ) {
//					targetString = targetString + "(" + gameObject.toString() + "), ";
//				} else {
//					targetString = targetString + "(null)";
//				}
//			}
//			targetString.substring(0, targetString.length()-2);
//		}
//
//		// Compile output string
//		outputString = "Gameplay Request:" +
//			newLine + "Request Code: " + this.requestCode.toString() +
//			newLine + "Target (X,Y): (" + Integer.toString(this.targetCellX) + "," + Integer.toString(this.targetCellY) + ")" +
//			newLine + "Source Game Objects: [" + sourceString + "]" +
//			newLine + "Target Game Objects: [" + targetString + "]";

		// Return generated response
//		return outputString;
		return "Request: " + this.requestCode.toString();
	}

}
