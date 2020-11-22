import React from 'react';
import { ipcRenderer } from 'electron';

import { NAV_ITEMS } from '../../constants';
import ListItem from '../ListItem';
import ProgressBar from '../ProgressBar';
import FilesTable from './FilesTable';

class Step2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      running: false,
      progress: 0,
      files: [],
      extracted: [],
      errored: [],
      showFiles: false,
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

  requestZipFolderPath() {
    ipcRenderer.invoke('open-dialog', 'zipFolderPath');
  }

  requestUnzipFolderPath() {
    ipcRenderer.invoke('open-dialog', 'unzipFolderPath');
  }

  handleFolderPathChange(event, result) {
    if (result !== false) {
      this.props.updatePath(result.stateProperty, result.path);
    }
  }

  requestExtract() {
    this.setState({ running: true }, () => {
      ipcRenderer.invoke('extract', this.props.zipFolderPath, this.props.unzipFolderPath);
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
        <h1 className="type-h2">{NAV_ITEMS[1]}</h1>
        <p className="type-p1">
          This step will extract and merge all of your exported <code>.zip</code> files from your Google Takeout
          into one place so they can be organized in Step 3.
        </p>
        <ul className="entity-list entity-list-expandable">
          <ListItem title="Zip Folder Location"
            description="Where your exported zip files from Google are located."
            icon="open-local"
            detail1={ this.props.zipFolderPath }
            detail2={ <span className={`glyph glyph-${this.props.zipFolderPath !== null ? 'checkmark' : 'important'}`}></span> }
            buttonText={ this.props.zipFolderPath ? 'Change' : 'Set' }
            onButtonClick={ () => this.requestZipFolderPath() }
          />
          <ListItem title="Extract Location"
            description="Where you want to extract your zip files to."
            icon="open-local"
            detail1={ this.props.unzipFolderPath }
            detail2={ <span className={`glyph glyph-${this.props.unzipFolderPath !== null ? 'checkmark' : 'important'}`}></span> }
            buttonText={ this.props.unzipFolderPath ? 'Change' : 'Set' }
            onButtonClick={ () => this.requestUnzipFolderPath() }
            button2Text="Use Zip Folder Location"
            onButton2Click={ () => this.props.updatePath('unzipFolderPath', this.props.zipFolderPath) }
          />
        </ul>

        <div className="container">
          <div className="alert alert-warning" role="alert">
            <div className="alert-title">This Will Take a While</div>
            <p>
              Fully extracting all of the files from your large Google Takeout export files will take a long time
              unless you don't have very many files, and interrupting the program may cause problems.
            </p>
            <p>
              Please ensure your computer has enough battery, and let the program run after clicking the button&mdash;after
              the first file is extracted, the progress bar will begin filling up to show you its progress.
            </p>
          </div>

          {
            !this.state.running && this.state.progress < 1 && (
              <button className="btn btn-primary" disabled={ !(this.props.zipFolderPath && this.props.unzipFolderPath) }
                onClick={ () => this.requestExtract() }
              >
                Begin File Extract
              </button>
            )
          }

          {
            this.state.running && (
              <ProgressBar
                progress={ this.state.progress }
                errored={ this.state.errored.length > 0 }
              />
            )
          }

          {
            this.state.files.length > 0 && (
              <FilesTable
                files={ this.state.files }
                extracted={ this.state.extracted }
                errored={ this.state.errored }
              />
            )
          }
        </div>
      </section>
    );
  }
}

export default Step2;