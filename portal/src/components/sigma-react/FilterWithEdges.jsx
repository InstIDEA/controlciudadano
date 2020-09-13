import React from 'react'
import 'react-sigma/sigma/plugins.filter'

/* global sigma */

/**
 * based on https://github.com/dunnock/react-sigma/blob/ea9d7932d8a018704f59f1ede1777963b6904989/src/Filter.js
 */
class FilterWithEdges extends React.Component {
  filter;

  componentDidMount() {
    this.filter = new sigma.plugins.filter(this.props.sigma)
    this._apply(this.props)
  }

  componentWillUpdate(props) {
    if (props.nodesBy !== this.props.nodesBy
      || props.neighborsOf !== this.props.neighborsOf
      || props.edgesBy !== this.props.edgesBy
    )
      this._apply(props)
  }

  render = () => null

  _apply(props) {
    this.filter.undo(["neighborsOf", "nodesBy", "edgesBy"])
    if (props.neighborsOf) {
      this.filter.neighborsOf(props.neighborsOf, "neighborsOf")
    }
    if (props.nodesBy)
      this.filter.nodesBy(props.nodesBy, "nodesBy")
    if (props.edgesBy)
      this.filter.edgesBy(props.edgesBy, "edgesBy")
    this.filter.apply()
    if (this.props.sigma)
      this.props.sigma.refresh();
  }
}

export default FilterWithEdges;
