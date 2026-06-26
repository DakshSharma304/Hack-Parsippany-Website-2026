const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 5480;

function getViewportWidth() {
  return Math.min(
    ...[
      window.innerWidth,
      window.outerWidth,
      document.documentElement.clientWidth,
      window.visualViewport && window.visualViewport.width,
    ].filter((value) => Number.isFinite(value) && value > 0),
  );
}

function setScale() {
  const scale = Math.min(getViewportWidth() / DESIGN_WIDTH, 1);
  document.documentElement.style.setProperty("--scale", String(scale));
  const shell = document.querySelector(".page-shell");
  if (shell) {
    shell.style.height = `${DESIGN_HEIGHT * scale}px`;
  }
}

setScale();
window.addEventListener("resize", setScale);

function revealSection(section) {
  const items = Array.from(section.querySelectorAll(".reveal"));
  const sectionStagger = Number(section.dataset.revealStagger || 135);
  const baseDelay = section.classList.contains("hero") ? 0 : 140;

  items.forEach((item, index) => {
    const explicitDelay = Number(item.dataset.revealDelay);
    const delay = Number.isFinite(explicitDelay)
      ? explicitDelay
      : baseDelay + index * sectionStagger;

    item.style.transitionDelay = `${Math.min(delay, 2200)}ms`;
    item.classList.add("is-visible");
  });
}

function revealEverything() {
  document.querySelectorAll(".reveal").forEach((item) => {
    item.style.transitionDelay = "0ms";
    item.classList.add("is-visible");
  });
}

function initMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = Array.from(document.querySelectorAll(".section"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEverything();
    return;
  }

  document.documentElement.classList.add("motion-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealSection(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.44,
      rootMargin: "0px 0px -30% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));

  requestAnimationFrame(() => {
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isHero = section.classList.contains("hero");
      const isCurrentViewport =
        rect.top < window.innerHeight * 0.46 && rect.bottom > window.innerHeight * 0.22;

      if (isHero) {
        window.setTimeout(() => revealSection(section), 180);
        observer.unobserve(section);
        return;
      }

      if (isCurrentViewport) {
        revealSection(section);
        observer.unobserve(section);
      }
    });
  });

  window.setTimeout(() => {
    if (!document.querySelector(".hero .reveal.is-visible")) {
      revealEverything();
    }
  }, 1800);
}

try {
  initMotion();
} catch (error) {
  document.documentElement.classList.remove("motion-ready");
  revealEverything();
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    const target = targetId && document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const scale = Math.min(getViewportWidth() / DESIGN_WIDTH, 1);
    window.scrollTo({
      top: target.offsetTop * scale,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  });
});
