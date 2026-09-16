# Pharmacy Cold Chain to Inpatient Floor (IPD)

A healthcare integration workflow demonstrating how a pharmacy system can receive an inpatient medication indent, validate the prescribed medication, record the dispensing process, notify the nurse without exposing unnecessary PHI, and maintain a tamper-evident audit trail.

## 1. Overview

This project implements the following workflow:

```text
Nurse Indent
     │
     ▼
HL7 v2 OMP^O09
     │
     ▼
Parse HL7 Message
     │
     ▼
FHIR MedicationRequest
     │
     ▼
RxNorm / RxNav Validation
     │
     ▼
Medication Approved
     │
     ├──────────────► FHIR MedicationDispense
     │
     ├──────────────► PHI-safe Nurse Notification
     │
     └──────────────► FHIR AuditEvent
```

The application uses a small web dashboard as the presentation layer while the actual workflow is implemented through API routes and healthcare interoperability standards.

---

# 2. Assignment Requirements

The implementation covers the required tasks:

| Requirement                | Implementation                    |
| -------------------------- | --------------------------------- |
| Read prescription from EHR | FHIR `MedicationRequest`          |
| Validate drug/formulation  | NIH NLM RxNorm/RxNav API          |
| Parse legacy HL7 v2 order  | `hl7v2` Node.js parser            |
| Support `OMP^O09`          | HL7 parser validates message type |
| Record packed medication   | FHIR `MedicationDispense`         |
| Record courier and ETA     | `MedicationDispense` extensions   |
| Send nurse notification    | PHI-safe notification object      |
| Audit workflow events      | FHIR `AuditEvent`                 |
| Tamper-evident audit trail | SHA-256 hash chain                |
| Demonstrate failure path   | RxNorm validation rejection       |

---

# 3. Technology Stack

### Application

- Next.js
- TypeScript
- React
- Tailwind CSS
- Lucide React

### Healthcare Standards / Services

- HL7 v2
- FHIR R4
- RxNorm
- RxNav REST API
- HAPI FHIR JPA Server

### Libraries

- `hl7v2`
- `hl7v2-dictionary`
- Node.js `crypto` for SHA-256 hashing

### Infrastructure

- Docker
- HAPI FHIR running locally

---

# 4. Project Architecture

The project is organized around small modules for each healthcare integration responsibility.

```text
app/
├── api/
│   ├── audit/
│   │   ├── previous-hash/
│   │   └── test/
│   │
│   ├── fhir/
│   │   └── patient/
│   │
│   ├── hl7/
│   │   └── test/
│   │
│   ├── notifications/
│   │   └── nurse/
│   │
│   └── pharmacy/
│       ├── process-indent/
│       ├── process-order/
│       └── validate-prescription/
│
├── page.tsx
│
lib/
├── audit/
│   ├── audit-event.ts
│   └── hash-chain.ts
│
├── fhir/
│   ├── client.ts
│   ├── medication-dispense.ts
│   ├── medication-request.ts
│   └── patient.ts
│
├── hl7/
│   └── parser.ts
│
├── notifications/
│   └── nurse.ts
│
├── pharmacy/
│   ├── process-indent.ts
│   ├── process-pharmacy-order.ts
│   └── validate-prescription.ts
│
└── rxnorm/
    ├── client.ts
    └── validate.ts
```

The application separates:

1. HL7 parsing
2. FHIR communication
3. RxNorm validation
4. Pharmacy workflow processing
5. Nurse notification
6. Audit logging

This keeps the healthcare integration logic independent from the UI.

---

# 5. HL7 v2 Integration

## 5.1 Incoming Message

The system accepts an HL7 v2 `OMP^O09` medication order.

Example:

```text
MSH|^~\&|HIS|HOSPITAL|PHARMACY|HOSPITAL|202609162100||OMP^O09|MSG001|P|2.5
PID|1||P001
ORC|NW|ORD001
RXO|Ceftriaxone 1 g injection
```

The message contains:

- Message type: `OMP`
- Trigger event: `O09`
- Patient ID: `P001`
- Order ID: `ORD001`
- Medication: `Ceftriaxone 1 g injection`

## 5.2 Parsing

The application uses the `hl7v2` package rather than manually splitting the complete HL7 message.

The parser extracts the required segments:

```text
MSH
PID
ORC
RXO
```

It validates that the incoming message is:

```text
OMP^O09
```

Unsupported message types are rejected.

The parsed result is converted into an internal pharmacy order:

