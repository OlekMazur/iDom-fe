<!--
This file is part of iDom-fe.

Copyright (c) 2018, 2019 Aleksander Mazur

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

<tr :key="message.group + '.' + message.name" :class="rowStyle">
	<td class="big">
		<font-awesome-icon v-if="message.group === 'SMS' && message.sent" :icon="faSms" title="SMS (już przesłany)" fixed-width />
		<font-awesome-icon v-else-if="message.group === 'SMS'" :icon="faSms" class="blink" title="SMS (jeszcze nie przesłany)" fixed-width />
		<font-awesome-icon v-else-if="message.group === 'USSD'" :icon="faCommentDollar" title="USSD" fixed-width />
		<font-awesome-icon v-if="matchesIMSI && message.copy" :icon="faSimCard" title="SMS (wciąż na karcie SIM)" />
	</td>
	<td class="bold">{{ message.from }}</td>
	<td class="message-content">{{ message.content }}</td>
	<td>{{ ts }}</td>
	<td>
		<ButtonDelete v-if="deletable" @click="deleteMessage" title="Skasuj wiadomość" />
	</td>
</tr>
