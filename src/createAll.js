import reducer from './reducer';
import createReduxForm from './createReduxForm';
import mapValues from './mapValues';
import bindActionData from './bindActionData';
import * as actions from './actions';
import * as actionTypes from './actionTypes';

// bind form as first parameter of action creators
const boundActions = {
  ...mapValues({
    ...actions,
    initializeWithKey: (key, data) => bindActionData(actions.initialize, {key})(data),
    destroy: (key) => bindActionData(actions.destroy, {key})()
  }, action => (form, ...args) => bindActionData(action, {form})(...args))
};

const blur = boundActions.blur;
const change = boundActions.change;
const destroy = boundActions.destroy;
const focus = boundActions.focus;
const initialize = boundActions.initialize;
const initializeWithKey = boundActions.initializeWithKey;
const reset = boundActions.reset;
const startAsyncValidation = boundActions.startAsyncValidation;
const startSubmit = boundActions.startSubmit;
const stopAsyncValidation = boundActions.stopAsyncValidation;
const stopSubmit = boundActions.stopSubmit;
const touch = boundActions.touch;
const untouch = boundActions.untouch;

export default function createAll(isReactNative, React) {
  return {
    actionTypes,
    blur,
    change,
    destroy,
    focus,
    reducer,
    initialize,
    initializeWithKey,
    reduxForm: createReduxForm(isReactNative, React),
    reset,
    startAsyncValidation,
    startSubmit,
    stopAsyncValidation,
    stopSubmit,
    touch,
    untouch
  };
}
