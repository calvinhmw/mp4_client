var mp4Services = angular.module('mp4Services', []);


// begin writing customized services here

mp4Services.factory('Users', ['$http', '$window', function ($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    return {
        get: function (queryParams) {
            var config = {
                method: 'GET',
                url: baseUrl + '/api/users',
                params: queryParams
            };
            return $http(config);
        },
        add: function (data) {
            var config = {
                method: 'POST',
                url: baseUrl + '/api/users',
                data: data
            };
            return $http(config);
        },
        delete: function (id) {
            var config = {
                method: 'DELETE',
                url: baseUrl + '/api/users/' + id
            };
            return $http(config);
        },
        getDetail: function (id) {
            var config = {
                method: 'GET',
                url: baseUrl + '/api/users/' + id
            };
            return $http(config);
        },
        update: function (id, data) {
            var config = {
                method: 'PUT',
                url: baseUrl + '/api/users/' + id,
                data: data
            };
            return $http(config);
        }
    }

}]);


mp4Services.factory('Tasks', ['$http', '$window', function ($http, $window) {
    var baseUrl = $window.sessionStorage.baseurl;
    return {
        get: function (queryParams) {
            var config = {
                method: 'GET',
                url: baseUrl + '/api/tasks',
                params: queryParams
            };
            return $http(config);
        },
        add: function (data) {
            var config = {
                method: 'POST',
                url: baseUrl + '/api/tasks',
                data: data
            };
            return $http(config);
        },
        delete: function (id) {
            var config = {
                method: 'DELETE',
                url: baseUrl + '/api/tasks/' + id
            };
            return $http(config);
        },
        getDetail: function (id) {
            var config = {
                method: 'GET',
                url: baseUrl + '/api/tasks/' + id
            };
            return $http(config);
        },
        update: function (id, data) {
            var config = {
                method: 'PUT',
                url: baseUrl + '/api/tasks/' + id,
                data: data
            };
            return $http(config);
        }
    };
}]);


// UserStore purpose: store all users in a dictionary for easy query
mp4Services.factory('UserStore', ['Users', function (Users) {
    var userStore = {};
    userStore.users = {sasa: 2};
    userStore.status = "current tasks";
    userStore.update = function () {
        userStore.users = {};
        Users.get().then(function (response) {
            var users = response.data.data;
            for (var i = 0; i < users.length; i++) {
                userStore.users[users[i]._id] = Object.assign({}, users[i]);
            }
        }, function (response) {
            userStore.status = response.data.message;
        });
    };
    return userStore;
}]);

mp4Services.factory('TaskStore', ['Tasks', function (Tasks) {
    var taskStore = {};
    taskStore.tasks = {};
    taskStore.status = "current tasks";
    taskStore.update = function () {
        taskStore.tasks = {};
        Tasks.get().then(function (response) {
            var tasks = response.data.data;
            for (var i = 0; i < tasks.length; i++) {
                taskStore.tasks[tasks[i]._id] = tasks[i];
            }
        }, function (response) {
            taskStore.status = response.data.message;
        });
    };
    return taskStore;
}]);



