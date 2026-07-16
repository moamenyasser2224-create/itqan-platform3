export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 12, width: '40%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="list-row">
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 13, width: '50%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '30%' }} />
      </div>
      <div className="skeleton" style={{ height: 30, width: 80, borderRadius: 8 }} />
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className={`grid cols-${count}`} style={{ marginBottom: 28 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="card" key={i}>
          <div className="skeleton" style={{ height: 11, width: '50%', marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 26, width: '35%' }} />
        </div>
      ))}
    </div>
  );
}
