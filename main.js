// Лёгкая анимация появления кнопок
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".menu-btn");

  buttons.forEach((btn, index) => {
    btn.style.opacity = 0;
    btn.style.transform = "translateY(10px)";

    setTimeout(() => {
      btn.style.transition = "all 0.4s ease";
      btn.style.opacity = 1;
      btn.style.transform = "translateY(0)";
    }, index * 120);
  });
});
