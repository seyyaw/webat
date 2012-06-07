	var startPosition = []; 
	var endPosition = [];
	var markedText = [];
	var checkDuplicate = [];
	function getSelected(event) {
		return window.getSelection();
	}

	$(document).ready(function() {
		$('#sampletext').mouseup(function(e) {
				
			var starting = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).start;
			var ending = getSelectionCharOffsetsWithin(document.getElementById("sampletext")).end;
			var hilitedText = $('#sampletext').text().substring(starting, ending);
			
			duplicate = starting + " "+ ending; // no duplicate markup should be stored in the json data!
			console.info(checkDuplicate);
			if (!((starting == ending) || ($.inArray(duplicate, checkDuplicate) > -1))) {
				checkDuplicate.push(duplicate);
				startPosition.push(starting);
				endPosition.push(ending);
				markedText.push(hilitedText);
				}
			
			highlight("#ffb7b7");
			});
			/*
			To be used for multiple marker: TODO
			*/
			function randomColor() { return '#'	+ Math.floor(Math.random() * 16777216).toString(16);
			}
			
			/*
			Highligt the the selected text with a given background color.
			*/
			
			function highlight(colour) {
				var range, sel;
				try {
					if (!document.execCommand("BackColor", false, colour)) {
						makeEditableAndHighlight(colour);
						}
					} catch (ex) {
						makeEditableAndHighlight(colour)
						}
			}
			
			function makeEditableAndHighlight(colour) {
				var range, sel = window.getSelection();
				if (sel.rangeCount && sel.getRangeAt) {
					range = sel.getRangeAt(0);
					}
				document.designMode = "on";
				if (range) {
					sel.removeAllRanges();
					sel.addRange(range);
					}
				// Use HiliteColor since some browsers apply BackColor to the whole block
				if (!document.execCommand("HiliteColor", false, colour)) {
					document.execCommand("BackColor", false, colour);
					}
				document.designMode = "off";
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