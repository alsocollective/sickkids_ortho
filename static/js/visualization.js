//http://patorjk.com/software/taag/#p=display&h=0&v=0&f=Colossal&t=Tree%20Chart
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


/*
8888888b.            .d888                                   888
888   Y88b          d88P"                                    888
888    888          888                                      888
888   d88P  .d88b.  888888  .d88b.  888d888 888d888  8888b.  888 .d8888b
8888888P"  d8P  Y8b 888    d8P  Y8b 888P"   888P"       "88b 888 88K
888 T88b   88888888 888    88888888 888     888     .d888888 888 "Y8888b.
888  T88b  Y8b.     888    Y8b.     888     888     888  888 888      X88
888   T88b  "Y8888  888     "Y8888  888     888     "Y888888 888  88888P'
*/
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
		if(playVis){
			return false;
		}
		referrals.width = $(referrals.parentElement).width()
		referrals.height = $(referrals.parentElement).height()
		referrals.radius = Math.min(referrals.width,referrals.height)/2
	},
	load:function(){
		if(playVis){
			return false;
		}
		referrals.colour = d3.scale.linear().domain([1,10]).range(['#733036', '#FCE0DF']);
		referrals.pie = d3.layout.pie()
			.value(function(d){
				return d["2012"];
			})
			.sort(
				null
			);

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
			.attr("d",referrals.arc)
			.on("mouseover",referrals.lightUpText)
			.on("mouseout",referrals.setbackText)
			.each(function(d) { this.id = convertToSlug(d.data.type);this._current = d; });

	},
	switchDataSets:function(){
		var value = this.value;
		referrals.pie
			.value(function(d) {
				return d[value];
			})
		referrals.path = referrals.path.data(referrals.pie);
		referrals.path.transition().duration(750).attrTween("d", referrals.arcTween);
	},

	setupKeys:function(){
		if($(referrals.parentKey).children().length == 0){
			var parent = $(referrals.parentKey)[0];
			var form = document.createElement("form");

			var listParent = document.createElement("ul"),
			listItem = document.createElement("li"),
			listItem2 = document.createElement("li");
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
			
			form.appendChild(listParent);
			
			listItem.appendChild(input);
			listItem.appendChild(label);
			
			listItem2.appendChild(input2);
			listItem2.appendChild(label2);
			listParent.appendChild(listItem);
			listParent.appendChild(listItem2);
			parent.appendChild(form);
			
			listParent.setAttribute("id","years");
			

			listParent = document.createElement("ul");
			listItem = null;
			var icon = null,
			content = null,
			header = null,
			info = null;
			listParent.id = "new-referrals-key";

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

					header = document.createElement("h4");
					header.innerHTML = name
					listItem.appendChild(header);

					$(listItem).on("mouseover",referrals.heighLightEl);
					$(listItem).on("mouseout",referrals.removeHeighLight);
					listParent.appendChild(listItem);
				}
			}
			parent.appendChild(listParent);
		}
	},
	heighLightEl:function(event){
		$("#new-referrals-chart #"+this.id).attr("class","heighlight-ref");
		$(this).addClass("heighlight-ref");
	},
	removeHeighLight:function(event){
		$(this).removeClass('heighlight-ref')
		$("#new-referrals-chart #"+this.id).attr("class","");
	},
	lightUpText:function(event){
		$(this).attr('class', 'heighlight-ref');
		$("#new-referrals-key #"+this.id).addClass('heighlight-ref');
		console.log(this);
	},
	setbackText:function(event){
		$(this).attr('class', '');
		$("#new-referrals-key #"+this.id).removeClass('heighlight-ref');
	},
	arcTween:function(a) {
		var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t) {
			return referrals.arc(i(t));
		};
	}
}

