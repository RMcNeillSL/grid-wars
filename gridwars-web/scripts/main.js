define([
    'knockout',
    'jquery',
    'viewModels/ViewModel'
], function (ko, $, ViewModel) {
    'use strict';

    var viewModel =  new ViewModel();
    
    ko.applyBindings(viewModel, document.body);
    
});