<template>
  <div>
    <v-row dense>
      <v-col cols="12" sm="6" md="2" class="pr-0 pb-0">
        <v-card class="column-header" dense block dark color="red darken-4">Assets Hierarchy</v-card>

        <v-btn v-if="account_level == 'company_admin'" text small block color="red" class="darken-2" @click="addRootElement()"> <v-icon>mdi-plus</v-icon> New Site Element </v-btn>

        <v-divider></v-divider>
        <v-treeview
          class="pointer"
          v-if="items.length > 0"
          open-all
          :active="tree"
          v-model="tree"
          color="red"
          :items="items"
          activatable
          item-key="id"
          @update:active="getDetails"
          dense
        >
          <template v-slot:prepend="{ item }">
            <v-icon class="pointer"> mdi-cube </v-icon>
          </template>
        </v-treeview>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="12" sm="6" md="10" class="pl-1 pb-0">
        <v-progress-linear v-if="loading" indeterminate color="red lighten-2"></v-progress-linear>
        <!-- tabs -->
        <v-tabs color="red" v-model="tab" :value="tab" left>
          <v-tabs-slider color="red"></v-tabs-slider>

          <v-tab key="general" v-if="items.length > 0 && elements !== 2"> {{ elements == "1" ? "Substation Details" : "Site Details" }}</v-tab>
          <v-tab key="Status" v-if="elements == 1"> Transformer Status </v-tab>
          <v-tab key="attributes" v-if="elements == 2"> Transformer Details </v-tab>
          <!-- <v-tab key="adh" v-if="transformer_details.length > 0">ADH Configurations</v-tab> -->
          <v-tab key="data" v-if="transformer_details.length > 0">Manual Data Entry </v-tab>
          <v-tab key="analysis" v-if="attribute_values.length > 0">DGA Analysis </v-tab>
          <!-- <v-tab key="h2scan" v-if="attribute_values.length > 0">H2 Scan</v-tab> -->
        </v-tabs>
        <v-divider></v-divider>
        <v-tabs-items style="background: transparent" v-model="tab">
          <!-- details tab content -->
          <v-tab-item v-if="items.length > 0 && elements !== 2" key="general">
            <v-container>
              <div class="pt-3">
                <v-card>
                  <v-toolbar dense dark color="red darken-3">
                    <v-toolbar-title class="font text-uppercase font-weight-medium">
                      {{ elements == "1" ? "Substation Element" : "Site Element" }}
                    </v-toolbar-title>
                  </v-toolbar>
                  <v-form>
                    <v-container>
                      <div class="my-2">
                        <v-text-field label="Name" outlined dense hide-details v-model="element.name" color="red" readonly></v-text-field>
                      </div>
                      <div class="my-2">
                        <v-textarea label="Description" outlined dense hide-details v-model="element.description" color="red" rows="2" readonly></v-textarea>
                      </div>
                      <div class="my-2">
                        <v-text-field label="Path" outlined dense hide-details v-model="element.path" color="red" readonly></v-text-field>
                      </div>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red" text small @click="toggleUpdateModal()">Update<v-icon right dark>mdi-content-save</v-icon></v-btn>
                      </v-card-actions>
                    </v-container>
                  </v-form>
                </v-card>
              </div>
            </v-container>
            <v-divider></v-divider>
            <div style="margin-top: 5px" class="text-right">
              <!-- <v-btn text small color="red" @click="removeChild()"> <v-icon>mdi-minus</v-icon> Delete Element </v-btn> -->
            </div>
            <div v-if="elements == 0">
              <v-btn text small color="red" v-if="account_level == 'company_admin'" @click="addSubstation()"> <v-icon>mdi-plus</v-icon> New Substation Element </v-btn>
            </div>
            <div v-if="elements == 1">
              <v-btn text small color="red" v-if="account_level == 'company_admin'" @click="addTransformer()"> <v-icon>mdi-plus</v-icon> New Transformer Element </v-btn>
            </div>
          </v-tab-item>
          <!-- Summary of all transformers -->
          <v-tab-item v-if="elements == 1" key="Status">
            <div class="pa-3">
              <v-row dense>
                <v-col cols="12" md="4" v-for="t in transformers" :key="t.id">
                  <v-alert class="mx-auto" dense outlined text height="220" :color="t.status.normal ? 'green' : 'red'">
                    <v-icon v-if="t.status.normal" color="green" left> mdi-check-circle-outline </v-icon>
                    <v-icon v-if="!t.status.normal" color="red" left> mdi-car-tire-alert</v-icon>
                    <v-card-title class="shrink-text text--primary">{{ t.name }}</v-card-title>

                    <v-card-subtitle>
                      {{ t.path.replaceAll("\\", ">") }}
                    </v-card-subtitle>
                    <!-- <v-card-subtitle class="text-center">
                       C8 VORTEX ADVANCED
                        <span class="right"><v-icon @click="closeSubs()">mdi-close</v-icon></span>
                    </v-card-subtitle> -->
                    <v-card-text class="text--primary">
                      <div v-if="t.status.normal">
                        {{ !t.latest_value ? "No Data" : "Transformer is in Good Condition." }}
                      </div>
                      <div v-if="!t.status.normal">
                        {{ !t.latest_value ? "No Data" : "Transformer reached the Upper Limit." }}
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-title class="shrink-text text--primary">
                      <v-Spacer></v-Spacer>
                      <v-btn text small @click="goToTransformer(t), (goTo = true)">Check<v-icon right dark>mdi-arrow-right</v-icon></v-btn>
                    </v-card-title>
                  </v-alert>
                </v-col>
              </v-row>
            </div>
          </v-tab-item>
          <!-- Select transformer >> Click Attributes tab -->
          <v-tab-item v-if="elements == 2" key="attributes">
            <v-container>
              <div class="pt-3">
                <v-card>
                  <v-toolbar dense dark color="red darken-3">
                    <v-toolbar-title class="font text-uppercase font-weight-medium"> Transformer Element </v-toolbar-title>
                  </v-toolbar>
                  <v-form>
                    <v-container>
                      <div class="my-2">
                        <v-text-field label="Name" outlined dense hide-details v-model="element.name" color="red" readonly></v-text-field>
                      </div>
                      <div class="my-2">
                        <v-textarea label="Description" outlined dense hide-details v-model="element.description" color="red" rows="2" readonly></v-textarea>
                      </div>
                      <div class="my-2">
                        <v-text-field label="Path" outlined dense hide-details v-model="element.path" color="red" readonly></v-text-field>
                      </div>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red" text small @click="toggleUpdateModal()">Update element<v-icon right dark>mdi-content-save</v-icon></v-btn>
                      </v-card-actions>
                    </v-container>
                  </v-form>
                </v-card>
              </div>
            </v-container>
            <v-divider></v-divider>
            <!-- <div style="margin-top: 5px" class="text-right"> -->
            <!-- <v-btn text small color="red" @click="removeChild()"> <v-icon>mdi-minus</v-icon> Delete Element </v-btn> -->
            <!-- </div> -->
            <div v-if="elements == 0">
              <v-btn text small color="red" @click="addSubstation()"> <v-icon>mdi-plus</v-icon> New Child Element </v-btn>
            </div>
            <div v-if="elements == 1">
              <v-btn text small color="red" @click="addTransformer()"> <v-icon>mdi-plus</v-icon> New Child Element </v-btn>
            </div>

            <!-- <v-container v-if="attributes.length == 0">
              <v-btn block @click="createAttributes(element.id)">
                <v-icon>mdi-triangle-outline</v-icon>
                Create DGA Attributes
              </v-btn>
            </v-container> -->
            <v-container style="position: relative; bottom: 5px">
              <v-btn v-if="transformer_details.length == 0" block depressed color="red" dark @click="editTransformerDetails('add')">
                <v-icon>mdi-triangle-outline</v-icon>
                Create Transformer Details
              </v-btn>
            </v-container>
            <v-container class="mb-5 mt-1" style="position: relative; bottom: 15px" v-if="transformer_details.length > 0">
              <v-card>
                <v-toolbar dense dark color="red darken-3">
                  <v-toolbar-title class="font text-uppercase font-weight-medium"> Transformer Details </v-toolbar-title>
                </v-toolbar>
                <v-form class="pt-2">
                  <v-container>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].manufacturer" label="Manufacturer" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].type" label="Type" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" v-model="transformer_details[0].startup_date" label="Commisioning Date" readonly hide-details outlined dense></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].construction_year" label="Construction Year" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].age_band" label="Age | Age Band" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].line_capacity" label="Line Capacity" outlined dense hide-details></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].winding_voltage" label="Winding Voltage" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].volt_capacity" label="Voltage Capacity" outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-textarea color="red" readonly v-model="transformer_details[0].address" label="Address" value="" rows="1" outlined dense hide-details> </v-textarea>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                          color="red"
                          readonly
                          v-model="transformer_details[0].country_manufacturer"
                          label="Country Manufacturer"
                          outlined
                          dense
                          hide-details
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].serial_no" label="Serial No." outlined dense hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field color="red" readonly v-model="transformer_details[0].model_no" label="Model No." outlined dense hide-details></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="12">
                        <v-textarea
                          color="red"
                          readonly
                          v-model="transformer_details[0].asset_desc"
                          name="input-7-1"
                          label="Asset Description"
                          value=""
                          rows="3"
                          outlined
                          dense
                          hide-details
                        >
                        </v-textarea>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="red" text small @click="editTransformerDetails('upd')">Update transformer<v-icon right dark>mdi-content-save</v-icon></v-btn>
                    </v-card-actions>
                  </v-container>
                </v-form>
              </v-card>
            </v-container>
            <!-- <v-container style="position: relative; bottom: 25px">
              <v-card style="background-color: transparent">
                <v-card-title>DGA Attributes</v-card-title>
                <v-divider></v-divider>
                <v-simple-table style="background-color: transparent" class="scrollbar" dense>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Parameter Name</th>
                        <th class="text-left">Description</th>
                        <th class="text-left">Stream Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in attributes" :key="item.id">
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.stream_name }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card>
            </v-container> -->
          </v-tab-item>
          <!-- Select transformer >> Click Data Entry tab -->
          <!-- <v-tab-item v-if="transformer_details.length > 0" key="adh">
            <v-container>
              <div class="pt-3">
                <ADHConfig :element="element" @open="openAdh" @close="closeAdh" @addConfig="addConfig" :adh_config="adh_config" :adh_loading="adh_loading" :ADH_dialog="ADH_dialog" ></ADHConfig>
              </div>
            </v-container>
          </v-tab-item> -->
          <v-tab-item v-if="transformer_details.length > 0" key="data">
            <v-container>
              <!-- <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    color="red"
                    v-model="attribute_value.date"
                    label="Date"
                    append-icon="mdi-calendar"
                    readonly
                    hide-details
                    outlined
                    dense
                    @click:append="datepicker = true"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    color="red"
                    label="Time"
                    v-model="attribute_value.time"
                    @click:append="timepicker = true"
                    append-icon="mdi-clock-edit-outline"
                    readonly
                    hide-details
                    dense
                    outlined
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Acetylene (C₂H₂) (ppm)" dense outlined hide-details v-model="attribute_value.acetylene" type="number"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Ethylene (C₂H₄) (ppm)" dense outlined hide-details v-model="attribute_value.ethylene" type="number"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Methane (CH₄) (ppm)" dense outlined hide-details v-model="attribute_value.methane" type="number"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Ethane (C₂H₆) (ppm)" dense outlined hide-details v-model="attribute_value.ethane" type="number"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Hydrogen (H₂) (ppm)" dense outlined hide-details v-model="attribute_value.hydrogen" type="number"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Oxygen (O₂) (ppm)" dense outlined hide-details v-model="attribute_value.oxygen" type="number"></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Carbon Monoxide (CO) (ppm)" dense outlined hide-details v-model="attribute_value.carbon_monoxide" type="number"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field color="red" label="Carbon Dioxide (CO₂) (ppm)" dense outlined hide-details v-model="attribute_value.carbon_dioxide" type="number"></v-text-field>
                </v-col>
              </v-row> -->

              <!-- <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field label="TDCG" dense outlined hide-details></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                    </v-tab-item>
                    <v-tab-item v-if="elements == 2" key="attributes">
                        <v-container v-if="attributes.length == 0">
                            <v-btn block @click="createAttributes(element.id)">
                                <v-icon>mdi-triangle-outline</v-icon>
                                Create DGA Attributes
                            </v-btn>
                        </v-container>
                        <v-container style="position: relative; bottom: 5px">
                            <v-btn v-if="transformer_details.length == 0" block @click="transformer_dialog = true">
                                <v-icon>mdi-triangle-outline</v-icon>
                                Create Transformer Details
                            </v-btn>
                        </v-container>
                        <v-container style="position: relative; bottom: 15px" v-if="transformer_details.length > 0">
                            <v-card class="pa-2" style="background-color: transparent">
                                <v-card-title class="pt-0">Tranformer Details</v-card-title>
                                <v-row>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].manufacturer"
                                            label="Manufacturer" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].type"
                                            label="Type" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" v-model="transformer_details[0].startup_date"
                                            label="Commisioning Date" readonly hide-details outlined dense></v-text-field>
                                    </v-col>
                                </v-row>

                                <v-row>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly
                                            v-model="transformer_details[0].construction_year" label="Construction Year"
                                            outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].age_band"
                                            label="Age | Age Band" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].line_capacity"
                                            label="Line Capacity" outlined dense hide-details></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].winding_voltage"
                                            label="Winding Voltage" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-textarea color="red" readonly v-model="transformer_details[0].asset_desc"
                                            name="input-7-1" label="Asset Description" value="" rows="1" outlined dense
                                            hide-details>
                                        </v-textarea>
                                    </v-col>
                                    <v-col cols="12" sm="4">
                                        <v-textarea color="red" readonly v-model="transformer_details[0].address"
                                            label="Address" value="" rows="1" outlined dense hide-details>
                                        </v-textarea>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly
                                            v-model="transformer_details[0].country_manufacturer"
                                            label="Country Manufacturer" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].serial_no"
                                            label="Serial No." outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-field color="red" readonly v-model="transformer_details[0].model_no"
                                            label="Model No." outlined dense hide-details></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-container>
                        <v-container style="position: relative; bottom: 25px">
                            <v-card style="background-color: transparent">
                                <v-card-title>DGA Attributes</v-card-title>
                                <v-divider></v-divider>
                                <v-simple-table style="background-color: transparent" class="scrollbar" dense>
                                    <template v-slot:default>
                                        <thead>
                                            <tr>
                                                <th class="text-left">Parameter Name</th>
                                                <th class="text-left">Description</th>
                                                <th class="text-left">Stream Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in attributes" :key="item.id">
                                                <td>{{ item.name }}</td>
                                                <td>{{ item.description }}</td>
                                                <td>{{ item.stream_name }}</td>
                                            </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
                            </v-card>
                        </v-container>
                    </v-tab-item>
                    <v-tab-item v-if="transformer_details.length > 0" key="data">
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" v-model="attribute_value.date" label="Date"
                                        append-icon="mdi-calendar" readonly hide-details outlined dense
                                        @click:append="datepicker = true"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Time" value="12:30:00" v-model="attribute_value.time"
                                        @click:append="timepicker = true" append-icon="mdi-clock-edit-outline" readonly
                                        hide-details dense outlined>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Acetylene (C2H2)" dense outlined hide-details
                                        v-model="attribute_value.acetylene" type="number"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Ethylene (C2H4)" dense outlined hide-details
                                        v-model="attribute_value.ethylene" type="number"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Methane (CH4)" dense outlined hide-details
                                        v-model="attribute_value.methane" type="number"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Ethane (C2H6)" dense outlined hide-details
                                        v-model="attribute_value.ethane" type="number"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Hydrogen (H)" dense outlined hide-details
                                        v-model="attribute_value.hydrogen" type="number"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Oxygen (O2)" dense outlined hide-details
                                        v-model="attribute_value.oxygen" type="number"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Carbon Monoxide (CO)" dense outlined hide-details
                                        v-model="attribute_value.carbon_monoxide" type="number"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field color="red" label="Carbon Dioxide (CO2)" dense outlined hide-details
                                        v-model="attribute_value.carbon_dioxide" type="number"></v-text-field>
                                </v-col>
                            </v-row> -->
              <!-- <v-row>
                                  <v-col cols="12" md="6">
                                      <v-text-field label="TDCG" dense outlined hide-details></v-text-field>
                                  </v-col>
                              </v-row> -->
              <!-- <v-row>
                <v-col cols="12" md="12">
                  <v-btn block class="red darken-4 white--text" :disabled="loading" @click="writeData()"> Submit Data </v-btn>
                </v-col>
              </v-row> -->

              <div class="pt-3">
                <gasses-data :data="attribute_values" @show="showgassesdata_dialog" @showDetails="showLogDetails"></gasses-data>
              </div>
            </v-container>
          </v-tab-item>
          <!-- Select transformer >> Click Quick Analysis tab -->
          <v-tab-item v-if="attribute_values.length > 0" key="analysis">
            <div class="pa-2">
              <!-- <div class="d-flex justify-space-between align-center">
                <DateRangePickers storageID="dgaAnalysisPicker" @filter="filter" />
              
                <template>
                  <v-btn class="text-center">
                    <v-menu>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" text :disabled="loading">
                          <span v-if="!loading">Export</span>
                          <span v-else>Exporting...</span>
                          <v-icon v-if="!loading" class="">mdi-folder-arrow-down-outline</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="generateCSV()">
                          <v-list-item-title>CSV</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="generatePDF()">
                          <v-list-item-title>PDF</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-btn>
                </template>
              </div> -->

              <v-row dense>
                <v-col cols="12" sm="8">
                  <DateRangePickers storageID="dgaAnalysisPicker" @filter="filter" />
                </v-col>
                <v-col class="mt-2" cols="12" sm="4">
                  <v-row dense>
                    <v-col cols="12" sm="7"></v-col>
                    <v-col cols="12" sm="5">
                        <v-menu offset-y>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" :disabled="loading">
                              <span v-if="!loading">Export</span>
                              <span v-else>Exporting...</span>
                              <v-icon v-if="!loading" class="">mdi-folder-arrow-down-outline</v-icon>
                            </v-btn>
                          </template>
                          <v-list>
                            <v-list-item @click="generateCSV()">
                              <v-list-item-title>CSV</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="generatePDF()">
                              <v-list-item-title>PDF</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>              
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="12" md="5" class="pt-0">
                  <!-- duvals area -->
                  <DuvalsArea :historical_data="data" :latest_data="current" :svgs_data="svgs" />
                  <!-- Other Interp -->
                </v-col>
                <v-col cols="12" md="7" class="pt-0">
                  <v-card outlined elevation="0">
                    <!-- tabs -->
                    <v-tabs fixed-tabs dark background-color="red darken-3" color="white" v-model="analysisTab">
                      <v-tab key="duvalsInt"> Summary of Duvals Interpretations </v-tab>
                      <v-tab key="ppmlevels"> PPM Levels </v-tab>
                      <v-tab key="roclevels"> Rate of Change Levels </v-tab>
                      <!-- <v-spacer></v-spacer> -->
                    </v-tabs>

                    <v-tabs-items v-model="analysisTab">
                      <v-tab-item key="duvalsInt">
                        <summary-interpretations :historical_data="data" />
                      </v-tab-item>
                      <v-tab-item key="ppmlevels">
                        <!-- gauges row 1 of 2 -->
                        <v-row class="mt-3 mx-3 justify-center" dense>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="AcetyleneGauge"
                              chartTitle="Acetylene"
                              :activeTab="analysisTab"
                              tabItem="1"
                              type="acetylene"
                              :latest_data="current.acetylene"
                            />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage canvasID="EthyleneGauge" chartTitle="Ethylene" :activeTab="analysisTab" tabItem="1" type="ethylene" :latest_data="current.ethylene" />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage canvasID="MethaneGauge" chartTitle="Methane" :activeTab="analysisTab" tabItem="1" type="methane" :latest_data="current.methane" />
                          </v-col>
                        </v-row>
                        <!-- gauges row 2 of 2 -->
                        <v-row class="mt-3 mx-3 justify-center" dense>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage canvasID="EthaneGauge" chartTitle="Ethane" :activeTab="analysisTab" tabItem="1" type="ethane" :latest_data="current.ethane" />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage canvasID="HydrogenGauge" chartTitle="Hydrogen" :activeTab="analysisTab" tabItem="1" type="hydrogen" :latest_data="current.hydrogen" />
                          </v-col>
                        </v-row>
                        <!-- combined line graphs -->
                        <MultiLineGraph
                          canvasID="ppm"
                          chartTitle="Parts Per Million (PPM) Levels"
                          :historical_data="data"
                          :showTrends="['timestamp', 'c2h2', 'c2h4', 'ch4', 'c2h6', 'h2']"
                          trendLabels="timestamp"
                          :legends="['', 'Acetylene(c2h2)', 'Ethylene(c2h4)', 'Methane(ch4)', 'Ethane(c2h6)', 'Hydrogen(h2)']"
                        />
                      </v-tab-item>
                      <v-tab-item key="roclevels">
                        <!-- gauges row 1 of 2 -->
                        <v-row class="mt-3 mx-3 justify-center" dense>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="AcetyleneRocGauge"
                              chartTitle="Acetylene ROC"
                              :activeTab="analysisTab"
                              tabItem="2"
                              type="acetylene_roc"
                              :latest_data="current.acetylene_roc"
                            />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="EthyleneRocGauge"
                              chartTitle="Ethylene ROC"
                              :activeTab="analysisTab"
                              tabItem="2"
                              type="ethylene_roc"
                              :latest_data="current.ethylene_roc"
                            />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="MethaneRocGauge"
                              chartTitle="Methane ROC"
                              :activeTab="analysisTab"
                              tabItem="2"
                              type="methane_roc"
                              :latest_data="current.methane_roc"
                            />
                          </v-col>
                        </v-row>
                        <!-- gauges row 2 of 2 -->
                        <v-row class="mt-3 mx-3 justify-center" dense>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="EthaneRocGauge"
                              chartTitle="Ethane ROC"
                              :activeTab="analysisTab"
                              tabItem="2"
                              type="ethane_roc"
                              :latest_data="current.ethane_roc"
                            />
                          </v-col>
                          <v-col cols="12" md="4" class="pt-0">
                            <PieChartAKAGuage
                              canvasID="HydrogenRocGauge"
                              chartTitle="Hydrogen ROC"
                              :activeTab="analysisTab"
                              tabItem="2"
                              type="hydrogen_roc"
                              :latest_data="current.hydrogen_roc"
                            />
                          </v-col>
                        </v-row>
                        <!-- combined line graphs -->
                        <MultiLineGraph
                          canvasID="roc"
                          chartTitle="Rate of Change (ROC) Levels"
                          :historical_data="data"
                          :showTrends="['timestamp', 'c2h2_roc', 'c2h4_roc', 'ch4_roc', 'c2h6_roc', 'h2_roc']"
                          trendLabels="timestamp"
                          :legends="['', 'Acetylene(ROC)', 'Ethylene(ROC)', 'Methane(ROC)', 'Ethane(ROC)', 'Hydrogen(ROC)']"
                        />
                      </v-tab-item>
                    </v-tabs-items>
                  </v-card>
                  <OtherInterpretations :latest_data="current" />
                </v-col>
              </v-row>
            </div>
          </v-tab-item>
          <!-- Select transformer >> Click H2 Scan tab  -->
          <!-- <v-tab-item v-if="attribute_values.length > 0" key="h2scan">
            <H2ScanPage :elementID="element.id" />
          </v-tab-item> -->
        </v-tabs-items>
      </v-col>
    </v-row>
    <v-dialog v-model="gassesData_dialog" persistent max-width="800">
      <v-card>
        <v-card-actions>
          <v-card-title>Gasses Data</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="gassesData_dialog = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-card outlined class="pa-6">
                <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                color="red"
                v-model="attribute_value.date"
                label="Date"
                append-icon="mdi-calendar"
                readonly
                hide-details
                outlined
                dense
                @click="datepicker = true"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                color="red"
                label="Time"
                v-model="attribute_value.time"
                @click="timepicker = true"
                append-icon="mdi-clock-edit-outline"
                readonly
                hide-details
                dense
                outlined
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Acetylene (C₂H₂) (ppm)" dense outlined hide-details v-model="attribute_value.acetylene" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Ethylene (C₂H₄) (ppm)" dense outlined hide-details v-model="attribute_value.ethylene" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Methane (CH₄) (ppm)" dense outlined hide-details v-model="attribute_value.methane" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Ethane (C₂H₆) (ppm)" dense outlined hide-details v-model="attribute_value.ethane" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Hydrogen (H₂) (ppm)" dense outlined hide-details v-model="attribute_value.hydrogen" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Oxygen (O₂) (ppm)" dense outlined hide-details v-model="attribute_value.oxygen" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Carbon Monoxide (CO) (ppm)" dense outlined hide-details v-model="attribute_value.carbon_monoxide" type="number"></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field color="red" label="Carbon Dioxide (CO₂) (ppm)" dense outlined hide-details v-model="attribute_value.carbon_dioxide" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="12">
              <v-btn block class="red darken-4 white--text" :disabled="save_loading" @click="writeData()">{{ save_loading ? "Saving..." : "Save Data" }}</v-btn>
              <!-- <v-btn block class="red darken-4 white--text" :disabled="loading" @click="pay()"> Pay for Usage billing </v-btn> -->
            </v-col>
          </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="element_dialog" max-width="340" persistent>
      <v-card>
        <v-toolbar v-if="elements == 0" class="red darken-3" dense dark> Substation Details </v-toolbar>
        <v-toolbar v-if="elements == 1" class="red darken-3" dense dark> Transformer Details </v-toolbar>
        <v-divider></v-divider>
        <v-progress-linear v-if="save_loading" indeterminate color="red lighten-2"></v-progress-linear>
        <v-card-text>
          <div class="my-2">
            <v-text-field color="red" label="Name" hide-details v-model="new_element.name"></v-text-field>
          </div>
          <div class="my-2">
            <v-textarea color="red" no-resize label="Description" hide-details rows="3" v-model="new_element.description"></v-textarea>
          </div>
          <div class="my-2">
            <v-checkbox v-if="elements == 1" color="red" label="Create DGA Attribute Templates" v-model="new_element.template_created"></v-checkbox>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn dark small color="red" text @click="element_dialog = false"> <v-icon>mdi-arrow-left</v-icon> Cancel </v-btn>
          <v-spacer></v-spacer>
          <v-btn small color="indigo" dark text @click="saveElement()"> <v-icon>mdi-content-save</v-icon> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog persistent v-model="updateElementModal" max-width="450">
      <v-card>
        <v-card-actions>
          <v-card-title>Update Element</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="updateElementModal = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-card outlined class="pa-6">
                <div class="my-2">
                  <v-text-field label="Name" outlined dense hide-details v-model="element.name" color="red"></v-text-field>
                </div>
                <div class="my-2">
                  <v-textarea label="Description" outlined dense hide-details v-model="element.description" color="red" rows="2"></v-textarea>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="update_loading" @click="updateElement" text>{{ update_loading ? "Updating..." : "Update" }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="rootElement_dialog" max-width="340" persistent>
      <v-card>
        <v-toolbar class="red darken-3" dense dark> Site Details </v-toolbar>
        <v-divider></v-divider>
        <v-progress-linear v-if="save_loading" indeterminate color="red lighten-2"></v-progress-linear>
        <v-card-text>
          <div class="my-2">
            <v-text-field color="red" label="Name" hide-details v-model="new_element.name"></v-text-field>
          </div>
          <div class="my-2">
            <v-textarea color="red" no-resize label="Description" hide-details rows="3" v-model="new_element.description"></v-textarea>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn dark small color="red" text @click="rootElement_dialog = false"> <v-icon>mdi-arrow-left</v-icon> Cancel </v-btn>
          <v-spacer></v-spacer>
          <v-btn small color="indigo" dark text @click="saverootElement()"> <v-icon>mdi-content-save</v-icon> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="transformer_dialog" persistent max-width="800">
      <v-card>
        <v-card-actions>
          <v-card-title>Tranformer Details</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="transformer_dialog = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-card outlined class="pa-6">
                <v-row>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.manufacturer" label="Manufacturer" outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.type" label="Type" outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                color="red"
                v-model="date"
                label="Commisioning Date"
                append-icon="mdi-calendar"
                hide-details
                readonly
                outlined
                dense
                @click="startdatepicker = true"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="selectedConstructionYear"
                :items="yearsList"
                item-value="text"
                item-text="text"
                outlined
                dense
                hide-details
                color="red"
                label="Construction Year"
                @input="onConstructionYearSelected"
              >
              </v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" readonly v-model="computedAge" label="Age | Age Band" outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.line_capacity" label="Line Capacity" outlined dense hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.winding_voltage" label="Winding Voltage" outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.volt_capacity" label="Voltage Capacity" outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-textarea color="red" v-model="transformer.address" label="Address" value="" rows="1" outlined dense hide-details> </v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                dense
                color="red darken-2"
                v-model="selectedCountry"
                :items="countryOptions"
                item-value="name"
                item-text="name"
                label="Country Manufacturer"
                outlined
                clearable
                @input="onCountrySelected"
                hide-details
              >
                <template v-slot:selection="{ item }"> {{ item.name }} ({{ item.code }}) </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.serial_no" label="Serial No." outlined dense hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field color="red" v-model="transformer.model_no" label="Model No." outlined dense hide-details></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="12">
              <v-textarea color="red" v-model="transformer.asset_desc" name="input-7-1" label="Asset Description" value="" rows="3" outlined dense hide-details> </v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col v-if="transformer_dialog_mode === 'add'" cols="12" md="12">
              <v-btn block class="red darken-4 white--text" :disabled="save_loading" @click="saveDetails()"> {{ save_loading ? "Saving..." : "Save Details" }} </v-btn>
            </v-col>
            <v-col v-if="transformer_dialog_mode === 'upd'" cols="12" md="12">
              <v-btn block class="red darken-4 white--text" :disabled="save_loading" @click="updateTransformerDetails()">
                {{ save_loading ? "Updating..." : "Update Details" }}
              </v-btn>
            </v-col>
          </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="validation_dialog" max-width="450" min-width="400">
      <template>
        <v-card>
          <div>
            <span>
              <v-icon color="orange" class="icon ml-3 mt-3"> mdi-alert-circle-outline </v-icon>
              <span class="demo-check">
                {{ dialogMessage }}
              </span>
            </span>
          </div>
          <v-card-actions class="justify-end">
            <v-btn dark small color="red" text @click="validation_dialog = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-dialog v-model="confirm_dialog" max-width="300">
      <v-card>
        <v-card-title> </v-card-title>
        <v-card-text>
          Are you sure you want to delete {{ element.path }}?
          <br />
          <div>Note : This action cannot be undone.</div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text @click="confirm_dialog = false"> No </v-btn>

          <v-btn color="red" text @click="removeChildProcess()"> Yes </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <log-details :details="attribute_value_details" :show="showLogPopup" @close="hideLogPopup"></log-details>
    <date-picker :dialog="datepicker" :date="attribute_value.date" @setDate="getDate" @close="closeDatePicker"></date-picker>
    <date-picker :dialog="startdatepicker" :date="transformer.startup_date" @setDate="startDate" @close="closeDatePicker"></date-picker>
    <time-picker :dialog="timepicker" @setTime="setTime" :time="attribute_value.time" @close="closeTimePicker" :current_time="time"></time-picker>
    <!-- <ADHConfig :stream_id="stream_id"></ADHConfig> -->
  </div>
</template>
<style scoped>
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

.full-height {
  height: calc(100vh - 53px);
}

.column-header {
  padding: 10px;
  text-align: center;
  border-radius: 0;
}

.border {
  border: 1px solid gray;
}

.scrollbar {
  /* height: 250px; */
  overflow-y: scroll;
  /* Add the ability to scroll */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar {
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.tabscrollbar {
  background-color: transparent;
  height: 800px;
  overflow-y: scroll;
  /* Add the ability to scroll */
}

.transparent {
  background-color: transparent;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.tabscrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.tabscrollbar {
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.pointer {
  cursor: pointer;
}

.shrink-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
<script>
import Chart from "@/components/Chart.vue";
import GassesData from "@/components/tables/GassesData.vue";
import LogDetails from "@/components/popups/LogDetails.vue";
import DatePicker from "@/components/pickers/DatePicker.vue";
import countryDataList from "country-list";
import TimePicker from "@/components/pickers/TimePicker.vue";
import axios from "axios";
import { assetMixin } from "@/mixins/AssetsLimitations.js";
import { transformerMixin } from "@/mixins/TransformerMixin.js";
import Swal from "sweetalert2";
import DuvalsArea from "@/components/home/DuvalsArea.vue";
import SummaryInterpretations from "@/components/home/SummaryInterpretations.vue";
import OtherInterpretations from "@/components/home/OtherInterpretations.vue";
import MultiLineGraph from "@/components/charts/CJSLineGraph.vue";
import PieChartAKAGuage from "@/components/charts/CJSGauge.vue";
import { symbolMixin } from "@/mixins/symbolMixin.js";
import DateRangePickers from "@/components/home/DateRangePickers.vue";
import Papa from "papaparse";
import H2ScanPage from "@/components/H2Scan/H2ScanPage.vue";

import { msalInstance } from "vue-msal-browser"

export default {
  beforeRouteEnter(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ""}`;
    next();
  },
  beforeRouteUpdate(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ""}`;
    next();
  },
  name: "Assets",
  components: {
    Chart,
    DatePicker,
    GassesData,
    LogDetails,
    TimePicker,
    DuvalsArea,
    SummaryInterpretations,
    OtherInterpretations,
    MultiLineGraph,
    PieChartAKAGuage,
    DateRangePickers,
    H2ScanPage,
  },
  mixins: [assetMixin, transformerMixin, symbolMixin],
  data() {
    return {
      loading: false,
      save_loading: false,
      validation_dialog: false,
      dialogMessage: "",
      dialogTitle: "",
      initiallyOpen: [],
      tree: [],
      tab: "general",
      element_dialog: false,
      element: {},
      yearsList: [],
      new_element: {},
      items: [],
      attributes: [],
      showAssetDetails: true,
      confirm_dialog: false,
      attribute_value: {},
      transformer_details: [],
      attribute_values: [],
      transformer: {},
      elements: [],
      attribute_value_details: {},
      startdatepicker: false,
      datepicker: false,
      timepicker: false,
      showLogPopup: false,
      transformers: [],
      transformer_dialog: false,
      transformer_dialog_mode: "add",
      rootElement_dialog: false,
      date: null,
      time: null,
      checkBox: true,
      // asset: null,
      // assets: [],
      countryOptions: countryDataList.getData(),
      selectedCountry: null,
      selectedConstructionYear: null,
      flipper: false,
      analysisTab: "duvalsInt",
      data: [],
      current: [],
      svgs: [],
      symbol: {},
      datetime1: null,
      datetime2: null,
      goTo: false,
      account_level: "",
      updateElementModal: false,
      gassesData_dialog: false,
      update_loading: false,
      adh_config: [],
      // adh_loading: false,
      // ADH_dialog: false,
      stream_id:"",
    };
  },
  mounted() {
    const storage = JSON.parse(localStorage.getItem("user"));
      if(storage.user.account_type == 'microsoft'){
        let store = JSON.parse(localStorage.getItem("user"));
        let tokenExp = JSON.parse(localStorage.getItem("token_expiry"));
        if (store && store.token && new Date(tokenExp.tokenExpiry) > new Date()) {
            // Token is valid, make the request
            this.makeAuthenticatedRequest(store.token, store.user.id);
          } else {
            // Token is expired, refresh it
            this.refreshTokenAndMakeRequest(store.user.id);
          }

          // Other initialization
          this.reversedYearsList;
          this.symbol = this.symbols[0];
      }else{
       
        let store = JSON.parse(localStorage.getItem("user"));
          axios({
            url: process.env.VUE_APP_BASEURL + "/hierarchy",
            method: "GET",
            headers: {
              Authorization: "Bearer " + store.token,
            },
            params: {
            // Example of sending data as query parameters
            // Replace 'paramName' with your actual parameter names and values
            user_id: store.user.id
          },
          })
            .then((response) => {
              this.items = response.data;
              this.account_level = JSON.parse(localStorage.getItem("user")).user.account_level;
              // console.log(this.items);
            })
            .catch((err) => {
              this.validation_dialog = true;
              this.dialogMessage = 'Unauthorized';
            });

          this.reversedYearsList;
          this.symbol = this.symbols[0];
      }
  },
  

  
  computed: {
    computedAge() {
      this.startUp = this.date ? new Date(this.date) : new Date();
      this.currentDate = new Date();
      this.age = this.currentDate.getFullYear() - this.startUp.getFullYear();
      this.ageBand = "";
      if (this.age >= 0 && this.age < 18) {
        this.ageBand = "0-17";
      } else if (this.age >= 18 && this.age < 25) {
        this.ageBand = "18-24";
      } else if (this.age >= 25 && this.age < 35) {
        this.ageBand = "25-34";
      } else if (this.age >= 35 && this.age < 50) {
        this.ageBand = "35-49";
      } else {
        this.ageBand = "50+";
      }
      return `${this.age} Yr | ${this.ageBand} Yrs`;
    },
    reversedYearsList() {
      // this.yearsList = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i)
      //   .slice()
      //   .reverse();

      let years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i)
        .slice()
        .reverse();

      this.yearsList = years.map((q) => {
        return { text: q, value: q };
      });
      // return this.yearsList;
    },
  },
  watch: {
    computedAge() {
      this.transformer.age_band = this.computedAge;
    },
    element() {
      this.getAttributeValues(this.element.id);
    },
  },
  
  methods: {
    async makeAuthenticatedRequest(token, userId) {
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + "/hierarchy",
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
          params: {
            user_id: userId
          },
        });
        this.items = response.data;
        this.account_level = JSON.parse(localStorage.getItem("user")).user.account_level;
      } catch (err) {
        this.validation_dialog = true;
        this.dialogMessage = 'Unauthorized';
      }
    },
    async refreshTokenAndMakeRequest(userId) {
      try {
        await this.acquireTokens(); // Refresh the token
        let store = JSON.parse(localStorage.getItem("user")); // Re-fetch the user store
        if (store && store.token) {
          this.makeAuthenticatedRequest(store.token, userId);
        } else {
          this.validation_dialog = true;
          this.dialogMessage = 'Unauthorized';
        }
      } catch (error) {
        console.error('Error refreshing tokens:', error);
        this.validation_dialog = true;
        this.dialogMessage = 'Unauthorized';
      }
    },
    async acquireTokens() {
      try {
        const account = msalInstance.getAllAccounts()[0];
        const response = await msalInstance.acquireTokenSilent({
          scopes: ["user.read", "offline_access"],
          account: account
        });
        const tokenExpiry = response.expiresOn;
        let user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.token = response.accessToken;
          localStorage.setItem("user", JSON.stringify(user));
        }
        const tokenExp = {
          token_expiry: tokenExpiry,
        }
        localStorage.setItem("tokenExp", JSON.stringify(tokenExp));
        // console.log('token refresh successfully');
      } catch (error) {
        console.error('Error acquiring tokens:', error);
        await msalInstance.loginRedirect({
          scopes: ["user.read", "offline_access"]
        });
      }
    },
    showgassesdata_dialog() {
       if(this.adh_config.length == 0){
            this.validation_dialog = true;
            this.dialogMessage = "Please generate ADH configurations first."
            return;
          }else{
            this.gassesData_dialog = true;
          }
    
    },
    onCountrySelected() {
      this.transformer.country_manufacturer = this.selectedCountry;
    },
    onConstructionYearSelected() {
      this.transformer.construction_year = this.selectedConstructionYear;
    },
    getDetails(value) {
      if (value.length == 0) {
        this.element = {};
        this.attributes = [];
        // this.transformer_details = {};
        return;
      }
      this.loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + value[0],
        method: "GET",
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((response) => {
       
          this.element = response.data.details;
          this.transformers = response.data.transformers;
          // Filter the transformers based on company_id
          // this.transformers = transformers.filter(transformer => transformer.company_id === this.element.company_id);
          this.elements = response.data.details.path.split("\\").length - 1;
          this.attributes = response.data.attributes;
          this.attribute_values = response.data.attribute_values;
          this.attribute_value_length = this.attribute_values.length;
          this.attribute_value = {};
          this.adh_config = response.data.adh_config;

          this.transformer_details = response.data.transformer_details;
         
          const elements = this.element.path.split('\\');
             // Iterate over the elements and extract the first two characters after each backslash
             const capitalizedElements = elements.map(element => {
              if (element.length > 2) {
                  return element.substring(0, 3).toUpperCase(); // Capitalize the first two characters
              }
              return element.toUpperCase(); // If the element has less than two characters, capitalize all of them
          });

          const capitalizedPath = capitalizedElements.join('\\'); // Join the elements back with backslashes

          this.stream_id = capitalizedPath.replace(/\\/g, '');
          console.log(this.stream_id);
          // if(this.goTo == true){
          //   this.tab = 2;
          //   this.goTo = false;
          // }else if (this.goTo == false){
          //   this.tab = 0;
          // }
          this.getAdhDetails();
          this.tab = 2;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
      this.getAttributeValues(this.element.id);
    },
    addRootElement() {
      // this.count = elements;
      // console.log(this.demoElemLimit(this.items));
      //   if (element_count == 3) {
      //     this.validation_dialog = true;
      //     this.dialogMessage = "Only 1 asset is allowed in demo version.";
      //   } else {
      //     this.new_element = {
      //       id: null,
      //       company_id: JSON.parse(window.localStorage.getItem("user"))
      //         .company_id,
      //     };
      //     this.rootElement_dialog = true;
      //   }

      this.new_element = {
        id: null,
        company_id: JSON.parse(window.localStorage.getItem("user")).company_id,
      };
      this.rootElement_dialog = true;
    },
    addSubstation() {
      if (this.element.id == undefined) {
        this.validation_dialog = true;
        this.dialogMessage = "Please select site.";
        return;
      }
      this.new_element = {
        parent_id: this.element.id,
        company_id: JSON.parse(window.localStorage.getItem("user")).company_id,
      };
      this.element_dialog = true;
    },
    addTransformer() {
      if (this.element.id == undefined) {
        this.validation_dialog = true;
        this.dialogMessage = "Please select substation.";
        return;
      }
      this.new_element = {
        parent_id: this.element.id,
        template_created: true,
        company_id: JSON.parse(window.localStorage.getItem("user")).company_id,
      };
      this.element_dialog = true;
    },
    removeChild() {
      this.confirm_dialog = true;
    },
    removeChildProcess() {
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + this.element.id,
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          this.items = res.data;
          this.transformers = {};
          this.confirm_dialog = false;
        })
        .catch((err) => {});
    },
    toggleUpdateModal() {
      this.updateElementModal = true;
    },
    updateElement() {
      this.update_loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + this.element.id,
        method: "PUT",
        data: this.element,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          this.update_loading = false;
          this.updateElementModal = false;
        })
        .catch((res) => {
          this.update_loading = false;
          this.updateElementModal = false;
        });
    },
    saveElement() {
      if (!this.new_element.name) {
        this.validation_dialog = true;

        this.dialogMessage = "Element name field is required.";
        return;
      }

      if (this.elements == 1) {
        if (!this.new_element.template_created) {
          this.validation_dialog = true;

          this.dialogMessage = "Check Create DGA Attribute.";
          return;
        }
      }

      this.save_loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + (this.element.id ? this.element.id : 0),
        method: "POST",
        data: this.new_element,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          this.save_loading = false;
          this.items = res.data;
          // console.log(this.items);
          this.element_dialog = false;
          this.rootElement_dialog = false;
        })
        .catch((err) => {
          // alert(err.response.data.message);
          this.validation_dialog = true;
          this.dialogMessage = err.response.data;
          this.save_loading = false;
        });
    },

    saverootElement() {
      if (!this.new_element.name) {
        this.validation_dialog = true;

        this.dialogMessage = "Element name field is required.";
        return;
      }

      this.save_loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + (this.element.id ? this.element.id : 0),
        method: "POST",
        data: this.new_element,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          this.save_loading = false;
          this.items = res.data;
          // console.log(this.items);
          this.element_dialog = false;
          this.rootElement_dialog = false;
        })
        .catch((err) => {
          // console.log(err.response);
          this.validation_dialog = true;
          this.dialogMessage = err.response.data;
          this.save_loading = false;
        });
    },

    createAttributes(id) {
      this.loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/elements/" + id + "/attributes",
        method: "POST",
        data: { element_id: id },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          this.loading = false;
          this.attributes = res.data;
          // console.log(this.attributes);
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    getDate(date) {
      this.attribute_value.date = date;
      this.datepicker = false;
    },
    setTime(time) {
      this.attribute_value.time = time;
      this.timepicker = false;
    },
    startDate(date) {
      this.date = date;
      this.transformer.startup_date = this.date;
      this.startdatepicker = false;
    },
    closeTimePicker() {
      this.timepicker = false;
    },
    closeDatePicker() {
      this.datepicker = false;
      this.startdatepicker = false;
    },
    writeData() {
      if (this.demoDatapointLimit(this.attribute_values, this.attribute_value) === true) {
        this.save_loading = true;
        this.attribute_value.company_id = this.element.company_id;
        this.attribute_value.asset_id = this.stream_id;
        axios({
          url: process.env.VUE_APP_BASEURL + "/elements/" + this.element.id + "/attribute-values",
          method: "POST",
          data: this.attribute_value,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        })
          .then((res) => {
            this.save_loading = false;
            this.gassesData_dialog = false;
            this.attribute_values = res.data;
            this.attribute_value = {};
            // this.flipper = !this.flipper;
            this.getAttributeValues(this.element.id);
          })
          .catch((err) => {
            // console.log(err.response);
            if (err.response.status == 400) {
              this.validation_dialog = true;
              this.dialogMessage = err.response.data.error;
              this.attribute_value = {};
            } else {
              alert("Something went wrong. Please Try again.");
            }
            this.gassesData_dialog = false;
            this.save_loading = false;
          });
      } else {
        this.validation_dialog = true;
        this.dialogMessage = this.demoDatapointLimit(this.attribute_values, this.attribute_value);
      }
    },
    saveDetails() {
      if (this.validateTransformerDetails(this.transformer) === true) {
        this.save_loading = true;
        this.transformer.company_id = this.element.company_id;
        this.transformer.stream_id = this.stream_id;
        axios({
          url: process.env.VUE_APP_BASEURL + "/elements/" + this.element.id + "/transformers",
          method: "POST",
          data: this.transformer,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        })
          .then((response) => {
            this.selectedCountry = null;
            this.date = null;
            this.transformer_dialog = false; // close dialog
            this.transformer_details = [response.data.new_transformers];
            this.transformer = {}; // clear input fields?
            this.save_loading = false; // stop loading
          })
          .catch((err) => {
            alert(err.response);
            this.save_loading = false; // stop loading
          });
      } else {
        this.validation_dialog = true;
        this.dialogMessage = this.validateTransformerDetails(this.transformer);
      }
    },
    editTransformerDetails(mode) {
      // put prev values to proper place for editing
      switch (mode) {
        case "add":
          // if(this.adh_config.length == 1){
          //   this.validation_dialog = true;
          //   this.dialogMessage = "Please create ADH Configurations first."
          //   return;
          // }
          this.transformer = {};
          this.date = null;
          this.selectedCountry = null;
          this.selectedConstructionYear = null;
          break;
        case "upd":
          this.transformer = this.transformer_details[0];
          this.date = this.transformer_details[0].startup_date;
          this.selectedCountry = this.transformer_details[0].country_manufacturer;
          this.selectedConstructionYear = { text: parseInt(this.transformer_details[0].construction_year), value: parseInt(this.transformer_details[0].construction_year) };
          break;
        default:
          break;
      }

      // show edit dialog
      this.transformer_dialog_mode = mode;
      this.transformer_dialog = true;
    },
    updateTransformerDetails() {
      if (this.validateTransformerDetails(this.transformer) === true) {
        this.save_loading = true;
        axios({
          url: process.env.VUE_APP_BASEURL + "/elements/" + this.element.id + "/transformers",
          method: "PUT",
          data: this.transformer,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        })
          .then((response) => {
            this.selectedCountry = null;
            this.date = null;
            this.selectedConstructionYear = null;
            this.transformer_dialog = false; // close dialog
            this.transformer_details = [this.transformer];
            this.transformer = {}; // clear input fields?
            this.save_loading = false; // stop loading
            this.transformer_dialog_mode = "add"; // return to add mode
          })
          .catch((err) => {
            alert(err.response);
          });
      } else {
        this.validation_dialog = true;
        this.dialogMessage = this.validateTransformerDetails(this.transformer);
      }
    },

    showLogDetails(item) {
      item.path = this.element.path; //Adding Element Path in the parameters
      // console.log(item.path);
      this.attribute_value_details = item;
      // console.log(this.attribute_value_details);
      this.showLogPopup = true;
    },
    hideLogPopup() {
      this.showLogPopup = false;
    },
    goToTransformer(t) {
      if (!t.latest_value) {
        this.validation_dialog = true;
        this.dialogMessage = "No Data";
        return;
      }
      this.getDetails([t.id]);
      this.tree = [t.id];
    },

    getAttributeValues(elementID) {
      if (elementID !== null && this.datetime1 !== null && this.datetime2 !== null) {
        // let curr = new Date("2023-07-30");
        // // format the dates; this is atrocious; pls help me format these
        // // formattedStartDT should be 3 months later that formattedEndDT
        // let formattedEndDT = `${curr.getFullYear()}-${(curr.getMonth() + 1).toString().padStart(2, "0")}-${curr.getDate().toString().padStart(2, "0")} ${curr
        //   .getHours()
        //   .toString()
        //   .padStart(2, "0")}:${curr.getMinutes().toString().padStart(2, "0")}:${curr.getSeconds().toString().padStart(2, "0")}`;
        // let formattedStartDT = `${curr.getFullYear()}-${(curr.getMonth() - 2).toString().padStart(2, "0")}-${curr.getDate().toString().padStart(2, "0")} ${curr
        //   .getHours()
        //   .toString()
        //   .padStart(2, "0")}:${curr.getMinutes().toString().padStart(2, "0")}:${curr.getSeconds().toString().padStart(2, "0")}`;

        // fetch data from db based on datetime1 and datetime2...
        axios({
          url: process.env.VUE_APP_BASEURL + "/elements/" + elementID + "/attribute-values",
          method: "GET",
          params: {
            start: this.datetime1,
            end: this.datetime2,
          },
          headers: {
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        })
          .then((res) => {
            // console.log(res.data);
            this.data = res.data.values.map((d) => {
              const parts = d.path.split("\\");
              const site = parts[0];
              const substation = parts[1];
              const transformer = parts[2];

              let obj = {
                StartTime: this.datetime1,
                EndTime: this.datetime2,
                timestamp: d.timestamp,
                site: site,
                substation: substation,
                transformer: transformer,
                c2h2: d.acetylene,
                c2h4: d.ethylene,
                ch4: d.methane,
                c2h6: d.ethane,
                c2h2_roc: d.acetylene_roc,
                c2h4_roc: d.ethylene_roc,
                ch4_roc: d.methane_roc,
                c2h6_roc: d.ethane_roc,
                h2_roc: d.hydrogen_roc,
                co: d.carbon_monoxide,
                co2: d.carbon_dioxide,
                h2: d.hydrogen,
                n2: d.nitrogen,
                t1: d.t1,
                t2: d.t2,
                t3: d.t3_biotemp,
                t4: d.t4,
                t5: d.t5,
                t6: d.t6,
                t7: d.t7,
                p1: d.p1,
                p2: d.p2,
                nei: d.nei,
                iec_ratio: d.iec_ratio,
                dornenberg_ratio: d.dornenberg,
                rogers_ratio: d.rogers_ratio,
                carbon_ratio: d.carbon_ratio,
                element_id: d.id,
              };
              return obj;
            });
            // console.log(this.current.acetylene_roc);
            this.current = res.data.current ? res.data.current : {};
            this.current.interpretation = res.data.current[this.getSymbolById(this.symbol.id)];
            //Calculate current percentage of gases for pentagon
            var currentGasTotal = this.current.acetylene + this.current.ethylene + this.current.methane + this.current.ethane + this.current.hydrogen;

            var currentC2H2 = (this.current.acetylene / currentGasTotal) * 100;
            var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
            var currentCH4 = (this.current.methane / currentGasTotal) * 100;
            var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
            var currentH2 = (this.current.hydrogen / currentGasTotal) * 100;
            this.current.c2h2_pc_pen = currentC2H2.toFixed(2);
            this.current.c2h4_pc_pen = currentC2H4.toFixed(2);
            this.current.ch4_pc_pen = currentCH4.toFixed(2);
            this.current.c2h6_pc_pen = currentC2H6.toFixed(2);
            this.current.h2_pc_pen = currentH2.toFixed(2);
            //Calculate current percentage of gases for triangle
            var currentGasTotal = this.current.acetylene + this.current.ethylene + this.current.methane;
            var currentC2H2 = (this.current.acetylene / currentGasTotal) * 100;
            var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
            var currentCH4 = (this.current.methane / currentGasTotal) * 100;
            this.current.c2h2_pc_tri_1 = currentC2H2.toFixed(2);
            this.current.c2h4_pc_tri_1 = currentC2H4.toFixed(2);
            this.current.ch4_pc_tri_1 = currentCH4.toFixed(2);
            //Calculate current percentage of gases for triangle
            var currentGasTotal = this.current.methane + this.current.ethane + this.current.hydrogen;
            var currentCH4 = (this.current.methane / currentGasTotal) * 100;
            var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
            var currentH2 = (this.current.hydrogen / currentGasTotal) * 100;
            this.current.ch4_pc_tri_2 = currentCH4.toFixed(2);
            this.current.c2h6_pc_tri_2 = currentC2H6.toFixed(2);
            this.current.h2_pc_tri_2 = currentH2.toFixed(2);
            //Calculate current percentage of gases for triangle
            var currentGasTotal = this.current.ethylene + this.current.ethane + this.current.methane;
            var currentC2H4 = (this.current.ethylene / currentGasTotal) * 100;
            var currentC2H6 = (this.current.ethane / currentGasTotal) * 100;
            var currentCH4 = (this.current.methane / currentGasTotal) * 100;
            this.current.c2h4_pc_tri_3 = currentC2H4.toFixed(2);
            this.current.c2h6_pc_tri_3 = currentC2H6.toFixed(2);
            this.current.ch4_pc_tri_3 = currentCH4.toFixed(2);

            this.svgs = res.data.svgs;
            // console.log(this.current);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        return;
      }
    },
    filter(dt1, dt2) {
      // console.log(dt1, dt2);
      this.datetime1 = dt1;
      this.datetime2 = dt2;

      this.getAttributeValues(this.element.id);
    },
    generatePDF() {
      this.validation_dialog = true;
      this.dialogMessage = "Under development.";
      return;
      this.loading = true;
      setTimeout(() => {
        window.print();
        this.loading = false;
      }, 1000);
    },
    generateCSV() {
      // Set the loading flag to true
      this.loading = true;

      // Show a loading indicator for 1 second
      setTimeout(() => {
        // Create a copy of the original data with formatted timestamp
        const dataWithFormattedTimestamp = this.data.map((item) => {
          // Clone each object in the array to avoid modifying the original objects
          const clonedItem = Object.assign({}, item);

          // Format the timestamp property to a human-readable date format
          clonedItem.timestamp = new Date(item.timestamp).toLocaleString();

          // Delete the timestamp property from the cloned object
          // delete clonedItem.timestamp;
          // Delete the element property, if desired
          delete clonedItem.element;

          return clonedItem;
        });

        // Generate CSV from the modified data array
        const csv = Papa.unparse(dataWithFormattedTimestamp);

        //creating and downloading the CSV
        const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const csvURL = window.URL.createObjectURL(csvData);
        const link = document.createElement("a");
        link.href = csvURL;
        link.setAttribute("download", "exported_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Set the loading flag to false
        this.loading = false;
      }, 1000);
    },
  },
};
</script>
