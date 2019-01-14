# Syhlo's Carousel Asset

###### *Currently being developed.*

This repository contains my personal responsive carousel asset. Currently it supports touch screen swiping, arrow controls, and bubble controls. It automatically adds the images in `.inner` to the carousel.

[Live Demonstration](https://codepen.io/Syh/full/VqEMNd)

Setting up a carousel is as easy as using the following templates:

#### HTML template
```html
<div class="is-carousel" id="name">
	<svg class="left-arrow arrow" viewBox="0 0 129 129" xmlns="http://www.w3.org/2000/svg"></svg>
	<svg class="right-arrow arrow" viewBox="0 0 129 129" xmlns="http://www.w3.org/2000/svg"></svg>

	<div class="inner">
    	<!-- img tags go here -->
	</div>

	<div class="image-selector"></div>
</div>
```
##### Steps: 
* Change the ID to your desired carousel name.

#### JavaScript template
```javascript
new Carousel('name', {
    bubbles: true,
    arrows: true,
    swiping: true,
    dragging: true,
    autoplay: true,
    startOnload: true,
    autoplaySpeed: 2000
});
```
##### Steps:

* Update the name in the JavaScript as well. 
* Tweak the options to your liking per carousel. 
* `autoplaySpeed` will be in milliseconds (not implemented yet). 

If no option was provided or the incorrect data type was used it will default to `false`.
