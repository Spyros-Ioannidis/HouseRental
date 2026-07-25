export default function UserDashboardPanelHeader({ title, description }) {
  return (
    <div className="p-6 border-color-card border-t border-x rounded-t-2xl bg-color-card">
      <div>
        <h1 className="font-bold text-3xl text-color-primary">{title}</h1>
      </div>
    </div>
  );
}
