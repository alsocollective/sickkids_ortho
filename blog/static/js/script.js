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
		for(var a = 0; a < children.length; ++a){
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
}

setupnav();
function setupnav(){
	// console.log("setup Nav");
	var links = $(".link-to-page");
	links.each(function(index){
		$(links[index]).click(function(){
			event.preventDefault();
			if(!animating){
				animating = true;
				var linkto = this.getAttribute("href").split("/")
				clearHighLight();
				heighLightEl(this);
				linkto = linkto[linkto.length-1];
				loadNextPage(linkto);
			}
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
