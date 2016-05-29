import React from 'react'
import { Field, reduxForm } from 'redux-form'
import DropdownList from 'react-widgets/lib/DropdownList'
import SelectList from 'react-widgets/lib/SelectList'
import Multiselect from 'react-widgets/lib/Multiselect'
import 'react-widgets/dist/css/react-widgets.css'
import { connect } from 'react-redux'
import { load as loadData } from './userData'

const initialData = {
  hobbies: [ 'Guitar', 'Hiking' ],
  sex: 'female',
  favoriteColor: 'Blue'
}

const colors = [ { color: 'Red', value:'ff0000' },
  { color: 'Green', value:'00ff00' },
  { color: 'Blue', value:'0000ff' } ]

const validate = values => {
  const errors = {}
  const requiredFields = [ 'favoriteColor', 'hobbies', 'sex' ]
  requiredFields.forEach(field => {
    if (!values[ field ]) {
      errors[ field ] = 'Required'
    }
  })
  return errors
}

let ReactWidgetsForm = props => {
  const { handleSubmit, pristine, reset, submitting, load } = props
  return (
    <form onSubmit={handleSubmit}>
    <div>
        <button type="button" onClick={() => load(initialData)}>Initilalize</button>
    </div>
    <div>
      <label>Favorite Color</label>
      <Field name="favoriteColor"
        component={ favoriteColor =>
          <div>
            <DropdownList
              {...favoriteColor}
              data={colors}
              valueField="value"
              textField="color"
              onChange={(value) => favoriteColor.onChange(value)}
            />
            {favoriteColor.touched && favoriteColor.error && <span>{favoriteColor.error}</span>}
          </div>
          }
        />
      </div>
      <div>
      <label>Hobbies</label>
      <Field name="hobbies"
        component={ hobbies =>
          <div>
            <Multiselect
              {...hobbies}
              data={[ 'Guitar', 'Cycling', 'Hiking' ]}
              onChange={ value => hobbies.onChange(value)}
              onBlur = {event => hobbies.onBlur()}
            />
            {hobbies.touched && hobbies.error && <span>{hobbies.error}</span>}
          </div>
          }
        />
      </div>
      <div>
        <label>Sex</label>
        <Field name="sex"
          component={ sex =>
            <div>
              <SelectList
                {...sex}
                data={[ 'male', 'female' ]}
                onChange={(value) => sex.onChange(value)} /* Simulating onChange manually*/
                onBlur = {event => sex.onBlur()} /* Simulating onBlur manually*/
              />
              {sex.touched && sex.error && <span>{sex.error}</span>}
            </div>
            }
          />
      </div>
      <div>
        <button type="submit" disabled={pristine || submitting}>Submit</button>
        <button type="button" disabled={pristine || submitting} onClick={reset}>Clear Values</button>
      </div>
      </form>
  )
}

// Decorate with reduxForm(). It will read the initialValues prop provided by connect()
ReactWidgetsForm = reduxForm({
  validate,
  form: 'ReactWidgetsForm'  // a unique identifier for this form
})(ReactWidgetsForm)

// You have to connect() to any reducers that you wish to connect to yourself
ReactWidgetsForm = connect(
  state => ({
    initialValues: state.userData.data // pull initial values from account reducer
  }),
  { load: loadData }               // bind account loading action creator
)(ReactWidgetsForm)

export default ReactWidgetsForm
