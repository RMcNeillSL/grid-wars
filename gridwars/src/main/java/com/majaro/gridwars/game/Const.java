package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.game.Const.GameBuilding;
import com.majaro.gridwars.game.Const.GameObject;

public final class Const {
	
	// Gameplay request codes
	public enum E_GameplayRequestCode {
		
		// Generic request codes
		UNKNOWN("UNKNOWN"), DAMAGE_OBJECT("DAMAGE_OBJECT"), DEBUG_PLACEMENT("DEBUG_PLACEMENT"), OBJECT_ATTACK_OBJECT("OBJECT_ATTACK_OBJECT"),PLAYER_LEAVE_GAME("PLAYER_LEAVE_GAME"),
		
		// Purchasing request codes
		PURCHASE_OBJECT("PURCHASE_OBJECT"), PURCHASE_FINISHED("PURCHASE_FINISHED"),
		
		// Unit request codes
		UNIT_ATTACK_XY("UNIT_ATTACK_XY"), WAYPOINT_PATH_COORDS("WAYPOINT_PATH_COORDS"), WAYPOINT_UPDATE_UNIT_CELL("WAYPOINT_UPDATE_UNIT_CELL"),
		
		// Building/defence request codes
		NEW_BUILDING("NEW_BUILDING"), DEFENCE_ATTACK_XY("DEFENCE_ATTACK_XY"), SELL_BUILDING("SELL_BUILDING");

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
		DAMAGE_OBJECT("DAMAGE_OBJECT"), GENERIC_UNKNOWN_ERROR("GENERIC_UNKNOWN_ERROR"),
		
		// Game setup codes
		SETUP_SPAWN_OBJECTS("SETUP_SPAWN_OBJECTS"),
		
		// Generic attack codes
		OBJECT_ATTACK_OBJECT("OBJECT_ATTACK_OBJECT"), DESTROY_OBJECT("DESTROY_OBJECT"), DEFENCE_ATTACK_XY("DEFENCE_ATTACK_XY"), UNIT_ATTACK_XY("UNIT_ATTACK_XY"),
		
		// Purchasing codes
		PURCHASE_OBJECT("PURCHASE_OBJECT"), UNIT_PURCHASE_FINISHED("UNIT_PURCHASE_FINISHED"), BUILDING_PURCHASE_FINISHED("BUILDING_PURCHASE_FINISHED"),
		PURCHASE_PENDING("PURCHASE_PENDING"), UNIT_BUILDING_INPROGRESS("UNIT_BUILDING_INPROGRESS"), BUILDING_BUILDING_INPROGRESS("BUILDING_BUILDING_INPROGRESS"),
		DEFENCE_BUILDING_INPROGRESS("DEFENCE_BUILDING_INPROGRESS"), INSUFFICIENT_FUNDS("INSUFFICIENT_FUNDS"),
	
		// Building codes
		NEW_BUILDING("NEW_BUILDING"), STATIC_MAP_OBSTRUCTION("STATIC_MAP_OBSTRUCTION"), OUT_OF_MAP_BOUNDS("OUT_OF_MAP_BOUNDS"),
		DYNAMIC_MAP_OBSTRUCTION("DYNAMIC_MAP_OBSTRUCTION"), SELL_BUILDING("SELL_BUILDING"),
		
		// Unit codes
		NEW_UNIT("NEW_UNIT"), WAYPOINT_PATH_COORDS("WAYPOINT_PATH_COORDS");
		
		// Object methods and fields
		private String altName = "";
		private E_GameplayResponseCode(String altName) { this.altName = altName; }
		public String toString() { return this.altName; }
	}

	// Player colours
	public static final String[] COLOURS = {"blue", "red", "purple", "green", "red", "cyan"};	

	// Static enumerands
	public static enum E_GameType { UNDEFINED, FREE_FOR_ALL, TEAM_ALLIANCE }
	public static enum E_TechLevel { TECH_01, TECH_02, TECH_03 }
	
	// Client side cosntants
	public static int cellSize = 100;

	
	
	// Root game object for all buyable items to extend from
	public static class GameObject {
		
		// Core variables
		protected String identifier;
		protected int health;
		protected int cost;
		protected E_TechLevel techlv;
		protected long buildTime;
		protected int sightRange;
		
		// Constructor
 		public GameObject(String identifier, int health, int cost, E_TechLevel techlv, long buildTime, int sightRange) {
			this.identifier = identifier;
			this.health = health;
			this.cost = cost;
			this.techlv = techlv;
			this.buildTime = buildTime;
			this.sightRange = sightRange;
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
		public long getBuildTime() { return this.buildTime; }
		public int getSightRange() { return this.sightRange; }

		// Debugging methods
		public String toString() {
			return this.identifier + " " + Integer.toString(this.cost) + " " + this.techlv.toString();
		}
		
	}
	
