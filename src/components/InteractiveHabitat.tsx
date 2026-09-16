"use client";

import { useEffect, useRef } from "react";

type InteractiveHabitatProps = {
  svg: string;
  caption: string;
  label?: string;
};

/**
 * Client island over the SSR SVG scene: fine-pointer look-at + click poke.
 * README cards stay CSS-only; this only runs on the web habitat.
 */
export default function InteractiveHabitat({
  svg,
  caption,
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
      const cx = box.left + box.width * 0.38;
      const cy = box.top + box.height * 0.58;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const dead = 36;
      if (dist < dead) {
        node.style.transform = "";
        return;
      }
      const tilt = Math.max(-7, Math.min(7, (dx / box.width) * 16));
      const lift = Math.max(-4, Math.min(4, (-dy / box.height) * 10));
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
    <div className="pp-scene-wrap">
      <div
        ref={stageRef}
        className="pp-scene pp-scene-interactive"
        role="img"
        aria-label={label}
        // Renderer output is generated from validated data, never user-supplied markup.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="pp-scene-caption">{caption}</p>
      <p className="pp-scene-hint">Move near the pet · click to poke</p>
    </div>
  );
}
