( function() {

    "use strict"
    var accordionPanel = document.getElementsByClassName( "accordion-panel" );

    for ( var i = 0; i < accordionPanel.length; i++ ) {

        accordionPanel[ i ].addEventListener( "click", animtePanel )
        accordionPanel[ i ].addEventListener( "keydown", animtePanel )

        function animtePanel( e ) {
            e.stopPropagation();

            var accordianHeading = document.getElementsByClassName( "accordion-heading" ),
                panel = e.target.nextElementSibling,
                classActive = "active",
                ariaHidden = "aria-hidden",
                ariaSelected = "aria-selected";

            for ( var x = 0; x < accordianHeading.length; x++ ) {
                if ( !( accordianHeading[ x ] === e.target ) && e.type === "click" || !( accordianHeading[ x ] === e.target ) && e.keyCode === 13 ) {

                    var panels = accordianHeading[ x ].nextElementSibling;
                    if ( panels.style.maxHeight ) {
                        panels.style.maxHeight = null;
                        e.target.nextElementSibling.setAttribute( ariaHidden, true )
                        e.target.setAttribute( ariaSelected, false );
                        accordianHeading[ x ].classList.remove( classActive );
                    }
                }
            }

            if ( ( panel.style.maxHeight && e.type === "click" ) || ( panel.style.maxHeight && e.keyCode === 13 ) ) {

                panel.style.maxHeight = null;
                e.target.nextElementSibling.setAttribute( ariaHidden, true );
                e.target.setAttribute( ariaSelected, false );
                e.target.classList.remove( classActive );

            } else if ( ( !panel.style.maxHeight && e.type === "click" ) || ( !panel.style.maxHeight && e.keyCode === 13 ) ) {

                e.target.classList.add( classActive );
                e.target.nextElementSibling.setAttribute( ariaHidden, false );
                e.target.setAttribute( ariaSelected, true );
                panel.style.maxHeight = panel.scrollHeight + "px";

            }
        }
    }

} )();
