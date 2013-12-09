// this is using bohdan@alsocollective api access usage key: AIzaSyBkV96cb90IRP3z54fwmQlLH_Fpo4p4rbk
// to run the docs localy use 
// $yuidoc --server .
/**
Jmap simplified google maps project<br>
<h4>Created by:</h4>
test

@module Jmap

**/


/**
Jmap is the container for all the action going on with this plugin for Jquery<br>
a standard start up includes:
@example
	<html>
	<head>
	<style type="text/css">
	#google-maps{
		width: 100%;
		height: 100%;
	}
	</style>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<script src="http://alsocollective.github.io/also-cdn/js/j-map/j-map.js"></script>
	<script src="http://alsocollective.github.io/also-cdn/js/j-map/infobubble.js"></script>
	<script src="http://alsocollective.github.io/also-cdn/js/j-map/markerclusterer.js"></script>
	</head>
	<body>
	<div id="google-maps"></div>
	<script type="text/javascript">
	var myMap = $("#google-maps").Jmap({
	    defaultZoom:3,
	    locationLat:43.648616,
	    locaiotnLon:-79.396644,
	    mapStyles:myMapStyle,
	    debugMode:true
	});
	function JmapGoogleReady(){
	    myMap.init();
	}
	</script>
	</body>
	</html>

<h4>Created by:</h4>
<a href="http://www.bohdananderson.com" target="_blank"> Bohdan Anderson</a> @ <a href="http://www.alsocollective.com" target="_blank">Also Collective</a>

@namespcae JMAP
@constructor
@class Jmap
@constructor
@example
	var myMap = $("#google-maps").Jmap({
		defaultZoom:18,
		locationLat:43.648616,
		locaiotnLon:-79.396644,
		funOnClick:function(id){
			console.log(id)
		}
	});
	function JmapGoogleReady(){
		myMap.init();

		//this marker type is added at #0, so for the data the icon must be set to #0
		myMap.addMarkerType({
			url: '/static/img/takeaction-btn.png',
			size: [100,100],
			origin: [0,0],
			anchor: [20,90],
			scaledSize:[100,100]
		})
		myMap.addMarkerType({
			url: '/static/img/entry.png',
			size: [22,33],
			origin: [0,0],
			anchor: [11,33],
			scaledSize:[22,33]
		})

		myMap.setupOverlay();
		myMap.loadData(jsonRequestData);
	}

@param {Object} [options] Data that specifies, the functionality and look of the plugin
	@param {String} [options.apiKey] Needed for this plugin to work, go to google to get the api key
	@param {Number} [options.locationLat] Latitude of map on load
	@param {Number} [options.locaiotnLon] Longitude of map on load
	@param {Boolean} [options.autoStart] If 'true', will start loading the map right way, 'false', will wait
	@param {String} [options.mapStyles] Generate the Json format from <a href="http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html" target="_blank">here</a>
	@param {Number} [options.defaultZoom] Default is 8, determines the zoom on load
	@param {Boolean} [options.oneIconAtATime] Default is true, will hide all other info bubbles when opening a new one
	@param {funciton} [options.funOnClick] this is ran when the marker is clicked, if true it will do the default stuff other wise nothing will happen
	@param {funciton} [options.funOffClick] this is ran when an other marker is clicked, if true it will do the default stuff other wise nothing will happen


	@param {Number} [options.infoPadding] px size
	@param {Number} [options.infoArrowSize] px size
	@param {Number} [options.infoArrowPosition] from bottom left px amount
	@param {Number} [options.infoArrowStyle] 

	@param {Number} [options.infoBorderRadius] px size
	@param {Number} [options.infoBorderWidth] px size
	@param {Color} [options.infoBorderColor] rgb or hex or w.e colour means you want
	@param {Number} [options.infoShadowStyle] 0,1,2

	@param {Color} [options.infoBackgroundColor] rgb or hex or w.e colour means you want
	@param {String} [options.infoBackgroundClassName] string value, default is gmap-overlay

	@param {Boolean} [options.infoHideCloseButton] Hide button...
	@param {Boolean} [options.infoDisableAnimation] Pop in animation
	@param {Boolean} [options.infoDisableAutoPan] Centers the map to location of marker when clicked

	@param {Boolean} [options.zoomControl] Toggle to control visibilty of zoom controls
	@param {Object} [options.zoomControlOptions] Set various options for zoomo controls
	@param {Object} [options.zoomControlOptions.style] Options include size and
**/

var google = {};
google.maps = null;

