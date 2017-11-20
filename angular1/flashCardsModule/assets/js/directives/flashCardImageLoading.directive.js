(function (app) {

    app.directive('flashCardImageLoading', ngOnload);

    ngOnload.$inject = ["$compile", "$timeout"];
    function ngOnload($compile, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                let spinner = $compile(`<ion-spinner class="flash-card-image-loading"></ion-spinner>`)(scope);

                element.addClass('ng-hide');
                element.after(spinner);
                element.bind("load", function(event) {

                    $timeout(() => {
                        element.removeClass('ng-hide');
                        let next = element.next();
                        if (next.hasClass('spinner')) {
                            next.addClass('ng-hide');
                        }
                    }, 300);

                });
            }
        }
    }

})(angular.module('flash-cards'));