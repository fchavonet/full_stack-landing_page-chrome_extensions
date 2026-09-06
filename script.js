/************
* VARIABLES *
************/

let extensions = [];

let activeExtensionIndex = 0;
let activeSlideIndex = 0;

const extensionTabs = document.getElementById("extension-tabs");
const extensionDescription = document.getElementById("extension-description");

const carousel = document.getElementById("carousel");
const previousSlideButton = document.getElementById("previous-slide");
const nextSlideButton = document.getElementById("next-slide");
const carouselIndicator = document.getElementById("carousel-indicator");

const chromeWebStoreLink = document.getElementById("chrome-web-store-link");
const githubLink = document.getElementById("github-link");

// Load data
async function loadExtensions() {
  const response = await fetch("./extensions.json");

  if (!response.ok) {
    throw new Error(
      "Unable to load \"extensions.json\"."
    );
  }

  extensions = await response.json();

  renderExtensionTabs();
  renderExtension();
}

// Get active extension
function getActiveExtension() {
  return extensions[activeExtensionIndex];
}


/*****************
* EXTENSION TABS *
*****************/

function renderExtensionTabs() {
  extensionTabs.innerHTML = "";

  for (let i = 0; i < extensions.length; i++) {
    const extension = extensions[i];

    const button = document.createElement("button");

    button.type = "button";
    button.role = "tab";
    button.dataset.extensionIndex = i;
    button.className = "extension-tab tab h-10 px-4 flex flex-row justify-center items-center gap-1.5 text-base font-bold rounded-xl";

    if (extension.splitName) {
      const firstPart = document.createElement("span");
      firstPart.textContent = extension.splitName[0];

      const secondPart = document.createElement("span");
      secondPart.textContent = extension.splitName[1];

      const icon = document.createElement("img");
      icon.src = extension.icon;
      icon.alt = "";
      icon.className = "w-4 h-4";

      button.appendChild(firstPart);
      button.appendChild(icon);
      button.appendChild(secondPart);
    } else {
      const label = document.createElement("span");
      label.textContent = extension.name;

      const icon = document.createElement("img");
      icon.src = extension.icon;
      icon.alt = "";
      icon.className = "w-4 h-4";

      button.appendChild(icon);
      button.appendChild(label);
    }

    button.addEventListener("click", function () {
      activeExtensionIndex = i;
      activeSlideIndex = 0;

      renderExtension();
    });

    extensionTabs.appendChild(button);
  }
}

function renderActiveTab() {
  const tabs = document.querySelectorAll(".extension-tab");

  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("tab-active");

    tabs[i].setAttribute(
      "aria-selected",
      "false"
    );

    if (i === activeExtensionIndex) {
      tabs[i].classList.add("tab-active");

      tabs[i].setAttribute(
        "aria-selected",
        "true"
      );
    }
  }
}


/***********
* CAROUSEL *
***********/

function renderCarousel() {
  const extension = getActiveExtension();

  carousel.innerHTML = "";
  carouselIndicator.innerHTML = "";

  for (let i = 0; i < extension.screenshots.length; i++) {
    const slide = document.createElement("div");
    slide.className = "carousel-item w-full h-full shrink-0";

    const image = document.createElement("img");
    image.src = extension.screenshots[i];
    image.alt = extension.name + " promotional screenshot " + (i + 1);
    image.className = "w-full h-full object-cover";

    slide.appendChild(image);
    carousel.appendChild(slide);
  }

  renderCarouselPosition();
  buildCarouselIndicator();
  renderCarouselControls();
}


// Update carousel position
function renderCarouselPosition() {
  const slideWidth = carousel.clientWidth;

  carousel.scrollTo({
    left: slideWidth * activeSlideIndex,
    behavior: "smooth"
  });
}


