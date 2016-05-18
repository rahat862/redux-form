import { initialize } from '../actions'

const describeInitialize = (reducer, expect, { fromJS }) => () => {
  it('should set initialize values on initialize on empty state', () => {
    const state = reducer(undefined, {
      ...initialize({ myField: 'initialValue' }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            myField: 'initialValue'
          },
          initial: {
            myField: 'initialValue'
          }
        }
      })
  })

  it('should allow initializing null values', () => {
    const state = reducer(undefined, {
      ...initialize({ bar: 'baz', dog: null }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            bar: 'baz',
            dog: null
          },
          initial: {
            bar: 'baz',
            dog: null
          }
        }
      })
  })

  it('should initialize nested values on initialize on empty state', () => {
    const state = reducer(undefined, {
      ...initialize({ myField: { subField: 'initialValue' } }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            myField: {
              subField: 'initialValue'
            }
          },
          initial: {
            myField: {
              subField: 'initialValue'
            }
          }
        }
      })
  })

  it('should initialize array values on initialize on empty state', () => {
    const state = reducer(undefined, {
      ...initialize({ myField: [ 'initialValue' ] }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            myField: [ 'initialValue' ]
          },
          initial: {
            myField: [ 'initialValue' ]
          }
        }
      })
  })

  it('should initialize array values with subvalues on initialize on empty state', () => {
    const state = reducer(undefined, {
      ...initialize({
        accounts: [
          {
            name: 'Bobby Tables',
            email: 'bobby@gmail.com'
          },
          {
            name: 'Sammy Tables',
            email: 'sammy@gmail.com'
          }
        ]
      }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            accounts: [
              {
                name: 'Bobby Tables',
                email: 'bobby@gmail.com'
              },
              {
                name: 'Sammy Tables',
                email: 'sammy@gmail.com'
              }
            ]
          },
          initial: {
            accounts: [
              {
                name: 'Bobby Tables',
                email: 'bobby@gmail.com'
              },
              {
                name: 'Sammy Tables',
                email: 'sammy@gmail.com'
              }
            ]
          }
        }
      })
  })

  it('should set initialize values, making form pristine when initializing', () => {
    const state = reducer(fromJS({
      foo: {
        values: {
          myField: 'dirtyValue'
        },
        fields: {
          myField: {
            touched: true
          }
        }
      }
    }), {
      ...initialize({ myField: 'cleanValue' }),
      form: 'foo'
    })
    expect(state)
      .toEqualMap({
        foo: {
          values: {
            myField: 'cleanValue'
          },
          initial: {
            myField: 'cleanValue'
          }
        }
      })
  })
}

export default describeInitialize
