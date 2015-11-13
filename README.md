# typing.js
This is a typing animation library using vanilla javascript and hence have no dependency. Its souce is written in TypeScript that can produce ECMA 3/5/6 as per your need.

You can add a new line, append to an existing line, add and delete , delete last line or whole with the typing backward effect and if for deleting you don't want the effect you can just clear. You can also take a users input and then can you later.

This is still in Alpha.
Detailed Documentation and Examples will be added shortly.

Sort usage guidlines:

1. add typing.js from dist to your html file
2. create a empty  div and give it an id.
    Eg: <div id="my_typing_area"></div>
    adjust styles as per your need
3. in your script section create a class like this and few objects for typing text and other action then pass it to function startTyping 

    var demoTyping = 
    new TypingModule.Typing(document.getElementById("my_typing_area"));
    
    var typeObj1= {
    	text2type:"Please Enter Your Name to continue :",
    	forwardSpeed: 50,
    	backwardSpeed:75,
    	delay:20,
    	action: 1
    }
    var typeObj2= {
    	text2type:"",
    	forwardSpeed: 100,
    	backwardSpeed:75,
    	delay:20,
    	action: 3
    }
    var typeObj3= {
    	text2type:"Hello #userinput#, Have a good day",
    	forwardSpeed: 100,
    	backwardSpeed:75,
    	delay:20,
    	action: 1
    }
demoTyping.startTyping([typeObj1, typeObj2, typeObj3,]);

Values of acion:
	0:	"append", //with typing effect
	1:	"newLine", //with typing effect
	2:	"addDeleteLine", //add a line with effect and after delay delete it
	3:	"userInput",//take the users input
	4:	"deleteLast", // with typing effect
	5:	"deleteAll", //with typing effect
	6:	"clearLast", //direct delete lastchild node
	7:	"clearAll" //delete all child node

See a Demo at : http://www.sujeetjaiswal.com/diwali
