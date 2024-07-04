<template>
  <div>
    <!-- <v-card>
    <v-toolbar dense color="red darken-3" dark>
      <v-toolbar-title>Summary of Duvals Interpretations</v-toolbar-title>
    </v-toolbar> -->
    <v-data-table dense :headers="headers" :items="historical_data"  item-key="name" class="elevation-1 pa-1">
      <!-- <template v-slot:header="{ props: { headers } }">
        <thead>
          <tr>
            <th v-for="h in headers" :class="h.class">
              <span>{{ h.text }}</span>
            </th>
          </tr>
        </thead>
      </template> -->
      <template v-slot:item="{ item }">
        <tr @click="showInterpretations(item)">
          <td>
            <span class="font-sm">{{ dateFormat(item.timestamp) }}</span>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t1 === 'Normal', 'circle not-normal': item.t1 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t2 === 'Normal', 'circle not-normal': item.t2 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t3 === 'Normal', 'circle not-normal': item.t3 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t4 === 'Normal', 'circle not-normal': item.t4 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t5 === 'Normal', 'circle not-normal': item.t5 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t6 === 'Normal', 'circle not-normal': item.t6 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.t7 === 'Normal', 'circle not-normal': item.t7 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.p1 === 'Normal', 'circle not-normal': item.p1 !== 'Normal' }"></div>
          </td>
          <td class="font-sm pa-1">
            <div :class="{ 'circle normal': item.p2 === 'Normal', 'circle not-normal': item.p2 !== 'Normal' }"></div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <interpretations-details :details="attribute_value_details" :show="showInterpretationsPopup" @close="hideLogPopup"></interpretations-details>
    <!-- </v-card> -->
  </div>
</template>

<style>
.font-sm {
  font-size: 12px !important;
}
.circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.normal {
  background-color: green;
}

.not-normal {
  background-color: red;
}

.denser-header {
  padding: 0 !important;
}
</style>

<script>
import axios from "axios";
import InterpretationsDetails from "@/components/popups/InterpretationsDetails.vue";

export default {
  name: "SummaryInterpretation",
  props: ["historical_data"],
  components: {
    InterpretationsDetails,
  },
  data() {
    return {
      headers: [
        {
          text: "Timestamp",
          align: "start",
          sortable: true,
          value: "timestamp",
        },
        {
          text: "T1",
          align: "start",
          sortable: false,
          value: "t1",
          class: "denser-header",
        },
        {
          text: "T2",
          align: "start",
          sortable: false,
          value: "t2",
          class: "denser-header",
        },
        {
          text: "T3",
          align: "start",
          sortable: false,
          value: "t3",
          class: "denser-header",
        },
        {
          text: "T4",
          align: "start",
          sortable: false,
          value: "t4",
          class: "denser-header",
        },
        {
          text: "T5",
          align: "start",
          sortable: false,
          value: "t5",
          class: "denser-header",
        },
        {
          text: "T6",
          align: "start",
          sortable: false,
          value: "t6",
          class: "denser-header",
        },
        {
          text: "T7",
          align: "start",
          sortable: false,
          value: "t7",
          class: "denser-header",
        },
        {
          text: "P1",
          align: "start",
          sortable: false,
          value: "p1",
          class: "denser-header",
        },
        {
          text: "P2",
          align: "start",
          sortable: false,
          value: "p2",
          class: "denser-header",
        },
      ],
      data: [],
      showInterpretationsPopup: false,
      attribute_value_details: {},
    };
  },
  mounted() {},
  watch: {
    flipper() {
      // we want to display the lastest datapoint the user has entered without remounting
      // so we use a flipper (its only use it to flip true or false) in the parent component
      // upon successful insert of datapoint.. we flip.. this component detects that flip then
      // we re-fetch with an API call
      this.getAttributeValues(this.elementID);
    },
  },
  methods: {
    dateFormat(date) {
      let d = new Date(date);
      return d.toLocaleString();
    },
    // viewAllDetails(item) {
    //   this.$emit("showDetails", item);
    // },
    showInterpretations(item) {
      this.attribute_value_details = item;
      this.showInterpretationsPopup = true;
    },
    hideLogPopup() {
      this.showInterpretationsPopup = false;
    },
  },
};
</script>
