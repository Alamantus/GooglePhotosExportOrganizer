import React from 'react';
import { ipcRenderer } from 'electron';

import { NAV_ITEMS, RENAME_STRATEGIES } from '../constants';
import ListItem from './ListItem';
import ProgressBar from './ProgressBar';

class Step3 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      running: false,
      progress: 0,
      renameStrategy: 'KEEP',
      insertExif: false,
      // files: [],
      // extracted: [],
      errored: [],
      // showFiles: false,
    }

    this.folderPathChangeHandler = this.handleFolderPathChange.bind(this);
    this.progressHandler = this.handleProgress.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('finish-dialog', this.folderPathChangeHandler);
    ipcRenderer.on('progress', this.progressHandler);
    // ipcRenderer.on('file-error', this.handleFileError.bind(this));
  }
  
  componentWillUnmount() {
    ipcRenderer.removeListener('finish-dialog', this.folderPathChangeHandler);
    ipcRenderer.removeListener('progress', this.progressHandler);
    // ipcRenderer.removeListener('file-error', this.handleFileError.bind(this));
  }

  requestUnzipFolderPath() {
    ipcRenderer.invoke('open-dialog', 'unzipFolderPath');
  }

  requestOrganizeIntoPath() {
    ipcRenderer.invoke('open-dialog', 'organizeIntoPath');
  }

  handleFolderPathChange(event, result) {
    if (result !== false) {
      this.props.updatePath(result.stateProperty, result.path);
    }
  }

  requestOrganize() {
    this.setState({ running: true }, () => {
      ipcRenderer.invoke('organize', this.props.unzipFolderPath, this.props.organizeIntoPath, this.state.renameStrategy, this.state.insertExif);
    })
  }

  handleProgress(event, report) {
    const { running, progress, errored = [] } = report;
    const newState = {
      running,
      progress,
      errored,
    };
    this.setState(newState, () => {
      if (this.state.running && this.state.progress < 1) {
        if (typeof this.timeoutFailsafe !== "undefined") {
          clearTimeout(this.timeoutFailsafe);
        }
        this.timeoutFailsafe = setTimeout(() => { // If 20 seconds ever passes 
          this.setState({ running: false, progress: 1 });
        }, 20000);
      }
    });
  }

  // handleFileError(event, report) {
  //   const newState = {
  //     errored: [...this.state.errored, report.fileName],
  //   };
  //   this.setState(newState);
  // }

  render() {
    return (
      <section className="container">
        <h1 className="type-h2">{NAV_ITEMS[2]}</h1>
        <p className="type-p1">
          This step will take all of your extracted files and organize them into one place.
        </p>
        <ul className="entity-list entity-list-expandable">
          <ListItem title="Extracted Location"
            description="Where you previously extracted your zip files to."
            icon="open-local"
            detail1={ this.props.unzipFolderPath }
            detail2={ <span className={`glyph glyph-${this.props.unzipFolderPath !== null ? 'checkmark' : 'important'}`}></span> }
            buttonText={ this.props.unzipFolderPath ? 'Change' : 'Set' }
            onButtonClick={ () => this.requestUnzipFolderPath() }
          />
          <ListItem title="Sort Files To"
            description="Where you want your organized files moved to."
            icon="open-local"
            detail1={ this.props.organizeIntoPath }
            detail2={ <span className={`glyph glyph-${this.props.organizeIntoPath !== null ? 'checkmark' : 'important'}`}></span> }
            buttonText={ this.props.organizeIntoPath ? 'Change' : 'Set' }
            onButtonClick={ () => this.requestOrganizeIntoPath() }
            button2Text="Use Extracted Location"
            onButton2Click={ () => this.props.updatePath('organizeIntoPath', this.props.unzipFolderPath) }
          />
        </ul>
        
        <section className="container">
          <h3 className="type-sh3">Rename Files</h3>
          <div className="btn-group m-t-xxxs" data-toggle="buttons">
            {
              Object.keys(RENAME_STRATEGIES).map((renameStrategy, index) => {
                const selected = this.state.renameStrategy === renameStrategy;
                return (
                  <label key={'renameStrategy_' + index} className={`btn btn-default${selected ? ' active' : ''}`}>
                    <input type="radio" name="rename-strategy"
                      defaultChecked={selected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          this.setState({ renameStrategy });
                        }
                      }}
                    /> { RENAME_STRATEGIES[renameStrategy]}
                  </label>
                );
              })
            }
          </div>
          <p className="type-p3 m-t-n p-t-n m-b-xs">
          {
            this.state.renameStrategy === 'KEEP'
            ? 'The original file names of your images will not be changed. Files will only be moved into the appropriate folder.'
            : 'The file names of your images will be changed to the year, month, day and hour, minute, and second that the photo was taken when moved.'
          }
          </p>
        </section>

        <section className="container">
          <h3 className="type-sh3">Re-Insert Available Exif Metadata</h3>
          <p className="type-p3 m-t-n p-t-n m-b-n">
            The timetamps of all moved files will be modified to reflect created, modified, and accessed dates (except
            if run using Linux, created date cannot be modified). Turn this on to explicitly have all possible metadata
            provided by Google Takeout added back into the JPEGs.
          </p>
          <div className="btn-group m-t-n m-b-xs">
            <button type="button" data-toggle="button"
              className={`btn btn-toggle-switch${this.state.insertExif ? ' active' : ''}`}
              autoComplete="off"
              aria-pressed={this.state.insertExif ? 'true' : 'false'}
              onClick={() => this.setState({ insertExif: !this.state.insertExif, })}
            >
              <span className="stateLabel stateLabel-on">Yes</span>
              <span className="stateLabel stateLabel-off">No</span>
            </button>
          </div>
          
          {
            this.state.insertExif === true && (
              <div className="alert alert-warning" role="alert">
                <div className="alert-title">This Will Take a While</div>
                <p>
                  Each photo with a JPEG file format (<code>.jpg</code> or <code>.jpeg</code> file extensions) will have all
                  available metadata provided by Google Takeout inserted back into the image as Exif metadata. <em>At most</em>,
                  this includes date taken, image description, and GPS data (latitude, longitude, and altitude), if available.
                </p>
                <p>
                  Please note that your photos <em>may already have their metadata</em>! Do a spot-check on a few photos in your extracted
                  files to see if GPS data is present. If it is missing and you know the image should have it, using this may add
                  it back if Google Takeout has provided the data. If you need all of the original Exif data from your photos, use
                  the "Download" interface from Google Photos itself&mdash;downloading this way will preserve all original metadata but
                  is restricted to downloading 500 photos at a time for some reason.
                </p>
              </div>
            )
          }
        </section>

        <div className="container">
          {/*
          <div className="alert alert-warning" role="alert">
            <div className="alert-title">This Will Take a While</div>
            <p>
              Organizing all of your files may take a long time, and interrupting the program may cause problems.<br />
              Please ensure your computer has enough battery, and let the program run after clicking the button.
            </p>
          </div>
          */}

          {
            !this.state.running && this.state.progress < 1 && (
              <button className="btn btn-primary" disabled={ !(this.props.unzipFolderPath && this.props.organizeIntoPath) }
                onClick={ () => this.requestOrganize() }
              >
                Start Organizing
              </button>
            )
          }

          {
            (this.state.running || this.state.progress > 0) && (
              <ProgressBar
                progress={ this.state.progress }
                errored={ this.state.errored.length > 0 }
              />
            )
          }
        </div>
      </section>
    );
  }
}

export default Step3;