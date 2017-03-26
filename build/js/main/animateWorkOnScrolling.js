( function() {

    "use strict"

    window.addEventListener( "scroll", animateWorkOnScrolling )


    function animateWorkOnScrolling() {
        var scrollPosition = document.body.scrollTop,
            navLinks = document.querySelectorAll( 'article[id^="work-"]' ),
            navLinksArray = Array.from( navLinks ),
            sectionsId = navLinksArray.map( getId ),
            sectionHeight = document.getElementById( "home" ).offsetHeight,
            distance = sectionHeight / 2,
            elements = [],
            className = {
                withColor: 'work-2',
                withoutColor: 'work-1'
            };
        sectionsId.forEach( getElement )

        function getId( item, index ) {
            var id = item.getAttribute( "id" );
            return id;
        }

        function getElement( item, index ) {
            elements[ index ] = document.getElementById( item );
            var element = elements[ index ];
            animateElement( element )
        }

        function getElementPosition( element ) {
            var distanceScrolled = document.body.scrollTop,
                elementRect = element.getBoundingClientRect(),
                elementViewportOffset = elementRect.top,
                elementPosition = distanceScrolled + elementViewportOffset
            return elementPosition
        }

        function changeElementClass( elementPosition, element ) {
            if ( scrollPosition > elementPosition - distance ) {
                element.classList.remove( className.withColor )
                element.classList.add( className.withoutColor );
            } else {
                element.classList.remove( className.withoutColor )
                element.classList.add( className.withColor );
            }
        }

        function animateElement( element ) {
            changeElementClass( getElementPosition( element ), element )
        }

    }

} )();
