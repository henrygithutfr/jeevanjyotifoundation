// Mobile menu toggle
const mobileHamburger = document.querySelector('.mobile-hamburger');
const navLists = document.querySelector('.navlists');
const closeIcon = document.getElementById('closeIcon');
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

mobileHamburger.addEventListener('click', () => {
  navLists.classList.toggle('active');
  mobileHamburger.classList.toggle('active');
  overlay.classList.toggle('active');
});

// Close mobile menu when clicking on overlay
overlay.addEventListener('click', () => {
  navLists.classList.remove('active');
  mobileHamburger.classList.remove('active');
  overlay.classList.remove('active');
});

// Dropdown toggle for mobile
const dropdownParents = document.querySelectorAll('.dropdown-parent');

dropdownParents.forEach(parent => {
  const dropdownLink = parent.querySelector('a');
  const dropdownToggle = parent.querySelector('.dropdown-toggle');
  const dropdown = parent.querySelector('.dropdown');

  // Click on dropdown icon toggles the dropdown
  dropdownToggle.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('active');
      dropdownToggle.classList.toggle('active');

      // Close other dropdowns
      dropdownParents.forEach(otherParent => {
        if (otherParent !== parent) {
          otherParent.querySelector('.dropdown').classList.remove('active');
          otherParent.querySelector('.dropdown-toggle').classList.remove('active');
        }
      });
    }
  });

  // Click on "About" text goes to the page (not on mobile)
  dropdownLink.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
      // If clicking the text (not the icon), go to the page
      if (e.target.tagName === 'SPAN') {
        // Allow normal navigation
        return;
      }

      // If clicking the link but not the icon, go to the page
      if (e.target === dropdownLink && !dropdownToggle.contains(e.target)) {
        // Allow normal navigation
        return;
      }

      // Otherwise, prevent default for icon clicks
      if (dropdownToggle.contains(e.target)) {
        e.preventDefault();
      }
    }
  });
});

// Close dropdowns when clicking outside on desktop
document.addEventListener('click', (e) => {
  if (window.innerWidth > 992) {
    if (!e.target.closest('.dropdown-parent')) {
      document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(10px)';
      });
    }
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