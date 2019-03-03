// Styles
import './VListGroup.sass'

// Components
import VIcon from '../VIcon'
import VList from './VList'
import VListItem from './VListItem'
import VListItemIcon from './VListItemIcon'

// Mixins
import Bootable from '../../mixins/bootable'
import Toggleable from '../../mixins/toggleable'
import { inject as RegistrableInject } from '../../mixins/registrable'
import { Route } from 'vue-router'

// Directives
import Ripple from '../../directives/ripple'

// Transitions
import { VExpandTransition } from '../transitions'

// Utils
import mixins, { ExtractVue } from '../../util/mixins'
import { keyCodes } from '../../util/helpers'

// Types
import { VNode } from 'vue'

const baseMixins = mixins(
  Bootable,
  RegistrableInject('list'),
  Toggleable
)

type VListInstance = InstanceType<typeof VList>

interface options extends ExtractVue<typeof baseMixins> {
  list: VListInstance
  $refs: {
    group: HTMLElement
  }
  $route: Route
}

export default baseMixins.extend<options>().extend({
  name: 'v-list-group',

  directives: { Ripple },

  props: {
    activeClass: {
      type: String,
      default: 'primary--text'
    },
    appendIcon: {
      type: String,
      default: '$vuetify.icons.expand'
    },
    disabled: Boolean,
    group: String,
    noAction: Boolean,
    prependIcon: String,
    ripple: {
      type: [Boolean, Object],
      default: true
    },
    subGroup: Boolean
  },

  computed: {
    groupClasses (): object {
      return {
        'v-list-group--active': this.isActive,
        'v-list-group--disabled': this.disabled,
        'v-list-group--no-action': this.noAction,
        'v-list-group--sub-group': this.subGroup
      }
    }
  },

  watch: {
    isActive (val) {
      if (!this.subGroup && val) {
        this.list && this.list.listClick(this._uid)
      }
    },
    $route (to) {
      const isActive = this.matchRoute(to.path)

      if (this.group) {
        if (isActive && this.isActive !== isActive) {
          this.list && this.list.listClick(this._uid)
        }

        this.isActive = isActive
      }
    }
  },

  mounted () {
    this.list && this.list.register(this)

    if (this.group &&
      this.$route &&
      this.value == null
    ) {
      this.isActive = this.matchRoute(this.$route.path)
    }
  },

  beforeDestroy () {
    this.list && this.list.unregister(this)
  },

  methods: {
    click () {
      if (this.disabled) return

      this.isActive = !this.isActive
    },
    genIcon (icon: string | false): VNode {
      return this.$createElement(VIcon, icon)
    },
    genAppendIcon () {
      const icon = !this.subGroup ? this.appendIcon : false

      if (!icon && !this.$slots.appendIcon) return null

      return this.$createElement(VListItemIcon, {
        staticClass: 'v-list-group__header__append-icon'
      }, [
        this.$slots.appendIcon || this.genIcon(icon)
      ])
    },
    genHeader () {
      return this.$createElement(VListItem, {
        staticClass: 'v-list-group__header',
        directives: [{
          name: 'ripple',
          value: this.ripple
        }],
        on: {
          ...this.$listeners,
          click: this.click,
          keydown: (e: KeyboardEvent) => {
            if (e.keyCode === keyCodes.enter) this.click()
          }
        }
      }, [
        this.genPrependIcon(),
        this.$slots.activator,
        this.genAppendIcon()
      ])
    },
    genItems () {
      return this.$createElement('div', {
        staticClass: 'v-list-group__items',
        directives: [{
          name: 'show',
          value: this.isActive
        }]
      }, this.showLazyContent(this.$slots.default))
    },
    genPrependIcon () {
      const icon = this.prependIcon
        ? this.prependIcon
        : this.subGroup
          ? '$vuetify.icons.subgroup'
          : false

      if (!icon && !this.$slots.prependIcon) return null

      return this.$createElement(VListItemIcon, {
        staticClass: 'v-list-group__header__prepend-icon',
        'class': {
          [this.activeClass]: this.isActive
        }
      }, [
        this.$slots.prependIcon || this.genIcon(icon)
      ])
    },
    toggle (uid: number) {
      this.isActive = this._uid === uid
    },
    matchRoute (to: string) {
      if (!this.group) return false
      return to.match(this.group) !== null
    }
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-list-group',
      class: this.groupClasses
    }, [
      this.genHeader(),
      h(VExpandTransition, [this.genItems()])
    ])
  }
})
