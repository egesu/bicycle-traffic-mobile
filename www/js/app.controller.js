/**
 * @constructor
 * @ngdoc controller
 * @memberof bikegame
 * @name AppCtrl
 *
 * @requires $rootScope
 * @requires $interval
 * @requires $window
 */
function AppCtrl(
    $rootScope, $interval, $window
) {
    var self = this;

    $rootScope.bike = {
        altitude: 0,
        left: 0,
        movingUp: false,
        movingDown: false,
        movingRight: false,
        movingLeft: false,
        ratio: 1.62005277,
    };
    $rootScope.collision = {
        happened: false,
        promise: null
    };
    $rootScope.score = null;
    $rootScope.blockers = [];
    $rootScope.level = null;

    self.blockerTypes = [
        'car',
        'pedestrian',
        'badroad',
    ];
    self.blockersMovementPromise = null;
    self.addBlockerPromise = null;
    self.bikeVerticalMovementPromise = null;
    self.bikeHorizontalMovementPromise = null;

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * init
     */
    self.init = function() {
        $rootScope.score = 0;
        $rootScope.level = 0;

        self.screen = {
            width: $window.innerWidth,
            height: $window.innerHeight,
        };

        self.blockerProperties = {
            car: {
                width: (self.screen.height * 0.1 * 2.962962963 * 100) / self.screen.width,
            },
            pedestrian: {
                width: (self.screen.height * 0.1 * 0.582781457 * 100) / self.screen.width,
            },
            badroad: {
                width: (self.screen.height * 0.1 * 0.896666667 * 100) / self.screen.width,
            },
        };
        $rootScope.bike.width = (self.screen.height * 10 * $rootScope.bike.ratio) / self.screen.width;

        self.setBlockers();
        self.setBlockersMovement();
        self.initCollideCheck();
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @description
     * Restarts the game
     */
    $rootScope.restart = function() {
        $rootScope.collision = {
            happened: false,
            promise: null
        };

        $rootScope.bike = {
            altitude: 0,
            left: 0,
            movingUp: false,
            movingDown: false,
            movingRight: false,
            movingLeft: false,
            ratio: 1.62005277,
        };
        $rootScope.blockers = [];

        self.init();
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Adds blockers
     */
    self.setBlockers = function() {
        $interval.cancel(self.addBlockerPromise);
        self.addBlockerPromise = $interval(self.addBlocker, 1000 - $rootScope.level * 50);
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * If score % 200 = 0, increase the level
     */
    self.scoreChanged = function(newScore) {
        if(newScore % 100 === 0) {
            $rootScope.level++;
            self.setBlockers();
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Add new blocker
     */
    self.addBlocker = function() {
        var blockerType = self.blockerTypes[Math.floor(Math.random() * self.blockerTypes.length)];

        $rootScope.blockers.push({
            type: blockerType,
            bottom: Math.round(Math.random()*90),
            left: 100,
        });
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Move the blockers to left
     */
    self.setBlockersMovement = function() {
        self.blockersMovementPromise = $interval(self.moveBlockers, 50);
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Move the blockers left
     */
    self.moveBlockers = function() {
        $rootScope.blockers.forEach(function(element, index) {
            if(element.left === -10) {
                $rootScope.blockers.splice(index, 1);
            } else {
                element.left--;
            }
        });

        $rootScope.score++;
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Stops the movement of blockers and stops adding new blockers
     */
    self.stopBlockers = function() {
        $interval.cancel(self.blockersMovementPromise);
        $interval.cancel(self.addBlockerPromise);
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @description
     * Keyboard keydown event fired
     * @param $event {Object} Event object
     */
    $rootScope.handleKeydown = function($event) {
        if($event.key.indexOf('Arrow') !== -1) {
            // Not to move the page
            if($event.preventDefault) {
                $event.preventDefault();
            }

            if($rootScope.collision.happened) {
                return false;
            }

            if($event.key === 'ArrowUp' && $rootScope.bike.movingUp === false && $rootScope.bike.movingDown === false) {
                // Move the bicycle up
                self.bikeVerticalMovementPromise = $interval(self.moveBikeUp, 50);
                $rootScope.bike.movingUp = true;
                $rootScope.bike.movingDown = false;
            } else if($event.key === 'ArrowDown' && $rootScope.bike.movingUp === false && $rootScope.bike.movingDown === false) {
                // Move the bicycle down
                self.bikeVerticalMovementPromise = $interval(self.moveBikeDown, 50);
                $rootScope.bike.movingUp = false;
                $rootScope.bike.movingDown = true;
            } else if($event.key === 'ArrowRight' && $rootScope.bike.movingRight === false && $rootScope.bike.movingLeft === false) {
                self.bikeHorizontalMovementPromise = $interval(self.moveBikeRight, 50);
                $rootScope.bike.movingLeft = false;
                $rootScope.bike.movingRight = true;
            } else if($event.key === 'ArrowLeft' && $rootScope.bike.movingLeft === false && $rootScope.bike.movingRight === false) {
                self.bikeHorizontalMovementPromise = $interval(self.moveBikeLeft, 50);
                $rootScope.bike.movingLeft = true;
                $rootScope.bike.movingRight = false;
            }
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @description
     * Keyboard keyup event fired
     * @param $event {Object} Event object
     */
    $rootScope.handleKeyup = function($event) {
        if($event.key.indexOf('ArrowUp') !== -1 || $event.key.indexOf('ArrowDown') !== -1) {
            // Not to move the page
            if($event.preventDefault) {
                $event.preventDefault();
            }

            $rootScope.bike.movingUp = false;
            $rootScope.bike.movingDown = false;

            if($rootScope.collision.happened) {
                return false;
            }

            $interval.cancel(self.bikeVerticalMovementPromise);
        } else if($event.key.indexOf('ArrowRight') !== -1 || $event.key.indexOf('ArrowLeft') !== -1) {
            // Not to move the page
            if($event.preventDefault) {
                $event.preventDefault();
            }

            $rootScope.bike.movingLeft = false;
            $rootScope.bike.movingRight = false;

            if($rootScope.collision.happened) {
                return false;
            }

            $interval.cancel(self.bikeHorizontalMovementPromise);
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Moves the bicycle up
     */
    self.moveBikeUp = function() {
        if($rootScope.bike.altitude !== 90) {
            $rootScope.bike.altitude++;
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Moves the bicycle down
     */
    self.moveBikeDown = function() {
        if($rootScope.bike.altitude !== 0) {
            $rootScope.bike.altitude--;
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Moves the bicycle left
     */
    self.moveBikeLeft = function() {
        if($rootScope.bike.left !== 0) {
            $rootScope.bike.left -= 0.5;
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Moves the bicycle left
     */
    self.moveBikeRight = function() {
        if($rootScope.bike.left !== 90) {
            $rootScope.bike.left += 0.5;
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Gravity
     */
    self.gravity = function() {
        if($rootScope.bike.altitude !== 0) {
            $rootScope.bike.altitude--;
        } else {
            $interval.cancel($rootScope.bike.moveDownPromise);
            $rootScope.bike.movingDown = false;
        }
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Run interval for checking collide constantly
     */
    self.initCollideCheck = function() {
        $rootScope.collision.promise = $interval(self.collideCheck, 50);
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Check collision
     */
    self.collideCheck = function() {
        $rootScope.blockers.forEach(function(blocker) {
            var rect1 = {
                x: blocker.left,
                y: 90 - blocker.bottom,
                width: self.blockerProperties[blocker.type].width,
                height: 10,
            };

            var rect2 = {
                x: $rootScope.bike.left,
                y: 90 - $rootScope.bike.altitude,
                width: $rootScope.bike.width,
                height: 10,
            };

            if(rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y) {
                // collision!
                self.stopBlockers();
                self.initCollide();
            }
        });
    };

    /**
     * @ngdoc method
     * @memberof AppCtrl
     * @private
     * @description
     * Handle collison
     */
    self.initCollide = function() {
        $interval.cancel($rootScope.collision.promise);
        $rootScope.collision.happened = true;
        $interval.cancel(self.bikeVerticalMovementPromise);
        $interval.cancel(self.bikeHorizontalMovementPromise);
    };

    self.init();

    $rootScope.$watch('score', self.scoreChanged);
}

AppCtrl.$inject = [
    '$rootScope',
    '$interval',
    '$window',
];

angular.module('bikegame')
    .controller('AppCtrl', AppCtrl);
