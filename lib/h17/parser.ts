import { HL7Message } from "hl7v2";

export type PharmacyOrder = {
  messageType: string;
  triggerEvent: string;
  messageControlId: string;
  patientId: string;
  orderControl: string;
  orderId: string;
  medication: string;
};

export function parsePharmacyOrder(rawMessage: string): PharmacyOrder {
  // HL7 uses \r as the segment separator.
  // Normalize messages coming from clients that use \n or \r\n.
  const normalizedHL7 = rawMessage.replace(/\r\n/g, "\r").replace(/\n/g, "\r");

  const message = HL7Message.parse(normalizedHL7);

  const msh = message.getSegment("MSH");
  const pid = message.getSegment("PID");
  const orc = message.getSegment("ORC");
  const rxo = message.getSegment("RXO");

  if (!msh) {
    throw new Error("Missing MSH segment");
  }

  if (!pid) {
    throw new Error("Missing PID segment");
  }

  if (!orc) {
    throw new Error("Missing ORC segment");
  }

  if (!rxo) {
    throw new Error("Missing RXO segment");
  }

  const mshRaw = msh.toHL7String();

  const mshFields = mshRaw.split("|");

  // MSH-9 is index 8 because the segment name is index 0.
  const rawMessageType = mshFields[8]?.trim() ?? "";

  const [messageType, triggerEvent] = rawMessageType.split("^");

  if (!messageType || !triggerEvent) {
    throw new Error(`Invalid HL7 message type: ${rawMessageType}`);
  }

  if (messageType !== "OMP" || triggerEvent !== "O09") {
    throw new Error(`Unsupported HL7 message type: ${rawMessageType}`);
  }

  const messageControlId = msh.field(10).getValue();

  const patientId = pid.field(3).getValue();

  const orderControl = orc.field(1).getValue();

  const orderId = orc.field(2).getValue();

  const medication = rxo.field(1).getValue();

  if (!patientId) {
    throw new Error("Missing patient ID");
  }

  if (!orderId) {
    throw new Error("Missing order ID");
  }

  if (!medication) {
    throw new Error("Missing medication");
  }

  return {
    messageType,
    triggerEvent,
    messageControlId,
    patientId,
    orderControl,
    orderId,
    medication,
  };
}
