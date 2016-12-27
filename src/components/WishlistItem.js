import React from 'react';
import { Button, List, Image } from 'semantic-ui-react';

class WishlistItem extends React.Component {

  render() {
    const details = this.props.details._source;
    return (
      <List.Item>
        <Image avatar src={details.image} />
        <List.Content>
          <List.Header as='a' href={details.url} target='_blank'>{
            (details.title.length < 18 )? details.title :  `${details.title.substring(0, 18)}...`
          }</List.Header>
        </List.Content>
        <Button circular color='red' floated='right' size='mini' icon="remove" onClick={() => this.props.removeToyFromWishlist(this.props.index)}/>
      </List.Item>
    )
  }
}

export default WishlistItem;