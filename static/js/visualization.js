// Utility functions
function showSameClassAsThisId(element){
	if(!element.classList){
		$("."+this.id).attr("class",this.id+" heighlight");
		$(this).addClass(this.id+" heighlight");
	} else {
		$("."+element.classList[0]).attr("class",element.classList[0]+" heighlight");
	}
}
function removeSameClassAsThisId(element){
	if(!element.classList){
		$("."+this.id).attr("class",this.id);
	} else {
		console.log(element.classList);
		$("."+element.classList[0]).attr("class",element.classList[0]);
	}
}

function convertToSlug(Text)
{
	return Text
		.toLowerCase()
		.replace(/ /g,'-')
		.replace(/[^\w-]+/g,'');
}


// Referrals

var referrals = {
	parentElement:"#new-referrals-chart",
	dataLocation:"/static/data/2011-2012-referals.json",
	parentKey:"#new-referrals-key",
	keySetup:false,
	pie:null,
	colour:null,
	data:null,
	arc:null,
	svg:null,
	path:null,

	updateSizes:function(){
		referrals.width = $(referrals.parentElement).width()
		referrals.height = $(referrals.parentElement).height()
		referrals.radius = Math.min(referrals.width,referrals.height)/2
	},
	load:function(){
		referrals.colour = d3.scale.linear().domain([1,10]).range(['#733036', '#FCE0DF']);
		referrals.pie = d3.layout.pie()
			.value(function(d){
				return d["2012"];
			})
			.sort(
				null
				/*function(a,b)
			{
				return d3.descending(a["2012"],b["2012"]);
			}*/);

		referrals.arc = d3.svg.arc()
		d3.json(referrals.dataLocation, function(error, data) {
			referrals.data = data;
			referrals.updateChart();
			referrals.setupKeys();
		});
		$(window).resize(function(){
			if($(referrals.parentElement)[0]){
				$(referrals.parentElement)[0].innerHTML = "";
				referrals.updateSizes();
				referrals.updateChart();
			}
		});
	},
	updateChart:function(){
		referrals.arc
			.innerRadius(referrals.radius - 80)
			.outerRadius(referrals.radius - 20);
		referrals.svg = d3.select(referrals.parentElement).append('svg')
			.attr("width", referrals.width)
			.attr('height', referrals.height)
			.append('g')
			.attr('transform', 'translate('+referrals.width/2+","+referrals.height/2+")");
		referrals.path = referrals.svg.datum(referrals.data).selectAll("path")
			.data(referrals.pie(referrals.data))
			.enter().append('path')
			.attr('fill', function(d,i){
				return referrals.colour(i);
			})
			.attr("class",function(d){
				return convertToSlug(d.data.type);
			})
			.attr("d",referrals.arc)
			.each(function(d) { this._current = d; });
	},
	switchDataSets:function(){
		var value = this.value;
		referrals.pie
			.value(function(d) {
				return d[value];
			})
			// .sort(function(a,b)
			// {
			// 	return d3.descending(a[value],b[value]);
			// });
		referrals.path = referrals.path.data(referrals.pie);
		referrals.path.transition().duration(750).attrTween("d", referrals.arcTween);
	},

	setupKeys:function(){
		if($(referrals.parentKey).children().length == 0){
			var parent = $(referrals.parentKey)[0];
			var form = document.createElement("form");

			var label = document.createElement("label");
			label.for = "2011";
			label.innerHTML = "2011";
			var input = document.createElement("input");
			input.type = "radio";
			input.value = "2011";
			input.name = "date";
			input.id = "2011";
			$(input).on("change",referrals.switchDataSets);

			var label2 = label.cloneNode(true);
			label2.for = "2012";
			label2.innerHTML = "2012";
			input2 = input.cloneNode(true);
			input2.value = "2012";
			input2.checked = true;
			$(input2).on("change",referrals.switchDataSets);
			form.appendChild(label);
			form.appendChild(input);
			form.appendChild(label2);
			form.appendChild(input2);
			parent.appendChild(form);



			var listParent = document.createElement("ul"),
			listItem = null,
			icon = null,
			content = null,
			header = null,
			info = null;
			listParent.id = "tree-key-chart";

			for(var a = 0, max = referrals.path[0].length; a < max; a += 1){
				var name = referrals.path[0][a].__data__.data.type,
				slug = convertToSlug(name);
				if($(parent).children('#'+slug).length == 0){
					var colour = referrals.path[0][a].attributes.fill.value;


					listItem = document.createElement("li");
					listItem.id = slug;
					icon = document.createElement("div");
					icon.className = "list-icon "+ slug;
					icon.style.backgroundColor = colour;
					listItem.appendChild(icon);

					header = document.createElement("h3");
					header.innerHTML = name
					listItem.appendChild(header);

					$(listItem).on("mouseover",referrals.heighLightEl);
					$(listItem).on("mouseout",referrals.removeHeighLight);
					listParent.appendChild(listItem);
					// var name = referrals.path[0][a].__data__.data.type,
				
					// var container = document.createElement("li");
					// container.innerHTML = name;
					// container.id = slug;
					// container.style.backgroundColor = colour;
					// $(container).on("mouseover",showSameClassAsThisId);
					// $(container).on("mouseout",removeSameClassAsThisId)
					// parent.appendChild(container);
				}
			}
			parent.appendChild(listParent);
		}
	},
	heighLightEl:function(event){
		console.log($("#new-referrals-chart ."+this.id)[0]);
		$("#new-referrals-chart ."+this.id).attr("class",this.id+" heighlight");
		$(this).addClass("heighlight");
	},
	removeHeighLight:function(event){
		$(this).removeClass('heighlight')
		$("#new-referrals-chart ."+this.id).attr("class",this.id);
	},
	arcTween:function(a) {
		var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
			return referrals.arc(i(t));
		};
	}
}

