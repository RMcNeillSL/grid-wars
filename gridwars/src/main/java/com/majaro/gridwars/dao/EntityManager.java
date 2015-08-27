package com.majaro.gridwars.dao;

import javax.persistence.Persistence;

import com.majaro.gridwars.entities.User;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;
import javax.persistence.TypedQuery;

public class EntityManager implements EntityManagerInterface {
	
	private String persistenceUnit;
	
	public EntityManager(String persistenceUnit) {
		this.persistenceUnit = persistenceUnit;
	}
	
	public int authenticate(String usernameAttempt, String passwordAttempt) {
		int userId = -1;
		EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnit);
		javax.persistence.EntityManager em = emf.createEntityManager();
		
		try {
			User user;
			em.getTransaction().begin();
			String sql = "SELECT u FROM User u WHERE u.username = :user";
			TypedQuery<User> query = em.createQuery(sql, User.class);
			query.setParameter("user", usernameAttempt);
			user = query.getSingleResult();
			em.getTransaction().commit();
			
			userId = user != null && user.validateCredentials(passwordAttempt) ?
					user.getId() : -1;
		}
		catch(Exception e) {
			System.out.println(e.getMessage());
		}
		finally {
			em.close();
			emf.close();
		}
		
		return userId;
	}
	
	// Response 1 = success, 0 = already exists, -1 = server error
	public int register(String newUsername, String newPassword) {
		int response = 500;
		EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnit);
		javax.persistence.EntityManager em = emf.createEntityManager();
		
		try {
			User user;
			em.getTransaction().begin();
			String sql = "SELECT u FROM User u WHERE u.username = :user";
			TypedQuery<User> query = em.createQuery(sql, User.class);
			query.setParameter("user", newUsername);
			int userCount = query.getResultList().size();
			em.getTransaction().commit();
			
			if(userCount == 0) {
				em.getTransaction().begin();
				user = new User();
				user.setUsername(newUsername);
				user.setPassword(newPassword);
				em.persist(user);
				em.getTransaction().commit();
				response = 200;
			} else {
				response = 400;
			}
		}
		catch(Exception e) {
			System.out.println(e.getMessage());
		}
		finally {
			em.close();
			emf.close();
		}
		
		return response;
	}
	
	public User getUser(int userId) {
		User user = null;
		EntityManagerFactory emf = Persistence.createEntityManagerFactory(persistenceUnit);
		javax.persistence.EntityManager em = emf.createEntityManager();
		
		try {
			em.getTransaction().begin();
			user = em.find(User.class, userId);
			em.getTransaction().commit();
		}
		catch(Exception e) {
			System.out.println(e.getMessage());
		}
		finally {
			em.close();
			emf.close();
		}
		
		return user;
	}
}
