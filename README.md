# Syhlo's Slider Asset

###### *Currently being developed.*

This repository contains my personal responsive slider asset. Currently it supports touch screen swiping, arrow controls, bubble controls, and looping autoplay. It automatically adds the images in `.inner` to the slider.

Preview the features: [Demonstration](https://codepen.io/Syh/full/VqEMNd)

Setting up a slider is as easy as modifying the below templates and including slider.js and slider.css into your HTML file.

## Templates

#### HTML template
```html
<div class="is-slider" id="name">
	<svg class="left-arrow arrow" viewBox="0 0 129 129" xmlns="http://www.w3.org/2000/svg"></svg>
	<svg class="right-arrow arrow" viewBox="0 0 129 129" xmlns="http://www.w3.org/2000/svg"></svg>

	<div class="inner">
    	<!-- img tags go here -->
	</div>

	<div class="image-selector"></div>
</div>
```
##### Steps: 
* Change the ID to your desired slider name.

#### JavaScript template
```javascript
new Slider('first', {
    // Controls
    bubbles: true,
    arrows: true,
    swiping: true,
    dragging: false,
    autoplay: true,
    
    // Autoplay settings
    autoplayOnload: true,
    autoplaySpeed: 2500,

    // Display numbers, e.g. slide 2/5
    numbers: true
});
```
##### Steps:

* Update the ID name in the JavaScript as well. 
* Tweak the options of your slider to your liking. 

If no option was provided or the incorrect data type was used it will default to `false`.
