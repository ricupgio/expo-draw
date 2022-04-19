# Expo Draw
Expo draw tool using react-native-svg. (Forked from [rn-draw](https://github.com/jayeszee/rn-draw))

[![rn-draw.gif](https://s1.gifyu.com/images/rn-draw.gif)](https://gifyu.com/image/pLIr)

# Installation

First install [react-native-svg](https://github.com/react-native-community/react-native-svg) `expo install react-native-svg`

Then install expo-draw with `npm install --save @marangonieduardo/expo-draw` or `npm install --save git+https://github.com/MarangoniEduardo/expo-draw`

# How to use
```
import ExpoDraw from 'expo-draw'
  
<ExpoDraw
  strokes={[]}
  containerStyle={{backgroundColor: 'rgba(0,0,0,0.01)'}}
  rewind={(undo) => {this._undo = undo}}
  clear={(clear) => {this._clear = clear}}
  color={'#000000'}
  strokeWidth={4}
  enabled={true}
  onChangeStrokes={(strokes) => console.log(strokes)}
/>

### Props
**strokes** [Array] - set with some initial data. (defaults to [])

**containerStyle** [Object] - style for the container of the draw component.

**color** [String] - string representation of pen color (defaults to '#000000')

**strokeWidth** [Number] - width of pen strokes (defaults to 4)

**rewind** [Func] - a function for passing the draw component's undo functionality

**clear** [Func] - a function for passing the draw component's clear functionality

**onChangeStrokes** [Func] - callback that is called when the draw changes.

**enabled** [Boolean] - set if user can edit it. If false it disable also all touch event, so you can use it easly on GestureView like ScrollView.
```

# Tips when implementing

You can save a screenshot of your canvas using `takeSnapshotAsync`, the method from expo, like so:

```
import { captureRef as takeSnapshotAsync } from 'react-native-view-shot';
  
mySaveFx = async () => {
	const signatureResult = await takeSnapshotAsync(this.refOfExpoDrawElement, {
		result: 'tmpfile',
		quality: 0.5,
		format: 'png',
	});

  //The output will be a local tmpfile (uri)[String], with the current lines that were drawn. Therefore, you can save it or so! ;)
  console.log(signatureResult);
}

```

You can also save strokes array as json, for example, on firebase. In order to support all displays i recommend to use fixed dimensions:

```

  state = {
    strokes: []
  }

  saveOnFirebase = () => {
    firebase.firestore().collection('signature').doc().set({strokes})
  }

  render() {
    return(
      <View>
        <ExpoDraw
          strokes={[]}
          containerStyle={{backgroundColor: 'rgba(0,0,0,0.01)', height: 300, width: 500}}
          rewind={(undo) => {this._undo = undo}}
          clear={(clear) => {this._clear = clear}}
          color={'#000000'}
          strokeWidth={4}
          enabled={true}
          onChangeStrokes={(strokes) => this.setState({strokes})}
        />
        <Button onPress={saveOnFirebase} title={"Save my signature"}/>
      </View>
    )
  }


```

# Context on why I forked
As of the time I was implementing rn-draw, with expo SDK 36.0.0. I faced an error on the Svg.G dependency, which I then fixed for my expo application.

So, I hope I can help whoever is facing issues with the rn-draw for expo. If you want to use the original lib, here it is! -> [rn-draw](https://github.com/jayeszee/rn-draw)

**Observation:** I'm using it for digital signature capturing in my app, if you are looking for something like this, I would say this lib is pretty ok for the mentioned purpose!