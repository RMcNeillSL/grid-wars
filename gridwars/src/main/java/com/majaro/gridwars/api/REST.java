package com.majaro.gridwars.api;

import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

@Produces("application/json")
@Path("/")
public class REST {
	private static final String PERSISTENCE_UNIT = "gridwars";
	private final EntityManager dao = new EntityManager(PERSISTENCE_UNIT);
	
	@GET
	@Path("/helloworld")
	@JsonView(User.Views.Summary.class)
	public Response getHelloWorld() {
		User user = dao.getUser("1");
		return Response.ok(user).build();
	}
}
