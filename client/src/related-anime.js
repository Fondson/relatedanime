import $ from 'jquery';
import 'jquery.easing';

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('body').on('click', '.page-scroll .btn', function(event) {
        var $anchor = $(this);
        // console.log($anchor.attr('href'));
        $('html, body').stop().animate({
            scrollTop: $anchor.attr('href') === '#home' ? 0 : $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});