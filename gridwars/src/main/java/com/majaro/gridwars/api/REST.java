package com.majaro.gridwars.api;

import javax.ws.rs.Path;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.AuthRequest;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

@Produces("application/json")
@Path("/")
public class REST {
	private final RequestProcessor requestProcessor = new RequestProcessor();
	
	@Context private HttpServletRequest request;
	
	@POST
	@Path("/auth")
	public Response Authenticate(AuthRequest authRequest) {
		String sessionId = request.getSession(true).getId();
		
		if(!requestProcessor.isSessionAuthenticated(sessionId)) {
			boolean authenticated = requestProcessor.authenticate(sessionId, authRequest);
			return Response.status(authenticated ? 200 : 401).build();
		} else {
			return Response.status(200).build();
		}
	}
	
	@GET
	@Path("/session")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response getSession() {
		String sessionId = request.getSession(true).getId();
		return Response.ok(sessionId).build();
	}
	
	@GET
	@Path("/helloworld")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response HelloWorld() {
		String helloWorld = "Hello World!";
		return Response.ok(helloWorld).build();
	}
}
