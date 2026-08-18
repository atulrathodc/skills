---
name: data-modeling
description: Design the data model before building — entities, relationships, keys, and constraints that match the feature.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Data Modeling

The schema is the contract everything else compiles against. Model it before writing endpoints or UI.

1. **List the entities the feature needs** — nouns the feature mentions (Order, User, Product, Review). One entity per meaningful noun.
2. **Define relationships** — one-to-many, many-to-many, ownership. Pick the JOIN/foreign-key that expresses it (`@OneToMany`, `order.user_id`, a join table). Decide who owns the relationship (usually the child references the parent).
3. **Keys first** — a primary key per entity; a unique constraint on natural identifiers (email, slug, order number); indexes on the columns you'll filter/join by.
4. **Enumerate fields + types** — every field, its type, nullability, defaults. State what is REQUIRED vs optional — this becomes the validation and the DTO.
5. **Derive computed values, don't store them** — rating average, totals, counts → compute or cache, don't duplicate into the row.
6. **Handle change** — model for the current requirement only (YAGNI), but keep the design open to the obvious next step (don't bake in a decision that will be painful to undo — see `database-migration`).
7. **Prove it** — write the entity/schema, then a query that exercises each relationship before building the API on top.
