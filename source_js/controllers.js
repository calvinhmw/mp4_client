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

mp4Controllers.controller('UserListController', ['$scope', 'Users', function ($scope, Users) {
    Users.get().then(function (response) {
        $scope.users = response.data.data;
        console.log(response);
    }, function (response) {
        //console.log('failed');
        $scope.errorCode = response.status;
        $scope.errorText = response.statusText;
    });

    //Users.get(function(data){
    //    $scope.users = data.data;
    //},function(status, statusText){
    //    $scope.errorCode = status;
    //    $scope.errorText = statusText;
    //});

}]);

mp4Controllers.controller('AddUserController', ['$scope', 'Users', function ($scope, Users) {
    $scope.successMsg = "";
    $scope.response = "";
    $scope.errorMsg = "";

    $scope.addUser = function () {
        $scope.successMsg = "";
        $scope.response = "";
        $scope.errorMsg = "";
        var name = $scope.name;
        var email = $scope.email;
        Users.add(name, email).then(function (response) {
            $scope.response = response;
            $scope.successMsg = response.data.message;
        }, function (response) {
            $scope.response = response;
            $scope.errorMsg = response.data.message;
        });
    };
}]);





