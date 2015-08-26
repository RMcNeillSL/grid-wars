'use strict';

angular.module('gridWarsApp.results.module').directive('gwaResults', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.results.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/results/results.html'
	};
});