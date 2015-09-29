'use strict';

angular.module('gridWarsApp', [
  'ngRoute',
  'ngResource',
  'gridWarsApp.login.module',
  'gridWarsApp.game.module',
  'gridWarsApp.lobby.module',
  'gridWarsApp.register.module',
  'gridWarsApp.results.module',
  'gridWarsApp.servers.module',
  'gridWarsApp.testing.module'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/game', {template: '<gwa-game></gwa-game>'});
	$routeProvider.when('/lobby', {template: '<gwa-lobby></gwa-lobby>'});
	$routeProvider.when('/login', {template: '<gwa-login></gwa-login>'});
	$routeProvider.when('/register', {template: '<gwa-register></gwa-register>'});
	$routeProvider.when('/results', {template: '<gwa-results></gwa-results>'});
	$routeProvider.when('/servers', {template: '<gwa-servers></gwa-servers>'});
	$routeProvider.when('/testing', {template: '<gwa-testing></gwa-testing>'});
	$routeProvider.otherwise({redirectTo: '/login'});
}])
.run(function($rootScope, $location, $route) {
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		
		// Define list of pages not requiring authorisation
		var nonAuthPages = [ "login", "register" ];
		var currPath = window.location.href;
	
		// Extract path to first get variable if one exists
		if (currPath.indexOf("?") > -1) { currPath = currPath.substring(0, currPath.indexOf("?")); }
	
		// Find non-authorised required pages and break if auto is not required
		for (var i = 0; i < nonAuthPages.length; i++) {
			if (currPath.indexOf(nonAuthPages[i]) > -1) {
				return;
			}
		}
		
		// Run function to check authentication and redirect if necessary
		var loginRedirecter = function() {
			$.post("gridwars/rest/checkauth", function() {})
			.complete(function(res) {
				if (res.responseText === null ||
						res.responseText === undefined ||
						res.responseText === "") {
					
					// Redirect to login
					$location.path("/login");
					
					// Clear timers
					if ($rootScope.refresh) { clearInterval($rootScope.refresh); }
					if($rootScope.getData) { clearInterval($rootScope.getData); }
					
					// Clear all waiters
					if (existingWaiters) {
						for (var index = 0; index < existingWaiters.length; index ++) {
							existingWaiters[index].stop();
						}
					}
				}
			});
		};
		
		// Start redirect function
		loginRedirecter();
	});
});
