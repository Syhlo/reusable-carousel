//?             TouchHandler
//TODO      Base Functionality
//*     - Add .throttle and .debounce when applicable
//*         - throttle the movement
//*     - Refactor (handle touch and drag in one)
//?  Goal: make TouchHandler reusable for similar assets
class TouchHandler {
    constructor() {
        this.initial                                               //  Initial touch position
        this.threshold = 5                                         //  % of item before triggering next slide
        this.currentItem = 0                                       //  Current item
        this.currentPercent = -0                                   //  Percentage based currentItem
        this.lastItem
    }

    swipeEvents() {
        this.element.addEventListener('touchstart', (event) => this.touchStart(event), { passive: false })
        this.element.addEventListener('touchmove', (event) => this.touchMove(event), { passive: false })
        this.element.addEventListener('touchend', (event) => this.touchEnd(event), { passive: false })
    }

    //*                                  Event Handlers
    touchStart(event) {
        event.preventDefault()
        if (this.firstTouch(event)) {                               //  Prevents multitouch interaction
            this.initial = event.touches[0].clientX / 10           //  Initial touch position
            this.currentPercent = -(this.currentItem * 100)         //  Percentage based currentItem
        }
    }

    touchMove(event) {
        event.preventDefault()
        if (this.firstTouch(event)) {
            this.handleMove(event)
        }
    }

    touchEnd(event) {
        event.preventDefault()
        if (this.firstTouch(event)) {
            const NEWPOS = (event.changedTouches[0].clientX / 10)   //  New touch position
            const CHANGE = this.initial - NEWPOS                    //  Difference between initial and new position
            CHANGE >= 0 ? this.swipedLeft(CHANGE) : this.swipedRight(CHANGE)
        }
    }

    //*                                  Controls
    handleMove(event) {
        const TOUCH = event.touches[0].clientX / 10                //  Current touch position
        let movement = (this.initial - TOUCH) / 10
        switch (this.allowed(movement)) {
            case 0:
                this._moveSlide(movement)
            case 1:
                if (!this.lastItem) { this._moveSlide(movement) }
                else if (movement < 0) { this._moveSlide(movement) }
        }
    }

    swipedRight(CHANGE) {
        if (-this.threshold > CHANGE) {
            this.moveTo('previous', 300)
        } else {
            this.moveTo('stay', 300)
        }
    }

    swipedLeft(CHANGE) {
        if (CHANGE > this.threshold) {
            this.moveTo('next', 300)
        } else {
            this.moveTo('stay', 300)
        }
    }

    //*                                  Helpers
    firstTouch(event) {
        return event.changedTouches[0].identifier === 0
    }

    allowed(move) {
        const MOVABLE = move < 2.5 && move > -2.5                    //  Movable threshold
        if (!this.currentItem & move > 0 && MOVABLE) {
            return 0
        } else if (this.currentItem && MOVABLE) {
            return 1
        }
    }
}

//?             Slider
//TODO      Base Functionality
//*     - Start mouse dragging controls
//*     - Arrow key support
class Slider extends TouchHandler {
    constructor(id, settings = {}) {
        super()
        // Elements
        this.slider =
            document.getElementById(id)
        this.element =
            this.slider.getElementsByClassName('inner')[0]
        this.bubbles = []
        this.items =
            this.element.getElementsByTagName('img')

        // Settings
        this.settings = settings

        // Slide information
        this.lastItem = (this.currentPercent === -((this.items.length - 2) * 100))
        this.animating = false
        this.playing = this.build('autoplayOnload') ? false : true


        //  Init
        this.createslider()
    }


    //*                                  Slider Creation

    createslider() {
        if (this.items.length > 1) {
            if (this.build('bubbles')) this.createBubbles()
            if (this.build('arrows')) this.createArrows()
            if (this.build('autoplay')) this.autoplay()
            if (this.build('number')) this.createNumber()
            if (this.build('touch')) this.swipeEvents()
            this.createLoop()
            this.listeners()
        }
    }


    //*                                  Bubbles

    createBubbles() {
        for (let i = 0; i < this.items.length; i++) {
            let bubble = document.createElement('span')
            bubble.className = 'bubble'
            let wrapper = document.createElement('span')
            wrapper.className = 'bubble-wrapper'
            wrapper.appendChild(bubble)                        //  Put the bubble in a wrapper
            this.slider.getElementsByClassName('image-selector')[0]
                .appendChild(wrapper)                          //  Add bubble to image selector
            this.bubbles.push(wrapper)                         //  Add bubble to bubbles array for listeners
        }
    }

    // Need to fix issue with autoplay:
    // Bubble takes a (figurative) second to update after looping
    // Possibly recreate setCurrent and run first line?
    activeBubble() {
        this.bubbles.forEach((bubble, index) => {
            if (index + 1 === this.currentItem) {
                bubble.children[0].classList.add("bubble-active")
            } else {
                bubble.children[0].classList.remove("bubble-active")
            }
        })
    }


    //*                                  Arrows

    createArrows() {
        let arrows = [...this.slider.querySelectorAll('.is-slider > .arrow')]
        arrows.forEach((arrow) => {
            arrow.innerHTML =
                '<path d="m39.964 126.15 61.339-61.339-61.339-61.339-12.268 12.268 49.071 49.071-49.071 49.071 12.268 12.268" />'
        })
    }

    arrowPress(index) {
        if (!index) {
            this.moveTo('previous', 300)
        } else {
            this.moveTo('next', 300)
        }
    }


    //*                                 Autoplay

    autoplay() {
        if (this.build('autoplay')) {
            !this.playing ? this.play() : this.pause()
        }
    }

