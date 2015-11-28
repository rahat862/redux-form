import readField from './readField';
import write from './write';
import getValues from './getValues';

/**
 * Reads props and generates (or updates) field structure
 */
const readFields = (props, myFields, asyncValidate, isReactNative) => {
  const {fields, form, validate} = props;
  const values = getValues(fields, form);
  const syncErrors = validate(values, props);
  let errors = {};
  const formError = syncErrors._error || form._error;
  let allValid = !formError;
  let allPristine = true;
  const fieldObjects = {...myFields};
  fields.forEach(name => {
    const result = readField(form, name, undefined, fieldObjects, syncErrors, asyncValidate, isReactNative, props);
    if (result.invalid) {
      allValid = false;
    }
    if (result.dirty) {
      allPristine = false;
    }
    if (result.error) {
      errors = write(name, result.error, errors);
    }
  });
  Object.defineProperty(fieldObjects, '_meta', {
    value: {
      allPristine,
      allValid,
      values,
      errors,
      formError
    }
  });
  return fieldObjects;
};
export default readFields;
