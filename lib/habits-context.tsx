import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Completion = {
  habit_id: number;
  date: string;
};

type HabitsContextType = {
  completions: Completion[];
  completeHabit: (habit_id: number, date: string) => Promise<void>;
  uncompleteHabit: (habit_id: number, date: string) => Promise<void>;
  setCompletions: React.Dispatch<React.SetStateAction<Completion[]>>;
};

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [completions, setCompletions] = useState<Completion[]>([]);

  // Carga inicial
  useEffect(() => {
    const fetchCompletions = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const userId = userData.user.id;
      const lastNDates = getLastNDates(30);
      const { data } = await supabase
        .from("habit_completions")
        .select("habit_id,date")
        .eq("user_id", userId)
        .in("date", lastNDates);
      setCompletions(data || []);
    };
    fetchCompletions();
  }, []);

  const completeHabit = async (habit_id: number, date: string) => {
    if (completions.some((c) => c.habit_id === habit_id && c.date === date)) return;
    await supabase.from("habit_completions").insert([{ habit_id, date }]);
    setCompletions((prev) => [...prev, { habit_id, date }]);
  };

  const uncompleteHabit = async (habit_id: number, date: string) => {
    await supabase
      .from("habit_completions")
      .delete()
      .eq("habit_id", habit_id)
      .eq("date", date);
    setCompletions((prev) => prev.filter((c) => !(c.habit_id === habit_id && c.date === date)));
  };

  return (
    <HabitsContext.Provider value={{ completions, completeHabit, uncompleteHabit, setCompletions }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits debe usarse dentro de un HabitsProvider");
  }
  return context;
}

function getLastNDates(n: number) {
  const arr = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}
