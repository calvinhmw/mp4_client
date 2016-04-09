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
        $scope.response = response;
        //console.log(response);
    }, function (response) {
        //console.log('failed');
        $scope.errorCode = response.status;
        $scope.errorText = response.statusText;
    });
}]);


mp4Controllers.controller('UserDetailController', ['$scope', '$routeParams', 'Users', 'Tasks', function ($scope, $routeParams, Users, Tasks) {

    $scope.userId = $routeParams.id;
    var updateUserDetail = function () {
        Users.getDetail($scope.userId).then(function (response) {
            $scope.user = response.data.data;
            var tasksQuery = {
                where: {
                    "_id": {
                        $in: $scope.user.pendingTasks
                    }
                }
            };
            return Tasks.get(tasksQuery);
        }).then(function (response) {
            //$scope.response = response;
            $scope.pendingTasks = response.data.data;
        }, function (response) {
            $scope.response = response;
            $scope.errorMsg = response.data.message;
        });
    };

    $scope.markTaskComplete = function (taskId) {

        //Query the task that is just completed by the user, change it's completed to true
        Tasks.getDetail(taskId).then(function (response) {
            var taskToUpdate = response.data.data;
            taskToUpdate.completed = true;
            // send a put request to update the task
            return Tasks.update(taskId, taskToUpdate);
        }).then(function (response) {
            console.log(response);
            //delete the task from user(local)'s pending task array
            var userToUpdate = $scope.user;
            var idxToRemove = userToUpdate.pendingTasks.indexOf(taskId);
            if (idxToRemove > -1) {
                userToUpdate.pendingTasks.splice(idxToRemove, 1);
            }
            //send a put request to update the user
            return Users.update($scope.userId, userToUpdate);
        }).then(function (response) {
            updateUserDetail();
        }, function (response) {
            $scope.errorMsg = response.data.message;
        });
    };

    $scope.showCompletedTasks = function () {
        var taskQuery = {
            where: {
                assignedUser: $scope.userId,
                completed: true
            }
        };
        Tasks.get(taskQuery).then(function (response) {
            //$scope.response = response;
            console.log(response);
            $scope.completedTasks = response.data.data;
        });
    };

    updateUserDetail();

}]);


mp4Controllers.controller('AddUserController', ['$scope', 'Users', function ($scope, Users) {
    $scope.successMsg = "";
    $scope.response = "";
    $scope.errorMsg = "";

    $scope.addUser = function (form) {
        if (form && form.$valid) {
            $scope.successMsg = "";
            $scope.response = "";
            $scope.errorMsg = "";
            var name = $scope.name;
            var email = $scope.email;
            Users.add(name, email).then(function (response) {
                $scope.response = response;
                $scope.successMsg = "User " + name + " added!";
            }, function (response) {
                $scope.response = response;
                $scope.errorMsg = response.data.message;
            });
            $scope.resetForm(form);
        }
    };

    $scope.resetForm = function (form) {
        if (form) {
            $scope.email = null;
            $scope.name = null;
            form.$setPristine();
            form.$setUntouched();
        }
    }
}]);


