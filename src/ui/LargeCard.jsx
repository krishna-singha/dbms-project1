const LargeCard = ({ title, text, cta }) => {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex justify-between items-center">
      <div>
        <h3 className="font-black text-lg">{title}</h3>
        <p className="text-gray-500 mt-1">{text}</p>
      </div>
      <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
        {cta}
      </button>
    </div>
  );
}

export default LargeCard;