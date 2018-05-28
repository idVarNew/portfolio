( function() {

    "use strict"

    var options = {
            classError: "invalid",
            classOk: "valid",
            typingTimer: null,
            stopTypingInterval: 1050
        },
        elements = {
            form: document.getElementById( "contact-form" ),
            name: document.getElementById( "name" ),
            email: document.getElementById( "email" ),
            message: document.getElementById( "message" ),
            submitMessage: document.getElementById( "contact-alert" ),
            contact: document.getElementById( "contact-form" ),
            nameError: document.querySelector( ".name-error" ),
            emailError: document.querySelector( ".email-error" ),
            messageError: document.querySelector( ".message-error" ),
            inputs: document.querySelectorAll( "input[required]" ),
            textarea: document.querySelector( "textarea[required]" )
        };

    function submitForm() {
        var url = "process.php",
            data = "name=" + elements.name.value + "&email=" + elements.email.value + "&message=" + elements.message.value,

            fetchData = {
                method: "POST",
                mode: "cors",
                cache: "default",
                headers: new Headers( {
                    "Content-Type": "application/x-www-form-urlencoded"
                } ),
                body: data
            };

        fetch( url, fetchData ).then( function( response ) {
            if ( response.ok ) {
                formSuccess();
            } else {
                formError();
            }
        } );
    }

    function formSuccess() {
        elements.submitMessage.classList.remove( "hidden" );
        elements.contact.classList.add( "hidden" );
        elements.submitMessage.textContent = "Message Submitted!";
    }

    function formError() {
        elements.submitMessage.textContent = "There was an error. Message was not submitted. Please try again.";
    }

    function showError( element, error, text ) {
        element.classList.remove( options.classOk );
        element.classList.add( options.classError );
        error.textContent = text;
        element.setAttribute( "aria-invalid", "true" );
    }

    function removeError( element, error, text ) {
        element.classList.remove( options.classError );
        element.classList.add( options.classOk );
        error.textContent = text;
        element.setAttribute( "aria-invalid", "false" );
    }

    function neutralizeError( element ) {
        element.nextElementSibling.classList.add( "neutralize" );
        element.previousElementSibling.classList.add( "is-visible" );
        element.setAttribute( "placeholder", "" );
    }

    function removeNeutralizeError( element, x ) {
        element.nextElementSibling.classList.remove( "neutralize" );
        var placeholderValue = element.getAttribute( "data-placeholder" );
        element.setAttribute( "placeholder", placeholderValue );
    }

    var testInputText = function( input ) {
        var element = input,
            elementValue = element.value;


        if ( element.getAttribute( "pattern" ) != "undefined" ) {
            var reg = new RegExp( element.getAttribute( "pattern" ), "gi" );

            if ( reg.test( elementValue ) === false && elementValue.length > 0 ) {
                showError( element, elements.nameError, "The above field contains at least one invalid character" );
                return false;
            } else if ( reg.test( elementValue ) === false && elementValue.length === 0 ) {
                showError( element, elements.nameError, "The above field cannot be empty" );
                return false;
            } else {
                removeError( element, elements.nameError, "" );
                return true;
            }
        }
    }

    var testInputEmail = function( input ) {

        var element = input,
            elementValue = element.value;

        var reg = /^[0-9a-zA-Z_.-]+@[0-9a-zA-Z.-]+\.[a-zA-Z]{2,3}$/

        if ( reg.test( elementValue ) === false && elementValue.length > 0 ) {
            showError( element, elements.emailError, "You must provide a valid email address" );
            return false;
        } else if ( reg.test( elementValue ) === false && elementValue.length === 0 ) {
            showError( element, elements.emailError, "The above field cannot be empty" );
            return false;
        } else {
            removeError( element, elements.emailError, "" );
            return true;
        }
    }

    var testTextarea = function( textarea ) {
        var element = textarea;
        var elementValue = element.value;

        var reg = /^[\p{Z}\s]*(?:[^\p{Z}\s][\p{Z}\s]*){10,100}$/

        if ( reg.test( elementValue ) === false && elementValue.length > 0 && elementValue.length < 10 ) {
            showError( element, elements.messageError, "Your message cannot be shorter than 10 characters" );

            return false;
        } else if ( reg.test( elementValue ) === false && elementValue.length === 0 ) {
            showError( element, elements.messageError, "This field cannot be empty" );
            return false;
        } else {
            removeError( element, elements.messageError, "" );
            return true;
        }
    }


    var prepareElements = function() {

        var elementsInputArray = Array.from( elements.inputs );

        function addEvents( element, callback ) {
            element.addEventListener( "keyup", function() {
                clearTimeout( options.typingTimer );
                options.typingTimer = setTimeout( callback, options.stopTypingInterval );
            } );

            element.addEventListener( "keydown", function() {
                clearTimeout( options.typingTimer );
            } );

            element.addEventListener( "blur", function() {
                callback();
                removeNeutralizeError( element );
            } );

            element.addEventListener( "focus", function() {
                element.classList.remove( "invalid" );
                neutralizeError( element );
            } );
        }

        elementsInputArray.forEach( function( item ) {
            var type = item.getAttribute( "type" ).toLowerCase();

            item.removeAttribute( "required" );
            item.classList.add( "required" );

            function testElements( e ) {
                if ( type === "text" ) {
                    testInputText( item );
                }
                if ( type === "email" ) {
                    testInputEmail( item );
                }
            }
            addEvents( item, testElements );

        } );

        addEvents( elements.textarea, function() {
            testTextarea( elements.textarea );
        } );
    }

    prepareElements();

    elements.form.addEventListener( "submit", function( e ) {
        e.preventDefault();

        prepareElements();

        var validated = true,
            requiredInputs = document.querySelectorAll( ".required" ),
            inputsCollection = Array.from( requiredInputs );

        inputsCollection.forEach( function( item ) {

            if ( item.getAttribute( "type" ).toLowerCase() == "email" ) {
                if ( !testInputEmail( item ) ) {
                    validated = false;
                }
            }

            if ( item.getAttribute( "type" ).toLowerCase() == "text" ) {
                if ( !testInputText( item ) ) {
                    validated = false;
                }
            }
        } );

        if ( !testTextarea( elements.textarea ) ) {
            validated = false;
        }

        if ( validated === true ) {
            submitForm();
        }

        return validated;
    } );

} )();
