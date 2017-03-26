( function() {

    "use strict"

    window.addEventListener( "scroll", animateSectionsOnScrolling )

    function animateSectionsOnScrolling() {
        var scrollPosition = document.body.scrollTop,
            navLinks = document.querySelectorAll( '.nav-list a[href^="#"]' ),
            navLinksArray = Array.from( navLinks ),
            sectionsId = navLinksArray.map( getId ),
            elements = [];

        sectionsId.forEach( getElement )

        function getId( item ) {
            var hash = item.getAttribute( "href" ),
                id = hash.slice( 1, hash.length );
            return id;
        }

        function getElementPosition( element ) {

            var distanceScrolled = document.body.scrollTop,
                elementRect = element.getBoundingClientRect(),
                elementViewportOffset = elementRect.top,
                elementPosition = distanceScrolled + elementViewportOffset
            return elementPosition
        }

        function getElement( item, index ) {
            elements[ index ] = document.getElementById( item );
            var element = elements[ index ];
            animateElement( element, item )
        }

        function changeColor( elementPosition, element, item ) {
            var sectionHeight = element.offsetHeight
            if ( scrollPosition >= elementPosition - 150 && scrollPosition < ( elementPosition + sectionHeight - 150 ) ) {
                element.classList.remove( item + "-1" )
                element.classList.add( item + "-2" );

            } else {
                element.classList.remove( item + "-2" )
                element.classList.add( item + "-1" );
            }
        }

        function animateElement( element, item ) {
            changeColor( getElementPosition( element ), element, item )
        }
    }
} )();
