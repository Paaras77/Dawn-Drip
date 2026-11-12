"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".menu-card")];
  const filters = [...document.querySelectorAll(".filter-chip")];
  const search = document.querySelector("#menu-search");
  const emptyResults = document.querySelector("#empty-results");
  const clearSearchButton = document.querySelector("#btn-clear-search");
  const count = document.querySelector("#cart-count");
  const cartButton = document.querySelector(".cart-button");
  const drawer = document.querySelector("#cart-drawer");
  const backdrop = document.querySelector("#overlay-backdrop");
  const cartItems = document.querySelector("#cart-items");
  const emptyMessage = document.querySelector("#cart-empty");
  const subtotalElement = document.querySelector("#cart-subtotal");
  const checkoutButton = document.querySelector("#checkout-button");
  const checkoutDialog = document.querySelector("#checkout-dialog");
  const checkoutForm = document.querySelector("#checkout-form");
  const checkoutClose = document.querySelector("#checkout-close");
  const checkoutItems = document.querySelector("#checkout-items");
  const checkoutTotal = document.querySelector("#checkout-total");
  const checkoutSubmit = document.querySelector("#checkout-submit");
  const cardDetails = document.querySelector("#card-details");
  const checkoutSuccess = document.querySelector("#checkout-success");
  const closeButton = document.querySelector(".cart-close");
  const toastContainer = document.querySelector("#toast-container");
  const backToTop = document.querySelector("#back-to-top");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#primary-navigation");
  const status = document.querySelector("#open-status");
  const year = document.querySelector("#current-year");
  const hero = document.querySelector("#home");
  const greeting = document.querySelector("#hero-greeting");
  const starField = document.querySelector(".star-field");
  const moon = document.querySelector(".celestial-moon");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeFilter = "all";
  let lastFocusedElement = null;
  let checkoutTimer;
  let cart = [];

  if (year) year.textContent = String(new Date().getFullYear());

  if (starField && !reducedMotion.matches) {
    const stars = document.createDocumentFragment();
    for (let index = 0; index < 72; index += 1) {
      const star = document.createElement("span");
      star.className = "sky-star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = (0.35 + Math.random() * 0.65).toFixed(2);
      star.style.setProperty("--twinkle-delay", `${(Math.random() * 4).toFixed(2)}s`);
      star.style.setProperty("--twinkle-duration", `${(2 + Math.random() * 3).toFixed(2)}s`);
      star.style.setProperty("--star-size", `${Math.random() > 0.9 ? 4 : 2 + Math.random() * 1.5}px`);
      stars.append(star);
    }
    starField.append(stars);
  } else if (starField) {
    for (let index = 0; index < 48; index += 1) {
      const star = document.createElement("span");
      star.className = "sky-star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2);
      starField.append(star);
    }
  }

  function updateTimeBasedSky() {
    const hour = new Date().getHours();
    const sky = hour >= 5 && hour <= 9 ? "dawn"
      : hour >= 10 && hour <= 16 ? "day"
        : hour >= 17 && hour <= 20 ? "dusk" : "night";
    if (hero) hero.dataset.sky = sky;

    if (greeting) {
      greeting.textContent = hour >= 21 || hour < 5 ? "Still up? The kettle is on."
        : hour < 12 ? "Dawn already? Welcome, early bird."
          : hour < 17 ? "Afternoon pick-me-up?" : "Golden hour is coffee hour.";
    }

    if (status) {
      const icon = (contents) => `<svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${contents}</svg>`;
      if (hour >= 18 && hour <= 23 || hour < 5) {
        status.className = "status-open";
        status.innerHTML = `${icon('<circle cx="12" cy="12" r="8"/>')}<span>Open now — The night is young</span>`;
      } else if (hour === 5) {
        status.className = "status-closing";
        status.innerHTML = `${icon('<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>')}<span>Closing soon — Last call for cold brew</span>`;
      } else {
        status.className = "status-closed";
        status.innerHTML = `${icon('<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>')}<span>Closed — Resting until twilight (Opens at 6:00 PM)</span>`;
      }
    }
  }
  updateTimeBasedSky();
  window.setInterval(updateTimeBasedSky, 60_000);

  if (moon && window.matchMedia("(min-width: 900px)").matches && !reducedMotion.matches) {
    hero?.addEventListener("mousemove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 30;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 30;
      moon.style.transform = `translate(${Math.max(-15, Math.min(15, x))}px, ${Math.max(-15, Math.min(15, y))}px)`;
    });
    hero?.addEventListener("mouseleave", () => { moon.style.transform = "translate(0, 0)"; });
  }

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    toastContainer.append(toast);
    window.setTimeout(() => toast.remove(), 3200);
  }

  function updateMenu() {
    const query = (search?.value || "").trim().toLocaleLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesSearch = !query || card.textContent.toLocaleLowerCase().includes(query);
      const shouldShow = matchesCategory && matchesSearch;
      if (shouldShow) visibleCount += 1;

      window.clearTimeout(card.hideTimer);
      if (shouldShow) {
        if (card.hidden) {
          card.hidden = false;
          card.classList.remove("is-hiding");
          card.classList.add("is-shown");
          window.setTimeout(() => card.classList.remove("is-shown"), 240);
        } else if (card.classList.contains("is-hiding")) {
          card.classList.remove("is-hiding");
        }
      } else if (!card.hidden && !card.classList.contains("is-hiding")) {
        card.classList.add("is-hiding");
        card.hideTimer = window.setTimeout(() => {
          card.hidden = true;
          card.classList.remove("is-hiding");
        }, 220);
      }
    });
    if (emptyResults) emptyResults.hidden = visibleCount !== 0;
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      filters.forEach((chip) => {
        const selected = chip === button;
        chip.classList.toggle("is-active", selected);
        chip.setAttribute("aria-pressed", String(selected));
      });
      updateMenu();
    });
  });
  search?.addEventListener("input", updateMenu);
  clearSearchButton?.addEventListener("click", () => {
    if (search) search.value = "";
    activeFilter = "all";
    filters.forEach((chip) => {
      const selected = chip.dataset.filter === "all";
      chip.classList.toggle("is-active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    updateMenu();
    search?.focus();
  });

  function findCard(id) {
    return cards.find((card) => card.dataset.id === id);
  }

  function saveCart() {
    try {
      window.localStorage.setItem("dusk_drip_cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Could not save the order in this browser.", error);
    }
  }

  function clearSavedCart() {
    try {
      window.localStorage.removeItem("dusk_drip_cart");
    } catch (error) {
      console.warn("Could not clear the saved order in this browser.", error);
    }
  }

  function loadCart() {
    let saved;
    try {
      saved = window.localStorage.getItem("dusk_drip_cart");
    } catch (error) {
      console.warn("Could not read the saved order in this browser.", error);
      return [];
    }
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        const card = entry && findCard(entry.id);
        const qty = Number.parseInt(entry?.qty, 10);
        if (!card || !Number.isInteger(qty) || qty < 1) return [];
        const name = card.querySelector("h3")?.textContent || entry.id;
        const price = Number((card.querySelector(".price")?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
        return [{ id: entry.id, name, price, qty }];
      });
    } catch (error) {
      console.warn("Could not parse the saved order.", error);
      return [];
    }
  }

  function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (count) count.textContent = String(totalItems);
    cartButton?.setAttribute("aria-label", `Open cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`);
    if (cartItems) cartItems.replaceChildren();

    cart.forEach((item) => {
      if (!cartItems) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      const title = document.createElement("h3");
      title.textContent = item.name;
      const price = document.createElement("span");
      price.className = "cart-item-price";
      price.textContent = `$${item.price.toFixed(2)} each`;
      const controls = document.createElement("div");
      controls.className = "cart-item-controls";
      const decrease = document.createElement("button");
      decrease.type = "button";
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", `Remove one ${item.name}`);
      decrease.addEventListener("click", () => changeQuantity(item.id, -1));
      const quantity = document.createElement("span");
      quantity.textContent = String(item.qty);
      const increase = document.createElement("button");
      increase.type = "button";
      increase.textContent = "+";
      increase.setAttribute("aria-label", `Add one ${item.name}`);
      increase.addEventListener("click", () => changeQuantity(item.id, 1));
      controls.append(decrease, quantity, increase);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", `Remove ${item.name} from order`);
      remove.addEventListener("click", () => {
        cart = cart.filter((entry) => entry.id !== item.id);
        saveCart();
        updateCart();
      });
      row.append(title, price, controls, remove);
      cartItems.append(row);
    });

    const isEmpty = cart.length === 0;
    if (emptyMessage) emptyMessage.hidden = !isEmpty;
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (checkoutButton) checkoutButton.disabled = isEmpty;
  }

  function renderCheckoutSummary() {
    if (!checkoutItems || !checkoutTotal) return;
    checkoutItems.replaceChildren();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "checkout-line";
      const itemName = document.createElement("span");
      itemName.className = "checkout-line-name";
      itemName.textContent = item.name;
      const itemQuantity = document.createElement("span");
      itemQuantity.className = "checkout-line-qty";
      itemQuantity.textContent = `${item.qty} × $${item.price.toFixed(2)} = $${(item.qty * item.price).toFixed(2)}`;
      row.append(itemName, itemQuantity);
      checkoutItems.append(row);
    });
    checkoutTotal.textContent = `$${subtotal.toFixed(2)}`;
    updateCheckoutPaymentMethod();
  }

  function updateCheckoutPaymentMethod() {
    if (!checkoutForm || !cardDetails || !checkoutSubmit) return;
    const method = checkoutForm.querySelector('input[name="payment-method"]:checked')?.value || "card";
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const cardSelected = method === "card";
    cardDetails.hidden = !cardSelected;
    cardDetails.querySelectorAll("input").forEach((input) => {
      input.disabled = !cardSelected;
      input.required = cardSelected;
    });
    checkoutSubmit.textContent = cardSelected ? `Pay $${total.toFixed(2)}` : `Place pickup order · $${total.toFixed(2)}`;
  }

  function openCheckout() {
    if (!checkoutDialog || !checkoutForm || cart.length === 0) return;
    renderCheckoutSummary();
    checkoutForm.hidden = false;
    checkoutDialog.classList.remove("is-success");
    if (checkoutSuccess) checkoutSuccess.hidden = true;
    const cardRadio = checkoutForm.querySelector('input[name="payment-method"][value="card"]');
    if (cardRadio) cardRadio.checked = true;
    updateCheckoutPaymentMethod();
    closeDrawer();
    checkoutDialog.showModal();
    document.querySelector("#customer-name")?.focus();
  }

  function closeCheckout(returnToCart = true) {
    if (!checkoutDialog?.open) return;
    window.clearTimeout(checkoutTimer);
    checkoutDialog.close();
    checkoutDialog.classList.remove("is-success");
    checkoutForm?.reset();
    if (checkoutForm) checkoutForm.hidden = false;
    if (checkoutSuccess) checkoutSuccess.hidden = true;
    updateCheckoutPaymentMethod();
    if (returnToCart && cart.length > 0) {
      openDrawer(cartButton);
      checkoutButton?.focus();
    } else {
      cartButton?.focus();
    }
  }

  function changeQuantity(id, amount) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty += amount;
    if (item.qty < 1) cart = cart.filter((entry) => entry.id !== id);
    saveCart();
    updateCart();
  }

  function animateDrip(sourceButton) {
    if (!cartButton || reducedMotion.matches) return;
    const source = sourceButton.getBoundingClientRect();
    const target = cartButton.getBoundingClientRect();
    const drip = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    drip.setAttribute("viewBox", "0 0 24 32");
    drip.setAttribute("aria-hidden", "true");
    drip.classList.add("coffee-drip");
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shape.setAttribute("d", "M12 1C9 7 3 14 3 20a9 9 0 0 0 18 0C21 14 15 7 12 1Z");
    drip.append(shape);
    const startX = source.left + source.width / 2 - 7;
    const startY = source.top + source.height / 2 - 10;
    const endX = target.left + target.width / 2 - 7;
    const endY = target.top + target.height / 2 - 10;
    drip.style.left = `${startX}px`;
    drip.style.top = `${startY}px`;
    document.body.append(drip);
    const animation = drip.animate([
      { transform: "translate(0, 0) scale(.65)", opacity: 0 },
      { transform: "translate(0, 12px) scale(1)", opacity: 1, offset: .18 },
      { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(.45)`, opacity: .9 }
    ], { duration: 680, easing: "cubic-bezier(.22,.75,.35,1)" });
    animation.finished.then(() => drip.remove()).catch(() => drip.remove());
  }

  function openDrawer(restoreTarget = null) {
    if (!drawer || !backdrop) return;
    window.clearTimeout(checkoutTimer);
    lastFocusedElement = restoreTarget || document.activeElement;
    drawer.inert = false;
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
    drawer.classList.add("is-open");
    closeButton?.focus();
  }

  function closeDrawer(immediate = false) {
    if (!drawer || !backdrop) return;
    if (immediate) drawer.style.transition = "none";
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-visible");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    document.body.classList.remove("drawer-open");
    if (immediate) {
      void drawer.offsetWidth;
      drawer.style.removeProperty("transition");
      backdrop.hidden = true;
    } else {
      window.setTimeout(() => { backdrop.hidden = true; }, 280);
    }
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  document.querySelectorAll(".btn-add").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.add;
      const card = id && findCard(id);
      if (!card) return;
      const name = card.querySelector("h3")?.textContent || id;
      const price = Number((card.querySelector(".price")?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
      const existing = cart.find((item) => item.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ id, name, price, qty: 1 });
      saveCart();
      updateCart();
      showToast(`Added ${name} to your order.`);
      animateDrip(button);
      if (!reducedMotion.matches && count) {
        count.classList.remove("is-pulsing");
        void count.offsetWidth;
        count.classList.add("is-pulsing");
        window.setTimeout(() => count.classList.remove("is-pulsing"), 400);
      }
      button.textContent = "Added!";
      window.setTimeout(() => { button.textContent = "Add to Order"; }, 1000);
    });
  });

  cartButton?.addEventListener("click", () => openDrawer());
  closeButton?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer?.classList.contains("is-open")) closeDrawer(true);
    if (event.key !== "Tab" || !drawer?.classList.contains("is-open")) return;
    const focusable = [...drawer.querySelectorAll("button:not(:disabled), [href], input, [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!drawer.contains(document.activeElement)) { event.preventDefault(); first.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  checkoutButton?.addEventListener("click", openCheckout);
  checkoutForm?.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.addEventListener("change", updateCheckoutPaymentMethod);
  });
  checkoutClose?.addEventListener("click", () => closeCheckout(true));
  checkoutDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCheckout(true);
  });
  checkoutDialog?.addEventListener("click", (event) => {
    if (event.target !== checkoutDialog) return;
    const bounds = checkoutDialog.getBoundingClientRect();
    const isOutside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (isOutside) closeCheckout(true);
  });
  checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (cart.length === 0) return;
    cart = [];
    clearSavedCart();
    updateCart();
    if (checkoutSuccess) {
      checkoutSuccess.textContent = "Order in. Your cup is dripping its way to you. Demo checkout only—no payment was processed.";
      checkoutSuccess.hidden = false;
    }
    checkoutDialog?.classList.add("is-success");
    checkoutTimer = window.setTimeout(() => closeCheckout(false), 2500);
  });

  function setMobileNavOpen(open) {
    navToggle?.setAttribute("aria-expanded", String(open));
    navLinks?.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }
  navToggle?.addEventListener("click", () => {
    setMobileNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });
  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      const destination = link.getAttribute("href");
      if (destination?.startsWith("#")) {
        const target = document.querySelector(destination);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", destination);
        }
      }
      setMobileNavOpen(false);
    });
  });

  const sectionLinks = [...(navLinks?.querySelectorAll('a[href^="#"]') || [])];
  const observedSections = sectionLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  const revealSections = [...document.querySelectorAll("main > section:not(.hero)")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealSections.forEach((section) => section.classList.add("is-visible"));
  } else {
    revealSections.forEach((section) => section.classList.add("reveal-target"));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealSections.forEach((section) => revealObserver.observe(section));
  }

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  }, { passive: true });

  cart = loadCart();
  updateCart();
  updateMenu();
});
