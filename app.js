(function(){
  "use strict";

  var screens = {
    splash: document.getElementById('screen-splash'),
    onboard: document.getElementById('screen-onboard'),
    end: document.getElementById('screen-end')
  };

  function goTo(name){
    var current = document.querySelector('.screen.active');
    var next = screens[name];
    if(!next || next === current) return;

    if(current){
      current.classList.add('fade-out');
      current.addEventListener('animationend', function handler(){
        current.classList.remove('active','fade-out');
        current.removeEventListener('animationend', handler);
      });
    }
    next.classList.add('active','fade-in');
    next.addEventListener('animationend', function handler(){
      next.classList.remove('fade-in');
      next.removeEventListener('animationend', handler);
    });
  }

  // ---------- Splash ----------
  var splashTap = document.getElementById('splash-tap');
  var splashDone = false;
  function leaveSplash(){
    if(splashDone) return;
    splashDone = true;
    goTo('onboard');
  }
  splashTap.addEventListener('click', leaveSplash);
  // Only advances on tap now — no auto-timer.

  // ---------- Onboarding carousel ----------
  var track = document.getElementById('carousel-track');
  var viewport = document.getElementById('carousel-viewport');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var welcomeBtn = document.getElementById('welcome-btn');
  var slideCount = 3;
  var index = 0;

  var dotsRow = document.getElementById('dots');

  function render(){
    track.style.transform = 'translateX(' + (-index * (100/slideCount)) + '%)';
    dots.forEach(function(d,i){ d.classList.toggle('active', i === index); });
    // Slide 2 (index 2) is the real exported image — its dots are already baked
    // into the artwork, so hide the live dot row to avoid showing two sets.
    dotsRow.style.visibility = (index === 2) ? 'hidden' : 'visible';
    // Button label: "Next" on slides 1-2, "Welcome" on the last slide (unchanged).
    welcomeBtn.textContent = (index === slideCount - 1) ? 'Welcome' : 'Next';
  }

  function setIndex(i){
    index = Math.max(0, Math.min(slideCount - 1, i));
    render();
  }

  dots.forEach(function(dot, i){
    dot.addEventListener('click', function(){ setIndex(i); });
  });

  welcomeBtn.addEventListener('click', function(){
    if(index < slideCount - 1){
      setIndex(index + 1);
    } else {
      goTo('end');
    }
  });

  // Swipe / drag support for the middle carousel only
  var startX = 0, deltaX = 0, dragging = false;

  function onStart(x){
    dragging = true;
    startX = x;
    deltaX = 0;
    track.style.transition = 'none';
  }
  function onMove(x){
    if(!dragging) return;
    deltaX = x - startX;
    var base = -index * (100/slideCount);
    var pct = base + (deltaX / viewport.offsetWidth) * (100/slideCount);
    track.style.transform = 'translateX(' + pct + '%)';
  }
  function onEnd(){
    if(!dragging) return;
    dragging = false;
    track.style.transition = '';
    var threshold = viewport.offsetWidth * 0.18;
    if(deltaX < -threshold && index < slideCount - 1){
      index += 1;
    } else if(deltaX > threshold && index > 0){
      index -= 1;
    }
    render();
  }

  viewport.addEventListener('touchstart', function(e){ onStart(e.touches[0].clientX); }, {passive:true});
  viewport.addEventListener('touchmove', function(e){ onMove(e.touches[0].clientX); }, {passive:true});
  viewport.addEventListener('touchend', onEnd);

  viewport.addEventListener('mousedown', function(e){ onStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', function(e){ onMove(e.clientX); });
  window.addEventListener('mouseup', onEnd);

  // ---------- End screen ----------
  document.getElementById('restart-btn').addEventListener('click', function(){
    splashDone = false;
    setIndex(0);
    goTo('splash');
  });

  render();
})();
