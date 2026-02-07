const Card = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

export default Card;