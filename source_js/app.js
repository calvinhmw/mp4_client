var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services', '720kb.datepicker']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/settings', {
        templateUrl: 'partials/settings.html',
        controller: 'SettingsController'
    }).when('/users', {
        templateUrl: 'partials/users.html',
        controller: 'UserListController'
    }).when('/users/:id', {
        templateUrl: 'partials/userdetail.html',
        controller: 'UserDetailController'
    }).when('/adduser', {
        templateUrl: 'partials/adduser.html',
        controller: 'AddUserController'
    }).when('/tasks', {
        templateUrl: 'partials/tasks.html',
        controller: 'TaskListController'
    }).when('/tasks/:id', {
        templateUrl: 'partials/taskdetail.html',
        controller: 'TaskDetailController'
    }).when('/addtask', {
        templateUrl: 'partials/addtask.html',
        controller: 'AddTaskController'
    }).when('/edittask/:id', {
        templateUrl: 'partials/edittask.html',
        controller: 'EditTaskController'
    }).otherwise({
        redirectTo: '/settings'
    });
}]);
