/**
 * Fit text to box. Pass the container ID to the function
 * and it will resize the textarea.
 * 
 * @param {string} container container class or ID
 */

var fitty = new fitTextToDiv( '.container', { initialFontSize: 12 } );

function fitTextToDiv( selectors, options ) {
    
    this.targetElement = document.querySelectorAll( selectors );
    this.options = options;
    
    //
    //Variables
    //
    
    var vpw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        resizeTimer, //Set the window width
        liveContainers = [];
    
    
    //If nothing, end
    if ( !this.targetElement ){ return; }
    
    
    //
    // Defaults
    //
    
    var defaultOptions = {
        initialFontSize: 56,
    }

    for (var optionName in this.defaultOptions) {
        if (typeof this.options[optionName] === 'undefined')
            this.options[optionName] = this.defaultOptions[optionName];
    }
        

    //
    // Init plugin
    //

    setStyling();
    
    for (var i = 0; i < this.targetElement.length; i++) {
        if ( this.targetElement[i].getElementsByTagName("textarea") ){

            var textarea = this.targetElement[i].getElementsByTagName("textarea")[0];
            
            var newObj = {
                container: this.targetElement[i],
                
                textarea: textarea,
                textareaWidth: textarea.scrollWidth,
                textareaHeight: textarea.scrollHeight,
                
                hiddenDiv: createMeasurer( this.targetElement[i] ),
                hiddenDivHeight: null,
                
                contentTooBig: false,   //Is content too large for container
                textDeleted: false,     //Has any text been deleted
                liveFontSize: options.initialFontSize,     //The current live font size for the text
            };
            
            //Set initial width of hidden div
            setHiddenDivWidth( newObj );
            
            //Set text size for hidden div and textarea
            setTextareaFont( newObj );
            setHiddenDivFont( newObj );
            
            //Set onchange listener for textarea
            this.targetElement[i].getElementsByTagName("textarea")[0].addEventListener("input", function(e) { inputChanged( newObj ) }, false);
            
            //Add object to array
            liveContainers.push( newObj ); 
        }
    }
    
    //If no divs found, end
    if ( !liveContainers ){ return; }
    
    
    //
    //
    // From this point, it is functions to run plugin
    //
    //
    
    
    //Create the hidden div to measure text
    //Pass the origin dom element to the function
    //Return new element to be used later
    function createMeasurer( origin ){
        
        //Create dom element
        //Set content to empty
        var x = document.createElement('div');
        
        //Hide new element
        x.style.display = 'none';
        
        //Add hiddensizer class (WHY?)
        x.classList.add('hiddensizer');
        
        //Add this new element to document
        document.body.appendChild(x);
        
        return x;
        
    }
    
    
    /**
     * Append a stylesheet to the head that addes essential styling
     */
    function setStyling(){

        var css = '.hiddensizer {display:block;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;} .hiddensizer .lbr { line-height: 3px;}',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
        
        //Once run, rewrite function to never run again, and return false
        setStyling = function(){
            return false;
        }   
    }
    
    
    /*
     * Sets the hidden div width the same as the container width
     * 
     * Pass in the correct object from the liveContainer
     **/
    function setHiddenDivWidth( obj ){
        var oW = obj.container.scrollWidth; //Get origin width
        //Set width of hidden element
        obj.hiddenDiv.setAttribute("style","width:" + oW + "px");
        obj.hiddenDiv.style.width = oW + 'px';
    }
    
    
    function setHiddenDivFont( obj ){
        
        //console.log( obj.liveFontSize );
        
        obj.hiddenDiv.style.fontSize = obj.liveFontSize + "px";
    }
    
    function setTextareaFont( obj ){
        obj.textarea.style.fontSize = obj.liveFontSize + "px";
    }
    
    /**
     * Update the new details required for calculations
     */
    function setObjDetails( obj ){
        obj.textareaWidth = obj.textarea.scrollWidth;
        obj.textareaHeight = obj.textarea.scrollHeight;
        obj.hiddenDivHeight = obj.hiddenDiv.scrollHeight;
    }
        

    window.onresize = function(event) {
        
        //Update screenwidth
        vpw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        
        //Debounce resize
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            
            //Run after debounce code here
            
            //Run any code to apply to all containers here
            
            //Loop through liveContainer array
            for (var i = 0; i < liveContainers.length; i++) {
                
                //Reset hidden div width
                setHiddenDivWidth( liveContainers[i] );
                
                //Update liveContainer details
                setObjDetails( liveContainers[i] );
                
            }
            
        }, 250);
        
    }
    
    
    /**
     * This function is fired when the input changes on a textarea
     * @param {object} obj This is liveContainer object
     */
    function inputChanged( obj ){
        
        //If there is content to be sized
        if( getContent( obj ) ){
            checkheight( obj );
        } else {
            writer.css('font-size', options.initialFontSize + 'px');
        }    
        
    }
        
    
    //Append content to hiddenDiv
    //Measure height of hidden div
    //do text sizing
    //append text of correct size back to textarea
    //http://jsfiddle.net/ImpressiveWebs/fGNNT/1333/
    
    
    /**
     * Get content from the textarea and pass to hidden div
     * 
     * Returns true if content moved, false if not
     */
    
    function getContent( obj ){
        var content = obj.textarea.value;
        if ( !content ){ return false; } //If no content, return false
        content = content.replace(/\n/g, '<br>'); //Replace line breaks
        obj.hiddenDiv.innerHTML = content + '<br class="lbr">'; //Add break to bottom of content
        return true;
    }
    
    
    function checkheight( obj ){
        
        // Measure the hidden div, if its height it smaller than textarea, make font bigger
        if ( obj.hiddenDivHeight < obj.textareaHeight ){

            // Whilst the hidden hieght is smaller than the textarea
            // Text is shorter than div height, or thinner than div width
            while ( obj.hiddenDivHeight < obj.textareaHeight ){
                
                //Increase live size
                obj.liveFontSize = obj.liveFontSize + 1;
                
                setHiddenDivFont( obj );  

                // Update internal hieght var
                obj.hiddenDivHeight = obj.hiddenDiv.scrollHeight;
                
                console.log( obj.hiddenDivHeight + ' - ' + obj.textareaHeight );

            }

            var loopCount = 0;
            var fontSizeChange = obj.liveFontSize / 1.5;
            
            while ( obj.hiddenDivHeight >= obj.textareaHeight ) {

                // If the text within the div is escaping, 
                // or the loop has decreased the font more than half the font size.
                if ( !shrinkText( obj.hiddenDiv ) || loopCount > fontSizeChange ){
                    break;
                }

                loopCount++;

            }

            contentTooBig = false;

            setTextareaFont( obj );  


        } else {

            obj.contentTooBig = true;

        }
        
    }
    

    function shrinkText( obj ){

        // If the font size is smaller than minimum size
        if( liveFontSize < smallestFontSize ){ //set min size
            return false;
        }

        if( liveFontSize >= smallestFontSize ){
            liveFontSize = liveFontSize - 1;
            hiddenDiv.css('font-size', liveFontSize + "px");
        }

        return true;

    }


    function increaseTextarea( obj ){

        //First resize container box
        if ( thisHeight < parentHeight ){
            writer.height( thisHeight );
        } else {
            writer.height( parentHeight );
        }

    }
                
};