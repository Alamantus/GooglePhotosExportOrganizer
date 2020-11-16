import React from 'react';
import { ipcRenderer } from 'electron';

import { NAV_ITEMS } from '../../constants';
import ListItem from './ListItem';

class Step2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      running: false,
      progress: 0,
    }
  }

  get progressPercent() {
    return this.state.progress * 100;
  }

  componentDidMount() {
    ipcRenderer.on('finish-dialog', this.handleFolderPathChange.bind(this));
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('finish-dialog', this.handleFolderPathChange.bind(this));
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
        <div>
          {
            !this.state.running && this.state.progress < 1 && (
              <button className="btn btn-primary" disabled={ !(this.props.zipFolderPath && this.props.unzipFolderPath) }
                onClick={ () => {} }
              >
                Begin File Extract
              </button>
            )
          }
          {
            this.state.running && this.state.progress <= 0 && (
              <div className="progress-bar">
                <div className="progress-circle"></div>
                <div className="progress-circle"></div>
                <div className="progress-circle"></div>
                <div className="progress-circle"></div>
                <div className="progress-circle"></div>
              </div>
            )
          }
          {
            this.state.progress > 0 && (
              <div>
                <div className="progress">
                  <div className="progress-bar" role="progressbar"
                    aria-valuenow={this.progressPercent} aria-valuemin="0" aria-valuemax="100"
                    style={{ width: this.progressPercent.toString() + '%' }}>
                    <span className="sr-only">{ this.progressPercent.toString() + '%' }</span>
                  </div>
                </div>
                {
                  this.state.progress >= 1 && (
                    <span><i className="glyph glyph-checkmark" /></span>
                  )
                }
              </div>
            )
          }
        </div>
      </section>
    );
  }
}

export default Step2;