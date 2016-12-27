import React from 'react';
import WishlistSearch from './WishlistSearch';
import WishlistToy from './WishlistToy';
import WishlistItems from './WishlistItems';
import elasticsearch from 'elasticsearch';
import { Card } from 'semantic-ui-react'

let client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

class WishlistApp extends React.Component {

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.addToyToWishlist = this.addToyToWishlist.bind(this);
    this.removeToyFromWishlist = this.removeToyFromWishlist.bind(this);
    this.state = {
      toys: {},
      wishlist: {},
    }
  }

  handleChange(e) {
    const search_query = e.target.value
    console.log(search_query);
    client.search({
      index: 'wishlist_catalog',
      type: 'toy',
      body: {
        size: 20,
        query: {
          match: {
            title: search_query
          }
        }
      }
    }).then(function ( body ) {
      const toys = {};
      for (const item of body.hits.hits) {
        toys[`toy-${item._id}`] = item;
        (`toy-${item._id}` in this.state.wishlist) ?  toys[`toy-${item._id}`]._status = 'off' : toys[`toy-${item._id}`]._status = 'on';
      }
      this.setState({ toys })
    }.bind(this), function ( error ) {
      console.trace( error.message );
    });
  }

  addToyToWishlist(key) {
    const wishlist = {...this.state.wishlist};
    const toys = {...this.state.toys};
    wishlist[key] = toys[key];
    toys[key]._status = 'off';
    this.setState({ wishlist });
    this.setState({ toys });
  }

  removeToyFromWishlist(key) {
    const wishlist = {...this.state.wishlist};
    const toys = {...this.state.toys};
    delete wishlist[key]
    if (toys[key]) {
      toys[key]._status = 'on';
      this.setState({ toys });
    }
    this.setState({ wishlist });
  }

  render() {
    return (
      <div className="app">
        <div className="main">
          <WishlistSearch handleChange={this.handleChange} />
          <Card.Group className="list-of-toys">
            {
              Object
              .keys(this.state.toys)
              .map(key => <WishlistToy key={key} index={key} details={this.state.toys[key]} addToyToWishlist={this.addToyToWishlist} />)
            }
          </Card.Group>
        </div>
        <div className="sidebar">
          <WishlistItems items={this.state.wishlist} removeToyFromWishlist={this.removeToyFromWishlist} />
        </div>
      </div>
    )
  }
}

export default WishlistApp;