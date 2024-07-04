<template>
  <v-dialog v-model="show" max-width="450" min-width="400" persistent>
    <template>
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text class="mb-0">
          <div class="d-flex align-center">
            <v-icon color="orange"> mdi-alert-circle-outline </v-icon>
            <div class="pl-2">
              {{ dialogMessage }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn dark small color="red" text @click="close">OK</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
export default {
  name: "AlertDialog",
  props: ["show", "dialogMessage"],
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>
