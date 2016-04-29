import React from 'react'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/lib/text-field'
import RadioButton from 'material-ui/lib/radio-button'
import RadioButtonGroup from 'material-ui/lib/radio-button-group'
import Checkbox from 'material-ui/lib/checkbox'
import SelectField from 'material-ui/lib/select-field'
import MenuItem from 'material-ui/lib/menus/menu-item'
import asyncValidate from './asyncValidate'
const validate = values => {
  const errors = {}
  const requiredFields = [ 'firstName', 'lastName', 'email', 'favoriteColor', 'notes' ]
  requiredFields.forEach(field => {
    if(!values[field]) {
      errors[field] = 'Required'
    }
  })
  if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address'
  }
  return errors
}

const MaterialUiForm = props => {
  const { handleSubmit, pristine, reset, submitting } = props
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Field name="firstName" component={firstName => 
          <TextField hintText = "First Name" 
            floatingLabelText="First Name"
            errorText = {firstName.touched && firstName.error}
            {...firstName} 
          />
        }/>
      </div>
      <div>
        <Field name="lastName" component={lastName =>
              <TextField 
                hintText = "Last Name"
                floatingLabelText="Last Name"
                errorText = {lastName.touched && lastName.error}
                {...lastName} 
              />
            }/>
      </div>
      <div>
        <Field name="email" component={email =>
              <TextField 
                hintText="Email"
                floatingLabelText="Email"
                errorText = {email.touched && email.error}
                {...email}
              />
            }/>
      </div>
      <div>
        <Field name="sex" component={sex =>
             <RadioButtonGroup {...sex}>
                <RadioButton
                  value="male"
                  label="male"
                />
                <RadioButton
                  value="female"
                  label="female"
                />
             </RadioButtonGroup>
          }/>
      </div>
      <div>
        <Field name="favoriteColor" component={props =>
              <div>
                <SelectField                   
                  value={props.value}
                  floatingLabelText = "Favourite Color"
                  errorText = {props.touched && props.error}
                  {...props}
                  onChange = {(event, index, value) => props.onChange(value)}
                >
                  <MenuItem value={'ff0000'} primaryText="Red"/>
                  <MenuItem value={'00ff00'} primaryText="Green"/>
                  <MenuItem value={'0000ff'} primaryText="Blue"/>
                </SelectField>

              </div>
          }/>
      </div>
      <div>
        <div>
          <Field name="employed" id="employed" component={ props =>
            /* React 15 warning should go in Material-Ui 0.15 */
              <Checkbox label ="Employed" 
                checked = {props.value ? true : false}
                onCheck = {(e) => props.onChange(e)}
              />
            }/>
        </div>
      </div>
      <div>
        <div>
          <Field name="notes" component={notes =>
              <TextField hintText="Notes" 
                multiLine = {true}
                rows={2} 
                errorText = {notes.touched && notes.error}
                {...notes}
              />
            }/>
        </div>
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>Submit</button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values
        </button>
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'MaterialUiForm',  // a unique identifier for this form
  validate,
  asyncValidate
})(MaterialUiForm)
