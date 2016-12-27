import React from 'react';
import { Header, Image, Card } from 'semantic-ui-react'

class WishlistToy extends React.Component {

  render() {
    const details = this.props.details._source;
    const isOn = this.props.details._status === 'on';
    return (
        <Card className="toy">
          <Image 
            src={details.image} 
            alt={details.title}
            label={{ as: 'a', color: 'green', corner: 'left', icon: 'plus', size: 'big'}} 
            fluid 
            disabled={!isOn}
            onClick={() => this.props.addToyToWishlist(this.props.index)}/>
          <Card.Content>
            <Header as='a' href={details.url} target="_blank" size='small' disabled={!isOn}>{details.title}</Header>
          </Card.Content>
        </Card>
    )
  }
}

export default WishlistToy;