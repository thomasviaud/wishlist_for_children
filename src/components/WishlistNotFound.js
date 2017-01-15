import React from 'react';
import { Header, Segment, Icon } from 'semantic-ui-react';

class WishlistNotFound extends React.Component {

  render() {
    return (
      <div className="box">
        <Segment padded>
          <Header as='h2'>
            <Icon name='warning' />
            <Header.Content>
              Page not found.
              <Header.Subheader>
                This page does not exist. Please go back to the intro.
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
      </div>
    )
  }
}

export default WishlistNotFound;