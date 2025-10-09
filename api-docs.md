# 🧭 Bootcamp API — Business Overview

The Bootcamp API is a learning project that models the workflow of an **online education management platform**.  
It provides a structured backend system for managing **bootcamps, courses, users, and reviews**, with a clear separation of roles and ownership.

The goal is to demonstrate **how entities in a training ecosystem interact** and how permissions and data relationships can be organized in a real-world API.

---

## 🏫 Bootcamps

Bootcamps represent educational programs or training providers.

### Key Points

- A **bootcamp** is created by a **Publisher** or an **Admin**.
- Each bootcamp can contain **multiple courses**.
- A bootcamp stores only general information (e.g., name, description, location, etc.).
- The bootcamp model automatically maintains the **average course cost** across all its courses.

### Ownership & Permissions

- **Publishers** can create **one bootcamp** of their own.
- **Admins** can create or manage any number of bootcamps.
- Only the **bootcamp owner** (publisher) or an **admin** can update or delete it.
- Bootcamps can include a **photo upload**, handled by file upload middleware.

---

## 📚 Courses

Courses are individual learning offerings that belong to a specific bootcamp.

### Key Points

- Each course is linked to a **bootcamp** and a **user (publisher)**.
- A course includes details such as title, description, tuition, duration (in weeks), and minimum skill level.
- Courses automatically calculate and maintain their **average rating** based on user reviews.
- Each bootcamp may have multiple courses.

### Ownership & Permissions

- **Only the bootcamp owner (publisher)** or an **admin** can create, update, or delete courses.
- Courses inherit their ownership indirectly from the parent bootcamp.
- When a course is deleted, the bootcamp’s **average cost** is automatically recalculated.

---

## ⭐ Reviews

Reviews provide user feedback on **courses** (not bootcamps).

### Key Points

- Each review belongs to a **specific course**.
- A review contains a **title**, **text content**, and a **numeric rating**.
- When new reviews are added or removed, the **average course rating** is automatically recalculated.
- A user can post **only one review per course**.

### Ownership & Permissions

- **Only authenticated users** can create reviews.
- Users can **update or delete only their own reviews**.
- **Admins** can manage all reviews across the platform.

---

## 👤 Users and Roles

The system defines three user roles, each with specific permissions and responsibilities.

### 1. Admin

- Has **full access** to all resources.
- Can **manage users**, bootcamps, courses, and reviews.
- Can perform administrative operations (e.g., promoting users).

### 2. Publisher

- Represents an instructor or training provider.
- Can **create one bootcamp** and **multiple courses** under that bootcamp.
- Can **update or delete** only their own bootcamp and its courses.
- Cannot modify or delete bootcamps or courses owned by others.

### 3. User

- Represents a student or platform visitor.
- Can browse bootcamps and courses.
- Can **leave reviews** for courses.
- Cannot create or manage bootcamps or courses.

---

## ⚙️ Relationships Between Entities

| Entity                | Relationship                | Description                                                 |
| --------------------- | --------------------------- | ----------------------------------------------------------- |
| **Bootcamp → Course** | One-to-Many                 | A bootcamp can have multiple courses.                       |
| **Course → Review**   | One-to-Many                 | A course can have multiple user reviews.                    |
| **User → Bootcamp**   | One-to-One (Publisher only) | A publisher can publish one bootcamp.                       |
| **User → Course**     | One-to-Many                 | A publisher can create multiple courses.                    |
| **User → Review**     | One-to-Many                 | A user can leave multiple reviews, but only one per course. |

These relationships are enforced at both the **model** and **business logic** levels.

---

## 🔒 Authorization Rules Summary

| Action                    | Who Can Perform It           |
| ------------------------- | ---------------------------- |
| Create bootcamp           | Publisher (one only) / Admin |
| Update or delete bootcamp | Bootcamp owner / Admin       |
| Upload bootcamp photo     | Bootcamp owner / Admin       |
| Create course             | Bootcamp owner / Admin       |
| Update or delete course   | Course owner / Admin         |
| Create review             | Authenticated user           |
| Update or delete review   | Review owner / Admin         |
| Manage users              | Admin only                   |

---

## 🧠 Automated Model Logic

Several background processes run automatically through Mongoose hooks:

- **Bootcamp average cost** is recalculated whenever courses are added or removed.
- **Course average rating** is recalculated whenever reviews are added or removed.
- **Ownership enforcement** ensures users can’t modify others’ resources.
- **Cascade cleanup** removes dependent data (e.g., when deleting bootcamps or courses).

---

## 🧩 Summary of the Platform Flow

1. **Admin or Publisher** registers and logs in.
2. **Publisher** creates a bootcamp (limited to one).
3. The **Publisher** adds multiple courses to that bootcamp.
4. **Users** browse bootcamps and courses.
5. **Users** submit reviews for individual courses.
6. **Courses** update their average rating, and **bootcamps** update their average cost automatically.
7. **Admins** can oversee, manage, or remove any data when necessary.

---

## 🧭 Purpose of the Project

This project serves as a **comprehensive learning example** for designing and structuring a scalable backend API using Node.js and TypeScript.  
It focuses on **realistic business workflows**, proper **data ownership**, and **role-based permissions**, mirroring patterns found in production-grade systems.

It’s an educational resource for understanding:

- How to connect multiple related entities (bootcamps, courses, reviews, users).
- How role-based permissions influence resource ownership.
- How aggregate fields (e.g., averages) can be maintained automatically.
- How structured and consistent validation, middleware, and controllers fit together in a real API.

---

> 🧩 This repository is meant for **learning and experimentation**, not production use.  
> It illustrates how to model complex business rules and relationships in a clean, maintainable backend architecture.
