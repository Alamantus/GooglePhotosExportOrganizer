import React from 'react';

import packageDetails from '../package.json';
import { APP_URL, NAV_ITEMS } from './constants';

import SidebarNav from './SidebarNav';
import ExternalLink from './ExternalLink';
import Step1 from './Views/Step1';
import Step2 from './Views/Step2';
import Step3 from './Views/Step3';
import Step4 from './Views/Step4';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: 0,
      zipFolderPath: null,
      unzipFolderPath: null,
      organizeIntoPath: null,
      newVersion: false,
    }
  }

  componentDidMount() {
    // Check for updates
    fetch('https://api.github.com/repos/Alamantus/GooglePhotosExportOrganizer/releases/latest', {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/vnd.github.v3+json',
      }),
    }).then((response) => response.json())
    .then((release) => {
      if (typeof release.tag_name !== 'undefined' && release.tag_name > packageDetails.version) {
        this.setState({ newVersion: true });
      }
    })
  }

  updatePath(stateKey, path) {
    const newState = {};
    newState[stateKey] = path;
    this.setState(newState);
  }

  changeView(view) {
    this.setState({ currentView: view }, () => {
      window.scrollTo(0, 0);
    })
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
      case 3: {
        CurrentView = Step4;
        break;
      }
    }
    
    return (
      <section className="row">
        <aside className="col-xs-6">
          <SidebarNav currentNav={ this.state.currentView }
            changeView={ (view) => this.changeView(view) }
          />
        </aside>
        <section className="col-xs-18">
          {
            this.state.newVersion && (
              <div className="alert-stack" role="alert">
              <div className="alert alert-danger" role="alert">
                <div className="alert-title">A New Version is Available</div>
                <div className="row">
                  <div className="col-md-20">
                    <p>Please visit the Google Photos Export Organizer page to get the newest version.</p>
                  </div>
                  <div className="col-md-4">
                    <p>
                      <ExternalLink href={ APP_URL }
                        className="pull-right hidden-xs hidden-sm">
                        Download Now!
                      </ExternalLink>
                      <ExternalLink href={ APP_URL }
                        className="visible-xs-inline visible-sm-inline hidden-md">
                        Download Now!
                      </ExternalLink>
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )
          }
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
                    onClick={ () => this.changeView(this.state.currentView - 1) }
                  >
                    <i aria-hidden="true" className="glyph glyph-chevron-left-2"></i> Previous Step
                  </button>
                </li>
              }
              {
                this.state.currentView < NAV_ITEMS.length - 1 &&
                <li className="pager-next">
                  <button className="btn btn-link"
                    onClick={ () => this.changeView(this.state.currentView + 1) }
                  >
                    Next Step <i aria-hidden="true" className="glyph glyph-chevron-right-2"></i>
                  </button>
                </li>
              }
            </ul>
          </nav>
        </section>
      </section>
    );
  }
}

export default App;
