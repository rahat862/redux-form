import React from 'react-native';
import {connect} from 'react-redux/native';
import createAll from './createAll';

export const {
  actionTypes,
  blur,
  change,
  changeWithKey,
  destroy,
  focus,
  reducer,
  reduxForm,
  initialize,
  initializeWithKey,
  reset,
  startAsyncValidation,
  startSubmit,
  stopAsyncValidation,
  stopSubmit,
  touch,
  touchWithKey,
  untouch,
  untouchWithKey
} = createAll(true, React, connect);