(function ( $ ) {
$.fn.Jmap = function( options ) {
	var settings = $.extend({
		autoStart:true,
		activeMap:null,
		mapContainer:null,
		selectedElement: this[0],

		//Controls
		zoomControl: false,

		locationLat:-34.397,
		locaiotnLon:150.644,
		defaultZoom:8,
		mapStyles:null,
		maxZoom:5,
		minZoom:2,
		apiKey:"AIzaSyBkV96cb90IRP3z54fwmQlLH_Fpo4p4rbk",

		//loaded in data
		dataObjectList:[],
		markersList:[],
		markers:true,
		markerTypes:[],
		oneIconAtATime:true,
		funOnClick:function(){return true;},
		funOffClick:function(){return true;},

		//infobubble styles
		infoShadowStyle: 0, //either 0, 1, or 3
		infoPadding: 5,
		infoBackgroundColor: 'rgb(255,255,255)',
		infoBorderRadius: 0,
		infoArrowSize: 12,
		infoBorderWidth: 0,
		infoBorderColor: 'transparent',
		infoHideCloseButton: true,
		infoArrowPosition: 0,
		infoBackgroundClassName: 'infobubble-bk',
		infoArrowStyle: 2,
		infoDisableAnimation:true,
		infoDisableAutoPan: false,

		//Marker object
		makerCluster:null,
		autoload: false,

		debugMode:false

	}, options );

	if(settings.debugMode){
		console.log("Debug MODE is turned on");
	}
	loadScript();

	function loadScript(){
		if(settings.debugMode)console.log("loading maps script");

		if(!settings.selectedElement){
			settings.selectedElement = this;//document.getElementById("google-maps")
		}
		var script = document.createElement('script');
		if(google.maps){
			if(settings.debugMode)console.log("google.maps is already loaded...");
			settings.autoload = true;
		}else{
			if(settings.debugMode)console.log("load google map script");
			if(settings.debugMode)console.log(settings.selectedElement);

			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?key='+ settings.apiKey +'&sensor=false&' + 'callback=JmapGoogleReady';
			$(settings.selectedElement).after(script);
		}
	}
/**
To start the map, should only be called once the map api has been loaded, which is done auto by this plugin

@method init
@required
@example
	function JmapGoogleReady(){
	    myMap.init();
	}
**/
	this.init = function(){
		if(settings.debugMode){
			console.log("init is called");
		}
		var mapOptions = {
			zoom: settings.defaultZoom,
			center: new google.maps.LatLng(settings.locationLat,settings.locaiotnLon),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			maxZoom:10,
			minZoom:settings.minZoom,
			zoomControl: settings.zoomControl,
			zoomControlOptions: settings.zoomControlOptions,
			scrollwheel: false,
			zoomControl: true,
			    zoomControlOptions: {
			      style: google.maps.ZoomControlStyle.SMALL
			    }
		}
		if(settings.mapStyles){
			if(settings.debugMode){
				console.log("set Map Style");
			}
			mapOptions.styles = settings.mapStyles
		}
		settings.activeMap = new google.maps.Map(settings.selectedElement, mapOptions);
	}

/**
Initialized the over lay, added className "gmap-overlay"(by default) to each square of google map <br>
Use this only once<br>
example of the css to be used

@example
	.gmap-overlay{
		background-image: url("/static/img/cat.png");
		-webkit-background-size: cover;
		-moz-background-size: cover;
		-o-background-size: cover;
		background-size: cover;
	}

@method setupOverlay
**/
	this.setupOverlay = function(){
		function CoordMapType(tileSize) {
			this.tileSize = tileSize;
		}
		CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
			var div = ownerDocument.createElement('div');
			div.className = "gmap-overlay";
			div.style.width = this.tileSize.width + 'px';
			div.style.height = this.tileSize.height + 'px';
			return div;
		};

		settings.activeMap.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256)));
	}

