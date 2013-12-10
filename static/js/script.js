/*global
	triggersPoints: [],
	hashElements: [],
	currentHashEl: "some string",
	contentScrollTop: 200
*/

var slideMenu;
$(window).load(function() {
	if($(window).width()>mobileWidth){
		slideMenu = $("#nav").pullSlider({inmode:false});
	} else {
		slideMenu = $("#nav").pullSlider({inmode:true});
	}

	bringOutStaticBackground();

	$(window).on("resize",function(){
		if($(window).width()>mobileWidth){
			slideMenu.disable();
		} else {
			slideMenu.enable();
		}
	});
});
// var hoverTimer;
// $(window).scroll(function(){
// 	clearTimeout(hoverTimer);
// 	console.log("scrolling");
// 	$(document.body).addClass('disable-hover');

// 	hoverTimer = setTimeout(function(){
// 		$(document.body).removeChild('disable-hover');
// 	},500);
// })

// $( window ).resize(function() {
// 	resizeRows();
// });


function resizeRows(){
	var subRows = $(".sub-row");
	subRows.each(function(index){
		var height = findChildrenHeight(subRows[index]);
		subRows[index].style.height = height+"px";
	});

	var rows = $(".row");
	rows.each(function(index){
		var height = findChildrenHeight(rows[index]);
		rows[index].style.height = height+"px";
	});
	findTriggerPoints();
}
function findChildrenHeight(parent){
	var children = $(parent).children();
	var height = 0;
	if($(children[0]).css("position") == "absolute"){
		for(var a = 0, max = children.length; a < max; ++a){
			var nheight = $(children[a]).outerHeight(true);
			if(nheight > height){
				height = nheight;
			}
			if(children[a].nodeName === "IMG"){
				children[a].onload = resizeRows;
			}
		}
	} else {
		for(var a = 0, max = children.length; a < max; ++a){
			height += $(children[a]).outerHeight(true);
			if(children[a].nodeName === "IMG"){
				children[a].onload = resizeRows;
			}
		}
	}
	return height;
}


function setupnav(){
	var links = $(".link-to-page");
	links.each(function(index){
		$(links[index]).click(function(){
			var linkto = this.getAttribute("href").split("/");
			clearHighLight();
			heighLightEl(this);
			linkto = linkto[linkto.length-1];
			loadNextPage(linkto);
			return false;
		});
	});

	//$("#nav img").on("click",loadNextPage);//for the home being the index page
	$("#nav img").on("click",function(){clearHighLight();loadNextPage("home");});
}
function loadNextPage(address){
	if(loading || address == pageSlug){
		return false;
	}
	loading = true;
	loadingElement.style.display = "block";
	var newPage = "";
	if(typeof address !== "object"){
		newPage = "/ajax/"+address+"/";
	} else{
		newPage = "/ajax/index/";
	}
	var nextpage = $("#next-page");
	nextpage.load(newPage,function(){

		this.style.left = "0%";
		this.className = "page animated slideInRight " + address;
		bringInStaticBackground();
		$(this).scrollTop(0);
		$("#content").scrollTop(0);
		$("#content")[0].className = "page animated slideOutLeft";
		if (history && history.pushState) {
			var newAddress = "/";
			if(typeof address !== "object"){
				newAddress = "/"+address+"/";
			}
			history.pushState("","",newAddress);
		}
		var newSubnav = $("#subnav-new")[0];
		var oldSubnav = $("#subnav")[0];
		newSubnav.style.display = "block";
		oldSubnav.className = "animated slideOutUp";
		$("#subnav")[0].parentNode.appendChild(newSubnav);
		moveButtonDown();
		newSubnav.className = "animated slideInDown";
		resizeRows();
		setTimeout(clearAnimation,1000);
		setTimeout(resetTheNames,1001);
		currentHashEl="";
	});
	nextpage.addClass(address);
}
function moveButtonDown(){
	var lastB = $(".last-button")[0];
	lastB.parentNode.appendChild(lastB);
}
function clearAnimation(){
	var elements = $(".animated");
	elements.removeClass('animated');
	elements.removeClass('slideInRight');
}
function setupNav(){
	var subNav = $("#subnav");
}
function clearHighLight() {
	$(".heighlight").removeClass('heighlight');
}
function heighLightEl(element) {
	$(element).addClass('heighlight');
}
function resetTheNames() {
	loadingElement.style.display = "none";
	var oldcontent = $("#content")[0];
	var newcontent = $("#next-page")[0];
	oldcontent.id = "next-page";
	oldcontent.style.left = "100%";
	oldcontent.className = "page";
	oldcontent.innerHTML = "";
	newcontent.id = "content";

	newcontent.parentNode.appendChild(newcontent);
	var newSubnav = $("#subnav-new")[0];
	var oldSubnav = $("#subnav")[0];
	var parent = oldSubnav.parentNode;
	parent.removeChild(oldSubnav);
	newSubnav.id = "subnav";
	newSubnav.className = "";
	setupNavClicks(newSubnav);

	slideMenu.refindHeight();
	bringOutStaticBackground();

	loading = false;
}

