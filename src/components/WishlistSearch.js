import React from 'react';
import { Input } from 'semantic-ui-react';

class WishlistSearch extends React.Component {

  render() {
    return (
      <Input icon="search" fluid type="text" className="field" placeholder="Find your toys! 🎁" onChange={(e) => this.props.handleChange(e)}/>
    )
  }
}

export default WishlistSearch;