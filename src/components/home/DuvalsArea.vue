<template>
  <div>
    <v-card outlined elevation="0">
      <v-toolbar dense color="red darken-3" dark elevation="0">
        <v-toolbar-title class="font text-uppercase font-weight-medium">{{ symbol.name }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text dark @click="symbols_dialog = true"> Select<v-icon class="">mdi-chevron-right</v-icon> </v-btn>
        <!-- <v-spacer></v-spacer>
             <v-toolbar-item> See Legends</v-toolbar-item>
             <v-btn class="float-right" x-small text dark @click="legends_deialog = true">
                <v-icon class="">mdi-chevron-right-circle-outline</v-icon>
              </v-btn> -->
      </v-toolbar>

      <div class="column-content">
        <div
          class="floating-indicator"
          v-if="current.interpretation != 'Normal' && current.interpretation != undefined"
          :style="{ background: symbol.legends[current.interpretation].color }"
        >
          {{ current.interpretation }}
        </div>
        <div class="content">
          <div class="left-content">
            <span class="floating-indicator normal" v-if="current.interpretation == 'Normal'" :style="{ background: 'transparent' }">Normal</span>
            <span class="floating-indicator normal" v-if="current.interpretation == null" :style="{ background: 'transparent' }">No Data</span>
          </div>
          <div class="right-content">
            <span class="label-sm link" @click="legends_deialog = !legends_deialog">{{ legends_deialog ? "- Hide " : "+ Show" }} Legends</span>
          </div>
        </div>
        <div v-if="symbol.id == 1">
          <!-- <duvals-triangle-one :data="data"></duvals-triangle-one> -->
          <div v-html="svgs.t1" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 2">
          <!-- <duvals-triangle-two :data="data"></duvals-triangle-two> -->
          <div v-html="svgs.t2" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 3">
          <!-- <duvals-triangle-three :data="data"></duvals-triangle-three> -->
          <div v-html="svgs.t3" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 4">
          <!-- <duvals-triangle-four :data="data"></duvals-triangle-four> -->
          <div v-html="svgs.t4" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 5">
          <!-- <duvals-triangle-five :data="data"></duvals-triangle-five> -->
          <div v-html="svgs.t5" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 6">
          <!-- <duvals-triangle-six :data="data"></duvals-triangle-six> -->
          <div v-html="svgs.t6" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 7">
          <!-- <duvals-triangle-seven :data="data"></duvals-triangle-seven> -->
          <div v-html="svgs.t7" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 8" class="pt-2">
          <!-- <duvals-pentagon-one :data="data"></duvals-pentagon-one> -->
          <div v-html="svgs.p1" @mouseenter="addListenersToCircles"></div>
        </div>
        <div v-if="symbol.id == 9" class="pt-2">
          <!-- <duvals-pentagon-two :data="data"></duvals-pentagon-two> -->
          <div v-html="svgs.p2" @mouseenter="addListenersToCircles"></div>
        </div>
      </div>

      <div class="content">
        <div class="content-item" v-if="![4, 6].includes(symbol.id) && ![5, 7].includes(symbol.id)">
          <span class="label-sm">Acetylene :</span>
          <span class="percentage" v-if="![1, 2, 3].includes(symbol.id)">{{ current.c2h2_pc_pen ? current.c2h2_pc_pen : 0 }}%</span>
          <span class="percentage" v-if="[1, 2, 3].includes(symbol.id)">{{ current.c2h2_pc_tri_1 ? current.c2h2_pc_tri_1 : 0 }}%</span>
        </div>

        <div class="content-item" v-if="![4, 6].includes(symbol.id)">
          <span class="label-sm">Ethylene :</span>
          <span class="percentage" v-if="![1, 2, 3].includes(symbol.id) && ![5, 7].includes(symbol.id)">{{ current.c2h4_pc_pen ? current.c2h4_pc_pen : 0 }}%</span>
          <span class="percentage" v-if="[1, 2, 3].includes(symbol.id)">{{ current.c2h4_pc_tri_1 ? current.c2h4_pc_tri_1 : 0 }}%</span>
          <span class="percentage" v-if="[5, 7].includes(symbol.id)">{{ current.c2h4_pc_tri_3 ? current.c2h4_pc_tri_3 : 0 }}%</span>
        </div>

        <div class="content-item">
          <span class="label-sm">Methane :</span>
          <span class="percentage" v-if="![1, 2, 3].includes(symbol.id) && ![4, 6].includes(symbol.id) && ![5, 7].includes(symbol.id)"
            >{{ current.ch4_pc_pen ? current.ch4_pc_pen : 0 }}%</span
          >
          <span class="percentage" v-if="[1, 2, 3].includes(symbol.id)">{{ current.ch4_pc_tri_1 ? current.ch4_pc_tri_1 : 0 }}%</span>
          <span class="percentage" v-if="[4, 6].includes(symbol.id)">{{ current.ch4_pc_tri_2 ? current.ch4_pc_tri_2 : 0 }}%</span>
          <span class="percentage" v-if="[5, 7].includes(symbol.id)">{{ current.ch4_pc_tri_3 ? current.ch4_pc_tri_3 : 0 }}%</span>
        </div>

        <div class="content-item" v-if="![1, 2, 3].includes(symbol.id)">
          <span class="label-sm">Ethane :</span>
          <span class="percentage" v-if="![4, 6].includes(symbol.id) && ![5, 7].includes(symbol.id)">{{ current.c2h6_pc_pen ? current.c2h6_pc_pen : 0 }}%</span>
          <span class="percentage" v-if="[4, 6].includes(symbol.id)">{{ current.c2h6_pc_tri_2 ? current.c2h6_pc_tri_2 : 0 }}%</span>
          <span class="percentage" v-if="[5, 7].includes(symbol.id)">{{ current.c2h6_pc_tri_3 ? current.c2h6_pc_tri_3 : 0 }}%</span>
        </div>

        <div class="content-item" v-if="![1, 2, 3].includes(symbol.id) && ![5, 7].includes(symbol.id)">
          <span class="label-sm">Hydrogen :</span>
          <span class="percentage" v-if="![5, 7, 4, 6].includes(symbol.id)">{{ current.h2_pc_pen ? current.h2_pc_pen : 0 }}%</span>
          <span class="percentage" v-if="[4, 6].includes(symbol.id)">{{ current.c2h4_pc_tri_3 ? current.c2h4_pc_tri_3 : 0 }}%</span>
        </div>
      </div>

      <!-- <v-btn @click="getSVGs()">get SVGs</v-btn> -->
    </v-card>

    <v-dialog v-model="legends_deialog" max-width="400">
      <v-card>
        <!-- <v-toolbar dark dense color="red darken-3">
          LEGENDS
        </v-toolbar> -->
        <v-divider></v-divider>
        <v-card class="pa-3">
          <div class="legend" v-if="(show_legends, !show_trend)">
            <div class="legend-item" v-for="(i, key) in symbol.legends" v-bind:key="i.color">
              <div class="legend-item-icon" :style="{ background: i.color }"></div>
              <div class="legend-item-text">{{ key }} : {{ i.description }}</div>
            </div>
          </div>
          <!-- <div class="label-sm link pa-2" @click="show_legends = !show_legends, show_trend = true;">{{ show_legends? '+ Show ': '+ Show' }}
              Gases Trends</div> -->
        </v-card>
      </v-card>
    </v-dialog>
    <v-dialog v-model="symbols_dialog" max-width="320">
      <v-card>
        <v-toolbar dark dense color="red darken-3"> SELECT DGA SYMBOL </v-toolbar>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
          <v-list dense>
            <v-list-item-group color="primary">
              <v-list-item v-for="symbol in symbols" :key="symbol.id" @click="switchSymbol(symbol)">
                <v-list-item-content>
                  <v-list-item-title v-text="symbol.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.font {
  font-size: 14px;
}
.noData {
  color: grey; /* Set the font color to grey */
}
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.content-item {
  display: flex;
  align-items: center;
  padding-bottom: 0.5em;
  padding-left: 0.5em;
  padding-right: 0.5em;
}

