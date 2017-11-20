(function (app) {

    app.provider('videoListService', videoListServiceProvider);

    videoListServiceProvider.$inject = [];
    function videoListServiceProvider() {
        let provider = this;

        provider.$get = createVideoListServiceInstance;
        provider.init = init;

        ///////////////////

        function init(path) {
            if (typeof path === 'string') {
                if (path.charAt(path.length - 1) !== '/') 
                    path += '/';
                provider.videosPath = path;
            }
            else
                throw new Error("Videos path type is not 'string'");
        }


        createVideoListServiceInstance.$inject = [];
        function createVideoListServiceInstance() {
            return new videoListService();
        }

        function videoListService() {
            let self = this;

            self.getVideosPath = getVideosPath;

            /////////////

            function getVideosPath() {
                return provider.videosPath;
            }
        }
    }

})(angular.module('videoList'));