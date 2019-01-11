//*     Helper Functions
function debounce(func, delay) {
    let inDebounce
    return function () {
        const context = this
        const args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(() => func.apply(context, args), delay)
    }
}

//?             SwipeControl
//TODO      Base Functionality
//*     - Only allow one point of contact with surface
//*     - Look into .throttle and .debounce
//*     - MutationObserver to keep asset and SwipeControl items in line

//TODO      Optional Settings
//*     - Arrow Overlay: Create arrows that show when threshold was reached.
//*         - Potentially disable the slide being moved
//?  Goal: make SwipeControl reusable for similar assets
class SwipeControl {
    constructor(element, amountOfItems) {
        this.element = element;
        this.initialX;
        this.difference;
        this.currentItem = 0;
        this.lastItem = -((amountOfItems - 1) * 100);
        this.touching = false;
        this.attachListeners(element);
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => { if (!this.touching) { this.start(event) } }, { passive: false });
        element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        element.addEventListener('touchend', (event) => this.end(event), { passive: false });
        element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //              Listener Events (TouchEvent)
    start(event) {

        // let allTouches = event.targetTouches[1].clientX;
        // console.log(allTouches)
        // document.getElementsByTagName('p')[0].textContent = `Touches: ${allTouches}`;

        //  Disable default functionality, propagation, and disable new touches
        event.preventDefault();
        this.touching = true;
        event.stopImmediatePropagation();

        this.initialX = event.touches[0].clientX / 10;  //  Initial touch position
    }

    move(event) {
        event.preventDefault();
        const touch = event.touches[0].clientX / 10;  //    Current touch position
        const slideX = this.currentItem * 100;        //    Current slide
        let moveX = (this.initialX - touch) / 5;    //    Move slide by value
        let movable = moveX < 100;                  //    Movable threshold

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
            else if (-(this.currentItem * 100) === this.lastItem && moveX < 0) {
                this.element.style.left = -slideX - moveX + '%';
            }
        }
    }

    end(event) {
        event.preventDefault();
        this.difference = this.initialX - (event.changedTouches[0].clientX / 10);
        //  Difference is positive
        if (this.difference > 0) {
            this.moveLeft();
        }
        //  Difference is negative
        else if (this.difference < 0) {
            this.moveRight();
        }

        //  Enable receiving new touches
        this.touching = false;

        //  Display global variable information
        // this.console();

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

    //              Development Purposes
    console() {
        console.log(this.element);
        console.log('initialX: ' + this.initialX);
        console.log('difference: ' + this.difference);
        console.log('current: ' + this.currentItem);
        console.log('lastItem: ' + this.lastItem);
        console.log('left: ' + this.element.style.left);
        console.log(' ');

    }

}


//?             Carousel
//TODO      Base Functionality
//*     - Finish touch controls
//*     - Start mouse dragging controls
//*     - MutationObserver to keep asset and SwipeControl items & active item in line

//TODO      Optional Settings
//*     - Take in an object to enable/disable features
//*     - Allow for custom width/height (I might use SCSS for this)
//*     - Create an optional 'auto-play' start/stop feature (timeIntervals)
//*     - Create optional next/previous
//*         - Optionally disable bubbles
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

    //  Create the bubbles on the carousel
    createBubbles() {
        if (this.imageAmount > 1) {
            for (let i = 0; i < this.imageAmount; i++) {
                //  Create a wrapper span, bubble span, and append to image selector.
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

    //  Attach listeners   
    attachListeners() {
        //  On bubble click switch to that image
        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].addEventListener("click", () => {
                this.currentItem = i;
                this.switchImage();
                this.activeBubble();
            });
        }
        //  Initiate touch controls
        new SwipeControl(this.inner, this.imageAmount);
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
            }
        });
    }

    //  Create the carousel  
    createCarousel() {
        this.createBubbles();
        this.attachListeners();
        this.activeBubble();
    }


    //              Mutation Handling
    observer() {
        let observer = new MutationObserver(debounce(() => this.handleChange(), 50));
        observer.observe(this.inner, { attributes: true });
    }

    handleChange() {
        let newSlide = this.inner.style.left
        if (parseInt(newSlide.charAt(0)) === 0) {
            this.currentItem = 0;
        } else {
            this.currentItem = parseInt(newSlide.charAt(1));
        }
        this.activeBubble();
    }
}

let projectDisplay = new Carousel(0);
let projectDisplay2 = new Carousel(1);