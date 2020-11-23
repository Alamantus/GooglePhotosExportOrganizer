import { shell } from 'electron';
import { NAV_ITEMS } from '../constants';

function Step4(props) {
  return (
    <article>
      <h1 className="type-h2">{ NAV_ITEMS[3] }</h1>
      <p className="type-p1">
        Your Google Photos should now be nicely organized into folders separated by Year and Month!
        But before you leave, you should make sure to go tidy up your folders.
      </p>
      <p className="type-p2">
        The <code>.zip</code> files themselves and the empty folders with metadata about your photos
        take up a <em>lot</em> of space on your hard drive!
      </p>
      <p className="type-p2">
        Go to wherever you downloaded the <code>.zip</code> files to and <em>delete them</em> so they
        don't unnecessarily take up your computer's storage space. After deleting them, be sure to
        empty them from your computer's recycle bin so it doesn't stick around there!
      </p>
      <p className="type-p2">
        Next, go to where you told the program to extract your <code>.zip</code> files and you will
        find a folder labeled "Takeout". This folder contains many <code>.json</code> files that contain
        metadata about the photos that were just organized. The other folders within <em>might</em> also
        contain duplicate and edited photos that did not have associated metadata and could not be processed.<br />
        This Takeout folder can be safely deleted after you check for any leftover files that you might
        want to keep.
      </p>
      <p className="type-p2">
        Once you're done tidying up, congratulations! You've successfully exported your files from Google Photos,
        and they are now neatly organized in a way that is easier to view.<br />
        Enjoy!
      </p>
      <div className="btn-group">
        <button
          className="btn btn-default"
          disabled={ props.zipFolderPath === null }
          onClick={() => shell.openItem(props.zipFolderPath)}
        >
          Open Folder where the <code>.zip</code> Files Are
        </button>
        <button
          className="btn btn-default"
          disabled={ props.unzipFolderPath === null }
          onClick={() => shell.openItem(props.unzipFolderPath)}
        >
          Open Emptied Folders for Tidying
        </button>
        <button
          className="btn btn-primary"
          disabled={ props.organizeIntoPath === null }
          onClick={() => shell.openItem(props.organizeIntoPath)}
        >
          Open Folder with Organized Photos
        </button>
      </div>
    </article>
  )
}

export default Step4;