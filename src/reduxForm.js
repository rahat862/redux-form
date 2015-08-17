import React, {Component, PropTypes} from 'react';
import {blur, change, initialize, reset, startAsyncValidation, stopAsyncValidation,
  touch, touchAll, untouch, untouchAll} from './actions';
import {getDisplayName, isPristine} from './util';

/**
 * @param sliceName The key in the state corresponding to the data in this form
 * @param validate [optional] A validation function that takes all the data and returns all the errors
 * @param asyncConfig [optional] {
 *   validate: an asynchronous validation function that takes all the data and returns a promise
 *             that resolves to async validation errors, or {} if none,
 *   fields: an array of field names for which handleBlur should trigger an async validation call
 * }
 */
export default function reduxForm(sliceName, ...args) {
  let validate = () => ({});
  let asyncConfig;
  if (typeof args[0] === 'function') {
    validate = args.shift();
  }
  if (typeof args[0] === 'object') {
    asyncConfig = args[0];
  }
  return DecoratedComponent =>
    class ReduxForm extends Component {
      static displayName = `ReduxForm(${getDisplayName(DecoratedComponent)})`;
      static DecoratedComponent = DecoratedComponent;
      static propTypes = {
        sliceName: PropTypes.string,
        form: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired
      }
      static defaultProps = {
        sliceName
      }

      render() {
        const {form, sliceName, dispatch, ...passableProps} = this.props; // eslint-disable-line no-shadow
        const handleBlur = (name, value) => (event) => {
          dispatch(blur(sliceName, name, value || event.target.value));
          if (asyncConfig && asyncConfig.validate && asyncConfig.fields && ~asyncConfig.fields.indexOf(name)) {
            dispatch(startAsyncValidation(sliceName));
            asyncConfig.validate(form.data)
              .then(asyncErrors => dispatch(stopAsyncValidation(sliceName, asyncErrors)));
          }
        };
        const handleChange = (name, value) => (event) => dispatch(change(sliceName, name, value || event.target.value));
        const pristine = isPristine(form.initial, form.data);
        const errors = {  // eslint-disable-line no-dupe-keys
          ...validate(form.data),
          ...form.asyncErrors
        };
        const valid = !Object.keys(errors).length;
        return (<DecoratedComponent
          asyncValidating={form.asyncValidating}
          data={form.data}
          dirty={!pristine}
          dispatch={dispatch}
          errors={errors}
          handleBlur={handleBlur}
          handleChange={handleChange}
          initializeForm={data => dispatch(initialize(sliceName, data))}
          invalid={!valid}
          pristine={pristine}
          resetForm={() => dispatch(reset(sliceName))}
          touch={(...fields) => dispatch(touch(sliceName, ...fields))}
          touched={form.touched}
          touchAll={() => dispatch(touchAll(sliceName))}
          untouch={(...fields) => dispatch(untouch(sliceName, ...fields))}
          untouchAll={() => dispatch(untouchAll(sliceName))}
          valid={valid}
          {...passableProps}/>); // pass other props
      }
    };
}
