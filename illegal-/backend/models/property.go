package models

import "time"

// Property holds property record details
type Property struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    OwnerName string    `json:"owner_name"`
    Address   string    `json:"address"`
    Area      float64   `json:"area"`
    LandUse   string    `json:"land_use"` // "residential", "commercial", etc.
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
