// Navbar & Footer Fetch Script
function loadComponent(id, url) {
  const container = document.getElementById(id);
  if (!container) return;

  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      container.innerHTML = data;
      if (id === "navbar-container") updateCartBadge();
    })
    .catch(() => {});
}

document.addEventListener("DOMContentLoaded", function () {
  loadComponent("navbar-container", "/components/navbar.html");
  loadComponent("footer-container", "/components/footer.html");

  // Enhanced Hero Section Slideshow
  const heroSlides = [
    {
      img: "/images/hero1.jpg",
      heading: "Read. Collect. Celebrate Anime.",
      subtext: "Your one-stop manga e-book & merchandise platform",
      btnText: "Explore Manga",
      btnLink: "/E-Books Library.html",
    },
    {
      img: "/images/hero2.jpg",
      heading: "Shop Exclusive Anime Merch!",
      subtext: "Figures, plushies, posters & more. Only for true otakus.",
      btnText: "Shop Now",
      btnLink: "/Product Store.html",
    },
    {
      img: "/images/hero3.jpg",
      heading: "Join the Anime Community",
      subtext: "Events, news, and a vibrant Discord for all fans.",
      btnText: "Join Discord",
      btnLink: "https://discord.com/",
    },
  ];
  let heroIndex = 0;
  const heroSection = document.querySelector(".hero-section");
  const heroTitle = document.getElementById("hero-title");
  const heroSubtext = document.getElementById("hero-subtext");
  const heroBtn = document.getElementById("hero-btn");

  function setHeroSlide(idx) {
    if (heroSection) {
      heroSection.style.backgroundImage = `url('${heroSlides[idx].img}')`;
    }
    if (heroTitle && heroSubtext && heroBtn) {
      // Fade out
      heroTitle.style.opacity = 0;
      heroSubtext.style.opacity = 0;
      heroBtn.style.opacity = 0;
      setTimeout(() => {
        heroTitle.textContent = heroSlides[idx].heading;
        heroSubtext.textContent = heroSlides[idx].subtext;
        heroBtn.textContent = heroSlides[idx].btnText;
        heroBtn.setAttribute("href", heroSlides[idx].btnLink);
        // Fade in
        heroTitle.style.opacity = 1;
        heroSubtext.style.opacity = 1;
        heroBtn.style.opacity = 1;
      }, 350);
    }
  }
  setHeroSlide(heroIndex);
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    setHeroSlide(heroIndex);
  }, 4000);
});

// Update cart badge from localStorage
function updateCartBadge() {
  let count = Number(localStorage.getItem("cartCount"));
  if (!count) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    count = cart.reduce((sum, item) => sum + item.quantity, 0);
  }
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count > 0 ? count : "";
}

// Back to Top Button
const backToTopBtn = document.getElementById("backToTop");
if (backToTopBtn) {
  window.addEventListener("scroll", function () {
    if (window.scrollY > 200) {
      backToTopBtn.style.display = "flex";
    } else {
      backToTopBtn.style.display = "none";
    }
  });
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Enhanced Featured Manga Swap Functionality with Animation
function swapFeaturedManga(mainCard, sideCard) {
  if (mainCard.classList.contains("is-swapping")) return; // Prevent double swap
  mainCard.classList.add("is-swapping", "fade-swap", "fade-out");
  sideCard.classList.add("side-swap-animate");
  setTimeout(() => {
    // Do the swap (same as before)
    const mainImg = mainCard.querySelector(".featured-manga-img-main");
    const mainTitle = mainCard.querySelector(".featured-manga-title-main");
    const mainGenre = mainCard.querySelector(".featured-manga-genre");
    const mainBadge = mainCard.querySelector(".featured-badge");
    const mainBtn = mainCard.querySelector(".js-main-btn");
    const sideImg = sideCard.querySelector(".featured-manga-img-side");
    const sideTitle = sideCard.querySelector(".featured-manga-title-side");
    const sideGenre = sideCard.querySelector(".featured-manga-genre");
    const sideBtn = sideCard.querySelector(".js-side-btn");
    const mainData = {
      img: mainCard.getAttribute("data-img"),
      title: mainCard.getAttribute("data-title"),
      genre: mainCard.getAttribute("data-genre"),
      badge: mainBadge ? mainBadge.textContent : "",
      ranking: mainCard.querySelector(".ranking-badge")?.textContent || "",
      link: mainCard.getAttribute("data-link"),
    };
    const sideData = {
      img: sideCard.getAttribute("data-img"),
      title: sideCard.getAttribute("data-title"),
      genre: sideCard.getAttribute("data-genre"),
      ranking: sideCard.querySelector(".ranking-badge")?.textContent || "",
      link: sideCard.getAttribute("data-link"),
    };
    mainImg.src = sideData.img;
    mainImg.alt = sideData.title;
    sideImg.src = mainData.img;
    sideImg.alt = mainData.title;
    mainTitle.textContent = sideData.title;
    sideTitle.textContent = mainData.title;
    mainGenre.textContent = sideData.genre;
    sideGenre.textContent = mainData.genre;
    mainCard.setAttribute("data-img", sideData.img);
    mainCard.setAttribute("data-title", sideData.title);
    mainCard.setAttribute("data-genre", sideData.genre);
    mainCard.setAttribute("data-link", sideData.link);
    sideCard.setAttribute("data-img", mainData.img);
    sideCard.setAttribute("data-title", mainData.title);
    sideCard.setAttribute("data-genre", mainData.genre);
    sideCard.setAttribute("data-link", mainData.link);
    const mainRank = mainCard.querySelector(".ranking-badge");
    const sideRank = sideCard.querySelector(".ranking-badge");
    if (mainRank && sideRank) {
      const tempRank = mainRank.textContent;
      mainRank.textContent = sideRank.textContent;
      sideRank.textContent = tempRank;
    }
    if (mainBadge) mainBadge.textContent = "Top Rated";
    // Update main button href
    if (mainBtn) mainBtn.setAttribute("href", sideData.link);
    document
      .querySelectorAll(".js-side-btn")
      .forEach((btn) => (btn.style.display = "none"));
    if (mainBtn) mainBtn.style.display = "";
    // Animation: fade-in
    mainCard.classList.remove("fade-out");
    mainCard.classList.add("fade-in");
    setTimeout(() => {
      mainCard.classList.remove("fade-in", "is-swapping");
    }, 220);
    setTimeout(() => {
      sideCard.classList.remove("side-swap-animate");
    }, 220);
  }, 220);
}
// On page load, set main button href to main card's data-link
function resetSideButtons() {
  document
    .querySelectorAll(".js-side-btn")
    .forEach((btn) => (btn.style.display = "none"));
  const mainBtn = document.querySelector(".js-main-btn");
  const mainCard = document.querySelector(".js-featured-main");
  if (mainBtn && mainCard)
    mainBtn.setAttribute("href", mainCard.getAttribute("data-link"));
}
window.addEventListener("DOMContentLoaded", function () {
  const mainCard = document.querySelector(".js-featured-main");
  const sideCards = document.querySelectorAll(".js-featured-side");
  if (!mainCard || !sideCards.length) return;
  mainCard.classList.add("fade-swap");
  resetSideButtons();
  sideCards.forEach((card) => {
    card.addEventListener("click", function () {
      swapFeaturedManga(mainCard, card);
    });
  });
});
