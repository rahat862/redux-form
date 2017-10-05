/* eslint react/no-multi-comp:0 */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { combineReducers as plainCombineReducers, createStore } from 'redux'
import { combineReducers as immutableCombineReducers } from 'redux-immutablejs'
import TestUtils from 'react-dom/test-utils'
import createReduxForm from '../createReduxForm'
import createReducer from '../createReducer'
import createField from '../createField'
import Form from '../Form'
import plain from '../structure/plain'
import plainExpectations from '../structure/plain/__tests__/expectations'
import immutable from '../structure/immutable'
import immutableExpectations from '../structure/immutable/__tests__/expectations'

import SubmissionError from '../SubmissionError'
import actions from '../actions'

const {
  change,
  clearSubmit,
  setSubmitFailed,
  setSubmitSucceeded,
  submit,
  touch,
  updateSyncErrors
} = actions

const propsAtNthRender = (componentSpy, callNumber) =>
  componentSpy.mock.calls[callNumber][0]

const describeForm = (name, structure, combineReducers, setup) => {
  const reduxForm = createReduxForm(structure)
  const Field = createField(structure)
  const reducer = createReducer(structure)
  const { fromJS, getIn } = structure
  const makeStore = (initial = {}, logger) => {
    const reducers = { form: reducer }
    if (logger) {
      reducers.logger = logger
    }
    return createStore(combineReducers(reducers), fromJS({ form: initial }))
  }

  describe(name, () => {
    beforeAll(() => {
      setup()
    })

    it('should throw an error if not in ReduxForm', () => {
      expect(() => {
        TestUtils.renderIntoDocument(
          <div>
            <Form onSubmit={() => {}} />
          </div>
        )
      }).toThrow(/must be inside a component decorated with reduxForm/)
    })

    it('should output a <form> element with all props mapped', () => {
      const store = makeStore({
        testForm: {
          values: {
            foo: 42
          }
        }
      })
      const onSubmit = jest.fn()
      class TestForm extends Component {
        render() {
          return (
            <Form
              onSubmit={onSubmit}
              action="/save"
              method="post"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Field name="foo" component="input" />
            </Form>
          )
        }
      }
      const DecoratedTestForm = reduxForm({ form: 'testForm' })(TestForm)
      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DecoratedTestForm />
        </Provider>
      )

      expect(onSubmit).not.toHaveBeenCalled()

      const tag = TestUtils.findRenderedDOMComponentWithTag(dom, 'form')

      // 🤢 Is there a better way to get the props on the <form> ??
      const props = tag[Object.keys(tag)[1]]

      expect(props.onSubmit).toBe(onSubmit)
      expect(props.action).toBe('/save')
      expect(props.method).toBe('post')
      expect(props.target).toBe('_blank')
    })

    it('should call the onSubmit given to <Form> when instance API submit() is called', () => {
      const store = makeStore({
        testForm: {
          values: {
            foo: 42
          }
        }
      })
      const onSubmit = jest.fn().mockImplementation(() => 7)
      class TestForm extends Component {
        render() {
          return (
            <Form onSubmit={this.props.handleSubmit(onSubmit)}>
              <Field name="foo" component="input" />
            </Form>
          )
        }
      }
      const DecoratedTestForm = reduxForm({ form: 'testForm' })(TestForm)
      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DecoratedTestForm />
        </Provider>
      )

      const decoratedForm = TestUtils.findRenderedComponentWithType(
        dom,
        DecoratedTestForm
      )

      expect(onSubmit).not.toHaveBeenCalled()

      const result = decoratedForm.submit()
      expect(result).toBe(7)

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqualMap({ foo: 42 })
      expect(typeof onSubmit.mock.calls[0][1]).toBe('function')
      expect(onSubmit.mock.calls[0][2].values).toEqualMap({ foo: 42 })
    })

    it('should call the onSubmit given to <Form> when SUBMIT action is dispatched', () => {
      const store = makeStore({
        testForm: {
          values: {
            foo: 42
          }
        }
      })
      const onSubmit = jest.fn()
      class TestForm extends Component {
        render() {
          return (
            <Form onSubmit={this.props.handleSubmit(onSubmit)}>
              <Field name="foo" component="input" />
            </Form>
          )
        }
      }
      const DecoratedTestForm = reduxForm({ form: 'testForm' })(TestForm)
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DecoratedTestForm />
        </Provider>
      )

      expect(onSubmit).not.toHaveBeenCalled()

      store.dispatch(submit('testForm'))

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqualMap({ foo: 42 })
      expect(typeof onSubmit.mock.calls[0][1]).toBe('function')
      expect(onSubmit.mock.calls[0][2].values).toEqualMap({ foo: 42 })
    })

    it('should properly handle submission errors', () => {
      const store = makeStore({
        testForm: {
          values: {
            foo: 42
          }
        }
      })
      const onSubmit = jest.fn().mockImplementation(() => {
        throw new SubmissionError({ _error: 'Invalid' })
      })
      const formRender = jest.fn()
      class TestForm extends Component {
        render() {
          formRender(this.props)
          return (
            <Form onSubmit={this.props.handleSubmit(onSubmit)}>
              <Field name="foo" component="input" />
            </Form>
          )
        }
      }
      const DecoratedTestForm = reduxForm({ form: 'testForm' })(TestForm)
      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DecoratedTestForm />
        </Provider>
      )

      expect(formRender).toHaveBeenCalled()
      expect(formRender).toHaveBeenCalledTimes(1)

      const decoratedForm = TestUtils.findRenderedComponentWithType(
        dom,
        DecoratedTestForm
      )

      expect(onSubmit).not.toHaveBeenCalled()

      decoratedForm.submit()

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqualMap({ foo: 42 })
      expect(typeof onSubmit.mock.calls[0][1]).toBe('function')
      expect(onSubmit.mock.calls[0][2].values).toEqualMap({ foo: 42 })

      expect(formRender).toHaveBeenCalledTimes(3)
      expect(formRender.mock.calls[2][0].error).toBe('Invalid')
    })

    it('should NOT submit a form with sync validation errors', () => {
      const logger = jest.fn((state = {}) => state)
      const store = makeStore({}, logger)
      const inputRender = jest.fn(props => <input {...props.input} />)
      const onSubmit = jest.fn()
      const formRender = jest.fn()
      const validate = values => {
        const errors = {}
        if (!getIn(values, 'foo')) {
          errors.foo = 'Required'
        }
        return errors
      }
      class TestForm extends Component {
        render() {
          formRender(this.props)
          return (
            <Form onSubmit={this.props.handleSubmit(onSubmit)}>
              <Field name="foo" component={inputRender} />
            </Form>
          )
        }
      }
      const DecoratedTestForm = reduxForm({
        form: 'testForm',
        validate
      })(TestForm)
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <DecoratedTestForm />
        </Provider>
      )

      let callIndex = logger.mock.calls.length

      // form renders before sync validation and then again with invalid flag
      expect(formRender).toHaveBeenCalledTimes(2)
      expect(propsAtNthRender(formRender, 0).invalid).toBe(false)
      expect(propsAtNthRender(formRender, 1).invalid).toBe(true)
      expect(propsAtNthRender(formRender, 1).submitFailed).toBe(false)

      // try to submit invalid form via dispatching submit action
      store.dispatch(submit('testForm'))

      // check that submit action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(submit('testForm'))

      // check that clear submit action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(clearSubmit('testForm'))

      // check that touch action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        touch('testForm', 'foo')
      )

      // check that setSubmitFailed action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        setSubmitFailed('testForm', 'foo')
      )

      // form rerendered twice, once with submit trigger, and then after submit failure
      expect(formRender).toHaveBeenCalledTimes(4)
      expect(propsAtNthRender(formRender, 3).invalid).toBe(true)
      expect(propsAtNthRender(formRender, 3).submitFailed).toBe(true)

      // update input
      inputRender.mock.calls[0][0].input.onChange('hello')

      // check that change action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        change('testForm', 'foo', 'hello', false, false)
      )

      // check that updateSyncErrors action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        updateSyncErrors('testForm', {})
      )

      // rerendered once to flip dirty flag, and again to flip invalid flag
      expect(formRender).toHaveBeenCalledTimes(6)
      expect(propsAtNthRender(formRender, 3).dirty).toBe(false)
      expect(propsAtNthRender(formRender, 4).dirty).toBe(true)
      expect(propsAtNthRender(formRender, 4).invalid).toBe(true)
      expect(propsAtNthRender(formRender, 5).invalid).toBe(false)
      expect(propsAtNthRender(formRender, 5).submitFailed).toBe(true)

      // dispatch submit action on now valid form
      store.dispatch(submit('testForm'))

      // check that submit action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(submit('testForm'))

      // check that clear submit action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(clearSubmit('testForm'))

      // check that touch action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        touch('testForm', 'foo')
      )

      // check that submit succeeded action was dispatched
      expect(logger.mock.calls[callIndex++][1]).toEqual(
        setSubmitSucceeded('testForm')
      )

      // check no additional actions dispatched
      expect(logger).toHaveBeenCalledTimes(callIndex)

      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toEqualMap({ foo: 'hello' })
      expect(typeof onSubmit.mock.calls[0][1]).toBe('function')
      expect(onSubmit.mock.calls[0][2].values).toEqualMap({ foo: 'hello' })
    })
  })
}

describeForm('Form.plain', plain, plainCombineReducers, () =>
  expect.extend(plainExpectations)
)
describeForm('Form.immutable', immutable, immutableCombineReducers, () =>
  expect.extend(immutableExpectations)
)
