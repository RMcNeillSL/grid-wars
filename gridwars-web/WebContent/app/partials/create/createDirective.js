'use strict';

angular.module('gridWarsApp.create.module').directive('gwaCreate', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.create.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/create/create.html'
	};
});