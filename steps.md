AI was used primarily as a **learning and problem-solving assistant**, rather than simply generating the complete project for me.

### Understand the Assignment

I started with very little knowledge of healthcare interoperability, so the assignment was initially difficult to understand. Instead of immediately writing code, I used AI to break the assignment into smaller, understandable requirements and identify what each part was expected to accomplish.

This helped me turn a broad healthcare integration problem into a series of smaller technical tasks.

### Learn Unfamiliar Terminology

A major part of the initial work was understanding the healthcare technologies and terminology used in the assignment.

I used AI to learn the concepts behind:

```text
HL7
OMP^O09
FHIR
MedicationRequest
MedicationDispense
AuditEvent
RxNorm
RxNav
HAPI FHIR
PHI
Tamper-evident audit trails
```

Rather than only asking for definitions, I asked for simple explanations, examples, and how each technology would fit into the pharmacy workflow. This helped me understand **why** each technology was being used before implementing it.

### Design the Architecture

Once I understood the individual requirements, I used AI to help organize them into a complete workflow.

The process was broken down into:

```text
HL7 Indent
    ↓
Parse HL7
    ↓
Read FHIR MedicationRequest
    ↓
Validate Medication with RxNorm
    ↓
Create MedicationDispense
    ↓
Send PHI-safe Notification
    ↓
Create AuditEvent
```

This gave me a clear implementation path instead of trying to build the entire system at once.

### Implement One Component at a Time

I deliberately worked through the system incrementally.

I started with the HL7 parser, then moved to FHIR, RxNorm validation, medication dispensing, notification, and finally auditing.

```text
HL7
→ FHIR
→ RxNorm
→ MedicationDispense
→ Notification
→ Audit
```

After completing one part, I tested it before moving to the next. This made it easier to understand how each individual component worked and how it would eventually connect to the others.

### Debug Errors and Understand the Problems

AI was also used heavily during debugging. Whenever something failed, I shared the error and worked through the problem step by step rather than simply replacing the code with another implementation.

For example, I encountered issues involving:

- HL7 message parsing and field extraction
- FHIR resource references
- Docker and HAPI FHIR configuration
- Next.js API routes
- Understanding the RxNorm API response structure
- Retrieving the previous audit hash for the hash chain

The important part was not just fixing these errors, but understanding **why the error happened and what the underlying system was doing**.

### Verify Each Step

After implementing each component, I tested it independently before continuing.

For example, I separately verified that:

- the HL7 message could be parsed correctly
- the FHIR `MedicationRequest` could be created and retrieved
- RxNorm could validate the medication
- `MedicationDispense` could be written to HAPI FHIR
- the nurse notification contained no unnecessary PHI
- `AuditEvent` records were created with chained hashes

Only after these individual pieces worked did I connect them into the complete pharmacy workflow.

This incremental approach helped prevent the final system from becoming one large, difficult-to-debug block of code and, more importantly, allowed me to learn the technologies while building the solution.
