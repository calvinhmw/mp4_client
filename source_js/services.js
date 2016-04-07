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
    //return {
    //    get: function (successCallback, errorCallback) {
    //        var baseUrl = $window.sessionStorage.baseurl;
    //        $http.get(baseUrl + '/api/users').then(
    //            function (response) {
    //                successCallback(response.data);
    //            },
    //            function (error) {
    //                errorCallback(error.status, error.statusText);
    //            }
    //        );
    //    }
    //};

    return {
        get: function () {
            var baseUrl = $window.sessionStorage.baseurl;
            return $http.get(baseUrl + '/api/users');
        },
        add: function(name, email) {
            var baseUrl = $window.sessionStorage.baseurl;
            var data = {
                name: name,
                email: email
            };
            return $http.post(baseUrl+'/api/users', data);
        },
        delete: function(){

        }
    }

}]);



