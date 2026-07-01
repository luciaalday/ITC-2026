// src/components/Chart.jsx
export default function Chart({ xname='x-axis', yname='Time', xvalues=[], yvalues=[] }) {
  const width = 1000
  const height = 500
  const padding = 20

  const hasData = xvalues.length > 0 && yvalues.length > 0

  const maxY = hasData ? Math.max(...yvalues, 0) : 1
  const minY = hasData ? Math.min(...yvalues, 0) : 0
  const range = maxY - minY || 1

  const xFor = (i) =>
    xvalues.length > 1
      ? (i / (xvalues.length - 1)) * (width - padding * 2) + padding
      : width / 2

  const yFor = (y) =>
    height - padding - ((y - minY) / range) * (height - padding * 2)

  const points = hasData
    ? yvalues.map((y, i) => `${xFor(i)},${yFor(y)}`).join(' ')
    : ''

  return (
    <div className="graph">
      <p>&nbsp;</p>
      <div className="data-container">
        <p className="x-label">{xname}</p>
        <div className="data">
          {hasData && (
            <svg
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%' }}
            >
              <polyline
                points={points}
                fill="none"
                stroke="var(--nav)"
                strokeWidth="2"
              />
              {yvalues.map((y, i) => (
                <circle
                  key={i}
                  cx={xFor(i)}
                  cy={yFor(y)}
                  r="4"
                  fill="var(--nav)"
                />
              ))}
            </svg>
          )}
        </div>
        <p>&nbsp;</p>
      </div>
      <p>{yname}</p>
    </div>
  )
}