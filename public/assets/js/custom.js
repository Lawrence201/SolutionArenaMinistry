/*-----------------------------------------------------------------------------------

    Template Name: Blesso - Crowdfunding & Charity HTML Template



    Note: This is Custom Js file

-----------------------------------------------------------------------------------

    Js INDEX

    ===================

    ## reviews-slider

    ## hero-one-slider

    ## prayers-slider

    ## v-slide

    ## sponsors-slider

    ## slider-church-prayers

    ## hero-three-slider

    ## Slider-Causes-Of-Church

    ## Counter

    ## Tilt on hover

    ## Animation on scroll

    ## C-slide

    ## pd-gallery

    ## Loader

    ## Cart Popup

    ## Scroll top

    ## Donation Amount Select On Click

    ## Sermon Media

    ## Responsive header menu

    ## Audio Player



-----------------------------------------------------------------------------------*/







jQuery(document).ready(function ($) {



  "use strict";

  if ($(".reviews-slider")[0]) {
    $('.reviews-slider').slick({

      slidesToShow: 1,

      slidesToScroll: 1,

      arrows: false,

      dots: true,

      cssEase: 'linear'

    });
  }

  if ($(".hero-one-slider")[0]) {
    $('.hero-one-slider').slick({

      slidesToShow: 1,

      slidesToScroll: 1,

      arrows: true,

      dots: false,

      cssEase: 'linear'

    });
  }


  if ($(".prayers-slider")[0]) {
    $('.prayers-slider').slick({

      slidesToShow: 1,

      slidesToScroll: 1,

      arrows: false,

      fade: true,

      dots: true,

      cssEase: 'linear',
      autoplay: true,

      autoplaySpeed: 3000,

      speed: 1000

    });
  }
  if ($(".events-carousal-slider")[0]) {
    $('.events-carousal-slider').slick({

      slidesToShow: 5,

      slidesToScroll: 2,

      arrows: false,

      dots: false,

      centerMode: true,

      infinite: true,

      cssEase: 'linear',

      draggable: true,

      autoplay: true,

      autoplaySpeed: 2000,

      speed: 1000,

      responsive: [

        {

          breakpoint: 1500,

          settings: {

            slidesToShow: 4,

            slidesToScroll: 4,

          }

        },

        {

          breakpoint: 1300,

          settings: {

            slidesToShow: 3,

            slidesToScroll: 3,

          }

        },

        {

          breakpoint: 1000,

          settings: {

            slidesToShow: 2,

            slidesToScroll: 2,

          }

        },

        {

          breakpoint: 800,

          settings: {

            slidesToShow: 2,

            slidesToScroll: 1,

          }

        },
        {

          breakpoint: 480,

          settings: {

            slidesToShow: 1,

            slidesToScroll: 1,

          }

        },

      ]

    });
  }

  if ($(".sponsors-slider")[0]) {
    $('.sponsors-slider').slick({

      slidesToShow: 5,

      slidesToScroll: 3,

      arrows: false,

      dots: false,
      autoplay: true,

      autoplaySpeed: 2000,

      speed: 1000,

      responsive: [

        {

          breakpoint: 1200,

          settings: {

            slidesToShow: 4,

            slidesToScroll: 1,

          }

        },

        {

          breakpoint: 1000,

          settings: {

            slidesToShow: 3,

            slidesToScroll: 1,

          }

        },

        {

          breakpoint: 550,

          settings: {

            slidesToShow: 2,

            slidesToScroll: 1,

          }

        },

      ]

    });
  }


  // hero-three-slider
  if ($(".hero-three-slider")[0]) {
    $('.hero-three-slider').slick({

      slidesToShow: 1,

      slidesToScroll: 1,

      arrows: false,
      fade: true,
      dots: false,
      pauseOnHover: false,
      cssEase: 'linear',
      autoplay: true,
      draggable: false,

      autoplaySpeed: 5000,

      speed: 2000,


    }).on('setPosition', function (event, slick) {
      slick.$slides.css('height', slick.$slideTrack.height(100) + '%');
    });
    var currentSlide = 0;
    $('.hero-three-slider').on('afterChange', function (event, slick, newSlide) {
      var items = $('.hero-three-slider .item');
      $(items).addClass('animated');
    });
    $('.hero-three-slider').on('beforeChange', function (event, slick, newSlide) {
      var items = $('.hero-three-slider .item');
      $(items).removeClass('animated');
    });
  }

  // slider-church-prayers
  if ($(".slider-church-prayers")[0]) {
    $('.slider-church-prayers').slick({

      slidesToShow: 2,

      slidesToScroll: 1,

      arrows: false,

      dots: false,

      cssEase: 'ease-in-out',

      draggable: true,

      autoplay: true,

      autoplaySpeed: 3000,

      speed: 1300,
      responsive: [

        {

          breakpoint: 1000,

          settings: {

            slidesToShow: 1,

            slidesToScroll: 1,

          }

        },

      ]

    });
  }





  // Slider-Causes-Of-Church
  if ($(".slider-causes-of-church")[0]) {
    $('.slider-causes-of-church').slick({

      slidesToShow: 3,

      slidesToScroll: 1,

      dots: false,

      arrows: false,

      cssEase: 'ease-in-out',

      draggable: true,

      autoplay: true,

      autoplaySpeed: 3000,

      speed: 1300,
      responsive: [

        {

          breakpoint: 1030,

          settings: {

            slidesToShow: 2,

            slidesToScroll: 1,

          }

        },
        {

          breakpoint: 600,

          settings: {

            slidesToShow: 1,

            slidesToScroll: 1,

          }

        },

      ]

    });
  }




  // Counter
  if ($(".counter")[0]) {
    $('.counter').counterUp({

      delay: 10,

      time: 1000

    });
  }
  if ($(".countdown")[0]) {

    var target_date = new Date().getTime() + (1000 * 3600 * 48); // set the countdown date

    var days, hours, minutes, seconds; // variables for time units



    var countdown = document.getElementById("tiles"); // get tag element



    getCountdown();



    setInterval(function () { getCountdown(); }, 1000);



    function getCountdown() {



      // find the amount of "seconds" between now and target

      var current_date = new Date().getTime();

      var seconds_left = (target_date - current_date) / 1000;



      days = pad(parseInt(seconds_left / 86400));

      seconds_left = seconds_left % 86400;



      hours = pad(parseInt(seconds_left / 3600));

      seconds_left = seconds_left % 3600;



      minutes = pad(parseInt(seconds_left / 60));

      seconds = pad(parseInt(seconds_left % 60));



      // format countdown string + set tag value

      countdown.innerHTML = "<span>" + days + "</span><span>" + hours + "</span><span>" + minutes + "</span><span>" + seconds + "</span>";

    }



    function pad(n) {

      return (n < 10 ? '0' : '') + n;

    }

  }



  // Tilt on hover
  if ($(".tilt")[0]) {
    $('.tilt').tilt({

      maxGlare: 1,

      maxTilt: 3,

      transition: true,

    });
  }
  if ($(".tiltt")[0]) {
    $('.tiltt').tilt({

      maxGlare: 0.5,

      maxTilt: 0.5,

      transition: true,

    });
  }




  // Animation on scroll

  AOS.init({
    once: true,
  });



  // C-Slider


  if ($(".c-slider")[0]) {
    $('.c-slider').slick({

      slidesToShow: 1,

      slidesToScroll: 1,

      arrows: false,

      dots: false,

      draggable: false,

      waitForAnimate: true,

      lazyLoad: 'ondemand',

      fade: false,

      speed: 30000

    });
  }




  // C-Slider

  $('.next-slide').on('click', function () {

    var img_src = "";

    $('.next-slide.nav-active').removeClass('nav-active');

    $(this).addClass('nav-active');

    img_src = $(this).html();

    $('.slider-main-img').html(img_src);



    var slideno = $(this).data('slide');

    $('.c-slider').slick('slickGoTo', slideno - 1, true);

  });

  // pd-gallery
  $('.li-pd-imgs').on('click', function () {

    var img_src = "";

    $('.li-pd-imgs.nav-active').removeClass('nav-active');

    $(this).addClass('nav-active');

    img_src = $(this).find('img').attr('src');

    $('#NZoomContainer').children('img').attr('src', img_src);

  });



  // Loader Start

  let settings = {
    progressSize: 320,
    progressColor: '#ffffff',
    lineWidth: 2,
    lineCap: 'round',
    preloaderAnimationDuration: 800,
    startDegree: -90,
    finalDegree: 270
  }

  function setAttributes(elem, attrs) {

    for (let key in attrs) {
      elem.setAttribute(key, attrs[key]);
    }

  }

  let preloader = document.createElement('div'),
    canvas = document.createElement('canvas'),
    size;

  (function () {

    let width = window.innerWidth,
      height = window.innerHeight;

    if (width > height) {

      size = Math.min(settings.progressSize, height / 2);

    } else {

      size = Math.min(settings.progressSize, width - 50);

    }

  })();

  setAttributes(preloader, {
    class: "preloader",
    id: 'preloader',
    style: 'transition: opacity ' + settings.preloaderAnimationDuration / 1000 + 's'
  });
  setAttributes(canvas, {
    class: 'progress-bar',
    id: 'progress-bar',
    width: settings.progressSize,
    height: settings.progressSize
  });


  preloader = document.getElementById('preloader');

  if (preloader) {
    let progressBar = document.getElementById('progress-bar'),
      images = document.images,
      imagesAmount = images.length,
      imagesLoaded = 0,
      circleCenterX = 0,
      circleCenterY = 0,
      circleRadius = 0,
      barCtx = null;

    if (progressBar) {
      barCtx = progressBar.getContext('2d');
      circleCenterX = progressBar.width / 2;
      circleCenterY = progressBar.height / 2;
      circleRadius = circleCenterX - settings.lineWidth;
    }

    let degreesPerPercent = 3.6,
      currentProgress = 0,
      showedProgress = 0,
      progressStep = 0,
      progressDelta = 0,
      startTime = null,
      running;

    (function () {
      return window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (callback) {
          setTimeout(callback, 1000 / 60);
        };
    })();

    Math.radians = function (degrees) {
      return degrees * Math.PI / 180;
    };

    if (progressBar) {
      progressBar.style.opacity = settings.progressOpacity;
    }

    if (barCtx) {
      barCtx.strokeStyle = settings.progressColor;
      barCtx.lineWidth = settings.lineWidth;
      barCtx.lineCap = settings.lineCap;
    }

    let angleMultiplier = (Math.abs(settings.startDegree) + Math.abs(settings.finalDegree)) / 360;
    let startAngle = Math.radians(settings.startDegree);
    document.body.style.overflowY = 'hidden';
    preloader.style.backgroundColor = settings.preloaderBackground;

    for (let i = 0; i < imagesAmount; i++) {
      let imageClone = new Image();
      imageClone.onload = onImageLoad;
      imageClone.onerror = onImageLoad;
      imageClone.src = images[i].src;
    }

    function onImageLoad() {
      if (running === true) running = false;
      imagesLoaded++;
      if (imagesLoaded >= imagesAmount) hidePreloader();
      progressStep = showedProgress;
      currentProgress = ((100 / imagesAmount) * imagesLoaded) << 0;
      progressDelta = currentProgress - showedProgress;
      setTimeout(function () {
        if (startTime === null) startTime = performance.now();
        running = true;
        animate();
      }, 10);
    }

    function animate() {
      if (running === false) {
        startTime = null;
        return;
      }
      let timeDelta = Math.min(1, (performance.now() - startTime) / settings.preloaderAnimationDuration);
      showedProgress = progressStep + (progressDelta * timeDelta);

      if (timeDelta <= 1) {
        if (barCtx && progressBar) {
          barCtx.clearRect(0, 0, progressBar.width, progressBar.height);
          barCtx.beginPath();
          barCtx.arc(circleCenterX, circleCenterY, circleRadius, startAngle, (Math.radians(showedProgress * degreesPerPercent) * angleMultiplier) + startAngle);
          barCtx.stroke();
        }
        requestAnimationFrame(animate);
      } else {
        startTime = null;
      }
    }

    function hidePreloader() {
      setTimeout(function () {
        $("body").addClass("page-loaded");
        document.body.style.overflowY = '';
      }, settings.preloaderAnimationDuration + 100);
    }
  }
  var resizeTimer;


  // Loader End



  // Cart Popup Start

  $('.pr-cart').on('click', function () {

    $('.cart-popup').toggleClass('show-cart');

  });

  // Cart Popup End







  // // Scroll Top

  window.onscroll = function () {
    var num = window.pageYOffset;
    var scrollTop = document.querySelector('#scrollTop');
    if (scrollTop) {
      if (num >= 160) {
        scrollTop.classList.add('active');
      } else {
        scrollTop.classList.remove('active');
      }
    }
  }

  // // Just add #scrollTop to the footer

  var scrollTopBtn = document.querySelector('#scrollTop');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    });
  }

});

