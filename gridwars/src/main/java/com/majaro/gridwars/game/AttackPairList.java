package com.majaro.gridwars.game;

import java.util.ArrayList;

import com.majaro.gridwars.game.AttackPairList.AttackPair;

public class AttackPairList {

	// Attack pair objects
	public class AttackPair {
		private String sourceInstanceId = null;
		String targetInstanceId = null;
		public AttackPair(String sourceInstanceId, String targetInstanceId) {
			this.sourceInstanceId = sourceInstanceId;
			this.targetInstanceId = targetInstanceId;
		}
		public boolean containsInstanceId(String checkInstanceId) {
			return (checkInstanceId.equals(this.sourceInstanceId) ||
					checkInstanceId.equals(this.targetInstanceId));
		}
		public String getSourceInstanceId() { return this.sourceInstanceId; }
		public String getTargetInstanceId() { return this.targetInstanceId; }
	}
	
	// Arraylist variables
	private ArrayList<AttackPair> attackPairs = null;
	private ArrayList<DynGameBuilding> buildingsRef = null;
	private ArrayList<DynGameUnit> unitsRef = null;
	
	// Constructor
	
	public AttackPairList(ArrayList<DynGameBuilding> buildings, ArrayList<DynGameUnit> units) {
		this.attackPairs = new ArrayList<AttackPair>();
		this.buildingsRef = buildings;
		this.unitsRef = units;
	}
	
	
	// Adding / Remove items from arraylist

	public void add(String sourceInstanceId, String targetInstanceId) {
		this.attackPairs.add(new AttackPair(sourceInstanceId, targetInstanceId));
	}
	
	public void removeEither(String instanceId) {
		ArrayList<AttackPair> removeList = new ArrayList<AttackPair>();
		for (AttackPair attackPair : this.attackPairs) {
			if (attackPair.containsInstanceId(instanceId)) {
				removeList.add(attackPair);
			}
		}
		for (AttackPair removeInstanceId : removeList) {
			this.attackPairs.remove(removeInstanceId);
		}
	}
	
	public void removeAttacker(String instanceId) {
		ArrayList<AttackPair> removeList = new ArrayList<AttackPair>();
		for (int index = 0; index < this.attackPairs.size(); index ++) {
			if (this.attackPairs.get(index).getSourceInstanceId().equals(instanceId)) {
				removeList.add(this.attackPairs.get(index));
			}
		}
		for (int index = 0; index < removeList.size(); index ++) {
			this.attackPairs.remove(removeList.get(index));
		}
	}

	
	// Getters

	public String[] getAttackSources(String targetInstanceId) {
		ArrayList<String> sources = new ArrayList<String>();
		for (AttackPair attackPair : this.attackPairs) {
			if (attackPair.getTargetInstanceId().equals(targetInstanceId)) {
				sources.add(attackPair.getSourceInstanceId());
			}
		}
		return sources.toArray(new String[sources.size()]);
	}
	
	public DynGameUnit[] getUnitsAttackingInstance(String instanceId) {
		ArrayList<DynGameUnit> attackingUnits = new ArrayList<DynGameUnit>();
		DynGameUnit attackingUnit = null;
		for (int index = 0; index < this.attackPairs.size(); index ++) {
			if (this.attackPairs.get(index).getTargetInstanceId().equals(instanceId)) {
				attackingUnit = this.getGameUnitFromInstanceId(this.attackPairs.get(index).getSourceInstanceId());
				if (attackingUnit != null) {
					attackingUnits.add(attackingUnit);
				}
			}
		}
		return attackingUnits.toArray(new DynGameUnit[attackingUnits.size()]);
	}
	
	public DynGameDefence[] getDefencesAttackingInstance(String instanceId) {
		ArrayList<DynGameDefence> attackingDefences = new ArrayList<DynGameDefence>();
		DynGameDefence attackingDefence = null;
		for (int index = 0; index < this.attackPairs.size(); index ++) {
			if (this.attackPairs.get(index).targetInstanceId.equals(instanceId)) {
				attackingDefence = this.getGameDefenceFromInstanceId(this.attackPairs.get(index).sourceInstanceId);
				if (attackingDefence != null) {
					attackingDefences.add(attackingDefence);
				}
			}
		}
		return attackingDefences.toArray(new DynGameDefence[attackingDefences.size()]);
	}

	
	// Flag functions
	
	public boolean isAttacking(String instanceId) {
		for (AttackPair attackPair : this.attackPairs) {
			if (attackPair.getSourceInstanceId().equals(instanceId)) {
				return true;
			}
		}
		return false;
	}
	
	
	// Utility methods

	private boolean isAttackingPair(String sourceInstanceId, String targetInstanceId) {
		for (AttackPair attackPair : this.attackPairs) {
			if (attackPair.getSourceInstanceId().equals(sourceInstanceId) &&
					attackPair.getTargetInstanceId().equals(targetInstanceId)) {
				return true;
			}
		}
		return false;
	}

	private DynGameUnit getGameUnitFromInstanceId(String instanceId) {
		for (DynGameUnit dynGameUnit : this.unitsRef) {
			if (dynGameUnit.getInstanceId().equals(instanceId)) {
				return dynGameUnit;
			}
		}
		return null;
	}

	private DynGameDefence getGameDefenceFromInstanceId(String instanceId) {
		for (DynGameBuilding dynGameBuilding : this.buildingsRef) {
			if (dynGameBuilding.getInstanceId().equals(instanceId)) {
				if (dynGameBuilding instanceof DynGameDefence) {
					return (DynGameDefence)dynGameBuilding;
				} else {
					return null;
				}
			}
		}
		return null;
	}

}
