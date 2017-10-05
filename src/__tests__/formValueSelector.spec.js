/* eslint react/no-multi-comp:0 */
import createFormValueSelector from '../createFormValueSelector'
import plain from '../structure/plain'
import plainExpectations from '../structure/plain/__tests__/expectations'
import immutable from '../structure/immutable'
import immutableExpectations from '../structure/immutable/__tests__/expectations'

const describeFormValueSelector = (name, structure, setup) => {
  const { fromJS, getIn } = structure
  const formValueSelector = createFormValueSelector(structure)

  describe(name, () => {
    beforeAll(() => {
      setup()
    })

    it('should throw an error if no form specified', () => {
      expect(() => formValueSelector()).toThrow('Form value must be specified')
    })

    it('should return a function', () => {
      expect(typeof formValueSelector('myForm')).toBe('function')
    })

    it('should throw an error if no fields specified', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({})
      expect(() => selector(state)).toThrow('No fields specified')
    })

    it('should return undefined for a single value when no redux-form state found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({})
      expect(selector(state, 'foo')).toBe(undefined)
    })

    it('should return undefined for a single value when no form slice found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {}
      })
      expect(selector(state, 'foo')).toBe(undefined)
    })

    it('should return undefined for a single value when no values found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            // no values
          }
        }
      })
      expect(selector(state, 'foo')).toBe(undefined)
    })

    it('should get a single value', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              foo: 'bar'
            }
          }
        }
      })
      expect(selector(state, 'foo')).toBe('bar')
    })

    it('should get a single deep value', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              dog: {
                cat: {
                  ewe: {
                    pig: 'Napoleon'
                  }
                }
              }
            }
          }
        }
      })
      expect(selector(state, 'dog.cat.ewe.pig')).toBe('Napoleon')
    })

    it('should return {} for multiple values when no redux-form state found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({})
      expect(selector(state, 'foo', 'bar')).toEqual({})
    })

    it('should return {} for multiple values when no form slice found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {}
      })
      expect(selector(state, 'foo', 'bar')).toEqual({})
    })

    it('should return {} for multiple values when no values found', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            // no values
          }
        }
      })
      expect(selector(state, 'foo', 'bar')).toEqual({})
    })

    it('should get multiple values', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              foo: 'bar',
              dog: 'cat',
              another: 'do not read'
            }
          }
        }
      })
      expect(selector(state, 'foo', 'dog')).toEqual({
        foo: 'bar',
        dog: 'cat'
      })
    })

    it('should get multiple deep values', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              dog: {
                cat: {
                  ewe: {
                    pig: 'Napoleon'
                  }
                },
                rat: {
                  hog: 'Wilbur'
                }
              }
            }
          }
        }
      })
      expect(selector(state, 'dog.cat.ewe.pig', 'dog.rat.hog')).toEqual({
        dog: {
          cat: {
            ewe: {
              pig: 'Napoleon'
            }
          },
          rat: {
            hog: 'Wilbur'
          }
        }
      })
    })

    it('should get an array', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              mice: ['Jaq', 'Gus', 'Major', 'Bruno']
            }
          }
        }
      })
      expect(selector(state, 'mice')).toEqualMap([
        'Jaq',
        'Gus',
        'Major',
        'Bruno'
      ])
    })

    it('should get a deep array', () => {
      const selector = formValueSelector('myForm')
      const state = fromJS({
        form: {
          myForm: {
            values: {
              rodent: {
                rat: {
                  hog: 'Wilbur'
                },
                mice: ['Jaq', 'Gus', 'Major', 'Bruno']
              }
            }
          }
        }
      })
      expect(selector(state, 'rodent.rat.hog', 'rodent.mice')).toEqual({
        rodent: {
          rat: {
            hog: 'Wilbur'
          },
          mice: fromJS(['Jaq', 'Gus', 'Major', 'Bruno'])
        }
      })
    })

    it('should get a single value using a different mount point', () => {
      const selector = formValueSelector('myForm', state =>
        getIn(state, 'otherMountPoint')
      )
      const state = fromJS({
        otherMountPoint: {
          myForm: {
            values: {
              foo: 'bar'
            }
          }
        }
      })
      expect(selector(state, 'foo')).toBe('bar')
    })
  })
}

describeFormValueSelector('formValueSelector.plain', plain, () =>
  expect.extend(plainExpectations)
)
describeFormValueSelector('formValueSelector.immutable', immutable, () =>
  expect.extend(immutableExpectations)
)