// Donation Amount Select On Click Start

$('.donating').on('click', function () {
  var empty = "";
  $('.donated_amount').attr("placeholder", empty);
  var donation_amount = $(this).children('span').text();
  $('.donated_amount').attr("placeholder", donation_amount);
});

// Donation Amount Select On Click End



// Sermon Media Start

$('.s_video').on('click', function () {
  $(this).closest('.sermon-img').removeClass('audio');
  $(this).closest('.sermon-img').addClass('video')
});

$('.s_audio').on('click', function () {
  $(this).closest('.sermon-img').removeClass('video');
  $(this).closest('.sermon-img').addClass('audio')
});


$('.s_video2').on('click', function () {
  $('.sermon-img').removeClass('audio');
  $('.sermon-img').addClass('video')
});

$('.s_audio2').on('click', function () {
  $('.sermon-img').removeClass('video');
  $('.sermon-img').addClass('audio')
});



$('.s_pdf').on('click', function () {

  $(this).attr({ target: '_blank', href: 'assets/randomfile.pdf' });

});

$('.s_music').on('click', function () {

  $(this).attr({ target: '_blank', href: 'assets/music/hey.mp3' });

});

// get help from here https://www.geeksforgeeks.org/how-to-download-file-using-javascript-jquery/

// Sermon Media End


