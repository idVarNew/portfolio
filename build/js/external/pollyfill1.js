( function( self ) {
    'use strict';

    if ( self.fetch ) {
        return
    }

    var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob: 'FileReader' in self && 'Blob' in self && ( function() {
            try {
                new Blob()
                return true
            } catch ( e ) {
                return false
            }
        } )(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
    }

    if ( support.arrayBuffer ) {
        var viewClasses = [
            '[object Int8Array]',
            '[object Uint8Array]',
            '[object Uint8ClampedArray]',
            '[object Int16Array]',
            '[object Uint16Array]',
            '[object Int32Array]',
            '[object Uint32Array]',
            '[object Float32Array]',
            '[object Float64Array]'
        ]

        var isDataView = function( obj ) {
            return obj && DataView.prototype.isPrototypeOf( obj )
        }

        var isArrayBufferView = ArrayBuffer.isView || function( obj ) {
            return obj && viewClasses.indexOf( Object.prototype.toString.call( obj ) ) > -1
        }
    }

    function normalizeName( name ) {
        if ( typeof name !== 'string' ) {
            name = String( name )
        }
        if ( /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test( name ) ) {
            throw new TypeError( 'Invalid character in header field name' )
        }
        return name.toLowerCase()
    }

    function normalizeValue( value ) {
        if ( typeof value !== 'string' ) {
            value = String( value )
        }
        return value
    }

    // Build a destructive iterator for the value list
    function iteratorFor( items ) {
        var iterator = {
            next: function() {
                var value = items.shift()
                return {
                    done: value === undefined,
                    value: value
                }
            }
        }

        if ( support.iterable ) {
            iterator[ Symbol.iterator ] = function() {
                return iterator
            }
        }

        return iterator
    }

    function Headers( headers ) {
        this.map = {}

        if ( headers instanceof Headers ) {
            headers.forEach( function( value, name ) {
                this.append( name, value )
            }, this )
        } else if ( Array.isArray( headers ) ) {
            headers.forEach( function( header ) {
                this.append( header[ 0 ], header[ 1 ] )
            }, this )
        } else if ( headers ) {
            Object.getOwnPropertyNames( headers ).forEach( function( name ) {
                this.append( name, headers[ name ] )
            }, this )
        }
    }

    Headers.prototype.append = function( name, value ) {
        name = normalizeName( name )
        value = normalizeValue( value )
        var oldValue = this.map[ name ]
        this.map[ name ] = oldValue ? oldValue + ',' + value : value
    }

    Headers.prototype[ 'delete' ] = function( name ) {
        delete this.map[ normalizeName( name ) ]
    }

    Headers.prototype.get = function( name ) {
        name = normalizeName( name )
        return this.has( name ) ? this.map[ name ] : null
    }

    Headers.prototype.has = function( name ) {
        return this.map.hasOwnProperty( normalizeName( name ) )
    }

    Headers.prototype.set = function( name, value ) {
        this.map[ normalizeName( name ) ] = normalizeValue( value )
    }

    Headers.prototype.forEach = function( callback, thisArg ) {
        for ( var name in this.map ) {
            if ( this.map.hasOwnProperty( name ) ) {
                callback.call( thisArg, this.map[ name ], name, this )
            }
        }
    }

    Headers.prototype.keys = function() {
        var items = []
        this.forEach( function( value, name ) {
            items.push( name )
        } )
        return iteratorFor( items )
    }

    Headers.prototype.values = function() {
        var items = []
        this.forEach( function( value ) {
            items.push( value )
        } )
        return iteratorFor( items )
    }

    Headers.prototype.entries = function() {
        var items = []
        this.forEach( function( value, name ) {
            items.push( [ name, value ] )
        } )
        return iteratorFor( items )
    }

    if ( support.iterable ) {
        Headers.prototype[ Symbol.iterator ] = Headers.prototype.entries
    }

    function consumed( body ) {
        if ( body.bodyUsed ) {
            return Promise.reject( new TypeError( 'Already read' ) )
        }
        body.bodyUsed = true
    }

    function fileReaderReady( reader ) {
        return new Promise( function( resolve, reject ) {
            reader.onload = function() {
                resolve( reader.result )
            }
            reader.onerror = function() {
                reject( reader.error )
            }
        } )
    }

    function readBlobAsArrayBuffer( blob ) {
        var reader = new FileReader()
        var promise = fileReaderReady( reader )
        reader.readAsArrayBuffer( blob )
        return promise
    }

    function readBlobAsText( blob ) {
        var reader = new FileReader()
        var promise = fileReaderReady( reader )
        reader.readAsText( blob )
        return promise
    }

    function readArrayBufferAsText( buf ) {
        var view = new Uint8Array( buf )
        var chars = new Array( view.length )

        for ( var i = 0; i < view.length; i++ ) {
            chars[ i ] = String.fromCharCode( view[ i ] )
        }
        return chars.join( '' )
    }

    function bufferClone( buf ) {
        if ( buf.slice ) {
            return buf.slice( 0 )
        } else {
            var view = new Uint8Array( buf.byteLength )
            view.set( new Uint8Array( buf ) )
            return view.buffer
        }
    }

    function Body() {
        this.bodyUsed = false

        this._initBody = function( body ) {
            this._bodyInit = body
            if ( !body ) {
                this._bodyText = ''
            } else if ( typeof body === 'string' ) {
                this._bodyText = body
            } else if ( support.blob && Blob.prototype.isPrototypeOf( body ) ) {
                this._bodyBlob = body
            } else if ( support.formData && FormData.prototype.isPrototypeOf( body ) ) {
                this._bodyFormData = body
            } else if ( support.searchParams && URLSearchParams.prototype.isPrototypeOf( body ) ) {
                this._bodyText = body.toString()
            } else if ( support.arrayBuffer && support.blob && isDataView( body ) ) {
                this._bodyArrayBuffer = bufferClone( body.buffer )
                // IE 10-11 can't handle a DataView body.
                this._bodyInit = new Blob( [ this._bodyArrayBuffer ] )
            } else if ( support.arrayBuffer && ( ArrayBuffer.prototype.isPrototypeOf( body ) || isArrayBufferView( body ) ) ) {
                this._bodyArrayBuffer = bufferClone( body )
            } else {
                throw new Error( 'unsupported BodyInit type' )
            }

            if ( !this.headers.get( 'content-type' ) ) {
                if ( typeof body === 'string' ) {
                    this.headers.set( 'content-type', 'text/plain;charset=UTF-8' )
                } else if ( this._bodyBlob && this._bodyBlob.type ) {
                    this.headers.set( 'content-type', this._bodyBlob.type )
                } else if ( support.searchParams && URLSearchParams.prototype.isPrototypeOf( body ) ) {
                    this.headers.set( 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8' )
                }
            }
        }

        if ( support.blob ) {
            this.blob = function() {
                var rejected = consumed( this )
                if ( rejected ) {
                    return rejected
                }

                if ( this._bodyBlob ) {
                    return Promise.resolve( this._bodyBlob )
                } else if ( this._bodyArrayBuffer ) {
                    return Promise.resolve( new Blob( [ this._bodyArrayBuffer ] ) )
                } else if ( this._bodyFormData ) {
                    throw new Error( 'could not read FormData body as blob' )
                } else {
                    return Promise.resolve( new Blob( [ this._bodyText ] ) )
                }
            }

            this.arrayBuffer = function() {
                if ( this._bodyArrayBuffer ) {
                    return consumed( this ) || Promise.resolve( this._bodyArrayBuffer )
                } else {
                    return this.blob().then( readBlobAsArrayBuffer )
                }
            }
        }

        this.text = function() {
            var rejected = consumed( this )
            if ( rejected ) {
                return rejected
            }

            if ( this._bodyBlob ) {
                return readBlobAsText( this._bodyBlob )
            } else if ( this._bodyArrayBuffer ) {
                return Promise.resolve( readArrayBufferAsText( this._bodyArrayBuffer ) )
            } else if ( this._bodyFormData ) {
                throw new Error( 'could not read FormData body as text' )
            } else {
                return Promise.resolve( this._bodyText )
            }
        }

        if ( support.formData ) {
            this.formData = function() {
                return this.text().then( decode )
            }
        }

        this.json = function() {
            return this.text().then( JSON.parse )
        }

        return this
    }

    // HTTP methods whose capitalization should be normalized
    var methods = [ 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT' ]

    function normalizeMethod( method ) {
        var upcased = method.toUpperCase()
        return ( methods.indexOf( upcased ) > -1 ) ? upcased : method
    }

    function Request( input, options ) {
        options = options || {}
        var body = options.body

        if ( input instanceof Request ) {
            if ( input.bodyUsed ) {
                throw new TypeError( 'Already read' )
            }
            this.url = input.url
            this.credentials = input.credentials
            if ( !options.headers ) {
                this.headers = new Headers( input.headers )
            }
            this.method = input.method
            this.mode = input.mode
            if ( !body && input._bodyInit != null ) {
                body = input._bodyInit
                input.bodyUsed = true
            }
        } else {
            this.url = String( input )
        }

        this.credentials = options.credentials || this.credentials || 'omit'
        if ( options.headers || !this.headers ) {
            this.headers = new Headers( options.headers )
        }
        this.method = normalizeMethod( options.method || this.method || 'GET' )
        this.mode = options.mode || this.mode || null
        this.referrer = null

        if ( ( this.method === 'GET' || this.method === 'HEAD' ) && body ) {
            throw new TypeError( 'Body not allowed for GET or HEAD requests' )
        }
        this._initBody( body )
    }

    Request.prototype.clone = function() {
        return new Request( this, {
            body: this._bodyInit
        } )
    }

    function decode( body ) {
        var form = new FormData()
        body.trim().split( '&' ).forEach( function( bytes ) {
            if ( bytes ) {
                var split = bytes.split( '=' )
                var name = split.shift().replace( /\+/g, ' ' )
                var value = split.join( '=' ).replace( /\+/g, ' ' )
                form.append( decodeURIComponent( name ), decodeURIComponent( value ) )
            }
        } )
        return form
    }

    function parseHeaders( rawHeaders ) {
        var headers = new Headers()
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace( /\r?\n[\t ]+/, ' ' )
        preProcessedHeaders.split( /\r?\n/ ).forEach( function( line ) {
            var parts = line.split( ':' )
            var key = parts.shift().trim()
            if ( key ) {
                var value = parts.join( ':' ).trim()
                headers.append( key, value )
            }
        } )
        return headers
    }

    Body.call( Request.prototype )

    function Response( bodyInit, options ) {
        if ( !options ) {
            options = {}
        }

        this.type = 'default'
        this.status = 'status' in options ? options.status : 200
        this.ok = this.status >= 200 && this.status < 300
        this.statusText = 'statusText' in options ? options.statusText : 'OK'
        this.headers = new Headers( options.headers )
        this.url = options.url || ''
        this._initBody( bodyInit )
    }

    Body.call( Response.prototype )

    Response.prototype.clone = function() {
        return new Response( this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers( this.headers ),
            url: this.url
        } )
    }

    Response.error = function() {
        var response = new Response( null, {
            status: 0,
            statusText: ''
        } )
        response.type = 'error'
        return response
    }

    var redirectStatuses = [ 301, 302, 303, 307, 308 ]

    Response.redirect = function( url, status ) {
        if ( redirectStatuses.indexOf( status ) === -1 ) {
            throw new RangeError( 'Invalid status code' )
        }

        return new Response( null, {
            status: status,
            headers: {
                location: url
            }
        } )
    }

    self.Headers = Headers
    self.Request = Request
    self.Response = Response

    self.fetch = function( input, init ) {
        return new Promise( function( resolve, reject ) {
            var request = new Request( input, init )
            var xhr = new XMLHttpRequest()

            xhr.onload = function() {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: parseHeaders( xhr.getAllResponseHeaders() || '' )
                }
                options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get( 'X-Request-URL' )
                var body = 'response' in xhr ? xhr.response : xhr.responseText
                resolve( new Response( body, options ) )
            }

            xhr.onerror = function() {
                reject( new TypeError( 'Network request failed' ) )
            }

            xhr.ontimeout = function() {
                reject( new TypeError( 'Network request failed' ) )
            }

            xhr.open( request.method, request.url, true )

            if ( request.credentials === 'include' ) {
                xhr.withCredentials = true
            }

            if ( 'responseType' in xhr && support.blob ) {
                xhr.responseType = 'blob'
            }

            request.headers.forEach( function( value, name ) {
                xhr.setRequestHeader( name, value )
            } )

            xhr.send( typeof request._bodyInit === 'undefined' ? null : request._bodyInit )
        } )
    }
    self.fetch.polyfill = true
} )( typeof self !== 'undefined' ? self : this );
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170112
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ( "document" in self ) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if ( !( "classList" in document.createElement( "_" ) ) ||
        document.createElementNS && !( "classList" in document.createElementNS( "http://www.w3.org/2000/svg", "g" ) ) ) {

        ( function( view ) {

            "use strict";

            if ( !( 'Element' in view ) ) return;

            var
                classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = view.Element[ protoProp ],
                objCtr = Object,
                strTrim = String[ protoProp ].trim || function() {
                    return this.replace( /^\s+|\s+$/g, "" );
                },
                arrIndexOf = Array[ protoProp ].indexOf || function( item ) {
                    var
                        i = 0,
                        len = this.length;
                    for ( ; i < len; i++ ) {
                        if ( i in this && this[ i ] === item ) {
                            return i;
                        }
                    }
                    return -1;
                }
                // Vendors: please allow content code to instantiate DOMExceptions
                ,
                DOMEx = function( type, message ) {
                    this.name = type;
                    this.code = DOMException[ type ];
                    this.message = message;
                },
                checkTokenAndGetIndex = function( classList, token ) {
                    if ( token === "" ) {
                        throw new DOMEx(
                            "SYNTAX_ERR", "An invalid or illegal string was specified"
                        );
                    }
                    if ( /\s/.test( token ) ) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR", "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call( classList, token );
                },
                ClassList = function( elem ) {
                    var
                        trimmedClasses = strTrim.call( elem.getAttribute( "class" ) || "" ),
                        classes = trimmedClasses ? trimmedClasses.split( /\s+/ ) : [],
                        i = 0,
                        len = classes.length;
                    for ( ; i < len; i++ ) {
                        this.push( classes[ i ] );
                    }
                    this._updateClassName = function() {
                        elem.setAttribute( "class", this.toString() );
                    };
                },
                classListProto = ClassList[ protoProp ] = [],
                classListGetter = function() {
                    return new ClassList( this );
                };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[ protoProp ] = Error[ protoProp ];
            classListProto.item = function( i ) {
                return this[ i ] || null;
            };
            classListProto.contains = function( token ) {
                token += "";
                return checkTokenAndGetIndex( this, token ) !== -1;
            };
            classListProto.add = function() {
                var
                    tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false;
                do {
                    token = tokens[ i ] + "";
                    if ( checkTokenAndGetIndex( this, token ) === -1 ) {
                        this.push( token );
                        updated = true;
                    }
                }
                while ( ++i < l );

                if ( updated ) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function() {
                var
                    tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false,
                    index;
                do {
                    token = tokens[ i ] + "";
                    index = checkTokenAndGetIndex( this, token );
                    while ( index !== -1 ) {
                        this.splice( index, 1 );
                        updated = true;
                        index = checkTokenAndGetIndex( this, token );
                    }
                }
                while ( ++i < l );

                if ( updated ) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function( token, force ) {
                token += "";

                var
                    result = this.contains( token ),
                    method = result ?
                    force !== true && "remove" :
                    force !== false && "add";

                if ( method ) {
                    this[ method ]( token );
                }

                if ( force === true || force === false ) {
                    return force;
                } else {
                    return !result;
                }
            };
            classListProto.toString = function() {
                return this.join( " " );
            };

            if ( objCtr.defineProperty ) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty( elemCtrProto, classListProp, classListPropDesc );
                } catch ( ex ) { // IE 8 doesn't support enumerable:true
                    // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
                    // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
                    if ( ex.number === undefined || ex.number === -0x7FF5EC54 ) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty( elemCtrProto, classListProp, classListPropDesc );
                    }
                }
            } else if ( objCtr[ protoProp ].__defineGetter__ ) {
                elemCtrProto.__defineGetter__( classListProp, classListGetter );
            }

        }( self ) );

    } else {
        // There is full or partial native classList support, so just check if we need
        // to normalize the add/remove and toggle APIs.

        ( function() {
            "use strict";

            var testElement = document.createElement( "_" );

            testElement.classList.add( "c1", "c2" );

            // Polyfill for IE 10/11 and Firefox <26, where classList.add and
            // classList.remove exist but support only one argument at a time.
            if ( !testElement.classList.contains( "c2" ) ) {
                var createMethod = function( method ) {
                    var original = DOMTokenList.prototype[ method ];

                    DOMTokenList.prototype[ method ] = function( token ) {
                        var i, len = arguments.length;

                        for ( i = 0; i < len; i++ ) {
                            token = arguments[ i ];
                            original.call( this, token );
                        }
                    };
                };
                createMethod( 'add' );
                createMethod( 'remove' );
            }

            testElement.classList.toggle( "c3", false );

            // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
            // support the second argument.
            if ( testElement.classList.contains( "c3" ) ) {
                var _toggle = DOMTokenList.prototype.toggle;

                DOMTokenList.prototype.toggle = function( token, force ) {
                    if ( 1 in arguments && !this.contains( token ) === !force ) {
                        return force;
                    } else {
                        return _toggle.call( this, token );
                    }
                };

            }

            testElement = null;
        }() );

    }

}
if ( !Array.from ) {
    Array.from = ( function() {
        var toStr = Object.prototype.toString;
        var isCallable = function( fn ) {
            return typeof fn === 'function' || toStr.call( fn ) === '[object Function]';
        };
        var toInteger = function( value ) {
            var number = Number( value );
            if ( isNaN( number ) ) {
                return 0;
            }
            if ( number === 0 || !isFinite( number ) ) {
                return number;
            }
            return ( number > 0 ? 1 : -1 ) * Math.floor( Math.abs( number ) );
        };
        var maxSafeInteger = Math.pow( 2, 53 ) - 1;
        var toLength = function( value ) {
            var len = toInteger( value );
            return Math.min( Math.max( len, 0 ), maxSafeInteger );
        };

        // The length property of the from method is 1.
        return function from( arrayLike /*, mapFn, thisArg */ ) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object( arrayLike );

            // 3. ReturnIfAbrupt(items).
            if ( arrayLike == null ) {
                throw new TypeError( "Array.from requires an array-like object - not null or undefined" );
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[ 1 ] : void undefined;
            var T;
            if ( typeof mapFn !== 'undefined' ) {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if ( !isCallable( mapFn ) ) {
                    throw new TypeError( 'Array.from: when provided, the second argument must be a function' );
                }

                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if ( arguments.length > 2 ) {
                    T = arguments[ 2 ];
                }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength( items.length );

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable( C ) ? Object( new C( len ) ) : new Array( len );

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while ( k < len ) {
                kValue = items[ k ];
                if ( mapFn ) {
                    A[ k ] = typeof T === 'undefined' ? mapFn( kValue, k ) : mapFn.call( T, kValue, k );
                } else {
                    A[ k ] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }() );
}