```json
{
  "messageType": "OMP",
  "triggerEvent": "O09",
  "messageControlId": "MSG001",
  "patientId": "P001",
  "orderControl": "NW",
  "orderId": "ORD001",
  "medication": "Ceftriaxone 1 g injection"
}
```

---

# 6. FHIR MedicationRequest

The doctor's prescription is represented using a FHIR `MedicationRequest`.

Example:

```json
{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "medicationCodeableConcept": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "309309",
        "display": "Ceftriaxone 1 GM Injection"
      }
    ],
    "text": "Ceftriaxone 1 g injection"
  },
  "subject": {
    "reference": "Patient/1000"
  },
  "dosageInstruction": [
    {
      "text": "Ceftriaxone 1 g IV every 24 hours"
    }
  ]
}
```

The application reads the medication from the FHIR resource before continuing with the pharmacy workflow.

The demonstration patient is represented by:

```text
Patient/1000
```

with the hospital identifier:

```text
P001
```

---

# 7. RxNorm Validation

The requested medication is validated against the NIH National Library of Medicine RxNorm service through RxNav.

The application sends the medication name to:

```text
approximateTerm
```

For example:

```text
Ceftriaxone 1 g injection
```

The validation returns an RxNorm concept.

For the demonstration medication:

```text
RxCUI: 1665021
Name: cefTRIAXone 1 GM Injection
Source: RXNORM
```

The workflow only approves the medication when an appropriate RxNorm candidate is found.

## Valid Example

```text
Ceftriaxone 1 g injection
        ↓
RxNorm
        ↓
RxCUI 1665021
        ↓
Approved
```

## Invalid Example

The system was also tested with:

```text
SuperCurex 999 mg injection
```

No matching RxNorm concept was returned.

The resulting validation is:

```json
{
  "valid": false,
  "rxcui": null,
  "name": null,
  "source": null
}
```

The medication is therefore rejected rather than being dispensed.

---

# 8. MedicationDispense

After successful validation, the pharmacy workflow creates a FHIR `MedicationDispense` resource.

Example structure:

```json
{
  "resourceType": "MedicationDispense",
  "status": "preparation",
  "medicationCodeableConcept": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "1665021",
        "display": "cefTRIAXone 1 GM Injection"
      }
    ]
  },
  "authorizingPrescription": [
    {
      "reference": "MedicationRequest/1001"
    }
  ],
  "quantity": {
    "value": 1,
    "unit": "package"
  }
}
```

The implementation also records:

- Courier
- Estimated delivery time

These are represented using FHIR extensions because they are not standard fields in the basic `MedicationDispense` resource used by this implementation.

Example:

```text
Courier: Rahim
ETA: 15 minutes
```

The resulting resource was successfully stored in the local HAPI FHIR server.

---

# 9. PHI-Safe Nurse Notification

The nurse notification is deliberately limited to operational delivery information.

Example:

```text
Cold-chain medication delivery

Courier: Rahim
ETA: 15 minutes

Open the pharmacy app for details.
```

The notification does **not** contain:

- Patient name
- Patient ID
- Medication name
- Diagnosis
- Room or bed number
- MedicationRequest ID
- MedicationDispense ID

This reduces unnecessary exposure of protected health information in the outbound notification.

---

# 10. AuditEvent

Each important workflow event can be represented as a FHIR `AuditEvent`.

The implementation supports events such as:

```text
INDENT_RECEIVED
PRESCRIPTION_READ
RXNORM_VALIDATED
MEDICATION_APPROVED
MEDICATION_REJECTED
MEDICATION_PACKED
COURIER_ASSIGNED
MEDICATION_DISPATCHED
NOTIFICATION_SENT
```

The audit event records information such as:

- Event time
- Outcome
- System performing the action
- Patient reference where required
- MedicationRequest reference
- Workflow action
- Additional details

Example:

```json
{
  "resourceType": "AuditEvent",
  "action": "E",
  "outcome": "0",
  "source": {
    "observer": {
      "display": "Pharmacy Cold Chain System"
    }
  }
}
```

---

# 11. Tamper-Evident Hash Chain

To make the audit trail tamper-evident, each event contains a SHA-256 hash.

The hash is calculated from the audit event data and the hash of the previous event.

Conceptually:

```text
Event 1
   │
   └── SHA-256 → Hash 1
                    │
                    ▼
Event 2 + Hash 1
   │
   └── SHA-256 → Hash 2
                    │
                    ▼
Event 3 + Hash 2
   │
   └── SHA-256 → Hash 3
```

Each event stores:

```text
previous-hash
event-hash
```

For example:

