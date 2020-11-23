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
    // ipcRenderer.on('file-error', this.handleFileError.bind(this));
  }
  
  componentWillUnmount() {
    ipcRenderer.removeListener('finish-dialog', this.handleFolderPathChange.bind(this));
    ipcRenderer.removeListener('progress', this.handleProgress.bind(this));
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
      ipcRenderer.invoke('organize', this.props.unzipFolderPath, this.props.organizeIntoPath, this.state.renameStrategy);
    })
  }

  handleProgress(event, report) {
    console.log(report);
    const { running, progress, errored = [] } = report;
    const newState = {
      running,
      progress,
      errored,
    };
    this.setState(newState);
  }

  // handleFileError(event, report) {
  //   const newState = {
  //     errored: [...this.state.errored, report.fileName],
  //   };
  //   this.setState(newState);
  // }

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