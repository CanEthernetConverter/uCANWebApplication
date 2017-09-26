import React from 'react';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem } from 'react-bootstrap';
import PropTypes from 'prop-types';
// var config = require('./CAN/config.json');

export default class Header extends React.Component {  

    constructor(props) {
      super(props);

      fetch('/CAN/config.json')
    .then(response => response.json())
    .then((json) => {
      this.NodeRedPort = json.NodeRedPort;
      this.WindowLocation = window.location.hostname;
      this.forceUpdate();
});
    }



  render(){
    return (
      <Navbar inverse collapseOnSelect fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">uCAN Tools 0.0.2</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav onSelect={this.props.itemSelectCallback} >
            <NavItem eventKey={1} href="#">CAN Logger</NavItem>
            <NavItem eventKey={2} href="#">uCAN Network</NavItem>
            <NavItem eventKey={3} onClick={() => window.location.href = ("http://" + this.WindowLocation + ":" + this.NodeRedPort)}>Node-RED</NavItem>  
          </Nav> 
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

Header.propTypes = {
  itemSelectCallback: React.PropTypes.func
};



// <NavItem eventKey={2} href="#">UCAN Network</NavItem>
// <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
//   <MenuItem eventKey={3.1}>Action</MenuItem>
//   <MenuItem eventKey={3.2}>Another action</MenuItem>
//   <MenuItem eventKey={3.3}>Something else here</MenuItem>
//   <MenuItem divider />
//   <MenuItem eventKey={3.3}>Separated link</MenuItem>
// </NavDropdown>
// <Nav pullRight>
//   <NavItem eventKey={1} href="#">Link Right</NavItem>
//   <NavItem eventKey={2} href="#">Link Right</NavItem>
// </Nav>
