/**
 * @author Seid M
 * @version 0.0.1
 * 
 */	
//global variables
var startPosition = []; //array containing starting positions of markers
var endPosition = [];  //array containing ending positions of markers
var markedText = []; //array containing marked texts
var markupType = [];//array containing type of markers
var checkDuplicate = [];//array for duplicate detection.

	//seven predefined markers of colors for possible 7 annotations.
	var colors = ["#FFFF00","#808080","#800080","#008000","#0000FF","#00FFFF","#FF00FF"];
	$(document).ready(function() {
		
		//trigered when click-drag is finished
		$('#sampletext').mouseup(function(e) {
			
			//variable to contain the selected radio button value for marking documents
			//value are similar to ...mark0,mark1,....
			var selectetMarkUp = $("#markupRbtn input[type='radio']:checked").val();
			
			//color for marking a text. get the integer part of the value of selected 
			//radio button and assign color from the array  <b> colors </b>
			
			markColor = colors[selectetMarkUp.substring(4)];
			
			//the name of selected markup radio button for annotation
			var markup = $('#'+selectetMarkUp).text() ; 
		
			//start and end positions of selected texts plus the highlighted text
			var starting = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).start;
			var ending = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).end;
			
			//detect duplicate markers and urge users if they need to remove marker
			var duplicate = starting+ ' ' + ending + ' ' +markup ; // no duplicate markup should be stored in the json data!
			
			//do nothing, user didn't select anything / or it is blank
			var tempSelText = $('#sampletext').text().substring(starting,ending).trim();
			
			
			if (starting == ending || tempSelText == "" ){}
			
			else if($.inArray(duplicate, checkDuplicate) > -1){ 
						
				if(confirm('remove marker?')){ //if user prefers to remove highlight.
					var pos = $.inArray(duplicate, checkDuplicate);
					removeMarkupAnnotation(pos);
					//change background color to white - this might be complex for overlapped markers as the user can't see 
					//the covered markers
					highlight("white");
					
				}		
			}
			/*
			 * detect possible extensions or duplicates of markers, 
			 * only for the same class of markers, and modify the annotation accordingly
			 */
			else if(checkOverlap(starting,ending, markup).overlap){
				//starting and ending position of the previous markers which is overlapped with the current one
				//and the name of the annotation marker
				var overlapStarting = checkOverlap(starting,ending, markup).overlapStart;
				var overlapEnding = checkOverlap(starting,ending, markup).overlapEnd;
				var overlapPosition = checkOverlap(starting,ending, markup).position;
				
				//if the user selects a portion that has already marked with the same marker type
				// no need to redraw.
				if(overlapStarting <= starting && overlapEnding >= ending){
					alert("This portion already annotated with the selected marker ");
					
				}
				
				//portions to the left of the current annotation is selected
				else if(overlapStarting >= starting &&  //checks range
						overlapEnding >= ending && //checks range
					overlapStarting <= ending){//checks overlap
					
					//delete old marker and extend new marker
					removeMarkupAnnotation(overlapPosition);
					addMarkupAnnotation(starting,overlapEnding,markup);
				}
				
				//portions to the right of the current annotation selected
				else if(overlapStarting <= starting && 
						overlapEnding <= ending &&
						overlapEnding >= starting){//checks overlap
					
					//delete old marker and extends the new marker
					removeMarkupAnnotation(overlapPosition);
					addMarkupAnnotation(overlapStarting,ending,markup);
					
				}
				//checks subsumption, additional annotations to the
				//left and right of the existing marker
				else if(overlapStarting > starting && 
						overlapEnding < ending){
					
					//delete old marker extends the new marker
					removeMarkupAnnotation(overlapPosition);
					addMarkupAnnotation(starting,ending,markup);
				}
			}//End overlap
			
			//new marker
			else {
				addMarkupAnnotation(starting, ending,markup);
			}
			});
		
		/*
		 * This function add marker annotation information to different arrays, 
		 * which shall be used later on for overlap detection, json data preparation and so on.
		 */
		function addMarkupAnnotation (starting, ending, markup) {
			
			/* in the case of continues marker extending, delete all 
			 * old extensions and merge into one
			 */
			var tempStarts = [starting];
			var tempEnds = [ending];
			for ( var i = 0; i < startPosition.length; i++){
				if (startPosition[i]>=starting &&
						endPosition[i]>=ending &&
						startPosition[i] <= ending) {
					
					tempEnds.push(endPosition[i]);// to compare later the larger span
					removeMarkupAnnotation(i);
				}
				else if (startPosition[i]<=starting && 
						 endPosition[i] <= ending && 
						 endPosition[i] >= starting) {
					
					tempStarts.push(startPosition[i]);// to compare later the larger span
					removeMarkupAnnotation(i);
				}
			}
			
			starting = Math.min.apply(this, tempStarts);
			ending = Math.max.apply(this, tempEnds);
			
			//selected text (or portions added to the existing marker
			var hilitedText = $('#sampletext').text().substring(starting, ending); 
			duplicate = starting+ ' ' + ending + ' ' +markup ;
			
			checkDuplicate.push(duplicate);
			startPosition.push(starting);
			endPosition.push(ending);
			markedText.push(hilitedText);
			markupType.push(markup) ;
			
			highlight(markColor);
			
			}
		
		
		/*
		 * This function removes existing marker if there need be some extensions
		 */
		function removeMarkupAnnotation(position){
			
			checkDuplicate.splice(position, 1);
			startPosition.splice(position, 1);
			endPosition.splice(position, 1);
			markedText.splice(position, 1);
			markupType.splice(position, 1);
			
		}
			
		/*
		Highligt the the selected text with a given background color.
		*/
		function highlight(color) {
			
			makeEditableAndHighlight(color);
		}
		
		function makeEditableAndHighlight(color) {
			var range, sel = window.getSelection();
			if (sel.rangeCount && sel.getRangeAt) {
				range = sel.getRangeAt(0);
				}
			//get an editable document. 
			document.designMode = "on";
			if (range) {
				sel.removeAllRanges();
				sel.addRange(range);
				}
			// Use HiliteColor since the Firefox browser apply BackColor to the whole block
			if (!document.execCommand("HiliteColor", false, color)) {
				
				//execute designMode commands.
				document.execCommand("BackColor", false, color);
				}
			document.designMode = "off";
		}
			
	
			/*
			Get the starting and end offset positions of selected text.
			Basically the text to be annotated is in one <div> elment and indexing starts at
			the beginning of this element's content
			*/
			function getSelectionCharOffsetsWithin(element) {
				//start and end of selection
				var start = 0, end = 0;
				var sel, range, clone;
	
				range = window.getSelection().getRangeAt(0);
				
				//Produces a new Range whose boundary-points are equal to 
				//the boundary-points of the Range.
				clone = range.cloneRange();
				clone.selectNodeContents(element);
				clone.setEnd(range.startContainer,
						range.startOffset);
				start = clone.toString().length;
				end = start + range.toString().length;
	
				return {
					start : start,
					end : end
				};
			}
			
			
			/*
			 *  If there is an overlap for same marker, 
			 *  return the old markers starting and ending positions
			 */
			
			function checkOverlap(starting, ending, markup){
				for (var i = 0;i<startPosition.length;i++){
					
					// overlaps like=>  StartOld..StartNew ...EndNew...EndOld,  ...
					if(startPosition[i] <= starting && endPosition[i]>= ending && markupType[i] == markup){
						
						return {
							overlap:true,
							overlapStart:startPosition[i],
							overlapEnd:endPosition[i],
							position:i
							};
							
					}// overlaps like=> StartNew ... StartOld...EndNew...EndOld
					else if(starting < startPosition[i] && ending >= startPosition[i] && ending <= endPosition[i] && markupType[i] == markup){
						
						return {
							overlap:true,
							overlapStart:startPosition[i],
							overlapEnd:endPosition[i],
							position:i
							};
							
					}// overlaps like=>StartOld...StartNew...EndOld...EndNew
					else if( starting >= startPosition[i] && ending > endPosition[i] && endPosition[i] >= starting && markupType[i] == markup){
						return {
							overlap:true,
							overlapStart:startPosition[i],
							overlapEnd:endPosition[i],
							position:i
							};
					}
					
					// overlaps like=> StartNew ... StartOld...EndOld... EndNew...
					//returns StartNew,EndOld
					else if( starting < startPosition[i] && ending > endPosition[i] && markupType[i] == markup){
						return {
							overlap:true,
							overlapStart:startPosition[i],
							overlapEnd:endPosition[i],
							position:i
							};
					}
					
				}
				//no Overlap
				return false;
				
			}
			
			/*
			 * below are some of the event functions used for 
			 * 1)sending data to the server
			 * 2) refreshing the page and
			 * 3) creating additional radiobuttons for marker
			 */
			
			
			/*
			 * 	Send the Json data (mark text with start/end positions to the server using Ajax.)
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
							markedText : markedText[i],
							markupType:markupType[i]});
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
			Refresh page, hence new marker to be created
			*/
			
			$('#refresh').click(function() {
				  location.reload();
				});
			
			/*
			 * create new radio buttons for additional markers
			 */
			$('#createRbtn').click(function() {
				if($("#annotatinName").val()==""){
					alert("Invalid marker ! Please type in the name of your marker")
				}
				else{
				var countRbtn = 0;
				$("input:radio").each(function(){
					countRbtn++;
					});
				if(countRbtn>=colors.length){
					alert("maximum annotation markers reached!!!")
				}
				else{
				var colorTxt = "<input type=\"text\" size=\"2\" style=\"background-color:"+colors[countRbtn]+";\" disabled=\"disabled\">";
				var rBtn = "<p><input type=\"radio\" name=\"markup\" checked=\"true\" value=\"mark"+
					countRbtn+"\"> <span id=\"mark"+countRbtn+"\">"+$("#annotatinName").val()+ "</span></input>"+ colorTxt +"</p>"
				 $(rBtn).appendTo('#markupRbtn');
				 $("#annotatinName").val("");
				}
				}
				});
		});