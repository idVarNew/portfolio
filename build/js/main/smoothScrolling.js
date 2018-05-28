( function() {

    "use strict"
    var scrollUp, scrollDown

    document.body.addEventListener( 'click', function( e ) {

        clearInterval( scrollUp );
        clearInterval( scrollDown );

        if ( e.target.classList.contains( "link" ) ) {
            e.preventDefault();
            var hash = e.target.getAttribute( 'href' )
            var elementId = hash.slice( 1, hash.length )

            var element = document.getElementById( elementId )
            var distanceScrolled = ( document.documentElement && document.documentElement.scrollTop ) || document.body.scrollTop,
                elemRect = element.getBoundingClientRect(),
                elemViewportOffset = elemRect.top,
                objectPosition = distanceScrolled + elemViewportOffset;


            if ( distanceScrolled > ( objectPosition + 500 ) ) {
                scrollUp = setInterval( function() {

                    if ( window.pageYOffset > objectPosition ) {
                        window.scrollBy( 0, -45 );

                    } else {
                        clearInterval( scrollUp );
                        location.hash = hash;
                    }

                }, 15 );
            }
            if ( distanceScrolled < ( objectPosition ) ) {

                scrollDown = setInterval( function() {
                    var oP = parseInt( objectPosition )
                    if ( window.pageYOffset < ( oP - 1 ) ) {
                        window.scrollBy( 0, 45 );

                    } else {
                        clearInterval( scrollDown );
                        location.hash = hash;
                    }

                }, 15 );
            }
        }
    } )
} )();
