// src/components/dashboard/DashboardCard.jsx
export default function DashboardCard({ children, title, className }) {
    return (
      <div className={`bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    );
  }