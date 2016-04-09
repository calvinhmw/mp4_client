var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('CommonData', function () {
    var data = "";
    return {
        getData: function () {
            return data;
        },
        setData: function (newData) {
            data = newData;
        }
    }
});

mp4Services.factory('Llamas', function ($http, $window) {
    return {
        get: function () {
            var baseUrl = $window.sessionStorage.baseurl;
            //console.log($window.sessionStorage.baseurl);
            return $http.get(baseUrl + '/api/tasks');
        }
    }
});


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
        add: function (name, email) {
            var data = {
                name: name,
                email: email
            };
            return $http.post(baseUrl + '/api/users', data);
        },
        delete: function (id) {

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