.label-sm {
  font-size: 12px;
  margin-right: 5px;
}

.percentage {
  font-size: 12px;
  font-weight: bold;
}

.left-content {
  flex-grow: 1;
  padding-left: 1em;
  padding-bottom: 1em;
}
.right-content {
  margin-right: 1em;
}

.demo-check {
  font-size: 13px;
  white-space: pre;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1em;
  margin-right: 1em;
}
.icon {
  font-size: 25px;
}
.column-header {
  padding: 5px;
  background: #9f0303 !important;
  color: #fff;
  text-align: left;
}

.column-content {
  position: relative;
}

.floating-indicator {
  position: absolute;
  top: 5px;
  left: 5px;
  padding: 3px;
  width: 100px;
  border-radius: 20px;
  text-align: center;
  font-size: 12px;
  color: #fff;
}

.floating-indicator.normal {
  border: 2px solid green;
  color: green;
}

.indicator {
  padding: 5px;
  text-align: center;
  color: white;
}

.indicator.normal {
  border: 1px solid green;
  color: green;
}

.gas-cont {
  text-align: center;
  width: 150px;
  height: 150px;
  bottom: 10px;
  float: left;
  left: 20px;
  position: relative;
}

.gas-cont .label {
  position: relative;
  bottom: 40px;
  /* padding-bottom: 25; */
  left: 23px;
  background: #424242;
  padding: 2px;
  font-size: 10px;
  border-radius: 3px;
  width: 60px;
  color: #fff;
}

