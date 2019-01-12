function debounce(func, wait, immediate) {
    var timeout;

    return function executedFunction() {
        var context = this;
        var args = arguments;

        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

//?             SwipeControl
//TODO      Base Functionality
//*     - Add .throttle and .debounce when applicable
//*         - throttle the movement
//TODO      Optional Settings
//*     - Arrow Overlay: Create arrows that show when threshold was reached.
//?  Goal: make SwipeControl reusable for similar assets
class SwipeControl {
    constructor(element, amountOfItems) {
        this.element = element;                                 //  obj: Affected Element
        this.initial;                                           //  int: Initial touch position
        this.difference;                                        //  int: Difference between initial and new position
        this.threshold = 3;                                     //  int: % of item before triggering next slide
        this.currentItem = 0;                                   //  int: Current item
        this.lastItem = -((amountOfItems - 1) * 100);           //  int: Last item                                     //  bool: Determine multitouch
        this.attachListeners(element);
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => this.start(event), { passive: false });
        element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        element.addEventListener('touchend', (event) => this.end(event), { passive: false });
        element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //*                                  Event Handlers
    start(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            this.initial = event.touches[0].clientX / 10;           //  int: Initial touch position
            this.multitouch = event.touches.length > 1;             //  bool: Determine if multitouch or not
            // this.debug(event);
        }
    }

    move(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            this.handleMovement(event)
        }
    }

    end(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            let newPos = (event.changedTouches[0].clientX / 10)     //  int: New touch position
            this.difference = this.initial - newPos;                //  int: Difference between initial and new position
            this.element.style.transition = 'left 0.1s'             //  str: Transition effect for movement

            if (this.difference > 0) {
                this.slideRight();
            } else if (this.difference < 0) {
                this.slideLeft();
            }

            // this.debug(event);
        }
    }

    //*                                  Controls

    handleMovement(event) {
        const touch = event.touches[0].clientX / 10;            //  int: Current touch position
        const item = this.currentItem * 100;                    //  int: Current item in percentage
        let moveX = (this.initial - touch) / 5;                 //  int: Speed of slide movement
        let movable = moveX < 10;                               //  int: Movable threshold


        //  First item:
        if (!this.currentItem && moveX > 0 && movable) {
            this.element.style.left = -moveX + '%';
        }
        //  Subsequent item(s):
        else if (this.currentItem && movable) {
            //  Not on last item
            if (-(this.currentItem * 100) !== this.lastItem) {
                this.element.style.left = -item - moveX + '%';
            }
            // On last item
            else if (-(this.currentItem * 100) === this.lastItem && moveX < 0) {
                this.element.style.left = -item - moveX + '%';
            }
        }
    }

    slideRight() {
        // First item:
        if (this.difference > this.threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        } else if (this.threshold > this.difference) {
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
    }

    slideLeft() {
        // Not first item:
        if (-this.threshold > this.difference && this.currentItem !== 0) {
            this.previous();
        } else if (-this.threshold < this.difference) {
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
    }

    next() {
        // First item:
        if (!this.currentItem) {
            this.element.style.left = -100 + '%';
            this.currentItem += 1;
        } else if (this.currentItem) {
            this.element.style.left = -(this.currentItem * 100) - 100 + '%';
            this.currentItem += 1;
        }
    }

    previous() {
        this.element.style.left = -(this.currentItem * 100) + 100 + '%';
        this.currentItem -= 1;
    }

    //*                                  Helpers
    sync() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100;
    }

    debug(event) {
        var now = new Date()
        console.log('%cDebugging Variables', 'font-weight: bold')
        console.log(
            'initial: ' + this.initial + '\n' +
            'difference: ' + this.difference + '\n' +
            'newPos: ' + (event.changedTouches[0].clientX / 10) + '\n' +
            'currentItem: ' + this.currentItem + '\n' +
            'lastItem: ' + this.lastItem + '\n' +
            'left: ' + this.element.style.left + '\n' +
            'multitouch: ' + this.multitouch + '\n' +
            'firstTouch: ' + (event.changedTouches[0].identifier === 0))
        console.log(' ')
    }

}


//?             Carousel
//TODO      Base Functionality
//*     - Finish touch controls (more or less done)
//*     - Start mouse dragging controls

//TODO      Optional Settings
//*     - Take in an object to enable/disable features (?)
//*     - Allow for custom width/height (I might use SCSS for this)
//*     - Create an optional 'auto-play' start/stop feature (timeIntervals)
//*     - Create optional next/previous
//*         - Optionally disable bubbles when enabled
class Carousel {
    constructor(index) {
        //  Carousel variables
        this.carousel =
            document.getElementsByClassName('is-carousel')[index];
        this.inner =
            this.carousel.getElementsByClassName('inner')[0];
        this.imageAmount =
            this.inner.getElementsByTagName('img').length;
        this.currentItem = 0;

        //  Selection variables
        this.imageSelector =
            this.carousel.getElementsByClassName('image-selector')[0];
        this.bubbles = [];

        //  Init
        this.createCarousel();
    }

    //*                                  Creation
    createCarousel() {
        this.createBubbles();
        this.attachListeners();
        this.activeBubble();
    }

    createBubbles() {
        if (this.imageAmount > 1) {
            for (let i = 0; i < this.imageAmount; i++) {
                let wrapper = document.createElement('span');   //
                wrapper.classList.add('bubble-wrapper');        //
                let bubble = document.createElement('span');    //
                bubble.classList.add('bubble');                 //
                wrapper.appendChild(bubble);                    //  Put the bubble in a wrapper
                this.imageSelector.appendChild(wrapper);        //  Add bubble to image selector
                this.bubbles.push(wrapper);                     //  Add bubble to bubbles array for listeners
            }
        }
    }

    attachListeners() {
        //  Initiate touch controls
        const swipe = new SwipeControl(this.inner, this.imageAmount);

        //  Handle bubble click functionality
        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].addEventListener("click", () => {
                this.currentItem = i;
                this.switchImage();
                this.activeBubble();
                swipe.sync();
            });
        }

        // Observe for style mutations
        this.observer();
    }

    //*                                  Controls
    switchImage() {
        this.inner.style.left = -100 * this.currentItem + "%";
    }

    activeBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index === this.currentItem) {
                bubble.children[0].classList.add("bubble-active");
            } else {
                bubble.children[0].classList.remove("bubble-active");
                bubble.children[0].classList.remove("bubble:hover");
            }
        });
    }

    //*                                  Helpers
    observer() {
        const carouselObserver = new MutationObserver(debounce(() => this.handleChange(), 50));
        carouselObserver.observe(this.inner, { attributes: true });
    }

    handleChange() {
        this.currentItem =
            parseInt(this.inner.style.left.replace(/\D/g, '')) / 100;
        this.activeBubble();
    }
}

new Carousel(0);
new Carousel(1);