$(document).ready(function () {

  // Header



  var new_scroll_position = 0;

  var last_scroll_position;

  var header = document.getElementById("stickyHeader");



  window.addEventListener('scroll', function (e) {
    last_scroll_position = window.scrollY;
    if (header) {
      // Scrolling down
      if (new_scroll_position < last_scroll_position && last_scroll_position > 100) {
        header.classList.remove("slideDown");
        header.classList.add("slideUp");
      } else if (last_scroll_position < 100) {
        header.classList.remove("slideDown");
      } else if (new_scroll_position > last_scroll_position) {
        header.classList.remove("slideUp");
        header.classList.add("slideDown");
      }
    }
    new_scroll_position = last_scroll_position;
  });

  // Responsive header menu
  $('.mobile-nav .menu-item-has-children').on('click', function (e) {
    // If we clicked on the <a> tag itself and it's not the arrow area, 
    // we let it toggle. If we clicked on the arrow (the :before pseudo area is on the li),
    // we also toggle.

    var $this = $(this);
    var $siblings = $this.siblings('.menu-item-has-children');

    // Close all other open menus
    $siblings.removeClass('active');

    // Toggle this menu
    $this.toggleClass('active');

    // Stop propagation if we are clicking the trigger area
    if ($(e.target).is('a') || $(e.target).is('li')) {
      // If it has children, don't navigate immediately if it's just a toggle
      // but if the user clicked the text and it has a real link, they might expect navigation.
      // However, usually in these templates, the parent link just toggles.
      e.stopPropagation();
    }
  });



  $('#nav-icon4').click(function () {

    $(this).toggleClass('open');

    $('#mobile-nav').toggleClass('open');

  });



  $('#res-cross').click(function () {

    $('#mobile-nav').removeClass('open');

    $('#nav-icon4').removeClass('open')

  });



});


