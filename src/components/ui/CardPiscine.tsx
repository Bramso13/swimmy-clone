import React from "react";

type CardPiscineProps = {
  title: string;
  photo: string;
  pricePerHour: number;
  address: string;
  onClick?: () => void;
};

const CardPiscine = ({
  title,
  photo,
  pricePerHour,
  address,
  onClick,
}: CardPiscineProps) => (
  <div className="border rounded shadow p-2 flex flex-col gap-2 w-72">
    <img src={photo} alt={title} className="w-full h-40 object-cover rounded" />
    <div className="font-bold text-lg">{title}</div>
    <div className="text-sm text-gray-600">{address}</div>
    <div className="text-blue-600 font-semibold">{pricePerHour} €/heure</div>
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Voir
    </button>
  </div>
);

export default CardPiscine;