/**
Generates a new marker, <br>
reference the created markers in order of creation starting with 0. <br>
You can use origin on a sprite sheet to use one image for all your icons

@example
	myMap.addMarkerType({
		url: '/static/img/takeaction-btn.png',
		size: [100,100],
		origin: [0,0],
		anchor: [20,90],
		scaledSize:[100,100]
	})

@method addMarkerType
@param {Object} options
	@param {String} options.url Url of the icon to be used
	@param {Array} options.size Size of the icon to be loaded, [100,100]
	@param {Array} options.origin Origin, what corner should be thought of as zero, [0,0]
	@param {Array} options.anchor Anchor, the moving location... I use this to zero, [20,90]
	@param {Array} options.scaledSize ScaleSize, what size the icon should be shown as
**/

	this.addMarkerType = function(optionsin){

		var markerImage = null;
		if(optionsin.type == "svg"){
			markerImage = optionsin;
		} else {
			if(!optionsin.url){
				console.log("need to have a url to the image for this to work")
				return null
			}
			var locSettings = $.extend({
				size: [100,100],
				origin: [0,0],
				anchor: [0,0],
				scaledSize:[100,100]
			}, optionsin);

			markerImage = {
				url: optionsin.url,
				size: new google.maps.Size(locSettings.size[0], locSettings.size[1]),
				origin: new google.maps.Point(locSettings.origin[0], locSettings.origin[1]),
				anchor: new google.maps.Point(locSettings.anchor[0],locSettings.anchor[1]),
				scaledSize: new google.maps.Size(locSettings.scaledSize[0], locSettings.scaledSize[1])
			};
		}
		settings.markerTypes.push(markerImage);
	}

	function makeMarker(values){
		var id = settings.dataObjectList.length;
		var pos = new google.maps.LatLng(values.lat,values.lon);

		var icon = settings.markerTypes[values.icon];
		if(values.scale>1){
			icon = Object.create(icon)
			icon.scale = values.scale;
		}
		icon.strokeWeight = values.strokeWeight;
		icon.anchor = {x:(5.5) , y:(14.5)};


		var marker =  new google.maps.Marker({
			position: pos,
			icon: icon,
			title: values.name,
			map: settings.activeMap,
			id : id,
			displayInfo: false,
			defIcon:values.icon,
			altIcon:values.altIcon
		});

		var infoBubble = null;
		if(values.description){
			infoBubble = new InfoBubble({
				map: settings.activeMap,
				content: values.name + ": " + values.description,
				position: pos,
				shadowStyle: settings.infoShadowStyle,padding: settings.infoPadding,backgroundColor: settings.infoBackgroundColor,borderRadius: settings.infoBorderRadius,arrowSize: settings.infoArrowSize,borderWidth: settings.infoBorderWidth,borderColor: settings.infoBorderColor,hideCloseButton: settings.infoHideCloseButton,arrowPosition: settings.infoArrowPosition,backgroundClassName: settings.infoBackgroundClassName,arrowStyle: settings.infoArrowStyle,disableAnimation:settings.infoDisableAnimation,disableAutoPan:settings.infoDisableAutoPan,
				id:id
			});
		}

		settings.dataObjectList.push([marker,infoBubble])
		settings.markersList.push(marker);

		for(var a = 0, max = values.interAction.length; a < max; a += 1){
			google.maps.event.addListener(marker, values.interAction[a], function() {
				if(settings.debugMode){
					console.log("called " + values.interAction + " On " + this.id);
				}
				if(settings.dataObjectList[this.id][0].displayInfo == false){
					if(settings.oneIconAtATime){
						setAllIconsFalse();
					}
					if(settings.funOnClick(this.id,settings)){
						show(this.id);
					}
				} else {
					if(settings.funOffClick(this.id,settings)){
						hideEl(this.id);
					}
				}
			});
		}
	}

	function setAllIconsFalse(){
		for(var a=0; a < settings.dataObjectList.length; ++a){
			if(settings.dataObjectList[a][0].displayInfo){
				hideEl(a);
			}
		}
	}


/**
Makes the map cluster elements, <br>
for more reference look at <a href="http://google-maps-utility-library-v3.googlecode.com/svn/tags/markerclustererplus/2.1.1/docs/reference.html"> link </a>

@example
	myMap.useCluster({
		imagePath: '/static/img/base-',
		imageSizes: [100,100],
		averageCenter:true
	});

@method useCluster
@param {Object} cOptions
	@param {String} cOptions.imagePath Url of the icon to be used, this is a bit funny, for we don't need to end the string with .png and 1 must be the last letter in the name of the file
	@param {Array} cOptions.imageSizes Size of the icon to be loaded, [100,100]
	@param {Boolean} cOptions.averageCenter
**/
	this.useCluster = function(cOptions){
		var clusterSettings = $.extend({
			imagePath: 'http://alsocollective.github.io/also-cdn/js/j-map/static/img/base-',
			imageSizes: [100,100],
			averageCenter:true
		}, cOptions);
		settings.makerCluster = new MarkerClusterer(
			settings.activeMap,
			settings.markersList,
			clusterSettings
			);
	}


