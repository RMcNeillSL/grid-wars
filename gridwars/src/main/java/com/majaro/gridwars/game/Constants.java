package com.majaro.gridwars.game;

public class Constants {
	
	// Game types
	public enum E_GameType { UNDEFINED, FREE_FOR_ALL, TEAM_ALLIANCE }
	
	// Gameplay response codes
	public enum E_GameplayResponseCode { GENERIC_UNKNOWN_ERROR }

	// Gameplay request codes
	public enum E_RequestCode { NEW_BUILDING }
	
	// Game building codes
	public enum E_GameBuilding { TURRET }

	// Player colours
	public static final String[] COLOURS = {"blue", "red", "yellow", "orange", "green", "pink"};
	

}