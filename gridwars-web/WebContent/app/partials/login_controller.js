'use strict';

angular.module('gridWarsApp.c_login', ['gridWarsApp.f_login'])

.controller('loginCtrl', function (loginFcty) {
	loginFcty.print();
});