	// Units in game     [identifier, health, cash, techlv, buildTime, sightRange | range, speed, damage, ]
	public static class GameUnit extends GameObject {

		// Unit variables
		protected int range;
		protected int speed;
		private int damage;
		
		// Constructors
		public GameUnit(String identifier, int health, int cost, E_TechLevel techlv, long buildTime, int sightRange, int range, int speed, int damage) {
			super(identifier, health, cost, techlv, buildTime, sightRange);
			this.range = range;
			this.speed = speed;
			this.damage = damage;
		}
		public GameUnit(GameUnit source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getBuildTime(), source.getSightRange(), source.getRange(), source.getSpeed(), source.getDamage());
		}
		
		// Getters
		public int getRange() { return this.range; }
		public int getSpeed() { return this.speed; }
		public int getDamage() { return this.damage; }
		
	}
	
	// Buildings in game [identifier, health, cash, techlv, buildTime, sightRange | power, widthCellCount, heightCellCount, ]
	public static class GameBuilding extends GameObject {

		// Building variables
		protected int power;
		protected int widthCellCount;
		protected int heightCellCount;
		
		// Constructors
		public GameBuilding(String identifier, int health, int cost, E_TechLevel techlv, long buildTime, int sightRange, int power, int widthCellCount, int heightCellCount) {
			super(identifier, health, cost, techlv, buildTime, sightRange);
			this.power = power;
			this.widthCellCount = widthCellCount;
			this.heightCellCount = heightCellCount;
		}
		public GameBuilding(GameBuilding source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getBuildTime(), source.getSightRange(), source.getPower(), source.getWidthCellCount(), source.getHeightCellCount());
		}
		
		// Getters
		public int getPower() { return this.power; }
		public int getWidthCellCount() { return this.widthCellCount; }
		public int getHeightCellCount() { return this.heightCellCount; }
		
	}

	// Defences in game  [identifier, health, cash, techlv, buildTime, sightRange | power, widthCellCount, heightCellCount, | range, damage, ]
	public static class GameDefence extends GameBuilding {

		// Building variables
		private int range;
		private int damage;
		
		// Constructors
		public GameDefence(String identifier, int health, int cost, E_TechLevel techlv, long buildTime, int sightRange, int power, int widthCellCount, int heightCellCount, int range, int damage) {
			super(identifier, health, cost, techlv, buildTime, sightRange, power, widthCellCount, heightCellCount);
			this.range = range;
			this.damage = damage;
		}
		public GameDefence(GameDefence source) {
			this(source.getIdentifier(), source.getHealth(), source.getCost(), source.getTechLv(), source.getBuildTime(), source.getSightRange(), source.getPower(), source.getWidthCellCount(), source.getHeightCellCount(), source.getRange(), source.getDamage());
		}
		
		// Getters
		public int getRange() { return this.range; }
		public int getDamage() { return this.damage; }
		
	}
	
	
	
	// Buildings in game
	public static final GameBuilding[] BUILDINGS = {
			//					Name			Health		Cost		Tech Level				Build Time		Sight Range		Power		Width		Height		Range		Damage
			new GameBuilding	("HUB", 		2000, 		5000, 		E_TechLevel.TECH_01, 	3000, 			1100,			2, 			3, 			3),
			new GameDefence		("TURRET", 		500, 		3000, 		E_TechLevel.TECH_01, 	15000, 			700,			2, 			1, 			1, 			400, 		50)
		};

	// Units in game
	public static final GameUnit[] UNITS = {
			//					Name			Health		Cost		Tech Level				Build Time		Sight Range		Range		Speed		Damage
			new GameUnit		("TANK", 		300, 		700, 		E_TechLevel.TECH_01, 	5000, 			700,			400, 		2, 			40)
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
	public static GameBuilding getGameBuildingFromString(String source) {
		for (GameBuilding building : BUILDINGS) {
			if (source.equals(building.identifier)) {
				return building;
			}
		}	
		return null;
	}
	public static GameUnit getGameUnitFromString(String source) {
		for (GameUnit unit : UNITS) {
			if (source.equals(unit.identifier)) {
				return unit;
			}
		}	
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
	public static GameUnit[] getGameUnitArrayFromGameObjectArrayList(ArrayList<GameObject> sourceArray) {
		ArrayList<GameUnit> result = new ArrayList<GameUnit>();
		for (GameObject gameObject : sourceArray) {
			if (gameObject instanceof GameUnit) {
				result.add((GameUnit) gameObject);
			}
		}
		return result.toArray(new GameUnit[result.size()]);
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