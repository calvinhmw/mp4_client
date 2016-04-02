var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('FirstController', ['$scope', 'CommonData', function ($scope, CommonData) {
    $scope.data = "";
    $scope.displayText = ""

    $scope.setData = function () {
        CommonData.setData($scope.data);
        $scope.displayText = "Data set"

    };

}]);

mp4Controllers.controller('SecondController', ['$scope', 'CommonData', function ($scope, CommonData) {
    $scope.data = "";

    $scope.getData = function () {
        $scope.data = CommonData.getData();

    };

}]);


mp4Controllers.controller('LlamaListController', ['$scope', '$http', 'Llamas', '$window', function ($scope, $http, Llamas, $window) {
    Llamas.get().success(function (data) {
        $scope.llamas = data;
    });


}]);

// begin writing customized controllers here

mp4Controllers.controller('SettingsController', ['$scope', '$window', function ($scope, $window) {
    $scope.url = $window.sessionStorage.baseurl;
    $scope.setUrl = function () {
        // http://www.uiucwp.com:4000
        console.log($scope.url);
        $window.sessionStorage.baseurl = $scope.url;
        $scope.displayText = "URL set";
    };
}]);

mp4Controllers.controller('UserListController', ['$scope', '$window', 'Users', function ($scope, $window, Users) {
    Users.get().then(function (response) {
        $scope.users = response.data.data;
    }, function (response) {
        console.log('failed');
        $scope.error = response.data || "GET Request failed";
    });

    //Users.get().success(function(data) {
    //    $scope.users = data.data;
    //});

}]);





