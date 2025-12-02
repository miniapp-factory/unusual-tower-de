"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FruitCard } from "./fruit-card";

const FRUITS = ["apple", "banana", "cherry", "lemon"];
const GRID_SIZE = 3;
const SHUFFLE_DURATION = 2000; // ms
const SHUFFLE_INTERVAL = 200; // ms
const TIMER_DURATION = 30; // seconds

type Cell = {
  fruit: string;
  faceUp: boolean;
};

export function CardTable() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");

  // Initialize grid with random fruits, all face down
  useEffect(() => {
    const init = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        fruit: FRUITS[Math.floor(Math.random() * FRUITS.length)],
        faceUp: false,
      }))
    );
    setGrid(init);
  }, []);

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
      checkWin();
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
    // After flipping, check win
    setTimeout(() => {
      checkWin();
    }, 0);
  };

  const checkWin = () => {
    // Ensure all cards are face up
    const allFaceUp = grid.every((row) => row.every((cell) => cell.faceUp));
    if (!allFaceUp) return;

    // Check rows
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = grid[i];
      if (row.every((cell) => cell.fruit === row[0].fruit)) {
        setMessage("You win!");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
    }
    // Check columns
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = grid.map((row) => row[j]);
      if (col.every((cell) => cell.fruit === col[0].fruit)) {
        setMessage("You win!");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
    }
  };

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
