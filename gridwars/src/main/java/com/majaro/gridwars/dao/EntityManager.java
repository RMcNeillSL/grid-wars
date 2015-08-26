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
	
	public int Authenticate(String usernameAttempt, String passwordAttempt) {
		int userId = -1;
		EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnit);
		javax.persistence.EntityManager em = emf.createEntityManager();
		
		try {
			User user;
			em.getTransaction().begin();
			Query query = em.createQuery("SELECT username, password, salt WHERE username = :user");
			query.setParameter("user", usernameAttempt);
			user = (User)query.getSingleResult(); 
			em.getTransaction().commit();
			
			userId = user != null && user.validateCredentials(passwordAttempt) ?
					user.getId() : -1;
		}
		finally {
			em.close();
			emf.close();
		}
		
		return userId;
	}
}
