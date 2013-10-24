var loadingElement = $("#loading")[0];
var animating = false;
resizeRows();

$( window ).resize(function() {
	resizeRows();
});

function resizeRows(){
	// console.log("resize Rows");
	var rows = $(".row");
	rows.each(function(index){
		var children = $(rows[index]).children();
		var height = 0;
		for(var a = 0, max = children.length; a < max; ++a){
			var nheight = $(children[a]).height();
			if(nheight > height){
				height = nheight;
			}
			if(children[a].nodeName == "IMG"){
				children[a].onload = resizeRows;
			}
		}
		rows[index].style.height = height+"px";
	});
	findTriggerPoints();
}

setupnav();
function setupnav(){
	// console.log("setup Nav");
	var links = $(".link-to-page");
	links.each(function(index){
		$(links[index]).click(function(){
			// event.preventDefault();
			if(!animating){
				animating = true;
				var linkto = this.getAttribute("href").split("/")
				clearHighLight();
				heighLightEl(this);
				linkto = linkto[linkto.length-1];
				loadNextPage(linkto);
			}
			return false;
		});
	});
}


var slideMenu;
$(window).load(function() {
	if($(window).width()>480){
		slideMenu = $("#nav").pullSlider({inmode:false});
	} else {
		slideMenu = $("#nav").pullSlider({inmode:true});
	}

	$(window).on("resize",function(){
		if($(window).width()>480){
			slideMenu.disable();
		} else {
			slideMenu.enable();
		}
	})
});


function loadNextPage(address){
	// console.log("load next page "+address );
	loadingElement.style.display = "block";
	var nextpage = $("#next-page");
	nextpage.load("/ajax/"+address+"/",function(){

		this.style.left = "0%";
		this.className = "page animated slideInRight";

		$("#content")[0].className = "page animated slideOutLeft";
		if (history && history.pushState) {
			history.pushState("","","/page/"+address+"/");
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
		findTriggerPoints();
	});
	nextpage.addClass(address);
}

function moveButtonDown(){
	var lastB = $(".last-button")[0];
	lastB.parentNode.appendChild(lastB);
}

function clearAnimation(){
	// console.log("clear animation");
	var elements = $(".animated");
	elements.removeClass('animated');
	elements.removeClass('slideInRight');
}

function clearHighLight(){
	$(".heighlight").removeClass('heighlight');
}
function heighLightEl(element){
	$(element).addClass('heighlight');
}

function resetTheNames(){
	// console.log("reset the names");
	loadingElement.style.display = "none";
	var oldcontent = $("#content")[0]
	var newcontent = $("#next-page")[0]
	oldcontent.id = "next-page";
	oldcontent.style.left = "100%";
	oldcontent.className = "page";
	newcontent.id = "content";

	newcontent.parentNode.appendChild(newcontent);
	animating = false;
	var newSubnav = $("#subnav-new")[0];
	var oldSubnav = $("#subnav")[0];
	var parent = oldSubnav.parentNode;
	parent.removeChild(oldSubnav);
	newSubnav.id = "subnav";
	newSubnav.className = "";

	slideMenu.refindHeight();
}


//google analytics function
//when ever we load in new content we replace the hashElements with the id's of the elements
//we also then reload the height triggering points loading them into the triggersPoints array
$("#content").on('scroll', function(){
	contentScrollTop = $(this).scrollTop();
	//check if there is more than 1 point
	if(triggersPoints.length > 1){
		//for each point check if it crossed it
		for(var a = 0; a < triggersPoints.length; a += 1){
			//if the scroll point is less than then next but greater than current
			if(hashElements[a] != currentHashEl && triggersPoints[a] < contentScrollTop &&triggersPoints[a+1] > contentScrollTop){
				currentHashEl = hashElements[a]
				console.log(pageSlug + " " + currentHashEl);
				// var loction = $("#"+currentHashEl).scrollTop();
				if(history.pushState) {
					history.pushState(null, null, currentHashEl);
				}else {
					location.hash = currentHashEl;
				}
				window.location.hash = currentHashEl;
				// $("#"+currentHashEl).scrollTop(loction);
				ga('send', 'pageview', {
					'page': '/'+pageSlug+"/#"+currentHashEl,
					'title': currentHashEl
				});
			}
		}
	}
});

var offsetfindtrigger = -300;
function findTriggerPoints(){
	triggersPoints = [];
	for(var a = 0, max =  hashElements.length; a < max; a += 1){
		triggersPoints.push($("#"+hashElements[a]).offset().top +offsetfindtrigger);
		if(a+1 >= max){
			triggersPoints.push(triggersPoints[triggersPoints.length-1]+$("#"+hashElements[a]).height()+offsetfindtrigger);
		}
	}
	console.log("trigger points = ", triggersPoints);
}