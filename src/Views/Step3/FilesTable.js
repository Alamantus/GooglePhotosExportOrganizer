function FilesTable(props) {
  return (
    <div className="table-responsive m-t-md">
      <table className="table table-striped">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Complete</th>
            <th>Zip File</th>
          </tr>
        </thead>
        <tbody>
        {
          props.files.map((file, index) => {
            return (
              <tr key={`extractFile${index}_${file}`}>
                <td style={{ textAlign: 'center' }}>
                {
                  props.errored.includes(file)
                  ? <span><i className={ `glyph glyph-cancel` } title="Could not extract" /></span>
                  : (
                  <span>
                    <i className={ `glyph glyph-${ props.extracted.includes(file) ? 'checkmark' : 'clock' }` }
                      title={ props.extracted.includes(file) ? 'Extracted!' : 'Working...' }
                    />
                  </span>
                  )
                }
                </td>
                <td>{ file }</td>
              </tr>
            )
          })
        }
        </tbody>
      </table>
    </div>
  );
}

export default FilesTable;