// Build carousel indicator
function buildCarouselIndicator() {
  const extension = getActiveExtension();

  carouselIndicator.innerHTML = "";

  const track = document.createElement("div");
  track.id = "carousel-indicator-track";
  track.className = "relative flex flex-row items-center gap-2";

  for (let i = 0; i < extension.screenshots.length; i++) {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "relative w-5 h-2 flex shrink-0 items-center justify-center";
    slot.setAttribute(
      "aria-label",
      "Show screenshot " + (i + 1)
    );

    const dot = document.createElement("span");
    dot.className = "block w-2 h-2 rounded-full bg-base-content opacity-25 cursor-pointer";
    slot.appendChild(dot);
    slot.addEventListener("click", function () {
      activeSlideIndex = i;

      renderCarouselPosition();
      updateCarouselIndicator();
    });

    track.appendChild(slot);
  }

  const activeIndicator = document.createElement("span");
  activeIndicator.id = "carousel-active-indicator";
  activeIndicator.className = "absolute z-10 left-0 top-0 w-5 h-2 rounded-full bg-base-content transition-transform duration-300 ease-out pointer-events-none";

  track.appendChild(activeIndicator);

  carouselIndicator.appendChild(track);

  updateCarouselIndicator();
}

// Update carousel indicator position
function updateCarouselIndicator() {
  const activeIndicator = document.getElementById("carousel-active-indicator");

  if (!activeIndicator) {
    return;
  }

  const slotWidth = 20;
  const gap = 8;
  const offset = activeSlideIndex * (slotWidth + gap);

  activeIndicator.style.transform = "translateX(" + offset + "px)";
}

// Show or hide carousel controls
function renderCarouselControls() {
  const extension = getActiveExtension();

  if (extension.screenshots.length > 1) {
    previousSlideButton.classList.remove("hidden");
    nextSlideButton.classList.remove("hidden");
  } else {
    previousSlideButton.classList.add("hidden");
    nextSlideButton.classList.add("hidden");
  }
}

// Show previous slide
function previousSlide() {
  const extension = getActiveExtension();

  activeSlideIndex--;

  if (activeSlideIndex < 0) {
    activeSlideIndex = extension.screenshots.length - 1;
  }

  renderCarouselPosition();
  updateCarouselIndicator();
}

// Show next slide
function nextSlide() {
  const extension = getActiveExtension();

  activeSlideIndex++;

  if (activeSlideIndex >= extension.screenshots.length) {
    activeSlideIndex = 0;
  }

  renderCarouselPosition();
  updateCarouselIndicator();
}

// Carousel controls events
previousSlideButton.addEventListener("click", previousSlide);
nextSlideButton.addEventListener("click", nextSlide);


/*************************
* EXTENSION LINKS RENDER *
*************************/

function renderLinks() {
  const extension = getActiveExtension();

  if (extension.chromeWebStore === "") {
    chromeWebStoreLink.classList.add("btn-disabled", "opacity-40");
    chromeWebStoreLink.setAttribute("aria-disabled", "true");
    chromeWebStoreLink.removeAttribute("href");
  } else {
    chromeWebStoreLink.classList.remove("btn-disabled", "opacity-40");
    chromeWebStoreLink.removeAttribute("aria-disabled");
    chromeWebStoreLink.href = extension.chromeWebStore;
  }

  if (extension.github === "") {
    githubLink.classList.add("btn-disabled", "opacity-40");
    githubLink.setAttribute("aria-disabled", "true");
    githubLink.removeAttribute("href");
  } else {
    githubLink.classList.remove("btn-disabled", "opacity-40");
    githubLink.removeAttribute("aria-disabled");
    githubLink.href = extension.github;
  }
}


/*******************
* EXTENSION RENDER *
*******************/

function renderExtension() {
  const extension = getActiveExtension();

  extensionDescription.textContent = extension.description;

  document.documentElement.style.setProperty("--wave-color", extension.color);

  renderActiveTab();
  renderCarousel();
  renderLinks();
}


/*****************
* INITIALIZATION *
*****************/

loadExtensions().catch(
  function (error) {
    console.error(error);
    extensionDescription.textContent = "Unable to load extension data.";
  }
);


/**************
* FOOTER DATE *
**************/

const date = document.getElementById("date");

date.textContent = new Date().getFullYear();
