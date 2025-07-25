import React from "react";
import { View, Dimensions } from "react-native";

type HabitGridProps = {
  color: string;
  days: boolean[];
  size?: number;
  columns?: number;
  rows?: number;
};

export default function HabitGrid({
  color,
  days,
  size = 18, // tamaño de cada puntito
  columns = 10, // valor por default, se sobrescribe desde streaks.tsx
  rows = 4,     // fijo, siempre 4 filas
}: HabitGridProps) {
  const rowsArr = [];
  for (let i = 0; i < rows; i++) {
    rowsArr.push(days.slice(i * columns, (i + 1) * columns));
  }
  return (
    <View style={{ flexDirection: "column", gap: 6 }}>
      {rowsArr.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: "row", gap: 6 }}>
          {row.map((done, colIdx) => (
            <View
              key={colIdx}
              style={{
                width: size,
                height: size,
                borderRadius: 4,
                backgroundColor: done ? color : "#D1D5DB",
                opacity: done ? 1 : 0.35,
                borderWidth: done ? 0 : 1,
                borderColor: "#aaa",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
