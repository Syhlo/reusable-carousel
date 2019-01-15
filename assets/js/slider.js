//?             TouchHandler
//TODO      Base Functionality
//*     - Add .throttle and .debounce when applicable
//*         - throttle the movement
//?  Goal: make TouchHandler reusable for similar assets
class TouchHandler {
    constructor() {
        this.initial;                                               //  Initial touch position
        this.threshold = 5;                                         //  % of item before triggering next slide
        this.currentItem = 0;                                           //  Current item
        this.currentPercent = -0;                                   //  Percentage based currentItem
        this.lastItem;
    }

    swipeEvents() {
        this.element.addEventListener('touchstart', (event) => this.touchStart(event), { passive: false });
        this.element.addEventListener('touchmove', (event) => this.touchMove(event), { passive: false });
        this.element.addEventListener('touchend', (event) => this.touchEnd(event), { passive: false });
        this.element.addEventListener('transitionend', () => this.element.style.removeProperty('transition'));
    }

    //*                                  Event Handlers
    touchStart(event) {
        event.preventDefault();
        if (this.firstTouch(event)) {                               //  Prevents multitouch interaction
            this.initial = event.touches[0].clientX / 10;           //  Initial touch position
            this.currentPercent = -(this.currentItem * 100)         //  Percentage based currentItem
        }
    }

    touchMove(event) {
        event.preventDefault();
        if (this.firstTouch(event)) {
            this.handleMove(event);
        }
    }

    touchEnd(event) {
        event.preventDefault();
        if (this.firstTouch(event)) {
            const newPos = (event.changedTouches[0].clientX / 10)   //  New touch position
            const moved = this.initial - newPos;                    //  Difference between initial and new position
            moved >= 0 ? this.swipedRight(moved) : this.swipedLeft(moved);
        }
        this.debug(event);
    }

    //*                                  Controls
    handleMove(event) {
        const touch = event.touches[0].clientX / 10;                //  Current touch position
        let move = (this.initial - touch) / 10;
        switch (this.allowed(move)) {
            case 0:
                this.moveSlide(move);
            case 1:
                if (!this.lastItem) { this.moveSlide(move); }
                if (move < 0) { this.moveSlide(move); }
        }
    }

    swipedRight(moved) {
        this.element.style.transition = 'left 0.2s'
        if (moved > this.threshold) {
            this.next();
        } else {
            this.stay();
        }
    }

    swipedLeft(moved) {
        this.element.style.transition = 'left 0.2s'
        if (-this.threshold > moved) {
            this.previous();
        } else {
            this.stay();
        }
    }

    //*                                 Movement

    next(bypass) {
        if (!this.lastItem || bypass) {
            this.element.style.left = this.currentPercent - 100 + '%';
            this.setCurrents();
        }
    }

    previous(bypass) {
        if (this.currentItem || bypass) {
            this.element.style.left = this.currentPercent + 100 + '%';
            this.setCurrents();
        }
    }

    stay() {
        this.element.style.left = this.currentPercent + '%';
        this.setCurrents();
    }

    moveSlide(move) {
        this.element.style.left = this.currentPercent - move + '%';
    }

    //*                                  Helpers
    firstTouch(event) {
        return event.changedTouches[0].identifier === 0
    }

    allowed(move) {
        let movable = move < 2.5 && move > -2.5;                    //  Movable threshold
        if (this.currentItem === 0 & move > 0 && movable) {
            return 0;
        } else if (this.currentItem && movable) {
            return 1;
        }
    }

    setCurrents() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100;
        this.currentPercent = -(this.currentItem * 100);
    }

    debug(event) {
        var now = new Date()
        console.log('%cDebugging Values', 'font-weight: bold')
        console.log(event)
        console.log(
            'currentItem: ' + this.currentItem + '\n' +
            'lastItem: ' + this.lastItem + '\n' +
            'currentPercent ' + this.currentPercent + '\n' +
            'left: ' + this.element.style.left)
        console.log(' ')
    }

}

//?             slider
//TODO      Base Functionality
//*     - Start mouse dragging controls
//*     - Create a 'count' (e.g. slide 2/6) in top right
//*     - All controls should loop forward/backwards
class Slider extends TouchHandler {
    constructor(id, settings = {}) {
        super()
        // Elements
        this.slider =
            document.getElementById(id);
        this.element =
            this.slider.getElementsByClassName('inner')[0];
        this.imageSelector =
            this.slider.getElementsByClassName('image-selector')[0];
        this.bubbles = [];
        this.items =
            this.element.getElementsByTagName('img');

        // Slide information
        this.lastItem = this.currentPercent === -((this.items.length - 1) * 100);
        this.settings = settings;

        // Autoplay settings
        this.playing = this.build('autoplayOnload') ? false : true;

        //  Init
        this.createslider();
    }

    //*                                  Slider Creation
    createslider() {
        if (this.items.length > 1) {
            this.createBubbles();
            this.currentActiveBubble();
            this.createArrows();
            this.handleAutoplay();
            this.swipeEvents();
            this.buildControls();
        }
    }

