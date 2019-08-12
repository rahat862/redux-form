// @flow
import React, { Component } from 'react'
import { polyfill } from 'react-lifecycles-compat'
import PropTypes from 'prop-types'
import { withReduxForm } from './ReduxFormContext'
import type { ReactContext } from './types'

export type Props = {
  onSubmit: Function
}

type PropsWithContext = ReactContext & Props

class Form extends Component<PropsWithContext> {
  constructor(props: PropsWithContext) {
    super(props)
    if (!props._reduxForm) {
      throw new Error(
        'Form must be inside a component decorated with reduxForm()'
      )
    }
  }

  UNSAFE_componentWillMount() {
    this.props._reduxForm.registerInnerOnSubmit(this.props.onSubmit)
  }

  render() {
    const { _reduxForm, ...rest } = this.props
    return <form {...rest} />
  }
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  _reduxForm: PropTypes.object
}

polyfill(Form)
export default withReduxForm(Form)