```text
previous-hash:
0b2cc5d835a1c2c1464edf1c1cab3a33e865c5b764c6bae35dd8d7bf7e6866bb

event-hash:
85afe6def15e6a7897ea7a697e7ba8d63b9e039fa0ce69d2c7818ea10f253b1d
```

If historical event data is changed, the calculated hash would no longer match the stored hash or the subsequent event's `previous-hash`.

### Important limitation

This implementation provides a **tamper-evident** audit chain, not an independently immutable audit store.

For a production healthcare environment, the audit storage would additionally require appropriate access controls and an append-only or immutable storage mechanism.

---

# 12. End-to-End Workflow

The main pharmacy workflow is implemented in:

```text
lib/pharmacy/process-pharmacy-order.ts
```

The workflow performs the following operations.

### Step 1 — Receive HL7 Order

The application receives an `OMP^O09` HL7 message.

### Step 2 — Parse HL7

The HL7 parser extracts:

```text
Patient
Order
Medication
Message metadata
```

### Step 3 — Read Prescription

The system retrieves the FHIR:

```text
MedicationRequest
```

from HAPI FHIR.

### Step 4 — Validate Medication

The medication is checked against RxNorm.

### Step 5 — Approve or Reject

If RxNorm validation succeeds, the medication proceeds.

If validation fails, the medication is rejected.

### Step 6 — Create MedicationDispense

A FHIR `MedicationDispense` resource records the packed medication, courier, and ETA.

### Step 7 — Create Nurse Notification

A PHI-safe notification is generated.

### Step 8 — Record AuditEvent

The completed workflow is recorded in a FHIR `AuditEvent` with a hash-chain link to the previous event.

---

# 13. API Endpoints

## Process Complete Pharmacy Order

```http
POST /api/pharmacy/process-order
```

Accepts an HL7 message as plain text.

Example:

```text
Content-Type: text/plain
```

Request body:

```text
MSH|^~\&|HIS|HOSPITAL|PHARMACY|HOSPITAL|202609162100||OMP^O09|MSG001|P|2.5
PID|1||P001
ORC|NW|ORD001
RXO|Ceftriaxone 1 g injection
```

---

## Validate Prescription

```http
GET /api/pharmacy/validate-prescription
```

Used to demonstrate reading a `MedicationRequest` and validating its medication against RxNorm.

---

## Process HL7 Indent

```http
POST /api/pharmacy/process-indent
```

Parses the HL7 order and performs medication validation.

---

## Create Patient

```http
POST /api/fhir/patient
```

Creates the demonstration FHIR Patient resource.

---

## Nurse Notification

```http
POST /api/notifications/nurse
```

Generates the PHI-safe nurse notification.

---

## Audit Test

```http
POST /api/audit/test
```

Creates a FHIR `AuditEvent` and links it to the previous audit hash.

---

## Previous Audit Hash

```http
GET /api/audit/previous-hash
```

Retrieves the most recent audit event hash for the next event in the chain.

---

# 14. Running the Project

## Prerequisites

Install:

- Node.js
- Docker Desktop
- npm

Verify:

```bash
node --version
npm --version
docker --version
```

---

# 15. Start HAPI FHIR

The project includes a Docker Compose configuration.

```bash
docker compose up -d
```

HAPI FHIR is exposed locally at:

```text
http://localhost:8080/fhir
```

The application uses:

```env
FHIR_BASE_URL=http://localhost:8080/fhir
```

in `.env.local`.

---

# 16. Start Next.js

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

---

# 17. Testing the End-to-End Workflow

A valid HL7 request can be sent from PowerShell:

```powershell
$hl7 = @"
MSH|^~\&|HIS|HOSPITAL|PHARMACY|HOSPITAL|202609162100||OMP^O09|MSG001|P|2.5
PID|1||P001
ORC|NW|ORD001
RXO|Ceftriaxone 1 g injection
"@

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/pharmacy/process-order" `
  -Method POST `
  -ContentType "text/plain" `
  -Body $hl7 |
  ConvertTo-Json -Depth 30
```

A successful workflow returns:

```text
approved: true
```

and includes:

```text
HL7 order
MedicationRequest
RxNorm validation
MedicationDispense
Nurse notification
AuditEvent
```

---

# 18. Testing Medication Rejection

An invalid medication can be tested using:

```powershell
$hl7 = @"
MSH|^~\&|HIS|HOSPITAL|PHARMACY|HOSPITAL|202609162100||OMP^O09|MSG006|P|2.5
PID|1||P001
ORC|NW|ORD006
RXO|SuperCurex 999 mg injection
"@

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/pharmacy/process-order" `
  -Method POST `
  -ContentType "text/plain" `
  -Body $hl7 |
  ConvertTo-Json -Depth 30
