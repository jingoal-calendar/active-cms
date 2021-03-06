/**
 * @file Lazyer.js
 * @author denglingbo
 *
 * Des
 */

import React, { Component } from 'react';
import Immutable from 'immutable';
import Module from './module';

class Lazyer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mod: null,
        }
    }

    componentWillMount() {
        this.load(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (!Immutable.is(nextProps.item, this.props.item)) {
            this.load(nextProps);
        }
    }

    load(props) {
        this.setState({
            mod: null
        });

        Module.asyncComponent(props.item)
            .then(module => {
                if (module) {
                    this.setState({
                        mod: module
                    })
                }
            })
    }

    render() {
        if (!this.state.mod) {
            return false;
        }

        return this.props.children(this.state.mod);
    }
}

export default Lazyer;