/**
Loads Marker data into map. <br>
Be sure to create the icon types before loading.

@method loadData
@param {Object} json location data
	@param {String} json.name What will show up for mouse over, not really special
	@param {Number} json.lat Latitude of marker
	@param {Number} json.lon Longitude of marker
	@param {Number} json.icon The numbers here relate to the order in which .addMarkerType are created
	@param {Number} json.altIcon when clicked this Icon will be shown
	@param {String} json.description The text will be displayed in the text box

@example
	{"data":[
		{
			"name":"Us",
			"lat":43.649517,
			"lon":-79.397373,
			"icon": 0,
			"altIcon":1,
			"description":"some test info"
		},
		{
			"name":"Them",
			"lat":43.648717,
			"lon":-79.396475,
			"icon": 0,
			"altIcon":1,
			"description":"some test info"
		},

	]}
**/
	this.loadData = function(json,checkForDoubles){
		if(settings.debugMode){
			console.log(json["data"]);
		}
		if(settings.markerTypes){
			if(checkForDoubles){

				//find all locations with same lat
				var allMarks = [];
				for(var a = 0, max = json.data.length; a < max; a += 1){
					var total = 0;
					var marks = [];
					for(var b = 0; b < max; b += 1){
						var lat1 = json.data[a].lat,
						lat2 = json.data[b].lat,
						lon1 = json.data[a].lon,
						lon2 = json.data[b].lon,
						varience = 0.5;
						if((lat1 == lat2 && lon1 == lon2) || (lat1 > lat2-varience && lat1 < lat2+varience && lon1 > lon2-varience && lon1 < lon2+varience )){
							if(a != b){
								console.log(json.data[a].lat)
							}
							marks.push(json.data[b]);
						}
					}
					if(marks.length > 1){
						// allMarks.push(marks);
						marks[0].scale = 2;
						marks[0].strokeWeight = 0.5;
						marks[1].lat = marks[0].lat;
						marks[1].lon = marks[0].lon;
					}
				}
			}
			$.each(json["data"],function(index,value){
				var values = $.extend({
					lat:0,
					lon:0,
					icon:0,
					altIcon:0,
					name:"no-name",
					interAction:["click"],
					scale:1,
				}, value );
				makeMarker(values)
				if(settings.debugMode){
					console.log(value);
				}
			})
		}
	}

	function show(id) {
		settings.dataObjectList[id][1].open(settings.activeMap, settings.dataObjectList[id][0]);
		settings.dataObjectList[id][0].setIcon(settings.markerTypes[settings.dataObjectList[id][0].altIcon]);
		settings.dataObjectList[id][0].displayInfo = true;
	}
	function hideEl(id){
		settings.dataObjectList[id][1].close(settings.activeMap, settings.dataObjectList[id][0]);
		settings.dataObjectList[id][0].setIcon(settings.markerTypes[settings.dataObjectList[id][0].defIcon]);
		settings.dataObjectList[id][0].displayInfo = false;
	}

	// OVER LAY STUFF

	this.autoload = function(){
		if(settings.debugMode) console.log("checking auto run");
		if(settings.autoload){
			if(settings.debugMode) console.log("running auto run");
			JmapGoogleReady();
		}
	}

	this.createZoomButtons = function(){
		var buttonConatier = document.createElement("div");
		buttonConatier.id="zoom-button-container";
		var zoomIn = document.createElement("a");
		zoomIn.href="#zoomin";
		zoomIn.id = "zoom-in";
		zoomIn.innerHTML = "+";
		$(zoomIn).click(function(event){
			event.preventDefault();
			settings.defaultZoom += 1;
			if(settings.defaultZoom > settings.maxZoom){
				settings.defaultZoom = settings.maxZoom;
			}
			settings.activeMap.setZoom(settings.defaultZoom);
			return null;
		});

		var zoomOut = document.createElement("a");
		zoomOut.id = "zoom-out";
		zoomOut.innerHTML = "-";
		zoomOut.href="#zoomout";
		$(zoomOut).click(function(event){
			event.preventDefault();
			settings.defaultZoom -= 1;
			if(settings.defaultZoom < settings.minZoom){
				settings.defaultZoom = settings.minZoom;
			}
			settings.activeMap.setZoom(settings.defaultZoom);
			return null;
		});

		buttonConatier.appendChild(zoomIn);
		buttonConatier.appendChild(zoomOut);
		settings.selectedElement.parentNode.appendChild(buttonConatier);
	}

	return this;

};

}( jQuery ));









