//---------------------------------------------------------
// Remove Outline
//---------------------------------------------------------
( function() {
    var d = document,
        styleElement = d.createElement( "STYLE" ),
        domEvents = "addEventListener" in d,
        addEventListener = function( type, callback ) {
            if ( domEvents ) {
                d.addEventListener( type, callback );
            } else {
                d.attachEvent( "on" + type, callback );
            }
        },
        setCss = function( cssText ) {
            !!styleElement.styleSheet ? styleElement.styleSheet.cssText = cssText : styleElement.innerHTML = cssText;
        };

    d.getElementsByTagName( "HEAD" )[ 0 ].appendChild( styleElement );
    addEventListener( "mousedown", onMouseDown );
    addEventListener( "keydown", onKeyDown );

    function onMouseDown() {
        setCss( ":focus{outline:0}::-moz-focus-inner{border:0;}" );
    }

    function onKeyDown() {
        setCss( "" );
    }
} )();
