package models

import "time"

// Construction represents an illegal or legal construction entry
type Construction struct {
    ID               uint      `json:"id" gorm:"primaryKey"`
    Location         string    `json:"location"`
    Latitude         float64   `json:"latitude"`
    Longitude        float64   `json:"longitude"`
    Status           string    `json:"status"` // "illegal" or "legal"
    DetectionSource  string    `json:"detection_source"` // "manual", "gis", "drone", "satellite", "citizen"
    PropertyID       uint      `json:"property_id"`
    CreatedAt        time.Time `json:"created_at"`
    UpdatedAt        time.Time `json:"updated_at"`
}