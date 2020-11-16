import { NAV_ITEMS } from './constants';

function SidebarNav(props) {
  return (
    <nav role="navigation" id="sidenav" className="nav side-navigation side-navigation-large theme-default">
      <header className="navigation-label page-header m-t-n p-l-xxxs">
        <h1 className="type-sh2 p-t-xxs">Export Organizer</h1>
        <h2 className="type-sh3">for Google Photos</h2>
      </header>
      <ul>
        {
          NAV_ITEMS.map((label, index) => {
            return (
              <li key={`NAV_ITEM_${index}`}
                className={props.currentNav === index ? 'color-fill-accent-vivid-high' : null}
              >
                <button className={
                    `btn btn-link${props.currentNav === index ? ' active' : ''}`
                  }
                  onClick={ () => props.changeView(index) }
                >
                  { label }
                </button>
              </li>
            );
          })
        }
      </ul>
    </nav>
  );
}

export default SidebarNav;
