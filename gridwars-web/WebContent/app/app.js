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
		var nonAuthPages = [ "login", "register" ];
		var currPath = window.location.href;
	
		if (currPath.indexOf("?") > -1) {
			currPath = currPath.substring(0, currPath.indexOf("?"));
		}
	
		for (var i = 0; i < nonAuthPages.length; i++) {
			if (currPath.indexOf(nonAuthPages[i]) > -1) {
				return;
			}
		}
		
		var redirectToLogin = function(res) {
			if (res === null || res === undefined || res === "") {
				$location.path("/login");
				
				if ($rootScope.refresh) {
					clearInterval($rootScope.refresh);
				}
				
				if($rootScope.getData) {
					clearInterval($rootScope.getData);
				}
				
			}
		}
		
		var checkAuth = function(callback) {
			$.post("gridwars/rest/checkauth", function() {
			}).complete(function(res) {
				callback(res.responseText);
			});
		}
		
		checkAuth(redirectToLogin);
	});
});