// Audio Player Start

if ($(".audio-player")[0]) {

  function createTrackItem(index, name, duration) {

    var trackItem = document.createElement('div');

    trackItem.setAttribute("class", "playlist-track-ctn");

    trackItem.setAttribute("id", "ptc-" + index);

    trackItem.setAttribute("data-index", index);

    document.querySelector(".playlist-ctn").appendChild(trackItem);



    var playBtnItem = document.createElement('div');

    playBtnItem.setAttribute("class", "playlist-btn-play");

    playBtnItem.setAttribute("id", "pbp-" + index);

    document.querySelector("#ptc-" + index).appendChild(playBtnItem);



    var btnImg = document.createElement('i');

    btnImg.setAttribute("class", "fas fa-play");

    btnImg.setAttribute("height", "40");

    btnImg.setAttribute("width", "40");

    btnImg.setAttribute("id", "p-img-" + index);

    document.querySelector("#pbp-" + index).appendChild(btnImg);



    var trackInfoItem = document.createElement('div');

    trackInfoItem.setAttribute("class", "playlist-info-track");

    trackInfoItem.innerHTML = name

    document.querySelector("#ptc-" + index).appendChild(trackInfoItem);



    var trackDurationItem = document.createElement('div');

    trackDurationItem.setAttribute("class", "playlist-duration");

    trackDurationItem.innerHTML = duration

    document.querySelector("#ptc-" + index).appendChild(trackDurationItem);

  }



  var listAudio = [];





  for (var i = 0; i < listAudio.length; i++) {

    createTrackItem(i, listAudio[i].name, listAudio[i].duration);

  }

  var indexAudio = 0;
  this.indexAudio = 0; // Initialize for shared context



  function loadNewTrack(index) {
    var audioData = listAudio[index];
    if (!audioData) return;

    var playerSource = document.querySelector('#source-audio');
    if (playerSource) playerSource.src = audioData.file;

    var titleEle = document.querySelector('.title');
    if (titleEle) titleEle.innerHTML = audioData.name;

    this.currentAudio = document.getElementById("myAudio");
    if (this.currentAudio) {
      this.currentAudio.load();
      this.toggleAudio();
    }

    this.updateStylePlaylist(this.indexAudio, index)
    this.indexAudio = index;
  }



  var playListItems = document.querySelectorAll(".playlist-track-ctn");



  for (let i = 0; i < playListItems.length; i++) {

    playListItems[i].addEventListener("click", getClickedElement.bind(this));

  }



  function getClickedElement(event) {

    for (let i = 0; i < playListItems.length; i++) {

      if (playListItems[i] == event.target) {

        var clickedIndex = event.target.getAttribute("data-index")

        if (clickedIndex == this.indexAudio) { // alert('Same audio');

          this.toggleAudio()

        } else {

          loadNewTrack(clickedIndex);

        }

      }

    }

  }



  if (listAudio.length > 0 && listAudio[indexAudio]) {
    var initialSource = document.querySelector('#source-audio');
    if (initialSource) initialSource.src = listAudio[indexAudio].file;

    var initialTitle = document.querySelector('.title');
    if (initialTitle) initialTitle.innerHTML = listAudio[indexAudio].name;
  }

  var currentAudio = document.getElementById("myAudio");

  if (currentAudio) {
    currentAudio.load();
    currentAudio.onloadedmetadata = function () {
      var durationEle = document.getElementsByClassName('duration')[0];
      if (durationEle && currentAudio.duration) {
        durationEle.innerHTML = getMinutes(currentAudio.duration);
      }
    };
  }



  var interval1;



  function toggleAudio() {
    if (!this.currentAudio) return;

    if (this.currentAudio.paused) {
      var iconPlay = document.querySelector('#icon-play');
      var iconPause = document.querySelector('#icon-pause');
      var trackItem = document.querySelector('#ptc-' + this.indexAudio);

      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
      if (trackItem) trackItem.classList.add("active-track");

      this.playToPause(this.indexAudio)
      this.currentAudio.play();
    } else {
      var iconPlay = document.querySelector('#icon-play');
      var iconPause = document.querySelector('#icon-pause');

      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';

      this.pauseToPlay(this.indexAudio)
      this.currentAudio.pause();
    }
  }



  function pauseAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    clearInterval(interval1);
  }



  var timer = document.getElementsByClassName('timer')[0]



  var barProgress = document.getElementById("myBar");





  var width = 0;



  function onTimeUpdate() {
    var t = this.currentAudio.currentTime
    var timer = document.getElementsByClassName('timer')[0];
    if (timer) timer.innerHTML = this.getMinutes(t);
    this.setBarProgress();

    if (this.currentAudio && this.currentAudio.ended) {
      var playIcon = document.querySelector('#icon-play');
      var pauseIcon = document.querySelector('#icon-pause');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';

      this.pauseToPlay(this.indexAudio)

      if (this.indexAudio < listAudio.length - 1) {

        var index = parseInt(this.indexAudio) + 1

        this.loadNewTrack(index)

      }

    }

  }





  function setBarProgress() {
    if (!this.currentAudio || !this.currentAudio.duration) return;
    var progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
    var bar = document.getElementById("myBar");
    if (bar) bar.style.width = progress + "%";
  }





  function getMinutes(t) {

    var min = parseInt(parseInt(t) / 60);

    var sec = parseInt(t % 60);

    if (sec < 10) {

      sec = "0" + sec

    }

    if (min < 10) {

      min = "0" + min

    }

    return min + ":" + sec

  }



  var progressbar = document.querySelector('#myProgress');
  if (progressbar) {
    progressbar.addEventListener("click", seek.bind(this));
  }





  function seek(event) {
    if (!this.currentAudio || !progressbar) return;
    var percent = event.offsetX / progressbar.offsetWidth;
    this.currentAudio.currentTime = percent * this.currentAudio.duration;
    if (barProgress) barProgress.style.width = percent * 100 + "%";
  }



  function forward() {

    this.currentAudio.currentTime = this.currentAudio.currentTime + 5

    this.setBarProgress();

  }



  function rewind() {

    this.currentAudio.currentTime = this.currentAudio.currentTime - 5

    this.setBarProgress();

  }





  function next() {

    if (this.indexAudio < listAudio.length - 1) {

      var oldIndex = this.indexAudio

      this.indexAudio++;

      updateStylePlaylist(oldIndex, this.indexAudio)

      this.loadNewTrack(this.indexAudio);

    }

  }



  function previous() {

    if (this.indexAudio > 0) {

      var oldIndex = this.indexAudio

      this.indexAudio--;

      updateStylePlaylist(oldIndex, this.indexAudio)

      this.loadNewTrack(this.indexAudio);

    }

  }



  function updateStylePlaylist(oldIndex, newIndex) {
    var oldTrack = document.querySelector('#ptc-' + oldIndex);
    var newTrack = document.querySelector('#ptc-' + newIndex);

    if (oldTrack) oldTrack.classList.remove("active-track");
    this.pauseToPlay(oldIndex);
    if (newTrack) newTrack.classList.add("active-track");
    this.playToPause(newIndex);
  }



  function playToPause(index) {
    var ele = document.querySelector('#p-img-' + index);
    if (ele) {
      ele.classList.remove("fa-play");
      ele.classList.add("fa-pause");
    }
  }

  function pauseToPlay(index) {
    var ele = document.querySelector('#p-img-' + index);
    if (ele) {
      ele.classList.remove("fa-pause");
      ele.classList.add("fa-play");
    }
  }





  function toggleMute() {

    var btnMute = document.querySelector('#toggleMute');

    var volUp = document.querySelector('#icon-vol-up');

    var volMute = document.querySelector('#icon-vol-mute');

    if (this.currentAudio.muted == false) {

      this.currentAudio.muted = true

      volUp.style.display = "none"

      volMute.style.display = "block"

    } else {

      this.currentAudio.muted = false

      volMute.style.display = "none"

      volUp.style.display = "block"

    }

  }

}

// Audio Player End

// document.addEventListener('contextmenu', function(e) {
//      e.preventDefault();
//    });
//    document.onkeydown = function (e) {
//      if (e.keyCode == 123) {
//          return false;
//      }
//      if (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'i'.charCodeAt(0))) {
//          return false;
//      }

//      if (e.ctrlKey && e.shiftKey && (e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'c'.charCodeAt(0))) {
//          return false;
//      }
//      if (e.ctrlKey && e.shiftKey && (e.keyCode == 'J'.charCodeAt(0) || e.keyCode == 'j'.charCodeAt(0))) {
//          return false;
//      }
//      if (e.ctrlKey && (e.keyCode == 'U'.charCodeAt(0) || e.keyCode == 'u'.charCodeAt(0))) {
//          return false;
//      }
//      if (e.ctrlKey && (e.keyCode == 'S'.charCodeAt(0) || e.keyCode == 's'.charCodeAt(0))) {
//          return false;
//      }
//  }