package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameObject;

public final class Const {
	
	// Gameplay request codes
	public enum E_GameplayRequestCode { 
		
		// Common request codes
		UNKNOWN("UNKNOWN"),
		
		// Purchasing request codes
		NEW_BUILDING("NEW_BUILDING"), NEW_UNIT("NEW_UNIT"),
		
		// Unit attacking request codes
		UNIT_ATTACK_XY("UNIT_ATTACK_XY"), UNIT_ATTACK_UNIT("UNIT_ATTACK_UNIT"), UNIT_ATTACK_BUILDING("UNIT_ATTACK_BUILDING"),
		
		// Defence attacking request codes
		DEFENCE_ATTACK_XY("DEFENCE_ATTACK_XY"), DEFENCE_ATTACK_UNIT("DEFENCE_ATTACK_UNIT"), DEFENCE_ATTACK_BUILDING("DEFENCE_ATTACK_BUILDING");

		// Object methods and fields
		private String altName = "";
		private E_GameplayRequestCode(String altName) {
			this.altName = altName;
		}
		public String toString() { return this.altName; }
	}
	
	// Gameplay response codes
	public enum E_GameplayResponseCode { 
		
		// Common response codes
		GENERIC_UNKNOWN_ERROR("GENERIC_UNKNOWN_ERROR"), MISSING_REQUIRED_PARAMS("MISSING_REQUIRED_PARAMS"), SERVER_ERROR("SERVER_ERROR"),
		
		// Purchasing attempt errors
		INSUFFICIENT_TECH_LEVEL("INSUFFICIENT_TECH_LEVEL"), INSUFFICIENT_FUNDS("INSUFFICIENT_FUNDS"),
	
		// Building response codes
		NEW_BUILDING("NEW_BUILDING"), STATIC_MAP_OBSTRUCTION("STATIC_MAP_OBSTRUCTION"), DYNAMIC_MAP_OBSTRUCTION("DYNAMIC_MAP_OBSTRUCTION"), 
		DEFENCE_ATTACK_XY("DEFENCE_ATTACK_XY"),
		
		// Unit response codes
		WAYPOINT_PATH_COORDS("WAYPOINT_PATH_COORDS"), UNIT_ATTACK_XY("UNIT_ATTACK_XY");
		
		// Object methods and fields
		private String altName = "";
		private E_GameplayResponseCode(String altName) {
			this.altName = altName;
		}
		public String toString() { return this.altName; }
	}

	// Player colours
	public static final String[] COLOURS = {"blue", "red", "purple", "green", "red", "cyan"};	

	// Static enumerands
	public static enum E_GameType { UNDEFINED, FREE_FOR_ALL, TEAM_ALLIANCE }
	public static enum E_TechLevel { TECH_01, TECH_02, TECH_03 }

	
	
	// Root game object for all buyable items to extend from
	public static class GameObject {
		
		// Core variables
		protected String identifier;
		protected int health;
		protected int cost;
		protected E_TechLevel techlv;
		
		// Constructor
		public GameObject(String identifier, int health, int cost, E_TechLevel techlv) {
			this.identifier = identifier;
			this.health = health;
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
		public int getHealth() { return this.health; }
		public int getCost() { return this.cost; }
		public E_TechLevel getTechLv() { return this.techlv; }

		// Debugging methods
		public String toString() {
			return this.identifier + " " + Integer.toString(this.cost) + " " + this.techlv.toString();
		}
		
	}
	
	// Units in game     [identifier, health, cash, techlv | speed, ]
	public static class GameUnit extends GameObject {

		// Unit variables
		protected int speed;
		
		// Constructors
		public GameUnit(String identifier, int health, int cost, E_TechLevel techlv, int speed) {
			super(identifier, health, cost, techlv);
			this.speed = speed;
		}
		public GameUnit(GameUnit source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getSpeed());
		}
		
		// Getters
		public int getSpeed() { return this.speed; }
		
	}
	
	// Buildings in game [identifier, health, cash, techlv | power, ]
	public static class GameBuilding extends GameObject {

		// Building variables
		protected int power;
		
		// Constructors
		public GameBuilding(String identifier, int health, int cost, E_TechLevel techlv, int power) {
			super(identifier, health, cost, techlv);
			this.power = power;
		}
		public GameBuilding(GameBuilding source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getPower());
		}
		
		// Getters
		public int getPower() { return this.power; }
		
	}

	// Defences in game  [identifier, health, cash, techlv | power, | range, damage, ]
	public static class GameDefence extends GameBuilding {

		// Building variables
		private int range;
		private int damage;
		
		// Constructors
		public GameDefence(String identifier, int health, int cost, E_TechLevel techlv, int power, int range, int damage) {
			super(identifier, health, cost, techlv, power);
			this.range = range;
			this.damage = damage;
		}
		public GameDefence(GameDefence source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getPower(), source.getRange(), source.getDamage());
		}
		
		// Getters
		public int getRange() { return this.range; }
		public int getDamage() { return this.damage; }
		
	}
	
	
	
	// Buildings in game
	public static final GameBuilding[] BUILDINGS = {
			new GameDefence("TURRET", 1000, 500, E_TechLevel.TECH_01, 2, 5, 1)
		};

	// Units in game
	public static final GameUnit[] UNITS = {
			new GameUnit("TANK", 1000, 400, E_TechLevel.TECH_01, 2)
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
	public static GameBuilding[] getGameBuildingArrayFromGameObjectArrayList(ArrayList<GameObject> sourceArray) {
		ArrayList<GameBuilding> result = new ArrayList<GameBuilding>();
		for (GameObject gameObject : sourceArray) {
			if (gameObject instanceof GameBuilding) {
				result.add((GameBuilding) gameObject);
			}
		}
		return result.toArray(new GameBuilding[result.size()]);
	}
	public static GameDefence[] getGameDefenceArrayFromGameObjectArrayList(ArrayList<GameObject> sourceArray) {
		ArrayList<GameDefence> result = new ArrayList<GameDefence>();
		for (GameObject gameObject : sourceArray) {
			if (gameObject instanceof GameDefence) {
				result.add((GameDefence) gameObject);
			}
		}
		return result.toArray(new GameDefence[result.size()]);
	}
	public static String[] getIdentifierArrayFromGameObjectList(ArrayList<GameObject> source, boolean keepErroneous) {
		ArrayList<String> resultList = new ArrayList<String>();
		if (source != null) {
			String identifier = null;
			for (GameObject gameObject : source) {
				identifier = gameObject.getIdentifier();
				if (identifier != null || keepErroneous) {
					resultList.add(identifier);
				}
			}
		}
		return resultList.toArray(new String[resultList.size()]);
	}

	
}