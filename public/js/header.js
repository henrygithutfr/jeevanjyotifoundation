const langBtn = document.getElementById("lang-btn");
const langMenu = document.getElementById("lang-menu");
const currentLang = document.getElementById("current-lang");
const navbar = document.querySelector("nav");

// Nav Drop Shadow 
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Toggle menu
langBtn.addEventListener("click", () => {
  langMenu.classList.toggle("hidden");
});

// Handle language selection
document.querySelectorAll("#lang-menu li").forEach(item => {
  item.addEventListener("click", () => {
    const selectedLang = item.getAttribute("data-lang");
    currentLang.textContent = selectedLang.toUpperCase();
    langMenu.classList.add("hidden");
    translatePage(selectedLang);
  });
});

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
  if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
    langMenu.classList.add("hidden");
  }
});

// Function to change language using Google Translate
function translatePage(lang) {
  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event("change"));
  }
}


// Mobile menu toggle
const mobileHamburger = document.querySelector('.mobile-hamburger');
const navlists = document.querySelector('.navlists');
const overlay = document.querySelector('.overlay');
const dropdown = document.querySelector('.dropdown');
const dropdownParents = document.querySelectorAll('.dropdown-parent');

mobileHamburger.addEventListener('click', function () {
  navlists.classList.toggle('active');
  this.classList.toggle('active');

});

overlay.addEventListener('click', function (e) {
  e.preventDefault();
  dropdown.classList.toggle('hide')
});

// Dropdown toggle for mobile
dropdownParents.forEach(parent => {
  parent.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      this.classList.toggle('active');
    }
  });
});

// Close mobile menu on resize if window becomes larger
window.addEventListener('resize', function () {
  if (window.innerWidth > 768) {
    navlists.classList.remove('active');
    overlay.classList.remove('active');
    mobileHamburger.classList.remove('active');
  }
});

function isTouchDevice() {
  return window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
}

document.querySelectorAll(".navlists li > a").forEach(link => {
  const parentLi = link.closest("li");
  const dropdown = parentLi.querySelector(".dropdown");

  if (dropdown) {
    let firstTap = false;

    link.addEventListener("click", function (e) {
      if (isTouchDevice()) {
        if (!firstTap) {
          e.preventDefault(); // Stop navigation on first tap
          firstTap = true;
          parentLi.classList.add("open");

          // Close dropdown if clicked outside
          const outsideClickHandler = (ev) => {
            if (!parentLi.contains(ev.target)) {
              parentLi.classList.remove("open");
              firstTap = false;
              document.removeEventListener("click", outsideClickHandler);
            }
          };
          document.addEventListener("click", outsideClickHandler);
        } else {
          // Second tap = follow link
          window.location.href = link.href;
        }
      }
      // Desktop users with hover just navigate as usual
    });
  }
});









document.addEventListener('DOMContentLoaded', function () {
  const slidesContainer = document.querySelector('.slides-container');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  let currentSlide = 0;
  const totalSlides = slides.length;
  let slideInterval;

  // Function to reset animation for the active slide
  function resetAnimation(slideIndex) {
    const content = slides[slideIndex].querySelector('.slide-content');
    const bg = slides[slideIndex].querySelector('.slide-bg');

    // Remove and re-add active class to reset animations
    slides[slideIndex].classList.remove('active');
    setTimeout(() => {
      slides[slideIndex].classList.add('active');
    }, 10);
  }

  // Function to update the slider
  function updateSlider(slideIndex, resetAnim = true) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');

    // Move the slides container
    slidesContainer.style.transform = `translateX(-${slideIndex * 25}%)`;

    // Reset animation if requested
    if (resetAnim) {
      resetAnimation(slideIndex);
    }

    // Reset the auto-slide timer
    resetAutoSlide();
  }

  // Next slide function
  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider(currentSlide);
  }

  // Previous slide function
  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider(currentSlide);
  }

  // Reset auto-slide timer
  function resetAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  // Event listeners for navigation buttons
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Event listeners for dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      updateSlider(currentSlide);
    });
  });

  // Start auto slide
  resetAutoSlide();

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
});