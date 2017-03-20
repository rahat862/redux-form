import { Component, PropTypes, createElement } from 'react'
import invariant from 'invariant'
import createConnectedFields from './ConnectedFields'
import shallowCompare from './util/shallowCompare'
import plain from './structure/plain'
import prefixName from './util/prefixName'

const validateNameProp = prop => {
  if (!prop) {
    return new Error('No "names" prop was specified <Fields/>')
  }
  if (!Array.isArray(prop) && !prop._isFieldArray) {
    return new Error('Invalid prop "names" supplied to <Fields/>. Must be either an array of strings or the fields array generated by FieldArray.')
  }
}

const createFields = ({ deepEqual, getIn, toJS, size }) => {

  const ConnectedFields = createConnectedFields({
    deepEqual,
    getIn,
    toJS,
    size
  })
  
  class Fields extends Component {
    constructor(props, context) {
      super(props, context)
      if (!context._reduxForm) {
        throw new Error('Fields must be inside a component decorated with reduxForm()')
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState)
    }

    componentWillMount() {
      const error = validateNameProp(this.props.names)
      if(error) {
        throw error
      }
      const { context } = this  
      const { _reduxForm: { register } } = context
      this.names.forEach(name => register(name, 'Field'))
    }

    componentWillReceiveProps(nextProps) {
      if (!plain.deepEqual(this.props.names, nextProps.names)) {
        const { context } = this
        const { register, unregister } = context._reduxForm
        // unregister old name
        this.props.names.forEach(name => unregister(prefixName(context, name)))
        // register new name
        nextProps.names.forEach(name => register(prefixName(context, name), 'Field'))
      }
    }

    componentWillUnmount() {
      const { context } = this
      const { unregister } = context._reduxForm
      this.props.names.forEach(name => unregister(prefixName(context, name)))
    }

    getRenderedComponent() {
      invariant(this.props.withRef,
        'If you want to access getRenderedComponent(), ' +
        'you must specify a withRef prop to Fields')
      return this.refs.connected.getWrappedInstance().getRenderedComponent()
    }

    get names() {
      const { context } = this
      return this.props.names.map(name => prefixName(context, name))
    }

    get dirty() {
      return this.refs.connected.getWrappedInstance().isDirty()
    }

    get pristine() {
      return !this.dirty
    }

    get values() {
      return this.refs.connected && this.refs.connected.getWrappedInstance().getValues()
    }

    render() {
      const { context } = this
      return createElement(ConnectedFields, {
        ...this.props,
        names: this.props.names.map(name => prefixName(context, name)),
        _reduxForm: this.context._reduxForm,
        ref: 'connected'
      })
    }
  }

  Fields.propTypes = {
    names: (props, propName) => validateNameProp(props[ propName ]),
    component: PropTypes.oneOfType([ PropTypes.func, PropTypes.string ]).isRequired,
    format: PropTypes.func,
    parse: PropTypes.func,
    props: PropTypes.object,
    withRef: PropTypes.bool
  }
  Fields.contextTypes = {
    _reduxForm: PropTypes.object
  }

  return Fields
}

export default createFields
