/*!
 * This file is part of iDom-fe.
 *
 * Copyright (c) 2018 Aleksander Mazur
 *
 * iDom-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * iDom-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
 */

'use strict'

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'normalize.css'
import './main.css'
import './tables.css'
import './forms.css'
import './video.css'
import './transitions.css'
import Vue from 'vue'
import VueRouter from 'vue-router'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import Alert from './alert'
import Main from './main'

Vue.config.devtools = true	// required to enable DevTools in CDN's Vue
Vue.use(Alert)
Vue.use(VueRouter)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
new Vue(Main).$mount('#main')
