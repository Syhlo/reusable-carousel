//  **Very** Work in Progress
//  TODO:
//    - Handle Next/Previous properly
//      - Transition
//      - Add or remove 100% (Save the current slide before modifying)
//        ^ Update: Moving to right is done. Need to add moving back ^ handle right swipes.
//  Goal: make TouchControls reusable for other similar assets
class TouchControls {
    constructor(element, amountOfItems) {
        this.element = element;
        this.initialX;
        this.difference;
        this.currentItem = 0;
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
        const slideX = this.currentItem * this.element.clientWidth;
        let moveX = this.initialX - touch;
        let movable = moveX < this.element.clientWidth;

        //  First move: No difference, X moved greater than 0, and slide is movable.
        if (!this.difference && moveX > 0 && movable) {
            this.element.style.left = -moveX + 'px';
        }
        //  Subsequent moves: Current exists
        else if (this.currentItem) {
            //  Current item isn't the last item
            if (-(this.currentItem * 100) !== this.lastItem) {
                this.element.style.left = -slideX - moveX + 'px';
            }
        }
        console.log(slideX)

    }

    end(event) {
        const threshold = this.element.clientWidth / 4;
        this.difference = this.initialX - event.changedTouches[0].clientX;
        //  Difference is more than threshold, current item isn't last item
        if (this.difference > threshold && -(this.currentItem * 100) !== this.lastItem) {
            this.next();
        }
        //  Threshold is greater than difference in X, currentItem doesn't exist
        else if (threshold > this.difference && !this.currentItem) {
            this.element.style.left = 0 + '%';
            this.difference = 0;
        } else {
            console.log()
            this.element.style.left = -(this.currentItem * 100) + '%';
        }
        this.console()

    }

    next() {
        if (!this.currentItem) {
            this.element.style.left = -100 + '%';
            this.currentItem += 1;
        } else if (this.currentItem) {
            this.element.style.left = -(this.currentItem * 100) - 100 + '%';
            this.currentItem += 1;
        }
    }

    prev() {

    }

    console() {
        console.log(' ')
        console.log('Variables:')
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