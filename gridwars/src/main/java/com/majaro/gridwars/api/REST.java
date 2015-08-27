package com.majaro.gridwars.api;

import javax.ws.rs.Path;

import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.websocket.server.PathParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jackson.map.annotate.JsonView;

import com.majaro.gridwars.core.AuthRequest;
import com.majaro.gridwars.core.GameLobby;
import com.majaro.gridwars.core.RequestProcessor;
import com.majaro.gridwars.dao.EntityManager;
import com.majaro.gridwars.entities.User;

@Produces("application/json")
@Path("/")
public class REST {
	private final static RequestProcessor requestProcessor = new RequestProcessor();
	
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

	@GET
	@Path("/helloworldauth")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response HelloWorldAuth() {
		if(checkAuth()) {
			String helloWorld = "Hello World!";
			return Response.ok(helloWorld).build();
		} else {
			return Response.status(401).build();
		}
	}
	
	private boolean checkAuth() {
		String sessionId = request.getSession(true).getId();
		return requestProcessor.isSessionAuthenticated(sessionId);
	}
	
	@GET
	@Path("/game/new")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameNew() {
		String sessionId = request.getSession(true).getId();
		int responseCode = requestProcessor.newGame(sessionId);
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}

	@GET
	@Path("/game/list")
	@JsonView(GameLobby.Views.Summary.class)
	public Response GameList() {
		ArrayList<GameLobby> gameLobbys = requestProcessor.listGames();
		return Response.ok(gameLobbys).build();
	}
	
	@GET
	@Path("/game/join{lobbyId}")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameJoin(@PathParam("lobbyId") int lobbyId) {
		int responseCode = requestProcessor.joinGame(lobbyId);
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}

	@GET
	@Path("/game/start")
	@Produces({ MediaType.TEXT_PLAIN })
	public Response GameStart() {
		int responseCode = requestProcessor.startGame();
		if (responseCode == 200) {
			return Response.ok().build();
		} else {
			return Response.status(500).build();
		}
	}
	
}
