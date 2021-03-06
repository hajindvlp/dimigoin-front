<script>
import ContentWrapper from '@/components/ContentWrapper.vue'
import { detsRequestor } from '@/src/api/dets'
import days from '@/src/util/days'
import { getPosterURL } from '@/src/util/imageUpload'

export default {
  name: 'RequestDets',

  components: { ContentWrapper },

  filters: {
    filterTime (time) {
      return '야자 ' + time + '타임'
    }
  },

  data () {
    return {
      list: [],
      pending: false
    }
  },

  computed: {
    days () {
      return days.filter(v => v.idx < 5)
    }
  },

  async created () {
    await this.refresh()
  },

  methods: {
    async refresh () {
      this.pending = true
      this.list = await detsRequestor.getDetsList()
      this.pending = false
    },

    async toggleApply (parameter) {
      try {
        if (parameter.status !== 'request') await detsRequestor.applyDets(parameter.idx)
        else await detsRequestor.cancelDets(parameter.idx)
      } catch (err) {
        this.$swal('이런!', err.message, 'error')
      }
      await this.refresh()
    },

    async openPoster (dets) {
      const { title } = dets
      const url = await getPosterURL(title)
      const win = window.open(url, '_blank')
      win.focus()
    },

    getDayTextByCode (code) {
      return this.days.filter(v => v.code === code)[0].text
    }
  }
}
</script>

<template>
  <content-wrapper>
    <h1 slot="header">
      <span class="icon-dets-lg" />Dets 신청
    </h1>

    <dimi-card
      slot="main"
      class="dets__main"
    >
      <div
        v-if="pending"
        class="dets__loader-wrapper"
      >
        <dimi-loader />
      </div>
      <template v-else>
        <div
          v-if="!list.length"
          class="dets__empty"
        >
          아직 등록된 DETS 활동이 없습니다
        </div>
        <div
          v-for="(dets, index) in list"
          :key="`detslist_${index}`"
        >
          <div
            class="dets__dets"
            @click="dets.open = !dets.open"
          >
            <span class="dets__item dets__title">
              {{ dets.title }}
            </span>
            <span class="dets__item">
              {{ dets.speakerSerial }} {{ dets.speakerName }}
            </span>
            <div class="dets__item dets__expand">
              <span :class="`icon-arrow-${dets.open ? 'up' : 'down'}`" />
            </div>
          </div>
          <div
            v-if="dets.open"
            class="dets__open"
          >
            <span
              class="dets__item dets__description"
              v-html="dets.description"
            />
            <div
              class="dets__down"
            >
              <div
                class="dets__detail"
              >
                <span class="dets__item">
                  강의실
                </span>
                <span class="dets__item">
                  {{ dets.room }}
                </span>
                <span class="dets__item">
                  강의시각
                </span>
                <span class="dets__item">
                  {{ dets.date }}
                </span>
                <span class="dets__item">
                  인원
                </span>
                <span class="dets__item">
                  {{ dets.count }} / {{ dets.maxCount }} 명
                </span>
              </div>
              <div
                class="dets__poster"
                @click="openPoster(dets)"
              >
                <span class="icon-dets-sm" /> 포스터 확인하기
              </div>
              <div
                :class="{
                  'dets__item': true,
                  'dets__item--button': true,
                  'dets__item--full': dets.maxCount === dets.count,
                  'dets__item--applied': dets.status === 'request'
                }"
                @click="toggleApply(dets)"
              >
                <template v-if="dets.status === 'request'">
                  <span class="icon-cross" /> 신청취소
                </template>
                <template v-else>
                  <template v-if="dets.maxCount > dets.count">
                    <span class="icon-ok" /> 신청하기
                  </template>
                  <template v-else>
                    <span class="icon-alert" /> 신청불가
                  </template>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </dimi-card>
  </content-wrapper>
</template>

<style lang="scss" scoped>
.dets {
  &__loader-wrapper {
    display: flex;
    height: 35vh;
    align-items: center;
    justify-content: center;
  }

  &__main {
    padding-top: 0;
    padding-bottom: 0;
  }

  &__dets {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 24px;
    border-bottom: 1px solid $gray-lighter;
    cursor: pointer;
  }

  &__item {
    margin-right: 16px;
    color: $gray;
    font-size: 16px;
    font-weight: $font-weight-bold;
  }

  &__title {
    flex: 1;
    color: $black !important;
  }

  &__expand {
    margin-left: 16px;
  }

  &__open {
    align-items: stretch;
    justify-content: flex-start;
    padding: 24px;
    border-bottom: 1px solid $gray-lighter;
    cursor: default;
  }

  &__down {
    display: flex;
    padding-top: 24px;
  }

  &__description {
    flex-direction: column;
    font-family: inherit;
    font-weight: $font-weight-regular;
    line-height: 1.8;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  &__detail {
    flex: 1;
  }

  &__poster {
    margin-right: 0.8em;
    color: #00b4a1;
    cursor: pointer;
    font-size: 16px;
    font-weight: $font-weight-bold;
  }

  &__item--button {
    color: $pink;
    cursor: pointer;
  }

  &__item--full {
    color: $mustard;
  }

  &__item--applied {
    color: $gray-light;
  }

  &__empty {
    padding: 24px;
    margin-right: 16px;
    color: $gray;
    font-size: 16px;
    font-weight: $font-weight-bold;
  }
}
</style>
