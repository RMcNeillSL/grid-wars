package com.majaro.gridwars.apiobjects;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.game.Const.E_GameplayResponseCode;

public class GameplayResponse {
	
	// Response variables
	private E_GameplayResponseCode responseCode;
	
	
	// Constructors
	public GameplayResponse() {
		this.responseCode = E_GameplayResponseCode.GENERIC_UNKNOWN_ERROR;
	}
	public GameplayResponse(E_GameplayResponseCode responseCode) {
		
		// Call default constructor
		this();
		
		// Save passed response code
		this.responseCode = responseCode;
		
		// Format remaining response data
		
	}

	
	// Getters for summary view
	@JsonView(GameplayResponse.Views.Summary.class)
	public E_GameplayResponseCode getResponseCode() {
		return this.responseCode;
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
		return "Gameplay Response: " + outputString;
	}

}
