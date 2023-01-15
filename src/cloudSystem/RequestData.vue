<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019, 2021 Aleksander Mazur

iDom-fe is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

iDom-fe is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public License
along with iDom-fe. If not, see <https://www.gnu.org/licenses/>.
-->

<ul>
	<li v-for="(value, key) in data">
		<template v-if="typeof value === 'object'">
			{{ key }}
			<RequestData :data="value" />
		</template>
		<template v-else>{{ key }} = {{ value }}</template>
	</li>
</ul>
