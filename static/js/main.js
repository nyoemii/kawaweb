
// sticky header
$(window).scroll(() => {
    var header = document.getElementById("navbar");
    var sticky = header.offsetTop;

    if (window.pageYOffset > sticky) {
        header.classList.add("minimized");
    } else {
        header.classList.remove("minimized");
    }
});

//toggle navbar for mobile
function togglenavbar() {
    document.getElementById('navbar').classList.toggle("is-active");
    document.getElementById('navbar-burger').classList.toggle("is-active");
}




/**
 * Colorful Logger for Browser
 * A standalone logger with color formatting similar to Node.js loggers
 */
(function() {
    const ColorfulLogger = {
        // Log levels with their colors
        LEVELS: {
            TRACE: { value: 0, color: '#6c757d', background: '', style: 'font-weight: normal' },
            DEBUG: { value: 1, color: '#0dcaf0', background: '', style: 'font-weight: normal' },
            INFO: { value: 2, color: '#0d6efd', background: '', style: 'font-weight: bold' },
            WARN: { value: 3, color: '#ffc107', background: '', style: 'font-weight: bold' },
            ERROR: { value: 4, color: '#dc3545', background: '', style: 'font-weight: bold' },
            FATAL: { value: 5, color: 'white', background: '#dc3545', style: 'font-weight: bold' },
            SILENT: { value: 6, color: '', background: '', style: '' }
        },
        
        // Current log level
        currentLevel: 1, // DEBUG by default
        
        // Logger name/prefix
        name: 'App',
        
        // Show timestamp in logs
        showTimestamp: true,
        
        // Show log level in logs
        showLevel: true,
        
        // Initialize the logger
        init: function(options = {}) {
            if (options.level !== undefined) {
                if (typeof options.level === 'string') {
                    const levelName = options.level.toUpperCase();
                    if (this.LEVELS[levelName]) {
                        this.currentLevel = this.LEVELS[levelName].value;
                    }
                } else if (typeof options.level === 'number') {
                    this.currentLevel = options.level;
                }
            }
            
            if (options.name !== undefined) {
                this.name = options.name;
            }
            
            if (options.showTimestamp !== undefined) {
                this.showTimestamp = !!options.showTimestamp;
            }
            
            if (options.showLevel !== undefined) {
                this.showLevel = !!options.showLevel;
            }
            
            // Return the logger for chaining
            return this;
        },
        
        // Set the log level
        setLevel: function(level) {
            if (typeof level === 'string') {
                const levelName = level.toUpperCase();
                if (this.LEVELS[levelName]) {
                    this.currentLevel = this.LEVELS[levelName].value;
                }
            } else if (typeof level === 'number') {
                this.currentLevel = level;
            }
            return this;
        },
        
        // Set the logger name
        setName: function(name) {
            this.name = name;
            return this;
        },
        
        // Format the log message
        _format: function(level, args) {
            const levelInfo = this.LEVELS[level];
            
            // Create the prefix parts
            const prefixParts = [];
            
            // Add timestamp if enabled
            if (this.showTimestamp) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
                prefixParts.push(`${hours}:${minutes}:${seconds}.${milliseconds}`);
            }
            
            // Add logger name
            prefixParts.push(this.name);
            
            // Add level if enabled
            if (this.showLevel) {
                prefixParts.push(level);
            }
            
            // Create the prefix string
            const prefix = prefixParts.join(' | ');
            
            // Create the style for the prefix
            let style = `color: ${levelInfo.color};`;
            if (levelInfo.background) {
                style += ` background: ${levelInfo.background};`;
            }
            if (levelInfo.style) {
                style += ` ${levelInfo.style};`;
            }
            style += ' padding: 2px 4px; border-radius: 2px;';
            
            // Return the formatted parts
            return {
                prefix: prefix,
                style: style,
                args: args
            };
        },
        
        // Log methods for each level
        trace: function(...args) {
            if (this.currentLevel <= this.LEVELS.TRACE.value) {
                const formatted = this._format('TRACE', args);
                console.log(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        debug: function(...args) {
            if (this.currentLevel <= this.LEVELS.DEBUG.value) {
                const formatted = this._format('DEBUG', args);
                console.log(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        info: function(...args) {
            if (this.currentLevel <= this.LEVELS.INFO.value) {
                const formatted = this._format('INFO', args);
                console.info(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        warn: function(...args) {
            if (this.currentLevel <= this.LEVELS.WARN.value) {
                const formatted = this._format('WARN', args);
                console.warn(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        error: function(...args) {
            if (this.currentLevel <= this.LEVELS.ERROR.value) {
                const formatted = this._format('ERROR', args);
                console.error(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        fatal: function(...args) {
            if (this.currentLevel <= this.LEVELS.FATAL.value) {
                const formatted = this._format('FATAL', args);
                console.error(`%c${formatted.prefix}`, formatted.style, ...formatted.args);
            }
            return this;
        },
        
        // Create a child logger with a different name
        child: function(name) {
            const childLogger = Object.create(this);
            childLogger.name = this.name + ':' + name;
            return childLogger;
        },
        
        // Vue.js plugin
        install: function(Vue, options = {}) {
            // Initialize with options
            this.init(options);
            
            // Add to Vue prototype
            Vue.prototype.$log = this;
            
            // Add a mixin to create component-specific loggers
            Vue.mixin({
                created: function() {
                    // Create a component-specific logger if the component has a name
                    if (this.$options.name) {
                        this.$log = ColorfulLogger.child(this.$options.name);
                    }
                }
            });
        }
    };
    
    // Expose to global scope
    window.ColorfulLogger = ColorfulLogger;
    
    // Check for URL parameters to set log level
    const urlParams = new URLSearchParams(window.location.search);
    const logLevel = urlParams.get('logLevel');
    if (logLevel && ColorfulLogger.LEVELS[logLevel.toUpperCase()]) {
        ColorfulLogger.setLevel(logLevel.toUpperCase());
    }
})();
Vue.use(ColorfulLogger, {
    level: 'DEBUG',
    name: 'Kawata-Web',
    showTimestamp: true,
    showLevel: true
});
const logger = ColorfulLogger.init({
    level: 'DEBUG',
    name: 'Kawata-Web'
});

/**
 * Portal Popup System
 * A utility to ensure popups always appear on top of other elements
 * Works with both regular HTML and Vue components
 */
(function() {
    if (window.Vue && !window.beatmapBus) {
        window.beatmapBus = new Vue();
    }
    if (window.Vue && !window.scoreBus) {
        window.scoreBus = new Vue();
    }
    // Create a container for all portaled popups
    const createPortalContainer = () => {
      const container = document.createElement('div');
      container.id = 'popup-portal-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      return container;
    };
  
    // Get or create the portal container
    const getPortalContainer = () => {
      return document.getElementById('popup-portal-container') || createPortalContainer();
    };
  
    // Main portal class
    class PopupPortal {
      constructor(options = {}) {
        this.options = Object.assign({
          triggerSelector: '[data-popup-trigger]',
          popupSelector: '[data-popup]',
          activeClass: 'popup-active',
          showOnHover: true,
          showOnClick: false,
          closeOnClickOutside: true,
          closeOnEsc: true,
          animationDuration: 300,
          positionStrategy: 'auto', // 'auto', 'top', 'bottom', 'left', 'right'
          offset: 10,
          zIndex: 9999,
          onShow: null,
          onHide: null
        }, options);
        
        this.popups = new Map(); // Map to store popup references
        this.activePopup = null;
        
        this.portalContainer = getPortalContainer();
        
        this.init();
      }
      
      init() {
        // Initialize for existing elements
        this.setupTriggers();
        
        // Set up mutation observer to handle dynamically added elements
        this.setupMutationObserver();
        
        // Global event listeners
        if (this.options.closeOnClickOutside) {
          document.addEventListener('click', this.handleDocumentClick.bind(this));
        }
        
        if (this.options.closeOnEsc) {
          document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
        
        // Handle window resize and scroll
        window.addEventListener('resize', this.updatePositions.bind(this));
        window.addEventListener('scroll', this.updatePositions.bind(this), true);
      }

      cloneEvents(source, destination) {
        // Clone Vue event handlers
        if (window.Vue && source.__vue__) {
          // We need to preserve Vue event handlers
          // This is a bit hacky but should work for most cases
          const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
              if (mutation.type === 'attributes' && mutation.attributeName.startsWith('@') || 
                  mutation.attributeName.startsWith('v-on:')) {
                const attrName = mutation.attributeName;
                const attrValue = source.getAttribute(attrName);
                destination.setAttribute(attrName, attrValue);
              }
            });
          });
          
          observer.observe(source, { attributes: true });
          
          // Copy existing event attributes
          Array.from(source.attributes).forEach(attr => {
            if (attr.name.startsWith('@') || attr.name.startsWith('v-on:')) {
              destination.setAttribute(attr.name, attr.value);
            }
          });
        }
        
        // For regular DOM events, we need to manually copy them
        const eventNames = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
        eventNames.forEach(eventName => {
          destination.addEventListener(eventName, (e) => {
            // Create a new event
            const newEvent = new Event(eventName, {
              bubbles: e.bubbles,
              cancelable: e.cancelable
            });
            
            // Dispatch it on the original element
            source.dispatchEvent(newEvent);
          });
        });
      }

      setupTriggers() {
        const triggers = document.querySelectorAll(this.options.triggerSelector);
        triggers.forEach(trigger => this.setupTrigger(trigger));
      }
      
      setupTrigger(trigger) {
        // Skip if already initialized
        if (trigger.dataset.portalInitialized) return;
        
        // Find the popup element
        const popup = trigger.querySelector(this.options.popupSelector);
        if (!popup) return;
        
        // Mark as initialized
        trigger.dataset.portalInitialized = 'true';
        
        // Generate unique ID for this popup
        const popupId = `popup-${Math.random().toString(36).substr(2, 9)}`;
        trigger.dataset.popupId = popupId;
        
        // Clone the popup and move it to the portal container
        const clonedPopup = popup.cloneNode(true);
        // Clone events from original popup to cloned popup
        this.cloneEvents(popup, clonedPopup);
        clonedPopup.id = popupId;
        clonedPopup.style.position = 'fixed';
        clonedPopup.style.zIndex = this.options.zIndex;
        clonedPopup.style.opacity = '0';
        clonedPopup.style.visibility = 'hidden';
        clonedPopup.style.pointerEvents = 'auto';
        clonedPopup.style.transition = `opacity ${this.options.animationDuration}ms ease, visibility ${this.options.animationDuration}ms ease`;
        
        // Store references
        this.popups.set(popupId, {
          trigger,
          originalPopup: popup,
          portaledPopup: clonedPopup,
          visible: false
        });
        
        // Remove the original popup
        popup.parentNode.removeChild(popup);
        
        // Add the cloned popup to the portal container
        this.portalContainer.appendChild(clonedPopup);
        
        // Add event listeners
        if (this.options.showOnHover) {
          trigger.addEventListener('mouseenter', () => this.showPopup(popupId));
          trigger.addEventListener('mouseleave', () => this.hidePopup(popupId));
          
          clonedPopup.addEventListener('mouseenter', () => {
            // Keep popup visible when hovering over it
            const popupData = this.popups.get(popupId);
            if (popupData) {
              clearTimeout(popupData.hideTimeout);
            }
          });
          
          clonedPopup.addEventListener('mouseleave', () => this.hidePopup(popupId));
        }
        
        if (this.options.showOnClick) {
          trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const popupData = this.popups.get(popupId);
            if (popupData && popupData.visible) {
              this.hidePopup(popupId);
            } else {
              this.showPopup(popupId);
            }
          });
        }
      }
      
      setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
          let shouldScan = false;
          
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
              shouldScan = true;
            }
          });
          
          if (shouldScan) {
            this.setupTriggers();
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
      
      positionPopup(popupId) {
        const popupData = this.popups.get(popupId);
        if (!popupData) return;
        
        const { trigger, portaledPopup } = popupData;
        const triggerRect = trigger.getBoundingClientRect();
        const popupRect = portaledPopup.getBoundingClientRect();
        
        let position = this.options.positionStrategy;
        
        // Auto-detect best position if set to auto
        if (position === 'auto') {
          const spaceTop = triggerRect.top;
          const spaceBottom = window.innerHeight - triggerRect.bottom;
          const spaceLeft = triggerRect.left;
          const spaceRight = window.innerWidth - triggerRect.right;
          
          const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight);
          
          if (maxSpace === spaceTop) position = 'top';
          else if (maxSpace === spaceBottom) position = 'bottom';
          else if (maxSpace === spaceLeft) position = 'left';
          else position = 'right';
        }
        
        // Get position from popup's class if available
        if (portaledPopup.classList.contains('position-top')) position = 'top';
        if (portaledPopup.classList.contains('position-bottom')) position = 'bottom';
        if (portaledPopup.classList.contains('position-left')) position = 'left';
        if (portaledPopup.classList.contains('position-right')) position = 'right';
        
        const offset = this.options.offset;
        
        // Position based on strategy
        switch (position) {
          case 'top':
            portaledPopup.style.bottom = (window.innerHeight - triggerRect.top + offset) + 'px';
            portaledPopup.style.left = (triggerRect.left + triggerRect.width / 2) + 'px';
            portaledPopup.style.transform = 'translateX(-50%)';
            break;
          case 'bottom':
            portaledPopup.style.top = (triggerRect.bottom + offset) + 'px';
            portaledPopup.style.left = (triggerRect.left + triggerRect.width / 2) + 'px';
            portaledPopup.style.transform = 'translateX(-50%)';
            break;
          case 'left':
            portaledPopup.style.right = (window.innerWidth - triggerRect.left + offset) + 'px';
            portaledPopup.style.top = (triggerRect.top + triggerRect.height / 2) + 'px';
            portaledPopup.style.transform = 'translateY(-50%)';
            break;
          case 'right':
            portaledPopup.style.left = (triggerRect.right + offset) + 'px';
            portaledPopup.style.top = (triggerRect.top + triggerRect.height / 2) + 'px';
            portaledPopup.style.transform = 'translateY(-50%)';
            break;
        }
        
        // Ensure popup stays within viewport
        this.constrainToViewport(portaledPopup);
      }
      
      constrainToViewport(popup) {
        const rect = popup.getBoundingClientRect();
        
        // Check if popup is outside viewport
        if (rect.left < 0) {
          popup.style.left = '10px';
          popup.style.right = 'auto';
        }
        
        if (rect.right > window.innerWidth) {
          popup.style.right = '10px';
          popup.style.left = 'auto';
        }
        
        if (rect.top < 0) {
          popup.style.top = '10px';
          popup.style.bottom = 'auto';
        }
        
        if (rect.bottom > window.innerHeight) {
          popup.style.bottom = '10px';
          popup.style.top = 'auto';
        }
      }
      
      showPopup(popupId) {
        const popupData = this.popups.get(popupId);
        if (!popupData) return;
        
        // Clear any pending hide timeout
        if (popupData.hideTimeout) {
          clearTimeout(popupData.hideTimeout);
        }
        
        // Position the popup
        this.positionPopup(popupId);
        
        // Show the popup
        const { trigger, portaledPopup } = popupData;
        portaledPopup.style.opacity = '1';
        portaledPopup.style.visibility = 'visible';
        
        // Add active class to trigger
        trigger.classList.add(this.options.activeClass);
        
        // Update state
        popupData.visible = true;
        this.activePopup = popupId;
        
        // Call onShow callback if provided
        if (typeof this.options.onShow === 'function') {
          this.options.onShow(popupId, trigger, portaledPopup);
        }
      }
      
      hidePopup(popupId) {
        const popupData = this.popups.get(popupId);
        if (!popupData) return;
        
        // Set a timeout to hide the popup (allows moving from trigger to popup)
        popupData.hideTimeout = setTimeout(() => {
          const { trigger, portaledPopup } = popupData;
          portaledPopup.style.opacity = '0';
          portaledPopup.style.visibility = 'hidden';
          
          // Remove active class from trigger
          trigger.classList.remove(this.options.activeClass);
          
          // Update state
          popupData.visible = false;
          if (this.activePopup === popupId) {
            this.activePopup = null;
          }
          
          // Call onHide callback if provided
          if (typeof this.options.onHide === 'function') {
            this.options.onHide(popupId, trigger, portaledPopup);
          }
        }, 50); // Small delay to allow moving cursor to popup
      }
      
      hideAllPopups() {
        this.popups.forEach((_, popupId) => {
          this.hidePopup(popupId);
        });
      }
      
      updatePositions() {
        this.popups.forEach((popupData, popupId) => {
          if (popupData.visible) {
            this.positionPopup(popupId);
          }
        });
      }
      
      handleDocumentClick(e) {
        if (!this.activePopup) return;
        
        const popupData = this.popups.get(this.activePopup);
        if (!popupData) return;
        
        const { trigger, portaledPopup } = popupData;
        
        // Check if click is outside both trigger and popup
        if (!trigger.contains(e.target) && !portaledPopup.contains(e.target)) {
          this.hidePopup(this.activePopup);
        }
      }
      
      handleKeyDown(e) {
        if (e.key === 'Escape' && this.activePopup) {
          this.hidePopup(this.activePopup);
        }
      }
      
      // Public method to manually show a popup
      show(triggerId) {
        const trigger = document.getElementById(triggerId);
        if (trigger && trigger.dataset.popupId) {
          this.showPopup(trigger.dataset.popupId);
        }
      }
      
      // Public method to manually hide a popup
      hide(triggerId) {
        const trigger = document.getElementById(triggerId);
        if (trigger && trigger.dataset.popupId) {
          this.hidePopup(trigger.dataset.popupId);
        }
      }
      
      // Destroy method to clean up
      destroy() {
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('resize', this.updatePositions);
        window.removeEventListener('scroll', this.updatePositions, true);
        
        // Remove the portal container
        if (this.portalContainer && this.portalContainer.parentNode) {
          this.portalContainer.parentNode.removeChild(this.portalContainer);
        }
      }
    }
  
    // Make available globally
    window.PopupPortal = PopupPortal;
    
    // Vue plugin
    if (window.Vue) {
      window.Vue.prototype.$popupPortal = new PopupPortal();
      
      // Vue directive
      window.Vue.directive('portal-popup', {
        bind(el, binding, vnode) {
          // Add data attributes
          el.setAttribute('data-popup-trigger', '');
          
          // Find popup element
          const popup = el.querySelector('[data-popup]');
          if (!popup) {
            // If no popup is found, look for the first element that might be a popup
            const possiblePopup = el.querySelector('.beatmap-mini-popup');
            if (possiblePopup) {
              possiblePopup.setAttribute('data-popup', '');
            }
          }

          // Initialize after Vue has rendered
        setTimeout(() => {
            window.Vue.prototype.$popupPortal.setupTrigger(el);
          }, 0);
        },
        
        unbind(el) {
          // Clean up if needed
          if (el.dataset.popupId) {
            const popupData = window.Vue.prototype.$popupPortal.popups.get(el.dataset.popupId);
            if (popupData && popupData.portaledPopup.parentNode) {
              popupData.portaledPopup.parentNode.removeChild(popupData.portaledPopup);
            }
            window.Vue.prototype.$popupPortal.popups.delete(el.dataset.popupId);
          }
        }
      });
    }
  
    // Auto-initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize for non-Vue elements
      const defaultPortal = new PopupPortal();
      window.defaultPopupPortal = defaultPortal;
    });
  })();
