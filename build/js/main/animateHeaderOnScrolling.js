( function() {

    "use strict"


    window.addEventListener( "scroll", animateHeaderOnScrolling );


    function animateHeaderOnScrolling() {
        var scrollPosition = document.body.scrollTop,
            className = {
                dark: "dark",
                bright: "bright",
                logoDark: "logo-dark",
                logoBright: "logo-bright"
            },
            idElement = getElementId( '.nav-list a[href^="#"]' );

        idElement.forEach( getElement );

        function getElementId( id ) {
            var navLinks = document.querySelectorAll( id ),
                navLinksArray = Array.from( navLinks ),
                sectionsId = navLinksArray.map( getId );

            function getId( item ) {
                var hash = item.getAttribute( "href" ),
                    id = hash.slice( 1, hash.length );

                return id;
            }
            return sectionsId;
        }

        function getElementPosition( element ) {
            var distanceScrolled = document.body.scrollTop,
                elementRect = element.getBoundingClientRect(),
                elementViewportOffset = elementRect.top,
                elementPosition = distanceScrolled + elementViewportOffset;

            return elementPosition;
        }

        function getElement( item, index, array ) {
            var elements = [];
            elements[ index ] = document.getElementById( item );
            var element = elements[ index ];
            animateElement( element, item );
        }

        function changeColor( elementPosition, element, item ) {
            var sectionHeight = element.offsetHeight;
            if ( scrollPosition >= elementPosition - 154 && scrollPosition < ( elementPosition + sectionHeight - 150 ) ) {

                activeMenuLink( item );

                if ( item === "home" || item === "contact" ) {
                    changeHeaderClass( className.dark, className.bright );
                    changeLogoColor( className.logoDark, className.logoBright );
                } else {
                    changeHeaderClass( className.bright, className.dark )
                    changeLogoColor( className.logoBright, className.logoDark );
                }
            }
        }

        function animateElement( element, item ) {
            changeColor( getElementPosition( element ), element, item );
        }
    }

    function activeMenuLink( hash ) {
        var selectedHashLink = document.querySelector( 'a[href^="#' + hash + '"]' ),
            allHashLinks = document.querySelectorAll( 'a[href^="#"]' ),
            linkElements = Array.from( allHashLinks ),
            activeClass = "activeLink";

        linkElements.forEach( removeActive );
        selectedHashLink.classList.add( activeClass );

        function removeActive( item ) {
            item.classList.remove( activeClass );
        }
    }

    function changeHeaderClass( removeClass, addClass ) {
        var headerElements = document.querySelectorAll( ".link" ),
            elements = Array.from( headerElements );

        elements.forEach( updateClass );

        function updateClass( item ) {
            item.classList.remove( removeClass );
            item.classList.add( addClass );
        }
    }

    function changeLogoColor( removeClass, addClass ) {
        var headerElements = document.querySelectorAll( ".logo-part" ),
            elements = Array.from( headerElements );

        elements.forEach( updateClass );

        function updateClass( item ) {
            item.classList.remove( removeClass );
            item.classList.add( addClass );
        }
    }


} )();
