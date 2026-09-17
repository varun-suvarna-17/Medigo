# Medigo

# Medicine Shortage Detection & Supply Coordination Platform

> Detect medicine shortage risks early, find nearby availability, and help suppliers coordinate urgent medicine requirements.

## 📌 Overview

A medicine shortage at one healthcare facility can become part of a larger supply disruption when demand increases, stock levels fall, deliveries are delayed, or available stock is unevenly distributed across facilities.

Our platform works as an **extension to existing healthcare inventory systems**. Instead of replacing the facility's current inventory software, it uses available stock, consumption, requirement, and location data to identify possible shortage risks and support faster supply decisions.

The platform connects:

**Healthcare Facilities → Supplier → Manufacturer**

It helps healthcare facilities detect potential shortages, find nearby medicine availability, and raise supplier requests when local availability is not sufficient.

For suppliers, the platform provides a centralized view of requests and recommends which requests may require more immediate attention.

---

## 🎯 Problem

Healthcare facilities may have difficulty identifying that a medicine is likely to run out before the shortage actually occurs.

At the same time:

- Medicine consumption can change over time.
- Multiple facilities may start requesting the same medicine.
- One facility may have low stock while another nearby facility has available stock.
- Suppliers may receive multiple requests without a clear view of their urgency.
- Demand trends across multiple facilities may not be easy to identify.

This can lead to delayed action and unused medicine stock remaining at one facility while another facility needs it.

---

## 💡 Our Solution

The platform provides a decision-support layer on top of existing healthcare inventory systems.

### Healthcare Facility

The system analyzes:

- Current medicine stock
- Daily/weekly consumption
- Medicine requirements
- Emergency requirements
- Facility location

It then identifies medicines that may run out soon.

If a shortage risk is detected, the system:

1. Checks nearby healthcare facilities.
2. Looks at available medicine stock.
3. Considers distance and transportation time.
4. Considers the requesting facility's urgency.
5. Recommends one or two possible nearby options.
6. If no suitable option is available, helps create a supplier request.

### Supplier

The supplier gets a centralized dashboard containing requests from multiple healthcare facilities.

The system analyzes factors such as:

- Emergency level
- Current stock remaining
- Required quantity
- Geographical accessibility

It provides recommendations to help the supplier review urgent requests.

**The system recommends. The supplier makes the final decision.**

### Manufacturer Insights

The platform also generates weekly demand summaries across participating facilities.

The supplier can use these insights to communicate increasing demand or shortage trends to manufacturers.

---

## ✨ Key Features

### 1. Medicine Shortage Detection

Detects medicines that may run out soon using:

- Current stock
- Consumption rate
- Recent consumption trends
- Medicine requirements
- Estimated remaining stock

The MVP uses a **rule-based approach** instead of ML.

---

### 2. Demand Trend Analysis

Identifies medicines where:

- Consumption is increasing.
- Requirements are increasing.
- Multiple facilities are requesting the same medicine.

This helps identify possible growing demand for a medicine.

---

### 3. Nearby Medicine Availability

When a shortage risk is detected, the platform checks nearby healthcare facilities.

The map can display:

- Nearby facilities
- Medicine availability
- Approximate distance
- Relevant stock information

Recommendations can consider:

- Distance
- Transportation time
- Available quantity
- Requesting facility urgency

---

### 4. Assisted Supplier Requests

If suitable medicine is not available nearby, the facility can create a supplier request.

Existing information can be automatically filled from the facility's data.

The user only needs to provide remaining information such as:

- Emergency level
- Required quantity
- Delivery details

---

### 5. Supplier Request Dashboard

Suppliers can view requests from multiple healthcare facilities in one place.

Each request can contain:

- Facility
- Medicine
- Required quantity
- Current stock
- Emergency level
- Location
- Geographical accessibility

---

### 6. Emergency Request Recommendation

The system analyzes requests and recommends which ones may require more immediate attention.

The MVP uses rule-based logic based on factors such as:

- Emergency level
- Remaining stock
- Geographical accessibility

The supplier retains complete control over the final decision.

---

### 7. Weekly Demand Summary

The platform aggregates data from participating healthcare facilities and generates a weekly demand summary.

Example:

```text
Medicine X

Requested by: 4 / 5 facilities
Consumption trend: Increasing
Total requested quantity: 850 units
Facilities showing shortage risk: 2
Overall demand trend: Increasing