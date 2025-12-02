"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FruitCard } from "./fruit-card";

const FRUITS = ["apple", "banana", "cherry", "lemon"];
const GRID_SIZE = 3;
const SHUFFLE_DURATION = 2000; // ms
const SHUFFLE_INTERVAL = 200; // ms
const MAX_ATTEMPTS = 2;

export function CardTable() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [attempts, setAttempts] = useState(MAX_ATTEMPTS);
  const [message, setMessage] = useState("");

  // Initialize grid with random fruits
  useEffect(() => {
    const init = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => FRUITS[Math.floor(Math.random() * FRUITS.length)])
    );
    setGrid(init);
  }, []);

  const shuffle = () => {
    setShuffling(true);
    setMessage("");
    const interval = setInterval(() => {
      setGrid(prev =>
        prev.map(row =>
          row.map(() => FRUITS[Math.floor(Math.random() * FRUITS.length)])
        )
      );
    }, SHUFFLE_INTERVAL);

    setTimeout(() => {
      clearInterval(interval);
      setShuffling(false);
      checkWin();
    }, SHUFFLE_DURATION);
  };

  const checkWin = () => {
    // Check rows
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = grid[i];
      if (row.every(f => f === row[0])) {
        setMessage("You win!");
        return;
      }
    }
    // Check columns
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = grid.map(row => row[j]);
      if (col.every(f => f === col[0])) {
        setMessage("You win!");
        return;
      }
    }
    // No win
    const remaining = attempts - 1;
    setAttempts(remaining);
    if (remaining <= 0) {
      setMessage("Game over!");
    } else {
      setMessage(`No match. Attempts left: ${remaining}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2">
        {grid.flatMap((row, i) =>
          row.map((fruit, j) => (
            <FruitCard
              key={`${i}-${j}`}
              fruit={fruit}
              faceUp={true}
              onClick={() => {}}
            />
          ))
        )}
      </div>
      <Button onClick={shuffle} disabled={shuffling || attempts <= 0}>
        Start
      </Button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
