import React from 'react';
import { Header, Segment, Icon } from 'semantic-ui-react';

class WishlistFinish extends React.Component {
  
  render() {
    return (
      <div className="box">
        <Segment padded>
          <Header as='h2'>
            <Icon name='warning' />
            <Header.Content>
              Thank you !
              <Header.Subheader>
                Hope you enjoyed this experiment.
              </Header.Subheader>
            </Header.Content>
          </Header>
        </Segment>
      </div>
    )
  }
}

export default WishlistFinish;