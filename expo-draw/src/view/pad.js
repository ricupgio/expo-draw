import React from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native'
import Svg, { G, Path } from 'react-native-svg';

import Pen from '../tools/pen'
import Point from '../tools/point'

export default class Whiteboard extends React.Component {

  constructor(props) {
    super()
    this.state = {
      tracker: 0,
      currentPoints: [],
      previousStrokes: [],
      pen: new Pen(),
      color: 'black'
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
    })
    const rewind = props.rewind || function () { }
    const clear = props.clear || function () { }
    this._clientEvents = {
      rewind: rewind(this.rewind),
      clear: clear(this.clear),
    }

  }

  componentDidMount () {
    if(this.props.strokes)
      this.setState({strokes: this.props.strokes})
  }

  componentDidUpdate () {
    if(this.props.enabled == false && this.props.strokes !== undefined && this.props.strokes.length !== this.state.previousStrokes.length)
      this.setState({ previousStrokes: this.props.strokes || this.state.previousStrokes })
  }

  rewind = () => {
    if (this.state.currentPoints.length > 0 || this.state.previousStrokes.length < 1) return
    let strokes = this.state.previousStrokes
    strokes.pop()

    this.state.pen.rewindStroke()

    this.setState({
      previousStrokes: [...strokes],
      currentPoints: [],
      tracker: this.state.tracker - 1,
    })

    this._onChangeStrokes([...strokes])
  }

  clear = () => {
    this.setState({
      previousStrokes: [],
      currentPoints: [],
      tracker: 0,
    })
    this.state.pen.clear()
    this._onChangeStrokes([])
  }

  onTouch(evt) {
    if (this.props.enabled == false) return;
    let x, y, timestamp, color
    [x, y, timestamp, color] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp, this.state.color]

    let newCurrentPoints = this.state.currentPoints
    newCurrentPoints.push({ x, y, timestamp,color })

    this.setState({
      previousStrokes: this.state.previousStrokes,
      currentPoints: newCurrentPoints,
      tracker: this.state.tracker
    })
  }

  onResponderGrant(evt) {
    this.onTouch(evt);
  }

  onResponderMove(evt) {
    this.onTouch(evt);
  }

  onResponderRelease() {
    let strokes = this.state.previousStrokes
    if (this.state.currentPoints.length < 1) return

    var points = this.state.currentPoints

    this.state.pen.addStroke(this.state.currentPoints)

    this.setState({
      previousStrokes: [...strokes, points],
      strokes: [],
      currentPoints: [],
      tracker: this.state.tracker + 1,
    })
    this._onChangeStrokes([...strokes, points])
  }

  _onLayoutContainer = (e) => {
    this.state.pen.setOffset(e.nativeEvent.layout);
  }

  _onChangeStrokes = (strokes) => {
    if (this.props.onChangeStrokes) this.props.onChangeStrokes(strokes)
  }

  render() {
    var props = this.props.enabled != false ? this._panResponder.panHandlers : {}

    return (
      <View style = {{flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
        
         <View
        onLayout={this._onLayoutContainer}
        style={[
          styles.drawContainer,
          this.props.containerStyle,
        ]}>
        <View style={styles.svgContainer} {...props}>
          
          <Svg style={styles.drawSurface}>
            <G>
              {this.state.previousStrokes.map((e) => {
                var points = [];

                for (var i in e) {
                  let newPoint = new Point(e[i].x, e[i].y, e[i].timestamp, e[i].color)
                  points.push(newPoint)
                }

                return (<Path
                  key={e[0].timestamp}
                  d={this.state.pen.pointsToSvg(points)}
                  stroke={e[0].color}
                  strokeWidth={this.props.strokeWidth || 4}
                  fill="none"
                />)
              }
              )
              }
              <Path
                key={this.state.tracker}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke={"red"}
                strokeWidth={this.props.strokeWidth || 4}
                fill="none"
              />
            </G>
          
          </Svg>
         
          {this.props.children}
      
        </View>
 
            

      </View>
      <View style = {{flexDirection: 'row', marginTop: 10}}>
            <TouchableOpacity
            style = {styles.button}
            onPress={() => {this.clear()}}
            >
              <Text>clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style = {styles.button}
            onPress={() => {this.rewind()}}
            >
              <Text>undo</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style = {styles.button}
            onPress={() => {this.setState({
              color: 'orange'
            })}}
            >
              <Text>color</Text>
            </TouchableOpacity>

          </View>
      </View>
     
    )
  }
}

let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    display: 'flex',

  },
  button: {
    width: '20%',
    height: 40,
    borderWidth: 1,
    marginHorizontal: 40
    
  },  
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
})
