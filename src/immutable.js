import createAll from './createAll'
import immutable from './structure/immutable'

export const {
  actionTypes,
  arrayInsert,
  arrayMove,
  arrayPop,
  arrayPush,
  arrayRemove,
  arrayRemoveAll,
  arrayShift,
  arraySplice,
  arraySwap,
  arrayUnshift,
  blur,
  change,
  destroy,
  Field,
  FieldArray,
  focus,
  formValueSelector,
  getFormValues,
  initialize,
  isDirty,
  isInvalid,
  isPristine,
  isValid,
  propTypes,
  reducer,
  reduxForm,
  reset,
  setSubmitFailed,
  setSubmitSucceeded,
  startAsyncValidation,
  startSubmit,
  stopAsyncValidation,
  stopSubmit,
  SubmissionError,
  touch,
  untouch,
  values
} = createAll(immutable)
