(() => {
  "use strict";

  const panels = [...document.querySelectorAll(".panel")];
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const navTrack = document.getElementById("navTrack");
  const sectionCounter = document.getElementById("sectionCounter");
  const sectionName = document.getElementById("sectionName");
  const progressFill = document.getElementById("progressFill");
  const jumpControls = [...document.querySelectorAll("[data-jump]")];
  const warpFlash = document.getElementById("warpFlash");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d", { alpha: false });
  const skillGalaxy = document.querySelector(".skill-galaxy");
  const skillNodes = skillGalaxy
    ? [...skillGalaxy.querySelectorAll(".skill-node")]
    : [];

  const sectionCount = panels.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sectionLabels = panels.map((panel) => panel.id.toUpperCase());

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let currentIndex = 0;
  let previousScroll = window.scrollY;
  let scrollVelocity = 0;
  let smoothVelocity = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let animationFrameId = null;
  let lastFrameTime = performance.now();
  let lastSectionChange = 0;

  const stars = [];
  const STAR_COUNT_DESKTOP = 820;
  const STAR_COUNT_MOBILE = 420;
  const SPACE_DEPTH = 1450;
  const FULL_ORBIT = Math.PI * 2;

  // Each item has its own ellipse, speed, direction, starting point, and bob.
  // Radii are percentages of the skill-galaxy container, so the motion remains
  // responsive on desktop, tablet, and mobile screens.
  const skillOrbitProfiles = [
    { radiusX: 0.425, radiusY: 0.305, duration: 30000, phase: 0.03, direction: 1, bob: 4.5 },
    { radiusX: 0.425, radiusY: 0.305, duration: 30000, phase: 0.28, direction: 1, bob: 5.5 },
    { radiusX: 0.425, radiusY: 0.305, duration: 30000, phase: 0.53, direction: 1, bob: 4.0 },
    { radiusX: 0.425, radiusY: 0.305, duration: 30000, phase: 0.78, direction: 1, bob: 5.0 },
    { radiusX: 0.315, radiusY: 0.245, duration: 24000, phase: 0.12, direction: -1, bob: 4.0 },
    { radiusX: 0.315, radiusY: 0.245, duration: 24000, phase: 0.45, direction: -1, bob: 5.0 },
    { radiusX: 0.315, radiusY: 0.245, duration: 24000, phase: 0.78, direction: -1, bob: 4.5 },
    { radiusX: 0.205, radiusY: 0.285, duration: 19000, phase: 0.16, direction: 1, bob: 3.5 }
  ];

  function resizeCanvas() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewportWidth * pixelRatio);
    canvas.height = Math.floor(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createStars();
    updateNavigationPosition(true);
    updateExperience();
  }

  function createStars() {
    stars.length = 0;
    const starCount = viewportWidth < 720 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;

    for (let index = 0; index < starCount; index += 1) {
      stars.push(makeStar(true));
    }
  }

  function makeStar(randomDepth = false) {
    return {
      x: (Math.random() - 0.5) * viewportWidth * 2.5,
      y: (Math.random() - 0.5) * viewportHeight * 2.5,
      z: randomDepth ? Math.random() * SPACE_DEPTH + 1 : SPACE_DEPTH,
      previousZ: SPACE_DEPTH,
      brightness: 0.25 + Math.random() * 0.75,
      size: 0.35 + Math.random() * 1.2
    };
  }

  function resetStar(star) {
    const replacement = makeStar(false);
    Object.assign(star, replacement);
  }

  function getJourneyState() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const globalProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    const exactSection = globalProgress * (sectionCount - 1);
    const index = Math.min(sectionCount - 1, Math.max(0, Math.round(exactSection)));

    return { globalProgress, exactSection, index };
  }

  function setPanelState(exactSection, activeIndex) {
    panels.forEach((panel, index) => {
      const distance = index - exactSection;
      const absoluteDistance = Math.abs(distance);
      const opacity = Math.max(0, 1 - absoluteDistance * 1.34);
      const scale = 1 - Math.min(absoluteDistance, 1) * 0.12;
      const blur = Math.min(absoluteDistance * 18, 18);
      const horizontalDrift = distance * -8;

      panel.classList.toggle("is-active", index === activeIndex);
      panel.classList.toggle("is-near", absoluteDistance < 1.15);
      panel.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
      panel.toggleAttribute("inert", index !== activeIndex);
      panel.style.opacity = opacity.toFixed(3);
      panel.style.filter = `blur(${blur.toFixed(2)}px)`;
      panel.style.transform = `translate3d(${horizontalDrift.toFixed(2)}vw, 0, 0) scale(${scale.toFixed(3)})`;
    });
  }

  function updateNavigationPosition(immediate = false) {
    const activeLink = navLinks[currentIndex];
    if (!activeLink || !navTrack) return;

    navLinks.forEach((link, index) => {
      const distance = Math.abs(index - currentIndex);
      const opacity = Math.max(0.14, 1 - distance * 0.2);
      const scale = Math.max(0.8, 1 - distance * 0.05);

      link.classList.toggle("is-active", index === currentIndex);
      if (index === currentIndex) {
        link.setAttribute("aria-current", "page");
        link.style.transform = "";
      } else {
        link.removeAttribute("aria-current");
        link.style.transform = `scale(${scale.toFixed(2)})`;
      }
      link.style.opacity = opacity.toFixed(2);
    });

    const linkCenter = activeLink.offsetLeft + activeLink.offsetWidth / 2;
    const offset = -linkCenter;
    navTrack.style.transition = immediate ? "none" : "transform 650ms cubic-bezier(.2,.8,.2,1)";
    navTrack.style.transform = `translate3d(${offset}px, 0, 0)`;

    if (immediate) {
      requestAnimationFrame(() => {
        navTrack.style.transition = "transform 650ms cubic-bezier(.2,.8,.2,1)";
      });
    }
  }

  function triggerWarpFlash() {
    if (reducedMotion || !warpFlash) return;
    warpFlash.classList.remove("is-flashing");
    void warpFlash.offsetWidth;
    warpFlash.classList.add("is-flashing");
  }

  function updateExperience() {
    const { globalProgress, exactSection, index } = getJourneyState();
    const nextVelocity = window.scrollY - previousScroll;

    previousScroll = window.scrollY;
    scrollVelocity = nextVelocity;
    setPanelState(exactSection, index);

    document.documentElement.style.setProperty("--section-progress", globalProgress.toFixed(4));
    if (progressFill) {
      progressFill.style.transform = `scaleY(${globalProgress.toFixed(4)})`;
    }

    if (index !== currentIndex) {
      currentIndex = index;
      updateNavigationPosition();

      sectionCounter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(sectionCount).padStart(2, "0")}`;
      sectionName.textContent = sectionLabels[currentIndex];

      const now = performance.now();
      if (now - lastSectionChange > 250) {
        triggerWarpFlash();
        lastSectionChange = now;
      }

      const currentPanel = panels[currentIndex];
      if (currentPanel) {
        try {
          history.replaceState(null, "", `#${currentPanel.id}`);
        } catch (error) {
          // Local file previews can restrict history changes; the experience still works.
        }
      }
    }
  }

  function jumpToSection(index) {
    const safeIndex = Math.min(sectionCount - 1, Math.max(0, index));
    const maxScroll = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const target = (safeIndex / (sectionCount - 1)) * maxScroll;

    window.scrollTo({
      top: target,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  function drawStarfield(deltaTime) {
    const centerX = viewportWidth / 2 + mouseX * 34;
    const centerY = viewportHeight / 2 + mouseY * 24;

    smoothVelocity += (Math.abs(scrollVelocity) - smoothVelocity) * 0.085;
    scrollVelocity *= 0.88;

    const baseSpeed = reducedMotion ? 0.35 : 1.45;
    const warpSpeed = Math.min(smoothVelocity * 1.75, 56);
    const travelSpeed = (baseSpeed + warpSpeed) * Math.min(deltaTime / 16.67, 2);

    context.fillStyle = "#03050d";
    context.fillRect(0, 0, viewportWidth, viewportHeight);

    for (const star of stars) {
      star.previousZ = star.z;
      star.z -= travelSpeed;

      if (star.z < 1) resetStar(star);

      const scale = 430 / star.z;
      const previousScale = 430 / star.previousZ;
      const x = star.x * scale + centerX;
      const y = star.y * scale + centerY;
      const previousX = star.x * previousScale + centerX;
      const previousY = star.y * previousScale + centerY;

      if (x < -80 || x > viewportWidth + 80 || y < -80 || y > viewportHeight + 80) {
        resetStar(star);
        continue;
      }

      const depthAlpha = Math.min(1, 1 - star.z / SPACE_DEPTH + 0.12);
      const alpha = Math.min(1, depthAlpha * star.brightness);
      const streakMultiplier = Math.max(1, warpSpeed * 0.72);

      context.beginPath();
      context.moveTo(x, y);

      if (warpSpeed > 3) {
        const dx = x - previousX;
        const dy = y - previousY;
        context.lineTo(x + dx * streakMultiplier, y + dy * streakMultiplier);
      } else {
        context.lineTo(x + 0.01, y + 0.01);
      }

      context.strokeStyle = `rgba(236, 242, 255, ${alpha.toFixed(3)})`;
      context.lineWidth = Math.min(2.5, star.size * (0.32 + depthAlpha * 1.18));
      context.stroke();
    }

    const glow = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      Math.min(viewportWidth, viewportHeight) * 0.46
    );
    glow.addColorStop(0, "rgba(112, 144, 230, 0.038)");
    glow.addColorStop(0.56, "rgba(56, 72, 130, 0.012)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, viewportWidth, viewportHeight);
  }

  function animateSkillOrbits(time) {
    if (!skillGalaxy || skillNodes.length === 0) return;

    const galaxyWidth = skillGalaxy.clientWidth;
    const galaxyHeight = skillGalaxy.clientHeight;

    skillNodes.forEach((node, index) => {
      const profile = skillOrbitProfiles[index % skillOrbitProfiles.length];
      const frozenTime = reducedMotion ? 0 : time;
      const angle =
        profile.phase * FULL_ORBIT +
        (frozenTime / profile.duration) * FULL_ORBIT * profile.direction;

      const orbitX = Math.cos(angle) * galaxyWidth * profile.radiusX;
      const orbitY = Math.sin(angle) * galaxyHeight * profile.radiusY;
      const bob = reducedMotion
        ? 0
        : Math.sin(frozenTime * 0.0024 + index * 1.35) * profile.bob;

      // A node becomes slightly larger and brighter while passing in front of
      // the central planet, creating a simple three-dimensional depth effect.
      const depth = (Math.sin(angle) + 1) / 2;
      const scale = 0.86 + depth * 0.18;
      const opacity = 0.57 + depth * 0.43;

      node.style.setProperty("--orbit-x", `${orbitX.toFixed(2)}px`);
      node.style.setProperty("--orbit-y", `${(orbitY + bob).toFixed(2)}px`);
      node.style.setProperty("--orbit-scale", scale.toFixed(3));
      node.style.setProperty("--orbit-opacity", opacity.toFixed(3));
      node.style.setProperty("--orbit-depth", depth.toFixed(3));
      node.style.zIndex = String(2 + Math.round(depth * 5));
    });
  }

  function animate(time) {
    const deltaTime = Math.min(time - lastFrameTime, 34);
    lastFrameTime = time;

    mouseX += (targetMouseX - mouseX) * 0.075;
    mouseY += (targetMouseY - mouseY) * 0.075;

    document.documentElement.style.setProperty("--mouse-x", mouseX.toFixed(4));
    document.documentElement.style.setProperty("--mouse-y", mouseY.toFixed(4));

    drawStarfield(deltaTime);
    animateSkillOrbits(time);
    animationFrameId = requestAnimationFrame(animate);
  }

  function handlePointerMove(event) {
    targetMouseX = (event.clientX / viewportWidth - 0.5) * 2;
    targetMouseY = (event.clientY / viewportHeight - 0.5) * 2;

    document.documentElement.style.setProperty("--glow-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--glow-y", `${event.clientY}px`);
  }

  function handleKeyboard(event) {
    const activeElement = document.activeElement;
    const isTyping = activeElement && ["INPUT", "TEXTAREA"].includes(activeElement.tagName);
    if (isTyping) return;

    if (["ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      jumpToSection(currentIndex + 1);
    }

    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      jumpToSection(currentIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      jumpToSection(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      jumpToSection(sectionCount - 1);
    }
  }

  function showFormStatus(message, type = "") {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");
    if (type) formStatus.classList.add(`is-${type}`);
  }

  async function saveContactResponse(event) {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton ? submitButton.innerHTML : "";

    showFormStatus("Sending your message...");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Sending <span aria-hidden="true">···</span>';
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin",
        signal: controller.signal
      });

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response. Confirm that PHP is enabled and config.php contains the correct MySQL details."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "The message could not be sent.");
      }

      contactForm.reset();
      showFormStatus(
        result.message || "Thank you. Your message was sent successfully.",
        "success"
      );
    } catch (error) {
      let message = "Something went wrong. Please try again.";

      if (window.location.protocol === "file:") {
        message =
          "The contact form needs a PHP server. Open the hosted website or run it through XAMPP instead of opening index.html directly.";
      } else if (error.name === "AbortError") {
        message = "The server took too long to respond. Please try again.";
      } else if (error.message) {
        message = error.message;
      }

      showFormStatus(message, "error");
    } finally {
      window.clearTimeout(timeoutId);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      jumpToSection(Number(link.dataset.index));
    });
  });

  jumpControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      if (control.matches("a[href^='#']")) event.preventDefault();
      jumpToSection(Number(control.dataset.jump));
    });
  });

  if (contactForm) contactForm.addEventListener("submit", saveContactResponse);

  window.addEventListener("scroll", updateExperience, { passive: true });
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("keydown", handleKeyboard);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    } else if (!document.hidden && !animationFrameId) {
      lastFrameTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    }
  });

  const hashIndex = panels.findIndex((panel) => `#${panel.id}` === window.location.hash);
  resizeCanvas();

  if (hashIndex > 0) {
    requestAnimationFrame(() => jumpToSection(hashIndex));
  }

  animationFrameId = requestAnimationFrame(animate);
})();