    createBubbles() {
        if (this.build('bubbles')) {
            for (let i = 0; i < this.items.length; i++) {
                let bubble = document.createElement('span');
                bubble.className = 'bubble';
                let wrapper = document.createElement('span');
                wrapper.className = 'bubble-wrapper';
                wrapper.appendChild(bubble);                        //  Put the bubble in a wrapper
                this.imageSelector.appendChild(wrapper);            //  Add bubble to image selector
                this.bubbles.push(wrapper);                         //  Add bubble to bubbles array for listeners
            }
        }
    }

    createArrows() {
        if (this.build('arrows')) {
            let arrows = [...this.slider.querySelectorAll('.is-slider > .arrow')];
            arrows.forEach((arrow) => {
                arrow.innerHTML =
                    '<path d="m39.964 126.15 61.339-61.339-61.339-61.339-12.268 12.268 49.071 49.071-49.071 49.071 12.268 12.268" />';
            });
        }
    }

    createAutoplay() {
        if (this.build('autoplay')) {
            let autoplay = this.slider.getElementsByClassName('autoplay')[0];
            if (!this.playing) {
                autoplay.innerHTML = `<g>
                    <circle cx="64.5" cy = "64.5" r = "58.417" />
                    <path transform="matrix(.68898 -.63178 .63178 .68898 -17.173 45.244)" d="m79.202 100.52-68.488-15.162 47.375-51.732 10.557 33.447z" />
                    </g >`
            } else {
                autoplay.innerHTML = ` <g>
                    <circle cx="64.5" cy="64.5" r="58.417"/>
                    <g transform="matrix(.93515 0 0 1 6.7155 -.10065)">
                    <path d="m45 95h9.9833v-60h-9.9833z"/>
                    <path d="m70 95h9.9833v-60h-9.9833z"/>
                    </g>
                    </g>`
            }
        }
    }

    //*                                  Listeners
    buildControls() {
        if (this.build('arrows')) {
            let arrows = [...this.slider.getElementsByClassName('arrow')];
            arrows.forEach((arrow, i) => arrow.addEventListener('click', () => {
                this.element.style.transition = 'left 0.2s';
                this.handleArrowPress(i);
            }));
        }

        if (this.build('bubbles')) {
            for (let i = 0; i < this.bubbles.length; i++) {
                this.bubbles[i].addEventListener("click", () => {
                    this.element.style.transition = 'left 0.2s';
                    this.currentItem = i;
                    this.handleBubblePress();
                    this.currentActiveBubble();
                });
            }
        }

        if (this.build('autoplay')) {
            let autoplay = this.slider.getElementsByClassName('autoplay')[0];
            autoplay.addEventListener('click', () => this.handleAutoplay());
        }

    }

    //*                                  Control Handlers
    handleBubblePress() {
        this.element.style.left = -100 * this.currentItem + "%";
        this.setCurrents();
        this.pause();
    }

    handleArrowPress(index) {
        if (index === 0) {
            this.previous();
            this.pause();
        } else {
            this.next();
            this.pause();
        }
    }

    handleAutoplay() {
        if (this.build('autoplay')) {
            if (!this.playing) {
                this.play();
            } else {
                this.pause();
            }
        }
    }

    //*                                 Autoplay Controls
    play() {
        this.playing = setInterval(() => {
            this.element.style.transition = 'left 0.4s';
            !this.lastItem ? this.next() : this.loopItems();
        }, this.settings.autoplaySpeed);
        this.createAutoplay();
    }

    pause() {
        if (this.build('autoplay')) {
            clearInterval(this.playing);
            this.playing = false;
            this.createAutoplay();
        }
    }

    loopItems() {
        // Clone and append node
        const clone = this.items[0].cloneNode(false);
        this.element.append(clone);

        // Manually go to next slide
        this.next(true);

        // Set currentItem and bubble to first image
        this.currentItem = 0;
        this.currentActiveBubble();

        // Sync transition time
        setTimeout(() => {
            // Switch to first image discretely
            this.element.style.transition = 'none';
            this.element.style.left = 0 + '%';

            // Set currentItem & currentPercent
            this.setCurrents();

            // Remove clone
            this.element.removeChild(this.element.lastChild)
        }, 400);
    }

    move(event) {
        super.move(event);
        this.pause();
    }

    //*                                 Helper Methods
    setCurrents() {
        super.setCurrents();
        this.currentActiveBubble();
        this.lastItem = this.currentPercent === -((this.items.length - 1) * 100);
    }

    currentActiveBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index === this.currentItem) {
                bubble.children[0].classList.add("bubble-active");
            } else {
                bubble.children[0].classList.remove("bubble-active");
            }
        });
    }

    build(setting) {
        return Object.keys(this.settings).includes(setting) ?
            typeof this.settings[setting] === 'boolean' ? this.settings[setting] : false
            : false
    }
}

let first = new Slider('first', {
    // Controls
    bubbles: true,
    arrows: false,
    swiping: false,
    dragging: false,
    autoplay: false,

    // Autoplay settings
    autoplayOnload: false,
    autoplaySpeed: 2200,

    // Display numbers, e.g. slide 2/5
    numbers: false
});

let second = new Slider('second', {
    // Controls
    bubbles: false,
    arrows: true,
    swiping: false,
    dragging: false,
    autoplay: true,

    // Autoplay settings
    autoplayOnload: false,
    autoplaySpeed: 2200,

    // Display numbers, e.g. slide 2/5
    numbers: false
});