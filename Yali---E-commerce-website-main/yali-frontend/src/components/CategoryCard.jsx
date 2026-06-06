export function CategoryCard({ name, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all hover:scale-105 min-w-[140px] cursor-pointer"
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${color}`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <span className="font-medium text-gray-900 text-center">{name}</span>
    </button>
  );
}
