/**
 *   Component editRecord
 */

(function (app) {

    app.component('editRecord', {
        templateUrl: 'templates/editRecord.html',
        controller: editRecordController,
        controllerAs: 'vm',
    });

    editRecordController.$inject = ["$rootScope", "commonDataService", "adminBookingService", "newRecordsService", "$timeout", "apiService"];
    function editRecordController($rootScope, commonDataService, adminBookingService, newRecordsService, $timeout, api) {
        let vm = this;

        vm.halls = [];
        vm.weeks = [];

        vm.save = save;
        vm.cancel = cancel;
        vm.remove = remove;
        vm.hallChanged = hallChanged;
        vm.allocationEmpty = allocationEmpty;
        vm.allocationValid = allocationValid;

        $rootScope.$on('record:edit', editRecord);
        $rootScope.$on('socket:update', updateData);
        $('#modal-reservation-edit').on('hidden.bs.modal', cancel);

        //////////////////

        function updateData() {
            vm.weeks = commonDataService.prepareDaysForSlider(adminBookingService.getDaysForBooking(0));
            vm.halls = commonDataService.getHalls();
            $timeout(initJQuery);
        }

        function initJQuery() {
            let slider = new Swiper('.date.modal-date .swiper-container', {
                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',
                slidesPerView: 1,
                spaceBetween: 30,
                simulateTouch: false
            });
        }

        function editRecord($event, data) {            
            vm.record = angular.copy(data.record);
            vm.record.date = angular.copy(data.record.date);
            vm.record.all_in_same_hall = data.record.all_in_same_hall !== undefined ? angular.copy(data.record.all_in_same_hall) : true;

            if (vm.record.allocation_into_halls instanceof Array) {
                vm.record.places_amount = 0;
                vm.record.allocation_into_halls.forEach((item, index) => {
                    vm.record.allocation_into_halls[index] = parseInt(item.places_amount);
                    vm.record.places_amount += vm.record.allocation_into_halls[index];
                });                

                while (vm.record.allocation_into_halls.length < newRecordsService.halls.length - 1)
                    vm.record.allocation_into_halls.push(0);                

                vm.record.hall_id = 0;
                vm.record.all_in_same_hall = false;
            } else {
                vm.record.places_amount = parseInt(vm.record.places_amount);
                vm.record.hall_id = parseInt(vm.record.hall_id);

                if (!vm.record.allocation_into_halls)
                    vm.record.allocation_into_halls = [];

                while (vm.record.allocation_into_halls.length < newRecordsService.halls.length - 1)
                    vm.record.allocation_into_halls.push(0);
            }

            vm.recordBackup = angular.copy(data.record);
            $('#modal-reservation-edit input[type="tel"]').mask('+375 (99) 999-99-99');
            $('#modal-reservation-edit').modal('show');
            $timeout(initJQuery, 300);
        }
        
        function save() {
            api.updateRecord(prepareRequest(vm.record))
                .then((response) => {
                    $rootScope.$emit('record:edit:success', angular.copy(prepareRequest(vm.record)));
                    vm.record = null;
                    $('#modal-reservation-edit').modal('hide');
                }, 1000)
        }
        
        function cancel() {
            if (vm.record !== null) {
                $rootScope.$emit('record:edit:cancel', vm.recordBackup);
            }
        }

        function remove() {
            api.removeRecord(vm.record)
                .then((response) => {
                    $rootScope.$emit('record:edit:remove', angular.copy(vm.record));
                    vm.record = null;
                    $('#modal-reservation-edit').modal('hide');
                }, 1000)
        }

        function allocationEmpty() {
            return vm.record.allocation_into_halls.filter(item => item !== 0).length == 0;
        }

        function allocationValid() {
            let sum = 0;
            vm.record.allocation_into_halls.forEach(item => sum += item);

            return vm.allocationEmpty() || sum == vm.record.places_amount;
        }

        function hallChanged() {
            vm.weeks = commonDataService.prepareDaysForSlider(adminBookingService.getDaysForBooking(vm.record.hall_id));
            vm.halls = commonDataService.getHalls();
            vm.record.date = null;
            vm.record.time = null;
        }

        function prepareRequest(request) {            
            let result = angular.copy(request);

            if (!request.all_in_same_hall)
                result.hall_id = 0;

            if (result.time instanceof Object)
                result.time = result.time.time;

            return result;
        }
    }

})(angular.module('joyjump_booking_ui'));