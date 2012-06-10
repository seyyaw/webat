$(window).load(function(){
$.get('resources/text1.txt', function(data) { 
       $('#sampletext').append( data.replace("\n"," ") );
});
});