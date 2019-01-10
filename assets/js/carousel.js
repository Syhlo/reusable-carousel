//  **Very** Work in Progress
//  TODO:
//    - Handle Next/Previous properly
//      - Transition
//    - Ignore subsequent touches after first
//    - Convert the px to % based for continuity
//  Goal: make TouchControls reusable for other similar assets
class TouchControls {
    constructor(element, amountOfItems) {
        this.element = element;
        this.initialX;
        this.difference;
        this.currentItem = 0;
        this.lastItem = -((amountOfItems - 1) * 100);
        this.touched = false;
        this.attachListeners(element);
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => this.start(event), { passive: false });
        element.addEventListener('touchmove', (event) => this.move(event), { passive: false });
        element.addEventListener('touchend', (event) => this.end(event), { passive: false });
    }

    //          Listener Events
    start(event) {
        if (!this.touched) {
            event.preventDefault();
            this.touched = true;
            this.initialX = event.touches[0].clientX;
            event.stopImmediatePropagation();
        }
    }

    move(event) {
        event.preventDefault();
        const touch = event.touches[0].clientX; // current touch position
        const slideX = this.currentItem * this.element.clientWidth; // current slide
        let moveX = this.initialX - touch; // move slide by X
        let movable = moveX < this.element.clientWidth; // Prevent moving too far

        //  First move: currentItem is falsy & X moved greater than 0 & slide is movable.
        if (!this.currentItem && moveX > 0 && movable) {
            this.element.style.left = -moveX + 'px';
        }
        //  Subsequent moves: Current exists
        else if (this.currentItem) {
            //  Current item isn't the last item
            if (-(this.currentItem * 100) !== this.lastItem && movable) {
                this.element.style.left = -slideX - moveX + 'px';
            }
            else if (-(this.currentItem * 100) === this.lastItem && moveX < 0) {
                this.element.style.left = -slideX - moveX + 'px';
            }
        }
    }

    end(event) {
        event.preventDefault();
        this.difference = this.initialX - event.changedTouches[0].clientX;
        if (this.difference > 0) {
            this.moveLeft();
        }
        else if (this.difference < 0) {
            this.moveRight();
        }
        this.touched = false;
        // Gather global variable information
        this.console();

    }


    //              Controls
    moveLeft() {
        const threshold = this.element.clientWidth / 5;
        //  Difference is more than threshold, current item isn't last item
        if (this.difference > threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        }
        //  Threshold is greater than difference in X, currentItem doesn't exist
        else if (threshold > this.difference) {
            this.element.style.left = -(this.currentItem * 100) + '%';
            this.difference = 0;
        }
    }

    moveRight() {
        const threshold = -(this.element.clientWidth / 3.5);

        if (threshold > this.difference && this.currentItem !== 0) {
            this.prev();
            console.log('test')
        }
        else if (threshold < this.difference) {
            this.element.style.left = -(this.currentItem * 100) + '%';
            this.difference = 0;
        }
    }

    next() {
        // First move: currentItem does not exist
        if (!this.currentItem) {
            this.element.style.left = -100 + '%';
            this.currentItem += 1;
        }
        // Subsequent moves: currentItem exists
        else if (this.currentItem) {
            this.element.style.left = -(this.currentItem * 100) - 100 + '%';
            this.currentItem += 1;
        }
    }

    prev() {
        this.element.style.left = -(this.currentItem * 100) + 100 + '%';
        this.currentItem -= 1;
    }

    console() {
        console.log(' ')
        console.log('-------------------')
        console.log(this.element);
        console.log('initialX: ' + this.initialX);
        console.log('difference: ' + this.difference);
        console.log('current: ' + this.currentItem);
        console.log('lastItem: ' + this.lastItem);
        console.log('left: ' + this.element.style.left)
        console.log('-------------------')

    }

}


//  TODO:
//    - Finish touch controls
//    - Update Carousel active when changed via touch controls (MutationObserver?)
//    - Create mouse dragging controls?
//    - Create an optional 'auto-play' start/stop feature (easy, timeIntervals)
//    - Create optional next/previous?
//    - Maybe loop the carousel?
//    - Allow for custom width/height (debating if I want to do this in JS.. you know, separation and everything)
class Carousel {
    constructor(index) {
        //  Carousel variables
        this.carousel =
            document.getElementsByClassName('is-carousel')[index];
        this.inner =
            this.carousel.getElementsByClassName('inner')[0];
        this.imageAmount =
            this.inner.getElementsByTagName('img').length;
        this.currentItemImage = 0;

        //  Selection variables
        this.imageSelector =
            this.carousel.getElementsByClassName('image-selector')[0];
        this.bubbles = [];
        this.width = 100;

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
                this.currentItemImage = i;
                this.switchImage();
                this.activeBubble();
            });
        }
        //  Initiate touch controls
        new TouchControls(this.inner, this.imageAmount);
    }

    //  Switch to desired image  
    switchImage() {
        this.inner.style.left = -this.width * this.currentItemImage + "%";
    }

    //  Which bubble is active?  
    activeBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index === this.currentItemImage) {
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

}


let projectDisplay = new Carousel(0);
let projectDisplay2 = new Carousel(1);