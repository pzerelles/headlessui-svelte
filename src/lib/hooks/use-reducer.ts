export const useReducer = <State, Action>(reducer: (state: State, action: Action) => State, initialState: State) => {
  let state = $state(initialState)
  return {
    get state() {
      return state
    },
    dispatch(action: Action) {
      state = reducer(state, action)
    },
  }
}
