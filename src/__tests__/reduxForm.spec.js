/* eslint react/no-multi-comp:0 */
import React, { Component } from 'react'
import TestUtils from 'react-addons-test-utils'
import { createSpy } from 'expect'
import { combineReducers as plainCombineReducers, createStore } from 'redux'
import { combineReducers as immutableCombineReducers } from 'redux-immutablejs'
import { Provider } from 'react-redux'
import noop from '../util/noop'
import createReducer from '../reducer'
import createReduxForm from '../reduxForm'
import createField from '../Field'
import createFieldArray from '../FieldArray'
import plain from '../structure/plain'
import plainExpectations from '../structure/plain/expectations'
import immutable from '../structure/immutable'
import immutableExpectations from '../structure/immutable/expectations'
import addExpectations from './addExpectations'
import { change } from '../actions'

const describeReduxForm = (name, structure, combineReducers, expect) => {
  const { fromJS, getIn } = structure
  const reduxForm = createReduxForm(structure)
  const Field = createField(structure)
  const FieldArray = createFieldArray(structure)
  const reducer = createReducer(structure)

  describe(name, () => {
    const makeStore = (initial = {}) => createStore(
      combineReducers({ form: reducer }), fromJS({ form: initial }))

    const propChecker = (formState, renderSpy = noop, config = {}) => {
      const store = makeStore({ testForm: formState })
      class Form extends Component {
        render() {
          renderSpy(this.props)
          return (
            <div>
              <Field name="foo" component="input"/>
            </div>
          )
        }
      }
      const Decorated = reduxForm({ form: 'testForm', ...config })(Form)
      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )
      return TestUtils.findRenderedComponentWithType(dom, Form).props
    }

    it('should return a decorator function', () => {
      expect(reduxForm).toBeA('function')
    })

    it('should render without error', () => {
      const store = makeStore()
      class Form extends Component {
        render() {
          return <div />
        }
      }
      expect(() => {
        const Decorated = reduxForm({ form: 'testForm' })(Form)
        TestUtils.renderIntoDocument(
          <Provider store={store}>
            <Decorated/>
          </Provider>
        )
      }).toNotThrow()
    })

    it('should provide dispatch prop', () => {
      expect(propChecker({}).dispatch)
        .toExist()
        .toBeA('function')
    })

    it('should provide dirty prop', () => {
      expect(propChecker({}).dirty).toBe(false)
      expect(propChecker({
        // no initial values
        values: {
          foo: 'bar'
        }
      }).dirty).toBe(true)
      expect(propChecker({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        }
      }).dirty).toBe(false)
      expect(propChecker({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'baz'
        }
      }).dirty).toBe(true)
    })

    it('should provide pristine prop', () => {
      expect(propChecker({}).pristine).toBe(true)
      expect(propChecker({
        // no initial values
        values: {
          foo: 'bar'
        }
      }).pristine).toBe(false)
      expect(propChecker({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'bar'
        }
      }).pristine).toBe(true)
      expect(propChecker({
        initial: {
          foo: 'bar'
        },
        values: {
          foo: 'baz'
        }
      }).pristine).toBe(false)
    })

    it('should provide valid prop', () => {
      expect(propChecker({}).valid).toBe(true)
      expect(propChecker({}, undefined, {
        validate: () => ({ foo: 'sync error' })
      }).valid).toBe(false)
      expect(propChecker({
        asyncErrors: {
          foo: 'bar'
        }
      }).valid).toBe(false)
    })

    it('should provide invalid prop', () => {
      expect(propChecker({}).invalid).toBe(false)
      expect(propChecker({}, undefined, {
        validate: () => ({ foo: 'sync error' })
      }).invalid).toBe(true)
      expect(propChecker({
        asyncErrors: {
          foo: 'bar'
        }
      }).invalid).toBe(true)
    })

    it('should provide submitting prop', () => {
      expect(propChecker({}).submitting).toBe(false)
      expect(propChecker({ submitting: true }).submitting).toBe(true)
      expect(propChecker({ submitting: false }).submitting).toBe(false)
    })

    it('should not rerender unless form-wide props (except value!) change', () => {
      const spy = createSpy()
      const { dispatch } = propChecker({}, spy, {
        validate: values => {
          const animal = getIn(values, 'animal')
          return animal && animal.length > 5 ? { animal: 'Too long' } : {}
        }
      })  // render 0
      expect(spy.calls.length).toBe(1)

      // simulate typing the word "giraffe"
      dispatch(change('testForm', 'animal', 'g'))       // render 1 (now dirty)
      expect(spy.calls.length).toBe(2)

      dispatch(change('testForm', 'animal', 'gi'))      // no render
      dispatch(change('testForm', 'animal', 'gir'))     // no render
      dispatch(change('testForm', 'animal', 'gira'))    // no render
      dispatch(change('testForm', 'animal', 'giraf'))   // no render
      dispatch(change('testForm', 'animal', 'giraff'))  // render 2 (invalid)
      expect(spy.calls.length).toBe(3)
      dispatch(change('testForm', 'animal', 'giraffe')) // no render

      dispatch(change('testForm', 'animal', '')) // render 3 (clean/valid)
      expect(spy.calls.length).toBe(4)

      expect(spy).toHaveBeenCalled()
      expect(spy.calls.length).toBe(4)

      expect(spy.calls[ 0 ].arguments[ 0 ].dirty).toBe(false)
      expect(spy.calls[ 0 ].arguments[ 0 ].invalid).toBe(false)
      expect(spy.calls[ 0 ].arguments[ 0 ].pristine).toBe(true)
      expect(spy.calls[ 0 ].arguments[ 0 ].valid).toBe(true)

      expect(spy.calls[ 1 ].arguments[ 0 ].dirty).toBe(true)
      expect(spy.calls[ 1 ].arguments[ 0 ].invalid).toBe(false)
      expect(spy.calls[ 1 ].arguments[ 0 ].pristine).toBe(false)
      expect(spy.calls[ 1 ].arguments[ 0 ].valid).toBe(true)

      expect(spy.calls[ 2 ].arguments[ 0 ].dirty).toBe(true)
      expect(spy.calls[ 2 ].arguments[ 0 ].invalid).toBe(true)
      expect(spy.calls[ 2 ].arguments[ 0 ].pristine).toBe(false)
      expect(spy.calls[ 2 ].arguments[ 0 ].valid).toBe(false)

      expect(spy.calls[ 3 ].arguments[ 0 ].dirty).toBe(false)
      expect(spy.calls[ 3 ].arguments[ 0 ].invalid).toBe(false)
      expect(spy.calls[ 3 ].arguments[ 0 ].pristine).toBe(true)
      expect(spy.calls[ 3 ].arguments[ 0 ].valid).toBe(true)
    })

    it('should initialize values with initialValues on first render', () => {
      const store = makeStore({})
      const inputRender = createSpy(props => <input {...props}/>).andCallThrough()
      const formRender = createSpy()
      const initialValues = {
        deep: {
          foo: 'bar'
        }
      }
      class Form extends Component {
        render() {
          formRender(this.props)
          return (
            <form>
              <Field name="deep.foo" component={inputRender} type="text"/>
            </form>
          )
        }
      }
      const Decorated = reduxForm({ form: 'testForm' })(Form)
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated initialValues={initialValues}/>
        </Provider>
      )
      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            initial: initialValues,
            values: initialValues
          }
        }
      })
      expect(formRender).toHaveBeenCalled()
      expect(formRender.calls.length).toBe(1)
      const checkProps = props => {
        expect(props.pristine).toBe(true)
        expect(props.dirty).toBe(false)
        expect(props.initialized).toBe(false) // will be true on second render
      }
      checkProps(formRender.calls[ 0 ].arguments[ 0 ])

      expect(inputRender).toHaveBeenCalled()
      expect(inputRender.calls.length).toBe(1)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].pristine).toBe(true)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].dirty).toBe(false)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].value).toBe('bar')
    })

    it('should initialize with initialValues on later render', () => {
      const store = makeStore({})
      const inputRender = createSpy(props => <input {...props}/>).andCallThrough()
      const formRender = createSpy()
      const initialValues = {
        deep: {
          foo: 'bar'
        }
      }

      class Form extends Component {
        render() {
          formRender(this.props)
          return (
            <form>
              <Field name="deep.foo" component={inputRender} type="text"/>
            </form>
          )
        }
      }
      const Decorated = reduxForm({ form: 'testForm' })(Form)

      class Container extends Component {
        constructor(props) {
          super(props)
          this.state = {}
        }

        render() {
          return (
            <div>
              <Provider store={store}>
                <Decorated {...this.state}/>
              </Provider>
              <button onClick={() => this.setState({ initialValues })}>Init</button>
            </div>
          )
        }
      }

      const dom = TestUtils.renderIntoDocument(<Container/>)
      expect(store.getState()).toEqualMap({
        form: {}
      })
      expect(formRender).toHaveBeenCalled()
      expect(formRender.calls.length).toBe(1)
      const checkFormProps = props => {
        expect(props.pristine).toBe(true)
        expect(props.dirty).toBe(false)
        expect(props.initialized).toBe(false)
      }
      checkFormProps(formRender.calls[ 0 ].arguments[ 0 ])

      expect(inputRender).toHaveBeenCalled()
      expect(inputRender.calls.length).toBe(1)
      const checkInputProps = (props, value) => {
        expect(props.pristine).toBe(true)
        expect(props.dirty).toBe(false)
        expect(props.value).toBe(value)
      }
      checkInputProps(inputRender.calls[ 0 ].arguments[ 0 ], '')

      // initialize
      const initButton = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')
      TestUtils.Simulate.click(initButton)

      // check initialized state
      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            initial: initialValues,
            values: initialValues
          }
        }
      })

      // no need to rerender form on initialize
      expect(formRender.calls.length).toBe(1)

      // check rerendered input
      expect(inputRender.calls.length).toBe(2)
      checkInputProps(inputRender.calls[ 1 ].arguments[ 0 ], 'bar')
    })

    it('should keep a list of registered fields', () => {
      const store = makeStore({})
      const noopRender = () => <div/>

      class Form extends Component {
        constructor() {
          super()
          this.state = { showBar: false }
        }

        render() {
          const { showBar } = this.state
          return (
            <form>
              {!showBar && <Field name="foo" component="input" type="text"/>}
              {!showBar && <FieldArray name="fooArray" component={noopRender} type="text"/>}
              {showBar && <Field name="bar" component="input" type="text"/>}
              {showBar && <FieldArray name="barArray" component={noopRender} type="text"/>}
              <button onClick={() => this.setState({ showBar: true })}>Show Bar</button>
            </form>
          )
        }
      }
      const Decorated = reduxForm({ form: 'testForm' })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )

      const stub = TestUtils.findRenderedComponentWithType(dom, Decorated)
      expect(stub.fieldList).toEqual([ 'foo', 'fooArray' ])

      // switch fields
      const button = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')
      TestUtils.Simulate.click(button)

      expect(stub.fieldList).toEqual([ 'bar', 'barArray' ])
    })

    it('should provide valid/invalid/values getters', () => {
      const store = makeStore({})
      const input = createSpy(props => <input {...props}/>).andCallThrough()

      const Form = () => (
        <form>
          <Field name="bar" component={input} type="text"/>
        </form>
      )

      const Decorated = reduxForm({
        form: 'testForm',
        validate: values => getIn(values, 'bar') ? {} : { bar: 'Required' }
      })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )

      const stub = TestUtils.findRenderedComponentWithType(dom, Decorated)

      // invalid because no value for 'bar' field
      expect(stub.valid).toBe(false)
      expect(stub.invalid).toBe(true)
      expect(stub.values).toEqualMap({})

      // set value for 'bar' field
      input.calls[ 0 ].arguments[ 0 ].onChange('foo')

      // valid because we have a value for 'bar' field
      expect(stub.valid).toBe(true)
      expect(stub.invalid).toBe(false)
      expect(stub.values).toEqualMap({ bar: 'foo' })
    })

    it('should submit when submit() called', () => {
      const store = makeStore({
        testForm: {
          values: {
            bar: 'foo'
          }
        }
      })
      const input = createSpy(props => <input {...props}/>).andCallThrough()

      const Form = () => (
        <form>
          <Field name="bar" component={input} type="text"/>
        </form>
      )

      const Decorated = reduxForm({
        form: 'testForm',
        onSubmit: values => {
          expect(values).toEqualMap({ bar: 'foo' })
        }
      })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )

      const stub = TestUtils.findRenderedComponentWithType(dom, Decorated)

      expect(input).toHaveBeenCalled()
      expect(input.calls[0].arguments[0].value).toBe('foo')

      expect(stub.submit).toBeA('function')
      stub.submit()
    })

    it('should submit (with async validation) when submit() called', () => {
      const store = makeStore({
        testForm: {
          values: {
            bar: 'foo'
          }
        }
      })
      const input = createSpy(props => <input {...props}/>).andCallThrough()
      const asyncValidate = createSpy(() => Promise.resolve()).andCallThrough()

      const Form = () => (
        <form>
          <Field name="bar" component={input} type="text"/>
        </form>
      )

      const Decorated = reduxForm({
        form: 'testForm',
        asyncValidate,
        onSubmit: values => {
          expect(values).toEqualMap({ bar: 'foo' })
        }
      })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )

      const stub = TestUtils.findRenderedComponentWithType(dom, Decorated)

      expect(input).toHaveBeenCalled()
      expect(input.calls[0].arguments[0].value).toBe('foo')

      expect(asyncValidate).toNotHaveBeenCalled()

      expect(stub.submit).toBeA('function')
      stub.submit()

      expect(asyncValidate).toHaveBeenCalled()
      expect(asyncValidate.calls[0].arguments[0]).toEqualMap({ bar: 'foo' })
    })

    it('should reset when reset() called', () => {
      const store = makeStore({})
      const input = createSpy(props => <input {...props}/>).andCallThrough()

      const Form = () => (
        <form>
          <Field name="bar" component={input} type="text"/>
        </form>
      )

      const Decorated = reduxForm({
        form: 'testForm',
        initialValues: { bar: 'initialBar' }
      })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )

      const stub = TestUtils.findRenderedComponentWithType(dom, Decorated)

      expect(input).toHaveBeenCalled()

      expect(input.calls[0].arguments[0].value).toBe('initialBar')

      input.calls[0].arguments[0].onChange('newBar')

      expect(input.calls[1].arguments[0].value).toBe('newBar')

      expect(stub.reset).toBeA('function')
      stub.reset()

      expect(input.calls[2].arguments[0].value).toBe('initialBar')
    })

    it('should rerender form, but not fields, when non-redux-form props change', () => {
      const store = makeStore({})
      const inputRender = createSpy(props => <input {...props}/>).andCallThrough()
      const formRender = createSpy()

      class Form extends Component {
        render() {
          formRender(this.props)
          return (
            <form>
              <Field name="deep.foo" component={inputRender} type="text"/>
            </form>
          )
        }
      }
      const Decorated = reduxForm({ form: 'testForm' })(Form)

      class Container extends Component {
        constructor(props) {
          super(props)
          this.state = {}
        }

        render() {
          return (
            <div>
              <Provider store={store}>
                <Decorated {...this.state}/>
              </Provider>
              <button onClick={() => this.setState({ someOtherProp: 42 })}>Init</button>
            </div>
          )
        }
      }

      const dom = TestUtils.renderIntoDocument(<Container/>)
      expect(store.getState()).toEqualMap({
        form: {}
      })
      expect(formRender).toHaveBeenCalled()
      expect(formRender.calls.length).toBe(1)
      expect(formRender.calls[ 0 ].arguments[ 0 ].someOtherProp).toNotExist()

      expect(inputRender).toHaveBeenCalled()
      expect(inputRender.calls.length).toBe(1)

      // initialize
      const initButton = TestUtils.findRenderedDOMComponentWithTag(dom, 'button')
      TestUtils.Simulate.click(initButton)

      // rerender form on prop change
      expect(formRender.calls.length).toBe(2)
      expect(formRender.calls[ 1 ].arguments[ 0 ].someOtherProp)
        .toExist()
        .toBe(42)

      // no need to rerender input
      expect(inputRender.calls.length).toBe(1)
    })

    it('should call async on blur of async blur field', done => {
      const store = makeStore({})
      const inputRender = createSpy(props => <input {...props}/>).andCallThrough()
      const formRender = createSpy()
      const asyncErrors = {
        deep: {
          foo: 'async error'
        }
      }
      const asyncValidate = createSpy().andReturn(Promise.reject(asyncErrors))

      class Form extends Component {
        render() {
          formRender(this.props)
          return (
            <form>
              <Field name="deep.foo" component={inputRender} type="text"/>
            </form>
          )
        }
      }
      const Decorated = reduxForm({
        form: 'testForm',
        asyncValidate,
        asyncBlurFields: [ 'deep.foo' ]
      })(Form)

      const dom = TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      )
      expect(store.getState()).toEqualMap({
        form: {}
      })
      expect(formRender).toHaveBeenCalled()
      expect(formRender.calls.length).toBe(1)

      expect(asyncValidate).toNotHaveBeenCalled()

      expect(inputRender).toHaveBeenCalled()
      expect(inputRender.calls.length).toBe(1)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].pristine).toBe(true)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].value).toBe('')
      expect(inputRender.calls[ 0 ].arguments[ 0 ].valid).toBe(true)
      expect(inputRender.calls[ 0 ].arguments[ 0 ].error).toBe(undefined)

      const inputElement = TestUtils.findRenderedDOMComponentWithTag(dom, 'input')
      TestUtils.Simulate.change(inputElement, { target: { value: 'bar' } })

      expect(store.getState()).toEqualMap({
        form: {
          testForm: {
            values: {
              deep: {
                foo: 'bar'
              }
            }
          }
        }
      })
      expect(formRender.calls.length).toBe(2) // rerendered because pristine -> dirty

      expect(asyncValidate).toNotHaveBeenCalled() // not yet

      expect(inputRender.calls.length).toBe(2)  // input rerendered
      expect(inputRender.calls[ 1 ].arguments[ 0 ].pristine).toBe(false)
      expect(inputRender.calls[ 1 ].arguments[ 0 ].value).toBe('bar')
      expect(inputRender.calls[ 1 ].arguments[ 0 ].valid).toBe(true)
      expect(inputRender.calls[ 1 ].arguments[ 0 ].error).toBe(undefined)

      TestUtils.Simulate.blur(inputElement, { target: { value: 'bar' } })

      setTimeout(() => {
        expect(store.getState()).toEqualMap({
          form: {
            testForm: {
              anyTouched: true,
              values: {
                deep: {
                  foo: 'bar'
                }
              },
              fields: {
                deep: {
                  foo: {
                    touched: true
                  }
                }
              },
              asyncErrors
            }
          }
        })
        // rerender form twice because of async validation start and again for valid -> invalid
        expect(formRender.calls.length).toBe(4)

        expect(asyncValidate).toHaveBeenCalled()
        expect(asyncValidate.calls[ 0 ].arguments[ 0 ]).toEqualMap({ deep: { foo: 'bar' } })

        // input rerendered twice, at start and end of async validation
        expect(inputRender.calls.length).toBe(4)
        expect(inputRender.calls[ 3 ].arguments[ 0 ].pristine).toBe(false)
        expect(inputRender.calls[ 3 ].arguments[ 0 ].value).toBe('bar')
        expect(inputRender.calls[ 3 ].arguments[ 0 ].valid).toBe(false)
        expect(inputRender.calls[ 3 ].arguments[ 0 ].error).toBe('async error')
        done()
      })
    })
  })
}

describeReduxForm('reduxForm.plain', plain, plainCombineReducers, addExpectations(plainExpectations))
describeReduxForm('reduxForm.immutable', immutable, immutableCombineReducers, addExpectations(immutableExpectations))
