Vue.component('badge', {
  props: {
    badge: {
      type: Object,
      required: true,
      validator: function (value) {
        return value !== null && typeof value === 'object' && value.hasOwnProperty('styles');
      }
    },
    type: {
      type: Number,
      default: 0,
      validator: function (value) {
        return [0, 1].includes(value);
      }
    },
    test: {
      type: Number,
      default: 0,
      validator: function (value) {
        return [0, 1].includes(value);
      }
    }
  },
  data: function () {
    return {
      showPanel: false
    }
  },
  watch: {
    type: function (newVal) {
      if (typeof newVal !== 'number') {
        this.type = Number(newVal);
      }
    }
  },
  created() {
    if (this.test === 1) {
      console.log('Type:', this.type);
      console.log('Badge:', this.badge);
      console.log('Type === 0:', this.type === 0);
      console.log('Type === 1:', this.type === 1);
    }
  },
  template: `
  <span data-popup="badge">
    <div v-if="type === 0" class="badge"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);  border: 1px solid hsl(' + badge.styles.color + ', 40%, 35%);'" @mouseover="showPanel = true" @mouseleave="showPanel = false">
      <span class="icon" v-if="badge.styles.icon">
        <i v-bind:class="'fas fa-' + badge.styles.icon"></i>
      </span>
      <span class="badge-name">
        {{ badge.name }}
      </span>
      <div class="badge-panel"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 20%); color: hsl(' + badge.styles.color + ', 100%, 80%);'">
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <!-- Add more badge details here -->
      </div>
    </div>
    <div v-if="type === 1" class="iconBadge"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 30%); color: hsl(' + badge.styles.color + ', 100%, 80%);  border: 1px solid hsl(' + badge.styles.color + ', 40%, 35%);'" @mouseover="showPanel = true" @mouseleave="showPanel = false">
      <span class="icon" v-if="badge.styles.icon">
        <i v-bind:class="'fas fa-' + badge.styles.icon"></i>
      </span>
      <div class="badge-panel"  :style="'background-color: hsl(' + badge.styles.color + ', 20%, 20%); color: hsl(' + badge.styles.color + ', 100%, 80%);'">
        <h3>{{ badge.name }}</h3>
        <p>{{ badge.description }}</p>
        <!-- Add more badge details here -->
      </div>
    </div>
  </span>
  `
})