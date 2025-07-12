# Golang + MongoDB Backend Structure

## Project Structure

```
fleet-backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── auth.go
│   │   │   ├── vehicles.go
│   │   │   ├── users.go
│   │   │   ├── alerts.go
│   │   │   └── reports.go
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   └── logging.go
│   │   └── routes/
│   │       └── routes.go
│   ├── models/
│   │   ├── vehicle.go
│   │   ├── user.go
│   │   ├── alert.go
│   │   └── settings.go
│   ├── services/
│   │   ├── auth.go
│   │   ├── vehicle.go
│   │   ├── user.go
│   │   └── alert.go
│   ├── repository/
│   │   ├── vehicle.go
│   │   ├── user.go
│   │   └── alert.go
│   ├── config/
│   │   └── config.go
│   └── websocket/
│       └── hub.go
├── pkg/
│   ├── database/
│   │   └── mongodb.go
│   ├── jwt/
│   │   └── jwt.go
│   └── utils/
│       └── response.go
├── go.mod
├── go.sum
└── .env
```

## Key Dependencies

```bash
go mod init fleet-backend

# Core dependencies
go get github.com/gin-gonic/gin
go get go.mongodb.org/mongo-driver/mongo
go get github.com/golang-jwt/jwt/v5
go get github.com/joho/godotenv
go get golang.org/x/crypto/bcrypt

# WebSocket for real-time updates
go get github.com/gorilla/websocket

# Validation
go get github.com/go-playground/validator/v10

# CORS
go get github.com/gin-contrib/cors
```

## Sample Models (internal/models/vehicle.go)

```go
package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Vehicle struct {
    ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name             string             `bson:"name" json:"name" validate:"required"`
    PlateNumber      string             `bson:"plate_number" json:"plateNumber" validate:"required"`
    Driver           string             `bson:"driver" json:"driver" validate:"required"`
    FuelLevel        float64            `bson:"fuel_level" json:"fuelLevel"`
    MaxFuelCapacity  float64            `bson:"max_fuel_capacity" json:"maxFuelCapacity"`
    Location         Location           `bson:"location" json:"location"`
    Speed            int                `bson:"speed" json:"speed"`
    Status           string             `bson:"status" json:"status"`
    LastUpdate       time.Time          `bson:"last_update" json:"lastUpdate"`
    Odometer         int                `bson:"odometer" json:"odometer"`
    FuelConsumption  float64            `bson:"fuel_consumption" json:"fuelConsumption"`
    Alerts           []Alert            `bson:"alerts" json:"alerts"`
    Make             string             `bson:"make" json:"make"`
    Model            string             `bson:"model" json:"model"`
    Year             int                `bson:"year" json:"year"`
    VIN              string             `bson:"vin" json:"vin"`
    CreatedAt        time.Time          `bson:"created_at" json:"createdAt"`
    UpdatedAt        time.Time          `bson:"updated_at" json:"updatedAt"`
}

type Location struct {
    Lat     float64 `bson:"lat" json:"lat"`
    Lng     float64 `bson:"lng" json:"lng"`
    Address string  `bson:"address" json:"address"`
}

type Alert struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Type      string             `bson:"type" json:"type"`
    Message   string             `bson:"message" json:"message"`
    Severity  string             `bson:"severity" json:"severity"`
    Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
    Resolved  bool               `bson:"resolved" json:"resolved"`
}
```

## Sample Handler (internal/api/handlers/vehicles.go)

```go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "fleet-backend/internal/services"
    "fleet-backend/internal/models"
)

type VehicleHandler struct {
    vehicleService *services.VehicleService
}

func NewVehicleHandler(vehicleService *services.VehicleService) *VehicleHandler {
    return &VehicleHandler{
        vehicleService: vehicleService,
    }
}

func (h *VehicleHandler) GetVehicles(c *gin.Context) {
    vehicles, err := h.vehicleService.GetAllVehicles()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, vehicles)
}

func (h *VehicleHandler) CreateVehicle(c *gin.Context) {
    var vehicle models.Vehicle
    if err := c.ShouldBindJSON(&vehicle); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    createdVehicle, err := h.vehicleService.CreateVehicle(&vehicle)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, createdVehicle)
}

func (h *VehicleHandler) GetVehicleUpdates(c *gin.Context) {
    // This endpoint returns real-time vehicle data
    vehicles, err := h.vehicleService.GetVehicleUpdates()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, vehicles)
}
```

## Main Server (cmd/server/main.go)

```go
package main

import (
    "log"
    "fleet-backend/internal/config"
    "fleet-backend/internal/api/routes"
    "fleet-backend/pkg/database"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
)

func main() {
    // Load configuration
    cfg := config.Load()

    // Connect to MongoDB
    db, err := database.Connect(cfg.MongoURI)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Setup Gin router
    router := gin.Default()

    // CORS middleware
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:5173"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "PATCH"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))

    // Setup routes
    routes.SetupRoutes(router, db)

    // Start server
    log.Printf("Server starting on port %s", cfg.Port)
    log.Fatal(router.Run(":" + cfg.Port))
}
```

## Environment Variables (.env)

```env
# Server Configuration
PORT=8080
GIN_MODE=debug

# Database
MONGO_URI=mongodb://localhost:27017/fleet_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Real-time Updates
UPDATE_INTERVAL=5s
```

## API Endpoints

```
Authentication:
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

Vehicles:
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/:id
PUT    /api/v1/vehicles/:id
DELETE /api/v1/vehicles/:id
GET    /api/v1/vehicles/updates

Users:
GET    /api/v1/users
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

Alerts:
GET    /api/v1/alerts
PATCH  /api/v1/alerts/:id/resolve
DELETE /api/v1/alerts/:id/dismiss

Reports:
GET    /api/v1/reports/fleet
GET    /api/v1/reports/fuel
GET    /api/v1/reports/export

Settings:
GET    /api/v1/settings/system
PUT    /api/v1/settings/system
GET    /api/v1/settings/notifications
PUT    /api/v1/settings/notifications

API Keys:
GET    /api/v1/api-keys
POST   /api/v1/api-keys
PATCH  /api/v1/api-keys/:id/revoke
DELETE /api/v1/api-keys/:id
```
