// bkLib.onDomLoaded(nicEditors.allTextAreas);
var niceditor;

window.onload = function(){
	niceditor = new nicEditor({buttonList:['bold','italic','underline','left','center','right','ol','ul']});

	$("#site-name")[0].innerHTML = "ALSO Blogger!!"

	// var mytableContainer = document.createElement("div");
	// $(mytableContainer).addClass('blog-table');
	var mytable = document.createElement("div");
	$(mytable).addClass('articles-container')
	// mytableContainer.appendChild(mytable);
	$($("#blogpost_form").children()[1]).children()[0].appendChild(mytable);

	var toGoInTable = [];


	var addButtons = $(".add-row");
	//takes all the elements are already there and places them into a list

	var listOfNewTextFields = [];
	addButtons.each(function(index){
		var parent = $(addButtons[index].parentNode)
		while(parent.children().length>2){
			var thisEl = parent.children()[0];
			newEl = moveAllchildrenToNewDiv(thisEl);
			toGoInTable.push(newEl);
			var textFieldArea = $(newEl).find(".vLargeTextField");
			if(textFieldArea.length > 0){
				listOfNewTextFields.push(textFieldArea);
			}
			var temp = $(newEl).find(".vIntegerField")
			$(temp[0]).bind("change",reorganizeElements);
			parent[0].removeChild(thisEl);
		}
		$(parent[0].parentNode.parentNode.parentNode.parentNode).addClass("blog-third");
	});
	reorganizeElements();
	for(var a = 0; a < listOfNewTextFields.length; ++a){
		niceditor.panelInstance(listOfNewTextFields[a][0].id);
	}

	//makes the buttons add to the list of elements to gointo the table
	addButtons.click(function(){
		var tableRow = $(this.parentNode).children()[0];
		if($(tableRow).hasClass('form-row')){
			$(tableRow).find(".vIntegerField").bind("change",reorganizeElements);
			toGoInTable.push(tableRow);
			var textFieldArea = $(tableRow).find(".vLargeTextField");
			if(textFieldArea.length > 0){
				niceditor.panelInstance(textFieldArea[0].id);
			}
		}
		updateTheTable();
	});

	function updateTheTable(){
		for(var a = 0; a < toGoInTable.length; ++a){
			mytable.appendChild(toGoInTable[a]);
		}
	}

	function reorganizeElements(){
		var valueOrder = [];
		for(var a = 0; a < toGoInTable.length; ++a){
			valueOrder.push({"element":toGoInTable[a],"value":$(toGoInTable[a]).find(".vIntegerField")[0].value});
		}
		valueOrder.sort(function(a,b){return a["value"]-b["value"]})
		toGoInTable = [];
		for(var a = 0; a < valueOrder.length; ++a){
			toGoInTable.push(valueOrder[a]["element"]);
		}
		updateTheTable();
	}

	function removeAllIframes(){
		var iframes = $("iframe");
		iframes.each(function(index){
			iframes[index].parentNode.removeChild(iframes[index]);
		});
	}

	function moveAllchildrenToNewDiv(elementIn){
		var elementOut = document.createElement("div");
		var elinChildren = $(elementIn).children();
		var loop = elinChildren.length;
		for(var a = 0; a < loop; ++a){
			elementOut.appendChild(elinChildren[a]);
		}
		// while(loop >= 0){
		// 	elementOut.appendChild(elinChildren[loop]);
		// 	--loop;
		// }
		console.log(elementOut);
		return elementOut;
	}


}


// bkLib.onDomLoaded(nicEditors.allTextAreas);