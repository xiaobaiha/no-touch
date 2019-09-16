// import styles from './index.css';
// import { formatMessage } from 'umi-plugin-locale';
import MlImage from './MlImage';
import VideoPlayer from '../components/player/';

// console.log({ml5})
export default function() {
  const videoOptions = {
    autoplay: false,
    controls: true,
    width: 500,
    height: 300,
    sources: [{
      src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      type: 'video/mp4'
    }]
  }
  return (
    <div>
      <VideoPlayer {...videoOptions} />
      {/* <MlImage /> */}
    </div>
  );
}
