import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { App, Code, Markdown, Values, generateExampleBreadcrumbs } from 'redux-form-website-template'
import reducer from './reducer'

const dest = document.getElementById('content')

const store =
  (window.devToolsExtension ? window.devToolsExtension()(createStore) : createStore)(reducer)

const showResults = values =>
  new Promise(resolve => {
    setTimeout(() => {  // simulate server latency
      window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
      resolve()
    }, 500)
  })

let render = () => {
  const WizardForm = require('./WizardForm').default
  const readme = require('./Wizard.md')
  const rawWizard = require('!!raw!./WizardForm')
  const WizardFormFirstPage = require('!!raw!./WizardFormFirstPage')
  const WizardFormSecondPage = require('!!raw!./WizardFormSecondPage')
  const WizardFormThirdPage = require('!!raw!./WizardFormThirdPage')
  ReactDOM.render(
    <Provider store={store}>
      <App
        /**
         * This <App/> component only provides the site wrapper.
         * Remove it on your dev server if you wish. It will not affect the functionality.
         */
        version={REDUX_FORM_VERSION}
        path="/examples/wizard"
        breadcrumbs={generateExampleBreadcrumbs('wizard', 'Wizard Form Example', REDUX_FORM_VERSION)}>

        <Markdown content={readme}/>

        <h2>Form</h2>

        <WizardForm onSubmit={showResults}/>

        <Values form="wizard"/>

        <h2>Code</h2>

        <h4>WizardForm.js</h4>

        <Code source={rawWizard}/>

        <h4>WizardFormFirstPage.js</h4>

        <Code source={WizardFormFirstPage}/>

        <h4>WizardFormSecondPage.js</h4>

        <Code source={WizardFormSecondPage}/>

        <h4>WizardFormThirdPage.js</h4>

        <Code source={WizardFormThirdPage}/>

      </App>
    </Provider>,
    dest
  )
}

if (module.hot) {
  // Support hot reloading of components
  // and display an overlay for runtime errors
  const renderApp = render
  const renderError = (error) => {
    const RedBox = require('redbox-react')
    ReactDOM.render(
      <RedBox error={error} className="redbox"/>,
      dest
    )
  }
  render = () => {
    try {
      renderApp()
    } catch (error) {
      renderError(error)
    }
  }
  const rerender = () => {
    setTimeout(render)
  }
  module.hot.accept('./WizardForm', rerender)
  module.hot.accept('./Wizard.md', rerender)
  module.hot.accept('./WizardForm', rerender)
  module.hot.accept('./WizardFormFirstPage', rerender)
  module.hot.accept('./WizardFormSecondPage', rerender)
  module.hot.accept('./WizardFormThirdPage', rerender)
  module.hot.accept('./WizardFormThirdPage', rerender)
  module.hot.accept('!!raw!./WizardFormFirstPage', rerender)
  module.hot.accept('!!raw!./WizardFormSecondPage', rerender)
  module.hot.accept('!!raw!./WizardFormThirdPage', rerender)
}

render()
