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

const SESSION_CONFIG = {
  "beginners session": {
    links: [{ href: "/sessions#beginner_sessions", text: "More info" }],
    color: "#4CAF50",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: ["img/beginners.jpg"],
    altTitles: ["beginners evening"],
  },
  closed: {
    links: [{ href: "/sessions#beginner_sessions", text: "" }],
    color: "#9E9E9E",
    disciplines: [],
    images: ["img/advanced.jpg"],
  },
  "girl skate night": {
    links: [{ href: "/sessions#girl_skate_night", text: "More info" }],
    color: "#E91E63",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: ["img/girl_skate_night.jpg"],
  },
  "queer skate night": {
    links: [{ href: "/sessions#queer_skate_night", text: "More info" }],
    color: "#673AB7",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: ["img/q&b 3.jpeg"],
  },
  "30+ (beginners)": {
    links: [{ href: "/sessions#pipe_and_slippers", text: "More info" }],
    color: "#795548",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: ["img/pipe_and_slippers.jpg"],
  },
  "30+ (all abilities)": {
    links: [{ href: "/sessions#pipe_and_slippers", text: "More info" }],
    color: "#795548",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: ["img/pipe_and_slippers.jpg"],
  },
  "quads and blades": {
    links: [{ href: "/sessions#quads_and_blades", text: "More info" }],
    color: "#9C27B0",
    disciplines: ["🛼 Roller"],
    images: ["img/q&b 1.jpeg", "img/q&b 2.jpeg", "img/q&b 3.jpeg"],
    altTitles: ["quads & blades"],
  },
  "open session": {
    links: [
      { href: "/sessions", text: "View this week's open sessions" },
      { href: "/visit", text: "How to visit" },
    ],
    color: "#2196F3",
    disciplines: ["🛹 Skateboard", "🛼 Roller"],
    images: [
      "img/advanced.jpg",
      "img/open session 1.jpg",
      "img/open session 2.jpg",
    ],
    altTitles: ["☕ open session"],
  },
  "after school club": {
    links: [{ href: "/coaching", text: "Book coaching" }],
    color: "#FFC107",
    disciplines: ["🛹 Skateboard"],
    images: ["img/after_school.jpeg"],
  },
  "after school scooter club": {
    links: [{ href: "/coaching/scooter/", text: "More info" }],
    color: "#607D8B",
    disciplines: ["🛴 Scooter"],
    images: [
      "img/scooter 1.jpg",
      "img/scooter 2.jpg",
      "img/scooter 3.jpg",
      "img/scooter 4.jpg",
      "img/scooter 5.jpg",
      "img/scooter 6.jpg",
    ],
  },
  "after work club": {
    links: [{ href: "/coaching", text: "Book coaching" }],
    color: "#FFC107",
    disciplines: ["🛹 Skateboard"],
    images: ["img/reception group.png"],
  },
  "scooter session": {
    links: [{ href: "/sessions#scooter_session", text: "More info" }],
    color: "#607D8B",
    disciplines: ["🛴 Scooter"],
    images: [
      "img/scooter 1.jpg",
      "img/scooter 2.jpg",
      "img/scooter 3.jpg",
      "img/scooter 4.jpg",
      "img/scooter 5.jpg",
      "img/scooter 6.jpg",
    ],
    altTitles: ["scooters only"],
  },
  "under 10s": {
    links: [],
    color: "#FF9800",
    disciplines: ["all wheels welcome"],
    images: ["img/junior jam 2.png"],
    altTitles: ["☕ under 10s"],
  },
  "surf skate session": {
    links: [],
    color: "#009688",
    disciplines: [],
    images: ["img/surf_skate.jpg"],
  },
  "christmas party": {
    links: [],
    color: "#9E9E9E",
    disciplines: [],
    images: ["img/xmas jam poster minimal.jpg"],
  },
  default: {
    links: [{ href: "/sessions", text: "More info" }],
    color: "#9E9E9E",
    disciplines: [],
    images: ["img/advanced.jpg"],
  },
};