// Pie Circle....
var circleSettings = {
	squareSize:12,
	maxRad:20,
	minRad:5,
	parentElement:"#my-svg",
	parentKey:"#my-key",
	keySetup:false,
	dataLocation:"/static/data/2012-publication.json",
	updateSizes:function(){
		circleSettings.width = $(circleSettings.parentElement).width()
		circleSettings.height = $(circleSettings.parentElement).height()
		circleSettings.radius = Math.min(circleSettings.width,circleSettings.height)/2
	},
	setUpHTMLEls:function(){
		if($(circleSettings.parentKey).children().length == 0){
			var parent = $(circleSettings.parentKey)[0];
			for(var a = 0, max = circleSettings.g[0].length; a < max; a += 1){
				var name = circleSettings.g[0][a].__data__.data.name
				var slug = convertToSlug(name);
				if($(parent).children('#'+slug).length == 0){
					var colour = circleSettings.g[0][a].lastChild.style.fill;
					var container = document.createElement("li");
					container.innerHTML = name;
					container.id = slug;
					container.style.backgroundColor = colour;
					$(container).on("mouseover",showSameClassAsThisId);
					$(container).on("mouseout",removeSameClassAsThisId)
					parent.appendChild(container);
				}
			}
			circleSettings.keySetup = true;
		}
	},
	dynamicSort:function(property) {
		var sortOrder = 1;
			if(property[0] === "-") {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a,b) {
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	},
	load:function(){
		$(window).on("resize",function(){
			if($(circleSettings.parentElement[0])){
				$(circleSettings.parentElement)[0].innerHTML = "";
				circleSettings.updateSizes();
				circleSettings.init();
			}
		});
		d3.json(circleSettings.dataLocation,function(data){
			data.sort(circleSettings.dynamicSort("paper"));
			circleSettings.data = data;
			circleSettings.init();
		});
	},
	init:function(){
		circleSettings.color = d3.scale.ordinal().range(["#FAC2C3","#F7A4A6","#F18489","#EA636E","#A1585C","#792B34","#52161A","#000"])
		circleSettings.arc = d3.svg.arc()
			.outerRadius(circleSettings.radius - 29)
			.innerRadius(circleSettings.radius - 30);
		circleSettings.pie = d3.layout.pie()
			.value(function(d){ return 1;})
			.sort(null);
		circleSettings.svg = d3.select(circleSettings.parentElement).append("svg")
			.attr("with",circleSettings.width)
			.attr('height', circleSettings.height)
			.append("g")
			.attr("transform","translate("+circleSettings.width/2+","+circleSettings.height/2+")");

		circleSettings.g = circleSettings.svg.selectAll(".arc")
			.data(circleSettings.pie(circleSettings.data))
			.enter().append("g")
			.attr("class","arc");

		circleSettings.g.append("path")
			.attr('d', function(d,i){
				if(circleSettings.g[0][i+1] && circleSettings.g[0][i+1].__data__.data.paper == d.data.paper){
					var inToArc = Object.create(d);
					inToArc.startAngle += circleSettings.g[0][0].__data__.endAngle/2;
					inToArc.endAngle += circleSettings.g[0][0].__data__.endAngle/2;
					return circleSettings.arc(inToArc,i);
				} else {
					prev = d;
				}
				return null;
			});

		circleSettings.g.append('circle')
		.attr("transform", function(d) { return "translate(" + circleSettings.arc.centroid(d) + ")"; })
		.attr("r", function(d) {
			
			return map_range(d.data.impact,0,30,circleSettings.minRad,circleSettings.maxRad);
		})
		.style("text-anchor", "middle")
		.style("fill", function(d) { return circleSettings.color(d.data.name); })
		.on('mouseover',function(d){
			this.nextSibling.style.display = "inherit";
			showSameClassAsThisId(this);
		})
		.on('mouseout',function(d){
			this.nextSibling.style.display = "none";
			removeSameClassAsThisId(this);
		})
		.attr('class', function(d){
			return convertToSlug(d.data.name);
		})


		circleSettings.g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("display","none")
		.attr("class","inner-text")
		.text(function(d) { return d.data.name + " " + d.data.paper; });


		circleSettings.g.append('rect')
		.attr("transform", function(d) { return "translate(" + circleSettings.arc.centroid(d) + ")"; })
		.attr('x', -circleSettings.squareSize/2)
		.attr('y', -circleSettings.squareSize/2)
		.attr("width", function(d) {
			if(!d.data.impact){
				return circleSettings.squareSize;
			}
			return 0;
		})
		.attr("height", function(d) {
			if(!d.data.impact){
				return circleSettings.squareSize;
			}
			return 0;
		})
		.style("fill", function(d) { return circleSettings.color(d.data.name); })
		.on('mouseover',function(d){
			this.previousSibling.style.display = "inherit";
			showSameClassAsThisId(this);
		})
		.on('mouseout',function(d){
			this.previousSibling.style.display = "none";
			removeSameClassAsThisId(this);
		})
		.attr('class', function(d){
			return convertToSlug(d.data.name);
		})
		circleSettings.setUpHTMLEls();
	}
}


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}



