(function( $ ) {

$.fn.pullSlider = function( options ) {
	var settings = $.extend({
		display: false,
		animationSlideTime: 500,
		inmode: true,
		location:"top",
		//doesn't matter if you change these when you load in the options...
		element: this,
		accel: 0,
		last: 0,
		height:0,
		windowHeight:0,
		toggelbutton: false,
		tbheight: 0,
		selected:false
	}, options );

	switch(settings.location){
		case "top":
			settings.toggelbutton = $(this.children()[this.children().length-1]);
			break;
		case "bottom":
			settings.toggelbutton = $(this.children()[0]);
			break;
		default:
			settings.toggelbutton = $(this.children()[this.children().length-1]);
	}
	if(settings.inmode){
		if(!this.hasClass("pull-slider")){
			this.addClass('pull-slider');
		}
		resetHeight();
		putToPosistion(true);
	}

	this.disable = function(){
		if(settings.inmode){
			settings.element.removeClass('pull-slider');
			settings.element.css({height:"auto",top:"0px"});
			settings.inmode = false;
		}
	}

	this.enable = function(){
		if(!settings.inmode){
			settings.element.addClass('pull-slider');
			resetHeight();
			putToPosistion(true);
			settings.inmode = true;
		}
	}

	this.refindHeight = function(){
		resetHeight();
		settings.display = false;
		putToPosistion();
	}

	$(window).resize(function(){
		if(settings.inmode){
			resetHeight();
			putToPosistion(true);
		}
	});
	//toggle for the desktop and other devices which do not support the touch movements
	settings.toggelbutton.on("click",function(){
		if(settings.inmode){
			if(settings.display){
				settings.display = false;
			} else {
				settings.display = true;
			}
			putToPosistion();
		}
	});
	//enable the rest of the touch inputs to work by enabling settings.selected
	settings.toggelbutton.on("touchstart",function(){
		if(settings.inmode){
			settings.toggelbutton.addClass('selected');
			settings.selected = true;
			settings.last = settings.element.offset().top;
			settings.height = settings.element.height();
		}
	})
	//as the user moves over the screen the element follows their touch, by preventing default we do not allow click to be triggered, we also do the math for the acceleration of the menu
	if (window.addEventListener){
	window.addEventListener("touchmove",function(event){
		if(settings.selected){
			event.preventDefault();
			var touched = event["targetTouches"]["0"];
			var thispos = settings.element.offset().top;
			settings.accel = settings.last - thispos;
			settings.last = thispos;
			var tLoc = 0;
			switch(settings.location){
				case "top":
					tLoc = touched["clientY"]-settings.height+(settings.tbheight);
					break;
				case "bottom":
					tLoc = touched["clientY"];
					break;
				default:
					tLoc = touched["clientY"]-settings.height;
			}
			if(touched["clientY"]-settings.height < 0 && touched["clientY"]-settings.height > -settings.height){
				settings.element.css("top",tLoc);
			}
		}
	});
	}
	//from the acceleration calced in the touchmove we send the navigation bar to where it needs to end up
	$(window).on("touchend",function(){
		if(settings.selected){
			toggleAnimation(true);
			switch(settings.location){
				case "top":
					if(settings.accel <= 0){
						settings.display = true;
					} else {
						settings.display = false;
					}
					break;
				case "bottom":
					if(settings.accel >= 0){
						settings.display = true;
					} else {
						settings.display = false;
					}
					break;
			}

			putToPosistion();
			settings.toggelbutton.removeClass('selected');
			settings.selected = false;
		}
	})

	//set the height of the slider to either the window height if it's greater than it, or to it self, adding the full height style if needed
	function resetHeight(){
		settings.windowHeight = $(window).outerHeight();
		settings.element.height("auto");
		settings.height = settings.element.height();
		toggleSliderWindow();
		settings.tbheight = settings.toggelbutton.outerHeight(true);
	}

	function toggleSliderWindow(){
		if(settings.height >= settings.windowHeight && settings.display){
			settings.element.height(settings.windowHeight);
			if(!settings.element.hasClass('slider-window-height')){
				settings.element.addClass('slider-window-height');
			}
		} else {
			settings.element.height(settings.height);
			if(settings.element.hasClass('slider-window-height')){
				settings.element.removeClass('slider-window-height');
			}
		}
	}
	//slide either up or down the element based on the animation
	function putToPosistion(noscroll){
		if(settings.inmode){
			if(settings.display){
				if(noscroll == undefined || !noscroll){toggleAnimation(true);}
				switch(settings.location){
					case "top":
						settings.element.css("top","0");
						break;
					case "bottom":
						settings.element.css("top",settings.windowHeight-settings.height);
						break;
					default:
						settings.element.css("top","0");
				}
			} else {
				if(noscroll == undefined || !noscroll){toggleAnimation(true)};
				switch(settings.location){
					case "top":
						if(settings.windowHeight <= settings.height){
							settings.element.css("top",-settings.windowHeight+settings.tbheight);
						} else {
							settings.element.css("top",-settings.height+settings.tbheight);
						}
						break;
					case "bottom":
						settings.element.css("top",settings.windowHeight-settings.tbheight);
						break;
					default:
						settings.element.css("top","0");
				}
			}
			scrollToBottom();
		}
	}
	//toggle the animation class, but if set to true, add it and then remove it after the sliding animation time, if false remove it
	function toggleAnimation(toggleTo){
		if(!settings.element.hasClass('slider-animation')||toggleTo){
			settings.element.addClass('slider-animation');
			setTimeout(function(){
				toggleAnimation(false);
			},settings.animationSlideTime);
		} else if(settings.element.hasClass('slider-animation')||!toggleTo){
			settings.element.removeClass('slider-animation');
		}
	}
	//scroll the element to the bottom of the page
	function scrollToBottom(){
		console.log("should of scrolled all the way up");
		//settings.element[0].scrollHeight
		settings.element.scrollTop(settings.element.prop("scrollHeight"));
	}

	return this
};
	}( jQuery ));