<script>
import moment from 'moment'
import { afterschool } from '@/src/api/index'
import { days } from '@/src/util/index'

import ContentWrapper from '@/components/ContentWrapper.vue'
import VueRecaptcha from 'vue-recaptcha'

export default {
  name: 'RequestAfterschool',
  components: { ContentWrapper, VueRecaptcha },

  filters: {
    dateRange (item) {
      moment.locale('ko')
      const [a, b] = [moment(item.startDate), moment(item.endDate)]
      return `${a.fromNow()}에 시작 (${a.format('llll')})\n${b.fromNow()}에 마감 (${b.format('llll')})`
    }
  },

  data () {
    return {
      list: [],
      pending: false,
      currentDay: 0,
      captchaOpen: false,
      captchaResponse: null,
      callbackAfterCaptcha: () => null
    }
  },

  computed: {
    days () { return days },
    sitekey () { return process.env.RECAPTCHA_SITE_KEY },

    currentList () {
      return this.list.filter(item => item.day === days[this.currentDay].code)
    },

    applied () {
      return this.currentList.some(item => item.status === 'request')
    }
  },

  async created () {
    await this.refresh()
  },

  methods: {
    async refresh () {
      this.pending = true
      this.list = await afterschool.getStudentAfterschool()
      this.pending = false
    },

    verifyRecaptcha (response) {
      this.captchaResponse = response
      if (response) {
        this.captchaOpen = false
        this.callbackAfterCaptcha()
        this.callbackAfterCaptcha = () => null
      }
    },

    async toggleApply (item) {
      try {
        if (item.status === null) await this.apply(item)
        else await afterschool.cancelAfterschool(item.idx)
      } catch (err) {
        this.$swal('이런!', err.message, 'error')
      }

      await this.refresh()
    },

    async apply (item) {
      if (this.captchaResponse === null) {
        this.captchaOpen = true
        this.callbackAfterCaptcha = () => this.toggleApply(item)
        return
      }

      try {
        await afterschool.applyAfterschool(item.idx, this.captchaResponse)
      } catch (e) {
        throw e
      } finally {
        this.captchaResponse = null
        this.$refs.recaptcha.reset()
      }
    }
  }
}
</script>

<template>
  <content-wrapper class="req-afsc">
    <h1 slot="header">
      <span class="icon-ball"/>2018년 하반기 방과 후 활동 신청
      <span
        class="req-afsc__refresh"
        @click="refresh">새로고침</span>
    </h1>

    <dimi-card
      slot="main"
      class="req-afsc__main">

      <dimi-tab
        v-model="currentDay"
        :tabs="days.map(v => v.text)"
        :small-tabs="days.map(v => v.smallText)"/>

      <div
        v-if="pending"
        class="req-afsc__loader-wrapper">
        <dimi-loader/>
      </div>

      <table
        v-else
        class="req-afsc__list">
        <tbody>
          <tr
            v-for="(item, idx) in currentList"
            :key="`aftc-${currentDay}-${idx}`"
            class="req-afsc__row">
            <td class="req-afsc__cell req-afsc__cell--name">{{ item.name }}</td>
            <td class="req-afsc__cell">{{ item.teacherName }}</td>
            <td
              :title="`${item.count}/${item.maxCount}`"
              class="req-afsc__cell">
              {{ (item.maxCount - item.count) + '명 남음' }}
            </td>
            <td
              :class="{
                'req-afsc__cell': true,
                'req-afsc__cell--button': true,
                'req-afsc__cell--full': item.maxCount === item.count,
                'req-afsc__cell--applied': item.status === 'request'
              }"
              :title="item | dateRange"
              @click="toggleApply(item)">

              <template v-if="applied">
                <template v-if="item.status === 'request'">
                  <span class="icon-cross"/> 신청취소
                </template>
              </template>

              <template v-else>
                <template v-if="item.maxCount > item.count">
                  <span class="icon-ok"/> 신청하기
                </template><template v-else>
                  <span class="icon-alert"/> 신청불가
                </template>
              </template>
            </td>
          </tr>
          <!-- <tr
            v-if="currentList.length === 0"
            class="req-afsc__row">
            <td class="req-afsc__cell req-afsc__cell--placeholder">(없음)</td>
          </tr> -->
        </tbody>
      </table>

      <dimi-modal
        :opened="captchaOpen"
        @close="captchaOpen = false">

        <vue-recaptcha
          ref="recaptcha"
          :sitekey="sitekey"
          @verify="verifyRecaptcha"
          @expired="verifyRecaptcha(null)"/>
      </dimi-modal>
    </dimi-card>
  </content-wrapper>
</template>

<style lang="scss" scoped>
@import '~styles/variables';

.req-afsc {
  &__loader-wrapper {
    align-items: center;
    display: flex;
    height: 35vh;
    justify-content: center;
  }

  &__captcha {
    color: $gray-dark;
    font-size: 16px;
    line-height: 1.8;
    padding-bottom: 2em;
  }

  &__main {
    padding-top: 0;
  }

  &__refresh {
    color: $red;
    cursor: pointer;
    float: right;
    font-size: 16px;
    margin-right: 0.5em;
    margin-top: 1em;
  }

  &__row:not(:last-child) {
    border-bottom: 1px solid $gray-lighter;
  }

  &__list {
    color: $gray !important;
    font-weight: $font-weight-bold;
    width: 100%;
  }

  &__cell {
    color: $gray;
    padding: 24px;
    white-space: nowrap;
  }

  &__cell--name {
    color: $black;
    line-height: 1.5;
    white-space: normal;
    width: 99%;
  }

  // &__cell--placeholder {
  //   color: $gray;
  //   font-size: 25px;
  //   text-align: center;
  // }

  &__cell--button {
    color: $pink;
    cursor: pointer;
  }

  &__cell--full {
    color: $mustard;
  }

  &__cell--applied {
    color: $gray-light;
  }
}
</style>