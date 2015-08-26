'use strict';

angular.module('gridWarsApp', [
  'ngRoute',
  'gridWarsApp.create',
  'gridWarsApp.game',
  'gridWarsApp.lobby',
  'gridWarsApp.login',
  'gridWarsApp.register',
  'gridWarsApp.results',
  'gridWarsApp.server'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/create', {templateUrl: 'app/partials/create.html', controller: 'createCtrl'});
	$routeProvider.when('/game', {templateUrl: 'app/partials/game.html', controller: 'gameCtrl'});
	$routeProvider.when('/lobby', {templateUrl: 'app/partials/lobby.html', controller: 'lobbyCtrl'});
	$routeProvider.when('/login', {templateUrl: 'app/partials/login.html', controller: 'loginCtrl'});
	$routeProvider.when('/register', {templateUrl: 'app/partials/register.html', controller: 'registerCtrl'});
	$routeProvider.when('/results', {templateUrl: 'app/partials/results.html', controller: 'resultsCtrl'});
	$routeProvider.when('/server', {templateUrl: 'app/partials/server.html', controller: 'serverCtrl'});
	$routeProvider.otherwise({redirectTo: '/login'});
}]);