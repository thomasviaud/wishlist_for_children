import React from 'react';
import { Button, Header, Segment, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';

class WishlistIntro extends React.Component {

  render() {
    return (
      <div className="box">
        <Segment padded>
          <Header as='h2'>
            <Icon name='pointing right' />
            <Header.Content>
              Welcome to the Wishlist experiment
              <Header.Subheader>
                by Thomas VIAUD & Semere BITEW.
              </Header.Subheader>
            </Header.Content>
          </Header>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo tempora ab dignissimos, rerum, delectus corporis, similique maxime nam aspernatur assumenda culpa. Pariatur mollitia et fugiat, error obcaecati in sint! Odio.</p>
        </Segment>
        <Segment padded>
        <Link to="/app/0">
          <Button positive fluid>
            System 0
          </Button>
        </Link>
        </Segment>
        <Segment padded>
          <Link to="/app/1">
            <Button positive fluid>
              System 1
            </Button>
          </Link>
        </Segment>
      </div>
    )
  }
}

export default WishlistIntro;