/**
 *   Service: newRecordsService
 */
(function (app) {

    app.service('newRecordsService', newRecordsService);

    newRecordsService.$inject = ["$timeout", "$rootScope", "authService"];
    function newRecordsService($timeout, $rootScope, auth) {
        const self = this;

        self.records = [];
        self.halls = [];
        self.blocked = [];

        self.init = init;
        self.getRecords = getRecords;
        self.getHalls = getHalls;

        if (auth.isAuthorized())
            $timeout(self.init);

        //////////////////

        function init() {
            if (self.socket instanceof WebSocket)
                self.socket.close();
            
            self.socket = new WebSocket(`ws://#############:8080/###/###/###/###?token=${auth.getJwt()}`);
            

            self.socket.onmessage = event => {
                $timeout(() => {
                    self.onSocketMessage(event);
                });
            };            

            self.onSocketMessage = function (event) {                
                if (event.data === 'Error : Expired JWT Token. Connection close') {
                    auth.removeJwt();
                }
                else if (event.data.substr(0, 9) !== 'Connected') {
                    if(event.data.indexOf('{"blocked":') !== -1) {
                        self.blocked = angular.fromJson(event.data).blocked;
                    } else {
                        let parsedData = angular.fromJson(event.data);                        
                        self.records = parsedData.records;
                        self.halls = parsedData.halls;

                        $rootScope.$emit('socket:update', { records: self.records, halls: self.halls });
                    }
                }
            };
        }

        function getRecords() {
            return self.records;
        }

        function getHalls() {
            return self.halls;
        }
    }

})(angular.module('joyjump_booking_ui'));