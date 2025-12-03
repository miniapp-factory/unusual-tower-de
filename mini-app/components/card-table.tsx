"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FruitCard } from "./fruit-card";

const FRUITS = ["apple", "banana", "cherry", "lemon", "watermelon", "coconut", "mango", "strawberry"];
const GRID_SIZE = 4;
const SHUFFLE_DURATION = 2000; // ms
const SHUFFLE_INTERVAL = 200; // ms
const TIMER_DURATION = 30; // seconds
const MAX_X = 10;

type Cell = {
  fruit: string;
  faceUp: boolean;
  matched: boolean;
};

export function CardTable() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [firstFlip, setFirstFlip] = useState<{ i: number; j: number; fruit: string } | null>(null);
  const [xCount, setXCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const isGameOver =
    !shuffling &&
    seconds === 0 &&
    (xCount >= MAX_X || message.includes("Game over"));

  // Initialize grid with random fruits, all face down
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    // Create pairs: duplicate each fruit once
    const fruitPairs = FRUITS.flatMap((fruit) => [fruit, fruit]);
    // Shuffle the array
    const shuffled = [...fruitPairs].sort(() => Math.random() - 0.5);
    // Assign to grid
    const newGrid = Array.from({ length: GRID_SIZE }, (_, i) =>
      Array.from({ length: GRID_SIZE }, (_, j) => ({
        fruit: shuffled[i * GRID_SIZE + j],
        faceUp: false,
        matched: false,
      }))
    );
    setGrid(newGrid);
    setFirstFlip(null);
    setXCount(0);
    setMessage("");
    setSeconds(0);
    setScore(0);
    setStreak(0);
    setShuffling(false);
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
    // Create pairs: duplicate each fruit once
    const fruitPairs = FRUITS.flatMap((fruit) => [fruit, fruit]);
    // Shuffle the array
    const shuffled = [...fruitPairs].sort(() => Math.random() - 0.5);
    // Assign to grid
    const newGrid = Array.from({ length: GRID_SIZE }, (_, i) =>
      Array.from({ length: GRID_SIZE }, (_, j) => ({
        fruit: shuffled[i * GRID_SIZE + j],
        faceUp: false,
        matched: false,
      }))
    );
    setGrid(newGrid);
    setShuffling(true);
    setIsLocked(true);
    setMessage("");
    setSeconds(TIMER_DURATION);
    setScore(0);
    setStreak(0);
    // Hide cards after 1 second
    setTimeout(() => {
      setGrid((prev) =>
        prev.map((row) =>
          row.map((c) => ({ ...c, faceUp: false }))
        )
      );
      setIsLocked(false);
    }, 1000);
  };

  const flipCard = (i: number, j: number) => {
    if (isLocked) return;
    const cell = grid[i][j];
    if (cell.matched || cell.faceUp) return;

    // flip this card
    setGrid((prev) =>
      prev.map((row, rIdx) =>
        row.map((c, cIdx) => {
          if (rIdx === i && cIdx === j) {
            return { ...c, faceUp: true };
          }
          return c;
        })
      )
    );

    if (!firstFlip) {
      setFirstFlip({ i, j, fruit: cell.fruit });
    } else {
      setIsLocked(true);
      if (cell.fruit === firstFlip.fruit) {
        // matched
        const newScore = score + 10 * (streak + 1);
        const newStreak = streak + 1;
        setGrid((prev) =>
          prev.map((row, rIdx) =>
            row.map((c, cIdx) => {
              if (
                (rIdx === i && cIdx === j) ||
                (rIdx === firstFlip.i && cIdx === firstFlip.j)
              ) {
                return { ...c, matched: true };
              }
              return c;
            })
          )
        );
        setScore(newScore);
        setStreak(newStreak);
        setFirstFlip(null);
        setIsLocked(false);
        // check win
        setTimeout(() => {
          const allMatched = grid.flat().every((c) => c.matched);
          if (allMatched) {
            // Update highest score if needed
            if (newScore > highestScore) {
              setHighestScore(newScore);
            }
            setMessage(`You win! Score: ${newScore}`);
            setTimeout(() => {
              shuffle();
            }, 1000);
          }
        }, 0);
      } else {
        // mismatch
        const newCount = xCount + 1;
        setXCount(newCount);
        setMessage(`X ${newCount}/${MAX_X}`);
        setStreak(0);
        setTimeout(() => {
          setGrid((prev) =>
            prev.map((row, rIdx) =>
              row.map((c, cIdx) => {
                if (
                  (rIdx === i && cIdx === j) ||
                  (rIdx === firstFlip.i && cIdx === firstFlip.j)
                ) {
                  return { ...c, faceUp: false };
                }
                return c;
              })
            )
          );
          setFirstFlip(null);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (xCount >= MAX_X) {
      setMessage("Game over! Too many mismatches.");
      setShuffling(false);
      setIsLocked(true);
      setSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [xCount]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flatMap((row, i) =>
          row.map((cell, j) => (
            <FruitCard
              key={`${i}-${j}`}
              fruit={cell.fruit}
              faceUp={cell.faceUp}
              disabled={cell.matched}
              onClick={() => flipCard(i, j)}
            />
          ))
        )}
      </div>
      <Button onClick={shuffle} disabled={shuffling || seconds === 0}>
        Start
      </Button>
      <Button onClick={resetGame} disabled={!isGameOver}>
        Restart
      </Button>
      {seconds > 0 && <p className="mt-2">Time left: {seconds}s</p>}
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
