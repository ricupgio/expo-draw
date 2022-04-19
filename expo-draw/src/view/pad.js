import React from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native'
import Svg, { G, Path, Rect, Circle, } from 'react-native-svg';
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
    let x, y, timestamp, c, sW, dT
    [x, y, timestamp, c, sW, dT] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp, this.props.color, this.props.strokeWidth, this.props.drawType]

    let newCurrentPoints = this.state.currentPoints
    newCurrentPoints.push({ x, y, timestamp, c, sW, dT })

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
                  let newPoint = new Point(e[i].x, e[i].y, e[i].timestamp, e[i].c, e[i].sW)
                  points.push(newPoint)
                }

                if (e[0].dT == "L") {
                  return (<Path
                  key={e[0].timestamp}
                  d={this.state.pen.pointsToSvg(points)}
                  stroke={e[0].c || '#000000'}
                  strokeWidth={e[0].sW || 5}
                  fill="none"
                />)
                  }
                  else if (e[0].dT == "R") {
                    return (<Rect
                      key={e[0].timestamp}
                      x={points[0].x}
                      y={points[0].y}
                      width={points[points.length - 1].x - points[0].x}
                      height={points[points.length - 1].y - points[0].y}
                      strokeWidth={e[0].sW || 5}
                      stroke={e[0].c || '#000000'}
                    />)
                  } else {
                    return (<Circle key={e[0].timestamp} cx={points[0].x} cy={points[0].y} r={Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + Math.pow(points[points.length - 1].y - points[0].y, 2))} strokeWidth={e[0].sW || 5}
                      stroke={e[0].c || '#000000'}/>)
                  }
              }
              )
              }
              {
              this.props.drawType == "L" || this.state.currentPoints.length <= 1 ?
                <Path
                key={this.state.tracker}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke={this.props.color || "#000000"}
                strokeWidth={this.props.strokeWidth || 5}
                fill="none"
                /> : this.props.drawType == "R" ?
                <Rect
                key={this.state.tracker}
                x={this.state.currentPoints[0].x}
                y={this.state.currentPoints[0].y}
                width={this.state.currentPoints[this.state.currentPoints.length - 1].x - this.state.currentPoints[0].x}
                height={this.state.currentPoints[this.state.currentPoints.length - 1].y - this.state.currentPoints[0].y}
                strokeWidth={this.props.strokeWidth || 5}
                stroke={this.props.color || '#000000'}
                /> :
                <Circle key={this.state.tracker} cx={this.state.currentPoints[0].x} cy={this.state.currentPoints[0].y} r={Math.sqrt(Math.pow(this.state.currentPoints[this.state.currentPoints.length - 1].x - this.state.currentPoints[0].x, 2) + Math.pow(this.state.currentPoints[this.state.currentPoints.length - 1].y - this.state.currentPoints[0].y, 2))} strokeWidth={this.props.strokeWidth || 5} stroke={this.props.color || '#000000'}/>
            }
            </G>
          </Svg>
          {this.props.children}
        </View>
        <View style={styles.rowView}>
          <TouchableOpacity onPress={() => this.clear()}>
            <Text style={styles.labelText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.rewind()}>
            <Text style={styles.labelText}>Undo</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    display: 'flex'
  },
  svgContainer: {
    flex: 1,
    borderWidth: 2,

  },
  drawSurface: {
    flex: 1,
  },
  rowView: {
    height: "10%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 18,
  },
})
