'use strict';

angular.module('gridWarsApp.testing.module').directive('gwaTesting', function () {
	return {
		replace: true,
		controller: 'gridWarsApp.testing.controller',
		controllerAs: 'controller',
		templateUrl: 'app/partials/testing/testing.html'
	};
});