var mp4Controllers = angular.module('mp4Controllers', []);

// begin writing customized controllers here

mp4Controllers.controller('SettingsController', ['$scope', '$window', 'UserStore', 'TaskStore', function ($scope, $window, UserStore, TaskStore) {

    $scope.url = $window.sessionStorage.baseurl;
    $scope.set = false;
    $scope.setUrl = function () {
        // http://www.uiucwp.com:4000
        console.log($scope.url);
        $window.sessionStorage.baseurl = $scope.url;
        $scope.displayText = "URL set";
        $scope.set=true;
        //UserStore.update();
        //TaskStore.update();
    };
}]);

mp4Controllers.controller('UserListController', ['$scope', '$q', 'Users', 'Tasks', function ($scope, $q, Users, Tasks) {
    var updateUserList = function () {
        Users.get().then(function (response) {
            $scope.users = response.data.data;
            $scope.response = response;
            //console.log(response);
        }, function (response) {
            //console.log('failed');
            $scope.errorCode = response.status;
            $scope.errorText = response.statusText;
        });
    };

    $scope.deleteUser = function (userIdx) {
        // first find the user:
        //var user = $scope.users.filter(function (u) {
        //    return userId == u._id;
        //})[0];
        //console.log(userIdx);
        var user = $scope.users[userIdx];

        if (user) {
            //console.log('user exist');
            //try deleting the user
            Users.delete(user._id).then(function (response) {
                //console.log(response);
                $scope.users.splice(userIdx, 1);

                //updateUserList();
                //retrieve all pending tasks of the user
                var queryParams = {
                    where: {
                        "_id": {
                            $in: user.pendingTasks
                        }
                    }
                };
                return Tasks.get(queryParams);
            }).then(function (response) {
                // for all retrieved pending tasks, change them to unassigned
                var pendingTasks = response.data.data;
                var premises = [];
                for (var i = 0; i < pendingTasks.length; i++) {
                    pendingTasks[i].assignedUserName = 'unassigned';
                    pendingTasks[i].assignedUser = "";
                    premises.push(Tasks.update(pendingTasks[i]._id, pendingTasks[i]));
                }
                return $q.all(premises);
            }).then(function (response) {
                //console.log(response);
            }, function (response) {
                $scope.errorMsg = response.data.message;
                console.log(response);
            });
        }
    };
    updateUserList();

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
            //console.log($scope.pendingTasks);
        }, function (response) {
            $scope.response = response;
            $scope.errorMsg = response.data.message;
        });
    };

    $scope.markTaskComplete = function (taskIdx) {

        // without re-querying the task, use the pending task array we just created
        //var taskToUpdate = $scope.pendingTasks.filter(function (task) {
        //    return task._id == taskId;
        //})[0];
        //taskToUpdate.completed = true;
        var taskToUpdate = $scope.pendingTasks[taskIdx];
        taskToUpdate.completed = true;
        $scope.pendingTasks.splice(taskIdx,1);
        //console.log(taskToUpdate);

        Tasks.update(taskToUpdate._id, taskToUpdate).then(function (response) {
            //console.log(response);
            //delete the task from user(local)'s pending task array
            var userToUpdate = $scope.user;
            var idxToRemove = userToUpdate.pendingTasks.indexOf(taskToUpdate._id);
            if (idxToRemove > -1) {
                userToUpdate.pendingTasks.splice(idxToRemove, 1);
            }
            //send a put request to update the user
            return Users.update($scope.userId, userToUpdate);
        }).then(function (response) {
                //console.log(response);
            }, function (response) {
                //console.log(response);
                $scope.errorMsg = response.data.message;
            }
        );
    };

    $scope.showCompletedTasks = function () {
        var taskQuery = {
            where: {
                assignedUser: $scope.userId,
                completed: true
            }
        };
        Tasks.get(taskQuery).then(function (response) {
            //console.log(response);
            $scope.completedTasks = response.data.data;
        }, function (response) {
            $scope.errorMsg = response.data.message;
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
            var data = {
                name: $scope.name,
                email: $scope.email
            };
            Users.add(data).then(function (response) {
                //$scope.response = response;
                $scope.successMsg = "User " + response.data.data.name + " added!";
                //console.log(response);
            }, function (response) {
                //$scope.response = response;
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


mp4Controllers.controller('TaskListController', ['$scope', '$q', 'Tasks', 'Users', function ($scope, $q, Tasks, Users) {
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

    var updateTaskList = function () {
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
            $scope.errorMsg = response.data.message;
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

    $scope.deleteTask = function (taskIdx) {
        // first find the task
        //var task = $scope.tasks.filter(function (t) {
        //    return taskId == t._id;
        //})[0];
        $scope.errorMsg = "";
        var task = $scope.tasks[taskIdx];
        if (task) {
            // first delete the task
            Tasks.delete(task._id).then(function (response) {
                // find the user who is assigned to the task:
                if (!task.assignedUser || task.assignedUserName == 'unassigned') {
                    //return $q.reject({data: {message: 'deleting an unassigned task'}});
                    return $q.reject({data: {message: ''}});
                }
                return Users.getDetail(task.assignedUser);
            }).then(function (response) {
                //console.log(response.data);
                //remove the pending task from the user's pending task lists
                var user = response.data.data;
                var idx = user.pendingTasks.indexOf(task._id);
                if (idx != -1) {
                    user.pendingTasks.splice(idx, 1);
                    return Users.update(user._id, user);
                }
                return response;
            }).then(function (response) {
                //console.log(response.data);
                //$scope.successMsg = response.data.message;
                updateTaskList();
            }, function (response) {
                console.log(response.data);
                updateTaskList();
                $scope.errorMsg = response.data.message;
            });
        }
    };
    $scope.$watch('queryParams', updateTaskList, true);

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
        $scope.task = response.data.data;
        return Users.get();
    }).then(function (response) {
        $scope.users = response.data.data;
        $scope.selectedUser = $scope.users.filter(function (user) {
            return user._id == $scope.task.assignedUser;
        })[0];
        // the following deep copy does not actually copy the pendingTasks array!
        // previousUser and selectedUser shared the same pendingTasks memory !
        //$scope.previousUser = $scope.selectedUser ? Object.assign({}, $scope.selectedUser) : undefined;

        $scope.previousUser = $scope.selectedUser;

    }, function (response) {
        console.log(response);
        $scope.errorMsg = response.data.message;
    });

    $scope.editTask = function (form) {
        $scope.errorMsg = "";
        $scope.successMsg = "";
        if (form && form.$valid) {
            $scope.task.assignedUser = $scope.selectedUser ? $scope.selectedUser._id : "";
            $scope.task.assignedUserName = $scope.selectedUser ? $scope.selectedUser.name : "unassigned";

            Tasks.update($scope.task._id, $scope.task).then(function (response) {
                //task edited, now need to update user's pending tasks array
                $scope.successMsg = "Task " + $scope.task.name + " edited";

                if (!$scope.task.assignedUser || !$scope.selectedUser) {
                    // break premise chain here
                    return $q.reject({data: {message: 'task is unassigned'}});
                } else if ($scope.selectedUser == $scope.previousUser) {
                    // user does not change
                    //console.log("user not change");
                    var taskIdx = $scope.selectedUser.pendingTasks.indexOf($scope.task._id);
                    if ($scope.task.completed && taskIdx != -1) {
                        $scope.selectedUser.pendingTasks.splice(taskIdx, 1);
                    } else if (!$scope.task.completed && taskIdx == -1) {
                        $scope.selectedUser.pendingTasks.push($scope.task._id);
                    }
                } else {
                    // user changes
                    // first delete task from previous user
                    if ($scope.previousUser) {
                        taskIdx = $scope.previousUser.pendingTasks.indexOf($scope.task._id);
                        if (taskIdx != -1) {
                            $scope.previousUser.pendingTasks.splice(taskIdx, 1);
                        } else {
                            console.log($scope.task._id + " does not exist in " + $scope.previousUser);
                        }
                    }
                    //next add the task to new user if needed:
                    taskIdx = $scope.selectedUser.pendingTasks.indexOf($scope.task._id);
                    if ($scope.task.completed && taskIdx != -1) {
                        $scope.selectedUser.pendingTasks.splice(taskIdx, 1);
                    } else if (!$scope.task.completed && taskIdx == -1) {
                        $scope.selectedUser.pendingTasks.push($scope.task._id);
                    }
                }
                return Users.update($scope.selectedUser._id, $scope.selectedUser);
            }).then(function (response) {
                //console.log(response);
                if ($scope.previousUser && $scope.previousUser != $scope.selectedUser) {
                    return Users.update($scope.previousUser._id, $scope.previousUser);
                }
                return response;
            }).then(function (response) {
                //console.log(response);
                //$scope.previousUser = Object.assign({}, $scope.selectedUser);
                $scope.previousUser = $scope.selectedUser;
                //console.log(response.data.message);
            }, function (response) {
                $scope.errorMsg = response.data.message;
                console.log(response.data.message);
            });
        }
    };

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
        $scope.errorMsg = "";
        $scope.successMsg = "";
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
                $scope.successMsg = "Task " + data.name + " added";
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
                //console.log(response);
            }, function (response) {
                $scope.errorMsg = response.data.message;
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





