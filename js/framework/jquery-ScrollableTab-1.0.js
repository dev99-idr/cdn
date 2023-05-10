/**
 * jQuery.ScrollableTab - Scrolling multiple tabs.
 * @copyright (c) 2010 Astun Technology Ltd - http://www.astuntechnology.com
 * Dual licensed under MIT and GPL.
 * Date: 28/04/2010
 * @author Aamir Afridi - aamirafridi(at)gmail(dot)com | http://www.aamirafridi.com
 * @version 1.0
 */
 
;(function($){
	//Global plugin settings
	var settings = {
		'animationSpeed' : 100, //The speed in which the tabs will animate/scroll
		'closable' : false, //Make tabs closable
		'resizable' : false, //Alow resizing the tabs container
		'resizeHandles' : 'e,s,se', //Resizable in North, East and NorthEast directions
		'loadLastTab':false, //When tabs loaded, scroll to the last tab - default is the first tab
		'easing':'swing' //The easing equation
	}
	
	$.fn.scrollabletab = function(options){
		//Check if scrollto plugin is available - (pasted the plugin at the end of this plugin)
		//if(!$.fn.scrollTo) return alert('Error:\nScrollTo plugin not available.');

		return this.each(function(){
			var	o = $.extend({}, settings, options), //Extend the options if any provided
			$tabs = $(this),
			$tabsNav = $tabs.find('.ui-tabs-nav'),
			$nav;//will save the refrence for the wrapper having next and previous buttons
			
			//Adjust the css class
			//$tabsNav.removeClass('ui-corner-all').addClass('ui-corner-top');
			$tabs.css({'padding':2, 'position':'relative'});
			//$tabsNav.css('position','inherit');
						
			//Wrap inner items
			$tabs.wrap('<div id="stTabswrapper" class="stTabsMainWrapper" style="position:relative"/>').find('.ui-tabs-nav').css('overflow','hidden').wrapInner('<div class="stTabsInnerWrapper" style="width:30000px"><span class="stWidthChecker"/></div>');
			
			var $widthChecker = $tabs.find('.stWidthChecker'),
				$itemContainer = $tabs.find('.stTabsInnerWrapper'),
				$tabsWrapper = $tabs.parents('#stTabswrapper').width($tabs.outerWidth(true));
				//Fixing safari bug
				if($.browser.safari)
				{
					$tabsWrapper.width($tabs.width()+6);
				}
				//alert($tabsWrapper.width());
			if(o.resizable)
			{
				if(!!$.fn.resizable)
				{
					$tabsWrapper.resizable({
						minWidth : $tabsWrapper.width(),
						maxWidth : $tabsWrapper.width()*2,
						minHeight : $tabsWrapper.height(),
						maxHeight : $tabsWrapper.height()*2,
						handles : o.resizeHandles,
						alsoResize: $tabs,
						//start : function(){  },
						resize: function(){
							$tabs.trigger('resized');
						}
						//stop: function(){ $tabs.trigger('scrollToTab',$tabsNav.find('li.ui-tabs-selected')); }
					});
				}
				else
				{
					alert('Error:\nCannot be resizable because "jQuery.resizable" plugin is not available.');
				}
			}
			

			//Add navigation icons
				//Total height of nav/2 - total height of arrow/2
			var arrowsTopMargin = (parseInt(parseInt($tabsNav.innerHeight(true)/2)-8)),
				arrowsCommonCss={'cursor':'pointer','z-index':1000,'position':'absolute','top':3,'height':$tabsNav.outerHeight()-($.browser.safari ? 2 : 1)};
			$tabsWrapper.prepend(
			  $nav = $('<div/>')
			  		.disableSelection()
					.css({'position':'relative','z-index':3000,'display':'none'})
					.append(
						$('<span/>')
							.disableSelection()
							.attr('title','Previous tab')
							.css(arrowsCommonCss)
							.addClass('ui-state-active ui-corner-tl ui-corner-bl stPrev stNav')
							.css('left',3)
							.append($('<span/>').disableSelection().addClass('ui-icon ui-icon-carat-1-w').html('Previous tab').css('margin-top',arrowsTopMargin))
							.click(function(){
								//Check if disabled
								if($(this).hasClass('ui-state-disabled')) return;
								//Just select the previous tab and trigger scrollToTab event
								prevIndex = $tabsNav.find('li.ui-tabs-selected').prevAll().length-1
								//Now select the tab
								$tabsNav.find('li').eq(prevIndex).find('a').trigger('click');
								return false;
							}),
						$('<span/>')
							.disableSelection()
							.attr('title','Next tab')
							.css(arrowsCommonCss)
							.addClass('ui-state-active ui-corner-tr ui-corner-br stNext stNav')
							.css({'right':3})
							.append($('<span/>').addClass('ui-icon ui-icon-carat-1-e').html('Next tab').css('margin-top',arrowsTopMargin))
							.click(function(){
								//Just select the previous tab and trigger scrollToTab event
								nextIndex = $tabsNav.find('li.ui-tabs-selected').prevAll().length+1
								//Now select the tab
								$tabsNav.find('li').eq(nextIndex).find('a').trigger('click');
								return false;
							})
					)
			);
			
			//Bind events to the $tabs
			$tabs
			.bind('tabsremove', function(){ 
  				$tabs.trigger('scrollToTab').trigger('navHandler').trigger('navEnabler');
			})
			.bind('addCloseButton',function(){
				//Add close button if require
				if(!o.closable) return;
				$(this).find('.ui-tabs-nav li').each(function(){
					if($(this).find('.ui-tabs-close').length>0) return; //Already has close button
					var closeTopMargin = parseInt(parseInt($tabsNav.find('li:first').innerHeight()/2,10)-8);
					$(this).disableSelection().append(
						$('<span style="float:left;cursor:pointer;margin:'+closeTopMargin+'px 2px 0 -11px" class="ui-tabs-close ui-icon ui-icon-close" title="Close this tab"></span>')
							.click(function()
							{
								$tabs.tabs('remove',$(this).parents('li').prevAll().length);
								//If one tab remaining than hide the close button
								if($tabs.tabs('length')==1)
								{
									$tabsNav.find('.ui-icon-close').hide();
								}
								else
								{
									$tabsNav.find('.ui-icon-close').show();
								}
								//Call the method when tab is closed (if any)
								if($.isFunction(o.onTabClose))
								{
									o.onTabClose();
								}
								return false;
							})
					);
					//Show all close buttons if any hidden
					$tabsNav.find('.ui-icon-close').show();
				});
			})
			.bind('tabsadd',function(event){
				//Select it on Add
				$tabs.tabs('select',$tabs.tabs('length')-1);
				//Now remove the extra span added to the tab (not needed)
				$lastTab = $tabsNav.find('li:last');
				if($lastTab.find('a span').length>0) $lastTab.find('a').html($lastTab.find('a span').html());
				//Move the li to the innerwrapper
				$lastTab.appendTo($widthChecker);
				//Scroll the navigation to the newly added tab and also add close button to it
				$tabs
					.trigger('addCloseButton')
					.trigger('bindTabClick')
					.trigger('navHandler')
					.trigger('scrollToTab');
			})//End tabsadd
			.bind('addTab',function(event,label,content){
				//Generate a random id
				var tabid = 'stTab-'+(Math.floor(Math.random()*10000));
				//Append the content to the body
				$('body').append($('<div id="'+tabid+'"/>').append(content));
				//Add the tab
				$tabs.tabs('add','#'+tabid,label);
			})//End addTab
			.bind('bindTabClick',function(){
				//Handle scroll when user manually click on a tab
				$tabsNav.find('a').click(function(){
					var $liClicked = $(this).parents('li');
					var navWidth = $nav.find('.stPrev').outerWidth(true);
					//debug('left='+($liClicked.offset().left)+' and tabs width = '+ ($tabs.width()-navWidth));
					if(($liClicked.position().left-navWidth)<0)
					{
						$tabs.trigger('scrollToTab',[$liClicked,'tabClicked','left'])
					}
					else if(($liClicked.outerWidth()+$liClicked.position().left)>($tabs.width()-navWidth))
					{
						$tabs.trigger('scrollToTab',[$liClicked,'tabClicked','right'])
					}
					//Enable or disable next and prev arrows
					$tabs.trigger('navEnabler');
					return false;
				});
			})
			//Bind the event to act when tab is added
			.bind('scrollToTab',function(event,$tabToScrollTo,clickedFrom,hiddenOnSide){
				//If tab not provided than scroll to the last tab
				$tabToScrollTo = (typeof $tabToScrollTo!='undefined') ? $($tabToScrollTo) : $tabsNav.find('li.ui-tabs-selected');
				//Scroll the pane to the last tab
				var navWidth = $nav.is(':visible') ? $nav.find('.stPrev').outerWidth(true) : 0;
				//debug($tabToScrollTo.prevAll().length)
				
				offsetLeft = -($tabs.width()-($tabToScrollTo.outerWidth(true)+navWidth+parseInt($tabsNav.find('li:last').css('margin-right'),10)));
				offsetLeft = (clickedFrom=='tabClicked' && hiddenOnSide=='left') ? -navWidth : offsetLeft;
				offsetLeft = (clickedFrom=='tabClicked' && hiddenOnSide=='right') ? offsetLeft : offsetLeft;
				//debug(offsetLeft);
				var scrollSettings = { 'axis':'x', 'margin':true, 'offset': {'left':offsetLeft}, 'easing':o.easing||'' }
				//debug(-($tabs.width()-(116+navWidth)));
				$tabsNav.scrollTo($tabToScrollTo,o.animationSpeed,scrollSettings);
			})
			.bind('navEnabler',function(){
				setTimeout(function(){
					//Check if last or first tab is selected than disable the navigation arrows
					var isLast = $tabsNav.find('.ui-tabs-selected').is(':last-child'),
						isFirst = $tabsNav.find('.ui-tabs-selected').is(':first-child'),
						$ntNav = $tabsWrapper.find('.stNext'),
						$pvNav = $tabsWrapper.find('.stPrev');
					//debug('isLast = '+isLast+' - isFirst = '+isFirst);
					if(isLast)
					{
						$pvNav.removeClass('ui-state-disabled');
						$ntNav.addClass('ui-state-disabled');
					}
					else if(isFirst)
					{
						$ntNav.removeClass('ui-state-disabled');
						$pvNav.addClass('ui-state-disabled');
					}
					else
					{
						$ntNav.removeClass('ui-state-disabled');
						$pvNav.removeClass('ui-state-disabled');
					}
				},o.animationSpeed);
			})
			//Now check if tabs need navigation (many tabs out of sight)
			.bind('navHandler',function(){
				//Check the width of $widthChecker against the $tabsNav. If widthChecker has bigger width than show the $nav else hide it
				if($widthChecker.width()>$tabsNav.width())
				{
					$nav.show();
					//Put some margin to the first tab to make it visible if selected
					$tabsNav.find('li:first').css('margin-left',$nav.find('.stPrev').outerWidth(true));
				}
				else
				{
					$nav.hide();
					//Remove the margin from the first element
					$tabsNav.find('li:first').css('margin-left',0);					
				}
			})
			.bind('tabsselect', function() {
				//$tabs.trigger('navEnabler');
			})
			.bind('resized', function() {
				$tabs.trigger('navHandler');
				$tabs.trigger('scrollToTab',$tabsNav.find('li.ui-tabs-selected'));
			})
			//To add close buttons to the already existing tabs
			.trigger('addCloseButton')
			.trigger('bindTabClick')
			//For the tabs that already exists
			.trigger('navHandler')
			.trigger('navEnabler');
			
			//Select last tab if option is true
			if(o.loadLastTab)
			{
				setTimeout(function(){$tabsNav.find('li:last a').trigger('click')},o.animationSpeed);
			}
		});
		
		//Just for debuging
		function debug(obj)
		{console.log(obj)}
	}
})(jQuery);



