import Icon from "./Icon";

const SectionTitle = ({ icon, title }) => {
  return (
    <div className="flex items-center gap-3 mt-10 mb-6">
      {icon && <Icon name={icon} className="text-indigo-600" />}
      <h2 className="text-2xl font-black">{title}</h2>
    </div>
  );
}

export default SectionTitle;