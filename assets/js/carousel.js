//  **Very** Work in Progress
//  TODO:
//    - Handle Next/Previous properly
//      - Transition
//      - Add or remove 100% (Save the current slide before modifying)
//        ^ Almost done with moving to the right, also added a lastItem stopper.
//        ^ Update: Moving to right is done. Need to add moving back ^ handle right swipes.
//      - Start swipe from current image
//  Goal: make TouchControls reusable for other similar assets

//  Maybe just set this.current to 1, 2.. etc. this.current++?
//  Line 44 is brutal.. I'm new to this. Anyone reading this, go easy on me. :(
//  This needs a serious refaction when I'm not so tired.
class TouchControls {
    constructor(element, amountOfItems) {
        this.element = element;
        this.initialX;
        this.difference;
        this.current = 0;
        this.lastItem = -((amountOfItems - 1) * 100);
        this.attachListeners(element);
    }

    attachListeners(element) {
        element.addEventListener('touchstart', (event) => this.start(event));
        element.addEventListener('touchmove', (event) => this.move(event));
        element.addEventListener('touchend', (event) => this.end(event));
    }

    start(event) {
        this.initialX = event.touches[0].clientX;
    }

    move(event) {
        const touch = event.touches[0].clientX;
        const movable = changeX < this.element.clientWidth;
        const slideX = this.current * this.element.clientWidth;
        let changeX = this.initialX - touch;

        if (!this.difference && changeX > 0 && movable) {
            this.element.style.left = -changeX + 'px';
        } else if (this.current) {
            if ((this.current * 100) !== this.lastItem) {
                this.element.style.left = -slideX - changeX + 'px';
            }
        }

    }

    end(event) {
        const threshold = this.element.clientWidth / 3;
        this.difference = this.initialX - event.changedTouches[0].clientX;

        if (this.difference > threshold && (this.current * 100) !== this.lastItem) {
            this.next();
        } else if (threshold > this.difference && !(this.current * 100)) {
            this.element.style.left = 0 + '%';
            this.difference = 0;
        } else {
            this.element.style.left = (this.current * 100) + '%';
        }
        this.console()

    }

    next() {
        if (!this.current) {
            this.element.style.left = -100 + '%';
            this.current += 1;
        } else if (this.current) {
            this.element.style.left = -(this.current * 100) - 100 + '%';
            this.current += 1;
        }
    }

    prev() {

    }

    console() {
        console.log('element: ' + this.element);
        console.log('initialX: ' + this.initialX);
        console.log('difference: ' + this.difference);
        console.log('current: ' + this.current);
        console.log('lastItem: ' + this.lastItem);
        console.log('left: ' + this.element.style.left)

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
        this.currentImage = 0;

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
                this.currentImage = i;
                this.switchImage();
                this.activeBubble();
            });
        }
        //  Initiate touch controls
        new TouchControls(this.inner, this.imageAmount);
    }

    //  Switch to desired image  
    switchImage() {
        this.inner.style.left = -this.width * this.currentImage + "%";
    }

    //  Which bubble is active?  
    activeBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index === this.currentImage) {
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