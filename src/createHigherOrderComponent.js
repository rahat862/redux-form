import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as importedActions from './actions';
import getDisplayName from './getDisplayName';
import {initialState} from './reducer';
import deepEqual from 'deep-equal';
import bindActionData from './bindActionData';
import getValues from './getValues';
import readFields from './readFields';
import handleSubmit from './handleSubmit';
import asyncValidation from './asyncValidation';
import silenceEvents from './events/silenceEvents';
import silenceEvent from './events/silenceEvent';

/**
 * Creates a HOC that knows how to create redux-connected sub-components.
 */
const createHigherOrderComponent = (config, isReactNative, React, WrappedComponent) => {
  const {Component, PropTypes} = React;
  return (reduxMountPoint, formName, formKey) => {
    class ReduxForm extends Component {
      static displayName = `ReduxForm(${getDisplayName(WrappedComponent)})`;
      static propTypes = {
        // props:
        asyncBlurFields: PropTypes.arrayOf(PropTypes.string),
        asyncValidate: PropTypes.func,
        dispatch: PropTypes.func.isRequired,
        fields: PropTypes.arrayOf(PropTypes.string).isRequired,
        form: PropTypes.object,
        initialValues: PropTypes.object,
        onSubmit: PropTypes.func,
        validate: PropTypes.func,
        readonly: PropTypes.bool,
        returnRejectedSubmitPromise: PropTypes.bool,

        // actions:
        blur: PropTypes.func.isRequired,
        change: PropTypes.func.isRequired,
        destroy: PropTypes.func.isRequired,
        focus: PropTypes.func.isRequired,
        initialize: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
        startAsyncValidation: PropTypes.func.isRequired,
        startSubmit: PropTypes.func.isRequired,
        stopAsyncValidation: PropTypes.func.isRequired,
        stopSubmit: PropTypes.func.isRequired,
        touch: PropTypes.func.isRequired,
        untouch: PropTypes.func.isRequired
      }

      static defaultProps = {
        asyncBlurFields: [],
        form: initialState,
        readonly: false,
        returnRejectedSubmitPromise: false,
        validate: () => ({})
      }

      constructor(props) {
        super(props);
        // bind functions
        this.asyncValidate = this.asyncValidate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fields = readFields(props, {}, this.asyncValidate, isReactNative);
      }

      componentWillMount() {
        const {initialize, initialValues} = this.props;
        if (initialValues) {
          initialize(initialValues);
        }
      }

      componentWillReceiveProps(nextProps) {
        if (!deepEqual(this.props.fields, nextProps.fields) || !deepEqual(this.props.form, nextProps.form)) {
          this.fields = readFields(nextProps, this.fields, this.asyncValidate, isReactNative);
        }
      }

      componentWillUnmount() {
        if (config.destroyOnUnmount) {
          this.props.destroy();
        }
      }

      static WrappedComponent = WrappedComponent;

      asyncValidate(values) {
        const {asyncValidate, dispatch, fields, form, startAsyncValidation, stopAsyncValidation} = this.props;
        if (asyncValidate) {
          return asyncValidation(() =>
            asyncValidate(values || getValues(fields, form), dispatch), startAsyncValidation, stopAsyncValidation);
        }
      }

      handleSubmit(submitOrEvent) {
        const {onSubmit, fields, form} = this.props;
        const check = submit => {
          if (!submit || typeof submit !== 'function') {
            throw new Error('You must either pass handleSubmit() an onSubmit function or pass onSubmit as a prop');
          }
          return submit;
        };
        const values = getValues(fields, form);
        return silenceEvent(submitOrEvent) ?
          // submitOrEvent is an event: fire submit
          handleSubmit(check(onSubmit), values, this.props, this.asyncValidate) :
          // submitOrEvent is the submit function: return deferred submit thunk
          silenceEvents(() => handleSubmit(check(submitOrEvent), values, this.props, this.asyncValidate));
      }

      render() {
        const allFields = this.fields;
        const {asyncBlurFields, blur, change, destroy, focus, fields, form, initialValues, initialize, onSubmit, reset,
          startAsyncValidation, startSubmit, stopAsyncValidation, stopSubmit, touch, untouch, validate,
          ...passableProps} = this.props;
        const {allPristine, allValid, errors, formError, values} = allFields._meta;

        return (<WrappedComponent {...{
          ...passableProps, // contains dispatch

          // State:
          active: form._active,
          asyncValidating: form._asyncValidating,
          dirty: !allPristine,
          error: formError,
          errors,
          fields: allFields,
          formKey,
          invalid: !allValid,
          pristine: allPristine,
          submitting: form._submitting,
          valid: allValid,
          values,

          // Actions:
          asyncValidate: silenceEvents(() => this.asyncValidate()),
          // ^ doesn't just pass this.asyncValidate to disallow values passing
          destroyForm: silenceEvents(destroy),
          handleSubmit: this.handleSubmit,
          initializeForm: silenceEvents(initialize),
          resetForm: silenceEvents(reset),
          touch: silenceEvents((...touchFields) => touch(...touchFields)),
          touchAll: silenceEvents(() => touch(...fields)),
          untouch: silenceEvents((...untouchFields) => untouch(...untouchFields)),
          untouchAll: silenceEvents(() => untouch(...fields))
        }}/>);
      }
    }

    // bind touch flags to blur and change
    const unboundActions = {
      ...importedActions,
      blur: bindActionData(importedActions.blur, {
        touch: !!config.touchOnBlur
      }),
      change: bindActionData(importedActions.change, {
        touch: !!config.touchOnChange
      })
    };

    // make redux connector with or without form key
    const decorate = formKey ?
      connect(
        state => ({form: state[reduxMountPoint][formName][formKey]}),
        dispatch => ({
          ...bindActionCreators(bindActionData(unboundActions, {form: formName, key: formKey}), dispatch),
          dispatch
        })
      ) :
      connect(
        state => ({form: state[reduxMountPoint][formName]}),
        dispatch => ({
          ...bindActionCreators(bindActionData(unboundActions, {form: formName}), dispatch),
          dispatch
        })
      );

    return decorate(ReduxForm);
  };
};

export default createHigherOrderComponent;
