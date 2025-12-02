"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FruitCard } from "./fruit-card";

const FRUITS = ["apple", "banana", "cherry", "lemon"];
const GRID_SIZE = 3;
const SHUFFLE_DURATION = 2000; // ms
const SHUFFLE_INTERVAL = 200; // ms
const TIMER_DURATION = 30; // seconds
const MAX_X = 3;

type Cell = {
  fruit: string;
  faceUp: boolean;
};

export function CardTable() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [firstFlip, setFirstFlip] = useState<{ i: number; j: number; fruit: string } | null>(null);
  const [xCount, setXCount] = useState(0);

  // Initialize grid with random fruits, all face down
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const init = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        fruit: FRUITS[Math.floor(Math.random() * FRUITS.length)],
        faceUp: false,
      }))
    );
    setGrid(init);
    setFirstFlip(null);
    setXCount(0);
    setMessage("");
    setSeconds(0);
  };

  // Timer and shuffle interval refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shuffleRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (shuffleRef.current) clearInterval(shuffleRef.current);
    };
  }, []);

  const shuffle = () => {
    resetGame();
    setShuffling(true);
    setMessage("");
    setSeconds(TIMER_DURATION);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setMessage("Game over!");
          setShuffling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Shuffle grid periodically
    shuffleRef.current = setInterval(() => {
      setGrid((prev) =>
        prev.map((row) =>
          row.map(() => ({
            fruit: FRUITS[Math.floor(Math.random() * FRUITS.length)],
            faceUp: false,
          }))
        )
      );
    }, SHUFFLE_INTERVAL);

    // Stop shuffling after duration
    setTimeout(() => {
      clearInterval(shuffleRef.current!);
      setShuffling(false);
    }, SHUFFLE_DURATION);
  };

  const flipCard = (i: number, j: number) => {
    setGrid((prev) => {
      const newGrid = prev.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (rIdx === i && cIdx === j) {
            return { ...cell, faceUp: !cell.faceUp };
          }
          return cell;
        })
      );
      return newGrid;
    });

    const cell = grid[i][j];
    if (!cell.faceUp) return; // ignore if still face down after flip

    if (!firstFlip) {
      setFirstFlip({ i, j, fruit: cell.fruit });
    } else {
      if (cell.fruit === firstFlip.fruit) {
        // matched, keep both face up
        setFirstFlip(null);
      } else {
        // mismatch
        setXCount((c) => c + 1);
        setMessage(`X ${c + 1}/${MAX_X}`);
        // flip back after short delay
        setTimeout(() => {
          setGrid((prev) =>
            prev.map((row, rIdx) =>
              row.map((c, cIdx) => {
                if ((rIdx === i && cIdx === j) || (rIdx === firstFlip.i && cIdx === firstFlip.j)) {
                  return { ...c, faceUp: false };
                }
                return c;
              })
            )
          );
          setFirstFlip(null);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (xCount >= MAX_X) {
      setMessage("Game over! Too many mismatches.");
      setShuffling(false);
    }
  }, [xCount]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flatMap((row, i) =>
          row.map((cell, j) => (
            <FruitCard
              key={`${i}-${j}`}
              fruit={cell.fruit}
              faceUp={cell.faceUp}
              onClick={() => flipCard(i, j)}
            />
          ))
        )}
      </div>
      <Button onClick={shuffle} disabled={shuffling || seconds === 0}>
        Start
      </Button>
      {seconds > 0 && <p className="mt-2">Time left: {seconds}s</p>}
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
