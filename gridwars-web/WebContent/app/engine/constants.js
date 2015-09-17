CONSTANTS = {

	// Misc constants
	SOCKET_SERVER : "ws://" + window.location.host + ":8080/",

	// Socket on events
	SOCKET_REC_TEST_MESSAGE 		: "testMessage",
	SOCKET_REC_CONNECT				: "connect",

	// Server lobby socket on events
	SOCKET_REC_SERVER_LOBBY_UPDATE	: "updateServerLobby",
	SOCKET_REC_REFRESH_GAME_LOBBY	: "refreshGameLobby",

	// Socket emit events
	SOCKET_SEND_TEST_MESSAGE		: "sendTestMessage",

	// Server lobby socket emit events
	SOCKET_SEND_JOIN_SERVER_LOBBY 	: "joinServerLobby",
	SOCKET_SEND_REFRESH_GAME_LOBBY 	: "refreshGameLobby",
	SOCKET_SEND_LEAVE_SERVER_LOBBY 	: "leaveServerLobby",

	// Core properties
	GAME_NAME : "gridwars-engine",
	TILE_WIDTH : 100,
	TILE_HEIGHT : 100,
	
	// Directory locations
	ROOT_SPRITES_LOC : "app/assets/",

	// Loaded image(.png) names
	SPRITE_TURRET : "sprite_turret_anim",
	SPRITE_TANK : "sprite_tank_anim",
	PARTICLE_YELLOW_SHOT : "particle_yellow_shot",

	// Explosion and impact decal images
	SPRITE_IMPACT_DECALS : "impact_decals",
	SPRITE_EXPLOSION_A : "sprite_explosion_a",
	SPRITE_EXPLOSION_B : "sprite_explosion_b",

	// Map tile image references
	MAP_TILE_PLACEMENT : "tile_build",
	MAP_TILE_A : "map_tile_a",
	MAP_TILE_B : "map_tile_b",
	
	// Turret sprite arrays
	COLOUR_TURRET : [{ COLOUR : "blue", BASE : 0, TOP : 1, CHARGE : [1,2,3,4,5], COOL : [5,4,3,2,1], FIREANDCOOL : [6,7,8,9,10,11,12,1] },
	                 { COLOUR : "red", BASE : 13, TOP : 14, CHARGE : [14,15,16,17,18], COOL : [18,17,16,15,14], FIREANDCOOL : [19,20,21,22,23,24,25,14] },
	                 { COLOUR : "purple", BASE : 26, TOP : 27, CHARGE : [27,28,29,30,31], COOL : [31,30,29,28,27], FIREANDCOOL : [32,33,34,35,36,37,38,27] },
	                 { COLOUR : "green", BASE : 39, TOP : 40, CHARGE : [40,41,42,43,44], COOL : [44,43,42,41,40], FIREANDCOOL : [45,46,47,48,49,50,51,40] },
	                 { COLOUR : "yellow", BASE : 52, TOP : 53, CHARGE : [53,54,55,56,57], COOL : [57,56,55,54,53], FIREANDCOOL : [58,59,60,61,62,63,64,53] },
	                 { COLOUR : "cyan", BASE : 65, TOP : 66, CHARGE : [66,67,68,69,70], COOL : [70,69,68,67,66], FIREANDCOOL : [71,72,73,74,75,76,77,66] } ],
}