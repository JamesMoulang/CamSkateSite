const hamburger = document.querySelector(".hamburger-menu");
const navOverlay = document.querySelector(".nav-overlay");
const closeBtn = document.querySelector(".close-btn");

hamburger.addEventListener("click", () => {
  navOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
});

closeBtn.addEventListener("click", () => {
  navOverlay.classList.remove("open");
  document.body.style.overflow = "";
});

// Close menu when clicking on a link
navOverlay.querySelectorAll("a:not(.close-btn)").forEach((link) => {
  link.addEventListener("click", () => {
    navOverlay.classList.remove("open");
    document.body.style.overflow = "";
  });
});

function enableCarouselButtons(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Carousel container with id '${containerId}' not found.`);
    return;
  }

  const carousel = container.querySelector(".carousel, .schedule-capsules");
  const prevBtn = container.querySelector(".prev");
  const nextBtn = container.querySelector(".next");

  if (!carousel || !prevBtn || !nextBtn) {
    console.error(
      `Carousel elements not found inside container '${containerId}'.`,
    );
    return;
  }

  nextBtn.addEventListener("click", () => {
    const itemWidth = carousel.querySelector(
      ".carousel-item, .day-capsule",
    ).offsetWidth;
    carousel.scrollBy({ left: itemWidth + 20, behavior: "smooth" }); // Scroll by width of item + margin
  });

  prevBtn.addEventListener("click", () => {
    const itemWidth = carousel.querySelector(
      ".carousel-item, .day-capsule",
    ).offsetWidth;
    carousel.scrollBy({ left: -(itemWidth + 20), behavior: "smooth" }); // Scroll by width of item + margin
  });
}

document.addEventListener("DOMContentLoaded", () => {
  let slideIndex = 0;
  const slides = document.querySelector(".new-here-carousel");
  const dots = document.querySelectorAll(".new-here-dot");

  // Initially, no slides or dots mean no carousel
  if (!slides || !dots || dots.length === 0) return;

  function showSlides() {
    // Loop back to the first slide
    if (slideIndex >= slides.children.length) {
      slideIndex = 0;
    }

    // Move the carousel
    slides.style.transform = `translateX(${-slideIndex * 100}%)`;

    // Update dot activity
    dots.forEach((dot) => dot.classList.remove("active"));
    dots[slideIndex].classList.add("active");
  }

  function nextSlide() {
    slideIndex++;
    showSlides();
  }

  // Set auto-advance timer
  let slideInterval = setInterval(nextSlide, 5000);

  // Clicking dots will also reset the timer
  dots.forEach((dot, index) => {
    dot.onclick = function () {
      slideIndex = index;
      showSlides();
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    };
  });

  // Initial call
  showSlides();
});
