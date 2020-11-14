import React from 'react';
import { ipcRenderer } from 'electron';

import ListItem from './ListItem';

class SettingsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      zipFolderPath: null,
      outputPath: null,
    }
  }

  componentDidMount() {
    ipcRenderer.on('finish-dialog', this.handleZipFolderPathChange.bind(this));
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('finish-dialog', this.handleZipFolderPathChange.bind(this));
  }

  requestZipFolderPath() {
    ipcRenderer.invoke('open-dialog', 'zipFolderPath');
  }

  handleZipFolderPathChange(event, result) {
    if (result !== false) {
      const newState = {};
      newState[result.stateProperty] = result.path;
      this.setState(newState);
    }
  }

  render() {
    return (
    <div className="entity-list entity-list-expandable">
      <ListItem title="Zip Folder Location"
        description="Where your exported zip files from Google are located."
        icon="open-local"
        detail1={this.state.zipFolderPath}
        detail2={ <span className={ `glyph glyph-${this.state.zipFolderValid ? 'checkmark' : 'important'}` }></span> }
        onButtonClick={ () => this.requestZipFolderPath() }
      />
    </div>
    );
  }
}

export default SettingsList;