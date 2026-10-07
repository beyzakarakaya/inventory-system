export default function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <div
      className={`rounded-xl p-5 flex justify-between items-center shadow-lg bg-gradient-to-r ${gradient}`}
    >
      <div>
        <p className="text-white/80 text-sm">{label}</p>
        <h2 className="text-3xl font-bold text-white">{value}</h2>
      </div>
      {Icon && <Icon size={36} className="text-white/90" />}
    </div>
  );
}
