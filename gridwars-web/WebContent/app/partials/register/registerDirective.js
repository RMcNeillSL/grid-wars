'use strict';

angular.module('gridWarsApp.register.module').directive('gwaRegister', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.register.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/register/register.html'
	};
});