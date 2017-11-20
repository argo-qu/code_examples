/**
 *   Component bookingPanel
 */

(function (app) {

    app.component('bookingPanel', {
        templateUrl: 'templates/bookingPanel.html',
        controller: bookingPanelController,
        controllerAs: 'vm'
    });

    bookingPanelController.$inject = ["adminBookingService", "commonDataService", "$timeout", "$rootScope", "newRecordsService", "$scope"];
    function bookingPanelController(adminBookingService, commonDataService, $timeout, $rootScope, newRecordsService, $scope) {
        let vm = this;

        vm.halls = [];
        vm.weeks = [];

        vm.allocationPopoverVisible = false;

        vm.book = book;
        vm.getRequest = getRequest;
        vm.getRequestCost = getRequestCost;
        vm.getRequestHall = getRequestHall;
        vm.increasePeopleAmount = increasePeopleAmount;
        vm.decreasePeopleAmount = decreasePeopleAmount;
        vm.getDaysForBooking = getDaysForBooking;
        vm.hallChanged = hallChanged;
        vm.showBookingModal = showBookingModal;
        vm.allocationEmpty = allocationEmpty;
        vm.allocationValid = allocationValid;

        $rootScope.$on('socket:update', updateData);

        if (newRecordsService.socket instanceof WebSocket)
            $timeout(updateData({}, newRecordsService));

        //////////////////

        function updateData($event, data) {
            vm.halls = data.halls;
            vm.weeks = commonDataService.prepareDaysForSlider(adminBookingService.getDaysForBooking());

            $timeout(initJQuery);
        }

        function hallChanged() {
            vm.weeks = commonDataService.prepareDaysForSlider(adminBookingService.getDaysForBooking());
            vm.getRequest().time = null;
            vm.getRequest().date = null;
        }

        function initJQuery() {
            let slider = new Swiper('.date .swiper-container', {
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                slidesPerView: 1,
                spaceBetween: 30,
                simulateTouch: false
            });
        }

        function allocationEmpty() {
            return vm.getRequest().allocation_into_halls.filter(item => item !== 0).length == 0;
        }

        function allocationValid() {
            let sum = 0;
            vm.getRequest().allocation_into_halls.forEach(item => sum += item);

            return vm.allocationEmpty() || sum == vm.getRequest().places_amount;
        }

        function getDaysForBooking() {
            return adminBookingService.getDaysForBooking();
        }

        function getRequest() {
            return adminBookingService.request;
        }

        function getRequestHall() {
            return adminBookingService.getRequestHall();
        }

        function getRequestCost() {
            return adminBookingService.getRequestCost();
        }

        function increasePeopleAmount() {
            adminBookingService.increasePeopleAmount();
        }

        function decreasePeopleAmount() {
            adminBookingService.decreasePeopleAmount();
        }

        function showBookingModal() {
            if ( !vm.getRequest().time.time || !vm.getRequest().date || (!vm.getRequest().all_in_same_hall && !vm.allocationValid()) )
                return;

            $('#modal-reservation input[type="tel"]').mask('+375 (99) 999-99-99');
            $('#modal-reservation').modal('show');
        }

        function book() {
            if (vm.getRequest().client.name.length == 0 || $('#ng-phone').val().length == 0)
                return;

            adminBookingService.request.client.phone = $('#ng-phone').val();

            adminBookingService.book()
                .catch(error => {
                    $('#modal-reservation-error').modal('show');
                    throw error;
                })
                .then(response => {
                    $('#modal-reservation').modal('hide');
                    $('#modal-reservation-success').modal('show');
                });
        }
    }

})(angular.module('joyjump_booking_ui'));