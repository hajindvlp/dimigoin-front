import { getMeal } from '../../../src/api'

const MEAL_REQUEST = 'MEAL:MEAL_REQUEST'
const MEAL_SUCCESS = 'MEAL:MEAL_SUCCESS'

export default {
  namespaced: true,

  state: {
    breakfast: '',
    lunch: '',
    dinner: '',
    nosh: '',
    pending: false,
    isFetched: false
  },

  mutations: {
    [MEAL_REQUEST] (state) {
      state.pending = true
    },

    [MEAL_SUCCESS] (state, { meal }) {
      state.breakfast = meal[0]
      state.lunch = meal[1]
      state.dinner = meal[2]
      state.nosh = meal[3]

      state.isFetched = true
      state.pending = false
    }
  },

  actions: {
    async fetchMeal ({commit}) {
      commit(MEAL_REQUEST)
      commit(MEAL_SUCCESS, {
        meal: await getMeal()
      })
    }
  }
}
