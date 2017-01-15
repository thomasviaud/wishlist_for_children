import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Match, Miss } from 'react-router';

import './css/index.css';

import WishlistApp from './components/WishlistApp';
import WishlistIntro from './components/WishlistIntro';
import WishlistNotFound from './components/WishlistNotFound';
import WishlistFinish from './components/WishlistFinish';

const repo = `/${window.location.pathname.split('/')[1]}`;
const Root = () => {
  return (
    <BrowserRouter basename={repo}>
      <div>
        <Match exactly pattern="/" component={WishlistIntro} />
        <Match pattern="/app/1" component={WishlistApp} />
        <Match pattern="/app/0" component={WishlistApp} />
        <Match pattern="/thanks"component={WishlistFinish} />
        <Miss component={WishlistNotFound}/>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
