/**
 *   Component login
 */

(function (app) {

    app.component('login', {
        templateUrl: 'templates/login.html',
        controller: loginController,
        controllerAs: 'vm'
    });

    loginController.$inject = ["$rootScope", "apiService", "authService", "newRecordsService", "$state", "$scope"];
    function loginController($rootScope, api, auth, newRecordsService, $state, $scope) {
        let vm = this;

        vm.username = "";
        vm.password = "";
        vm.usernameInvalid = false;
        vm.passwordInvalid = false;

        vm.login = login;
        vm.isAuthorized = isAuthorized;

        $rootScope.bodyClass = "reservation reservation-login";

        if (vm.isAuthorized())
            $state.go('new-records-tab');

        $scope.$watch('vm.isAuthorized()', (isAuthorized) => {
            if (isAuthorized)
                $state.go('new-records-tab');
        });

        //////////////////

        function isAuthorized() {
            return auth.isAuthorized();
        }

        function login() {
            vm.usernameInvalid = vm.username.length == 0
            vm.passwordInvalid = vm.password.length == 0

            if ( vm.usernameInvalid || vm.passwordInvalid)
                return;

            return api.authenticate(vm.username, vm.password)
                .catch(error => {
                    $('#modal-Login-error').modal('show');
                    throw new Error(error.data);
                })
                .then(response => {
                    auth.setJwt(response.data.token);
                    newRecordsService.init();
                    $state.go('new-records-tab');
                });
        }
    }

})(angular.module('joyjump_booking_ui'));