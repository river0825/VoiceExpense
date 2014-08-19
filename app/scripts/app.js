'use strict';

angular
  .module('voiceExpenseApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'LocalForageModule'
  ])
  .config(function ($routeProvider, $localForageProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      $localForageProvider.config({
        name: 'voiceExpense' // name of the database and prefix for your data
      });
  });
