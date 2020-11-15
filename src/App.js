import React from 'react';

import SidebarNav from './SidebarNav';
import Step1 from './Views/Step1';
import SettingsList from './SettingsList';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: 0,
    }
  }

  render() {
    let CurrentView;
    switch (this.state.currentView) {
      default:
      case 0: {
        CurrentView = Step1;
        break;
      }
      case 1: {
        CurrentView = SettingsList;
        break;
      }
      case 2: {
        CurrentView = SettingsList;
        break;
      }
    }
    
    return (
      <section>
        <section className="row">
          <aside className="col-xs-6">
            <SidebarNav currentNav={ this.state.currentView }
              changeView={ (view) => this.setState({ currentView: view }) }
            />
          </aside>
          <section className="col-xs-18">
            <CurrentView />
          </section>
        </section>
      </section>
    );
  }
}

export default App;
