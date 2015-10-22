/* eslint react/no-multi-comp:0*/
import expect from 'expect';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import {combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from '../reducer';
import createReduxForm from '../createReduxForm';

describe('createReduxForm', () => {
  const reduxForm = createReduxForm(false, React);
  const makeStore = () => createStore(combineReducers({
    form: reducer
  }));

  it('should return a decorator function', () => {
    expect(reduxForm).toBeA('function');
  });

  class Form extends Component {
    render() {
      return <div />;
    }
  }

  const expectField = ({field, name, value, valid, dirty, error, touched, visited, readonly}) => {
    expect(field).toBeA('object');
    expect(field.name).toBe(name);
    expect(field.value).toBe(value);
    if (readonly) {
      expect(field.onBlur).toNotExist();
      expect(field.onChange).toNotExist();
      expect(field.onDragStart).toNotExist();
      expect(field.onDrop).toNotExist();
      expect(field.onFocus).toNotExist();
      expect(field.onUpdate).toNotExist();
    } else {
      expect(field.onBlur).toBeA('function');
      expect(field.onChange).toBeA('function');
      expect(field.onDragStart).toBeA('function');
      expect(field.onDrop).toBeA('function');
      expect(field.onFocus).toBeA('function');
      expect(field.onUpdate).toBeA('function');
    }
    expect(field.valid).toBe(valid);
    expect(field.invalid).toBe(!valid);
    expect(field.dirty).toBe(dirty);
    expect(field.pristine).toBe(!dirty);
    expect(field.error).toBe(error);
    expect(field.touched).toBe(touched);
    expect(field.visited).toBe(visited);
  };

  it('should render without error', () => {
    const store = makeStore();
    expect(() => {
      const Decorated = reduxForm({
        form: 'testForm',
        fields: ['foo', 'bar']
      })(Form);
      TestUtils.renderIntoDocument(
        <Provider store={store}>
          <Decorated/>
        </Provider>
      );
    }).toNotThrow();
  });

  it('should pass fields as props', () => {
    const store = makeStore();
    const Decorated = reduxForm({
      form: 'testForm',
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);
    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should initialize field values', () => {
    const store = makeStore();
    const Decorated = reduxForm({
      form: 'testForm',
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{foo: 'fooValue', bar: 'barValue'}}/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);
    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: 'barValue',
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set value and touch field on blur', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    stub.props.fields.foo.onBlur('fooValue');

    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: true,
      error: undefined,
      touched: true,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set value and NOT touch field on blur if touchOnBlur is disabled', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar'],
      touchOnBlur: false
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    stub.props.fields.foo.onBlur('fooValue');

    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: true,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set value and NOT touch field on change', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    stub.props.fields.foo.onChange('fooValue');

    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: true,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set value and touch field on change if touchOnChange is enabled', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar'],
      touchOnChange: true
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    stub.props.fields.foo.onChange('fooValue');

    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: true,
      error: undefined,
      touched: true,
      visited: false,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set visited field on focus', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    expect(stub.props.active).toBe(undefined);

    stub.props.fields.foo.onFocus();

    expect(stub.props.active).toBe('foo');

    expect(stub.props.fields).toBeA('object');
    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: true,
      readonly: false
    });
    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should set dirty when field changes', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar']
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{foo: 'fooValue', bar: 'barValue'}}/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });

    stub.props.fields.foo.onChange('fooValue!');

    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue!',
      valid: true,
      dirty: true,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should trigger sync error on change that invalidates value', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar'],
      validate: values => {
        const errors = {};
        if (values.foo && values.foo.length > 8) {
          errors.foo = 'Too long';
        }
        if (!values.bar) {
          errors.bar = 'Required';
        }
        return errors;
      }
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated initialValues={{foo: 'fooValue', bar: 'barValue'}}/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue',
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });

    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: 'barValue',
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: false
    });

    stub.props.fields.foo.onChange('fooValue!');

    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: 'fooValue!',
      valid: false,
      dirty: true,
      error: 'Too long',
      touched: false,
      visited: false,
      readonly: false
    });

    stub.props.fields.bar.onChange('');

    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: '',
      valid: false,
      dirty: true,
      error: 'Required',
      touched: false,
      visited: false,
      readonly: false
    });
  });

  it('should call destroy on unmount', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar']
    })(Form);

    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <Decorated initialValues={{foo: 'fooValue', bar: 'barValue'}}/>
      </Provider>,
      div
    );
    const before = store.getState();
    expect(before.form).toBeA('object');
    expect(before.form[form]).toBeA('object');
    expect(before.form[form].foo).toBeA('object');
    expect(before.form[form].bar).toBeA('object');

    ReactDOM.unmountComponentAtNode(div);

    const after = store.getState();
    expect(after.form).toBeA('object');
    expect(after.form[form]).toNotExist();
  });

  it('should NOT call destroy on unmount if destroyOnUnmount is disabled', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar'],
      destroyOnUnmount: false
    })(Form);

    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <Decorated initialValues={{foo: 'fooValue', bar: 'barValue'}}/>
      </Provider>,
      div
    );
    const before = store.getState();
    expect(before.form).toBeA('object');
    expect(before.form[form]).toBeA('object');
    expect(before.form[form].foo).toBeA('object');
    expect(before.form[form].bar).toBeA('object');

    ReactDOM.unmountComponentAtNode(div);

    const after = store.getState();
    expect(after.form).toBeA('object');
    expect(after.form[form]).toBeA('object');
    expect(after.form[form].foo).toBeA('object');
    expect(after.form[form].bar).toBeA('object');
  });

  it('should hoist statics', () => {
    class FormWithStatics extends Component {
      static someStatic1 = 'cat';
      static someStatic2 = 42;

      render() {
        return <div />;
      }
    }
    const Decorated = reduxForm({
      form: 'testForm',
      fields: ['foo', 'bar']
    })(FormWithStatics);

    expect(Decorated.someStatic1).toBe('cat');
    expect(Decorated.someStatic2).toBe(42);
  });

  it('should not provide mutators when readonly', () => {
    const store = makeStore();
    const form = 'testForm';
    const Decorated = reduxForm({
      form,
      fields: ['foo', 'bar'],
      readonly: true
    })(Form);
    const dom = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <Decorated/>
      </Provider>
    );
    const stub = TestUtils.findRenderedComponentWithType(dom, Form);

    expectField({
      field: stub.props.fields.foo,
      name: 'foo',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: true
    });

    expectField({
      field: stub.props.fields.bar,
      name: 'bar',
      value: undefined,
      valid: true,
      dirty: false,
      error: undefined,
      touched: false,
      visited: false,
      readonly: true
    });
  });
});
