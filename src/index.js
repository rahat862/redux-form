import createAll from './createAll'
import plain from './structure/plain'

export const {
  actionTypes,
  addArrayValue,
  blur,
  change,
  destroy,
  Field,
  FieldArray,
  focus,
  formValueSelector,
  reducer,
  reduxForm,
  removeArrayValue,
  initialize,
  propTypes,
  reset,
  setSubmitFailed,
  startAsyncValidation,
  startSubmit,
  stopAsyncValidation,
  stopSubmit,
  SubmissionError,
  swapArrayValues,
  touch,
  untouch,
  values
} = createAll(plain)
