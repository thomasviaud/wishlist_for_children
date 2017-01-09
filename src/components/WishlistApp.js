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
    this.recommendedByRandom = this.recommendedByRandom.bind(this);
    this.recommendedByBuckets = this.recommendedByBuckets.bind(this);
    this.recommendedByQuery = this.recommendedByQuery.bind(this);
    this.recommendationBuilder = this.recommendationBuilder.bind(this);
    this.getWishlistIds = this.getWishlistIds.bind(this);
    this.state = {
      toys: {},
      wishlist: {},
      recommended: {},
    }
  }

  componentWillMount() {
    this.recommendedByRandom(5, res => {
      this.setState({recommended: res});
    })
  }
  // When the kid is done, he needs to validate his list. It will create a new entry in an ES index to
  // later search by buckets.
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

  // Each time the search input is edited it will query the main ES index of toys 
  // and update the state accordingly.
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
    }).then(( body ) => {
      const toys = {};
      for (const item of body.hits.hits) {
        toys[`toy-${item._id}`] = item;
        (`toy-${item._id}` in this.state.wishlist) ?  toys[`toy-${item._id}`]._status = 'off' : toys[`toy-${item._id}`]._status = 'on';
      }
      this.setState({ toys })
    });
  }

  // Add a toy from the results into the wishlist.
  addToyToWishlist(key) {
    const wishlist = {...this.state.wishlist};
    const toys = {...this.state.toys};
    wishlist[key] = toys[key];
    toys[key]._status = 'off';
    this.setState({ toys });
    this.setState({ wishlist }, () => {
      console.log('Recommendation builder !');
      this.recommendationBuilder(key);
    }); 
  }

  // Add a toy from the recommendation bar into the wishlist.
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
      this.recommendationBuilder(key);
    }); 
  }

  // Remove a toy from the wishlist.
  removeToyFromWishlist(key) {
    const wishlist = {...this.state.wishlist};
    const toys = {...this.state.toys};
    delete wishlist[key]
    if (toys[key]) {
      toys[key]._status = 'on';
      this.setState({ toys });
    }
    this.setState({ wishlist }, () => {
      // If the wishlist is not empty after removing one item
      const wishlistKeys = Object.keys(wishlist);
      if (wishlistKeys.length > 0) {
        const newKey = wishlistKeys.slice(-1)[0];
        this.recommendationBuilder(newKey);
      }
      else {
        console.log('Empty wishlist, random recommendation!');
        this.recommendedByRandom(5, (res) => {
          this.setState({recommended: res})
        });
      }
    });
  }

  getWishlistIds() {
    const wishlistIds = Object.keys(this.state.wishlist).map(i => {
      return this.state.wishlist[i]._id;
    })
    return wishlistIds;
  }

  recommendationBuilder(key) {
    let recommended, recommendedMid;
    this.recommendedByBuckets(key,3, (res) => {
      const recommendedByBuckets = res;
      console.log('RecommendedByBuckets =>', recommendedByBuckets);
      const recommendedByBucketsLen = res ? Object.keys(res).length : 0;
      console.log('RecommendedByBucketsLen =>', recommendedByBucketsLen);
      this.recommendedByQuery(key, 5 - recommendedByBucketsLen, (res) => {
        const recommendedByQuery = res;
        console.log('RecommendedByQuery =>', recommendedByQuery);
        recommendedMid = Object.assign({}, recommendedByBuckets, recommendedByQuery);
        console.log('RecommendedMid =>', recommendedMid);
        const recommendedMidLen = recommendedMid ? Object.keys(recommendedMid).length : 0;
        console.log('RecommendedMidLen =>', recommendedMidLen);
        if(recommendedMidLen < 5) {
            this.recommendedByRandom(5 - recommendedMidLen, (res) =>{
            recommended = Object.assign({}, recommendedMid, res);
            console.log("Recommended < 5", recommended);
            this.setState({recommended});
          });
        }
        else {
          recommended = recommendedMid;
          this.setState({recommended});
        }
      });
    });
  }

  recommendedByQuery(key, n, cb) {
    // Query search
    client.search({
      index: 'wishlist_catalog',
      type: 'toy',
      body: {
        size: n,
        query: {
          bool: {
            must_not: {
                ids: {
                  values: this.getWishlistIds()
              }
            },
            should: {
              match: {
                title: this.state.wishlist[key]._source.title
              }
            }
          }
        }
      }
    }).then(( body ) => {
      const recommended = {};
      for (const item of body.hits.hits) {
        recommended[`toy-${item._id}`] = item;
        recommended[`toy-${item._id}`]._status = 'on';
      }
      cb(recommended);
    });
  }

  recommendedByBuckets(key, n, cb) {
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
                  min_doc_count: 1,
                  size:n,
                  exclude : this.getWishlistIds()
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
        recommendedIds.push(item.key);
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
      }).then(( body ) => {
        console.table(body.hits.hits);
        const recommended = {};
        for (const item of body.hits.hits) {
          recommended[`toy-${item._id}`] = item;
          recommended[`toy-${item._id}`]._status = 'on';
        }
        //this.setState({ recommended })
        cb(recommended);
      });
    });
  }

  recommendedByRandom(n, cb) {
    client.search({
      index: 'wishlist_catalog',
      type: 'toy',
      body: {
        size: n,
        query: {
          function_score: {
            functions: [
              {
                random_score: {
                  seed: Date.now()
                }
              }
            ]
          }
        }
      }
    }).then(function ( body ) {
      const recommended = {};
      for (const item of body.hits.hits) {
        if (!(`toy-${item._id}` in this.state.toys)) {
          recommended[`toy-${item._id}`] = item;
          recommended[`toy-${item._id}`]._status = 'on';
        }
        if (Object.keys(recommended).length === 5) {
          break;
        }
      }
      //this.setState({ recommended })
      cb(recommended);
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