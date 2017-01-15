import React from 'react';
import { Card, Label, Segment } from 'semantic-ui-react';

import WishlistToy from './WishlistToy';

class WishlistRecommended extends React.Component {
  render() {
    return(
      <Segment className="list-of-recommended">
      <Label attached='top left'>RECOMMENDATIONS ⭐️️</Label>
      <Card.Group>
        {
          Object
          .keys(this.props.recommended)
          .map(key => <WishlistToy key={key} index={key} details={this.props.recommended[key]} addToyToWishlist={this.props.addRecommendedToWishlist} />)
        }
      </Card.Group>
      </Segment>
    )
  }
}

export default WishlistRecommended;