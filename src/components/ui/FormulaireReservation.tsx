import React from "react";

type FormulaireReservationProps = {
  onSubmit: (data: { date: string; time: string }) => void;
};

const FormulaireReservation = ({ onSubmit }: FormulaireReservationProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;
    const time = (form.elements.namedItem("time") as HTMLInputElement).value;
    onSubmit({ date, time });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="date"
        name="date"
        className="border rounded px-2 py-1 w-full"
        required
      />
      <input
        type="time"
        name="time"
        className="border rounded px-2 py-1 w-full"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Réserver
      </button>
    </form>
  );
};

export default FormulaireReservation;
