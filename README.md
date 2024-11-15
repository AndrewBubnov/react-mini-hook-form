# React Mini Hook Form

React Mini Hook Form is a lightweight library inspired by **React Hook Form**, offering implementations of the most frequently used features for managing forms. It provides a user-friendly API for handling both static and dynamic forms, including validation support and seamless integration with UI libraries.

---

## ✨ Key Features

### 🔧 `useForm` Hook
- Provides state management for both **controlled** and **uncontrolled forms**.
- Includes core functions:
  - `register` — to register **uncontrolled fields**.
  - `control` — to register and manage **controlled fields**.
  - `trigger` — to programmatically validate the form.
  - `handleSubmit` — to handle form submission.

#### **Validation**
- Validation rules can be provided:
  - Directly to `register`.
  - Via `resolver` when initializing `useForm`.
- Fully compatible with the React Hook Form validation API.
- Supports integration with the **Zod** library through `zodResolver`, which is available from **react-mini-hook-form** to minimize peer dependencies.

#### **Form Modes**
- `onSubmit` (default): validation occurs when the form is submitted.
- `onChange`: triggered after a `trigger` call and validates on every input change.

#### **Returned State (`formState`)**
- `errors` — an object containing form errors.
- `isSubmitted` — a flag indicating if the form has been submitted.
- `isSubmitting` — a flag indicating if the form is in the process of being submitted.
- `isValid` — a flag indicating if the form is valid.

---

### 🔄 `useFieldArray` Hook
- Designed for managing **dynamic forms**.
- Returns:
  - `fields` — an array of fields with unique and stable `id`s to be used as keys for React components.
  - Functions:
    - `append` — adds a new field to the end of the array.
    - `prepend` — adds a new field to the start of the array.
    - `insert` — inserts a field at a specific index.
    - `remove` — removes a field at a specific index.

---

## 🚀 Features at a Glance

- Supports **controlled and uncontrolled forms**.
- Reactive validation based on **form modes**.
- Fully compatible with UI libraries (example provided with **shadcn-ui**).
- Lightweight structure for seamless project integration.
