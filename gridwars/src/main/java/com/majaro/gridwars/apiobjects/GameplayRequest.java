package com.majaro.gridwars.apiobjects;

import com.majaro.gridwars.game.Constants.E_RequestCode;

public class GameplayRequest {
	
	// Core request variables
	private E_RequestCode requestCode; 
	
	// Constructors
	public GameplayRequest() { }
	public GameplayRequest(E_RequestCode requestCode) {
		this.setRequestCode(requestCode);
	}
	
	// Getters and setters for socket objects
	public E_RequestCode getRequestCode() { return requestCode; }
	public void setRequestCode(E_RequestCode requestCode) { this.requestCode = requestCode; }

}
