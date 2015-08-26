'use strict';

angular.module('gridWarsApp', [
  'ngRoute',
  'ngResource',
  'gridWarsApp.login.module',
  'gridWarsApp.create.module',
  'gridWarsApp.game.module',
  'gridWarsApp.lobby.module',
  'gridWarsApp.register.module',
  'gridWarsApp.results.module',
  'gridWarsApp.servers.module'  
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/create', {template: '<gwa-create></gwa-create>'});
	$routeProvider.when('/game', {template: '<gwa-game></gwa-game>'});
	$routeProvider.when('/lobby', {template: '<gwa-lobby></gwa-lobby>'});
	$routeProvider.when('/login', {template: '<gwa-login></gwa-login>'});
	$routeProvider.when('/register', {template: '<gwa-register></gwa-register>'});
	$routeProvider.when('/results', {template: '<gwa-results></gwa-results>'});
	$routeProvider.when('/servers', {template: '<gwa-servers></gwa-servers>'});
	$routeProvider.otherwise({redirectTo: '/login'});
}]);
