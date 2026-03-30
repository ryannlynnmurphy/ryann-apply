"use client";

import { useState, useCallback } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import type { Job } from "@/lib/types";
import SwipeCard from "./SwipeCard";

interface SwipeDeckProps {
  jobs: Job[];
  onSwipeRight: (job: Job) => void;
  onSwipeLeft: (job: Job) => void;
  onSwipeUp: (job: Job) => void;
  onExpand: (job: Job) => void;
}

const SWIPE_THRESHOLD = 120;

export default function SwipeDeck({
  jobs,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onExpand,
}: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [gone, setGone] = useState(false);

  const [{ x, y, rotate, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    opacity: 1,
    config: { tension: 200, friction: 25 },
  }));

  const currentJob = currentIndex < jobs.length ? jobs[currentIndex] : null;

  const advance = useCallback(
    (action: string) => {
      setLastAction(action);
      setGone(false);
      setCurrentIndex((i) => i + 1);
      api.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    },
    [api],
  );

  const fireSwipe = useCallback(
    (dir: "left" | "right" | "up") => {
      if (!currentJob) return;
      setGone(true);

      const dest =
        dir === "right"
          ? { x: 600, y: 0, rotate: 15 }
          : dir === "left"
            ? { x: -600, y: 0, rotate: -15 }
            : { x: 0, y: -600, rotate: 0 };

      api.start({
        ...dest,
        opacity: 0,
        onRest: () => {
          if (dir === "right") onSwipeRight(currentJob);
          else if (dir === "left") onSwipeLeft(currentJob);
          else onSwipeUp(currentJob);
          advance(
            dir === "right" ? "Queued" : dir === "left" ? "Skipped" : "Saved",
          );
        },
      });
    },
    [currentJob, api, onSwipeRight, onSwipeLeft, onSwipeUp, advance],
  );

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [dx, dy], velocity: [vx, vy] }) => {
      if (gone || !currentJob) return;

      if (!down) {
        const absX = Math.abs(mx);
        const absY = Math.abs(my);

        // Up swipe takes priority when vertical is dominant
        if (my < -SWIPE_THRESHOLD && absY > absX) {
          fireSwipe("up");
          return;
        }
        if (mx > SWIPE_THRESHOLD) {
          fireSwipe("right");
          return;
        }
        if (mx < -SWIPE_THRESHOLD) {
          fireSwipe("left");
          return;
        }

        // Snap back
        api.start({ x: 0, y: 0, rotate: 0, opacity: 1 });
        return;
      }

      // While dragging
      api.start({
        x: mx,
        y: my,
        rotate: mx / 20,
        opacity: 1,
        immediate: true,
      });
    },
    { filterTaps: true },
  );

  // Overlay colors based on drag position
  const greenOverlay = x.to((v) => Math.min(Math.max(v / 200, 0), 0.4));
  const redOverlay = x.to((v) => Math.min(Math.max(-v / 200, 0), 0.4));
  const blueOverlay = y.to((v) => Math.min(Math.max(-v / 200, 0), 0.4));

  if (jobs.length === 0 || currentIndex >= jobs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-charcoal-light font-mono text-sm">
          No more jobs -- Check back later or add a URL
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card area */}
      <div className="relative w-full max-w-sm h-[440px] flex items-center justify-center">
        <animated.div
          {...bind()}
          style={{
            x,
            y,
            rotate: rotate.to((r) => `${r}deg`),
            opacity,
            touchAction: "none",
          }}
          className="absolute w-full"
        >
          {/* Color overlays */}
          <animated.div
            style={{ opacity: greenOverlay }}
            className="absolute inset-0 rounded-xl bg-hzl-green/20 pointer-events-none z-10"
          />
          <animated.div
            style={{ opacity: redOverlay }}
            className="absolute inset-0 rounded-xl bg-hzl-red/20 pointer-events-none z-10"
          />
          <animated.div
            style={{ opacity: blueOverlay }}
            className="absolute inset-0 rounded-xl bg-hzl-blue/20 pointer-events-none z-10"
          />

          <SwipeCard
            job={currentJob!}
            onExpand={() => onExpand(currentJob!)}
          />
        </animated.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex((i) => i - 1);
              setLastAction("Undo");
              api.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
            }
          }}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center text-charcoal-light hover:border-charcoal/40 transition-colors disabled:opacity-30"
          title="Undo"
        >
          <span className="text-lg">{"\u21A9"}</span>
        </button>

        <button
          onClick={() => fireSwipe("left")}
          className="w-14 h-14 rounded-full border-2 border-hzl-red flex items-center justify-center text-hzl-red hover:bg-hzl-red-bg transition-colors"
          title="Skip"
        >
          <span className="text-xl font-bold">{"\u2715"}</span>
        </button>

        <button
          onClick={() => fireSwipe("up")}
          className="w-14 h-14 rounded-full border-2 border-hzl-blue flex items-center justify-center text-hzl-blue hover:bg-hzl-blue-bg transition-colors"
          title="Save"
        >
          <span className="text-xl">{"\u2605"}</span>
        </button>

        <button
          onClick={() => fireSwipe("right")}
          className="w-14 h-14 rounded-full border-2 border-hzl-green flex items-center justify-center text-hzl-green hover:bg-hzl-green-bg transition-colors"
          title="Queue"
        >
          <span className="text-xl">{"\u2713"}</span>
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2 font-mono text-xs text-charcoal-light">
        <span>
          {currentIndex + 1} / {jobs.length}
        </span>
        {lastAction && (
          <span className="text-gold">-- {lastAction}</span>
        )}
      </div>
    </div>
  );
}
