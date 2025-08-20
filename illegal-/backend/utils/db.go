package utils

import (
    "fmt"
    "log"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
    // Render PostgreSQL connection string
    dsn := "postgresql://test_wsw5_user:rq8gfpiXR7Eobz3ZIPx0oTz3wPp7Gtkw@dpg-d2iafare5dus73eks500-a.oregon-postgres.render.com/test_wsw5"

    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    fmt.Println("✅ Connected to PostgreSQL on Render")
}