.gas-cont .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #5e5d5d;
  color: #fff;
  text-align: center;
  border-radius: 3px;
  font-size: 12px;
  right: 20px;
  padding: 5px 6px;
  bottom: 90px;
  /* Position the tooltip */
  position: relative;
  z-index: 1;
}

.gas-cont:hover .tooltiptext {
  visibility: visible;
}

/* .gas-cont .circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
} */

.chart-cont {
  width: calc(100% - 170px);
  right: 10px;
  float: left;
}

.clear {
  clear: both;
}

.no-border {
  border-width: 0 !important;
}

.no-padding {
  padding: 0;
}

.text-sm {
  font-size: 12px;
  margin-bottom: 0px;
}

.time-selector {
  width: 450px;
  height: auto;
  position: absolute;
  /* bottom: 55px; */
  /* left: -165px; */
  margin-top: 0.3rem;
  right: -60px;
  text-align: justify;
}

.relative {
  position: relative;
}

iframe {
  pointer-events: none;
}

.time-btn {
  margin-left: 10px;
}

/* .legend {
  background-color: rgb(216, 216, 216);
} */

/* .no-data-message {
        position: relative;
        display: block;
        text-align: center;
        width: 100%;
        top: -110px;
        font-size: 1em;
        color: #999;
    } */

.legend .legend-item {
  padding: 6px 15px;
}

.legend .legend-item-icon {
  width: 10px;
  margin-right: 10px;
  height: 10px;
  float: left;
}

.legend .legend-item-text {
  width: calc(100% - 20px);
  font-size: 11px !important;
}

.label-sm {
  font-size: 12px;
}

.link {
  cursor: pointer;
  color: blue;
}

.pointer {
  cursor: pointer;
}
</style>

<script>
import axios from "axios";
// import DuvalsTriangleOne from "@/components/DuvalsTriangleOne.vue";
// import DuvalsTriangleTwo from "@/components/DuvalsTriangleTwo.vue";
// import DuvalsTriangleThree from "@/components/DuvalsTriangleThree.vue";
// import DuvalsTriangleFour from "@/components/DuvalsTriangleFour.vue";
// import DuvalsTriangleFive from "@/components/DuvalsTriangleFive.vue";
// import DuvalsTriangleSix from "@/components/DuvalsTriangleSix.vue";
// import DuvalsTriangleSeven from "@/components/DuvalsTriangleSeven.vue";
// import DuvalsPentagonTwo from "@/components/DuvalsPentagonTwo.vue";
// import DuvalsPentagonOne from "@/components/DuvalsPentagonOne.vue";
import { symbolMixin } from "@/mixins/symbolMixin.js";

