/*global triggersPoints: [], hashElements: [], currentHashEl: "some string", contentScrollTop: 200 */

function resizeRows(){
	var rows = $(".row");
	rows.each(function(index){
		var children = $(rows[index]).children();
		var height = 0;
		for(var a = 0, max = children.length; a < max; ++a){
			var nheight = $(children[a]).height();
			if(nheight > height){
				height = nheight;
			}
			if(children[a].nodeName === "IMG"){
				children[a].onload = resizeRows;
			}
		}
		rows[index].style.height = height+"px";
	});
	findTriggerPoints();
}

// resizeRows();

$( window ).resize(function() {
	resizeRows();
});


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
	$("#nav img").on("click",function(){loadNextPage("home")});
}



var slideMenu;
$(window).load(function() {
	if($(window).width()>mobileWidth){
		slideMenu = $("#nav").pullSlider({inmode:false});
	} else {
		slideMenu = $("#nav").pullSlider({inmode:true});
	}

	$(window).on("resize",function(){
		if($(window).width()>mobileWidth){
			slideMenu.disable();
		} else {
			slideMenu.enable();
		}
	});
});


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
		this.className = "page animated slideInRight";
		$(this).scrollTop(0);
		$("#content").scrollTop(0);
		$("#content")[0].className = "page animated slideOutLeft";
		if (history && history.pushState) {
			var newAddress = "/";
			if(typeof address !== "object"){
				newAddress = "/page/"+address+"/";
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
	loading = false;
}

function setupNavClicks(element){
	var elements = $(element).children();
	for(var a = 0, max = elements.length; a<max; a += 1 ){
		$(elements[a]).click(function(event){
			event.preventDefault();
			currentHashEl = this.href.split("#")[1];
			jumpToLocation();
			// setURL();
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
				// setURL();
			}
		}
	}
}

function setURL(){
	if (history && history.pushState) {
		var newAddress = "/";
		if(typeof address !== "object"){
			newAddress = "/page/"+pageSlug+"/"+currentHashEl+"/";
		}
		history.pushState(currentHashEl,"",newAddress);
	}
}

function jumpToLocation(){
	$("#content").scrollTop($("#"+currentHashEl).offset().top + $("#content").scrollTop());
}

