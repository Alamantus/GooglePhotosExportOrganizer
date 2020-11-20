import React from 'react';

import { NAV_ITEMS } from './constants';

import SidebarNav from './SidebarNav';
import Step1 from './Views/Step1';
import Step2 from './Views/Step2';
import Step3 from './Views/Step3';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: 0,
      zipFolderPath: null,
      unzipFolderPath: null,
      organizeIntoPath: null,
    }
  }

  updatePath(stateKey, path) {
    const newState = {};
    newState[stateKey] = path;
    this.setState(newState);
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
        CurrentView = Step2;
        break;
      }
      case 2: {
        CurrentView = Step3;
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
            <CurrentView
              zipFolderPath={ this.state.zipFolderPath }
              unzipFolderPath={ this.state.unzipFolderPath }
              organizeIntoPath={ this.state.organizeIntoPath }
              updatePath={ (stateKey, path) => this.updatePath(stateKey, path) }
            />
            <nav>
              <ul className="pager">
                {
                  this.state.currentView > 0 &&
                  <li className="pager-prev">
                    <button className="btn btn-link"
                      onClick={ () => this.setState({ currentView: this.state.currentView - 1 })}
                    >
                      <i aria-hidden="true" className="glyph glyph-chevron-left-2"></i> Previous Step
                    </button>
                  </li>
                }
                {
                  this.state.currentView < NAV_ITEMS.length &&
                  <li className="pager-next">
                    <button className="btn btn-link"
                      onClick={() => this.setState({ currentView: this.state.currentView + 1 })}
                    >
                      Next Step <i aria-hidden="true" className="glyph glyph-chevron-right-2"></i>
                    </button>
                  </li>
                }
              </ul>
            </nav>
          </section>
        </section>
      </section>
    );
  }
}

export default App;
