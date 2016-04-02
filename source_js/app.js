var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/firstview', {
        templateUrl: 'partials/firstview.html',
        controller: 'FirstController'
    }).when('/secondview', {
        templateUrl: 'partials/secondview.html',
        controller: 'SecondController'
    }).when('/llamalist', {
        templateUrl: 'partials/llamalist.html',
        controller: 'LlamaListController'
    }).when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsController'
    }).when('/users', {
        templateUrl: 'partials/users.html',
        controller: 'UserListController'
    }).when('/tasks', {
        templateUrl: 'partials/tasks.html',
        controller: 'TasksController'
    }).otherwise({
        redirectTo: '/settings'
    });
}]);
