(function (app) {

    app.config(config);

    config.$inject = ["$stateProvider"];
    function config($stateProvider) {
        $stateProvider
            .state('tab.videos', {
                url: '/videos',
                views: {
                    'tab-videos': {
                        templateUrl: 'templates/tab-videos.html'
                    }
                }
            });
    }

})(angular.module('videoList'));