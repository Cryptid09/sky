package models

import (
	"time"

	"gorm.io/datatypes"
)

// Report represents a citizen report submitted from the frontend
type Report struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Location    string         `json:"location"`
	Description string         `json:"description"`
	Priority    string         `json:"priority"`                        // low, medium, high
	Coordinates datatypes.JSON `json:"coordinates" gorm:"type:jsonb"`   // optional { lat, lng }
	Images      datatypes.JSON `json:"images" gorm:"type:jsonb"`        // array of image URLs
	Status      string         `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}
