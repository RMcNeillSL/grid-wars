'use strict';

angular.module('gridWarsApp.login.module').directive('gwaLogin', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.login.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/login/login.html'
	};
});