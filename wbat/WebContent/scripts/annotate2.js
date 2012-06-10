	var startPosition = []; 
	var endPosition = [];
	var markedText = [];
	var checkDuplicate = [];
	var markupColors = [] ;
	//Var colors = ["yellow","gray","purple","green","blue","aqua","fuchsia"];
	var colors = ["#FFFF00","#808080","#800080","#008000","#0000FF","#00FFFF","#FF00FF"];
	function getSelected(event) {
		return window.getSelection();
	}

	$(document).ready(function() {
		
			var allText;
			var first = true;
		$('#sampletext').mouseup(function(e) {
				
			var starting = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).start + 5;
			var ending = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).end + 5 ;
			var hilitedText = $('#sampletext').html().substring(starting, ending);
			alert($('#sampletext').html());
			alert(hilitedText) ;
			
			allText = $('#sampletext').html();
			
			duplicate = starting + " "+ ending; // no duplicate markup should be stored in the json data!
			if (!((starting == ending) || ($.inArray(duplicate, checkDuplicate) > -1))) {
				checkDuplicate.push(duplicate);
				startPosition.push(starting);
				endPosition.push(ending);
				markedText.push(hilitedText);
				if(first){
					markupColors.push(0);
					first = false;
				}
				else if(checkOverlap(starting, ending).overlap){
					markupColors.push(checkOverlap(starting, ending).colorIndex);
				}
				else{ //check last index of color and default
					markupColors.push(0);//default markup color					
				}
				//markup all available annotations
				
				for(var i = 0;i<startPosition.length;i++){
					if(startPosition[i]>starting){
					highlight(startPosition[i]+48,endPosition[i]+48,colors[markupColors[i]]);
					}
					else{
						highlight(startPosition[i],endPosition[i],colors[markupColors[i]]);
					}
				}
				}
			$('#sampletext').html(allText) ;
			console.info(allText);
		});
			function checkOverlap(starting, ending){
				for (var i = 0;i<startPosition.length;i++){
					//no overlap
					if(startPosition[i] == starting && endPosition[i]== ending){
						return {
							overlap:false,
							colorIndex:0
							};
					}//overlap
					else if(startPosition[i]<starting && endPosition[i]> starting){
						
						return {
							overlap:true,
							colorIndex:markupColors[i] + 1
							};
					}//overlap
					else if( endPosition[i] > starting && startPosition[i]<ending ){
						return {
							overlap:true,
							colorIndex:markupColors[i] + 1
							};
					}
					
				}
				
			}
			
			
			/*
			To be used for multiple marker: TODO
			*/
			function randomColor() { return '#'	+ Math.floor(Math.random() * 16777216).toString(16);
			}
			
			/*
			Highligt the the selected text with a given background color.
			*/
			
			function highlight(starting, ending, color) {
					
					var markUpText = "<span style=\"background-color:"+color+";\">" +
					allText.substring(starting, ending ) + "</span>";
					allText = allText.substring(0,starting)+ markUpText + allText.substring(ending)  ;	
			}
			
	
			/*
			Get the starting and end offset positions of selected text.
			Basically the text to be annotated is in one <div> elment and indexing starts at
			the begining of this element's content
			*/
			function getSelectionCharOffsetsWithin(element) {
				var start = 0, end = 0;
				var sel, range, priorRange;
	
				range = window.getSelection().getRangeAt(0);
				priorRange = range.cloneRange();
				priorRange.selectNodeContents(element);
				priorRange.setEnd(range.startContainer,
						range.startOffset);
				start = priorRange.toString().length;
				end = start + range.toString().length;
	
				return {
					start : start,
					end : end
				};
			}
			/*
			Send the Json data (markup text with start/end positions to the server using Ajax.)
			*/
			$("#submit").click(function() {
				if(startPosition.length == 0){
					alert("No markup found, please mark some text!!")
				}
				else 
				{	/*
					Build the Json data to be send to the server
					*/
					var jsonMarkUpObj = [];
					for ( var i = 0; i < startPosition.length; i++) {
						jsonMarkUpObj.push({startingpos : startPosition[i], 
							endingpos : endPosition[i],	
							markedTxt : markedText[i] });
					}
					//Stringfy the Json Object
					var jsonMarkUpInfo = JSON.stringify(jsonMarkUpObj);
					alert("json data to be sent is\n" + jsonMarkUpInfo);
					//Send the Json data using ajax
					$.ajax({
						url : "/wbat/wbat",
						type : "POST",
						data : ({markUpInfo : jsonMarkUpInfo}),
						dataType : "json",
						contentType : "application/x-www-form-urlencoded; charset=UTF-8",
						success : function(response) {alert(response["response"]);
						}
						});
				}
			});
			/*
			Refresh page, hence new markup to be created
			*/
			$('#refresh').click(function() {
				  location.reload();
				});
			
			
		});