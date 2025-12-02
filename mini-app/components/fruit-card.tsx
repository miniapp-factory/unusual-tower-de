"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface FruitCardProps {
  fruit: string;
  faceUp: boolean;
  onClick?: () => void;
}

export function FruitCard({ fruit, faceUp, onClick }: FruitCardProps) {
  const imageSrc = faceUp ? `/${fruit}.png` : "/card-back.png";

  return (
    <Card
      className="w-24 h-24 flex items-center justify-center cursor-pointer"
      onClick={onClick}
    >
      <img src={imageSrc} alt={fruit} className="w-20 h-20 object-contain" />
    </Card>
  );
}
