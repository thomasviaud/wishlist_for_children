import React from 'react';
import { Button, Message, List } from 'semantic-ui-react';
import { Link } from 'react-router';

import WishlistItem from './WishlistItem.js';

class WishlistItems extends React.Component {

  constructor() {
    super();
    this.renderList = this.renderList.bind(this);
  }

  renderList() {
    const itemIds = Object.keys(this.props.items);
    if (itemIds.length === 0) {
      return (
        <Message visible>
          Your list is empty 😥
        </Message>
      );
    }

    return (
      <div>
        <List divided verticalAlign='middle'>
          {
            Object
            .keys(this.props.items)
            .map(key => <WishlistItem key={key} index={key} details={this.props.items[key]} removeToyFromWishlist={this.props.removeToyFromWishlist} />)
          }
        </List>
        <Link to='/thanks'>
          <Button positive fluid onClick={this.props.validateList}>
            Finish
          </Button>
        </Link>
      </div>
    )
  }

  render() {
    const itemIds = Object.keys(this.props.items);
    const total = itemIds.reduce((prevTotal, key) => {
      return prevTotal + 1;
    }, 0);
    return (
      <div className="wishlist-box">
        <h2>my Wishlist 📋 <span>({total})</span></h2>
        {this.renderList()}
      </div>
    )
  }
}

export default WishlistItems;