function EmptyState({ message = 'No data available', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <p className="text-lg">{message}</p>
    </div>
  );
}

export default EmptyState;
