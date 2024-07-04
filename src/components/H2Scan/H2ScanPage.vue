<template>
  <!-- <div v-if="viewReady === false"><v-progress-circular indeterminate></v-progress-circular></div> -->
  <!-- <div v-else-if="viewReady === true" class="pa-2"> -->
    <div class="pa-2">
      <v-row dense>
      <v-col class="mt-1" cols="12" sm="3">
        <v-select
          :items="sensors"
          label="Select Sensor"
          :disabled="loading"
          outlined
          dense
          color="red"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="8">
        <DateRangePickers storageID="h2scanPicker" @filter="filter" :loading="loading" />
      </v-col>
      <v-col cols="12" sm="1">
       
       
        <!-- <v-btn  @click="refetch">
         {{ loading ? "Loading" : "Reload" }}
        </v-btn> -->

        <v-btn class="mt-2" :loading="loading" :disabled="loading" @click="refetch">
         Reload
         <!-- <v-icon>mdi-refresh</v-icon> -->
         <template v-slot:loader>
           <span class="custom-loader ml-1">
             <v-icon light>mdi-cached</v-icon>
           </span>
         </template>
       </v-btn>
        <!-- <v-btn text icon @click="toggleInitForm">
          <v-icon>mdi-cog</v-icon>
        </v-btn> -->
          
      </v-col>
     
    </v-row>
    <!-- <v-progress-circular v-if="viewReady === false" indeterminate></v-progress-circular> -->
      <v-row class="pt-0" dense v-if="current.length !== 0 && viewReady === true">
        <v-col cols="12" sm="2" >
          <div class="mb-2 d-flex justify-center">
            <img src="@/assets/h2scan-logo.png" alt="h2scan-logo" width="150" />
          </div>
          <div class="mb-2 d-flex justify-center">
            <v-btn depressed @click="toggleDeviceInfo">Device Info</v-btn>
          </div>
          <!-- <div class="mb-2 d-flex justify-center">
            <img src="@/assets/h2scan_hy-alerta_5021.jpg" alt="h2scan-logo" width="150" />
          </div> -->
          <div>
            <FancyGuage canvasID="OilTempGuage" chartTitle="Liquid Temp" :activeTab="analysisTab" tabItem="1"
              type="hydrogen" :latest_data="getLatestDatapoint('OilTemperature')" />
          </div>
        </v-col>
        <v-col cols="12" sm="5">
          <div class="d-flex justify-end">
            <v-card outlined class="py-2 px-4 mr-2" style="z-index: 1; margin-bottom: -40px">
              <b>{{ getLatestDatapoint("Hydrogen") }} ppm</b>
            </v-card>
          </div>
          <MultiLineGraph canvasID="Hydrogen History" chartTitle="Hydrogen Trend" :historical_data="current"
            :showTrends="['_time', 'Hydrogen', 'OilTemperature']" trendLabels="_time"
            :legends="['', 'Hydrogen PPM', 'Liquid Temperature']" />
        </v-col>
        <v-col cols="12" sm="5">
          <v-card>
            <!-- <v-card-title>
                Search events
                <v-spacer></v-spacer>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details
                  color="red"></v-text-field>
              </v-card-title>
            <v-simple-table
              dense
              :search="search"
              height="290px"
            >
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Event ID
                    </th>
                    <th class="text-left">
                      Start
                    </th>
                    <th class="text-left">
                      End
                    </th>
                    <th class="text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr :search="search"
                    v-for="item in events"
                    :key="item.name"

                    @click="showEvents(item)"
                  >
                    <td>{{ item.event_id }}</td>
                    <td>{{ dateFormat(item.start_time) }}</td>
                    <td>{{ item.end_time ? dateFormat(item.end_time) : 'ongoing' }}</td>
                    <td
                      :style="{ 'font-size': '7pt', 'color': item.severity === 'critical' ? 'red' : (item.severity === 'normal' ? 'yellow' : (item.severity === 'healthy' ? 'green' : 'inherit')) }">
                      <div class="font-sm">{{ item.severity }}</div>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table> -->
              <v-card-title>
                Search events
                <v-spacer></v-spacer>
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details
                  color="red"></v-text-field>
              </v-card-title>
              <v-data-table :items-per-page="5" dense :headers="headers" :items="events" :search="search" item-key="name"
                class="elevation-1 pa-1">
                <template v-slot:item="{ item }">
                  <tr @click="showEvents(item)">
                    <td>
                      <span class="font-sm">{{ item.event_id }}</span>
                    </td>
                    <td>
                      <span class="font-sm">{{ dateFormat(item.start_time) }}</span>
                    </td>
                    <td>
                      <span class="font-sm">{{ item.end_time ? dateFormat(item.end_time) : 'ongoing' }}</span>
                    </td>
                    <td
                      :style="{ 'font-size': '7pt', 'color': item.severity === 'critical' ? 'red' : (item.severity === 'normal' ? 'yellow' : (item.severity === 'healthy' ? 'green' : 'inherit')) }">
                      <div class="font-sm">{{ item.severity }}</div>
                    </td>
                  </tr>
                </template>
              </v-data-table>

              <events-details-dialog :details="events_details" :event_dialog="event_dialog"
                @close="hideLogPopup"></events-details-dialog>
            </v-card>
        </v-col>
      </v-row>
      <v-row class="pt-0" v-if="current.length !== 0 && viewReady === true">
        <v-col cols="12" sm="4">
          <MultiLineGraph canvasID="DeltaDay" chartTitle="DeltaDay Trend" :historical_data="current"
            :showTrends="['_time', 'DeltaDay']" trendLabels="_time" :legends="['', 'DeltaDay']" />
        </v-col>
        <v-col cols="12" sm="4">
          <MultiLineGraph canvasID="DeltaWeek" chartTitle="DeltaWeek Trend" :historical_data="current"
            :showTrends="['_time', 'DeltaWeek']" trendLabels="_time" :legends="['', 'DeltaWeek']" />
        </v-col>
        <v-col cols="12" sm="4">
          <MultiLineGraph canvasID="DeltaMonth" chartTitle="DeltaMonth Trend" :historical_data="current"
            :showTrends="['_time', 'DeltaMonth']" trendLabels="_time" :legends="['', 'DeltaMonth']" />
        </v-col>
      </v-row>
      <v-dialog v-model="showDeviceInfo" persistent max-width="800">
      <v-card>
        <v-card-actions>
          <v-card-title>Device Information</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="showDeviceInfo = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>
        <v-card-text>
          <v-row>
            <!-- device info table -->
            <v-col cols="12" sm="6">
              <v-card outlined>
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">Description</th>
                      <th class="text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-size: 9pt">Dissolved Gas Calibration Date</td>
                      <td style="font-size: 9pt">{{ new Date().toLocaleString() }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Factory Calibration Date</td>
                      <td style="font-size: 9pt">{{ new Date().toLocaleString() }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Firmware Revision</td>
                      <td style="font-size: 9pt">2024</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Manufacturing Date</td>
                      <td style="font-size: 9pt">{{ new Date().toLocaleString() }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Model</td>
                      <td style="font-size: 9pt">Gen 5</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Product Serial</td>
                      <td style="font-size: 9pt">002321</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Sensor Board Serial</td>
                      <td style="font-size: 9pt">AXC0012</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Sensor Serial</td>
                      <td style="font-size: 9pt">AXC00213</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>

            </v-col>
            <v-col cols="12" sm="6">
              <v-card outlined>
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">Faults</th>
                      <th class="text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-size: 9pt">Hydrogen Sensor</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('HydrogenSensorFault') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('HydrogenSensorFault') === 0 ? 'No Fault' : 'Has Fault' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Temperature Sensor</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('TemperatureSensorFault') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('TemperatureSensorFault') === 0 ? 'No Fault' : 'Has Fault' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">PCB Temp</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('PCBTempOver105C') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('PCBTempOver105C') === 0 ? '105C' : 'Over 105C' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Heater</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('HeaterFault') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('HeaterFault') === 0 ? 'No Fault' : 'Has Fault' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Required Data</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('RequiredDataNA') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('RequiredDataNA') === 0 ? 'Not Applicable' : 'Applicable' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Configuration Data</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('ConfigurationDataNotValid') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('ConfigurationDataNotValid') === 0 ? 'Valid' : 'Not Valid' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Battery Backup</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('BatteryBackupError') === 0 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('BatteryBackupError') === 0 ? 'No Error' : 'Has Error' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Error</td>
                      <td :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('Error') === 0 ? 'green' : 'red' }"> {{
                        getLatestDatapoint('Error') === 0 ? 'No Error' : 'Has Error' }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
                <!-- <div>Faults</div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('HydrogenSensorFault') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>HydrogenSensorFault</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('TemperatureSensorFault') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>TemperatureSensorFault</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('PCBTempOver105C') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>PCBTempOver105C</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('HeaterFault') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>HeaterFault</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('RequiredDataNA') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>RequiredDataNA</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('ConfigurationDataNotValid') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>ConfigurationDataNotValid</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('BatteryBackupError') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>BatteryBackupError</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('Error') === 0 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>Error</div>
                </div> -->
                <!-- 
                <div>States</div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('UnitReady') === 1 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>UnitReady</div>
                </div>
                <div class="d-flex">
                  <v-icon :color="getLatestDatapoint('DataAvailable') === 1 ? 'green' : 'red'"> mdi-circle </v-icon>

                  <div>DataAvailable</div>
                </div> -->
                <!-- <div class="d-flex">
                  <div><span style="font-weight: bold;">SensorState: </span>{{ sensorStateDispenser(getLatestDatapoint("SensorState")) }}</div>
                </div>
                <small>{{ new Date(getLatestDatapoint("_time")).toLocaleString() }}</small> -->
              </v-card>
            </v-col>
            <!-- Traffic Lights -->
          </v-row>
          <v-row>


            <v-col cols="12" sm="7">
              <v-card outlined>
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">States</th>
                      <th class="text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-size: 9pt">Unit</td>
                      <td :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('UnitReady') === 1 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('UnitReady') === 1 ? 'Ready' : 'Not Ready' }}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 9pt">Data</td>
                      <td
                        :style="{ 'font-size': '9pt', 'color': getLatestDatapoint('DataAvailable') === 1 ? 'green' : 'red' }">
                        {{ getLatestDatapoint('DataAvailable') === 1 ? 'Available' : 'Not Available' }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
              <v-card outlined class="mt-2">
                <v-simple-table dense>
                  <thead>
                    <tr>
                      <th class="text-left">Sensor State</th>
                      <th class="text-left">TimeStamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <!-- <td style="font-size: 9pt">Unit</td> -->
                      <td style="font-size: 9pt; font-weight: bold;"> {{
                        sensorStateDispenser(getLatestDatapoint("SensorState")) }}</td>
                      <td style="font-size: 9pt"> {{ new Date(getLatestDatapoint("_time")).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </v-col>
            <v-col cols="12" sm="5">
              <v-card outlined class="pa-2">
                <div class="d-flex justify-center">
                  <img src="@/assets/h2scan_hy-alerta_5021.png" alt="h2scan-logo" width="250px" />
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <AlertDialog :show="showAlertDialog" :dialogMessage="dialogMessage" @close="toggleAlertDialog" />
    <UpsertSensorForm :show="showH2SInitForm" :element="elementID" @close="toggleInitForm" />
    </div>
 
</template>
<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}

@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

@-o-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
<script>
import axios from "axios";
import FancyGuage from "@/components/charts/FancyCJSGauge.vue";
import MultiLineGraph from "@/components/charts/CJSLineGraph.vue";
import DateRangePickers from "@/components/home/DateRangePickers.vue";
import AlertDialog from "./AlertDialog.vue";
import UpsertSensorForm from "./UpsertSensorForm.vue";
import EventsDetailsDialog from "@/components/popups/EventsDetailsDialog.vue";

export default {
  name: "H2ScanPage",
  props: ["elementID"],
  components: { AlertDialog, FancyGuage, MultiLineGraph, DateRangePickers, UpsertSensorForm, EventsDetailsDialog },
  data() {
    return {
      analysisTab: "",
      current: [],
      viewReady: false,
      showAlertDialog: false,
      dialogMessage: "",
      showH2SInitForm: false,
      datetime1: null,
      datetime2: null,
      loading: false,
      showDeviceInfo: false,
      events: [],
      events_details: {},
      event_dialog: false,
      search: "",
      sensors:['sensor1', 'sensor2', 'sensor3'],
      headers: [
        {
          text: "Event ID",
          align: "start",
          sortable: true,
          value: "event_id",
        },
        {
          text: "Start",
          align: "start",
          sortable: true,
          value: "start_time",
        },
        {
          text: "End",
          align: "start",
          sortable: true,
          value: "end_time",
        },
        {
          text: "Status",
          align: "start",
          sortable: true,
          value: "severity",
        },
      ]
    };
  },
  mounted() {
    // this.getTimeseries();
    // this.dialogMessage = "This view is just a preview and is still under development.";
    // this.toggleAlertDialog();
  },
  watch: {
    elementID() {
      this.viewReady = false;
      this.current = [];
      this.getTimeseries();
    },
  },
  methods: {
    showEvents(item) {
      this.events_details = item;
      this.event_dialog = true;
    },
    hideLogPopup() {
      this.event_dialog = false;
    },
    dateFormat(date) {
      let d = new Date(date);
      return d.toLocaleString();
    },
    toggleDeviceInfo() {
      let temp = !this.showDeviceInfo;
      this.showDeviceInfo = temp;
    },
    getTimeseries() {
      this.loading = true;
      if (this.datetime1 !== null && this.datetime2 !== null) {
        // console.log("get");
        axios({
          url: process.env.VUE_APP_BASEURL + "/influx/query",
          method: "POST",
          params: {
            // company: JSON.parse(localStorage.getItem("user")).user.company_id,
            element_id: this.elementID,
            sensor_type: "H2Scan",
            start: this.datetime1,
            stop: this.datetime2,
          },
          headers: {
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        })
          .then((res) => {
            // console.log(res);
            if (res.status === 200) {
              this.current = res.data.results_clean;
              this.events = res.data.events;
              this.viewReady = true;
              this.loading = false;
            }
          })
          .catch((err) => {
            if (err.response.status === 404) {
              // h2scan not initialized
              // console.log(err.response.data.message);
              this.loading = false;
              this.viewReady = true;
              this.dialogMessage = err.response.data.message + ". Click the settings button on the top right to update or initialize an H2Scan view for this element.";
              this.toggleAlertDialog();
            } else {
              // "Client error: Query sent might be incorrect" or influx server is down
              // console.log(err.response.data.message);
              this.loading = false;
              this.viewReady = true;
              this.dialogMessage = err.response.data.message;
              this.toggleAlertDialog();
            }
          });
      }
    },
    toggleAlertDialog() {
      this.showAlertDialog = !this.showAlertDialog;
    },
    refetch() {
      this.loading = true;
      this.viewReady = false;
      this.current = [];
      this.getTimeseries();
    },
    twoDecimalPlaces(longFloat) {
      // return two decimal places of the long float
      return Math.round((parseFloat(longFloat) + Number.EPSILON) * 100) / 100;
    },
    getLatestDatapoint(field) {
      // blind assumption that the lastest value is in the last element.. hehe..
      if (this.current.length === 0) return 0;
      return this.current.at(-1)[field];
    },
    sensorStateDispenser(key) {
      switch (key) {
        case 1:
          return "Hydrogen Measurement Cycle";
        case 2:
          return "Oil Temperature Measurement Cycle";
        case 3:
          return "Auto Calibration Cycle";
        case 4:
          return "Oil Temperature Too High";
        default:
          return "Unidentified State";
      }
    },
    toggleInitForm() {
      this.showH2SInitForm = !this.showH2SInitForm;
    },
    filter(dt1, dt2) {
      // console.log(new Date(dt2).toISOString());
      this.datetime1 = new Date(dt1).toISOString();
      this.datetime2 = new Date(dt2).toISOString();

      this.getTimeseries();
    },

  },
};
</script>
