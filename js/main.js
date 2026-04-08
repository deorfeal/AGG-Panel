function initHeaderLangsHover() {
  document.querySelectorAll(".langs").forEach((langs) => {
    const langsList = langs.querySelector(".langs__list");

    if (!langsList) {
      return;
    }

    const items = Array.from(langsList.querySelectorAll(".langs__item"));

    if (!items.length) {
      return;
    }

    let highlight = langs.querySelector(".langs__highlight");

    if (!highlight) {
      highlight = document.createElement("div");
      highlight.classList.add("langs__highlight");
      langs.appendChild(highlight);
    }

    let activeItem = langsList.querySelector(".langs__item--active") || items[0];

    const setActive = (target) => {
      items.forEach((item) => item.classList.remove("langs__item--active"));
      target.classList.add("langs__item--active");
    };

    const moveHighlight = (target) => {
      const rect = target.getBoundingClientRect();
      const parentRect = langsList.getBoundingClientRect();
      const left = rect.left - parentRect.left;

      highlight.style.transform = `translate(${left}px, -50%)`;
    };

    setActive(activeItem);
    moveHighlight(activeItem);

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        setActive(item);
        moveHighlight(item);
      });

      item.addEventListener("click", () => {
        activeItem = item;
      });
    });

    langsList.addEventListener("mouseleave", () => {
      setActive(activeItem);
      moveHighlight(activeItem);
    });

    window.addEventListener("resize", () => {
      moveHighlight(activeItem);
    });
  });
}

function initPanelToolbarSelect() {
  const selects = Array.from(document.querySelectorAll("[data-panel-select]"));

  if (!selects.length) {
    return;
  }

  const closeSelect = (select, shouldFocusTrigger = false) => {
    const trigger = select.querySelector(".panel__select-trigger");
    const options = Array.from(select.querySelectorAll(".panel__select-option"));

    select.classList.remove("panel__toolbar-select--open");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");

      if (shouldFocusTrigger) {
        trigger.focus();
      }
    }

    options.forEach((option) => {
      option.tabIndex = -1;
    });
  };

  const closeAllSelects = (exceptSelect) => {
    selects.forEach((select) => {
      if (select !== exceptSelect) {
        closeSelect(select);
      }
    });
  };

  const getNextIndex = (currentIndex, direction, total) => {
    if (!total) {
      return 0;
    }

    return (currentIndex + direction + total) % total;
  };

  const setOptionFocus = (options, nextIndex) => {
    options.forEach((option, optionIndex) => {
      option.tabIndex = optionIndex === nextIndex ? 0 : -1;
    });

    options[nextIndex].focus();
  };

  const openSelect = (select, options, trigger, focusIndex = -1) => {
    closeAllSelects(select);
    select.classList.add("panel__toolbar-select--open");
    trigger.setAttribute("aria-expanded", "true");

    if (focusIndex >= 0) {
      setOptionFocus(options, focusIndex);
    }
  };

  selects.forEach((select) => {
    const nativeSelect = select.querySelector(".panel__select-native");
    const trigger = select.querySelector(".panel__select-trigger");
    const value = select.querySelector(".panel__select-value");
    const dropdown = select.querySelector(".panel__select-dropdown");
    const options = Array.from(select.querySelectorAll(".panel__select-option"));

    if (!nativeSelect || !trigger || !value || !dropdown || !options.length) {
      return;
    }

    const dropdownId = dropdown.id || `panel-select-dropdown-${selects.indexOf(select) + 1}`;
    dropdown.id = dropdownId;
    dropdown.setAttribute("aria-orientation", "vertical");
    trigger.setAttribute("aria-controls", dropdownId);

    options.forEach((option, index) => {
      option.id = option.id || `${dropdownId}-option-${index + 1}`;
      option.tabIndex = -1;
    });

    const getSelectedIndex = () => {
      const selectedIndex = options.findIndex((option) =>
        option.classList.contains("panel__select-option--selected")
      );

      return selectedIndex >= 0 ? selectedIndex : 0;
    };

    const setValue = (nextValue) => {
      const prevValue = nativeSelect.value;
      nativeSelect.value = nextValue;
      value.textContent = nextValue;

      options.forEach((option) => {
        const isSelected = option.dataset.value === nextValue;

        option.classList.toggle("panel__select-option--selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
        option.tabIndex = isSelected ? 0 : -1;
      });

      if (prevValue !== nextValue) {
        nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    setValue(nativeSelect.value || options[0].dataset.value);

    trigger.addEventListener("click", function () {
      const isOpen = select.classList.contains("panel__toolbar-select--open");

      if (isOpen) {
        closeSelect(select);
        return;
      }

      openSelect(select, options, trigger);
    });

    trigger.addEventListener("keydown", function (event) {
      const selectedIndex = getSelectedIndex();

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openSelect(select, options, trigger, selectedIndex);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        if (select.classList.contains("panel__toolbar-select--open")) {
          closeSelect(select);
          return;
        }

        openSelect(select, options, trigger, selectedIndex);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", function () {
        setValue(option.dataset.value || "");
        closeSelect(select, true);
      });

      option.addEventListener("keydown", function (event) {
        const currentIndex = options.indexOf(option);

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setOptionFocus(options, getNextIndex(currentIndex, 1, options.length));
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setOptionFocus(options, getNextIndex(currentIndex, -1, options.length));
          return;
        }

        if (event.key === "Home") {
          event.preventDefault();
          setOptionFocus(options, 0);
          return;
        }

        if (event.key === "End") {
          event.preventDefault();
          setOptionFocus(options, options.length - 1);
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setValue(option.dataset.value || "");
          closeSelect(select, true);
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          closeSelect(select, true);
          return;
        }

        if (event.key === "Tab") {
          closeSelect(select);
        }
      });
    });
  });

  document.addEventListener("click", function (event) {
    selects.forEach((select) => {
      if (!select.contains(event.target)) {
        closeSelect(select);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      selects.forEach((select) => {
        if (select.classList.contains("panel__toolbar-select--open")) {
          closeSelect(select, true);
        }
      });
    }
  });
}

$(function () {
  $(".burger, .header__burger").on("click", function (event) {
    $("body").toggleClass("body--active");
  });

  $(".menu__link").on("click", function (event) {
    $("body").removeClass("body--active");
  });

  initHeaderLangsHover();
  initPanelToolbarSelect();
  
});

