// Utility functions
function showSameClassAsThisId(element){
	if(!element.classList){
		$("."+this.id).attr("class",this.id+" heighlight");
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
			$(referrals.parentElement)[0].innerHTML = "";
			referrals.updateSizes();
			referrals.updateChart();
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
			var input = document.createElement("input");
			input.type = "radio";
			input.value = "2011";
			input.name = "date";
			$(input).on("change",referrals.switchDataSets);
			input2 = input.cloneNode(true);
			input2.value = "2012";
			input2.checked = true;
			$(input2).on("change",referrals.switchDataSets);
			form.appendChild(input);
			form.appendChild(input2);
			parent.appendChild(form);

			for(var a = 0, max = referrals.path[0].length; a < max; a += 1){
				var name = referrals.path[0][a].__data__.data.type,
				slug = convertToSlug(name);
				if($(parent).children('#'+slug).length == 0){
					var colour = referrals.path[0][a].attributes.fill.value;
					var container = document.createElement("li");
					container.innerHTML = name;
					container.id = slug;
					container.style.backgroundColor = colour;
					$(container).on("mouseover",showSameClassAsThisId);
					$(container).on("mouseout",removeSameClassAsThisId)
					parent.appendChild(container);
				}
			}
		}
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
	squareSize:30,
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
			$(circleSettings.parentElement)[0].innerHTML = "";
			circleSettings.updateSizes();
			circleSettings.init();
		});
		d3.json(circleSettings.dataLocation,function(data){
			data.sort(circleSettings.dynamicSort("paper"));
			circleSettings.data = data;
			circleSettings.init();
		});
	},
	init:function(){
		circleSettings.color = d3.scale.ordinal().range(["#ccc","#c00","#0c0","#00c","#000"])
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
		.attr("r", function(d) { return d.data.impact; })
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