//TREEEEEEEEEEEEEEEEE chart
//have next lines in the box...
/*
first 

<div id="tree-area-key"></div>

then 


<div id="tree-area"></div>
<script type="text/javascript">
treeChart.setup();
</script>
*/

var treeData = {"name":"Number of Procedures", "children": [
	{"name": "Trauma", "size": 325, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Hip", "size": 161, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Spine", "size": 141, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Limb Reconstruction", "size": 140, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Neuromuscular", "size": 135, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Tumor", "size": 128, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Foot & Ankle", "size": 123, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Infection", "size": 81, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Sports", "size": 71, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Upper Limb", "size": 50, "info":"dsfdsfdfsasdfasdfafsdasdf"},
	{"name": "Genetic and Metabolic", "size": 35, "info":"dsfdsfdfsasdfasdfafsdasdf"}
]}


var treeChart = {
	width:450,
	height:630,
	treemap:null,
	parentDiv:null,
	location:"#tree-area",
	keyLocation:"#tree-area-key",
	dataLocation:"/static/data/2012-breakdown.json",
	setup:function(){
		treeChart.setWH();
		console.log(treeChart.width,treeChart.height);
		treeChart.treemap = d3.layout.treemap()
			.size([treeChart.width, treeChart.height])
			.sticky(true)
			.value(function(d) { return d.size; });
		treeChart.parentDiv = d3.select(treeChart.location).append("div")
			.style("width", (treeChart.width) + "px")
			.style("height", (treeChart.height) + "px")
			.attr("class","tree-chart");
		// d3.json(treeChart.dataLocation,treeChart.loadData);
		treeChart.loadData("none",treeData);
		treeChart.generateList();
		$(window).on("resize",function(){
			console.log("yep");
			treeChart.onResizeChart();
		});
	},
	inputData:null,
	divs:null,
	loadData:function(erro,data){
		treeChart.inputData = data;
		treeChart.divs = treeChart.parentDiv.datum(data).selectAll("div")
			.data(treeChart.treemap(data))
			.enter().append("div")
			.attr("class", function(d){return convertToSlug(d.name) + " node";})
			.call(treeChart.setSize)
			.text(function(d) { return d.size; });
	},
	setSize:function(){
		this.style("left", function(d) { return d.x + "px"; })
			.style("top", function(d) { return d.y + "px"; })
			.style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
			.style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
	},
	generateList:function(){
		var listParent = document.createElement("ul"),
		elements = treeData.children,
		listItem = null,
		icon = null,
		content = null,
		header = null,
		info = null;
		listParent.id = "tree-key-chart";
		for(var a = 0, max = elements.length; a < max; a += 1){
			listItem = document.createElement("li");
			icon = document.createElement("div")
			icon.className = "list-icon " + convertToSlug(elements[a].name);
			listItem.appendChild(icon);

			content = document.createElement("div");
			content.className = "other";
			listItem.appendChild(content);

			header = document.createElement("h3");
			header.innerHTML = elements[a].name+ ":";
			content.appendChild(header);

			info = document.createElement("span");
			info.innerHTML = elements[a].info
			content.appendChild(info)

			listParent.appendChild(listItem);
		}
		// d3.select(treeChart.location)[0][0].appendChild(listParent);
		$(treeChart.keyLocation)[0].appendChild(listParent);
		$(listParent).children().on("mouseover",treeChart.heighLight);
	},
	heighLight:function(){
		treeChart.unHeighLight();
		var list = $(this).children('.list-icon')[0].className.split(" ");
		for( var a = 0, max = list.length; a < max; a += 1){
			if(list[a]!="list-icon"){
				$(this).addClass('tree-graph-heigh-lighted');
				$("."+list[a]).addClass('tree-graph-heigh-lighted');
			}
		}
	},
	unHeighLight:function(){
		$(".tree-graph-heigh-lighted").removeClass("tree-graph-heigh-lighted");
	},
	setWH:function(){
		treeChart.width = $(treeChart.location).outerWidth();
		treeChart.height = $(treeChart.location).outerHeight();
	},
	onResizeChart:function(){
		if($(treeChart.location)[0]){
			treeChart.setWH();
			$(treeChart.location)[0].innerHTML = "";
			treeChart.treemap.size([treeChart.width, treeChart.height]);
			treeChart.parentDiv = d3.select(treeChart.location).append("div")
				.style("width", (treeChart.width) + "px")
				.style("height", (treeChart.height) + "px")
				.attr("class","tree-chart");
			treeChart.divs = treeChart.parentDiv.datum(treeChart.inputData).selectAll("div")
				.data(treeChart.treemap(treeChart.inputData))
				.enter().append("div")
				.attr("class", function(d){return convertToSlug(d.name) + " node";})
				.call(treeChart.setSize)
				.text(function(d) { return d.size; });
		}
	}
}