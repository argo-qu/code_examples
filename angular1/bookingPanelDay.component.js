/**
 *   Component bookingPanelDay
 */

(function (app) {

    app.component('bookingPanelDay', {
        templateUrl: 'templates/bookingPanelDay.html',
        controller: bookingPanelDayController,
        controllerAs: 'vm',
        bindings: {
            day: '=',
            request: '='
        }
    });

    bookingPanelDayController.$inject = ["commonDataService", "$element", "$timeout"];
    function bookingPanelDayController(commonDataService, $element, $timeout) {
        let vm = this;

        if (vm.day.times.length > 0)
            vm.localSelectedTime = vm.day.times[0];

        vm.isToday = commonDataService.formatDate(new Date()) === vm.day.date;
        vm.month = commonDataService.getMonth(vm.day.date);

        vm.select = select;
        vm.selectTime = selectTime;
        vm.getTimes = getTimes;
        vm.getSelectedDate = getSelectedDate;
        vm.getSelectedTime = getSelectedTime;

        //////////////////

        function getSelectedDate() {
            return vm.request.date;
        }

        function getSelectedTime() {
            return vm.request.date;
        }

        function getTimes() {
            return vm.day.times.filter(time => time.places_amount === undefined || parseInt(time.places_amount) >= vm.request.places_amount);
        }

        function select() {
            vm.request.date = vm.day.date;
            vm.request.time = vm.localSelectedTime;

            $timeout(() => {
                let scope = angular.element($($element[0]).find('.ui-select-match')).scope();
                if (scope)
                    scope.$select.open = true;
            });
        }

        function selectTime(time) {
            vm.request.time = time;
        }

    }

})(angular.module('joyjump_booking_ui'));