mp4Controllers.controller('TaskListController', ['$scope', 'Tasks', function ($scope, Tasks) {
    $scope.count = 0;
    $scope.page = 0;
    $scope.times = 0;

    $scope.sortBy = "dateCreated";
    $scope.sortOptions = ["dateCreated", "name", "assignedUserName", "deadline"];
    $scope.ascendingOrder = false;

    $scope.queryParams = {
        where: {
            completed: false
        },
        sort: {
            dateCreated: -1
        },
        skip: 0,
        limit: 10
    };

    $scope.getTasks = function () {
        var paramsWithCount = Object.assign({count: true}, $scope.queryParams);
        var paramsWithoutCount = Object.assign({count: false}, $scope.queryParams);

        Tasks.get(paramsWithCount).then(function (response) {
            $scope.count = parseInt(response.data.data);
            $scope.response = response;

            return Tasks.get(paramsWithoutCount);
        }).then(function (response) {
            $scope.tasks = response.data.data;
            $scope.response = response;
        }, function (response) {
            //$scope.response = response;
            $scope.errorCode = response.status;
            $scope.errorText = response.statusText;
        });
    };

    $scope.nextPage = function () {
        if (($scope.page + 1) * $scope.queryParams.limit >= $scope.count) {
            $scope.page = 0;
        } else {
            $scope.page++;
        }
        $scope.queryParams.skip = $scope.page * $scope.queryParams.limit;
    };

    $scope.previousPage = function () {
        if ($scope.page == 0) {
            var total = Math.floor($scope.count / $scope.queryParams.limit);
            $scope.page = ($scope.count % $scope.queryParams.limit == 0) ? total - 1 : total;
        } else {
            $scope.page--;
        }
        $scope.queryParams.skip = $scope.page * $scope.queryParams.limit;
    };

    $scope.completenessChanged = function () {
        $scope.queryParams.skip = 0;
        $scope.page = 0;
    };

    $scope.reorder = function () {
        $scope.times++;
        $scope.queryParams.sort[$scope.sortBy] = $scope.ascendingOrder ? 1 : -1;
    };

    $scope.changeSortBy = function () {
        for (var prop in $scope.queryParams.sort) {
            $scope.queryParams.sort[prop] = undefined;
        }
        $scope.queryParams.sort[$scope.sortBy] = $scope.ascendingOrder ? 1 : -1;
    };

    $scope.$watch('queryParams', $scope.getTasks, true);

}]);


mp4Controllers.controller('TaskDetailController', ['$scope', '$routeParams', 'Tasks', function ($scope, $routeParams, Tasks) {
    $scope.taskId = $routeParams.id;
    Tasks.getDetail($scope.taskId).then(function (response) {
        $scope.task = response.data.data;
    }, function (response) {
        $scope.errorMsg = response.data.message;
    });
}]);

mp4Controllers.controller('EditTaskController', ['$scope', '$q', '$routeParams', 'Tasks', 'Users', function ($scope, $q, $routeParams, Tasks, Users) {
    $scope.taskId = $routeParams.id;
    Tasks.getDetail($scope.taskId).then(function (response) {
        console.log(response);
        $scope.task = response.data.data;
        $scope.assignedUserName = $scope.task.assignedUserName;
    }, function (response) {
        $scope.errorMsg = response.data.message;
    });

    $scope.queryParams = {
        select: {
            name: 1,
            _id: 1
        }
    };
    Users.get($scope.queryParams).then(function (response) {
        $scope.users = response.data.data;
    });

}]);


mp4Controllers.controller('AddTaskController', ['$scope', '$q', 'Tasks', 'Users', function ($scope, $q, Tasks, Users) {
    $scope.deadline = (new Date(Date.now())).toString();
    $scope.queryParams = {
        select: {
            name: 1,
            _id: 1
        }
    };

    Users.get($scope.queryParams).then(function (response) {
        $scope.users = response.data.data;
    });


    $scope.addTask = function (form) {
        if (form && form.$valid) {
            var data = {
                name: $scope.name,
                description: $scope.description,
                deadline: $scope.deadline,
                assignedUser: $scope.assignedUser ? $scope.assignedUser._id : undefined,
                assignedUserName: $scope.assignedUser ? $scope.assignedUser.name : undefined
            };
            Tasks.add(data).then(function (response) {
                //task added, now need to update user's pending tasks array
                $scope.taskId = response.data.data._id;
                if (data.assignedUser) {
                    console.log(response);
                    return Users.getDetail(data.assignedUser);
                } else {
                    // break premise chain here
                    return $q.reject({data: {message: 'task is unassigned'}});
                }
            }).then(function (response) {
                var user = response.data.data;
                user.pendingTasks.push($scope.taskId);
                return Users.update(data.assignedUser, user);
            }).then(function (response) {
                console.log(response);
            }, function (response) {
                console.log(response.data.message);
            });

            $scope.resetForm(form);
        }
    };

    $scope.resetForm = function (form) {
        if (form) {
            $scope.deadline = (new Date(Date.now())).toString();
            $scope.name = null;
            $scope.description = null;
            $scope.assignedUser = null;
            form.$setPristine();
            form.$setUntouched();
        }
    }
}]);





