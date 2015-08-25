package com.majaro.gridwars.api;

import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

@Produces("application/json")
@Path("/")
public class REST {

	@GET
	@Path("/helloworld")
	public Response getHelloWorld() {
		String helloWorld = "Hello World!";
		return Response.ok(helloWorld).build();
	}
}
