import { shell } from 'electron';

function ExternalLink(props) {
  return (
    <button className={ `btn btn-link p-n m-n${typeof props.className !== 'undefined' ? ' ' + props.className : ''}` }
      title="Click to open URL in browser"
      style={{ minWidth: 'unset', verticalAlign: 'inherit', fontSize: 'inherit', }}
      onClick={() => shell.openExternal(props.href)}
    >
      { props.children}
    </button>
  );
}

export default ExternalLink;