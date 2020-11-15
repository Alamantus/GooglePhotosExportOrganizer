import { shell } from 'electron';
import { NAV_ITEMS } from '../constants';

function ExternalLink(props) {
  return (
    <button className="btn btn-link p-n m-n"
      title="Click to open URL in browser"
      style={{ minWidth: 'unset', verticalAlign: 'inherit', fontSize: 'inherit', }}
      onClick={() => shell.openExternal(props.href)}
    >
      { props.children }
    </button>
  );
}

function Step1(props) {
  const blogLink = 'https://robbie.antenesse.net/2020/11/16/exporting-google-photos.html'
  return (
    <article>
      <h1 className="type-h2">{ NAV_ITEMS[0] }</h1>
      <p class="type-p1">
        Follow the instructions on <ExternalLink href={ blogLink }>this page</ExternalLink> to
        export your Google Photos from Google Takeout. 
      </p>
    </article>
  )
}

export default Step1;