    play() {
        this.playing = setInterval(() => {
            !this.lastItem ? this.moveTo('next', 600) : this.sliderLoop(1, 600)
        }, this.settings.autoplaySpeed)
        this.createAutoplay()
    }

    pause() {
        if (this.build('autoplay')) {
            clearInterval(this.playing)
            this.playing = false
            this.createAutoplay()
        }
    }

    // refactor this
    createAutoplay() {
        let autoplay = this.slider.getElementsByClassName('autoplay')[0]
        if (!this.playing) {
            autoplay.innerHTML = `
                                            <circle cx="64.5" cy = "64.5" r = "58.417" />
                                            <path transform="matrix(.68898 -.63178 .63178 .68898 -17.173 45.244)" d="m79.202 100.52-68.488-15.162 47.375-51.732 10.557 33.447z" />`
        } else {
            autoplay.innerHTML = `
                                            <circle cx="64.5" cy="64.5" r="58.417"/>
                                            <g transform="matrix(.93515 0 0 1 6.7155 -.10065)">
                                            <path d="m45 95h9.9833v-60h-9.9833z"/>
                                            <path d="m70 95h9.9833v-60h-9.9833z"/>
                                            </g>`
        }
    }


    //*                                  Slide Number

    createNumber() {
        const DISPLAY = this.slider.querySelector('.count')
        if (!this.currentItem) {
            DISPLAY.innerText = `${this.items.length - 2}`
        } else if (this.currentItem === this.items.length - 1) {
            DISPLAY.innerText = '1'
        } else {
            DISPLAY.innerText = `${this.currentItem}`
        }
    }

    //*                                  Item Loop

    createLoop() {
        this.element.insertBefore(
            this.items[this.items.length - 1].cloneNode(false),
            this.element.firstElementChild)
        this.element.append(
            this.items[1].cloneNode(false))
        this.moveTo('next', 0)
    }

    sliderLoop(direction, speed) {
        direction ? this.loopNext(speed) : this.loopPrevious(speed)
    }

    loopPrevious(speed) {
        let end = () => {
            this.moveTo(this.items.length - 2, 0)
            this.element.removeEventListener('transitionend', end)
            this.animating = false
        }
        this.element.style.transition = `left ${speed}ms`
        this._previous()
        this.element.addEventListener('transitionend', end)
    }

    loopNext(speed) {
        let end = () => {
            this.moveTo(1, 0)
            this.element.removeEventListener('transitionend', end)
            this.animating = false
        }
        this.element.style.transition = `left ${speed}ms`
        this._next()
        this.element.addEventListener('transitionend', end)
    }


    //*                                  Listeners

    listeners() {
        let arrows = [...this.slider.getElementsByClassName('arrow')]
        arrows.forEach((arrow, i) => arrow.addEventListener('click', () => {
            this.arrowPress(i)
        }))

        for (let i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].addEventListener("click", () => {
                this.currentItem = i + 1
                this.moveTo('bubble', 200)
                this.activeBubble()
            })
        }

        let autoplay = this.slider.getElementsByClassName('autoplay')[0]
        autoplay.addEventListener('click', () => this.autoplay())

        this.element.addEventListener('transitionend', () => {
            this.element.style.removeProperty('transition')
            this.animating = false
        })
    }


    //*                                 Slider movement

    // Might switch all of this to a dispatch-table
    moveTo(input, speed, condition) {
        if (!this.animating) {
            this.element.style.transition = `left ${speed}ms`
            const ANIMATE = () => { if (speed) this.animating = true }
            switch (input) {
                case 'next':
                    ANIMATE()
                    if (this.lastItem) this.sliderLoop(1, speed)
                    else this._next()
                    break
                case 'previous':
                    ANIMATE()
                    if (this.currentItem === 1) this.sliderLoop(0, speed)
                    else this._previous()
                    break
                case 'stay':
                    this._stay()
                    break
                case 'bubble':
                    this._bubble()
                    this.animating = false
                    this.pause()
                    break
                default:
                    ANIMATE()
                    this._index(input)
                    if (!this.playing) this.pause()
            }
            this._update()
        }
    }

    _next() { this.element.style.left = `${this.currentPercent - 100}%` }
    _previous() { this.element.style.left = `${this.currentPercent + 100}%` }
    _stay() { this.element.style.left = `${this.currentPercent}%` }
    _bubble() { this.element.style.left = `${this.currentItem * -100}%` }
    _index(value) { this.element.style.left = `${-(value * 100)}%` }
    _moveSlide(move) { this.element.style.left = `${this.currentPercent - move}%` }


    //*                                 Helper Methods
    _update() {
        this.currentItem =
            parseInt(this.element.style.left.replace(/\D/g, '')) / 100
        this.currentPercent = -(this.currentItem * 100)
        this.activeBubble()
        if (this.build('number')) this.createNumber()
        this.lastItem = this.currentPercent === -((this.items.length - 2) * 100)
    }

    build(setting) {
        return Object.keys(this.settings).includes(setting) ?
            typeof this.settings[setting] === 'boolean' ? this.settings[setting] : false
            : false
    }
}

const FIRST = new Slider('first', {
    // Controls
    bubbles: true,
    arrows: false,
    touch: false,
    drag: false,
    autoplay: true,

    // Autoplay settings
    autoplayOnload: false,
    autoplaySpeed: 2000,

    // Display numbers, e.g. slide 2/5
    number: false
})

const SECOND = new Slider('second', {
    // Controls
    bubbles: false,
    arrows: true,
    touch: true,
    drag: false,
    autoplay: false,

    // Autoplay settings
    autoplayOnload: false,
    autoplaySpeed: 2000,

    // Display slide number
    number: true
})
