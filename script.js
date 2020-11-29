var $container = $( '#container' ),

	// the element we will apply the BookBlock plugin to
	$bookBlock = $( '#bb-bookblock' ),

	// the BookBlock items (bb-item)
	$items = $bookBlock.children(),

	// index of the current item
	current = 0,

	// initialize the BookBlock
	bb = $( '#bb-bookblock' ).bookblock( {
		speed : 800,
		perspective : 2000,
		shadowSides	: 0.8,
		shadowFlip	: 0.4,
		// after each flip...
		onEndFlip : function(old, page, isLimit) {
			
			// update the current value
			current = page;

			// update the selected item of the table of contents (TOC)
			updateTOC();

			// show and/or hide the navigation arrows
			updateNavigation( isLimit );

			// initialize the jScrollPane on the content div for the new item
			setJSP( 'init' );

			// destroy jScrollPane on the content div for the old item
			setJSP( 'destroy', old );

		}
	} ),
	// the navigation arrows
	$navNext = $( '#bb-nav-next' ),
	$navPrev = $( '#bb-nav-prev' ).hide(),

	// the table of content items
	$menuItems = $container.find( 'ul.menu-toc > li' ),

	// button to open the TOC
	$tblcontents = $( '#tblcontents' ),

	transEndEventNames = {
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'msTransition': 'MSTransitionEnd',
		'transition': 'transitionend'
	},

	// transition event name
	transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],

	// check if transitions are supported
	supportTransitions = Modernizr.csstransitions;
function init() {

	// initialize jScrollPane on the content div of the first item
	setJSP( 'init' );
	initEvents();

}
function setJSP( action, idx ) {
		
	var idx = idx === undefined ? current : idx,
		$content = $items.eq( idx ).children( 'div.content' ),
		apiJSP = $content.data( 'jsp' );
	
	if( action === 'init' && apiJSP === undefined ) {
		$content.jScrollPane({verticalGutter : 0, hideFocus : true });
	}
	else if( action === 'reinit' && apiJSP !== undefined ) {
		apiJSP.reinitialise();
	}
	else if( action === 'destroy' && apiJSP !== undefined ) {
		apiJSP.destroy();
	}

}
function initEvents() {

	// add navigation events
	$navNext.on( 'click', function() {
		bb.next();
		return false;
	} );

	$navPrev.on( 'click', function() {
		bb.prev();
		return false;
	} );
	
	// add swipe events
	$items.on( {
		'swipeleft'		: function( event ) {
			if( $container.data( 'opened' ) ) {
				return false;
			}
			bb.next();
			return false;
		},
		'swiperight'	: function( event ) {
			if( $container.data( 'opened' ) ) {
				return false;
			}
			bb.prev();
			return false;
		}
	} );

	// show TOC
	$tblcontents.on( 'click', toggleTOC );

	// click a menu item
	$menuItems.on( 'click', function() {

		var $el = $( this ),
			idx = $el.index(),
			jump = function() {
				bb.jump( idx + 1 );
			};
		
		current !== idx ? closeTOC( jump ) : closeTOC();

		return false;
		
	} );

	// reinit jScrollPane on window resize
	$( window ).on( 'debouncedresize', function() {
		// reinitialise jScrollPane on the content div
		setJSP( 'reinit' );
	} );

}
function updateNavigation( isLastPage ) {
	
	if( current === 0 ) {
		$navNext.show();
		$navPrev.hide();
	}
	else if( isLastPage ) {
		$navNext.hide();
		$navPrev.show();
	}
	else {
		$navNext.show();
		$navPrev.show();
	}

}
function toggleTOC() {
	var opened = $container.data( 'opened' );
	opened ? closeTOC() : openTOC();
}

function openTOC() {
	$navNext.hide();
	$navPrev.hide();
	$container.addClass( 'slideRight' ).data( 'opened', true );
}

function closeTOC( callback ) {

	$navNext.show();
	$navPrev.show();
	$container.removeClass( 'slideRight' ).data( 'opened', false );
	if( callback ) {
		if( supportTransitions ) {
			$container.on( transEndEventName, function() {
				$( this ).off( transEndEventName );
				callback.call();
			} );
		}
		else {
			callback.call();
		}
	}

}
