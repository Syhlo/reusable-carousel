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
        this.element = element;
        this.initialX;
        this.difference;
        this.currentItem = 0;
        this.lastItem = -((amountOfItems - 1) * 100);
        this.multitouch;
        this.attachListeners(element);
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => this.start(event), { passive: false });
        element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        element.addEventListener('touchend', (event) => this.end(event), { passive: false });
        element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //              Listener Events (TouchEvent)
    start(event) {
        //  Disable default functionality, propagation, and disable new touches
        event.preventDefault();
        event.stopImmediatePropagation();
        this.initialX = event.touches[0].clientX / 10;  //  Initial touch position
    }

    move(event) {
        event.preventDefault();
        const touch = event.touches[0].clientX / 10;  //    Current touch position
        const slideX = this.currentItem * 100;        //    Current slide
        let moveX = (this.initialX - touch) / 5;      //    Move slide by value
        let movable = moveX < 10;                     //    Movable threshold

        this.multitouch = this.isMultitouch(event)

        //  First move: currentItem is falsy & moveX is positive & slide is still movable.
        if (!this.currentItem && moveX > 0 && movable) {
            this.element.style.left = -moveX + '%';
        }
        //  Subsequent moves: Current exists
        else if (this.currentItem) {
            //  Current item isn't the last item
            if (-(this.currentItem * 100) !== this.lastItem && movable) {
                this.element.style.left = -slideX - moveX + '%';
            }
            // Current item is last item and moveX is negative
            else if (-(this.currentItem * 100) === this.lastItem && moveX < 0 && movable) {
                this.element.style.left = -slideX - moveX + '%';
            }
        }
    }

    end(event) {
        event.preventDefault();
        this.difference = this.initialX - (event.changedTouches[0].clientX / 10);
        if (this.difference > 0) {
            debounce(this.moveLeft(), 100, true);
        } else if (this.difference < 0) {
            debounce(this.moveRight(), 100, true);
        }

        //  Display global variable information
        this.console();
    }

    //             Controls
    moveLeft() {
        const threshold = 100 / 9;
        //  Difference is more than threshold, current item isn't last item
        if (this.difference > threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        }
        //  Threshold is greater than difference in X, currentItem doesn't exist
        else if (threshold > this.difference) {
            this.element.style.transition = 'left 0.3s'
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
    }

    moveRight() {
        const threshold = -(100 / 9);
        //  Threshold is greater than difference, currentItem is not the first
        if (threshold > this.difference && this.currentItem !== 0) {
            this.prev();
        }
        //  Difference is greater than threshold
        else if (threshold < this.difference) {
            this.element.style.transition = 'left 0.3s'
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
    }

    next() {
        // First move: currentItem does not exist
        if (!this.currentItem) {
            this.element.style.transition = 'left 0.3s'
            this.element.style.left = -100 + '%';
            this.currentItem += 1;
        }
        // Subsequent moves: currentItem exists
        else if (this.currentItem) {
            this.element.style.transition = 'left 0.3s'
            this.element.style.left = -(this.currentItem * 100) - 100 + '%';
            this.currentItem += 1;
        }
    }

    prev() {
        //  Previous slide
        this.element.style.transition = 'left 0.3s'
        this.element.style.left = -(this.currentItem * 100) + 100 + '%';
        this.currentItem -= 1;
    }

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

    //*             Development Purposes
    console() {
        console.log(this.element);
        console.log('initialX: ' + this.initialX);
        console.log('difference: ' + this.difference);
        console.log('current: ' + this.currentItem);
        console.log('lastItem: ' + this.lastItem);
        console.log('left: ' + this.element.style.left);
        console.log('multitouch: ' + this.multitouch)
        console.log(' ');
        document.querySelector('p').innerHTML = `
        <strong>Debugging Variables</strong> <br>
        initialX: ${this.initialX} <br>
        difference: ${this.difference} <br>
        current: ${this.current} <br>
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

    createBubbles() {
        if (this.imageAmount > 1) {
            for (let i = 0; i < this.imageAmount; i++) {
                //  Create a wrapper, bubble, and append to selector
                let bubble = document.createElement('span');
                bubble.classList.add('bubble');
                let wrapper = document.createElement('span');
                wrapper.classList.add('bubble-wrapper');
                wrapper.appendChild(bubble);

                this.imageSelector.appendChild(wrapper);
                this.bubbles.push(wrapper);
            }
        }
    }

    attachListeners() {
        //  Initiate touch controls
        const swipe = new SwipeControl(this.inner, this.imageAmount);

        //  On bubble click switch to that image
        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].addEventListener("click", () => {
                this.currentItem = i;
                this.switchImage();
                this.activeBubble();
                swipe.sync();
            });
        }

        this.observer();
    }

    //  Switch to desired image  
    switchImage() {
        this.inner.style.left = -100 * this.currentItem + "%";
    }

    //  Which bubble is active?  
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

    //  Create the carousel  
    createCarousel() {
        this.createBubbles();
        this.attachListeners();
        this.activeBubble();
    }

    //        Mutation Handling
    observer() {
        const carouselObserver = new MutationObserver(debounce(() => this.handleChange(), 100));
        carouselObserver.observe(this.inner, { attributes: true });
    }

    handleChange() {
        console.log('trigger')
        this.currentItem =
            parseInt(this.inner.style.left.replace(/\D/g, '')) / 100;
        this.activeBubble();
    }
}

new Carousel(0);
new Carousel(1);