/*
 .d8888b.  d8b                  888
d88P  Y88b Y8P                  888
888    888                      888
888        888 888d888  .d8888b 888  .d88b.
888        888 888P"   d88P"    888 d8P  Y8b
888    888 888 888     888      888 88888888
Y88b  d88P 888 888     Y88b.    888 Y8b.
 "Y8888P"  888 888      "Y8888P 888  "Y8888
*/
var circleSettings = {
	squareSize:12,
	maxRad:15,
	minRad:10,
	parentElement:"#my-svg",
	parentKey:"#my-key",
	parentInfo:"#my-add-info",
	keySetup:false,
	dataLocation:"/static/data/2012-publication.json",
	updateSizes:function(){
		if(playVis){
			return false;
		}
		circleSettings.width = $(circleSettings.parentElement).width();
		circleSettings.height = $(window).outerHeight()-$("#nav").outerHeight();
		if(circleSettings.width < circleSettings.height){
			$(circleSettings.parentElement).css("height",circleSettings.width);
			circleSettings.ratio = circleSettings.width/35;
		} else {
			$(circleSettings.parentElement).css("height",circleSettings.height);
			circleSettings.ratio = circleSettings.height/35;
		}
		$($(circleSettings.parentElement)[0].parentNode).css("z-index","5");
		$($(circleSettings.parentKey)[0].parentNode).css("z-index","6");
		circleSettings.radius = Math.min(circleSettings.width,circleSettings.height)/2
	},
	setUpHTMLEls:function(){
		//console.log("SET UP HTML EL!!!!!!")
		if(playVis){
			return false;
		}
		if($(circleSettings.parentKey).children().length == 0){
			var parent = $(circleSettings.parentKey)[0];
			var listParent = document.createElement("ul"),
			listItem = null,
			icon = null,
			content = null,
			header = null,
			fname = null,
			lname = null,
			slug = null,
			colour= null,
			list = [];

			for(var a = 0, max = circleSettings.g[0].length; a < max; a += 1){
				fname = circleSettings.g[0][a].__data__.data.fname
				lname = circleSettings.g[0][a].__data__.data.lname
				slug = convertToSlug(fname);
				if(!circleSettings.checkList(slug,list)){
					colour = circleSettings.g[0][a].lastChild.style.fill;
					listItem = document.createElement("li");
					listItem.id = slug;
					icon = document.createElement("div")
					icon.className = "list-icon " + slug;
					icon.style.backgroundColor = colour;
					listItem.appendChild(icon);

					header = document.createElement("h4");
					header.innerHTML = lname;
					listItem.appendChild(header);

					list.push(slug);

					listParent.appendChild(listItem);
				}
			}
			parent.appendChild(listParent);
			$(listParent).children().on("mouseover",circleSettings.showSameAuthors)
			.on("mouseout",circleSettings.removeSameAuthors);

			circleSettings.keySetup = true;
			resizeRows();
		}
	},
	checkList:function(item,list){
		for(var a = 0, max = list.length; a < max; a+=1){
			if(list[a] == item){
				return true;
			}
		}
		return false;
	},
	showSameAuthors:function(event,element){
		var el = element || this;
		$(circleSettings.parentKey+ " #"+ el.id).attr('class', 'heighlight-circle');
		$(circleSettings.parentElement+ " #" + el.id).attr('class', 'heighlight-circle');
		circleSettings.showGlobalMetaData(event)
	},
	removeSameAuthors:function(event,element){
		var el = element || this;
		$(circleSettings.parentKey+ " #"+ el.id).attr('class', '');
		$(circleSettings.parentElement+" #" + el.id).attr('class', '');
		circleSettings.removeMetaData();
	},
	showMetaData:function(event,element,text){
		var el = element || this,
		data = el.parentNode.__data__.data;
		numberOfPapers = $(circleSettings.parentElement+ " #" + el.parentNode.id + " #" + el.id)

		$(circleSettings.parentInfo)[0].innerHTML = "<h5>Dr. "+data.fname+" "+data.lname+"</h5><p>Published "+numberOfPapers.length/2+" "+plur(numberOfPapers.length/2)+" in<i><br/>"+data.paper+"</i><br/>"+"Impact Factor: "+data.impact+"</p>"
	},
	removeMetaData:function(){
		$(circleSettings.parentInfo)[0].innerHTML = "";
	},
	showGlobalMetaData:function(event){
		// console.log(event);
		var numberOfPapers = $(circleSettings.parentElement+ " #"+ event.srcElement.parentNode.id);
		var data = numberOfPapers[0].__data__.data
		var out = "<h5>Dr. "+data.fname+" "+data.lname+"</h5><p>Published: "+numberOfPapers.length/2+" Total</p><ul id='full-list'>";
		var papers = {};
		for(var a = 0, max = numberOfPapers.length; a < max; a += 2){
			data = numberOfPapers[a].__data__.data;
			if(!papers[data.paper]){
				papers[data.paper] = {};
				papers[data.paper]["number"] = 1;
				papers[data.paper]["Timpact"] = data.impact;
			} else {
				papers[data.paper]["number"] += 1;
				papers[data.paper]["Timpact"] += data.impact;
			}
		}
		for(var key in papers){
			//out += "<li>"+papers[key].number+" "+plur(papers[key].number)+" in " + key + " with a total impact of " + zeroToNa(Math.floor(papers[key].Timpact*100)/100);
			out += "<li>"+key
		}
		//console.log(papers);
		out += "</ul>";
		$(circleSettings.parentInfo)[0].innerHTML = out;
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
		if(playVis){
			return false;
		}
		$(window).on("resize",function(){
			if($(circleSettings.parentElement[0])){
				$(circleSettings.parentElement)[0].innerHTML = "";
				circleSettings.updateSizes();
				circleSettings.init();
				resizeRows();
			}
		});
		d3.json(circleSettings.dataLocation,function(data){
			data.sort(circleSettings.dynamicSort("impact"));
			circleSettings.data = data;
			circleSettings.init();
		});
	},
	init:function(){
		if(playVis){
			return false;
		}
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
			.attr("transform","translate("+circleSettings.width/2+","+circleSettings.height/2+")")


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
		console.log(circleSettings.svg);
		////////////////// CRICLE //////////////
		circleSettings.g.append('circle')
		.attr("transform", function(d) { return "translate(" + circleSettings.arc.centroid(d) + ")"; })
		.attr("r", function(d) {
			return map_range(d.data.impact,0,30,circleSettings.ratio/5,circleSettings.ratio/*circleSettings.maxRad*/);
		})
		.style("text-anchor", "middle")
		.style("fill", function(d) { return circleSettings.color(d.data.fname); })
		.on('mouseover',function(d){
			circleSettings.showMetaData(d,this,this.nextSibling);
			circleSettings.showSameAuthors(d,this);
		})
		.on('mouseout',function(d){
			circleSettings.removeMetaData();
			circleSettings.removeSameAuthors(d,this);
		})
		.each(function(d){
			this.id = convertToSlug(d.data.fname);
			this.parentNode.id = convertToSlug(d.data.paper);
		});

		////////////////// TEXT //////////////
		circleSettings.g.append("text")
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("display","none")
		.attr("class","inner-text")
		.text(function(d) { return d.data.paper; });

		////////////////// RECT //////////////
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
		.each(function(d,index){
			this.id = convertToSlug(d.data.fname);
			this.previousSibling.id = index;
			this.parentNode.id = convertToSlug(d.data.paper);
		})
		.style("fill", function(d) { return circleSettings.color(d.data.fname); })
		.on('mouseover',function(d){
			circleSettings.showMetaData(d,this,this.previousSibling);
			circleSettings.showSameAuthors(d,this);
		})
		.on('mouseout',function(d){
			circleSettings.removeMetaData();
			circleSettings.removeSameAuthors(d,this);
		})
		.attr('class', function(d){
			return convertToSlug(d.data.fname);
		})
		circleSettings.setUpHTMLEls();
		resizeRows();
	}
}


