import React from 'react';
import WishlistSearch from './WishlistSearch';
import WishlistToy from './WishlistToy';
import WishlistItems from './WishlistItems';
import WishlistRecommended from './WishlistRecommended';
import elasticsearch from 'elasticsearch';
import { Card } from 'semantic-ui-react'

let client = new elasticsearch.Client({
  host: 'localhost:9200',
  //log: 'trace'
})

class WishlistApp extends React.Component {

  constructor() {
    super();
    this.validateList = this.validateList.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addToyToWishlist = this.addToyToWishlist.bind(this);
    this.addRecommendedToWishlist = this.addRecommendedToWishlist.bind(this);
    this.removeToyFromWishlist = this.removeToyFromWishlist.bind(this);
    this.recommendedByBuckets = this.recommendedByBuckets.bind(this);
    this.state = {
      toys: {},
      wishlist: {},
      recommended: {},
    }
  }

  validateList() {
    const toys = {...this.state.wishlist};
    const array = [];
    for (let i in toys) {
      if (toys.hasOwnProperty(i)) {
        array.push(toys[i]);
      }
    }
    console.log(array);
    client.index({
      index: 'wishlist_lists',
      type: 'kidlist',
      body: {
        toys: array,
      }
    }, function (error, response) {
      //
    });
  }

  handleChange(e) {
    const search_query = e.target.value
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
    this.setState({ toys });
    this.setState({ wishlist }, () => {
      this.recommendedByBuckets(key); 
    }); 
  }

  addRecommendedToWishlist(key) {
    const wishlist = {...this.state.wishlist};
    const recommended = {...this.state.recommended};
    const toys = {...this.state.toys};
    wishlist[key] = recommended[key];
    if(key in this.state.toys) {
      toys[key]._status = 'off';
      this.setState({ toys });
    }
    this.setState({ wishlist },() => {
      this.recommendedByBuckets(key); 
    }); 
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
    // If the wishlist is not empty after removing one item
    const wishlistKeys = Object.keys(wishlist);
    if (wishlistKeys.length > 0) {
      const newKey = wishlistKeys.slice(-1)[0];
      console.log('New key : ',newKey);
      this.recommendedByBuckets(newKey);
    }
    else {
      console.log('Empty!');
      this.setState({ recommended:{}})
    }
  }

  recommendedByBuckets(key) {
    console.log('Key =>', key);
    console.log('Recommended items =>', this.state.recommended);
    console.log('Wishlist items =>', this.state.wishlist);
    // Bucket search
    client.search({
      index: 'wishlist_lists',
      type: 'kidlist',
      body: {
        query : {
          nested : {
            path: "toys",
            query : {
              match : {
                "toys._id" : this.state.wishlist[key]._id
              }
            }
          }
        },
        aggs : {
          toys : {
            nested : {
              path : "toys"
            },
            aggs : {
              recommended_toys : {
                significant_terms: {
                  field: "toys._id",
                  min_doc_count: 1
                }
              }
            }
          }
        }
      }
    }).then(function ( body ) {
      // Retrieve an array of recommended Ids
      const recommendedIds = [];
      for (const item of body.aggregations.toys.recommended_toys.buckets) {
        if (!(`toy-${item.key}` in this.state.wishlist)) {
          recommendedIds.push(item.key);
        }
      }
      // Search toys related to ids array
      client.search({
        index: 'wishlist_catalog',
        type: 'toy',
        body: {
          query: {
           terms: {
             _id: recommendedIds
           }
         }
        }
      }).then(function ( body ) {
        console.table(body.hits.hits);
        const recommended = {};
        for (const item of body.hits.hits) {
          recommended[`toy-${item._id}`] = item;
          recommended[`toy-${item._id}`]._status = 'on';
        }
        this.setState({ recommended })
      }.bind(this), function ( error ) {
        console.trace( error.message );
      });
    }.bind(this), function ( error ) {
      console.trace( error.message );
    });
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
          <WishlistRecommended recommended={this.state.recommended} addRecommendedToWishlist={this.addRecommendedToWishlist} />
        </div>
        <div className="sidebar">
          <WishlistItems items={this.state.wishlist} removeToyFromWishlist={this.removeToyFromWishlist} validateList={this.validateList} />
        </div>
      </div>
    )
  }
}

export default WishlistApp;