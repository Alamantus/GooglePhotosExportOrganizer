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
      <p className="type-p1">
        Follow the instructions for Step 1 on <ExternalLink href={ blogLink }>this page</ExternalLink> to
        export your Google Photos from Google Takeout.
      </p>
      <p className="type-p2">
        This will probably take a while to finish&mdash;just make sure that all of the <code>.zip</code> files
        are downloaded into the same folder on your computer. That way, this program will be able
        to find them all and do its job!<br />
        <strong>IMPORTANT:</strong> Only create Google Takeout files for Google Photos and <em>NOT</em> any
        other Google services! Using <code>.zip</code> files that are not formatted how Google Takeout provides
        the Google Photos export may cause this program to behave unpredictably.
      </p>
      <p className="type-p2">
        Once you're finished downloading all of the Google Takeout files, you can move to the next step.
      </p>
    </article>
  )
}

export default Step1;