function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function zeroToNa(value) {if(value<=0){return "N/A"} else {return value;}}

function plur(papernum) {if(papernum > 1){return "papers";}else{return "paper";}}



/*
88888888888                                  .d8888b.  888                       888
    888                                     d88P  Y88b 888                       888
    888                                     888    888 888                       888
    888     888d888  .d88b.   .d88b.        888        88888b.   8888b.  888d888 888888
    888     888P"   d8P  Y8b d8P  Y8b       888        888 "88b     "88b 888P"   888
    888     888     88888888 88888888       888    888 888  888 .d888888 888     888
    888     888     Y8b.     Y8b.           Y88b  d88P 888  888 888  888 888     Y88b.
    888     888      "Y8888   "Y8888         "Y8888P"  888  888 "Y888888 888      "Y888
*/
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
	{"name": "Trauma", "size": 325, "info":"Single level reconstruction, complex polytrauma, SCFE."},
	{"name": "Hip", "size": 161, "info":"Hip relocation, Innominate osteotomy, periacetabular osteotomies, Wedge pelvic & femoral osteotomies, Wagner double osteotomy, articulated hip distraction, surgical hip dislocation."},
	{"name": "Spine", "size": 141, "info":"Congenital and idiopathic spine deformity correction, anterior and posterior surgery, direct vertebral derotation, VEPTR, complex osteotomy and instrumentation."},
	{"name": "Limb Reconstruction", "size": 140, "info":"Limb lengthening, Ilizarov & Taylor Spatial Frame application. monolateral frame application, multifocal osteotomies, Super-joint procedures, Blount’s reconstruction, pelvic support osteotomy."},
	{"name": "Neuromuscular", "size": 135, "info":"Cerebral palsy soft tissue management, osteotomies, and single event multi-level surgery."},
	{"name": "Tumor", "size": 128, "info":"Benign and malignant tumour resection, limb salvage, biological and endoprosthetic reconstruction, muscle flaps. Rotationplasty."},
	{"name": "Foot & Ankle", "size": 123, "info":"Hindfoot osteotomies, midfoot osteotomies, forefoot osteotomies, resection of coalition, arthrodesis."},
	{"name": "Infection", "size": 81, "info":"Irrigation and debridement, arthrotomy."},
	{"name": "Sports", "size": 71, "info":"Arthroscopy, sports injuries, osteochondral reconstruction, all epiphyseal ACL reconstruction, meniscal repair, labral repair."},
	{"name": "Upper Limb", "size": 50, "info":"Brachial plexus palsy sequelae reconstruction, glenoid osteotomy, tendon transfers, MHE wrist reconstruction."},
	{"name": "Genetic and Metabolic", "size": 35, "info":"OI osteotomy and telescopic rodding. Skeletal dysplasia reconstruction, rickets reconstruction."}
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
		if(playVis){
			return false;
		}
		treeChart.setWH();
		//console.log(treeChart.width,treeChart.height);
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
			//console.log("yep");
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
			.text(function(d) { return d.size; })
			.on("mouseover",treeChart.heighLightFromBox)
			.on("mouseout",treeChart.unHeighLight);
	},
	setSize:function(){
		if(playVis){
			return false;
		}
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

			/*header = document.createElement("h3");
			header.innerHTML = elements[a].name+ ":";
			content.appendChild(header);*/

			info = document.createElement("p");
			info.innerHTML = "<strong>"+elements[a].name+ ":</strong> "+elements[a].info;
			content.appendChild(info)

			listParent.appendChild(listItem);
		}
		// d3.select(treeChart.location)[0][0].appendChild(listParent);
		$(treeChart.keyLocation)[0].appendChild(listParent);
		$(listParent).children().on("mouseover",treeChart.heighLight);
		$(listParent).children().on("mouseout",treeChart.unHeighLight)
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
	heighLightFromBox:function(){
		var list = this.className.split(" ");
		for( var a = 0, max = list.length; a < max; a += 1){
			if(list[a]!="node"){
				$(this).addClass('tree-graph-heigh-lighted');
				$($("."+list[a])[0].parentNode).addClass('tree-graph-heigh-lighted');
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
		if(playVis){
			return false;
		}
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
				.text(function(d) { return d.size; })
				.on("mouseover",treeChart.heighLightFromBox)
				.on("mouseout",treeChart.unHeighLight);
		}
	}
}