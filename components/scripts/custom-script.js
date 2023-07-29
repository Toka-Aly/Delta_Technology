$(document).ready(function () {
  // Wizard Steps
  const steps = $(".wizard__steps .wizard__steps__step");
  const stepStart = $(".wizard-steps").data("step-start");
  const progress = $(".wizard-steps .progress");
  const bodySections = $(".wizard__content__body .tab");

  let step = stepStart ? stepStart : 0;

  function move(n) {
    if (n > steps.length - 1) {
      return;
    }
    $(steps).removeClass("tab--active finished");
    $(steps[n]).addClass("tab--active");
    $(steps[n]).prevAll(".step").addClass("tab--active finished");
    $(bodySections).removeClass("tab--active");
    $(bodySections[n]).addClass("tab--active");
  }

  move(step);

  $(".wizard-next-btn").each(function () {
    $(this).click(function () {
      move(step + 1);
      step++;
    });
  });
  $(".wizard-prev-btn").each(function (i) {
    $(this).click(function () {
      move(step - 1);
      step--;
    });
  });
});
