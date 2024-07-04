export const symbolMixin = {
  created() {
    // console.log('Symbol Mixin has been loaded.')
  },
  data() {
    return {
      symbols: [
        {
          id: 1,
          name: "Duval's Triangle 1",
          key: "t1",
          legends: {
            PD: {
              color: "pink",
              description: "Corona Partial Discharge",
            },
            T1: {
              color: "purple",
              description: "Thermal Faults, T",
            },
            T2: {
              color: "green",
              description: "Thermal Faults, 300degC < T < 700degC",
            },
            T3: {
              color: "hotpink",
              description: "Thermal Faults, T > 700degC",
            },
            DT: {
              color: "blue",
              description: "Mixture of Electrical, Thermal Faults",
            },
            D1: {
              color: "skyblue",
              description: "Low Energy Discharges",
            },
            D2: {
              color: "#679A00",
              description: "High Energy Discharges",
            },
          },
        },
        {
          id: 2,
          name: "Duval's Triangle 2",
          key: "t2",
          legends: {
            X1: {
              color: "pink",
              description: "Abnormal arcing D1 or thermal fault in progress",
            },
            X3: {
              color: "purple",
              description: "Fault T3 or T2 in progress, or abnormal severe arcing D2",
            },
            T2: {
              color: "LimeGreen",
              description: "Severe thermal fault T2 (300 < T < 700°C), coking",
            },
            T3: {
              color: "HotPink",
              description: "Severe thermal fault T3 (T > 700°C), heavy coking",
            },
            D1: {
              color: "blue",
              description: "Abnormal arcing D1",
            },
            N: {
              color: "SkyBlue",
              description: "Normal operation",
            },
          },
        },
        {
          id: 3,
          name: "Duval's Triangle 3",
          key: "t3_biotemp",
          legends: {
            PD: {
              color: "pink",
              description: "Coronal Partial Discharge",
            },
            T1: {
              color: "purple",
              description: "Thermal Faults, T",
            },
            T2: {
              color: "LimeGreen",
              description: "Thermal Faults, 300&#8451 < T < 700&#8451",
            },
            T3: {
              color: "HotPink",
              description: "Thermal faults, T > 700&#8451;",
            },
            DT: {
              color: "blue",
              description: "Mixture of electrical, thermal faults",
            },
            D1: {
              color: "SkyBlue",
              description: "Low energy discharges",
            },
            D2: {
              color: "#679A00",
              description: "High energy discharges",
            },
          },
        },
        {
          id: 4,
          name: "Duval's Triangle 4",
          key: "t4",
          legends: {
            PD: {
              color: "pink",
              description: "Corona Partial Discharge",
            },
            S: {
              color: "purple",
              description: "Stray Gassing of Oil, T < 200degC",
            },
            C: {
              color: "LimeGreen",
              description: "Possible Cabonization of Paper, Probability of ~70%, not 100%",
            },
            O: {
              color: "HotPink",
              description: "Overheating, T < 250degC",
            },
            ND: {
              color: "blue",
              description: "Undefined",
            },
          },
        },
        {
          id: 5,
          name: "Duval's Triangle 5",
          key: "t5",
          legends: {
            PD: {
              color: "pink",
              description: "Corona Partial Discharge",
            },
            O: {
              color: "purple",
              description: "Overheating, T < 250degC",
            },
            T2: {
              color: "LimeGreen",
              description: "Thermal Faults, 300degC < T < 700degC",
            },
            T3: {
              color: "HotPink",
              description: "Thermal Faults, T > 700degC",
            },
            S: {
              color: "blue",
              description: "Stray Gassing of Oil, T < 200degC",
            },
            C: {
              color: "SkyBlue",
              description: "Possible Carbonization of Paper, Probability of !70% not 100%",
            },
            ND: {
              color: "#679A00",
              description: "Undefined",
            },
          },
        },
        {
          id: 6,
          name: "Duval's Triangle 6",
          key: "t6",
          legends: {
            PD: {
              color: "pink",
              description: "Corona partial discharge",
            },
            S: {
              color: "hotpink",
              description: "Stray gassing of FR3 oil",
            },
            C: {
              color: "LimeGreen",
              description: "Hot spots with carbonization of paper (T>300&#8451;)",
            },
            O: {
              color: "blue",
              description: "Overheating (T<300&#8451;)",
            },
            ND: {
              color: "SkyBlue",
              description: "Not determined",
            },
          },
        },
        {
          id: 7,
          name: "Duval's Triangle 7",
          key: "t7",
          legends: {
            S: {
              color: "orange",
              description: "Stray gassing of FR3 oil",
            },
            C: {
              color: "HotPink",
              description: "Hot Spot with carbonization of paper (T > 300&#8451;)",
            },
            O: {
              color: "LimeGreen",
              description: "Overheating(T > 250&#8451;)",
            },
            T3: {
              color: "blue",
              description: "Termal faults of very high temperature T > 300&#8451;",
            },
            ND: {
              color: "SkyBlue",
              description: "Not determined",
            },
          },
        },
        {
          id: 8,
          key: "p1",
          name: "Duval's Pentagon 1",
          legends: {
            PD: {
              color: "HotPink",
              description: "Thermal Faults, T3, T2, and T1 with carbonization of paper",
            },
            S: {
              color: "Blue",
              description: "Thermal Faults in Oil only",
            },
            D1: {
              color: "LimeGreen",
              description: "High Energy Discharges",
            },
            D2: {
              color: "#679A00",
              description: "Low Energy Dischages",
            },
            T3: {
              color: "pink",
              description: "Corona Partial Discharges",
            },
            T2: {
              color: "purple",
              description: "Stray Gassing of Mineral Oil at 120degC and 200degC in the laboratory",
            },
            T1: {
              color: "SkyBlue",
              description: "Overheating T1 < 250degC",
            },
          },
        },
        {
          id: 9,
          key: "p2",
          name: "Duval's Pentagon 2",
          legends: {
            C: {
              color: "HotPink",
              description: "Thermal Faults, T3, T2, and T1 with carbonization of paper",
            },
            "T3-H": {
              color: "blue",
              description: "Thermal Faults in Oil only",
            },
            D1: {
              color: "#679A00",
              description: "High Energy Discharges",
            },
            D2: {
              color: "LimeGreen",
              description: "Low Energy Dischages",
            },
            PD: {
              color: "pink",
              description: "Corona Partial Discharges",
            },
            S: {
              color: "purple",
              description: "Stray Gassing of Mineral Oil at 120degC and 200degC in the laboratory",
            },
            O: {
              color: "SkyBlue",
              description: "Overheating T1 < 250degC",
            },
          },
        },
      ],
    };
  },
  methods: {
    getSymbolById(id) {
      let keys = {
        1: "t1",
        2: "t2",
        3: "t3_biotemp",
        4: "t4",
        5: "t5",
        6: "t6",
        7: "t7",
        8: "p1",
        9: "p2",
      };

      return keys[id];
    },
  },
};