function bringOutStaticBackground(){
	var el = $(".background.fullscreen.fixed")[0];
	if(el){
		console.log("bringing out ",el);
		document.body.appendChild(el);
	}
}
function bringInStaticBackground(){
	var el = $("body .background.fullscreen.fixed")[0]
	if(el){
		console.log("bringing in ", el.parentNode.id ,el);
		if(el.parentNode.id != "next-page"){
			console.log("bring it in performed");
			$("#content")[0].appendChild(el);
		}
	}
}
function setupNavClicks(element){
	var elements = $(element).children();
	for(var a = 0, max = elements.length; a<max; a += 1 ){
		$(elements[a]).click(function(event){
			event.preventDefault();
			currentHashEl = this.href.split("#")[1];
			jumpToLocation();
			setURL();
		});
	}
}

//google analytics function
//when ever we load in new content we replace the hashElements with the id's of the elements
//we also then reload the height triggering points loading them into the triggersPoints array
function findTriggerPoints() {
	triggersPoints = [];
	var offset = $("#content").scrollTop();
	for(var a = 0, max =  hashElements.length; a < max; a += 1){
		triggersPoints.push($("#"+hashElements[a]).offset().top +offsetfindtrigger + offset);
		if(a+1 >= max){
			triggersPoints.push(triggersPoints[triggersPoints.length-1]+$("#"+hashElements[a]).height()+offsetfindtrigger);
		}
	}
}
function scrollDetectionFunc(){
	contentScrollTop = $(this).scrollTop();
	//check if there is more than 1 point
	if(triggersPoints.length > 1){
		//for each point check if it crossed it
		for(var a = 0; a < triggersPoints.length; a += 1){
			//if the scroll point is less than then next but greater than current
			if(hashElements[a] !== currentHashEl && triggersPoints[a] < contentScrollTop &&triggersPoints[a+1] > contentScrollTop){
				currentHashEl = hashElements[a];
				setURL();
			}
		}
	}
}
function setURL(){
	if (history && history.pushState) {
		var newAddress = "/";
		var gaAddress = "/";
		if(typeof address !== "object"){
			newAddress = "/"+pageSlug+"/"+currentHashEl+"/";
			gaAddress = "/" +pageSlug+"/"+currentHashEl;
		}
		history.pushState(currentHashEl,"",newAddress);
		//console.log(newAddress);
		_gaq.push(['_trackPageview', gaAddress ]);
	}
}
function jumpToLocation(){
	$("#content").scrollTop($("#"+currentHashEl).offset().top + $("#content").scrollTop());
}
function trackOutboundLink(link, category, action) {
	try {
		_gaq.push(['_trackEvent', category , action]);
	} catch(err){}

	setTimeout(function() {document.location.href = link.href;}, 100);
}

var link = document.getElementById('my-link-id');