export default {
  name: "DuvalsArea",
  mixins: [symbolMixin],
  props: ["historical_data", "latest_data", "svgs_data"],
  data() {
    return {
      symbols_dialog: false,
      symbol: {},
      symbol_legends: [],
      data: [],
      current: {},
      legends_deialog: false,
      show_legends: true,
      show_trend: false,
      svgs: {},
      popup_mappings: [],
    };
  },
  mounted() {
    this.symbol = this.symbols[0];
    this.data = this.itemsReversed;
    this.current = this.latest_data;
    // this.getAttributeValues(this.elementID);
  },
  watch: {
    historical_data() {
      this.data = this.itemsReversed;
      // this.getSVGs();
    },
    latest_data() {
      this.current = this.latest_data;
    },
    svgs_data() {
      // idk why the properties are suddenly inside the "this.svgs_data.original" property
      // console.log(JSON.stringify(this.svgs_data));
      this.removePopupbeforeupdate();
      this.svgs = {
        t1: this.svgs_data.original.t1,
        t2: this.svgs_data.original.t2,
        t3: this.svgs_data.original.t3,
        t4: this.svgs_data.original.t4,
        t5: this.svgs_data.original.t5,
        t6: this.svgs_data.original.t6,
        t7: this.svgs_data.original.t7,
        p1: this.svgs_data.original.p1,
        p2: this.svgs_data.original.p2,
      };
      document.body.insertAdjacentHTML("beforeend", this.svgs_data.original.popups);
      this.popup_mappings = this.svgs_data.original.popup_mappings;
    },
  },
  computed: {
    itemsReversed() {
      // the API returns values in DESC order.. latest first earliest last
      // we need to reverse this because the duvals triangle paints the points
      // in last-point-big-the-rest-small manner
      // we also need to do it inside "computed" because Vue sees ".reverse()" as an infinite loop
      return [...this.historical_data].reverse();
    },
  },
  methods: {
    switchSymbol(symbol) {
      this.symbol = symbol;

      this.current.interpretation = this.current[this.getSymbolById(this.symbol.id)];
      this.symbols_dialog = false;
    },
    getAttributeValues(elementID) {
      //   if (elementID != null) {
      //     let curr = new Date("2023-07-30");
      //     // format the dates; this is atrocious; pls help me format these
      //     // formattedStartDT should be 3 months later that formattedEndDT
      //     let formattedEndDT = `${curr.getFullYear()}-${(curr.getMonth() + 1).toString().padStart(2, "0")}-${curr.getDate().toString().padStart(2, "0")} ${curr
      //       .getHours()
      //       .toString()
      //       .padStart(2, "0")}:${curr.getMinutes().toString().padStart(2, "0")}:${curr.getSeconds().toString().padStart(2, "0")}`;
      //     let formattedStartDT = `${curr.getFullYear()}-${(curr.getMonth() - 2).toString().padStart(2, "0")}-${curr.getDate().toString().padStart(2, "0")} ${curr
      //       .getHours()
      //       .toString()
      //       .padStart(2, "0")}:${curr.getMinutes().toString().padStart(2, "0")}:${curr.getSeconds().toString().padStart(2, "0")}`;
      //     // fetch data from db based on datetime1 and datetime2...
      //     axios({
      //       url: process.env.VUE_APP_BASEURL + "/elements/" + elementID + "/attribute-values",
      //       method: "GET",
      //       params: {
      //         start: formattedStartDT,
      //         end: formattedEndDT,
      //       },
      //       headers: {
      //         Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
      //       },
      //     })
      //       .then((res) => {
      //         // console.log(res.data);
      //         this.data = res.data.values.map((d) => {
      //           const parts = d.path.split("\\");
      //           const site = parts[0];
      //           const substation = parts[1];
      //           const transformer = parts[2];
      //           let obj = {
      //             StartTime: this.datetime1,
      //             EndTime: this.datetime2,
      //             timestamp: d.timestamp,
      //             site: site,
      //             substation: substation,
      //             transformer: transformer,
      //             c2h2: d.acetylene,
      //             c2h4: d.ethylene,
      //             ch4: d.methane,
      //             c2h6: d.ethane,
      //             c2h2_roc: d.acetylene_roc,
      //             c2h4_roc: d.ethylene_roc,
      //             ch4_roc: d.methane_roc,
      //             c2h6_roc: d.ethane_roc,
      //             h2_roc: d.hydrogen_roc,
      //             co: d.carbon_monoxide,
      //             co2: d.carbon_dioxide,
      //             h2: d.hydrogen,
      //             n2: d.nitrogen,
      //             t1: d.t1,
      //             t2: d.t2,
      //             t3: d.t3_biotemp,
      //             t4: d.t4,
      //             t5: d.t5,
      //             t6: d.t6,
      //             t7: d.t7,
      //             p1: d.p1,
      //             p2: d.p2,
      //             nei: d.nei,
      //             iec_ratio: d.iec_ratio,
      //             dornenberg_ratio: d.dornenberg,
      //             rogers_ratio: d.rogers_ratio,
      //             carbon_ratio: d.carbon_ratio,
      //             element_id: d.id,
      //           };
      //           return obj;
      //         });
      //         // console.log(this.current.acetylene_roc);
      //         this.current = res.data.current ? res.data.current : {};
      //         this.current.interpretation = res.data.current[this.getSymbolById(this.symbol.id)];
      //         //Calculate current percentage of gases for pentagon
      //         var currentGasTotal = this.current.acetylene + this.current.ethylene + this.current.methane + this.current.ethane + this.current.hydrogen;
      //         var currentC2H2 = (this.current.acetylene / currentGasTotal) * 100;
      //         var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
      //         var currentCH4 = (this.current.methane / currentGasTotal) * 100;
      //         var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
      //         var currentH2 = (this.current.hydrogen / currentGasTotal) * 100;
      //         this.current.c2h2_pc_pen = currentC2H2.toFixed(2);
      //         this.current.c2h4_pc_pen = currentC2H4.toFixed(2);
      //         this.current.ch4_pc_pen = currentCH4.toFixed(2);
      //         this.current.c2h6_pc_pen = currentC2H6.toFixed(2);
      //         this.current.h2_pc_pen = currentH2.toFixed(2);
      //         //Calculate current percentage of gases for triangle
      //         var currentGasTotal = this.current.acetylene + this.current.ethylene + this.current.methane;
      //         var currentC2H2 = (this.current.acetylene / currentGasTotal) * 100;
      //         var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
      //         var currentCH4 = (this.current.methane / currentGasTotal) * 100;
      //         this.current.c2h2_pc_tri_1 = currentC2H2.toFixed(2);
      //         this.current.c2h4_pc_tri_1 = currentC2H4.toFixed(2);
      //         this.current.ch4_pc_tri_1 = currentCH4.toFixed(2);
      //         //Calculate current percentage of gases for triangle
      //         var currentGasTotal = this.current.methane + this.current.ethane + this.current.hydrogen;
      //         var currentCH4 = (this.current.methane / currentGasTotal) * 100;
      //         var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
      //         var currentH2 = (this.current.hydrogen / currentGasTotal) * 100;
      //         this.current.ch4_pc_tri_2 = currentCH4.toFixed(2);
      //         this.current.c2h6_pc_tri_2 = currentC2H6.toFixed(2);
      //         this.current.h2_pc_tri_2 = currentH2.toFixed(2);
      //         //Calculate current percentage of gases for triangle
      //         var currentGasTotal = this.current.ethylene + this.current.ethane + this.current.methane;
      //         var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
      //         var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
      //         var currentCH4 = (this.current.methane / currentGasTotal) * 100;
      //         this.current.c2h4_pc_tri_3 = currentC2H4.toFixed(2);
      //         this.current.c2h6_pc_tri_3 = currentC2H6.toFixed(2);
      //         this.current.ch4_pc_tri_3 = currentCH4.toFixed(2);
      //         this.data.reverse();
      //       })
      //       .catch((err) => {
      //         console.log(err);
      //       });
      //   } else {
      //     return;
      //   }
    },
    // getSVGs() {
    //   // console.log(this.data);
    //   if (this.data.length !== 0) {
    //     axios({
    //       url: process.env.VUE_APP_BASEURL + "/duvalsIllustrations",
    //       method: "POST",
    //       headers: {
    //         Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
    //       },
    //       data: {
    //         data: this.historical_data,
    //       },
    //     }).then((res) => {
    //       // console.log(res.data);
    //       this.svgs = {
    //         t1: res.data.t1,
    //         t2: res.data.t2,
    //         t3: res.data.t3,
    //         t4: res.data.t4,
    //         t5: res.data.t5,
    //         t6: res.data.t6,
    //         t7: res.data.t7,
    //         p1: res.data.p1,
    //         p2: res.data.p2,
    //       };
    //       document.body.insertAdjacentHTML("beforeend", res.data.popups);
    //       this.popup_mappings = res.data.popup_mappings;
    //     });
    //   }
    // },
    addListenersToCircles() {
      let maps = this.popup_mappings;
      // console.log(maps);
      maps.forEach((element) => {
        let targetElem = document.getElementById(element[0]);
        if (targetElem) {
          // console.log(element[0]);
          targetElem.addEventListener("mouseover", function showPopup(event) {
            document.getElementById(element[1]).style.width = "250px";
            document.getElementById(element[1]).style.zIndex = 1;
            document.getElementById(element[1]).style.left = event.pageX + 10 + "px";
            document.getElementById(element[1]).style.top = event.pageY - 10 + "px";
            document.getElementById(element[1]).style.opacity = 0.8;
            document.getElementById(element[1]).style.visibility = "visible";
            document.getElementById(element[1]).style.display = "block";
          });
          document.getElementById(element[0]).addEventListener("mouseout", function hidePopup(event) {
            document.getElementById(element[1]).style.visibility = "hidden";
            document.getElementById(element[1]).style.display = "none";
          });
        }
      });
    },
    removePopupbeforeupdate(){
      this.popup_mappings.forEach((e) => {
        document.getElementById(e[1]).remove();
      });
    }
  },
  components: {
    // DuvalsTriangleOne,
    // DuvalsTriangleTwo,
    // DuvalsTriangleThree,
    // DuvalsTriangleFour,
    // DuvalsTriangleFive,
    // DuvalsTriangleSix,
    // DuvalsTriangleSeven,
    // DuvalsPentagonTwo,
    // DuvalsPentagonOne,
  },
};
</script>
