"use client";

import { useEffect, useRef } from "react";

type InteractiveHabitatProps = {
  svg: string;
  label?: string;
};

/**
 * Full-bleed interactive habitat. Fine-pointer look-at + click poke.
 * Overlay UI lives outside this layer so panels can sit on top.
 */
export default function InteractiveHabitat({
  svg,
  label = "GitPet habitat",
}: InteractiveHabitatProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const pet = () => stage.querySelector<SVGGElement>("#gp-pet");
    let pokeTimer = 0;
    let poking = false;

    const onMove = (event: PointerEvent) => {
      if (poking) return;
      const node = pet();
      if (!node) return;
      const box = stage.getBoundingClientRect();
      const cx = box.left + box.width * 0.5;
      const cy = box.top + box.height * 0.58;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 48) {
        node.style.transform = "";
        return;
      }
      const tilt = Math.max(-8, Math.min(8, (dx / box.width) * 18));
      const lift = Math.max(-5, Math.min(5, (-dy / box.height) * 12));
      node.style.transform = `translate(${tilt * 0.35}px, ${lift}px) rotate(${tilt}deg)`;
    };

    const onLeave = () => {
      const node = pet();
      if (node && !poking) node.style.transform = "";
    };

    const onClick = () => {
      const node = pet();
      if (!node) return;
      poking = true;
      node.style.transition = "transform 120ms ease-out";
      node.style.transform = "translateY(5px) scale(1.04, 0.9)";
      window.clearTimeout(pokeTimer);
      pokeTimer = window.setTimeout(() => {
        node.style.transform = "translateY(-6px) scale(0.98, 1.05)";
        pokeTimer = window.setTimeout(() => {
          node.style.transition = "transform 220ms ease-out";
          node.style.transform = "";
          poking = false;
          pokeTimer = window.setTimeout(() => {
            if (node) node.style.transition = "";
          }, 240);
        }, 140);
      }, 120);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("click", onClick);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClick);
      window.clearTimeout(pokeTimer);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="pp-habitat pp-scene-interactive"
      role="img"
      aria-label={label}
      // Renderer output is generated from validated data, never user-supplied markup.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
