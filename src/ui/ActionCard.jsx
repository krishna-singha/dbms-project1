const ActionCard = ({ text }) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm font-bold text-center hover:shadow-lg transition cursor-pointer">
      {text}
    </div>
  );
}

export default ActionCard;