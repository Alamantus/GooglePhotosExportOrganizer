import React from 'react';
import { ipcRenderer } from 'electron';

import { NAV_ITEMS, RENAME_STRATEGIES } from '../../constants';
import ListItem from '../ListItem';
import ProgressBar from '../ProgressBar';

class Step3 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      running: false,
      progress: 0,
      renameStrategy: 'KEEP',
      // files: [],
      // extracted: [],
      errored: [],
      // showFiles: false,
    }
  }

  componentDidMount() {
    ipcRenderer.on('finish-dialog', this.handleFolderPathChange.bind(this));
    ipcRenderer.on('progress', this.handleProgress.bind(this));
    ipcRenderer.on('file-error', this.handleFileError.bind(this));
  }
  
  componentWillUnmount() {
    ipcRenderer.removeListener('finish-dialog', this.handleFolderPathChange.bind(this));
    ipcRenderer.removeListener('progress', this.handleProgress.bind(this));
    ipcRenderer.removeListener('file-error', this.handleFileError.bind(this));
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
      ipcRenderer.invoke('organize', this.props.unzipFolderPath, this.props.organizeIntoPath);
    })
  }

  handleProgress(event, report) {
    const { running, progress } = report;
    const newState = {
      running,
      progress,
    };
    if (typeof report.files !== 'undefined') {
      newState.files = report.files;
    }
    if (typeof report.fileName !== 'undefined') {
      newState.extracted = [...this.state.extracted, report.fileName];
    }
    this.setState(newState);
  }

  handleFileError(event, report) {
    const newState = {
      errored: [...this.state.errored, report.fileName],
    };
    this.setState(newState);
  }

  render() {
    return (
      <section>
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
            button2Text="Use Zip Folder Location"
            onButton2Click={ () => this.props.updatePath('unzipFolderPath', this.props.zipFolderPath) }
          />
          <ListItem title="Sort Files To"
            description="Where you want your organized files moved to."
            icon="open-local"
            detail1={ this.props.organizeIntoPath }
            detail2={ <span className={`glyph glyph-${this.props.organizeIntoPath !== null ? 'checkmark' : 'important'}`}></span> }
            buttonText={ this.props.organizeIntoPath ? 'Change' : 'Set' }
            onButtonClick={ () => this.requestOrganizeIntoPath() }
            button2Text="Use Zip Folder Location"
            onButton2Click={ () => this.props.updatePath('organizeIntoPath', this.props.unzipFolderPath) }
          />
        </ul>
        
        <section className="container">
          <div className="btn-group" data-toggle="buttons">
            <label className="btn btn-default active">
              <input type="radio" name="rename-strategy" id="renameStrategy1" autocomplete="off"
                defaultChecked={ this.state.renameStrategy === 'KEEP' }
                onChange={(event) => {
                  if (event.target.checked) {
                    this.setState({ renameStrategy: 'KEEP' });
                  }
                }}
              /> { RENAME_STRATEGIES.KEEP }
            </label>
            <label className="btn btn-default">
              <input type="radio" name="rename-strategy" id="renameStrategy2" autocomplete="off"
                defaultChecked={ this.state.renameStrategy === 'DATE' }
                onChange={(event) => {
                  if (event.target.checked) {
                    this.setState({ renameStrategy: 'DATE' });
                  }
                }}
              /> { RENAME_STRATEGIES.DATE }
            </label>
          </div>
          {
            this.state.renameStrategy === 'KEEP'
            ? (
              <p>The original file names of your images will not be changed. Files will only be moved into the appropriate folder.</p>
            ) : (
              <p>The file names of your images will be changed to the year, month, day and hour, minute, and second that the photo was taken when moved.</p>
            )
          }
        </section>

        <div className="container">
          <div className="alert alert-warning" role="alert">
            <div className="alert-title">This Will Take a While</div>
            <p>
              Organizing all of your files may take a long time, and interrupting the program may cause problems.<br />
              Please ensure your computer has enough battery, and let the program run after clicking the button.
            </p>
          </div>

          {
            !this.state.running && this.state.progress < 1 && (
              <button className="btn btn-primary" disabled={ !(this.props.zipFolderPath && this.props.unzipFolderPath) }
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