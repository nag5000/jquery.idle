/**
 *  File: jquery.idle.js
 *  Title:  JQuery Idle.
 *  A dead simple jQuery plugin that executes a callback function if the user is idle.
 *  About: Author
 *  Henrique Boaventura (hboaventura@gmail.com).
 *  About: Version
 *  1.2.7
 *  About: License
 *  Copyright (C) 2013, Henrique Boaventura (hboaventura@gmail.com).
 *  MIT License:
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  - The above copyright notice and this permission notice shall be included in all
 *    copies or substantial portions of the Software.
 *  - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *    SOFTWARE.
 **/
/*jslint browser: true */
/*global jQuery: false */
(function ($) {
  'use strict';

  $.fn.idle = function (options) {
    if (!options) {
        options = {};
    }

    var events = [
        'mousemove', 'keydown', 'mousedown', 'touchstart',

        // For the moment not all modern browsers are implementing
        // the unprefixed version of the Fullscreen API.
        'fullscreenchange', 'webkitfullscreenchange',
        'mozfullscreenchange', 'MSFullscreenChange'
    ];
    var visibilityEvent = 'visibilitychange';

    var namespaceDefault = 'idle';
    var namespace = options.namespace || namespaceDefault;

    var defaults = {
        // idle time in ms
        idle: 60000,

        namespace: namespaceDefault,

        // events that will trigger the idle resetter
        events: events.map(function(event) {
            return event + '.' + namespace;
        }).join(' '),

        visibilityEvent: visibilityEvent + '.' + namespace,

        onIdle: function () {}, //callback function to be executed after idle time
        onActive: function () {}, //callback function to be executed after back from idleness
        onHide: function () {}, //callback function to be executed when window is hidden
        onShow: function () {}, //callback function to be executed when window is visible
        keepTracking: true, //set it to false if you want to track only the first time
        startAtIdle: false,
        recurIdleCall: false,
        trackingInFullscreenMode: false
      },
      idle = options.startAtIdle || false,
      visible = !options.startAtIdle || true,
      settings = $.extend({}, defaults, options),
      lastId = null,
      resetTimeout,
      timeout,
      isFullscreenMode;

    // event to clear all idle events
    var stopEventName = namespace + ':stop';
    $(this).on(stopEventName, {}, function(event) {
      $(this).off(stopEventName);
      $(this).off(settings.events);
      $(document).off(settings.visibilityEvent);
      settings.keepTracking = false;
      resetTimeout(lastId, settings);
    });

    resetTimeout = function (id, settings) {
      if (idle) {
        idle = false;
        settings.onActive.call();
      }

      clearTimeout(id);
      if (settings.keepTracking) {
        return timeout(settings);
      }
    };

    timeout = function (settings) {
      var timer = (settings.recurIdleCall ? setInterval : setTimeout), id;
      id = timer(function () {
        if (!settings.trackingInFullscreenMode && isFullscreenMode()) {
            return;
        }

        idle = true;
        settings.onIdle.call();
      }, settings.idle);
      return id;
    };

    // For the moment not all modern browsers are implementing
    // the unprefixed version of the Fullscreen API.
    isFullscreenMode = function() {
        // "document.fullscreen" with prefixed versions is not used
        // because IE11 does not have this property.
        var fullscreenElement = document.fullscreenElement
            || document.webkitFullscreenElement
            || document.mozFullScreenElement
            || document.msFullscreenElement
            || null;

        return !!fullscreenElement;
    };

    return this.each(function () {
      lastId = timeout(settings);
      $(this).on(settings.events, function (e) {
        lastId = resetTimeout(lastId, settings);
      });

      if (settings.onShow || settings.onHide) {
        $(document).on(settings.visibilityEvent, function () {
          if (document.hidden) {
            if (visible) {
              visible = false;
              settings.onHide.call();
            }
          } else {
            if (!visible) {
              visible = true;
              settings.onShow.call();
            }
          }
        });
      }
    });

  };
}(jQuery));
