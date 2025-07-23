import React from "react";

type CardReservationProps = {
  poolTitle: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
};

const CardReservation = ({
  poolTitle,
  startDate,
  endDate,
  amount,
  status,
}: CardReservationProps) => (
  <div className="border rounded shadow p-2 flex flex-col gap-2 w-72">
    <div className="font-bold">{poolTitle}</div>
    <div className="text-sm">
      Du {startDate} au {endDate}
    </div>
    <div className="text-blue-600">{amount} €</div>
    <div className="text-xs text-gray-500">Statut : {status}</div>
  </div>
);

export default CardReservation;
