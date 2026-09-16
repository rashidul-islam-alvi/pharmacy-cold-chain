export const demoPatient = {
  resourceType: "Patient",

  identifier: [
    {
      system: "http://hospital.example/patients",
      value: "P001",
    },
  ],

  name: [
    {
      family: "Test",
      given: ["Patient"],
    },
  ],
};
