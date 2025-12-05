import { useEffect } from "react";

export function useGooeyBalls() {
  useEffect(() => {
    function generateBalls() {
      const container = document.querySelector(".gooey-animations");
      if (!container) return;

      container.innerHTML = "";

      const count = Math.floor(window.innerWidth / 20);
      const colors = ["#28323B", "#FFA036"];

      for (let i = 0; i < count; i++) {
        const ball = document.createElement("div");
        ball.className = "ball";
        ball.style.bottom = "0px";
        ball.style.left = Math.random() * window.innerWidth - 100 + "px";
        ball.style.animationDelay = Math.random() * 5 + "s";
        ball.style.transform = `translateY(${Math.random() * 10}px)`;
        ball.style.backgroundColor = colors[i % 2];
        container.appendChild(ball);
      }
    }

    generateBalls();
    window.addEventListener("resize", generateBalls);

    return () => {
      window.removeEventListener("resize", generateBalls);
    };
  }, []);
}
