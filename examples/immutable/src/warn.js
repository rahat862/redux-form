const warn = values => {
  // IMPORTANT: values is an Immutable.Map here!
  const errors = {}
  if (values.get('username') && /[^a-zA-Z0-9 ]/i.test(values.get('username'))) {
    errors.username = 'Only alphanumeric characters'
  }
  if (values.get('email') && /.+@aol\.com/.test(values.get('email'))) {
    errors.username = 'Really? You still use AOL for your email?'
  }
  if (values.get('age') && values.get('age') > 65) {
    errors.username = 'You might be too old for this'
  }
  return errors
}

export default warn
