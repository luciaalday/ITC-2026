export default function Chart({ xname='x-axis', yname='Time', xvalues=[], yvalues=[] }) {
  return (
    <div className="graph">
      <p>&nbsp;</p>
      <div className="data-container">
        <p className="x-label">{xname}</p>
        <div className="data">

        </div>
        <p>&nbsp;</p>
      </div>
      <p>{yname}</p>
    </div>
  )
}