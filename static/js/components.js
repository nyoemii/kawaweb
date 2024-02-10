Vue.component('badge', {
  props: ['badge'],
  data: function () {
    return {
      showPanel: false
    }
  },
  template: `
    <div class="badge"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);'" @mouseover="showPanel = true" @mouseleave="showPanel = false">
      <span class="icon" v-if="badge.styles.icon">
        <i v-bind:class="'fas fa-' + badge.styles.icon"></i>
      </span>
      <span class="badge-name">
        {{ badge.name }}
      </span>
      <div class="badge-panel" v-if="showPanel" :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);'">
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <!-- Add more badge details here -->
      </div>
    </div>
  `
})