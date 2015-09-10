package com.majaro.gridwars.apiobjects;

import java.util.ArrayList;

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
	
	// Constructors
	public GameplayRequest() {
		
		// Construct arrays
		this.source = null;
		this.target = null;
		
		// Set default values
		this.requestCode = E_GameplayRequestCode.UNKNOWN;
		this.targetCellX = -1;
		this.targetCellY = -1;

	}
	public GameplayRequest(E_GameplayRequestCode requestCode, int targetCellX, int targetCellY, String[] sourceString, String[] targetString) {
		
		// Call alternate constructor
		this();
		
		// Save passed data
		this.requestCode = requestCode;
		this.targetCellX = targetCellX;
		this.targetCellY = targetCellY;

		// Construct and Populate source & target
		this.source = generateGameObjectArrayFromString(sourceString, true);
		this.target = generateGameObjectArrayFromString(targetString, true);
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
	public void setSource(String[] sourceString) {this.source = generateGameObjectArrayFromString(sourceString, true);}
	public void setTarget(String[] target) {this.target = generateGameObjectArrayFromString(targetString, true);}
	
	// Getters
	public E_GameplayRequestCode getRequestCode() { return this.requestCode; }
	public int getTargetCellX() { return this.targetCellX; }
	public int getTargetCellY() { return this.targetCellY; }
	public ArrayList<GameObject> getSource() { return this.source; }
	public ArrayList<GameObject> getTarget() { return this.target; }

	// Debugging methods
	public String toString() {
		
		// Declare string objects
		String newLine = System.getProperty("line.separator") + "    ";
		String sourceString = "";
		String targetString = "";
		String outputString = "";

		// Populate source string
		ArrayList<GameObject> tempSource = this.getSource();
		if (tempSource != null && tempSource.size() > 0) {
			for (GameObject gameObject : tempSource) {
				sourceString = sourceString + "(" + gameObject.toString() + "), ";
			}
			sourceString.substring(0, sourceString.length()-2);
		}

		// Populate target string
		ArrayList<GameObject> tempTarget = this.getTarget();
		if (tempTarget != null && tempTarget.size() > 0) {
			for (GameObject gameObject : tempTarget) {
				targetString = targetString + "(" + gameObject.toString() + "), ";
			}
			targetString.substring(0, targetString.length()-2);
		}

		// Compile output string
		outputString = "Gameplay Response:" +
			newLine + "Request Code: " + this.requestCode.toString() +
			newLine + "Target (X,Y): (" + Integer.toString(this.targetCellX) + "," + Integer.toString(this.targetCellY) + ")" +
			newLine + "Source Game Objects: [" + sourceString + "]" +
			newLine + "Target Game Objects: [" + targetString + "]";

		// Return generated response
		return outputString;
	}

}
