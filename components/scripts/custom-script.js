$(document).ready(function () {
  // Accordion
  $(".accordion .title").click(function () {
    const el = $(this);
    const elParent = el.closest(".accordion-section");
    const targetContent = elParent.find(".content");
    $(".accordion .title").removeClass("active");
    $(".accordion .accordion-section .content").slideUp();
    targetContent.slideDown();
    el.addClass("active");
  });
  (function () {
    if ($(".input-date").length) {
      $(".input-date").datepicker({
        showAnim: "slideDown",
        dateFormat: "dd-mm-yy",
      });
    }
  })();
});
$("[data-type='modal']").each(function () {
  const el = $(this);
  const target = el.data("target");

  el.on("click", function (e) {
    e.preventDefault();
    if (el.closest(".normal-popup").length) {
      closeMagnificPopup();
      setTimeout(() => {
        openMagnificPopup(`#${target}`, false, `#${target}`);
      }, 500);
      return;
    }
    openMagnificPopup(`#${target}`, false, `#${target}`);
  });
});
$(".normal-popup").on("click", function (e) {
  e.stopPropagation();
});

function openMagnificPopup(
  element,
  checker,
  id,
  closeOnBgClick = false,
  enableEscapeKey = false,
  showCloseBtn = false
) {
  var source, hasEffect;
  let closeOnBgClickValue = closeOnBgClick;
  let enableEscapeKeyValue = enableEscapeKey;
  let showCloseBtnValue = showCloseBtn;
  if (checker === true) {
    source = element.attr("href");
    hasEffect = true;
  } else {
    source = element;
    hasEffect = false;
  }
  if (!$(`${id} .cta`).length) {
    (closeOnBgClickValue = true),
      (enableEscapeKeyValue = true),
      (showCloseBtnValue = true);
  }
  if ($(`${id} .scrollbar`).length) {
    $(".scrollbar-arrows .scrollbar-arrow").unbind();
    scrollbar();
  }

  if (id) {
    source = id;
    hasEffect = true;
  }

  $.magnificPopup.open({
    items: {
      src: source,
    },
    type: "inline",
    preloader: false,
    focus: "#name",
    closeOnBgClick: closeOnBgClickValue,
    enableEscapeKey: enableEscapeKeyValue,
    showCloseBtn: showCloseBtnValue,
    removalDelay: 500, //delay removal by X to allow out-animation

    // When elemened is focused, some mobile browsers in some cases zoom in
    // It looks not nice, so we disable it:
    callbacks: {
      open: function () {
        if (!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
          $("html").css("margin-right", 17);
        } else if (
          navigator.userAgent.match(/Macintosh/) &&
          navigator.userAgent.match(/Chrome/)
        ) {
          $("html").css("margin-right", 0);
        } else {
          $("html").css("margin-right", 0);
        }
        $(".mfp-bg").on("click", function (e) {
          e.stopPropagation();
        });
      },
      close: function () {
        $("html").css("padding-right", 0);
      },
      beforeOpen: function () {
        if ($(window).width() < 700) {
          this.st.focus = false;
        } else {
          this.st.focus = "#name";
        }

        if (hasEffect && !id) {
          this.st.mainClass = element.attr("data-effect");
        }

        if (id) {
          this.st.mainClass = $(element).attr("data-effect");
        }
      },
    },

    midClick: true, // allow opening popup on middle mouse click. Always set
  });
}
//openMagnificPopup

function closeMagnificPopup() {
  $.magnificPopup.close();
  if (
    !navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ||
    (navigator.userAgent.match(/Macintosh/) &&
      navigator.userAgent.match(/Chrome/))
  ) {
    setTimeout(() => {
      $("html").css("margin-right", 0);
    }, 500);
  }
} //closeMagnificPopup
(function () {
  if ($(".close-popup").length) {
    $(".close-popup").on("click", function (event) {
      event.preventDefault();
      $.magnificPopup.close();
      if (!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)) {
        setTimeout(() => {
          $("html").css("margin-right", 0);
        }, 500);
      }
    });
  }
})();
//Close Popup


  // Dropdown Menu
  initDropdowns();
  function initDropdowns() {
    $(".dropdown-toggle").each(function () {
      const dropdownToggle = $(this);
      const dropdownContainer = dropdownToggle.closest(".dropdown");
      dropdownToggle.on("click", function () {
        const target = dropdownToggle.attr("data-target");
        if (target) {
          _showDropdownMenuWithTarget(target);
        }
        _showDropdownMenu(dropdownContainer);
      });
    });
  }

  function _showDropdownMenu(dropdownContainer) {
    if (dropdownContainer.hasClass("show")) {
      dropdownContainer.removeClass("show");
      return;
    }
    $(".dropdown").removeClass("show");
    dropdownContainer.addClass("show");
  }