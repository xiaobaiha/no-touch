import React from 'react';
import videojs from 'video.js/core';
import { initPlugin } from '../../lib/videojs-abplayer-comment/videojs_abplayer';
import 'video.js/dist/video-js.css';

class VideoPlayer extends React.Component {
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, () => {
      initPlugin();
      this.player.ABP();
      this.player.danmu.load('https://raw.githubusercontent.com/Catofes/videojsABdm/a682f377b5a1594be45c41190b5cb00cd48906dc/demo/comment.xml')
    });
    
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div>	
        <div data-vjs-player>
          <video ref={ node => this.videoNode = node } className="video-js"></video>
        </div>
      </div>
    )
  }
}

export default VideoPlayer;