package com.majaro.gridwars.game;

public final class Const {

	// Gameplay response codes
	public enum E_GameplayResponseCode { 
		
		// Common response codes
		GENERIC_UNKNOWN_ERROR("GENERIC_UNKNOWN_ERROR"), MISSING_REQUIRED_PARAMS("MISSING_REQUIRED_PARAMS"),
		
		// Purchasing attempt errors
		INSUFFICIENT_TECH_LEVEL("INSUFFICIENT_TECH_LEVEL"), INSUFFICIENT_FUNDS("INSUFFICIENT_FUNDS"),
	
		// Building response codes
		NEW_BUILDING("NEW_BUILDING"), STATIC_MAP_OBSTRUCTION("STATIC_MAP_OBSTRUCTION"), DYNAMIC_MAP_OBSTRUCTION("DYNAMIC_MAP_OBSTRUCTION");
		
		// Unit response codes
		
		
		// Object methods and fields
		private String altName = "";
		private E_GameplayResponseCode(String altName) {
			this.altName = altName;
		}
		public String toString() { return this.altName; }
	}

	// Gameplay request codes
	public enum E_RequestCode { UNKNOWN, NEW_BUILDING, NEW_UNIT }
	
	// Player colours
	public static final String[] COLOURS = {"blue", "red", "yellow", "orange", "green", "pink"};	

	// Static enumerands
	public static enum E_GameType { UNDEFINED, FREE_FOR_ALL, TEAM_ALLIANCE }
	public static enum E_TechLevel { TECH_01, TECH_02, TECH_03 }

	
	
	// Root game object for all buyable items to extend from
	public static class GameObject {
		
		// Core variables
		private String identifier;
		private int cost;
		private E_TechLevel techlv;
		
		// Constructor
		public GameObject(String identifier, int cost, E_TechLevel techlv) {
			this.identifier = identifier;
			this.cost = cost;
			this.techlv = techlv;
		}
		
		// Quick value checkers
		public boolean validFromTechLevel(E_TechLevel checkTechLv) {
			if (checkTechLv == E_TechLevel.TECH_01) {
				return (this.techlv == E_TechLevel.TECH_01);
			} else if (checkTechLv == E_TechLevel.TECH_02) {
				return (this.techlv == E_TechLevel.TECH_01 ||
						this.techlv == E_TechLevel.TECH_02);
			} else if (checkTechLv == E_TechLevel.TECH_03) {
				return (this.techlv == E_TechLevel.TECH_01 ||
						this.techlv == E_TechLevel.TECH_02 ||
						this.techlv == E_TechLevel.TECH_03);
			}
			return false;
		}
		
		// Getters
		public String getIdentifier() { return this.identifier; }
		public int getCost() { return this.cost; }
		public E_TechLevel getTechLv() { return this.techlv; }

		// Debugging methods
		public String toString() {
			return this.identifier + " " + Integer.toString(this.cost) + " " + this.techlv.toString();
		}
		
	}
	
	// Units in game [identifier, cash, techlv | speed, ]
	public static final class GameUnit extends GameObject {

		// Unit variables
		private int speed;
		
		// Constructors
		public GameUnit(String identifier, int cost, E_TechLevel techlv, int speed) {
			super(identifier, cost, techlv);
			this.speed = speed;
		}
		public GameUnit(GameUnit source) {
			this(source.getIdentifier(), source.getCost(), source.getTechLv(), source.getSpeed());
		}
		
		// Getters
		public int getSpeed() { return this.speed; }
		
	}
	
	// Buildings in game [identifier, cash, techlv | power, ]
	public static class GameBuilding extends GameObject {

		// Building variables
		private int power;
		
		// Constructors
		public GameBuilding(String identifier, int cost, E_TechLevel techlv, int power) {
			super(identifier, cost, techlv);
			this.power = power;
		}
		public GameBuilding(GameBuilding source) {
			this(source.getIdentifier(), source.getCost(), source.getTechLv(), source.getPower());
		}
		
		// Getters
		public int getPower() { return this.power; }
		
	}

	// Defences in game [identifier, cash, techlv | power, 
	public static class GameDefence extends GameBuilding {

		// Building variables
		private double range;
		private double damage;
		
		// Constructors
		public GameDefence(String identifier, int cost, E_TechLevel techlv, int power, double range, double damage) {
			super(identifier, cost, techlv, power);
			this.range = range;
			this.damage = damage;
		}
		public GameDefence(GameDefence source) {
			this(source.getIdentifier(), source.getCost(), source.getTechLv(), source.getPower(), source.getRange(), source.getDamage());
		}
		
		// Getters
		public double getRange() { return this.range; }
		public double getDamage() { return this.damage; }
		
	}
	
	
	
	// Buildings in game
	public static final GameBuilding[] BUILDINGS = {
			new GameDefence("TURRET", 0, E_TechLevel.TECH_01, 2, 5.0, 1.0)
		};

	// Units in game
	public static final GameUnit[] UNITS = {
			new GameUnit("TANK", 0, E_TechLevel.TECH_01, 2)
		};
	
	
	
	// Utility methods
	public static GameObject getGameObjectFromString(String source) {
		
		// Search through buildings
		for (GameObject building : BUILDINGS) {
			if (source.equals(building.identifier)) {
				return building;
			}
		}
		
		// Search through units
		for (GameObject unit : UNITS) {
			if (source.equals(unit.identifier)) {
				return unit;
			}
		}		
		
		// Return erroneous result
		return null;
	}
	
}