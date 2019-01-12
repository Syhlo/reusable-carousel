//*     Helper Functions
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
//*     - Prevent multitouch skipping items
//?         Created way to detect multitouch (this.isMultitouch(event))

//TODO      Optional Settings
//*     - Arrow Overlay: Create arrows that show when threshold was reached.
//?  Goal: make SwipeControl reusable for similar assets
class SwipeControl {
    constructor(element, amountOfItems) {
        this.element = element;                                 //  Affected Element
        this.initial;                                           //  Initial touch position
        this.difference;                                        //  Difference between initial and new position
        this.threshold = 10;                                    //  If difference is above 10% then move the slide 
        this.currentItem = 0;                                   //  Current item the slide is on
        this.lastItem = -((amountOfItems - 1) * 100);           //  Last item of the slides
        this.multitouch;                                        //  Determine multitouch
        this.attachListeners(element);                          //  Initiates controls
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => this.start(event), { passive: false });
        element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        element.addEventListener('touchend', (event) => this.end(event), { passive: false });
        element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //*                                  Event Handlers
    start(event) {
        event.preventDefault();                                 //  Disable default functionality
        event.stopImmediatePropagation();                       //  Disable propagation
        this.initial = event.touches[0].clientX / 10;           //  Initial touch position
        this.multitouch = this.isMultitouch(event)              //  Determine if multitouch or not
    }

    move(event) {
        event.preventDefault();
        const touch = event.touches[0].clientX / 10;            //  Current touch position
        const item = this.currentItem * 100;                    //  Current item in percentage
        let moveX = (this.initial - touch) / 5;                 //  Speed of slide movement
        let movable = moveX < 10;                               //  Movable threshold


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

    end(event) {
        event.preventDefault();
        let newPos = (event.changedTouches[0].clientX / 10)     //  New touch position
        this.difference = this.initial - newPos;                //  Difference between initial and new position
        this.element.style.transition = 'left 0.25s'            //  Transition effect for movement
        if (this.difference > 0) {
            this.moveRight();
        } else if (this.difference < 0) {
            this.moveLeft();
        }

        this.debug(newPos);                                     //  Debugging information
    }

    //*                                  Controls

    moveRight() {
        // First item:
        if (this.difference > this.threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        } else if (this.threshold > this.difference) {
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
    }

    moveLeft() {
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
    isMultitouch(event) {
        try {
            return typeof event.touches[1].clientX === 'number' || false
        } catch (error) {
            return false
        }
    }

    sync() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100;
    }

    debug(extra = 'undefined') {
        document.querySelector('p').innerHTML = `
        <strong>Debugging Variables</strong> <br>
        initial: ${this.initial} <br>
        newPos: ${extra} <br>
        difference: ${this.difference} <br>
        current: ${this.currentItem} <br>
        lastItem: ${this.lastItem} <br>
        left: ${this.element.style.left} <br> 
        multitouch: ${this.multitouch}`;
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