```

The expected validation result is:

```json
{
  "valid": false,
  "rxcui": null,
  "name": null,
  "source": null
}
```

and the medication should not proceed to dispensing.

---

# 19. Example Successful Result

The demonstration workflow successfully produced:

```text
HL7 Message
    ↓
OMP^O09
    ↓
Patient P001
    ↓
Ceftriaxone 1 g injection
    ↓
FHIR MedicationRequest/1001
    ↓
RxNorm
    ↓
RxCUI 1665021
    ↓
Approved
    ↓
MedicationDispense/1006
    ↓
Courier: Rahim
ETA: 15 minutes
    ↓
PHI-safe nurse notification
    ↓
FHIR AuditEvent/1007
```

The audit event was linked to the previous event using the SHA-256 hash chain.

---

# 20. Security and Privacy Considerations

The implementation demonstrates several security-conscious decisions:

### Minimum information in notifications

The nurse notification contains only operational delivery information.

### FHIR references

Healthcare resources are represented using FHIR resource types instead of custom data structures.

### Medication validation

Medication names are validated against a standardized terminology service before dispensing.

### Auditability

Important workflow events are recorded using FHIR `AuditEvent`.

### Tamper evidence

Audit events are linked through SHA-256 hashes.

### Demo data

The implementation uses demonstration patient information rather than real patient data.

---

# 21. Design Decisions

## Why FHIR?

FHIR provides standardized healthcare resources for exchanging clinical and pharmacy information.

The project specifically uses:

```text
Patient
MedicationRequest
MedicationDispense
AuditEvent
```

## Why RxNorm?

RxNorm provides normalized medication terminology and RxCUI identifiers, allowing the application to validate medication names against a standardized medication vocabulary.

## Why HL7 v2?

HL7 v2 is commonly used by legacy healthcare systems. Supporting `OMP^O09` demonstrates how an older hospital system can feed medication orders into a newer FHIR-based workflow.

## Why HAPI FHIR?

HAPI FHIR provides a local FHIR server for development and demonstration without requiring a production healthcare infrastructure.

## Why SHA-256?

SHA-256 provides a deterministic cryptographic hash that allows changes to linked audit records to be detected.

---

# 22. Limitations

This project is a technical demonstration rather than a production clinical system.

Current limitations include:

- HAPI FHIR is running locally.
- Demonstration patient data is used.
- Courier and ETA are demonstration values.
- Some workflow configuration is currently fixed for the demo.
- Custom FHIR extensions are used for courier and ETA.
- The audit chain is tamper-evident rather than backed by immutable storage.
- No real courier integration is implemented.
- No real nurse messaging provider is connected.
- No production authentication/authorization system is included.

These limitations are intentional to keep the implementation focused on the assignment requirements.

---

# 23. Assignment Requirement Mapping

| Assignment Task            | Where It Is Implemented                  |
| -------------------------- | ---------------------------------------- |
| Read prescription from EHR | `lib/fhir/medication-request.ts`         |
| FHIR client                | `lib/fhir/client.ts`                     |
| Validate medication        | `lib/rxnorm/client.ts`                   |
| RxNorm matching            | `lib/rxnorm/validate.ts`                 |
| Parse HL7 v2               | `lib/hl7/parser.ts`                      |
| Process HL7 indent         | `lib/pharmacy/process-indent.ts`         |
| End-to-end workflow        | `lib/pharmacy/process-pharmacy-order.ts` |
| MedicationDispense         | `lib/fhir/medication-dispense.ts`        |
| Nurse notification         | `lib/notifications/nurse.ts`             |
| AuditEvent                 | `lib/audit/audit-event.ts`               |
| Audit hash chain           | `lib/audit/hash-chain.ts`                |
| FHIR server                | HAPI FHIR / Docker                       |
| Presentation layer         | `app/page.tsx`                           |

---

# 24. Conclusion

This project demonstrates an interoperability workflow connecting a legacy HL7 v2 medication order with a FHIR-based pharmacy workflow.

The complete flow is:

```text
HL7 v2 OMP^O09
       ↓
HL7 Parser
       ↓
FHIR MedicationRequest
       ↓
RxNorm Validation
       ↓
Medication Approval
       ↓
FHIR MedicationDispense
       ↓
PHI-safe Nurse Notification
       ↓
FHIR AuditEvent
       ↓
SHA-256 Audit Chain
```

The implementation focuses on the required healthcare interoperability concepts while keeping the application small enough to demonstrate the complete workflow end-to-end.
