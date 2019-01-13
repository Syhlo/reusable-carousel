//?             SwipeControl
//TODO      Base Functionality
//*     - Add .throttle and .debounce when applicable
//*         - throttle the movement
//?  Goal: make SwipeControl reusable for similar assets
class SwipeControl {
    constructor() {
        this.element;                                           //  Element to listen on
        this.initial;                                           //  Initial touch position
        this.difference;                                        //  Difference between initial and new position
        this.threshold = 5;                                     //  % of item before triggering next slide
        this.currentItem;                                       //  Current item
        this.lastItem;                                          //  Last item
    }

    swipeEvents() {
        this.element.addEventListener('touchstart', (event) => this.start(event), { passive: false });
        this.element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        this.element.addEventListener('touchend', (event) => this.end(event), { passive: false });
        this.element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //*                                  Event Handlers
    start(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            this.initial = event.touches[0].clientX / 10;           //  Initial touch position
        }
    }

    move(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            this.handleMovement(event);
        }
    }

    end(event) {
        event.preventDefault();
        if (event.changedTouches[0].identifier === 0) {             //  Do not handle any more than the first touch
            let newPos = (event.changedTouches[0].clientX / 10)     //  New touch position
            this.difference = this.initial - newPos;                //  Difference between initial and new position
            this.element.style.transition = 'left 0.1s'             //  Transition effect for movement

            if (this.difference > 0) {
                this.swipedRight();
            } else if (this.difference < 0) {
                this.swipedLeft();
            }
        }
        this.debugSwiper(event)
    }

    //*                                  Controls

    handleMovement(event) {
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

    swipedRight() {
        // First item:
        if (this.difference > this.threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        } else if (this.threshold > this.difference) {
            this.stay();
        }
    }

    swipedLeft() {
        // Not first item:
        if (-this.threshold > this.difference && this.currentItem !== 0) {
            this.previous();
        } else if (-this.threshold < this.difference) {
            this.stay();
        }
    }

    next() {
        // First item:
        if (!this.currentItem && this.currentItem !== this.lastItem) {
            this.element.style.left = -100 + '%';
            this.setCurrent();
        } else if (this.currentItem) {
            this.element.style.left = -(this.currentItem * 100) - 100 + '%';
            this.setCurrent();
        }
    }

    previous() {
        this.element.style.left = -(this.currentItem * 100) + 100 + '%';
        this.setCurrent();
    }

    stay() {
        this.element.style.left = -(this.currentItem * 100) + '%';
    }

    //*                                  Helpers
    setCurrent() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100;
    }

    debugSwiper(event) {
        var now = new Date()
        console.log('%cDebugging Variables', 'font-weight: bold')
        console.log(event)
        console.log(
            'initial: ' + this.initial + '\n' +
            'difference: ' + this.difference + '\n' +
            'newPos: ' + (event.changedTouches[0].clientX / 10) + '\n' +
            'currentItem: ' + this.currentItem + '\n' +
            'lastItem: ' + this.lastItem + '\n' +
            'left: ' + this.element.style.left + '\n' +
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
class Carousel extends SwipeControl {
    constructor(index) {
        super()
        this.carousel =
            document.getElementsByClassName('is-carousel')[index];
        this.element =
            this.carousel.getElementsByClassName('inner')[0];
        this.imageSelector =
            this.carousel.getElementsByClassName('image-selector')[0];
        this.bubbles = [];

        this.itemAmount =
            this.element.getElementsByTagName('img').length;
        this.currentItem = 0;
        this.lastItem = -((this.itemAmount - 1) * 100);

        //  Init
        this.createCarousel();
    }

    //*                                  Creation
    createCarousel() {
        this.createBubbles();
        this.currentActiveBubble();
        // this.swipeHook();
        super.swipeEvents();
        this.carouselEvents();
    }


    createBubbles() {
        if (this.itemAmount > 1) {
            for (let i = 0; i < this.itemAmount; i++) {
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

    carouselEvents() {
        //  Initiate touch controls
        if (this.itemAmount > 1) {
            //  Handle bubble click functionality
            for (let i = 0; i < this.bubbles.length; i++) {
                this.bubbles[i].addEventListener("click", () => {
                    this.currentItem = i;
                    this.handleBubblePress();
                    this.currentActiveBubble();
                });
            }
        }
    }

    //*                                  Controls
    handleBubblePress() {
        this.element.style.transition = 'left 0.1s';
        this.element.style.left = -100 * this.currentItem + "%";
    }

    currentActiveBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index === this.currentItem) {
                bubble.children[0].classList.add("bubble-active");
            } else {
                bubble.children[0].classList.remove("bubble-active");
                bubble.children[0].classList.remove("bubble:hover");
            }
        });
    }

    setCurrent() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100;
        this.currentActiveBubble();
    }
}

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

let carouselOptions = {
    autoplay: false,
    arrowButtons: false,
    bubbles: false,
    swipeControls: false,
    dragControls: false
}

let first = new Carousel(0);
let second = new Carousel(1);