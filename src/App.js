import SettingsList from './SettingsList';

function App() {
  return (
    <div>
      <header className="page-header">
        <div className="container">
          <div className="row">
            <div className="col-xs-24">
              <h1 className="type-h2">Export Organizer</h1>
              <h2 className="type-sh2">for Google Photos</h2>
            </div>
          </div>
        </div>
      </header>
      <SettingsList />
    </div>
  );
}

export default App;
