import React from 'react';

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
    }
  }

  render() {
    return (
      <li className={ `entity-list-item${this.state.expanded ? ' active' : ''}` }
        style={{ listStyle: 'none' }}
        onClick={() => this.setState({ expanded: true })}
      >
        <div className="item-icon">
          <span className={ `glyph glyph-${this.props.icon}` }></span>
        </div>
        <div className="item-content-secondary">
          <div className="content-text-primary">{ this.props.detail1 }</div>
          <div className="content-text-secondary">{ this.props.detail2 }</div>
        </div>
        <div className="item-content-primary">
          <div className="content-text-primary">{ this.props.title }</div>
          <div className="content-text-secondary">{ this.props.description }</div>
        </div>
        <div className="item-content-expanded">
          <button className="btn btn-default" onClick={this.props.onButtonClick}>
            { this.props.buttonText }
          </button>
          {
            !this.props.onButton2Click ? null : (
            <button className="btn btn-default" onClick={this.props.onButton2Click}>
              { this.props.button2Text }
            </button>
            )
          }
        </div>
      </li>
    );
  }
}

export default ListItem;