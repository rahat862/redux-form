import isPromise from 'is-promise'
import SubmissionError from './SubmissionError'

const handleSubmit = (submit, props, isValid, asyncValidate) => {
  const { dispatch, startSubmit, stopSubmit, setSubmitFailed, syncErrors,
    returnRejectedSubmitPromise, values } = props

  if (isValid) {
    const doSubmit = () => {
      const result = submit(values, dispatch)
      if (isPromise(result)) {
        startSubmit()
        return result
          .then(submitResult => {
            stopSubmit()
            return submitResult
          }).catch(submitError => {
            stopSubmit(submitError instanceof SubmissionError ? submitError.errors : undefined)
            if (returnRejectedSubmitPromise) {
              return Promise.reject(submitError)
            }
          })
      }
      return result
    }

    return asyncValidate ?
      asyncValidate()
        .then(
          doSubmit,
          asyncErrors => {
            setSubmitFailed()
            if (returnRejectedSubmitPromise) {
              return Promise.reject(asyncErrors)
            }
          }) : doSubmit()
  } else {
    setSubmitFailed()

    if (returnRejectedSubmitPromise) {
      return Promise.reject(syncErrors)
    }
  }
}

export default handleSubmit
