// bkLib.onDomLoaded(nicEditors.allTextAreas);
var niceditor;

window.onload = function () {
	function updateTheTable() {
		for(var a = 0; a < toGoInTable.length; ++a){
			mytable.appendChild(toGoInTable[a].element);
		}
	}

	function reorganizeElements() {
		toGoInTable.sort(function(a,b){return a.value.value-b.value.value;});
		updateTheTable();
	}

	function hideFromDeleteButton(button){
		$(button).on("click",function(){
			$(this.parentNode.parentNode.nextSibling.nextSibling).toggleClass('hide');
		});
	}

	niceditor = new nicEditor({buttonList: ['bold', 'italic', 'underline', 'left', 'center', 'right', 'ol', 'ul', "removeformat", 'xhtml']});

	$("#site-name")[0].innerHTML = "ALSO Blogger!!";

	var mytable = document.createElement("div");
	$(mytable).addClass('articles-container');
	$($("#section_form").children()[1]).children()[0].appendChild(mytable);

	var toGoInTable = [];


	var addButtons = $(".add-row");
	//takes all the elements are already there and places them into a list

	var listOfNewTextFields = [];
	addButtons.each(function(index){
		var parent = $(addButtons[index].parentNode);
		var selectedElements = $(parent).find(".inline-related");
		var elCount = 0;
		while(elCount < selectedElements.length-1){
			var thisEl = selectedElements[elCount];
			elCount = elCount + 1;
			var orderField = $(thisEl).find(".form-row .field-order_of_content input")[0];
			if(!orderField){
				orderField = $(thisEl).find(".form-row .field-order_of_section input")[0];
			}
			toGoInTable.push({"element":thisEl,"value":orderField});
			var textFieldArea = $(thisEl).find(".vLargeTextField");
			if(textFieldArea.length > 0){
				listOfNewTextFields.push(textFieldArea);
			}
			$(orderField).bind("change",reorganizeElements);
			hideFromDeleteButton($(thisEl).find(".delete input")[0]);
		}
		$(parent[0].parentNode.parentNode.parentNode.parentNode).addClass("blog-third");
	});
	reorganizeElements();
	for(var a = 0; a < listOfNewTextFields.length; ++a){
		// niceditor.panelInstance(listOfNewTextFields[a][0].id);
	}

	//makes the buttons add to the list of elements to gointo the table
	addButtons.click(function(){
		var tableRow = $(this.parentNode).find(".inline-related");
		if(tableRow.length>0){
			var thisEl = tableRow[0];
			var orderField = $(thisEl).find(".form-row .field-order_of_content input")[0];
			if(!orderField){
				orderField = $(thisEl).find(".form-row .field-order_of_section input")[0];
			}
			toGoInTable.push({"element":thisEl,"value":orderField});
			var textFieldArea = $(thisEl).find(".vLargeTextField");
			if(textFieldArea.length > 0){
				// niceditor.panelInstance(textFieldArea[0].id);
			}
		}
		updateTheTable();
	});
};



