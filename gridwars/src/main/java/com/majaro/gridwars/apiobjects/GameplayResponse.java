package com.majaro.gridwars.apiobjects;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.game.Constants.E_ResponseCode;

public class GameplayResponse {
	
	// Response variables
	private E_ResponseCode responseCode;
	
	
	// Constructors
	public GameplayResponse() {
		this.responseCode = E_ResponseCode.GENERIC_UNKNOWN_ERROR;
	}
	public GameplayResponse(E_ResponseCode responseCode) {
		
		// Save passed response code
		this.responseCode = responseCode;
		
		// Format remaining response data
		
	}

	
	// Getters for summary view
	@JsonView(GameplayResponse.Views.Summary.class)
	public E_ResponseCode getResponseCode() {
		return this.responseCode;
	}
	

	// Class views
	public static class Views {
		public static class Summary {}
	}

}
