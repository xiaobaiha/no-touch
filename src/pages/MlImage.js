import React from 'react';
import { Button } from 'antd';
import * as ml5 from "ml5/dist/ml5.min";
import Image from '../assets/yay.jpg';

class MlImage extends React.Component {
  state = {
    result: '',
  }

  componentDidMount() {
    this.initClassifier();
    
  }

  initClassifier = async () => {
    this.classifier = await ml5.imageClassifier('MobileNet');
    console.log('this.classifier: ', this.classifier);
  }

  classifier = () => {
    this.classifier.predict(document.getElementById('image'), function(err, results) {
      console.log(results);
    });
  }

  render() {
    const { result } = this.state;
    return (
      <div>
        <img id="image" src={Image} alt="yay" />
        <Button onClick={this.classifier}>classifier</Button>
        {result}
      </div>
    );
  }
}

export default MlImage;