/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Easy element scrolling using jQuery.
 * @author Ariel Flesler
 * @version 1.4.7
 */

;(function( $ ) {
        
        var $scrollTo = $.scrollTo = function( target, duration, settings ) {
                return $(window).scrollTo( target, duration, settings );
        };

        $scrollTo.defaults = {
                axis:'xy',
                duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
                limit:true
        };

        // Returns the element that needs to be animated to scroll the window.
        // Kept for backwards compatibility (specially for localScroll & serialScroll)
        $scrollTo.window = function( scope ) {
                return $(window)._scrollable();
        };

        // Hack, hack, hack :)
        // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
        $.fn._scrollable = function() {
                return this.map(function() {
                        var elem = this,
                                isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

                                if (!isWin)
                                        return elem;

                        var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
                        
                        return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
                                doc.body : 
                                doc.documentElement;
                });
        };

        $.fn.scrollTo = function( target, duration, settings ) {
                if (typeof duration == 'object') {
                        settings = duration;
                        duration = 0;
                }
                if (typeof settings == 'function')
                        settings = { onAfter:settings };
                        
                if (target == 'max')
                        target = 9e9;
                        
                settings = $.extend( {}, $scrollTo.defaults, settings );
                // Speed is still recognized for backwards compatibility
                duration = duration || settings.duration;
                // Make sure the settings are given right
                settings.queue = settings.queue && settings.axis.length > 1;
                
                if (settings.queue)
                        // Let's keep the overall duration
                        duration /= 2;
                settings.offset = both( settings.offset );
                settings.over = both( settings.over );

                return this._scrollable().each(function() {
                        // Null target yields nothing, just like jQuery does
                        if (target == null) return;

                        var elem = this,
                                $elem = $(elem),
                                targ = target, toff, attr = {},
                                win = $elem.is('html,body');

                        switch (typeof targ) {
                                // A number will pass the regex
                                case 'number':
                                case 'string':
                                        if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                                                targ = both( targ );
                                                // We are done
                                                break;
                                        }
                                        // Relative selector, no break!
                                        targ = $(targ,this);
                                        if (!targ.length) return;
                                case 'object':
                                        // DOMElement / jQuery
                                        if (targ.is || targ.style)
                                                // Get the real position of the target 
                                                toff = (targ = $(targ)).offset();
                        }
                        $.each( settings.axis.split(''), function( i, axis ) {
                                var Pos        = axis == 'x' ? 'Left' : 'Top',
                                        pos = Pos.toLowerCase(),
                                        key = 'scroll' + Pos,
                                        old = elem[key],
                                        max = $scrollTo.max(elem, axis);

                                if (toff) {// jQuery / DOMElement
                                        attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

                                        // If it's a dom element, reduce the margin
                                        if (settings.margin) {
                                                attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
                                                attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
                                        }
                                        
                                        attr[key] += settings.offset[pos] || 0;
                                        
                                        if(settings.over[pos])
                                                // Scroll to a fraction of its width/height
                                                attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
                                } else { 
                                        var val = targ[pos];
                                        // Handle percentage values
                                        attr[key] = val.slice && val.slice(-1) == '%' ? 
                                                parseFloat(val) / 100 * max
                                                : val;
                                }

                                // Number or 'number'
                                if (settings.limit && /^\d+$/.test(attr[key]))
                                        // Check the limits
                                        attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

                                // Queueing axes
                                if (!i && settings.queue) {
                                        // Don't waste time animating, if there's no need.
                                        if (old != attr[key])
                                                // Intermediate animation
                                                animate( settings.onAfterFirst );
                                        // Don't animate this axis again in the next iteration.
                                        delete attr[key];
                                }
                        });

                        animate( settings.onAfter );                        

                        function animate( callback ) {
                                $elem.animate( attr, duration, settings.easing, callback && function() {
                                        callback.call(this, targ, settings);
                                });
                        };

                }).end();
        };
        
        // Max scrolling position, works on quirks mode
        // It only fails (not too badly) on IE, quirks mode.
        $scrollTo.max = function( elem, axis ) {
                var Dim = axis == 'x' ? 'Width' : 'Height',
                        scroll = 'scroll'+Dim;
                
                if (!$(elem).is('html,body'))
                        return elem[scroll] - $(elem)[Dim.toLowerCase()]();
                
                var size = 'client' + Dim,
                        html = elem.ownerDocument.documentElement,
                        body = elem.ownerDocument.body;

                return Math.max( html[scroll], body[scroll] ) 
                         - Math.min( html[size]  , body[size]   );
        };

        function both( val ) {
                return typeof val == 'object' ? val : { top:val, left:val };
        };

})( jQuery );