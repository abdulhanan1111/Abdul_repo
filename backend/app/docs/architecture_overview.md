# Project Overview: Trip & THC Management System

## Architecture
The project follows a classic client-server architecture:
- **Backend**: A RESTful API built with **FastAPI** (Python).
- **Frontend**: A Single Page Application (SPA) built with **React** and **Vite**.
- **Database**: **SQLite** (using SQLAlchemy ORM).

## Tech Stack
### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Data Validation**: Pydantic
- **Authentication**: JWT (implied)
- **Database**: SQLite (`trip_management.db`)
- **Key Libraries**: `python-multipart`, `python-jose`, `passlib`, `bcrypt` (for auth).

### Frontend
- **Bundler**: Vite
- **Library**: React 19
- **Routing**: React Router Dom
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: Context API (`AuthContext`)
- **PDF Generation**: `jspdf`, `html2canvas` (critical for THC generation).

## Core Components
- **Dashboard**: High-level statistics and overview.
- **Master Data**: Management of Companies, Drivers, and Vehicles.
- **Trip Management**: Creating and tracking trips.
- **THC (Trip Hire Challan)**: Generating and managing hire challans (likely for payments/contracts with drivers).
- **AI Assistant**: Integration for intelligent queries or automation.

## Key Workflows
1. **Authentication**: 
   - Backend uses JWT for stateless authentication.
   - Frontend stores the token (likely in `localStorage`) and manages it via `AuthContext`.
2. **Master Entry**: Setting up companies (internal or partner), drivers (with license details), and vehicles.
3. **Trip Creation**: 
   - Associating a vehicle/driver with a company and trip details.
   - Requires driver and vehicle to be "available" and in the "origin city".
   - Automatically calculates distance (mocked if not found) and freight cost.
4. **THC Generation**: 
   - A `THC` (Trip Hire Challan) is automatically created whenever a trip is created.
   - Contains immutable snapshots of driver, vehicle, and trip details at the time of creation.
5. **Document Export**:
   - `THCView` allows users to view the challan details.
   - Utilizes `jspdf` and `html2canvas` for client-side PDF generation of the challan.

## Data Relationships
- **Companies** have multiple **Drivers** and **Vehicles**.
- **Drivers** and **Vehicles** have specific **Status** records (one-to-one) tracking availability.
- **Trips** link one **Driver** and one **Vehicle**.
- Each **Trip** has exactly one **THC**.
