package com.majaro.gridwars.dao;

import javax.persistence.Persistence;

import com.majaro.gridwars.entities.User;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;

public class EntityManager implements EntityManagerInterface {
	
	private String persistenceUnit;
	
	public EntityManager(String persistenceUnit) {
		this.persistenceUnit = persistenceUnit;
	}
	
	public User getUser(String id) {
		User user;
		EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnit);
		javax.persistence.EntityManager em = emf.createEntityManager();
		
		try {
			em.getTransaction().begin();
			user = em.find(User.class, id);
			em.getTransaction().commit();
		}
		finally {
			em.close();
			emf.close();
		}
		
		return user;
	}
}
