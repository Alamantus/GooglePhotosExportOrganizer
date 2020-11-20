function ProgressBar(props) {
  if (props.progress <= 0) {
    return (
      <div className="progress-bar">
        <div className="progress-circle"></div>
        <div className="progress-circle"></div>
        <div className="progress-circle"></div>
        <div className="progress-circle"></div>
        <div className="progress-circle"></div>
      </div>
    );
  }

  const progressPercent = props.progress * 100;
  
  return (
    <div className="row">
      <div className="col-md-20 p-t-xxs">
        <div className="progress">
          <div className="progress-bar" role="progressbar"
            aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100"
            style={{ width: progressPercent.toString() + '%' }}>
            <span className="sr-only">{ progressPercent.toString() + '%' }</span>
          </div>
        </div>
      </div>
      <div className="col-md-4">
      {
        props.progress >= 1 && (
          <span><i className={`glyph glyph-${props.errored ? 'important' : 'checkmark'}`} /></span>
        )
      }
      </div>
    </div>
  );
}

export default ProgressBar;