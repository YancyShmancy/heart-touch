$(function() {

	// Initialize the Reveal.js library with the default config options
	// See more here https://github.com/hakimel/reveal.js#configuration

	// Reveal.initialize({
	// 	history: true		// Every slide will change the URL
	// });

	// Connect to the socket

	var socket = io();

	// Variable initialization

	// var form = $('form.login');
	// var secretTextBox = form.find('input[type=text]');
	// var presentation = $('.reveal');

	// var key = "", animationTimeout;

	// When the page is loaded it asks you for a key and sends it to the server

	// form.submit(function(e){

	// 	e.preventDefault();

	// 	key = secretTextBox.val().trim();

		// If there is a key, send it to the server-side
		// through the socket.io channel with a 'load' event.

	// 	if(key.length) {
	// 		socket.emit('load', {
	// 			key: key
	// 		});
	// 	}

	// });

	// The server will either grant or deny access, depending on the secret key

	socket.on('access', function(data){

		// Check if we have "granted" access.
		// If we do, we can continue with the presentation.

		if(data.access === "granted") {

			// Unblur everything
			presentation.removeClass('blurred');

			form.hide();

			var ignore = false;

			$(window).on('hashchange', function(){

				// Notify other clients that we have navigated to a new slide
				// by sending the "slide-changed" message to socket.io

				if(ignore){
					// You will learn more about "ignore" in a bit
					return;
				}

				var hash = window.location.hash;

				socket.emit('slide-changed', {
					hash: hash,
					key: key
				});
			});

			socket.on('navigate', function(data){

				// Another device has changed its slide. Change it in this browser, too:

				window.location.hash = data.hash;

				// The "ignore" variable stops the hash change from
				// triggering our hashchange handler above and sending
				// us into a never-ending cycle.

				ignore = true;

				setInterval(function () {
					ignore = false;
				},100);

			});

		}
		else {

			// Wrong secret key

			clearTimeout(animationTimeout);

			// Addding the "animation" class triggers the CSS keyframe
			// animation that shakes the text input.

			secretTextBox.addClass('denied animation');

			animationTimeout = setTimeout(function(){
				secretTextBox.removeClass('animation');
			}, 1000);

			form.show();
		}

	});

	console.clear();

	var maxSide = 900;
	var s = Snap(maxSide, maxSide);
	s.attr({
	    viewBox: [0,0, maxSide, maxSide].join(',')
	});
	var g = s.g();

	var shapesList = [];

	var max = 21;
	var space = 1;
	var r = maxSide / max / 2 - space;
	var rs = r + space;
	var d = r * 2;
	var ds = rs * 2;
	var strokeWidth = r * 1.2;
	var colorStep = 360 / (max * max);
	var dur = 5000;
	var durBack = dur * 3;
	var defaultColor = '#222';
	var minaStyle = mina.elastic;

	var Shape = function () {

	  var circle = s.circle(r,r,r);
	  var nextR = r * .5;
	  var color = '';
	  g.add(circle);

	  this.init = function (params) {
		  shapesList.push(circle);

	      var x = params.x * ds + rs;
	      var y = params.y * ds + rs;
	      var pos = params.pos;
	      color = getHSL(colorStep * pos);

	      circle.attr({
	          transform: 'translate(' + x + ', ' + y + ')',
	          fill: defaultColor,
	          stroke: defaultColor,
	          'stroke-opacity': 0,
	          'stroke-width': strokeWidth
	      });
	  };

	  this.myAnim = function () {
	    circle.animate({
	        r: nextR,
	        fill: color,
	        stroke: color,
	        'stroke-opacity': .5,

	    },
	    dur,
	    minaStyle,
	    function () {
	        circle.animate({
	            r: r,
		        fill: defaultColor,
	            stroke: defaultColor,
	            'stroke-opacity': 0,
	        },
	        durBack,
	        minaStyle,
	        this.myAnim
	    );}
	    );
	  }

	  circle.mouseover(this.myAnim);
	};

	function getHSL (h) {
	    var colorParts = [h,100,50].join(',');
	    return 'hsl(' + colorParts + ')';
	}

	var contur = {
	    0: [0,1,2, 8,9,10, 11,12, 18,19,20],
	    1: [0,1, 9,10,11, 19,20],
	    2: [0, 10, 20],
	    3: [0, 20],
	    10: [0, 20],
	    11: [0, 20],
	    12: [0,1, 19,20],
	    13: [0,1,2, 18,19,20],
	    14: [0,1,2,3, 17,18,19,20],
	    15: [0,1,2,3,4, 16,17,18,19,20],
	    16: [0,1,2,3,4,5, 15,16,17,18,19,20],
	    17: [0,1,2,3,4,5,6, 14,15,16,17,18,19,20],
	    18: [0,1,2,3,4,5,6,7, 13,14,15,16,17,18,19,20],
	    19: [0,1,2,3,4,5,6,7,8, 12,13,14,15,16,17,18,19,20],
	    20: [0,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20],
	};

	function createScene () {
	    var shapesCounter = 0;

	    for( var i = 0; i < max; i ++ ){
	        var row = contur[i];

	    	for( var k = 0; k < max; k ++ ){
	            if ( row && row.indexOf(k) != -1 ){
	                continue;
	            }
	        	var newShape = new Shape;
	            var params = {
	                x: k,
	                y: i,
	                pos: shapesCounter
	            };
	            newShape.init(params);
	            shapesCounter++;
	    	}
	    }

	}

	createScene ();


});