//Google Analytics Snippet
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-39447542-1']);
_gaq.push(['_setDomainName', 'none']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();










// MAP STUFF!!!
var myMapStyle = [
  {
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" },
      { "color": "#F7A4A6" }
    ]
  },{
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      { "visibility": "on" },
      { "color": "#ffffff" }
    ]
  }
]

//use http://itouchmap.com/latlong.html to determine LON and LAT
var from05 = {"data":[
	//2005
	{
		name:"KEVIN LIM",
		lat:1.352083,
		lon:103.819836,
		icon: 0,
		description:"KK Women's and Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"WARREN TERRY",
		lat:-8.783195,
		lon:34.508523,
		icon: 0,
		description:"Mission Work",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"MAHZAD JAVID",
		lat:32.427908,
		lon:53.688046,
		icon: 0,
		description:"Paediatric Orthopaedist",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"JOSEPH JANICKY",
		lat:41.878114,
		lon:-87.629798,
		icon: 0,
		description:"Children's Memorial Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"SIMON THOMAS",
		lat:51.454513,
		lon:-2.587910,
		icon: 0,
		description:"Bristol Royal Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"ATUL BHASKAR",
		lat:19.075984,
		lon:72.877656,
		icon: 0,
		description:"Children's Specialty Orthopaedic Clinic",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from06 = {"data":[
	{
		name:"SUBIR JHAVERI",
		lat:23.039568,
		lon:72.566004,
		icon: 1,
		description:"Dr. Subir Jhaveri's Spine Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"SCOTT MACKIE",
		lat:-42.894523,
		lon:147.309491,
		icon: 1,
		description:"St. Johns Private Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"LEONHARD RAMSEIER",
		lat:47.368650,
		lon:8.539183,
		icon: 1,
		description:"University Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"FABIO FERRI-DE-BARROS",
		lat:51.045325,
		lon:-114.058101,
		icon: 1,
		description:"Alberta Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"PAUL JELLICOE",
		lat:49.899754,
		lon:-97.137494,
		icon: 1,
		description:"Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"EYAL MERCADO",
		lat:32.830361,
		lon:34.974338,
		icon: 1,
		description:"Carmel Hospital, Paediatric Orthopaedic Service",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from07 = {"data":[
	{
		name:"SHAHRYAR NOORDIN",
		lat:24.893379,
		lon:67.028061,
		icon: 2,
		description:"Aga Khan University",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"OM PRAKASH SHARMA",
		lat:43.653226,
		lon:-79.383184,
		icon: 2,
		description:"Mt. Sinai Hospital, Clinical Fellowship",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"FEDERICO CANAVESE",
		lat:45.777222,
		lon:3.087025,
		icon: 2,
		description:"University Hospital of Clermont-Ferrand",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"ANDREW GONG",
		lat:-37.875922,
		lon:145.129305,
		icon: 2,
		description:"Waverley Private Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"RICHARD HOCKING",
		lat:-35.282000,
		lon:149.128684,
		icon: 2,
		description:"Capital Orthopaedics,",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from08 = {"data":[
	{
		name:"MICHAEL SEGBEFIA",
		lat:5.555717,
		lon:-0.196306,
		icon: 3,
		description:"Korle-Bu Teaching Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"MAULIN SHAH",
		lat:23.039568,
		lon:72.566004,
		icon: 3,
		description:"Sterling Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"CRISTINA ALVES",
		lat:40.202379,
		lon:-8.447156,
		icon: 3,
		description:"Staff position",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"SIMON KELLEY",
		lat:43.653226,
		lon:-79.383184,
		icon: 3,
		description:"The Hospital for Sick Children",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"KARL LOGAN",
		lat:44.648862,
		lon:-63.575320,
		icon: 3,
		description:"IWK Health Centre",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"MICHAEL ZAIDMAN",
		lat:32.830361,
		lon:34.974338,
		icon: 3,
		description:"Rambam Medical Centre",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from09 = {"data":[
	{
		name:"BENJAMIN HOLROYD",
		lat:50.375456,
		lon:-4.142656,
		icon: 4,
		description:"Derriford Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"DOMINIQUE KNIGHT",
		lat:55.953252,
		lon:-3.188267,
		icon: 4,
		description:"The Royal Infirmary of Edinburgh",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"FRANCISCO NYIIRO",
		lat:9.022736,
		lon:38.746799,
		icon: 4,
		description:"CURE Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"ANNA CUOMO",
		lat:34.052234,
		lon:-118.243685,
		icon: 4,
		description:"Shriners Hospital for Children",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"KATHRYN DOUGHTY",
		lat:34.052234,
		lon:-118.243685,
		icon: 4,
		description:"Shriners Hospital for Children",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"THOMAS PALOCAREN",
		lat:12.916517,
		lon:79.132499,
		icon: 4,
		description:"Christian Medical College Vellore",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"AHMED AL JAHWARI",
		lat:23.610000,
		lon:58.540000,
		icon: 4,
		description:"Muscat City Centre",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from10 = {"data":[
	{
		name:"JASON DONOVAN",
		lat:-37.787001,
		lon:175.279253,
		icon: 5,
		description:"Waikato Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"STEPHEN COOKE",
		lat:52.406822,
		lon:-1.519693,
		icon: 5,
		description:"University Hostpitals Coventry and Warwickshire",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"EMILY DODWELL",
		lat:40.714353,
		lon:-74.005973,
		icon: 5,
		description:"Hospital for Special Surgery",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"DAVID WRIGHT",
		lat:53.193392,
		lon:-2.893075,
		icon: 5,
		description:"Countess of Chester Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"TALAL IBRAHIM",
		lat:-33.867487,
		lon:151.206990,
		icon: 5,
		description:"Sydney Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"WALTER TRUONG",
		lat:44.953703,
		lon:-93.089958,
		icon: 5,
		description:"Gilette Children's Specialty Healthcare",
		interAction:["mouseover","mouseout","click"]
	}]}
var from11 = {"data":[
	{
		name:"ZAID AL-AUBAIDI",
		lat:55.403756,
		lon:10.402370,
		icon: 6,
		description:"Odense UNiversity Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"HENRY ELLIS",
		lat:32.780140,
		lon:-96.800451,
		icon: 6,
		description:"Texas Scottish Rite Hospital, Children's Medical Center",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"ABDELSALAM HEGAZY",
		lat:25.280282,
		lon:51.522476,
		icon: 6,
		description:"Sidra Medical and Research Center",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"KRISTOPHER LUNDINE",
		lat:48.428421,
		lon:-123.365644,
		icon: 6,
		description:"Royal Jubilee Hospital, Victoria General Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"CHARLES POPKIN",
		lat:40.714353,
		lon:-74.005973,
		icon: 6,
		description:"Columbia University",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"LIN FENG",
		lat:24.479834,
		lon:118.089425,
		icon: 6,
		description:"Xiamen Women and Children's Hospital",
		interAction:["mouseover","mouseout","click"]
	}
	]}
var from12 = {"data":[
	{
		name:"Brant Sachleben",
		lat:42.358431,
		lon:-71.059773,
		icon: 7,
		description:"Boston Children’s Hospital (Fellowship)",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"Sonia Chaudhry",
		lat:41.763711,
		lon:-72.685093,
		icon: 7,
		description:"Connecticut Children's Medical Center",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"Richard Gardner",
		lat:9.022736,
		lon:38.746799,
		icon: 7,
		description:"CURE Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"Michael Bensimon",
		lat:44.983334,
		lon:-93.266670,
		icon: 7,
		description:"Twin Cities Shriners Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"Mohamed Kenawey",
		lat:26.559074,
		lon:31.695671,
		icon: 7,
		description:"Sohag University Hospital",
		interAction:["mouseover","mouseout","click"]
	},
	{
		name:"Sattar Alshryda",
		lat:53.479324,
		lon:-2.248485,
		icon: 7,
		description:"Royal Manchester Children Hospital",
		interAction:["mouseover","mouseout","click"]
	}]}





